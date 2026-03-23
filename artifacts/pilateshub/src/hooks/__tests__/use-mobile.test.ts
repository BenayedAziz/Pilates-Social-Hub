import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useIsMobile } from "../use-mobile";

describe("useIsMobile", () => {
  let listeners: Array<() => void> = [];

  beforeEach(() => {
    listeners = [];
    Object.defineProperty(window, "innerWidth", { writable: true, value: 1024 });
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: window.innerWidth < 768,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn((_: string, cb: () => void) => listeners.push(cb)),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });
  });

  it("returns false for desktop viewport (1024px)", () => {
    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(false);
  });

  it("returns true for mobile viewport (375px)", () => {
    Object.defineProperty(window, "innerWidth", { writable: true, value: 375 });
    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(true);
  });

  it("returns false at exactly 768px (breakpoint boundary)", () => {
    Object.defineProperty(window, "innerWidth", { writable: true, value: 768 });
    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(false);
  });

  it("returns true at 767px (just below breakpoint)", () => {
    Object.defineProperty(window, "innerWidth", { writable: true, value: 767 });
    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(true);
  });

  it("responds to viewport resize via matchMedia change event", () => {
    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(false);

    // Simulate resize to mobile
    act(() => {
      Object.defineProperty(window, "innerWidth", { writable: true, value: 400 });
      listeners.forEach((cb) => cb());
    });

    expect(result.current).toBe(true);
  });
});
