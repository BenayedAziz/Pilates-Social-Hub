/**
 * Extended AppContext tests covering streaks, stats, logSession, bookingSuccess,
 * and edge cases not in the original test file.
 */
import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { Product } from "@/data/types";
import { AppProvider, useApp } from "../AppContext";

const wrapper = ({ children }: { children: React.ReactNode }) => <AppProvider>{children}</AppProvider>;

const PRODUCT: Product = {
  id: 99,
  name: "Test",
  brand: "B",
  price: 10,
  rating: 5,
  category: "Goodies",
  image: "",
  imageUrl: "",
};

describe("AppContext — streaks & stats", () => {
  it("has default streak and session values", () => {
    const { result } = renderHook(() => useApp(), { wrapper });
    expect(result.current.currentStreak).toBeGreaterThan(0);
    expect(result.current.totalSessions).toBeGreaterThan(0);
    expect(result.current.totalCalories).toBeGreaterThan(0);
    expect(result.current.weeklyGoal).toBeGreaterThan(0);
  });

  it("logSession increments sessions, calories, weekly, and streak", () => {
    const { result } = renderHook(() => useApp(), { wrapper });
    const prevSessions = result.current.totalSessions;
    const prevCalories = result.current.totalCalories;
    const prevWeekly = result.current.weeklyCompleted;
    const prevStreak = result.current.currentStreak;

    act(() => result.current.logSession(300, 55));

    expect(result.current.totalSessions).toBe(prevSessions + 1);
    expect(result.current.totalCalories).toBe(prevCalories + 300);
    expect(result.current.weeklyCompleted).toBe(Math.min(prevWeekly + 1, 7));
    expect(result.current.currentStreak).toBe(prevStreak + 1);
  });

  it("weeklyCompleted caps at 7", () => {
    const { result } = renderHook(() => useApp(), { wrapper });
    // Log enough sessions to exceed 7
    act(() => {
      for (let i = 0; i < 10; i++) {
        result.current.logSession(100, 30);
      }
    });
    expect(result.current.weeklyCompleted).toBeLessThanOrEqual(7);
  });
});

describe("AppContext — bookingSuccess", () => {
  it("starts as null", () => {
    const { result } = renderHook(() => useApp(), { wrapper });
    expect(result.current.bookingSuccess).toBeNull();
  });

  it("can be set and cleared", () => {
    const { result } = renderHook(() => useApp(), { wrapper });
    act(() => result.current.setBookingSuccess(42));
    expect(result.current.bookingSuccess).toBe(42);
    act(() => result.current.setBookingSuccess(null));
    expect(result.current.bookingSuccess).toBeNull();
  });
});

describe("AppContext — cart edge cases", () => {
  it("calculates correct total with multiple products at different quantities", () => {
    const { result } = renderHook(() => useApp(), { wrapper });
    const p1: Product = { ...PRODUCT, id: 1, price: 25 };
    const p2: Product = { ...PRODUCT, id: 2, price: 15 };

    act(() => {
      result.current.addToCart(p1);
      result.current.addToCart(p1);
      result.current.addToCart(p2);
    });

    expect(result.current.cartCount).toBe(3);
    expect(result.current.cartTotal).toBe(25 * 2 + 15);
  });

  it("removeFromCart is idempotent (no error removing non-existent)", () => {
    const { result } = renderHook(() => useApp(), { wrapper });
    act(() => result.current.removeFromCart(999));
    expect(result.current.cartItems).toEqual([]);
  });

  it("clearCart on empty cart is safe", () => {
    const { result } = renderHook(() => useApp(), { wrapper });
    act(() => result.current.clearCart());
    expect(result.current.cartItems).toEqual([]);
  });
});

describe("AppContext — useApp without provider", () => {
  it("throws if used outside AppProvider", () => {
    expect(() => {
      renderHook(() => useApp());
    }).toThrow("useApp must be used within AppProvider");
  });
});
