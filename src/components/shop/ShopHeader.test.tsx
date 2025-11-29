/**
 * ShopHeader Component Tests
 *
 * Tests for shop header display with banner, logo, info, and actions
 */

import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { ShopHeader } from "./ShopHeader";
import type { ShopFE } from "@/types/frontend/shop.types";

// Mock services
jest.mock("@/services/shops.service", () => ({
  shopsService: {
    checkFollowing: jest.fn(),
    follow: jest.fn(),
    unfollow: jest.fn(),
  },
}));

import { shopsService } from "@/services/shops.service";

// Mock navigator.share
const mockShare = jest.fn();
const mockClipboard = {
  writeText: jest.fn(),
};

Object.defineProperty(window, "navigator", {
  value: {
    share: mockShare,
    clipboard: mockClipboard,
  },
  writable: true,
});

// Mock window.alert
global.alert = jest.fn();

// Sample shop data
const mockShop: ShopFE = {
  id: "shop-1",
  name: "Amazing Electronics",
  slug: "amazing-electronics",
  logo: "/logo.jpg",
  banner: "/banner.jpg",
  description: "Best electronics store",
  ownerId: "user-1",
  ownerName: "John Doe",
  ownerEmail: "john@example.com",
  rating: 4.5,
  reviewCount: 120,
  productCount: 50,
  city: "Mumbai",
  state: "Maharashtra",
  isVerified: true,
  createdAt: new Date("2023-01-15"),
  updatedAt: new Date("2024-01-15"),
} as any;

