import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { QueryWrapper } from "@/test/test-utils";
import { useBookingPayment, useOrderPayment } from "../use-payments";

const mockFetch = vi.fn();
globalThis.fetch = mockFetch;

beforeEach(() => {
  mockFetch.mockReset();
  localStorage.clear();
});

describe("useBookingPayment", () => {
  it("posts to /api/payments/booking", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ clientSecret: "cs_test", paymentIntentId: "pi_test" }),
    });

    const { result } = renderHook(() => useBookingPayment(), { wrapper: QueryWrapper });

    await act(async () => {
      result.current.mutate({
        studioName: "Reformer Studio",
        className: "Mat Pilates",
        amount: 45,
      });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    const url = mockFetch.mock.calls[0][0] as string;
    expect(url).toContain("/api/payments/booking");
    const opts = mockFetch.mock.calls[0][1];
    expect(opts.method).toBe("POST");
    const body = JSON.parse(opts.body);
    expect(body.studioName).toBe("Reformer Studio");
    expect(body.amount).toBe(45);
  });

  it("returns clientSecret and paymentIntentId on success", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ clientSecret: "cs_abc", paymentIntentId: "pi_abc" }),
    });

    const { result } = renderHook(() => useBookingPayment(), { wrapper: QueryWrapper });

    await act(async () => {
      result.current.mutate({
        studioName: "S",
        className: "C",
        amount: 30,
      });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual({
      clientSecret: "cs_abc",
      paymentIntentId: "pi_abc",
    });
  });

  it("handles error response", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      statusText: "Payment Failed",
      json: async () => ({ message: "Card declined" }),
    });

    const { result } = renderHook(() => useBookingPayment(), { wrapper: QueryWrapper });

    await act(async () => {
      result.current.mutate({
        studioName: "S",
        className: "C",
        amount: 30,
      });
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error?.message).toBe("Card declined");
  });

  it("includes auth token when present", async () => {
    localStorage.setItem("pilateshub-token", "my-token");
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ clientSecret: "cs", paymentIntentId: "pi" }),
    });

    const { result } = renderHook(() => useBookingPayment(), { wrapper: QueryWrapper });

    await act(async () => {
      result.current.mutate({ studioName: "S", className: "C", amount: 10 });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockFetch.mock.calls[0][1].headers.Authorization).toBe("Bearer my-token");
  });
});

describe("useOrderPayment", () => {
  it("posts to /api/payments/order", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ clientSecret: "cs_order", paymentIntentId: "pi_order" }),
    });

    const { result } = renderHook(() => useOrderPayment(), { wrapper: QueryWrapper });

    await act(async () => {
      result.current.mutate({
        items: [{ name: "Grip Socks", quantity: 2 }],
        totalAmount: 29,
      });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    const url = mockFetch.mock.calls[0][0] as string;
    expect(url).toContain("/api/payments/order");
    const body = JSON.parse(mockFetch.mock.calls[0][1].body);
    expect(body.items).toHaveLength(1);
    expect(body.totalAmount).toBe(29);
  });

  it("handles server error gracefully", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      statusText: "Server Error",
      json: async () => ({}),
    });

    const { result } = renderHook(() => useOrderPayment(), { wrapper: QueryWrapper });

    await act(async () => {
      result.current.mutate({ items: [], totalAmount: 0 });
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});
