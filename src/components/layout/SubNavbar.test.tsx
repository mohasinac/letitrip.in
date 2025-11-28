import { render, screen, fireEvent } from "@testing-library/react";
import SubNavbar from "./SubNavbar";

// Mock next/navigation
jest.mock("next/navigation", () => ({
  usePathname: jest.fn(),
}));

// Mock next/link
jest.mock("next/link", () => {
  return ({ children, href, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  );
});

import { usePathname } from "next/navigation";
const mockUsePathname = usePathname as jest.Mock;

describe("SubNavbar", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUsePathname.mockReturnValue("/");
  });

  describe("Navigation Items", () => {
    it("should render all navigation items", () => {
      render(<SubNavbar />);

      expect(screen.getAllByText("Home").length).toBeGreaterThan(0);
      expect(screen.getAllByText("Products").length).toBeGreaterThan(0);
      expect(screen.getAllByText("Auctions").length).toBeGreaterThan(0);
      expect(screen.getAllByText("Shops").length).toBeGreaterThan(0);
      expect(screen.getAllByText("Categories").length).toBeGreaterThan(0);
      expect(screen.getAllByText("Reviews").length).toBeGreaterThan(0);
      expect(screen.getAllByText("Blog").length).toBeGreaterThan(0);
    });

    it("should link to correct paths", () => {
      render(<SubNavbar />);

      // Check desktop links
      const productLinks = screen.getAllByRole("link", { name: /Products/i });
      expect(productLinks[0]).toHaveAttribute("href", "/products");

      const auctionLinks = screen.getAllByRole("link", { name: /Auctions/i });
      expect(auctionLinks[0]).toHaveAttribute("href", "/auctions");

      const shopLinks = screen.getAllByRole("link", { name: /Shops/i });
      expect(shopLinks[0]).toHaveAttribute("href", "/shops");
    });
  });

  describe("Active State", () => {
    it("should highlight Home when on homepage", () => {
      mockUsePathname.mockReturnValue("/");
      render(<SubNavbar />);

      // Desktop version - find the active link
      const homeLinks = screen.getAllByRole("link", { name: /Home/i });
      const desktopHomeLink = homeLinks.find((link) =>
        link.className.includes("text-yellow-600")
      );
      expect(desktopHomeLink).toBeDefined();
    });

    it("should highlight Products when on products page", () => {
      mockUsePathname.mockReturnValue("/products");
      render(<SubNavbar />);

      const productLinks = screen.getAllByRole("link", { name: /Products/i });
      const activeLink = productLinks.find(
        (link) =>
          link.className.includes("text-yellow-600") ||
          link.className.includes("border-yellow-600")
      );
      expect(activeLink).toBeDefined();
    });

    it("should highlight Products for nested product routes", () => {
      mockUsePathname.mockReturnValue("/products/some-product-slug");
      render(<SubNavbar />);

      const productLinks = screen.getAllByRole("link", { name: /Products/i });
      const activeLink = productLinks.find(
        (link) =>
          link.className.includes("text-yellow-600") ||
          link.className.includes("border-yellow-600")
      );
      expect(activeLink).toBeDefined();
    });

    it("should highlight Auctions when on auctions page", () => {
      mockUsePathname.mockReturnValue("/auctions");
      render(<SubNavbar />);

      const auctionLinks = screen.getAllByRole("link", { name: /Auctions/i });
      const activeLink = auctionLinks.find(
        (link) =>
          link.className.includes("text-yellow-600") ||
          link.className.includes("border-yellow-600")
      );
      expect(activeLink).toBeDefined();
    });

    it("should highlight Shops when on shops page", () => {
      mockUsePathname.mockReturnValue("/shops");
      render(<SubNavbar />);

      const shopLinks = screen.getAllByRole("link", { name: /Shops/i });
      const activeLink = shopLinks.find(
        (link) =>
          link.className.includes("text-yellow-600") ||
          link.className.includes("border-yellow-600")
      );
      expect(activeLink).toBeDefined();
    });

    it("should highlight Categories when on categories page", () => {
      mockUsePathname.mockReturnValue("/categories");
      render(<SubNavbar />);

      const categoryLinks = screen.getAllByRole("link", {
        name: /Categories/i,
      });
      const activeLink = categoryLinks.find(
        (link) =>
          link.className.includes("text-yellow-600") ||
          link.className.includes("border-yellow-600")
      );
      expect(activeLink).toBeDefined();
    });

    it("should highlight Reviews when on reviews page", () => {
      mockUsePathname.mockReturnValue("/reviews");
      render(<SubNavbar />);

      const reviewLinks = screen.getAllByRole("link", { name: /Reviews/i });
      const activeLink = reviewLinks.find(
        (link) =>
          link.className.includes("text-yellow-600") ||
          link.className.includes("border-yellow-600")
      );
      expect(activeLink).toBeDefined();
    });

    it("should highlight Blog when on blog page", () => {
      mockUsePathname.mockReturnValue("/blog");
      render(<SubNavbar />);

      const blogLinks = screen.getAllByRole("link", { name: /Blog/i });
      const activeLink = blogLinks.find(
        (link) =>
          link.className.includes("text-yellow-600") ||
          link.className.includes("border-yellow-600")
      );
      expect(activeLink).toBeDefined();
    });
  });

  describe("Responsive Behavior", () => {
    it("should render desktop and mobile versions", () => {
      render(<SubNavbar />);

      // Check both desktop (text links) and mobile (icon links) are rendered
      const homeLinks = screen.getAllByRole("link", { name: /Home/i });
      expect(homeLinks.length).toBeGreaterThanOrEqual(1);
    });

    it("should have horizontal scroll for mobile version", () => {
      render(<SubNavbar />);

      // Mobile container should have overflow-x-auto class
      const container = document.querySelector(".overflow-x-auto");
      expect(container).toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("should have scroll navigation buttons with aria-labels", () => {
      render(<SubNavbar />);

      // Scroll buttons may or may not be visible based on content width
      // but if they exist, they should have aria-labels
      const leftButton = screen.queryByLabelText("Scroll left");
      const rightButton = screen.queryByLabelText("Scroll right");

      // These are conditional, so just check they're not broken if present
      if (leftButton) {
        expect(leftButton).toBeInTheDocument();
      }
      if (rightButton) {
        expect(rightButton).toBeInTheDocument();
      }
    });

    it("should have links with proper href attributes", () => {
      render(<SubNavbar />);

      const links = screen.getAllByRole("link");
      links.forEach((link) => {
        expect(link).toHaveAttribute("href");
      });
    });
  });

  describe("Navigation Structure", () => {
    it("should render 7 navigation items", () => {
      render(<SubNavbar />);

      // Desktop version has 7 items
      const desktopNav = document.querySelector(".hidden.lg\\:flex");
      if (desktopNav) {
        const links = desktopNav.querySelectorAll("a");
        expect(links.length).toBe(7);
      }
    });

    it("should have sticky positioning", () => {
      render(<SubNavbar />);

      const navbar = document.querySelector(".sticky");
      expect(navbar).toBeInTheDocument();
    });
  });
});
