import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import FeedPage from "../FeedPage";

// Mock AppContext
vi.mock("@/context/AppContext", () => ({
  useApp: () => ({
    likedPosts: {},
    toggleLike: vi.fn(),
    following: {},
    toggleFollow: vi.fn(),
    logSession: vi.fn(),
  }),
}));

// Mock API hooks
vi.mock("@/hooks/use-api", () => ({
  useFeed: vi.fn(() => ({
    data: [
      {
        id: 1,
        user: { id: 1, name: "Sarah J", initials: "SJ", color: "bg-pink-200" },
        type: "Reformer",
        studio: "Reformer Club",
        duration: 55,
        calories: 320,
        likes: 5,
        comments: 2,
        timeAgo: "2h",
        hasPhoto: false,
      },
    ],
    isLoading: false,
  })),
  useLeaderboard: vi.fn(() => ({
    data: [
      {
        rank: 1,
        user: { id: 1, name: "Emma D", initials: "ED", color: "bg-rose-200" },
        sessions: 18,
        calories: 4800,
      },
    ],
  })),
}));

// Mock sonner
vi.mock("sonner", () => ({
  toast: { success: vi.fn() },
}));

// Mock child pages to avoid deep dependency trees
vi.mock("@/pages/CirclesPage", () => ({
  default: () => <div>Circles</div>,
}));
vi.mock("@/pages/CommunityPage", () => ({
  default: () => <div>Community</div>,
}));

// Mock PageSkeleton
vi.mock("@/components/PageSkeleton", () => ({
  FeedPageSkeleton: () => <div>Loading feed...</div>,
}));

// Mock Tabs
vi.mock("@/components/ui/tabs", () => ({
  Tabs: ({ children, defaultValue }: any) => <div data-value={defaultValue}>{children}</div>,
  TabsList: ({ children }: any) => <div role="tablist">{children}</div>,
  TabsTrigger: ({ children, value }: any) => (
    <button role="tab" data-value={value}>
      {children}
    </button>
  ),
  TabsContent: ({ children }: any) => <div>{children}</div>,
}));

// Mock Dialog
vi.mock("@/components/ui/dialog", () => ({
  Dialog: ({ children }: any) => <div>{children}</div>,
  DialogContent: ({ children }: any) => <div>{children}</div>,
  DialogHeader: ({ children }: any) => <div>{children}</div>,
  DialogTitle: ({ children }: any) => <h2>{children}</h2>,
  DialogTrigger: ({ children, asChild }: any) => (asChild ? children : <button>{children}</button>),
}));

describe("FeedPage", () => {
  it("renders without crashing", () => {
    render(<FeedPage />);
    expect(document.body.innerHTML.length).toBeGreaterThan(0);
  });

  it("renders feed post content", () => {
    render(<FeedPage />);
    // The user name appears in the post cards
    expect(screen.getAllByText("Sarah J").length).toBeGreaterThan(0);
  });

  it("renders tab navigation", () => {
    render(<FeedPage />);
    const tabs = screen.getAllByRole("tab");
    expect(tabs.length).toBeGreaterThanOrEqual(1);
  });
});

describe("FeedPage — loading state", () => {
  it("shows skeleton when loading", async () => {
    const apiModule = await import("@/hooks/use-api");
    vi.mocked(apiModule.useFeed).mockReturnValue({ data: [], isLoading: true } as any);

    render(<FeedPage />);
    expect(screen.getByText("Loading feed...")).toBeInTheDocument();

    // Restore
    vi.mocked(apiModule.useFeed).mockReturnValue({
      data: [
        {
          id: 1,
          user: { id: 1, name: "Sarah J", initials: "SJ", color: "bg-pink-200" },
          type: "Reformer",
          studio: "Reformer Club",
          duration: 55,
          calories: 320,
          likes: 5,
          comments: 2,
          timeAgo: "2h",
          hasPhoto: false,
        },
      ],
      isLoading: false,
    } as any);
  });
});
