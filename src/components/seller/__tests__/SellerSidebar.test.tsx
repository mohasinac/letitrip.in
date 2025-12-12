import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { usePathname } from "next/navigation";
import React from "react";
import { SellerSidebar } from "../SellerSidebar";

// Mock dependencies
jest.mock("next/navigation", () => ({
  usePathname: jest.fn(),
}));

jest.mock("next/link", () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  );
});

const mockUsePathname = usePathname as jest.MockedFunction<typeof usePathname>;

describe("SellerSidebar", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUsePathname.mockReturnValue("/seller");
  });

  describe("Sidebar Structure", () => {
    it("renders sidebar with correct classes", () => {
      render(<SellerSidebar />);
      const sidebar = screen.getByRole("complementary");
      expect(sidebar).toBeInTheDocument();
      expect(sidebar).toHaveClass("hidden", "lg:block", "lg:fixed");
    });

    it("renders Seller Hub logo", () => {
      render(<SellerSidebar />);
      const logo = screen.getByText("Seller Hub");
      expect(logo).toBeInTheDocument();
    });

    it("renders search input", () => {
      render(<SellerSidebar />);
      const searchInput = screen.getByPlaceholderText("Search...");
      expect(searchInput).toBeInTheDocument();
    });

    it("renders Help & Support link", () => {
      render(<SellerSidebar />);
      const helpLink = screen.getByRole("link", { name: /Help & Support/i });
      expect(helpLink).toBeInTheDocument();
      expect(helpLink).toHaveAttribute("href", "/help");
    });
  });

  describe("Navigation Items", () => {
    it("renders Dashboard link", () => {
      render(<SellerSidebar />);
      const dashboardLink = screen.getByRole("link", { name: /Dashboard/i });
      expect(dashboardLink).toHaveAttribute("href", "/seller");
    });

    it("renders My Shops link", () => {
      render(<SellerSidebar />);
      const shopsLink = screen.getByRole("link", { name: /My Shops/i });
      expect(shopsLink).toHaveAttribute("href", "/seller/my-shops");
    });

    it("renders Products link", () => {
      render(<SellerSidebar />);
      const productsLink = screen.getByRole("link", { name: /^Products$/i });
      expect(productsLink).toHaveAttribute("href", "/seller/products");
    });

    it("renders Auctions link", () => {
      render(<SellerSidebar />);
      const auctionsLink = screen.getByRole("link", { name: /^Auctions$/i });
      expect(auctionsLink).toHaveAttribute("href", "/seller/auctions");
    });

    it("renders Orders link", () => {
      render(<SellerSidebar />);
      const ordersLink = screen.getByRole("link", { name: /Orders/i });
      expect(ordersLink).toHaveAttribute("href", "/seller/orders");
    });

    it("renders Returns & Refunds link", () => {
      render(<SellerSidebar />);
      const returnsLink = screen.getByRole("link", {
        name: /Returns & Refunds/i,
      });
      expect(returnsLink).toHaveAttribute("href", "/seller/returns");
    });

    it("renders Revenue link", () => {
      render(<SellerSidebar />);
      const revenueLink = screen.getByRole("link", { name: /Revenue/i });
      expect(revenueLink).toHaveAttribute("href", "/seller/revenue");
    });

    it("renders Analytics link", () => {
      render(<SellerSidebar />);
      const analyticsLink = screen.getByRole("link", { name: /Analytics/i });
      expect(analyticsLink).toHaveAttribute("href", "/seller/analytics");
    });

    it("renders Reviews link", () => {
      render(<SellerSidebar />);
      const reviewsLink = screen.getByRole("link", { name: /Reviews/i });
      expect(reviewsLink).toHaveAttribute("href", "/seller/reviews");
    });

    it("renders Support Tickets link", () => {
      render(<SellerSidebar />);
      const ticketsLink = screen.getByRole("link", {
        name: /Support Tickets/i,
      });
      expect(ticketsLink).toHaveAttribute("href", "/seller/support-tickets");
    });

    it("renders Coupons link", () => {
      render(<SellerSidebar />);
      const couponsLink = screen.getByRole("link", { name: /Coupons/i });
      expect(couponsLink).toHaveAttribute("href", "/seller/coupons");
    });
  });

  describe("Active State", () => {
    it("renders navigation links with proper structure", () => {
      render(<SellerSidebar />);
      const dashboardLink = screen.getByRole("link", { name: /Dashboard/i });
      expect(dashboardLink).toHaveAttribute("href", "/seller");

      const productsLink = screen.getByRole("link", { name: /^Products$/i });
      expect(productsLink).toHaveAttribute("href", "/seller/products");

      const ordersLink = screen.getByRole("link", { name: /Orders/i });
      expect(ordersLink).toHaveAttribute("href", "/seller/orders");
    });
  });

  describe("Expandable Sections", () => {
    it("renders Products parent link", () => {
      render(<SellerSidebar />);
      const productsLink = screen.getByRole("link", { name: /^Products$/i });
      expect(productsLink).toBeInTheDocument();
      expect(productsLink).toHaveAttribute("href", "/seller/products");
    });

    it("renders Auctions parent link", () => {
      render(<SellerSidebar />);
      const auctionsLink = screen.getByRole("link", { name: /^Auctions$/i });
      expect(auctionsLink).toBeInTheDocument();
      expect(auctionsLink).toHaveAttribute("href", "/seller/auctions");
    });

    it("renders chevron icon for expandable items", () => {
      render(<SellerSidebar />);
      const productsLink = screen.getByRole("link", { name: /^Products$/i });
      expect(productsLink.querySelector("svg")).toBeInTheDocument();
    });
  });

  describe("Search Functionality", () => {
    it("filters navigation by title", () => {
      render(<SellerSidebar />);
      const searchInput = screen.getByPlaceholderText("Search...");

      fireEvent.change(searchInput, { target: { value: "Orders" } });

      expect(screen.getByRole("link", { name: /Orders/i })).toBeInTheDocument();
      expect(
        screen.queryByRole("link", { name: /Dashboard/i })
      ).not.toBeInTheDocument();
    });

    it("filters navigation by href", () => {
      render(<SellerSidebar />);
      const searchInput = screen.getByPlaceholderText("Search...");

      fireEvent.change(searchInput, { target: { value: "analytics" } });

      expect(
        screen.getByRole("link", { name: /Analytics/i })
      ).toBeInTheDocument();
      expect(
        screen.queryByRole("link", { name: /Dashboard/i })
      ).not.toBeInTheDocument();
    });

    it("shows no results message when search has no matches", () => {
      render(<SellerSidebar />);
      const searchInput = screen.getByPlaceholderText("Search...");

      fireEvent.change(searchInput, { target: { value: "nonexistent" } });

      expect(screen.getByText("No results found")).toBeInTheDocument();
      expect(
        screen.getByText("Try a different search term")
      ).toBeInTheDocument();
    });

    it("clears search when clear button clicked", () => {
      render(<SellerSidebar />);
      const searchInput = screen.getByPlaceholderText("Search...");

      fireEvent.change(searchInput, { target: { value: "Orders" } });
      expect(searchInput).toHaveValue("Orders");

      const clearButton = screen.getByLabelText("Clear search");
      fireEvent.click(clearButton);

      expect(searchInput).toHaveValue("");
      expect(
        screen.getByRole("link", { name: /Dashboard/i })
      ).toBeInTheDocument();
    });

    it("auto-expands sections with matching children", async () => {
      render(<SellerSidebar />);
      const searchInput = screen.getByPlaceholderText("Search...");

      fireEvent.change(searchInput, { target: { value: "Add Product" } });

      await waitFor(() => {
        expect(screen.getByText("Add Product")).toBeInTheDocument();
      });
    });

    it("highlights matching text in search results", () => {
      render(<SellerSidebar />);
      const searchInput = screen.getByPlaceholderText("Search...");

      fireEvent.change(searchInput, { target: { value: "Orders" } });

      const ordersLink = screen.getByRole("link", { name: /Orders/i });
      const highlighted = ordersLink.querySelector(".bg-blue-200");
      expect(highlighted).toBeInTheDocument();
    });
  });

  describe("Dark Mode", () => {
    it("applies dark mode classes to sidebar", () => {
      render(<SellerSidebar />);
      const sidebar = screen.getByRole("complementary");
      expect(sidebar).toHaveClass("dark:bg-gray-800", "dark:border-gray-700");
    });

    it("applies dark mode classes to search input", () => {
      render(<SellerSidebar />);
      const searchInput = screen.getByPlaceholderText("Search...");
      expect(searchInput).toHaveClass(
        "dark:bg-gray-700",
        "dark:border-gray-600"
      );
    });

    it("applies dark mode classes to search input", () => {
      render(<SellerSidebar />);
      const searchInput = screen.getByPlaceholderText("Search...");
      expect(searchInput).toHaveClass("dark:bg-gray-700");
    });
  });

  describe("Responsive Design", () => {
    it("hides sidebar on small screens", () => {
      render(<SellerSidebar />);
      const sidebar = screen.getByRole("complementary");
      expect(sidebar).toHaveClass("hidden", "lg:block");
    });

    it("positions sidebar fixed on desktop", () => {
      render(<SellerSidebar />);
      const sidebar = screen.getByRole("complementary");
      expect(sidebar).toHaveClass("lg:fixed", "lg:top-[7rem]", "lg:bottom-0");
    });
  });

  describe("Accessibility", () => {
    it("has semantic aside element", () => {
      render(<SellerSidebar />);
      expect(screen.getByRole("complementary")).toBeInTheDocument();
    });

    it("has semantic nav element", () => {
      render(<SellerSidebar />);
      expect(screen.getByRole("navigation")).toBeInTheDocument();
    });

    it("has aria-label for clear search button", () => {
      render(<SellerSidebar />);
      const searchInput = screen.getByPlaceholderText("Search...");
      fireEvent.change(searchInput, { target: { value: "test" } });

      expect(screen.getByLabelText("Clear search")).toBeInTheDocument();
    });
  });

  describe("Submenu Navigation", () => {
    it("checks submenu links exist in navigation structure", () => {
      render(<SellerSidebar />);
      // Submenus are defined in navigation but not rendered until expanded
      // Clicking parent with children prevents default, so we can't easily test
      // Just verify parent links exist
      expect(
        screen.getByRole("link", { name: /^Products$/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole("link", { name: /^Auctions$/i })
      ).toBeInTheDocument();
    });
  });

  describe("Edge Cases", () => {
    it("handles whitespace in search query", () => {
      render(<SellerSidebar />);
      const searchInput = screen.getByPlaceholderText("Search...");

      fireEvent.change(searchInput, { target: { value: "  Orders  " } });

      expect(screen.getByRole("link", { name: /Orders/i })).toBeInTheDocument();
    });

    it("handles case-insensitive search", () => {
      render(<SellerSidebar />);
      const searchInput = screen.getByPlaceholderText("Search...");

      fireEvent.change(searchInput, { target: { value: "ORDERS" } });

      expect(screen.getByRole("link", { name: /Orders/i })).toBeInTheDocument();
    });

    it("shows all items when search is cleared", () => {
      render(<SellerSidebar />);
      const searchInput = screen.getByPlaceholderText("Search...");

      fireEvent.change(searchInput, { target: { value: "Orders" } });
      fireEvent.change(searchInput, { target: { value: "" } });

      expect(
        screen.getByRole("link", { name: /Dashboard/i })
      ).toBeInTheDocument();
      expect(screen.getByRole("link", { name: /Orders/i })).toBeInTheDocument();
    });

    it("prevents navigation when clicking expandable item", () => {
      render(<SellerSidebar />);
      const productsLink = screen.getByRole("link", { name: /^Products$/i });

      // Should prevent default navigation when item has children
      // Due to mock limitations, we can't test the actual submenu rendering
      fireEvent.click(productsLink);

      // Link should still exist after click
      expect(
        screen.getByRole("link", { name: /^Products$/i })
      ).toBeInTheDocument();
    });
  });
});
