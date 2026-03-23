import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import CheckoutPage from "../CheckoutPage";

// Mock wouter
vi.mock("wouter", () => ({
  useLocation: () => ["/checkout", vi.fn()],
}));

// Mock sonner
vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn(), info: vi.fn() },
}));

// Mock AppContext with cart items
vi.mock("@/context/AppContext", () => ({
  useApp: () => ({
    cartItems: [
      {
        product: {
          id: 1,
          name: "Grip Socks",
          brand: "ToeSox",
          price: 19,
          rating: 4.5,
          category: "Goodies",
          image: "",
          imageUrl: "",
        },
        qty: 2,
      },
    ],
    cartTotal: 38,
    cartCount: 2,
    clearCart: vi.fn(),
    removeFromCart: vi.fn(),
  }),
}));

// Mock AuthContext
vi.mock("@/context/AuthContext", () => ({
  useAuth: () => ({
    user: { id: 1, name: "Sarah", email: "sarah@test.com", initials: "SJ", level: "Advanced", bio: "" },
  }),
}));

describe("CheckoutPage", () => {
  it("renders without crashing", () => {
    render(<CheckoutPage />);
    expect(document.body.innerHTML.length).toBeGreaterThan(0);
  });

  it("renders Checkout heading", () => {
    render(<CheckoutPage />);
    expect(screen.getByText("Checkout")).toBeInTheDocument();
  });

  it("renders shipping step indicator", () => {
    render(<CheckoutPage />);
    expect(screen.getByText("Shipping")).toBeInTheDocument();
    expect(screen.getByText("Payment")).toBeInTheDocument();
    expect(screen.getByText("Confirmation")).toBeInTheDocument();
  });

  it("renders Shipping Information form heading", () => {
    render(<CheckoutPage />);
    expect(screen.getByText("Shipping Information")).toBeInTheDocument();
  });

  it("renders free shipping banner when below threshold", () => {
    render(<CheckoutPage />);
    // Cart total is 38, threshold is 75
    expect(screen.getByText(/for free shipping/)).toBeInTheDocument();
  });

  it("renders Continue to Payment button", () => {
    render(<CheckoutPage />);
    expect(screen.getByText("Continue to Payment")).toBeInTheDocument();
  });
});
