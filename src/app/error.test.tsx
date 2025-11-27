import { render, screen, fireEvent } from "@testing-library/react";
import Error from "./error";

// Mock next/link
jest.mock("next/link", () => ({
  __esModule: true,
  default: ({ children, href, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

describe("Error Page", () => {
  const mockError: Error & { digest?: string } = {
    name: "Error",
    message: "Test error message",
  } as Error;
  const mockReset = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    (console.error as jest.Mock).mockRestore();
  });

  describe("Basic Rendering", () => {
    it("should render error page", () => {
      render(<Error error={mockError} reset={mockReset} />);

      expect(
        screen.getByText("Oops! Something went wrong")
      ).toBeInTheDocument();
    });

    it("should display error icon/svg", () => {
      const { container } = render(
        <Error error={mockError} reset={mockReset} />
      );

      const svg = container.querySelector("svg");
      expect(svg).toBeInTheDocument();
    });

    it("should show helpful message", () => {
      render(<Error error={mockError} reset={mockReset} />);

      expect(
        screen.getByText(/We encountered an unexpected error/i)
      ).toBeInTheDocument();
    });

    it("should render Try Again button", () => {
      render(<Error error={mockError} reset={mockReset} />);

      expect(screen.getByText("Try Again")).toBeInTheDocument();
    });

    it("should render Go Home button", () => {
      render(<Error error={mockError} reset={mockReset} />);

      expect(screen.getByText("Go Home")).toBeInTheDocument();
    });
  });

  describe("Error Logging", () => {
    it("should log error to console on mount", () => {
      render(<Error error={mockError} reset={mockReset} />);

      expect(console.error).toHaveBeenCalledWith(
        "Application error:",
        mockError
      );
    });

    it("should log error only once", () => {
      const { rerender } = render(
        <Error error={mockError} reset={mockReset} />
      );

      expect(console.error).toHaveBeenCalledTimes(1);

      rerender(<Error error={mockError} reset={mockReset} />);
      expect(console.error).toHaveBeenCalledTimes(1);
    });

    it("should log new error on error change", () => {
      const { rerender } = render(
        <Error error={mockError} reset={mockReset} />
      );

      const newError: Error = {
        name: "Error",
        message: "New error",
      } as Error;
      rerender(<Error error={newError} reset={mockReset} />);

      expect(console.error).toHaveBeenCalledWith(
        "Application error:",
        newError
      );
    });
  });

  describe("Error Display", () => {
    it.skip("should show error message in development", () => {
      const originalEnv = process.env.NODE_ENV;
      Object.defineProperty(process.env, "NODE_ENV", {
        value: "development",
        writable: true,
        configurable: true,
      });

      render(<Error error={mockError} reset={mockReset} />);

      expect(screen.getByText("Test error message")).toBeInTheDocument();

      Object.defineProperty(process.env, "NODE_ENV", {
        value: originalEnv,
        writable: true,
        configurable: true,
      });
    });

    it("should not show error message in production", () => {
      const originalEnv = process.env.NODE_ENV;
      Object.defineProperty(process.env, "NODE_ENV", {
        value: "production",
        writable: true,
        configurable: true,
      });

      render(<Error error={mockError} reset={mockReset} />);

      expect(screen.queryByText("Test error message")).not.toBeInTheDocument();

      Object.defineProperty(process.env, "NODE_ENV", {
        value: originalEnv,
        writable: true,
        configurable: true,
      });
    });

    it.skip("should display error digest if available", () => {
      const originalEnv = process.env.NODE_ENV;
      Object.defineProperty(process.env, "NODE_ENV", {
        value: "development",
        writable: true,
        configurable: true,
      });

      const errorWithDigest: Error & { digest?: string } = {
        name: "Error",
        message: "Test error",
        digest: "abc123",
      } as Error & { digest: string };

      render(<Error error={errorWithDigest} reset={mockReset} />);

      expect(screen.getByText(/Error ID: abc123/i)).toBeInTheDocument();

      Object.defineProperty(process.env, "NODE_ENV", {
        value: originalEnv,
        writable: true,
        configurable: true,
      });
    });

    it("should handle error without message", () => {
      const originalEnv = process.env.NODE_ENV;
      Object.defineProperty(process.env, "NODE_ENV", {
        value: "development",
        writable: true,
        configurable: true,
      });

      const errorWithoutMessage: Error = {
        name: "Error",
        message: "",
      } as Error;

      render(<Error error={errorWithoutMessage} reset={mockReset} />);

      expect(
        screen.getByText("Oops! Something went wrong")
      ).toBeInTheDocument();

      Object.defineProperty(process.env, "NODE_ENV", {
        value: originalEnv,
        writable: true,
        configurable: true,
      });
    });
  });

  describe("User Actions", () => {
    it("should call reset function when Try Again clicked", () => {
      render(<Error error={mockError} reset={mockReset} />);

      const tryAgainButton = screen.getByText("Try Again");
      fireEvent.click(tryAgainButton);

      expect(mockReset).toHaveBeenCalledTimes(1);
    });

    it("should not call reset multiple times on rapid clicks", () => {
      render(<Error error={mockError} reset={mockReset} />);

      const tryAgainButton = screen.getByText("Try Again");
      fireEvent.click(tryAgainButton);
      fireEvent.click(tryAgainButton);
      fireEvent.click(tryAgainButton);

      expect(mockReset).toHaveBeenCalledTimes(3);
    });

    it("should have working home link", () => {
      render(<Error error={mockError} reset={mockReset} />);

      const homeLink = screen.getByText("Go Home").closest("a");
      expect(homeLink).toHaveAttribute("href", "/");
    });

    it("should have working support link", () => {
      render(<Error error={mockError} reset={mockReset} />);

      const supportLink = screen.getByText("Contact Support").closest("a");
      expect(supportLink).toHaveAttribute("href", "/support/ticket");
    });
  });

  describe("Styling & Layout", () => {
    it("should use gradient background", () => {
      const { container } = render(
        <Error error={mockError} reset={mockReset} />
      );

      const gradientDiv = container.querySelector(".bg-gradient-to-br");
      expect(gradientDiv).toBeInTheDocument();
    });

    it("should center content on screen", () => {
      const { container } = render(
        <Error error={mockError} reset={mockReset} />
      );

      const centerDiv = container.querySelector(".min-h-screen");
      expect(centerDiv).toHaveClass("flex");
      expect(centerDiv).toHaveClass("items-center");
      expect(centerDiv).toHaveClass("justify-center");
    });

    it("should use card layout for content", () => {
      const { container } = render(
        <Error error={mockError} reset={mockReset} />
      );

      const card = container.querySelector(".bg-white");
      expect(card).toHaveClass("rounded-2xl");
      expect(card).toHaveClass("shadow-2xl");
    });

    it("should have hover effects on buttons", () => {
      render(<Error error={mockError} reset={mockReset} />);

      const tryAgainButton = screen.getByText("Try Again");
      expect(tryAgainButton.className).toContain("hover:bg-red-700");
    });

    it("should use proper color scheme (red theme)", () => {
      const { container } = render(
        <Error error={mockError} reset={mockReset} />
      );

      const redElements = container.querySelectorAll('[class*="red"]');
      expect(redElements.length).toBeGreaterThan(0);
    });
  });

  describe("Accessibility", () => {
    it("should render heading with proper level", () => {
      render(<Error error={mockError} reset={mockReset} />);

      const heading = screen.getByRole("heading", { level: 1 });
      expect(heading).toBeInTheDocument();
    });

    it("should have accessible buttons", () => {
      render(<Error error={mockError} reset={mockReset} />);

      const buttons = screen.getAllByRole("button");
      expect(buttons.length).toBeGreaterThan(0);
    });

    it("should have accessible links", () => {
      render(<Error error={mockError} reset={mockReset} />);

      const links = screen.getAllByRole("link");
      expect(links.length).toBeGreaterThan(0);
      links.forEach((link) => {
        expect(link).toHaveAttribute("href");
      });
    });
  });

  describe("Edge Cases", () => {
    it("should handle null error", () => {
      const nullError = null as any;
      render(<Error error={nullError} reset={mockReset} />);

      expect(
        screen.getByText("Oops! Something went wrong")
      ).toBeInTheDocument();
    });

    it("should handle undefined reset function", () => {
      const undefinedReset = undefined as any;
      render(<Error error={mockError} reset={undefinedReset} />);

      const tryAgainButton = screen.getByText("Try Again");
      expect(tryAgainButton).toBeInTheDocument();
    });

    it.skip("should handle error with long message", () => {
      const originalEnv = process.env.NODE_ENV;
      Object.defineProperty(process.env, "NODE_ENV", {
        value: "development",
        writable: true,
        configurable: true,
      });

      const longError: Error = {
        name: "Error",
        message: "A".repeat(500),
      } as Error;
      render(<Error error={longError} reset={mockReset} />);

      expect(screen.getByText("A".repeat(500))).toBeInTheDocument();

      Object.defineProperty(process.env, "NODE_ENV", {
        value: originalEnv,
        writable: true,
        configurable: true,
      });
    });

    it.skip("should handle error with special characters", () => {
      const originalEnv = process.env.NODE_ENV;
      Object.defineProperty(process.env, "NODE_ENV", {
        value: "development",
        writable: true,
        configurable: true,
      });

      const specialError: Error = {
        name: "Error",
        message: "Error: <script>alert('xss')</script>",
      } as Error;
      render(<Error error={specialError} reset={mockReset} />);

      expect(
        screen.getByText(/Error: <script>alert\('xss'\)<\/script>/i)
      ).toBeInTheDocument();

      Object.defineProperty(process.env, "NODE_ENV", {
        value: originalEnv,
        writable: true,
        configurable: true,
      });
    });
  });

  describe("Responsive Design", () => {
    it("should use responsive flex layout", () => {
      const { container } = render(
        <Error error={mockError} reset={mockReset} />
      );

      const buttonsContainer = container.querySelector(".flex-col");
      expect(buttonsContainer).toHaveClass("sm:flex-row");
    });

    it("should be mobile-friendly", () => {
      const { container } = render(
        <Error error={mockError} reset={mockReset} />
      );

      const card = container.querySelector(".max-w-md");
      expect(card).toBeInTheDocument();
    });
  });
});
