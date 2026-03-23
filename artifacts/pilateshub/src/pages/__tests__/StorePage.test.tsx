import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import StorePage from "../StorePage";

// Mock AppContext
vi.mock("@/context/AppContext", () => ({
  useApp: () => ({
    wishlist: new Set<number>(),
    toggleWishlist: vi.fn(),
    addToCart: vi.fn(),
  }),
}));

// Mock i18n
vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const m: Record<string, string> = {
        "shop.all": "All",
        "shop.habitat": "Habitat",
        "shop.food": "Food",
        "shop.machines": "Machines",
        "shop.goodies": "Goodies",
        "shop.apparel": "Apparel",
        "shop.accessories": "Accessories",
      };
      return m[key] || key;
    },
  }),
}));

// Mock wouter
vi.mock("wouter", () => ({
  Link: ({ children, href }: any) => <a href={href}>{children}</a>,
}));

// Mock API
vi.mock("@/hooks/use-api", () => ({
  useProducts: vi.fn(() => ({
    data: [
      {
        id: 1,
        name: "Grip Socks",
        brand: "ToeSox",
        price: 19,
        rating: 4.5,
        category: "Goodies",
        image: "bg-pink-100",
        imageUrl: "",
      },
      {
        id: 2,
        name: "Reformer Mat",
        brand: "Balanced",
        price: 59,
        rating: 4.8,
        category: "Machines",
        image: "bg-blue-100",
        imageUrl: "",
      },
    ],
    isLoading: false,
  })),
  useBrands: vi.fn(() => ({
    data: [{ id: 1, name: "ToeSox", slug: "toesox" }],
  })),
}));

// Mock skeleton
vi.mock("@/components/PageSkeleton", () => ({
  StorePageSkeleton: () => <div data-testid="store-skeleton">Loading store...</div>,
}));

describe("StorePage", () => {
  it("renders without crashing", () => {
    render(<StorePage />);
    expect(document.body.innerHTML.length).toBeGreaterThan(0);
  });

  it("renders category tabs", () => {
    render(<StorePage />);
    const tabs = screen.getAllByRole("tab");
    expect(tabs.length).toBeGreaterThanOrEqual(5);
  });

  it("renders product names", () => {
    render(<StorePage />);
    expect(screen.getByText("Grip Socks")).toBeInTheDocument();
    expect(screen.getByText("Reformer Mat")).toBeInTheDocument();
  });

  it("renders product prices", () => {
    render(<StorePage />);
    expect(screen.getByText(/€19/)).toBeInTheDocument();
    expect(screen.getByText(/€59/)).toBeInTheDocument();
  });

  it("filters products by category", () => {
    render(<StorePage />);
    // Click the Machines tab
    const machinesTab = screen.getAllByRole("tab").find((t) => t.textContent?.includes("Machines"));
    if (machinesTab) {
      fireEvent.click(machinesTab);
      expect(screen.getByText("Reformer Mat")).toBeInTheDocument();
      expect(screen.queryByText("Grip Socks")).not.toBeInTheDocument();
    }
  });
});

describe("StorePage — loading state", () => {
  it("shows skeleton while loading", async () => {
    const apiModule = await import("@/hooks/use-api");
    vi.mocked(apiModule.useProducts).mockReturnValue({ data: [], isLoading: true } as any);

    render(<StorePage />);
    expect(screen.getByTestId("store-skeleton")).toBeInTheDocument();

    // Restore
    vi.mocked(apiModule.useProducts).mockReturnValue({
      data: [
        {
          id: 1,
          name: "Grip Socks",
          brand: "ToeSox",
          price: 19,
          rating: 4.5,
          category: "Goodies",
          image: "bg-pink-100",
          imageUrl: "",
        },
        {
          id: 2,
          name: "Reformer Mat",
          brand: "Balanced",
          price: 59,
          rating: 4.8,
          category: "Machines",
          image: "bg-blue-100",
          imageUrl: "",
        },
      ],
      isLoading: false,
    } as any);
  });
});
