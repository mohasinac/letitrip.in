import React from "react";
import { render, screen } from "@testing-library/react";
import Breadcrumb from "./Breadcrumb";

// Mock Next.js navigation
jest.mock("next/navigation", () => ({
  usePathname: jest.fn(),
}));

jest.mock("next/link", () => ({
  __esModule: true,
  default: ({ href, children, className }: any) => (
    <a href={href} className={className}>
      {children}
    </a>
  ),
}));

// Mock SEO utils
jest.mock("@/lib/seo/schema", () => ({
  generateBreadcrumbSchema: jest.fn(() => ({ "@type": "BreadcrumbList" })),
  generateJSONLD: jest.fn(() => ({ __html: "{}" })),
}));

import { usePathname } from "next/navigation";

const mockUsePathname = usePathname as jest.Mock;

describe("Breadcrumb", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Home Page", () => {
    it("does not render on home page", () => {
      mockUsePathname.mockReturnValue("/");

      const { container } = render(<Breadcrumb />);

      expect(container.firstChild).toBeNull();
    });
  });

  describe("Basic Rendering", () => {
    it("renders breadcrumb on non-home page", () => {
      mockUsePathname.mockReturnValue("/products");

      render(<Breadcrumb />);

      expect(screen.getByLabelText("Breadcrumb")).toBeInTheDocument();
    });

    it("always includes Home link", () => {
      mockUsePathname.mockReturnValue("/products");

      render(<Breadcrumb />);

      expect(screen.getByText("Home")).toBeInTheDocument();
    });

    it("renders current page", () => {
      mockUsePathname.mockReturnValue("/products");

      render(<Breadcrumb />);

      expect(screen.getByText("Products")).toBeInTheDocument();
    });

    it("shows chevron separators", () => {
      mockUsePathname.mockReturnValue("/products/create");

      const { container } = render(<Breadcrumb />);

      const chevrons = container.querySelectorAll("svg");
      expect(chevrons.length).toBeGreaterThan(0);
    });
  });

  describe("Path Parsing", () => {
    it("handles single segment path", () => {
      mockUsePathname.mockReturnValue("/shops");

      render(<Breadcrumb />);

      expect(screen.getByText("Home")).toBeInTheDocument();
      expect(screen.getByText("Shops")).toBeInTheDocument();
    });

    it("handles multi-segment path", () => {
      mockUsePathname.mockReturnValue("/seller/products");

      render(<Breadcrumb />);

      expect(screen.getByText("Home")).toBeInTheDocument();
      expect(screen.getByText("Seller Dashboard")).toBeInTheDocument();
      expect(screen.getByText("My Products")).toBeInTheDocument();
    });

    it("handles nested paths", () => {
      mockUsePathname.mockReturnValue("/admin/users");

      render(<Breadcrumb />);

      expect(screen.getByText("Home")).toBeInTheDocument();
      expect(screen.getByText("Admin Dashboard")).toBeInTheDocument();
      expect(screen.getByText("Manage Users")).toBeInTheDocument();
    });

    it("handles hyphenated segments", () => {
      mockUsePathname.mockReturnValue("/user-settings");

      render(<Breadcrumb />);

      expect(screen.getByText("User Settings")).toBeInTheDocument();
    });
  });

  describe("Custom Labels", () => {
    it("uses custom label for /user/favorites", () => {
      mockUsePathname.mockReturnValue("/user/favorites");

      render(<Breadcrumb />);

      expect(screen.getByText("Favorites")).toBeInTheDocument();
    });

    it("uses custom label for /user/settings", () => {
      mockUsePathname.mockReturnValue("/user/settings");

      render(<Breadcrumb />);

      expect(screen.getByText("Settings")).toBeInTheDocument();
    });

    it("uses custom label for /admin paths", () => {
      mockUsePathname.mockReturnValue("/admin");

      render(<Breadcrumb />);

      expect(screen.getByText("Admin Dashboard")).toBeInTheDocument();
    });

    it("uses custom label for /seller paths", () => {
      mockUsePathname.mockReturnValue("/seller");

      render(<Breadcrumb />);

      expect(screen.getByText("Seller Dashboard")).toBeInTheDocument();
    });
  });

  describe("Link Behavior", () => {
    it("makes intermediate items clickable", () => {
      mockUsePathname.mockReturnValue("/seller/products");

      render(<Breadcrumb />);

      const homeLink = screen.getByText("Home").closest("a");
      expect(homeLink).toHaveAttribute("href", "/");

      const sellerLink = screen.getByText("Seller Dashboard").closest("a");
      expect(sellerLink).toHaveAttribute("href", "/seller");
    });

    it("does not make current page clickable", () => {
      mockUsePathname.mockReturnValue("/products");

      render(<Breadcrumb />);

      const productsItem = screen.getByText("Products");
      expect(productsItem.closest("a")).toBeNull();
    });

    it("applies correct styling to links", () => {
      mockUsePathname.mockReturnValue("/seller/products");

      render(<Breadcrumb />);

      const homeLink = screen.getByText("Home").closest("a");
      expect(homeLink).toHaveClass("text-gray-600");
    });

    it("applies correct styling to current page", () => {
      mockUsePathname.mockReturnValue("/products");

      render(<Breadcrumb />);

      const currentPage = screen.getByText("Products");
      expect(currentPage).toHaveClass("text-gray-900");
      expect(currentPage).toHaveClass("font-medium");
    });
  });

  describe("Home Icon", () => {
    it("shows home icon for home link", () => {
      mockUsePathname.mockReturnValue("/products");

      const { container } = render(<Breadcrumb />);

      const homeLink = screen.getByText("Home").closest("a");
      const homeIcon = homeLink?.querySelector("svg");
      expect(homeIcon).toBeInTheDocument();
    });

    it("does not show icon for other items", () => {
      mockUsePathname.mockReturnValue("/seller/products");

      render(<Breadcrumb />);

      const sellerLink = screen.getByText("Seller Dashboard");
      const icon = sellerLink.querySelector("svg");
      expect(icon).toBeNull();
    });
  });

  describe("Styling", () => {
    it("applies container styling", () => {
      mockUsePathname.mockReturnValue("/products");

      const { container } = render(<Breadcrumb />);

      const nav = container.querySelector("nav");
      expect(nav).toHaveClass("bg-gray-50");
      expect(nav).toHaveClass("border-b");
    });

    it("applies breadcrumb list styling", () => {
      mockUsePathname.mockReturnValue("/products");

      const { container } = render(<Breadcrumb />);

      const ol = container.querySelector("ol");
      expect(ol).toHaveClass("flex");
      expect(ol).toHaveClass("items-center");
    });
  });

  describe("SEO Schema", () => {
    it("generates breadcrumb schema", () => {
      const { generateBreadcrumbSchema } = require("@/lib/seo/schema");

      mockUsePathname.mockReturnValue("/products");

      render(<Breadcrumb />);

      expect(generateBreadcrumbSchema).toHaveBeenCalled();
    });

    it("includes JSON-LD script", () => {
      mockUsePathname.mockReturnValue("/products");

      const { container } = render(<Breadcrumb />);

      const script = container.querySelector(
        'script[type="application/ld+json"]',
      );
      expect(script).toBeInTheDocument();
    });

    it("does not generate schema for home page", () => {
      const { generateBreadcrumbSchema } = require("@/lib/seo/schema");

      mockUsePathname.mockReturnValue("/");

      render(<Breadcrumb />);

      expect(generateBreadcrumbSchema).not.toHaveBeenCalled();
    });
  });

  describe("Edge Cases", () => {
    it("handles root level paths", () => {
      mockUsePathname.mockReturnValue("/about");

      render(<Breadcrumb />);

      expect(screen.getByText("Home")).toBeInTheDocument();
      expect(screen.getByText("About Us")).toBeInTheDocument();
    });

    it("handles deeply nested paths", () => {
      mockUsePathname.mockReturnValue("/admin/users/edit");

      render(<Breadcrumb />);

      expect(screen.getByText("Home")).toBeInTheDocument();
      expect(screen.getByText("Admin Dashboard")).toBeInTheDocument();
      expect(screen.getByText("Manage Users")).toBeInTheDocument();
      expect(screen.getByText("Edit")).toBeInTheDocument();
    });

    it("handles paths with trailing slash", () => {
      mockUsePathname.mockReturnValue("/products/");

      render(<Breadcrumb />);

      expect(screen.getByText("Products")).toBeInTheDocument();
    });

    it("capitalizes unknown segments", () => {
      mockUsePathname.mockReturnValue("/unknown-path");

      render(<Breadcrumb />);

      expect(screen.getByText("Unknown Path")).toBeInTheDocument();
    });

    it("handles single character segments", () => {
      mockUsePathname.mockReturnValue("/a");

      render(<Breadcrumb />);

      expect(screen.getByText("A")).toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("has proper ARIA label", () => {
      mockUsePathname.mockReturnValue("/products");

      render(<Breadcrumb />);

      expect(screen.getByLabelText("Breadcrumb")).toBeInTheDocument();
    });

    it("uses semantic nav element", () => {
      mockUsePathname.mockReturnValue("/products");

      const { container } = render(<Breadcrumb />);

      const nav = container.querySelector("nav");
      expect(nav).toBeInTheDocument();
    });

    it("uses ordered list for breadcrumb items", () => {
      mockUsePathname.mockReturnValue("/products");

      const { container } = render(<Breadcrumb />);

      const ol = container.querySelector("ol");
      expect(ol).toBeInTheDocument();
    });

    it("uses list items for each breadcrumb", () => {
      mockUsePathname.mockReturnValue("/seller/products");

      const { container } = render(<Breadcrumb />);

      const lis = container.querySelectorAll("li");
      expect(lis.length).toBe(3); // Home, Seller Dashboard, My Products
    });
  });
});
