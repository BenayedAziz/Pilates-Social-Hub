import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useWebSocket } from "../use-websocket";

// ---------------------------------------------------------------------------
// Mock WebSocket
// ---------------------------------------------------------------------------
let instances: MockWebSocket[] = [];

class MockWebSocket {
  static OPEN = 1;
  static CLOSED = 3;
  readyState = MockWebSocket.OPEN;
  onopen: (() => void) | null = null;
  onclose: (() => void) | null = null;
  onerror: (() => void) | null = null;
  onmessage: ((evt: { data: string }) => void) | null = null;
  sent: string[] = [];
  url: string;

  constructor(url: string) {
    this.url = url;
    instances.push(this);
    // Simulate async open
    setTimeout(() => this.onopen?.(), 0);
  }

  send(data: string) {
    this.sent.push(data);
  }

  close() {
    this.readyState = MockWebSocket.CLOSED;
    this.onclose?.();
  }
}

beforeEach(() => {
  instances = [];
  localStorage.clear();
  vi.useFakeTimers();
  (globalThis as any).WebSocket = MockWebSocket;
});

afterEach(() => {
  vi.useRealTimers();
});

describe("useWebSocket", () => {
  it("does not connect when no token in localStorage", () => {
    renderHook(() => useWebSocket());
    expect(instances).toHaveLength(0);
  });

  it("connects when token is present", () => {
    localStorage.setItem("pilateshub-token", "test-jwt");
    renderHook(() => useWebSocket());
    expect(instances.length).toBeGreaterThanOrEqual(1);
    // The URL should contain /ws and the token
    expect(instances[0].url).toContain("/ws");
  });

  it("sets connected to true on open", async () => {
    localStorage.setItem("pilateshub-token", "jwt");
    const { result } = renderHook(() => useWebSocket());

    await act(async () => {
      vi.runAllTimers();
    });

    expect(result.current.connected).toBe(true);
  });

  it("sends JSON data through WebSocket", async () => {
    localStorage.setItem("pilateshub-token", "jwt");
    const { result } = renderHook(() => useWebSocket());

    const ws = instances[instances.length - 1];

    await act(async () => {
      vi.runAllTimers();
    });

    // Ensure readyState is OPEN
    ws.readyState = MockWebSocket.OPEN;

    act(() => {
      result.current.send({ type: "ping", payload: "hello" });
    });

    // Find the ping message (ignore other sends if any)
    const pingMsg = ws.sent.find((s) => {
      try {
        return JSON.parse(s).type === "ping";
      } catch {
        return false;
      }
    });
    expect(pingMsg).toBeDefined();
    expect(JSON.parse(pingMsg!)).toEqual({
      type: "ping",
      payload: "hello",
    });
  });

  it("dispatches messages to registered handlers", async () => {
    localStorage.setItem("pilateshub-token", "jwt");
    const handler = vi.fn();
    const { result } = renderHook(() => useWebSocket());

    await act(async () => {
      vi.runAllTimers();
    });

    const ws = instances[instances.length - 1];

    act(() => {
      result.current.on("notification", handler);
    });

    // Simulate incoming message
    act(() => {
      ws.onmessage?.({
        data: JSON.stringify({ type: "notification", text: "hello" }),
      });
    });

    expect(handler).toHaveBeenCalledWith({ type: "notification", text: "hello" });
  });

  it("unsubscribes handler when returned cleanup is called", async () => {
    localStorage.setItem("pilateshub-token", "jwt");
    const handler = vi.fn();
    const { result } = renderHook(() => useWebSocket());

    await act(async () => {
      vi.runAllTimers();
    });

    const ws = instances[instances.length - 1];

    let unsub: () => void;
    act(() => {
      unsub = result.current.on("msg", handler);
    });

    act(() => {
      unsub();
    });

    act(() => {
      ws.onmessage?.({ data: JSON.stringify({ type: "msg" }) });
    });

    expect(handler).not.toHaveBeenCalled();
  });

  it("ignores malformed messages", async () => {
    localStorage.setItem("pilateshub-token", "jwt");
    const handler = vi.fn();
    const { result } = renderHook(() => useWebSocket());

    await act(async () => {
      vi.runAllTimers();
    });

    const ws = instances[instances.length - 1];

    act(() => {
      result.current.on("msg", handler);
    });

    // Send non-JSON message -- should not throw
    act(() => {
      ws.onmessage?.({ data: "not json at all!!" });
    });

    expect(handler).not.toHaveBeenCalled();
  });

  it("attempts reconnection after close", async () => {
    localStorage.setItem("pilateshub-token", "jwt");
    renderHook(() => useWebSocket());

    const initialCount = instances.length;

    // Close the connection
    act(() => {
      instances[instances.length - 1].close();
    });

    // Advance past reconnect timer (5s)
    act(() => {
      vi.advanceTimersByTime(6000);
    });

    // Should have a new connection attempt
    expect(instances.length).toBeGreaterThan(initialCount);
  });

  it("cleans up on unmount", async () => {
    localStorage.setItem("pilateshub-token", "jwt");
    const { unmount } = renderHook(() => useWebSocket());

    await act(async () => {
      vi.runAllTimers();
    });

    const ws = instances[instances.length - 1];
    unmount();
    expect(ws.readyState).toBe(MockWebSocket.CLOSED);
  });
});
