import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

// Mock sonner
vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

// Mock Radix Dialog - always render content
vi.mock("@/components/ui/dialog", () => ({
  Dialog: ({ children }: any) => <div>{children}</div>,
  DialogTrigger: ({ children, asChild }: any) => {
    if (asChild) return children;
    return <button>{children}</button>;
  },
  DialogContent: ({ children }: any) => <div>{children}</div>,
  DialogHeader: ({ children }: any) => <div>{children}</div>,
  DialogTitle: ({ children }: any) => <h2>{children}</h2>,
}));

import { WriteReviewDialog } from "../WriteReviewDialog";

describe("WriteReviewDialog", () => {
  const defaultProps = {
    studioName: "Reformer Studio Paris",
    studioId: 42,
    onReviewAdded: vi.fn(),
  };

  it("renders trigger children", () => {
    render(
      <WriteReviewDialog {...defaultProps}>
        <button>Write Review</button>
      </WriteReviewDialog>,
    );
    expect(screen.getByText("Write Review")).toBeInTheDocument();
  });

  it("renders the dialog title with studio name", () => {
    render(
      <WriteReviewDialog {...defaultProps}>
        <button>Open</button>
      </WriteReviewDialog>,
    );
    expect(screen.getByText("Review Reformer Studio Paris")).toBeInTheDocument();
  });

  it("shows Tap to rate prompt initially", () => {
    render(
      <WriteReviewDialog {...defaultProps}>
        <button>Open</button>
      </WriteReviewDialog>,
    );
    expect(screen.getByText("Tap to rate")).toBeInTheDocument();
  });

  it("renders 5 star rating buttons", () => {
    render(
      <WriteReviewDialog {...defaultProps}>
        <button>Open</button>
      </WriteReviewDialog>,
    );
    // 5 star buttons (type="button") inside the rating area
    const starButtons = screen
      .getAllByRole("button")
      .filter((b) => b.getAttribute("type") === "button" && b.querySelector("svg"));
    expect(starButtons.length).toBeGreaterThanOrEqual(5);
  });

  it("renders text area with placeholder", () => {
    render(
      <WriteReviewDialog {...defaultProps}>
        <button>Open</button>
      </WriteReviewDialog>,
    );
    expect(screen.getByPlaceholderText("Share your experience...")).toBeInTheDocument();
  });

  it("renders Post Review submit button", () => {
    render(
      <WriteReviewDialog {...defaultProps}>
        <button>Open</button>
      </WriteReviewDialog>,
    );
    expect(screen.getByText("Post Review")).toBeInTheDocument();
  });

  it("changes rating label when star is clicked", () => {
    render(
      <WriteReviewDialog {...defaultProps}>
        <button>Open</button>
      </WriteReviewDialog>,
    );
    // Find star buttons (type="button" with SVG child)
    const starButtons = screen
      .getAllByRole("button")
      .filter((b) => b.getAttribute("type") === "button" && b.querySelector("svg"));
    // Click the first star (rating = 1 => "Poor")
    fireEvent.click(starButtons[0]);
    expect(screen.getByText("Poor")).toBeInTheDocument();
  });
});
