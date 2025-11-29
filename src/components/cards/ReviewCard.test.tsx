import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { ReviewCard, ReviewCardProps } from "./ReviewCard";

// Mock Next.js components
jest.mock("next/link", () => {
  return ({ children, href, onClick }: any) => (
    <a href={href} onClick={onClick}>
      {children}
    </a>
  );
});

jest.mock("next/image", () => ({
  __esModule: true,
  default: ({ src, alt, fill, className }: any) => {
    return fill ? (
      <img src={src} alt={alt} className={className} />
    ) : (
      <img src={src} alt={alt} className={className} width="100" height="100" />
    );
  },
}));

// Mock lucide-react icons
jest.mock("lucide-react", () => ({
  Star: ({ className }: any) => (
    <svg data-testid="star-icon" className={className} />
  ),
  ThumbsUp: ({ className }: any) => (
    <svg data-testid="thumbs-up-icon" className={className} />
  ),
  ShieldCheck: ({ className }: any) => (
    <svg data-testid="shield-icon" className={className} />
  ),
  Calendar: ({ className }: any) => (
    <svg data-testid="calendar-icon" className={className} />
  ),
  Package: ({ className }: any) => (
    <svg data-testid="package-icon" className={className} />
  ),
}));

describe("ReviewCard", () => {
  const mockOnMarkHelpful = jest.fn();

  const baseProps: ReviewCardProps = {
    id: "review-1",
    userId: "user-1",
    userName: "John Doe",
    rating: 4,
    comment: "Great product! Really satisfied with the quality.",
    verifiedPurchase: true,
    helpfulCount: 5,
    createdAt: new Date("2024-01-15"),
    onMarkHelpful: mockOnMarkHelpful,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Basic Rendering", () => {
    it("renders review card with basic information", () => {
      render(<ReviewCard {...baseProps} />);

      expect(screen.getByText("John Doe")).toBeInTheDocument();
      expect(
        screen.getByText("Great product! Really satisfied with the quality."),
      ).toBeInTheDocument();
    });

    it("renders user avatar when provided", () => {
      render(<ReviewCard {...baseProps} userAvatar="/avatar.jpg" />);

      const avatar = screen.getByAltText("John Doe");
      expect(avatar).toBeInTheDocument();
      expect(avatar).toHaveAttribute("src", "/avatar.jpg");
    });

    it("renders user initial when no avatar", () => {
      render(<ReviewCard {...baseProps} />);

      expect(screen.getByText("J")).toBeInTheDocument();
    });

    it("renders review title when provided", () => {
      render(<ReviewCard {...baseProps} title="Excellent Quality" />);

      expect(screen.getByText("Excellent Quality")).toBeInTheDocument();
    });

    it("does not render title when not provided", () => {
      const { container } = render(<ReviewCard {...baseProps} />);

      expect(container.querySelector("h4")).not.toBeInTheDocument();
    });
  });

  describe("Rating Display", () => {
    it("renders correct number of filled stars", () => {
      render(<ReviewCard {...baseProps} rating={3} />);

      const stars = screen.getAllByTestId("star-icon");
      expect(stars).toHaveLength(5);

      // Check filled stars (1-3)
      for (let i = 0; i < 3; i++) {
        expect(stars[i]).toHaveClass("fill-yellow-400");
      }

      // Check empty stars (4-5)
      for (let i = 3; i < 5; i++) {
        expect(stars[i]).toHaveClass("fill-gray-200");
      }
    });

    it("renders 5 filled stars for 5-star rating", () => {
      render(<ReviewCard {...baseProps} rating={5} />);

      const stars = screen.getAllByTestId("star-icon");
      stars.forEach((star) => {
        expect(star).toHaveClass("fill-yellow-400");
      });
    });

    it("renders all empty stars for 0-star rating", () => {
      render(<ReviewCard {...baseProps} rating={0} />);

      const stars = screen.getAllByTestId("star-icon");
      stars.forEach((star) => {
        expect(star).toHaveClass("fill-gray-200");
      });
    });
  });

  describe("Verified Purchase Badge", () => {
    it("shows verified purchase badge when true", () => {
      render(<ReviewCard {...baseProps} verifiedPurchase={true} />);

      expect(screen.getByText("Verified Purchase")).toBeInTheDocument();
      expect(screen.getByTestId("shield-icon")).toBeInTheDocument();
    });

    it("does not show badge when false", () => {
      render(<ReviewCard {...baseProps} verifiedPurchase={false} />);

      expect(screen.queryByText("Verified Purchase")).not.toBeInTheDocument();
    });
  });

  describe("Date Display", () => {
    it("formats and displays date correctly", () => {
      render(<ReviewCard {...baseProps} createdAt={new Date("2024-01-15")} />);

      const timeElement = screen.getByRole("time");
      expect(timeElement).toBeInTheDocument();
    });

    it("handles string date format", () => {
      render(<ReviewCard {...baseProps} createdAt="2024-01-15T10:30:00Z" />);

      const timeElement = screen.getByRole("time");
      expect(timeElement).toBeInTheDocument();
    });
  });

  describe("Review Media", () => {
    it("displays review media images", () => {
      const media = ["/img1.jpg", "/img2.jpg", "/img3.jpg"];
      render(<ReviewCard {...baseProps} media={media} />);

      const images = screen.getAllByAltText(/Review image/);
      expect(images).toHaveLength(3);
    });

    it("limits displayed images to 4", () => {
      const media = [
        "/img1.jpg",
        "/img2.jpg",
        "/img3.jpg",
        "/img4.jpg",
        "/img5.jpg",
      ];
      render(<ReviewCard {...baseProps} media={media} />);

      const images = screen.getAllByAltText(/Review image/);
      expect(images).toHaveLength(4);
    });

    it("shows count for additional images", () => {
      const media = Array(6).fill("/img.jpg");
      render(<ReviewCard {...baseProps} media={media} />);

      expect(screen.getByText("+2")).toBeInTheDocument();
    });

    it("does not show media in compact mode", () => {
      const media = ["/img1.jpg", "/img2.jpg"];
      render(<ReviewCard {...baseProps} media={media} compact={true} />);

      expect(screen.queryByAltText(/Review image/)).not.toBeInTheDocument();
    });

    it("does not show media section when empty", () => {
      const { container } = render(<ReviewCard {...baseProps} media={[]} />);

      expect(screen.queryByAltText(/Review image/)).not.toBeInTheDocument();
    });
  });

  describe("Product Information", () => {
    const productProps = {
      productId: "product-1",
      productName: "Amazing Product",
      productImage: "/product.jpg",
      shopName: "Best Shop",
    };

    it("shows product info when showProduct is true", () => {
      render(
        <ReviewCard {...baseProps} {...productProps} showProduct={true} />,
      );

      expect(screen.getByText("Amazing Product")).toBeInTheDocument();
      expect(screen.getByText("Best Shop")).toBeInTheDocument();
      expect(screen.getByText("Reviewed Product")).toBeInTheDocument();
    });

    it("does not show product info when showProduct is false", () => {
      render(
        <ReviewCard {...baseProps} {...productProps} showProduct={false} />,
      );

      expect(screen.queryByText("Amazing Product")).not.toBeInTheDocument();
      expect(screen.queryByText("Reviewed Product")).not.toBeInTheDocument();
    });

    it("does not show product info when productId not provided", () => {
      render(<ReviewCard {...baseProps} showProduct={true} />);

      expect(screen.queryByText("Reviewed Product")).not.toBeInTheDocument();
    });

    it("renders product image when provided", () => {
      render(
        <ReviewCard {...baseProps} {...productProps} showProduct={true} />,
      );

      const productImage = screen.getByAltText("Amazing Product");
      expect(productImage).toBeInTheDocument();
      expect(productImage).toHaveAttribute("src", "/product.jpg");
    });

    it("links to product page", () => {
      render(
        <ReviewCard {...baseProps} {...productProps} showProduct={true} />,
      );

      const link = screen.getByText("Amazing Product").closest("a");
      expect(link).toHaveAttribute("href", "/products/product-1");
    });
  });

  describe("Helpful Button", () => {
    it("renders helpful button with count", () => {
      render(<ReviewCard {...baseProps} helpfulCount={5} />);

      expect(screen.getByText("Helpful")).toBeInTheDocument();
      expect(screen.getByText("(5)")).toBeInTheDocument();
    });

    it("does not show count when zero", () => {
      render(<ReviewCard {...baseProps} helpfulCount={0} />);

      expect(screen.getByText("Helpful")).toBeInTheDocument();
      expect(screen.queryByText("(0)")).not.toBeInTheDocument();
    });

    it("calls onMarkHelpful when clicked", () => {
      render(<ReviewCard {...baseProps} />);

      const helpfulButton = screen.getByText("Helpful").closest("button");
      fireEvent.click(helpfulButton!);

      expect(mockOnMarkHelpful).toHaveBeenCalledWith("review-1");
    });

    it("shows as marked helpful when isHelpful is true", () => {
      render(<ReviewCard {...baseProps} isHelpful={true} />);

      const helpfulButton = screen.getByText("Helpful").closest("button");
      expect(helpfulButton).toHaveClass("bg-blue-50", "text-blue-600");
    });

    it("disables button when isHelpful is true", () => {
      render(<ReviewCard {...baseProps} isHelpful={true} />);

      const helpfulButton = screen.getByText("Helpful").closest("button");
      expect(helpfulButton).toBeDisabled();
    });

    it("does not call onMarkHelpful when disabled", () => {
      render(<ReviewCard {...baseProps} isHelpful={true} />);

      const helpfulButton = screen.getByText("Helpful").closest("button");
      fireEvent.click(helpfulButton!);

      expect(mockOnMarkHelpful).not.toHaveBeenCalled();
    });

    it("stops propagation when clicked", () => {
      const mockClick = jest.fn();
      const { container } = render(
        <div onClick={mockClick}>
          <ReviewCard {...baseProps} />
        </div>,
      );

      const helpfulButton = screen.getByText("Helpful").closest("button");
      fireEvent.click(helpfulButton!);

      expect(mockClick).not.toHaveBeenCalled();
    });
  });

  describe("Compact Mode", () => {
    it("applies compact padding", () => {
      const { container } = render(
        <ReviewCard {...baseProps} compact={true} />,
      );

      const card = container.querySelector(".p-3");
      expect(card).toBeInTheDocument();
    });

    it("truncates comment to 2 lines in compact mode", () => {
      render(<ReviewCard {...baseProps} compact={true} />);

      const comment = screen.getByText(baseProps.comment);
      expect(comment).toHaveClass("line-clamp-2");
    });

    it("truncates comment to 4 lines in normal mode", () => {
      render(<ReviewCard {...baseProps} compact={false} />);

      const comment = screen.getByText(baseProps.comment);
      expect(comment).toHaveClass("line-clamp-4");
    });
  });

  describe("Shop Link", () => {
    it("shows shop link when no product displayed", () => {
      render(
        <ReviewCard
          {...baseProps}
          shopId="shop-1"
          shopName="Amazing Shop"
          showProduct={false}
        />,
      );

      const shopLink = screen.getByText("Amazing Shop");
      expect(shopLink).toBeInTheDocument();
      expect(shopLink.closest("a")).toHaveAttribute("href", "/shops/shop-1");
    });

    it("does not show shop link when product displayed", () => {
      render(
        <ReviewCard
          {...baseProps}
          shopId="shop-1"
          shopName="Amazing Shop"
          productId="product-1"
          productName="Product"
          showProduct={true}
        />,
      );

      // Shop name should be in product info, not as separate link
      const shopLinks = screen.getAllByText("Amazing Shop");
      expect(shopLinks.length).toBe(1); // Only in product section
    });
  });

  describe("Edge Cases", () => {
    it("handles missing optional props", () => {
      const minimalProps: ReviewCardProps = {
        id: "review-1",
        userId: "user-1",
        userName: "John",
        rating: 3,
        comment: "Good",
        verifiedPurchase: false,
        helpfulCount: 0,
        createdAt: new Date(),
      };

      render(<ReviewCard {...minimalProps} />);

      expect(screen.getByText("John")).toBeInTheDocument();
      expect(screen.getByText("Good")).toBeInTheDocument();
    });

    it("handles very long comment", () => {
      const longComment = "A".repeat(500);
      render(<ReviewCard {...baseProps} comment={longComment} />);

      const comment = screen.getByText(longComment);
      expect(comment).toBeInTheDocument();
    });

    it("handles special characters in user name", () => {
      render(<ReviewCard {...baseProps} userName="John O'Brien & Co." />);

      expect(screen.getByText("John O'Brien & Co.")).toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("has proper time element for date", () => {
      render(<ReviewCard {...baseProps} createdAt={new Date("2024-01-15")} />);

      const timeElement = screen.getByRole("time");
      expect(timeElement).toBeInTheDocument();
    });

    it("renders helpful button as button element", () => {
      render(<ReviewCard {...baseProps} />);

      const button = screen.getByText("Helpful").closest("button");
      expect(button).toBeInTheDocument();
    });
  });
});
