import { render, screen } from "@testing-library/react";
import BottomNav from "./BottomNav";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/hooks/useCart";

// Mock dependencies
jest.mock("next/link", () => ({
  __esModule: true,
  default: ({ children, href, className, ...props }: any) => (
    <a href={href} className={className} {...props}>
      {children}
    </a>
  ),
}));

const mockUsePathname = jest.fn();
const mockUseAuth = jest.fn();
const mockUseCart = jest.fn();

jest.mock("next/navigation", () => ({
  usePathname: () => mockUsePathname(),
}));

jest.mock("@/contexts/AuthContext", () => ({
  useAuth: () => mockUseAuth(),
}));

jest.mock("@/hooks/useCart", () => ({
  useCart: () => mockUseCart(),
}));

describe("BottomNav", () => {
  beforeEach(() => {
    mockUsePathname.mockReturnValue("/");
    mockUseAuth.mockReturnValue({ isAuthenticated: false });
    mockUseCart.mockReturnValue({ cart: { itemCount: 0 } });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // Basic Rendering
  describe("Basic Rendering", () => {
    it("renders bottom navigation", () => {
      render(<BottomNav />);
      expect(screen.getByRole("navigation")).toBeInTheDocument();
    });

    it("renders all navigation items", () => {
      render(<BottomNav />);
      expect(screen.getByText("Home")).toBeInTheDocument();
      expect(screen.getByText("Products")).toBeInTheDocument();
      expect(screen.getByText("Auctions")).toBeInTheDocument();
      expect(screen.getByText("Cart")).toBeInTheDocument();
      expect(screen.getByText("Account")).toBeInTheDocument();
    });

    it("renders navigation icons", () => {
      render(<BottomNav />);
      const links = screen.getAllByRole("link");
      expect(links).toHaveLength(5);
    });

    it("has mobile-only class", () => {
      render(<BottomNav />);
      const nav = screen.getByRole("navigation");
      expect(nav).toHaveClass("lg:hidden");
    });

    it("has fixed positioning", () => {
      render(<BottomNav />);
      const nav = screen.getByRole("navigation");
      expect(nav).toHaveClass("fixed", "bottom-0");
    });
  });

  // Navigation Links
  describe("Navigation Links", () => {
    it("renders home link", () => {
      render(<BottomNav />);
      const homeLink = screen.getByText("Home").closest("a");
      expect(homeLink).toHaveAttribute("href", "/");
    });

    it("renders products link", () => {
      render(<BottomNav />);
      const productsLink = screen.getByText("Products").closest("a");
      expect(productsLink).toHaveAttribute("href", "/products");
    });

    it("renders auctions link", () => {
      render(<BottomNav />);
      const auctionsLink = screen.getByText("Auctions").closest("a");
      expect(auctionsLink).toHaveAttribute("href", "/auctions");
    });

    it("renders cart link", () => {
      render(<BottomNav />);
      const cartLink = screen.getByText("Cart").closest("a");
      expect(cartLink).toHaveAttribute("href", "/cart");
    });

    it("renders account link for logged out user", () => {
      mockUseAuth.mockReturnValue({ isAuthenticated: false });
      render(<BottomNav />);
      const accountLink = screen.getByText("Account").closest("a");
      expect(accountLink).toHaveAttribute("href", "/login");
    });

    it("renders account link for logged in user", () => {
      mockUseAuth.mockReturnValue({ isAuthenticated: true });
      render(<BottomNav />);
      const accountLink = screen.getByText("Account").closest("a");
      expect(accountLink).toHaveAttribute("href", "/user");
    });
  });

  // Active State
  describe("Active State", () => {
    it("highlights home when on home page", () => {
      mockUsePathname.mockReturnValue("/");
      render(<BottomNav />);
      const homeLink = screen.getByText("Home").closest("a");
      expect(homeLink?.className).toContain("text-yellow-600");
    });

    it("highlights products when on products page", () => {
      mockUsePathname.mockReturnValue("/products");
      render(<BottomNav />);
      const productsLink = screen.getByText("Products").closest("a");
      expect(productsLink?.className).toContain("text-yellow-600");
    });

    it("highlights auctions when on auctions page", () => {
      mockUsePathname.mockReturnValue("/auctions");
      render(<BottomNav />);
      const auctionsLink = screen.getByText("Auctions").closest("a");
      expect(auctionsLink?.className).toContain("text-yellow-600");
    });

    it("highlights cart when on cart page", () => {
      mockUsePathname.mockReturnValue("/cart");
      render(<BottomNav />);
      const cartLink = screen.getByText("Cart").closest("a");
      expect(cartLink?.className).toContain("text-yellow-600");
    });

    it("highlights account when on user page", () => {
      mockUsePathname.mockReturnValue("/user");
      render(<BottomNav />);
      const accountLink = screen.getByText("Account").closest("a");
      expect(accountLink?.className).toContain("text-yellow-600");
    });

    it("does not highlight inactive items", () => {
      mockUsePathname.mockReturnValue("/");
      render(<BottomNav />);
      const productsLink = screen.getByText("Products").closest("a");
      expect(productsLink?.className).toContain("text-gray-600");
      // Should not have the active yellow color (only hover variant is OK)
      const classes = productsLink?.className.split(" ") || [];
      expect(classes.includes("text-yellow-600")).toBe(false);
    });
  });

  // Cart Badge
  describe("Cart Badge", () => {
    it("displays cart count when items exist", () => {
      mockUseCart.mockReturnValue({ cart: { itemCount: 3 } });
      render(<BottomNav />);
      expect(screen.getByText("3")).toBeInTheDocument();
    });

    it("does not display badge when cart is empty", () => {
      mockUseCart.mockReturnValue({ cart: { itemCount: 0 } });
      render(<BottomNav />);
      const badge = document.querySelector(".bg-yellow-500");
      expect(badge).not.toBeInTheDocument();
    });

    it('displays "9+" for cart count over 9', () => {
      mockUseCart.mockReturnValue({ cart: { itemCount: 15 } });
      render(<BottomNav />);
      expect(screen.getByText("9+")).toBeInTheDocument();
    });

    it("displays exact count for 9 or less", () => {
      mockUseCart.mockReturnValue({ cart: { itemCount: 9 } });
      render(<BottomNav />);
      expect(screen.getByText("9")).toBeInTheDocument();
    });

    it("handles null cart gracefully", () => {
      mockUseCart.mockReturnValue({ cart: null });
      render(<BottomNav />);
      const badge = document.querySelector(".bg-yellow-500");
      expect(badge).not.toBeInTheDocument();
    });

    it("handles undefined itemCount", () => {
      mockUseCart.mockReturnValue({ cart: {} });
      render(<BottomNav />);
      const badge = document.querySelector(".bg-yellow-500");
      expect(badge).not.toBeInTheDocument();
    });
  });

  // Styling
  describe("Styling", () => {
    it("has white background", () => {
      render(<BottomNav />);
      const nav = screen.getByRole("navigation");
      expect(nav).toHaveClass("bg-white");
    });

    it("has border top", () => {
      render(<BottomNav />);
      const nav = screen.getByRole("navigation");
      expect(nav).toHaveClass("border-t");
    });

    it("has shadow", () => {
      render(<BottomNav />);
      const nav = screen.getByRole("navigation");
      expect(nav).toHaveClass("shadow-lg");
    });

    it("has correct height", () => {
      render(<BottomNav />);
      const container = document.querySelector(".h-16");
      expect(container).toBeInTheDocument();
    });

    it("has correct z-index", () => {
      render(<BottomNav />);
      const nav = screen.getByRole("navigation");
      expect(nav).toHaveClass("z-50");
    });
  });

  // Badge Styling
  describe("Badge Styling", () => {
    it("has yellow background", () => {
      mockUseCart.mockReturnValue({ cart: { itemCount: 3 } });
      render(<BottomNav />);
      const badge = screen.getByText("3");
      expect(badge).toHaveClass("bg-yellow-500");
    });

    it("has rounded full shape", () => {
      mockUseCart.mockReturnValue({ cart: { itemCount: 3 } });
      render(<BottomNav />);
      const badge = screen.getByText("3");
      expect(badge).toHaveClass("rounded-full");
    });

    it("has absolute positioning", () => {
      mockUseCart.mockReturnValue({ cart: { itemCount: 3 } });
      render(<BottomNav />);
      const badge = screen.getByText("3");
      expect(badge).toHaveClass("absolute");
    });
  });

  // Authentication State
  describe("Authentication State", () => {
    it("redirects to login when not authenticated", () => {
      mockUseAuth.mockReturnValue({ isAuthenticated: false });
      render(<BottomNav />);
      const accountLink = screen.getByText("Account").closest("a");
      expect(accountLink).toHaveAttribute("href", "/login");
    });

    it("redirects to user page when authenticated", () => {
      mockUseAuth.mockReturnValue({ isAuthenticated: true });
      render(<BottomNav />);
      const accountLink = screen.getByText("Account").closest("a");
      expect(accountLink).toHaveAttribute("href", "/user");
    });
  });

  // Edge Cases
  describe("Edge Cases", () => {
    it("handles cart count of 1", () => {
      mockUseCart.mockReturnValue({ cart: { itemCount: 1 } });
      render(<BottomNav />);
      expect(screen.getByText("1")).toBeInTheDocument();
    });

    it("handles cart count of 10", () => {
      mockUseCart.mockReturnValue({ cart: { itemCount: 10 } });
      render(<BottomNav />);
      expect(screen.getByText("9+")).toBeInTheDocument();
    });

    it("handles very large cart count", () => {
      mockUseCart.mockReturnValue({ cart: { itemCount: 999 } });
      render(<BottomNav />);
      expect(screen.getByText("9+")).toBeInTheDocument();
    });
  });

  // Accessibility
  describe("Accessibility", () => {
    it("has navigation role", () => {
      render(<BottomNav />);
      expect(screen.getByRole("navigation")).toBeInTheDocument();
    });

    it("has navigation id", () => {
      render(<BottomNav />);
      const nav = screen.getByRole("navigation");
      expect(nav).toHaveAttribute("id", "bottom-navigation");
    });

    it("all links are accessible", () => {
      render(<BottomNav />);
      const links = screen.getAllByRole("link");
      links.forEach((link) => {
        expect(link).toHaveAttribute("href");
      });
    });
  });

  // Layout
  describe("Layout", () => {
    it("uses flex layout", () => {
      render(<BottomNav />);
      const container = document.querySelector(".flex.items-center");
      expect(container).toBeInTheDocument();
    });

    it("has equal width items", () => {
      render(<BottomNav />);
      const links = screen.getAllByRole("link");
      links.forEach((link) => {
        expect(link.className).toContain("flex-1");
      });
    });
  });
});
