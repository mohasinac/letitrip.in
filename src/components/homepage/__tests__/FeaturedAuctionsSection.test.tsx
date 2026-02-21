import { render, screen } from "@testing-library/react";
import { FeaturedAuctionsSection } from "../FeaturedAuctionsSection";

// Mock useApiQuery
const mockUseApiQuery = jest.fn();
jest.mock("@/hooks", () => ({
  useApiQuery: (...args: unknown[]) => mockUseApiQuery(...args),
}));

// Mock Button component
jest.mock("@/components", () => ({
  Button: ({
    children,
    onClick,
    ...props
  }: {
    children: React.ReactNode;
    onClick?: () => void;
    [key: string]: unknown;
  }) => (
    <button onClick={onClick} {...props}>
      {children}
    </button>
  ),
}));

// Create future date for active auction
const futureDate = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(); // 2 days from now
const pastDate = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(); // 1 day ago

const mockAuctions = [
  {
    id: "1",
    title: "Rare Painting",
    slug: "rare-painting",
    currentBid: 25000,
    startingBid: 5000,
    currency: "INR",
    mainImage: "/img/painting.jpg",
    auctionEndDate: futureDate,
    bidCount: 15,
    category: "Art",
  },
  {
    id: "2",
    title: "Antique Vase",
    slug: "antique-vase",
    currentBid: 8000,
    startingBid: 2000,
    currency: "INR",
    mainImage: "/img/vase.jpg",
    auctionEndDate: futureDate,
    bidCount: 1,
    category: "Collectibles",
  },
  {
    id: "3",
    title: "Signed Jersey",
    slug: "signed-jersey",
    currentBid: 3500,
    startingBid: 1000,
    currency: "INR",
    mainImage: "/img/jersey.jpg",
    auctionEndDate: pastDate,
    bidCount: 0,
    category: "Sports",
  },
];

describe("FeaturedAuctionsSection", () => {
  beforeEach(() => {
    mockUseApiQuery.mockReset();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  // ====================================
  // Loading State
  // ====================================
  describe("Loading State", () => {
    it("renders loading skeleton when loading", () => {
      mockUseApiQuery.mockReturnValue({ data: null, isLoading: true });
      const { container } = render(<FeaturedAuctionsSection />);
      expect(
        container.querySelectorAll(".animate-pulse").length,
      ).toBeGreaterThan(0);
    });
  });

  // ====================================
  // No Data State
  // ====================================
  describe("No Data State", () => {
    it("returns null when no auctions", () => {
      mockUseApiQuery.mockReturnValue({
        data: [],
        isLoading: false,
      });
      const { container } = render(<FeaturedAuctionsSection />);
      expect(container.innerHTML).toBe("");
    });

    it("returns null when products array is missing", () => {
      mockUseApiQuery.mockReturnValue({ data: null, isLoading: false });
      const { container } = render(<FeaturedAuctionsSection />);
      expect(container.innerHTML).toBe("");
    });
  });

  // ====================================
  // Content Rendering
  // ====================================
  describe("Content Rendering", () => {
    beforeEach(() => {
      mockUseApiQuery.mockReturnValue({
        data: mockAuctions,
        isLoading: false,
      });
    });

    it('renders "Live Auctions" heading', () => {
      render(<FeaturedAuctionsSection />);
      expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent(
        "Live Auctions",
      );
    });

    it("renders subtitle", () => {
      render(<FeaturedAuctionsSection />);
      expect(screen.getByText("Bid on exclusive items")).toBeInTheDocument();
    });

    it('renders "View All" button', () => {
      render(<FeaturedAuctionsSection />);
      const viewAllItems = screen.getAllByText(/view all/i);
      expect(viewAllItems.length).toBeGreaterThan(0);
    });

    it("renders all auction titles", () => {
      render(<FeaturedAuctionsSection />);
      // Component renders in both mobile and desktop layouts
      expect(
        screen.getAllByText("Rare Painting").length,
      ).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText("Antique Vase").length).toBeGreaterThanOrEqual(
        1,
      );
      expect(
        screen.getAllByText("Signed Jersey").length,
      ).toBeGreaterThanOrEqual(1);
    });

    it("renders auction images with alt text", () => {
      render(<FeaturedAuctionsSection />);
      const images = screen.getAllByRole("img");
      // Images appear in both mobile and desktop layouts
      expect(images.length).toBeGreaterThanOrEqual(3);
      expect(images[0]).toHaveAttribute("alt");
    });

    it('renders "Current Bid" labels', () => {
      render(<FeaturedAuctionsSection />);
      const labels = screen.getAllByText("Current Bid");
      // 3 auctions × 2 layouts = 6 labels
      expect(labels.length).toBeGreaterThanOrEqual(3);
    });

    it("renders bid counts with proper pluralization", () => {
      render(<FeaturedAuctionsSection />);
      expect(screen.getAllByText("15 bids").length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText("1 bid").length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText("0 bids").length).toBeGreaterThanOrEqual(1);
    });
  });

  // ====================================
  // Price Formatting
  // ====================================
  describe("Price Formatting", () => {
    it("formats current bid prices in INR", () => {
      mockUseApiQuery.mockReturnValue({
        data: mockAuctions,
        isLoading: false,
      });
      render(<FeaturedAuctionsSection />);
      expect(screen.getAllByText(/₹\s?25,000/).length).toBeGreaterThanOrEqual(
        1,
      );
      expect(screen.getAllByText(/₹\s?8,000/).length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText(/₹\s?3,500/).length).toBeGreaterThanOrEqual(1);
    });
  });

  // ====================================
  // Countdown Timer
  // ====================================
  describe("Countdown Timer", () => {
    it('shows "Ended" for past auctions', () => {
      mockUseApiQuery.mockReturnValue({
        data: mockAuctions,
        isLoading: false,
      });
      render(<FeaturedAuctionsSection />);
      // "Ended" appears in both mobile and desktop layouts for the past auction
      expect(screen.getAllByText("Ended").length).toBeGreaterThanOrEqual(1);
    });

    it("shows time remaining for active auctions", () => {
      mockUseApiQuery.mockReturnValue({
        data: mockAuctions,
        isLoading: false,
      });
      render(<FeaturedAuctionsSection />);
      // 2 days from now should show "1d Xh" or "2d 0h"
      const timeTexts = screen.getAllByText(/\d+d \d+h/);
      expect(timeTexts.length).toBeGreaterThanOrEqual(1);
    });
  });

  // ====================================
  // Accessibility
  // ====================================
  describe("Accessibility", () => {
    beforeEach(() => {
      mockUseApiQuery.mockReturnValue({
        data: mockAuctions,
        isLoading: false,
      });
    });

    it("uses h2 for section heading", () => {
      render(<FeaturedAuctionsSection />);
      expect(screen.getByRole("heading", { level: 2 })).toBeInTheDocument();
    });

    it("uses h3 for auction titles", () => {
      render(<FeaturedAuctionsSection />);
      const h3s = screen.getAllByRole("heading", { level: 3 });
      // 3 auctions × 2 layouts (mobile + desktop) = 6 h3s
      expect(h3s.length).toBeGreaterThanOrEqual(3);
    });

    it("all images have alt text", () => {
      render(<FeaturedAuctionsSection />);
      screen.getAllByRole("img").forEach((img) => {
        expect(img).toHaveAttribute("alt");
        expect(img.getAttribute("alt")).not.toBe("");
      });
    });
  });
});
