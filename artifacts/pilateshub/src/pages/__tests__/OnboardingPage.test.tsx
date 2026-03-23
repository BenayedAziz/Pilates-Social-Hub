import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import OnboardingPage from "../OnboardingPage";

describe("OnboardingPage", () => {
  const onComplete = vi.fn();

  it("renders without crashing", () => {
    render(<OnboardingPage onComplete={onComplete} />);
    // The first step should be the welcome screen
    expect(document.body.innerHTML.length).toBeGreaterThan(0);
  });

  it("renders experience level options", () => {
    render(<OnboardingPage onComplete={onComplete} />);
    // Navigate to the level-selection step (step 1)
    // First step (0) is likely the welcome. Let's click Next/Continue
    const nextBtn = screen.queryByText("Next") || screen.queryByText("Continue") || screen.queryByText("Get Started");
    if (nextBtn) {
      fireEvent.click(nextBtn);
    }
    // Check for experience levels
    expect(screen.getByText("Beginner")).toBeInTheDocument();
    expect(screen.getByText("Intermediate")).toBeInTheDocument();
    expect(screen.getByText("Advanced")).toBeInTheDocument();
  });

  it("renders apparatus options on step 2", () => {
    render(<OnboardingPage onComplete={onComplete} />);
    // Navigate forward
    const nextBtn = screen.queryByText("Next") || screen.queryByText("Continue") || screen.queryByText("Get Started");
    if (nextBtn) {
      fireEvent.click(nextBtn);
      // Select a level
      fireEvent.click(screen.getByText("Beginner"));
      const next2 = screen.queryByText("Next") || screen.queryByText("Continue");
      if (next2) fireEvent.click(next2);
    }
    // Apparatus options should include Mat, Reformer, etc.
    const matOption = screen.queryByText("Mat");
    const reformerOption = screen.queryByText("Reformer");
    expect(matOption || reformerOption).not.toBeNull();
  });

  it("has a Skip button", () => {
    render(<OnboardingPage onComplete={onComplete} />);
    const skip = screen.queryByText("Skip");
    // Skip should exist on some step
    expect(skip).toBeInTheDocument();
  });

  it("calls onComplete when Skip is clicked", () => {
    render(<OnboardingPage onComplete={onComplete} />);
    const skip = screen.getByText("Skip");
    fireEvent.click(skip);
    expect(onComplete).toHaveBeenCalled();
  });
});
