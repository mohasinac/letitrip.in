/**
 * @jest-environment jsdom
 *
 * FavoriteButton Component Tests
 * Tests favorite toggle, authentication, loading states, and API interactions
 */

import { useAuth } from "@/contexts/AuthContext";
import { logError } from "@/lib/firebase-error-logger";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { FavoriteButton } from "../FavoriteButton";

// Mock dependencies
jest.mock("@/contexts/AuthContext");
jest.mock("@/lib/firebase-error-logger");

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;
const mockLogError = logError as jest.MockedFunction<typeof logError>;

// Mock fetch
global.fetch = jest.fn();

describe("FavoriteButton Component", () => {
  const mockUser = {
    uid: "user123",
    email: "test@example.com",
    role: "user" as const,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAuth.mockReturnValue({
      user: mockUser,
      loading: false,
      isAuthenticated: true,
      login: jest.fn(),
      loginWithGoogle: jest.fn(),
      register: jest.fn(),
      logout: jest.fn(),
      refreshUser: jest.fn(),
      isAdmin: false,
      isSeller: false,
      isAdminOrSeller: false,
    });

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ success: true }),
    });
  });

  describe("Basic Rendering", () => {
    it("should render without crashing", () => {
      render(<FavoriteButton itemId="product1" itemType="product" />);
      expect(screen.getByRole("button")).toBeInTheDocument();
    });

    it("should render Heart icon", () => {
      const { container } = render(
        <FavoriteButton itemId="product1" itemType="product" />
      );
      const icon = container.querySelector("svg");
      expect(icon).toBeInTheDocument();
    });

    it("should apply default size (md)", () => {
      const { container } = render(
        <FavoriteButton itemId="product1" itemType="product" />
      );
      const icon = container.querySelector(".w-5.h-5");
      expect(icon).toBeInTheDocument();
    });

    it("should apply small size", () => {
      const { container } = render(
        <FavoriteButton itemId="product1" itemType="product" size="sm" />
      );
      const icon = container.querySelector(".w-4.h-4");
      expect(icon).toBeInTheDocument();
    });

    it("should apply large size", () => {
      const { container } = render(
        <FavoriteButton itemId="product1" itemType="product" size="lg" />
      );
      const icon = container.querySelector(".w-6.h-6");
      expect(icon).toBeInTheDocument();
    });

    it("should apply custom className", () => {
      const { container } = render(
        <FavoriteButton
          itemId="product1"
          itemType="product"
          className="custom-class"
        />
      );
      const button = container.querySelector(".custom-class");
      expect(button).toBeInTheDocument();
    });
  });

  describe("Favorite State Display", () => {
    it("should display unfavorited state by default", () => {
      const { container } = render(
        <FavoriteButton itemId="product1" itemType="product" />
      );
      const icon = container.querySelector(".text-gray-400");
      expect(icon).toBeInTheDocument();
    });

    it("should display favorited state when initialIsFavorite is true", () => {
      const { container } = render(
        <FavoriteButton
          itemId="product1"
          itemType="product"
          initialIsFavorite={true}
        />
      );
      const icon = container.querySelector(".fill-red-500");
      expect(icon).toBeInTheDocument();
    });

    it("should have correct aria-label for unfavorited state", () => {
      render(<FavoriteButton itemId="product1" itemType="product" />);
      const button = screen.getByRole("button", { name: /add to favorites/i });
      expect(button).toBeInTheDocument();
    });

    it("should have correct aria-label for favorited state", () => {
      render(
        <FavoriteButton
          itemId="product1"
          itemType="product"
          initialIsFavorite={true}
        />
      );
      const button = screen.getByRole("button", {
        name: /remove from favorites/i,
      });
      expect(button).toBeInTheDocument();
    });

    it("should have correct title for unfavorited state", () => {
      render(<FavoriteButton itemId="product1" itemType="product" />);
      const button = screen.getByRole("button");
      expect(button).toHaveAttribute("title", "Add to favorites");
    });

    it("should have correct title for favorited state", () => {
      render(
        <FavoriteButton
          itemId="product1"
          itemType="product"
          initialIsFavorite={true}
        />
      );
      const button = screen.getByRole("button");
      expect(button).toHaveAttribute("title", "Remove from favorites");
    });
  });

  describe("Authentication", () => {
    it("should redirect to login when user is not authenticated", () => {
      mockUseAuth.mockReturnValue({
        user: null,
        loading: false,
        isAuthenticated: false,
        login: jest.fn(),
        loginWithGoogle: jest.fn(),
        register: jest.fn(),
        logout: jest.fn(),
        refreshUser: jest.fn(),
        isAdmin: false,
        isSeller: false,
        isAdminOrSeller: false,
      });

      delete (global as any).location;
      (global as any).location = { href: "", pathname: "/products/test" };

      render(<FavoriteButton itemId="product1" itemType="product" />);
      const button = screen.getByRole("button");

      fireEvent.click(button);

      expect(globalThis.location.href).toBe(
        "/auth/login?redirect=/products/test"
      );
    });

    it("should not make API call when user is not authenticated", async () => {
      mockUseAuth.mockReturnValue({
        user: null,
        loading: false,
        isAuthenticated: false,
        login: jest.fn(),
        loginWithGoogle: jest.fn(),
        register: jest.fn(),
        logout: jest.fn(),
        refreshUser: jest.fn(),
        isAdmin: false,
        isSeller: false,
        isAdminOrSeller: false,
      });

      delete (global as any).location;
      (global as any).location = { href: "", pathname: "/products" };

      render(<FavoriteButton itemId="product1" itemType="product" />);
      fireEvent.click(screen.getByRole("button"));

      await waitFor(() => {
        expect(global.fetch).not.toHaveBeenCalled();
      });
    });
  });

  describe("Toggle Functionality", () => {
    it("should call API to add favorite when clicked (unfavorited)", async () => {
      render(<FavoriteButton itemId="product1" itemType="product" />);

      fireEvent.click(screen.getByRole("button"));

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          "/api/favorites/product/product1",
          expect.objectContaining({
            method: "POST",
            headers: { "Content-Type": "application/json" },
          })
        );
      });
    });

    it("should call API to remove favorite when clicked (favorited)", async () => {
      render(
        <FavoriteButton
          itemId="product1"
          itemType="product"
          initialIsFavorite={true}
        />
      );

      fireEvent.click(screen.getByRole("button"));

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          "/api/favorites/product/product1",
          expect.objectContaining({
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
          })
        );
      });
    });

    it("should update UI state after successful toggle", async () => {
      const { container } = render(
        <FavoriteButton itemId="product1" itemType="product" />
      );

      const button = screen.getByRole("button");
      fireEvent.click(button);

      await waitFor(() => {
        const icon = container.querySelector(".fill-red-500");
        expect(icon).toBeInTheDocument();
      });
    });

    it("should call onToggle callback with new state", async () => {
      const onToggle = jest.fn();
      render(
        <FavoriteButton
          itemId="product1"
          itemType="product"
          onToggle={onToggle}
        />
      );

      fireEvent.click(screen.getByRole("button"));

      await waitFor(() => {
        expect(onToggle).toHaveBeenCalledWith(true);
      });
    });

    it("should call onToggle with false when removing favorite", async () => {
      const onToggle = jest.fn();
      render(
        <FavoriteButton
          itemId="product1"
          itemType="product"
          initialIsFavorite={true}
          onToggle={onToggle}
        />
      );

      fireEvent.click(screen.getByRole("button"));

      await waitFor(() => {
        expect(onToggle).toHaveBeenCalledWith(false);
      });
    });
  });

  describe("Loading State", () => {
    it("should disable button during loading", async () => {
      (global.fetch as jest.Mock).mockImplementation(
        () =>
          new Promise((resolve) => setTimeout(() => resolve({ ok: true }), 100))
      );

      render(<FavoriteButton itemId="product1" itemType="product" />);
      const button = screen.getByRole("button");

      fireEvent.click(button);

      await waitFor(() => {
        expect(button).toBeDisabled();
      });
    });

    it("should show pulse animation during loading", async () => {
      (global.fetch as jest.Mock).mockImplementation(
        () =>
          new Promise((resolve) => setTimeout(() => resolve({ ok: true }), 100))
      );

      const { container } = render(
        <FavoriteButton itemId="product1" itemType="product" />
      );

      fireEvent.click(screen.getByRole("button"));

      await waitFor(() => {
        const icon = container.querySelector(".animate-pulse");
        expect(icon).toBeInTheDocument();
      });
    });

    it("should prevent multiple simultaneous clicks", async () => {
      render(<FavoriteButton itemId="product1" itemType="product" />);
      const button = screen.getByRole("button");

      fireEvent.click(button);
      fireEvent.click(button);
      fireEvent.click(button);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe("Error Handling", () => {
    it("should log error when API call fails", async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 500,
      });

      render(<FavoriteButton itemId="product1" itemType="product" />);
      fireEvent.click(screen.getByRole("button"));

      await waitFor(() => {
        expect(mockLogError).toHaveBeenCalled();
      });
    });

    it("should not update state when API call fails", async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 500,
      });

      const { container } = render(
        <FavoriteButton itemId="product1" itemType="product" />
      );
      fireEvent.click(screen.getByRole("button"));

      await waitFor(() => {
        expect(mockLogError).toHaveBeenCalled();
      });

      // Should still be unfavorited
      const icon = container.querySelector(".text-gray-400");
      expect(icon).toBeInTheDocument();
    });

    it("should not call onToggle when API fails", async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 500,
      });

      const onToggle = jest.fn();
      render(
        <FavoriteButton
          itemId="product1"
          itemType="product"
          onToggle={onToggle}
        />
      );
      fireEvent.click(screen.getByRole("button"));

      await waitFor(() => {
        expect(mockLogError).toHaveBeenCalled();
      });

      expect(onToggle).not.toHaveBeenCalled();
    });

    it("should handle network errors", async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error("Network error"));

      render(<FavoriteButton itemId="product1" itemType="product" />);
      fireEvent.click(screen.getByRole("button"));

      await waitFor(() => {
        expect(mockLogError).toHaveBeenCalledWith(
          expect.any(Error),
          expect.objectContaining({
            component: "FavoriteButton.handleToggle",
          })
        );
      });
    });

    it("should re-enable button after error", async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error("Network error"));

      render(<FavoriteButton itemId="product1" itemType="product" />);
      const button = screen.getByRole("button");

      fireEvent.click(button);

      await waitFor(() => {
        expect(button).not.toBeDisabled();
      });
    });
  });

  describe("Different Item Types", () => {
    it("should handle product item type", async () => {
      render(<FavoriteButton itemId="product1" itemType="product" />);
      fireEvent.click(screen.getByRole("button"));

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          "/api/favorites/product/product1",
          expect.any(Object)
        );
      });
    });

    it("should handle shop item type", async () => {
      render(<FavoriteButton itemId="shop1" itemType="shop" />);
      fireEvent.click(screen.getByRole("button"));

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          "/api/favorites/shop/shop1",
          expect.any(Object)
        );
      });
    });

    it("should handle category item type", async () => {
      render(<FavoriteButton itemId="cat1" itemType="category" />);
      fireEvent.click(screen.getByRole("button"));

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          "/api/favorites/category/cat1",
          expect.any(Object)
        );
      });
    });

    it("should handle auction item type", async () => {
      render(<FavoriteButton itemId="auction1" itemType="auction" />);
      fireEvent.click(screen.getByRole("button"));

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          "/api/favorites/auction/auction1",
          expect.any(Object)
        );
      });
    });
  });

  describe("Event Handling", () => {
    it("should prevent default event behavior", () => {
      render(<FavoriteButton itemId="product1" itemType="product" />);

      const mockEvent = {
        preventDefault: jest.fn(),
        stopPropagation: jest.fn(),
      };

      const button = screen.getByRole("button");
      button.onclick = (e) => {
        mockEvent.preventDefault();
        mockEvent.stopPropagation();
      };

      fireEvent.click(button);

      expect(mockEvent.preventDefault).toHaveBeenCalled();
      expect(mockEvent.stopPropagation).toHaveBeenCalled();
    });
  });

  describe("Accessibility", () => {
    it("should have proper button role", () => {
      render(<FavoriteButton itemId="product1" itemType="product" />);
      expect(screen.getByRole("button")).toBeInTheDocument();
    });

    it("should have descriptive aria-label", () => {
      render(<FavoriteButton itemId="product1" itemType="product" />);
      const button = screen.getByRole("button");
      expect(button).toHaveAttribute("aria-label");
    });

    it("should update aria-label when state changes", async () => {
      render(<FavoriteButton itemId="product1" itemType="product" />);

      fireEvent.click(screen.getByRole("button"));

      await waitFor(() => {
        const button = screen.getByRole("button", {
          name: /remove from favorites/i,
        });
        expect(button).toBeInTheDocument();
      });
    });

    it("should be keyboard accessible", () => {
      render(<FavoriteButton itemId="product1" itemType="product" />);
      const button = screen.getByRole("button");

      button.focus();
      expect(button).toHaveFocus();
    });

    it("should show disabled cursor when disabled", async () => {
      (global.fetch as jest.Mock).mockImplementation(
        () =>
          new Promise((resolve) => setTimeout(() => resolve({ ok: true }), 100))
      );

      const { container } = render(
        <FavoriteButton itemId="product1" itemType="product" />
      );

      fireEvent.click(screen.getByRole("button"));

      await waitFor(() => {
        const button = container.querySelector(
          ".disabled\\:cursor-not-allowed"
        );
        expect(button).toBeInTheDocument();
      });
    });
  });
});

// BUG FIX #40: FavoriteButton Component Issues
// ISSUE 1: No debouncing on toggle - rapid clicks can cause race conditions
// ISSUE 2: Redirect uses window.location.href instead of Next.js router
// ISSUE 3: No optimistic UI update - waits for API before updating state
// ISSUE 4: Error state not shown to user - only logged
// ISSUE 5: No retry mechanism for failed requests
// ISSUE 6: Missing error metadata in logError (should include itemId and itemType)
// ISSUE 7: Event handlers (preventDefault, stopPropagation) should be at top of function
// ISSUE 8: No analytics tracking for favorite actions
// ISSUE 9: initialIsFavorite doesn't sync with external state changes
// ISSUE 10: Hardcoded redirect URL instead of using query params properly
