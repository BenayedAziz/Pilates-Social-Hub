import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useTheme } from "../use-theme";

describe("useTheme", () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove("dark");
    // Mock window.matchMedia for jsdom
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });
  });

  it("defaults to light theme", () => {
    const { result } = renderHook(() => useTheme());
    expect(result.current.theme).toBe("light");
  });

  it("toggles to dark theme", () => {
    const { result } = renderHook(() => useTheme());
    act(() => result.current.toggleTheme());
    expect(result.current.theme).toBe("dark");
    expect(document.documentElement.classList.contains("dark")).toBe(true);
  });

  it("toggles back to light", () => {
    const { result } = renderHook(() => useTheme());
    act(() => result.current.toggleTheme());
    act(() => result.current.toggleTheme());
    expect(result.current.theme).toBe("light");
    expect(document.documentElement.classList.contains("dark")).toBe(false);
  });

  it("persists to localStorage", () => {
    const { result } = renderHook(() => useTheme());
    act(() => result.current.toggleTheme());
    expect(localStorage.getItem("pilates-theme")).toBe("dark");
  });

  it("reads from localStorage on init", () => {
    localStorage.setItem("pilates-theme", "dark");
    localStorage.setItem("pilates-theme-v2", "1");
    const { result } = renderHook(() => useTheme());
    expect(result.current.theme).toBe("dark");
  });
});
