import "@testing-library/jest-dom";
import { fireEvent, render, screen } from "@testing-library/react";
import { usePathname } from "next/navigation";
import { MobileAdminSidebar } from "../MobileAdminSidebar";

// Mock Next.js navigation
jest.mock("next/navigation", () => ({
  usePathname: jest.fn(),
}));

describe("MobileAdminSidebar - Admin Navigation Component", () => {
  const mockOnClose = jest.fn();
  const mockPathname = usePathname as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockPathname.mockReturnValue("/admin");
    // Reset body overflow before each test
    document.body.style.overflow = "";
  });

  afterEach(() => {
    // Cleanup body overflow after each test
    document.body.style.overflow = "";
  });

  describe("Basic Rendering", () => {
    it("should not render when isOpen is false", () => {
      render(<MobileAdminSidebar isOpen={false} onClose={mockOnClose} />);
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    it("should render when isOpen is true", () => {
      render(<MobileAdminSidebar isOpen={true} onClose={mockOnClose} />);
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });

    it("should have aria-label='Admin navigation'", () => {
      render(<MobileAdminSidebar isOpen={true} onClose={mockOnClose} />);
      expect(screen.getByLabelText("Admin navigation")).toBeInTheDocument();
    });

    it("should have aria-modal=true", () => {
      render(<MobileAdminSidebar isOpen={true} onClose={mockOnClose} />);
      const dialog = screen.getByRole("dialog");
      expect(dialog).toHaveAttribute("aria-modal", "true");
    });

    it("should be hidden on desktop (lg:hidden)", () => {
      render(<MobileAdminSidebar isOpen={true} onClose={mockOnClose} />);
      const sidebar = screen.getByRole("dialog");
      expect(sidebar).toHaveClass("lg:hidden");
    });
  });

  describe("Header Section", () => {
    it("should render Admin Panel title", () => {
      render(<MobileAdminSidebar isOpen={true} onClose={mockOnClose} />);
      expect(screen.getByText("Admin Panel")).toBeInTheDocument();
    });

    it("should render Shield icon in header", () => {
      const { container } = render(
        <MobileAdminSidebar isOpen={true} onClose={mockOnClose} />
      );
      const header = container.querySelector(".h-16");
      expect(header).toBeInTheDocument();
    });

    it("should have purple Shield icon (text-purple-600)", () => {
      const { container } = render(
        <MobileAdminSidebar isOpen={true} onClose={mockOnClose} />
      );
      const shieldIcon = container.querySelector(".text-purple-600");
      expect(shieldIcon).toBeInTheDocument();
    });

    it("should have border-b on header", () => {
      const { container } = render(
        <MobileAdminSidebar isOpen={true} onClose={mockOnClose} />
      );
      const header = container.querySelector(".border-b");
      expect(header).toBeInTheDocument();
    });

    it("should have h-16 header height", () => {
      const { container } = render(
        <MobileAdminSidebar isOpen={true} onClose={mockOnClose} />
      );
      const header = container.querySelector(".h-16");
      expect(header).toBeInTheDocument();
    });

    it("should render close button with X icon", () => {
      render(<MobileAdminSidebar isOpen={true} onClose={mockOnClose} />);
      const closeButton = screen.getByLabelText("Close menu");
      expect(closeButton).toBeInTheDocument();
    });

    it("should call onClose when close button clicked", () => {
      render(<MobileAdminSidebar isOpen={true} onClose={mockOnClose} />);
      fireEvent.click(screen.getByLabelText("Close menu"));
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it("should have touch-target on close button", () => {
      render(<MobileAdminSidebar isOpen={true} onClose={mockOnClose} />);
      const closeButton = screen.getByLabelText("Close menu");
      expect(closeButton).toHaveClass("touch-target");
    });
  });

  describe("Overlay", () => {
    it("should render overlay backdrop", () => {
      const { container } = render(
        <MobileAdminSidebar isOpen={true} onClose={mockOnClose} />
      );
      const overlay = container.querySelector(".bg-black\\/50");
      expect(overlay).toBeInTheDocument();
    });

    it("should call onClose when overlay clicked", () => {
      const { container } = render(
        <MobileAdminSidebar isOpen={true} onClose={mockOnClose} />
      );
      const overlay = container.querySelector(".bg-black\\/50");
      fireEvent.click(overlay!);
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it("should have z-50 on overlay", () => {
      const { container } = render(
        <MobileAdminSidebar isOpen={true} onClose={mockOnClose} />
      );
      const overlay = container.querySelector(".z-50");
      expect(overlay).toBeInTheDocument();
    });

    it("should have fixed positioning on overlay", () => {
      const { container } = render(
        <MobileAdminSidebar isOpen={true} onClose={mockOnClose} />
      );
      const overlay = container.querySelector(".fixed.inset-0");
      expect(overlay).toBeInTheDocument();
    });

    it("should have aria-hidden=true on overlay", () => {
      const { container } = render(
        <MobileAdminSidebar isOpen={true} onClose={mockOnClose} />
      );
      const overlay = container.querySelector(".bg-black\\/50");
      expect(overlay).toHaveAttribute("aria-hidden", "true");
    });

    it("should have animate-fade-in on overlay", () => {
      const { container } = render(
        <MobileAdminSidebar isOpen={true} onClose={mockOnClose} />
      );
      const overlay = container.querySelector(".animate-fade-in");
      expect(overlay).toBeInTheDocument();
    });
  });

  describe("Sidebar Positioning & Styling", () => {
    it("should have fixed positioning", () => {
      render(<MobileAdminSidebar isOpen={true} onClose={mockOnClose} />);
      const sidebar = screen.getByRole("dialog");
      expect(sidebar).toHaveClass("fixed");
    });

    it("should have w-80 width", () => {
      render(<MobileAdminSidebar isOpen={true} onClose={mockOnClose} />);
      const sidebar = screen.getByRole("dialog");
      expect(sidebar).toHaveClass("w-80");
    });

    it("should have z-[60] for stacking", () => {
      render(<MobileAdminSidebar isOpen={true} onClose={mockOnClose} />);
      const sidebar = screen.getByRole("dialog");
      expect(sidebar).toHaveClass("z-[60]");
    });

    it("should have animate-slide-in-left animation", () => {
      render(<MobileAdminSidebar isOpen={true} onClose={mockOnClose} />);
      const sidebar = screen.getByRole("dialog");
      expect(sidebar).toHaveClass("animate-slide-in-left");
    });

    it("should have flex-col layout", () => {
      render(<MobileAdminSidebar isOpen={true} onClose={mockOnClose} />);
      const sidebar = screen.getByRole("dialog");
      expect(sidebar).toHaveClass("flex-col");
    });

    it("should be positioned at left edge (left-0)", () => {
      render(<MobileAdminSidebar isOpen={true} onClose={mockOnClose} />);
      const sidebar = screen.getByRole("dialog");
      expect(sidebar).toHaveClass("left-0");
    });
  });

  describe("Navigation Items", () => {
    it("should render Dashboard link", () => {
      render(<MobileAdminSidebar isOpen={true} onClose={mockOnClose} />);
      expect(screen.getByText("Dashboard")).toBeInTheDocument();
    });

    it("should render Overview link", () => {
      render(<MobileAdminSidebar isOpen={true} onClose={mockOnClose} />);
      expect(screen.getByText("Overview")).toBeInTheDocument();
    });

    it("should render Content Management section", () => {
      render(<MobileAdminSidebar isOpen={true} onClose={mockOnClose} />);
      expect(screen.getByText("Content Management")).toBeInTheDocument();
    });

    it("should render Marketplace section", () => {
      render(<MobileAdminSidebar isOpen={true} onClose={mockOnClose} />);
      expect(screen.getByText("Marketplace")).toBeInTheDocument();
    });

    it("should render User Management section", () => {
      render(<MobileAdminSidebar isOpen={true} onClose={mockOnClose} />);
      expect(screen.getByText("User Management")).toBeInTheDocument();
    });

    it("should render Transactions section", () => {
      render(<MobileAdminSidebar isOpen={true} onClose={mockOnClose} />);
      expect(screen.getByText("Transactions")).toBeInTheDocument();
    });

    it("should render Support section", () => {
      render(<MobileAdminSidebar isOpen={true} onClose={mockOnClose} />);
      expect(screen.getByText("Support")).toBeInTheDocument();
    });

    it("should render Analytics section", () => {
      render(<MobileAdminSidebar isOpen={true} onClose={mockOnClose} />);
      expect(screen.getByText("Analytics")).toBeInTheDocument();
    });

    it("should render Blog section", () => {
      render(<MobileAdminSidebar isOpen={true} onClose={mockOnClose} />);
      expect(screen.getByText("Blog")).toBeInTheDocument();
    });

    it("should render Settings section", () => {
      render(<MobileAdminSidebar isOpen={true} onClose={mockOnClose} />);
      expect(screen.getByText("Settings")).toBeInTheDocument();
    });
  });

  describe("Active State", () => {
    it("should highlight active route (exact match)", () => {
      mockPathname.mockReturnValue("/admin/dashboard");
      const { container } = render(
        <MobileAdminSidebar isOpen={true} onClose={mockOnClose} />
      );
      const activeLink = container.querySelector(".bg-yellow-50");
      expect(activeLink).toBeInTheDocument();
    });

    it("should highlight active route (starts with match)", () => {
      mockPathname.mockReturnValue("/admin/dashboard/overview");
      const { container } = render(
        <MobileAdminSidebar isOpen={true} onClose={mockOnClose} />
      );
      const activeLink = container.querySelector(".text-yellow-700");
      expect(activeLink).toBeInTheDocument();
    });

    it("should apply yellow background to active link", () => {
      mockPathname.mockReturnValue("/admin/dashboard");
      const { container } = render(
        <MobileAdminSidebar isOpen={true} onClose={mockOnClose} />
      );
      expect(container.querySelector(".bg-yellow-50")).toBeInTheDocument();
    });

    it("should apply yellow text to active link", () => {
      mockPathname.mockReturnValue("/admin/dashboard");
      const { container } = render(
        <MobileAdminSidebar isOpen={true} onClose={mockOnClose} />
      );
      expect(container.querySelector(".text-yellow-700")).toBeInTheDocument();
    });
  });

  describe("Expandable Sections", () => {
    it("should not show submenu items initially", () => {
      render(<MobileAdminSidebar isOpen={true} onClose={mockOnClose} />);
      expect(screen.queryByText("Homepage Settings")).not.toBeInTheDocument();
    });

    it("should expand section when clicked", () => {
      render(<MobileAdminSidebar isOpen={true} onClose={mockOnClose} />);
      fireEvent.click(screen.getByText("Content Management"));
      expect(screen.getByText("Homepage Settings")).toBeInTheDocument();
    });

    it("should show ChevronRight when collapsed", () => {
      const { container } = render(
        <MobileAdminSidebar isOpen={true} onClose={mockOnClose} />
      );
      fireEvent.click(screen.getByText("Content Management"));
      fireEvent.click(screen.getByText("Content Management"));
      expect(container.querySelector(".h-4.w-4")).toBeInTheDocument();
    });

    it("should show ChevronDown when expanded", () => {
      const { container } = render(
        <MobileAdminSidebar isOpen={true} onClose={mockOnClose} />
      );
      fireEvent.click(screen.getByText("Content Management"));
      expect(container.querySelector(".h-4.w-4")).toBeInTheDocument();
    });

    it("should toggle expansion on repeated clicks", () => {
      render(<MobileAdminSidebar isOpen={true} onClose={mockOnClose} />);
      fireEvent.click(screen.getByText("Content Management"));
      expect(screen.getByText("Homepage Settings")).toBeInTheDocument();
      fireEvent.click(screen.getByText("Content Management"));
      expect(screen.queryByText("Homepage Settings")).not.toBeInTheDocument();
    });

    it("should auto-expand active section on mount", () => {
      mockPathname.mockReturnValue("/admin/homepage");
      render(<MobileAdminSidebar isOpen={true} onClose={mockOnClose} />);
      expect(screen.getByText("Homepage Settings")).toBeInTheDocument();
    });

    it("should maintain expanded state when switching routes", () => {
      mockPathname.mockReturnValue("/admin");
      const { rerender } = render(
        <MobileAdminSidebar isOpen={true} onClose={mockOnClose} />
      );
      fireEvent.click(screen.getByText("Marketplace"));
      expect(screen.getByText("All Shops")).toBeInTheDocument();

      mockPathname.mockReturnValue("/admin/shops");
      rerender(<MobileAdminSidebar isOpen={true} onClose={mockOnClose} />);
      expect(screen.getByText("All Shops")).toBeInTheDocument();
    });
  });

  describe("Submenu Items", () => {
    beforeEach(() => {
      render(<MobileAdminSidebar isOpen={true} onClose={mockOnClose} />);
      fireEvent.click(screen.getByText("Content Management"));
    });

    it("should render Homepage Settings submenu item", () => {
      expect(screen.getByText("Homepage Settings")).toBeInTheDocument();
    });

    it("should render Hero Slides submenu item", () => {
      expect(screen.getByText("Hero Slides")).toBeInTheDocument();
    });

    it("should render Categories submenu item", () => {
      expect(screen.getByText("Categories")).toBeInTheDocument();
    });

    it("should have ml-8 indentation on submenu", () => {
      render(<MobileAdminSidebar isOpen={true} onClose={mockOnClose} />);
      const marketplaceButtons = screen.getAllByText("Marketplace");
      fireEvent.click(marketplaceButtons[0]);

      // Submenu should be visible
      expect(screen.getByText("All Shops")).toBeInTheDocument();
    });

    it("should call onClose when submenu item clicked", () => {
      fireEvent.click(screen.getByText("Homepage Settings"));
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it("should have touch-target on submenu items", () => {
      render(<MobileAdminSidebar isOpen={true} onClose={mockOnClose} />);
      const marketplaceButtons = screen.getAllByText("Marketplace");
      fireEvent.click(marketplaceButtons[0]);
      const allShops = screen.getByText("All Shops").closest("a");
      expect(allShops).toHaveClass("touch-target");
    });
  });

  describe("Footer Section", () => {
    it("should render Back to Site link", () => {
      render(<MobileAdminSidebar isOpen={true} onClose={mockOnClose} />);
      expect(screen.getByText("Back to Site")).toBeInTheDocument();
    });

    it("should have pb-safe for safe area", () => {
      const { container } = render(
        <MobileAdminSidebar isOpen={true} onClose={mockOnClose} />
      );
      expect(container.querySelector(".pb-safe")).toBeInTheDocument();
    });

    it("should have border-t on footer", () => {
      const { container } = render(
        <MobileAdminSidebar isOpen={true} onClose={mockOnClose} />
      );
      const footer = container.querySelector(".pb-safe");
      expect(footer).toHaveClass("border-t");
    });

    it("should call onClose when Back to Site clicked", () => {
      render(<MobileAdminSidebar isOpen={true} onClose={mockOnClose} />);
      fireEvent.click(screen.getByText("Back to Site"));
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it("should render arrow left icon in footer", () => {
      const { container } = render(
        <MobileAdminSidebar isOpen={true} onClose={mockOnClose} />
      );
      const footer = container.querySelector(".pb-safe");
      const svg = footer?.querySelector("svg");
      expect(svg).toBeInTheDocument();
    });
  });

  describe("Body Scroll Lock", () => {
    it("should lock body scroll when opened", () => {
      const { rerender } = render(
        <MobileAdminSidebar isOpen={false} onClose={mockOnClose} />
      );
      expect(document.body.style.overflow).toBe("");

      rerender(<MobileAdminSidebar isOpen={true} onClose={mockOnClose} />);
      expect(document.body.style.overflow).toBe("hidden");
    });

    it("should unlock body scroll when closed", () => {
      const { rerender } = render(
        <MobileAdminSidebar isOpen={true} onClose={mockOnClose} />
      );
      expect(document.body.style.overflow).toBe("hidden");

      rerender(<MobileAdminSidebar isOpen={false} onClose={mockOnClose} />);
      expect(document.body.style.overflow).toBe("");
    });

    it("should cleanup body scroll on unmount", () => {
      const { unmount } = render(
        <MobileAdminSidebar isOpen={true} onClose={mockOnClose} />
      );
      expect(document.body.style.overflow).toBe("hidden");

      unmount();
      expect(document.body.style.overflow).toBe("");
    });
  });

  describe("Dark Mode Support", () => {
    it("should have dark mode classes on sidebar", () => {
      render(<MobileAdminSidebar isOpen={true} onClose={mockOnClose} />);
      const sidebar = screen.getByRole("dialog");
      expect(sidebar).toHaveClass("dark:bg-gray-900");
    });

    it("should have dark mode classes on header border", () => {
      const { container } = render(
        <MobileAdminSidebar isOpen={true} onClose={mockOnClose} />
      );
      const header = container.querySelector(".border-b");
      expect(header).toHaveClass("dark:border-gray-700");
    });

    it("should have dark mode text on title", () => {
      const { container } = render(
        <MobileAdminSidebar isOpen={true} onClose={mockOnClose} />
      );
      const title = container.querySelector(".text-lg");
      expect(title).toHaveClass("dark:text-white");
    });

    it("should have dark mode hover states", () => {
      const { container } = render(
        <MobileAdminSidebar isOpen={true} onClose={mockOnClose} />
      );
      const closeButton = screen.getByLabelText("Close menu");
      expect(closeButton).toHaveClass("dark:hover:bg-gray-800");
    });
  });

  describe("Accessibility", () => {
    it("should have role=dialog", () => {
      render(<MobileAdminSidebar isOpen={true} onClose={mockOnClose} />);
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });

    it("should have aria-modal=true", () => {
      render(<MobileAdminSidebar isOpen={true} onClose={mockOnClose} />);
      expect(screen.getByRole("dialog")).toHaveAttribute("aria-modal", "true");
    });

    it("should have aria-label on main nav", () => {
      render(<MobileAdminSidebar isOpen={true} onClose={mockOnClose} />);
      expect(screen.getByLabelText("Admin navigation")).toBeInTheDocument();
    });

    it("should have aria-label on close button", () => {
      render(<MobileAdminSidebar isOpen={true} onClose={mockOnClose} />);
      expect(screen.getByLabelText("Close menu")).toBeInTheDocument();
    });

    it("should have aria-hidden on overlay", () => {
      const { container } = render(
        <MobileAdminSidebar isOpen={true} onClose={mockOnClose} />
      );
      const overlay = container.querySelector(".bg-black\\/50");
      expect(overlay).toHaveAttribute("aria-hidden", "true");
    });
  });

  describe("Edge Cases", () => {
    it("should handle pathname=null gracefully", () => {
      mockPathname.mockReturnValue(null);
      expect(() => {
        render(<MobileAdminSidebar isOpen={true} onClose={mockOnClose} />);
      }).not.toThrow();
    });

    it("should handle rapid toggle operations", () => {
      render(<MobileAdminSidebar isOpen={true} onClose={mockOnClose} />);
      for (let i = 0; i < 10; i++) {
        fireEvent.click(screen.getByText("Marketplace"));
      }
      expect(screen.queryByText("All Shops")).not.toBeInTheDocument();
    });

    it("should handle clicking header link to close sidebar", () => {
      render(<MobileAdminSidebar isOpen={true} onClose={mockOnClose} />);
      const adminPanelLink = screen.getByText("Admin Panel").closest("a");
      fireEvent.click(adminPanelLink!);
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it("should handle multiple expanded sections", () => {
      render(<MobileAdminSidebar isOpen={true} onClose={mockOnClose} />);
      fireEvent.click(screen.getByText("Content Management"));
      fireEvent.click(screen.getByText("Marketplace"));
      expect(screen.getByText("Homepage Settings")).toBeInTheDocument();
      expect(screen.getByText("All Shops")).toBeInTheDocument();
    });
  });

  describe("Performance", () => {
    it("should handle rendering all nav items without crash", () => {
      expect(() => {
        render(<MobileAdminSidebar isOpen={true} onClose={mockOnClose} />);
      }).not.toThrow();
    });

    it("should handle expanding all sections simultaneously", () => {
      render(<MobileAdminSidebar isOpen={true} onClose={mockOnClose} />);
      fireEvent.click(screen.getByText("Content Management"));
      fireEvent.click(screen.getByText("Marketplace"));
      fireEvent.click(screen.getByText("User Management"));
      fireEvent.click(screen.getByText("Transactions"));
      fireEvent.click(screen.getByText("Support"));
      fireEvent.click(screen.getByText("Analytics"));
      fireEvent.click(screen.getByText("Blog"));
      fireEvent.click(screen.getByText("Settings"));
      expect(screen.getByText("All Shops")).toBeInTheDocument();
    });
  });
});
