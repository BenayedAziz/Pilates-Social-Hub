import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AuthProvider, useAuth } from "../AuthContext";

const wrapper = ({ children }: { children: React.ReactNode }) => <AuthProvider>{children}</AuthProvider>;

const mockFetch = vi.fn();
globalThis.fetch = mockFetch;

beforeEach(() => {
  mockFetch.mockReset();
  localStorage.clear();
  // Default: API not available
  mockFetch.mockRejectedValue(new Error("Network error"));
});

describe("AuthContext", () => {
  it("starts unauthenticated when no token stored", async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    // Wait for initialization to settle
    await waitFor(() => expect(result.current.user).toBeNull(), { timeout: 2000 });
    expect(result.current.isAuthenticated).toBe(false);
  });

  it("restores session from stored token", async () => {
    localStorage.setItem("pilateshub-token", "valid-token");
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: 1, email: "sarah@example.com", displayName: "Sarah Johnson", level: "Advanced" }),
    });

    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.isAuthenticated).toBe(true), { timeout: 2000 });
    expect(result.current.user?.name).toBe("Sarah Johnson");
  });

  it("logs in successfully", async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.isAuthenticated).toBe(false), { timeout: 2000 });

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        user: { id: 1, email: "test@test.com", name: "Test User", initials: "TU", level: "Beginner" },
        token: "jwt-token-123",
      }),
    });

    let success = false;
    await act(async () => {
      success = await result.current.login("test@test.com", "password");
    });
    expect(success).toBe(true);
    expect(result.current.isAuthenticated).toBe(true);
    expect(localStorage.getItem("pilateshub-token")).toBe("jwt-token-123");
  });

  it("logs out and clears token", async () => {
    localStorage.setItem("pilateshub-token", "valid-token");
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: 1, email: "sarah@example.com", displayName: "Sarah Johnson", level: "Advanced" }),
    });

    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.isAuthenticated).toBe(true), { timeout: 2000 });

    act(() => result.current.logout());
    expect(result.current.isAuthenticated).toBe(false);
    expect(localStorage.getItem("pilateshub-token")).toBeNull();
  });

  it("signs up with new user", async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.isAuthenticated).toBe(false), { timeout: 2000 });

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        user: { id: 2, email: "new@test.com", name: "New User", initials: "NU", level: "Beginner" },
        token: "jwt-new-token",
      }),
    });

    await act(async () => {
      await result.current.signup("New User", "new@test.com", "password123");
    });
    expect(result.current.user?.name).toBe("New User");
    expect(result.current.isAuthenticated).toBe(true);
  });
});
