import React from "react";
import {
  render,
  screen,
  waitFor,
  fireEvent,
  act,
} from "@testing-library/react";
import EditAuctionPage from "@/app/seller/auctions/[id]/edit/page";
import type { AuctionFE } from "@/types/frontend/auction.types";
import { AuctionType, AuctionStatus } from "@/types/shared/common.types";

// Mock Firebase
jest.mock("@/app/api/lib/firebase/app", () => ({
  app: {},
  database: {},
  analytics: null,
}));

// Mock services
jest.mock("@/services/auctions.service");
jest.mock("@/lib/error-redirects", () => ({
  notFound: {
    auction: jest.fn((id, err) => `/auctions/${id}/not-found`),
  },
}));

// Mock contexts
jest.mock("@/contexts/AuthContext", () => ({
  useAuth: jest.fn(() => ({ user: { id: "test-user" } })),
}));

// Mock components
jest.mock("@/components/seller/AuctionForm", () => {
  const React = require("react");
  const MockAuctionForm = jest.fn();
  MockAuctionForm.mockImplementation(
    ({ mode, initialData, onSubmit, isSubmitting }) => {
      console.log("AuctionForm mock called with:", {
        mode,
        initialData,
        onSubmit,
        isSubmitting,
      });
      // Store the props for testing
      (global as any).auctionFormProps = {
        mode,
        initialData,
        onSubmit,
        isSubmitting,
      };
      return React.createElement(
        "div",
        { "data-testid": "auction-form" },
        "AuctionForm"
      );
    }
  );
  return {
    __esModule: true,
    default: MockAuctionForm,
  };
});

// Mock lucide-react icons
jest.mock("lucide-react", () => ({
  ArrowLeft: () => React.createElement("div", null, "ArrowLeft"),
  Loader2: () => React.createElement("div", null, "Loader2"),
}));

// Mock next/link
jest.mock("next/link", () => {
  const React = require("react");
  return ({ href, children, ...props }: any) => {
    return React.createElement("a", { href, ...props }, children);
  };
});

// Mock next/navigation
const mockPush = jest.fn();
const mockParams = { id: "test-auction-id" };

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  useParams: () => mockParams,
}));

import { auctionsService } from "@/services/auctions.service";

const mockAuctionsService = auctionsService as jest.Mocked<
  typeof auctionsService
>;

const createMockAuction = (overrides: Partial<AuctionFE> = {}): AuctionFE => ({
  id: "test-auction-id",
  productId: "test-product-id",
  productName: "Test Product",
  productSlug: "test-product",
  productImage: "/test-image.jpg",
  images: [],
  videos: [],
  productDescription: "Test description",

  // Seller
  sellerId: "test-seller-id",
  sellerName: "Test Seller",
  shopId: "test-shop-id",
  shopName: "Test Shop",

  // Auction details
  type: AuctionType.REGULAR,
  status: AuctionStatus.ACTIVE,
  startingPrice: 100,
  reservePrice: 200,
  currentPrice: 150,
  buyNowPrice: null,

  // Formatted prices
  formattedStartingPrice: "₹100",
  formattedReservePrice: "₹200",
  formattedCurrentPrice: "₹150",
  formattedBuyNowPrice: null,

  // Bidding
  bidIncrement: 10,
  minimumBid: 160,
  totalBids: 5,
  uniqueBidders: 3,
  highestBidderId: "bidder-1",
  highestBidderName: "Bidder One",

  formattedBidIncrement: "₹10",
  formattedMinimumBid: "₹160",

  // Auto-bidding
  hasAutoBid: false,
  autoBidMaxAmount: null,

  // Timing
  startTime: new Date(),
  endTime: new Date(Date.now() + 86400000),
  duration: 86400000,

  // Formatted timing
  startTimeDisplay: "Nov 13, 2025 2:30 PM",
  endTimeDisplay: "Nov 14, 2025 2:30 PM",
  timeRemaining: "1d",
  timeRemainingSeconds: 86400,
  durationDisplay: "1 day",

  // Extended bidding
  allowExtension: false,
  extensionTime: 0,
  timesExtended: 0,

  // Status
  isActive: true,
  isEnded: false,
  hasBids: true,
  hasWinner: false,
  winnerId: null,
  winnerName: null,
  winningBid: null,

  formattedWinningBid: null,

  // UI states
  isUpcoming: false,
  isLive: true,
  isEndingSoon: false,
  canBid: true,
  canBuyNow: false,
  isYourAuction: true,
  isYouWinning: false,
  isYouWinner: false,

  // Reserve
  reserveMet: false,
  reserveStatus: "Reserve not met",

  // Progress
  priceProgress: 50,
  bidProgress: 25,
  timeProgress: 10,

  // Badges
  badges: ["Live"],

  // Timestamps
  createdAt: new Date(),
  updatedAt: new Date(),

  // Metadata
  metadata: {},

  // Backwards compatibility aliases
  currentBid: 150,
  name: "Test Product",
  description: "Test description",
  featured: false,
  bidCount: 5,

  ...overrides,
});

