import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useGeolocation } from "../use-geolocation";

const mockFetch = vi.fn();
globalThis.fetch = mockFetch;

beforeEach(() => {
  mockFetch.mockReset();
  localStorage.clear();
  localStorage.removeItem("pilateshub-geo");
  localStorage.removeItem("pilateshub-location");

  // Default: insecure context -> skips browser geo
  Object.defineProperty(window, "isSecureContext", { value: false, writable: true });

  // Mock navigator.geolocation
  Object.defineProperty(navigator, "geolocation", {
    value: {
      getCurrentPosition: vi.fn(),
    },
    writable: true,
    configurable: true,
  });
});

describe("useGeolocation", () => {
  it("returns default Paris position initially", () => {
    // All IP services will fail
    mockFetch.mockRejectedValue(new Error("Network"));
    const { result } = renderHook(() => useGeolocation());
    expect(result.current.position).toEqual({ lat: 48.856, lng: 2.352 });
    expect(result.current.isDefault).toBe(true);
  });

  it("returns cached position if available and fresh", () => {
    const cached = { lat: 45.5, lng: 3.1, ts: Date.now() };
    localStorage.setItem("pilateshub-geo", JSON.stringify(cached));
    mockFetch.mockRejectedValue(new Error("Network"));
    const { result } = renderHook(() => useGeolocation());
    expect(result.current.position).toEqual({ lat: 45.5, lng: 3.1 });
    expect(result.current.isDefault).toBe(false);
  });

  it("ignores expired cached position (>24h old)", () => {
    const expired = { lat: 45.5, lng: 3.1, ts: Date.now() - 90_000_000 }; // >24h
    localStorage.setItem("pilateshub-geo", JSON.stringify(expired));
    mockFetch.mockRejectedValue(new Error("Network"));
    const { result } = renderHook(() => useGeolocation());
    expect(result.current.position).toEqual({ lat: 48.856, lng: 2.352 });
    expect(result.current.isDefault).toBe(true);
  });

  it("removes old pilateshub-location key from localStorage", () => {
    localStorage.setItem("pilateshub-location", "old-data");
    mockFetch.mockRejectedValue(new Error("Network"));
    renderHook(() => useGeolocation());
    expect(localStorage.getItem("pilateshub-location")).toBeNull();
  });

  it("resolves position from IP geolocation service when browser geo unavailable", async () => {
    Object.defineProperty(window, "isSecureContext", { value: false });
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ latitude: 47.0, longitude: 2.5 }),
    });

    const { result } = renderHook(() => useGeolocation());
    await waitFor(() => expect(result.current.position?.lat).toBe(47.0));
    expect(result.current.isDefault).toBe(false);
    // Should be cached
    const stored = JSON.parse(localStorage.getItem("pilateshub-geo")!);
    expect(stored.lat).toBe(47.0);
  });

  it("tries multiple IP services if first one fails", async () => {
    mockFetch
      .mockRejectedValueOnce(new Error("timeout")) // first service
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ latitude: 46.0, longitude: 3.0 }),
      }); // second service

    const { result } = renderHook(() => useGeolocation());
    await waitFor(() => expect(result.current.position?.lat).toBe(46.0));
  });

  it("keeps default when all geo services fail", async () => {
    mockFetch.mockRejectedValue(new Error("fail"));
    const { result } = renderHook(() => useGeolocation());
    await waitFor(() => expect(result.current.loading).toBe(false), { timeout: 3000 });
    expect(result.current.position).toEqual({ lat: 48.856, lng: 2.352 });
  });

  it("exposes requestPermission function", () => {
    mockFetch.mockRejectedValue(new Error("fail"));
    const { result } = renderHook(() => useGeolocation());
    expect(typeof result.current.requestPermission).toBe("function");
  });

  it("handles corrupt localStorage gracefully", () => {
    localStorage.setItem("pilateshub-geo", "not-json!!!");
    mockFetch.mockRejectedValue(new Error("fail"));
    const { result } = renderHook(() => useGeolocation());
    expect(result.current.position).toEqual({ lat: 48.856, lng: 2.352 });
    expect(result.current.isDefault).toBe(true);
  });
});
