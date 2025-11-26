import React from "react";
import {
  render,
  screen,
  waitFor,
  fireEvent,
  act,
} from "@testing-library/react";
import AuctionDetailPage from "@/app/auctions/[slug]/page";
import { auctionsService } from "@/services/auctions.service";
import { shopsService } from "@/services/shops.service";
import { AuctionStatus, AuctionType } from "@/types/shared/common.types";
import type { AuctionFE, BidFE } from "@/types/frontend/auction.types";
import type { ShopFE } from "@/types/frontend/shop.types";

// Mock Firebase
jest.mock("@/app/api/lib/firebase/app", () => ({
  app: {},
  database: {},
  analytics: null,
}));

// Mock next/navigation
const mockParams = jest.fn();
const mockRouterInstance = jest.fn();

jest.mock("next/navigation", () => ({
  useParams: () => mockParams(),
  useRouter: () => mockRouterInstance(),
}));

// Mock services
jest.mock("@/services/auctions.service");
jest.mock("@/services/shops.service");

// Mock contexts
jest.mock("@/contexts/AuthContext", () => ({
  useAuth: jest.fn(),
  AuthProvider: ({ children }: any) => <div>{children}</div>,
}));

// Mock components
jest.mock("@/components/common/ErrorMessage", () => ({
  ErrorMessage: ({ message, showRetry, onRetry, onGoBack }: any) => (
    <div data-testid="error-message">
      <p>{message}</p>
      {showRetry && <button onClick={onRetry}>Retry</button>}
      {onGoBack && <button onClick={onGoBack}>Go Back</button>}
    </div>
  ),
}));

jest.mock("@/components/common/skeletons/AuctionCardSkeleton", () => ({
  AuctionCardSkeletonGrid: ({ count }: any) => (
    <div data-testid="auction-skeleton-grid" data-count={count} />
  ),
}));

jest.mock("@/components/cards/CardGrid", () => ({
  CardGrid: ({ children }: any) => (
    <div data-testid="card-grid">{children}</div>
  ),
}));

// Mock date-fns
jest.mock("date-fns", () => ({
  formatDistanceToNow: jest.fn(() => "2 minutes ago"),
}));

// Mock window methods
Object.defineProperty(window, "scrollTo", {
  writable: true,
  value: jest.fn(),
});

// Mock window.location for share functionality
// const mockLocation = { href: 'http://localhost:3000/auctions/test-auction' };
// jest.spyOn(window, 'location', 'get').mockReturnValue(mockLocation as any);

Object.defineProperty(navigator, "share", {
  writable: true,
  value: jest.fn(),
});

Object.defineProperty(navigator, "clipboard", {
  writable: true,
  value: { writeText: jest.fn() },
});

const mockAuctionsService = auctionsService as jest.Mocked<
  typeof auctionsService
>;
const mockShopsService = shopsService as jest.Mocked<typeof shopsService>;
const mockUseAuth = require("@/contexts/AuthContext").useAuth as jest.Mock;
const mockUseParams = mockParams as jest.Mock;
const mockUseRouter = mockRouterInstance as jest.Mock;
const mockFormatDistanceToNow = require("date-fns")
  .formatDistanceToNow as jest.Mock;

const mockRouter = {
  push: jest.fn(),
  replace: jest.fn(),
  prefetch: jest.fn(),
  back: jest.fn(),
  forward: jest.fn(),
  refresh: jest.fn(),
};

mockUseRouter.mockReturnValue(mockRouter);

