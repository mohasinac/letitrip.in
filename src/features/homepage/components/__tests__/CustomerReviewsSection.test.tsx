import { render, screen } from "@testing-library/react";
import { CustomerReviewsSection } from "../CustomerReviewsSection";

// Mock useApiQuery and useSwipe
const mockUseApiQuery = jest.fn();
jest.mock("@/hooks", () => ({
  ...jest.requireActual("@/hooks"),
  ...jest.requireActual("@/hooks"),
  useApiQuery: (...args: unknown[]) => mockUseApiQuery(...args),
  useHomepageReviews: (...args: unknown[]) => mockUseApiQuery(...args),
  useSwipe: () => ({ onTouchStart: jest.fn(), onTouchEnd: jest.fn() }),
}));

jest.mock("next-intl", () => ({
  useTranslations: () => (key: string, params?: Record<string, unknown>) => {
    const map: Record<string, string> = {
      whatOurCustomersSay: "What Our Customers Say",
      reviewsSubtitle: "Read reviews from satisfied customers",
      seeAllReviews: "See All Reviews",
      anonymous: "Anonymous",
      verified: "Verified Purchase",
      featured: "Featured",
      viewItem: "View Item",
    };
    if (key === "moreImages") return `+${params?.count ?? 0} more`;
    return map[key] ?? key;
  },
}));

jest.mock("next/image", () => ({
  __esModule: true,
  default: ({ alt, src }: any) => <img alt={alt} src={src} />,
}));

jest.mock("@/i18n/navigation", () => ({
  Link: ({ children, href }: any) => <a href={href}>{children}</a>,
  useRouter: () => ({ push: jest.fn() }),
  usePathname: () => "/",
  redirect: jest.fn(),
}));

const mockReviews = [
  {
    id: "1",
    userId: "u1",
    userName: "Alice Johnson",
    userAvatar: "/avatar/alice.jpg",
    productId: "p1",
    productTitle: "Wireless Earbuds",
    rating: 5,
    title: "Great!",
    comment: "Amazing sound quality!",
    status: "approved",
    helpfulCount: 0,
    reportCount: 0,
    verified: true,
    createdAt: new Date("2026-02-01"),
    updatedAt: new Date("2026-02-01"),
  },
  {
    id: "2",
    userId: "u2",
    userName: "Bob Smith",
    productId: "p2",
    productTitle: "Smart Watch",
    rating: 4,
    title: "Good",
    comment: "Great features but battery could be better.",
    status: "approved",
    helpfulCount: 0,
    reportCount: 0,
    verified: false,
    createdAt: new Date("2026-01-28"),
    updatedAt: new Date("2026-01-28"),
  },
  {
    id: "3",
    userId: "u3",
    userName: "Carol Davis",
    userAvatar: "/avatar/carol.jpg",
    productId: "p3",
    productTitle: "Running Shoes",
    rating: 3,
    title: "Okay",
    comment: "Decent quality for the price.",
    status: "approved",
    helpfulCount: 0,
    reportCount: 0,
    verified: false,
    createdAt: new Date("2026-01-25"),
    updatedAt: new Date("2026-01-25"),
  },
];

