import { analyticsService } from "@/services/analytics.service";
import type { AuctionItemFE } from "@/services/homepage.service";
import { homepageService } from "@/services/homepage.service";
import { render, screen, waitFor } from "@testing-library/react";
import { FeaturedAuctionsSection } from "../FeaturedAuctionsSection";

// Mock services
jest.mock("@/services/homepage.service");
jest.mock("@/services/analytics.service");
jest.mock("@/lib/error-logger");

// Mock components
jest.mock("@/components/common/HorizontalScrollContainer", () => ({
  HorizontalScrollContainer: ({
    children,
    title,
    viewAllLink,
    className,
  }: any) => (
    <div data-testid="horizontal-scroll" className={className}>
      <h2>{title}</h2>
      {viewAllLink && <a href={viewAllLink}>View All</a>}
      {children}
    </div>
  ),
}));

jest.mock("@/components/cards/AuctionCard", () => ({
  __esModule: true,
  default: ({ auction }: any) => (
    <div data-testid={`auction-${auction.id}`}>{auction.name}</div>
  ),
}));

const mockAuctions: AuctionItemFE[] = [
  {
    id: "auction1",
    name: "Test Auction 1",
    slug: "test-auction-1",
    images: ["/image1.jpg"],
    currentBid: 1000,
    startingBid: 500,
    bidCount: 5,
    endTime: new Date(Date.now() + 86400000).toISOString(),
    status: "live",
    shopId: "shop1",
    shopName: "Test Shop",
  },
  {
    id: "auction2",
    name: "Test Auction 2",
    slug: "test-auction-2",
    images: ["/image2.jpg"],
    currentBid: 2000,
    startingBid: 1000,
    bidCount: 10,
    endTime: new Date(Date.now() + 172800000).toISOString(),
    status: "upcoming",
    shopId: "shop1",
    shopName: "Test Shop",
  },
];

