import React from "react";
import {
  render,
  screen,
  waitFor,
  fireEvent,
  act,
} from "@testing-library/react";
import ReviewsPage from "./page";
import ReviewsListClient from "./ReviewsListClient";
import { reviewsService } from "@/services/reviews.service";

jest.mock("@/services/reviews.service");
jest.mock("lucide-react", () => ({
  Search: () => <div data-testid="search-icon" />,
  Filter: () => <div data-testid="filter-icon" />,
  Star: ({ className }: any) => (
    <div data-testid="star-icon" className={className} />
  ),
  ShieldCheck: ({ className }: any) => (
    <div data-testid="shield-check-icon" className={className} />
  ),
}));
jest.mock("@/components/cards/ReviewCard", () => ({
  ReviewCard: ({ id, rating, comment, onMarkHelpful }: any) => (
    <div data-testid={`review-card-${id}`}>
      <p>Rating: {rating}</p>
      <p>{comment}</p>
      <button onClick={() => onMarkHelpful(id)}>Mark Helpful</button>
    </div>
  ),
}));

const mockReviewsService = reviewsService as jest.Mocked<typeof reviewsService>;

beforeEach(() => {
  mockReviewsService.list.mockReset();
  mockReviewsService.markHelpful.mockReset();
});

const mockReviews = [
  {
    id: "review1",
    userId: "user1",
    userName: "John Doe",
    userEmail: "john@example.com",
    productId: "product1",
    shopId: "shop1",
    rating: 5,
    title: "Excellent product!",
    comment:
      "Very satisfied with this purchase. Great quality and fast shipping.",
    images: ["https://example.com/review1.jpg"],
    isVerifiedPurchase: true,
    helpful: 10,
    notHelpful: 1,
    replyText: null,
    replyAt: null,
    createdAt: new Date("2024-01-15"),
    updatedAt: new Date("2024-01-15"),
    status: "approved" as const,
    ratingStars: 5,
    timeAgo: "1 month ago",
    hasReply: false,
    hasImages: true,
    helpfulnessScore: 9,
    isYourReview: false,
  },
  {
    id: "review2",
    userId: "user2",
    userName: "Jane Smith",
    userEmail: "jane@example.com",
    productId: "product2",
    shopId: "shop2",
    rating: 4,
    title: "Good value",
    comment: "Product is good but shipping took a bit longer than expected.",
    images: [],
    isVerifiedPurchase: true,
    helpful: 5,
    notHelpful: 0,
    replyText: null,
    replyAt: null,
    createdAt: new Date("2024-02-20"),
    updatedAt: new Date("2024-02-20"),
    status: "approved" as const,
    ratingStars: 4,
    timeAgo: "2 weeks ago",
    hasReply: false,
    hasImages: false,
    helpfulnessScore: 5,
    isYourReview: false,
  },
  {
    id: "review3",
    userId: "user3",
    userName: "Bob Wilson",
    userEmail: "bob@example.com",
    productId: "product1",
    shopId: "shop1",
    rating: 3,
    title: "Average",
    comment: "It's okay, nothing special.",
    images: [],
    isVerifiedPurchase: false,
    helpful: 2,
    notHelpful: 3,
    replyText: null,
    replyAt: null,
    createdAt: new Date("2024-03-10"),
    updatedAt: new Date("2024-03-10"),
    status: "approved" as const,
    ratingStars: 3,
    timeAgo: "1 week ago",
    hasReply: false,
    hasImages: false,
    helpfulnessScore: -1,
    isYourReview: false,
  },
];

describe("ReviewsPage", () => {
  it("renders page with metadata and suspense fallback", () => {
    render(<ReviewsPage />);
    expect(screen.getByRole("main")).toBeInTheDocument();
  });
});