describe("CustomerReviewsSection", () => {
  beforeEach(() => {
    mockUseApiQuery.mockReset();
  });

  // ====================================
  // Loading State
  // ====================================
  describe("Loading State", () => {
    it("renders loading skeleton when loading", () => {
      mockUseApiQuery.mockReturnValue({ data: null, isLoading: true });
      const { container } = render(<CustomerReviewsSection />);
      expect(
        container.querySelectorAll(".animate-pulse").length,
      ).toBeGreaterThan(0);
    });
  });

  // ====================================
  // No Data State
  // ====================================
  describe("No Data State", () => {
    it("returns null when no reviews", () => {
      mockUseApiQuery.mockReturnValue({
        data: [],
        isLoading: false,
      });
      const { container } = render(<CustomerReviewsSection />);
      expect(container.innerHTML).toBe("");
    });

    it("returns null when reviews array is missing", () => {
      mockUseApiQuery.mockReturnValue({ data: null, isLoading: false });
      const { container } = render(<CustomerReviewsSection />);
      expect(container.innerHTML).toBe("");
    });
  });

  // ====================================
  // Content Rendering
  // ====================================
  describe("Content Rendering", () => {
    beforeEach(() => {
      mockUseApiQuery.mockReturnValue({
        data: mockReviews,
        isLoading: false,
      });
    });

    it('renders "What Our Customers Say" heading', () => {
      render(<CustomerReviewsSection />);
      expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent(
        "What Our Customers Say",
      );
    });

    it("renders subtitle", () => {
      render(<CustomerReviewsSection />);
      expect(
        screen.getByText("Read reviews from satisfied customers"),
      ).toBeInTheDocument();
    });

    it("renders reviewer names", () => {
      render(<CustomerReviewsSection />);
      expect(screen.getByText("Alice Johnson")).toBeInTheDocument();
      expect(screen.getByText("Bob Smith")).toBeInTheDocument();
      expect(screen.getByText("Carol Davis")).toBeInTheDocument();
    });

    it("renders review comments", () => {
      render(<CustomerReviewsSection />);
      expect(screen.getByText(/Amazing sound quality!/)).toBeInTheDocument();
      expect(
        screen.getByText(/Great features but battery could be better\./),
      ).toBeInTheDocument();
      expect(
        screen.getByText(/Decent quality for the price\./),
      ).toBeInTheDocument();
    });

    it("renders product titles as links", () => {
      render(<CustomerReviewsSection />);
      expect(screen.getByText("Wireless Earbuds")).toBeInTheDocument();
      expect(screen.getByText("Smart Watch")).toBeInTheDocument();
      expect(screen.getByText("Running Shoes")).toBeInTheDocument();
    });
  });

  // ====================================
  // Star Ratings
  // ====================================
  describe("Star Ratings", () => {
    it("renders 1 rating star badge per review card", () => {
      mockUseApiQuery.mockReturnValue({
        data: mockReviews,
        isLoading: false,
      });
      const { container } = render(<CustomerReviewsSection />);
      const stars = container.querySelectorAll("svg.w-3\\.5.h-3\\.5");
      // 3 reviews × 1 star each = 3
      expect(stars).toHaveLength(3);
    });

    it("displays numeric rating next to star", () => {
      mockUseApiQuery.mockReturnValue({
        data: mockReviews,
        isLoading: false,
      });
      render(<CustomerReviewsSection />);
      // Alice: 5, Bob: 4, Carol: 3
      expect(screen.getByText("5")).toBeInTheDocument();
      expect(screen.getByText("4")).toBeInTheDocument();
      expect(screen.getByText("3")).toBeInTheDocument();
    });
  });

  // ====================================
  // User Avatars
  // ====================================
  describe("User Avatars", () => {
    it("renders avatar images when provided", () => {
      mockUseApiQuery.mockReturnValue({
        data: mockReviews,
        isLoading: false,
      });
      render(<CustomerReviewsSection />);
      const images = screen.getAllByRole("img");
      // Alice and Carol have avatars
      expect(images).toHaveLength(2);
    });

    it("renders initial letter when no avatar", () => {
      mockUseApiQuery.mockReturnValue({
        data: mockReviews,
        isLoading: false,
      });
      render(<CustomerReviewsSection />);
      // Bob has no avatar, should show "B"
      expect(screen.getByText("B")).toBeInTheDocument();
    });
  });

  // ====================================
  // Accessibility
  // ====================================
  describe("Accessibility", () => {
    beforeEach(() => {
      mockUseApiQuery.mockReturnValue({
        data: mockReviews,
        isLoading: false,
      });
    });

    it("uses h2 for section heading", () => {
      render(<CustomerReviewsSection />);
      expect(screen.getByRole("heading", { level: 2 })).toBeInTheDocument();
    });

    it("renders as a section element", () => {
      const { container } = render(<CustomerReviewsSection />);
      expect(container.querySelector("section")).toBeInTheDocument();
    });

    it("all reviewer names are visible", () => {
      render(<CustomerReviewsSection />);
      expect(screen.getByText("Alice Johnson")).toBeVisible();
      expect(screen.getByText("Bob Smith")).toBeVisible();
    });
  });
});
