import React from "react";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AdminSidebar } from "./AdminSidebar";
import { usePathname } from "next/navigation";

// Mock next/navigation
jest.mock("next/navigation", () => ({
  usePathname: jest.fn(),
}));

// Mock lucide-react icons
jest.mock("lucide-react", () => ({
  LayoutDashboard: () => <span data-testid="icon-layout-dashboard" />,
  Users: () => <span data-testid="icon-users" />,
  FolderTree: () => <span data-testid="icon-folder-tree" />,
  Store: () => <span data-testid="icon-store" />,
  Package: () => <span data-testid="icon-package" />,
  ShoppingCart: () => <span data-testid="icon-shopping-cart" />,
  BarChart3: () => <span data-testid="icon-bar-chart" />,
  Settings: () => <span data-testid="icon-settings" />,
  Flag: () => <span data-testid="icon-flag" />,
  Image: () => <span data-testid="icon-image" />,
  Search: () => <span data-testid="icon-search" />,
  Shield: () => <span data-testid="icon-shield" />,
  ChevronDown: () => <span data-testid="icon-chevron-down" />,
  ChevronRight: () => <span data-testid="icon-chevron-right" />,
  Home: () => <span data-testid="icon-home" />,
  CreditCard: () => <span data-testid="icon-credit-card" />,
  Gavel: () => <span data-testid="icon-gavel" />,
  Ticket: () => <span data-testid="icon-ticket" />,
  RotateCcw: () => <span data-testid="icon-rotate-ccw" />,
  LifeBuoy: () => <span data-testid="icon-life-buoy" />,
  Newspaper: () => <span data-testid="icon-newspaper" />,
  TrendingUp: () => <span data-testid="icon-trending-up" />,
  DollarSign: () => <span data-testid="icon-dollar-sign" />,
  Star: () => <span data-testid="icon-star" />,
  Banknote: () => <span data-testid="icon-banknote" />,
  Layout: () => <span data-testid="icon-layout" />,
}));

const mockUsePathname = usePathname as jest.MockedFunction<typeof usePathname>;

