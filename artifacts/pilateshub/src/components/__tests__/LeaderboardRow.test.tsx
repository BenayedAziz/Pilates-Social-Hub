import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { LeaderboardRow } from "../LeaderboardRow";

const mockEntry = {
  rank: 1,
  user: { id: 1, name: "Emma D", initials: "ED", color: "bg-rose-200" },
  sessions: 18,
  calories: 4800,
};

describe("LeaderboardRow", () => {
  it("renders user name", () => {
    render(<LeaderboardRow entry={mockEntry} />);
    expect(screen.getByText("Emma D")).toBeInTheDocument();
  });

  it("renders rank", () => {
    render(<LeaderboardRow entry={mockEntry} />);
    expect(screen.getByText("1")).toBeInTheDocument();
  });

  it("renders calories formatted", () => {
    render(<LeaderboardRow entry={mockEntry} />);
    expect(screen.getByText("4,800 cal")).toBeInTheDocument();
  });

  it("renders session count", () => {
    render(<LeaderboardRow entry={mockEntry} />);
    expect(screen.getByText("18 sessions")).toBeInTheDocument();
  });

  it("renders user initials", () => {
    render(<LeaderboardRow entry={mockEntry} />);
    expect(screen.getByText("ED")).toBeInTheDocument();
  });
});
