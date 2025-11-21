import React from "react";
import { render, screen, waitFor, fireEvent, act } from "@testing-library/react";
import AuctionsPage from "@/app/auctions/page";
import { auctionsService } from "@/services/auctions.service";
import { AuctionStatus, AuctionType } from "@/types/shared/common.types";
import type { AuctionCardFE } from "@/types/frontend/auction.types";

// Mock Firebase
jest.mock("@/app/api/lib/firebase/app", () => ({
  app: {},
  database: {},
  analytics: null,
}));

// Mock next/navigation
const mockSearchParams = new URLSearchParams();
const mockUseSearchParams = jest.fn(() => mockSearchParams);
const mockUseRouter = jest.fn();

jest.mock("next/navigation", () => ({
  useSearchParams: () => mockUseSearchParams(),
  useRouter: () => mockUseRouter(),
}));

// Mock services
jest.mock("@/services/auctions.service");

// Mock hooks
jest.mock("@/hooks/useMobile", () => ({
  useIsMobile: jest.fn(),
}));

// Mock components
jest.mock("@/components/cards/CardGrid", () => ({
  CardGrid: ({ children }: any) => (
    <div data-testid="card-grid">{children}</div>
  ),
}));

jest.mock("@/components/common/EmptyState", () => ({
  EmptyState: ({ title, description }: any) => (
    <div data-testid="empty-state">
      <h3>{title}</h3>
      {description && <p>{description}</p>}
    </div>
  ),
  EmptyStates: {
    NoAuctions: ({ action }: any) => (
      <div data-testid="no-auctions">
        <h3>No auctions found</h3>
        {action && <button>{action.label}</button>}
      </div>
    ),
  },
}));

jest.mock("@/components/common/skeletons/AuctionCardSkeleton", () => ({
  AuctionCardSkeletonGrid: ({ count }: any) => (
    <div data-testid="auction-skeleton-grid" data-count={count} />
  ),
}));

jest.mock("@/components/common/inline-edit", () => ({
  UnifiedFilterSidebar: ({
    values,
    onChange,
    onApply,
    onReset,
    isOpen,
    onClose,
    mobile,
    resultCount,
    isLoading,
  }: any) => (
    <div
      data-testid={`filter-sidebar-${mobile ? "mobile" : "desktop"}`}
      data-open={isOpen}
      data-loading={isLoading}
      data-count={resultCount}
    >
      <div data-testid="filter-values">{JSON.stringify(values)}</div>
      <button data-testid="filter-reset" onClick={onReset}>
        Reset
      </button>
      <button data-testid="filter-apply" onClick={onApply}>
        Apply
      </button>
      <button data-testid="filter-close" onClick={onClose}>
        Close
      </button>
    </div>
  ),
}));

jest.mock("@/components/common/ErrorBoundary", () => ({
  ErrorBoundary: ({ children }: any) => <div>{children}</div>,
}));

const mockAuctionsService = auctionsService as jest.Mocked<
  typeof auctionsService
>;
const mockUseIsMobile = require("@/hooks/useMobile").useIsMobile as jest.Mock;

const mockRouter = {
  push: jest.fn(),
  replace: jest.fn(),
  prefetch: jest.fn(),
  back: jest.fn(),
  forward: jest.fn(),
  refresh: jest.fn(),
};

mockUseRouter.mockReturnValue(mockRouter);

