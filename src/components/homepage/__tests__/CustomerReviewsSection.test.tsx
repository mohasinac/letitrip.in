import { render, screen } from "@testing-library/react";
import { CustomerReviewsSection } from "../CustomerReviewsSection";

// Mock useApiQuery
const mockUseApiQuery = jest.fn();
jest.mock("@/hooks", () => ({
  useApiQuery: (...args: unknown[]) => mockUseApiQuery(...args),
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
    comment: "Amazing sound quality!",
    createdAt: "2026-02-01",
  },
  {
    id: "2",
    userId: "u2",
    userName: "Bob Smith",
    productId: "p2",
    productTitle: "Smart Watch",
    rating: 4,
    comment: "Great features but battery could be better.",
    createdAt: "2026-01-28",
  },
  {
    id: "3",
    userId: "u3",
    userName: "Carol Davis",
    userAvatar: "/avatar/carol.jpg",
    productId: "p3",
    productTitle: "Running Shoes",
    rating: 3,
    comment: "Decent quality for the price.",
    createdAt: "2026-01-25",
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

    it("renders review comments in quotes", () => {
      render(<CustomerReviewsSection />);
      expect(screen.getByText(/"Amazing sound quality!"/)).toBeInTheDocument();
      expect(
        screen.getByText(/"Great features but battery could be better."/),
      ).toBeInTheDocument();
      expect(
        screen.getByText(/"Decent quality for the price."/),
      ).toBeInTheDocument();
    });

    it("renders product titles", () => {
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
    it("renders 5 star SVGs per review", () => {
      mockUseApiQuery.mockReturnValue({
        data: mockReviews,
        isLoading: false,
      });
      const { container } = render(<CustomerReviewsSection />);
      const stars = container.querySelectorAll("svg.w-5.h-5");
      // 3 reviews × 5 stars = 15
      expect(stars).toHaveLength(15);
    });

    it("applies yellow color to filled stars and gray to empty", () => {
      mockUseApiQuery.mockReturnValue({
        data: mockReviews,
        isLoading: false,
      });
      const { container } = render(<CustomerReviewsSection />);
      const yellowStars = container.querySelectorAll("svg.text-yellow-500");
      // Alice: 5, Bob: 4, Carol: 3 = 12 yellow stars
      expect(yellowStars).toHaveLength(12);
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
      expect(images[0]).toHaveAttribute("alt", "Alice Johnson");
      expect(images[1]).toHaveAttribute("alt", "Carol Davis");
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
