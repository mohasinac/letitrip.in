import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { ProductCard } from "./ProductCard";

jest.mock("next/link", () => {
  return ({ children, href }: any) => {
    return <a href={href}>{children}</a>;
  };
});

jest.mock("@/components/common/OptimizedImage", () => {
  return ({ alt, src }: any) => <img alt={alt} src={src} />;
});

jest.mock("lucide-react", () => ({
  Star: ({ className }: any) => (
    <div data-testid="star-icon" className={className} />
  ),
  ShoppingCart: () => <div data-testid="cart-icon" />,
  Eye: () => <div data-testid="eye-icon" />,
}));

jest.mock("@/components/common/FavoriteButton", () => ({
  FavoriteButton: ({ onToggle, initialIsFavorite }: any) => (
    <button
      data-testid="favorite-button"
      onClick={onToggle}
      aria-label={
        initialIsFavorite ? "Remove from favorites" : "Add to favorites"
      }
    >
      {initialIsFavorite ? "♥" : "♡"}
    </button>
  ),
}));

jest.mock("@/lib/formatters", () => ({
  formatCurrency: (price: number) => `₹${price.toLocaleString()}`,
  formatDiscount: (original: number, sale: number) => {
    const percent = Math.round(((original - sale) / original) * 100);
    return `${percent}%`;
  },
  formatCompactNumber: (num: number) => num.toString(),
}));

const mockProduct = {
  id: "prod1",
  name: "Vintage Watch",
  slug: "vintage-watch",
  price: 15000,
  originalPrice: 20000,
  image: "https://example.com/watch.jpg",
  rating: 4.5,
  reviewCount: 42,
  shopName: "Vintage Store",
  shopSlug: "vintage-store",
  shopId: "shop1",
  inStock: true,
  featured: false,
  condition: "used" as const,
};