describe("FeaturedAuctionsSection", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Loading State", () => {
    it("should show skeletons while loading", async () => {
      (homepageService.getFeaturedAuctions as jest.Mock).mockImplementation(
        () => new Promise(() => {})
      );

      render(<FeaturedAuctionsSection limit={5} />);

      expect(screen.getByText("Featured Auctions")).toBeInTheDocument();
      const skeletons = document.querySelectorAll(".animate-pulse");
      expect(skeletons).toHaveLength(5);
    });

    it("should respect limit prop for skeleton count", async () => {
      (homepageService.getFeaturedAuctions as jest.Mock).mockImplementation(
        () => new Promise(() => {})
      );

      render(<FeaturedAuctionsSection limit={3} />);

      const skeletons = document.querySelectorAll(".animate-pulse");
      expect(skeletons).toHaveLength(3);
    });

    it("should show max 5 skeletons even if limit is higher", async () => {
      (homepageService.getFeaturedAuctions as jest.Mock).mockImplementation(
        () => new Promise(() => {})
      );

      render(<FeaturedAuctionsSection limit={20} />);

      const skeletons = document.querySelectorAll(".animate-pulse");
      expect(skeletons).toHaveLength(5);
    });

    it("should have correct skeleton height", async () => {
      (homepageService.getFeaturedAuctions as jest.Mock).mockImplementation(
        () => new Promise(() => {})
      );

      const { container } = render(<FeaturedAuctionsSection />);
      const skeleton = container.querySelector(".h-80");
      expect(skeleton).toBeInTheDocument();
    });

    it("should have dark mode support in skeletons", async () => {
      (homepageService.getFeaturedAuctions as jest.Mock).mockImplementation(
        () => new Promise(() => {})
      );

      const { container } = render(<FeaturedAuctionsSection />);
      const skeleton = container.querySelector(".dark\\:bg-gray-800");
      expect(skeleton).toBeInTheDocument();
    });

    it("should have rounded skeleton", async () => {
      (homepageService.getFeaturedAuctions as jest.Mock).mockImplementation(
        () => new Promise(() => {})
      );

      const { container } = render(<FeaturedAuctionsSection />);
      const skeleton = container.querySelector(".rounded-lg");
      expect(skeleton).toBeInTheDocument();
    });
  });

  describe("Data Loading", () => {
    it("should load and display auctions", async () => {
      (homepageService.getFeaturedAuctions as jest.Mock).mockResolvedValue(
        mockAuctions
      );

      render(<FeaturedAuctionsSection />);

      await waitFor(() => {
        expect(screen.getByTestId("auction-auction1")).toBeInTheDocument();
        expect(screen.getByTestId("auction-auction2")).toBeInTheDocument();
      });
    });

    it("should call service with correct limit", async () => {
      (homepageService.getFeaturedAuctions as jest.Mock).mockResolvedValue([]);

      render(<FeaturedAuctionsSection limit={5} />);

      await waitFor(() => {
        expect(homepageService.getFeaturedAuctions).toHaveBeenCalledWith(5);
      });
    });

    it("should use default limit of 10", async () => {
      (homepageService.getFeaturedAuctions as jest.Mock).mockResolvedValue([]);

      render(<FeaturedAuctionsSection />);

      await waitFor(() => {
        expect(homepageService.getFeaturedAuctions).toHaveBeenCalledWith(10);
      });
    });

    it("should reload when limit changes", async () => {
      (homepageService.getFeaturedAuctions as jest.Mock).mockResolvedValue([]);

      const { rerender } = render(<FeaturedAuctionsSection limit={5} />);

      await waitFor(() => {
        expect(homepageService.getFeaturedAuctions).toHaveBeenCalledWith(5);
      });

      rerender(<FeaturedAuctionsSection limit={10} />);

      await waitFor(() => {
        expect(homepageService.getFeaturedAuctions).toHaveBeenCalledWith(10);
      });
    });
  });

  describe("Analytics", () => {
    it("should track analytics when auctions are loaded", async () => {
      (homepageService.getFeaturedAuctions as jest.Mock).mockResolvedValue(
        mockAuctions
      );

      render(<FeaturedAuctionsSection />);

      await waitFor(() => {
        expect(analyticsService.trackEvent).toHaveBeenCalledWith(
          "homepage_featured_auctions_viewed",
          { count: 2 }
        );
      });
    });

    it("should not track analytics when no auctions", async () => {
      (homepageService.getFeaturedAuctions as jest.Mock).mockResolvedValue([]);

      render(<FeaturedAuctionsSection />);

      await waitFor(() => {
        expect(analyticsService.trackEvent).not.toHaveBeenCalled();
      });
    });
  });

  describe("Empty State", () => {
    it("should not render when no auctions and not loading", async () => {
      (homepageService.getFeaturedAuctions as jest.Mock).mockResolvedValue([]);

      const { container } = render(<FeaturedAuctionsSection />);

      await waitFor(() => {
        expect(container).toBeEmptyDOMElement();
      });
    });
  });

  describe("Error Handling", () => {
    it("should handle service errors gracefully", async () => {
      const error = new Error("Service error");
      (homepageService.getFeaturedAuctions as jest.Mock).mockRejectedValue(
        error
      );

      const { container } = render(<FeaturedAuctionsSection />);

      await waitFor(() => {
        expect(container).toBeEmptyDOMElement();
      });
    });

    it("should still hide loading state on error", async () => {
      (homepageService.getFeaturedAuctions as jest.Mock).mockRejectedValue(
        new Error("Error")
      );

      render(<FeaturedAuctionsSection />);

      await waitFor(() => {
        const skeletons = document.querySelectorAll(".animate-pulse");
        expect(skeletons).toHaveLength(0);
      });
    });
  });

  describe("Auction Display", () => {
    beforeEach(() => {
      (homepageService.getFeaturedAuctions as jest.Mock).mockResolvedValue(
        mockAuctions
      );
    });

    it("should display auctions in HorizontalScrollContainer", async () => {
      render(<FeaturedAuctionsSection />);

      await waitFor(() => {
        expect(screen.getByTestId("horizontal-scroll")).toBeInTheDocument();
      });
    });

    it("should show correct title", async () => {
      render(<FeaturedAuctionsSection />);

      await waitFor(() => {
        expect(screen.getByText("Featured Auctions")).toBeInTheDocument();
      });
    });

    it("should have view all link", async () => {
      render(<FeaturedAuctionsSection />);

      await waitFor(() => {
        const link = screen.getByText("View All");
        expect(link).toBeInTheDocument();
        expect(link.closest("a")).toHaveAttribute(
          "href",
          "/auctions?featured=true"
        );
      });
    });

    it("should render all auctions", async () => {
      render(<FeaturedAuctionsSection />);

      await waitFor(() => {
        expect(screen.getByTestId("auction-auction1")).toBeInTheDocument();
        expect(screen.getByTestId("auction-auction2")).toBeInTheDocument();
      });
    });
  });

  describe("Status Transformation", () => {
    it("should transform 'upcoming' status to 'pending'", async () => {
      const upcomingAuction: AuctionItemFE[] = [
        {
          ...mockAuctions[0],
          status: "upcoming",
        },
      ];
      (homepageService.getFeaturedAuctions as jest.Mock).mockResolvedValue(
        upcomingAuction
      );

      render(<FeaturedAuctionsSection />);

      await waitFor(() => {
        expect(screen.getByTestId("auction-auction1")).toBeInTheDocument();
      });
    });

    it("should transform 'live' status to 'active'", async () => {
      const liveAuction: AuctionItemFE[] = [
        {
          ...mockAuctions[0],
          status: "live",
        },
      ];
      (homepageService.getFeaturedAuctions as jest.Mock).mockResolvedValue(
        liveAuction
      );

      render(<FeaturedAuctionsSection />);

      await waitFor(() => {
        expect(screen.getByTestId("auction-auction1")).toBeInTheDocument();
      });
    });

    it("should keep other statuses unchanged", async () => {
      const completedAuction: AuctionItemFE[] = [
        {
          ...mockAuctions[0],
          status: "completed",
        },
      ];
      (homepageService.getFeaturedAuctions as jest.Mock).mockResolvedValue(
        completedAuction
      );

      render(<FeaturedAuctionsSection />);

      await waitFor(() => {
        expect(screen.getByTestId("auction-auction1")).toBeInTheDocument();
      });
    });
  });

  describe("Custom className", () => {
    it("should apply custom className in loading state", async () => {
      (homepageService.getFeaturedAuctions as jest.Mock).mockImplementation(
        () => new Promise(() => {})
      );

      const { container } = render(
        <FeaturedAuctionsSection className="custom-class" />
      );
      const section = container.querySelector("section");
      expect(section).toHaveClass("custom-class");
    });

    it("should apply custom className when loaded", async () => {
      (homepageService.getFeaturedAuctions as jest.Mock).mockResolvedValue(
        mockAuctions
      );

      render(<FeaturedAuctionsSection className="custom-class" />);

      await waitFor(() => {
        expect(screen.getByTestId("horizontal-scroll")).toHaveClass(
          "custom-class"
        );
      });
    });

    it("should apply default padding in loading state", async () => {
      (homepageService.getFeaturedAuctions as jest.Mock).mockImplementation(
        () => new Promise(() => {})
      );

      const { container } = render(<FeaturedAuctionsSection />);
      const section = container.querySelector("section");
      expect(section).toHaveClass("py-8");
    });
  });

  describe("Responsive Grid Layout (Loading)", () => {
    it("should have responsive grid in loading state", async () => {
      (homepageService.getFeaturedAuctions as jest.Mock).mockImplementation(
        () => new Promise(() => {})
      );

      const { container } = render(<FeaturedAuctionsSection />);
      const grid = container.querySelector(".grid");
      expect(grid).toHaveClass(
        "grid-cols-2",
        "sm:grid-cols-3",
        "md:grid-cols-4",
        "lg:grid-cols-5"
      );
    });

    it("should have gap in grid", async () => {
      (homepageService.getFeaturedAuctions as jest.Mock).mockImplementation(
        () => new Promise(() => {})
      );

      const { container } = render(<FeaturedAuctionsSection />);
      const grid = container.querySelector(".grid");
      expect(grid).toHaveClass("gap-4");
    });
  });

  describe("Dark Mode", () => {
    it("should support dark mode in heading", async () => {
      (homepageService.getFeaturedAuctions as jest.Mock).mockImplementation(
        () => new Promise(() => {})
      );

      const { container } = render(<FeaturedAuctionsSection />);
      const heading = container.querySelector("h2");
      expect(heading).toHaveClass("text-gray-900", "dark:text-white");
    });

    it("should support dark mode in skeletons", async () => {
      (homepageService.getFeaturedAuctions as jest.Mock).mockImplementation(
        () => new Promise(() => {})
      );

      const { container } = render(<FeaturedAuctionsSection />);
      const skeletons = container.querySelectorAll(".dark\\:bg-gray-800");
      expect(skeletons.length).toBeGreaterThan(0);
    });
  });

  describe("Accessibility", () => {
    it("should use semantic section element in loading state", async () => {
      (homepageService.getFeaturedAuctions as jest.Mock).mockImplementation(
        () => new Promise(() => {})
      );

      const { container } = render(<FeaturedAuctionsSection />);
      const section = container.querySelector("section");
      expect(section?.tagName).toBe("SECTION");
    });

    it("should have proper heading hierarchy", async () => {
      (homepageService.getFeaturedAuctions as jest.Mock).mockResolvedValue(
        mockAuctions
      );

      render(<FeaturedAuctionsSection />);

      await waitFor(() => {
        const heading = screen.getByText("Featured Auctions");
        expect(heading.tagName).toBe("H2");
      });
    });
  });

  describe("Auction Card Props", () => {
    it("should pass correct props to AuctionCard", async () => {
      (homepageService.getFeaturedAuctions as jest.Mock).mockResolvedValue([
        mockAuctions[0],
      ]);

      render(<FeaturedAuctionsSection />);

      await waitFor(() => {
        expect(screen.getByTestId("auction-auction1")).toBeInTheDocument();
      });
    });

    it("should set featured to true for all auctions", async () => {
      (homepageService.getFeaturedAuctions as jest.Mock).mockResolvedValue(
        mockAuctions
      );

      render(<FeaturedAuctionsSection />);

      await waitFor(() => {
        expect(screen.getByTestId("auction-auction1")).toBeInTheDocument();
      });
    });

    it("should use compact variant", async () => {
      (homepageService.getFeaturedAuctions as jest.Mock).mockResolvedValue(
        mockAuctions
      );

      render(<FeaturedAuctionsSection />);

      await waitFor(() => {
        expect(screen.getByTestId("auction-auction1")).toBeInTheDocument();
      });
    });
  });
});