describe("AdminSidebar Component", () => {
  beforeEach(() => {
    mockUsePathname.mockReturnValue("/admin/dashboard");
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("Basic Rendering", () => {
    it("renders the sidebar", () => {
      render(<AdminSidebar />);
      expect(screen.getByText("Admin Panel")).toBeInTheDocument();
    });

    it("renders the admin panel logo and title", () => {
      render(<AdminSidebar />);
      expect(screen.getByText("Admin Panel")).toBeInTheDocument();
      expect(screen.getByTestId("icon-shield")).toBeInTheDocument();
    });

    it("renders the search input", () => {
      render(<AdminSidebar />);
      const searchInput = screen.getByPlaceholderText("Search admin...");
      expect(searchInput).toBeInTheDocument();
      expect(searchInput).toHaveAttribute("type", "text");
    });

    it("renders navigation section", () => {
      render(<AdminSidebar />);
      expect(screen.getByRole("navigation")).toBeInTheDocument();
    });

    it("renders Back to Site link in footer", () => {
      render(<AdminSidebar />);
      const backLink = screen.getByText("Back to Site");
      expect(backLink).toBeInTheDocument();
      expect(backLink.closest("a")).toHaveAttribute("href", "/");
    });
  });

  describe("Navigation Items", () => {
    it("renders Dashboard nav item", () => {
      render(<AdminSidebar />);
      const dashboard = screen.getByRole("link", { name: /Dashboard/i });
      expect(dashboard).toBeInTheDocument();
      expect(dashboard).toHaveAttribute("href", "/admin/dashboard");
    });

    it("renders Overview nav item", () => {
      render(<AdminSidebar />);
      const overview = screen.getByRole("link", { name: /^Overview$/i });
      expect(overview).toBeInTheDocument();
      expect(overview).toHaveAttribute("href", "/admin");
    });

    it("renders parent navigation items", () => {
      render(<AdminSidebar />);
      expect(
        screen.getByRole("button", { name: /Content Management/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /Marketplace/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /User Management/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /Transactions/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /^Support$/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /Analytics/i })
      ).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /Blog/i })).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /Settings/i })
      ).toBeInTheDocument();
    });
  });

  describe("Active State", () => {
    it("highlights active nav item with exact match", () => {
      mockUsePathname.mockReturnValue("/admin/dashboard");
      render(<AdminSidebar />);
      const dashboard = screen.getByRole("link", { name: /Dashboard/i });
      expect(dashboard).toHaveClass("bg-yellow-50", "text-yellow-700");
    });

    it("highlights active nav item with path prefix", () => {
      mockUsePathname.mockReturnValue("/admin/dashboard/some-page");
      render(<AdminSidebar />);
      const dashboard = screen.getByRole("link", { name: /Dashboard/i });
      expect(dashboard).toHaveClass("bg-yellow-50", "text-yellow-700");
    });

    it("does not highlight inactive items", () => {
      mockUsePathname.mockReturnValue("/admin/users");
      render(<AdminSidebar />);
      const dashboard = screen.getByRole("link", { name: /Dashboard/i });
      expect(dashboard).not.toHaveClass("bg-yellow-50", "text-yellow-700");
      expect(dashboard).toHaveClass("text-gray-700");
    });

    it("highlights active child nav item", async () => {
      mockUsePathname.mockReturnValue("/admin/homepage");
      const user = userEvent.setup();
      render(<AdminSidebar />);

      // Expand Content Management
      const contentMgmt = screen.getByRole("button", {
        name: /Content Management/i,
      });
      await user.click(contentMgmt);

      // Check if Homepage Settings is highlighted
      const homepage = screen.getByRole("link", { name: /Homepage Settings/i });
      expect(homepage).toHaveClass("bg-yellow-50", "text-yellow-700");
    });
  });

  describe("Expand/Collapse Functionality", () => {
    it("expands parent item when clicked", async () => {
      const user = userEvent.setup();
      render(<AdminSidebar />);

      const contentMgmt = screen.getByRole("button", {
        name: /Content Management/i,
      });
      await user.click(contentMgmt);

      // Child items should be visible
      expect(
        screen.getByRole("link", { name: /Homepage Settings/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole("link", { name: /Hero Slides/i })
      ).toBeInTheDocument();
    });

    it("collapses parent item when clicked twice", async () => {
      const user = userEvent.setup();
      render(<AdminSidebar />);

      const contentMgmt = screen.getByRole("button", {
        name: /Content Management/i,
      });

      // Expand
      await user.click(contentMgmt);
      expect(
        screen.getByRole("link", { name: /Homepage Settings/i })
      ).toBeInTheDocument();

      // Collapse
      await user.click(contentMgmt);
      expect(
        screen.queryByRole("link", { name: /Homepage Settings/i })
      ).not.toBeInTheDocument();
    });

    it("shows ChevronRight when collapsed", () => {
      render(<AdminSidebar />);
      const contentMgmt = screen.getByRole("button", {
        name: /Content Management/i,
      });
      const chevronRight =
        within(contentMgmt).getByTestId("icon-chevron-right");
      expect(chevronRight).toBeInTheDocument();
    });

    it("shows ChevronDown when expanded", async () => {
      const user = userEvent.setup();
      render(<AdminSidebar />);

      const contentMgmt = screen.getByRole("button", {
        name: /Content Management/i,
      });
      await user.click(contentMgmt);

      const chevronDown = within(contentMgmt).getByTestId("icon-chevron-down");
      expect(chevronDown).toBeInTheDocument();
    });

    it("can expand multiple sections simultaneously", async () => {
      const user = userEvent.setup();
      render(<AdminSidebar />);

      await user.click(
        screen.getByRole("button", { name: /Content Management/i })
      );
      await user.click(screen.getByRole("button", { name: /Marketplace/i }));

      expect(
        screen.getByRole("link", { name: /Homepage Settings/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole("link", { name: /All Shops/i })
      ).toBeInTheDocument();
    });
  });

  describe("Search Functionality", () => {
    it("filters navigation items by search query", async () => {
      const user = userEvent.setup();
      render(<AdminSidebar />);

      const searchInput = screen.getByPlaceholderText("Search admin...");
      await user.type(searchInput, "users");

      // "Users" item should be visible
      expect(
        screen.getByRole("button", { name: /User Management/i })
      ).toBeInTheDocument();

      // Unrelated items should not be visible
      expect(
        screen.queryByRole("button", { name: /Content Management/i })
      ).not.toBeInTheDocument();
    });

    it("shows clear button when search has text", async () => {
      const user = userEvent.setup();
      render(<AdminSidebar />);

      const searchInput = screen.getByPlaceholderText("Search admin...");
      await user.type(searchInput, "test");

      const clearButton = screen.getByRole("button", { name: /Clear search/i });
      expect(clearButton).toBeInTheDocument();
    });

    it("clears search when clear button is clicked", async () => {
      const user = userEvent.setup();
      render(<AdminSidebar />);

      const searchInput = screen.getByPlaceholderText("Search admin...");
      await user.type(searchInput, "users");

      const clearButton = screen.getByRole("button", { name: /Clear search/i });
      await user.click(clearButton);

      expect(searchInput).toHaveValue("");
    });

    it("auto-expands sections with matching results", async () => {
      const user = userEvent.setup();
      render(<AdminSidebar />);

      const searchInput = screen.getByPlaceholderText("Search admin...");
      await user.type(searchInput, "hero slides");

      // Content Management should auto-expand, showing Hero Slides
      expect(
        screen.getByRole("link", { name: /Hero Slides/i })
      ).toBeInTheDocument();
    });

    it("shows no results message when search has no matches", async () => {
      const user = userEvent.setup();
      render(<AdminSidebar />);

      const searchInput = screen.getByPlaceholderText("Search admin...");
      await user.type(searchInput, "xyzabc123");

      expect(screen.getByText("No results found")).toBeInTheDocument();
      expect(
        screen.getByText("Try a different search term")
      ).toBeInTheDocument();
    });

    it("highlights matching text in search results", async () => {
      const user = userEvent.setup();
      render(<AdminSidebar />);

      const searchInput = screen.getByPlaceholderText("Search admin...");
      await user.type(searchInput, "users");

      // Look for highlighted text
      const highlightedSpan = screen.getByText("Users", {
        selector: ".bg-yellow-200",
      });
      expect(highlightedSpan).toBeInTheDocument();
      expect(highlightedSpan).toHaveClass(
        "bg-yellow-200",
        "text-yellow-900",
        "font-semibold"
      );
    });

    it("is case-insensitive", async () => {
      const user = userEvent.setup();
      render(<AdminSidebar />);

      const searchInput = screen.getByPlaceholderText("Search admin...");
      await user.type(searchInput, "USERS");

      expect(
        screen.getByRole("button", { name: /User Management/i })
      ).toBeInTheDocument();
    });

    it("filters by child item names", async () => {
      const user = userEvent.setup();
      render(<AdminSidebar />);

      const searchInput = screen.getByPlaceholderText("Search admin...");
      await user.type(searchInput, "homepage");

      // Should show Content Management parent with Homepage Settings child
      expect(
        screen.getByRole("button", { name: /Content Management/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole("link", { name: /Homepage Settings/i })
      ).toBeInTheDocument();
    });

    it("filters by href path", async () => {
      const user = userEvent.setup();
      render(<AdminSidebar />);

      const searchInput = screen.getByPlaceholderText("Search admin...");
      await user.type(searchInput, "/admin/shops");

      // Should show Marketplace parent with All Shops child
      expect(
        screen.getByRole("button", { name: /Marketplace/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole("link", { name: /All Shops/i })
      ).toBeInTheDocument();
    });
  });

  describe("Child Navigation Items", () => {
    it("renders Content Management children", async () => {
      const user = userEvent.setup();
      render(<AdminSidebar />);

      await user.click(
        screen.getByRole("button", { name: /Content Management/i })
      );

      expect(
        screen.getByRole("link", { name: /Homepage Settings/i })
      ).toHaveAttribute("href", "/admin/homepage");
      expect(
        screen.getByRole("link", { name: /Hero Slides/i })
      ).toHaveAttribute("href", "/admin/hero-slides");
      expect(
        screen.getByRole("link", { name: /Featured Sections/i })
      ).toHaveAttribute("href", "/admin/featured-sections");
      expect(
        screen.getByRole("link", { name: /^Categories$/i })
      ).toHaveAttribute("href", "/admin/categories");
    });

    it("renders Marketplace children", async () => {
      const user = userEvent.setup();
      render(<AdminSidebar />);

      await user.click(screen.getByRole("button", { name: /Marketplace/i }));

      expect(screen.getByRole("link", { name: /All Shops/i })).toHaveAttribute(
        "href",
        "/admin/shops"
      );
      expect(screen.getByRole("link", { name: /^Products$/i })).toHaveAttribute(
        "href",
        "/admin/products"
      );
      expect(
        screen.getByRole("link", { name: /All Auctions/i })
      ).toHaveAttribute("href", "/admin/auctions");
      expect(
        screen.getByRole("link", { name: /Live Auctions/i })
      ).toHaveAttribute("href", "/admin/auctions/live");
    });

    it("renders Transactions children", async () => {
      const user = userEvent.setup();
      render(<AdminSidebar />);

      await user.click(screen.getByRole("button", { name: /Transactions/i }));

      expect(screen.getByRole("link", { name: /^Orders$/i })).toHaveAttribute(
        "href",
        "/admin/orders"
      );
      expect(screen.getByRole("link", { name: /Payments/i })).toHaveAttribute(
        "href",
        "/admin/payments"
      );
      expect(
        screen.getByRole("link", { name: /Seller Payouts/i })
      ).toHaveAttribute("href", "/admin/payouts");
      expect(screen.getByRole("link", { name: /Coupons/i })).toHaveAttribute(
        "href",
        "/admin/coupons"
      );
      expect(
        screen.getByRole("link", { name: /Returns & Refunds/i })
      ).toHaveAttribute("href", "/admin/returns");
    });
  });

  describe("Icons", () => {
    it("renders Dashboard icon", () => {
      render(<AdminSidebar />);
      expect(screen.getByTestId("icon-layout-dashboard")).toBeInTheDocument();
    });

    it("renders search icon", () => {
      render(<AdminSidebar />);
      expect(screen.getByTestId("icon-search")).toBeInTheDocument();
    });

    it("renders Shield icon for logo", () => {
      render(<AdminSidebar />);
      expect(screen.getByTestId("icon-shield")).toBeInTheDocument();
    });
  });

  describe("Styling", () => {
    it("applies fixed positioning classes", () => {
      const { container } = render(<AdminSidebar />);
      const aside = container.querySelector("aside");
      expect(aside).toHaveClass(
        "lg:fixed",
        "lg:top-[7rem]",
        "lg:bottom-0",
        "lg:left-0"
      );
    });

    it("applies correct width", () => {
      const { container } = render(<AdminSidebar />);
      const aside = container.querySelector("aside");
      expect(aside).toHaveClass("w-64");
    });

    it("hides on mobile, shows on large screens", () => {
      const { container } = render(<AdminSidebar />);
      const aside = container.querySelector("aside");
      expect(aside).toHaveClass("hidden", "lg:block");
    });

    it("applies border styling", () => {
      const { container } = render(<AdminSidebar />);
      const aside = container.querySelector("aside");
      expect(aside).toHaveClass("border-r", "border-gray-200", "bg-white");
    });

    it("applies active item styling", () => {
      mockUsePathname.mockReturnValue("/admin/dashboard");
      render(<AdminSidebar />);
      const dashboard = screen.getByRole("link", { name: /Dashboard/i });
      expect(dashboard).toHaveClass("bg-yellow-50", "text-yellow-700");
    });

    it("applies hover styling to inactive items", () => {
      mockUsePathname.mockReturnValue("/admin/other");
      render(<AdminSidebar />);
      const dashboard = screen.getByRole("link", { name: /Dashboard/i });
      expect(dashboard).toHaveClass("hover:bg-gray-50", "hover:text-gray-900");
    });
  });

  describe("Layout Structure", () => {
    it("has correct flex column layout", () => {
      const { container } = render(<AdminSidebar />);
      const flexCol = container.querySelector(".flex.h-full.flex-col");
      expect(flexCol).toBeInTheDocument();
    });

    it("renders logo section at top", () => {
      const { container } = render(<AdminSidebar />);
      const logoSection = container.querySelector(
        ".flex.h-16.items-center.border-b"
      );
      expect(logoSection).toBeInTheDocument();
    });

    it("renders search section below logo", () => {
      const { container } = render(<AdminSidebar />);
      const searchSection = container.querySelector(
        ".border-b.border-gray-200.p-4"
      );
      expect(searchSection).toBeInTheDocument();
    });

    it("renders navigation with overflow-y-auto", () => {
      const { container } = render(<AdminSidebar />);
      const nav = container.querySelector("nav");
      expect(nav).toHaveClass("overflow-y-auto");
    });

    it("renders footer at bottom", () => {
      const { container } = render(<AdminSidebar />);
      const footer = container.querySelector(".border-t.border-gray-200.p-4");
      expect(footer).toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("has navigation landmark", () => {
      render(<AdminSidebar />);
      expect(screen.getByRole("navigation")).toBeInTheDocument();
    });

    it("search input has placeholder text", () => {
      render(<AdminSidebar />);
      const searchInput = screen.getByPlaceholderText("Search admin...");
      expect(searchInput).toBeInTheDocument();
    });

    it("clear button has aria-label", async () => {
      const user = userEvent.setup();
      render(<AdminSidebar />);

      await user.type(screen.getByPlaceholderText("Search admin..."), "test");

      const clearButton = screen.getByRole("button", { name: /Clear search/i });
      expect(clearButton).toHaveAttribute("aria-label", "Clear search");
    });

    it("all nav links are keyboard accessible", () => {
      render(<AdminSidebar />);
      const dashboard = screen.getByRole("link", { name: /Dashboard/i });
      expect(dashboard).toHaveAttribute("href");
    });
  });

  describe("Edge Cases", () => {
    it("handles pathname with trailing slash", () => {
      mockUsePathname.mockReturnValue("/admin/dashboard/");
      render(<AdminSidebar />);
      const dashboard = screen.getByRole("link", { name: /Dashboard/i });
      expect(dashboard).toHaveClass("bg-yellow-50", "text-yellow-700");
    });

    it("handles root admin path", () => {
      mockUsePathname.mockReturnValue("/admin");
      render(<AdminSidebar />);
      const overview = screen.getByRole("link", { name: /^Overview$/i });
      expect(overview).toHaveClass("bg-yellow-50", "text-yellow-700");
    });

    it("handles search with only spaces", async () => {
      const user = userEvent.setup();
      render(<AdminSidebar />);

      const searchInput = screen.getByPlaceholderText("Search admin...");
      await user.type(searchInput, "   ");

      // Should show all items (empty search)
      expect(
        screen.getByRole("button", { name: /Content Management/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /Marketplace/i })
      ).toBeInTheDocument();
    });

    it("handles search with special characters", async () => {
      const user = userEvent.setup();
      render(<AdminSidebar />);

      const searchInput = screen.getByPlaceholderText("Search admin...");
      await user.type(searchInput, "Returns & Refunds");

      expect(
        screen.getByRole("button", { name: /Transactions/i })
      ).toBeInTheDocument();
    });

    it("handles rapid expand/collapse clicks", async () => {
      const user = userEvent.setup();
      render(<AdminSidebar />);

      const contentMgmt = screen.getByRole("button", {
        name: /Content Management/i,
      });

      await user.click(contentMgmt);
      await user.click(contentMgmt);
      await user.click(contentMgmt);

      // Should be expanded after odd number of clicks
      expect(
        screen.getByRole("link", { name: /Homepage Settings/i })
      ).toBeInTheDocument();
    });

    it("maintains expanded state when search is cleared", async () => {
      const user = userEvent.setup();
      render(<AdminSidebar />);

      // Manually expand Content Management
      await user.click(
        screen.getByRole("button", { name: /Content Management/i })
      );
      expect(
        screen.getByRole("link", { name: /Homepage Settings/i })
      ).toBeInTheDocument();

      // Search something
      const searchInput = screen.getByPlaceholderText("Search admin...");
      await user.type(searchInput, "test");

      // Clear search
      const clearButton = screen.getByRole("button", { name: /Clear search/i });
      await user.click(clearButton);

      // Content Management should still be expanded
      expect(
        screen.getByRole("link", { name: /Homepage Settings/i })
      ).toBeInTheDocument();
    });
  });
});
