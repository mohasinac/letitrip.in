import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import MainNavBar from "./MainNavBar";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/hooks/useCart";

// Mock next/navigation
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
  }),
  usePathname: () => "/",
}));

// Mock next/link
jest.mock("next/link", () => {
  return ({ children, href, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  );
});

// Mock useAuth
jest.mock("@/contexts/AuthContext", () => ({
  useAuth: jest.fn(),
}));

// Mock useCart
jest.mock("@/hooks/useCart", () => ({
  useCart: jest.fn(),
}));

const mockUseAuth = useAuth as jest.Mock;
const mockUseCart = useCart as jest.Mock;

describe("MainNavBar", () => {
  const mockOnMobileMenuToggle = jest.fn();
  const mockOnSearchClick = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseCart.mockReturnValue({
      cart: { itemCount: 0, formattedSubtotal: "₹0" },
    });
  });

  describe("Guest User (Not Authenticated)", () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue({
        user: null,
        isAuthenticated: false,
        isAdmin: false,
        isAdminOrSeller: false,
      });
    });

    it("should render company logo", () => {
      render(
        <MainNavBar
          onMobileMenuToggle={mockOnMobileMenuToggle}
          onSearchClick={mockOnSearchClick}
        />,
      );

      expect(screen.getByText("LET IT RIP")).toBeInTheDocument();
    });

    it("should show Sign In link when not authenticated", () => {
      render(
        <MainNavBar
          onMobileMenuToggle={mockOnMobileMenuToggle}
          onSearchClick={mockOnSearchClick}
        />,
      );

      // Sign In text is hidden on mobile (sm:inline), but the link exists
      const signInLink = screen.getByRole("link", { name: /sign in/i });
      expect(signInLink).toBeInTheDocument();
      expect(signInLink).toHaveAttribute("href", "/login");
    });

    it("should show login/register dropdown when caret clicked", async () => {
      render(
        <MainNavBar
          onMobileMenuToggle={mockOnMobileMenuToggle}
          onSearchClick={mockOnSearchClick}
        />,
      );

      // Find the caret button by aria-label
      const caretButtons = screen.getAllByLabelText("User menu");
      // Click the last one (the caret dropdown trigger)
      fireEvent.click(caretButtons[caretButtons.length - 1]);

      await waitFor(() => {
        expect(screen.getByText("Register")).toBeInTheDocument();
      });
    });

    it("should not show Admin menu for guests", () => {
      render(
        <MainNavBar
          onMobileMenuToggle={mockOnMobileMenuToggle}
          onSearchClick={mockOnSearchClick}
        />,
      );

      expect(screen.queryByText("Admin")).not.toBeInTheDocument();
    });

    it("should not show Seller menu for guests", () => {
      render(
        <MainNavBar
          onMobileMenuToggle={mockOnMobileMenuToggle}
          onSearchClick={mockOnSearchClick}
        />,
      );

      expect(screen.queryByText("Seller")).not.toBeInTheDocument();
    });
  });

  describe("Authenticated User", () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue({
        user: {
          uid: "user1",
          email: "user@test.com",
          displayName: "Test User",
          role: "user",
        },
        isAuthenticated: true,
        isAdmin: false,
        isAdminOrSeller: false,
      });
    });

    it("should show user display name", () => {
      render(
        <MainNavBar
          onMobileMenuToggle={mockOnMobileMenuToggle}
          onSearchClick={mockOnSearchClick}
        />,
      );

      expect(screen.getByText("Test User")).toBeInTheDocument();
    });

    it("should show user initials when no profile picture", () => {
      render(
        <MainNavBar
          onMobileMenuToggle={mockOnMobileMenuToggle}
          onSearchClick={mockOnSearchClick}
        />,
      );

      expect(screen.getByText("TU")).toBeInTheDocument();
    });

    it("should show user dropdown menu when clicked", async () => {
      render(
        <MainNavBar
          onMobileMenuToggle={mockOnMobileMenuToggle}
          onSearchClick={mockOnSearchClick}
        />,
      );

      const userButton = screen.getByLabelText("User menu");
      fireEvent.click(userButton);

      await waitFor(() => {
        expect(screen.getByText("user@test.com")).toBeInTheDocument();
      });
    });

    it("should not show Admin menu for regular users", () => {
      render(
        <MainNavBar
          onMobileMenuToggle={mockOnMobileMenuToggle}
          onSearchClick={mockOnSearchClick}
        />,
      );

      expect(screen.queryByText("Admin")).not.toBeInTheDocument();
    });
  });

  describe("Seller User", () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue({
        user: {
          uid: "seller1",
          email: "seller@test.com",
          displayName: "Seller User",
          role: "seller",
        },
        isAuthenticated: true,
        isAdmin: false,
        isAdminOrSeller: true,
      });
    });

    it("should show Seller menu for sellers", () => {
      render(
        <MainNavBar
          onMobileMenuToggle={mockOnMobileMenuToggle}
          onSearchClick={mockOnSearchClick}
        />,
      );

      expect(screen.getByText("Seller")).toBeInTheDocument();
    });

    it("should show Seller dropdown when clicked", async () => {
      render(
        <MainNavBar
          onMobileMenuToggle={mockOnMobileMenuToggle}
          onSearchClick={mockOnSearchClick}
        />,
      );

      const sellerButton = screen.getByLabelText("Seller menu");
      fireEvent.click(sellerButton);

      await waitFor(() => {
        expect(screen.getByText("Overview")).toBeInTheDocument();
      });
    });

    it("should not show Admin menu for sellers", () => {
      render(
        <MainNavBar
          onMobileMenuToggle={mockOnMobileMenuToggle}
          onSearchClick={mockOnSearchClick}
        />,
      );

      expect(screen.queryByText("Admin")).not.toBeInTheDocument();
    });
  });

  describe("Admin User", () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue({
        user: {
          uid: "admin1",
          email: "admin@test.com",
          displayName: "Admin User",
          role: "admin",
        },
        isAuthenticated: true,
        isAdmin: true,
        isAdminOrSeller: true,
      });
    });

    it("should show Admin menu for admins", () => {
      render(
        <MainNavBar
          onMobileMenuToggle={mockOnMobileMenuToggle}
          onSearchClick={mockOnSearchClick}
        />,
      );

      expect(screen.getByText("Admin")).toBeInTheDocument();
    });

    it("should show Seller menu for admins", () => {
      render(
        <MainNavBar
          onMobileMenuToggle={mockOnMobileMenuToggle}
          onSearchClick={mockOnSearchClick}
        />,
      );

      expect(screen.getByText("Seller")).toBeInTheDocument();
    });

    it("should show Demo link for admins", () => {
      render(
        <MainNavBar
          onMobileMenuToggle={mockOnMobileMenuToggle}
          onSearchClick={mockOnSearchClick}
        />,
      );

      expect(screen.getByText("DEMO")).toBeInTheDocument();
    });

    it("should show Admin dropdown with all sections when clicked", async () => {
      render(
        <MainNavBar
          onMobileMenuToggle={mockOnMobileMenuToggle}
          onSearchClick={mockOnSearchClick}
        />,
      );

      const adminButton = screen.getByLabelText("Admin menu");
      fireEvent.click(adminButton);

      await waitFor(() => {
        expect(screen.getByText("Dashboard")).toBeInTheDocument();
      });
    });
  });

  describe("Cart Functionality", () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue({
        user: null,
        isAuthenticated: false,
        isAdmin: false,
        isAdminOrSeller: false,
      });
    });

    it("should show cart link", () => {
      render(
        <MainNavBar
          onMobileMenuToggle={mockOnMobileMenuToggle}
          onSearchClick={mockOnSearchClick}
        />,
      );

      // Find the cart link by href
      const allLinks = screen.getAllByRole("link");
      const cartLink = allLinks.find(
        (link) => link.getAttribute("href") === "/cart",
      );
      expect(cartLink).toBeTruthy();
    });

    it("should show cart count badge when items in cart", () => {
      mockUseCart.mockReturnValue({
        cart: { itemCount: 3, formattedSubtotal: "₹1,500" },
      });

      render(
        <MainNavBar
          onMobileMenuToggle={mockOnMobileMenuToggle}
          onSearchClick={mockOnSearchClick}
        />,
      );

      expect(screen.getByText("3")).toBeInTheDocument();
    });

    it("should not show cart count badge when cart is empty", () => {
      mockUseCart.mockReturnValue({
        cart: { itemCount: 0, formattedSubtotal: "₹0" },
      });

      render(
        <MainNavBar
          onMobileMenuToggle={mockOnMobileMenuToggle}
          onSearchClick={mockOnSearchClick}
        />,
      );

      expect(screen.queryByText("0")).not.toBeInTheDocument();
    });
  });

  describe("Mobile Menu", () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue({
        user: null,
        isAuthenticated: false,
        isAdmin: false,
        isAdminOrSeller: false,
      });
    });

    it("should call onMobileMenuToggle when menu button clicked", () => {
      render(
        <MainNavBar
          onMobileMenuToggle={mockOnMobileMenuToggle}
          onSearchClick={mockOnSearchClick}
        />,
      );

      const menuButton = screen.getByLabelText("Toggle navigation menu");
      fireEvent.click(menuButton);

      expect(mockOnMobileMenuToggle).toHaveBeenCalledTimes(1);
    });
  });

  describe("Search Functionality", () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue({
        user: null,
        isAuthenticated: false,
        isAdmin: false,
        isAdminOrSeller: false,
      });
    });

    it("should call onSearchClick when search button clicked", () => {
      render(
        <MainNavBar
          onMobileMenuToggle={mockOnMobileMenuToggle}
          onSearchClick={mockOnSearchClick}
        />,
      );

      const searchButton = screen.getByLabelText("Search products");
      fireEvent.click(searchButton);

      expect(mockOnSearchClick).toHaveBeenCalledTimes(1);
    });
  });

  describe("Accessibility", () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue({
        user: null,
        isAuthenticated: false,
        isAdmin: false,
        isAdminOrSeller: false,
      });
    });

    it("should have accessible navigation landmark", () => {
      render(
        <MainNavBar
          onMobileMenuToggle={mockOnMobileMenuToggle}
          onSearchClick={mockOnSearchClick}
        />,
      );

      expect(screen.getByRole("navigation")).toBeInTheDocument();
    });

    it("should have aria-expanded on authenticated user dropdown", () => {
      mockUseAuth.mockReturnValue({
        user: {
          uid: "user1",
          email: "user@test.com",
          displayName: "Test User",
          role: "user",
        },
        isAuthenticated: true,
        isAdmin: false,
        isAdminOrSeller: false,
      });

      render(
        <MainNavBar
          onMobileMenuToggle={mockOnMobileMenuToggle}
          onSearchClick={mockOnSearchClick}
        />,
      );

      const menuButton = screen.getByLabelText("User menu");
      expect(menuButton).toHaveAttribute("aria-expanded", "false");
    });
  });
});
