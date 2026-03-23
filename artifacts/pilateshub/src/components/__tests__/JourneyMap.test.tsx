import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { JourneyMap } from "../JourneyMap";

describe("JourneyMap", () => {
  it("renders the Apparatus Journey title", () => {
    render(<JourneyMap />);
    expect(screen.getByText(/Apparatus Journey/)).toBeInTheDocument();
  });

  it("renders all five apparatus names", () => {
    render(<JourneyMap />);
    expect(screen.getByText("Mat")).toBeInTheDocument();
    expect(screen.getByText("Reformer")).toBeInTheDocument();
    expect(screen.getByText("Tower")).toBeInTheDocument();
    expect(screen.getByText("Cadillac")).toBeInTheDocument();
    expect(screen.getByText("Chair")).toBeInTheDocument();
  });

  it("renders level labels for each apparatus", () => {
    render(<JourneyMap />);
    expect(screen.getByText("Advanced")).toBeInTheDocument();
    expect(screen.getByText("Intermediate")).toBeInTheDocument();
    expect(screen.getByText("Beginner")).toBeInTheDocument();
    expect(screen.getAllByText("Locked")).toHaveLength(2); // Cadillac + Chair
  });

  it("renders session counts for unlocked apparatus", () => {
    render(<JourneyMap />);
    expect(screen.getByText("28 sessions")).toBeInTheDocument(); // Mat
    expect(screen.getByText("15 sessions")).toBeInTheDocument(); // Reformer
    expect(screen.getByText("4 sessions")).toBeInTheDocument(); // Tower
  });

  it("renders descriptions for locked apparatus", () => {
    render(<JourneyMap />);
    expect(screen.getByText("Advanced trapeze table work")).toBeInTheDocument();
    expect(screen.getByText("Compact powerhouse training")).toBeInTheDocument();
  });

  it("renders next milestone targets", () => {
    render(<JourneyMap />);
    expect(screen.getByText("Next: 35")).toBeInTheDocument(); // Mat
    expect(screen.getByText("Next: 25")).toBeInTheDocument(); // Reformer
    expect(screen.getByText("Next: 10")).toBeInTheDocument(); // Tower
  });
});
