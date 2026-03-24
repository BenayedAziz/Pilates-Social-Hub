import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import StorePage from "../StorePage";

// Mock AppContext
vi.mock("@/context/AppContext", () => ({
  useApp: () => ({
    wishlist: new Set<number>(),
    toggleWishlist: vi.fn(),
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
        "shop.viewProduct": "View",
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
        name: "Half Toe Elle Grip Socks",
        brand: "ToeSox",
        price: 22,
        rating: 4.8,
        category: "Accessoires",
        image: "bg-pink-100",
        imageUrl: "",
        externalUrl: "https://www.toesox.com/collections/pilates/products/half-toe-elle-grip-socks",
        badge: "Best Seller",
      },
      {
        id: 6,
        name: "Ultra-Fit Circle",
        brand: "Balanced Body",
        price: 35,
        rating: 4.8,
        category: "Machines",
        image: "bg-blue-100",
        imageUrl: "",
        externalUrl: "https://www.pilates.com/products/pilates-rings-ultra-fit-circle/",
        badge: "Best Seller",
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
    expect(screen.getByText("Half Toe Elle Grip Socks")).toBeInTheDocument();
    expect(screen.getByText("Ultra-Fit Circle")).toBeInTheDocument();
  });

  it("renders product prices", () => {
    render(<StorePage />);
    expect(screen.getByText(/22/)).toBeInTheDocument();
    expect(screen.getByText(/35/)).toBeInTheDocument();
  });

  it("renders View buttons that link externally", () => {
    render(<StorePage />);
    const viewButtons = screen.getAllByText("View");
    expect(viewButtons.length).toBeGreaterThanOrEqual(2);
    // Check that the link wraps have target="_blank"
    const externalLinks = document.querySelectorAll('a[target="_blank"]');
    expect(externalLinks.length).toBeGreaterThanOrEqual(2);
  });

  it("filters products by category", () => {
    render(<StorePage />);
    // Click the Machines tab
    const machinesTab = screen.getAllByRole("tab").find((t) => t.textContent?.includes("Machines"));
    if (machinesTab) {
      fireEvent.click(machinesTab);
      expect(screen.getByText("Ultra-Fit Circle")).toBeInTheDocument();
      expect(screen.queryByText("Half Toe Elle Grip Socks")).not.toBeInTheDocument();
    }
  });
});

describe("StorePage -- loading state", () => {
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
          name: "Half Toe Elle Grip Socks",
          brand: "ToeSox",
          price: 22,
          rating: 4.8,
          category: "Accessoires",
          image: "bg-pink-100",
          imageUrl: "",
          externalUrl: "https://www.toesox.com/collections/pilates/products/half-toe-elle-grip-socks",
          badge: "Best Seller",
        },
        {
          id: 6,
          name: "Ultra-Fit Circle",
          brand: "Balanced Body",
          price: 35,
          rating: 4.8,
          category: "Machines",
          image: "bg-blue-100",
          imageUrl: "",
          externalUrl: "https://www.pilates.com/products/pilates-rings-ultra-fit-circle/",
          badge: "Best Seller",
        },
      ],
      isLoading: false,
    } as any);
  });
});
