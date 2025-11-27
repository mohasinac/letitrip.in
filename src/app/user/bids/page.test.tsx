import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import MyBidsPage from "./page";
import { useAuth } from "@/contexts/AuthContext";
import { auctionsService } from "@/services/auctions.service";

// Mock dependencies
jest.mock("@/contexts/AuthContext");
jest.mock("@/services/auctions.service");
jest.mock("next/link", () => ({
  __esModule: true,
  default: ({ children, href }: any) => <a href={href}>{children}</a>,
}));
jest.mock("next/image", () => ({
  __esModule: true,
  default: ({ src, alt }: any) => <img src={src} alt={alt} />,
}));

const mockUser = {
  uid: "user123",
  email: "test@example.com",
  displayName: "Test User",
};

const mockBids = [
  {
    id: "bid1",
    auction_id: "auction1",
    user_id: "user123",
    amount: 50000,
    created_at: new Date("2025-11-20T10:00:00Z"),
    is_auto_bid: false,
    auction: {
      id: "auction1",
      name: "Laptop",
      slug: "laptop",
      images: ["/laptop.jpg"],
      currentBid: 55000,
      startingBid: 40000,
      bidCount: 10,
      endTime: new Date("2025-12-01T10:00:00Z"),
      status: "live",
      highest_bidder_id: "other_user",
    },
  },
  {
    id: "bid2",
    auction_id: "auction2",
    user_id: "user123",
    amount: 30000,
    created_at: new Date("2025-11-21T10:00:00Z"),
    is_auto_bid: true,
    auction: {
      id: "auction2",
      name: "Phone",
      slug: "phone",
      images: ["/phone.jpg"],
      currentBid: 30000,
      startingBid: 25000,
      bidCount: 5,
      endTime: new Date("2025-12-02T10:00:00Z"),
      status: "live",
      highest_bidder_id: "user123",
    },
  },
  {
    id: "bid3",
    auction_id: "auction3",
    user_id: "user123",
    amount: 15000,
    created_at: new Date("2025-11-19T10:00:00Z"),
    is_auto_bid: false,
    auction: {
      id: "auction3",
      name: "Watch",
      slug: "watch",
      images: [],
      currentBid: 15000,
      startingBid: 10000,
      bidCount: 3,
      endTime: new Date("2025-11-22T10:00:00Z"),
      status: "ended",
      highest_bidder_id: "user123",
    },
  },
];

