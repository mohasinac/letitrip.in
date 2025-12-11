import "@testing-library/jest-dom";
import { fireEvent, render, screen } from "@testing-library/react";
import { usePathname } from "next/navigation";
import { MobileSellerSidebar } from "../MobileSellerSidebar";

// Mock Next.js navigation
jest.mock("next/navigation", () => ({
  usePathname: jest.fn(),
}));

describe("MobileSellerSidebar - Seller Navigation Component", () => {
  const mockOnClose = jest.fn();
  const mockPathname = usePathname as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockPathname.mockReturnValue("/seller");
    document.body.style.overflow = "";
  });

  afterEach(() => {
    document.body.style.overflow = "";
  });

  describe("Basic Rendering", () => {
    it("should not render when isOpen is false", () => {
      render(<MobileSellerSidebar isOpen={false} onClose={mockOnClose} />);
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    it("should render when isOpen is true", () => {
      render(<MobileSellerSidebar isOpen={true} onClose={mockOnClose} />);
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });

    it("should have aria-label='Seller navigation'", () => {
      render(<MobileSellerSidebar isOpen={true} onClose={mockOnClose} />);
      expect(screen.getByLabelText("Seller navigation")).toBeInTheDocument();
    });

    it("should have aria-modal=true", () => {
      render(<MobileSellerSidebar isOpen={true} onClose={mockOnClose} />);
      const dialog = screen.getByRole("dialog");
      expect(dialog).toHaveAttribute("aria-modal", "true");
    });

    it("should be hidden on desktop (lg:hidden)", () => {
      render(<MobileSellerSidebar isOpen={true} onClose={mockOnClose} />);
      const sidebar = screen.getByRole("dialog");
      expect(sidebar).toHaveClass("lg:hidden");
    });
  });

  describe("Header Section", () => {
    it("should render Seller Hub title", () => {
      render(<MobileSellerSidebar isOpen={true} onClose={mockOnClose} />);
      expect(screen.getByText("Seller Hub")).toBeInTheDocument();
    });

    it("should render Store icon in header", () => {
      const { container } = render(
        <MobileSellerSidebar isOpen={true} onClose={mockOnClose} />
      );
      const header = container.querySelector(".h-16");
      expect(header).toBeInTheDocument();
    });

    it("should have blue Store icon (text-blue-600)", () => {
      const { container } = render(
        <MobileSellerSidebar isOpen={true} onClose={mockOnClose} />
      );
      const storeIcon = container.querySelector(".text-blue-600");
      expect(storeIcon).toBeInTheDocument();
    });

    it("should have border-b on header", () => {
      const { container } = render(
        <MobileSellerSidebar isOpen={true} onClose={mockOnClose} />
      );
      const header = container.querySelector(".border-b");
      expect(header).toBeInTheDocument();
    });

    it("should render close button with X icon", () => {
      render(<MobileSellerSidebar isOpen={true} onClose={mockOnClose} />);
      const closeButton = screen.getByLabelText("Close menu");
      expect(closeButton).toBeInTheDocument();
    });

    it("should call onClose when close button clicked", () => {
      render(<MobileSellerSidebar isOpen={true} onClose={mockOnClose} />);
      fireEvent.click(screen.getByLabelText("Close menu"));
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it("should have touch-target on close button", () => {
      render(<MobileSellerSidebar isOpen={true} onClose={mockOnClose} />);
      const closeButton = screen.getByLabelText("Close menu");
      expect(closeButton).toHaveClass("touch-target");
    });
  });

  describe("Quick Actions Section", () => {
    it("should render Add Product button", () => {
      render(<MobileSellerSidebar isOpen={true} onClose={mockOnClose} />);
      expect(screen.getByText("Add Product")).toBeInTheDocument();
    });

    it("should render Auction button", () => {
      render(<MobileSellerSidebar isOpen={true} onClose={mockOnClose} />);
      expect(screen.getByText("Auction")).toBeInTheDocument();
    });

    it("should have bg-blue-50 on quick actions container", () => {
      const { container } = render(
        <MobileSellerSidebar isOpen={true} onClose={mockOnClose} />
      );
      expect(container.querySelector(".bg-blue-50")).toBeInTheDocument();
    });

    it("should have grid-cols-2 layout", () => {
      const { container } = render(
        <MobileSellerSidebar isOpen={true} onClose={mockOnClose} />
      );
      expect(container.querySelector(".grid-cols-2")).toBeInTheDocument();
    });

    it("should have border-b on quick actions", () => {
      const { container } = render(
        <MobileSellerSidebar isOpen={true} onClose={mockOnClose} />
      );
      const quickActions = container.querySelector(".bg-blue-50");
      expect(quickActions).toHaveClass("border-b");
    });

    it("should call onClose when Add Product clicked", () => {
      render(<MobileSellerSidebar isOpen={true} onClose={mockOnClose} />);
      fireEvent.click(screen.getByText("Add Product"));
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it("should call onClose when Auction clicked", () => {
      render(<MobileSellerSidebar isOpen={true} onClose={mockOnClose} />);
      fireEvent.click(screen.getByText("Auction"));
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it("should have blue background on Add Product button", () => {
      render(<MobileSellerSidebar isOpen={true} onClose={mockOnClose} />);
      const addProductButton = screen.getByText("Add Product").closest("a");
      expect(addProductButton).toHaveClass("bg-blue-600");
    });

    it("should have white border on Auction button", () => {
      render(<MobileSellerSidebar isOpen={true} onClose={mockOnClose} />);
      const auctionButton = screen.getByText("Auction").closest("a");
      expect(auctionButton).toHaveClass("border-blue-600");
    });
  });

  describe("Navigation Items", () => {
    it("should render Dashboard link", () => {
      render(<MobileSellerSidebar isOpen={true} onClose={mockOnClose} />);
      expect(screen.getByText("Dashboard")).toBeInTheDocument();
    });

    it("should render My Shops link", () => {
      render(<MobileSellerSidebar isOpen={true} onClose={mockOnClose} />);
      expect(screen.getByText("My Shops")).toBeInTheDocument();
    });

    it("should render Products section", () => {
      render(<MobileSellerSidebar isOpen={true} onClose={mockOnClose} />);
      const productLinks = screen.getAllByText("Products");
      expect(productLinks.length).toBeGreaterThan(0);
    });

    it("should render Auctions section", () => {
      render(<MobileSellerSidebar isOpen={true} onClose={mockOnClose} />);
      const auctionLinks = screen.getAllByText("Auctions");
      expect(auctionLinks.length).toBeGreaterThan(0);
    });

    it("should render Orders link", () => {
      render(<MobileSellerSidebar isOpen={true} onClose={mockOnClose} />);
      expect(screen.getByText("Orders")).toBeInTheDocument();
    });

    it("should render Returns & Refunds link", () => {
      render(<MobileSellerSidebar isOpen={true} onClose={mockOnClose} />);
      expect(screen.getByText("Returns & Refunds")).toBeInTheDocument();
    });

    it("should render Revenue link", () => {
      render(<MobileSellerSidebar isOpen={true} onClose={mockOnClose} />);
      expect(screen.getByText("Revenue")).toBeInTheDocument();
    });

    it("should render Analytics link", () => {
      render(<MobileSellerSidebar isOpen={true} onClose={mockOnClose} />);
      expect(screen.getByText("Analytics")).toBeInTheDocument();
    });

    it("should render Reviews link", () => {
      render(<MobileSellerSidebar isOpen={true} onClose={mockOnClose} />);
      expect(screen.getByText("Reviews")).toBeInTheDocument();
    });

    it("should render Coupons link", () => {
      render(<MobileSellerSidebar isOpen={true} onClose={mockOnClose} />);
      expect(screen.getByText("Coupons")).toBeInTheDocument();
    });
  });

  describe("Active State", () => {
    it("should highlight active route (exact match)", () => {
      mockPathname.mockReturnValue("/seller");
      const { container } = render(
        <MobileSellerSidebar isOpen={true} onClose={mockOnClose} />
      );
      const activeLink = container.querySelector(".bg-blue-50");
      expect(activeLink).toBeInTheDocument();
    });

    it("should highlight active route (starts with match)", () => {
      mockPathname.mockReturnValue("/seller/products/add");
      const { container } = render(
        <MobileSellerSidebar isOpen={true} onClose={mockOnClose} />
      );
      const activeLink = container.querySelector(".text-blue-700");
      expect(activeLink).toBeInTheDocument();
    });

    it("should apply blue background to active link", () => {
      mockPathname.mockReturnValue("/seller/revenue");
      const { container } = render(
        <MobileSellerSidebar isOpen={true} onClose={mockOnClose} />
      );
      expect(container.querySelector(".bg-blue-50")).toBeInTheDocument();
    });

    it("should apply blue text to active link", () => {
      mockPathname.mockReturnValue("/seller/analytics");
      const { container } = render(
        <MobileSellerSidebar isOpen={true} onClose={mockOnClose} />
      );
      expect(container.querySelector(".text-blue-700")).toBeInTheDocument();
    });
  });

  describe("Expandable Sections", () => {
    it("should not show submenu items initially", () => {
      render(<MobileSellerSidebar isOpen={true} onClose={mockOnClose} />);
      expect(screen.queryByText("All Products")).not.toBeInTheDocument();
    });

    it("should expand section when clicked", () => {
      render(<MobileSellerSidebar isOpen={true} onClose={mockOnClose} />);
      const productLinks = screen.getAllByText("Products");
      fireEvent.click(productLinks[0]);
      expect(screen.getByText("All Products")).toBeInTheDocument();
    });

    it("should toggle expansion on repeated clicks", () => {
      render(<MobileSellerSidebar isOpen={true} onClose={mockOnClose} />);
      const productLinks = screen.getAllByText("Products");
      fireEvent.click(productLinks[0]);
      expect(screen.getByText("All Products")).toBeInTheDocument();
      fireEvent.click(productLinks[0]);
      expect(screen.queryByText("All Products")).not.toBeInTheDocument();
    });

    it("should auto-expand active section on mount", () => {
      mockPathname.mockReturnValue("/seller/products");
      render(<MobileSellerSidebar isOpen={true} onClose={mockOnClose} />);
      expect(screen.getByText("All Products")).toBeInTheDocument();
    });

    it("should show ChevronDown when expanded", () => {
      const { container } = render(
        <MobileSellerSidebar isOpen={true} onClose={mockOnClose} />
      );
      const productLinks = screen.getAllByText("Products");
      fireEvent.click(productLinks[0]);
      expect(container.querySelector(".h-4.w-4")).toBeInTheDocument();
    });

    it("should show ChevronRight when collapsed", () => {
      const { container } = render(
        <MobileSellerSidebar isOpen={true} onClose={mockOnClose} />
      );
      const productLinks = screen.getAllByText("Products");
      fireEvent.click(productLinks[0]);
      fireEvent.click(productLinks[0]);
      expect(container.querySelector(".h-4.w-4")).toBeInTheDocument();
    });
  });

  describe("Submenu Items", () => {
    it("should render All Products submenu item", () => {
      render(<MobileSellerSidebar isOpen={true} onClose={mockOnClose} />);
      const productLinks = screen.getAllByText("Products");
      fireEvent.click(productLinks[0]);
      expect(screen.getByText("All Products")).toBeInTheDocument();
    });

    it("should render All Auctions submenu item", () => {
      render(<MobileSellerSidebar isOpen={true} onClose={mockOnClose} />);
      const auctionLinks = screen.getAllByText("Auctions");
      fireEvent.click(auctionLinks[0]);
      expect(screen.getByText("All Auctions")).toBeInTheDocument();
    });

    it("should render Create Auction submenu item", () => {
      render(<MobileSellerSidebar isOpen={true} onClose={mockOnClose} />);
      const auctionLinks = screen.getAllByText("Auctions");
      fireEvent.click(auctionLinks[0]);
      expect(screen.getByText("Create Auction")).toBeInTheDocument();
    });

    it("should call onClose when submenu item clicked", () => {
      render(<MobileSellerSidebar isOpen={true} onClose={mockOnClose} />);
      const productLinks = screen.getAllByText("Products");
      fireEvent.click(productLinks[0]);
      fireEvent.click(screen.getByText("All Products"));
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it("should have touch-target on submenu items", () => {
      render(<MobileSellerSidebar isOpen={true} onClose={mockOnClose} />);
      const productLinks = screen.getAllByText("Products");
      fireEvent.click(productLinks[0]);
      const allProducts = screen.getByText("All Products").closest("a");
      expect(allProducts).toHaveClass("touch-target");
    });

    it("should have ml-8 indentation on submenu", () => {
      render(<MobileSellerSidebar isOpen={true} onClose={mockOnClose} />);
      const productLinks = screen.getAllByText("Products");
      fireEvent.click(productLinks[0]);
      expect(screen.getByText("All Products")).toBeInTheDocument();
    });
  });

  describe("Footer Section", () => {
    it("should render Back to Site link", () => {
      render(<MobileSellerSidebar isOpen={true} onClose={mockOnClose} />);
      expect(screen.getByText("Back to Site")).toBeInTheDocument();
    });

    it("should have pb-safe for safe area", () => {
      const { container } = render(
        <MobileSellerSidebar isOpen={true} onClose={mockOnClose} />
      );
      expect(container.querySelector(".pb-safe")).toBeInTheDocument();
    });

    it("should have border-t on footer", () => {
      const { container } = render(
        <MobileSellerSidebar isOpen={true} onClose={mockOnClose} />
      );
      const footer = container.querySelector(".pb-safe");
      expect(footer).toHaveClass("border-t");
    });

    it("should call onClose when Back to Site clicked", () => {
      render(<MobileSellerSidebar isOpen={true} onClose={mockOnClose} />);
      fireEvent.click(screen.getByText("Back to Site"));
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it("should render arrow left icon in footer", () => {
      const { container } = render(
        <MobileSellerSidebar isOpen={true} onClose={mockOnClose} />
      );
      const footer = container.querySelector(".pb-safe");
      const svg = footer?.querySelector("svg");
      expect(svg).toBeInTheDocument();
    });
  });

  describe("Body Scroll Lock", () => {
    it("should lock body scroll when opened", () => {
      const { rerender } = render(
        <MobileSellerSidebar isOpen={false} onClose={mockOnClose} />
      );
      expect(document.body.style.overflow).toBe("");

      rerender(<MobileSellerSidebar isOpen={true} onClose={mockOnClose} />);
      expect(document.body.style.overflow).toBe("hidden");
    });

    it("should unlock body scroll when closed", () => {
      const { rerender } = render(
        <MobileSellerSidebar isOpen={true} onClose={mockOnClose} />
      );
      expect(document.body.style.overflow).toBe("hidden");

      rerender(<MobileSellerSidebar isOpen={false} onClose={mockOnClose} />);
      expect(document.body.style.overflow).toBe("");
    });

    it("should cleanup body scroll on unmount", () => {
      const { unmount } = render(
        <MobileSellerSidebar isOpen={true} onClose={mockOnClose} />
      );
      expect(document.body.style.overflow).toBe("hidden");

      unmount();
      expect(document.body.style.overflow).toBe("");
    });
  });

  describe("Dark Mode Support", () => {
    it("should have dark mode classes on sidebar", () => {
      render(<MobileSellerSidebar isOpen={true} onClose={mockOnClose} />);
      const sidebar = screen.getByRole("dialog");
      expect(sidebar).toHaveClass("dark:bg-gray-900");
    });

    it("should have dark mode classes on header border", () => {
      const { container } = render(
        <MobileSellerSidebar isOpen={true} onClose={mockOnClose} />
      );
      const header = container.querySelector(".border-b");
      expect(header).toHaveClass("dark:border-gray-700");
    });

    it("should have dark mode text on title", () => {
      const { container } = render(
        <MobileSellerSidebar isOpen={true} onClose={mockOnClose} />
      );
      const title = container.querySelector(".text-lg");
      expect(title).toHaveClass("dark:text-white");
    });

    it("should have dark mode hover states", () => {
      const { container } = render(
        <MobileSellerSidebar isOpen={true} onClose={mockOnClose} />
      );
      const closeButton = screen.getByLabelText("Close menu");
      expect(closeButton).toHaveClass("dark:hover:bg-gray-800");
    });

    it("should have dark mode on quick actions", () => {
      const { container } = render(
        <MobileSellerSidebar isOpen={true} onClose={mockOnClose} />
      );
      const quickActions = container.querySelector(".bg-blue-50");
      expect(quickActions).toHaveClass("dark:bg-blue-900/20");
    });
  });

  describe("Accessibility", () => {
    it("should have role=dialog", () => {
      render(<MobileSellerSidebar isOpen={true} onClose={mockOnClose} />);
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });

    it("should have aria-modal=true", () => {
      render(<MobileSellerSidebar isOpen={true} onClose={mockOnClose} />);
      expect(screen.getByRole("dialog")).toHaveAttribute("aria-modal", "true");
    });

    it("should have aria-label on main nav", () => {
      render(<MobileSellerSidebar isOpen={true} onClose={mockOnClose} />);
      expect(screen.getByLabelText("Seller navigation")).toBeInTheDocument();
    });

    it("should have aria-label on close button", () => {
      render(<MobileSellerSidebar isOpen={true} onClose={mockOnClose} />);
      expect(screen.getByLabelText("Close menu")).toBeInTheDocument();
    });

    it("should have aria-hidden on overlay", () => {
      const { container } = render(
        <MobileSellerSidebar isOpen={true} onClose={mockOnClose} />
      );
      const overlay = container.querySelector(".bg-black\\/50");
      expect(overlay).toHaveAttribute("aria-hidden", "true");
    });
  });

  describe("Edge Cases", () => {
    it("should handle pathname=null gracefully", () => {
      mockPathname.mockReturnValue(null);
      expect(() => {
        render(<MobileSellerSidebar isOpen={true} onClose={mockOnClose} />);
      }).not.toThrow();
    });

    it("should handle rapid toggle operations", () => {
      render(<MobileSellerSidebar isOpen={true} onClose={mockOnClose} />);
      const productLinks = screen.getAllByText("Products");
      for (let i = 0; i < 10; i++) {
        fireEvent.click(productLinks[0]);
      }
      expect(screen.queryByText("All Products")).not.toBeInTheDocument();
    });

    it("should handle clicking header link to close sidebar", () => {
      render(<MobileSellerSidebar isOpen={true} onClose={mockOnClose} />);
      const sellerHubLink = screen.getByText("Seller Hub").closest("a");
      fireEvent.click(sellerHubLink!);
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it("should handle multiple expanded sections", () => {
      render(<MobileSellerSidebar isOpen={true} onClose={mockOnClose} />);
      const productLinks = screen.getAllByText("Products");
      const auctionLinks = screen.getAllByText("Auctions");
      fireEvent.click(productLinks[0]);
      fireEvent.click(auctionLinks[0]);
      expect(screen.getByText("All Products")).toBeInTheDocument();
      expect(screen.getByText("All Auctions")).toBeInTheDocument();
    });
  });

  describe("Performance", () => {
    it("should handle rendering all nav items without crash", () => {
      expect(() => {
        render(<MobileSellerSidebar isOpen={true} onClose={mockOnClose} />);
      }).not.toThrow();
    });

    it("should handle expanding all sections simultaneously", () => {
      render(<MobileSellerSidebar isOpen={true} onClose={mockOnClose} />);
      const productLinks = screen.getAllByText("Products");
      const auctionLinks = screen.getAllByText("Auctions");
      fireEvent.click(productLinks[0]);
      fireEvent.click(auctionLinks[0]);
      expect(screen.getByText("All Products")).toBeInTheDocument();
      expect(screen.getByText("Create Auction")).toBeInTheDocument();
    });
  });

  describe("Overlay", () => {
    it("should render overlay backdrop", () => {
      const { container } = render(
        <MobileSellerSidebar isOpen={true} onClose={mockOnClose} />
      );
      const overlay = container.querySelector(".bg-black\\/50");
      expect(overlay).toBeInTheDocument();
    });

    it("should call onClose when overlay clicked", () => {
      const { container } = render(
        <MobileSellerSidebar isOpen={true} onClose={mockOnClose} />
      );
      const overlay = container.querySelector(".bg-black\\/50");
      fireEvent.click(overlay!);
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it("should have z-50 on overlay", () => {
      const { container } = render(
        <MobileSellerSidebar isOpen={true} onClose={mockOnClose} />
      );
      const overlay = container.querySelector(".z-50");
      expect(overlay).toBeInTheDocument();
    });

    it("should have animate-fade-in on overlay", () => {
      const { container } = render(
        <MobileSellerSidebar isOpen={true} onClose={mockOnClose} />
      );
      const overlay = container.querySelector(".animate-fade-in");
      expect(overlay).toBeInTheDocument();
    });
  });

  describe("Sidebar Positioning & Styling", () => {
    it("should have fixed positioning", () => {
      render(<MobileSellerSidebar isOpen={true} onClose={mockOnClose} />);
      const sidebar = screen.getByRole("dialog");
      expect(sidebar).toHaveClass("fixed");
    });

    it("should have w-80 width", () => {
      render(<MobileSellerSidebar isOpen={true} onClose={mockOnClose} />);
      const sidebar = screen.getByRole("dialog");
      expect(sidebar).toHaveClass("w-80");
    });

    it("should have z-[60] for stacking", () => {
      render(<MobileSellerSidebar isOpen={true} onClose={mockOnClose} />);
      const sidebar = screen.getByRole("dialog");
      expect(sidebar).toHaveClass("z-[60]");
    });

    it("should have animate-slide-in-left animation", () => {
      render(<MobileSellerSidebar isOpen={true} onClose={mockOnClose} />);
      const sidebar = screen.getByRole("dialog");
      expect(sidebar).toHaveClass("animate-slide-in-left");
    });

    it("should have flex-col layout", () => {
      render(<MobileSellerSidebar isOpen={true} onClose={mockOnClose} />);
      const sidebar = screen.getByRole("dialog");
      expect(sidebar).toHaveClass("flex-col");
    });
  });
});