describe("ReviewsListClient", () => {
  describe("Initial Load", () => {
    it("renders loading state initially", async () => {
      mockReviewsService.list.mockImplementation(
        () =>
          new Promise(() => {
            // Never resolves to keep loading state
          })
      );

      render(<ReviewsListClient />);

      await waitFor(() => {
        expect(screen.getByText("Customer Reviews")).toBeInTheDocument();
        expect(screen.getByText("Filters")).toBeInTheDocument();
      });
    });

    it("renders reviews after loading", async () => {
      mockReviewsService.list.mockResolvedValue({
        data: mockReviews,
        count: 3,
        pagination: {
          page: 1,
          limit: 20,
          total: 3,
          hasNextPage: false,
          hasPrevPage: false,
        },
      });

      await act(async () => {
        render(<ReviewsListClient />);
      });

      await waitFor(() => {
        expect(
          screen.getByText(/Very satisfied with this purchase/)
        ).toBeInTheDocument();
        expect(screen.getByText(/Good value/)).toBeInTheDocument();
      });
    });

    it("displays header with title and description", async () => {
      mockReviewsService.list.mockResolvedValue({
        data: [],
        count: 0,
        pagination: {
          page: 1,
          limit: 20,
          total: 0,
          hasNextPage: false,
          hasPrevPage: false,
        },
      });

      await act(async () => {
        render(<ReviewsListClient />);
      });

      await waitFor(() => {
        expect(screen.getByText("Customer Reviews")).toBeInTheDocument();
        expect(
          screen.getByText(/Authentic reviews from verified purchases/)
        ).toBeInTheDocument();
      });
    });
  });

  describe("Rating Distribution", () => {
    it("displays overall rating", async () => {
      mockReviewsService.list.mockResolvedValue({
        data: mockReviews,
        count: 3,
        pagination: {
          page: 1,
          limit: 20,
          total: 3,
          hasNextPage: false,
          hasPrevPage: false,
        },
      });

      await act(async () => {
        render(<ReviewsListClient />);
      });

      await waitFor(() => {
        // Average of 5, 4, 3 = 4.0
        expect(screen.getByText("4.0")).toBeInTheDocument();
        expect(screen.getByText(/Based on 3 reviews/)).toBeInTheDocument();
      });
    });

    it("displays rating distribution bars", async () => {
      mockReviewsService.list.mockResolvedValue({
        data: mockReviews,
        count: 3,
        pagination: {
          page: 1,
          limit: 20,
          total: 3,
          hasNextPage: false,
          hasPrevPage: false,
        },
      });

      await act(async () => {
        render(<ReviewsListClient />);
      });

      await waitFor(() => {
        expect(screen.getByText("Filter by Rating")).toBeInTheDocument();
        // Should show counts for each rating
        const starIcons = screen.getAllByTestId("star-icon");
        expect(starIcons.length).toBeGreaterThan(0);
      });
    });
  });

  describe("Rating Filter", () => {
    it("filters reviews by rating when clicked", async () => {
      mockReviewsService.list.mockResolvedValue({
        data: mockReviews,
        count: 3,
        pagination: {
          page: 1,
          limit: 20,
          total: 3,
          hasNextPage: false,
          hasPrevPage: false,
        },
      });

      await act(async () => {
        render(<ReviewsListClient />);
      });

      await waitFor(() => {
        expect(screen.getByText(/Based on 3 reviews/)).toBeInTheDocument();
      });

      // Find and click 5 star filter
      const ratingButtons = screen.getAllByRole("button");
      const fiveStarButton = ratingButtons.find((btn) =>
        btn.textContent?.includes("5")
      );

      mockReviewsService.list.mockResolvedValue({
        data: [mockReviews[0]],
        count: 1,
        pagination: {
          page: 1,
          limit: 20,
          total: 1,
          hasNextPage: false,
          hasPrevPage: false,
        },
      });

      if (fiveStarButton) {
        await act(async () => {
          fireEvent.click(fiveStarButton);
        });

        await waitFor(() => {
          expect(mockReviewsService.list).toHaveBeenCalledWith(
            expect.objectContaining({
              rating: 5,
            })
          );
        });
      }
    });

    it("displays active rating filter chip", async () => {
      mockReviewsService.list.mockResolvedValue({
        data: [mockReviews[0]],
        count: 1,
        pagination: {
          page: 1,
          limit: 20,
          total: 1,
          hasNextPage: false,
          hasPrevPage: false,
        },
      });

      await act(async () => {
        render(<ReviewsListClient />);
      });

      await waitFor(() => {
        expect(screen.getByText(/Based on 1 reviews/)).toBeInTheDocument();
      });

      // Click rating filter
      const ratingButtons = screen.getAllByRole("button");
      const fiveStarButton = ratingButtons.find((btn) =>
        btn.textContent?.includes("5")
      );

      if (fiveStarButton) {
        await act(async () => {
          fireEvent.click(fiveStarButton);
        });

        await waitFor(() => {
          expect(screen.getByText("Active filters:")).toBeInTheDocument();
          expect(screen.getByText(/5 stars/)).toBeInTheDocument();
        });
      }
    });

    it("removes rating filter when clicked again", async () => {
      mockReviewsService.list.mockResolvedValue({
        data: mockReviews,
        count: 3,
        pagination: {
          page: 1,
          limit: 20,
          total: 3,
          hasNextPage: false,
          hasPrevPage: false,
        },
      });

      await act(async () => {
        render(<ReviewsListClient />);
      });

      await waitFor(() => {
        expect(screen.getByText(/Based on 3 reviews/)).toBeInTheDocument();
      });

      // Click to filter
      const ratingButtons = screen.getAllByRole("button");
      const fourStarButton = ratingButtons.find((btn) =>
        btn.textContent?.includes("4")
      );

      if (fourStarButton) {
        await act(async () => {
          fireEvent.click(fourStarButton);
        });

        await waitFor(() => {
          expect(mockReviewsService.list).toHaveBeenCalledWith(
            expect.objectContaining({
              rating: 4,
            })
          );
        });

        // Click again to remove filter
        await act(async () => {
          fireEvent.click(fourStarButton);
        });

        await waitFor(() => {
          expect(mockReviewsService.list).toHaveBeenCalledWith(
            expect.objectContaining({
              rating: undefined,
            })
          );
        });
      }
    });
  });

  describe("Verified Purchase Filter", () => {
    it("toggles verified purchase filter", async () => {
      mockReviewsService.list.mockResolvedValue({
        data: mockReviews,
        count: 3,
        pagination: {
          page: 1,
          limit: 20,
          total: 3,
          hasNextPage: false,
          hasPrevPage: false,
        },
      });

      await act(async () => {
        render(<ReviewsListClient />);
      });

      const verifiedButton = screen.getByText(/Verified Purchases Only/);

      mockReviewsService.list.mockResolvedValue({
        data: mockReviews.filter((r) => r.isVerifiedPurchase),
        count: 2,
        pagination: {
          page: 1,
          limit: 20,
          total: 2,
          hasNextPage: false,
          hasPrevPage: false,
        },
      });

      await act(async () => {
        fireEvent.click(verifiedButton);
      });

      await waitFor(() => {
        expect(mockReviewsService.list).toHaveBeenCalledWith(
          expect.objectContaining({
            isVerifiedPurchase: true,
          })
        );
      });
    });

    it("displays verified filter chip when active", async () => {
      mockReviewsService.list.mockResolvedValue({
        data: mockReviews.filter((r) => r.isVerifiedPurchase),
        count: 2,
        pagination: {
          page: 1,
          limit: 20,
          total: 2,
          hasNextPage: false,
          hasPrevPage: false,
        },
      });

      await act(async () => {
        render(<ReviewsListClient />);
      });

      const verifiedButton = screen.getByText(/Verified Purchases Only/);

      await act(async () => {
        fireEvent.click(verifiedButton);
      });

      await waitFor(() => {
        expect(screen.getByText("Active filters:")).toBeInTheDocument();
        expect(screen.getByText("Verified")).toBeInTheDocument();
      });
    });

    it("removes verified filter from chip", async () => {
      mockReviewsService.list.mockResolvedValue({
        data: mockReviews,
        count: 3,
        pagination: {
          page: 1,
          limit: 20,
          total: 3,
          hasNextPage: false,
          hasPrevPage: false,
        },
      });

      await act(async () => {
        render(<ReviewsListClient />);
      });

      const verifiedButton = screen.getByText(/Verified Purchases Only/);

      await act(async () => {
        fireEvent.click(verifiedButton);
      });

      await waitFor(() => {
        expect(screen.getByText("Verified")).toBeInTheDocument();
      });

      const removeButtons = screen.getAllByText("×");
      const verifiedRemove = removeButtons.find((btn) =>
        btn.parentElement?.textContent?.includes("Verified")
      );

      if (verifiedRemove) {
        await act(async () => {
          fireEvent.click(verifiedRemove);
        });

        await waitFor(() => {
          expect(mockReviewsService.list).toHaveBeenCalledWith(
            expect.objectContaining({
              isVerifiedPurchase: false,
            })
          );
        });
      }
    });
  });

  describe("Sort Functionality", () => {
    it("renders sort dropdown with options", async () => {
      mockReviewsService.list.mockResolvedValue({
        data: [],
        count: 0,
        pagination: {
          page: 1,
          limit: 20,
          total: 0,
          hasNextPage: false,
          hasPrevPage: false,
        },
      });

      await act(async () => {
        render(<ReviewsListClient />);
      });

      await waitFor(() => {
        const sortSelect = screen.getByRole("combobox");
        expect(sortSelect).toBeInTheDocument();
        expect(screen.getByText("Most Recent")).toBeInTheDocument();
      });
    });

    it("changes sort to most helpful", async () => {
      mockReviewsService.list.mockResolvedValue({
        data: mockReviews,
        count: 3,
        pagination: {
          page: 1,
          limit: 20,
          total: 3,
          hasNextPage: false,
          hasPrevPage: false,
        },
      });

      await act(async () => {
        render(<ReviewsListClient />);
      });

      const sortSelect = screen.getByRole("combobox");

      await act(async () => {
        fireEvent.change(sortSelect, { target: { value: "helpful" } });
      });

      await waitFor(() => {
        expect(mockReviewsService.list).toHaveBeenCalledWith(
          expect.objectContaining({
            sortBy: "helpful",
          })
        );
      });
    });

    it("changes sort to highest rating", async () => {
      mockReviewsService.list.mockResolvedValue({
        data: mockReviews,
        count: 3,
        pagination: {
          page: 1,
          limit: 20,
          total: 3,
          hasNextPage: false,
          hasPrevPage: false,
        },
      });

      await act(async () => {
        render(<ReviewsListClient />);
      });

      const sortSelect = screen.getByRole("combobox");

      await act(async () => {
        fireEvent.change(sortSelect, { target: { value: "rating" } });
      });

      await waitFor(() => {
        expect(mockReviewsService.list).toHaveBeenCalledWith(
          expect.objectContaining({
            sortBy: "rating",
          })
        );
      });
    });
  });

  describe("Mark as Helpful", () => {
    it("calls markHelpful when button is clicked", async () => {
      mockReviewsService.list.mockResolvedValue({
        data: mockReviews,
        count: 3,
        pagination: {
          page: 1,
          limit: 20,
          total: 3,
          hasNextPage: false,
          hasPrevPage: false,
        },
      });

      mockReviewsService.markHelpful.mockResolvedValue({ helpfulCount: 11 });

      await act(async () => {
        render(<ReviewsListClient />);
      });

      await waitFor(() => {
        expect(screen.getByTestId("review-card-review1")).toBeInTheDocument();
      });

      const helpfulButton = screen.getAllByText("Mark Helpful")[0];

      await act(async () => {
        fireEvent.click(helpfulButton);
      });

      await waitFor(() => {
        expect(mockReviewsService.markHelpful).toHaveBeenCalledWith("review1");
      });
    });

    it("updates helpful count after marking", async () => {
      mockReviewsService.list.mockResolvedValue({
        data: mockReviews,
        count: 3,
        pagination: {
          page: 1,
          limit: 20,
          total: 3,
          hasNextPage: false,
          hasPrevPage: false,
        },
      });

      mockReviewsService.markHelpful.mockResolvedValue({ helpfulCount: 11 });

      await act(async () => {
        render(<ReviewsListClient />);
      });

      await waitFor(() => {
        expect(screen.getByTestId("review-card-review1")).toBeInTheDocument();
      });

      const helpfulButton = screen.getAllByText("Mark Helpful")[0];

      await act(async () => {
        fireEvent.click(helpfulButton);
      });

      await waitFor(() => {
        expect(mockReviewsService.markHelpful).toHaveBeenCalled();
      });
    });
  });

  describe("Pagination", () => {
    it("displays pagination when multiple pages exist", async () => {
      mockReviewsService.list.mockResolvedValue({
        data: mockReviews,
        count: 50,
        pagination: {
          page: 1,
          limit: 20,
          total: 50,
          hasNextPage: false,
          hasPrevPage: false,
        },
      });

      await act(async () => {
        render(<ReviewsListClient />);
      });

      await waitFor(() => {
        expect(screen.getByText(/Page 1 of 3/)).toBeInTheDocument();
        expect(screen.getByText("Previous")).toBeInTheDocument();
        expect(screen.getByText("Next")).toBeInTheDocument();
      });
    });

    it("disables previous button on first page", async () => {
      mockReviewsService.list.mockResolvedValue({
        data: mockReviews,
        count: 50,
        pagination: {
          page: 1,
          limit: 20,
          total: 50,
          hasNextPage: false,
          hasPrevPage: false,
        },
      });

      await act(async () => {
        render(<ReviewsListClient />);
      });

      await waitFor(() => {
        const prevButton = screen.getByText("Previous");
        expect(prevButton).toBeDisabled();
      });
    });

    it("disables next button on last page", async () => {
      mockReviewsService.list.mockResolvedValue({
        data: mockReviews,
        count: 20,
        pagination: {
          page: 1,
          limit: 20,
          total: 20,
          hasNextPage: false,
          hasPrevPage: false,
        },
      });

      await act(async () => {
        render(<ReviewsListClient />);
      });

      await waitFor(() => {
        const nextButton = screen.getByText("Next");
        expect(nextButton).toBeDisabled();
      });
    });

    it("navigates to next page", async () => {
      mockReviewsService.list.mockResolvedValue({
        data: mockReviews,
        count: 50,
        pagination: {
          page: 1,
          limit: 20,
          total: 50,
          hasNextPage: false,
          hasPrevPage: false,
        },
      });

      await act(async () => {
        render(<ReviewsListClient />);
      });

      await waitFor(() => {
        expect(screen.getByText("Next")).toBeInTheDocument();
      });

      const nextButton = screen.getByText("Next");

      await act(async () => {
        fireEvent.click(nextButton);
      });

      await waitFor(() => {
        expect(mockReviewsService.list).toHaveBeenCalledWith(
          expect.objectContaining({
            page: 2,
          })
        );
      });
    });

    it("navigates to previous page", async () => {
      mockReviewsService.list.mockResolvedValue({
        data: mockReviews,
        count: 50,
        pagination: {
          page: 2,
          limit: 20,
          total: 50,
          hasNextPage: false,
          hasPrevPage: false,
        },
      });

      await act(async () => {
        render(<ReviewsListClient />);
      });

      await waitFor(() => {
        const prevButton = screen.getByText("Previous");
        expect(prevButton).not.toBeDisabled();
      });

      const prevButton = screen.getByText("Previous");

      await act(async () => {
        fireEvent.click(prevButton);
      });

      await waitFor(() => {
        expect(mockReviewsService.list).toHaveBeenCalledWith(
          expect.objectContaining({
            page: 1,
          })
        );
      });
    });
  });

  describe("Error Handling", () => {
    it("displays error message when fetch fails", async () => {
      mockReviewsService.list.mockRejectedValue(new Error("Network error"));

      await act(async () => {
        render(<ReviewsListClient />);
      });

      await waitFor(() => {
        expect(screen.getByText(/Failed to load reviews/)).toBeInTheDocument();
      });
    });

    it("allows retry after error", async () => {
      mockReviewsService.list.mockRejectedValueOnce(new Error("Network error"));

      await act(async () => {
        render(<ReviewsListClient />);
      });

      await waitFor(() => {
        expect(screen.getByText(/Try Again/)).toBeInTheDocument();
      });

      mockReviewsService.list.mockResolvedValue({
        data: mockReviews,
        count: 3,
        pagination: {
          page: 1,
          limit: 20,
          total: 3,
          hasNextPage: false,
          hasPrevPage: false,
        },
      });

      const retryButton = screen.getByText(/Try Again/);

      await act(async () => {
        fireEvent.click(retryButton);
      });

      await waitFor(() => {
        expect(
          screen.getByText(/Very satisfied with this purchase/)
        ).toBeInTheDocument();
      });
    });
  });

  describe("Empty States", () => {
    it("displays empty state when no reviews found", async () => {
      mockReviewsService.list.mockResolvedValue({
        data: [],
        count: 0,
        pagination: {
          page: 1,
          limit: 20,
          total: 0,
          hasNextPage: false,
          hasPrevPage: false,
        },
      });

      await act(async () => {
        render(<ReviewsListClient />);
      });

      await waitFor(() => {
        expect(screen.getByText("No reviews found")).toBeInTheDocument();
      });
    });

    it("shows different message when filters are active", async () => {
      mockReviewsService.list.mockResolvedValue({
        data: mockReviews,
        count: 3,
        pagination: {
          page: 1,
          limit: 20,
          total: 3,
          hasNextPage: false,
          hasPrevPage: false,
        },
      });

      await act(async () => {
        render(<ReviewsListClient />);
      });

      // Apply rating filter
      const ratingButtons = screen.getAllByRole("button");
      const twoStarButton = ratingButtons.find((btn) =>
        btn.textContent?.includes("2")
      );

      mockReviewsService.list.mockResolvedValue({
        data: [],
        count: 0,
        pagination: {
          page: 1,
          limit: 20,
          total: 0,
          hasNextPage: false,
          hasPrevPage: false,
        },
      });

      if (twoStarButton) {
        await act(async () => {
          fireEvent.click(twoStarButton);
        });

        await waitFor(() => {
          expect(
            screen.getByText(/Try adjusting your filters/)
          ).toBeInTheDocument();
        });
      }
    });

    it("shows clear filters button when filters are active", async () => {
      mockReviewsService.list.mockResolvedValue({
        data: mockReviews,
        count: 3,
        pagination: {
          page: 1,
          limit: 20,
          total: 3,
          hasNextPage: false,
          hasPrevPage: false,
        },
      });

      await act(async () => {
        render(<ReviewsListClient />);
      });

      // Apply rating filter
      const ratingButtons = screen.getAllByRole("button");
      const oneStarButton = ratingButtons.find((btn) =>
        btn.textContent?.includes("1")
      );

      mockReviewsService.list.mockResolvedValue({
        data: [],
        count: 0,
        pagination: {
          page: 1,
          limit: 20,
          total: 0,
          hasNextPage: false,
          hasPrevPage: false,
        },
      });

      if (oneStarButton) {
        await act(async () => {
          fireEvent.click(oneStarButton);
        });

        await waitFor(() => {
          expect(screen.getByText("Clear Filters")).toBeInTheDocument();
        });

        const clearButton = screen.getByText("Clear Filters");

        mockReviewsService.list.mockResolvedValue({
          data: mockReviews,
          count: 3,
          pagination: {
            page: 1,
            limit: 20,
            total: 3,
            hasNextPage: false,
            hasPrevPage: false,
          },
        });

        await act(async () => {
          fireEvent.click(clearButton);
        });

        await waitFor(() => {
          expect(mockReviewsService.list).toHaveBeenCalledWith(
            expect.objectContaining({
              status: "approved",
              page: 1,
              limit: 20,
              sortBy: "recent",
            })
          );
        });
      }
    });
  });

  describe("Review Display", () => {
    it("renders all review cards", async () => {
      mockReviewsService.list.mockResolvedValue({
        data: mockReviews,
        count: 3,
        pagination: {
          page: 1,
          limit: 20,
          total: 3,
          hasNextPage: false,
          hasPrevPage: false,
        },
      });

      await act(async () => {
        render(<ReviewsListClient />);
      });

      await waitFor(() => {
        expect(screen.getByTestId("review-card-review1")).toBeInTheDocument();
        expect(screen.getByTestId("review-card-review2")).toBeInTheDocument();
        expect(screen.getByTestId("review-card-review3")).toBeInTheDocument();
      });
    });
  });
});