describe("ShopHeader Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (shopsService.checkFollowing as jest.Mock).mockResolvedValue({
      isFollowing: false,
    });
  });

  describe("Basic Rendering", () => {
    it("should render shop header with all elements", async () => {
      render(<ShopHeader shop={mockShop} />);

      await waitFor(() => {
        expect(screen.getByText("Amazing Electronics")).toBeInTheDocument();
      });

      expect(screen.getByText("4.5")).toBeInTheDocument();
      expect(screen.getByText("(120 reviews)")).toBeInTheDocument();
      expect(screen.getByText("Mumbai, Maharashtra")).toBeInTheDocument();
      expect(screen.getByText("Verified Seller")).toBeInTheDocument();
      expect(screen.getByText("50")).toBeInTheDocument();
      expect(screen.getByText("Products")).toBeInTheDocument();
    });

    it("should render banner image when provided", () => {
      render(<ShopHeader shop={mockShop} />);

      const banner = screen.getByAltText("Amazing Electronics banner");
      expect(banner).toBeInTheDocument();
      expect(banner).toHaveAttribute("src", "/banner.jpg");
    });

    it("should render logo image when provided", () => {
      render(<ShopHeader shop={mockShop} />);

      const logo = screen.getByAltText("Amazing Electronics");
      expect(logo).toBeInTheDocument();
      expect(logo).toHaveAttribute("src", "/logo.jpg");
    });

    it("should render shop name as heading", () => {
      render(<ShopHeader shop={mockShop} />);

      const heading = screen.getByRole("heading", { level: 1 });
      expect(heading).toHaveTextContent("Amazing Electronics");
    });

    it("should render follow and share buttons", async () => {
      render(<ShopHeader shop={mockShop} />);

      await waitFor(() => {
        expect(screen.getByText("Follow")).toBeInTheDocument();
      });

      const shareButton = screen.getByRole("button", { name: "" });
      expect(shareButton).toBeInTheDocument();
    });
  });

  describe("Shop Information Display", () => {
    it("should display rating with star icon", () => {
      render(<ShopHeader shop={mockShop} />);

      expect(screen.getByText("4.5")).toBeInTheDocument();
      expect(screen.getByText("(120 reviews)")).toBeInTheDocument();
    });

    it("should display location with pin icon", () => {
      render(<ShopHeader shop={mockShop} />);

      expect(screen.getByText("Mumbai, Maharashtra")).toBeInTheDocument();
    });

    it("should display verified badge when verified", () => {
      render(<ShopHeader shop={mockShop} />);

      const badge = screen.getByText("Verified Seller");
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveClass("bg-blue-100", "text-blue-700");
    });

    it("should not display verified badge when not verified", () => {
      const unverifiedShop = { ...mockShop, isVerified: false };
      render(<ShopHeader shop={unverifiedShop} />);

      expect(screen.queryByText("Verified Seller")).not.toBeInTheDocument();
    });

    it("should display product count", () => {
      render(<ShopHeader shop={mockShop} />);

      expect(screen.getByText("50")).toBeInTheDocument();
      expect(screen.getByText("Products")).toBeInTheDocument();
    });

    it("should display joined date", () => {
      render(<ShopHeader shop={mockShop} />);

      expect(screen.getByText("Joined")).toBeInTheDocument();
      expect(screen.getByText("January 2023")).toBeInTheDocument();
    });

    it("should display city only if state not provided", () => {
      const shopWithCityOnly = { ...mockShop, state: null } as any;
      render(<ShopHeader shop={shopWithCityOnly} />);

      expect(screen.getByText("Mumbai")).toBeInTheDocument();
      expect(screen.queryByText("Maharashtra")).not.toBeInTheDocument();
    });

    it("should display state only if city not provided", () => {
      const shopWithStateOnly = { ...mockShop, city: null } as any;
      render(<ShopHeader shop={shopWithStateOnly} />);

      expect(screen.getByText("Maharashtra")).toBeInTheDocument();
      expect(screen.queryByText("Mumbai")).not.toBeInTheDocument();
    });

    it("should not display location if neither city nor state", () => {
      const shopWithoutLocation = {
        ...mockShop,
        city: null,
        state: null,
      } as any;
      render(<ShopHeader shop={shopWithoutLocation} />);

      const mapPinIcons = document.querySelectorAll("svg");
      const hasMapPin = Array.from(mapPinIcons).some((svg) =>
        svg.getAttribute("class")?.includes("MapPin"),
      );
      expect(hasMapPin).toBe(false);
    });
  });

  describe("Banner and Logo", () => {
    it("should not render banner section if no banner provided", () => {
      const shopWithoutBanner = { ...mockShop, banner: null } as any;
      render(<ShopHeader shop={shopWithoutBanner} />);

      expect(
        screen.queryByAltText("Amazing Electronics banner"),
      ).not.toBeInTheDocument();
    });

    it("should render fallback logo with initial if no logo", () => {
      const shopWithoutLogo = { ...mockShop, logo: null } as any;
      render(<ShopHeader shop={shopWithoutLogo} />);

      expect(screen.getByText("A")).toBeInTheDocument(); // First letter of shop name
    });

    it("should apply correct styling to banner", () => {
      const { container } = render(<ShopHeader shop={mockShop} />);

      const banner = container.querySelector(
        'img[alt="Amazing Electronics banner"]',
      );
      expect(banner).toHaveClass("w-full", "h-full", "object-cover");
    });

    it("should apply correct styling to logo", () => {
      render(<ShopHeader shop={mockShop} />);

      const logo = screen.getByAltText("Amazing Electronics");
      expect(logo).toHaveClass(
        "w-24",
        "h-24",
        "rounded-lg",
        "object-cover",
        "border-4",
        "border-white",
        "shadow-lg",
      );
    });
  });

  describe("Follow Functionality", () => {
    it("should check follow status on mount", async () => {
      render(<ShopHeader shop={mockShop} />);

      await waitFor(() => {
        expect(shopsService.checkFollowing).toHaveBeenCalledWith(
          "amazing-electronics",
        );
      });
    });

    it("should display loading state while checking follow status", () => {
      render(<ShopHeader shop={mockShop} />);

      expect(screen.getByText("...")).toBeInTheDocument();
    });

    it("should display Follow button when not following", async () => {
      (shopsService.checkFollowing as jest.Mock).mockResolvedValue({
        isFollowing: false,
      });

      render(<ShopHeader shop={mockShop} />);

      await waitFor(() => {
        expect(screen.getByText("Follow")).toBeInTheDocument();
      });

      const followButton = screen.getByText("Follow");
      expect(followButton).toHaveClass("bg-blue-600", "text-white");
    });

    it("should display Following button when already following", async () => {
      (shopsService.checkFollowing as jest.Mock).mockResolvedValue({
        isFollowing: true,
      });

      render(<ShopHeader shop={mockShop} />);

      await waitFor(() => {
        expect(screen.getByText("Following")).toBeInTheDocument();
      });

      const followButton = screen.getByText("Following");
      expect(followButton).toHaveClass("bg-gray-100", "text-gray-700");
    });

    it("should call follow service when clicking Follow button", async () => {
      (shopsService.follow as jest.Mock).mockResolvedValue({});

      render(<ShopHeader shop={mockShop} />);

      await waitFor(() => {
        expect(screen.getByText("Follow")).toBeInTheDocument();
      });

      const followButton = screen.getByText("Follow");
      fireEvent.click(followButton);

      await waitFor(() => {
        expect(shopsService.follow).toHaveBeenCalledWith("amazing-electronics");
      });
    });

    it("should update to Following state after successful follow", async () => {
      (shopsService.follow as jest.Mock).mockResolvedValue({});

      render(<ShopHeader shop={mockShop} />);

      await waitFor(() => {
        expect(screen.getByText("Follow")).toBeInTheDocument();
      });

      const followButton = screen.getByText("Follow");
      fireEvent.click(followButton);

      await waitFor(() => {
        expect(screen.getByText("Following")).toBeInTheDocument();
      });
    });

    it("should call unfollow service when clicking Following button", async () => {
      (shopsService.checkFollowing as jest.Mock).mockResolvedValue({
        isFollowing: true,
      });
      (shopsService.unfollow as jest.Mock).mockResolvedValue({});

      render(<ShopHeader shop={mockShop} />);

      await waitFor(() => {
        expect(screen.getByText("Following")).toBeInTheDocument();
      });

      const followButton = screen.getByText("Following");
      fireEvent.click(followButton);

      await waitFor(() => {
        expect(shopsService.unfollow).toHaveBeenCalledWith(
          "amazing-electronics",
        );
      });
    });

    it("should update to Follow state after successful unfollow", async () => {
      (shopsService.checkFollowing as jest.Mock).mockResolvedValue({
        isFollowing: true,
      });
      (shopsService.unfollow as jest.Mock).mockResolvedValue({});

      render(<ShopHeader shop={mockShop} />);

      await waitFor(() => {
        expect(screen.getByText("Following")).toBeInTheDocument();
      });

      const followButton = screen.getByText("Following");
      fireEvent.click(followButton);

      await waitFor(() => {
        expect(screen.getByText("Follow")).toBeInTheDocument();
      });
    });

    it("should disable follow button while loading", async () => {
      (shopsService.follow as jest.Mock).mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 100)),
      );

      render(<ShopHeader shop={mockShop} />);

      await waitFor(() => {
        expect(screen.getByText("Follow")).toBeInTheDocument();
      });

      const followButton = screen.getByText("Follow");
      fireEvent.click(followButton);

      expect(followButton).toBeDisabled();
    });

    it("should show alert on follow error", async () => {
      (shopsService.follow as jest.Mock).mockRejectedValue(
        new Error("Please login to follow shops"),
      );

      render(<ShopHeader shop={mockShop} />);

      await waitFor(() => {
        expect(screen.getByText("Follow")).toBeInTheDocument();
      });

      const followButton = screen.getByText("Follow");
      fireEvent.click(followButton);

      await waitFor(() => {
        expect(global.alert).toHaveBeenCalledWith(
          "Please login to follow shops",
        );
      });
    });

    it("should default to not following on check error", async () => {
      (shopsService.checkFollowing as jest.Mock).mockRejectedValue(
        new Error("Not authenticated"),
      );

      render(<ShopHeader shop={mockShop} />);

      await waitFor(() => {
        expect(screen.getByText("Follow")).toBeInTheDocument();
      });
    });
  });

  describe("Share Functionality", () => {
    it("should call navigator.share when supported", async () => {
      mockShare.mockResolvedValue(undefined);
      window.navigator.share = mockShare;

      render(<ShopHeader shop={mockShop} />);

      await waitFor(() => {
        expect(screen.getByText("Follow")).toBeInTheDocument();
      });

      const buttons = screen.getAllByRole("button");
      // Share button is the one with Share2 icon (second button after Follow)
      const shareButton = buttons[1];

      fireEvent.click(shareButton);

      await waitFor(() => {
        expect(mockShare).toHaveBeenCalledWith({
          title: "Amazing Electronics",
          url: expect.any(String),
        });
      });
    });

    it("should copy to clipboard when share not supported", async () => {
      // @ts-ignore
      delete window.navigator.share;

      render(<ShopHeader shop={mockShop} />);

      await waitFor(() => {
        expect(screen.getByText("Follow")).toBeInTheDocument();
      });

      const buttons = screen.getAllByRole("button");
      // Share button is the one with Share2 icon (second button after Follow)
      const shareButton = buttons[1];

      fireEvent.click(shareButton);

      await waitFor(() => {
        expect(mockClipboard.writeText).toHaveBeenCalled();
      });

      expect(global.alert).toHaveBeenCalledWith("Link copied to clipboard!");
    });
  });

  describe("Edge Cases", () => {
    it("should handle shop with no rating", () => {
      const shopWithoutRating = { ...mockShop, rating: 0, reviewCount: 0 };
      render(<ShopHeader shop={shopWithoutRating} />);

      expect(screen.queryByText(/reviews/)).not.toBeInTheDocument();
    });

    it("should handle shop with no products", () => {
      const shopWithoutProducts = { ...mockShop, productCount: 0 };
      render(<ShopHeader shop={shopWithoutProducts} />);

      expect(screen.getByText("0")).toBeInTheDocument();
      expect(screen.getByText("Products")).toBeInTheDocument();
    });

    it("should handle shop with no created date", () => {
      const shopWithoutDate = { ...mockShop, createdAt: null as any };
      render(<ShopHeader shop={shopWithoutDate} />);

      expect(screen.queryByText("Joined")).not.toBeInTheDocument();
    });

    it("should handle very long shop name", () => {
      const longName = "A".repeat(100);
      const shopWithLongName = { ...mockShop, name: longName };
      render(<ShopHeader shop={shopWithLongName} />);

      expect(screen.getByText(longName)).toBeInTheDocument();
    });

    it("should handle special characters in shop name", () => {
      const specialName = "Shop & Co. <Test>";
      const shopWithSpecialName = { ...mockShop, name: specialName };
      render(<ShopHeader shop={shopWithSpecialName} />);

      expect(screen.getByText(specialName)).toBeInTheDocument();
    });

    it("should re-check follow status when shop slug changes", async () => {
      const { rerender } = render(<ShopHeader shop={mockShop} />);

      await waitFor(() => {
        expect(shopsService.checkFollowing).toHaveBeenCalledTimes(1);
      });

      const newShop = { ...mockShop, slug: "new-shop" };
      rerender(<ShopHeader shop={newShop} />);

      await waitFor(() => {
        expect(shopsService.checkFollowing).toHaveBeenCalledTimes(2);
        expect(shopsService.checkFollowing).toHaveBeenCalledWith("new-shop");
      });
    });
  });

  describe("Accessibility", () => {
    it("should have proper heading hierarchy", () => {
      render(<ShopHeader shop={mockShop} />);

      const heading = screen.getByRole("heading", { level: 1 });
      expect(heading).toHaveTextContent("Amazing Electronics");
    });

    it("should have alt text for images", () => {
      render(<ShopHeader shop={mockShop} />);

      expect(screen.getByAltText("Amazing Electronics")).toBeInTheDocument();
      expect(
        screen.getByAltText("Amazing Electronics banner"),
      ).toBeInTheDocument();
    });

    it("should have accessible buttons", async () => {
      render(<ShopHeader shop={mockShop} />);

      await waitFor(() => {
        const buttons = screen.getAllByRole("button");
        expect(buttons.length).toBeGreaterThan(0);
      });
    });
  });

  describe("Styling", () => {
    it("should apply correct container styling", () => {
      const { container } = render(<ShopHeader shop={mockShop} />);

      const header = container.firstChild;
      expect(header).toHaveClass("bg-white", "border-b");
    });

    it("should apply responsive flex layout", () => {
      const { container } = render(<ShopHeader shop={mockShop} />);

      const flexContainer = container.querySelector(
        ".flex.flex-col.md\\:flex-row",
      );
      expect(flexContainer).toBeInTheDocument();
    });

    it("should style follow button differently when following", async () => {
      (shopsService.checkFollowing as jest.Mock).mockResolvedValue({
        isFollowing: true,
      });

      render(<ShopHeader shop={mockShop} />);

      await waitFor(() => {
        const followButton = screen.getByText("Following");
        expect(followButton).toHaveClass("bg-gray-100", "text-gray-700");
      });
    });
  });
});
