import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import WatchlistPage from "./page";
import { useAuth } from "@/contexts/AuthContext";
import { auctionsService } from "@/services/auctions.service";
import { AuctionStatus } from "@/types/shared/common.types";

// Mock dependencies
jest.mock("@/contexts/AuthContext");
jest.mock("@/services/auctions.service");
jest.mock("next/link", () => ({
  __esModule: true,
  default: ({ children, href }: any) => <a href={href}>{children}</a>,
}));
jest.mock("@/components/cards/AuctionCard", () => ({
  __esModule: true,
  default: ({ auction, onWatch, isWatched }: any) => (
    <div data-testid="auction-card">
      <div>{auction.productName}</div>
      <div>{auction.currentBid}</div>
      <button onClick={() => onWatch(auction.id)}>Remove</button>
      {isWatched && <span>Watched</span>}
    </div>
  ),
}));

const mockUser = {
  uid: "user123",
  email: "test@example.com",
  displayName: "Test User",
};

const mockAuctions = [
  {
    id: "auction1",
    productName: "Laptop",
    productSlug: "laptop",
    productImage: "/laptop.jpg",
    currentBid: 50000,
    startingBid: 40000,
    status: AuctionStatus.ACTIVE,
    endTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "auction2",
    productName: "Phone",
    productSlug: "phone",
    productImage: "/phone.jpg",
    currentBid: 30000,
    startingBid: 25000,
    status: AuctionStatus.ACTIVE,
    endTime: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(), // 12 hours
  },
  {
    id: "auction3",
    productName: "Watch",
    productSlug: "watch",
    productImage: "/watch.jpg",
    currentBid: 15000,
    startingBid: 10000,
    status: AuctionStatus.ENDED,
    endTime: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

describe("WatchlistPage", () => {
  const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;
  const mockGetWatchlist = auctionsService.getWatchlist as jest.MockedFunction<
    typeof auctionsService.getWatchlist
  >;
  const mockToggleWatch = auctionsService.toggleWatch as jest.MockedFunction<
    typeof auctionsService.toggleWatch
  >;

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetWatchlist.mockResolvedValue(mockAuctions as any);
    mockToggleWatch.mockResolvedValue({ watching: false } as any);
  });

  describe("Basic Rendering", () => {
    it("should render the watchlist page with header", async () => {
      mockUseAuth.mockReturnValue({ user: mockUser } as any);

      render(<WatchlistPage />);

      await waitFor(() => {
        expect(screen.getByText("My Watchlist")).toBeInTheDocument();
      });
      expect(
        screen.getByText(
          "Track your favorite auctions and never miss a bidding opportunity"
        )
      ).toBeInTheDocument();
    });

    it("should render heart icon", async () => {
      mockUseAuth.mockReturnValue({ user: mockUser } as any);

      render(<WatchlistPage />);

      await waitFor(() => {
        const heartIcon = document.querySelector("svg");
        expect(heartIcon).toBeInTheDocument();
      });
    });

    it("should display loading state initially", () => {
      mockUseAuth.mockReturnValue({ user: mockUser } as any);
      mockGetWatchlist.mockReturnValue(new Promise(() => {})); // Never resolves

      render(<WatchlistPage />);

      expect(screen.getByRole("status", { hidden: true })).toBeInTheDocument();
    });
  });

  describe("Authentication", () => {
    it("should show login message when not authenticated", () => {
      mockUseAuth.mockReturnValue({ user: null } as any);

      render(<WatchlistPage />);

      expect(
        screen.getByText("Please log in to view your watchlist")
      ).toBeInTheDocument();
    });

    it("should not call getWatchlist when not authenticated", () => {
      mockUseAuth.mockReturnValue({ user: null } as any);

      render(<WatchlistPage />);

      expect(mockGetWatchlist).not.toHaveBeenCalled();
    });

    it("should load watchlist when user is authenticated", async () => {
      mockUseAuth.mockReturnValue({ user: mockUser } as any);

      render(<WatchlistPage />);

      await waitFor(() => {
        expect(mockGetWatchlist).toHaveBeenCalled();
      });
    });
  });

  describe("Watchlist Stats", () => {
    it("should display total watched count", async () => {
      mockUseAuth.mockReturnValue({ user: mockUser } as any);

      render(<WatchlistPage />);

      await waitFor(() => {
        expect(screen.getByText("Total Watched")).toBeInTheDocument();
        expect(screen.getByText("3")).toBeInTheDocument(); // 3 auctions
      });
    });

    it("should display active auctions count", async () => {
      mockUseAuth.mockReturnValue({ user: mockUser } as any);

      render(<WatchlistPage />);

      await waitFor(() => {
        expect(screen.getByText("Active Auctions")).toBeInTheDocument();
        expect(screen.getByText("2")).toBeInTheDocument(); // 2 active
      });
    });

    it("should display ending soon count", async () => {
      mockUseAuth.mockReturnValue({ user: mockUser } as any);

      render(<WatchlistPage />);

      await waitFor(() => {
        expect(screen.getByText("Ending Soon")).toBeInTheDocument();
        expect(screen.getByText("1")).toBeInTheDocument(); // 1 ending in 12 hours
      });
    });

    it("should not display stats when watchlist is empty", async () => {
      mockUseAuth.mockReturnValue({ user: mockUser } as any);
      mockGetWatchlist.mockResolvedValue([]);

      render(<WatchlistPage />);

      await waitFor(() => {
        expect(screen.queryByText("Total Watched")).not.toBeInTheDocument();
      });
    });
  });

  describe("Auction Display", () => {
    it("should render all watched auctions", async () => {
      mockUseAuth.mockReturnValue({ user: mockUser } as any);

      render(<WatchlistPage />);

      await waitFor(() => {
        expect(screen.getAllByTestId("auction-card")).toHaveLength(3);
      });
    });

    it("should pass correct props to AuctionCard", async () => {
      mockUseAuth.mockReturnValue({ user: mockUser } as any);

      render(<WatchlistPage />);

      await waitFor(() => {
        expect(screen.getByText("Laptop")).toBeInTheDocument();
        expect(screen.getByText("Phone")).toBeInTheDocument();
        expect(screen.getByText("Watch")).toBeInTheDocument();
      });
    });

    it("should mark auctions as watched", async () => {
      mockUseAuth.mockReturnValue({ user: mockUser } as any);

      render(<WatchlistPage />);

      await waitFor(() => {
        const watchedSpans = screen.getAllByText("Watched");
        expect(watchedSpans).toHaveLength(3);
      });
    });

    it("should display auctions in grid layout", async () => {
      mockUseAuth.mockReturnValue({ user: mockUser } as any);

      render(<WatchlistPage />);

      await waitFor(() => {
        const grid = document.querySelector(".grid");
        expect(grid).toBeInTheDocument();
        expect(grid).toHaveClass("grid-cols-1");
      });
    });
  });

  describe("Empty State", () => {
    it("should show empty state when no auctions watched", async () => {
      mockUseAuth.mockReturnValue({ user: mockUser } as any);
      mockGetWatchlist.mockResolvedValue([]);

      render(<WatchlistPage />);

      await waitFor(() => {
        expect(
          screen.getByText("No auctions in your watchlist")
        ).toBeInTheDocument();
      });
    });

    it("should display empty state message", async () => {
      mockUseAuth.mockReturnValue({ user: mockUser } as any);
      mockGetWatchlist.mockResolvedValue([]);

      render(<WatchlistPage />);

      await waitFor(() => {
        expect(
          screen.getByText(
            "Start watching auctions to keep track of items you're interested in"
          )
        ).toBeInTheDocument();
      });
    });

    it("should show browse auctions link", async () => {
      mockUseAuth.mockReturnValue({ user: mockUser } as any);
      mockGetWatchlist.mockResolvedValue([]);

      render(<WatchlistPage />);

      await waitFor(() => {
        const link = screen.getByText("Browse Auctions");
        expect(link).toBeInTheDocument();
        expect(link.closest("a")).toHaveAttribute("href", "/auctions");
      });
    });
  });

  describe("Remove from Watchlist", () => {
    it("should call toggleWatch when remove button clicked", async () => {
      mockUseAuth.mockReturnValue({ user: mockUser } as any);
      const user = userEvent.setup();

      render(<WatchlistPage />);

      await waitFor(() => {
        expect(screen.getAllByText("Remove")).toHaveLength(3);
      });

      const removeButtons = screen.getAllByText("Remove");
      await user.click(removeButtons[0]);

      await waitFor(() => {
        expect(mockToggleWatch).toHaveBeenCalledWith("auction1");
      });
    });

    it("should remove auction from local state after removal", async () => {
      mockUseAuth.mockReturnValue({ user: mockUser } as any);
      const user = userEvent.setup();

      render(<WatchlistPage />);

      await waitFor(() => {
        expect(screen.getAllByTestId("auction-card")).toHaveLength(3);
      });

      const removeButtons = screen.getAllByText("Remove");
      await user.click(removeButtons[0]);

      await waitFor(() => {
        expect(screen.getAllByTestId("auction-card")).toHaveLength(2);
      });
    });

    it("should handle remove error gracefully", async () => {
      mockUseAuth.mockReturnValue({ user: mockUser } as any);
      mockToggleWatch.mockRejectedValue(new Error("Remove failed"));
      const consoleSpy = jest.spyOn(console, "error").mockImplementation();
      const user = userEvent.setup();

      render(<WatchlistPage />);

      await waitFor(() => {
        expect(screen.getAllByText("Remove")).toHaveLength(3);
      });

      const removeButtons = screen.getAllByText("Remove");
      await user.click(removeButtons[0]);

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith(
          "Failed to remove from watchlist:",
          expect.any(Error)
        );
      });

      consoleSpy.mockRestore();
    });
  });

  describe("Error Handling", () => {
    it("should display error state when loading fails", async () => {
      mockUseAuth.mockReturnValue({ user: mockUser } as any);
      mockGetWatchlist.mockRejectedValue(new Error("Load failed"));

      render(<WatchlistPage />);

      await waitFor(() => {
        expect(screen.getByText("Error")).toBeInTheDocument();
        expect(screen.getByText("Load failed")).toBeInTheDocument();
      });
    });

    it("should show Try Again button on error", async () => {
      mockUseAuth.mockReturnValue({ user: mockUser } as any);
      mockGetWatchlist.mockRejectedValue(new Error("Load failed"));

      render(<WatchlistPage />);

      await waitFor(() => {
        expect(screen.getByText("Try Again")).toBeInTheDocument();
      });
    });

    it("should reload watchlist when Try Again clicked", async () => {
      mockUseAuth.mockReturnValue({ user: mockUser } as any);
      mockGetWatchlist.mockRejectedValueOnce(new Error("Load failed"));
      mockGetWatchlist.mockResolvedValueOnce(mockAuctions as any);
      const user = userEvent.setup();

      render(<WatchlistPage />);

      await waitFor(() => {
        expect(screen.getByText("Error")).toBeInTheDocument();
      });

      const tryAgainButton = screen.getByText("Try Again");
      await user.click(tryAgainButton);

      await waitFor(() => {
        expect(mockGetWatchlist).toHaveBeenCalledTimes(2);
        expect(screen.getByText("My Watchlist")).toBeInTheDocument();
      });
    });

    it("should log error to console", async () => {
      mockUseAuth.mockReturnValue({ user: mockUser } as any);
      mockGetWatchlist.mockRejectedValue(new Error("Load failed"));
      const consoleSpy = jest.spyOn(console, "error").mockImplementation();

      render(<WatchlistPage />);

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith(
          "Failed to load watchlist:",
          expect.any(Error)
        );
      });

      consoleSpy.mockRestore();
    });
  });

  describe("Styling & Layout", () => {
    it("should have proper page layout classes", async () => {
      mockUseAuth.mockReturnValue({ user: mockUser } as any);

      render(<WatchlistPage />);

      await waitFor(() => {
        const page = document.querySelector(".min-h-screen");
        expect(page).toBeInTheDocument();
        expect(page).toHaveClass("bg-gray-50");
      });
    });

    it("should have responsive grid", async () => {
      mockUseAuth.mockReturnValue({ user: mockUser } as any);

      render(<WatchlistPage />);

      await waitFor(() => {
        const grid = document.querySelector(".grid");
        expect(grid).toHaveClass(
          "grid-cols-1",
          "sm:grid-cols-2",
          "lg:grid-cols-3",
          "xl:grid-cols-4"
        );
      });
    });

    it("should apply proper spacing", async () => {
      mockUseAuth.mockReturnValue({ user: mockUser } as any);

      render(<WatchlistPage />);

      await waitFor(() => {
        const container = screen
          .getByText("My Watchlist")
          .closest(".max-w-7xl");
        expect(container).toHaveClass("mx-auto", "px-4", "py-8");
      });
    });
  });
});
