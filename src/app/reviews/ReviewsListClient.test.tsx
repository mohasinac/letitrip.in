import React from "react";
import { render, screen, waitFor, act } from "@testing-library/react";
import ReviewsListClient from "./ReviewsListClient";
import { reviewsService } from "@/services/reviews.service";

jest.mock("@/services/reviews.service");
jest.mock("lucide-react", () => ({
  Search: () => <div data-testid="search-icon" />,
  Filter: () => <div data-testid="filter-icon" />,
  Star: () => <div data-testid="star-icon" />,
  ShieldCheck: () => <div data-testid="shield-check-icon" />,
}));
jest.mock("@/components/cards/ReviewCard", () => ({
  ReviewCard: ({ title }: any) => (
    <div data-testid={`review-card-${title}`}>{title}</div>
  ),
}));

const mockReviewsService = reviewsService as jest.Mocked<typeof reviewsService>;

beforeEach(() => {
  mockReviewsService.list.mockReset();
  mockReviewsService.markHelpful?.mockReset?.();
});

describe("ReviewsListClient", () => {
  it("renders reviews on load", async () => {
    mockReviewsService.list.mockResolvedValue({
      data: [
        {
          id: "1",
          productId: null,
          shopId: null,
          userId: "u1",
          userName: "User One",
          userEmail: "user1@example.com",
          rating: 5,
          title: "Review 1",
          comment: "Great!",
          images: [],
          isVerifiedPurchase: true,
          helpful: 2,
          notHelpful: 0,
          replyText: null,
          replyAt: null,
          status: "approved",
          createdAt: new Date(),
          updatedAt: new Date(),
          ratingStars: 5,
          timeAgo: "1 day ago",
          hasReply: false,
          hasImages: false,
          helpfulnessScore: 2,
          isYourReview: false,
        },
        {
          id: "2",
          productId: null,
          shopId: null,
          userId: "u2",
          userName: "User Two",
          userEmail: "user2@example.com",
          rating: 3,
          title: "Review 2",
          comment: "Okay",
          images: [],
          isVerifiedPurchase: false,
          helpful: 0,
          notHelpful: 0,
          replyText: null,
          replyAt: null,
          status: "approved",
          createdAt: new Date(),
          updatedAt: new Date(),
          ratingStars: 3,
          timeAgo: "2 days ago",
          hasReply: false,
          hasImages: false,
          helpfulnessScore: 0,
          isYourReview: false,
        },
      ],
      count: 2,
      pagination: { limit: 20, hasNextPage: false, nextCursor: null, count: 2 },
    });
    await act(async () => {
      render(<ReviewsListClient />);
    });
    await waitFor(() => {
      expect(screen.getByText("Review 1")).toBeInTheDocument();
      expect(screen.getByText("Review 2")).toBeInTheDocument();
    });
  });

  it("shows loading state initially", async () => {
    mockReviewsService.list.mockResolvedValue({
      data: [],
      count: 0,
      pagination: { limit: 20, hasNextPage: false, nextCursor: null, count: 0 },
    });
    await act(async () => {
      render(<ReviewsListClient />);
    });
    // TODO: Check for loading spinner or skeleton
  });

  it("shows error state on fetch failure", async () => {
    mockReviewsService.list.mockRejectedValue(new Error("Network error"));
    await act(async () => {
      render(<ReviewsListClient />);
    });
    await waitFor(() => {
      expect(
        screen.getByText("Failed to load reviews. Please try again later."),
      ).toBeInTheDocument();
    });
  });

  it("shows empty state when no reviews", async () => {
    mockReviewsService.list.mockResolvedValue({
      data: [],
      count: 0,
      pagination: { limit: 20, hasNextPage: false, nextCursor: null, count: 0 },
    });
    await act(async () => {
      render(<ReviewsListClient />);
    });
    await waitFor(() => {
      expect(screen.getByText("No reviews found")).toBeInTheDocument();
    });
  });

  // TODO: Extract hardcoded strings like "No reviews found", "Failed to load reviews. Please try again later." to constants
});
