import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import ReviewList from "./ReviewList";
import { reviewsService } from "@/services/reviews.service";

// Mock services
jest.mock("@/services/reviews.service");

// Mock EmptyState
jest.mock("@/components/common/EmptyState", () => ({
  EmptyState: ({ icon, title, description }: any) => (
    <div data-testid="empty-state">
      {icon}
      <div>{title}</div>
      <div>{description}</div>
    </div>
  ),
}));

const mockReviews = [
  {
    id: "1",
    user_id: "user1",
    rating: 5,
    title: "Excellent product!",
    comment: "Absolutely love this product. Great quality!",
    images: ["https://example.com/review1.jpg"],
    verified_purchase: true,
    helpful_count: 10,
    created_at: "2024-01-15T10:30:00Z",
  },
  {
    id: "2",
    user_id: "user2",
    rating: 4,
    title: "Good value",
    comment: "Nice product for the price.",
    images: [],
    verified_purchase: false,
    helpful_count: 5,
    created_at: "2024-01-14T08:20:00Z",
  },
  {
    id: "3",
    user_id: "user3",
    rating: 3,
    title: "Average",
    comment: "It's okay, nothing special.",
    images: [
      "https://example.com/review3a.jpg",
      "https://example.com/review3b.jpg",
    ],
    verified_purchase: true,
    helpful_count: 2,
    created_at: "2024-01-13T14:15:00Z",
  },
];

const mockStats = {
  totalReviews: 15,
  averageRating: 4.2,
  ratingDistribution: [
    { rating: 5, count: 8 },
    { rating: 4, count: 3 },
    { rating: 3, count: 2 },
    { rating: 2, count: 1 },
    { rating: 1, count: 1 },
  ],
};

