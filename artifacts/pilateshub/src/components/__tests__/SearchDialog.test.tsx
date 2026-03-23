import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

// Mock wouter
vi.mock("wouter", () => ({
  Link: ({ children, href, onClick }: any) => (
    <a href={href} onClick={onClick}>
      {children}
    </a>
  ),
}));

// Mock i18n
vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        "common.search": "Search",
      };
      return translations[key] || key;
    },
  }),
}));

// Mock the API hooks
vi.mock("@/hooks/use-api", () => ({
  useStudios: vi.fn(() => ({
    data: [
      { id: 1, name: "Reformer Club", neighborhood: "Marais", price: 45 },
      { id: 2, name: "Zen Mat Studio", neighborhood: "Saint-Germain", price: 35 },
    ],
  })),
  useProducts: vi.fn(() => ({
    data: [
      { id: 1, name: "Grip Socks", brand: "ToeSox", price: 19, image: "bg-pink-100" },
      { id: 2, name: "Reformer Mat", brand: "Balanced Body", price: 59, image: "bg-blue-100" },
    ],
  })),
  useForum: vi.fn(() => ({
    data: [{ id: 1, title: "Best reformer studios in Paris?", category: "Studios", timeAgo: "2h" }],
  })),
}));

// Mock Radix Dialog - always render content (no open/close state management)
vi.mock("@/components/ui/dialog", () => ({
  Dialog: ({ children }: any) => <div data-testid="dialog">{children}</div>,
  DialogTrigger: ({ children, asChild }: any) => {
    if (asChild) return children;
    return <button>{children}</button>;
  },
  DialogContent: ({ children }: any) => <div data-testid="dialog-content">{children}</div>,
}));

// We need to import SearchDialog AFTER all vi.mock calls
import { SearchDialog } from "../SearchDialog";

describe("SearchDialog", () => {
  it("renders the search trigger button", () => {
    render(<SearchDialog />);
    expect(screen.getByLabelText("Search")).toBeInTheDocument();
  });

  it("shows initial prompt text", () => {
    render(<SearchDialog />);
    expect(screen.getByText("Type at least 2 characters to search")).toBeInTheDocument();
  });

  it("shows no results message for unmatched query", () => {
    render(<SearchDialog />);
    const input = screen.getByPlaceholderText("Search");
    fireEvent.change(input, { target: { value: "xxxxxxxxx" } });
    expect(screen.getByText(/No results for/)).toBeInTheDocument();
  });

  it("finds studios matching search query", () => {
    render(<SearchDialog />);
    const input = screen.getByPlaceholderText("Search");
    fireEvent.change(input, { target: { value: "reformer" } });
    expect(screen.getByText("Studios")).toBeInTheDocument();
    expect(screen.getByText("Reformer Club")).toBeInTheDocument();
  });

  it("finds products matching search query", () => {
    render(<SearchDialog />);
    const input = screen.getByPlaceholderText("Search");
    fireEvent.change(input, { target: { value: "grip" } });
    expect(screen.getByText("Products")).toBeInTheDocument();
    expect(screen.getByText("Grip Socks")).toBeInTheDocument();
  });

  it("finds forum posts matching search query", () => {
    render(<SearchDialog />);
    const input = screen.getByPlaceholderText("Search");
    fireEvent.change(input, { target: { value: "reformer" } });
    expect(screen.getByText("Discussions")).toBeInTheDocument();
    expect(screen.getByText("Best reformer studios in Paris?")).toBeInTheDocument();
  });

  it("requires at least 2 characters to show results", () => {
    render(<SearchDialog />);
    const input = screen.getByPlaceholderText("Search");
    fireEvent.change(input, { target: { value: "r" } });
    expect(screen.getByText("Type at least 2 characters to search")).toBeInTheDocument();
  });
});
