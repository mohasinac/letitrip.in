import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { PageState } from "../tables/PageState";

describe("PageState", () => {
  describe("PageState.Loading", () => {
    it("renders with default props", () => {
      render(<PageState.Loading />);
      expect(screen.getByText("Loading...")).toBeInTheDocument();
    });

    it("renders custom message", () => {
      render(<PageState.Loading message="Loading products..." />);
      expect(screen.getByText("Loading products...")).toBeInTheDocument();
    });

    it("renders as full page by default", () => {
      const { container } = render(<PageState.Loading />);
      expect(container.querySelector(".min-h-screen")).toBeInTheDocument();
    });

    it("renders inline when fullPage is false", () => {
      const { container } = render(<PageState.Loading fullPage={false} />);
      expect(container.querySelector(".min-h-screen")).not.toBeInTheDocument();
      expect(container.querySelector(".py-12")).toBeInTheDocument();
    });

    it("applies custom className", () => {
      const { container } = render(
        <PageState.Loading className="custom-loading" />
      );
      expect(container.querySelector(".custom-loading")).toBeInTheDocument();
    });

    it("applies custom spinnerClassName", () => {
      const { container } = render(
        <PageState.Loading spinnerClassName="custom-spinner" />
      );
      expect(container.querySelector(".custom-spinner")).toBeInTheDocument();
    });

    it("applies custom messageClassName", () => {
      const { container } = render(
        <PageState.Loading messageClassName="custom-message" />
      );
      expect(container.querySelector(".custom-message")).toBeInTheDocument();
    });

    it("renders custom spinner icon", () => {
      render(
        <PageState.Loading spinnerIcon={<div data-testid="custom-spinner" />} />
      );
      expect(screen.getByTestId("custom-spinner")).toBeInTheDocument();
    });

    it("shows default spinner when spinnerIcon is not provided", () => {
      const { container } = render(<PageState.Loading />);
      const svg = container.querySelector("svg");
      expect(svg).toBeInTheDocument();
      expect(svg).toHaveClass("animate-spin");
    });
  });

  describe("PageState.Error", () => {
    it("renders with default props", () => {
      render(<PageState.Error />);
      expect(screen.getByText("Something went wrong")).toBeInTheDocument();
    });

    it("renders custom error message", () => {
      render(<PageState.Error message="Failed to load data" />);
      expect(screen.getByText("Failed to load data")).toBeInTheDocument();
    });

    it("renders as full page by default", () => {
      const { container } = render(<PageState.Error />);
      expect(container.querySelector(".min-h-screen")).toBeInTheDocument();
    });

    it("renders inline when fullPage is false", () => {
      const { container } = render(<PageState.Error fullPage={false} />);
      expect(container.querySelector(".min-h-screen")).not.toBeInTheDocument();
      expect(container.querySelector(".py-12")).toBeInTheDocument();
    });

    it("renders retry button when onRetry is provided", () => {
      const onRetry = vi.fn();
      render(<PageState.Error onRetry={onRetry} />);
      expect(
        screen.getByRole("button", { name: /retry/i })
      ).toBeInTheDocument();
    });

    it("does not render retry button when onRetry is not provided", () => {
      render(<PageState.Error />);
      expect(
        screen.queryByRole("button", { name: /retry/i })
      ).not.toBeInTheDocument();
    });

    it("calls onRetry when retry button is clicked", async () => {
      const user = userEvent.setup();
      const onRetry = vi.fn();
      render(<PageState.Error onRetry={onRetry} />);

      const retryButton = screen.getByRole("button", { name: /retry/i });
      await user.click(retryButton);

      expect(onRetry).toHaveBeenCalledTimes(1);
    });

    it("renders custom retry label", () => {
      const onRetry = vi.fn();
      render(<PageState.Error onRetry={onRetry} retryLabel="Try Again" />);
      expect(
        screen.getByRole("button", { name: /try again/i })
      ).toBeInTheDocument();
    });

    it("applies custom className", () => {
      const { container } = render(
        <PageState.Error className="custom-error" />
      );
      expect(container.querySelector(".custom-error")).toBeInTheDocument();
    });

    it("applies custom iconClassName", () => {
      const { container } = render(
        <PageState.Error iconClassName="custom-icon" />
      );
      expect(container.querySelector(".custom-icon")).toBeInTheDocument();
    });

    it("applies custom messageClassName", () => {
      const { container } = render(
        <PageState.Error messageClassName="custom-message" />
      );
      expect(container.querySelector(".custom-message")).toBeInTheDocument();
    });

    it("applies custom buttonClassName", () => {
      const onRetry = vi.fn();
      const { container } = render(
        <PageState.Error onRetry={onRetry} buttonClassName="custom-button" />
      );
      expect(container.querySelector(".custom-button")).toBeInTheDocument();
    });

    it("renders custom error icon", () => {
      render(
        <PageState.Error errorIcon={<div data-testid="custom-error-icon" />} />
      );
      expect(screen.getByTestId("custom-error-icon")).toBeInTheDocument();
    });

    it("renders custom retry icon", () => {
      const onRetry = vi.fn();
      render(
        <PageState.Error
          onRetry={onRetry}
          retryIcon={<div data-testid="custom-retry-icon" />}
        />
      );
      expect(screen.getByTestId("custom-retry-icon")).toBeInTheDocument();
    });

    it("shows default error icon when errorIcon is not provided", () => {
      const { container } = render(<PageState.Error />);
      const svg = container.querySelector("svg");
      expect(svg).toBeInTheDocument();
      expect(svg).toHaveClass("h-12");
    });
  });

  describe("PageState.Empty", () => {
    it("renders with default props", () => {
      render(<PageState.Empty />);
      expect(screen.getByText("No data found")).toBeInTheDocument();
    });

    it("renders custom title", () => {
      render(<PageState.Empty title="No products found" />);
      expect(screen.getByText("No products found")).toBeInTheDocument();
    });

    it("renders description when provided", () => {
      render(
        <PageState.Empty
          title="No items"
          description="Try adjusting your filters"
        />
      );
      expect(
        screen.getByText("Try adjusting your filters")
      ).toBeInTheDocument();
    });

    it("does not render description when not provided", () => {
      const { container } = render(<PageState.Empty title="No items" />);
      const paragraphs = container.querySelectorAll("p");
      expect(paragraphs).toHaveLength(0);
    });

    it("renders action button when provided", () => {
      const onClick = vi.fn();
      render(
        <PageState.Empty
          title="No items"
          action={{ label: "Add Item", onClick }}
        />
      );
      expect(
        screen.getByRole("button", { name: /add item/i })
      ).toBeInTheDocument();
    });

    it("does not render action button when not provided", () => {
      render(<PageState.Empty title="No items" />);
      expect(screen.queryByRole("button")).not.toBeInTheDocument();
    });

    it("calls action onClick when button is clicked", async () => {
      const user = userEvent.setup();
      const onClick = vi.fn();
      render(
        <PageState.Empty
          title="No items"
          action={{ label: "Add Item", onClick }}
        />
      );

      const button = screen.getByRole("button", { name: /add item/i });
      await user.click(button);

      expect(onClick).toHaveBeenCalledTimes(1);
    });

    it("renders custom icon when provided", () => {
      render(
        <PageState.Empty
          title="No items"
          icon={<div data-testid="custom-icon" />}
        />
      );
      expect(screen.getByTestId("custom-icon")).toBeInTheDocument();
    });

    it("does not render icon div when icon is not provided", () => {
      const { container } = render(<PageState.Empty title="No items" />);
      // Should only have title h3, no icon div
      const heading = container.querySelector("h3");
      expect(heading?.previousElementSibling).toBeNull();
    });

    it("applies custom className", () => {
      const { container } = render(
        <PageState.Empty title="No items" className="custom-empty" />
      );
      expect(container.querySelector(".custom-empty")).toBeInTheDocument();
    });

    it("applies custom iconClassName", () => {
      const { container } = render(
        <PageState.Empty
          title="No items"
          icon={<span>icon</span>}
          iconClassName="custom-icon"
        />
      );
      expect(container.querySelector(".custom-icon")).toBeInTheDocument();
    });

    it("applies custom titleClassName", () => {
      const { container } = render(
        <PageState.Empty title="No items" titleClassName="custom-title" />
      );
      expect(container.querySelector(".custom-title")).toBeInTheDocument();
    });

    it("applies custom descriptionClassName", () => {
      const { container } = render(
        <PageState.Empty
          title="No items"
          description="Some description"
          descriptionClassName="custom-description"
        />
      );
      expect(
        container.querySelector(".custom-description")
      ).toBeInTheDocument();
    });

    it("applies custom buttonClassName", () => {
      const onClick = vi.fn();
      const { container } = render(
        <PageState.Empty
          title="No items"
          action={{ label: "Add", onClick }}
          buttonClassName="custom-button"
        />
      );
      expect(container.querySelector(".custom-button")).toBeInTheDocument();
    });

    it("renders with all props combined", () => {
      const onClick = vi.fn();
      render(
        <PageState.Empty
          title="No products"
          description="Start by adding your first product"
          action={{ label: "Add Product", onClick }}
          icon={<div data-testid="product-icon" />}
          className="custom-wrapper"
        />
      );

      expect(screen.getByText("No products")).toBeInTheDocument();
      expect(
        screen.getByText("Start by adding your first product")
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /add product/i })
      ).toBeInTheDocument();
      expect(screen.getByTestId("product-icon")).toBeInTheDocument();
    });
  });

  describe("PageState.FullPageWrapper", () => {
    it("renders children", () => {
      render(
        <PageState.FullPageWrapper>
          <div data-testid="child-content">Content</div>
        </PageState.FullPageWrapper>
      );
      expect(screen.getByTestId("child-content")).toBeInTheDocument();
    });

    it("applies full screen styles", () => {
      const { container } = render(
        <PageState.FullPageWrapper>
          <div>Content</div>
        </PageState.FullPageWrapper>
      );
      const wrapper = container.firstChild;
      expect(wrapper).toHaveClass("min-h-screen");
      expect(wrapper).toHaveClass("flex");
      expect(wrapper).toHaveClass("items-center");
      expect(wrapper).toHaveClass("justify-center");
    });

    it("applies custom className", () => {
      const { container } = render(
        <PageState.FullPageWrapper className="custom-wrapper">
          <div>Content</div>
        </PageState.FullPageWrapper>
      );
      expect(container.firstChild).toHaveClass("custom-wrapper");
    });

    it("combines custom className with default classes", () => {
      const { container } = render(
        <PageState.FullPageWrapper className="my-custom-class">
          <div>Content</div>
        </PageState.FullPageWrapper>
      );
      const wrapper = container.firstChild;
      expect(wrapper).toHaveClass("min-h-screen");
      expect(wrapper).toHaveClass("my-custom-class");
    });
  });

  describe("Integration Tests", () => {
    it("can compose Loading with FullPageWrapper", () => {
      const { container } = render(
        <PageState.FullPageWrapper className="custom-bg">
          <PageState.Loading fullPage={false} message="Custom loading" />
        </PageState.FullPageWrapper>
      );
      expect(container.querySelector(".custom-bg")).toBeInTheDocument();
      expect(screen.getByText("Custom loading")).toBeInTheDocument();
    });

    it("can compose Error with FullPageWrapper", () => {
      const onRetry = vi.fn();
      const { container } = render(
        <PageState.FullPageWrapper>
          <PageState.Error
            fullPage={false}
            message="Custom error"
            onRetry={onRetry}
          />
        </PageState.FullPageWrapper>
      );
      expect(container.querySelector(".min-h-screen")).toBeInTheDocument();
      expect(screen.getByText("Custom error")).toBeInTheDocument();
    });

    it("can compose Empty with FullPageWrapper", () => {
      const { container } = render(
        <PageState.FullPageWrapper>
          <PageState.Empty title="Custom empty state" />
        </PageState.FullPageWrapper>
      );
      expect(container.querySelector(".min-h-screen")).toBeInTheDocument();
      expect(screen.getByText("Custom empty state")).toBeInTheDocument();
    });

    it("handles multiple state transitions", async () => {
      const user = userEvent.setup();
      let state: "loading" | "error" | "empty" = "loading";
      const onRetry = vi.fn(() => {
        state = "empty";
      });

      const { rerender } = render(
        state === "loading" ? (
          <PageState.Loading message="Loading data..." />
        ) : state === "error" ? (
          <PageState.Error message="Failed to load" onRetry={onRetry} />
        ) : (
          <PageState.Empty title="No data" />
        )
      );

      // Initial loading state
      expect(screen.getByText("Loading data...")).toBeInTheDocument();

      // Transition to error
      state = "error";
      rerender(<PageState.Error message="Failed to load" onRetry={onRetry} />);
      expect(screen.getByText("Failed to load")).toBeInTheDocument();

      // Click retry
      await user.click(screen.getByRole("button", { name: /retry/i }));
      expect(onRetry).toHaveBeenCalled();

      // Transition to empty
      rerender(<PageState.Empty title="No data" />);
      expect(screen.getByText("No data")).toBeInTheDocument();
    });
  });

  describe("Dark Mode", () => {
    it("applies dark mode classes to Loading", () => {
      const { container } = render(<PageState.Loading />);
      expect(
        container.querySelector(".dark\\:bg-gray-900")
      ).toBeInTheDocument();
      expect(
        container.querySelector(".dark\\:text-gray-400")
      ).toBeInTheDocument();
    });

    it("applies dark mode classes to Error", () => {
      const { container } = render(<PageState.Error />);
      expect(
        container.querySelector(".dark\\:bg-gray-900")
      ).toBeInTheDocument();
      expect(
        container.querySelector(".dark\\:text-gray-400")
      ).toBeInTheDocument();
    });

    it("applies dark mode classes to Empty", () => {
      const { container } = render(
        <PageState.Empty title="No data" description="Some description" />
      );
      expect(container.querySelector(".dark\\:text-white")).toBeInTheDocument();
      expect(
        container.querySelector(".dark\\:text-gray-400")
      ).toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("Loading component has proper text contrast", () => {
      render(<PageState.Loading message="Loading content" />);
      const message = screen.getByText("Loading content");
      expect(message).toHaveClass("text-gray-600");
    });

    it("Error retry button is keyboard accessible", async () => {
      const user = userEvent.setup();
      const onRetry = vi.fn();
      render(<PageState.Error onRetry={onRetry} />);

      const retryButton = screen.getByRole("button", { name: /retry/i });
      retryButton.focus();
      expect(retryButton).toHaveFocus();

      await user.keyboard("{Enter}");
      expect(onRetry).toHaveBeenCalled();
    });

    it("Empty action button is keyboard accessible", async () => {
      const user = userEvent.setup();
      const onClick = vi.fn();
      render(
        <PageState.Empty
          title="No items"
          action={{ label: "Add Item", onClick }}
        />
      );

      const actionButton = screen.getByRole("button", { name: /add item/i });
      actionButton.focus();
      expect(actionButton).toHaveFocus();

      await user.keyboard("{Enter}");
      expect(onClick).toHaveBeenCalled();
    });

    it("Empty has proper heading hierarchy", () => {
      render(<PageState.Empty title="No data found" />);
      const heading = screen.getByText("No data found");
      expect(heading.tagName).toBe("H3");
    });
  });

  describe("Edge Cases", () => {
    it("handles empty strings", () => {
      render(<PageState.Loading message="" />);
      expect(screen.queryByText("Loading...")).not.toBeInTheDocument();
    });

    it("handles very long messages", () => {
      const longMessage = "A".repeat(200);
      render(<PageState.Error message={longMessage} />);
      expect(screen.getByText(longMessage)).toBeInTheDocument();
    });

    it("handles rapid retry clicks", async () => {
      const user = userEvent.setup();
      const onRetry = vi.fn();
      render(<PageState.Error onRetry={onRetry} />);

      const retryButton = screen.getByRole("button", { name: /retry/i });
      await user.tripleClick(retryButton);

      expect(onRetry).toHaveBeenCalledTimes(3);
    });

    it("handles action onClick with no-op", async () => {
      const user = userEvent.setup();
      const onClick = vi.fn();
      render(
        <PageState.Empty
          title="No items"
          action={{ label: "No Action", onClick }}
        />
      );

      const button = screen.getByRole("button");
      await user.click(button);

      expect(onClick).toHaveBeenCalledTimes(1);
    });
  });

  describe("Default Export", () => {
    it("exports PageState as default", async () => {
      const DefaultPageState = (await import("../tables/PageState")).default;
      expect(DefaultPageState).toBeDefined();
      expect(DefaultPageState.Loading).toBeDefined();
      expect(DefaultPageState.Error).toBeDefined();
      expect(DefaultPageState.Empty).toBeDefined();
      expect(DefaultPageState.FullPageWrapper).toBeDefined();
    });
  });
});
