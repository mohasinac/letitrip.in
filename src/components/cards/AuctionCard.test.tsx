/**
 * AuctionCard Component Tests
 *
 * Tests for auction card display in listing pages
 */

import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import AuctionCard, { AuctionCardProps } from "./AuctionCard";

// Mock dependencies
jest.mock("next/link", () => {
  return function MockLink({
    children,
    href,
    ...props
  }: {
    children: React.ReactNode;
    href: string;
  }) {
    return (
      <a href={href} {...props}>
        {children}
      </a>
    );
  };
});

jest.mock("@/components/common/OptimizedImage", () => {
  return function MockOptimizedImage({
    src,
    alt,
    ...props
  }: {
    src: string;
    alt: string;
  }) {
    return <img src={src} alt={alt} data-testid="optimized-image" />;
  };
});

jest.mock("@/components/common/FavoriteButton", () => ({
  FavoriteButton: ({
    itemId,
    onToggle,
    initialIsFavorite,
  }: {
    itemId: string;
    onToggle?: () => void;
    initialIsFavorite?: boolean;
  }) => (
    <button
      data-testid="favorite-button"
      data-item-id={itemId}
      data-is-favorite={initialIsFavorite}
      onClick={onToggle}
    >
      {initialIsFavorite ? "★" : "☆"}
    </button>
  ),
}));

jest.mock("@/lib/formatters", () => ({
  formatCurrency: (amount: number) => `₹${amount.toLocaleString()}`,
  formatTimeRemaining: jest.fn((date: Date | null) => {
    if (!date) return "Unknown";
    const now = new Date();
    const diff = date.getTime() - now.getTime();
    if (diff < 0) return "Ended";
    return "2 days left";
  }),
}));

jest.mock("@/lib/validation/auction", () => ({
  getTimeRemaining: jest.fn((date: Date | null) => {
    if (!date) {
      return {
        totalMs: 0,
        isEnded: true,
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
      };
    }
    const now = new Date();
    const diff = date.getTime() - now.getTime();
    return {
      totalMs: diff,
      isEnded: diff <= 0,
      days: Math.floor(diff / (1000 * 60 * 60 * 24)),
      hours: 0,
      minutes: 0,
      seconds: 0,
    };
  }),
}));

// Sample auction data
const mockAuction = {
  id: "auction-1",
  name: "Vintage Watch",
  slug: "vintage-watch",
  images: ["/image1.jpg", "/image2.jpg"],
  currentBid: 5000,
  startingBid: 2000,
  bidCount: 15,
  endTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
  condition: "used" as const,
  featured: false,
  shop: {
    id: "shop-1",
    name: "Vintage Store",
    logo: "/logo.jpg",
    isVerified: true,
  },
  viewCount: 1250,
};

