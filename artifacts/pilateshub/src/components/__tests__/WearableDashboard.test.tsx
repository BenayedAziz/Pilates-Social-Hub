import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { WearableDashboard } from "../WearableDashboard";

// Mock the API hook
vi.mock("@/hooks/use-api", () => ({
  useWearable: vi.fn(),
}));

// Mock wouter
vi.mock("wouter", () => ({
  Link: ({ children, href }: { children: React.ReactNode; href: string }) => <a href={href}>{children}</a>,
}));

import { useWearable } from "@/hooks/use-api";

const mockUseWearable = vi.mocked(useWearable);

beforeEach(() => {
  vi.clearAllMocks();
});

describe("WearableDashboard", () => {
  it("renders nothing while loading", () => {
    mockUseWearable.mockReturnValue({ data: undefined, isLoading: true } as any);
    const { container } = render(<WearableDashboard />);
    expect(container.innerHTML).toBe("");
  });

  it("renders connect CTA when wearable not connected", () => {
    mockUseWearable.mockReturnValue({
      data: { connected: false },
      isLoading: false,
    } as any);

    render(<WearableDashboard />);
    expect(screen.getByText("Connect Your Wearable")).toBeInTheDocument();
    expect(screen.getByText("Connect Device")).toBeInTheDocument();
    expect(screen.getByText(/Link your Whoop/)).toBeInTheDocument();
  });

  it("renders health metrics when connected with high recovery", () => {
    mockUseWearable.mockReturnValue({
      data: {
        connected: true,
        provider: "whoop",
        lastSync: "2min ago",
        recovery: 78,
        strain: 12.3,
        hrv: 65,
        restingHr: 52,
        sleepScore: 85,
        sleepDuration: 7.5,
        caloriesBurned: 2100,
        activeCalories: 800,
      },
      isLoading: false,
    } as any);

    render(<WearableDashboard />);
    expect(screen.getByText("78%")).toBeInTheDocument();
    expect(screen.getByText("Recovery")).toBeInTheDocument();
    expect(screen.getByText("12.3")).toBeInTheDocument(); // strain
    expect(screen.getByText("65ms")).toBeInTheDocument(); // HRV
    expect(screen.getByText("52bpm")).toBeInTheDocument(); // RHR
    expect(screen.getByText("7.5h")).toBeInTheDocument(); // sleep
    expect(screen.getByText("Whoop")).toBeInTheDocument();
    expect(screen.getByText(/ready for an intense session/)).toBeInTheDocument();
  });

  it("shows moderate recommendation for mid-range recovery", () => {
    mockUseWearable.mockReturnValue({
      data: {
        connected: true,
        recovery: 50,
        strain: 8,
        hrv: 45,
        restingHr: 60,
        sleepDuration: 6,
        lastSync: "1h ago",
      },
      isLoading: false,
    } as any);

    render(<WearableDashboard />);
    expect(screen.getByText(/Moderate session recommended/)).toBeInTheDocument();
  });

  it("shows gentle recommendation for low recovery", () => {
    mockUseWearable.mockReturnValue({
      data: {
        connected: true,
        recovery: 20,
        strain: 3,
        hrv: 30,
        restingHr: 70,
        sleepDuration: 4,
        lastSync: "3h ago",
      },
      isLoading: false,
    } as any);

    render(<WearableDashboard />);
    expect(screen.getByText(/Take it easy today/)).toBeInTheDocument();
  });

  it("shows last sync time", () => {
    mockUseWearable.mockReturnValue({
      data: {
        connected: true,
        recovery: 60,
        strain: 10,
        hrv: 50,
        restingHr: 55,
        sleepDuration: 7,
        lastSync: "5min ago",
      },
      isLoading: false,
    } as any);

    render(<WearableDashboard />);
    expect(screen.getByText("Synced 5min ago")).toBeInTheDocument();
  });
});
