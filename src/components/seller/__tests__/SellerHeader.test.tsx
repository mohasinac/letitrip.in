import { useAuth } from "@/contexts/AuthContext";
import { fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import { SellerHeader } from "../SellerHeader";

// Mock dependencies
jest.mock("@/contexts/AuthContext");
jest.mock("next/link", () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  );
});

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;

describe("SellerHeader", () => {
  const mockLogout = jest.fn();

  const defaultUser = {
    id: "user-1",
    email: "seller@test.com",
    fullName: "Test Seller",
    role: "seller" as const,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAuth.mockReturnValue({
      user: defaultUser,
      logout: mockLogout,
      login: jest.fn(),
      signup: jest.fn(),
      isAuthenticated: true,
      isLoading: false,
    });
  });

  describe("Header Structure", () => {
    it("renders header with sticky positioning", () => {
      render(<SellerHeader />);
      const header = screen.getByRole("banner");
      expect(header).toBeInTheDocument();
      expect(header).toHaveClass("sticky", "top-0", "z-40");
    });

    it("renders dark mode classes", () => {
      render(<SellerHeader />);
      const header = screen.getByRole("banner");
      expect(header).toHaveClass("dark:bg-gray-900", "dark:border-gray-700");
    });

    it("renders mobile menu button on small screens", () => {
      render(<SellerHeader />);
      const menuButton = screen.getByLabelText("Open menu");
      expect(menuButton).toBeInTheDocument();
      expect(menuButton).toHaveClass("lg:hidden");
    });

    it("renders search input on desktop", () => {
      render(<SellerHeader />);
      const searchInput = screen.getByPlaceholderText(
        "Search products, orders..."
      );
      expect(searchInput).toBeInTheDocument();
      expect(searchInput.parentElement?.parentElement).toHaveClass(
        "hidden",
        "lg:block"
      );
    });
  });

  describe("Notifications", () => {
    it("renders notifications button", () => {
      render(<SellerHeader />);
      const notifButton = screen.getByLabelText("Notifications");
      expect(notifButton).toBeInTheDocument();
    });

    it("displays notification badge indicator", () => {
      render(<SellerHeader />);
      const notifButton = screen.getByLabelText("Notifications");
      const badge = notifButton.querySelector(".bg-red-500");
      expect(badge).toBeInTheDocument();
    });

    it("toggles notifications dropdown when clicked", () => {
      render(<SellerHeader />);
      const notifButton = screen.getByLabelText("Notifications");

      // Initially closed
      expect(
        screen.queryByRole("heading", { name: "Notifications" })
      ).not.toBeInTheDocument();

      // Open dropdown
      fireEvent.click(notifButton);
      expect(
        screen.getByRole("heading", { name: "Notifications" })
      ).toBeInTheDocument();

      // Close dropdown
      fireEvent.click(notifButton);
      expect(
        screen.queryByRole("heading", { name: "Notifications" })
      ).not.toBeInTheDocument();
    });

    it("displays empty state for notifications", () => {
      render(<SellerHeader />);
      const notifButton = screen.getByLabelText("Notifications");
      fireEvent.click(notifButton);

      expect(screen.getByText("No new notifications")).toBeInTheDocument();
    });

    it("applies dark mode to notifications dropdown", () => {
      render(<SellerHeader />);
      const notifButton = screen.getByLabelText("Notifications");
      fireEvent.click(notifButton);

      const dropdown = screen.getByRole("heading", {
        name: "Notifications",
      }).parentElement?.parentElement;
      expect(dropdown).toHaveClass("dark:bg-gray-800", "dark:border-gray-700");
    });
  });

  describe("User Menu", () => {
    it("displays user avatar with first letter", () => {
      render(<SellerHeader />);
      const avatar = screen.getByText("S"); // First letter of "Seller"
      expect(avatar).toBeInTheDocument();
      expect(avatar).toHaveClass("bg-blue-600", "text-white");
    });

    it("displays user full name on desktop", () => {
      render(<SellerHeader />);
      expect(screen.getByText("Test Seller")).toBeInTheDocument();
    });

    it("displays user role on desktop", () => {
      render(<SellerHeader />);
      expect(screen.getByText("seller")).toBeInTheDocument();
    });

    it("falls back to email name when fullName is missing", () => {
      mockUseAuth.mockReturnValue({
        user: { ...defaultUser, fullName: undefined },
        logout: mockLogout,
        login: jest.fn(),
        signup: jest.fn(),
        isAuthenticated: true,
        isLoading: false,
      });

      render(<SellerHeader />);
      expect(screen.getAllByText("seller")[0]).toBeInTheDocument(); // From email split
    });

    it("falls back to 'Seller' when no name or email", () => {
      mockUseAuth.mockReturnValue({
        user: { ...defaultUser, fullName: undefined, email: undefined },
        logout: mockLogout,
        login: jest.fn(),
        signup: jest.fn(),
        isAuthenticated: true,
        isLoading: false,
      });

      render(<SellerHeader />);
      expect(screen.getAllByText("Seller").length).toBeGreaterThan(0);
    });

    it("toggles user menu when clicked", () => {
      render(<SellerHeader />);
      const userButton = screen.getByText("Test Seller").parentElement;

      // Initially closed
      expect(
        screen.queryByRole("link", { name: /Shop Settings/i })
      ).not.toBeInTheDocument();

      // Open menu
      fireEvent.click(userButton!);
      expect(
        screen.getByRole("link", { name: /Shop Settings/i })
      ).toBeInTheDocument();

      // Close menu
      fireEvent.click(userButton!);
      expect(
        screen.queryByRole("link", { name: /Shop Settings/i })
      ).not.toBeInTheDocument();
    });
  });

  describe("User Menu Links", () => {
    beforeEach(() => {
      render(<SellerHeader />);
      const userButton = screen.getByText("Test Seller").parentElement;
      fireEvent.click(userButton!);
    });

    it("renders Shop Settings link to /seller/my-shops", () => {
      const link = screen.getByRole("link", { name: /Shop Settings/i });
      expect(link).toHaveAttribute("href", "/seller/my-shops");
    });

    it("renders Profile link to /user/settings", () => {
      const link = screen.getByRole("link", { name: /Profile/i });
      expect(link).toHaveAttribute("href", "/user/settings");
    });

    it("renders Sign Out button", () => {
      const signOutButton = screen.getByRole("button", { name: /Sign Out/i });
      expect(signOutButton).toBeInTheDocument();
      expect(signOutButton).toHaveClass("text-red-600", "dark:text-red-400");
    });

    it("calls logout when Sign Out is clicked", () => {
      const signOutButton = screen.getByRole("button", { name: /Sign Out/i });
      fireEvent.click(signOutButton);
      expect(mockLogout).toHaveBeenCalledTimes(1);
    });
  });

  describe("User Menu Details", () => {
    it("displays user email in dropdown", () => {
      render(<SellerHeader />);
      const userButton = screen.getByText("Test Seller").parentElement;
      fireEvent.click(userButton!);

      expect(screen.getAllByText("seller@test.com").length).toBeGreaterThan(0);
    });

    it("displays user full name in dropdown", () => {
      render(<SellerHeader />);
      const userButton = screen.getByText("Test Seller").parentElement;
      fireEvent.click(userButton!);

      expect(screen.getAllByText("Test Seller").length).toBeGreaterThan(0);
    });
  });

  describe("Dark Mode", () => {
    it("applies dark mode classes to header", () => {
      render(<SellerHeader />);
      const header = screen.getByRole("banner");
      expect(header).toHaveClass("dark:bg-gray-900", "dark:border-gray-700");
    });

    it("applies dark mode classes to search input", () => {
      render(<SellerHeader />);
      const searchInput = screen.getByPlaceholderText(
        "Search products, orders..."
      );
      expect(searchInput).toHaveClass(
        "dark:bg-gray-800",
        "dark:border-gray-600"
      );
    });

    it("applies dark mode classes to menu button", () => {
      render(<SellerHeader />);
      const menuButton = screen.getByLabelText("Open menu");
      expect(menuButton).toHaveClass("dark:hover:bg-gray-800");
    });

    it("applies dark mode classes to notification button", () => {
      render(<SellerHeader />);
      const notifButton = screen.getByLabelText("Notifications");
      expect(notifButton).toHaveClass("dark:hover:bg-gray-800");
    });

    it("applies dark mode classes to user menu", () => {
      render(<SellerHeader />);
      const userButton = screen.getByText("Test Seller").parentElement;
      fireEvent.click(userButton!);

      const dropdown = screen.getByRole("link", {
        name: /Shop Settings/i,
      }).parentElement?.parentElement;
      expect(dropdown).toHaveClass("dark:bg-gray-800", "dark:border-gray-700");
    });
  });

  describe("Responsive Design", () => {
    it("hides user details on mobile", () => {
      render(<SellerHeader />);
      const userDetails = screen.getByText("Test Seller").parentElement;
      expect(userDetails).toHaveClass("hidden", "lg:block");
    });

    it("hides search on mobile", () => {
      render(<SellerHeader />);
      const searchContainer = screen.getByPlaceholderText(
        "Search products, orders..."
      ).parentElement?.parentElement;
      expect(searchContainer).toHaveClass("hidden", "lg:block");
    });

    it("shows mobile menu button on small screens", () => {
      render(<SellerHeader />);
      const menuButton = screen.getByLabelText("Open menu");
      expect(menuButton).toHaveClass("lg:hidden");
    });
  });

  describe("Accessibility", () => {
    it("has semantic header element", () => {
      render(<SellerHeader />);
      expect(screen.getByRole("banner")).toBeInTheDocument();
    });

    it("has aria-label for mobile menu button", () => {
      render(<SellerHeader />);
      expect(screen.getByLabelText("Open menu")).toBeInTheDocument();
    });

    it("has aria-label for notifications button", () => {
      render(<SellerHeader />);
      expect(screen.getByLabelText("Notifications")).toBeInTheDocument();
    });

    it("has proper search input type", () => {
      render(<SellerHeader />);
      const searchInput = screen.getByPlaceholderText(
        "Search products, orders..."
      );
      expect(searchInput).toHaveAttribute("type", "search");
    });
  });

  describe("User States", () => {
    it("handles user with no email", () => {
      mockUseAuth.mockReturnValue({
        user: { ...defaultUser, email: undefined },
        logout: mockLogout,
        login: jest.fn(),
        signup: jest.fn(),
        isAuthenticated: true,
        isLoading: false,
      });

      render(<SellerHeader />);
      const avatar = screen.getByText("U"); // Default avatar
      expect(avatar).toBeInTheDocument();
    });

    it("handles user with no role", () => {
      mockUseAuth.mockReturnValue({
        user: { ...defaultUser, role: undefined },
        logout: mockLogout,
        login: jest.fn(),
        signup: jest.fn(),
        isAuthenticated: true,
        isLoading: false,
      });

      render(<SellerHeader />);
      expect(screen.getAllByText("seller").length).toBeGreaterThan(0); // Default role
    });

    it("handles null user", () => {
      mockUseAuth.mockReturnValue({
        user: null,
        logout: mockLogout,
        login: jest.fn(),
        signup: jest.fn(),
        isAuthenticated: false,
        isLoading: false,
      });

      render(<SellerHeader />);
      const avatar = screen.getByText("U");
      expect(avatar).toBeInTheDocument();
    });
  });

  describe("Edge Cases", () => {
    it("handles empty email for avatar", () => {
      mockUseAuth.mockReturnValue({
        user: { ...defaultUser, email: "" },
        logout: mockLogout,
        login: jest.fn(),
        signup: jest.fn(),
        isAuthenticated: true,
        isLoading: false,
      });

      render(<SellerHeader />);
      const avatar = screen.getByText("U");
      expect(avatar).toBeInTheDocument();
    });

    it("displays first character uppercase in avatar", () => {
      mockUseAuth.mockReturnValue({
        user: { ...defaultUser, email: "test@example.com" },
        logout: mockLogout,
        login: jest.fn(),
        signup: jest.fn(),
        isAuthenticated: true,
        isLoading: false,
      });

      render(<SellerHeader />);
      const avatar = screen.getByText("T");
      expect(avatar).toBeInTheDocument();
    });

    it("closes notification menu when toggled twice", () => {
      render(<SellerHeader />);
      const notifButton = screen.getByLabelText("Notifications");

      fireEvent.click(notifButton);
      expect(
        screen.getByRole("heading", { name: "Notifications" })
      ).toBeInTheDocument();

      fireEvent.click(notifButton);
      expect(
        screen.queryByRole("heading", { name: "Notifications" })
      ).not.toBeInTheDocument();
    });

    it("closes user menu when toggled twice", () => {
      render(<SellerHeader />);
      const userButton = screen.getByText("Test Seller").parentElement;

      fireEvent.click(userButton!);
      expect(
        screen.getByRole("link", { name: /Shop Settings/i })
      ).toBeInTheDocument();

      fireEvent.click(userButton!);
      expect(
        screen.queryByRole("link", { name: /Shop Settings/i })
      ).not.toBeInTheDocument();
    });
  });
});
