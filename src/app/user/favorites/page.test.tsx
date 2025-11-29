import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";

// Mock Next.js components
jest.mock("next/link", () => {
  return ({ children, href }: any) => <a href={href}>{children}</a>;
});

jest.mock("next/image", () => ({
  __esModule: true,
  default: ({ src, alt }: any) => <img src={src} alt={alt} />,
}));

// Mock auth context
jest.mock("@/contexts/AuthContext", () => ({
  useAuth: jest.fn(),
}));
const mockUseAuth = require("@/contexts/AuthContext").useAuth;

// Mock fetch
const mockFetch = jest.fn();
global.fetch = mockFetch;

// Import page after mocks
const FavoritesPage = require("./page").default;

describe("FavoritesPage", () => {
  const mockUser = {
    id: "user-123",
    email: "test@example.com",
  };

  const mockFavorites = [
    {
      id: "item-1",
      name: "Test Product",
      image: "/test.jpg",
      price: 1000,
      favorited_at: "2024-01-01",
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Authentication", () => {
    it("shows sign in prompt when not authenticated", () => {
      mockUseAuth.mockReturnValue({
        user: null,
      });

      render(<FavoritesPage />);

      expect(screen.getByText("Sign in to view favorites")).toBeInTheDocument();
      expect(screen.getByRole("link", { name: "Sign In" })).toHaveAttribute(
        "href",
        "/auth/login",
      );
    });

    it("shows favorites when authenticated", () => {
      mockUseAuth.mockReturnValue({
        user: mockUser,
      });
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ data: [] }),
      });

      render(<FavoritesPage />);

      expect(screen.getByText("My Favorites")).toBeInTheDocument();
    });
  });

  describe("Loading Favorites", () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue({
        user: mockUser,
      });
    });

    it("loads favorites on mount", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ data: mockFavorites }),
      });

      render(<FavoritesPage />);

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith("/api/favorites/list/product");
      });
    });

    it("displays favorites", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ data: mockFavorites }),
      });

      render(<FavoritesPage />);

      await waitFor(() => {
        expect(screen.getByText("Test Product")).toBeInTheDocument();
      });
    });

    it("shows empty state when no favorites", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ data: [] }),
      });

      render(<FavoritesPage />);

      await waitFor(() => {
        expect(screen.getByText("No favorites yet")).toBeInTheDocument();
      });
    });

    it("handles API error", async () => {
      mockFetch.mockRejectedValueOnce(new Error("API Error"));

      render(<FavoritesPage />);

      await waitFor(() => {
        expect(
          screen.getByText("Failed to load favorites"),
        ).toBeInTheDocument();
      });
    });
  });

  describe("Tab Switching", () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue({
        user: mockUser,
      });
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ data: [] }),
      });
    });

    it("switches tabs and loads different favorites", async () => {
      render(<FavoritesPage />);

      const shopsTab = screen.getByRole("button", { name: /shops/i });
      fireEvent.click(shopsTab);

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith("/api/favorites/list/shop");
      });
    });
  });

  describe("Remove Favorite", () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue({
        user: mockUser,
      });
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ data: mockFavorites }),
      });
    });

    it("removes favorite on button click", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
      });

      render(<FavoritesPage />);

      await waitFor(() => {
        expect(screen.getByText("Test Product")).toBeInTheDocument();
      });

      const removeButton = screen.getByRole("button", { name: /remove/i });
      fireEvent.click(removeButton);

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith(
          "/api/favorites/product/item-1",
          {
            method: "DELETE",
          },
        );
      });
    });
  });
});
