import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import MePage from "../MePage";

// Mock AuthContext
vi.mock("@/context/AuthContext", () => ({
  useAuth: () => ({
    user: { id: 1, name: "Sarah Johnson", initials: "SJ", level: "Advanced", email: "s@t.com", bio: "" },
    logout: vi.fn(),
  }),
}));

// Mock AppContext
vi.mock("@/context/AppContext", () => ({
  useApp: () => ({
    currentStreak: 12,
    totalSessions: 47,
    totalCalories: 12400,
    weeklyGoal: 5,
    weeklyCompleted: 4,
    longestStreak: 18,
  }),
}));

// Mock i18n
vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

// Mock wouter
vi.mock("wouter", () => ({
  Link: ({ children, href }: any) => <a href={href}>{children}</a>,
}));

// Mock sonner
vi.mock("sonner", () => ({
  toast: { success: vi.fn() },
}));

// Mock API hooks
vi.mock("@/hooks/use-api", () => ({
  useBadges: vi.fn(() => ({
    data: [{ id: 1, name: "Fire Starter", icon: "flame-emoji", earned: true, description: "Complete 5 sessions" }],
    isLoading: false,
  })),
  useChallenges: vi.fn(() => ({
    data: [{ id: 1, title: "January Challenge", progress: 3, target: 10, type: "monthly" }],
  })),
  useBookings: vi.fn(() => ({
    data: [
      { id: 1, classId: 1, studioId: 1, status: "confirmed", className: "Reformer Advanced", studioName: "Studio Harmonie", timeSlot: "09:00", bookedAt: "2026-03-25T08:00:00Z", cancelledAt: null },
    ],
    isLoading: false,
  })),
  useCancelBooking: vi.fn(() => ({
    mutate: vi.fn(),
    isPending: false,
  })),
  useWearable: vi.fn(() => ({
    data: { connected: false },
    isLoading: false,
  })),
}));

// Mock child components that have complex dependencies
vi.mock("@/components/WeeklyRecap", () => ({
  WeeklyRecap: () => <div data-testid="weekly-recap">Weekly Recap</div>,
}));

vi.mock("@/components/WearableDashboard", () => ({
  WearableDashboard: () => <div data-testid="wearable-dashboard">Wearable</div>,
}));

vi.mock("@/components/JourneyMap", () => ({
  JourneyMap: () => <div data-testid="journey-map">Journey Map</div>,
}));

vi.mock("@/components/NotificationSettings", () => ({
  NotificationSettings: () => <div data-testid="notification-settings">Notifications</div>,
}));

vi.mock("@/components/PageSkeleton", () => ({
  GenericPageSkeleton: () => <div data-testid="skeleton">Loading...</div>,
}));

describe("MePage", () => {
  it("renders without crashing", () => {
    render(<MePage />);
    expect(document.body.innerHTML.length).toBeGreaterThan(0);
  });

  it("renders user name", () => {
    render(<MePage />);
    expect(screen.getByText("Sarah Johnson")).toBeInTheDocument();
  });

  it("renders user initials", () => {
    render(<MePage />);
    expect(screen.getByText("SJ")).toBeInTheDocument();
  });

  it("renders user level", () => {
    render(<MePage />);
    expect(screen.getByText(/Advanced Level/)).toBeInTheDocument();
  });

  it("renders weekly recap section", () => {
    render(<MePage />);
    expect(screen.getByTestId("weekly-recap")).toBeInTheDocument();
  });

  it("renders wearable dashboard section", () => {
    render(<MePage />);
    expect(screen.getByTestId("wearable-dashboard")).toBeInTheDocument();
  });

  it("renders journey map section", () => {
    render(<MePage />);
    expect(screen.getByTestId("journey-map")).toBeInTheDocument();
  });

  it("renders badges section", () => {
    render(<MePage />);
    expect(screen.getByText("Fire Starter")).toBeInTheDocument();
  });

  it("renders edit profile link", () => {
    render(<MePage />);
    expect(screen.getByLabelText("Edit profile")).toBeInTheDocument();
  });
});

describe("MePage — loading state", () => {
  it("shows skeleton when badges are loading", async () => {
    const apiModule = await import("@/hooks/use-api");
    vi.mocked(apiModule.useBadges).mockReturnValue({ data: [], isLoading: true } as any);

    render(<MePage />);
    expect(screen.getByTestId("skeleton")).toBeInTheDocument();

    // Restore
    vi.mocked(apiModule.useBadges).mockReturnValue({
      data: [{ id: 1, name: "Fire Starter", icon: "flame-emoji", earned: true, description: "Complete 5 sessions" }],
      isLoading: false,
    } as any);
  });
});
