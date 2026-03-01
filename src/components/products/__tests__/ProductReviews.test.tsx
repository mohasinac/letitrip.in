import React from "react";
import { render, screen } from "@testing-library/react";
import { ProductReviews } from "../ProductReviews";

jest.mock("next-intl", () => ({
  useTranslations: () => (key: string, params?: Record<string, unknown>) => {
    if (params) return JSON.stringify({ key, ...params });
    return key;
  },
}));
jest.mock("next/image", () => ({
  __esModule: true,
  default: ({ alt, src }: any) => <img alt={alt} src={src} />,
}));
jest.mock("@/hooks", () => ({
  useProductReviews: jest.fn(),
}));
jest.mock("@/utils", () => ({
  formatRelativeTime: () => "2 days ago",
  formatNumber: (n: number) => n.toString(),
}));
jest.mock("@/components", () => ({
  Heading: ({ children, level, className }: any) =>
    React.createElement(`h${level}`, { className }, children),
  Text: ({ children, className }: any) => (
    <span className={className}>{children}</span>
  ),
  HorizontalScroller: ({ children, className }: any) => (
    <div className={className}>{children}</div>
  ),
}));

import { useProductReviews } from "@/hooks";

const mockReview = {
  id: "r1",
  userName: "Jane Doe",
  userAvatar: null,
  rating: 5,
  title: "Excellent product",
  comment: "Really great boots!",
  verified: true,
  helpfulCount: 3,
  images: [],
  createdAt: new Date("2025-01-01"),
};

describe("ProductReviews", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("shows no-reviews message when empty", () => {
    (useProductReviews as jest.Mock).mockReturnValue({
      data: null,
      isLoading: false,
    });
    render(<ProductReviews productId="p1" />);
    expect(screen.getByText("reviewsNone")).toBeInTheDocument();
    expect(screen.getByText("reviewsBeFirst")).toBeInTheDocument();
  });

  it("renders reviews heading", () => {
    (useProductReviews as jest.Mock).mockReturnValue({
      data: null,
      isLoading: false,
    });
    render(<ProductReviews productId="p1" />);
    expect(screen.getByText("reviewsTitle")).toBeInTheDocument();
  });

  it("renders review content when reviews exist", () => {
    (useProductReviews as jest.Mock).mockReturnValue({
      data: {
        data: [mockReview],
        meta: {
          total: 1,
          totalPages: 1,
          hasMore: false,
          averageRating: 5,
          ratingDistribution: { 5: 1 },
        },
      },
      isLoading: false,
    });
    render(<ProductReviews productId="p1" />);
    expect(screen.getByText("Jane Doe")).toBeInTheDocument();
    expect(screen.getByText("Really great boots!")).toBeInTheDocument();
  });

  it("shows verified purchase badge for verified reviews", () => {
    (useProductReviews as jest.Mock).mockReturnValue({
      data: {
        data: [mockReview],
        meta: {
          total: 1,
          totalPages: 1,
          hasMore: false,
          averageRating: 5,
          ratingDistribution: { 5: 1 },
        },
      },
      isLoading: false,
    });
    render(<ProductReviews productId="p1" />);
    expect(screen.getByText("verifiedPurchase")).toBeInTheDocument();
  });

  it("shows helpful count for reviews with helpfulCount > 0", () => {
    (useProductReviews as jest.Mock).mockReturnValue({
      data: {
        data: [mockReview],
        meta: {
          total: 1,
          totalPages: 1,
          hasMore: false,
          averageRating: 5,
          ratingDistribution: { 5: 1 },
        },
      },
      isLoading: false,
    });
    render(<ProductReviews productId="p1" />);
    expect(
      screen.getByText(JSON.stringify({ key: "helpful", count: 3 })),
    ).toBeInTheDocument();
  });

  it("renders loading skeletons when loading", () => {
    (useProductReviews as jest.Mock).mockReturnValue({
      data: null,
      isLoading: true,
    });
    const { container } = render(<ProductReviews productId="p1" />);
    const skeletons = container.querySelectorAll(".animate-pulse");
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it("shows pagination when multiple pages exist", () => {
    (useProductReviews as jest.Mock).mockReturnValue({
      data: {
        data: [mockReview],
        meta: {
          total: 20,
          totalPages: 2,
          hasMore: true,
          averageRating: 5,
          ratingDistribution: { 5: 20 },
        },
      },
      isLoading: false,
    });
    render(<ProductReviews productId="p1" />);
    expect(screen.getByText("back")).toBeInTheDocument();
    expect(screen.getByText("next")).toBeInTheDocument();
  });
});
