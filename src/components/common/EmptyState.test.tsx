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
});
