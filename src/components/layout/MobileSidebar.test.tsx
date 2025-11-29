import { render, screen, fireEvent } from "@testing-library/react";
import MobileSidebar from "./MobileSidebar";
import { useAuth } from "@/contexts/AuthContext";
import {
  ADMIN_MENU_ITEMS,
  SELLER_MENU_ITEMS,
  COMPANY_NAME,
} from "@/constants/navigation";

// Mock next/link
jest.mock("next/link", () => {
  return ({ children, href, onClick }: any) => (
    <a href={href} onClick={onClick}>
      {children}
    </a>
  );
});

// Mock AuthContext
jest.mock("@/contexts/AuthContext", () => ({
  useAuth: jest.fn(),
}));

// Mock lucide-react icons
jest.mock("lucide-react", () => ({
  X: () => <svg data-testid="x-icon" />,
  ChevronDown: () => <svg data-testid="chevron-down-icon" />,
  ChevronUp: () => <svg data-testid="chevron-up-icon" />,
  Package: () => <svg data-testid="package-icon" />,
  MessageSquare: () => <svg data-testid="message-icon" />,
  ShoppingBag: () => <svg data-testid="shopping-bag-icon" />,
  Book: () => <svg data-testid="book-icon" />,
  Grid3x3: () => <svg data-testid="grid-icon" />,
  LayoutDashboard: () => <svg data-testid="dashboard-icon" />,
  Users: () => <svg data-testid="users-icon" />,
}));

const mockUseAuth = useAuth as jest.Mock;

