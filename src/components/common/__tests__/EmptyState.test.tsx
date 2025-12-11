/**
 * @jest-environment jsdom
 *
 * EmptyState Component Tests
 * Tests empty state display, actions, and predefined scenarios
 */

import { fireEvent, render, screen } from "@testing-library/react";
import { ShoppingBag } from "lucide-react";
import { EmptyState, EmptyStates } from "../EmptyState";

describe("EmptyState Component", () => {
  const defaultProps = {
    title: "No items found",
    description: "Try adjusting your filters",
  };

  describe("Basic Rendering", () => {
    it("should render without crashing", () => {
      render(<EmptyState {...defaultProps} />);
      expect(screen.getByText("No items found")).toBeInTheDocument();
    });

    it("should display title", () => {
      render(<EmptyState title="Custom Title" />);
      expect(screen.getByText("Custom Title")).toBeInTheDocument();
    });

    it("should display description when provided", () => {
      render(<EmptyState title="Title" description="Custom description" />);
      expect(screen.getByText("Custom description")).toBeInTheDocument();
    });

    it("should not render description when not provided", () => {
      render(<EmptyState title="Title" />);
      const paragraphs = screen.queryAllByText(/./);
      expect(
        paragraphs.some(
          (p) => p.tagName === "P" && p.textContent?.includes("description")
        )
      ).toBe(false);
    });

    it("should render icon when provided", () => {
      const { container } = render(
        <EmptyState
          {...defaultProps}
          icon={<ShoppingBag data-testid="icon" />}
        />
      );
      expect(screen.getByTestId("icon")).toBeInTheDocument();
    });

    it("should not render icon container when icon not provided", () => {
      const { container } = render(<EmptyState {...defaultProps} />);
      const iconContainer = container.querySelector(
        ".rounded-full.bg-gray-100"
      );
      expect(iconContainer).not.toBeInTheDocument();
    });
  });

  describe("Action Buttons", () => {
    it("should render primary action button", () => {
      const action = { label: "Add Product", onClick: jest.fn() };
      render(<EmptyState {...defaultProps} action={action} />);
      expect(screen.getByText("Add Product")).toBeInTheDocument();
    });

    it("should call onClick when primary action clicked", () => {
      const onClick = jest.fn();
      const action = { label: "Add Product", onClick };
      render(<EmptyState {...defaultProps} action={action} />);

      fireEvent.click(screen.getByText("Add Product"));
      expect(onClick).toHaveBeenCalledTimes(1);
    });

    it("should render secondary action button", () => {
      const secondaryAction = { label: "Browse Catalog", onClick: jest.fn() };
      render(
        <EmptyState {...defaultProps} secondaryAction={secondaryAction} />
      );
      expect(screen.getByText("Browse Catalog")).toBeInTheDocument();
    });

    it("should call onClick when secondary action clicked", () => {
      const onClick = jest.fn();
      const secondaryAction = { label: "Browse", onClick };
      render(
        <EmptyState {...defaultProps} secondaryAction={secondaryAction} />
      );

      fireEvent.click(screen.getByText("Browse"));
      expect(onClick).toHaveBeenCalledTimes(1);
    });

    it("should render both action buttons", () => {
      const action = { label: "Primary", onClick: jest.fn() };
      const secondaryAction = { label: "Secondary", onClick: jest.fn() };
      render(
        <EmptyState
          {...defaultProps}
          action={action}
          secondaryAction={secondaryAction}
        />
      );

      expect(screen.getByText("Primary")).toBeInTheDocument();
      expect(screen.getByText("Secondary")).toBeInTheDocument();
    });

    it("should not render actions container when no actions provided", () => {
      const { container } = render(<EmptyState {...defaultProps} />);
      const buttons = container.querySelectorAll("button");
      expect(buttons.length).toBe(0);
    });

    it("should handle multiple clicks on action", () => {
      const onClick = jest.fn();
      const action = { label: "Click Me", onClick };
      render(<EmptyState {...defaultProps} action={action} />);

      const button = screen.getByText("Click Me");
      fireEvent.click(button);
      fireEvent.click(button);
      fireEvent.click(button);

      expect(onClick).toHaveBeenCalledTimes(3);
    });
  });

  describe("Custom Styling", () => {
    it("should apply custom className", () => {
      const { container } = render(
        <EmptyState {...defaultProps} className="custom-class" />
      );
      expect(container.firstChild).toHaveClass("custom-class");
    });

    it("should combine custom className with default classes", () => {
      const { container } = render(
        <EmptyState {...defaultProps} className="custom-class" />
      );
      const element = container.firstChild as HTMLElement;
      expect(element).toHaveClass("custom-class", "flex", "flex-col");
    });

    it("should maintain default classes when no custom className", () => {
      const { container } = render(<EmptyState {...defaultProps} />);
      const element = container.firstChild as HTMLElement;
      expect(element).toHaveClass("flex", "flex-col", "items-center");
    });
  });

  describe("Layout Structure", () => {
    it("should center content", () => {
      const { container } = render(<EmptyState {...defaultProps} />);
      const element = container.firstChild as HTMLElement;
      expect(element).toHaveClass("items-center", "justify-center");
    });

    it("should have proper text alignment", () => {
      const { container } = render(<EmptyState {...defaultProps} />);
      const element = container.firstChild as HTMLElement;
      expect(element).toHaveClass("text-center");
    });

    it("should have padding", () => {
      const { container } = render(<EmptyState {...defaultProps} />);
      const element = container.firstChild as HTMLElement;
      expect(element).toHaveClass("py-16", "px-4");
    });

    it("should render title as h3", () => {
      render(<EmptyState {...defaultProps} />);
      const title = screen.getByText("No items found");
      expect(title.tagName).toBe("H3");
    });

    it("should render description as paragraph", () => {
      render(<EmptyState {...defaultProps} />);
      const desc = screen.getByText("Try adjusting your filters");
      expect(desc.tagName).toBe("P");
    });
  });

  describe("Dark Mode Support", () => {
    it("should have dark mode classes for title", () => {
      render(<EmptyState {...defaultProps} />);
      const title = screen.getByText("No items found");
      expect(title.className).toContain("dark:text-white");
    });

    it("should have dark mode classes for description", () => {
      render(<EmptyState {...defaultProps} />);
      const desc = screen.getByText("Try adjusting your filters");
      expect(desc.className).toContain("dark:text-gray-400");
    });

    it("should have dark mode classes for icon container", () => {
      const { container } = render(
        <EmptyState {...defaultProps} icon={<ShoppingBag />} />
      );
      const iconContainer = container.querySelector(".rounded-full");
      expect(iconContainer?.className).toContain("dark:bg-gray-800");
    });

    it("should have dark mode classes for secondary action", () => {
      const secondaryAction = { label: "Browse", onClick: jest.fn() };
      render(
        <EmptyState {...defaultProps} secondaryAction={secondaryAction} />
      );
      const button = screen.getByText("Browse");
      expect(button.className).toContain("dark:text-gray-300");
    });
  });

  describe("Predefined Empty States", () => {
    it("should render NoProducts empty state", () => {
      render(<EmptyStates.NoProducts />);
      expect(screen.getByText("No products found")).toBeInTheDocument();
      expect(
        screen.getByText(/couldn't find any products/)
      ).toBeInTheDocument();
    });

    it("should render EmptyCart empty state", () => {
      render(<EmptyStates.EmptyCart />);
      expect(screen.getByText("Your cart is empty")).toBeInTheDocument();
      expect(screen.getByText(/Start adding products/)).toBeInTheDocument();
    });

    it("should render EmptyWishlist empty state", () => {
      render(<EmptyStates.EmptyWishlist />);
      expect(screen.getByText("No items in wishlist")).toBeInTheDocument();
    });

    it("should render NoBids empty state", () => {
      render(<EmptyStates.NoBids />);
      expect(screen.getByText("No bids yet")).toBeInTheDocument();
    });

    it("should render NoOrders empty state", () => {
      render(<EmptyStates.NoOrders />);
      expect(screen.getByText("No orders found")).toBeInTheDocument();
    });

    it("should render NoSearchResults empty state", () => {
      render(<EmptyStates.NoSearchResults />);
      expect(screen.getByText("No results found")).toBeInTheDocument();
    });

    it("should render NoShops empty state", () => {
      render(<EmptyStates.NoShops />);
      expect(screen.getByText("No shops found")).toBeInTheDocument();
    });

    it("should render NoNotifications empty state", () => {
      render(<EmptyStates.NoNotifications />);
      expect(screen.getByText("No notifications")).toBeInTheDocument();
    });

    it("should allow overriding predefined state props", () => {
      const customAction = { label: "Custom Action", onClick: jest.fn() };
      render(<EmptyStates.NoProducts action={customAction} />);
      expect(screen.getByText("Custom Action")).toBeInTheDocument();
    });

    it("should allow overriding predefined state title", () => {
      render(<EmptyStates.NoProducts title="Custom Title" />);
      expect(screen.getByText("Custom Title")).toBeInTheDocument();
      expect(screen.queryByText("No products found")).not.toBeInTheDocument();
    });
  });

  describe("Button Styling", () => {
    it("should style primary action as blue button", () => {
      const action = { label: "Primary", onClick: jest.fn() };
      render(<EmptyState {...defaultProps} action={action} />);
      const button = screen.getByText("Primary");
      expect(button).toHaveClass("bg-blue-600", "text-white");
    });

    it("should style secondary action with border", () => {
      const secondaryAction = { label: "Secondary", onClick: jest.fn() };
      render(
        <EmptyState {...defaultProps} secondaryAction={secondaryAction} />
      );
      const button = screen.getByText("Secondary");
      expect(button).toHaveClass("border", "border-gray-300");
    });

    it("should have hover styles on primary action", () => {
      const action = { label: "Primary", onClick: jest.fn() };
      render(<EmptyState {...defaultProps} action={action} />);
      const button = screen.getByText("Primary");
      expect(button.className).toContain("hover:bg-blue-700");
    });

    it("should have hover styles on secondary action", () => {
      const secondaryAction = { label: "Secondary", onClick: jest.fn() };
      render(
        <EmptyState {...defaultProps} secondaryAction={secondaryAction} />
      );
      const button = screen.getByText("Secondary");
      expect(button.className).toContain("hover:bg-gray-50");
    });

    it("should have transition classes on buttons", () => {
      const action = { label: "Action", onClick: jest.fn() };
      render(<EmptyState {...defaultProps} action={action} />);
      const button = screen.getByText("Action");
      expect(button).toHaveClass("transition-colors");
    });
  });

  describe("Responsive Layout", () => {
    it("should stack actions on mobile", () => {
      const action = { label: "Primary", onClick: jest.fn() };
      const secondaryAction = { label: "Secondary", onClick: jest.fn() };
      const { container } = render(
        <EmptyState
          {...defaultProps}
          action={action}
          secondaryAction={secondaryAction}
        />
      );
      const actionsContainer = container.querySelector(
        ".flex.flex-col.sm\\:flex-row"
      );
      expect(actionsContainer).toBeInTheDocument();
    });

    it("should have gap between actions", () => {
      const action = { label: "Primary", onClick: jest.fn() };
      const secondaryAction = { label: "Secondary", onClick: jest.fn() };
      const { container } = render(
        <EmptyState
          {...defaultProps}
          action={action}
          secondaryAction={secondaryAction}
        />
      );
      const actionsContainer = container.querySelector(".gap-3");
      expect(actionsContainer).toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("should have semantic heading for title", () => {
      render(<EmptyState {...defaultProps} />);
      const heading = screen.getByRole("heading", { level: 3 });
      expect(heading).toHaveTextContent("No items found");
    });

    it("should have button role for actions", () => {
      const action = { label: "Click Me", onClick: jest.fn() };
      render(<EmptyState {...defaultProps} action={action} />);
      expect(
        screen.getByRole("button", { name: "Click Me" })
      ).toBeInTheDocument();
    });

    it("should be keyboard accessible", () => {
      const onClick = jest.fn();
      const action = { label: "Click Me", onClick };
      render(<EmptyState {...defaultProps} action={action} />);

      const button = screen.getByText("Click Me");
      button.focus();
      expect(document.activeElement).toBe(button);
    });

    it("should have accessible icon container", () => {
      const { container } = render(
        <EmptyState
          {...defaultProps}
          icon={<ShoppingBag aria-label="Shopping bag icon" />}
        />
      );
      expect(screen.getByLabelText("Shopping bag icon")).toBeInTheDocument();
    });
  });

  describe("Edge Cases", () => {
    it("should handle very long title", () => {
      const longTitle =
        "This is a very long title that might wrap to multiple lines in the empty state";
      render(<EmptyState title={longTitle} />);
      expect(screen.getByText(longTitle)).toBeInTheDocument();
    });

    it("should handle very long description", () => {
      const longDesc =
        "This is a very long description that contains a lot of text and should be properly displayed in the empty state component without breaking the layout or causing overflow issues.";
      render(<EmptyState title="Title" description={longDesc} />);
      expect(screen.getByText(longDesc)).toBeInTheDocument();
    });

    it("should handle empty title", () => {
      render(<EmptyState title="" />);
      const heading = screen.getByRole("heading");
      expect(heading).toBeInTheDocument();
      expect(heading.textContent).toBe("");
    });

    it("should handle undefined description gracefully", () => {
      render(<EmptyState title="Title" description={undefined} />);
      expect(screen.getByText("Title")).toBeInTheDocument();
    });

    it("should handle action with empty label", () => {
      const action = { label: "", onClick: jest.fn() };
      render(<EmptyState {...defaultProps} action={action} />);
      const buttons = screen.getAllByRole("button");
      expect(buttons.length).toBeGreaterThan(0);
    });

    it("should handle custom icon as component", () => {
      const CustomIcon = () => <div data-testid="custom-icon">Custom</div>;
      render(<EmptyState {...defaultProps} icon={<CustomIcon />} />);
      expect(screen.getByTestId("custom-icon")).toBeInTheDocument();
    });

    it("should not crash with null icon", () => {
      render(<EmptyState {...defaultProps} icon={null} />);
      expect(screen.getByText("No items found")).toBeInTheDocument();
    });

    it("should handle rapid clicks on action button", () => {
      const onClick = jest.fn();
      const action = { label: "Rapid", onClick };
      render(<EmptyState {...defaultProps} action={action} />);

      const button = screen.getByText("Rapid");
      for (let i = 0; i < 10; i++) {
        fireEvent.click(button);
      }

      expect(onClick).toHaveBeenCalledTimes(10);
    });
  });
});

// BUG FIX #45: EmptyState Component Issues
// ISSUE 1: No max-width constraint on description - can overflow on wide screens
// ISSUE 2: Icon prop accepts any ReactNode but no size/style guidance for custom icons
// ISSUE 3: Action buttons missing aria-label when label might not be descriptive
// ISSUE 4: No loading state support for async actions (e.g., redirecting)
// ISSUE 5: Hardcoded blue color for primary action - not themeable
// ISSUE 6: Description max-w-md might cut off important text on narrow screens
// ISSUE 7: No animation/fade-in when component appears
// ISSUE 8: Icon container background colors hardcoded instead of using theme
// ISSUE 9: Buttons don't disable during action execution - can double-submit
// ISSUE 10: Predefined states use hardcoded icons - can't customize icon size
