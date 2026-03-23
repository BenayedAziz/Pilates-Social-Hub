import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import BookingPage from "../BookingPage";

// Mock wouter
vi.mock("wouter", () => ({
  useRoute: () => [true, { studioId: "1" }],
  useLocation: () => ["/booking/1", vi.fn()],
}));

// Mock sonner
vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

// Mock notifications
vi.mock("@/lib/notifications", () => ({
  notify: { bookingConfirmed: vi.fn() },
}));

// Mock API
vi.mock("@/hooks/use-api", () => ({
  useStudios: vi.fn(() => ({
    data: [
      {
        id: 1,
        name: "Reformer Club",
        neighborhood: "Marais",
        rating: 4.8,
        reviews: 42,
        price: 45,
        distance: 1.2,
        lat: 48.86,
        lng: 2.36,
        coords: { x: 50, y: 50 },
        description: "Great studio",
        coaches: ["Sophie"],
        imageUrl: "",
      },
    ],
    isLoading: false,
  })),
}));

// Mock skeleton
vi.mock("@/components/PageSkeleton", () => ({
  GenericPageSkeleton: () => <div data-testid="skeleton">Loading...</div>,
}));

describe("BookingPage", () => {
  it("renders without crashing", () => {
    render(<BookingPage />);
    expect(document.body.innerHTML.length).toBeGreaterThan(0);
  });

  it("renders the studio name in header", () => {
    render(<BookingPage />);
    expect(screen.getByText("Reformer Club")).toBeInTheDocument();
  });

  it("renders class listings on step 1", () => {
    render(<BookingPage />);
    expect(screen.getByText("Reformer Flow")).toBeInTheDocument();
    expect(screen.getByText("Mat Pilates Core")).toBeInTheDocument();
  });

  it("renders 'Choose your class' heading", () => {
    render(<BookingPage />);
    expect(screen.getByText("Choose your class")).toBeInTheDocument();
  });

  it("renders class details (level, duration, spots)", () => {
    render(<BookingPage />);
    expect(screen.getAllByText(/spots left/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/min/).length).toBeGreaterThan(0);
  });
});
