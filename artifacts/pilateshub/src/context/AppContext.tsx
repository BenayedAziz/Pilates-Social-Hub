import React, { createContext, useCallback, useContext, useMemo, useState } from "react";
import type { Product } from "@/data/types";

interface CartItem {
  product: Product;
  qty: number;
}

interface AppContextType {
  // Cart
  cartItems: CartItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (productId: number) => void;
  clearCart: () => void;
  cartCount: number;
  cartTotal: number;

  // Feed
  likedPosts: Record<number, boolean>;
  toggleLike: (postId: number) => void;
  following: Record<number, boolean>;
  toggleFollow: (userId: number) => void;

  // Community
  votes: Record<number, "up" | "down" | null>;
  toggleVote: (postId: number, dir: "up" | "down") => void;

  // Store
  wishlist: Set<number>;
  toggleWishlist: (productId: number) => void;

  // Booking
  bookingSuccess: number | null;
  setBookingSuccess: (studioId: number | null) => void;

  // Streaks & stats
  currentStreak: number;
  longestStreak: number;
  totalSessions: number;
  totalCalories: number;
  weeklyGoal: number;
  weeklyCompleted: number;
  logSession: (calories: number, duration: number) => void;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  // Cart state
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const addToCart = useCallback((product: Product) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) return prev.map((item) => (item.product.id === product.id ? { ...item, qty: item.qty + 1 } : item));
      return [...prev, { product, qty: 1 }];
    });
  }, []);
  const removeFromCart = useCallback(
    (productId: number) => setCartItems((prev) => prev.filter((item) => item.product.id !== productId)),
    [],
  );
  const clearCart = useCallback(() => setCartItems([]), []);
  const cartCount = cartItems.reduce((acc, item) => acc + item.qty, 0);
  const cartTotal = cartItems.reduce((acc, item) => acc + item.product.price * item.qty, 0);

  // Feed state
  const [likedPosts, setLikedPosts] = useState<Record<number, boolean>>({});
  const toggleLike = useCallback((id: number) => setLikedPosts((prev) => ({ ...prev, [id]: !prev[id] })), []);
  const [following, setFollowing] = useState<Record<number, boolean>>({});
  const toggleFollow = useCallback((id: number) => setFollowing((prev) => ({ ...prev, [id]: !prev[id] })), []);

  // Community state
  const [votes, setVotes] = useState<Record<number, "up" | "down" | null>>({});
  const toggleVote = useCallback(
    (id: number, dir: "up" | "down") => setVotes((prev) => ({ ...prev, [id]: prev[id] === dir ? null : dir })),
    [],
  );

  // Store state
  const [wishlist, setWishlist] = useState<Set<number>>(new Set());
  const toggleWishlist = useCallback((id: number) => {
    setWishlist((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  // Booking state
  const [bookingSuccess, setBookingSuccess] = useState<number | null>(null);

  // Streaks & stats
  const [currentStreak, setCurrentStreak] = useState(12);
  const [longestStreak] = useState(18);
  const [totalSessions, setTotalSessions] = useState(47);
  const [totalCalories, setTotalCalories] = useState(12400);
  const [weeklyGoal] = useState(5);
  const [weeklyCompleted, setWeeklyCompleted] = useState(4);

  const logSession = useCallback((calories: number, _duration: number) => {
    setTotalSessions((prev) => prev + 1);
    setTotalCalories((prev) => prev + calories);
    setWeeklyCompleted((prev) => Math.min(prev + 1, 7));
    setCurrentStreak((prev) => prev + 1);
  }, []);

  const value = useMemo(
    () => ({
      cartItems,
      addToCart,
      removeFromCart,
      clearCart,
      cartCount,
      cartTotal,
      likedPosts,
      toggleLike,
      following,
      toggleFollow,
      votes,
      toggleVote,
      wishlist,
      toggleWishlist,
      bookingSuccess,
      setBookingSuccess,
      currentStreak,
      longestStreak,
      totalSessions,
      totalCalories,
      weeklyGoal,
      weeklyCompleted,
      logSession,
    }),
    [
      cartItems,
      addToCart,
      removeFromCart,
      clearCart,
      cartCount,
      cartTotal,
      likedPosts,
      toggleLike,
      following,
      toggleFollow,
      votes,
      toggleVote,
      wishlist,
      toggleWishlist,
      bookingSuccess,
      currentStreak,
      longestStreak,
      totalSessions,
      totalCalories,
      weeklyGoal,
      weeklyCompleted,
      logSession,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used within AppProvider");
  return context;
}
