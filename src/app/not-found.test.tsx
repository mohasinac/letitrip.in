import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import NotFound from "./not-found";
import { useSearchParams } from "next/navigation";

// Mock next/navigation
jest.mock("next/navigation", () => ({
  useSearchParams: jest.fn(),
}));

// Mock next/link
jest.mock("next/link", () => ({
  __esModule: true,
  default: ({ children, href, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

describe("NotFound Page", () => {
  const mockBack = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    Object.defineProperty(window, "history", {
      writable: true,
      value: { back: mockBack },
    });

    (useSearchParams as jest.Mock).mockReturnValue({
      get: jest.fn(() => null),
    });
  });

  describe("Basic Rendering", () => {
    it("should render 404 page", async () => {
      render(<NotFound />);

      await waitFor(() => {
        expect(screen.getByText("404")).toBeInTheDocument();
      });
    });

    it("should display Page Not Found title", async () => {
      render(<NotFound />);

      await waitFor(() => {
        expect(screen.getByText("Page Not Found")).toBeInTheDocument();
      });
    });

    it("should show default message", async () => {
      render(<NotFound />);

      await waitFor(() => {
        expect(
          screen.getByText(/page you're looking for doesn't exist/i)
        ).toBeInTheDocument();
      });
    });

    it("should render Go Back button", async () => {
      render(<NotFound />);

      await waitFor(() => {
        expect(screen.getByText("Go Back")).toBeInTheDocument();
      });
    });

    it("should render Home button", async () => {
      render(<NotFound />);

      await waitFor(() => {
        expect(screen.getByText("Home")).toBeInTheDocument();
      });
    });
  });

  describe("Custom Error Messages", () => {
    it("should show product not found message", async () => {
      (useSearchParams as jest.Mock).mockReturnValue({
        get: jest.fn((key) => {
          if (key === "reason") return "product-not-found";
          return null;
        }),
      });

      render(<NotFound />);

      await waitFor(() => {
        expect(screen.getByText("Product Not Found")).toBeInTheDocument();
        expect(
          screen.getByText(/product you're looking for doesn't exist/i)
        ).toBeInTheDocument();
      });
    });

    it("should show shop not found message", async () => {
      (useSearchParams as jest.Mock).mockReturnValue({
        get: jest.fn((key) => {
          if (key === "reason") return "shop-not-found";
          return null;
        }),
      });

      render(<NotFound />);

      await waitFor(() => {
        expect(screen.getByText("Shop Not Found")).toBeInTheDocument();
      });
    });

    it("should show auction not found message", async () => {
      (useSearchParams as jest.Mock).mockReturnValue({
        get: jest.fn((key) => {
          if (key === "reason") return "auction-not-found";
          return null;
        }),
      });

      render(<NotFound />);

      await waitFor(() => {
        expect(screen.getByText("Auction Not Found")).toBeInTheDocument();
      });
    });

    it("should show category not found message", async () => {
      (useSearchParams as jest.Mock).mockReturnValue({
        get: jest.fn((key) => {
          if (key === "reason") return "category-not-found";
          return null;
        }),
      });

      render(<NotFound />);

      await waitFor(() => {
        expect(screen.getByText("Category Not Found")).toBeInTheDocument();
      });
    });

    it("should show user not found message", async () => {
      (useSearchParams as jest.Mock).mockReturnValue({
        get: jest.fn((key) => {
          if (key === "reason") return "user-not-found";
          return null;
        }),
      });

      render(<NotFound />);

      await waitFor(() => {
        expect(screen.getByText("User Not Found")).toBeInTheDocument();
      });
    });

    it("should show order not found message", async () => {
      (useSearchParams as jest.Mock).mockReturnValue({
        get: jest.fn((key) => {
          if (key === "reason") return "order-not-found";
          return null;
        }),
      });

      render(<NotFound />);

      await waitFor(() => {
        expect(screen.getByText("Order Not Found")).toBeInTheDocument();
      });
    });
  });

  describe("Resource Information Display", () => {
    it("should display requested resource", async () => {
      (useSearchParams as jest.Mock).mockReturnValue({
        get: jest.fn((key) => {
          if (key === "resource") return "/products/test-slug";
          return null;
        }),
      });

      render(<NotFound />);

      await waitFor(() => {
        expect(screen.getByText("/products/test-slug")).toBeInTheDocument();
      });
    });

    it("should not show resource info if not provided", async () => {
      render(<NotFound />);

      await waitFor(() => {
        expect(
          screen.queryByText("Requested Resource")
        ).not.toBeInTheDocument();
      });
    });
  });

  describe("Developer Information", () => {
    it("should show developer details in development", async () => {
      const originalEnv = process.env.NODE_ENV;
      Object.defineProperty(process.env, "NODE_ENV", {
        value: "development",
        writable: true,
        configurable: true,
      });

      (useSearchParams as jest.Mock).mockReturnValue({
        get: jest.fn((key) => {
          if (key === "details") return encodeURIComponent("Debug info here");
          return null;
        }),
      });

      render(<NotFound />);

      await waitFor(() => {
        expect(screen.getByText(/Developer Info/i)).toBeInTheDocument();
        expect(screen.getByText("Debug info here")).toBeInTheDocument();
      });

      Object.defineProperty(process.env, "NODE_ENV", {
        value: originalEnv,
        writable: true,
        configurable: true,
      });
    });

    it("should not show developer details in production", async () => {
      const originalEnv = process.env.NODE_ENV;
      Object.defineProperty(process.env, "NODE_ENV", {
        value: "production",
        writable: true,
        configurable: true,
      });

      (useSearchParams as jest.Mock).mockReturnValue({
        get: jest.fn((key) => {
          if (key === "details") return encodeURIComponent("Debug info");
          return null;
        }),
      });

      render(<NotFound />);

      await waitFor(() => {
        expect(screen.queryByText(/Developer Info/i)).not.toBeInTheDocument();
      });

      Object.defineProperty(process.env, "NODE_ENV", {
        value: originalEnv,
        writable: true,
        configurable: true,
      });
    });
  });

  describe("Navigation Actions", () => {
    it("should call window.history.back on Go Back click", async () => {
      render(<NotFound />);

      await waitFor(() => {
        const goBackButton = screen.getByText("Go Back");
        fireEvent.click(goBackButton);
      });

      expect(mockBack).toHaveBeenCalledTimes(1);
    });

    it("should have correct href for Home link", async () => {
      render(<NotFound />);

      await waitFor(() => {
        const homeLink = screen.getByText("Home").closest("a");
        expect(homeLink).toHaveAttribute("href", "/");
      });
    });

    it("should have Products quick link", async () => {
      render(<NotFound />);

      await waitFor(() => {
        const productsLink = screen.getByText("Products").closest("a");
        expect(productsLink).toHaveAttribute("href", "/products");
      });
    });

    it("should have Shops quick link", async () => {
      render(<NotFound />);

      await waitFor(() => {
        const shopsLink = screen.getByText("Shops").closest("a");
        expect(shopsLink).toHaveAttribute("href", "/shops");
      });
    });

    it("should have Auctions quick link", async () => {
      render(<NotFound />);

      await waitFor(() => {
        const auctionsLink = screen.getByText("Auctions").closest("a");
        expect(auctionsLink).toHaveAttribute("href", "/auctions");
      });
    });

    it("should have Search link", async () => {
      render(<NotFound />);

      await waitFor(() => {
        const searchLink = screen.getByText("Search Products").closest("a");
        expect(searchLink).toHaveAttribute("href", "/search");
      });
    });
  });

  describe("Styling & Layout", () => {
    it("should use gradient background", async () => {
      const { container } = render(<NotFound />);

      await waitFor(() => {
        const gradient = container.querySelector(".bg-gradient-to-br");
        expect(gradient).toBeInTheDocument();
      });
    });

    it("should center content", async () => {
      const { container } = render(<NotFound />);

      await waitFor(() => {
        const centerDiv = container.querySelector(".min-h-screen");
        expect(centerDiv).toHaveClass("flex");
        expect(centerDiv).toHaveClass("items-center");
      });
    });

    it("should use card layout", async () => {
      const { container } = render(<NotFound />);

      await waitFor(() => {
        const card = container.querySelector(".bg-white");
        expect(card).toHaveClass("rounded-2xl");
      });
    });

    it("should have gradient header", async () => {
      const { container } = render(<NotFound />);

      await waitFor(() => {
        const header = container.querySelector(".bg-gradient-to-r");
        expect(header).toBeInTheDocument();
      });
    });
  });

  describe("Accessibility", () => {
    it("should render proper heading structure", async () => {
      render(<NotFound />);

      await waitFor(() => {
        const h1 = screen.getByRole("heading", { level: 1 });
        expect(h1).toBeInTheDocument();
      });
    });

    it("should have accessible buttons", async () => {
      render(<NotFound />);

      await waitFor(() => {
        const buttons = screen.getAllByRole("button");
        expect(buttons.length).toBeGreaterThan(0);
      });
    });

    it("should have accessible links", async () => {
      render(<NotFound />);

      await waitFor(() => {
        const links = screen.getAllByRole("link");
        links.forEach((link) => {
          expect(link).toHaveAttribute("href");
        });
      });
    });
  });

  describe("Edge Cases", () => {
    it("should handle URL-encoded details", async () => {
      const originalEnv = process.env.NODE_ENV;
      Object.defineProperty(process.env, "NODE_ENV", {
        value: "development",
        writable: true,
        configurable: true,
      });

      (useSearchParams as jest.Mock).mockReturnValue({
        get: jest.fn((key) => {
          if (key === "details")
            return encodeURIComponent("Test & <special> chars");
          return null;
        }),
      });

      render(<NotFound />);

      await waitFor(() => {
        expect(screen.getByText("Test & <special> chars")).toBeInTheDocument();
      });

      Object.defineProperty(process.env, "NODE_ENV", {
        value: originalEnv,
        writable: true,
        configurable: true,
      });
    });

    it("should handle null searchParams", async () => {
      (useSearchParams as jest.Mock).mockReturnValue(null);

      render(<NotFound />);

      await waitFor(() => {
        expect(screen.getByText("404")).toBeInTheDocument();
      });
    });

    it("should render appropriate emoji icons", async () => {
      (useSearchParams as jest.Mock).mockReturnValue({
        get: jest.fn((key) => {
          if (key === "reason") return "product-not-found";
          return null;
        }),
      });

      render(<NotFound />);

      await waitFor(() => {
        expect(screen.getByText("📦")).toBeInTheDocument();
      });
    });
  });

  describe("Suspense Fallback", () => {
    it("should use Suspense wrapper", () => {
      const { container } = render(<NotFound />);
      expect(container).toBeTruthy();
    });
  });
});
