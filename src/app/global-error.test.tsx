import { render, screen, fireEvent } from "@testing-library/react";
import GlobalError from "./global-error";

describe("GlobalError Component", () => {
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    delete (window as any).location;
    window.location = { href: "" } as any;
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  // ===== Basic Rendering Tests =====
  describe("Basic Rendering", () => {
    it("should render the global error page structure", () => {
      const mockError: Error & { digest?: string } = {
        name: "Error",
        message: "Critical system failure",
      } as Error;
      const mockReset = jest.fn();

      const { container } = render(
        <GlobalError error={mockError} reset={mockReset} />
      );

      // Global error renders html/body tags but they won't be in container
      expect(container.querySelector(".min-h-screen")).toBeInTheDocument();
      expect(container.querySelector(".bg-white")).toBeInTheDocument();
    });

    it("should render the error icon/svg", () => {
      const mockError: Error & { digest?: string } = {
        name: "Error",
        message: "Critical system failure",
      } as Error;
      const mockReset = jest.fn();

      const { container } = render(
        <GlobalError error={mockError} reset={mockReset} />
      );

      const svg = container.querySelector("svg");
      expect(svg).toBeInTheDocument();
      expect(svg).toHaveClass("text-red-600");
    });

    it("should render 'Critical Error' heading", () => {
      const mockError: Error & { digest?: string } = {
        name: "Error",
        message: "Critical system failure",
      } as Error;
      const mockReset = jest.fn();

      render(<GlobalError error={mockError} reset={mockReset} />);

      expect(
        screen.getByRole("heading", { name: /critical error/i })
      ).toBeInTheDocument();
    });

    it("should render critical error message", () => {
      const mockError: Error & { digest?: string } = {
        name: "Error",
        message: "Critical system failure",
      } as Error;
      const mockReset = jest.fn();

      render(<GlobalError error={mockError} reset={mockReset} />);

      expect(
        screen.getByText(/a critical error occurred/i)
      ).toBeInTheDocument();
      expect(
        screen.getByText(/please refresh the page or contact support/i)
      ).toBeInTheDocument();
    });

    it("should render Try Again button", () => {
      const mockError: Error & { digest?: string } = {
        name: "Error",
        message: "Critical system failure",
      } as Error;
      const mockReset = jest.fn();

      render(<GlobalError error={mockError} reset={mockReset} />);

      expect(
        screen.getByRole("button", { name: /try again/i })
      ).toBeInTheDocument();
    });

    it("should render Go Home button", () => {
      const mockError: Error & { digest?: string } = {
        name: "Error",
        message: "Critical system failure",
      } as Error;
      const mockReset = jest.fn();

      render(<GlobalError error={mockError} reset={mockReset} />);

      expect(
        screen.getByRole("button", { name: /go home/i })
      ).toBeInTheDocument();
    });
  });

  // ===== User Actions Tests =====
  describe("User Actions", () => {
    it("should call reset function when Try Again button is clicked", () => {
      const mockError: Error & { digest?: string } = {
        name: "Error",
        message: "Critical system failure",
      } as Error;
      const mockReset = jest.fn();

      render(<GlobalError error={mockError} reset={mockReset} />);

      const tryAgainButton = screen.getByRole("button", { name: /try again/i });
      fireEvent.click(tryAgainButton);

      expect(mockReset).toHaveBeenCalledTimes(1);
    });

    it("should handle multiple clicks on Try Again button", () => {
      const mockError: Error & { digest?: string } = {
        name: "Error",
        message: "Critical system failure",
      } as Error;
      const mockReset = jest.fn();

      render(<GlobalError error={mockError} reset={mockReset} />);

      const tryAgainButton = screen.getByRole("button", { name: /try again/i });
      fireEvent.click(tryAgainButton);
      fireEvent.click(tryAgainButton);
      fireEvent.click(tryAgainButton);

      expect(mockReset).toHaveBeenCalledTimes(3);
    });

    it("should redirect to home when Go Home button is clicked", () => {
      const mockError: Error & { digest?: string } = {
        name: "Error",
        message: "Critical system failure",
      } as Error;
      const mockReset = jest.fn();

      render(<GlobalError error={mockError} reset={mockReset} />);

      const goHomeButton = screen.getByRole("button", { name: /go home/i });
      fireEvent.click(goHomeButton);

      expect(window.location.href).toContain("/");
    });

    it("should not call reset when Go Home button is clicked", () => {
      const mockError: Error & { digest?: string } = {
        name: "Error",
        message: "Critical system failure",
      } as Error;
      const mockReset = jest.fn();

      render(<GlobalError error={mockError} reset={mockReset} />);

      const goHomeButton = screen.getByRole("button", { name: /go home/i });
      fireEvent.click(goHomeButton);

      expect(mockReset).not.toHaveBeenCalled();
    });
  });

  // ===== Styling & Layout Tests =====
  describe("Styling & Layout", () => {
    it("should render with gradient background from red-50 to red-100", () => {
      const mockError: Error & { digest?: string } = {
        name: "Error",
        message: "Critical system failure",
      } as Error;
      const mockReset = jest.fn();

      const { container } = render(
        <GlobalError error={mockError} reset={mockReset} />
      );

      const backgroundDiv = container.querySelector(".bg-gradient-to-br");
      expect(backgroundDiv).toBeInTheDocument();
      expect(backgroundDiv).toHaveClass("from-red-50", "to-red-100");
    });

    it("should render content in centered white card with shadow", () => {
      const mockError: Error & { digest?: string } = {
        name: "Error",
        message: "Critical system failure",
      } as Error;
      const mockReset = jest.fn();

      const { container } = render(
        <GlobalError error={mockError} reset={mockReset} />
      );

      const card = container.querySelector(".bg-white.rounded-2xl.shadow-2xl");
      expect(card).toBeInTheDocument();
    });

    it("should render Try Again button with red background", () => {
      const mockError: Error & { digest?: string } = {
        name: "Error",
        message: "Critical system failure",
      } as Error;
      const mockReset = jest.fn();

      render(<GlobalError error={mockError} reset={mockReset} />);

      const tryAgainButton = screen.getByRole("button", { name: /try again/i });
      expect(tryAgainButton).toHaveClass(
        "bg-red-600",
        "text-white",
        "hover:bg-red-700"
      );
    });

    it("should render Go Home button with gray background", () => {
      const mockError: Error & { digest?: string } = {
        name: "Error",
        message: "Critical system failure",
      } as Error;
      const mockReset = jest.fn();

      render(<GlobalError error={mockError} reset={mockReset} />);

      const goHomeButton = screen.getByRole("button", { name: /go home/i });
      expect(goHomeButton).toHaveClass(
        "bg-gray-100",
        "text-gray-700",
        "hover:bg-gray-200"
      );
    });

    it("should render error icon in red circle", () => {
      const mockError: Error & { digest?: string } = {
        name: "Error",
        message: "Critical system failure",
      } as Error;
      const mockReset = jest.fn();

      const { container } = render(
        <GlobalError error={mockError} reset={mockReset} />
      );

      const iconContainer = container.querySelector(".bg-red-100.rounded-full");
      expect(iconContainer).toBeInTheDocument();
    });
  });

  // ===== Accessibility Tests =====
  describe("Accessibility", () => {
    it("should have proper heading structure", () => {
      const mockError: Error & { digest?: string } = {
        name: "Error",
        message: "Critical system failure",
      } as Error;
      const mockReset = jest.fn();

      render(<GlobalError error={mockError} reset={mockReset} />);

      const heading = screen.getByRole("heading", { name: /critical error/i });
      expect(heading.tagName).toBe("H1");
    });

    it("should have accessible buttons with clear labels", () => {
      const mockError: Error & { digest?: string } = {
        name: "Error",
        message: "Critical system failure",
      } as Error;
      const mockReset = jest.fn();

      render(<GlobalError error={mockError} reset={mockReset} />);

      expect(
        screen.getByRole("button", { name: /try again/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /go home/i })
      ).toBeInTheDocument();
    });

    it("should render svg with proper attributes", () => {
      const mockError: Error & { digest?: string } = {
        name: "Error",
        message: "Critical system failure",
      } as Error;
      const mockReset = jest.fn();

      const { container } = render(
        <GlobalError error={mockError} reset={mockReset} />
      );

      const svg = container.querySelector("svg");
      expect(svg).toHaveAttribute("viewBox", "0 0 24 24");
      expect(svg).toHaveAttribute("fill", "none");
      expect(svg).toHaveAttribute("stroke", "currentColor");
    });
  });

  // ===== Edge Cases Tests =====
  describe("Edge Cases", () => {
    it("should handle null error gracefully", () => {
      const mockReset = jest.fn();

      render(<GlobalError error={null as any} reset={mockReset} />);

      expect(
        screen.getByRole("heading", { name: /critical error/i })
      ).toBeInTheDocument();
      expect(
        screen.getByText(/a critical error occurred/i)
      ).toBeInTheDocument();
    });

    it("should handle undefined reset function", () => {
      const mockError: Error & { digest?: string } = {
        name: "Error",
        message: "Critical system failure",
      } as Error;

      render(<GlobalError error={mockError} reset={undefined as any} />);

      const tryAgainButton = screen.getByRole("button", { name: /try again/i });
      expect(tryAgainButton).toBeInTheDocument();

      // Should not throw when clicked
      expect(() => fireEvent.click(tryAgainButton)).not.toThrow();
    });

    it("should render with error containing digest", () => {
      const mockError: Error & { digest?: string } = {
        name: "Error",
        message: "Critical system failure",
        digest: "abc123xyz",
      } as Error;
      const mockReset = jest.fn();

      render(<GlobalError error={mockError} reset={mockReset} />);

      expect(
        screen.getByRole("heading", { name: /critical error/i })
      ).toBeInTheDocument();
    });

    it("should render with error without message", () => {
      const mockError: Error & { digest?: string } = {
        name: "Error",
        message: "",
      } as Error;
      const mockReset = jest.fn();

      render(<GlobalError error={mockError} reset={mockReset} />);

      expect(
        screen.getByText(/a critical error occurred/i)
      ).toBeInTheDocument();
    });
  });

  // ===== Responsive Design Tests =====
  describe("Responsive Design", () => {
    it("should use flexbox for centering content", () => {
      const mockError: Error & { digest?: string } = {
        name: "Error",
        message: "Critical system failure",
      } as Error;
      const mockReset = jest.fn();

      const { container } = render(
        <GlobalError error={mockError} reset={mockReset} />
      );

      const backgroundDiv = container.querySelector(".min-h-screen");
      expect(backgroundDiv).toHaveClass(
        "flex",
        "items-center",
        "justify-center"
      );
    });

    it("should render buttons in flex column with gap", () => {
      const mockError: Error & { digest?: string } = {
        name: "Error",
        message: "Critical system failure",
      } as Error;
      const mockReset = jest.fn();

      const { container } = render(
        <GlobalError error={mockError} reset={mockReset} />
      );

      const buttonContainer = container.querySelector(".flex.flex-col.gap-3");
      expect(buttonContainer).toBeInTheDocument();
    });

    it("should have responsive padding on main container", () => {
      const mockError: Error & { digest?: string } = {
        name: "Error",
        message: "Critical system failure",
      } as Error;
      const mockReset = jest.fn();

      const { container } = render(
        <GlobalError error={mockError} reset={mockReset} />
      );

      const backgroundDiv = container.querySelector(".px-4");
      expect(backgroundDiv).toBeInTheDocument();
    });
  });

  // ===== Component Integration Tests =====
  describe("Component Integration", () => {
    it("should render complete error UI with all elements", () => {
      const mockError: Error & { digest?: string } = {
        name: "Error",
        message: "Critical system failure",
      } as Error;
      const mockReset = jest.fn();

      render(<GlobalError error={mockError} reset={mockReset} />);

      expect(
        screen.getByRole("heading", { name: /critical error/i })
      ).toBeInTheDocument();
      expect(
        screen.getByText(/a critical error occurred/i)
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /try again/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /go home/i })
      ).toBeInTheDocument();
    });

    it("should maintain button functionality after multiple renders", () => {
      const mockError: Error & { digest?: string } = {
        name: "Error",
        message: "Critical system failure",
      } as Error;
      const mockReset = jest.fn();

      const { rerender } = render(
        <GlobalError error={mockError} reset={mockReset} />
      );

      const tryAgainButton = screen.getByRole("button", { name: /try again/i });
      fireEvent.click(tryAgainButton);
      expect(mockReset).toHaveBeenCalledTimes(1);

      rerender(<GlobalError error={mockError} reset={mockReset} />);

      const tryAgainButtonAfterRerender = screen.getByRole("button", {
        name: /try again/i,
      });
      fireEvent.click(tryAgainButtonAfterRerender);
      expect(mockReset).toHaveBeenCalledTimes(2);
    });
  });
});
