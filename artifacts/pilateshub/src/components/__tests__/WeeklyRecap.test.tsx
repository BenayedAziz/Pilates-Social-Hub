import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { WeeklyRecap } from "../WeeklyRecap";

// Mock the AppContext
const mockAppValues = {
  weeklyGoal: 5,
  weeklyCompleted: 3,
  currentStreak: 12,
  totalCalories: 15000,
};

vi.mock("@/context/AppContext", () => ({
  useApp: () => mockAppValues,
}));

describe("WeeklyRecap", () => {
  it("renders the Weekly Recap title", () => {
    render(<WeeklyRecap />);
    expect(screen.getByText("Weekly Recap")).toBeInTheDocument();
  });

  it("renders weekly completed count", () => {
    render(<WeeklyRecap />);
    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.getByText("of 5")).toBeInTheDocument();
  });

  it("renders current streak", () => {
    render(<WeeklyRecap />);
    expect(screen.getByText("12")).toBeInTheDocument();
    expect(screen.getByText("Day Streak")).toBeInTheDocument();
  });

  it("renders total calories in k format", () => {
    render(<WeeklyRecap />);
    expect(screen.getByText("15k")).toBeInTheDocument();
    expect(screen.getByText("Total Cal")).toBeInTheDocument();
  });

  it("shows how many sessions left to reach goal", () => {
    render(<WeeklyRecap />);
    expect(screen.getByText("2 left")).toBeInTheDocument();
    expect(screen.getByText("Weekly Goal")).toBeInTheDocument();
  });

  it("shows streak fire message when streak >= 7", () => {
    render(<WeeklyRecap />);
    expect(screen.getByText(/12 day streak/)).toBeInTheDocument();
  });
});

describe("WeeklyRecap — goal completed", () => {
  it('shows "Done!" when weekly goal met', () => {
    mockAppValues.weeklyCompleted = 5;
    render(<WeeklyRecap />);
    expect(screen.getByText("Done!")).toBeInTheDocument();
    // Reset
    mockAppValues.weeklyCompleted = 3;
  });
});

describe("WeeklyRecap — no streak fire below 7", () => {
  it("does not show fire message for low streak", () => {
    mockAppValues.currentStreak = 3;
    render(<WeeklyRecap />);
    expect(screen.queryByText(/day streak!/)).not.toBeInTheDocument();
    // Reset
    mockAppValues.currentStreak = 12;
  });
});
