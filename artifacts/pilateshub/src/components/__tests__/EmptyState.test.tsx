import { render, screen } from "@testing-library/react";
import { ShoppingBag } from "lucide-react";
import { describe, expect, it } from "vitest";
import { EmptyState } from "../EmptyState";

describe("EmptyState", () => {
  it("renders title and description", () => {
    render(<EmptyState icon={<ShoppingBag data-testid="icon" />} title="No items" description="Your list is empty" />);
    expect(screen.getByText("No items")).toBeInTheDocument();
    expect(screen.getByText("Your list is empty")).toBeInTheDocument();
  });

  it("renders action when provided", () => {
    render(
      <EmptyState
        icon={<ShoppingBag />}
        title="No items"
        description="Empty"
        action={<button type="button">Add Item</button>}
      />,
    );
    expect(screen.getByText("Add Item")).toBeInTheDocument();
  });

  it("does not render action when not provided", () => {
    render(<EmptyState icon={<ShoppingBag />} title="No items" description="Empty" />);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });
});