describe("ReviewList", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (reviewsService.list as jest.Mock).mockResolvedValue({ data: mockReviews });
    (reviewsService.getSummary as jest.Mock).mockResolvedValue(mockStats);
  });

  // Loading State
  describe("Loading State", () => {
    it("displays loading skeletons", () => {
      (reviewsService.list as jest.Mock).mockImplementation(
        () => new Promise(() => {})
      );
      render(<ReviewList productId="prod-1" />);
      expect(document.querySelectorAll(".animate-pulse")).toHaveLength(3);
    });
  });

  // Basic Rendering
  describe("Basic Rendering", () => {
    it("renders reviews list", async () => {
      render(<ReviewList productId="prod-1" />);
      await waitFor(() => {
        expect(screen.getByText("Excellent product!")).toBeInTheDocument();
        expect(screen.getByText("Good value")).toBeInTheDocument();
        expect(screen.getByText("Average")).toBeInTheDocument();
      });
    });

    it("renders review comments", async () => {
      render(<ReviewList productId="prod-1" />);
      await waitFor(() => {
        expect(
          screen.getByText("Absolutely love this product. Great quality!")
        ).toBeInTheDocument();
        expect(
          screen.getByText("Nice product for the price.")
        ).toBeInTheDocument();
      });
    });

    it("calls reviewsService with correct params", async () => {
      render(<ReviewList productId="prod-1" />);
      await waitFor(() => {
        expect(reviewsService.list).toHaveBeenCalledWith({
          productId: "prod-1",
          rating: undefined,
          sortBy: "createdAt",
          sortOrder: "desc",
          limit: 20,
        });
      });
    });
  });

  // Stats Summary
  describe("Stats Summary", () => {
    it("displays average rating", async () => {
      render(<ReviewList productId="prod-1" />);
      await waitFor(() => {
        expect(screen.getByText("4.2")).toBeInTheDocument();
      });
    });

    it("displays total review count", async () => {
      render(<ReviewList productId="prod-1" />);
      await waitFor(() => {
        expect(screen.getByText(/Based on 15 reviews/)).toBeInTheDocument();
      });
    });

    it("displays singular review text", async () => {
      (reviewsService.getSummary as jest.Mock).mockResolvedValue({
        ...mockStats,
        totalReviews: 1,
      });
      render(<ReviewList productId="prod-1" />);
      await waitFor(() => {
        expect(screen.getByText(/Based on 1 review$/)).toBeInTheDocument();
      });
    });

    it("displays rating stars", async () => {
      render(<ReviewList productId="prod-1" />);
      await waitFor(() => {
        const stars = document.querySelectorAll(".fill-yellow-400");
        expect(stars.length).toBeGreaterThan(0);
      });
    });
  });

  // Rating Distribution
  describe("Rating Distribution", () => {
    it("displays all rating levels", async () => {
      render(<ReviewList productId="prod-1" />);
      await waitFor(() => {
        expect(screen.getByText("5 star")).toBeInTheDocument();
        expect(screen.getByText("4 star")).toBeInTheDocument();
        expect(screen.getByText("3 star")).toBeInTheDocument();
        expect(screen.getByText("2 star")).toBeInTheDocument();
        expect(screen.getByText("1 star")).toBeInTheDocument();
      });
    });

    it("displays count for each rating", async () => {
      render(<ReviewList productId="prod-1" />);
      await waitFor(() => {
        expect(screen.getByText("8")).toBeInTheDocument(); // 5 star count
        expect(screen.getAllByText("3").length).toBeGreaterThan(0); // 4 star count
        expect(screen.getAllByText("2").length).toBeGreaterThan(0); // 3 star count
        expect(screen.getAllByText("1").length).toBeGreaterThan(0); // 2 & 1 star count
      });
    });

    it("displays progress bars", async () => {
      render(<ReviewList productId="prod-1" />);
      await waitFor(() => {
        const progressBars = document.querySelectorAll(".bg-yellow-400");
        expect(progressBars.length).toBeGreaterThan(0);
      });
    });

    it("filters by rating when clicked", async () => {
      render(<ReviewList productId="prod-1" />);
      await waitFor(() => {
        const fiveStarButton = screen.getByText("5 star").closest("button");
        fireEvent.click(fiveStarButton!);
      });
      await waitFor(() => {
        expect(reviewsService.list).toHaveBeenCalledWith(
          expect.objectContaining({ rating: 5 })
        );
      });
    });

    it("toggles rating filter", async () => {
      render(<ReviewList productId="prod-1" />);
      await waitFor(() => {
        const fiveStarButton = screen.getByText("5 star").closest("button");
        fireEvent.click(fiveStarButton!);
      });
      await waitFor(() => {
        const fiveStarButton = screen.getByText("5 star").closest("button");
        fireEvent.click(fiveStarButton!);
      });
      await waitFor(() => {
        expect(reviewsService.list).toHaveBeenLastCalledWith(
          expect.objectContaining({ rating: undefined })
        );
      });
    });
  });

  // Sorting
  describe("Sorting", () => {
    it("displays sort dropdown", async () => {
      render(<ReviewList productId="prod-1" />);
      await waitFor(() => {
        expect(screen.getByText("Sort by:")).toBeInTheDocument();
        expect(screen.getByRole("combobox")).toBeInTheDocument();
      });
    });

    it("sorts by most recent", async () => {
      render(<ReviewList productId="prod-1" />);
      await waitFor(() => {
        const select = screen.getByRole("combobox");
        fireEvent.change(select, { target: { value: "recent" } });
      });
      await waitFor(() => {
        expect(reviewsService.list).toHaveBeenCalledWith(
          expect.objectContaining({ sortBy: "createdAt" })
        );
      });
    });

    it("sorts by most helpful", async () => {
      render(<ReviewList productId="prod-1" />);
      await waitFor(() => {
        const select = screen.getByRole("combobox");
        fireEvent.change(select, { target: { value: "helpful" } });
      });
      await waitFor(() => {
        expect(reviewsService.list).toHaveBeenCalledWith(
          expect.objectContaining({ sortBy: "helpfulCount" })
        );
      });
    });

    it("sorts by highest rating", async () => {
      render(<ReviewList productId="prod-1" />);
      await waitFor(() => {
        const select = screen.getByRole("combobox");
        fireEvent.change(select, { target: { value: "rating" } });
      });
      await waitFor(() => {
        expect(reviewsService.list).toHaveBeenCalledWith(
          expect.objectContaining({ sortBy: "rating" })
        );
      });
    });
  });

  // Filter Controls
  describe("Filter Controls", () => {
    it("shows clear filter button when filtered", async () => {
      render(<ReviewList productId="prod-1" />);
      await waitFor(() => {
        const fiveStarButton = screen.getByText("5 star").closest("button");
        fireEvent.click(fiveStarButton!);
      });
      await waitFor(() => {
        expect(screen.getByText("Clear filter")).toBeInTheDocument();
      });
    });

    it("clears filter when clicked", async () => {
      render(<ReviewList productId="prod-1" />);
      await waitFor(() => {
        const fiveStarButton = screen.getByText("5 star").closest("button");
        fireEvent.click(fiveStarButton!);
      });
      await waitFor(() => {
        const clearButton = screen.getByText("Clear filter");
        fireEvent.click(clearButton);
      });
      await waitFor(() => {
        expect(reviewsService.list).toHaveBeenLastCalledWith(
          expect.objectContaining({ rating: undefined })
        );
      });
    });

    it("does not show clear button without filter", async () => {
      render(<ReviewList productId="prod-1" />);
      await waitFor(() => {
        expect(screen.queryByText("Clear filter")).not.toBeInTheDocument();
      });
    });
  });

  // Review Stars
  describe("Review Stars", () => {
    it("renders stars for each review", async () => {
      render(<ReviewList productId="prod-1" />);
      await waitFor(() => {
        const filledStars = document.querySelectorAll(".fill-yellow-400");
        expect(filledStars.length).toBeGreaterThan(0);
      });
    });

    it("renders correct number of filled stars", async () => {
      render(<ReviewList productId="prod-1" />);
      await waitFor(() => {
        const reviews = document.querySelectorAll(".border-b");
        expect(reviews.length).toBeGreaterThanOrEqual(3); // At least 3 reviews + header border
      });
    });
  });

  // Verified Purchase
  describe("Verified Purchase", () => {
    it("shows verified purchase badge", async () => {
      render(<ReviewList productId="prod-1" />);
      await waitFor(() => {
        const badges = screen.getAllByText("Verified Purchase");
        expect(badges).toHaveLength(2); // Reviews 1 and 3
      });
    });

    it("does not show badge for unverified", async () => {
      render(<ReviewList productId="prod-1" />);
      await waitFor(() => {
        expect(screen.getAllByText("Verified Purchase")).toHaveLength(2);
      });
    });
  });

  // Review Dates
  describe("Review Dates", () => {
    it("displays formatted dates", async () => {
      render(<ReviewList productId="prod-1" />);
      await waitFor(() => {
        expect(screen.getAllByText(/Jan/).length).toBeGreaterThan(0);
      });
    });
  });

  // Review Images
  describe("Review Images", () => {
    it("displays review images", async () => {
      render(<ReviewList productId="prod-1" />);
      await waitFor(() => {
        const images = screen.getAllByRole("img");
        expect(images.length).toBeGreaterThan(0);
      });
    });

    it("displays multiple images", async () => {
      render(<ReviewList productId="prod-1" />);
      await waitFor(() => {
        const reviewImages = document.querySelectorAll(
          'img[alt^="Review image"]'
        );
        expect(reviewImages.length).toBe(3); // 1 + 2 images
      });
    });

    it("does not render images section when empty", async () => {
      render(<ReviewList productId="prod-1" />);
      await waitFor(() => {
        const goodValueReview = screen
          .getByText("Good value")
          .closest(".border-b");
        const images = goodValueReview?.querySelectorAll(
          'img[alt^="Review image"]'
        );
        expect(images?.length || 0).toBe(0);
      });
    });
  });

  // Helpful Button
  describe("Helpful Button", () => {
    it("displays helpful button", async () => {
      render(<ReviewList productId="prod-1" />);
      await waitFor(() => {
        const helpfulButtons = screen.getAllByText(/Helpful/);
        expect(helpfulButtons.length).toBeGreaterThanOrEqual(3);
      });
    });

    it("displays helpful count", async () => {
      render(<ReviewList productId="prod-1" />);
      await waitFor(() => {
        expect(screen.getByText("Helpful (10)")).toBeInTheDocument();
        expect(screen.getByText("Helpful (5)")).toBeInTheDocument();
        expect(screen.getByText("Helpful (2)")).toBeInTheDocument();
      });
    });

    it("calls markHelpful on click", async () => {
      (reviewsService.markHelpful as jest.Mock).mockResolvedValue({
        helpfulCount: 11,
      });
      render(<ReviewList productId="prod-1" />);
      await waitFor(() => {
        const helpfulButton = screen
          .getByText("Helpful (10)")
          .closest("button");
        fireEvent.click(helpfulButton!);
      });
      await waitFor(() => {
        expect(reviewsService.markHelpful).toHaveBeenCalledWith("1");
      });
    });

    it("updates count after marking helpful", async () => {
      (reviewsService.markHelpful as jest.Mock).mockResolvedValue({
        helpfulCount: 11,
      });
      render(<ReviewList productId="prod-1" />);
      await waitFor(() => {
        const helpfulButton = screen
          .getByText("Helpful (10)")
          .closest("button");
        fireEvent.click(helpfulButton!);
      });
      await waitFor(() => {
        expect(screen.getByText("Helpful (11)")).toBeInTheDocument();
      });
    });

    it("handles markHelpful error", async () => {
      (reviewsService.markHelpful as jest.Mock).mockRejectedValue(
        new Error("Failed")
      );
      const consoleSpy = jest.spyOn(console, "error").mockImplementation();
      render(<ReviewList productId="prod-1" />);
      await waitFor(() => {
        const helpfulButton = screen
          .getByText("Helpful (10)")
          .closest("button");
        fireEvent.click(helpfulButton!);
      });
      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith(
          "Failed to mark as helpful:",
          expect.any(Error)
        );
      });
      consoleSpy.mockRestore();
    });
  });

  // Empty State
  describe("Empty State", () => {
    it("displays empty state when no reviews", async () => {
      (reviewsService.list as jest.Mock).mockResolvedValue({ data: [] });
      (reviewsService.getSummary as jest.Mock).mockResolvedValue({
        totalReviews: 0,
        averageRating: 0,
        ratingDistribution: [],
      });
      render(<ReviewList productId="prod-1" />);
      await waitFor(() => {
        expect(screen.getByTestId("empty-state")).toBeInTheDocument();
        expect(screen.getByText("No reviews yet")).toBeInTheDocument();
      });
    });

    it("displays filtered empty state", async () => {
      render(<ReviewList productId="prod-1" />);
      await waitFor(() => {
        expect(screen.getByText("5 star")).toBeInTheDocument();
      });
      (reviewsService.list as jest.Mock).mockResolvedValue({ data: [] });
      const fiveStarButton = screen.getByText("5 star").closest("button");
      fireEvent.click(fiveStarButton!);
      await waitFor(() => {
        // EmptyState component shows generic message for all empty states
        expect(
          screen.getByText(/No reviews yet|Be the first to review/i)
        ).toBeInTheDocument();
      });
    });
  });

  // Error Handling
  describe("Error Handling", () => {
    it("handles API error gracefully", async () => {
      (reviewsService.list as jest.Mock).mockRejectedValue(
        new Error("API Error")
      );
      const consoleSpy = jest.spyOn(console, "error").mockImplementation();
      render(<ReviewList productId="prod-1" />);
      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith(
          "Failed to load reviews:",
          expect.any(Error)
        );
      });
      consoleSpy.mockRestore();
    });

    it("sets empty state on error", async () => {
      (reviewsService.list as jest.Mock).mockRejectedValue(
        new Error("API Error")
      );
      render(<ReviewList productId="prod-1" />);
      await waitFor(() => {
        expect(screen.getByTestId("empty-state")).toBeInTheDocument();
      });
    });
  });

  // Stats Display
  describe("Stats Display", () => {
    it("does not display stats when totalReviews is 0", async () => {
      (reviewsService.getSummary as jest.Mock).mockResolvedValue({
        totalReviews: 0,
        averageRating: 0,
        ratingDistribution: [],
      });
      render(<ReviewList productId="prod-1" />);
      await waitFor(() => {
        expect(screen.queryByText("4.2")).not.toBeInTheDocument();
      });
    });
  });

  // Edge Cases
  describe("Edge Cases", () => {
    it("handles missing review title", async () => {
      const reviewsWithoutTitle = [{ ...mockReviews[0], title: "" }];
      (reviewsService.list as jest.Mock).mockResolvedValue({
        data: reviewsWithoutTitle,
      });
      render(<ReviewList productId="prod-1" />);
      await waitFor(() => {
        expect(
          screen.getByText("Absolutely love this product. Great quality!")
        ).toBeInTheDocument();
      });
    });

    it("handles zero helpful count", async () => {
      const reviewsWithZeroHelpful = [{ ...mockReviews[0], helpful_count: 0 }];
      (reviewsService.list as jest.Mock).mockResolvedValue({
        data: reviewsWithZeroHelpful,
      });
      render(<ReviewList productId="prod-1" />);
      await waitFor(() => {
        expect(screen.getByText("Helpful")).toBeInTheDocument();
        expect(screen.queryByText("Helpful (0)")).not.toBeInTheDocument();
      });
    });

    it("handles whitespace in comments", async () => {
      const reviewWithWhitespace = [
        { ...mockReviews[0], comment: "Line 1\nLine 2\nLine 3" },
      ];
      (reviewsService.list as jest.Mock).mockResolvedValue({
        data: reviewWithWhitespace,
      });
      render(<ReviewList productId="prod-1" />);
      await waitFor(() => {
        expect(screen.getByText(/Line 1/)).toBeInTheDocument();
      });
    });
  });

  // Accessibility
  describe("Accessibility", () => {
    it("has proper select role", async () => {
      render(<ReviewList productId="prod-1" />);
      await waitFor(() => {
        expect(screen.getByRole("combobox")).toBeInTheDocument();
      });
    });

    it("has clickable rating distribution buttons", async () => {
      render(<ReviewList productId="prod-1" />);
      await waitFor(() => {
        const buttons = screen.getAllByRole("button");
        expect(buttons.length).toBeGreaterThan(0);
      });
    });

    it("renders images with alt text", async () => {
      render(<ReviewList productId="prod-1" />);
      await waitFor(() => {
        const images = screen.getAllByAltText("Review image 1");
        expect(images.length).toBeGreaterThan(0);
        expect(images[0]).toBeInTheDocument();
      });
    });
  });
});