describe("AuctionsPage", () => {
  const mockAuctions: AuctionCardFE[] = [
    {
      id: "1",
      productId: "prod-1",
      productName: "Gaming Laptop",
      productSlug: "gaming-laptop",
      productImage: "/laptop.jpg",
      type: AuctionType.REGULAR,
      status: AuctionStatus.ACTIVE,
      currentPrice: 1500,
      formattedCurrentPrice: "₹1,500",
      buyNowPrice: 2000,
      formattedBuyNowPrice: "₹2,000",
      totalBids: 5,
      endTime: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
      timeRemaining: "23h 59m",
      timeRemainingSeconds: 24 * 60 * 60,
      isActive: true,
      isEndingSoon: false,
      badges: ["featured"],
      images: ["/laptop.jpg"],
      slug: "gaming-laptop",
      name: "Gaming Laptop",
      currentBid: 1500,
      bidCount: 5,
      startingBid: 1000,
      featured: true,
    },
    {
      id: "2",
      productId: "prod-2",
      productName: "Smartphone",
      productSlug: "smartphone",
      productImage: "/phone.jpg",
      type: AuctionType.REGULAR,
      status: AuctionStatus.ACTIVE,
      currentPrice: 800,
      formattedCurrentPrice: "₹800",
      buyNowPrice: null,
      formattedBuyNowPrice: null,
      totalBids: 3,
      endTime: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
      timeRemaining: "1h 59m",
      timeRemainingSeconds: 2 * 60 * 60,
      isActive: true,
      isEndingSoon: true,
      badges: [],
      images: ["/phone.jpg"],
      slug: "smartphone",
      name: "Smartphone",
      currentBid: 800,
      bidCount: 3,
      startingBid: 500,
      featured: false,
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    mockSearchParams.delete("status");
    mockSearchParams.delete("featured");
    mockSearchParams.delete("sortBy");
    mockSearchParams.delete("sortOrder");
    mockSearchParams.delete("page");
    mockUseIsMobile.mockReturnValue(false); // Default to desktop
  });

  describe("Initial render", () => {
    it("shows loading state initially", () => {
      mockAuctionsService.list.mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 100))
      );

      render(<AuctionsPage />);

      // Initially shows Suspense fallback with loading spinner
      expect(screen.getByTestId("auction-skeleton-grid")).toBeInTheDocument();
    });

    it("loads auctions on mount", async () => {
      mockAuctionsService.list.mockResolvedValue({
        data: mockAuctions,
        count: 2,
        pagination: {
          hasNextPage: false,
          nextCursor: null,
        } as any,
      });

      render(<AuctionsPage />);

      await waitFor(() => {
        expect(mockAuctionsService.list).toHaveBeenCalledWith({
          status: "active",
          limit: 12,
          sortBy: "created_at",
          sortOrder: "desc",
        });
      });

      expect(screen.getByRole("heading", { level: 1, name: "Live Auctions" })).toBeInTheDocument();
      expect(screen.getByText("Showing 1-2 of 2 results")).toBeInTheDocument();
    });

    it("displays auctions in grid view by default", async () => {
      mockAuctionsService.list.mockResolvedValue({
        data: mockAuctions,
        count: 2,
        pagination: {
          hasNextPage: false,
          nextCursor: null,
        } as any,
      });

      render(<AuctionsPage />);

      await waitFor(() => {
        expect(screen.getByTestId("card-grid")).toBeInTheDocument();
      });

      expect(screen.getByText("Gaming Laptop")).toBeInTheDocument();
      expect(screen.getByText("Smartphone")).toBeInTheDocument();
    });
  });

  describe("URL parameter handling", () => {
    it("applies status filter from URL", async () => {
      mockSearchParams.set("status", "ended");

      mockAuctionsService.list.mockResolvedValue({
        data: [],
        count: 0,
        pagination: {
          hasNextPage: false,
          nextCursor: null,
        } as any,
      });

      render(<AuctionsPage />);

      await waitFor(() => {
        expect(mockAuctionsService.list).toHaveBeenCalledWith(
          expect.objectContaining({
            status: "ended",
          })
        );
      });
    });

    it("applies featured filter from URL", async () => {
      mockSearchParams.set("featured", "true");

      mockAuctionsService.list.mockResolvedValue({
        data: mockAuctions.filter((a) => a.featured),
        count: 1,
        pagination: {
          hasNextPage: false,
          nextCursor: null,
        } as any,
      });

      render(<AuctionsPage />);

      await waitFor(() => {
        expect(mockAuctionsService.list).toHaveBeenCalledWith(
          expect.objectContaining({
            featured: true,
          })
        );
      });
    });

    it("updates URL when filters change", async () => {
      mockAuctionsService.list.mockResolvedValue({
        data: mockAuctions,
        count: 2,
        pagination: {
          hasNextPage: false,
          nextCursor: null,
        } as any,
      });

      render(<AuctionsPage />);

      await waitFor(() => {
        expect(mockRouter.push).toHaveBeenCalledWith("/auctions", {
          scroll: false,
        });
      });
    });
  });

  describe("Search functionality", () => {
    it("searches auctions when search query is entered", async () => {
      mockAuctionsService.list.mockResolvedValue({
        data: mockAuctions,
        count: 2,
        pagination: {
          hasNextPage: false,
          nextCursor: null,
        } as any,
      });

      render(<AuctionsPage />);

      await waitFor(() => {
        expect(screen.getByPlaceholderText("Search auctions...")).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText("Search auctions...");
      fireEvent.change(searchInput, { target: { value: "laptop" } });

      await waitFor(() => {
        expect(mockAuctionsService.list).toHaveBeenCalledWith(
          expect.objectContaining({
            search: "laptop",
          })
        );
      });
    });
  });

  describe("Filter functionality", () => {
    it("shows desktop filter sidebar", async () => {
      mockUseIsMobile.mockReturnValue(false);

      mockAuctionsService.list.mockResolvedValue({
        data: mockAuctions,
        count: 2,
        pagination: {
          hasNextPage: false,
          nextCursor: null,
        } as any,
      });

      render(<AuctionsPage />);

      await waitFor(() => {
        expect(screen.getByTestId("filter-sidebar-desktop")).toBeInTheDocument();
      });
    });

    it("shows mobile filter drawer when mobile", async () => {
      mockUseIsMobile.mockReturnValue(true);

      mockAuctionsService.list.mockResolvedValue({
        data: mockAuctions,
        count: 2,
        pagination: {
          hasNextPage: false,
          nextCursor: null,
        } as any,
      });

      render(<AuctionsPage />);

      await waitFor(() => {
        expect(screen.getByTestId("filter-sidebar-mobile")).toBeInTheDocument();
      });
    });

    it("toggles mobile filter drawer", async () => {
      mockUseIsMobile.mockReturnValue(true);

      mockAuctionsService.list.mockResolvedValue({
        data: mockAuctions,
        count: 2,
        pagination: {
          hasNextPage: false,
          nextCursor: null,
        } as any,
      });

      render(<AuctionsPage />);

      await waitFor(() => {
        expect(screen.getByText("Show Filters")).toBeInTheDocument();
      });

      const filterButton = screen.getByText("Show Filters");
      fireEvent.click(filterButton);

      expect(screen.getByText("Hide Filters")).toBeInTheDocument();
    });

    it("resets filters when reset button is clicked", async () => {
      mockAuctionsService.list.mockResolvedValue({
        data: mockAuctions,
        count: 2,
        pagination: {
          hasNextPage: false,
          nextCursor: null,
        } as any,
      });

      render(<AuctionsPage />);

      await waitFor(() => {
        const resetButton = screen.getByTestId("filter-reset");
        fireEvent.click(resetButton);
      });

      expect(mockRouter.push).toHaveBeenCalledWith("/auctions", {
        scroll: false,
      });
    });
  });

  describe("View toggle", () => {
    it("switches between grid and list view", async () => {
      mockAuctionsService.list.mockResolvedValue({
        data: mockAuctions,
        count: 2,
        pagination: {
          hasNextPage: false,
          nextCursor: null,
        } as any,
      });

      render(<AuctionsPage />);

      await waitFor(() => {
        expect(screen.getByTestId("card-grid")).toBeInTheDocument();
      });

      // Grid view should be active by default
      const gridButton = screen.getAllByRole("button").find(
        (btn) => btn.querySelector("svg")
      );
      expect(gridButton).toBeInTheDocument();

      // Switch to list view
      const listButtons = screen.getAllByRole("button");
      const listButton = listButtons.find((btn) =>
        btn.textContent?.includes("List")
      );
      if (listButton) {
        fireEvent.click(listButton);
      }

      // In list view, auctions should still be displayed but in different layout
      expect(screen.getByText("Gaming Laptop")).toBeInTheDocument();
    });
  });

  describe("Pagination", () => {
    it("shows pagination when there are more pages", async () => {
      mockAuctionsService.list.mockResolvedValue({
        data: Array.from({ length: 12 }, (_, i) => ({
          ...mockAuctions[0],
          id: `${i + 1}`,
          productName: `Auction ${i + 1}`,
          productSlug: `auction-${i + 1}`,
        })),
        count: 25,
        pagination: {
          hasNextPage: true,
          nextCursor: "cursor-123",
        } as any,
      });

      render(<AuctionsPage />);

      await waitFor(() => {
        expect(screen.getByText("Showing 1-12 of 25 results")).toBeInTheDocument();
      });

      // Check if Next button is present
      expect(screen.getByText("Next")).toBeInTheDocument();
    });

    it("navigates to next page", async () => {
      mockAuctionsService.list
        .mockResolvedValueOnce({
          data: mockAuctions,
          count: 25,
          pagination: {
            hasNextPage: true,
            nextCursor: "cursor-123",
          } as any,
        })
        .mockResolvedValueOnce({
          data: [mockAuctions[0]],
          count: 25,
          pagination: {
            hasNextPage: false,
            nextCursor: null,
          } as any,
        });

      render(<AuctionsPage />);

      await waitFor(() => {
        expect(screen.getByText("Next")).toBeInTheDocument();
      });

      const nextButton = screen.getByText("Next");
      fireEvent.click(nextButton);

      await waitFor(() => {
        expect(mockAuctionsService.list).toHaveBeenCalledWith(
          expect.objectContaining({
            startAfter: "cursor-123",
          })
        );
      });

      expect(screen.getByText("Page 2 (1 items)")).toBeInTheDocument();
    });

    it("navigates to previous page", async () => {
      // Start on page 2
      mockSearchParams.set("page", "2");

      mockAuctionsService.list.mockResolvedValue({
        data: mockAuctions,
        count: 25,
        pagination: {
          hasNextPage: true,
          nextCursor: "cursor-456",
        } as any,
      });

      render(<AuctionsPage />);

      await waitFor(() => {
        expect(screen.getByText("Previous")).toBeInTheDocument();
      });

      const prevButton = screen.getByText("Previous");
      fireEvent.click(prevButton);

      expect(mockRouter.push).toHaveBeenCalledWith("/auctions?page=1", {
        scroll: false,
      });
    });
  });

  describe("Statistics display", () => {
    it("displays auction statistics", async () => {
      mockAuctionsService.list.mockResolvedValue({
        data: mockAuctions,
        count: 2,
        pagination: {
          hasNextPage: false,
          nextCursor: null,
        } as any,
      });

      render(<AuctionsPage />);

      await waitFor(() => {
        expect(screen.getByRole("heading", { level: 1, name: "Live Auctions" })).toBeInTheDocument();
      });

      expect(screen.getByText("2")).toBeInTheDocument(); // Live auctions count
      expect(screen.getByText("1")).toBeInTheDocument(); // Ending soon count
      expect(screen.getByText("8")).toBeInTheDocument(); // Total bids
    });
  });

  describe("Empty state", () => {
    it("shows empty state when no auctions found", async () => {
      mockAuctionsService.list.mockResolvedValue({
        data: [],
        count: 0,
        pagination: {
          hasNextPage: false,
          nextCursor: null,
        } as any,
      });

      render(<AuctionsPage />);

      await waitFor(() => {
        expect(screen.getByTestId("no-auctions")).toBeInTheDocument();
      });

      expect(screen.getByText("No auctions found")).toBeInTheDocument();
    });
  });

  describe("Error handling", () => {
    it("handles API errors gracefully", async () => {
      mockAuctionsService.list.mockRejectedValue(new Error("API Error"));

      render(<AuctionsPage />);

      await waitFor(() => {
        expect(screen.getByTestId("no-auctions")).toBeInTheDocument();
      });
    });
  });

  describe("Auction card interactions", () => {
    it("navigates to auction detail on click", async () => {
      mockAuctionsService.list.mockResolvedValue({
        data: mockAuctions,
        count: 2,
        pagination: {
          hasNextPage: false,
          nextCursor: null,
        } as any,
      });

      render(<AuctionsPage />);

      await waitFor(() => {
        const auctionLink = screen.getByText("Gaming Laptop").closest("a");
        expect(auctionLink).toHaveAttribute("href", "/auctions/gaming-laptop");
      });
    });

    it("displays auction badges correctly", async () => {
      mockAuctionsService.list.mockResolvedValue({
        data: mockAuctions,
        count: 2,
        pagination: {
          hasNextPage: false,
          nextCursor: null,
        } as any,
      });

      render(<AuctionsPage />);

      await waitFor(() => {
        expect(screen.getAllByText("★ Featured")).toHaveLength(1);
        expect(screen.getAllByText("Live")).toHaveLength(1);
      });
    });

    it("shows correct time remaining", async () => {
      mockAuctionsService.list.mockResolvedValue({
        data: mockAuctions,
        count: 2,
        pagination: {
          hasNextPage: false,
          nextCursor: null,
        } as any,
      });

      render(<AuctionsPage />);

      await waitFor(() => {
        // Should show time remaining for active auctions
        const timeElements = screen.getAllByText(/left$/);
        expect(timeElements.length).toBeGreaterThan(0);
      });
    });

    it("shows correct CTA button text", async () => {
      mockAuctionsService.list.mockResolvedValue({
        data: mockAuctions,
        count: 2,
        pagination: {
          hasNextPage: false,
          nextCursor: null,
        } as any,
      });

      render(<AuctionsPage />);

      await waitFor(() => {
        expect(screen.getAllByText("Place Bid")).toHaveLength(2);
        expect(screen.getAllByText("View Details")).toHaveLength(0);
      });
    });
  });

  describe("Responsive behavior", () => {
    it("hides desktop sidebar on mobile", async () => {
      mockUseIsMobile.mockReturnValue(true);

      mockAuctionsService.list.mockResolvedValue({
        data: mockAuctions,
        count: 2,
        pagination: {
          hasNextPage: false,
          nextCursor: null,
        } as any,
      });

      render(<AuctionsPage />);

      await waitFor(() => {
        expect(screen.queryByTestId("filter-sidebar-desktop")).not.toBeInTheDocument();
        expect(screen.getByTestId("filter-sidebar-mobile")).toBeInTheDocument();
      });
    });

    it("shows desktop sidebar on desktop", async () => {
      mockUseIsMobile.mockReturnValue(false);

      mockAuctionsService.list.mockResolvedValue({
        data: mockAuctions,
        count: 2,
        pagination: {
          hasNextPage: false,
          nextCursor: null,
        } as any,
      });

      render(<AuctionsPage />);

      await waitFor(() => {
        expect(screen.getByTestId("filter-sidebar-desktop")).toBeInTheDocument();
        expect(screen.queryByTestId("filter-sidebar-mobile")).not.toBeInTheDocument();
      });
    });
  });
});