describe("AuctionDetailPage", () => {
  const mockAuction: AuctionFE = {
    id: "auction-1",
    productId: "product-1",
    productName: "Test Auction Item",
    productSlug: "test-auction-item",
    productImage: "/test-image.jpg",
    images: ["/test-image.jpg", "/test-image2.jpg"],
    videos: [],
    productDescription: "This is a test auction description",

    sellerId: "seller-1",
    sellerName: "Test Seller",
    shopId: "shop-1",
    shopName: "Test Shop",

    type: AuctionType.REGULAR,
    status: AuctionStatus.ACTIVE,
    startingPrice: 1000,
    reservePrice: 1500,
    currentPrice: 1200,
    buyNowPrice: 2000,

    formattedStartingPrice: "₹1,000",
    formattedReservePrice: "₹1,500",
    formattedCurrentPrice: "₹1,200",
    formattedBuyNowPrice: "₹2,000",

    bidIncrement: 100,
    minimumBid: 1100,
    totalBids: 5,
    uniqueBidders: 3,
    highestBidderId: "user-1",
    highestBidderName: "Test Bidder",

    formattedBidIncrement: "₹100",
    formattedMinimumBid: "₹1,100",

    hasAutoBid: false,
    autoBidMaxAmount: null,

    startTime: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
    endTime: new Date(Date.now() + 24 * 60 * 60 * 1000), // 1 day from now
    duration: 24 * 60 * 60 * 1000,

    startTimeDisplay: "Nov 20, 2025 10:00 AM",
    endTimeDisplay: "Nov 22, 2025 10:00 AM",
    timeRemaining: "23h 59m",
    timeRemainingSeconds: 24 * 60 * 60,
    durationDisplay: "1 day",

    allowExtension: true,
    extensionTime: 300000,
    timesExtended: 0,

    isActive: true,
    isEnded: false,
    hasBids: true,
    hasWinner: false,
    winnerId: null,
    winnerName: null,
    winningBid: null,

    formattedWinningBid: null,

    isUpcoming: false,
    isLive: true,
    isEndingSoon: false,
    canBid: true,
    canBuyNow: true,
    isYourAuction: false,
    isYouWinning: false,
    isYouWinner: false,

    reserveMet: false,
    reserveStatus: "Reserve not met",

    priceProgress: 20,
    bidProgress: 25,
    timeProgress: 50,

    badges: ["Live"],

    createdAt: new Date(),
    updatedAt: new Date(),

    metadata: {},

    // Backwards compatibility
    currentBid: 1200,
    name: "Test Auction Item",
    description: "This is a test auction description",
    featured: false,
    bidCount: 5,
  };

  const mockBids: BidFE[] = [
    {
      id: "bid-1",
      auctionId: "auction-1",
      userId: "user-1",
      userName: "Test Bidder 1",
      userEmail: "bidder1@test.com",
      amount: 1200,
      isAutoBid: false,
      maxAutoBidAmount: null,
      createdAt: new Date(Date.now() - 10 * 60 * 1000), // 10 minutes ago

      formattedAmount: "₹1,200",
      timeAgo: "10 minutes ago",

      isHighest: true,
      isYourBid: false,

      bidTime: new Date(Date.now() - 10 * 60 * 1000),
      bidAmount: 1200,
    },
    {
      id: "bid-2",
      auctionId: "auction-1",
      userId: "user-2",
      userName: "Test Bidder 2",
      userEmail: "bidder2@test.com",
      amount: 1100,
      isAutoBid: false,
      maxAutoBidAmount: null,
      createdAt: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago

      formattedAmount: "₹1,100",
      timeAgo: "30 minutes ago",

      isHighest: false,
      isYourBid: false,

      bidTime: new Date(Date.now() - 30 * 60 * 1000),
      bidAmount: 1100,
    },
  ];

  const mockShop: ShopFE = {
    id: "shop-1",
    name: "Test Shop",
    slug: "test-shop",
    description: "A test shop for auctions",
    logo: "/shop-logo.jpg",
    banner: "/shop-banner.jpg",
    ownerId: "seller-1",
    ownerName: "Test Seller",
    ownerEmail: "seller@test.com",
    email: "shop@test.com",
    phone: "+91-9876543210",
    address: "123 Test Street",
    city: "Test City",
    state: "Test State",
    postalCode: "123456",
    totalProducts: 50,
    totalAuctions: 10,
    totalOrders: 25,
    totalSales: 50000,
    rating: 4.5,
    reviewCount: 15,
    status: "active" as any,
    isVerified: true,
    settings: {
      acceptsOrders: true,
      minOrderAmount: 500,
      shippingCharge: 100,
      freeShippingAbove: 2000,
    },

    createdAt: new Date(),
    updatedAt: new Date(),

    formattedTotalSales: "₹50,000",
    formattedMinOrderAmount: "₹500",
    formattedShippingCharge: "₹100",
    ratingDisplay: "4.5 (15 reviews)",
    urlPath: "/shops/test-shop",
    isActive: true,
    hasProducts: true,
    badges: ["Verified"],

    productCount: 50,
  };

  const mockSimilarAuctions = [
    {
      id: "auction-2",
      productId: "product-2",
      productName: "Similar Item 1",
      productSlug: "similar-item-1",
      productImage: "/similar1.jpg",
      type: AuctionType.REGULAR,
      status: AuctionStatus.ACTIVE,
      currentPrice: 800,
      formattedCurrentPrice: "₹800",
      buyNowPrice: null,
      formattedBuyNowPrice: null,
      totalBids: 3,
      endTime: new Date(Date.now() + 48 * 60 * 60 * 1000),
      timeRemaining: "2d",
      timeRemainingSeconds: 48 * 60 * 60,
      isActive: true,
      isEndingSoon: false,
      badges: [],

      slug: "similar-item-1",
      name: "Similar Item 1",
      images: ["/similar1.jpg"],
      currentBid: 800,
      bidCount: 3,
    },
  ];

  const mockShopAuctions = [
    {
      id: "auction-3",
      productId: "product-3",
      productName: "Shop Item 1",
      productSlug: "shop-item-1",
      productImage: "/shop1.jpg",
      type: AuctionType.REGULAR,
      status: AuctionStatus.ACTIVE,
      currentPrice: 600,
      formattedCurrentPrice: "₹600",
      buyNowPrice: null,
      formattedBuyNowPrice: null,
      totalBids: 2,
      endTime: new Date(Date.now() + 72 * 60 * 60 * 1000),
      timeRemaining: "3d",
      timeRemainingSeconds: 72 * 60 * 60,
      isActive: true,
      isEndingSoon: false,
      badges: [],

      slug: "shop-item-1",
      name: "Shop Item 1",
      images: ["/shop1.jpg"],
      currentBid: 600,
      bidCount: 2,
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseParams.mockReturnValue({ slug: "test-auction" });
    mockUseAuth.mockReturnValue({
      user: { id: "user-1", email: "test@test.com" },
    });
    mockFormatDistanceToNow.mockReturnValue("2 minutes ago");

    // Default mocks
    mockAuctionsService.getBySlug.mockResolvedValue(mockAuction);
    mockAuctionsService.getBids.mockResolvedValue({
      data: mockBids,
      count: 2,
      pagination: {
        limit: 20,
        hasNextPage: false,
        nextCursor: null,
        count: 2,
      } as any,
    });
    mockShopsService.getBySlug.mockResolvedValue(mockShop);
    mockAuctionsService.list
      .mockResolvedValueOnce({
        data: mockShopAuctions,
        count: 1,
        pagination: {
          limit: 20,
          hasNextPage: false,
          nextCursor: null,
          count: 1,
        } as any,
      })
      .mockResolvedValueOnce({
        data: mockSimilarAuctions,
        count: 1,
        pagination: {
          limit: 20,
          hasNextPage: false,
          nextCursor: null,
          count: 1,
        } as any,
      });
  });

  describe("Initial Loading", () => {
    it("loads auction data on mount", async () => {
      render(<AuctionDetailPage />);

      await waitFor(() => {
        expect(mockAuctionsService.getBySlug).toHaveBeenCalledWith(
          "test-auction"
        );
      });

      expect(mockAuctionsService.getBids).toHaveBeenCalledWith(
        "auction-1",
        20,
        null,
        "desc"
      );
      expect(mockShopsService.getBySlug).toHaveBeenCalledWith("shop-1");
      expect(mockAuctionsService.list).toHaveBeenCalledTimes(2);
    });

    it("displays loading skeleton while loading", () => {
      mockAuctionsService.getBySlug.mockImplementation(
        () =>
          new Promise((resolve) => setTimeout(() => resolve(mockAuction), 100))
      );

      render(<AuctionDetailPage />);

      expect(screen.getByTestId("auction-skeleton-grid")).toBeInTheDocument();
    });

    it("displays auction details after loading", async () => {
      render(<AuctionDetailPage />);

      await waitFor(() => {
        expect(screen.getByText("Test Auction Item")).toBeInTheDocument();
      });

      expect(
        screen.getByText("This is a test auction description")
      ).toBeInTheDocument();
      expect(screen.getByText("₹1,200")).toBeInTheDocument();
      expect(screen.getByText("5 bids")).toBeInTheDocument();
    });
  });

  describe("Image Gallery", () => {
    it("displays main image", async () => {
      render(<AuctionDetailPage />);

      await waitFor(() => {
        expect(screen.getByAltText("Test Auction Item")).toBeInTheDocument();
      });

      const mainImage = screen.getByAltText("Test Auction Item");
      expect(mainImage).toHaveAttribute("src", "/test-image.jpg");
    });

    it("shows thumbnail navigation for multiple images", async () => {
      render(<AuctionDetailPage />);

      await waitFor(() => {
        expect(screen.getAllByAltText(/^Test Auction Item \d+$/)).toHaveLength(
          2
        );
      });
    });

    it("changes main image when thumbnail is clicked", async () => {
      render(<AuctionDetailPage />);

      await waitFor(() => {
        const thumbnails = screen.getAllByAltText(/^Test Auction Item \d+$/);
        expect(thumbnails).toHaveLength(2);
      });

      const secondThumbnail = screen.getByAltText("Test Auction Item 2");
      fireEvent.click(secondThumbnail);

      // The main image should now show the second image
      const mainImage = screen.getByAltText("Test Auction Item");
      expect(mainImage).toHaveAttribute("src", "/test-image2.jpg");
    });
  });

  describe("Bidding Functionality", () => {
    it("displays current bid and bid form for active auctions", async () => {
      render(<AuctionDetailPage />);

      await waitFor(() => {
        expect(screen.getByText("Current Bid")).toBeInTheDocument();
      });

      expect(screen.getByText("₹1,200")).toBeInTheDocument();
      expect(screen.getByText("5 bids")).toBeInTheDocument();
      expect(
        screen.getByPlaceholderText(/Your Bid Amount/)
      ).toBeInTheDocument();
      expect(screen.getByText("Place Bid")).toBeInTheDocument();
    });

    it("calculates and sets default bid amount", async () => {
      render(<AuctionDetailPage />);

      await waitFor(() => {
        const bidInput = screen.getByPlaceholderText(/Your Bid Amount/);
        expect(bidInput).toHaveValue("1300"); // 1200 + 100 increment
      });
    });

    it("places bid successfully", async () => {
      mockAuctionsService.placeBid.mockResolvedValue({
        id: "new-bid",
        auctionId: "auction-1",
        userId: "user-1",
        userName: "Test User",
        userEmail: "test@test.com",
        amount: 1300,
        isAutoBid: false,
        maxAutoBidAmount: null,
        createdAt: new Date(),
        formattedAmount: "₹1,300",
        timeAgo: "just now",
        isHighest: true,
        isYourBid: true,
      });

      render(<AuctionDetailPage />);

      await waitFor(() => {
        expect(screen.getByText("Place Bid")).toBeInTheDocument();
      });

      const bidInput = screen.getByPlaceholderText(/Your Bid Amount/);
      const bidButton = screen.getByText("Place Bid");

      fireEvent.change(bidInput, { target: { value: "1300" } });
      fireEvent.click(bidButton);

      await waitFor(() => {
        expect(mockAuctionsService.placeBid).toHaveBeenCalledWith("auction-1", {
          amount: 1300,
          isAutoBid: false,
        });
      });

      // Should reload auction data
      expect(mockAuctionsService.getBySlug).toHaveBeenCalledTimes(2);
    });

    it("shows bid error for invalid amount", async () => {
      render(<AuctionDetailPage />);

      await waitFor(() => {
        expect(screen.getByText("Place Bid")).toBeInTheDocument();
      });

      const bidInput = screen.getByPlaceholderText(/Your Bid Amount/);
      const bidButton = screen.getByText("Place Bid");

      fireEvent.change(bidInput, { target: { value: "1000" } }); // Below current bid
      fireEvent.click(bidButton);

      expect(
        screen.getByText("Bid must be higher than current bid")
      ).toBeInTheDocument();
    });

    it("redirects to login when placing bid without authentication", async () => {
      mockUseAuth.mockReturnValue({ user: null });

      render(<AuctionDetailPage />);

      await waitFor(() => {
        expect(screen.getByText("Place Bid")).toBeInTheDocument();
      });

      const bidButton = screen.getByText("Place Bid");
      fireEvent.click(bidButton);

      expect(mockRouter.push).toHaveBeenCalledWith(
        "/login?redirect=/auctions/test-auction"
      );
    });
  });

  describe("Watch Functionality", () => {
    it("toggles watch status", async () => {
      mockAuctionsService.toggleWatch.mockResolvedValue({ watching: true });

      render(<AuctionDetailPage />);

      await waitFor(() => {
        expect(screen.getByText("Watch")).toBeInTheDocument();
      });

      const watchButton = screen.getByText("Watch");
      fireEvent.click(watchButton);

      await waitFor(() => {
        expect(mockAuctionsService.toggleWatch).toHaveBeenCalledWith(
          "auction-1"
        );
      });

      // Button should now show "Watching"
      expect(screen.getByText("Watching")).toBeInTheDocument();
    });

    it("redirects to login when watching without authentication", async () => {
      mockUseAuth.mockReturnValue({ user: null });

      render(<AuctionDetailPage />);

      await waitFor(() => {
        expect(screen.getByText("Watch")).toBeInTheDocument();
      });

      const watchButton = screen.getByText("Watch");
      fireEvent.click(watchButton);

      expect(mockRouter.push).toHaveBeenCalledWith(
        "/login?redirect=/auctions/test-auction"
      );
    });
  });

  describe("Share Functionality", () => {
    it("uses native share API when available", async () => {
      const mockShare = jest.fn();
      Object.defineProperty(navigator, "share", {
        writable: true,
        value: mockShare,
      });

      render(<AuctionDetailPage />);

      await waitFor(() => {
        expect(screen.getByText("Share")).toBeInTheDocument();
      });

      const shareButton = screen.getByText("Share");
      fireEvent.click(shareButton);

      expect(mockShare).toHaveBeenCalledWith({
        title: "Test Auction Item",
        text: "Check out this auction: Test Auction Item",
        url: "http://localhost:3000/auctions/test-auction",
      });
    });

    it("falls back to clipboard when share API not available", async () => {
      Object.defineProperty(navigator, "share", {
        writable: true,
        value: undefined,
      });

      const mockWriteText = jest.fn();
      Object.defineProperty(navigator, "clipboard", {
        writable: true,
        value: { writeText: mockWriteText },
      });

      render(<AuctionDetailPage />);

      await waitFor(() => {
        expect(screen.getByText("Share")).toBeInTheDocument();
      });

      const shareButton = screen.getByText("Share");
      fireEvent.click(shareButton);

      expect(mockWriteText).toHaveBeenCalledWith(
        "http://localhost:3000/auctions/test-auction"
      );
    });
  });

  describe("Bid History", () => {
    it("displays bid history with correct information", async () => {
      render(<AuctionDetailPage />);

      await waitFor(() => {
        expect(screen.getByText("Bid History (5)")).toBeInTheDocument();
      });

      expect(screen.getAllByText("User #")).toHaveLength(2);
      expect(screen.getByText("₹1,200")).toBeInTheDocument();
      expect(screen.getByText("₹1,100")).toBeInTheDocument();
      expect(screen.getByText("Winning bid")).toBeInTheDocument();
    });

    it("shows 'No bids yet' when no bids exist", async () => {
      mockAuctionsService.getBids.mockResolvedValue({
        data: [],
        count: 0,
        pagination: {
          limit: 20,
          hasNextPage: false,
          nextCursor: null,
          count: 0,
        } as any,
      });

      render(<AuctionDetailPage />);

      await waitFor(() => {
        expect(screen.getByText("No bids yet")).toBeInTheDocument();
      });
    });
  });

  describe("Shop Information", () => {
    it("displays shop information sidebar", async () => {
      render(<AuctionDetailPage />);

      await waitFor(() => {
        expect(screen.getByText("Seller Information")).toBeInTheDocument();
      });

      expect(screen.getByText("Test Shop")).toBeInTheDocument();
      expect(screen.getByText("✓ Verified Seller")).toBeInTheDocument();
      expect(screen.getByText("4.5 (15)")).toBeInTheDocument();
      expect(screen.getByText("Visit Shop")).toBeInTheDocument();
    });

    it("displays shop auctions section", async () => {
      render(<AuctionDetailPage />);

      await waitFor(() => {
        expect(screen.getByText("More from this shop")).toBeInTheDocument();
      });

      expect(screen.getByText("Shop Item 1")).toBeInTheDocument();
      expect(screen.getByText("₹600")).toBeInTheDocument();
    });
  });

  describe("Similar Auctions", () => {
    it("displays similar auctions section", async () => {
      render(<AuctionDetailPage />);

      await waitFor(() => {
        expect(screen.getByText("Similar Auctions")).toBeInTheDocument();
      });

      expect(screen.getByText("Similar Item 1")).toBeInTheDocument();
      expect(screen.getByText("₹800")).toBeInTheDocument();
    });
  });

  describe("Time Remaining", () => {
    it("displays time remaining for active auctions", async () => {
      render(<AuctionDetailPage />);

      await waitFor(() => {
        expect(screen.getByText("Time Remaining")).toBeInTheDocument();
      });

      expect(screen.getByText("23h 59m")).toBeInTheDocument();
    });

    it("shows 'Auction ended' for ended auctions", async () => {
      const endedAuction = { ...mockAuction, status: AuctionStatus.ENDED };
      mockAuctionsService.getBySlug.mockResolvedValue(endedAuction);

      render(<AuctionDetailPage />);

      await waitFor(() => {
        expect(screen.getByText("Auction ended")).toBeInTheDocument();
      });
    });
  });

  describe("Error Handling", () => {
    it("displays error message when auction fails to load", async () => {
      mockAuctionsService.getBySlug.mockRejectedValue(
        new Error("Failed to load auction")
      );

      render(<AuctionDetailPage />);

      await waitFor(() => {
        expect(screen.getByTestId("error-message")).toBeInTheDocument();
      });

      expect(
        screen.getByText("Failed to load auction. Please try again.")
      ).toBeInTheDocument();
      expect(screen.getByText("Retry")).toBeInTheDocument();
      expect(screen.getByText("Go Back")).toBeInTheDocument();
    });

    it("handles auction not found", async () => {
      mockAuctionsService.getBySlug.mockRejectedValue(
        new Error("Auction not found")
      );

      render(<AuctionDetailPage />);

      await waitFor(() => {
        expect(
          screen.getByText(
            "Auction not found. It may have ended or been removed."
          )
        ).toBeInTheDocument();
      });
    });

    it("handles ended auctions appropriately", async () => {
      const endedAuction = {
        ...mockAuction,
        status: AuctionStatus.ENDED,
        endTime: new Date(Date.now() - 24 * 60 * 60 * 1000), // Ended 1 day ago
      };
      mockAuctionsService.getBySlug.mockResolvedValue(endedAuction);

      render(<AuctionDetailPage />);

      await waitFor(() => {
        expect(
          screen.getByText(
            "This auction has ended. Check out other active auctions."
          )
        ).toBeInTheDocument();
      });
    });
  });

  describe("Navigation", () => {
    it("displays breadcrumb navigation", async () => {
      render(<AuctionDetailPage />);

      await waitFor(() => {
        expect(screen.getByText("Home")).toBeInTheDocument();
      });

      expect(screen.getByText("Auctions")).toBeInTheDocument();
      expect(screen.getByText("Test Auction Item")).toBeInTheDocument();
    });

    it("navigates to auctions list when clicking breadcrumb", async () => {
      render(<AuctionDetailPage />);

      await waitFor(() => {
        const auctionsLink = screen.getByText("Auctions");
        fireEvent.click(auctionsLink);
      });

      expect(mockRouter.push).toHaveBeenCalledWith("/auctions");
    });
  });

  describe("Reserve Price", () => {
    it("shows reserve status when reserve price exists", async () => {
      render(<AuctionDetailPage />);

      await waitFor(() => {
        expect(screen.getByText("Reserve Price:")).toBeInTheDocument();
      });

      expect(screen.getByText("Not Met")).toBeInTheDocument();
    });

    it("shows 'Met' when current bid exceeds reserve", async () => {
      const metReserveAuction = { ...mockAuction, currentPrice: 1600 };
      mockAuctionsService.getBySlug.mockResolvedValue(metReserveAuction);

      render(<AuctionDetailPage />);

      await waitFor(() => {
        expect(screen.getByText("Met")).toBeInTheDocument();
      });
    });
  });

  describe("Auction Status", () => {
    it("shows live badge for active auctions", async () => {
      render(<AuctionDetailPage />);

      await waitFor(() => {
        expect(screen.getAllByText("Live Auction")).toHaveLength(2); // Header and badge
      });
    });

    it("shows ended badge for completed auctions", async () => {
      const endedAuction = { ...mockAuction, status: AuctionStatus.ENDED };
      mockAuctionsService.getBySlug.mockResolvedValue(endedAuction);

      render(<AuctionDetailPage />);

      await waitFor(() => {
        expect(screen.getByText("Auction Ended")).toBeInTheDocument();
      });
    });

    it("shows upcoming badge for scheduled auctions", async () => {
      const scheduledAuction = {
        ...mockAuction,
        status: AuctionStatus.SCHEDULED,
      };
      mockAuctionsService.getBySlug.mockResolvedValue(scheduledAuction);

      render(<AuctionDetailPage />);

      await waitFor(() => {
        expect(screen.getByText("Upcoming")).toBeInTheDocument();
      });
    });
  });

  describe("Edge Cases - Session 28", () => {
    describe("Bid Increment Validation", () => {
      it("enforces minimum bid increment when placing bid", async () => {
        render(<AuctionDetailPage />);

        await waitFor(() => {
          expect(screen.getByText("₹1,200")).toBeInTheDocument();
        });

        const bidInput = screen.getByPlaceholderText("Enter bid amount");
        const placeBidButton = screen.getByText("Place Bid");

        // Try to bid below minimum increment (current: 1200, increment: 100, min: 1300)
        fireEvent.change(bidInput, { target: { value: "1250" } });
        fireEvent.click(placeBidButton);

        await waitFor(() => {
          expect(screen.getByText(/minimum bid/i)).toBeInTheDocument();
        });
      });

      it("accepts bid exactly at minimum bid amount", async () => {
        mockAuctionsService.placeBid.mockResolvedValue({
          ...mockBids[0],
          amount: 1300,
          formattedAmount: "₹1,300",
        } as any);

        render(<AuctionDetailPage />);

        await waitFor(() => {
          expect(screen.getByText("₹1,200")).toBeInTheDocument();
        });

        const bidInput = screen.getByPlaceholderText("Enter bid amount");
        const placeBidButton = screen.getByText("Place Bid");

        fireEvent.change(bidInput, { target: { value: "1300" } });
        fireEvent.click(placeBidButton);

        await waitFor(() => {
          expect(mockAuctionsService.placeBid).toHaveBeenCalledWith(
            "auction-1",
            expect.objectContaining({ amount: 1300 })
          );
        });
      });

      it("calculates correct minimum bid for large increment values", async () => {
        const largeIncrementAuction = {
          ...mockAuction,
          bidIncrement: 5000,
          currentPrice: 50000,
          minimumBid: 55000,
        };
        mockAuctionsService.getBySlug.mockResolvedValue(largeIncrementAuction);

        render(<AuctionDetailPage />);

        await waitFor(() => {
          expect(screen.getByText("₹50,000")).toBeInTheDocument();
        });

        // Should suggest 55000 (50000 + 5000)
        const bidInput = screen.getByPlaceholderText(
          "Enter bid amount"
        ) as HTMLInputElement;
        expect(bidInput.value).toMatch(/55000|₹55,000/);
      });
    });

    describe("Auto-Bid Functionality", () => {
      it("displays auto-bid toggle and max amount input", async () => {
        render(<AuctionDetailPage />);

        await waitFor(() => {
          expect(screen.getByText("₹1,200")).toBeInTheDocument();
        });

        expect(screen.getByText(/auto-bid/i)).toBeInTheDocument();
      });

      it("places auto-bid with max amount", async () => {
        mockAuctionsService.placeBid.mockResolvedValue({
          ...mockBids[0],
          amount: 1300,
          isAutoBid: true,
          maxAutoBidAmount: 2000,
          formattedAmount: "₹1,300",
        } as any);

        render(<AuctionDetailPage />);

        await waitFor(() => {
          expect(screen.getByText("₹1,200")).toBeInTheDocument();
        });

        // Enable auto-bid
        const autoBidCheckbox = screen.getByRole("checkbox", {
          name: /auto-bid/i,
        });
        fireEvent.click(autoBidCheckbox);

        // Set max amount
        const maxBidInput = screen.getByPlaceholderText(
          /max.*bid|maximum amount/i
        );
        fireEvent.change(maxBidInput, { target: { value: "2000" } });

        // Place bid
        const bidInput = screen.getByPlaceholderText("Enter bid amount");
        fireEvent.change(bidInput, { target: { value: "1300" } });
        const placeBidButton = screen.getByText("Place Bid");
        fireEvent.click(placeBidButton);

        await waitFor(() => {
          expect(mockAuctionsService.placeBid).toHaveBeenCalledWith(
            "auction-1",
            expect.objectContaining({
              amount: 1300,
              isAutoBid: true,
              maxAutoBidAmount: 2000,
            })
          );
        });
      });

      it("validates max auto-bid amount is greater than current bid", async () => {
        render(<AuctionDetailPage />);

        await waitFor(() => {
          expect(screen.getByText("₹1,200")).toBeInTheDocument();
        });

        const autoBidCheckbox = screen.getByRole("checkbox", {
          name: /auto-bid/i,
        });
        fireEvent.click(autoBidCheckbox);

        const maxBidInput = screen.getByPlaceholderText(
          /max.*bid|maximum amount/i
        );
        fireEvent.change(maxBidInput, { target: { value: "1000" } }); // Less than current 1200

        const placeBidButton = screen.getByText("Place Bid");
        fireEvent.click(placeBidButton);

        await waitFor(() => {
          expect(
            screen.getByText(/max.*bid.*must.*greater/i)
          ).toBeInTheDocument();
        });
      });
    });

    describe("Auction Expiry Handling", () => {
      it("handles auction ending while user is viewing", async () => {
        jest.useFakeTimers();
        const soonToEndAuction = {
          ...mockAuction,
          endTime: new Date(Date.now() + 5000), // Ends in 5 seconds
          timeRemainingSeconds: 5,
        };
        mockAuctionsService.getBySlug.mockResolvedValue(soonToEndAuction);

        render(<AuctionDetailPage />);

        await waitFor(() => {
          expect(screen.getByText(/seconds? left|second/i)).toBeInTheDocument();
        });

        // Fast-forward time to after auction ends
        jest.advanceTimersByTime(6000);

        await waitFor(() => {
          expect(screen.getByText(/auction.*ended|ended/i)).toBeInTheDocument();
        });

        jest.useRealTimers();
      });

      it("prevents bidding on auctions that just ended", async () => {
        const justEndedAuction = {
          ...mockAuction,
          status: AuctionStatus.ENDED,
          endTime: new Date(Date.now() - 1000), // Ended 1 second ago
          canBid: false,
        };
        mockAuctionsService.getBySlug.mockResolvedValue(justEndedAuction);

        render(<AuctionDetailPage />);

        await waitFor(() => {
          expect(screen.getByText(/auction.*ended/i)).toBeInTheDocument();
        });

        // Bid button should be disabled
        const bidButton = screen.queryByText("Place Bid");
        expect(bidButton).toBeNull();
      });

      it("shows auction extension notification when extended", async () => {
        const extendedAuction = {
          ...mockAuction,
          timesExtended: 1,
          extensionTime: 300000, // 5 minutes
        };
        mockAuctionsService.getBySlug.mockResolvedValue(extendedAuction);

        render(<AuctionDetailPage />);

        await waitFor(() => {
          expect(screen.getByText(/extended|extension/i)).toBeInTheDocument();
        });
      });
    });

    describe("Concurrent Bidding Scenarios", () => {
      it("shows error when bid is outbid before submission", async () => {
        mockAuctionsService.placeBid.mockRejectedValue(
          new Error("Your bid has been outbid. Please enter a higher amount.")
        );

        render(<AuctionDetailPage />);

        await waitFor(() => {
          expect(screen.getByText("₹1,200")).toBeInTheDocument();
        });

        const bidInput = screen.getByPlaceholderText("Enter bid amount");
        const placeBidButton = screen.getByText("Place Bid");

        fireEvent.change(bidInput, { target: { value: "1300" } });
        fireEvent.click(placeBidButton);

        await waitFor(() => {
          expect(screen.getByText(/outbid/i)).toBeInTheDocument();
        });
      });

      it("refreshes bid data after failed bid attempt", async () => {
        mockAuctionsService.placeBid.mockRejectedValueOnce(
          new Error("Bid amount is too low")
        );

        const updatedBids = [
          {
            ...mockBids[0],
            amount: 1500,
            formattedAmount: "₹1,500",
          },
          ...mockBids.slice(1),
        ];

        mockAuctionsService.getBids.mockResolvedValueOnce({
          data: updatedBids,
          count: 2,
          pagination: {
            limit: 20,
            hasNextPage: false,
            nextCursor: null,
            count: 2,
          } as any,
        });

        render(<AuctionDetailPage />);

        await waitFor(() => {
          expect(screen.getByText("₹1,200")).toBeInTheDocument();
        });

        const bidInput = screen.getByPlaceholderText("Enter bid amount");
        const placeBidButton = screen.getByText("Place Bid");

        fireEvent.change(bidInput, { target: { value: "1300" } });
        fireEvent.click(placeBidButton);

        await waitFor(() => {
          expect(screen.getByText(/bid.*too low/i)).toBeInTheDocument();
        });

        // Should show updated highest bid
        await waitFor(() => {
          expect(screen.getByText("₹1,500")).toBeInTheDocument();
        });
      });
    });

    describe("Buy Now Functionality", () => {
      it("displays buy now button when available", async () => {
        render(<AuctionDetailPage />);

        await waitFor(() => {
          expect(screen.getByText(/buy now.*₹2,000/i)).toBeInTheDocument();
        });
      });

      it("hides buy now button when not available", async () => {
        const noBuyNowAuction = {
          ...mockAuction,
          buyNowPrice: null,
          formattedBuyNowPrice: null,
          canBuyNow: false,
        };
        mockAuctionsService.getBySlug.mockResolvedValue(noBuyNowAuction);

        render(<AuctionDetailPage />);

        await waitFor(() => {
          expect(screen.getByText("₹1,200")).toBeInTheDocument();
        });

        expect(screen.queryByText(/buy now/i)).toBeNull();
      });

      it("confirms buy now action before proceeding", async () => {
        global.confirm = jest.fn(() => true);

        render(<AuctionDetailPage />);

        await waitFor(() => {
          expect(screen.getByText(/buy now/i)).toBeInTheDocument();
        });

        const buyNowButton = screen.getByText(/buy now/i);
        fireEvent.click(buyNowButton);

        expect(global.confirm).toHaveBeenCalledWith(
          expect.stringMatching(/confirm.*buy now.*₹2,000/i)
        );
      });
    });

    describe("Authentication & Ownership", () => {
      it("prevents seller from bidding on their own auction", async () => {
        mockUseAuth.mockReturnValue({
          user: { id: "seller-1", email: "seller@test.com" },
        });

        const sellerAuction = {
          ...mockAuction,
          isYourAuction: true,
          canBid: false,
        };
        mockAuctionsService.getBySlug.mockResolvedValue(sellerAuction);

        render(<AuctionDetailPage />);

        await waitFor(() => {
          expect(
            screen.getByText(/cannot bid.*own auction/i)
          ).toBeInTheDocument();
        });

        expect(screen.queryByText("Place Bid")).toBeNull();
      });

      it("shows special UI when user is winning", async () => {
        const winningAuction = {
          ...mockAuction,
          isYouWinning: true,
          highestBidderId: "user-1",
        };
        mockAuctionsService.getBySlug.mockResolvedValue(winningAuction);

        render(<AuctionDetailPage />);

        await waitFor(() => {
          expect(
            screen.getByText(/you.*winning|highest bidder/i)
          ).toBeInTheDocument();
        });
      });

      it("shows winner UI when user has won", async () => {
        mockUseAuth.mockReturnValue({
          user: { id: "user-1", email: "test@test.com" },
        });

        const wonAuction = {
          ...mockAuction,
          status: AuctionStatus.ENDED,
          isYouWinner: true,
          winnerId: "user-1",
        };
        mockAuctionsService.getBySlug.mockResolvedValue(wonAuction);

        render(<AuctionDetailPage />);

        await waitFor(() => {
          expect(screen.getByText(/congratulations.*won/i)).toBeInTheDocument();
        });
      });
    });

    describe("Real-time Updates Simulation", () => {
      it("handles rapid bid updates", async () => {
        let bidCount = 5;
        mockAuctionsService.getBids.mockImplementation(() => {
          bidCount++;
          return Promise.resolve({
            data: [
              {
                ...mockBids[0],
                id: `bid-${bidCount}`,
                amount: 1200 + bidCount * 100,
                formattedAmount: `₹${(1200 + bidCount * 100).toLocaleString()}`,
              },
              ...mockBids,
            ],
            count: bidCount,
            pagination: {
              limit: 20,
              hasNextPage: false,
              nextCursor: null,
              count: bidCount,
            } as any,
          });
        });

        render(<AuctionDetailPage />);

        await waitFor(() => {
          expect(screen.getByText("₹1,200")).toBeInTheDocument();
        });

        // Simulate multiple rapid updates
        for (let i = 0; i < 3; i++) {
          await act(async () => {
            // Trigger refresh (if component has refresh mechanism)
            await Promise.resolve();
          });
        }

        // Should handle updates gracefully without crashing
        expect(screen.getByText(/Test Auction Item/i)).toBeInTheDocument();
      });
    });

    describe("Loading States & Performance", () => {
      it("shows skeleton for similar auctions while loading", async () => {
        mockAuctionsService.list.mockImplementation(
          () =>
            new Promise((resolve) =>
              setTimeout(
                () =>
                  resolve({
                    data: mockSimilarAuctions,
                    count: 1,
                    pagination: {
                      limit: 6,
                      hasNextPage: false,
                      nextCursor: null,
                      count: 1,
                    } as any,
                  }),
                100
              )
            )
        );

        render(<AuctionDetailPage />);

        await waitFor(() => {
          expect(
            screen.getByTestId("auction-skeleton-grid")
          ).toBeInTheDocument();
        });
      });

      it("handles missing optional auction data gracefully", async () => {
        const minimalAuction = {
          ...mockAuction,
          videos: [],
          reservePrice: null,
          buyNowPrice: null,
          shopId: null,
          shopName: null,
        };
        mockAuctionsService.getBySlug.mockResolvedValue(minimalAuction);

        render(<AuctionDetailPage />);

        await waitFor(() => {
          expect(screen.getByText("Test Auction Item")).toBeInTheDocument();
        });

        // Should not show shop section
        expect(screen.queryByText("Test Shop")).toBeNull();
      });
    });
  });
});