describe("MyBidsPage", () => {
  const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;
  const mockGetMyBids = auctionsService.getMyBids as jest.MockedFunction<
    typeof auctionsService.getMyBids
  >;

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetMyBids.mockResolvedValue(mockBids as any);
  });

  describe("Basic Rendering", () => {
    it("should render the my bids page with header", async () => {
      mockUseAuth.mockReturnValue({ user: mockUser } as any);

      render(<MyBidsPage />);

      await waitFor(() => {
        expect(screen.getByText("My Bids")).toBeInTheDocument();
      });
      expect(
        screen.getByText("Track all your auction bids in one place")
      ).toBeInTheDocument();
    });

    it("should render gavel icon", async () => {
      mockUseAuth.mockReturnValue({ user: mockUser } as any);

      render(<MyBidsPage />);

      await waitFor(() => {
        const icons = document.querySelectorAll("svg");
        expect(icons.length).toBeGreaterThan(0);
      });
    });

    it("should display loading state initially", () => {
      mockUseAuth.mockReturnValue({ user: mockUser } as any);
      mockGetMyBids.mockReturnValue(new Promise(() => {})); // Never resolves

      render(<MyBidsPage />);

      const spinner = document.querySelector(".animate-spin");
      expect(spinner).toBeInTheDocument();
    });
  });

  describe("Authentication", () => {
    it("should show login message when not authenticated", () => {
      mockUseAuth.mockReturnValue({ user: null } as any);

      render(<MyBidsPage />);

      expect(
        screen.getByText("Please log in to view your bids")
      ).toBeInTheDocument();
    });

    it("should not call getMyBids when not authenticated", () => {
      mockUseAuth.mockReturnValue({ user: null } as any);

      render(<MyBidsPage />);

      expect(mockGetMyBids).not.toHaveBeenCalled();
    });

    it("should load bids when user is authenticated", async () => {
      mockUseAuth.mockReturnValue({ user: mockUser } as any);

      render(<MyBidsPage />);

      await waitFor(() => {
        expect(mockGetMyBids).toHaveBeenCalled();
      });
    });
  });

  describe("Bid Stats", () => {
    it("should display total bids count", async () => {
      mockUseAuth.mockReturnValue({ user: mockUser } as any);

      render(<MyBidsPage />);

      await waitFor(() => {
        expect(screen.getAllByText("Total Bids").length).toBeGreaterThan(0);
        expect(screen.getByText("3")).toBeInTheDocument();
      });
    });

    it("should display winning bids count", async () => {
      mockUseAuth.mockReturnValue({ user: mockUser } as any);

      render(<MyBidsPage />);

      await waitFor(() => {
        expect(screen.getAllByText("Winning").length).toBeGreaterThan(0);
        // Should show 1 winning bid (auction2)
        const stats = document.querySelector(
          ".text-2xl.font-bold.text-green-600"
        );
        expect(stats?.textContent).toBe("1");
      });
    });

    it("should display outbid count", async () => {
      mockUseAuth.mockReturnValue({ user: mockUser } as any);

      render(<MyBidsPage />);

      await waitFor(() => {
        expect(screen.getAllByText("Outbid").length).toBeGreaterThan(0);
        // Should show 1 outbid (auction1)
        const stats = document.querySelector(
          ".text-2xl.font-bold.text-red-600"
        );
        expect(stats?.textContent).toBe("1");
      });
    });

    it("should display ended bids count", async () => {
      mockUseAuth.mockReturnValue({ user: mockUser } as any);

      render(<MyBidsPage />);

      await waitFor(() => {
        expect(screen.getAllByText("Ended").length).toBeGreaterThan(0);
        // Should show 1 ended (auction3)
        const stats = document.querySelector(
          ".text-2xl.font-bold.text-gray-600"
        );
        expect(stats?.textContent).toBe("1");
      });
    });

    it("should not display stats when no bids", async () => {
      mockUseAuth.mockReturnValue({ user: mockUser } as any);
      mockGetMyBids.mockResolvedValue([]);

      render(<MyBidsPage />);

      await waitFor(() => {
        expect(screen.queryByText("Total Bids")).not.toBeInTheDocument();
      });
    });
  });

  describe("Bid Display", () => {
    it("should render all bids", async () => {
      mockUseAuth.mockReturnValue({ user: mockUser } as any);

      render(<MyBidsPage />);

      await waitFor(() => {
        expect(screen.getByText("Laptop")).toBeInTheDocument();
        expect(screen.getByText("Phone")).toBeInTheDocument();
        expect(screen.getByText("Watch")).toBeInTheDocument();
      });
    });

    it("should display bid amounts", async () => {
      mockUseAuth.mockReturnValue({ user: mockUser } as any);

      render(<MyBidsPage />);

      await waitFor(() => {
        // Amounts may appear multiple times (Your Bid + Current Bid), formatCurrency adds .00
        expect(screen.getAllByText("₹50,000.00").length).toBeGreaterThan(0); // bid1
        expect(screen.getAllByText("₹30,000.00").length).toBeGreaterThan(0); // bid2
        expect(screen.getAllByText("₹15,000.00").length).toBeGreaterThan(0); // bid3
      });
    });

    it("should display current bid amounts", async () => {
      mockUseAuth.mockReturnValue({ user: mockUser } as any);

      render(<MyBidsPage />);

      await waitFor(() => {
        expect(screen.getByText("₹55,000.00")).toBeInTheDocument(); // auction1 current, formatCurrency adds .00
      });
    });

    it("should display auction images", async () => {
      mockUseAuth.mockReturnValue({ user: mockUser } as any);

      render(<MyBidsPage />);

      await waitFor(() => {
        const laptopImage = screen.getByAltText("Laptop");
        expect(laptopImage).toBeInTheDocument();
        expect(laptopImage).toHaveAttribute("src", "/laptop.jpg");
      });
    });

    it("should show placeholder when no image", async () => {
      mockUseAuth.mockReturnValue({ user: mockUser } as any);

      render(<MyBidsPage />);

      await waitFor(() => {
        // Watch has no images, should show gavel icon
        const placeholders = document.querySelectorAll(".text-gray-400");
        expect(placeholders.length).toBeGreaterThan(0);
      });
    });

    it("should display bid count", async () => {
      mockUseAuth.mockReturnValue({ user: mockUser } as any);

      render(<MyBidsPage />);

      await waitFor(() => {
        expect(screen.getByText("10 bids")).toBeInTheDocument();
        expect(screen.getByText("5 bids")).toBeInTheDocument();
        expect(screen.getByText("3 bids")).toBeInTheDocument();
      });
    });
  });

  describe("Status Badges", () => {
    it("should show winning badge for winning bids", async () => {
      mockUseAuth.mockReturnValue({ user: mockUser } as any);

      render(<MyBidsPage />);

      await waitFor(() => {
        const winningBadges = screen.getAllByText("Winning");
        expect(winningBadges.length).toBeGreaterThan(0);
      });
    });

    it("should show outbid badge for outbid bids", async () => {
      mockUseAuth.mockReturnValue({ user: mockUser } as any);

      render(<MyBidsPage />);

      await waitFor(() => {
        const outbidBadges = screen.getAllByText("Outbid");
        expect(outbidBadges.length).toBeGreaterThan(0);
      });
    });

    it("should show ended badge for ended auctions", async () => {
      mockUseAuth.mockReturnValue({ user: mockUser } as any);

      render(<MyBidsPage />);

      await waitFor(() => {
        const endedBadges = screen.getAllByText("Ended");
        expect(endedBadges.length).toBeGreaterThan(0);
      });
    });

    it("should apply correct badge colors", async () => {
      mockUseAuth.mockReturnValue({ user: mockUser } as any);

      render(<MyBidsPage />);

      await waitFor(() => {
        const winningBadges = screen.getAllByText("Winning");
        // Get the badge span (not the stats label)
        const winningBadge = winningBadges
          .find((el) => el.closest(".bg-green-100"))
          ?.closest("span");
        expect(winningBadge).toHaveClass("bg-green-100", "text-green-800");
      });
    });
  });

  describe("Auto-Bid Indicator", () => {
    it("should show auto-bid indicator for auto bids", async () => {
      mockUseAuth.mockReturnValue({ user: mockUser } as any);

      render(<MyBidsPage />);

      await waitFor(() => {
        expect(screen.getByText("Auto-bid")).toBeInTheDocument();
      });
    });

    it("should not show auto-bid indicator for manual bids", async () => {
      mockUseAuth.mockReturnValue({ user: mockUser } as any);

      render(<MyBidsPage />);

      await waitFor(() => {
        // Only 1 auto-bid (bid2), so should be exactly 1 indicator
        const autoBidIndicators = screen.queryAllByText("Auto-bid");
        expect(autoBidIndicators).toHaveLength(1);
      });
    });

    it("should display trophy icon for auto-bid", async () => {
      mockUseAuth.mockReturnValue({ user: mockUser } as any);

      render(<MyBidsPage />);

      await waitFor(() => {
        const autoBidContainer = screen.getByText("Auto-bid").closest("div");
        expect(autoBidContainer).toHaveClass("text-blue-600");
      });
    });
  });

  describe("Empty State", () => {
    it("should show empty state when no bids", async () => {
      mockUseAuth.mockReturnValue({ user: mockUser } as any);
      mockGetMyBids.mockResolvedValue([]);

      render(<MyBidsPage />);

      await waitFor(() => {
        expect(screen.getByText("No bids yet")).toBeInTheDocument();
      });
    });

    it("should display empty state message", async () => {
      mockUseAuth.mockReturnValue({ user: mockUser } as any);
      mockGetMyBids.mockResolvedValue([]);

      render(<MyBidsPage />);

      await waitFor(() => {
        expect(
          screen.getByText(
            "Start bidding on auctions to see your activity here"
          )
        ).toBeInTheDocument();
      });
    });

    it("should show browse auctions link", async () => {
      mockUseAuth.mockReturnValue({ user: mockUser } as any);
      mockGetMyBids.mockResolvedValue([]);

      render(<MyBidsPage />);

      await waitFor(() => {
        const link = screen.getByText("Browse Auctions");
        expect(link).toBeInTheDocument();
        expect(link.closest("a")).toHaveAttribute("href", "/auctions");
      });
    });
  });

  describe("Navigation", () => {
    it("should link to auction detail page", async () => {
      mockUseAuth.mockReturnValue({ user: mockUser } as any);

      render(<MyBidsPage />);

      await waitFor(() => {
        const laptopLink = screen.getByText("Laptop").closest("a");
        expect(laptopLink).toHaveAttribute("href", "/auctions/laptop");
      });
    });

    it("should use auction_id as fallback when slug missing", async () => {
      mockUseAuth.mockReturnValue({ user: mockUser } as any);
      const bidsWithoutSlug = [
        {
          ...mockBids[0],
          auction: { ...mockBids[0].auction, slug: undefined },
        },
      ];
      mockGetMyBids.mockResolvedValue(bidsWithoutSlug as any);

      render(<MyBidsPage />);

      await waitFor(() => {
        const link = screen.getByText("Laptop").closest("a");
        expect(link).toHaveAttribute("href", "/auctions/auction1");
      });
    });
  });

  describe("Error Handling", () => {
    it("should display error state when loading fails", async () => {
      mockUseAuth.mockReturnValue({ user: mockUser } as any);
      mockGetMyBids.mockRejectedValue(new Error("Load failed"));

      render(<MyBidsPage />);

      await waitFor(() => {
        expect(screen.getByText("Error")).toBeInTheDocument();
        expect(screen.getByText("Load failed")).toBeInTheDocument();
      });
    });

    it("should show Try Again button on error", async () => {
      mockUseAuth.mockReturnValue({ user: mockUser } as any);
      mockGetMyBids.mockRejectedValue(new Error("Load failed"));

      render(<MyBidsPage />);

      await waitFor(() => {
        expect(screen.getByText("Try Again")).toBeInTheDocument();
      });
    });

    it("should reload bids when Try Again clicked", async () => {
      mockUseAuth.mockReturnValue({ user: mockUser } as any);
      mockGetMyBids.mockRejectedValueOnce(new Error("Load failed"));
      mockGetMyBids.mockResolvedValueOnce(mockBids as any);
      const user = userEvent.setup();

      render(<MyBidsPage />);

      await waitFor(() => {
        expect(screen.getByText("Error")).toBeInTheDocument();
      });

      const tryAgainButton = screen.getByText("Try Again");
      await user.click(tryAgainButton);

      await waitFor(() => {
        expect(mockGetMyBids).toHaveBeenCalledTimes(2);
        expect(screen.getByText("My Bids")).toBeInTheDocument();
      });
    });

    it("should log error to console", async () => {
      mockUseAuth.mockReturnValue({ user: mockUser } as any);
      mockGetMyBids.mockRejectedValue(new Error("Load failed"));
      const consoleSpy = jest.spyOn(console, "error").mockImplementation();

      render(<MyBidsPage />);

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith(
          "Failed to load bids:",
          expect.any(Error)
        );
      });

      consoleSpy.mockRestore();
    });
  });

  describe("Bid Grouping", () => {
    it("should group multiple bids per auction and show latest", async () => {
      mockUseAuth.mockReturnValue({ user: mockUser } as any);
      const multipleBids = [
        mockBids[0],
        {
          ...mockBids[0],
          id: "bid1b",
          amount: 52000,
          created_at: new Date("2025-11-21T10:00:00Z"), // Later date
        },
      ];
      mockGetMyBids.mockResolvedValue(multipleBids as any);

      render(<MyBidsPage />);

      await waitFor(() => {
        // Should only show 1 bid for auction1 (the latest one), formatCurrency adds .00
        expect(screen.getByText("₹52,000.00")).toBeInTheDocument();
        expect(screen.queryByText("₹50,000.00")).not.toBeInTheDocument();
      });
    });

    it("should sort bids by created date descending", async () => {
      mockUseAuth.mockReturnValue({ user: mockUser } as any);

      render(<MyBidsPage />);

      await waitFor(() => {
        const bidCards = screen.getAllByRole("link");
        // bid2 (Nov 21) should be first, then bid1 (Nov 20), then bid3 (Nov 19)
        expect(bidCards[0]).toHaveTextContent("Phone");
      });
    });
  });

  describe("Styling & Layout", () => {
    it("should have proper page layout classes", async () => {
      mockUseAuth.mockReturnValue({ user: mockUser } as any);

      render(<MyBidsPage />);

      await waitFor(() => {
        const page = document.querySelector(".min-h-screen");
        expect(page).toBeInTheDocument();
        expect(page).toHaveClass("bg-gray-50");
      });
    });

    it("should apply card hover effects", async () => {
      mockUseAuth.mockReturnValue({ user: mockUser } as any);

      render(<MyBidsPage />);

      await waitFor(() => {
        const card = document.querySelector(".hover\\:shadow-md");
        expect(card).toBeInTheDocument();
      });
    });

    it("should have responsive stats grid", async () => {
      mockUseAuth.mockReturnValue({ user: mockUser } as any);

      render(<MyBidsPage />);

      await waitFor(() => {
        const statsGrid = document.querySelector(
          ".grid-cols-1.sm\\:grid-cols-4"
        );
        expect(statsGrid).toBeInTheDocument();
      });
    });
  });
});
