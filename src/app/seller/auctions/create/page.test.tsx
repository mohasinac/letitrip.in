import React from "react";
import {
  render,
  screen,
  waitFor,
  fireEvent,
  act,
} from "@testing-library/react";
import CreateAuctionWizardPage from "@/app/seller/auctions/create/page";
import { Status } from "@/types/shared/common.types";
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
jest.mock("@/services/categories.service");
jest.mock("@/services/media.service");

// Mock contexts
jest.mock("@/contexts/AuthContext", () => ({
  useAuth: jest.fn(() => ({ user: { id: "test-user" } })),
}));

// Mock components
jest.mock("@/components/common/SlugInput", () => {
  const React = require("react");
  const MockSlugInput = ({ value, onChange, error }: any) => {
    return React.createElement("input", {
      "data-testid": "slug-input",
      value,
      onChange: (e: any) => onChange(e.target.value),
      className: error ? "border-red-500" : "",
    });
  };
  return {
    __esModule: true,
    default: MockSlugInput,
  };
});

jest.mock("@/components/common/DateTimePicker", () => {
  const React = require("react");
  const MockDateTimePicker = ({ value, onChange }: any) => {
    return React.createElement("input", {
      "data-testid": "datetime-picker",
      type: "datetime-local",
      value: value.toISOString().slice(0, 16),
      onChange: (e: any) => onChange(new Date(e.target.value)),
    });
  };
  return {
    __esModule: true,
    default: MockDateTimePicker,
  };
});

