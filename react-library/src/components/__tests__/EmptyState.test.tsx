import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { EmptyState } from "../tables/EmptyState";

describe("EmptyState", () => {
  describe("Rendering", () => {
    it("renders with title only", () => {
      render(<EmptyState title="No items found" />);
      expect(screen.getByText("No items found")).toBeInTheDocument();
    });

    it("renders with title and description", () => {
      render(
        <EmptyState
          title="No results"
          description="Try adjusting your filters"
        />
      );
      expect(screen.getByText("No results")).toBeInTheDocument();
      expect(
        screen.getByText("Try adjusting your filters")
      ).toBeInTheDocument();
    });

    it("renders with custom icon", () => {
      const CustomIcon = () => <span data-testid="custom-icon">🔍</span>;
      render(<EmptyState icon={<CustomIcon />} title="Search results" />);
      expect(screen.getByTestId("custom-icon")).toBeInTheDocument();
    });

    it("does not render icon container when icon is not provided", () => {
      const { container } = render(<EmptyState title="No icon" />);
      const iconContainer = container.querySelector(".rounded-full");
      expect(iconContainer).not.toBeInTheDocument();
    });

    it("does not render description when not provided", () => {
      render(<EmptyState title="Just title" />);
      const description = screen.queryByText(/description/i);
      expect(description).not.toBeInTheDocument();
    });
  });

  describe("Actions", () => {
    it("renders primary action button", () => {
      const handleClick = vi.fn();
      render(
        <EmptyState
          title="Empty"
          action={{ label: "Create New", onClick: handleClick }}
        />
      );
      const button = screen.getByText("Create New");
      expect(button).toBeInTheDocument();
      expect(button).toHaveClass("bg-blue-600");
    });

    it("calls primary action onClick when clicked", () => {
      const handleClick = vi.fn();
      render(
        <EmptyState
          title="Empty"
          action={{ label: "Click me", onClick: handleClick }}
        />
      );
      fireEvent.click(screen.getByText("Click me"));
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it("renders secondary action button", () => {
      const handleClick = vi.fn();
      render(
        <EmptyState
          title="Empty"
          secondaryAction={{ label: "Learn More", onClick: handleClick }}
        />
      );
      const button = screen.getByText("Learn More");
      expect(button).toBeInTheDocument();
      expect(button).toHaveClass("border");
    });

    it("calls secondary action onClick when clicked", () => {
      const handleClick = vi.fn();
      render(
        <EmptyState
          title="Empty"
          secondaryAction={{ label: "Secondary", onClick: handleClick }}
        />
      );
      fireEvent.click(screen.getByText("Secondary"));
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it("renders both primary and secondary actions", () => {
      const primaryClick = vi.fn();
      const secondaryClick = vi.fn();
      render(
        <EmptyState
          title="Empty"
          action={{ label: "Primary", onClick: primaryClick }}
          secondaryAction={{ label: "Secondary", onClick: secondaryClick }}
        />
      );
      expect(screen.getByText("Primary")).toBeInTheDocument();
      expect(screen.getByText("Secondary")).toBeInTheDocument();
    });

    it("does not render action container when no actions provided", () => {
      const { container } = render(<EmptyState title="No actions" />);
      const actionContainer = container.querySelector(
        ".flex.flex-col.sm\\:flex-row"
      );
      expect(actionContainer).not.toBeInTheDocument();
    });
  });

  describe("Custom Styling", () => {
    it("applies custom className to root", () => {
      const { container } = render(
        <EmptyState title="Empty" className="custom-root" />
      );
      const root = container.firstChild;
      expect(root).toHaveClass("custom-root");
    });

    it("preserves default classes with custom className", () => {
      const { container } = render(
        <EmptyState title="Empty" className="custom-class" />
      );
      const root = container.firstChild;
      expect(root).toHaveClass("flex");
      expect(root).toHaveClass("flex-col");
      expect(root).toHaveClass("items-center");
      expect(root).toHaveClass("custom-class");
    });

    it("applies custom iconClassName", () => {
      const { container } = render(
        <EmptyState
          title="Empty"
          icon={<span>Icon</span>}
          iconClassName="custom-icon-class"
        />
      );
      const iconContainer = container.querySelector(".custom-icon-class");
      expect(iconContainer).toBeInTheDocument();
      expect(iconContainer).not.toHaveClass("rounded-full");
    });

    it("applies custom titleClassName", () => {
      render(<EmptyState title="Custom Title" titleClassName="custom-title" />);
      const title = screen.getByText("Custom Title");
      expect(title).toHaveClass("custom-title");
      expect(title).not.toHaveClass("text-xl");
    });

    it("applies custom descriptionClassName", () => {
      render(
        <EmptyState
          title="Title"
          description="Custom description"
          descriptionClassName="custom-desc"
        />
      );
      const description = screen.getByText("Custom description");
      expect(description).toHaveClass("custom-desc");
      expect(description).not.toHaveClass("text-sm");
    });

    it("applies custom actionClassName", () => {
      render(
        <EmptyState
          title="Empty"
          action={{ label: "Action", onClick: vi.fn() }}
          actionClassName="custom-action"
        />
      );
      const button = screen.getByText("Action");
      expect(button).toHaveClass("custom-action");
      expect(button).not.toHaveClass("bg-blue-600");
    });

    it("applies custom secondaryActionClassName", () => {
      render(
        <EmptyState
          title="Empty"
          secondaryAction={{ label: "Secondary", onClick: vi.fn() }}
          secondaryActionClassName="custom-secondary"
        />
      );
      const button = screen.getByText("Secondary");
      expect(button).toHaveClass("custom-secondary");
      expect(button).not.toHaveClass("border");
    });
  });

  describe("Layout", () => {
    it("renders with correct flex layout", () => {
      const { container } = render(<EmptyState title="Layout Test" />);
      const root = container.firstChild;
      expect(root).toHaveClass("flex");
      expect(root).toHaveClass("flex-col");
      expect(root).toHaveClass("items-center");
      expect(root).toHaveClass("justify-center");
    });

    it("applies padding classes", () => {
      const { container } = render(<EmptyState title="Padding Test" />);
      const root = container.firstChild;
      expect(root).toHaveClass("py-16");
      expect(root).toHaveClass("px-4");
    });

    it("applies text-center class", () => {
      const { container } = render(<EmptyState title="Center Test" />);
      const root = container.firstChild;
      expect(root).toHaveClass("text-center");
    });

    it("renders actions in flex row on desktop", () => {
      render(
        <EmptyState
          title="Empty"
          action={{ label: "Primary", onClick: vi.fn() }}
          secondaryAction={{ label: "Secondary", onClick: vi.fn() }}
        />
      );
      const button = screen.getByText("Primary");
      const actionContainer = button.parentElement;
      expect(actionContainer).toHaveClass("sm:flex-row");
    });
  });

  describe("Dark Mode", () => {
    it("includes dark mode classes for icon container", () => {
      const { container } = render(
        <EmptyState title="Dark" icon={<span>Icon</span>} />
      );
      const iconContainer = container.querySelector(".rounded-full");
      expect(iconContainer).toHaveClass("dark:bg-gray-800");
    });

    it("includes dark mode classes for title", () => {
      render(<EmptyState title="Dark Title" />);
      const title = screen.getByText("Dark Title");
      expect(title).toHaveClass("dark:text-white");
    });

    it("includes dark mode classes for description", () => {
      render(<EmptyState title="Title" description="Dark description" />);
      const description = screen.getByText("Dark description");
      expect(description).toHaveClass("dark:text-gray-400");
    });

    it("includes dark mode classes for secondary button", () => {
      render(
        <EmptyState
          title="Empty"
          secondaryAction={{ label: "Secondary", onClick: vi.fn() }}
        />
      );
      const button = screen.getByText("Secondary");
      expect(button).toHaveClass("dark:border-gray-600");
      expect(button).toHaveClass("dark:text-gray-300");
      expect(button).toHaveClass("dark:hover:bg-gray-700");
    });
  });

  describe("Complex Scenarios", () => {
    it("renders complete empty state with all props", () => {
      const Icon = () => <span data-testid="icon">📦</span>;
      const primaryClick = vi.fn();
      const secondaryClick = vi.fn();

      render(
        <EmptyState
          icon={<Icon />}
          title="No Products"
          description="Start adding products to see them here"
          action={{ label: "Add Product", onClick: primaryClick }}
          secondaryAction={{ label: "Learn More", onClick: secondaryClick }}
          className="custom-empty"
        />
      );

      expect(screen.getByTestId("icon")).toBeInTheDocument();
      expect(screen.getByText("No Products")).toBeInTheDocument();
      expect(
        screen.getByText("Start adding products to see them here")
      ).toBeInTheDocument();
      expect(screen.getByText("Add Product")).toBeInTheDocument();
      expect(screen.getByText("Learn More")).toBeInTheDocument();

      fireEvent.click(screen.getByText("Add Product"));
      expect(primaryClick).toHaveBeenCalledTimes(1);

      fireEvent.click(screen.getByText("Learn More"));
      expect(secondaryClick).toHaveBeenCalledTimes(1);
    });

    it("handles multiple clicks on same action", () => {
      const handleClick = vi.fn();
      render(
        <EmptyState
          title="Empty"
          action={{ label: "Click Multiple", onClick: handleClick }}
        />
      );
      const button = screen.getByText("Click Multiple");

      fireEvent.click(button);
      fireEvent.click(button);
      fireEvent.click(button);

      expect(handleClick).toHaveBeenCalledTimes(3);
    });

    it("renders with very long title", () => {
      const longTitle =
        "This is a very long title that should still render properly";
      render(<EmptyState title={longTitle} />);
      expect(screen.getByText(longTitle)).toBeInTheDocument();
    });

    it("renders with very long description", () => {
      const longDescription =
        "This is a very long description that should wrap properly and maintain good readability even with lots of text content that goes on and on.";
      render(<EmptyState title="Title" description={longDescription} />);
      expect(screen.getByText(longDescription)).toBeInTheDocument();
    });

    it("renders with empty string title", () => {
      render(<EmptyState title="" />);
      const { container } = render(<EmptyState title="" />);
      expect(container.querySelector("h3")).toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("uses semantic heading for title", () => {
      render(<EmptyState title="Accessible Title" />);
      const title = screen.getByText("Accessible Title");
      expect(title.tagName).toBe("H3");
    });

    it("uses semantic button elements", () => {
      render(
        <EmptyState
          title="Empty"
          action={{ label: "Button", onClick: vi.fn() }}
        />
      );
      const button = screen.getByText("Button");
      expect(button.tagName).toBe("BUTTON");
    });

    it("description has proper paragraph semantics", () => {
      render(<EmptyState title="Title" description="Description text" />);
      const description = screen.getByText("Description text");
      expect(description.tagName).toBe("P");
    });
  });

  describe("Edge Cases", () => {
    it("handles action with empty label", () => {
      render(
        <EmptyState title="Empty" action={{ label: "", onClick: vi.fn() }} />
      );
      const buttons = screen.getAllByRole("button");
      expect(buttons).toHaveLength(1);
    });

    it("handles null icon gracefully", () => {
      render(<EmptyState title="Test" icon={null} />);
      expect(screen.getByText("Test")).toBeInTheDocument();
    });

    it("handles undefined description gracefully", () => {
      render(<EmptyState title="Test" description={undefined} />);
      expect(screen.getByText("Test")).toBeInTheDocument();
    });
  });
});