describe("EditAuctionPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockPush.mockClear();
    // Clear the global variable
    delete (global as any).auctionFormProps;
  });

  it("renders loading state initially", () => {
    render(<EditAuctionPage />);

    expect(screen.getByText("Loader2")).toBeInTheDocument();
  });

  it("loads auction data on mount", async () => {
    const mockAuction = createMockAuction();

    mockAuctionsService.getById.mockResolvedValueOnce(mockAuction);

    await act(async () => {
      render(<EditAuctionPage />);
    });

    await waitFor(() => {
      expect(mockAuctionsService.getById).toHaveBeenCalledWith(
        "test-auction-id"
      );
    });
  });

  it("renders auction form when data is loaded", async () => {
    const mockAuction = createMockAuction();

    mockAuctionsService.getById.mockResolvedValueOnce(mockAuction);

    await act(async () => {
      render(<EditAuctionPage />);
    });

    await waitFor(() => {
      expect(screen.getByText("Edit Auction")).toBeInTheDocument();
    });

    expect(screen.getByText("Update your auction details")).toBeInTheDocument();
    expect(screen.getByTestId("auction-form")).toBeInTheDocument();
  });

  it("handles auction load error", async () => {
    const error = new Error("Auction not found");
    mockAuctionsService.getById.mockRejectedValueOnce(error);

    await act(async () => {
      render(<EditAuctionPage />);
    });

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith(
        "/auctions/test-auction-id/not-found"
      );
    });
  });

  it("shows auction not found when auction is null", async () => {
    mockAuctionsService.getById.mockResolvedValueOnce(null as any);

    await act(async () => {
      render(<EditAuctionPage />);
    });

    await waitFor(() => {
      expect(screen.getByText("Auction not found")).toBeInTheDocument();
    });

    expect(screen.getByText("Go back to auctions")).toBeInTheDocument();
  });

  it("handles form submission successfully", async () => {
    const mockAuction = createMockAuction();

    const formData = {
      name: "Updated Auction",
      slug: "updated-auction",
      description: "Updated description",
      startingBid: 150,
      reservePrice: 250,
      startTime: new Date(),
      endTime: new Date(Date.now() + 86400000 * 2),
      status: "active",
    };

    mockAuctionsService.getById.mockResolvedValueOnce(mockAuction);
    mockAuctionsService.update.mockResolvedValueOnce({} as any);

    await act(async () => {
      render(<EditAuctionPage />);
    });

    await waitFor(() => {
      expect(screen.getByTestId("auction-form")).toBeInTheDocument();
    });

    // Simulate form submission by calling the stored onSubmit function
    const { onSubmit } = (global as any).auctionFormProps;
    await onSubmit(formData);

    expect(mockAuctionsService.update).toHaveBeenCalledWith("test-auction-id", {
      name: "Updated Auction",
      slug: "updated-auction",
      description: "Updated description",
      startingBid: 150,
      reservePrice: 250,
      startTime: formData.startTime,
      endTime: formData.endTime,
      status: "active",
    });

    expect(mockPush).toHaveBeenCalledWith("/seller/auctions");
  });

  it("handles form submission error", async () => {
    const mockAuction = createMockAuction();

    const formData = {
      name: "Updated Auction",
      slug: "updated-auction",
      description: "Updated description",
      startingBid: 150,
      reservePrice: 250,
      startTime: new Date(),
      endTime: new Date(Date.now() + 86400000 * 2),
      status: "active",
    };

    const error = new Error("Update failed");
    mockAuctionsService.getById.mockResolvedValueOnce(mockAuction);
    mockAuctionsService.update.mockRejectedValueOnce(error);

    await act(async () => {
      render(<EditAuctionPage />);
    });

    await waitFor(() => {
      expect(screen.getByTestId("auction-form")).toBeInTheDocument();
    });

    // Simulate form submission
    const { onSubmit } = (global as any).auctionFormProps;
    await onSubmit(formData);

    await waitFor(() => {
      expect(screen.getByText("Update failed")).toBeInTheDocument();
    });
  });

  it("navigates back to auctions list", async () => {
    const mockAuction = createMockAuction();

    mockAuctionsService.getById.mockResolvedValueOnce(mockAuction);

    await act(async () => {
      render(<EditAuctionPage />);
    });

    await waitFor(() => {
      expect(screen.getByText("Edit Auction")).toBeInTheDocument();
    });

    const backLink = screen.getByText("Back to Auctions");
    expect(backLink.closest("a")).toHaveAttribute("href", "/seller/auctions");
  });
});
