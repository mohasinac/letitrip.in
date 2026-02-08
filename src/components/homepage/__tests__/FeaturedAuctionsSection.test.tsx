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
    totalBids: 15,
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
    totalBids: 1,
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
    totalBids: 0,
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
        data: { products: [] },
        isLoading: false,
      });
      const { container } = render(<FeaturedAuctionsSection />);
      expect(container.innerHTML).toBe("");
    });

    it("returns null when products array is missing", () => {
      mockUseApiQuery.mockReturnValue({ data: {}, isLoading: false });
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
        data: { products: mockAuctions },
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
      expect(
        screen.getByText("Bid now on exclusive items"),
      ).toBeInTheDocument();
    });

    it('renders "View All Auctions" button', () => {
      render(<FeaturedAuctionsSection />);
      expect(screen.getByText("View All Auctions")).toBeInTheDocument();
    });

    it("renders all auction titles", () => {
      render(<FeaturedAuctionsSection />);
      expect(screen.getByText("Rare Painting")).toBeInTheDocument();
      expect(screen.getByText("Antique Vase")).toBeInTheDocument();
      expect(screen.getByText("Signed Jersey")).toBeInTheDocument();
    });

    it("renders auction images with alt text", () => {
      render(<FeaturedAuctionsSection />);
      const images = screen.getAllByRole("img");
      expect(images).toHaveLength(3);
      expect(images[0]).toHaveAttribute("alt", "Rare Painting");
    });

    it('renders "Current Bid" labels', () => {
      render(<FeaturedAuctionsSection />);
      const labels = screen.getAllByText("Current Bid");
      expect(labels).toHaveLength(3);
    });

    it("renders bid counts with proper pluralization", () => {
      render(<FeaturedAuctionsSection />);
      expect(screen.getByText("15 bids")).toBeInTheDocument();
      expect(screen.getByText("1 bid")).toBeInTheDocument();
      expect(screen.getByText("0 bids")).toBeInTheDocument();
    });
  });

  // ====================================
  // Price Formatting
  // ====================================
  describe("Price Formatting", () => {
    it("formats current bid prices in INR", () => {
      mockUseApiQuery.mockReturnValue({
        data: { products: mockAuctions },
        isLoading: false,
      });
      render(<FeaturedAuctionsSection />);
      expect(screen.getByText("₹25,000")).toBeInTheDocument();
      expect(screen.getByText("₹8,000")).toBeInTheDocument();
      expect(screen.getByText("₹3,500")).toBeInTheDocument();
    });
  });

  // ====================================
  // Countdown Timer
  // ====================================
  describe("Countdown Timer", () => {
    it('shows "Ended" for past auctions', () => {
      mockUseApiQuery.mockReturnValue({
        data: { products: mockAuctions },
        isLoading: false,
      });
      render(<FeaturedAuctionsSection />);
      expect(screen.getByText("Ended")).toBeInTheDocument();
    });

    it("shows time remaining for active auctions", () => {
      mockUseApiQuery.mockReturnValue({
        data: { products: mockAuctions },
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
        data: { products: mockAuctions },
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
      expect(h3s).toHaveLength(3);
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
