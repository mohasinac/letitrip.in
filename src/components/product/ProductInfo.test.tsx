import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { useRouter } from "next/navigation";
import { ProductInfo } from "./ProductInfo";
import { useCart } from "@/hooks/useCart";

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

jest.mock("@/hooks/useCart", () => ({
  useCart: jest.fn(),
}));

jest.mock("lucide-react", () => ({
  Star: ({ className }: any) => (
    <div data-testid="star-icon" className={className} />
  ),
  Heart: ({ className }: any) => (
    <div data-testid="heart-icon" className={className} />
  ),
  Share2: () => <div data-testid="share-icon" />,
  ShoppingCart: () => <div data-testid="cart-icon" />,
  Store: () => <div data-testid="store-icon" />,
  Truck: () => <div data-testid="truck-icon" />,
  Shield: () => <div data-testid="shield-icon" />,
  Check: () => <div data-testid="check-icon" />,
  Minus: () => <div data-testid="minus-icon" />,
  Plus: () => <div data-testid="plus-icon" />,
}));

const mockRouter = {
  push: jest.fn(),
  back: jest.fn(),
  forward: jest.fn(),
  refresh: jest.fn(),
  replace: jest.fn(),
  prefetch: jest.fn(),
};
const mockAddItem = jest.fn();
const mockUseCart = useCart as jest.MockedFunction<typeof useCart>;
const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;

beforeEach(() => {
  mockUseRouter.mockReturnValue(mockRouter as any);
  mockUseCart.mockReturnValue({
    addItem: mockAddItem,
    loading: false,
  } as any);
  mockRouter.push.mockReset();
  mockAddItem.mockReset();
  global.alert = jest.fn();
  Object.assign(navigator, {
    clipboard: {
      writeText: jest.fn(),
    },
  });
});

const mockProduct = {
  id: "prod1",
  name: "Vintage Collectible Watch",
  slug: "vintage-collectible-watch",
  actualPrice: 15000,
  originalPrice: 20000,
  salePrice: 15000,
  stock: 10,
  rating: 4.5,
  reviewCount: 42,
  shop_id: "shop1",
  shop_name: "Vintage Treasures",
  returnable: true,
  condition: "used" as const,
  status: "active",
  image: "https://example.com/watch.jpg",
};

