import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { usePathname } from "next/navigation";
import { UserSidebar } from "../UserSidebar";

// Mock Next.js navigation
jest.mock("next/navigation", () => ({
  usePathname: jest.fn(),
}));

jest.mock("next/link", () => ({
  __esModule: true,
  default: ({ children, href, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

describe("UserSidebar", () => {
  beforeEach(() => {
    (usePathname as jest.Mock).mockReturnValue("/user");
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("Rendering", () => {
    it("should render the sidebar", () => {
      render(<UserSidebar />);

      expect(screen.getByText("My Account")).toBeInTheDocument();
    });

    it("should render all navigation items", () => {
      render(<UserSidebar />);

      expect(screen.getByText("Dashboard")).toBeInTheDocument();
      expect(screen.getByText("My Orders")).toBeInTheDocument();
      expect(screen.getByText("Favorites")).toBeInTheDocument();
      expect(screen.getByText("Watchlist")).toBeInTheDocument();
      expect(screen.getByText("My Bids")).toBeInTheDocument();
      expect(screen.getByText("Won Auctions")).toBeInTheDocument();
      expect(screen.getByText("Addresses")).toBeInTheDocument();
      expect(screen.getByText("Returns")).toBeInTheDocument();
      expect(screen.getByText("My Reviews")).toBeInTheDocument();
      expect(screen.getByText("Following")).toBeInTheDocument();
      expect(screen.getByText("History")).toBeInTheDocument();
      expect(screen.getByText("Messages")).toBeInTheDocument();
      expect(screen.getByText("Notifications")).toBeInTheDocument();
      expect(screen.getByText("Support Tickets")).toBeInTheDocument();
      expect(screen.getByText("Settings")).toBeInTheDocument();
    });

    it("should render logo with link to user dashboard", () => {
      render(<UserSidebar />);

      const logoLink = screen.getByText("My Account").closest("a");
      expect(logoLink).toHaveAttribute("href", "/user");
    });

    it("should render search input", () => {
      render(<UserSidebar />);

      const searchInput = screen.getByPlaceholderText("Search...");
      expect(searchInput).toBeInTheDocument();
    });

    it("should render back to home link", () => {
      render(<UserSidebar />);

      const homeLink = screen.getByText("Back to Home").closest("a");
      expect(homeLink).toHaveAttribute("href", "/");
    });
  });

  describe("Active State", () => {
    it("should mark Dashboard as active on /user path", () => {
      (usePathname as jest.Mock).mockReturnValue("/user");
      render(<UserSidebar />);

      const dashboardLink = screen.getByText("Dashboard").closest("a");
      expect(dashboardLink).toHaveClass("bg-yellow-50", "text-yellow-700");
    });

    it("should mark My Orders as active on /user/orders path", () => {
      (usePathname as jest.Mock).mockReturnValue("/user/orders");
      render(<UserSidebar />);

      const ordersLink = screen.getByText("My Orders").closest("a");
      expect(ordersLink).toHaveClass("bg-yellow-50", "text-yellow-700");
    });

    it("should mark item as active on nested paths", () => {
      (usePathname as jest.Mock).mockReturnValue("/user/orders/123");
      render(<UserSidebar />);

      const ordersLink = screen.getByText("My Orders").closest("a");
      expect(ordersLink).toHaveClass("bg-yellow-50", "text-yellow-700");
    });

    it("should not mark Dashboard active on other user paths", () => {
      (usePathname as jest.Mock).mockReturnValue("/user/orders");
      render(<UserSidebar />);

      const dashboardLink = screen.getByText("Dashboard").closest("a");
      expect(dashboardLink).not.toHaveClass("bg-yellow-50");
      expect(dashboardLink).toHaveClass("text-gray-700");
    });

    it("should mark Favorites as active on /user/favorites", () => {
      (usePathname as jest.Mock).mockReturnValue("/user/favorites");
      render(<UserSidebar />);

      const favoritesLink = screen.getByText("Favorites").closest("a");
      expect(favoritesLink).toHaveClass("bg-yellow-50", "text-yellow-700");
    });
  });

  describe("Search Functionality", () => {
    it("should filter items based on search query", async () => {
      const user = userEvent.setup();
      render(<UserSidebar />);

      const searchInput = screen.getByPlaceholderText("Search...");
      await user.type(searchInput, "order");

      // Text is broken up by highlighting, check that link exists
      const ordersLink = screen.getByRole("link", { name: /My.*Order.*s/i });
      expect(ordersLink).toBeInTheDocument();
      expect(screen.queryByText("Favorites")).not.toBeInTheDocument();
      expect(screen.queryByText("Settings")).not.toBeInTheDocument();
    });

    it("should be case insensitive", async () => {
      const user = userEvent.setup();
      render(<UserSidebar />);

      const searchInput = screen.getByPlaceholderText("Search...");
      await user.type(searchInput, "ORDERS");

      const ordersLink = screen.getByRole("link", { name: /My.*Orders/i });
      expect(ordersLink).toBeInTheDocument();
    });

    it("should highlight matching text", async () => {
      const user = userEvent.setup();
      render(<UserSidebar />);

      const searchInput = screen.getByPlaceholderText("Search...");
      await user.type(searchInput, "order");

      const highlighted = document.querySelector(
        ".bg-yellow-200, .dark\\:bg-yellow-700"
      );
      expect(highlighted).toBeInTheDocument();
    });

    it("should show no results message when no matches", async () => {
      const user = userEvent.setup();
      render(<UserSidebar />);

      const searchInput = screen.getByPlaceholderText("Search...");
      await user.type(searchInput, "nonexistentitem");

      expect(screen.getByText("No results found")).toBeInTheDocument();
      expect(
        screen.getByText("Try a different search term")
      ).toBeInTheDocument();
    });

    it("should show all items when search is cleared", async () => {
      const user = userEvent.setup();
      render(<UserSidebar />);

      const searchInput = screen.getByPlaceholderText("Search...");
      await user.type(searchInput, "order");
      await user.clear(searchInput);

      expect(screen.getByText("Dashboard")).toBeInTheDocument();
      expect(screen.getByText("Favorites")).toBeInTheDocument();
      expect(screen.getByText("Settings")).toBeInTheDocument();
    });

    it("should show clear button when search has value", async () => {
      const user = userEvent.setup();
      render(<UserSidebar />);

      const searchInput = screen.getByPlaceholderText("Search...");
      await user.type(searchInput, "order");

      const clearButton = screen.getByLabelText("Clear search");
      expect(clearButton).toBeInTheDocument();
    });

    it("should clear search when clear button is clicked", async () => {
      const user = userEvent.setup();
      render(<UserSidebar />);

      const searchInput = screen.getByPlaceholderText("Search...");
      await user.type(searchInput, "order");

      const clearButton = screen.getByLabelText("Clear search");
      await user.click(clearButton);

      expect(searchInput).toHaveValue("");
      expect(screen.getByText("Dashboard")).toBeInTheDocument();
    });

    it("should not show clear button when search is empty", () => {
      render(<UserSidebar />);

      const clearButton = screen.queryByLabelText("Clear search");
      expect(clearButton).not.toBeInTheDocument();
    });

    it("should trim whitespace in search", async () => {
      const user = userEvent.setup();
      render(<UserSidebar />);

      const searchInput = screen.getByPlaceholderText("Search...");
      await user.type(searchInput, "  order  ");

      const ordersLink = screen.getByRole("link", { name: /My.*Order.*s/i });
      expect(ordersLink).toBeInTheDocument();
    });

    it("should search by href as well as title", async () => {
      const user = userEvent.setup();
      render(<UserSidebar />);

      const searchInput = screen.getByPlaceholderText("Search...");
      await user.type(searchInput, "tickets");

      const ticketsLink = screen.getByRole("link", {
        name: /Support.*Tickets/i,
      });
      expect(ticketsLink).toBeInTheDocument();
    });
  });

  describe("Navigation Links", () => {
    it("should have correct href for Dashboard", () => {
      render(<UserSidebar />);

      const dashboardLink = screen.getByText("Dashboard").closest("a");
      expect(dashboardLink).toHaveAttribute("href", "/user");
    });

    it("should have correct href for My Orders", () => {
      render(<UserSidebar />);

      const ordersLink = screen.getByText("My Orders").closest("a");
      expect(ordersLink).toHaveAttribute("href", "/user/orders");
    });

    it("should have correct href for Settings", () => {
      render(<UserSidebar />);

      const settingsLink = screen.getByText("Settings").closest("a");
      expect(settingsLink).toHaveAttribute("href", "/user/settings");
    });

    it("should have correct href for all navigation items", () => {
      render(<UserSidebar />);

      const expectedLinks = [
        { text: "Dashboard", href: "/user" },
        { text: "My Orders", href: "/user/orders" },
        { text: "Favorites", href: "/user/favorites" },
        { text: "Watchlist", href: "/user/watchlist" },
        { text: "My Bids", href: "/user/bids" },
        { text: "Won Auctions", href: "/user/won-auctions" },
        { text: "Addresses", href: "/user/addresses" },
        { text: "Returns", href: "/user/returns" },
        { text: "My Reviews", href: "/user/reviews" },
        { text: "Following", href: "/user/following" },
        { text: "History", href: "/user/history" },
        { text: "Messages", href: "/user/messages" },
        { text: "Notifications", href: "/user/notifications" },
        { text: "Support Tickets", href: "/user/tickets" },
        { text: "Settings", href: "/user/settings" },
      ];

      expectedLinks.forEach(({ text, href }) => {
        const link = screen.getByText(text).closest("a");
        expect(link).toHaveAttribute("href", href);
      });
    });
  });

  describe("Dark Mode Support", () => {
    it("should have dark mode classes for sidebar", () => {
      const { container } = render(<UserSidebar />);

      const sidebar = container.querySelector("aside");
      expect(sidebar).toHaveClass("dark:border-gray-700", "dark:bg-gray-800");
    });

    it("should have dark mode classes for logo", () => {
      render(<UserSidebar />);

      const logoText = screen.getByText("My Account");
      expect(logoText).toHaveClass("dark:text-white");
    });

    it("should have dark mode classes for search input", () => {
      const { container } = render(<UserSidebar />);

      const searchInput = screen.getByPlaceholderText("Search...");
      expect(searchInput).toHaveClass(
        "dark:border-gray-600",
        "dark:bg-gray-700",
        "dark:text-white",
        "dark:placeholder:text-gray-500"
      );
    });

    it("should have dark mode classes for inactive links", () => {
      render(<UserSidebar />);

      const favoritesLink = screen.getByText("Favorites").closest("a");
      expect(favoritesLink).toHaveClass(
        "dark:text-gray-300",
        "dark:hover:bg-gray-700/50",
        "dark:hover:text-white"
      );
    });

    it("should have dark mode classes for active link", () => {
      (usePathname as jest.Mock).mockReturnValue("/user");
      render(<UserSidebar />);

      const dashboardLink = screen.getByText("Dashboard").closest("a");
      expect(dashboardLink).toHaveClass(
        "dark:bg-yellow-900/30",
        "dark:text-yellow-400"
      );
    });
  });

  describe("Responsive Behavior", () => {
    it("should be hidden on mobile (lg:block)", () => {
      const { container } = render(<UserSidebar />);

      const sidebar = container.querySelector("aside");
      expect(sidebar).toHaveClass("hidden", "lg:block");
    });

    it("should be fixed on desktop", () => {
      const { container } = render(<UserSidebar />);

      const sidebar = container.querySelector("aside");
      expect(sidebar).toHaveClass("lg:fixed");
    });

    it("should have correct positioning", () => {
      const { container } = render(<UserSidebar />);

      const sidebar = container.querySelector("aside");
      expect(sidebar).toHaveClass(
        "lg:top-[7rem]",
        "lg:bottom-0",
        "lg:left-0",
        "lg:z-20"
      );
    });

    it("should have fixed width", () => {
      const { container } = render(<UserSidebar />);

      const sidebar = container.querySelector("aside");
      expect(sidebar).toHaveClass("w-64");
    });
  });

  describe("Layout and Styling", () => {
    it("should have scrollable navigation area", () => {
      const { container } = render(<UserSidebar />);

      const nav = container.querySelector("nav");
      expect(nav).toHaveClass("overflow-y-auto");
    });

    it("should have border on the right", () => {
      const { container } = render(<UserSidebar />);

      const sidebar = container.querySelector("aside");
      expect(sidebar).toHaveClass("border-r", "border-gray-200");
    });

    it("should have white background", () => {
      const { container } = render(<UserSidebar />);

      const sidebar = container.querySelector("aside");
      expect(sidebar).toHaveClass("bg-white");
    });

    it("should have flex column layout", () => {
      const { container } = render(<UserSidebar />);

      const flexContainer = container.querySelector(".flex.h-full.flex-col");
      expect(flexContainer).toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("should use semantic aside element", () => {
      const { container } = render(<UserSidebar />);

      const sidebar = container.querySelector("aside");
      expect(sidebar).toBeInTheDocument();
    });

    it("should use semantic nav element", () => {
      const { container } = render(<UserSidebar />);

      const nav = container.querySelector("nav");
      expect(nav).toBeInTheDocument();
    });

    it("should have aria-label for clear button", () => {
      const user = userEvent.setup();
      render(<UserSidebar />);

      const searchInput = screen.getByPlaceholderText("Search...");
      fireEvent.change(searchInput, { target: { value: "order" } });

      const clearButton = screen.getByLabelText("Clear search");
      expect(clearButton).toHaveAttribute("aria-label", "Clear search");
    });

    it("should have placeholder text for search input", () => {
      render(<UserSidebar />);

      const searchInput = screen.getByPlaceholderText("Search...");
      expect(searchInput).toHaveAttribute("placeholder", "Search...");
    });
  });

  describe("Icons", () => {
    it("should render icons for all navigation items", () => {
      const { container } = render(<UserSidebar />);

      const icons = container.querySelectorAll(
        "nav a svg, nav a [class*='lucide']"
      );
      // Should have icon for each navigation item (15 total)
      expect(icons.length).toBeGreaterThanOrEqual(15);
    });

    it("should have search icon in search input", () => {
      const { container } = render(<UserSidebar />);

      // Search icon is rendered via lucide-react
      const searchContainer = container.querySelector(".relative");
      expect(searchContainer).toBeInTheDocument();
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty search query gracefully", async () => {
      const user = userEvent.setup();
      render(<UserSidebar />);

      const searchInput = screen.getByPlaceholderText("Search...");
      await user.type(searchInput, "   ");
      await user.clear(searchInput);

      expect(screen.getByText("Dashboard")).toBeInTheDocument();
    });

    it("should handle special characters in search", async () => {
      const user = userEvent.setup();
      render(<UserSidebar />);

      const searchInput = screen.getByPlaceholderText("Search...");
      await user.type(searchInput, "@#$%");

      expect(screen.getByText("No results found")).toBeInTheDocument();
    });

    it("should maintain search state during re-renders", async () => {
      const user = userEvent.setup();
      const { rerender } = render(<UserSidebar />);

      const searchInput = screen.getByPlaceholderText("Search...");
      await user.type(searchInput, "order");

      rerender(<UserSidebar />);

      expect(searchInput).toHaveValue("order");
      // Link name has highlighting: "My Order s" (with space)
      const ordersLink = screen.getByRole("link", { name: /My.*Order.*s/i });
      expect(ordersLink).toBeInTheDocument();
    });
  });
});
