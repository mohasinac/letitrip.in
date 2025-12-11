import "@testing-library/jest-dom";
import { fireEvent, render, screen } from "@testing-library/react";
import { Heart, ShoppingCart } from "lucide-react";
import { ActionButton, Badge, BaseCard } from "../BaseCard";

// Mock OptimizedImage
jest.mock("@/components/common/OptimizedImage", () => ({
  __esModule: true,
  default: ({ src, alt, className }: any) => (
    <img
      src={src}
      alt={alt}
      className={className}
      data-testid="optimized-image"
    />
  ),
}));

describe("BaseCard - Reusable Card Component", () => {
  const defaultProps = {
    href: "/product/123",
    imageAlt: "Product Image",
    children: <div>Card Content</div>,
  };

  describe("Basic Rendering", () => {
    it("should render card with Link wrapper", () => {
      render(<BaseCard {...defaultProps} />);
      const link = screen.getByRole("link");
      expect(link).toHaveAttribute("href", "/product/123");
    });

    it("should render children content", () => {
      render(<BaseCard {...defaultProps} />);
      expect(screen.getByText("Card Content")).toBeInTheDocument();
    });

    it("should have white background by default", () => {
      const { container } = render(<BaseCard {...defaultProps} />);
      const link = screen.getByRole("link");
      expect(link).toHaveClass("bg-white");
    });

    it("should have border-gray-200", () => {
      const { container } = render(<BaseCard {...defaultProps} />);
      const link = screen.getByRole("link");
      expect(link).toHaveClass("border-gray-200");
    });

    it("should have rounded-lg corners", () => {
      render(<BaseCard {...defaultProps} />);
      const link = screen.getByRole("link");
      expect(link).toHaveClass("rounded-lg");
    });

    it("should have overflow-hidden", () => {
      render(<BaseCard {...defaultProps} />);
      const link = screen.getByRole("link");
      expect(link).toHaveClass("overflow-hidden");
    });
  });

  describe("Image Rendering", () => {
    it("should render OptimizedImage when image prop provided", () => {
      render(<BaseCard {...defaultProps} image="/product.jpg" />);
      const img = screen.getByTestId("optimized-image");
      expect(img).toHaveAttribute("src", "/product.jpg");
      expect(img).toHaveAttribute("alt", "Product Image");
    });

    it("should not render OptimizedImage when no image prop", () => {
      render(<BaseCard {...defaultProps} />);
      expect(screen.queryByTestId("optimized-image")).not.toBeInTheDocument();
    });

    it("should render imageFallback when no image", () => {
      render(
        <BaseCard
          {...defaultProps}
          imageFallback={<div>No Image Available</div>}
        />
      );
      expect(screen.getByText("No Image Available")).toBeInTheDocument();
    });

    it("should have aspect-square by default", () => {
      const { container } = render(
        <BaseCard {...defaultProps} image="/product.jpg" />
      );
      expect(container.querySelector(".aspect-square")).toBeInTheDocument();
    });

    it("should apply aspect-video when specified", () => {
      const { container } = render(
        <BaseCard {...defaultProps} aspectRatio="video" image="/video.jpg" />
      );
      expect(container.querySelector(".aspect-video")).toBeInTheDocument();
    });

    it("should apply aspect-[21/9] for wide ratio", () => {
      const { container } = render(
        <BaseCard {...defaultProps} aspectRatio="wide" image="/wide.jpg" />
      );
      expect(
        container.querySelector(".aspect-\\[21\\/9\\]")
      ).toBeInTheDocument();
    });

    it("should have bg-gray-100 on image container", () => {
      const { container } = render(
        <BaseCard {...defaultProps} image="/product.jpg" />
      );
      const imageContainer = container.querySelector(".aspect-square");
      expect(imageContainer).toHaveClass("bg-gray-100");
    });

    it("should apply custom imageClassName", () => {
      const { container } = render(
        <BaseCard
          {...defaultProps}
          image="/product.jpg"
          imageClassName="custom-image-class"
        />
      );
      const imageContainer = container.querySelector(".aspect-square");
      expect(imageContainer).toHaveClass("custom-image-class");
    });

    it("should pass priority prop to OptimizedImage", () => {
      render(
        <BaseCard {...defaultProps} image="/product.jpg" priority={true} />
      );
      // OptimizedImage is mocked, so we just verify it renders
      expect(screen.getByTestId("optimized-image")).toBeInTheDocument();
    });
  });

  describe("Badges", () => {
    const badges: Badge[] = [
      { text: "New", color: "yellow" },
      { text: "Sale", color: "red" },
    ];

    it("should render all badges", () => {
      render(
        <BaseCard {...defaultProps} badges={badges} image="/product.jpg" />
      );
      expect(screen.getByText("New")).toBeInTheDocument();
      expect(screen.getByText("Sale")).toBeInTheDocument();
    });

    it("should apply yellow badge color", () => {
      render(
        <BaseCard
          {...defaultProps}
          badges={[{ text: "Featured", color: "yellow" }]}
          image="/product.jpg"
        />
      );
      const badge = screen.getByText("Featured");
      expect(badge).toHaveClass("bg-yellow-500", "text-white");
    });

    it("should apply red badge color", () => {
      render(
        <BaseCard
          {...defaultProps}
          badges={[{ text: "Sale", color: "red" }]}
          image="/product.jpg"
        />
      );
      const badge = screen.getByText("Sale");
      expect(badge).toHaveClass("bg-red-500", "text-white");
    });

    it("should apply blue badge color", () => {
      render(
        <BaseCard
          {...defaultProps}
          badges={[{ text: "Trending", color: "blue" }]}
          image="/product.jpg"
        />
      );
      const badge = screen.getByText("Trending");
      expect(badge).toHaveClass("bg-blue-500", "text-white");
    });

    it("should apply green badge color", () => {
      render(
        <BaseCard
          {...defaultProps}
          badges={[{ text: "Available", color: "green" }]}
          image="/product.jpg"
        />
      );
      const badge = screen.getByText("Available");
      expect(badge).toHaveClass("bg-green-500", "text-white");
    });

    it("should apply gray badge color", () => {
      render(
        <BaseCard
          {...defaultProps}
          badges={[{ text: "Used", color: "gray" }]}
          image="/product.jpg"
        />
      );
      const badge = screen.getByText("Used");
      expect(badge).toHaveClass("bg-gray-500", "text-white");
    });

    it("should apply purple badge color", () => {
      render(
        <BaseCard
          {...defaultProps}
          badges={[{ text: "Premium", color: "purple" }]}
          image="/product.jpg"
        />
      );
      const badge = screen.getByText("Premium");
      expect(badge).toHaveClass("bg-purple-500", "text-white");
    });

    it("should apply orange badge color", () => {
      render(
        <BaseCard
          {...defaultProps}
          badges={[{ text: "Limited", color: "orange" }]}
          image="/product.jpg"
        />
      );
      const badge = screen.getByText("Limited");
      expect(badge).toHaveClass("bg-orange-500", "text-white");
    });

    it("should position badges at top-left", () => {
      const { container } = render(
        <BaseCard {...defaultProps} badges={badges} image="/product.jpg" />
      );
      const badgeContainer = container.querySelector(".top-2.left-2");
      expect(badgeContainer).toBeInTheDocument();
    });

    it("should have z-10 on badge container", () => {
      const { container } = render(
        <BaseCard {...defaultProps} badges={badges} image="/product.jpg" />
      );
      const badgeContainer = container.querySelector(".top-2.left-2");
      expect(badgeContainer).toHaveClass("z-10");
    });

    it("should render multiple badges in flex-col", () => {
      const { container } = render(
        <BaseCard {...defaultProps} badges={badges} image="/product.jpg" />
      );
      const badgeContainer = container.querySelector(".flex-col");
      expect(badgeContainer).toBeInTheDocument();
    });

    it("should have gap-1 between badges", () => {
      const { container } = render(
        <BaseCard {...defaultProps} badges={badges} image="/product.jpg" />
      );
      const badgeContainer = container.querySelector(".gap-1");
      expect(badgeContainer).toBeInTheDocument();
    });

    it("should have text-xs font-semibold on badges", () => {
      render(
        <BaseCard
          {...defaultProps}
          badges={[{ text: "New", color: "yellow" }]}
          image="/product.jpg"
        />
      );
      const badge = screen.getByText("New");
      expect(badge).toHaveClass("text-xs", "font-semibold");
    });

    it("should have px-2 py-1 padding on badges", () => {
      render(
        <BaseCard
          {...defaultProps}
          badges={[{ text: "New", color: "yellow" }]}
          image="/product.jpg"
        />
      );
      const badge = screen.getByText("New");
      expect(badge).toHaveClass("px-2", "py-1");
    });

    it("should not render badges container when empty", () => {
      const { container } = render(
        <BaseCard {...defaultProps} badges={[]} image="/product.jpg" />
      );
      const badgeContainer = container.querySelector(".top-2.left-2");
      expect(badgeContainer).not.toBeInTheDocument();
    });
  });

  describe("Action Buttons", () => {
    const mockOnClick = jest.fn();
    const actionButtons: ActionButton[] = [
      {
        icon: <Heart data-testid="heart-icon" />,
        onClick: mockOnClick,
        label: "Add to favorites",
      },
      {
        icon: <ShoppingCart data-testid="cart-icon" />,
        onClick: jest.fn(),
        label: "Add to cart",
      },
    ];

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it("should render all action buttons", () => {
      render(
        <BaseCard
          {...defaultProps}
          actionButtons={actionButtons}
          image="/product.jpg"
        />
      );
      expect(screen.getByLabelText("Add to favorites")).toBeInTheDocument();
      expect(screen.getByLabelText("Add to cart")).toBeInTheDocument();
    });

    it("should render button icons", () => {
      render(
        <BaseCard
          {...defaultProps}
          actionButtons={actionButtons}
          image="/product.jpg"
        />
      );
      expect(screen.getByTestId("heart-icon")).toBeInTheDocument();
      expect(screen.getByTestId("cart-icon")).toBeInTheDocument();
    });

    it("should call onClick when button clicked", () => {
      render(
        <BaseCard
          {...defaultProps}
          actionButtons={actionButtons}
          image="/product.jpg"
        />
      );
      fireEvent.click(screen.getByLabelText("Add to favorites"));
      expect(mockOnClick).toHaveBeenCalledTimes(1);
    });

    it("should have aria-label on buttons", () => {
      render(
        <BaseCard
          {...defaultProps}
          actionButtons={actionButtons}
          image="/product.jpg"
        />
      );
      const button = screen.getByLabelText("Add to favorites");
      expect(button).toHaveAttribute("aria-label", "Add to favorites");
    });

    it("should position buttons at top-right", () => {
      const { container } = render(
        <BaseCard
          {...defaultProps}
          actionButtons={actionButtons}
          image="/product.jpg"
        />
      );
      const buttonContainer = container.querySelector(".top-2.right-2");
      expect(buttonContainer).toBeInTheDocument();
    });

    it("should have opacity-0 by default", () => {
      const { container } = render(
        <BaseCard
          {...defaultProps}
          actionButtons={actionButtons}
          image="/product.jpg"
        />
      );
      const buttonContainer = container.querySelector(".top-2.right-2");
      expect(buttonContainer).toHaveClass("opacity-0");
    });

    it("should have group-hover:opacity-100", () => {
      const { container } = render(
        <BaseCard
          {...defaultProps}
          actionButtons={actionButtons}
          image="/product.jpg"
        />
      );
      const buttonContainer = container.querySelector(".top-2.right-2");
      expect(buttonContainer).toHaveClass("group-hover:opacity-100");
    });

    it("should have z-10 on button container", () => {
      const { container } = render(
        <BaseCard
          {...defaultProps}
          actionButtons={actionButtons}
          image="/product.jpg"
        />
      );
      const buttonContainer = container.querySelector(".top-2.right-2");
      expect(buttonContainer).toHaveClass("z-10");
    });

    it("should have flex-col layout", () => {
      const { container } = render(
        <BaseCard
          {...defaultProps}
          actionButtons={actionButtons}
          image="/product.jpg"
        />
      );
      const buttonContainer = container.querySelector(".flex-col");
      expect(buttonContainer).toBeInTheDocument();
    });

    it("should have gap-2 between buttons", () => {
      const { container } = render(
        <BaseCard
          {...defaultProps}
          actionButtons={actionButtons}
          image="/product.jpg"
        />
      );
      const buttonContainer = container.querySelector(".gap-2");
      expect(buttonContainer).toBeInTheDocument();
    });

    it("should have rounded-full buttons", () => {
      render(
        <BaseCard
          {...defaultProps}
          actionButtons={actionButtons}
          image="/product.jpg"
        />
      );
      const button = screen.getByLabelText("Add to favorites");
      expect(button).toHaveClass("rounded-full");
    });

    it("should have p-2 padding on buttons", () => {
      render(
        <BaseCard
          {...defaultProps}
          actionButtons={actionButtons}
          image="/product.jpg"
        />
      );
      const button = screen.getByLabelText("Add to favorites");
      expect(button).toHaveClass("p-2");
    });

    it("should have bg-white on buttons", () => {
      render(
        <BaseCard
          {...defaultProps}
          actionButtons={actionButtons}
          image="/product.jpg"
        />
      );
      const button = screen.getByLabelText("Add to favorites");
      expect(button).toHaveClass("bg-white");
    });

    it("should have shadow-md on buttons", () => {
      render(
        <BaseCard
          {...defaultProps}
          actionButtons={actionButtons}
          image="/product.jpg"
        />
      );
      const button = screen.getByLabelText("Add to favorites");
      expect(button).toHaveClass("shadow-md");
    });

    it("should apply active color when button is active", () => {
      const activeButton: ActionButton[] = [
        {
          icon: <Heart data-testid="heart-icon" />,
          onClick: jest.fn(),
          label: "Favorite",
          active: true,
          activeColor: "text-red-500",
        },
      ];
      render(
        <BaseCard
          {...defaultProps}
          actionButtons={activeButton}
          image="/product.jpg"
        />
      );
      const button = screen.getByLabelText("Favorite");
      expect(button).toHaveClass("text-red-500");
    });

    it("should use default blue-500 when active without custom color", () => {
      const activeButton: ActionButton[] = [
        {
          icon: <Heart data-testid="heart-icon" />,
          onClick: jest.fn(),
          label: "Favorite",
          active: true,
        },
      ];
      render(
        <BaseCard
          {...defaultProps}
          actionButtons={activeButton}
          image="/product.jpg"
        />
      );
      const button = screen.getByLabelText("Favorite");
      expect(button).toHaveClass("text-blue-500");
    });

    it("should have text-gray-600 when not active", () => {
      render(
        <BaseCard
          {...defaultProps}
          actionButtons={actionButtons}
          image="/product.jpg"
        />
      );
      const button = screen.getByLabelText("Add to favorites");
      expect(button).toHaveClass("text-gray-600");
    });

    it("should not render button container when empty", () => {
      const { container } = render(
        <BaseCard {...defaultProps} actionButtons={[]} image="/product.jpg" />
      );
      const buttonContainer = container.querySelector(".top-2.right-2");
      expect(buttonContainer).not.toBeInTheDocument();
    });
  });

  describe("Image Overlay", () => {
    it("should render imageOverlay when provided", () => {
      render(
        <BaseCard
          {...defaultProps}
          imageOverlay={<button>Add to Cart</button>}
          image="/product.jpg"
        />
      );
      expect(screen.getByText("Add to Cart")).toBeInTheDocument();
    });

    it("should position overlay at bottom", () => {
      const { container } = render(
        <BaseCard
          {...defaultProps}
          imageOverlay={<button>Quick View</button>}
          image="/product.jpg"
        />
      );
      const overlay = container.querySelector(".bottom-0.left-0.right-0");
      expect(overlay).toBeInTheDocument();
    });

    it("should have opacity-0 by default", () => {
      const { container } = render(
        <BaseCard
          {...defaultProps}
          imageOverlay={<button>Quick View</button>}
          image="/product.jpg"
        />
      );
      const overlay = container.querySelector(".bottom-0");
      expect(overlay).toHaveClass("opacity-0");
    });

    it("should have group-hover:opacity-100", () => {
      const { container } = render(
        <BaseCard
          {...defaultProps}
          imageOverlay={<button>Quick View</button>}
          image="/product.jpg"
        />
      );
      const overlay = container.querySelector(".bottom-0");
      expect(overlay).toHaveClass("group-hover:opacity-100");
    });

    it("should have z-10 on overlay", () => {
      const { container } = render(
        <BaseCard
          {...defaultProps}
          imageOverlay={<button>Quick View</button>}
          image="/product.jpg"
        />
      );
      const overlay = container.querySelector(".bottom-0");
      expect(overlay).toHaveClass("z-10");
    });

    it("should have p-2 padding", () => {
      const { container } = render(
        <BaseCard
          {...defaultProps}
          imageOverlay={<button>Quick View</button>}
          image="/product.jpg"
        />
      );
      const overlay = container.querySelector(".p-2");
      expect(overlay).toBeInTheDocument();
    });

    it("should not render overlay when not provided", () => {
      const { container } = render(
        <BaseCard {...defaultProps} image="/product.jpg" />
      );
      const overlay = container.querySelector(".bottom-0.left-0.right-0");
      expect(overlay).not.toBeInTheDocument();
    });
  });

  describe("Hover Effects", () => {
    it("should have hover:shadow-lg class", () => {
      render(<BaseCard {...defaultProps} />);
      const link = screen.getByRole("link");
      expect(link).toHaveClass("hover:shadow-lg");
    });

    it("should have hover:border-blue-500 class", () => {
      render(<BaseCard {...defaultProps} />);
      const link = screen.getByRole("link");
      expect(link).toHaveClass("hover:border-blue-500");
    });

    it("should have transition-all duration-200", () => {
      render(<BaseCard {...defaultProps} />);
      const link = screen.getByRole("link");
      expect(link).toHaveClass("transition-all", "duration-200");
    });

    it("should have group class on link", () => {
      render(<BaseCard {...defaultProps} />);
      const link = screen.getByRole("link");
      expect(link).toHaveClass("group");
    });

    it("should have group-hover:scale-105 on image", () => {
      render(<BaseCard {...defaultProps} image="/product.jpg" />);
      const img = screen.getByTestId("optimized-image");
      expect(img).toHaveClass("group-hover:scale-105");
    });

    it("should have transition-transform duration-300 on image", () => {
      render(<BaseCard {...defaultProps} image="/product.jpg" />);
      const img = screen.getByTestId("optimized-image");
      expect(img).toHaveClass("transition-transform", "duration-300");
    });
  });

  describe("Click Handling", () => {
    it("should call onClick when card is clicked", () => {
      const mockClick = jest.fn();
      render(<BaseCard {...defaultProps} onClick={mockClick} />);
      fireEvent.click(screen.getByRole("link"));
      expect(mockClick).toHaveBeenCalledTimes(1);
    });

    it("should prevent default navigation when onClick provided", () => {
      const mockClick = jest.fn();
      render(<BaseCard {...defaultProps} onClick={mockClick} />);
      const link = screen.getByRole("link");
      const event = new MouseEvent("click", {
        bubbles: true,
        cancelable: true,
      });
      const preventDefaultSpy = jest.spyOn(event, "preventDefault");
      link.dispatchEvent(event);
      expect(preventDefaultSpy).toHaveBeenCalled();
    });

    it("should not prevent default when no onClick", () => {
      render(<BaseCard {...defaultProps} />);
      const link = screen.getByRole("link");
      const event = new MouseEvent("click", {
        bubbles: true,
        cancelable: true,
      });
      const preventDefaultSpy = jest.spyOn(event, "preventDefault");
      link.dispatchEvent(event);
      expect(preventDefaultSpy).not.toHaveBeenCalled();
    });
  });

  describe("Custom Styling", () => {
    it("should apply custom className", () => {
      render(<BaseCard {...defaultProps} className="custom-card-class" />);
      const link = screen.getByRole("link");
      expect(link).toHaveClass("custom-card-class");
    });

    it("should merge custom className with base classes", () => {
      render(<BaseCard {...defaultProps} className="my-custom-class" />);
      const link = screen.getByRole("link");
      expect(link).toHaveClass("my-custom-class", "bg-white", "rounded-lg");
    });
  });

  describe("Content Area", () => {
    it("should render children in p-4 container", () => {
      const { container } = render(<BaseCard {...defaultProps} />);
      const contentContainer = container.querySelector(".p-4");
      expect(contentContainer).toBeInTheDocument();
      expect(contentContainer).toHaveTextContent("Card Content");
    });

    it("should have p-4 padding on content area", () => {
      const { container } = render(<BaseCard {...defaultProps} />);
      const contentContainer = container.querySelector(".p-4");
      expect(contentContainer).toHaveClass("p-4");
    });
  });

  describe("Dark Mode Support", () => {
    it("should have dark:bg-gray-800 on card", () => {
      render(<BaseCard {...defaultProps} />);
      const link = screen.getByRole("link");
      expect(link).toHaveClass("dark:bg-gray-800");
    });

    it("should have dark:border-gray-700 on card", () => {
      render(<BaseCard {...defaultProps} />);
      const link = screen.getByRole("link");
      expect(link).toHaveClass("dark:border-gray-700");
    });

    it("should have dark:bg-gray-700 on image container", () => {
      const { container } = render(
        <BaseCard {...defaultProps} image="/product.jpg" />
      );
      const imageContainer = container.querySelector(".aspect-square");
      expect(imageContainer).toHaveClass("dark:bg-gray-700");
    });

    it("should have dark:bg-gray-700 on action buttons", () => {
      const actionButtons: ActionButton[] = [
        {
          icon: <Heart />,
          onClick: jest.fn(),
          label: "Favorite",
        },
      ];
      render(
        <BaseCard
          {...defaultProps}
          actionButtons={actionButtons}
          image="/product.jpg"
        />
      );
      const button = screen.getByLabelText("Favorite");
      expect(button).toHaveClass("dark:bg-gray-700");
    });

    it("should have dark:hover:bg-gray-600 on action buttons", () => {
      const actionButtons: ActionButton[] = [
        {
          icon: <Heart />,
          onClick: jest.fn(),
          label: "Favorite",
        },
      ];
      render(
        <BaseCard
          {...defaultProps}
          actionButtons={actionButtons}
          image="/product.jpg"
        />
      );
      const button = screen.getByLabelText("Favorite");
      expect(button).toHaveClass("dark:hover:bg-gray-600");
    });

    it("should have dark:text-gray-400 on inactive buttons", () => {
      const actionButtons: ActionButton[] = [
        {
          icon: <Heart />,
          onClick: jest.fn(),
          label: "Favorite",
        },
      ];
      render(
        <BaseCard
          {...defaultProps}
          actionButtons={actionButtons}
          image="/product.jpg"
        />
      );
      const button = screen.getByLabelText("Favorite");
      expect(button).toHaveClass("dark:text-gray-400");
    });
  });

  describe("Edge Cases", () => {
    it("should handle missing image and imageFallback", () => {
      render(<BaseCard {...defaultProps} />);
      expect(screen.getByText("Card Content")).toBeInTheDocument();
    });

    it("should handle empty badges array", () => {
      render(<BaseCard {...defaultProps} badges={[]} image="/product.jpg" />);
      expect(screen.getByRole("link")).toBeInTheDocument();
    });

    it("should handle empty actionButtons array", () => {
      render(
        <BaseCard {...defaultProps} actionButtons={[]} image="/product.jpg" />
      );
      expect(screen.getByRole("link")).toBeInTheDocument();
    });

    it("should handle multiple badges", () => {
      const manyBadges: Badge[] = [
        { text: "New", color: "yellow" },
        { text: "Sale", color: "red" },
        { text: "Hot", color: "orange" },
        { text: "Featured", color: "blue" },
      ];
      render(
        <BaseCard {...defaultProps} badges={manyBadges} image="/product.jpg" />
      );
      expect(screen.getByText("New")).toBeInTheDocument();
      expect(screen.getByText("Sale")).toBeInTheDocument();
      expect(screen.getByText("Hot")).toBeInTheDocument();
      expect(screen.getByText("Featured")).toBeInTheDocument();
    });

    it("should handle multiple action buttons", () => {
      const manyButtons: ActionButton[] = [
        { icon: <Heart />, onClick: jest.fn(), label: "Favorite" },
        { icon: <ShoppingCart />, onClick: jest.fn(), label: "Cart" },
        { icon: <div>👁</div>, onClick: jest.fn(), label: "View" },
      ];
      render(
        <BaseCard
          {...defaultProps}
          actionButtons={manyButtons}
          image="/product.jpg"
        />
      );
      expect(screen.getByLabelText("Favorite")).toBeInTheDocument();
      expect(screen.getByLabelText("Cart")).toBeInTheDocument();
      expect(screen.getByLabelText("View")).toBeInTheDocument();
    });

    it("should handle long badge text", () => {
      render(
        <BaseCard
          {...defaultProps}
          badges={[
            { text: "Very Long Badge Text That Might Wrap", color: "yellow" },
          ]}
          image="/product.jpg"
        />
      );
      expect(
        screen.getByText("Very Long Badge Text That Might Wrap")
      ).toBeInTheDocument();
    });

    it("should handle complex children", () => {
      render(
        <BaseCard {...defaultProps}>
          <div>
            <h3>Product Title</h3>
            <p>Description</p>
            <span>$99.99</span>
          </div>
        </BaseCard>
      );
      expect(screen.getByText("Product Title")).toBeInTheDocument();
      expect(screen.getByText("Description")).toBeInTheDocument();
      expect(screen.getByText("$99.99")).toBeInTheDocument();
    });

    it("should handle href with query parameters", () => {
      render(<BaseCard {...defaultProps} href="/product/123?variant=blue" />);
      const link = screen.getByRole("link");
      expect(link).toHaveAttribute("href", "/product/123?variant=blue");
    });

    it("should handle href with hash", () => {
      render(<BaseCard {...defaultProps} href="/product/123#reviews" />);
      const link = screen.getByRole("link");
      expect(link).toHaveAttribute("href", "/product/123#reviews");
    });
  });

  describe("Performance", () => {
    it("should render without crashing with all props", () => {
      const allProps = {
        ...defaultProps,
        image: "/product.jpg",
        badges: [
          { text: "New", color: "yellow" as const },
          { text: "Sale", color: "red" as const },
        ],
        actionButtons: [
          { icon: <Heart />, onClick: jest.fn(), label: "Favorite" },
          { icon: <ShoppingCart />, onClick: jest.fn(), label: "Cart" },
        ],
        imageOverlay: <button>Quick View</button>,
        className: "custom-class",
        imageClassName: "custom-image",
        priority: true,
        aspectRatio: "video" as const,
        onClick: jest.fn(),
      };
      expect(() => {
        render(<BaseCard {...allProps} />);
      }).not.toThrow();
    });

    it("should handle rapid clicks", () => {
      const mockClick = jest.fn();
      render(<BaseCard {...defaultProps} onClick={mockClick} />);
      const link = screen.getByRole("link");
      for (let i = 0; i < 10; i++) {
        fireEvent.click(link);
      }
      expect(mockClick).toHaveBeenCalledTimes(10);
    });
  });
});
