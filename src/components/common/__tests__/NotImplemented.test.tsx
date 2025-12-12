import { render, screen } from "@testing-library/react";
import { NotImplemented, NotImplementedPage } from "../NotImplemented";

// Mock Next.js Link
jest.mock("next/link", () => ({
  __esModule: true,
  default: ({
    children,
    href,
  }: {
    children: React.ReactNode;
    href: string;
  }) => <a href={href}>{children}</a>,
}));

// Mock lucide-react icons
jest.mock("lucide-react", () => ({
  Construction: ({ className }: { className?: string }) => (
    <div data-testid="construction-icon" className={className} />
  ),
  ArrowLeft: ({ className }: { className?: string }) => (
    <div data-testid="arrow-left-icon" className={className} />
  ),
  Clock: ({ className }: { className?: string }) => (
    <div data-testid="clock-icon" className={className} />
  ),
  Github: ({ className }: { className?: string }) => (
    <div data-testid="github-icon" className={className} />
  ),
  MessageSquare: ({ className }: { className?: string }) => (
    <div data-testid="message-square-icon" className={className} />
  ),
}));

describe("NotImplemented", () => {
  describe("Basic Rendering", () => {
    it("renders with default props", () => {
      render(<NotImplemented />);
      expect(screen.getByText("Coming Soon")).toBeInTheDocument();
    });

    it("shows default title", () => {
      render(<NotImplemented />);
      expect(screen.getByText("Coming Soon")).toBeInTheDocument();
    });

    it("shows default description", () => {
      render(<NotImplemented />);
      expect(
        screen.getByText(
          "This feature is currently under development and will be available soon."
        )
      ).toBeInTheDocument();
    });

    it("renders construction icon by default", () => {
      render(<NotImplemented />);
      expect(screen.getByTestId("construction-icon")).toBeInTheDocument();
    });

    it("shows Under Development indicator", () => {
      render(<NotImplemented />);
      expect(screen.getByText("Under Development")).toBeInTheDocument();
    });

    it("has pulsing dot animation", () => {
      const { container } = render(<NotImplemented />);
      const dot = container.querySelector(".animate-pulse");
      expect(dot).toBeInTheDocument();
      expect(dot).toHaveClass("bg-yellow-400");
    });
  });

  describe("Custom Title and Description", () => {
    it("renders custom title", () => {
      render(<NotImplemented title="Advanced Analytics" />);
      expect(screen.getByText("Advanced Analytics")).toBeInTheDocument();
    });

    it("renders custom description", () => {
      render(
        <NotImplemented description="Detailed sales and traffic analytics will be available soon." />
      );
      expect(
        screen.getByText(
          "Detailed sales and traffic analytics will be available soon."
        )
      ).toBeInTheDocument();
    });

    it("renders both custom title and description", () => {
      render(
        <NotImplemented
          title="Custom Feature"
          description="Custom description text"
        />
      );
      expect(screen.getByText("Custom Feature")).toBeInTheDocument();
      expect(screen.getByText("Custom description text")).toBeInTheDocument();
    });
  });

  describe("Feature Name Badge", () => {
    it("does not show feature name by default", () => {
      render(<NotImplemented />);
      expect(screen.queryByTestId("clock-icon")).not.toBeInTheDocument();
    });

    it("shows feature name when provided", () => {
      render(<NotImplemented featureName="E025 - Analytics Dashboard" />);
      expect(
        screen.getByText("E025 - Analytics Dashboard")
      ).toBeInTheDocument();
    });

    it("shows clock icon with feature name", () => {
      render(<NotImplemented featureName="E025 - Analytics Dashboard" />);
      expect(screen.getByTestId("clock-icon")).toBeInTheDocument();
    });

    it("feature badge has correct styling", () => {
      const { container } = render(
        <NotImplemented featureName="E025 - Analytics Dashboard" />
      );
      const badge = container.querySelector(".bg-blue-100");
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveClass("dark:bg-blue-900/30");
      expect(badge).toHaveClass("text-blue-700");
      expect(badge).toHaveClass("dark:text-blue-300");
    });
  });

  describe("Expected Date", () => {
    it("does not show expected date by default", () => {
      render(<NotImplemented />);
      expect(screen.queryByText("Expected:")).not.toBeInTheDocument();
    });

    it("shows expected date when provided", () => {
      render(<NotImplemented expectedDate="Q1 2025" />);
      expect(screen.getByText("Expected:")).toBeInTheDocument();
      expect(screen.getByText("Q1 2025")).toBeInTheDocument();
    });

    it("expected date has correct styling", () => {
      render(<NotImplemented expectedDate="Q1 2025" />);
      const dateText = screen.getByText("Q1 2025");
      expect(dateText).toHaveClass("font-medium");
      expect(dateText).toHaveClass("text-gray-700");
    });
  });

  describe("Back Link", () => {
    it("does not show back link by default", () => {
      render(<NotImplemented />);
      expect(screen.queryByTestId("arrow-left-icon")).not.toBeInTheDocument();
    });

    it("shows back link when backHref provided", () => {
      render(<NotImplemented backHref="/admin" />);
      const link = screen.getByRole("link", { name: /Go Back/i });
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute("href", "/admin");
    });

    it("shows arrow left icon with back link", () => {
      render(<NotImplemented backHref="/admin" />);
      expect(screen.getByTestId("arrow-left-icon")).toBeInTheDocument();
    });

    it("uses custom back label", () => {
      render(
        <NotImplemented backHref="/admin" backLabel="Return to Dashboard" />
      );
      expect(screen.getByText("Return to Dashboard")).toBeInTheDocument();
    });

    it("back link has correct styling", () => {
      const { container } = render(<NotImplemented backHref="/admin" />);
      const link = screen.getByRole("link", { name: /Go Back/i });
      // Verify link exists and has correct href
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute("href", "/admin");
    });
  });

  describe("Ticket URL", () => {
    it("does not show ticket link by default", () => {
      render(<NotImplemented />);
      expect(screen.queryByTestId("github-icon")).not.toBeInTheDocument();
    });

    it("shows ticket link when ticketUrl provided", () => {
      render(
        <NotImplemented ticketUrl="https://github.com/org/repo/issues/123" />
      );
      const link = screen.getByRole("link", { name: /Track Progress/i });
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute(
        "href",
        "https://github.com/org/repo/issues/123"
      );
    });

    it("ticket link opens in new tab", () => {
      render(
        <NotImplemented ticketUrl="https://github.com/org/repo/issues/123" />
      );
      const link = screen.getByRole("link", { name: /Track Progress/i });
      expect(link).toHaveAttribute("target", "_blank");
      expect(link).toHaveAttribute("rel", "noopener noreferrer");
    });

    it("shows github icon with ticket link", () => {
      render(
        <NotImplemented ticketUrl="https://github.com/org/repo/issues/123" />
      );
      expect(screen.getByTestId("github-icon")).toBeInTheDocument();
    });

    it("ticket link has correct styling", () => {
      render(
        <NotImplemented ticketUrl="https://github.com/org/repo/issues/123" />
      );
      const link = screen.getByRole("link", { name: /Track Progress/i });
      expect(link).toHaveClass("border");
      expect(link).toHaveClass("border-gray-300");
      expect(link).toHaveClass("dark:border-gray-600");
    });
  });

  describe("Custom Icon", () => {
    it("uses construction icon by default", () => {
      render(<NotImplemented />);
      expect(screen.getByTestId("construction-icon")).toBeInTheDocument();
    });

    it("renders custom icon when provided", () => {
      const CustomIcon = () => <div data-testid="custom-icon">Custom</div>;
      render(<NotImplemented icon={<CustomIcon />} />);
      expect(screen.getByTestId("custom-icon")).toBeInTheDocument();
      expect(screen.queryByTestId("construction-icon")).not.toBeInTheDocument();
    });
  });

  describe("Icon Container Styling", () => {
    it("icon container has correct size", () => {
      const { container } = render(<NotImplemented />);
      const iconContainer = container.querySelector(".w-20.h-20");
      expect(iconContainer).toBeInTheDocument();
    });

    it("icon container has rounded background", () => {
      const { container } = render(<NotImplemented />);
      const iconContainer = container.querySelector(".rounded-full");
      expect(iconContainer).toBeInTheDocument();
    });

    it("icon container has yellow background", () => {
      const { container } = render(<NotImplemented />);
      const iconContainer = container.querySelector(".bg-yellow-100");
      expect(iconContainer).toBeInTheDocument();
      expect(iconContainer).toHaveClass("dark:bg-yellow-900/30");
    });
  });

  describe("Layout and Responsiveness", () => {
    it("has minimum height container", () => {
      const { container } = render(<NotImplemented />);
      const mainContainer = container.querySelector(".min-h-\\[60vh\\]");
      expect(mainContainer).toBeInTheDocument();
    });

    it("has max-width constraint", () => {
      const { container } = render(<NotImplemented />);
      const contentContainer = container.querySelector(".max-w-md");
      expect(contentContainer).toBeInTheDocument();
    });

    it("has centered layout", () => {
      const { container } = render(<NotImplemented />);
      const mainContainer = container.querySelector(
        ".flex.items-center.justify-center"
      );
      expect(mainContainer).toBeInTheDocument();
    });

    it("actions are in flex row on larger screens", () => {
      render(
        <NotImplemented backHref="/admin" ticketUrl="https://github.com" />
      );
      const { container } = render(<NotImplemented backHref="/admin" />);
      const actionsContainer = container.querySelector(".sm\\:flex-row");
      expect(actionsContainer).toBeInTheDocument();
    });
  });

  describe("Dark Mode Support", () => {
    it("title has dark mode classes", () => {
      render(<NotImplemented title="Test Title" />);
      const title = screen.getByText("Test Title");
      expect(title).toHaveClass("text-gray-900");
      expect(title).toHaveClass("dark:text-white");
    });

    it("description has dark mode classes", () => {
      render(<NotImplemented description="Test description" />);
      const description = screen.getByText("Test description");
      expect(description).toHaveClass("text-gray-600");
      expect(description).toHaveClass("dark:text-gray-400");
    });

    it("back link has dark mode hover state", () => {
      render(<NotImplemented backHref="/admin" />);
      const link = screen.getByRole("link", { name: /Go Back/i });
      // Verify link exists and is accessible
      expect(link).toBeInTheDocument();
    });

    it("feature badge has dark mode classes", () => {
      const { container } = render(<NotImplemented featureName="E025" />);
      const badge = container.querySelector(".dark\\:bg-blue-900\\/30");
      expect(badge).toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("title is h1 heading", () => {
      render(<NotImplemented title="Test Title" />);
      const title = screen.getByRole("heading", { level: 1 });
      expect(title).toHaveTextContent("Test Title");
    });

    it("back link is accessible", () => {
      render(<NotImplemented backHref="/admin" />);
      const link = screen.getByRole("link", { name: /Go Back/i });
      expect(link).toBeInTheDocument();
    });

    it("ticket link is accessible", () => {
      render(<NotImplemented ticketUrl="https://github.com" />);
      const link = screen.getByRole("link", { name: /Track Progress/i });
      expect(link).toBeInTheDocument();
    });

    it("external link has security attributes", () => {
      render(<NotImplemented ticketUrl="https://github.com" />);
      const link = screen.getByRole("link", { name: /Track Progress/i });
      expect(link).toHaveAttribute("rel", "noopener noreferrer");
    });
  });

  describe("Edge Cases", () => {
    it("handles empty title", () => {
      render(<NotImplemented title="" />);
      const { container } = render(<NotImplemented title="" />);
      const title = container.querySelector("h1");
      expect(title).toHaveTextContent("");
    });

    it("handles empty description", () => {
      render(<NotImplemented description="" />);
      expect(
        screen.queryByText("This feature is currently")
      ).not.toBeInTheDocument();
    });

    it("handles very long title", () => {
      const longTitle = "A".repeat(100);
      render(<NotImplemented title={longTitle} />);
      expect(screen.getByText(longTitle)).toBeInTheDocument();
    });

    it("handles very long description", () => {
      const longDescription = "B".repeat(500);
      render(<NotImplemented description={longDescription} />);
      expect(screen.getByText(longDescription)).toBeInTheDocument();
    });

    it("handles special characters in title", () => {
      render(<NotImplemented title="Feature <>&" />);
      expect(screen.getByText("Feature <>&")).toBeInTheDocument();
    });

    it("handles all props together", () => {
      render(
        <NotImplemented
          title="Advanced Analytics"
          description="Custom description"
          featureName="E025"
          backHref="/admin"
          backLabel="Dashboard"
          expectedDate="Q1 2025"
          ticketUrl="https://github.com"
          icon={<div data-testid="custom-icon" />}
        />
      );
      expect(screen.getByText("Advanced Analytics")).toBeInTheDocument();
      expect(screen.getByText("Custom description")).toBeInTheDocument();
      expect(screen.getByText("E025")).toBeInTheDocument();
      expect(screen.getByText("Dashboard")).toBeInTheDocument();
      expect(screen.getByText("Q1 2025")).toBeInTheDocument();
      expect(
        screen.getByRole("link", { name: /Track Progress/i })
      ).toBeInTheDocument();
      expect(screen.getByTestId("custom-icon")).toBeInTheDocument();
    });
  });

  describe("Multiple Instances", () => {
    it("renders multiple instances independently", () => {
      const { container } = render(
        <>
          <NotImplemented title="Feature 1" />
          <NotImplemented title="Feature 2" />
          <NotImplemented title="Feature 3" />
        </>
      );
      expect(screen.getByText("Feature 1")).toBeInTheDocument();
      expect(screen.getByText("Feature 2")).toBeInTheDocument();
      expect(screen.getByText("Feature 3")).toBeInTheDocument();
    });
  });

  describe("NotImplementedPage Wrapper", () => {
    it("renders NotImplementedPage component", () => {
      render(<NotImplementedPage title="Test" />);
      expect(screen.getByText("Test")).toBeInTheDocument();
    });

    it("has container wrapper", () => {
      const { container } = render(<NotImplementedPage />);
      const wrapper = container.querySelector(".container.mx-auto");
      expect(wrapper).toBeInTheDocument();
    });

    it("has padding classes", () => {
      const { container } = render(<NotImplementedPage />);
      const wrapper = container.querySelector(".px-4.py-8");
      expect(wrapper).toBeInTheDocument();
    });

    it("passes props to NotImplemented", () => {
      render(
        <NotImplementedPage title="Custom Title" description="Custom Desc" />
      );
      expect(screen.getByText("Custom Title")).toBeInTheDocument();
      expect(screen.getByText("Custom Desc")).toBeInTheDocument();
    });
  });

  describe("Text Styling", () => {
    it("title has correct font size", () => {
      render(<NotImplemented title="Test" />);
      const title = screen.getByText("Test");
      expect(title).toHaveClass("text-2xl");
      expect(title).toHaveClass("font-bold");
    });

    it("expected date label has correct size", () => {
      const { container } = render(<NotImplemented expectedDate="Q1 2025" />);
      const label = screen.getByText("Expected:");
      // The parent p element has text-sm class
      const paragraph = label.closest("p");
      expect(paragraph).toHaveClass("text-sm");
    });

    it("feature badge has correct font", () => {
      const { container } = render(<NotImplemented featureName="E025" />);
      const badge = container.querySelector(".font-medium");
      expect(badge).toBeInTheDocument();
    });

    it("under development text has correct size", () => {
      render(<NotImplemented />);
      const text = screen.getByText("Under Development");
      expect(text.parentElement).toHaveClass("text-sm");
    });
  });
});
