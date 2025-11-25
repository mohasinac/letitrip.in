import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { EmptyState, EmptyStates } from "./EmptyState";
import { ShoppingBag } from "lucide-react";

jest.mock("lucide-react", () => ({
  ShoppingBag: () => <div data-testid="shopping-bag-icon" />,
  Heart: () => <div data-testid="heart-icon" />,
  Gavel: () => <div data-testid="gavel-icon" />,
  Package: () => <div data-testid="package-icon" />,
  Search: () => <div data-testid="search-icon" />,
  Users: () => <div data-testid="users-icon" />,
  FileText: () => <div data-testid="file-text-icon" />,
}));

describe("EmptyState", () => {
  describe("Display", () => {
    it("renders title", () => {
      render(<EmptyState title="No items" />);
      expect(screen.getByText("No items")).toBeInTheDocument();
    });

    it("renders description when provided", () => {
      render(
        <EmptyState
          title="No items"
          description="Add some items to get started"
        />
      );
      expect(
        screen.getByText("Add some items to get started")
      ).toBeInTheDocument();
    });

    it("does not render description when not provided", () => {
      const { container } = render(<EmptyState title="No items" />);
      expect(container.querySelector("p")).not.toBeInTheDocument();
    });

    it("renders icon when provided", () => {
      render(<EmptyState title="No items" icon={<ShoppingBag />} />);
      expect(screen.getByTestId("shopping-bag-icon")).toBeInTheDocument();
    });

    it("does not render icon when not provided", () => {
      const { container } = render(<EmptyState title="No items" />);
      expect(container.querySelector(".rounded-full")).not.toBeInTheDocument();
    });
  });

  describe("Actions", () => {
    it("renders primary action button", () => {
      const onClick = jest.fn();
      render(
        <EmptyState title="No items" action={{ label: "Add Item", onClick }} />
      );
      expect(screen.getByText("Add Item")).toBeInTheDocument();
    });

    it("calls action onClick when button clicked", () => {
      const onClick = jest.fn();
      render(
        <EmptyState title="No items" action={{ label: "Add Item", onClick }} />
      );

      fireEvent.click(screen.getByText("Add Item"));
      expect(onClick).toHaveBeenCalled();
    });

    it("renders secondary action button", () => {
      const onClick = jest.fn();
      render(
        <EmptyState
          title="No items"
          secondaryAction={{ label: "Browse", onClick }}
        />
      );
      expect(screen.getByText("Browse")).toBeInTheDocument();
    });

    it("calls secondaryAction onClick when button clicked", () => {
      const onClick = jest.fn();
      render(
        <EmptyState
          title="No items"
          secondaryAction={{ label: "Browse", onClick }}
        />
      );

      fireEvent.click(screen.getByText("Browse"));
      expect(onClick).toHaveBeenCalled();
    });

    it("renders both action buttons", () => {
      render(
        <EmptyState
          title="No items"
          action={{ label: "Add Item", onClick: jest.fn() }}
          secondaryAction={{ label: "Browse", onClick: jest.fn() }}
        />
      );
      expect(screen.getByText("Add Item")).toBeInTheDocument();
      expect(screen.getByText("Browse")).toBeInTheDocument();
    });

    it("does not render action container when no actions provided", () => {
      const { container } = render(<EmptyState title="No items" />);
      expect(
        container.querySelector(".flex.flex-col.sm\\:flex-row")
      ).not.toBeInTheDocument();
    });
  });

  describe("Styling", () => {
    it("applies custom className", () => {
      const { container } = render(
        <EmptyState title="No items" className="custom-class" />
      );
      expect(container.querySelector(".custom-class")).toBeInTheDocument();
    });

    it("applies primary button styles", () => {
      render(
        <EmptyState
          title="No items"
          action={{ label: "Add Item", onClick: jest.fn() }}
        />
      );
      const button = screen.getByText("Add Item");
      expect(button).toHaveClass("bg-blue-600");
    });

    it("applies secondary button styles", () => {
      render(
        <EmptyState
          title="No items"
          secondaryAction={{ label: "Browse", onClick: jest.fn() }}
        />
      );
      const button = screen.getByText("Browse");
      expect(button).toHaveClass("border-gray-300");
    });
  });

  describe("Predefined States", () => {
    it("renders NoProducts state", () => {
      render(<EmptyStates.NoProducts />);
      expect(screen.getByText("No products found")).toBeInTheDocument();
      expect(screen.getByTestId("shopping-bag-icon")).toBeInTheDocument();
    });

    it("renders EmptyCart state", () => {
      render(<EmptyStates.EmptyCart />);
      expect(screen.getByText("Your cart is empty")).toBeInTheDocument();
      expect(screen.getByTestId("shopping-bag-icon")).toBeInTheDocument();
    });

    it("renders NoFavorites state", () => {
      render(<EmptyStates.NoFavorites />);
      expect(screen.getByText("No favorites yet")).toBeInTheDocument();
      expect(screen.getByTestId("heart-icon")).toBeInTheDocument();
    });

    it("renders NoAuctions state", () => {
      render(<EmptyStates.NoAuctions />);
      expect(screen.getByText("No active auctions")).toBeInTheDocument();
      expect(screen.getByTestId("gavel-icon")).toBeInTheDocument();
    });

    it("renders NoOrders state", () => {
      render(<EmptyStates.NoOrders />);
      expect(screen.getByText("No orders yet")).toBeInTheDocument();
      expect(screen.getByTestId("package-icon")).toBeInTheDocument();
    });

    it("renders NoSearchResults state", () => {
      render(<EmptyStates.NoSearchResults />);
      expect(screen.getByText("No results found")).toBeInTheDocument();
      expect(screen.getByTestId("search-icon")).toBeInTheDocument();
    });

    it("renders NoUsers state", () => {
      render(<EmptyStates.NoUsers />);
      expect(screen.getByText("No users found")).toBeInTheDocument();
      expect(screen.getByTestId("users-icon")).toBeInTheDocument();
    });

    it("renders NoData state", () => {
      render(<EmptyStates.NoData />);
      expect(screen.getByText("No data available")).toBeInTheDocument();
      expect(screen.getByTestId("file-text-icon")).toBeInTheDocument();
    });
  });

  describe("Predefined States with Custom Props", () => {
    it("overrides action in NoProducts", () => {
      const onClick = jest.fn();
      render(
        <EmptyStates.NoProducts action={{ label: "Shop Now", onClick }} />
      );
      expect(screen.getByText("Shop Now")).toBeInTheDocument();
    });

    it("overrides description in EmptyCart", () => {
      render(<EmptyStates.EmptyCart description="Custom description" />);
      expect(screen.getByText("Custom description")).toBeInTheDocument();
    });

    it("adds custom className to predefined state", () => {
      const { container } = render(
        <EmptyStates.NoProducts className="custom" />
      );
      expect(container.querySelector(".custom")).toBeInTheDocument();
    });
  });

  describe("Edge Cases", () => {
    it("handles very long title text", () => {
      const longTitle = "A".repeat(200);
      render(<EmptyState title={longTitle} />);
      expect(screen.getByText(longTitle)).toBeInTheDocument();
    });

    it("handles very long description text", () => {
      const longDesc = "B".repeat(500);
      render(<EmptyState title="Test" description={longDesc} />);
      expect(screen.getByText(longDesc)).toBeInTheDocument();
    });

    it("handles empty string action label", () => {
      render(
        <EmptyState title="Test" action={{ label: "", onClick: jest.fn() }} />
      );
      const button = screen.getByRole("button");
      expect(button).toHaveTextContent("");
    });

    it("handles multiple rapid action button clicks", () => {
      const onClick = jest.fn();
      render(<EmptyState title="Test" action={{ label: "Click", onClick }} />);

      const button = screen.getByText("Click");
      fireEvent.click(button);
      fireEvent.click(button);
      fireEvent.click(button);

      expect(onClick).toHaveBeenCalledTimes(3);
    });

    it("handles special characters in title", () => {
      render(<EmptyState title="No items! @#$%^&*()" />);
      expect(screen.getByText("No items! @#$%^&*()")).toBeInTheDocument();
    });

    it("handles custom React node as icon", () => {
      render(
        <EmptyState
          title="Test"
          icon={<div data-testid="custom-icon">Custom</div>}
        />
      );
      expect(screen.getByTestId("custom-icon")).toBeInTheDocument();
    });
  });

  describe("Layout and Spacing", () => {
    it("applies centered layout with flex-col", () => {
      const { container } = render(<EmptyState title="Test" />);
      const mainDiv = container.firstChild;
      expect(mainDiv).toHaveClass(
        "flex",
        "flex-col",
        "items-center",
        "justify-center"
      );
    });

    it("applies py-16 padding", () => {
      const { container } = render(<EmptyState title="Test" />);
      expect(container.firstChild).toHaveClass("py-16");
    });

    it("icon has mb-6 margin", () => {
      const { container } = render(
        <EmptyState title="Test" icon={<ShoppingBag />} />
      );
      const iconContainer = container.querySelector(".rounded-full");
      expect(iconContainer).toHaveClass("mb-6");
    });

    it("description has max-w-md constraint", () => {
      const { container } = render(
        <EmptyState title="Test" description="Description" />
      );
      const description = container.querySelector("p");
      expect(description).toHaveClass("max-w-md");
    });

    it("actions container has gap-3 between buttons", () => {
      const { container } = render(
        <EmptyState
          title="Test"
          action={{ label: "Action", onClick: jest.fn() }}
          secondaryAction={{ label: "Secondary", onClick: jest.fn() }}
        />
      );
      const actionsContainer = container.querySelector(
        ".flex-col.sm\\:flex-row"
      );
      expect(actionsContainer).toHaveClass("gap-3");
    });
  });

  describe("Accessibility", () => {
    it("uses semantic h3 heading for title", () => {
      render(<EmptyState title="Test Title" />);
      const heading = screen.getByRole("heading", { level: 3 });
      expect(heading).toHaveTextContent("Test Title");
    });

    it("action button has accessible role", () => {
      render(
        <EmptyState
          title="Test"
          action={{ label: "Click Me", onClick: jest.fn() }}
        />
      );
      expect(
        screen.getByRole("button", { name: "Click Me" })
      ).toBeInTheDocument();
    });

    it("secondary action button has accessible role", () => {
      render(
        <EmptyState
          title="Test"
          secondaryAction={{ label: "Cancel", onClick: jest.fn() }}
        />
      );
      expect(
        screen.getByRole("button", { name: "Cancel" })
      ).toBeInTheDocument();
    });

    it("applies text-center for better readability", () => {
      const { container } = render(<EmptyState title="Test" />);
      expect(container.firstChild).toHaveClass("text-center");
    });
  });

  describe("Responsive Behavior", () => {
    it("buttons stack on mobile (flex-col) and side-by-side on desktop (sm:flex-row)", () => {
      const { container } = render(
        <EmptyState
          title="Test"
          action={{ label: "Primary", onClick: jest.fn() }}
          secondaryAction={{ label: "Secondary", onClick: jest.fn() }}
        />
      );
      const actionsContainer = container.querySelector(
        ".flex-col.sm\\:flex-row"
      );
      expect(actionsContainer).toHaveClass("flex-col", "sm:flex-row");
    });
  });
});
