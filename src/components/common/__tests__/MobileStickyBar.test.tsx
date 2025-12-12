import { useIsMobile } from "@/hooks/useMobile";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import MobileStickyBar from "../MobileStickyBar";

// Mock dependencies
jest.mock("@/hooks/useMobile");
jest.mock("@/components/common/values/Price", () => ({
  Price: ({ amount }: { amount: number }) => <span>{amount}</span>,
}));

const mockUseIsMobile = useIsMobile as jest.MockedFunction<typeof useIsMobile>;

describe("MobileStickyBar Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Mobile detection
  describe("Mobile Detection", () => {
    it("renders when isMobile is true", () => {
      mockUseIsMobile.mockReturnValue(true);
      render(<MobileStickyBar type="product" price={1000} />);

      expect(screen.getByText("1000")).toBeInTheDocument();
    });

    it("does not render when isMobile is false", () => {
      mockUseIsMobile.mockReturnValue(false);
      const { container } = render(
        <MobileStickyBar type="product" price={1000} />
      );

      expect(container.firstChild).toBeNull();
    });
  });

  describe("Product Type", () => {
    beforeEach(() => {
      mockUseIsMobile.mockReturnValue(true);
    });

    // Basic rendering
    describe("Basic Rendering", () => {
      it("renders product type sticky bar", () => {
        render(<MobileStickyBar type="product" price={1000} />);
        expect(screen.getByText("1000")).toBeInTheDocument();
      });

      it("has fixed positioning at bottom", () => {
        const { container } = render(
          <MobileStickyBar type="product" price={1000} />
        );
        const bar = container.querySelector(".fixed.bottom-0.left-0.right-0");
        expect(bar).toBeInTheDocument();
      });

      it("has z-40 stacking", () => {
        const { container } = render(
          <MobileStickyBar type="product" price={1000} />
        );
        const bar = container.querySelector(".z-40");
        expect(bar).toBeInTheDocument();
      });

      it("has white background", () => {
        const { container } = render(
          <MobileStickyBar type="product" price={1000} />
        );
        const bar = container.querySelector(".bg-white");
        expect(bar).toBeInTheDocument();
      });

      it("has dark mode background", () => {
        const { container } = render(
          <MobileStickyBar type="product" price={1000} />
        );
        const bar = container.querySelector(".dark\\:bg-gray-800");
        expect(bar).toBeInTheDocument();
      });

      it("has border and shadow", () => {
        const { container } = render(
          <MobileStickyBar type="product" price={1000} />
        );
        const bar = container.querySelector(".border-t.shadow-lg");
        expect(bar).toBeInTheDocument();
      });
    });

    // Price display
    describe("Price Display", () => {
      it("displays product price", () => {
        render(<MobileStickyBar type="product" price={1500} />);
        expect(screen.getByText("1500")).toBeInTheDocument();
      });

      it("displays original price when provided", () => {
        render(
          <MobileStickyBar type="product" price={1000} originalPrice={1500} />
        );
        expect(screen.getByText("1500")).toBeInTheDocument();
      });

      it("shows original price with line-through when higher than current price", () => {
        const { container } = render(
          <MobileStickyBar type="product" price={1000} originalPrice={1500} />
        );
        const originalPriceEl = container.querySelector(".line-through");
        expect(originalPriceEl).toBeInTheDocument();
      });

      it("does not show original price when equal to current price", () => {
        const { container } = render(
          <MobileStickyBar type="product" price={1000} originalPrice={1000} />
        );
        const originalPriceEl = container.querySelector(".line-through");
        expect(originalPriceEl).not.toBeInTheDocument();
      });

      it("does not show original price when lower than current price", () => {
        const { container } = render(
          <MobileStickyBar type="product" price={1500} originalPrice={1000} />
        );
        const originalPriceEl = container.querySelector(".line-through");
        expect(originalPriceEl).not.toBeInTheDocument();
      });

      it("price has text-xl font-bold styling", () => {
        const { container } = render(
          <MobileStickyBar type="product" price={1000} />
        );
        const priceEl = container.querySelector(".text-xl.font-bold");
        expect(priceEl).toBeInTheDocument();
      });

      it("price has dark mode text color", () => {
        const { container } = render(
          <MobileStickyBar type="product" price={1000} />
        );
        const priceEl = container.querySelector(
          ".text-gray-900.dark\\:text-white"
        );
        expect(priceEl).toBeInTheDocument();
      });
    });

    // Stock status
    describe("Stock Status", () => {
      it("does not show out of stock message when inStock is true", () => {
        render(<MobileStickyBar type="product" price={1000} inStock={true} />);
        expect(screen.queryByText("Out of Stock")).not.toBeInTheDocument();
      });

      it("shows out of stock message when inStock is false", () => {
        render(<MobileStickyBar type="product" price={1000} inStock={false} />);
        expect(screen.getByText("Out of Stock")).toBeInTheDocument();
      });

      it("out of stock message has red text", () => {
        render(<MobileStickyBar type="product" price={1000} inStock={false} />);
        const message = screen.getByText("Out of Stock");
        expect(message).toHaveClass("text-red-600", "dark:text-red-400");
      });

      it("out of stock message has text-xs size", () => {
        render(<MobileStickyBar type="product" price={1000} inStock={false} />);
        const message = screen.getByText("Out of Stock");
        expect(message).toHaveClass("text-xs");
      });
    });

    // Add to Cart button
    describe("Add to Cart Button", () => {
      it("renders add to cart button when onAddToCart provided", () => {
        const mockAddToCart = jest.fn();
        render(
          <MobileStickyBar
            type="product"
            price={1000}
            onAddToCart={mockAddToCart}
          />
        );
        expect(
          screen.getByRole("button", { name: /add/i })
        ).toBeInTheDocument();
      });

      it("does not render add to cart button when onAddToCart not provided", () => {
        render(<MobileStickyBar type="product" price={1000} />);
        expect(
          screen.queryByRole("button", { name: /add/i })
        ).not.toBeInTheDocument();
      });

      it("calls onAddToCart when clicked", async () => {
        const mockAddToCart = jest.fn();
        const user = userEvent.setup();

        render(
          <MobileStickyBar
            type="product"
            price={1000}
            onAddToCart={mockAddToCart}
          />
        );

        const button = screen.getByRole("button", { name: /add/i });
        await user.click(button);

        expect(mockAddToCart).toHaveBeenCalledTimes(1);
      });

      it('shows "Adding..." text when adding', async () => {
        const mockAddToCart = jest.fn(
          () => new Promise((resolve) => setTimeout(resolve, 100))
        );
        const user = userEvent.setup();

        render(
          <MobileStickyBar
            type="product"
            price={1000}
            onAddToCart={mockAddToCart}
          />
        );

        const button = screen.getByRole("button", { name: /add/i });
        await user.click(button);

        expect(screen.getByText("Adding...")).toBeInTheDocument();
      });

      it("is disabled when out of stock", () => {
        render(
          <MobileStickyBar
            type="product"
            price={1000}
            inStock={false}
            onAddToCart={jest.fn()}
          />
        );

        const button = screen.getByRole("button", { name: /add/i });
        expect(button).toBeDisabled();
      });

      it("is disabled when disabled prop is true", () => {
        render(
          <MobileStickyBar
            type="product"
            price={1000}
            disabled={true}
            onAddToCart={jest.fn()}
          />
        );

        const button = screen.getByRole("button", { name: /add/i });
        expect(button).toBeDisabled();
      });

      it("has blue background", () => {
        render(
          <MobileStickyBar
            type="product"
            price={1000}
            onAddToCart={jest.fn()}
          />
        );
        const button = screen.getByRole("button", { name: /add/i });
        expect(button).toHaveClass("bg-blue-600");
      });

      it("has shopping cart icon", () => {
        const { container } = render(
          <MobileStickyBar
            type="product"
            price={1000}
            onAddToCart={jest.fn()}
          />
        );
        const icon = container.querySelector(".lucide-shopping-cart");
        expect(icon).toBeInTheDocument();
      });
    });

    // Buy Now button
    describe("Buy Now Button", () => {
      it("renders buy now button when onBuyNow provided", () => {
        render(
          <MobileStickyBar type="product" price={1000} onBuyNow={jest.fn()} />
        );
        expect(
          screen.getByRole("button", { name: /buy now/i })
        ).toBeInTheDocument();
      });

      it("calls onBuyNow when clicked", async () => {
        const mockBuyNow = jest.fn();
        const user = userEvent.setup();

        render(
          <MobileStickyBar type="product" price={1000} onBuyNow={mockBuyNow} />
        );

        const button = screen.getByRole("button", { name: /buy now/i });
        await user.click(button);

        expect(mockBuyNow).toHaveBeenCalledTimes(1);
      });

      it("is disabled when out of stock", () => {
        render(
          <MobileStickyBar
            type="product"
            price={1000}
            inStock={false}
            onBuyNow={jest.fn()}
          />
        );

        const button = screen.getByRole("button", { name: /buy now/i });
        expect(button).toBeDisabled();
      });

      it("has green background", () => {
        render(
          <MobileStickyBar type="product" price={1000} onBuyNow={jest.fn()} />
        );
        const button = screen.getByRole("button", { name: /buy now/i });
        expect(button).toHaveClass("bg-green-600");
      });
    });

    // Wishlist button
    describe("Wishlist Button", () => {
      it("renders wishlist button when onAddToWishlist provided", () => {
        render(
          <MobileStickyBar
            type="product"
            price={1000}
            onAddToWishlist={jest.fn()}
          />
        );
        const button = screen.getByRole("button", { name: /add to wishlist/i });
        expect(button).toBeInTheDocument();
      });

      it("calls onAddToWishlist when clicked", async () => {
        const mockAddToWishlist = jest.fn();
        const user = userEvent.setup();

        render(
          <MobileStickyBar
            type="product"
            price={1000}
            onAddToWishlist={mockAddToWishlist}
          />
        );

        const button = screen.getByRole("button", { name: /add to wishlist/i });
        await user.click(button);

        expect(mockAddToWishlist).toHaveBeenCalledTimes(1);
      });

      it("has heart icon", () => {
        const { container } = render(
          <MobileStickyBar
            type="product"
            price={1000}
            onAddToWishlist={jest.fn()}
          />
        );
        const icon = container.querySelector(".lucide-heart");
        expect(icon).toBeInTheDocument();
      });

      it("has border styling", () => {
        render(
          <MobileStickyBar
            type="product"
            price={1000}
            onAddToWishlist={jest.fn()}
          />
        );
        const button = screen.getByRole("button", { name: /add to wishlist/i });
        expect(button).toHaveClass("border", "border-gray-300");
      });

      it("has w-12 h-12 size", () => {
        render(
          <MobileStickyBar
            type="product"
            price={1000}
            onAddToWishlist={jest.fn()}
          />
        );
        const button = screen.getByRole("button", { name: /add to wishlist/i });
        expect(button).toHaveClass("w-12", "h-12");
      });
    });

    // Multiple buttons
    describe("Multiple Buttons", () => {
      it("can render all buttons together", () => {
        render(
          <MobileStickyBar
            type="product"
            price={1000}
            onAddToCart={jest.fn()}
            onBuyNow={jest.fn()}
            onAddToWishlist={jest.fn()}
          />
        );

        const buttons = screen.getAllByRole("button");
        expect(buttons).toHaveLength(3);
        expect(
          screen.getByRole("button", { name: /buy now/i })
        ).toBeInTheDocument();
        expect(
          screen.getByRole("button", { name: /add to wishlist/i })
        ).toBeInTheDocument();
      });
    });
  });

  describe("Auction Type", () => {
    beforeEach(() => {
      mockUseIsMobile.mockReturnValue(true);
    });

    // Basic rendering
    describe("Basic Rendering", () => {
      it("renders auction type sticky bar", () => {
        render(<MobileStickyBar type="auction" currentBid={5000} />);
        expect(screen.getByText("Current Bid")).toBeInTheDocument();
      });

      it("displays current bid amount", () => {
        render(<MobileStickyBar type="auction" currentBid={5000} />);
        expect(screen.getByText("5000")).toBeInTheDocument();
      });

      it("current bid label has text-xs size", () => {
        render(<MobileStickyBar type="auction" currentBid={5000} />);
        const label = screen.getByText("Current Bid");
        expect(label).toHaveClass("text-xs");
      });

      it("current bid label has gray color", () => {
        render(<MobileStickyBar type="auction" currentBid={5000} />);
        const label = screen.getByText("Current Bid");
        expect(label).toHaveClass("text-gray-600", "dark:text-gray-400");
      });
    });

    // Place Bid button
    describe("Place Bid Button", () => {
      it("renders place bid button when onPlaceBid provided", () => {
        render(
          <MobileStickyBar
            type="auction"
            currentBid={5000}
            onPlaceBid={jest.fn()}
          />
        );
        expect(
          screen.getByRole("button", { name: /place bid/i })
        ).toBeInTheDocument();
      });

      it("calls onPlaceBid when clicked", async () => {
        const mockPlaceBid = jest.fn();
        const user = userEvent.setup();

        render(
          <MobileStickyBar
            type="auction"
            currentBid={5000}
            onPlaceBid={mockPlaceBid}
          />
        );

        const button = screen.getByRole("button", { name: /place bid/i });
        await user.click(button);

        expect(mockPlaceBid).toHaveBeenCalledTimes(1);
      });

      it('shows "Place Bid" text when auction is active', () => {
        render(
          <MobileStickyBar
            type="auction"
            currentBid={5000}
            isActive={true}
            onPlaceBid={jest.fn()}
          />
        );
        expect(screen.getByText("Place Bid")).toBeInTheDocument();
      });

      it('shows "Ended" text when auction is not active', () => {
        render(
          <MobileStickyBar
            type="auction"
            currentBid={5000}
            isActive={false}
            onPlaceBid={jest.fn()}
          />
        );
        expect(screen.getByText("Ended")).toBeInTheDocument();
      });

      it("is disabled when auction is not active", () => {
        render(
          <MobileStickyBar
            type="auction"
            currentBid={5000}
            isActive={false}
            onPlaceBid={jest.fn()}
          />
        );

        const button = screen.getByRole("button", { name: /ended/i });
        expect(button).toBeDisabled();
      });

      it("is disabled when disabled prop is true", () => {
        render(
          <MobileStickyBar
            type="auction"
            currentBid={5000}
            disabled={true}
            onPlaceBid={jest.fn()}
          />
        );

        const button = screen.getByRole("button", { name: /place bid/i });
        expect(button).toBeDisabled();
      });

      it("has gavel icon", () => {
        const { container } = render(
          <MobileStickyBar
            type="auction"
            currentBid={5000}
            onPlaceBid={jest.fn()}
          />
        );
        const icon = container.querySelector(".lucide-gavel");
        expect(icon).toBeInTheDocument();
      });

      it("has flex-1 to fill space", () => {
        render(
          <MobileStickyBar
            type="auction"
            currentBid={5000}
            onPlaceBid={jest.fn()}
          />
        );
        const button = screen.getByRole("button", { name: /place bid/i });
        expect(button).toHaveClass("flex-1");
      });

      it("has h-12 height", () => {
        render(
          <MobileStickyBar
            type="auction"
            currentBid={5000}
            onPlaceBid={jest.fn()}
          />
        );
        const button = screen.getByRole("button", { name: /place bid/i });
        expect(button).toHaveClass("h-12");
      });
    });

    // Watchlist button
    describe("Watchlist Button", () => {
      it("renders watchlist button when onAddToWishlist provided", () => {
        render(
          <MobileStickyBar
            type="auction"
            currentBid={5000}
            onAddToWishlist={jest.fn()}
          />
        );
        const button = screen.getByRole("button", {
          name: /add to watchlist/i,
        });
        expect(button).toBeInTheDocument();
      });

      it("has heart icon", () => {
        const { container } = render(
          <MobileStickyBar
            type="auction"
            currentBid={5000}
            onAddToWishlist={jest.fn()}
          />
        );
        const icon = container.querySelector(".lucide-heart");
        expect(icon).toBeInTheDocument();
      });
    });

    // Both buttons
    describe("Multiple Buttons", () => {
      it("can render place bid and watchlist buttons together", () => {
        render(
          <MobileStickyBar
            type="auction"
            currentBid={5000}
            onPlaceBid={jest.fn()}
            onAddToWishlist={jest.fn()}
          />
        );

        expect(
          screen.getByRole("button", { name: /place bid/i })
        ).toBeInTheDocument();
        expect(
          screen.getByRole("button", { name: /add to watchlist/i })
        ).toBeInTheDocument();
      });
    });
  });

  // Custom className
  describe("Custom Styling", () => {
    beforeEach(() => {
      mockUseIsMobile.mockReturnValue(true);
    });

    it("accepts custom className", () => {
      const { container } = render(
        <MobileStickyBar type="product" price={1000} className="custom-bar" />
      );
      const bar = container.querySelector(".custom-bar");
      expect(bar).toBeInTheDocument();
    });
  });

  // Layout
  describe("Layout", () => {
    beforeEach(() => {
      mockUseIsMobile.mockReturnValue(true);
    });

    it("has px-4 py-3 padding", () => {
      const { container } = render(
        <MobileStickyBar type="product" price={1000} />
      );
      const content = container.querySelector(".px-4.py-3");
      expect(content).toBeInTheDocument();
    });

    it("uses flexbox layout with gap-3", () => {
      const { container } = render(
        <MobileStickyBar type="product" price={1000} />
      );
      const layout = container.querySelector(".flex.items-center.gap-3");
      expect(layout).toBeInTheDocument();
    });

    it("price section has flex-1 and min-w-0", () => {
      const { container } = render(
        <MobileStickyBar type="product" price={1000} />
      );
      const priceSection = container.querySelector(".flex-1.min-w-0");
      expect(priceSection).toBeInTheDocument();
    });
  });

  // Edge cases
  describe("Edge Cases", () => {
    beforeEach(() => {
      mockUseIsMobile.mockReturnValue(true);
    });

    it("handles price of 0", () => {
      render(<MobileStickyBar type="product" price={0} />);
      expect(screen.getByText("0")).toBeInTheDocument();
    });

    it("handles currentBid of 0", () => {
      render(<MobileStickyBar type="auction" currentBid={0} />);
      expect(screen.getByText("0")).toBeInTheDocument();
    });

    it("handles undefined price", () => {
      render(<MobileStickyBar type="product" />);
      expect(screen.getByText("0")).toBeInTheDocument();
    });

    it("handles async onAddToCart", async () => {
      const mockAddToCart = jest.fn(
        () => new Promise((resolve) => setTimeout(resolve, 50))
      );
      const user = userEvent.setup();

      render(
        <MobileStickyBar
          type="product"
          price={1000}
          onAddToCart={mockAddToCart}
        />
      );

      const button = screen.getByRole("button", { name: /add/i });
      await user.click(button);

      expect(screen.getByText("Adding...")).toBeInTheDocument();

      await waitFor(() => {
        expect(screen.queryByText("Adding...")).not.toBeInTheDocument();
      });
    });

    it("handles async onAddToCart error gracefully", async () => {
      const mockAddToCart = jest.fn().mockRejectedValue(new Error("Failed"));
      const user = userEvent.setup();

      render(
        <MobileStickyBar
          type="product"
          price={1000}
          onAddToCart={mockAddToCart}
        />
      );

      const button = screen.getByRole("button", { name: /add/i });

      // Click and wait for state to settle
      await user.click(button);

      await waitFor(() => {
        expect(screen.queryByText("Adding...")).not.toBeInTheDocument();
      });

      expect(mockAddToCart).toHaveBeenCalled();
    });
  });

  // Dark mode
  describe("Dark Mode", () => {
    beforeEach(() => {
      mockUseIsMobile.mockReturnValue(true);
    });

    it("applies dark mode to background", () => {
      const { container } = render(
        <MobileStickyBar type="product" price={1000} />
      );
      const bar = container.querySelector(".dark\\:bg-gray-800");
      expect(bar).toBeInTheDocument();
    });

    it("applies dark mode to border", () => {
      const { container } = render(
        <MobileStickyBar type="product" price={1000} />
      );
      const bar = container.querySelector(".dark\\:border-gray-700");
      expect(bar).toBeInTheDocument();
    });

    it("applies dark mode to disabled buttons", () => {
      render(
        <MobileStickyBar
          type="product"
          price={1000}
          inStock={false}
          onAddToCart={jest.fn()}
        />
      );

      const button = screen.getByRole("button", { name: /add/i });
      expect(button).toHaveClass("dark:disabled:bg-gray-600");
    });
  });
});
