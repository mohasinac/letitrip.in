import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ErrorMessage } from "../ErrorMessage";

// Mock next/navigation
const mockBack = jest.fn();
const mockPush = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    back: mockBack,
    push: mockPush,
  }),
}));

describe("ErrorMessage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("rendering", () => {
    it("renders with default props", () => {
      render(<ErrorMessage message="Something went wrong" />);

      expect(
        screen.getByText("Oops! Something went wrong")
      ).toBeInTheDocument();
      expect(screen.getByText("Something went wrong")).toBeInTheDocument();
    });

    it("renders with custom title", () => {
      render(
        <ErrorMessage title="Custom Error Title" message="Error message" />
      );

      expect(screen.getByText("Custom Error Title")).toBeInTheDocument();
    });

    it("renders custom message", () => {
      render(<ErrorMessage message="Custom error message" />);
      expect(screen.getByText("Custom error message")).toBeInTheDocument();
    });

    it("displays error icon", () => {
      render(<ErrorMessage message="Error" />);
      const icon = screen
        .getByRole("heading", { level: 3 })
        .parentElement?.querySelector("svg");
      expect(icon).toBeInTheDocument();
    });
  });

  describe("retry button", () => {
    it("shows retry button when showRetry is true", () => {
      render(
        <ErrorMessage
          message="Connection error"
          showRetry
          onRetry={jest.fn()}
        />
      );

      expect(screen.getByText("Try Again")).toBeInTheDocument();
    });

    it("hides retry button by default", () => {
      render(<ErrorMessage message="Error" />);
      expect(screen.queryByText("Try Again")).not.toBeInTheDocument();
    });

    it("calls onRetry when retry button is clicked", async () => {
      const user = userEvent.setup();
      const onRetry = jest.fn();

      render(<ErrorMessage message="Error" showRetry onRetry={onRetry} />);

      const retryButton = screen.getByText("Try Again");
      await user.click(retryButton);

      expect(onRetry).toHaveBeenCalledTimes(1);
    });

    it("does not show retry button without onRetry handler", () => {
      render(<ErrorMessage message="Error" showRetry />);
      expect(screen.queryByText("Try Again")).not.toBeInTheDocument();
    });
  });

  describe("go home button", () => {
    it("shows go home button when showGoHome is true", () => {
      render(<ErrorMessage message="Error" showGoHome onGoHome={jest.fn()} />);

      expect(screen.getByText("Go Home")).toBeInTheDocument();
    });

    it("hides go home button by default", () => {
      render(<ErrorMessage message="Error" />);
      expect(screen.queryByText("Go Home")).not.toBeInTheDocument();
    });

    it("calls onGoHome when go home button is clicked", async () => {
      const user = userEvent.setup();
      const onGoHome = jest.fn();

      render(<ErrorMessage message="Error" showGoHome onGoHome={onGoHome} />);

      const homeButton = screen.getByText("Go Home");
      await user.click(homeButton);

      expect(onGoHome).toHaveBeenCalledTimes(1);
    });
  });

  describe("go back button", () => {
    it("shows go back button when showGoBack is true", () => {
      render(<ErrorMessage message="Error" showGoBack onGoBack={jest.fn()} />);

      expect(screen.getByText("Go Back")).toBeInTheDocument();
    });

    it("hides go back button by default", () => {
      render(<ErrorMessage message="Error" />);
      expect(screen.queryByText("Go Back")).not.toBeInTheDocument();
    });

    it("calls onGoBack when go back button is clicked", async () => {
      const user = userEvent.setup();
      const onGoBack = jest.fn();

      render(<ErrorMessage message="Error" showGoBack onGoBack={onGoBack} />);

      const backButton = screen.getByText("Go Back");
      await user.click(backButton);

      expect(onGoBack).toHaveBeenCalledTimes(1);
    });
  });

  describe("multiple action buttons", () => {
    it("shows all action buttons when all props are set", () => {
      render(
        <ErrorMessage
          message="Error"
          showRetry
          showGoHome
          showGoBack
          onRetry={jest.fn()}
          onGoHome={jest.fn()}
          onGoBack={jest.fn()}
        />
      );

      expect(screen.getByText("Try Again")).toBeInTheDocument();
      expect(screen.getByText("Go Home")).toBeInTheDocument();
      expect(screen.getByText("Go Back")).toBeInTheDocument();
    });
  });

  describe("technical details in development", () => {
    const originalEnv = process.env.NODE_ENV;

    afterEach(() => {
      process.env.NODE_ENV = originalEnv;
    });

    it("shows technical details in development", () => {
      process.env.NODE_ENV = "development";
      const error = new Error("Technical error message");

      render(<ErrorMessage message="User-friendly message" error={error} />);

      expect(screen.getByText("Show technical details")).toBeInTheDocument();
    });

    it("hides technical details in production", () => {
      process.env.NODE_ENV = "production";
      const error = new Error("Technical error message");

      render(<ErrorMessage message="User-friendly message" error={error} />);

      expect(
        screen.queryByText("Show technical details")
      ).not.toBeInTheDocument();
    });

    it("displays error message in technical details", () => {
      process.env.NODE_ENV = "development";
      const error = new Error("Detailed error message");

      render(<ErrorMessage message="User-friendly message" error={error} />);

      expect(screen.getByText("Detailed error message")).toBeInTheDocument();
    });

    it("displays error stack in technical details", () => {
      process.env.NODE_ENV = "development";
      const error = new Error("Error with stack");
      error.stack = "Error: Error with stack\n    at line 1\n    at line 2";

      render(<ErrorMessage message="User-friendly message" error={error} />);

      expect(screen.getByText(/at line 1/)).toBeInTheDocument();
    });

    it("does not show technical details when no error is provided", () => {
      process.env.NODE_ENV = "development";

      render(<ErrorMessage message="User-friendly message" />);

      expect(
        screen.queryByText("Show technical details")
      ).not.toBeInTheDocument();
    });
  });

  describe("custom styling", () => {
    it("applies custom className", () => {
      const { container } = render(
        <ErrorMessage message="Error" className="custom-error-class" />
      );

      const errorDiv = container.firstChild;
      expect(errorDiv).toHaveClass("custom-error-class");
    });

    it("merges custom className with default classes", () => {
      const { container } = render(
        <ErrorMessage message="Error" className="custom-class" />
      );

      const errorDiv = container.firstChild;
      expect(errorDiv).toHaveClass("custom-class");
      expect(errorDiv).toHaveClass("flex");
      expect(errorDiv).toHaveClass("flex-col");
    });
  });

  describe("accessibility", () => {
    it("has proper heading hierarchy", () => {
      render(<ErrorMessage message="Error" />);
      expect(screen.getByRole("heading", { level: 3 })).toBeInTheDocument();
    });

    it("retry button is keyboard accessible", async () => {
      const user = userEvent.setup();
      const onRetry = jest.fn();

      render(<ErrorMessage message="Error" showRetry onRetry={onRetry} />);

      const retryButton = screen.getByText("Try Again");
      retryButton.focus();
      await user.keyboard("{Enter}");

      expect(onRetry).toHaveBeenCalled();
    });

    it("all action buttons are keyboard accessible", async () => {
      const user = userEvent.setup();
      const onRetry = jest.fn();
      const onGoHome = jest.fn();
      const onGoBack = jest.fn();

      render(
        <ErrorMessage
          message="Error"
          showRetry
          showGoHome
          showGoBack
          onRetry={onRetry}
          onGoHome={onGoHome}
          onGoBack={onGoBack}
        />
      );

      const buttons = screen.getAllByRole("button");
      expect(buttons).toHaveLength(3);

      for (const button of buttons) {
        expect(button).toBeVisible();
      }
    });
  });
});