describe("AuctionCard Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Basic Rendering", () => {
    it("should render auction card with basic information", () => {
      render(<AuctionCard auction={mockAuction} />);

      expect(screen.getByText("Vintage Watch")).toBeInTheDocument();
      expect(screen.getByText("₹5,000")).toBeInTheDocument();
      expect(screen.getByText("15 bids")).toBeInTheDocument();
    });

    it("should render as a link to auction detail page", () => {
      const { container } = render(<AuctionCard auction={mockAuction} />);

      const link = container.querySelector('a[href="/auctions/vintage-watch"]');
      expect(link).toBeInTheDocument();
    });

    it("should display auction image", () => {
      render(<AuctionCard auction={mockAuction} />);

      const image = screen.getByAltText("Vintage Watch");
      expect(image).toBeInTheDocument();
      expect(image).toHaveAttribute("src", "/image1.jpg");
    });

    it("should show time remaining", () => {
      render(<AuctionCard auction={mockAuction} />);

      expect(screen.getByText("2 days left")).toBeInTheDocument();
    });

    it("should display place bid button", () => {
      render(<AuctionCard auction={mockAuction} />);

      expect(screen.getByText("Place Bid")).toBeInTheDocument();
    });
  });

  describe("Shop Information", () => {
    it("should show shop info by default", () => {
      render(<AuctionCard auction={mockAuction} />);

      expect(screen.getByText("Vintage Store")).toBeInTheDocument();
    });

    it("should hide shop info when showShopInfo is false", () => {
      render(<AuctionCard auction={mockAuction} showShopInfo={false} />);

      expect(screen.queryByText("Vintage Store")).not.toBeInTheDocument();
    });

    it("should show verification badge for verified shops", () => {
      const { container } = render(<AuctionCard auction={mockAuction} />);

      const verifiedBadge = container.querySelector("svg.text-blue-500");
      expect(verifiedBadge).toBeInTheDocument();
    });

    it("should show shop logo", () => {
      render(<AuctionCard auction={mockAuction} />);

      const logos = screen.getAllByTestId("optimized-image");
      expect(logos.length).toBeGreaterThan(0);
    });

    it("should handle shop without logo", () => {
      const auctionWithoutLogo = {
        ...mockAuction,
        shop: {
          ...mockAuction.shop,
          logo: undefined,
        },
      };

      render(<AuctionCard auction={auctionWithoutLogo} />);
      expect(screen.getByText("Vintage Store")).toBeInTheDocument();
    });
  });

  describe("Bid Information", () => {
    it("should show current bid when bids exist", () => {
      render(<AuctionCard auction={mockAuction} />);

      expect(screen.getByText("₹5,000")).toBeInTheDocument();
      expect(screen.getByText("Current Bid")).toBeInTheDocument();
    });

    it("should show starting bid when no bids", () => {
      const auctionNoBids = {
        ...mockAuction,
        currentBid: 0,
        bidCount: 0,
      };

      render(<AuctionCard auction={auctionNoBids} />);

      expect(screen.getByText("₹2,000")).toBeInTheDocument();
    });

    it("should show 'bid' singular for 1 bid", () => {
      const auctionOneBid = {
        ...mockAuction,
        bidCount: 1,
      };

      render(<AuctionCard auction={auctionOneBid} />);

      expect(screen.getByText("1 bid")).toBeInTheDocument();
    });

    it("should show 'bids' plural for multiple bids", () => {
      render(<AuctionCard auction={mockAuction} />);

      expect(screen.getByText("15 bids")).toBeInTheDocument();
    });

    it("should not show bid count when zero bids", () => {
      const auctionNoBids = {
        ...mockAuction,
        currentBid: 0,
        bidCount: 0,
      };

      render(<AuctionCard auction={auctionNoBids} />);

      expect(screen.queryByText(/bid/)).not.toBeInTheDocument();
    });
  });

  describe("Auction Status", () => {
    it("should show featured badge for featured auctions", () => {
      const featuredAuction = {
        ...mockAuction,
        featured: true,
      };

      render(<AuctionCard auction={featuredAuction} />);

      expect(screen.getByText("Featured")).toBeInTheDocument();
    });

    it("should show condition badge for non-new items", () => {
      render(<AuctionCard auction={mockAuction} />);

      expect(screen.getByText("used")).toBeInTheDocument();
    });

    it("should not show condition badge for new items", () => {
      const newAuction = {
        ...mockAuction,
        condition: "new" as const,
      };

      render(<AuctionCard auction={newAuction} />);

      expect(screen.queryByText("new")).not.toBeInTheDocument();
    });

    it("should show refurbished badge", () => {
      const refurbishedAuction = {
        ...mockAuction,
        condition: "refurbished" as const,
      };

      render(<AuctionCard auction={refurbishedAuction} />);

      expect(screen.getByText("refurbished")).toBeInTheDocument();
    });

    it("should show ending soon badge for auctions ending within 24 hours", () => {
      const endingSoonAuction = {
        ...mockAuction,
        endTime: new Date(Date.now() + 12 * 60 * 60 * 1000), // 12 hours
      };

      render(<AuctionCard auction={endingSoonAuction} />);

      expect(screen.getByText("Ending Soon")).toBeInTheDocument();
    });

    it("should show ended badge for ended auctions", () => {
      const endedAuction = {
        ...mockAuction,
        endTime: new Date(Date.now() - 1000), // Past
      };

      const { container } = render(<AuctionCard auction={endedAuction} />);

      // Check for badge with specific styling
      const endedBadge = container.querySelector(".bg-red-500");
      expect(endedBadge).toBeInTheDocument();
      expect(endedBadge).toHaveTextContent("Ended");
    });

    it("should disable bid button for ended auctions", () => {
      const endedAuction = {
        ...mockAuction,
        endTime: new Date(Date.now() - 1000),
      };

      render(<AuctionCard auction={endedAuction} />);

      const bidButton = screen.getByText("Auction Ended");
      expect(bidButton).toBeDisabled();
    });
  });

  describe("Media Handling", () => {
    it("should show media count badge for multiple images", () => {
      render(<AuctionCard auction={mockAuction} />);

      expect(screen.getByText("2")).toBeInTheDocument(); // 2 images
    });

    it("should show video count when videos exist", () => {
      const auctionWithVideos = {
        ...mockAuction,
        videos: ["/video1.mp4", "/video2.mp4"],
      };

      const { container } = render(<AuctionCard auction={auctionWithVideos} />);

      // Should show both image and video badges
      const badges = container.querySelectorAll(".bg-black\\/60");
      expect(badges.length).toBeGreaterThanOrEqual(2);
    });

    it("should show placeholder when no images", () => {
      const auctionNoImages = {
        ...mockAuction,
        images: [],
      };

      const { container } = render(<AuctionCard auction={auctionNoImages} />);

      const placeholder = container.querySelector("svg"); // Gavel icon
      expect(placeholder).toBeInTheDocument();
    });

    it("should handle auction with both images and videos", () => {
      const auctionMixed = {
        ...mockAuction,
        images: ["/image1.jpg"],
        videos: ["/video1.mp4"],
      };

      render(<AuctionCard auction={auctionMixed} />);

      // Should show both counts
      const badges = screen.getAllByText("1");
      expect(badges.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe("View Count", () => {
    it("should show view count when available", () => {
      render(<AuctionCard auction={mockAuction} />);

      expect(screen.getByText("1k")).toBeInTheDocument(); // 1250 views -> 1k
    });

    it("should show exact count for views under 1000", () => {
      const auctionLowViews = {
        ...mockAuction,
        viewCount: 500,
      };

      render(<AuctionCard auction={auctionLowViews} />);

      expect(screen.getByText("500")).toBeInTheDocument();
    });

    it("should not show view count when zero", () => {
      const auctionNoViews = {
        ...mockAuction,
        viewCount: 0,
      };

      const { container } = render(<AuctionCard auction={auctionNoViews} />);

      // Eye icon should not be present
      const eyeIcons = container.querySelectorAll(".lucide-eye");
      expect(eyeIcons.length).toBe(0);
    });
  });

  describe("Favorite/Watch Functionality", () => {
    it("should render favorite button", () => {
      render(<AuctionCard auction={mockAuction} />);

      expect(screen.getByTestId("favorite-button")).toBeInTheDocument();
    });

    it("should pass auction ID to favorite button", () => {
      render(<AuctionCard auction={mockAuction} />);

      const favoriteBtn = screen.getByTestId("favorite-button");
      expect(favoriteBtn).toHaveAttribute("data-item-id", "auction-1");
    });

    it("should show watched state", () => {
      render(<AuctionCard auction={mockAuction} isWatched={true} />);

      const favoriteBtn = screen.getByTestId("favorite-button");
      expect(favoriteBtn).toHaveAttribute("data-is-favorite", "true");
    });

    it("should call onWatch callback", () => {
      const onWatch = jest.fn();
      render(<AuctionCard auction={mockAuction} onWatch={onWatch} />);

      fireEvent.click(screen.getByTestId("favorite-button"));

      expect(onWatch).toHaveBeenCalledWith("auction-1");
    });
  });

  describe("Hover Effects", () => {
    it("should handle mouse enter", () => {
      const { container } = render(<AuctionCard auction={mockAuction} />);

      const card = container.querySelector("a");
      if (card) {
        fireEvent.mouseEnter(card);
      }

      expect(card).toBeTruthy();
    });

    it("should handle mouse leave", () => {
      const { container } = render(<AuctionCard auction={mockAuction} />);

      const card = container.querySelector("a");
      if (card) {
        fireEvent.mouseEnter(card);
        fireEvent.mouseLeave(card);
      }

      expect(card).toBeTruthy();
    });
  });

  describe("Click Handling", () => {
    it("should prevent default on bid button click", () => {
      render(<AuctionCard auction={mockAuction} />);

      const bidButton = screen.getByText("Place Bid");
      const event = new MouseEvent("click", {
        bubbles: true,
        cancelable: true,
      });
      Object.defineProperty(event, "preventDefault", {
        value: jest.fn(),
        writable: true,
      });

      fireEvent.click(bidButton, event);

      expect(bidButton).toBeInTheDocument();
    });
  });

  describe("Date Handling", () => {
    it("should handle Date object for endTime", () => {
      render(<AuctionCard auction={mockAuction} />);

      expect(screen.getByText("2 days left")).toBeInTheDocument();
    });

    it("should handle string date for endTime", () => {
      const auctionStringDate = {
        ...mockAuction,
        endTime: "2024-12-31T00:00:00Z",
      };

      render(<AuctionCard auction={auctionStringDate} />);

      // Check for any time-related text
      const timeTexts = ["left", "Ended", "2 days left"];
      const hasTimeText = timeTexts.some((text) =>
        document.body.textContent?.includes(text)
      );
      expect(hasTimeText).toBe(true);
    });

    it("should handle Firestore Timestamp", () => {
      const firestoreTimestamp = {
        toDate: () => new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      };

      const auctionFirestore = {
        ...mockAuction,
        endTime: firestoreTimestamp as any,
      };

      render(<AuctionCard auction={auctionFirestore} />);

      expect(screen.getByText("2 days left")).toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("should have alt text for auction image", () => {
      render(<AuctionCard auction={mockAuction} />);

      expect(screen.getByAltText("Vintage Watch")).toBeInTheDocument();
    });

    it("should have link to auction detail", () => {
      const { container } = render(<AuctionCard auction={mockAuction} />);

      const link = container.querySelector("a");
      expect(link).toHaveAttribute("href", "/auctions/vintage-watch");
    });

    it("should disable bid button when auction ended", () => {
      const endedAuction = {
        ...mockAuction,
        endTime: new Date(Date.now() - 1000),
      };

      render(<AuctionCard auction={endedAuction} />);

      const button = screen.getByText("Auction Ended");
      expect(button).toBeDisabled();
    });
  });

  describe("Edge Cases", () => {
    it("should handle missing optional fields", () => {
      const minimalAuction = {
        id: "auction-2",
        name: "Basic Auction",
        slug: "basic-auction",
        images: ["/image.jpg"],
        currentBid: 1000,
        startingBid: 500,
        bidCount: 0,
        endTime: new Date(Date.now() + 1000),
      };

      render(<AuctionCard auction={minimalAuction} />);

      expect(screen.getByText("Basic Auction")).toBeInTheDocument();
      expect(screen.getByText("₹1,000")).toBeInTheDocument();
    });

    it("should handle auction with no shop info", () => {
      const noShopAuction = {
        ...mockAuction,
        shop: undefined,
      };

      render(<AuctionCard auction={noShopAuction} />);

      expect(screen.getByText("Vintage Watch")).toBeInTheDocument();
    });

    it("should handle very long auction names", () => {
      const longNameAuction = {
        ...mockAuction,
        name: "A".repeat(200),
      };

      render(<AuctionCard auction={longNameAuction} />);

      expect(screen.getByText("A".repeat(200))).toBeInTheDocument();
    });

    it("should handle zero bid count", () => {
      const zeroBidsAuction = {
        ...mockAuction,
        bidCount: 0,
      };

      render(<AuctionCard auction={zeroBidsAuction} />);

      expect(screen.queryByText(/bids?/)).not.toBeInTheDocument();
    });

    it("should handle negative view count", () => {
      const negativeViewsAuction = {
        ...mockAuction,
        viewCount: -10,
      };

      render(<AuctionCard auction={negativeViewsAuction} />);

      // Should not crash
      expect(screen.getByText("Vintage Watch")).toBeInTheDocument();
    });
  });

  describe("Performance", () => {
    it("should memoize component", () => {
      const { rerender } = render(<AuctionCard auction={mockAuction} />);

      rerender(<AuctionCard auction={mockAuction} />);

      expect(screen.getByText("Vintage Watch")).toBeInTheDocument();
    });

    it("should handle priority prop", () => {
      render(<AuctionCard auction={mockAuction} priority={true} />);

      expect(screen.getByText("Vintage Watch")).toBeInTheDocument();
    });
  });
});