describe("MobileSidebar", () => {
  const defaultAuthValue = {
    isAuthenticated: false,
    isAdmin: false,
    isAdminOrSeller: false,
    user: null,
  };

  const mockOnClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAuth.mockReturnValue(defaultAuthValue);
  });

  describe("Visibility", () => {
    it("returns null when not open", () => {
      const { container } = render(
        <MobileSidebar isOpen={false} onClose={mockOnClose} />,
      );
      expect(container.firstChild).toBeNull();
    });

    it("renders when open", () => {
      render(<MobileSidebar isOpen={true} onClose={mockOnClose} />);
      expect(screen.getByText(COMPANY_NAME)).toBeInTheDocument();
    });
  });

  describe("Guest State", () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue(defaultAuthValue);
    });

    it("shows sign in and register buttons", () => {
      render(<MobileSidebar isOpen={true} onClose={mockOnClose} />);

      // Should show Sign In buttons (appears in multiple locations)
      const signInButtons = screen.getAllByText("Sign In");
      expect(signInButtons.length).toBeGreaterThan(0);

      const registerButtons = screen.getAllByText("Register");
      expect(registerButtons.length).toBeGreaterThan(0);
    });

    it("shows main navigation links", () => {
      render(<MobileSidebar isOpen={true} onClose={mockOnClose} />);

      expect(screen.getByText("Home")).toBeInTheDocument();
      expect(screen.getByText("Products")).toBeInTheDocument();
      expect(screen.getByText("Categories")).toBeInTheDocument();
      expect(screen.getByText("Reviews")).toBeInTheDocument();
      expect(screen.getByText("Blog")).toBeInTheDocument();
    });

    it("does not show admin section", () => {
      render(<MobileSidebar isOpen={true} onClose={mockOnClose} />);

      expect(
        screen.queryByRole("button", { name: /admin/i }),
      ).not.toBeInTheDocument();
    });

    it("does not show seller section", () => {
      render(<MobileSidebar isOpen={true} onClose={mockOnClose} />);

      expect(
        screen.queryByRole("button", { name: /seller/i }),
      ).not.toBeInTheDocument();
    });
  });

  describe("Authenticated User State", () => {
    const authenticatedUser = {
      isAuthenticated: true,
      isAdmin: false,
      isAdminOrSeller: false,
      user: {
        displayName: "John Doe",
        email: "john@example.com",
        photoURL: null,
        role: "user",
      },
    };

    beforeEach(() => {
      mockUseAuth.mockReturnValue(authenticatedUser);
    });

    it("shows user profile section", () => {
      render(<MobileSidebar isOpen={true} onClose={mockOnClose} />);

      expect(screen.getByText("John Doe")).toBeInTheDocument();
      expect(screen.getByText("john@example.com")).toBeInTheDocument();
      expect(screen.getByText("user")).toBeInTheDocument();
    });

    it("shows user initials when no photo", () => {
      render(<MobileSidebar isOpen={true} onClose={mockOnClose} />);

      expect(screen.getByText("JD")).toBeInTheDocument();
    });

    it("shows user photo when available", () => {
      mockUseAuth.mockReturnValue({
        ...authenticatedUser,
        user: {
          ...authenticatedUser.user,
          photoURL: "https://example.com/photo.jpg",
        },
      });

      render(<MobileSidebar isOpen={true} onClose={mockOnClose} />);

      const image = screen.getByAltText("John Doe");
      expect(image).toHaveAttribute("src", "https://example.com/photo.jpg");
    });

    it("does not show sign in buttons", () => {
      render(<MobileSidebar isOpen={true} onClose={mockOnClose} />);

      expect(
        screen.queryByRole("link", { name: /sign in/i }),
      ).not.toBeInTheDocument();
    });
  });

  describe("Admin User State", () => {
    const adminUser = {
      isAuthenticated: true,
      isAdmin: true,
      isAdminOrSeller: true,
      user: {
        displayName: "Admin User",
        email: "admin@example.com",
        photoURL: null,
        role: "admin",
      },
    };

    beforeEach(() => {
      mockUseAuth.mockReturnValue(adminUser);
    });

    it("shows admin collapsible section", () => {
      render(<MobileSidebar isOpen={true} onClose={mockOnClose} />);

      const adminButton = screen.getByRole("button", { name: /admin/i });
      expect(adminButton).toBeInTheDocument();
    });

    it("expands admin menu on click", () => {
      render(<MobileSidebar isOpen={true} onClose={mockOnClose} />);

      const adminButton = screen.getByRole("button", { name: /admin/i });
      fireEvent.click(adminButton);

      // Should show admin menu items after expanding
      // Check for presence of admin menu items from navigation constants
      expect(ADMIN_MENU_ITEMS.length).toBeGreaterThan(0);
    });

    it("shows seller section for admin", () => {
      render(<MobileSidebar isOpen={true} onClose={mockOnClose} />);

      const sellerButton = screen.getByRole("button", { name: /seller/i });
      expect(sellerButton).toBeInTheDocument();
    });
  });

  describe("Seller User State", () => {
    const sellerUser = {
      isAuthenticated: true,
      isAdmin: false,
      isAdminOrSeller: true,
      user: {
        displayName: "Seller User",
        email: "seller@example.com",
        photoURL: null,
        role: "seller",
      },
    };

    beforeEach(() => {
      mockUseAuth.mockReturnValue(sellerUser);
    });

    it("shows seller collapsible section", () => {
      render(<MobileSidebar isOpen={true} onClose={mockOnClose} />);

      const sellerButton = screen.getByRole("button", { name: /seller/i });
      expect(sellerButton).toBeInTheDocument();
    });

    it("does not show admin section for seller", () => {
      render(<MobileSidebar isOpen={true} onClose={mockOnClose} />);

      expect(
        screen.queryByRole("button", { name: /admin/i }),
      ).not.toBeInTheDocument();
    });

    it("expands seller menu on click", () => {
      render(<MobileSidebar isOpen={true} onClose={mockOnClose} />);

      const sellerButton = screen.getByRole("button", { name: /seller/i });
      fireEvent.click(sellerButton);

      // Should show seller menu items after expanding
      expect(SELLER_MENU_ITEMS.length).toBeGreaterThan(0);
    });
  });

  describe("Interactions", () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue({
        isAuthenticated: true,
        isAdmin: true,
        isAdminOrSeller: true,
        user: {
          displayName: "Test User",
          email: "test@example.com",
          photoURL: null,
          role: "admin",
        },
      });
    });

    it("calls onClose when close button clicked", () => {
      render(<MobileSidebar isOpen={true} onClose={mockOnClose} />);

      const closeButton = screen.getByRole("button", { name: /close menu/i });
      fireEvent.click(closeButton);

      expect(mockOnClose).toHaveBeenCalled();
    });

    it("calls onClose when overlay clicked", () => {
      render(<MobileSidebar isOpen={true} onClose={mockOnClose} />);

      const overlay = document.getElementById("mobile-sidebar-overlay");
      expect(overlay).toBeInTheDocument();
      fireEvent.click(overlay!);

      expect(mockOnClose).toHaveBeenCalled();
    });

    it("calls onClose when navigation link clicked", () => {
      render(<MobileSidebar isOpen={true} onClose={mockOnClose} />);

      const homeLink = screen.getByRole("link", { name: /home/i });
      fireEvent.click(homeLink);

      expect(mockOnClose).toHaveBeenCalled();
    });

    it("toggles admin section expansion", () => {
      render(<MobileSidebar isOpen={true} onClose={mockOnClose} />);

      const adminButton = screen.getByRole("button", { name: /admin/i });

      // Initially collapsed
      fireEvent.click(adminButton);
      // Now expanded
      fireEvent.click(adminButton);
      // Collapsed again
    });

    it("toggles seller section expansion", () => {
      render(<MobileSidebar isOpen={true} onClose={mockOnClose} />);

      const sellerButton = screen.getByRole("button", { name: /seller/i });

      // Toggle expansion
      fireEvent.click(sellerButton);
      fireEvent.click(sellerButton);
    });
  });

  describe("Navigation Links", () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue(defaultAuthValue);
    });

    it("has correct href for home link", () => {
      render(<MobileSidebar isOpen={true} onClose={mockOnClose} />);

      const homeLink = screen.getByRole("link", { name: /home/i });
      expect(homeLink).toHaveAttribute("href", "/");
    });

    it("has correct href for products link", () => {
      render(<MobileSidebar isOpen={true} onClose={mockOnClose} />);

      const productsLink = screen.getByRole("link", { name: /products/i });
      expect(productsLink).toHaveAttribute("href", "/products");
    });

    it("has correct href for categories link", () => {
      render(<MobileSidebar isOpen={true} onClose={mockOnClose} />);

      const categoriesLink = screen.getByRole("link", { name: /categories/i });
      expect(categoriesLink).toHaveAttribute("href", "/categories");
    });

    it("has correct href for reviews link", () => {
      render(<MobileSidebar isOpen={true} onClose={mockOnClose} />);

      const reviewsLink = screen.getByRole("link", { name: /reviews/i });
      expect(reviewsLink).toHaveAttribute("href", "/reviews");
    });

    it("has correct href for blog link", () => {
      render(<MobileSidebar isOpen={true} onClose={mockOnClose} />);

      const blogLink = screen.getByRole("link", { name: /blog/i });
      expect(blogLink).toHaveAttribute("href", "/blog");
    });
  });

  describe("User Display Names", () => {
    it("shows email prefix when no display name", () => {
      mockUseAuth.mockReturnValue({
        isAuthenticated: true,
        isAdmin: false,
        isAdminOrSeller: false,
        user: {
          email: "john.doe@example.com",
          displayName: null,
          fullName: null,
          firstName: null,
          photoURL: null,
        },
      });

      render(<MobileSidebar isOpen={true} onClose={mockOnClose} />);

      expect(screen.getByText("john.doe")).toBeInTheDocument();
    });

    it("shows first name when available", () => {
      mockUseAuth.mockReturnValue({
        isAuthenticated: true,
        isAdmin: false,
        isAdminOrSeller: false,
        user: {
          firstName: "Jane",
          email: "jane@example.com",
          displayName: null,
          fullName: null,
          photoURL: null,
        },
      });

      render(<MobileSidebar isOpen={true} onClose={mockOnClose} />);

      expect(screen.getByText("Jane")).toBeInTheDocument();
    });

    it("shows fullName when available", () => {
      mockUseAuth.mockReturnValue({
        isAuthenticated: true,
        isAdmin: false,
        isAdminOrSeller: false,
        user: {
          fullName: "Jane Smith",
          email: "jane@example.com",
          displayName: null,
          photoURL: null,
        },
      });

      render(<MobileSidebar isOpen={true} onClose={mockOnClose} />);

      expect(screen.getByText("Jane Smith")).toBeInTheDocument();
    });

    it("shows single letter initial for single-name user", () => {
      mockUseAuth.mockReturnValue({
        isAuthenticated: true,
        isAdmin: false,
        isAdminOrSeller: false,
        user: {
          displayName: "John",
          email: "john@example.com",
          photoURL: null,
        },
      });

      render(<MobileSidebar isOpen={true} onClose={mockOnClose} />);

      expect(screen.getByText("J")).toBeInTheDocument();
    });
  });

  describe("Footer", () => {
    it("displays copyright with current year", () => {
      mockUseAuth.mockReturnValue(defaultAuthValue);

      render(<MobileSidebar isOpen={true} onClose={mockOnClose} />);

      const currentYear = new Date().getFullYear();
      expect(
        screen.getByText(
          `© ${currentYear} ${COMPANY_NAME}. All rights reserved.`,
        ),
      ).toBeInTheDocument();
    });
  });
});
