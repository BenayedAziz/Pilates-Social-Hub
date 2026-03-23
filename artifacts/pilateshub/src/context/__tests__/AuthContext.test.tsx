import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AuthProvider, useAuth } from "../AuthContext";

const wrapper = ({ children }: { children: React.ReactNode }) => <AuthProvider>{children}</AuthProvider>;

describe("AuthContext", () => {
  it("starts authenticated with mock user", () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user?.name).toBe("Sarah Johnson");
  });

  it("logs out", () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    act(() => result.current.logout());
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
  });

  it("logs in", async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    act(() => result.current.logout());

    let success = false;
    await act(async () => {
      success = await result.current.login("test@test.com", "password");
    });
    expect(success).toBe(true);
    expect(result.current.isAuthenticated).toBe(true);
  });

  it("signs up with new user", async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    act(() => result.current.logout());

    await act(async () => {
      await result.current.signup("Test User", "test@test.com", "password");
    });
    expect(result.current.user?.name).toBe("Test User");
    expect(result.current.user?.initials).toBe("TU");
  });
});