describe("ProductInfo", () => {
  describe("Display", () => {
    it("renders product name", () => {
      render(<ProductInfo product={mockProduct} />);
      expect(screen.getByText("Vintage Collectible Watch")).toBeInTheDocument();
    });

    it("displays sale price", () => {
      render(<ProductInfo product={mockProduct} />);
      expect(screen.getByText(/₹15,000/)).toBeInTheDocument();
    });

    it("displays original price and discount when applicable", () => {
      render(<ProductInfo product={mockProduct} />);
      expect(screen.getByText(/₹20,000/)).toBeInTheDocument();
      expect(screen.getByText("25% OFF")).toBeInTheDocument();
    });

    it("displays rating and review count", () => {
      render(<ProductInfo product={mockProduct} />);
      expect(screen.getByText("4.5")).toBeInTheDocument();
      expect(screen.getByText("(42 reviews)")).toBeInTheDocument();
    });

    it("displays condition badge", () => {
      render(<ProductInfo product={mockProduct} />);
      expect(screen.getByText("used")).toBeInTheDocument();
    });

    it("displays stock status", () => {
      render(<ProductInfo product={mockProduct} />);
      expect(screen.getByText(/In Stock/)).toBeInTheDocument();
      expect(screen.getByText(/10 available/)).toBeInTheDocument();
    });

    it("displays seller name", () => {
      render(<ProductInfo product={mockProduct} />);
      expect(screen.getByText("Vintage Treasures")).toBeInTheDocument();
    });

    it("shows return policy when returnable", () => {
      render(<ProductInfo product={mockProduct} />);
      expect(screen.getByText(/7-day return policy/)).toBeInTheDocument();
    });

    it("shows all star icons for rating", () => {
      render(<ProductInfo product={mockProduct} />);
      const stars = screen.getAllByTestId("star-icon");
      expect(stars).toHaveLength(5);
    });
  });

  describe("Out of Stock", () => {
    it("displays out of stock message when stock is 0", () => {
      const outOfStockProduct = { ...mockProduct, stock: 0 };
      render(<ProductInfo product={outOfStockProduct} />);
      expect(screen.getByText("Out of Stock")).toBeInTheDocument();
    });

    it("displays out of stock when status is not active", () => {
      const inactiveProduct = { ...mockProduct, status: "inactive" };
      render(<ProductInfo product={inactiveProduct} />);
      expect(screen.getByText("Out of Stock")).toBeInTheDocument();
    });

    it("disables add to cart button when out of stock", () => {
      const outOfStockProduct = { ...mockProduct, stock: 0 };
      render(<ProductInfo product={outOfStockProduct} />);
      const addToCartButton = screen.getByRole("button", {
        name: /Add to Cart/,
      });
      expect(addToCartButton).toBeDisabled();
    });

    it("disables buy now button when out of stock", () => {
      const outOfStockProduct = { ...mockProduct, stock: 0 };
      render(<ProductInfo product={outOfStockProduct} />);
      const buyNowButton = screen.getByRole("button", { name: /Buy Now/ });
      expect(buyNowButton).toBeDisabled();
    });

    it("hides quantity selector when out of stock", () => {
      const outOfStockProduct = { ...mockProduct, stock: 0 };
      render(<ProductInfo product={outOfStockProduct} />);
      expect(screen.queryByLabelText("Quantity")).not.toBeInTheDocument();
    });
  });

  describe("Quantity Selection", () => {
    it("starts with quantity of 1", () => {
      render(<ProductInfo product={mockProduct} />);
      const quantityInput = screen.getByRole("spinbutton");
      expect(quantityInput).toHaveValue(1);
    });

    it("increases quantity when plus button clicked", () => {
      render(<ProductInfo product={mockProduct} />);
      const plusButtons = screen.getAllByTestId("plus-icon");
      const plusButton = plusButtons[0].closest("button")!;
      const quantityInput = screen.getByRole("spinbutton");

      fireEvent.click(plusButton);
      expect(quantityInput).toHaveValue(2);
    });

    it("decreases quantity when minus button clicked", () => {
      render(<ProductInfo product={mockProduct} />);
      const plusButtons = screen.getAllByTestId("plus-icon");
      const minusButtons = screen.getAllByTestId("minus-icon");
      const plusButton = plusButtons[0].closest("button")!;
      const minusButton = minusButtons[0].closest("button")!;
      const quantityInput = screen.getByRole("spinbutton");

      fireEvent.click(plusButton);
      fireEvent.click(plusButton);
      expect(quantityInput).toHaveValue(3);

      fireEvent.click(minusButton);
      expect(quantityInput).toHaveValue(2);
    });

    it("does not decrease below 1", () => {
      render(<ProductInfo product={mockProduct} />);
      const minusButtons = screen.getAllByTestId("minus-icon");
      const minusButton = minusButtons[0].closest("button")!;
      const quantityInput = screen.getByRole("spinbutton");

      expect(quantityInput).toHaveValue(1);
      expect(minusButton).toBeDisabled();
    });

    it("does not increase above stock limit", () => {
      const lowStockProduct = { ...mockProduct, stock: 2 };
      render(<ProductInfo product={lowStockProduct} />);
      const plusButtons = screen.getAllByTestId("plus-icon");
      const plusButton = plusButtons[0].closest("button")!;
      const quantityInput = screen.getByRole("spinbutton");

      fireEvent.click(plusButton);
      fireEvent.click(plusButton);
      expect(quantityInput).toHaveValue(2);
      expect(plusButton).toBeDisabled();
    });

    it("allows manual quantity input", () => {
      render(<ProductInfo product={mockProduct} />);
      const quantityInput = screen.getByRole("spinbutton");

      fireEvent.change(quantityInput, { target: { value: "5" } });
      expect(quantityInput).toHaveValue(5);
    });

    it("constrains manual input to stock limit", () => {
      const lowStockProduct = { ...mockProduct, stock: 3 };
      render(<ProductInfo product={lowStockProduct} />);
      const quantityInput = screen.getByRole("spinbutton");

      fireEvent.change(quantityInput, { target: { value: "10" } });
      expect(quantityInput).toHaveValue(3);
    });

    it("constrains manual input to minimum 1", () => {
      render(<ProductInfo product={mockProduct} />);
      const quantityInput = screen.getByRole("spinbutton");

      fireEvent.change(quantityInput, { target: { value: "-5" } });
      expect(quantityInput).toHaveValue(1);
    });
  });

  describe("Add to Cart", () => {
    it("calls addItem when add to cart is clicked", async () => {
      mockAddItem.mockResolvedValue(undefined);
      render(<ProductInfo product={mockProduct} />);

      const addToCartButton = screen.getByRole("button", {
        name: /Add to Cart/,
      });
      fireEvent.click(addToCartButton);

      await waitFor(() => {
        expect(mockAddItem).toHaveBeenCalledWith(
          "prod1",
          1,
          undefined,
          expect.objectContaining({
            name: "Vintage Collectible Watch",
            price: 15000,
            image: "https://example.com/watch.jpg",
            shopId: "shop1",
            shopName: "Vintage Treasures",
          })
        );
      });
    });

    it("adds correct quantity to cart", async () => {
      mockAddItem.mockResolvedValue(undefined);
      render(<ProductInfo product={mockProduct} />);

      const plusButtons = screen.getAllByTestId("plus-icon");
      const plusButton = plusButtons[0].closest("button")!;
      fireEvent.click(plusButton);
      fireEvent.click(plusButton);

      const addToCartButton = screen.getByRole("button", {
        name: /Add to Cart/,
      });
      fireEvent.click(addToCartButton);

      await waitFor(() => {
        expect(mockAddItem).toHaveBeenCalledWith(
          "prod1",
          3,
          undefined,
          expect.any(Object)
        );
      });
    });

    it("shows alert on successful add to cart", async () => {
      mockAddItem.mockResolvedValue(undefined);
      render(<ProductInfo product={mockProduct} />);

      const addToCartButton = screen.getByRole("button", {
        name: /Add to Cart/,
      });
      fireEvent.click(addToCartButton);

      await waitFor(() => {
        expect(global.alert).toHaveBeenCalledWith("Added to cart!");
      });
    });

    it("shows error alert when add to cart fails", async () => {
      mockAddItem.mockRejectedValue(new Error("Failed"));
      render(<ProductInfo product={mockProduct} />);

      const addToCartButton = screen.getByRole("button", {
        name: /Add to Cart/,
      });
      fireEvent.click(addToCartButton);

      await waitFor(() => {
        expect(global.alert).toHaveBeenCalledWith("Failed to add to cart");
      });
    });

    it("disables button while cart is loading", () => {
      mockUseCart.mockReturnValue({
        addItem: mockAddItem,
        loading: true,
      } as any);

      render(<ProductInfo product={mockProduct} />);

      const addToCartButton = screen.getByRole("button", {
        name: /Add to Cart/,
      });
      expect(addToCartButton).toBeDisabled();
    });
  });

  describe("Buy Now", () => {
    it("adds to cart and navigates to checkout", async () => {
      mockAddItem.mockResolvedValue(undefined);
      render(<ProductInfo product={mockProduct} />);

      const buyNowButton = screen.getByRole("button", { name: /Buy Now/ });
      fireEvent.click(buyNowButton);

      await waitFor(() => {
        expect(mockAddItem).toHaveBeenCalled();
        expect(mockRouter.push).toHaveBeenCalledWith("/checkout");
      });
    });
  });

  describe("Favorites", () => {
    it("toggles favorite state when clicked", () => {
      render(<ProductInfo product={mockProduct} />);

      const favoriteButton = screen.getByRole("button", {
        name: /Add to Favorites/,
      });
      fireEvent.click(favoriteButton);

      expect(screen.getByText("Saved")).toBeInTheDocument();
    });

    it("shows filled heart when favorited", () => {
      render(<ProductInfo product={mockProduct} />);

      const favoriteButton = screen.getByRole("button", {
        name: /Add to Favorites/,
      });
      fireEvent.click(favoriteButton);

      const heartIcon = screen.getByTestId("heart-icon");
      expect(heartIcon).toHaveClass("fill-red-500");
    });
  });

  describe("Share", () => {
    it("uses native share if available", async () => {
      const mockShare = jest.fn().mockResolvedValue(undefined);
      Object.assign(navigator, {
        share: mockShare,
      });

      render(<ProductInfo product={mockProduct} />);

      const shareButtons = screen.getAllByTestId("share-icon");
      const shareButton = shareButtons[0].closest("button")!;
      fireEvent.click(shareButton);

      await waitFor(() => {
        expect(mockShare).toHaveBeenCalledWith({
          title: "Vintage Collectible Watch",
          url: expect.any(String),
        });
      });
    });

    it("falls back to clipboard if share not available", async () => {
      Object.assign(navigator, {
        share: undefined,
        clipboard: {
          writeText: jest.fn(),
        },
      });

      render(<ProductInfo product={mockProduct} />);

      const shareButtons = screen.getAllByTestId("share-icon");
      const shareButton = shareButtons[0].closest("button")!;
      fireEvent.click(shareButton);

      await waitFor(() => {
        expect(navigator.clipboard.writeText).toHaveBeenCalled();
        expect(global.alert).toHaveBeenCalledWith("Link copied to clipboard!");
      });
    });
  });

  describe("Seller Navigation", () => {
    it("navigates to shop page when seller name clicked", () => {
      render(<ProductInfo product={mockProduct} />);

      const sellerButton = screen.getByRole("button", {
        name: "Vintage Treasures",
      });
      fireEvent.click(sellerButton);

      expect(mockRouter.push).toHaveBeenCalledWith("/shops/shop1");
    });
  });

  describe("Features Display", () => {
    it("shows free shipping info", () => {
      render(<ProductInfo product={mockProduct} />);
      expect(
        screen.getByText(/Free shipping on orders above/)
      ).toBeInTheDocument();
    });

    it("shows authentic products badge", () => {
      render(<ProductInfo product={mockProduct} />);
      expect(screen.getByText("100% authentic products")).toBeInTheDocument();
    });

    it("hides return policy when not returnable", () => {
      const nonReturnableProduct = { ...mockProduct, returnable: false };
      render(<ProductInfo product={nonReturnableProduct} />);
      expect(screen.queryByText(/7-day return policy/)).not.toBeInTheDocument();
    });
  });

  describe("Discount Calculation", () => {
    it("calculates discount percentage correctly", () => {
      const discountProduct = {
        ...mockProduct,
        originalPrice: 10000,
        salePrice: 7500,
      };
      render(<ProductInfo product={discountProduct} />);
      expect(screen.getByText("25% OFF")).toBeInTheDocument();
    });

    it("does not show discount when prices are equal", () => {
      const noDiscountProduct = {
        ...mockProduct,
        originalPrice: 15000,
        salePrice: 15000,
      };
      render(<ProductInfo product={noDiscountProduct} />);
      expect(screen.queryByText(/% OFF/)).not.toBeInTheDocument();
    });

    it("does not show discount when no original price", () => {
      const { originalPrice, ...noOriginalProduct } = mockProduct;
      render(<ProductInfo product={noOriginalProduct as any} />);
      expect(screen.queryByText(/% OFF/)).not.toBeInTheDocument();
    });
  });

  describe("Edge Cases", () => {
    it("handles product without rating", () => {
      const { rating, reviewCount, ...noRatingProduct } = mockProduct;
      render(<ProductInfo product={noRatingProduct as any} />);
      expect(screen.queryByText(/reviews/)).not.toBeInTheDocument();
    });

    it("handles product without condition", () => {
      const { condition, ...noConditionProduct } = mockProduct;
      render(<ProductInfo product={noConditionProduct as any} />);
      expect(screen.queryByText("used")).not.toBeInTheDocument();
    });

    it("handles product without image", () => {
      const { image, ...noImageProduct } = mockProduct;
      render(<ProductInfo product={noImageProduct as any} />);
      // Component should still render without errors
      expect(screen.getByText("Vintage Collectible Watch")).toBeInTheDocument();
    });
  });
});
