import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { Studio } from "@/data/types";
import { StudioDetailDialog } from "../StudioDetailDialog";

// Mock wouter
vi.mock("wouter", () => ({
  Link: ({ children, href }: any) => <a href={href}>{children}</a>,
  useLocation: () => ["/", vi.fn()],
}));

// Mock sonner
vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

// Mock notifications
vi.mock("@/lib/notifications", () => ({
  notify: { bookingConfirmed: vi.fn() },
}));

// Mock AppContext
vi.mock("@/context/AppContext", () => ({
  useApp: () => ({
    bookingSuccess: null,
    setBookingSuccess: vi.fn(),
  }),
}));

// Mock API hooks
vi.mock("@/hooks/use-api", () => ({
  useCoaches: () => ({ data: [{ name: "Sophie", slug: "sophie-leclerc" }] }),
  useStudioReviews: () => ({
    data: [
      {
        id: 1,
        userName: "Alice",
        userInitials: "AL",
        userColor: "bg-blue-200",
        rating: 5,
        text: "Amazing!",
        date: "1d ago",
        helpful: 3,
      },
    ],
  }),
  useStudioCheckins: () => ({ data: [] }),
  useGoogleReviews: () => ({ data: [] }),
}));

// Mock Radix Dialog
vi.mock("@/components/ui/dialog", () => ({
  Dialog: ({ children }: any) => <div>{children}</div>,
  DialogTrigger: ({ children, asChild }: any) => (asChild ? children : <button>{children}</button>),
  DialogContent: ({ children }: any) => <div>{children}</div>,
}));

// Mock WriteReviewDialog
vi.mock("@/components/WriteReviewDialog", () => ({
  WriteReviewDialog: ({ children }: any) => <div>{children}</div>,
}));

const mockStudio: Studio = {
  id: 1,
  name: "Reformer Club",
  neighborhood: "Le Marais",
  rating: 4.8,
  reviews: 42,
  price: 45,
  distance: 1.2,
  coords: { x: 50, y: 50 },
  lat: 48.86,
  lng: 2.36,
  description: "A beautiful Pilates studio in the heart of Paris.",
  coaches: ["Sophie", "Unknown Coach"],
  imageUrl: "https://example.com/studio.jpg",
};

describe("StudioDetailDialog", () => {
  it("renders studio name", () => {
    render(
      <StudioDetailDialog studio={mockStudio}>
        <button>Open</button>
      </StudioDetailDialog>,
    );
    expect(screen.getByText("Reformer Club")).toBeInTheDocument();
  });

  it("renders studio price", () => {
    render(
      <StudioDetailDialog studio={mockStudio}>
        <button>Open</button>
      </StudioDetailDialog>,
    );
    expect(screen.getByText(/€45/)).toBeInTheDocument();
  });

  it("renders studio description", () => {
    render(
      <StudioDetailDialog studio={mockStudio}>
        <button>Open</button>
      </StudioDetailDialog>,
    );
    expect(screen.getByText("A beautiful Pilates studio in the heart of Paris.")).toBeInTheDocument();
  });

  it("renders studio rating", () => {
    render(
      <StudioDetailDialog studio={mockStudio}>
        <button>Open</button>
      </StudioDetailDialog>,
    );
    expect(screen.getByText("4.8")).toBeInTheDocument();
  });

  it("renders coach names", () => {
    render(
      <StudioDetailDialog studio={mockStudio}>
        <button>Open</button>
      </StudioDetailDialog>,
    );
    expect(screen.getByText("Sophie")).toBeInTheDocument();
    expect(screen.getByText("Unknown Coach")).toBeInTheDocument();
  });

  it("renders Contact Studio CTA when no website or phone", () => {
    render(
      <StudioDetailDialog studio={mockStudio}>
        <button>Open</button>
      </StudioDetailDialog>,
    );
    expect(screen.getByText("Contact this studio directly to book")).toBeInTheDocument();
  });

  it("renders Book on Their Site when studio has website", () => {
    const studioWithWebsite = { ...mockStudio, website: "https://example.com" };
    render(
      <StudioDetailDialog studio={studioWithWebsite}>
        <button>Open</button>
      </StudioDetailDialog>,
    );
    expect(screen.getByText("Book on Their Site")).toBeInTheDocument();
  });

  it("renders demo booking link", () => {
    render(
      <StudioDetailDialog studio={mockStudio}>
        <button>Open</button>
      </StudioDetailDialog>,
    );
    expect(screen.getByText("Try Demo Booking Flow")).toBeInTheDocument();
  });

  it("renders Check In button", () => {
    render(
      <StudioDetailDialog studio={mockStudio}>
        <button>Open</button>
      </StudioDetailDialog>,
    );
    expect(screen.getByText(/Check In Here/)).toBeInTheDocument();
  });

  it("renders reviews section", () => {
    render(
      <StudioDetailDialog studio={mockStudio}>
        <button>Open</button>
      </StudioDetailDialog>,
    );
    expect(screen.getByText("Reviews")).toBeInTheDocument();
    expect(screen.getByText("Alice")).toBeInTheDocument();
    expect(screen.getByText("Amazing!")).toBeInTheDocument();
  });

  it("renders Write a Review button", () => {
    render(
      <StudioDetailDialog studio={mockStudio}>
        <button>Open</button>
      </StudioDetailDialog>,
    );
    expect(screen.getByText("Write a Review")).toBeInTheDocument();
  });

  it("renders average rating", () => {
    render(
      <StudioDetailDialog studio={mockStudio}>
        <button>Open</button>
      </StudioDetailDialog>,
    );
    expect(screen.getByText("5.0")).toBeInTheDocument(); // one review with 5 stars
  });
});
