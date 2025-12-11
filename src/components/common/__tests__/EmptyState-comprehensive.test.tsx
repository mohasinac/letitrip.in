/**
 * Comprehensive EmptyState Component Test Suite
 * Tests all props, variants, interactions, and accessibility
 */

import { describe, expect, it, jest } from "@jest/globals";
import { fireEvent, render, screen } from "@testing-library/react";
import { Heart, Search, ShoppingBag } from "lucide-react";
import { EmptyState, EmptyStates } from "../EmptyState";

describe("EmptyState Component - Comprehensive Tests", () => {
  describe("Basic Rendering", () => {
    it("should render with title only", () => {
      render(<EmptyState title="No items found" />);
      expect(screen.getByText("No items found")).toBeInTheDocument();
    });

    it("should render with title and description", () => {
      render(
        <EmptyState
          title="No products"
          description="Start adding products to see them here"
        />
      );
      expect(screen.getByText("No products")).toBeInTheDocument();
      expect(
        screen.getByText("Start adding products to see them here")
      ).toBeInTheDocument();
    });

    it("should render with custom icon", () => {
      const { container } = render(
        <EmptyState
          title="Empty"
          icon={<ShoppingBag data-testid="custom-icon" />}
        />
      );
      expect(screen.getByTestId("custom-icon")).toBeInTheDocument();
    });

    it("should not render icon when not provided", () => {
      const { container } = render(<EmptyState title="Empty" />);
      expect(container.querySelector(".rounded-full")).not.toBeInTheDocument();
    });

    it("should apply custom className", () => {
      const { container } = render(
        <EmptyState title="Empty" className="custom-class" />
      );
      expect(container.firstChild).toHaveClass("custom-class");
    });

    it("should render without description when not provided", () => {
      render(<EmptyState title="Empty" />);
      expect(screen.queryByText(/Start adding/)).not.toBeInTheDocument();
    });
  });

  describe("Actions", () => {
    it("should render primary action button", () => {
      const onClick = jest.fn();
      render(
        <EmptyState title="Empty" action={{ label: "Add Item", onClick }} />
      );
      expect(
        screen.getByRole("button", { name: "Add Item" })
      ).toBeInTheDocument();
    });

    it("should call onClick when primary action clicked", () => {
      const onClick = jest.fn();
      render(
        <EmptyState title="Empty" action={{ label: "Add Item", onClick }} />
      );
      fireEvent.click(screen.getByRole("button", { name: "Add Item" }));
      expect(onClick).toHaveBeenCalledTimes(1);
    });

    it("should render secondary action button", () => {
      const onClick = jest.fn();
      render(
        <EmptyState
          title="Empty"
          secondaryAction={{ label: "Learn More", onClick }}
        />
      );
      expect(
        screen.getByRole("button", { name: "Learn More" })
      ).toBeInTheDocument();
    });

    it("should call onClick when secondary action clicked", () => {
      const onClick = jest.fn();
      render(
        <EmptyState
          title="Empty"
          secondaryAction={{ label: "Learn More", onClick }}
        />
      );
      fireEvent.click(screen.getByRole("button", { name: "Learn More" }));
      expect(onClick).toHaveBeenCalledTimes(1);
    });

    it("should render both primary and secondary actions", () => {
      const primaryClick = jest.fn();
      const secondaryClick = jest.fn();
      render(
        <EmptyState
          title="Empty"
          action={{ label: "Primary", onClick: primaryClick }}
          secondaryAction={{ label: "Secondary", onClick: secondaryClick }}
        />
      );
      expect(
        screen.getByRole("button", { name: "Primary" })
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "Secondary" })
      ).toBeInTheDocument();
    });

    it("should not render action container when no actions provided", () => {
      const { container } = render(<EmptyState title="Empty" />);
      expect(
        container.querySelector(".flex.flex-col.sm\\:flex-row")
      ).not.toBeInTheDocument();
    });

    it("should handle multiple clicks on same action", () => {
      const onClick = jest.fn();
      render(
        <EmptyState title="Empty" action={{ label: "Click Me", onClick }} />
      );
      const button = screen.getByRole("button", { name: "Click Me" });
      fireEvent.click(button);
      fireEvent.click(button);
      fireEvent.click(button);
      expect(onClick).toHaveBeenCalledTimes(3);
    });

    it("should handle rapid clicks", () => {
      const onClick = jest.fn();
      render(
        <EmptyState title="Empty" action={{ label: "Click Me", onClick }} />
      );
      const button = screen.getByRole("button", { name: "Click Me" });
      for (let i = 0; i < 10; i++) {
        fireEvent.click(button);
      }
      expect(onClick).toHaveBeenCalledTimes(10);
    });
  });

  describe("Styling and Classes", () => {
    it("should apply correct text color classes for title", () => {
      render(<EmptyState title="Empty" />);
      const title = screen.getByText("Empty");
      expect(title).toHaveClass("text-gray-900", "dark:text-white");
    });

    it("should apply correct text color classes for description", () => {
      render(<EmptyState title="Empty" description="Test description" />);
      const description = screen.getByText("Test description");
      expect(description).toHaveClass("text-gray-500", "dark:text-gray-400");
    });

    it("should apply blue background to primary action", () => {
      render(
        <EmptyState
          title="Empty"
          action={{ label: "Action", onClick: jest.fn() }}
        />
      );
      const button = screen.getByRole("button", { name: "Action" });
      expect(button).toHaveClass("bg-blue-600", "hover:bg-blue-700");
    });

    it("should apply border to secondary action", () => {
      render(
        <EmptyState
          title="Empty"
          secondaryAction={{ label: "Action", onClick: jest.fn() }}
        />
      );
      const button = screen.getByRole("button", { name: "Action" });
      expect(button).toHaveClass("border", "border-gray-300");
    });

    it("should merge custom className with default classes", () => {
      const { container } = render(
        <EmptyState title="Empty" className="my-custom-class" />
      );
      expect(container.firstChild).toHaveClass("my-custom-class");
      expect(container.firstChild).toHaveClass("flex", "flex-col");
    });
  });

  describe("Predefined EmptyStates - NoProducts", () => {
    it("should render NoProducts with default props", () => {
      render(<EmptyStates.NoProducts />);
      expect(screen.getByText("No products found")).toBeInTheDocument();
      expect(
        screen.getByText(/couldn't find any products matching/)
      ).toBeInTheDocument();
    });

    it("should override title in NoProducts", () => {
      render(<EmptyStates.NoProducts title="Custom title" />);
      expect(screen.getByText("Custom title")).toBeInTheDocument();
      expect(screen.queryByText("No products found")).not.toBeInTheDocument();
    });

    it("should override description in NoProducts", () => {
      render(<EmptyStates.NoProducts description="Custom description" />);
      expect(screen.getByText("Custom description")).toBeInTheDocument();
    });

    it("should add action to NoProducts", () => {
      const onClick = jest.fn();
      render(<EmptyStates.NoProducts action={{ label: "Browse", onClick }} />);
      expect(
        screen.getByRole("button", { name: "Browse" })
      ).toBeInTheDocument();
    });
  });

  describe("Predefined EmptyStates - EmptyCart", () => {
    it("should render EmptyCart with default props", () => {
      render(<EmptyStates.EmptyCart />);
      expect(screen.getByText("Your cart is empty")).toBeInTheDocument();
      expect(
        screen.getByText(/Start adding products to your cart/)
      ).toBeInTheDocument();
    });

    it("should override EmptyCart props", () => {
      render(<EmptyStates.EmptyCart title="Cart is empty!" />);
      expect(screen.getByText("Cart is empty!")).toBeInTheDocument();
    });
  });

  describe("Predefined EmptyStates - NoFavorites", () => {
    it("should render NoFavorites with default props", () => {
      render(<EmptyStates.NoFavorites />);
      expect(screen.getByText("No favorites yet")).toBeInTheDocument();
      expect(
        screen.getByText(/haven't added any products to your favorites/)
      ).toBeInTheDocument();
    });

    it("should add action to NoFavorites", () => {
      const onClick = jest.fn();
      render(
        <EmptyStates.NoFavorites action={{ label: "Explore", onClick }} />
      );
      fireEvent.click(screen.getByRole("button", { name: "Explore" }));
      expect(onClick).toHaveBeenCalled();
    });
  });

  describe("Predefined EmptyStates - NoAuctions", () => {
    it("should render NoAuctions with default props", () => {
      render(<EmptyStates.NoAuctions />);
      expect(screen.getByText("No active auctions")).toBeInTheDocument();
      expect(
        screen.getByText(/no active auctions at the moment/)
      ).toBeInTheDocument();
    });
  });

  describe("Predefined EmptyStates - NoOrders", () => {
    it("should render NoOrders with default props", () => {
      render(<EmptyStates.NoOrders />);
      expect(screen.getByText("No orders yet")).toBeInTheDocument();
      expect(screen.getByText(/haven't placed any orders/)).toBeInTheDocument();
    });
  });

  describe("Predefined EmptyStates - NoSearchResults", () => {
    it("should render NoSearchResults with default props", () => {
      render(<EmptyStates.NoSearchResults />);
      expect(screen.getByText("No results found")).toBeInTheDocument();
      expect(
        screen.getByText(/couldn't find anything matching your search/)
      ).toBeInTheDocument();
    });
  });

  describe("Predefined EmptyStates - NoUsers", () => {
    it("should render NoUsers with default props", () => {
      render(<EmptyStates.NoUsers />);
      expect(screen.getByText("No users found")).toBeInTheDocument();
    });
  });

  describe("Predefined EmptyStates - NoData", () => {
    it("should render NoData with default props", () => {
      render(<EmptyStates.NoData />);
      expect(screen.getByText("No data available")).toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("should render with proper heading hierarchy", () => {
      render(<EmptyState title="Empty State" />);
      const heading = screen.getByRole("heading", { level: 3 });
      expect(heading).toHaveTextContent("Empty State");
    });

    it("should have accessible buttons", () => {
      render(
        <EmptyState
          title="Empty"
          action={{ label: "Click me", onClick: jest.fn() }}
        />
      );
      const button = screen.getByRole("button", { name: "Click me" });
      expect(button).toBeInTheDocument();
    });

    it("should support keyboard navigation", () => {
      const onClick = jest.fn();
      render(
        <EmptyState title="Empty" action={{ label: "Action", onClick }} />
      );
      const button = screen.getByRole("button", { name: "Action" });
      button.focus();
      expect(button).toHaveFocus();
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty string title", () => {
      render(<EmptyState title="" />);
      expect(screen.getByRole("heading", { level: 3 })).toBeInTheDocument();
    });

    it("should handle empty string description", () => {
      const { container } = render(<EmptyState title="Empty" description="" />);
      // Empty string is falsy in JavaScript, so paragraph won't render
      const paragraph = container.querySelector("p");
      expect(paragraph).not.toBeInTheDocument();
    });

    it("should handle very long title", () => {
      const longTitle = "A".repeat(1000);
      render(<EmptyState title={longTitle} />);
      expect(screen.getByText(longTitle)).toBeInTheDocument();
    });

    it("should handle very long description", () => {
      const longDesc = "B".repeat(10000);
      render(<EmptyState title="Test" description={longDesc} />);
      expect(screen.getByText(longDesc)).toBeInTheDocument();
    });

    it("should handle special characters in title", () => {
      const title = "Products <>&\"' 日本語";
      render(<EmptyState title={title} />);
      expect(screen.getByText(title)).toBeInTheDocument();
    });

    it("should handle null icon gracefully", () => {
      render(<EmptyState title="Empty" icon={null} />);
      expect(screen.getByText("Empty")).toBeInTheDocument();
    });

    it("should handle undefined action properties", () => {
      render(
        <EmptyState title="Empty" action={{ label: "", onClick: jest.fn() }} />
      );
      expect(screen.getByRole("button")).toBeInTheDocument();
    });

    it("should handle multiple icons", () => {
      const { container } = render(
        <EmptyState
          title="Empty"
          icon={
            <>
              <Heart />
              <ShoppingBag />
            </>
          }
        />
      );
      expect(container.querySelector(".rounded-full")).toBeInTheDocument();
    });
  });

  describe("Responsive Design", () => {
    it("should apply responsive classes to action container", () => {
      const { container } = render(
        <EmptyState
          title="Empty"
          action={{ label: "Action", onClick: jest.fn() }}
        />
      );
      // Get the action button container specifically (has gap-3 class)
      const actionContainer = container.querySelector(".flex.gap-3");
      expect(actionContainer).toHaveClass("flex-col", "sm:flex-row");
    });

    it("should apply responsive gap classes", () => {
      const { container } = render(
        <EmptyState
          title="Empty"
          action={{ label: "Action", onClick: jest.fn() }}
        />
      );
      // Get the action button container specifically (has gap-3 class)
      const actionContainer = container.querySelector(".gap-3");
      expect(actionContainer).toHaveClass("gap-3");
    });
  });

  describe("Dark Mode", () => {
    it("should have dark mode classes for title", () => {
      render(<EmptyState title="Empty" />);
      const title = screen.getByText("Empty");
      expect(title).toHaveClass("dark:text-white");
    });

    it("should have dark mode classes for description", () => {
      render(<EmptyState title="Empty" description="Test" />);
      const description = screen.getByText("Test");
      expect(description).toHaveClass("dark:text-gray-400");
    });

    it("should have dark mode classes for icon container", () => {
      const { container } = render(
        <EmptyState title="Empty" icon={<Search />} />
      );
      const iconContainer = container.querySelector(".rounded-full");
      expect(iconContainer).toHaveClass("dark:bg-gray-800");
    });

    it("should have dark mode classes for secondary button", () => {
      render(
        <EmptyState
          title="Empty"
          secondaryAction={{ label: "Action", onClick: jest.fn() }}
        />
      );
      const button = screen.getByRole("button", { name: "Action" });
      expect(button).toHaveClass("dark:border-gray-600");
    });
  });

  describe("Integration Scenarios", () => {
    it("should work with all props combined", () => {
      const primaryClick = jest.fn();
      const secondaryClick = jest.fn();

      render(
        <EmptyState
          icon={<ShoppingBag />}
          title="No Products"
          description="Start shopping to see products here"
          action={{ label: "Shop Now", onClick: primaryClick }}
          secondaryAction={{ label: "Learn More", onClick: secondaryClick }}
          className="custom-class"
        />
      );

      expect(screen.getByText("No Products")).toBeInTheDocument();
      expect(
        screen.getByText("Start shopping to see products here")
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "Shop Now" })
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "Learn More" })
      ).toBeInTheDocument();

      fireEvent.click(screen.getByRole("button", { name: "Shop Now" }));
      fireEvent.click(screen.getByRole("button", { name: "Learn More" }));

      expect(primaryClick).toHaveBeenCalledTimes(1);
      expect(secondaryClick).toHaveBeenCalledTimes(1);
    });

    it("should work in loading to empty state transition", () => {
      const { rerender } = render(<div>Loading...</div>);
      rerender(<EmptyState title="No items found" />);
      expect(screen.getByText("No items found")).toBeInTheDocument();
    });
  });
});
