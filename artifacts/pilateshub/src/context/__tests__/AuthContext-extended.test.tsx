/**
 * Extended AuthContext tests covering updateProfile, mock user fallback,
 * error paths, and edge cases.
 */
import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AuthProvider, useAuth } from "../AuthContext";

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <AuthProvider>{children}</AuthProvider>
);

const mockFetch = vi.fn();
globalThis.fetch = mockFetch;

beforeEach(() => {
  mockFetch.mockReset();
  localStorage.clear();
  // Default: API not available -> falls back to mock user
  mockFetch.mockRejectedValue(new Error("Network error"));
});

// Helper: wait for the hook to be initialized (AuthProvider hides children while initializing)
async function waitForAuth(result: any) {
  await waitFor(
    () => {
      // result.current may be undefined while AuthProvider renders null for children
      expect(result.current).toBeDefined();
      expect(result.current.user).not.toBeNull();
    },
    { timeout: 5000 },
  );
}

describe("AuthContext — mock user fallback", () => {
  it("auto-logs in with demo user when no token is stored", async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitForAuth(result);
    expect(result.current.user?.name).toBe("Emma D");
    expect(result.current.isAuthenticated).toBe(true);
  });

  it("falls back to mock user when stored token fails validation", async () => {
    localStorage.setItem("pilateshub-token", "expired-token");
    mockFetch.mockRejectedValueOnce(new Error("Network error"));

    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitForAuth(result);
    expect(localStorage.getItem("pilateshub-token")).toBeNull();
    expect(result.current.user?.name).toBe("Emma D");
  });
});

describe("AuthContext — login error", () => {
  it("returns false when login API returns non-ok", async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitForAuth(result);

    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ message: "Invalid credentials" }),
    });

    let success = false;
    await act(async () => {
      success = await result.current.login("bad@test.com", "wrong");
    });
    expect(success).toBe(false);
  });

  it("returns false when signup API fails", async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitForAuth(result);

    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ message: "Email taken" }),
    });

    let success = false;
    await act(async () => {
      success = await result.current.signup("Name", "taken@test.com", "pass");
    });
    expect(success).toBe(false);
  });
});

describe("AuthContext — updateProfile", () => {
  it("updates local state in mock mode (no token)", async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitForAuth(result);

    let success = false;
    await act(async () => {
      success = await result.current.updateProfile({ name: "Jane Doe", bio: "New bio" });
    });
    expect(success).toBe(true);
    expect(result.current.user?.name).toBe("Jane Doe");
    expect(result.current.user?.initials).toBe("JD");
    expect(result.current.user?.bio).toBe("New bio");
  });

  it("calls API and updates user when token exists", async () => {
    localStorage.setItem("pilateshub-token", "valid");
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          id: 1,
          email: "test@test.com",
          displayName: "Test User",
          level: "Beginner",
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          id: 1,
          email: "test@test.com",
          displayName: "Updated Name",
          level: "Advanced",
        }),
      });

    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(
      () => {
        expect(result.current).toBeDefined();
        expect(result.current.user?.name).toBe("Test User");
      },
      { timeout: 5000 },
    );

    let success = false;
    await act(async () => {
      success = await result.current.updateProfile({ name: "Updated Name", level: "Advanced" });
    });
    expect(success).toBe(true);
    expect(result.current.user?.name).toBe("Updated Name");
  });

  it("returns false when API profile update fails", async () => {
    localStorage.setItem("pilateshub-token", "valid");
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          id: 1,
          email: "t@t.com",
          displayName: "T",
          level: "Beginner",
        }),
      })
      .mockResolvedValueOnce({ ok: false });

    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(
      () => {
        expect(result.current).toBeDefined();
        expect(result.current.isAuthenticated).toBe(true);
      },
      { timeout: 5000 },
    );

    let success = true;
    await act(async () => {
      success = await result.current.updateProfile({ name: "X" });
    });
    expect(success).toBe(false);
  });
});

describe("AuthContext — logout", () => {
  it("clears all related localStorage keys", async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitForAuth(result);

    localStorage.setItem("pilateshub-token", "val");
    localStorage.setItem("pilateshub-onboarded", "true");
    localStorage.setItem("pilateshub-preferences", "{}");

    act(() => result.current.logout());
    expect(localStorage.getItem("pilateshub-token")).toBeNull();
    expect(localStorage.getItem("pilateshub-onboarded")).toBeNull();
    expect(localStorage.getItem("pilateshub-preferences")).toBeNull();
    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });
});

describe("AuthContext — useAuth without provider", () => {
  it("throws if used outside AuthProvider", () => {
    expect(() => {
      renderHook(() => useAuth());
    }).toThrow("useAuth must be used within AuthProvider");
  });
});
