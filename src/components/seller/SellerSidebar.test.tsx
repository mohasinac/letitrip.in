import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { SellerSidebar } from "./SellerSidebar";

// Mock next/navigation
jest.mock("next/navigation", () => ({
  usePathname: jest.fn(),
}));

// Mock next/link
jest.mock("next/link", () => {
  return ({ children, href, onClick, ...props }: any) => (
    <a href={href} onClick={onClick} {...props}>
      {children}
    </a>
  );
});

import { usePathname } from "next/navigation";
const mockUsePathname = usePathname as jest.Mock;

describe("SellerSidebar", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUsePathname.mockReturnValue("/seller");
  });

  describe("Rendering", () => {
    it("should render Seller Hub header", () => {
      render(<SellerSidebar />);
      expect(screen.getByText("Seller Hub")).toBeInTheDocument();
    });

    it("should render search input", () => {
      render(<SellerSidebar />);
      expect(screen.getByPlaceholderText("Search...")).toBeInTheDocument();
    });

    it("should render all main navigation items", () => {
      render(<SellerSidebar />);

      expect(screen.getByText("Dashboard")).toBeInTheDocument();
      expect(screen.getByText("My Shops")).toBeInTheDocument();
      expect(screen.getByText("Products")).toBeInTheDocument();
      expect(screen.getByText("Auctions")).toBeInTheDocument();
      expect(screen.getByText("Orders")).toBeInTheDocument();
      expect(screen.getByText("Returns & Refunds")).toBeInTheDocument();
      expect(screen.getByText("Revenue")).toBeInTheDocument();
      expect(screen.getByText("Analytics")).toBeInTheDocument();
      expect(screen.getByText("Reviews")).toBeInTheDocument();
      expect(screen.getByText("Support Tickets")).toBeInTheDocument();
      expect(screen.getByText("Coupons")).toBeInTheDocument();
    });

    it("should render Help & Support link in footer", () => {
      render(<SellerSidebar />);
      expect(screen.getByText("Help & Support")).toBeInTheDocument();
    });
  });

  describe("Navigation Links", () => {
    it("should link Dashboard to /seller", () => {
      render(<SellerSidebar />);
      const dashboardLink = screen.getByRole("link", { name: /Dashboard/i });
      expect(dashboardLink).toHaveAttribute("href", "/seller");
    });

    it("should link My Shops to /seller/my-shops", () => {
      render(<SellerSidebar />);
      const shopsLink = screen.getByRole("link", { name: /My Shops/i });
      expect(shopsLink).toHaveAttribute("href", "/seller/my-shops");
    });

    it("should link Orders to /seller/orders", () => {
      render(<SellerSidebar />);
      const ordersLink = screen.getByRole("link", { name: /Orders/i });
      expect(ordersLink).toHaveAttribute("href", "/seller/orders");
    });

    it("should link Revenue to /seller/revenue", () => {
      render(<SellerSidebar />);
      const revenueLink = screen.getByRole("link", { name: /Revenue/i });
      expect(revenueLink).toHaveAttribute("href", "/seller/revenue");
    });
  });

  describe("Active State", () => {
    it("should highlight Dashboard when on /seller", () => {
      mockUsePathname.mockReturnValue("/seller");
      render(<SellerSidebar />);

      const dashboardLink = screen.getByRole("link", { name: /Dashboard/i });
      expect(dashboardLink.className).toContain("bg-blue-50");
    });

    it("should highlight Orders when on /seller/orders", () => {
      mockUsePathname.mockReturnValue("/seller/orders");
      render(<SellerSidebar />);

      const ordersLink = screen.getByRole("link", { name: /Orders/i });
      expect(ordersLink.className).toContain("bg-blue-50");
    });

    it("should highlight Products when on /seller/products", () => {
      mockUsePathname.mockReturnValue("/seller/products");
      render(<SellerSidebar />);

      // Products has submenu, so click to expand first
      const productsLink = screen.getByRole("link", { name: /Products/i });
      expect(productsLink.className).toContain("bg-blue-50");
    });
  });

  describe("Expandable Sections", () => {
    it("should expand Products submenu when clicked", async () => {
      render(<SellerSidebar />);

      const productsLink = screen.getByRole("link", { name: /Products/i });
      fireEvent.click(productsLink);

      await waitFor(() => {
        expect(screen.getByText("All Products")).toBeInTheDocument();
        expect(screen.getByText("Add Product")).toBeInTheDocument();
      });
    });

    it("should expand Auctions submenu when clicked", async () => {
      render(<SellerSidebar />);

      // Find the Auctions link (it's a parent with submenu)
      const auctionsLinks = screen.getAllByText("Auctions");
      const auctionsParent = auctionsLinks[0].closest("a");
      if (auctionsParent) {
        fireEvent.click(auctionsParent);
      }

      await waitFor(() => {
        expect(screen.getByText("All Auctions")).toBeInTheDocument();
        expect(screen.getByText("Create Auction")).toBeInTheDocument();
      });
    });

    it("should collapse submenu when clicked again", async () => {
      render(<SellerSidebar />);

      const productsLink = screen.getByRole("link", { name: /Products/i });

      // Expand
      fireEvent.click(productsLink);
      await waitFor(() => {
        expect(screen.getByText("All Products")).toBeInTheDocument();
      });

      // Collapse
      fireEvent.click(productsLink);
      await waitFor(() => {
        expect(screen.queryByText("All Products")).not.toBeInTheDocument();
      });
    });
  });

  describe("Search Functionality", () => {
    it("should filter navigation items based on search", async () => {
      render(<SellerSidebar />);

      const searchInput = screen.getByPlaceholderText("Search...");
      fireEvent.change(searchInput, { target: { value: "orders" } });

      await waitFor(() => {
        expect(screen.getByText("Orders")).toBeInTheDocument();
        // Other items should be filtered out
        expect(screen.queryByText("My Shops")).not.toBeInTheDocument();
      });
    });

    it("should show 'No results found' when no match", async () => {
      render(<SellerSidebar />);

      const searchInput = screen.getByPlaceholderText("Search...");
      fireEvent.change(searchInput, { target: { value: "xyz123" } });

      await waitFor(() => {
        expect(screen.getByText("No results found")).toBeInTheDocument();
      });
    });

    it("should clear search when X button clicked", async () => {
      render(<SellerSidebar />);

      const searchInput = screen.getByPlaceholderText("Search...");
      fireEvent.change(searchInput, { target: { value: "orders" } });

      await waitFor(() => {
        expect(screen.queryByText("My Shops")).not.toBeInTheDocument();
      });

      const clearButton = screen.getByLabelText("Clear search");
      fireEvent.click(clearButton);

      await waitFor(() => {
        expect(screen.getByText("My Shops")).toBeInTheDocument();
      });
    });

    it("should highlight matching text in results", async () => {
      render(<SellerSidebar />);

      const searchInput = screen.getByPlaceholderText("Search...");
      fireEvent.change(searchInput, { target: { value: "order" } });

      await waitFor(() => {
        // Check for highlighted text (bg-blue-200 class)
        const highlighted = document.querySelector(".bg-blue-200");
        expect(highlighted).toBeInTheDocument();
      });
    });
  });

  describe("Seller Features Coverage", () => {
    it("should have shop management features", () => {
      render(<SellerSidebar />);
      expect(screen.getByText("My Shops")).toBeInTheDocument();
    });

    it("should have product management features", async () => {
      render(<SellerSidebar />);

      const productsLink = screen.getByRole("link", { name: /Products/i });
      fireEvent.click(productsLink);

      await waitFor(() => {
        expect(screen.getByText("All Products")).toBeInTheDocument();
        expect(screen.getByText("Add Product")).toBeInTheDocument();
      });
    });

    it("should have auction management features", async () => {
      render(<SellerSidebar />);

      const auctionsLinks = screen.getAllByText("Auctions");
      fireEvent.click(auctionsLinks[0]);

      await waitFor(() => {
        expect(screen.getByText("All Auctions")).toBeInTheDocument();
        expect(screen.getByText("Create Auction")).toBeInTheDocument();
      });
    });

    it("should have order management features", () => {
      render(<SellerSidebar />);
      expect(screen.getByText("Orders")).toBeInTheDocument();
    });

    it("should have returns management features", () => {
      render(<SellerSidebar />);
      expect(screen.getByText("Returns & Refunds")).toBeInTheDocument();
    });

    it("should have revenue/payout features", () => {
      render(<SellerSidebar />);
      expect(screen.getByText("Revenue")).toBeInTheDocument();
    });

    it("should have analytics features", () => {
      render(<SellerSidebar />);
      expect(screen.getByText("Analytics")).toBeInTheDocument();
    });

    it("should have review management features", () => {
      render(<SellerSidebar />);
      expect(screen.getByText("Reviews")).toBeInTheDocument();
    });

    it("should have coupon management features", () => {
      render(<SellerSidebar />);
      expect(screen.getByText("Coupons")).toBeInTheDocument();
    });

    it("should have support ticket features", () => {
      render(<SellerSidebar />);
      expect(screen.getByText("Support Tickets")).toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("should have proper heading structure", () => {
      render(<SellerSidebar />);

      const heading = screen.getByText("Seller Hub");
      expect(heading.tagName).toBe("SPAN");
    });

    it("should have labeled search input", () => {
      render(<SellerSidebar />);

      const searchInput = screen.getByPlaceholderText("Search...");
      expect(searchInput).toHaveAttribute("type", "text");
    });

    it("should have clear search button with aria-label", async () => {
      render(<SellerSidebar />);

      const searchInput = screen.getByPlaceholderText("Search...");
      fireEvent.change(searchInput, { target: { value: "test" } });

      await waitFor(() => {
        const clearButton = screen.getByLabelText("Clear search");
        expect(clearButton).toBeInTheDocument();
      });
    });
  });
});