// Mock lucide-react icons
jest.mock("lucide-react", () => ({
  ArrowLeft: () => React.createElement("div", null, "ArrowLeft"),
  ArrowRight: () => React.createElement("div", null, "ArrowRight"),
  Check: () => React.createElement("div", null, "Check"),
  Info: () => React.createElement("div", null, "Info"),
  Gavel: () => React.createElement("div", null, "Gavel"),
  DollarSign: () => React.createElement("div", null, "DollarSign"),
  Clock: () => React.createElement("div", null, "Clock"),
  Image: () => React.createElement("div", null, "Image"),
  FileText: () => React.createElement("div", null, "FileText"),
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

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

import { auctionsService } from "@/services/auctions.service";
import { categoriesService } from "@/services/categories.service";
import { mediaService } from "@/services/media.service";

const mockAuctionsService = auctionsService as jest.Mocked<
  typeof auctionsService
>;
const mockCategoriesService = categoriesService as jest.Mocked<
  typeof categoriesService
>;
const mockMediaService = mediaService as jest.Mocked<typeof mediaService>;

const mockCategories = [
  {
    id: "cat1",
    name: "Electronics",
    slug: "electronics",
    description: "Electronic devices and gadgets",
    image: null,
    banner: null,
    icon: null,
    parentIds: [],
    level: 1,
    order: 1,
    status: Status.PUBLISHED,
    productCount: 100,
    isLeaf: false,
    metadata: {},
    createdAt: new Date(),
    updatedAt: new Date(),
    hasProducts: true,
    hasParents: false,
    isRoot: true,
    displayName: "Electronics",
    urlPath: "/categories/electronics",
  },
  {
    id: "cat2",
    name: "Collectibles",
    slug: "collectibles",
    description: "Rare and valuable collectibles",
    image: null,
    banner: null,
    icon: null,
    parentIds: [],
    level: 1,
    order: 2,
    status: Status.PUBLISHED,
    productCount: 50,
    isLeaf: false,
    metadata: {},
    createdAt: new Date(),
    updatedAt: new Date(),
    hasProducts: true,
    hasParents: false,
    isRoot: true,
    displayName: "Collectibles",
    urlPath: "/categories/collectibles",
  },
];

const createMockAuction = (overrides: Partial<AuctionFE> = {}): AuctionFE => ({
  id: "auction-123",
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
  status: AuctionStatus.SCHEDULED,
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
  isActive: false,
  isEnded: false,
  hasBids: false,
  hasWinner: false,
  winnerId: null,
  winnerName: null,
  winningBid: null,

  formattedWinningBid: null,

  // UI states
  isUpcoming: true,
  isLive: false,
  isEndingSoon: false,
  canBid: false,
  canBuyNow: false,
  isYourAuction: true,
  isYouWinning: false,
  isYouWinner: false,

  // Reserve
  reserveMet: false,
  reserveStatus: "Reserve not met",

  // Progress
  priceProgress: 0,
  bidProgress: 0,
  timeProgress: 0,

  // Badges
  badges: ["Scheduled"],

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

describe("CreateAuctionWizardPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockPush.mockClear();

    // Default mocks
    mockCategoriesService.list.mockResolvedValue({
      data: mockCategories,
      count: 2,
      pagination: {
        page: 1,
        limit: 10,
        hasNextPage: false,
        hasPrevPage: false,
      },
    });
  });

  it("renders initial step with basic info form", async () => {
    await act(async () => {
      render(<CreateAuctionWizardPage />);
    });

    expect(screen.getByText("Create New Auction")).toBeInTheDocument();
    expect(screen.getByText("Step 1 of 5: Basic Info")).toBeInTheDocument();
    expect(screen.getByText("Basic Information")).toBeInTheDocument();
    expect(screen.getByText("Auction Title")).toBeInTheDocument();
    expect(screen.getByTestId("slug-input")).toBeInTheDocument();
    expect(screen.getByText("Category")).toBeInTheDocument();
  });

  it("loads categories on mount", async () => {
    await act(async () => {
      render(<CreateAuctionWizardPage />);
    });

    await waitFor(() => {
      expect(mockCategoriesService.list).toHaveBeenCalledWith({});
    });

    expect(screen.getByText("Electronics")).toBeInTheDocument();
    expect(screen.getByText("Collectibles")).toBeInTheDocument();
  });

  it("validates step 1 fields", async () => {
    await act(async () => {
      render(<CreateAuctionWizardPage />);
    });

    // Try to go to next step without filling required fields
    const nextButton = screen.getByText("Next");
    fireEvent.click(nextButton);

    expect(screen.getByText("Title is required")).toBeInTheDocument();

    // Fill title but not slug or category
    const titleInput = screen.getByPlaceholderText(
      "e.g., Vintage Rolex Watch - Limited Edition"
    );
    fireEvent.change(titleInput, { target: { value: "Test Auction" } });

    fireEvent.click(nextButton);
    expect(screen.getByText("URL slug is required")).toBeInTheDocument();

    // Fill slug but not category
    const slugInput = screen.getByTestId("slug-input");
    fireEvent.change(slugInput, { target: { value: "test-auction" } });

    fireEvent.click(nextButton);
    expect(screen.getByText("Category is required")).toBeInTheDocument();
  });

  it("navigates between steps", async () => {
    await act(async () => {
      render(<CreateAuctionWizardPage />);
    });

    // Fill step 1
    const titleInput = screen.getByPlaceholderText(
      "e.g., Vintage Rolex Watch - Limited Edition"
    );
    fireEvent.change(titleInput, { target: { value: "Test Auction" } });

    const slugInput = screen.getByTestId("slug-input");
    fireEvent.change(slugInput, { target: { value: "test-auction" } });

    const categorySelect = screen.getByDisplayValue("Select a category");
    fireEvent.change(categorySelect, { target: { value: "cat1" } });

    // Go to step 2
    const nextButton = screen.getByText("Next");
    fireEvent.click(nextButton);

    expect(screen.getByText("Step 2 of 5: Bidding Rules")).toBeInTheDocument();
    expect(screen.getByText("Bidding Rules")).toBeInTheDocument();

    // Go back to step 1
    const prevButton = screen.getByText("Previous");
    fireEvent.click(prevButton);

    expect(screen.getByText("Step 1 of 5: Basic Info")).toBeInTheDocument();
  });

  it("validates bidding rules in step 2", async () => {
    await act(async () => {
      render(<CreateAuctionWizardPage />);
    });

    // Go to step 2
    const titleInput = screen.getByPlaceholderText(
      "e.g., Vintage Rolex Watch - Limited Edition"
    );
    fireEvent.change(titleInput, { target: { value: "Test Auction" } });

    const slugInput = screen.getByTestId("slug-input");
    fireEvent.change(slugInput, { target: { value: "test-auction" } });

    const categorySelect = screen.getByDisplayValue("Select a category");
    fireEvent.change(categorySelect, { target: { value: "cat1" } });

    fireEvent.click(screen.getByText("Next"));

    // Try to go to next step without starting bid
    fireEvent.click(screen.getByText("Next"));
    expect(
      screen.getByText("Starting bid must be greater than 0")
    ).toBeInTheDocument();

    // Fill starting bid
    const startingBidInput = screen.getByPlaceholderText("1000");
    fireEvent.change(startingBidInput, { target: { value: "100" } });

    // Try with invalid reserve price
    const auctionTypeButtons = screen.getAllByText("Reserve Auction");
    fireEvent.click(auctionTypeButtons[0]);

    const reservePriceInput = screen.getByPlaceholderText("5000");
    fireEvent.change(reservePriceInput, { target: { value: "50" } }); // Less than starting bid

    fireEvent.click(screen.getByText("Next"));
    expect(
      screen.getByText(
        "Reserve price must be greater than or equal to starting bid"
      )
    ).toBeInTheDocument();
  });

  it("validates schedule in step 3", async () => {
    await act(async () => {
      render(<CreateAuctionWizardPage />);
    });

    // Go to step 3
    const titleInput = screen.getByPlaceholderText(
      "e.g., Vintage Rolex Watch - Limited Edition"
    );
    fireEvent.change(titleInput, { target: { value: "Test Auction" } });

    const slugInput = screen.getByTestId("slug-input");
    fireEvent.change(slugInput, { target: { value: "test-auction" } });

    const categorySelect = screen.getByDisplayValue("Select a category");
    fireEvent.change(categorySelect, { target: { value: "cat1" } });

    fireEvent.click(screen.getByText("Next")); // Step 2

    const startingBidInput = screen.getByPlaceholderText("1000");
    fireEvent.change(startingBidInput, { target: { value: "100" } });

    fireEvent.click(screen.getByText("Next")); // Step 3

    expect(screen.getByText("Step 3 of 5: Schedule")).toBeInTheDocument();

    // Set end time before start time
    const startTimePicker = screen.getAllByTestId("datetime-picker")[0];
    const endTimePicker = screen.getAllByTestId("datetime-picker")[1];

    const pastDate = new Date(Date.now() - 86400000); // Yesterday
    fireEvent.change(endTimePicker, {
      target: { value: pastDate.toISOString().slice(0, 16) },
    });

    fireEvent.click(screen.getByText("Next"));
    expect(
      screen.getByText("End time must be after start time")
    ).toBeInTheDocument();
  });

  it("validates media upload in step 4", async () => {
    await act(async () => {
      render(<CreateAuctionWizardPage />);
    });

    // Go to step 4
    const titleInput = screen.getByPlaceholderText(
      "e.g., Vintage Rolex Watch - Limited Edition"
    );
    fireEvent.change(titleInput, { target: { value: "Test Auction" } });

    const slugInput = screen.getByTestId("slug-input");
    fireEvent.change(slugInput, { target: { value: "test-auction" } });

    const categorySelect = screen.getByDisplayValue("Select a category");
    fireEvent.change(categorySelect, { target: { value: "cat1" } });

    fireEvent.click(screen.getByText("Next")); // Step 2

    const startingBidInput = screen.getByPlaceholderText("1000");
    fireEvent.change(startingBidInput, { target: { value: "100" } });

    fireEvent.click(screen.getByText("Next")); // Step 3
    fireEvent.click(screen.getByText("Next")); // Step 4

    expect(screen.getByText("Step 4 of 5: Media")).toBeInTheDocument();

    // Try to go to next step without images
    fireEvent.click(screen.getByText("Next"));
    expect(
      screen.getByText("At least one image is required")
    ).toBeInTheDocument();
  });

  it("handles successful auction creation", async () => {
    const mockAuctionData = {
      name: "Test Auction",
      slug: "test-auction",
      categoryId: "cat1",
      description: "",
      startingBid: 100,
      reservePrice: undefined,
      bidIncrement: 100, // Default value from form
      buyoutPrice: undefined,
      startTime: expect.any(Date),
      endTime: expect.any(Date),
      status: "scheduled",
      images: ["image1.jpg"],
      videos: [],
      featured: false,
    };

    mockAuctionsService.create.mockResolvedValueOnce(createMockAuction());

    await act(async () => {
      render(<CreateAuctionWizardPage />);
    });

    // Fill all required fields across all steps
    const titleInput = screen.getByPlaceholderText(
      "e.g., Vintage Rolex Watch - Limited Edition"
    );
    fireEvent.change(titleInput, { target: { value: "Test Auction" } });

    const slugInput = screen.getByTestId("slug-input");
    fireEvent.change(slugInput, { target: { value: "test-auction" } });

    const categorySelect = screen.getByDisplayValue("Select a category");
    fireEvent.change(categorySelect, { target: { value: "cat1" } });

    fireEvent.click(screen.getByText("Next")); // Step 2

    const startingBidInput = screen.getByPlaceholderText("1000");
    fireEvent.change(startingBidInput, { target: { value: "100" } });

    fireEvent.click(screen.getByText("Next")); // Step 3
    fireEvent.click(screen.getByText("Next")); // Step 4

    // Mock image upload
    const file = new File(["test"], "test.jpg", { type: "image/jpeg" });
    mockMediaService.upload.mockResolvedValueOnce({
      url: "image1.jpg",
      id: "media-123",
    });

    const imageInput = screen.getByLabelText("Select Images");
    fireEvent.change(imageInput, { target: { files: [file] } });

    await waitFor(() => {
      expect(mockMediaService.upload).toHaveBeenCalled();
    });

    fireEvent.click(screen.getByText("Next")); // Step 5

    // Submit auction
    await act(async () => {
      fireEvent.click(screen.getByText("Create Auction"));
    });

    expect(mockAuctionsService.create).toHaveBeenCalledWith(mockAuctionData);
    expect(mockPush).toHaveBeenCalledWith("/seller/auctions?created=true");
  });

  it("handles auction creation error", async () => {
    mockAuctionsService.create.mockRejectedValueOnce(
      new Error("Creation failed")
    );

    await act(async () => {
      render(<CreateAuctionWizardPage />);
    });

    // Fill minimal required fields and go to final step
    const titleInput = screen.getByPlaceholderText(
      "e.g., Vintage Rolex Watch - Limited Edition"
    );
    fireEvent.change(titleInput, { target: { value: "Test Auction" } });

    const slugInput = screen.getByTestId("slug-input");
    fireEvent.change(slugInput, { target: { value: "test-auction" } });

    const categorySelect = screen.getByDisplayValue("Select a category");
    fireEvent.change(categorySelect, { target: { value: "cat1" } });

    fireEvent.click(screen.getByText("Next")); // Step 2

    const startingBidInput = screen.getByPlaceholderText("1000");
    fireEvent.change(startingBidInput, { target: { value: "100" } });

    fireEvent.click(screen.getByText("Next")); // Step 3
    fireEvent.click(screen.getByText("Next")); // Step 4

    // Mock image upload
    const file = new File(["test"], "test.jpg", { type: "image/jpeg" });
    mockMediaService.upload.mockResolvedValueOnce({
      url: "image1.jpg",
      id: "media-123",
    });

    const imageInput = screen.getByLabelText("Select Images");
    fireEvent.change(imageInput, { target: { files: [file] } });

    await waitFor(() => {
      expect(mockMediaService.upload).toHaveBeenCalled();
    });

    fireEvent.click(screen.getByText("Next")); // Step 5

    // Submit and expect error
    await act(async () => {
      fireEvent.click(screen.getByText("Create Auction"));
    });

    expect(screen.getByText("Creation failed")).toBeInTheDocument();
  });

  it("validates slug uniqueness", async () => {
    mockAuctionsService.validateSlug.mockResolvedValueOnce({
      available: false,
    });

    await act(async () => {
      render(<CreateAuctionWizardPage />);
    });

    const slugInput = screen.getByTestId("slug-input");
    fireEvent.change(slugInput, { target: { value: "taken-slug" } });

    await waitFor(() => {
      expect(mockAuctionsService.validateSlug).toHaveBeenCalledWith(
        "taken-slug",
        ""
      );
    });

    // Wait for the error to be displayed
    await waitFor(() => {
      expect(screen.getByText("This URL is already taken")).toBeInTheDocument();
    });

    // The mock SlugInput should show error styling
    expect(slugInput).toHaveClass("border-red-500");
  });

  it("navigates back to auctions list", async () => {
    await act(async () => {
      render(<CreateAuctionWizardPage />);
    });

    const backLink = screen.getByText("Back to Auctions");
    expect(backLink.closest("a")).toHaveAttribute("href", "/seller/auctions");
  });
});
