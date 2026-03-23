import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { Product } from "@/data/types";
import { AppProvider, useApp } from "../AppContext";

const TEST_PRODUCTS: Product[] = [
  { id: 1, name: "Test Product 1", brand: "TestBrand", price: 29, rating: 4.5, category: "Goodies", image: "", imageUrl: "" },
  { id: 2, name: "Test Product 2", brand: "TestBrand", price: 49, rating: 4.7, category: "Apparel", image: "", imageUrl: "" },
];

const wrapper = ({ children }: { children: React.ReactNode }) => <AppProvider>{children}</AppProvider>;

describe("AppContext", () => {
  describe("cart", () => {
    it("starts with empty cart", () => {
      const { result } = renderHook(() => useApp(), { wrapper });
      expect(result.current.cartItems).toEqual([]);
      expect(result.current.cartCount).toBe(0);
      expect(result.current.cartTotal).toBe(0);
    });

    it("adds product to cart", () => {
      const { result } = renderHook(() => useApp(), { wrapper });
      act(() => result.current.addToCart(TEST_PRODUCTS[0]));
      expect(result.current.cartItems).toHaveLength(1);
      expect(result.current.cartCount).toBe(1);
      expect(result.current.cartTotal).toBe(TEST_PRODUCTS[0].price);
    });

    it("increments quantity for duplicate product", () => {
      const { result } = renderHook(() => useApp(), { wrapper });
      act(() => {
        result.current.addToCart(TEST_PRODUCTS[0]);
        result.current.addToCart(TEST_PRODUCTS[0]);
      });
      expect(result.current.cartItems).toHaveLength(1);
      expect(result.current.cartCount).toBe(2);
    });

    it("removes product from cart", () => {
      const { result } = renderHook(() => useApp(), { wrapper });
      act(() => result.current.addToCart(TEST_PRODUCTS[0]));
      act(() => result.current.removeFromCart(TEST_PRODUCTS[0].id));
      expect(result.current.cartItems).toEqual([]);
    });

    it("clears cart", () => {
      const { result } = renderHook(() => useApp(), { wrapper });
      act(() => {
        result.current.addToCart(TEST_PRODUCTS[0]);
        result.current.addToCart(TEST_PRODUCTS[1]);
      });
      act(() => result.current.clearCart());
      expect(result.current.cartItems).toEqual([]);
    });
  });

  describe("likes", () => {
    it("toggles like on post", () => {
      const { result } = renderHook(() => useApp(), { wrapper });
      act(() => result.current.toggleLike(1));
      expect(result.current.likedPosts[1]).toBe(true);
      act(() => result.current.toggleLike(1));
      expect(result.current.likedPosts[1]).toBe(false);
    });
  });

  describe("following", () => {
    it("toggles follow", () => {
      const { result } = renderHook(() => useApp(), { wrapper });
      act(() => result.current.toggleFollow(1));
      expect(result.current.following[1]).toBe(true);
      act(() => result.current.toggleFollow(1));
      expect(result.current.following[1]).toBe(false);
    });
  });

  describe("votes", () => {
    it("toggles upvote", () => {
      const { result } = renderHook(() => useApp(), { wrapper });
      act(() => result.current.toggleVote(1, "up"));
      expect(result.current.votes[1]).toBe("up");
      act(() => result.current.toggleVote(1, "up"));
      expect(result.current.votes[1]).toBeNull();
    });

    it("switches vote direction", () => {
      const { result } = renderHook(() => useApp(), { wrapper });
      act(() => result.current.toggleVote(1, "up"));
      act(() => result.current.toggleVote(1, "down"));
      expect(result.current.votes[1]).toBe("down");
    });
  });

  describe("wishlist", () => {
    it("toggles wishlist item", () => {
      const { result } = renderHook(() => useApp(), { wrapper });
      act(() => result.current.toggleWishlist(1));
      expect(result.current.wishlist.has(1)).toBe(true);
      act(() => result.current.toggleWishlist(1));
      expect(result.current.wishlist.has(1)).toBe(false);
    });
  });
});
