import React from "react";
import {
  render,
  screen,
  waitFor,
  act,
  fireEvent,
} from "@testing-library/react";
import CreateAuctionPage from "@/app/auctions/create/page";

// Mock Firebase
jest.mock("@/app/api/lib/firebase/app", () => ({
  app: {},
  database: {},
  analytics: null,
}));

// Mock next/navigation
const mockPush = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

// Mock next/link
jest.mock("next/link", () => {
  const Link = ({ children, ...props }: any) => <a {...props}>{children}</a>;
  return {
    __esModule: true,
    default: Link,
  };
});

// Mock services
jest.mock("@/services/auctions.service");
jest.mock("@/services/shops.service");
jest.mock("@/services/products.service");

const mockAuctionsService =
  require("@/services/auctions.service").auctionsService;
const mockShopsService = require("@/services/shops.service").shopsService;
const mockProductsService =
  require("@/services/products.service").productsService;

// Mock contexts
jest.mock("@/contexts/AuthContext", () => ({
  useAuth: jest.fn(() => ({ user: { id: "test-user" } })),
}));

// Mock components
jest.mock("@/components/admin/LoadingSpinner", () => ({
  LoadingSpinner: () => <div>Loading...</div>,
}));

jest.mock("@/components/common/ErrorBoundary", () => ({
  ErrorBoundary: ({ children }: any) => <div>{children}</div>,
}));

jest.mock("@/components/seller/AuctionForm", () => {
  const MockAuctionForm = ({ onSubmit, isSubmitting }: any) => (
    <div data-testid="auction-form">
      <button
        data-testid="submit-auction"
        onClick={() =>
          onSubmit({
            name: "Test Auction",
            slug: "test-auction",
            startingBid: 100,
            reservePrice: 200,
            startTime: new Date(),
            endTime: new Date(Date.now() + 86400000),
            status: "scheduled",
            images: ["image1.jpg"],
            videos: [],
            description: "Test description",
          })
        }
        disabled={isSubmitting}
      >
        {isSubmitting ? "Creating..." : "Create Auction"}
      </button>
    </div>
  );
  return {
    __esModule: true,
    default: MockAuctionForm,
  };
});

jest.mock("@/components/ui", () => ({
  __esModule: true,
  Card: ({ children, title, className }: any) => (
    <div className={className} data-testid="card">
      {title && <h2>{title}</h2>}
      {children}
    </div>
  ),
}));

// Mock lucide-react icons
jest.mock("lucide-react", () => ({
  ArrowLeft: () => <div>ArrowLeft</div>,
  AlertCircle: () => <div>AlertCircle</div>,
}));

describe("CreateAuctionPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Reset useAuth to authenticated user
    const { useAuth } = require("@/contexts/AuthContext");
    useAuth.mockReturnValue({ user: { id: "test-user" } });

    // Default mocks
    mockShopsService.list.mockResolvedValue({
      data: [
        {
          id: "shop-1",
          name: "Test Shop",
          slug: "test-shop",
          logo: "/shop-logo.jpg",
          rating: 4.5,
          ratingDisplay: "4.5",
          totalProducts: 10,
          isVerified: true,
          urlPath: "/shops/test-shop",
          badges: ["Verified"],
        },
      ],
      count: 1,
      pagination: {
        limit: 50,
        hasNextPage: false,
        nextCursor: null,
        count: 1,
      },
    });

    mockProductsService.create.mockResolvedValue({
      id: "product-123",
      name: "Test Product",
      slug: "test-product",
    });

    mockAuctionsService.create.mockResolvedValue({
      id: "auction-123",
      productSlug: "test-product",
    });
  });

  it("renders loading spinner initially", () => {
    render(<CreateAuctionPage />);
    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  it("loads shops and renders form when authenticated", async () => {
    await act(async () => {
      render(<CreateAuctionPage />);
    });

    await waitFor(() => {
      expect(mockShopsService.list).toHaveBeenCalledWith({ limit: 50 });
    });

    expect(screen.getByText("Create New Auction")).toBeInTheDocument();
    expect(screen.getByTestId("auction-form")).toBeInTheDocument();
  });

  it("shows authentication required when not logged in", async () => {
    // Mock unauthenticated user
    const { useAuth } = require("@/contexts/AuthContext");
    useAuth.mockReturnValue({ user: null });

    await act(async () => {
      render(<CreateAuctionPage />);
    });

    expect(screen.getByText("Authentication Required")).toBeInTheDocument();
    expect(
      screen.getByText("You must be logged in to create an auction.")
    ).toBeInTheDocument();
    expect(screen.getByText("Sign In")).toBeInTheDocument();
  });

  it("shows no shops message when user has no shops", async () => {
    mockShopsService.list.mockResolvedValue({
      data: [],
      count: 0,
      pagination: {
        limit: 50,
        hasNextPage: false,
        nextCursor: null,
        count: 0,
      },
    });

    await act(async () => {
      render(<CreateAuctionPage />);
    });

    await waitFor(() => {
      expect(screen.getByText("No Shops Found")).toBeInTheDocument();
    });

    expect(
      screen.getByText(
        "You need to create a shop before you can create auctions."
      )
    ).toBeInTheDocument();
    expect(screen.getByText("Create Shop")).toBeInTheDocument();
  });

  it("handles successful auction creation", async () => {
    await act(async () => {
      render(<CreateAuctionPage />);
    });

    await waitFor(() => {
      expect(screen.getByTestId("auction-form")).toBeInTheDocument();
    });

    // Simulate form submission
    const submitButton = screen.getByTestId("submit-auction");
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockProductsService.create).toHaveBeenCalled();
      expect(mockAuctionsService.create).toHaveBeenCalled();
      expect(mockPush).toHaveBeenCalledWith("/auctions/test-product");
    });
  });

  it("handles auction creation error", async () => {
    mockAuctionsService.create.mockRejectedValue(
      new Error("Auction creation failed")
    );

    await act(async () => {
      render(<CreateAuctionPage />);
    });

    await waitFor(() => {
      expect(screen.getByTestId("auction-form")).toBeInTheDocument();
    });

    // Simulate form submission
    const submitButton = screen.getByTestId("submit-auction");
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText("Auction creation failed")).toBeInTheDocument();
    });
  });

  it("handles shops loading error", async () => {
    mockShopsService.list.mockRejectedValue(new Error("Failed to load shops"));

    await act(async () => {
      render(<CreateAuctionPage />);
    });

    await waitFor(() => {
      expect(
        screen.getByText("Failed to load your shops. Please try again.")
      ).toBeInTheDocument();
    });
  });

  it("navigates back to dashboard", async () => {
    render(<CreateAuctionPage />);

    // Wait for shops to load
    await waitFor(() => {
      expect(screen.queryByText("Loading...")).not.toBeInTheDocument();
    });

    const backLink = screen.getByText("Back to Dashboard");
    expect(backLink.closest("a")).toHaveAttribute("href", "/seller");
  });
});
