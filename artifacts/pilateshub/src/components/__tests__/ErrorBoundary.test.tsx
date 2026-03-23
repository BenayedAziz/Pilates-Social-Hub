import { fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ErrorBoundary } from "../ErrorBoundary";

function ThrowingComponent({ shouldThrow }: { shouldThrow: boolean }) {
  if (shouldThrow) throw new Error("Test error");
  return <div>Working fine</div>;
}

describe("ErrorBoundary", () => {
  // Suppress console.error for expected errors
  const originalError = console.error;
  beforeEach(() => {
    console.error = vi.fn();
  });
  afterEach(() => {
    console.error = originalError;
  });

  it("renders children when no error", () => {
    render(
      <ErrorBoundary>
        <div>Hello</div>
      </ErrorBoundary>,
    );
    expect(screen.getByText("Hello")).toBeInTheDocument();
  });

  it("renders error fallback when child throws", () => {
    render(
      <ErrorBoundary>
        <ThrowingComponent shouldThrow={true} />
      </ErrorBoundary>,
    );
    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
    expect(screen.getByText("Test error")).toBeInTheDocument();
  });

  it("renders custom fallback when provided", () => {
    render(
      <ErrorBoundary fallback={<div>Custom error</div>}>
        <ThrowingComponent shouldThrow={true} />
      </ErrorBoundary>,
    );
    expect(screen.getByText("Custom error")).toBeInTheDocument();
  });

  it("shows Try Again button in default error fallback", () => {
    render(
      <ErrorBoundary>
        <ThrowingComponent shouldThrow={true} />
      </ErrorBoundary>,
    );
    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Try Again" })).toBeInTheDocument();
  });

  it("recovers when Try Again is clicked and error condition resolves", () => {
    // Use a controllable wrapper so ErrorBoundary identity is preserved across re-renders
    let triggerFix: () => void;

    function Wrapper() {
      const [shouldThrow, setShouldThrow] = useState(true);
      triggerFix = () => setShouldThrow(false);
      return (
        <ErrorBoundary>
          <ThrowingComponent shouldThrow={shouldThrow} />
        </ErrorBoundary>
      );
    }

    render(<Wrapper />);
    expect(screen.getByText("Something went wrong")).toBeInTheDocument();

    // Fix the error condition before clicking Try Again
    triggerFix!();
    fireEvent.click(screen.getByText("Try Again"));

    expect(screen.getByText("Working fine")).toBeInTheDocument();
  });
});
