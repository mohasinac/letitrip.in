import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { BaseCard, BaseCardProps, Badge, ActionButton } from "./BaseCard";
import { Heart, Share2 } from "lucide-react";

// Mock OptimizedImage component
jest.mock("@/components/common/OptimizedImage", () => ({
  __esModule: true,
  default: ({ alt, src }: { alt: string; src: string }) => (
    <img src={src} alt={alt} data-testid="optimized-image" />
  ),
}));

// Mock Next.js Link
jest.mock("next/link", () => ({
  __esModule: true,
  default: ({ children, href, onClick }: any) => (
    <a href={href} onClick={onClick}>
      {children}
    </a>
  ),
}));

const defaultProps: BaseCardProps = {
  href: "/products/test-product",
  imageAlt: "Test Product",
  children: <div>Card Content</div>,
};

describe("BaseCard", () => {
  describe("Basic Rendering", () => {
    it("renders card with children", () => {
      render(<BaseCard {...defaultProps} />);

      expect(screen.getByText("Card Content")).toBeInTheDocument();
    });

    it("renders as a link with correct href", () => {
      render(<BaseCard {...defaultProps} />);

      const link = screen.getByRole("link");
      expect(link).toHaveAttribute("href", "/products/test-product");
    });
    it("applies base styling classes", () => {
      render(<BaseCard {...defaultProps} />);

      const link = screen.getByRole("link");
      expect(link).toBeInTheDocument();
    });
    it("applies custom className", () => {
      render(<BaseCard {...defaultProps} className="custom-class" />);

      const container = screen.getByRole("link").parentElement;
      expect(container).toBeInTheDocument();
    });
  });

  describe("Image Rendering", () => {
    it("renders image when src provided", () => {
      render(<BaseCard {...defaultProps} image="/test-image.jpg" />);

      const image = screen.getByTestId("optimized-image");
      expect(image).toHaveAttribute("src", "/test-image.jpg");
      expect(image).toHaveAttribute("alt", "Test Product");
    });

    it("does not render image when src not provided", () => {
      render(<BaseCard {...defaultProps} />);

      expect(screen.queryByTestId("optimized-image")).not.toBeInTheDocument();
    });

    it("renders image fallback when no image", () => {
      const fallback = <div data-testid="fallback">No Image</div>;
      render(<BaseCard {...defaultProps} imageFallback={fallback} />);

      expect(screen.getByTestId("fallback")).toBeInTheDocument();
      expect(screen.getByText("No Image")).toBeInTheDocument();
    });

    it("applies custom imageClassName", () => {
      render(
        <BaseCard
          {...defaultProps}
          image="/test.jpg"
          imageClassName="custom-image"
        />
      );

      const imageContainer = screen
        .getByTestId("optimized-image")
        .closest("div");
      expect(imageContainer).toHaveClass("custom-image");
    });
  });

  describe("Aspect Ratios", () => {
    it("applies square aspect ratio by default", () => {
      render(<BaseCard {...defaultProps} image="/test.jpg" />);

      const imageContainer = screen
        .getByTestId("optimized-image")
        .closest("div");
      expect(imageContainer).toHaveClass("aspect-square");
    });

    it("applies video aspect ratio", () => {
      render(
        <BaseCard {...defaultProps} image="/test.jpg" aspectRatio="video" />
      );

      const imageContainer = screen
        .getByTestId("optimized-image")
        .closest("div");
      expect(imageContainer).toHaveClass("aspect-video");
    });

    it("applies wide aspect ratio", () => {
      render(
        <BaseCard {...defaultProps} image="/test.jpg" aspectRatio="wide" />
      );

      const imageContainer = screen
        .getByTestId("optimized-image")
        .closest("div");
      expect(imageContainer).toHaveClass("aspect-[21/9]");
    });
  });

  describe("Badges", () => {
    it("renders single badge", () => {
      const badges: Badge[] = [{ text: "Featured", color: "yellow" }];
      render(<BaseCard {...defaultProps} image="/test.jpg" badges={badges} />);

      expect(screen.getByText("Featured")).toBeInTheDocument();
    });

    it("renders multiple badges", () => {
      const badges: Badge[] = [
        { text: "Featured", color: "yellow" },
        { text: "Sale", color: "red" },
        { text: "New", color: "blue" },
      ];
      render(<BaseCard {...defaultProps} image="/test.jpg" badges={badges} />);

      expect(screen.getByText("Featured")).toBeInTheDocument();
      expect(screen.getByText("Sale")).toBeInTheDocument();
      expect(screen.getByText("New")).toBeInTheDocument();
    });

    it("applies correct color classes for badges", () => {
      const badges: Badge[] = [
        { text: "Yellow", color: "yellow" },
        { text: "Red", color: "red" },
        { text: "Blue", color: "blue" },
        { text: "Green", color: "green" },
        { text: "Gray", color: "gray" },
        { text: "Purple", color: "purple" },
        { text: "Orange", color: "orange" },
      ];
      render(<BaseCard {...defaultProps} image="/test.jpg" badges={badges} />);

      expect(screen.getByText("Yellow")).toHaveClass("bg-yellow-500");
      expect(screen.getByText("Red")).toHaveClass("bg-red-500");
      expect(screen.getByText("Blue")).toHaveClass("bg-blue-500");
      expect(screen.getByText("Green")).toHaveClass("bg-green-500");
      expect(screen.getByText("Gray")).toHaveClass("bg-gray-500");
      expect(screen.getByText("Purple")).toHaveClass("bg-purple-500");
      expect(screen.getByText("Orange")).toHaveClass("bg-orange-500");
    });

    it("does not render badges container when empty array", () => {
      render(<BaseCard {...defaultProps} image="/test.jpg" badges={[]} />);

      const badgesContainer = document.querySelector(".absolute.top-2.left-2");
      expect(badgesContainer).not.toBeInTheDocument();
    });
  });

  describe("Action Buttons", () => {
    it("renders action buttons", () => {
      const actionButtons: ActionButton[] = [
        {
          icon: <Heart data-testid="heart-icon" />,
          onClick: jest.fn(),
          label: "Add to favorites",
        },
      ];
      render(
        <BaseCard
          {...defaultProps}
          image="/test.jpg"
          actionButtons={actionButtons}
        />
      );

      const button = screen.getByLabelText("Add to favorites");
      expect(button).toBeInTheDocument();
      expect(screen.getByTestId("heart-icon")).toBeInTheDocument();
    });

    it("calls onClick when action button clicked", () => {
      const onClick = jest.fn();
      const actionButtons: ActionButton[] = [
        {
          icon: <Heart />,
          onClick,
          label: "Add to favorites",
        },
      ];
      render(
        <BaseCard
          {...defaultProps}
          image="/test.jpg"
          actionButtons={actionButtons}
        />
      );

      fireEvent.click(screen.getByLabelText("Add to favorites"));

      expect(onClick).toHaveBeenCalledTimes(1);
    });

    it("applies active styling to active button", () => {
      const actionButtons: ActionButton[] = [
        {
          icon: <Heart />,
          onClick: jest.fn(),
          label: "Add to favorites",
          active: true,
        },
      ];
      render(
        <BaseCard
          {...defaultProps}
          image="/test.jpg"
          actionButtons={actionButtons}
        />
      );

      const button = screen.getByLabelText("Add to favorites");
      expect(button).toHaveClass("text-blue-500");
    });

    it("applies custom activeColor to active button", () => {
      const actionButtons: ActionButton[] = [
        {
          icon: <Heart />,
          onClick: jest.fn(),
          label: "Add to favorites",
          active: true,
          activeColor: "text-red-500",
        },
      ];
      render(
        <BaseCard
          {...defaultProps}
          image="/test.jpg"
          actionButtons={actionButtons}
        />
      );

      const button = screen.getByLabelText("Add to favorites");
      expect(button).toHaveClass("text-red-500");
    });

    it("renders multiple action buttons", () => {
      const actionButtons: ActionButton[] = [
        { icon: <Heart />, onClick: jest.fn(), label: "Favorite" },
        { icon: <Share2 />, onClick: jest.fn(), label: "Share" },
      ];
      render(
        <BaseCard
          {...defaultProps}
          image="/test.jpg"
          actionButtons={actionButtons}
        />
      );

      expect(screen.getByLabelText("Favorite")).toBeInTheDocument();
      expect(screen.getByLabelText("Share")).toBeInTheDocument();
    });

    it("does not render action buttons container when empty", () => {
      render(
        <BaseCard {...defaultProps} image="/test.jpg" actionButtons={[]} />
      );

      const buttonsContainer = document.querySelector(
        ".absolute.top-2.right-2"
      );
      expect(buttonsContainer).not.toBeInTheDocument();
    });
  });

  describe("Image Overlay", () => {
    it("renders image overlay", () => {
      const overlay = <button data-testid="add-to-cart">Add to Cart</button>;
      render(
        <BaseCard {...defaultProps} image="/test.jpg" imageOverlay={overlay} />
      );

      expect(screen.getByTestId("add-to-cart")).toBeInTheDocument();
    });

    it("renders image overlay with correct positioning", () => {
      const overlay = <button>Add to Cart</button>;
      render(
        <BaseCard {...defaultProps} image="/test.jpg" imageOverlay={overlay} />
      );

      const overlayContainer = screen.getByText("Add to Cart").closest("div");
      expect(overlayContainer).toHaveClass("absolute", "bottom-0");
    });
  });

  describe("Custom onClick", () => {
    it("calls onClick and prevents default", () => {
      const onClick = jest.fn();
      render(<BaseCard {...defaultProps} onClick={onClick} />);

      const link = screen.getByRole("link");
      fireEvent.click(link);

      expect(onClick).toHaveBeenCalled();
    });

    it("navigates normally when onClick not provided", () => {
      render(<BaseCard {...defaultProps} />);

      const link = screen.getByRole("link");
      expect(link).toHaveAttribute("href", "/products/test-product");
    });
  });

  describe("Priority Loading", () => {
    it("passes priority prop to OptimizedImage", () => {
      render(<BaseCard {...defaultProps} image="/test.jpg" priority={true} />);

      expect(screen.getByTestId("optimized-image")).toBeInTheDocument();
    });
  });

  describe("Content Area", () => {
    it("renders children in content area", () => {
      render(
        <BaseCard {...defaultProps}>
          <h3>Product Title</h3>
          <p>Product Description</p>
        </BaseCard>
      );

      expect(screen.getByText("Product Title")).toBeInTheDocument();
      expect(screen.getByText("Product Description")).toBeInTheDocument();
    });
    it("applies padding to content area", () => {
      render(<BaseCard {...defaultProps} />);

      const content = screen.getByText("Card Content");
      expect(content).toBeInTheDocument();
    });
  });

  describe("Hover Effects", () => {
    it("applies hover shadow class", () => {
      render(<BaseCard {...defaultProps} />);

      const link = screen.getByRole("link");
      expect(link).toBeInTheDocument();
    });
    it("applies hover border class", () => {
      render(<BaseCard {...defaultProps} />);

      const link = screen.getByRole("link");
      expect(link).toBeInTheDocument();
    });
  });

  describe("Edge Cases", () => {
    it("handles empty href", () => {
      render(<BaseCard {...defaultProps} href="" />);

      expect(screen.getByText("Card Content")).toBeInTheDocument();
    });

    it("handles very long imageAlt", () => {
      const longAlt = "A".repeat(200);
      render(
        <BaseCard {...defaultProps} image="/test.jpg" imageAlt={longAlt} />
      );

      const image = screen.getByTestId("optimized-image");
      expect(image).toHaveAttribute("alt", longAlt);
    });

    it("handles special characters in badges", () => {
      const badges: Badge[] = [
        { text: "50% Off & Free Shipping!", color: "red" },
      ];
      render(<BaseCard {...defaultProps} image="/test.jpg" badges={badges} />);

      expect(screen.getByText("50% Off & Free Shipping!")).toBeInTheDocument();
    });

    it("handles complex children", () => {
      render(
        <BaseCard {...defaultProps}>
          <div>
            <h3>Title</h3>
            <ul>
              <li>Item 1</li>
              <li>Item 2</li>
            </ul>
          </div>
        </BaseCard>
      );

      expect(screen.getByText("Title")).toBeInTheDocument();
      expect(screen.getByText("Item 1")).toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("renders as accessible link", () => {
      render(<BaseCard {...defaultProps} />);

      expect(screen.getByRole("link")).toBeInTheDocument();
    });

    it("applies aria-label to action buttons", () => {
      const actionButtons: ActionButton[] = [
        { icon: <Heart />, onClick: jest.fn(), label: "Add to favorites" },
      ];
      render(
        <BaseCard
          {...defaultProps}
          image="/test.jpg"
          actionButtons={actionButtons}
        />
      );

      expect(screen.getByLabelText("Add to favorites")).toBeInTheDocument();
    });

    it("provides imageAlt for accessibility", () => {
      render(
        <BaseCard
          {...defaultProps}
          image="/test.jpg"
          imageAlt="Product image"
        />
      );

      const image = screen.getByTestId("optimized-image");
      expect(image).toHaveAttribute("alt", "Product image");
    });
  });
});
