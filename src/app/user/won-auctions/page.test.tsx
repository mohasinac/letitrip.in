import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import WonAuctionsPage from "./page";
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

const mockWonAuctions = [
  {
    id: "auction1",
    productName: "Laptop",
    productSlug: "laptop",
    productImage: "/laptop.jpg",
    currentBid: 50000,
    startingBid: 40000,
    endTime: new Date("2025-11-20T10:00:00Z"),
    status: "ended",
    order_id: "order1",
    payment_status: "paid",
    shipping_status: "shipped",
  },
  {
    id: "auction2",
    productName: "Phone",
    productSlug: "phone",
    productImage: "/phone.jpg",
    currentBid: 30000,
    startingBid: 25000,
    endTime: new Date("2025-11-21T10:00:00Z"),
    status: "ended",
    order_id: "order2",
    payment_status: "paid",
    shipping_status: "delivered",
  },
  {
    id: "auction3",
    productName: "Watch",
    productSlug: "watch",
    productImage: "/watch.jpg",
    currentBid: 15000,
    startingBid: 10000,
    endTime: new Date("2025-11-19T10:00:00Z"),
    status: "ended",
    order_id: null,
    payment_status: "pending",
    shipping_status: null,
  },
];

describe("WonAuctionsPage", () => {
  const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;
  const mockGetWonAuctions =
    auctionsService.getWonAuctions as jest.MockedFunction<
      typeof auctionsService.getWonAuctions
    >;

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetWonAuctions.mockResolvedValue(mockWonAuctions as any);
  });

  describe("Basic Rendering", () => {
    it("should render the won auctions page with header", async () => {
      mockUseAuth.mockReturnValue({ user: mockUser } as any);

      render(<WonAuctionsPage />);

      await waitFor(() => {
        expect(screen.getByText(/Won Auctions/i)).toBeInTheDocument();
      });
    });

    it("should render trophy icon", async () => {
      mockUseAuth.mockReturnValue({ user: mockUser } as any);

      render(<WonAuctionsPage />);

      await waitFor(() => {
        const icons = document.querySelectorAll("svg");
        expect(icons.length).toBeGreaterThan(0);
      });
    });

    it("should display loading state initially", () => {
      mockUseAuth.mockReturnValue({ user: mockUser } as any);
      mockGetWonAuctions.mockReturnValue(new Promise(() => {}));

      render(<WonAuctionsPage />);

      expect(screen.getByRole("status", { hidden: true })).toBeInTheDocument();
    });
  });

  describe("Authentication", () => {
    it("should show login message when not authenticated", () => {
      mockUseAuth.mockReturnValue({ user: null } as any);

      render(<WonAuctionsPage />);

      expect(
        screen.getByText("Please log in to view your won auctions")
      ).toBeInTheDocument();
    });

    it("should not call getWonAuctions when not authenticated", () => {
      mockUseAuth.mockReturnValue({ user: null } as any);

      render(<WonAuctionsPage />);

      expect(mockGetWonAuctions).not.toHaveBeenCalled();
    });

    it("should load won auctions when authenticated", async () => {
      mockUseAuth.mockReturnValue({ user: mockUser } as any);

      render(<WonAuctionsPage />);

      await waitFor(() => {
        expect(mockGetWonAuctions).toHaveBeenCalled();
      });
    });
  });

  describe("Stats Display", () => {
    it("should display total winnings", async () => {
      mockUseAuth.mockReturnValue({ user: mockUser } as any);

      render(<WonAuctionsPage />);

      await waitFor(() => {
        expect(screen.getByText("Total Winnings")).toBeInTheDocument();
        // 50000 + 30000 + 15000 = 95000
        expect(screen.getByText("₹95,000")).toBeInTheDocument();
      });
    });

    it("should display total won count", async () => {
      mockUseAuth.mockReturnValue({ user: mockUser } as any);

      render(<WonAuctionsPage />);

      await waitFor(() => {
        expect(screen.getByText("Total Won")).toBeInTheDocument();
        expect(screen.getByText("3")).toBeInTheDocument();
      });
    });

    it("should calculate stats correctly", async () => {
      mockUseAuth.mockReturnValue({ user: mockUser } as any);

      render(<WonAuctionsPage />);

      await waitFor(() => {
        // Should show stats section
        const statsSection = document.querySelector(
          ".bg-white.rounded-lg.shadow-sm.p-6"
        );
        expect(statsSection).toBeInTheDocument();
      });
    });
  });

  describe("Auction Display", () => {
    it("should render all won auctions", async () => {
      mockUseAuth.mockReturnValue({ user: mockUser } as any);

      render(<WonAuctionsPage />);

      await waitFor(() => {
        expect(screen.getByText("Laptop")).toBeInTheDocument();
        expect(screen.getByText("Phone")).toBeInTheDocument();
        expect(screen.getByText("Watch")).toBeInTheDocument();
      });
    });

    it("should display winning bid amounts", async () => {
      mockUseAuth.mockReturnValue({ user: mockUser } as any);

      render(<WonAuctionsPage />);

      await waitFor(() => {
        expect(screen.getByText("₹50,000")).toBeInTheDocument();
        expect(screen.getByText("₹30,000")).toBeInTheDocument();
        expect(screen.getByText("₹15,000")).toBeInTheDocument();
      });
    });

    it("should display auction images", async () => {
      mockUseAuth.mockReturnValue({ user: mockUser } as any);

      render(<WonAuctionsPage />);

      await waitFor(() => {
        const laptopImage = screen.getByAltText("Laptop");
        expect(laptopImage).toBeInTheDocument();
        expect(laptopImage).toHaveAttribute("src", "/laptop.jpg");
      });
    });

    it("should link to auction detail pages", async () => {
      mockUseAuth.mockReturnValue({ user: mockUser } as any);

      render(<WonAuctionsPage />);

      await waitFor(() => {
        const laptopLink = screen.getByText("Laptop").closest("a");
        expect(laptopLink).toHaveAttribute("href", "/auctions/laptop");
      });
    });
  });

  describe("Order Status", () => {
    it("should display payment status", async () => {
      mockUseAuth.mockReturnValue({ user: mockUser } as any);

      render(<WonAuctionsPage />);

      await waitFor(() => {
        expect(screen.getAllByText("Paid").length).toBeGreaterThan(0);
        expect(screen.getByText("Pending")).toBeInTheDocument();
      });
    });

    it("should display shipping status", async () => {
      mockUseAuth.mockReturnValue({ user: mockUser } as any);

      render(<WonAuctionsPage />);

      await waitFor(() => {
        expect(screen.getByText("Shipped")).toBeInTheDocument();
        expect(screen.getByText("Delivered")).toBeInTheDocument();
      });
    });

    it("should show order link when order exists", async () => {
      mockUseAuth.mockReturnValue({ user: mockUser } as any);

      render(<WonAuctionsPage />);

      await waitFor(() => {
        const viewOrderLinks = screen.getAllByText(/View Order/i);
        expect(viewOrderLinks.length).toBe(2); // auction1 and auction2 have orders
      });
    });

    it("should show pay now button for pending payments", async () => {
      mockUseAuth.mockReturnValue({ user: mockUser } as any);

      render(<WonAuctionsPage />);

      await waitFor(() => {
        expect(screen.getByText(/Pay Now/i)).toBeInTheDocument();
      });
    });
  });

  describe("Empty State", () => {
    it("should show empty state when no won auctions", async () => {
      mockUseAuth.mockReturnValue({ user: mockUser } as any);
      mockGetWonAuctions.mockResolvedValue([]);

      render(<WonAuctionsPage />);

      await waitFor(() => {
        expect(screen.getByText(/No won auctions yet/i)).toBeInTheDocument();
      });
    });

    it("should display empty state message", async () => {
      mockUseAuth.mockReturnValue({ user: mockUser } as any);
      mockGetWonAuctions.mockResolvedValue([]);

      render(<WonAuctionsPage />);

      await waitFor(() => {
        expect(
          screen.getByText(/Keep bidding to win your first auction/i)
        ).toBeInTheDocument();
      });
    });

    it("should show browse auctions link in empty state", async () => {
      mockUseAuth.mockReturnValue({ user: mockUser } as any);
      mockGetWonAuctions.mockResolvedValue([]);

      render(<WonAuctionsPage />);

      await waitFor(() => {
        const link = screen.getByText("Browse Auctions");
        expect(link).toBeInTheDocument();
        expect(link.closest("a")).toHaveAttribute("href", "/auctions");
      });
    });
  });

  describe("Error Handling", () => {
    it("should display error state when loading fails", async () => {
      mockUseAuth.mockReturnValue({ user: mockUser } as any);
      mockGetWonAuctions.mockRejectedValue(new Error("Load failed"));

      render(<WonAuctionsPage />);

      await waitFor(() => {
        expect(screen.getByText("Error")).toBeInTheDocument();
        expect(screen.getByText("Load failed")).toBeInTheDocument();
      });
    });

    it("should show Try Again button on error", async () => {
      mockUseAuth.mockReturnValue({ user: mockUser } as any);
      mockGetWonAuctions.mockRejectedValue(new Error("Load failed"));

      render(<WonAuctionsPage />);

      await waitFor(() => {
        expect(screen.getByText("Try Again")).toBeInTheDocument();
      });
    });

    it("should reload when Try Again clicked", async () => {
      mockUseAuth.mockReturnValue({ user: mockUser } as any);
      mockGetWonAuctions.mockRejectedValueOnce(new Error("Load failed"));
      mockGetWonAuctions.mockResolvedValueOnce(mockWonAuctions as any);
      const user = userEvent.setup();

      render(<WonAuctionsPage />);

      await waitFor(() => {
        expect(screen.getByText("Error")).toBeInTheDocument();
      });

      const tryAgainButton = screen.getByText("Try Again");
      await user.click(tryAgainButton);

      await waitFor(() => {
        expect(mockGetWonAuctions).toHaveBeenCalledTimes(2);
      });
    });
  });

  describe("Styling & Layout", () => {
    it("should have proper page layout", async () => {
      mockUseAuth.mockReturnValue({ user: mockUser } as any);

      render(<WonAuctionsPage />);

      await waitFor(() => {
        const page = document.querySelector(".min-h-screen");
        expect(page).toBeInTheDocument();
        expect(page).toHaveClass("bg-gray-50");
      });
    });

    it("should render cards in list layout", async () => {
      mockUseAuth.mockReturnValue({ user: mockUser } as any);

      render(<WonAuctionsPage />);

      await waitFor(() => {
        const cards = document.querySelectorAll(
          ".bg-white.rounded-lg.shadow-sm"
        );
        expect(cards.length).toBeGreaterThan(0);
      });
    });
  });
});