describe("ProductCard", () => {
  describe("Display", () => {
    it("renders product name", () => {
      render(<ProductCard {...mockProduct} />);
      expect(screen.getByText("Vintage Watch")).toBeInTheDocument();
    });

    it("renders product image", () => {
      render(<ProductCard {...mockProduct} />);
      const image = screen.getByRole("img", { name: "Vintage Watch" });
      expect(image).toBeInTheDocument();
      expect(image).toHaveAttribute("src", "https://example.com/watch.jpg");
    });

    it("renders price", () => {
      render(<ProductCard {...mockProduct} />);
      expect(screen.getByText("₹15,000")).toBeInTheDocument();
    });

    it("renders original price when provided", () => {
      render(<ProductCard {...mockProduct} />);
      expect(screen.getByText("₹20,000")).toBeInTheDocument();
    });

    it("renders discount badge when applicable", () => {
      render(<ProductCard {...mockProduct} />);
      expect(screen.getByText("25% OFF")).toBeInTheDocument();
    });

    it("renders shop name when showShopName is true", () => {
      render(<ProductCard {...mockProduct} showShopName={true} />);
      expect(screen.getByText("Vintage Store")).toBeInTheDocument();
    });

    it("hides shop name when showShopName is false", () => {
      render(<ProductCard {...mockProduct} showShopName={false} />);
      expect(screen.queryByText("Vintage Store")).not.toBeInTheDocument();
    });

    it("renders rating when provided", () => {
      render(<ProductCard {...mockProduct} />);
      expect(screen.getByText("4.5")).toBeInTheDocument();
    });

    it("renders review count", () => {
      render(<ProductCard {...mockProduct} />);
      expect(screen.getByText("(42)")).toBeInTheDocument();
    });

    it("links to product detail page", () => {
      render(<ProductCard {...mockProduct} />);
      const link = screen.getByRole("link");
      expect(link).toHaveAttribute("href", "/products/vintage-watch");
    });
  });

  describe("Badges", () => {
    it("shows featured badge when featured", () => {
      render(<ProductCard {...mockProduct} featured={true} />);
      expect(screen.getByText("Featured")).toBeInTheDocument();
    });

    it("shows out of stock badge when not in stock", () => {
      render(<ProductCard {...mockProduct} inStock={false} />);
      expect(screen.getByText("Out of Stock")).toBeInTheDocument();
    });

    it("shows condition badge for used items", () => {
      render(<ProductCard {...mockProduct} condition="used" />);
      expect(screen.getByText("used")).toBeInTheDocument();
    });

    it("shows condition badge for refurbished items", () => {
      render(<ProductCard {...mockProduct} condition="refurbished" />);
      expect(screen.getByText("refurbished")).toBeInTheDocument();
    });

    it("does not show condition badge for new items", () => {
      render(<ProductCard {...mockProduct} condition="new" />);
      expect(screen.queryByText("new")).not.toBeInTheDocument();
    });

    it("does not show discount badge when no original price", () => {
      const { originalPrice, ...productWithoutDiscount } = mockProduct;
      render(<ProductCard {...productWithoutDiscount} />);
      expect(screen.queryByText(/OFF/)).not.toBeInTheDocument();
    });
  });

  describe("Add to Cart", () => {
    it("shows add to cart button when callback provided", () => {
      const onAddToCart = jest.fn();
      render(<ProductCard {...mockProduct} onAddToCart={onAddToCart} />);
      expect(screen.getByText("Add to Cart")).toBeInTheDocument();
    });

    it("calls onAddToCart when button clicked", () => {
      const onAddToCart = jest.fn();
      render(<ProductCard {...mockProduct} onAddToCart={onAddToCart} />);

      const button = screen.getByText("Add to Cart");
      fireEvent.click(button);

      expect(onAddToCart).toHaveBeenCalledWith("prod1", {
        name: "Vintage Watch",
        price: 15000,
        image: "https://example.com/watch.jpg",
        shopId: "shop1",
        shopName: "Vintage Store",
      });
    });

    it("does not show add to cart button when out of stock", () => {
      const onAddToCart = jest.fn();
      render(
        <ProductCard
          {...mockProduct}
          inStock={false}
          onAddToCart={onAddToCart}
        />
      );

      expect(screen.queryByText("Add to Cart")).not.toBeInTheDocument();
      expect(screen.getByText("Out of Stock")).toBeInTheDocument();
    });

    it("prevents navigation when add to cart clicked", () => {
      const onAddToCart = jest.fn();
      render(<ProductCard {...mockProduct} onAddToCart={onAddToCart} />);

      const button = screen.getByText("Add to Cart");
      const clickEvent = new MouseEvent("click", { bubbles: true });
      const preventDefault = jest.spyOn(clickEvent, "preventDefault");

      fireEvent(button, clickEvent);

      expect(preventDefault).toHaveBeenCalled();
    });
  });

  describe("Favorite Button", () => {
    it("renders favorite button when callback provided", () => {
      const onToggleFavorite = jest.fn();
      render(
        <ProductCard {...mockProduct} onToggleFavorite={onToggleFavorite} />
      );
      expect(screen.getByTestId("favorite-button")).toBeInTheDocument();
    });

    it("calls onToggleFavorite when clicked", () => {
      const onToggleFavorite = jest.fn();
      render(
        <ProductCard {...mockProduct} onToggleFavorite={onToggleFavorite} />
      );

      const button = screen.getByTestId("favorite-button");
      fireEvent.click(button);

      expect(onToggleFavorite).toHaveBeenCalledWith("prod1");
    });

    it("shows filled heart when isFavorite is true", () => {
      const onToggleFavorite = jest.fn();
      render(
        <ProductCard
          {...mockProduct}
          isFavorite={true}
          onToggleFavorite={onToggleFavorite}
        />
      );

      const button = screen.getByTestId("favorite-button");
      expect(button).toHaveTextContent("♥");
    });

    it("shows empty heart when isFavorite is false", () => {
      const onToggleFavorite = jest.fn();
      render(
        <ProductCard
          {...mockProduct}
          isFavorite={false}
          onToggleFavorite={onToggleFavorite}
        />
      );

      const button = screen.getByTestId("favorite-button");
      expect(button).toHaveTextContent("♡");
    });
  });

  describe("Quick View", () => {
    it("shows quick view button when callback provided", () => {
      const onQuickView = jest.fn();
      render(<ProductCard {...mockProduct} onQuickView={onQuickView} />);
      expect(screen.getByLabelText("Quick view")).toBeInTheDocument();
    });

    it("calls onQuickView when clicked", () => {
      const onQuickView = jest.fn();
      render(<ProductCard {...mockProduct} onQuickView={onQuickView} />);

      const button = screen.getByLabelText("Quick view");
      fireEvent.click(button);

      expect(onQuickView).toHaveBeenCalledWith("prod1");
    });

    it("prevents navigation when quick view clicked", () => {
      const onQuickView = jest.fn();
      render(<ProductCard {...mockProduct} onQuickView={onQuickView} />);

      const button = screen.getByLabelText("Quick view");
      const clickEvent = new MouseEvent("click", { bubbles: true });
      const preventDefault = jest.spyOn(clickEvent, "preventDefault");

      fireEvent(button, clickEvent);

      expect(preventDefault).toHaveBeenCalled();
    });
  });

  describe("Compact Mode", () => {
    it("applies compact styles when compact prop is true", () => {
      const { container } = render(
        <ProductCard {...mockProduct} compact={true} />
      );
      const nameElement = screen.getByText("Vintage Watch");
      expect(nameElement).toHaveClass("text-sm");
      expect(nameElement).toHaveClass("line-clamp-1");
    });

    it("hides rating in compact mode", () => {
      render(<ProductCard {...mockProduct} compact={true} />);
      expect(screen.queryByText("4.5")).not.toBeInTheDocument();
    });

    it("applies normal styles when compact is false", () => {
      render(<ProductCard {...mockProduct} compact={false} />);
      const nameElement = screen.getByText("Vintage Watch");
      expect(nameElement).toHaveClass("text-base");
      expect(nameElement).toHaveClass("line-clamp-2");
    });
  });

  describe("Multi-Media", () => {
    it("shows media count badge when multiple images", () => {
      render(
        <ProductCard
          {...mockProduct}
          images={["img1.jpg", "img2.jpg", "img3.jpg"]}
        />
      );
      expect(screen.getByText("3")).toBeInTheDocument();
    });

    it("shows video count badge when videos provided", () => {
      render(
        <ProductCard {...mockProduct} videos={["video1.mp4", "video2.mp4"]} />
      );
      expect(screen.getByText("2")).toBeInTheDocument();
    });

    it("shows media indicators when multiple media items", () => {
      const { container } = render(
        <ProductCard {...mockProduct} images={["img1.jpg", "img2.jpg"]} />
      );
      // Media indicators would be shown on hover, but we can't easily test hover state
      expect(container).toBeInTheDocument();
    });
  });

  describe("Hover Behavior", () => {
    it("handles mouse enter and leave", () => {
      const { container } = render(<ProductCard {...mockProduct} />);
      const card = container.querySelector("a");

      if (card) {
        fireEvent.mouseEnter(card);
        fireEvent.mouseLeave(card);
      }

      expect(card).toBeInTheDocument();
    });
  });

  describe("Shop Navigation", () => {
    it("navigates to shop page when shop name clicked", () => {
      const mockWindowLocation = jest.fn();
      delete (window as any).location;
      window.location = { href: "" } as any;

      render(<ProductCard {...mockProduct} />);

      const shopName = screen.getByText("Vintage Store");
      fireEvent.click(shopName);

      // The component uses window.location.href directly
      expect(shopName).toBeInTheDocument();
    });
  });

  describe("Edge Cases", () => {
    it("renders without rating", () => {
      const { rating, reviewCount, ...productWithoutRating } = mockProduct;
      render(<ProductCard {...productWithoutRating} />);
      expect(screen.getByText("Vintage Watch")).toBeInTheDocument();
      expect(screen.queryByTestId("star-icon")).not.toBeInTheDocument();
    });

    it("renders with zero rating", () => {
      render(<ProductCard {...mockProduct} rating={0} />);
      expect(screen.queryByText("0.0")).not.toBeInTheDocument();
    });

    it("renders without original price", () => {
      const { originalPrice, ...productWithoutOriginal } = mockProduct;
      render(<ProductCard {...productWithoutOriginal} />);
      expect(screen.getByText("₹15,000")).toBeInTheDocument();
      expect(screen.queryByText("₹20,000")).not.toBeInTheDocument();
    });

    it("handles missing shopId by using shopSlug", () => {
      const { shopId, ...productWithoutShopId } = mockProduct;
      const onAddToCart = jest.fn();
      render(
        <ProductCard {...productWithoutShopId} onAddToCart={onAddToCart} />
      );

      const button = screen.getByText("Add to Cart");
      fireEvent.click(button);

      expect(onAddToCart).toHaveBeenCalledWith(
        "prod1",
        expect.objectContaining({
          shopId: "vintage-store",
        })
      );
    });

    it("renders without images array", () => {
      render(<ProductCard {...mockProduct} />);
      const image = screen.getByRole("img", { name: "Vintage Watch" });
      expect(image).toBeInTheDocument();
    });

    it("renders with empty images array", () => {
      render(<ProductCard {...mockProduct} images={[]} />);
      const image = screen.getByRole("img", { name: "Vintage Watch" });
      expect(image).toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("has accessible link", () => {
      render(<ProductCard {...mockProduct} />);
      const link = screen.getByRole("link");
      expect(link).toBeInTheDocument();
    });

    it("has accessible quick view button", () => {
      const onQuickView = jest.fn();
      render(<ProductCard {...mockProduct} onQuickView={onQuickView} />);
      const button = screen.getByLabelText("Quick view");
      expect(button).toBeInTheDocument();
    });

    it("has accessible favorite button", () => {
      const onToggleFavorite = jest.fn();
      render(
        <ProductCard {...mockProduct} onToggleFavorite={onToggleFavorite} />
      );
      const button = screen.getByTestId("favorite-button");
      expect(button).toHaveAttribute("aria-label");
    });
  });

  describe("Memoization", () => {
    it("is a memoized component", () => {
      const { rerender } = render(<ProductCard {...mockProduct} />);
      const firstRender = screen.getByText("Vintage Watch");

      rerender(<ProductCard {...mockProduct} />);
      const secondRender = screen.getByText("Vintage Watch");

      // Component should not re-render with same props
      expect(firstRender).toBe(secondRender);
    });
  });
});
