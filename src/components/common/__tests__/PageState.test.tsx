import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PageState } from "../PageState";

describe("PageState Component", () => {
  describe("PageState.Loading", () => {
    // Basic rendering
    describe("Basic Rendering", () => {
      it("renders loading state", () => {
        render(<PageState.Loading />);
        expect(screen.getByText("Loading...")).toBeInTheDocument();
      });

      it("renders spinner icon", () => {
        const { container } = render(<PageState.Loading />);
        const spinner = container.querySelector("svg.lucide");
        expect(spinner).toBeInTheDocument();
      });

      it("spinner has animate-spin class", () => {
        const { container } = render(<PageState.Loading />);
        const spinner = container.querySelector(".animate-spin");
        expect(spinner).toBeInTheDocument();
        expect(spinner).toHaveClass("animate-spin");
      });

      it("has blue color styling", () => {
        const { container } = render(<PageState.Loading />);
        const spinner = container.querySelector(".text-blue-600");
        expect(spinner).toBeInTheDocument();
      });

      it("has dark mode color", () => {
        const { container } = render(<PageState.Loading />);
        const spinner = container.querySelector(".dark\\:text-blue-400");
        expect(spinner).toBeInTheDocument();
      });
    });

    // Full page mode
    describe("Full Page Mode", () => {
      it("renders in full page mode by default", () => {
        const { container } = render(<PageState.Loading />);
        const wrapper = container.querySelector(".min-h-screen");
        expect(wrapper).toBeInTheDocument();
      });

      it("has full page wrapper with centered content", () => {
        const { container } = render(<PageState.Loading />);
        const wrapper = container.querySelector(
          ".min-h-screen.bg-gray-50.flex.items-center.justify-center"
        );
        expect(wrapper).toBeInTheDocument();
      });

      it("has dark mode background for full page", () => {
        const { container } = render(<PageState.Loading />);
        const wrapper = container.querySelector(".dark\\:bg-gray-900");
        expect(wrapper).toBeInTheDocument();
      });
    });

    // Inline mode
    describe("Inline Mode", () => {
      it("renders in inline mode when fullPage is false", () => {
        const { container } = render(<PageState.Loading fullPage={false} />);
        const wrapper = container.querySelector(".min-h-screen");
        expect(wrapper).not.toBeInTheDocument();
      });

      it("has py-12 padding in inline mode", () => {
        const { container } = render(<PageState.Loading fullPage={false} />);
        const wrapper = container.querySelector(".py-12");
        expect(wrapper).toBeInTheDocument();
      });

      it("centers content in inline mode", () => {
        const { container } = render(<PageState.Loading fullPage={false} />);
        const wrapper = container.querySelector(
          ".flex.items-center.justify-center"
        );
        expect(wrapper).toBeInTheDocument();
      });
    });

    // Custom message
    describe("Custom Message", () => {
      it("renders custom loading message", () => {
        render(<PageState.Loading message="Loading products..." />);
        expect(screen.getByText("Loading products...")).toBeInTheDocument();
      });

      it("message has text-sm size", () => {
        render(<PageState.Loading message="Loading..." />);
        const message = screen.getByText("Loading...");
        expect(message).toHaveClass("text-sm");
      });

      it("message has gray text color", () => {
        render(<PageState.Loading />);
        const message = screen.getByText("Loading...");
        expect(message).toHaveClass("text-gray-600", "dark:text-gray-400");
      });

      it("message has mt-2 spacing from icon", () => {
        render(<PageState.Loading />);
        const message = screen.getByText("Loading...");
        expect(message).toHaveClass("mt-2");
      });
    });

    // Custom className
    describe("Custom Styling", () => {
      it("accepts custom className", () => {
        const { container } = render(
          <PageState.Loading className="custom-loading" />
        );
        const content = container.querySelector(".custom-loading");
        expect(content).toBeInTheDocument();
      });

      it("merges custom className with base classes", () => {
        const { container } = render(
          <PageState.Loading className="custom-class" />
        );
        const content = container.querySelector(".text-center.custom-class");
        expect(content).toBeInTheDocument();
      });
    });

    // Icon styling
    describe("Icon Styling", () => {
      it("spinner has h-8 w-8 size", () => {
        const { container } = render(<PageState.Loading />);
        const spinner = container.querySelector(".h-8.w-8");
        expect(spinner).toBeInTheDocument();
      });

      it("spinner is centered with mx-auto", () => {
        const { container } = render(<PageState.Loading />);
        const spinner = container.querySelector(".mx-auto");
        expect(spinner).toBeInTheDocument();
      });
    });
  });

  describe("PageState.Error", () => {
    // Basic rendering
    describe("Basic Rendering", () => {
      it("renders error state", () => {
        render(<PageState.Error />);
        expect(screen.getByText("Something went wrong")).toBeInTheDocument();
      });

      it("renders error icon", () => {
        const { container } = render(<PageState.Error />);
        const icon = container.querySelector("svg.lucide");
        expect(icon).toBeInTheDocument();
      });

      it("error icon has red color", () => {
        const { container } = render(<PageState.Error />);
        const icon = container.querySelector(".text-red-500");
        expect(icon).toBeInTheDocument();
      });

      it("error icon has h-12 w-12 size", () => {
        const { container } = render(<PageState.Error />);
        const icon = container.querySelector(".h-12.w-12");
        expect(icon).toBeInTheDocument();
      });

      it("error icon has bottom margin", () => {
        const { container } = render(<PageState.Error />);
        const icon = container.querySelector(".mb-4");
        expect(icon).toBeInTheDocument();
      });
    });

    // Full page mode
    describe("Full Page Mode", () => {
      it("renders in full page mode by default", () => {
        const { container } = render(<PageState.Error />);
        const wrapper = container.querySelector(".min-h-screen");
        expect(wrapper).toBeInTheDocument();
      });

      it("has centered content in full page mode", () => {
        const { container } = render(<PageState.Error />);
        const wrapper = container.querySelector(
          ".min-h-screen.flex.items-center.justify-center"
        );
        expect(wrapper).toBeInTheDocument();
      });
    });

    // Inline mode
    describe("Inline Mode", () => {
      it("renders in inline mode when fullPage is false", () => {
        const { container } = render(<PageState.Error fullPage={false} />);
        const wrapper = container.querySelector(".min-h-screen");
        expect(wrapper).not.toBeInTheDocument();
      });

      it("has py-12 padding in inline mode", () => {
        const { container } = render(<PageState.Error fullPage={false} />);
        const wrapper = container.querySelector(".py-12");
        expect(wrapper).toBeInTheDocument();
      });
    });

    // Custom message
    describe("Custom Message", () => {
      it("renders custom error message", () => {
        render(<PageState.Error message="Failed to load data" />);
        expect(screen.getByText("Failed to load data")).toBeInTheDocument();
      });

      it("message has text-lg size", () => {
        render(<PageState.Error message="Error!" />);
        const message = screen.getByText("Error!");
        expect(message).toHaveClass("text-lg");
      });

      it("message has gray text color", () => {
        render(<PageState.Error />);
        const message = screen.getByText("Something went wrong");
        expect(message).toHaveClass("text-gray-600", "dark:text-gray-400");
      });

      it("message has mb-4 spacing", () => {
        render(<PageState.Error />);
        const message = screen.getByText("Something went wrong");
        expect(message).toHaveClass("mb-4");
      });
    });

    // Retry functionality
    describe("Retry Functionality", () => {
      it("does not render retry button when onRetry is not provided", () => {
        render(<PageState.Error />);
        expect(
          screen.queryByRole("button", { name: /retry/i })
        ).not.toBeInTheDocument();
      });

      it("renders retry button when onRetry is provided", () => {
        const mockRetry = jest.fn();
        render(<PageState.Error onRetry={mockRetry} />);
        expect(
          screen.getByRole("button", { name: /retry/i })
        ).toBeInTheDocument();
      });

      it("calls onRetry when retry button is clicked", async () => {
        const mockRetry = jest.fn();
        const user = userEvent.setup();

        render(<PageState.Error onRetry={mockRetry} />);

        const retryButton = screen.getByRole("button", { name: /retry/i });
        await user.click(retryButton);

        expect(mockRetry).toHaveBeenCalledTimes(1);
      });

      it("retry button has RefreshCw icon", () => {
        const { container } = render(<PageState.Error onRetry={jest.fn()} />);
        const icon = container.querySelector(".lucide-refresh-cw");
        expect(icon).toBeInTheDocument();
      });

      it("retry button has blue background", () => {
        render(<PageState.Error onRetry={jest.fn()} />);
        const button = screen.getByRole("button", { name: /retry/i });
        expect(button).toHaveClass("bg-blue-600");
      });

      it("retry button has hover state", () => {
        render(<PageState.Error onRetry={jest.fn()} />);
        const button = screen.getByRole("button", { name: /retry/i });
        expect(button).toHaveClass("hover:bg-blue-700");
      });

      it("retry button has icon and text", () => {
        const { container } = render(<PageState.Error onRetry={jest.fn()} />);
        expect(screen.getByText("Retry")).toBeInTheDocument();
        expect(
          container.querySelector(".lucide-refresh-cw")
        ).toBeInTheDocument();
      });

      it("retry button icon has h-4 w-4 size", () => {
        const { container } = render(<PageState.Error onRetry={jest.fn()} />);
        const icon = container.querySelector(".lucide-refresh-cw");
        expect(icon).toHaveClass("h-4", "w-4");
      });
    });

    // Custom className
    describe("Custom Styling", () => {
      it("accepts custom className", () => {
        const { container } = render(
          <PageState.Error className="custom-error" />
        );
        const content = container.querySelector(".custom-error");
        expect(content).toBeInTheDocument();
      });
    });
  });

  describe("PageState.Empty", () => {
    // Basic rendering
    describe("Basic Rendering", () => {
      it("renders empty state", () => {
        render(<PageState.Empty />);
        expect(screen.getByText("No data found")).toBeInTheDocument();
      });

      it("has text-center styling", () => {
        const { container } = render(<PageState.Empty />);
        const content = container.querySelector(".text-center");
        expect(content).toBeInTheDocument();
      });

      it("has py-12 padding", () => {
        const { container } = render(<PageState.Empty />);
        const content = container.querySelector(".py-12");
        expect(content).toBeInTheDocument();
      });
    });

    // Title
    describe("Title", () => {
      it("renders default title", () => {
        render(<PageState.Empty />);
        expect(screen.getByText("No data found")).toBeInTheDocument();
      });

      it("renders custom title", () => {
        render(<PageState.Empty title="No products available" />);
        expect(screen.getByText("No products available")).toBeInTheDocument();
      });

      it("title has text-lg size", () => {
        render(<PageState.Empty title="Custom title" />);
        const title = screen.getByText("Custom title");
        expect(title).toHaveClass("text-lg");
      });

      it("title has font-medium weight", () => {
        render(<PageState.Empty />);
        const title = screen.getByText("No data found");
        expect(title).toHaveClass("font-medium");
      });

      it("title has dark/light color", () => {
        render(<PageState.Empty />);
        const title = screen.getByText("No data found");
        expect(title).toHaveClass("text-gray-900", "dark:text-white");
      });

      it("title has mb-2 spacing", () => {
        render(<PageState.Empty />);
        const title = screen.getByText("No data found");
        expect(title).toHaveClass("mb-2");
      });

      it("title is h3 element", () => {
        render(<PageState.Empty />);
        const title = screen.getByRole("heading", { level: 3 });
        expect(title).toHaveTextContent("No data found");
      });
    });

    // Description
    describe("Description", () => {
      it("does not render description when not provided", () => {
        const { container } = render(<PageState.Empty />);
        const descriptions = container.querySelectorAll("p");
        expect(descriptions).toHaveLength(0);
      });

      it("renders description when provided", () => {
        render(<PageState.Empty description="Try adjusting your filters" />);
        expect(
          screen.getByText("Try adjusting your filters")
        ).toBeInTheDocument();
      });

      it("description has gray color", () => {
        render(<PageState.Empty description="Test description" />);
        const desc = screen.getByText("Test description");
        expect(desc).toHaveClass("text-gray-500", "dark:text-gray-400");
      });

      it("description has mb-4 spacing", () => {
        render(<PageState.Empty description="Test description" />);
        const desc = screen.getByText("Test description");
        expect(desc).toHaveClass("mb-4");
      });
    });

    // Icon
    describe("Icon", () => {
      it("does not render icon when not provided", () => {
        const { container } = render(<PageState.Empty />);
        const iconWrapper = container.querySelector(".mb-4");
        expect(iconWrapper).not.toBeInTheDocument();
      });

      it("renders custom icon when provided", () => {
        const CustomIcon = <div data-testid="custom-icon">Icon</div>;
        render(<PageState.Empty icon={CustomIcon} />);
        expect(screen.getByTestId("custom-icon")).toBeInTheDocument();
      });

      it("icon has mb-4 spacing", () => {
        const CustomIcon = <div>Icon</div>;
        const { container } = render(<PageState.Empty icon={CustomIcon} />);
        const iconWrapper = container.querySelector(".mb-4");
        expect(iconWrapper).toBeInTheDocument();
      });
    });

    // Action button
    describe("Action Button", () => {
      it("does not render action button when not provided", () => {
        render(<PageState.Empty />);
        expect(screen.queryByRole("button")).not.toBeInTheDocument();
      });

      it("renders action button when provided", () => {
        const action = { label: "Add Product", onClick: jest.fn() };
        render(<PageState.Empty action={action} />);
        expect(
          screen.getByRole("button", { name: "Add Product" })
        ).toBeInTheDocument();
      });

      it("calls onClick when action button is clicked", async () => {
        const mockOnClick = jest.fn();
        const action = { label: "Add Product", onClick: mockOnClick };
        const user = userEvent.setup();

        render(<PageState.Empty action={action} />);

        const button = screen.getByRole("button", { name: "Add Product" });
        await user.click(button);

        expect(mockOnClick).toHaveBeenCalledTimes(1);
      });

      it("action button has blue background", () => {
        const action = { label: "Add", onClick: jest.fn() };
        render(<PageState.Empty action={action} />);
        const button = screen.getByRole("button", { name: "Add" });
        expect(button).toHaveClass("bg-blue-600");
      });

      it("action button has hover state", () => {
        const action = { label: "Add", onClick: jest.fn() };
        render(<PageState.Empty action={action} />);
        const button = screen.getByRole("button", { name: "Add" });
        expect(button).toHaveClass("hover:bg-blue-700");
      });

      it("action button has rounded corners", () => {
        const action = { label: "Add", onClick: jest.fn() };
        render(<PageState.Empty action={action} />);
        const button = screen.getByRole("button", { name: "Add" });
        expect(button).toHaveClass("rounded-lg");
      });
    });

    // Custom className
    describe("Custom Styling", () => {
      it("accepts custom className", () => {
        const { container } = render(
          <PageState.Empty className="custom-empty" />
        );
        const content = container.querySelector(".custom-empty");
        expect(content).toBeInTheDocument();
      });

      it("merges custom className with base classes", () => {
        const { container } = render(
          <PageState.Empty className="custom-class" />
        );
        const content = container.querySelector(
          ".text-center.py-12.custom-class"
        );
        expect(content).toBeInTheDocument();
      });
    });
  });

  describe("PageState.FullPageWrapper", () => {
    it("renders children", () => {
      render(
        <PageState.FullPageWrapper>
          <div>Test content</div>
        </PageState.FullPageWrapper>
      );
      expect(screen.getByText("Test content")).toBeInTheDocument();
    });

    it("has min-h-screen class", () => {
      const { container } = render(
        <PageState.FullPageWrapper>Content</PageState.FullPageWrapper>
      );
      const wrapper = container.querySelector(".min-h-screen");
      expect(wrapper).toBeInTheDocument();
    });

    it("has bg-gray-50 background", () => {
      const { container } = render(
        <PageState.FullPageWrapper>Content</PageState.FullPageWrapper>
      );
      const wrapper = container.querySelector(".bg-gray-50");
      expect(wrapper).toBeInTheDocument();
    });

    it("has dark mode background", () => {
      const { container } = render(
        <PageState.FullPageWrapper>Content</PageState.FullPageWrapper>
      );
      const wrapper = container.querySelector(".dark\\:bg-gray-900");
      expect(wrapper).toBeInTheDocument();
    });

    it("centers content", () => {
      const { container } = render(
        <PageState.FullPageWrapper>Content</PageState.FullPageWrapper>
      );
      const wrapper = container.querySelector(
        ".flex.items-center.justify-center"
      );
      expect(wrapper).toBeInTheDocument();
    });

    it("accepts custom className", () => {
      const { container } = render(
        <PageState.FullPageWrapper className="custom-wrapper">
          Content
        </PageState.FullPageWrapper>
      );
      const wrapper = container.querySelector(".custom-wrapper");
      expect(wrapper).toBeInTheDocument();
    });
  });

  // Integration tests
  describe("Integration", () => {
    it("can switch between loading and error states", () => {
      const { rerender } = render(<PageState.Loading />);
      expect(screen.getByText("Loading...")).toBeInTheDocument();

      rerender(<PageState.Error message="Failed!" />);
      expect(screen.getByText("Failed!")).toBeInTheDocument();
    });

    it("can switch between loading and empty states", () => {
      const { rerender } = render(<PageState.Loading />);
      expect(screen.getByText("Loading...")).toBeInTheDocument();

      rerender(<PageState.Empty title="No items" />);
      expect(screen.getByText("No items")).toBeInTheDocument();
    });

    it("can render complete empty state with all props", () => {
      const Icon = <div data-testid="icon">📦</div>;
      const action = { label: "Add Item", onClick: jest.fn() };

      render(
        <PageState.Empty
          title="No items yet"
          description="Get started by adding your first item"
          icon={Icon}
          action={action}
        />
      );

      expect(screen.getByText("No items yet")).toBeInTheDocument();
      expect(
        screen.getByText("Get started by adding your first item")
      ).toBeInTheDocument();
      expect(screen.getByTestId("icon")).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "Add Item" })
      ).toBeInTheDocument();
    });

    it("can use inline mode for all states", () => {
      const { container, rerender } = render(
        <PageState.Loading fullPage={false} />
      );
      expect(container.querySelector(".min-h-screen")).not.toBeInTheDocument();

      rerender(<PageState.Error fullPage={false} />);
      expect(container.querySelector(".min-h-screen")).not.toBeInTheDocument();
    });
  });

  // Accessibility
  describe("Accessibility", () => {
    it("retry button is keyboard accessible", async () => {
      const mockRetry = jest.fn();
      const user = userEvent.setup();

      render(<PageState.Error onRetry={mockRetry} />);

      const button = screen.getByRole("button", { name: /retry/i });
      button.focus();
      await user.keyboard("{Enter}");

      expect(mockRetry).toHaveBeenCalled();
    });

    it("action button is keyboard accessible", async () => {
      const mockAction = jest.fn();
      const user = userEvent.setup();

      render(
        <PageState.Empty action={{ label: "Add", onClick: mockAction }} />
      );

      const button = screen.getByRole("button", { name: "Add" });
      button.focus();
      await user.keyboard("{Enter}");

      expect(mockAction).toHaveBeenCalled();
    });

    it("empty state title is properly structured as heading", () => {
      render(<PageState.Empty title="Test Title" />);
      const heading = screen.getByRole("heading", { level: 3 });
      expect(heading).toHaveTextContent("Test Title");
    });
  });
});
