import React from "react";
import {
  render,
  screen,
  waitFor,
  act,
  fireEvent,
} from "@testing-library/react";
import ProductPage from "@/app/products/[slug]/page";

// Mock Firebase
jest.mock("@/app/api/lib/firebase/app", () => ({
  app: {},
  database: {},
  analytics: null,
}));

// Mock next/navigation
const mockPush = jest.fn();
const mockBack = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    back: mockBack,
  }),
  useSearchParams: () => ({
    get: jest.fn(),
  }),
  usePathname: () => "/products/test-slug",
}));

// Mock services
jest.mock("@/services/products.service");
jest.mock("@/services/shops.service");

const mockProductsService =
  require("@/services/products.service").productsService;
const mockShopsService = require("@/services/shops.service").shopsService;

// Mock hooks
jest.mock("@/hooks/useCart");

const mockUseCart = require("@/hooks/useCart").useCart;

// Mock components
jest.mock("@/components/product/ProductGallery", () => ({
  ProductGallery: ({ media }: any) => (
    <div data-testid="product-gallery">
      {media.map((item: any, index: number) => (
        <div key={index} data-testid="media-item">
          {item.type === "image" ? "Image" : "Video"}
        </div>
      ))}
    </div>
  ),
}));

jest.mock("@/components/product/ProductInfo", () => ({
  ProductInfo: () => <div data-testid="product-info">Product Info</div>,
}));

jest.mock("@/components/product/ProductDescription", () => ({
  ProductDescription: ({ description, specifications }: any) => (
    <div data-testid="product-description">
      <p>{description}</p>
      {specifications && Object.keys(specifications).length > 0 && (
        <div data-testid="specifications">Specs</div>
      )}
    </div>
  ),
}));

jest.mock("@/components/product/ProductReviews", () => ({
  ProductReviews: ({ productId }: any) => (
    <div data-testid="product-reviews" data-product-id={productId}>
      Reviews
    </div>
  ),
}));

jest.mock("@/components/product/ProductVariants", () => ({
  ProductVariants: ({ productId, categoryId }: any) => (
    <div
      data-testid="product-variants"
      data-product-id={productId}
      data-category-id={categoryId}
    >
      Variants
    </div>
  ),
}));

jest.mock("@/components/product/SellerProducts", () => ({
  SellerProducts: ({ shopId, shopName }: any) => (
    <div
      data-testid="seller-products"
      data-shop-id={shopId}
      data-shop-name={shopName}
    >
      Seller Products
    </div>
  ),
}));

jest.mock("@/components/product/SimilarProducts", () => ({
  SimilarProducts: ({ productId }: any) => (
    <div data-testid="similar-products" data-product-id={productId}>
      Similar Products
    </div>
  ),
}));

jest.mock("@/components/common/ErrorMessage", () => ({
  ErrorMessage: ({
    message,
    showRetry,
    onRetry,
    showGoBack,
    onGoBack,
  }: any) => (
    <div data-testid="error-message">
      <p>{message}</p>
      {showRetry && (
        <button data-testid="retry-button" onClick={onRetry}>
          Retry
        </button>
      )}
      {showGoBack && (
        <button data-testid="go-back-button" onClick={onGoBack}>
          Go Back
        </button>
      )}
    </div>
  ),
}));

jest.mock("@/components/common/skeletons/ProductCardSkeleton", () => ({
  ProductCardSkeletonGrid: ({ count }: any) => (
    <div data-testid="skeleton-grid" data-count={count}>
      Loading...
    </div>
  ),
}));

// Mock toast
jest.mock("@/components/admin/Toast", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

// Mock lucide-react icons
jest.mock("lucide-react", () => ({
  ChevronLeft: () => <div data-testid="chevron-left">←</div>,
  Loader2: () => <div data-testid="loader2">Loading</div>,
  Star: ({ className }: any) => (
    <div data-testid="star" className={className}>
      ★
    </div>
  ),
  Store: () => <div data-testid="store">Store</div>,
}));

// Mock price utils
jest.mock("@/lib/price.utils", () => ({
  formatINR: (price: number) => `₹${price.toLocaleString()}`,
  formatDiscount: (compareAtPrice: number | null, price: number) => {
    if (!compareAtPrice || compareAtPrice <= price) return null;
    const discount = ((compareAtPrice - price) / compareAtPrice) * 100;
    return `-${Math.round(discount)}%`;
  },
}));

// Mock error redirects
jest.mock("@/lib/error-redirects", () => ({
  notFound: jest.fn(),
}));

describe("ProductPage", () => {
  const mockAddItem = jest.fn();
  const mockToastSuccess = jest.fn();
  const mockToastError = jest.fn();

  const mockProduct = {
    id: "product-1",
    name: "Test Product",
    slug: "test-product",
    sku: "TEST-001",
    description: "This is a test product description",
    categoryId: "cat-1",
    category: { id: "cat-1", name: "Electronics", slug: "electronics" },
    categoryIds: ["cat-1", "cat-parent"],
    brand: "Test Brand",
    tags: ["test", "product"],
    price: 999,
    compareAtPrice: 1299,
    discount: 300,
    discountPercentage: 23,
    formattedPrice: "₹999",
    formattedCompareAtPrice: "₹1,299",
    stockCount: 10,
    lowStockThreshold: 5,
    isInStock: true,
    isLowStock: false,
    stockStatus: "in-stock" as const,
    weight: 1.5,
    dimensions: {
      length: 10,
      width: 5,
      height: 2,
      unit: "cm" as const,
    },
    images: ["/image1.jpg", "/image2.jpg"],
    primaryImage: "/image1.jpg",
    videos: ["/video1.mp4"],
    status: "published" as const,
    condition: "new" as const,
    featured: false,
    isReturnable: true,
    isPublished: true,
    shopId: "shop-1",
    shop: { id: "shop-1", name: "Test Shop", slug: "test-shop" },
    sellerId: "seller-1",
    shippingClass: "standard" as const,
    returnWindowDays: 7,
    returnPolicy: "7-day return policy",
    warrantyInfo: "1 year warranty",
    features: ["Feature 1", "Feature 2"],
    specifications: { "Spec 1": "Value 1", "Spec 2": "Value 2" },
    metaTitle: "Test Product",
    metaDescription: "Test product description",
    viewCount: 100,
    salesCount: 50,
    favoriteCount: 25,
    reviewCount: 15,
    averageRating: 4.2,
    ratingStars: 4,
    hasReviews: true,
    countryOfOrigin: "India",
    manufacturer: "Test Manufacturer",
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-15"),
    isNew: false,
    isTrending: false,
    isFavorited: false,
    isInCart: false,
    cartQuantity: 0,
    badges: [],
  };

  const mockShop = {
    id: "shop-1",
    name: "Test Shop",
    slug: "test-shop",
    description: "Test shop description",
    logo: "/shop-logo.jpg",
    banner: "/shop-banner.jpg",
    ownerId: "owner-1",
    ownerName: "Test Owner",
    ownerEmail: "owner@test.com",
    email: "shop@test.com",
    phone: "+91-1234567890",
    address: "Test Address",
    city: "Test City",
    state: "Test State",
    postalCode: "123456",
    totalProducts: 100,
    totalAuctions: 10,
    totalOrders: 50,
    totalSales: 50000,
    rating: 4.5,
    reviewCount: 20,
    status: "active" as const,
    isVerified: true,
    settings: {
      acceptsOrders: true,
      minOrderAmount: 100,
      shippingCharge: 50,
      freeShippingAbove: 500,
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // Default mocks
    mockUseCart.mockReturnValue({
      addItem: mockAddItem,
      loading: false,
    });

    // Mock toast
    const mockToast = require("@/components/admin/Toast").toast;
    mockToast.success = mockToastSuccess;
    mockToast.error = mockToastError;

    // Default service mocks
    mockProductsService.getBySlug.mockResolvedValue(mockProduct);
    mockShopsService.getBySlug.mockResolvedValue(mockShop);
  });

  it("renders loading state initially", () => {
    // The component uses Suspense, so it immediately suspends
    // We can't test the loading state directly, but we can test that it renders
    expect(() =>
      render(
        <ProductPage params={Promise.resolve({ slug: "test-product" })} />,
      ),
    ).not.toThrow();
  });

  it("loads and displays product details", async () => {
    await act(async () => {
      render(
        <ProductPage params={Promise.resolve({ slug: "test-product" })} />,
      );
    });

    await waitFor(() => {
      expect(mockProductsService.getBySlug).toHaveBeenCalledWith(
        "test-product",
      );
      expect(mockShopsService.getBySlug).toHaveBeenCalledWith("shop-1");
    });

    // Check main product elements
    expect(screen.getByText("Test Product")).toBeInTheDocument();
    expect(
      screen.getByText("This is a test product description"),
    ).toBeInTheDocument();
    expect(screen.getAllByText("₹999")).toHaveLength(2); // Price appears in center and right columns
    expect(screen.getByText("-23%")).toBeInTheDocument();
    expect(screen.getByText("₹1,299")).toBeInTheDocument();

    // Check shop link
    expect(screen.getByText("Visit the Test Shop Store")).toBeInTheDocument();

    // Check rating
    expect(screen.getAllByTestId("star")).toHaveLength(5);

    // Check stock info
    expect(screen.getByText("Stock: 10 units available")).toBeInTheDocument();
    expect(screen.getByText("In Stock")).toBeInTheDocument();

    // Check components are rendered
    expect(screen.getByTestId("product-gallery")).toBeInTheDocument();
    expect(screen.getByTestId("product-description")).toBeInTheDocument();
    expect(screen.getByTestId("product-reviews")).toBeInTheDocument();
    expect(screen.getByTestId("product-variants")).toBeInTheDocument();
    expect(screen.getByTestId("seller-products")).toBeInTheDocument();
    expect(screen.getByTestId("similar-products")).toBeInTheDocument();
  });

  it("displays product gallery with images and videos", async () => {
    await act(async () => {
      render(
        <ProductPage params={Promise.resolve({ slug: "test-product" })} />,
      );
    });

    await waitFor(() => {
      expect(screen.getByTestId("product-gallery")).toBeInTheDocument();
    });

    // Should have 3 media items (2 images + 1 video)
    expect(screen.getAllByTestId("media-item")).toHaveLength(3);
  });

  it("handles back navigation", async () => {
    await act(async () => {
      render(
        <ProductPage params={Promise.resolve({ slug: "test-product" })} />,
      );
    });

    await waitFor(() => {
      expect(screen.getByTestId("chevron-left")).toBeInTheDocument();
    });

    const backButton = screen.getByTestId("chevron-left").closest("button");
    expect(backButton).toBeInTheDocument();

    fireEvent.click(backButton!);
    expect(mockBack).toHaveBeenCalled();
  });

  it("handles quantity selection", async () => {
    await act(async () => {
      render(
        <ProductPage params={Promise.resolve({ slug: "test-product" })} />,
      );
    });

    await waitFor(() => {
      expect(screen.getByText("Test Product")).toBeInTheDocument();
    });

    const quantitySelect = screen.getByDisplayValue("1");
    expect(quantitySelect).toBeInTheDocument();

    fireEvent.change(quantitySelect, { target: { value: "3" } });
    expect(quantitySelect).toHaveValue("3");
  });

  it("handles add to cart", async () => {
    await act(async () => {
      render(
        <ProductPage params={Promise.resolve({ slug: "test-product" })} />,
      );
    });

    await waitFor(() => {
      expect(screen.getByText("Test Product")).toBeInTheDocument();
    });

    const addToCartButton = screen.getByText("Add to Cart");
    fireEvent.click(addToCartButton);

    await waitFor(() => {
      expect(mockAddItem).toHaveBeenCalledWith("product-1", 1, undefined, {
        name: "Test Product",
        price: 999,
        image: "/image1.jpg",
        shopId: "shop-1",
        shopName: "Test Shop",
      });
      expect(mockToastSuccess).toHaveBeenCalledWith("Added 1 item(s) to cart");
    });
  });

  it("handles buy now", async () => {
    await act(async () => {
      render(
        <ProductPage params={Promise.resolve({ slug: "test-product" })} />,
      );
    });

    await waitFor(() => {
      expect(screen.getByText("Test Product")).toBeInTheDocument();
    });

    const buyNowButton = screen.getByText("Buy Now");
    fireEvent.click(buyNowButton);

    await waitFor(() => {
      expect(mockAddItem).toHaveBeenCalledWith("product-1", 1, undefined, {
        name: "Test Product",
        price: 999,
        image: "/image1.jpg",
        shopId: "shop-1",
        shopName: "Test Shop",
      });
      expect(mockPush).toHaveBeenCalledWith("/checkout");
    });
  });

  it("handles add to cart with custom quantity", async () => {
    await act(async () => {
      render(
        <ProductPage params={Promise.resolve({ slug: "test-product" })} />,
      );
    });

    await waitFor(() => {
      expect(screen.getByText("Test Product")).toBeInTheDocument();
    });

    // Change quantity
    const quantitySelect = screen.getByDisplayValue("1");
    fireEvent.change(quantitySelect, { target: { value: "5" } });

    // Add to cart
    const addToCartButton = screen.getByText("Add to Cart");
    fireEvent.click(addToCartButton);

    await waitFor(() => {
      expect(mockAddItem).toHaveBeenCalledWith("product-1", 5, undefined, {
        name: "Test Product",
        price: 999,
        image: "/image1.jpg",
        shopId: "shop-1",
        shopName: "Test Shop",
      });
      expect(mockToastSuccess).toHaveBeenCalledWith("Added 5 item(s) to cart");
    });
  });

  it("shows out of stock state", async () => {
    const outOfStockProduct = { ...mockProduct, stockCount: 0 };
    mockProductsService.getBySlug.mockResolvedValue(outOfStockProduct);

    await act(async () => {
      render(
        <ProductPage params={Promise.resolve({ slug: "test-product" })} />,
      );
    });

    await waitFor(() => {
      expect(screen.getByText("Test Product")).toBeInTheDocument();
    });

    // Buttons should be disabled
    const addToCartButton = screen.getByText("Add to Cart");
    const buyNowButton = screen.getByText("Buy Now");

    expect(addToCartButton).toBeDisabled();
    expect(buyNowButton).toBeDisabled();
  });

  it("handles add to cart error", async () => {
    mockAddItem.mockRejectedValue(new Error("Cart error"));

    await act(async () => {
      render(
        <ProductPage params={Promise.resolve({ slug: "test-product" })} />,
      );
    });

    await waitFor(() => {
      expect(screen.getByText("Test Product")).toBeInTheDocument();
    });

    const addToCartButton = screen.getByText("Add to Cart");
    fireEvent.click(addToCartButton);

    await waitFor(() => {
      expect(mockToastError).toHaveBeenCalledWith("Cart error");
    });
  });

  it("handles product load error", async () => {
    mockProductsService.getBySlug.mockRejectedValueOnce(
      new Error("Product not found"),
    );

    await act(async () => {
      render(
        <ProductPage params={Promise.resolve({ slug: "test-product" })} />,
      );
    });

    await waitFor(() => {
      expect(screen.getByText("Product not found")).toBeInTheDocument();
    });

    expect(screen.getByText("Product not found")).toBeInTheDocument();
    expect(screen.getByTestId("retry-button")).toBeInTheDocument();
    expect(screen.getByTestId("go-back-button")).toBeInTheDocument();
  });

  it("handles shop load error gracefully", async () => {
    mockShopsService.getBySlug.mockRejectedValue(new Error("Shop not found"));

    await act(async () => {
      render(
        <ProductPage params={Promise.resolve({ slug: "test-product" })} />,
      );
    });

    await waitFor(() => {
      expect(screen.getByText("Test Product")).toBeInTheDocument();
    });

    // Product should still display even if shop fails to load
    expect(screen.getByText("Test Product")).toBeInTheDocument();
    // Shop link should not be present
    expect(screen.queryByText("Visit the")).not.toBeInTheDocument();
  });

  it("displays product specifications", async () => {
    await act(async () => {
      render(
        <ProductPage params={Promise.resolve({ slug: "test-product" })} />,
      );
    });

    await waitFor(() => {
      expect(screen.getByTestId("product-description")).toBeInTheDocument();
    });

    expect(screen.getByTestId("specifications")).toBeInTheDocument();
  });

  it("handles product without specifications", async () => {
    const productWithoutSpecs = { ...mockProduct, specifications: {} };
    mockProductsService.getBySlug.mockResolvedValue(productWithoutSpecs);

    await act(async () => {
      render(
        <ProductPage params={Promise.resolve({ slug: "test-product" })} />,
      );
    });

    await waitFor(() => {
      expect(screen.getByTestId("product-description")).toBeInTheDocument();
    });

    expect(screen.queryByTestId("specifications")).not.toBeInTheDocument();
  });

  it("displays product features", async () => {
    await act(async () => {
      render(
        <ProductPage params={Promise.resolve({ slug: "test-product" })} />,
      );
    });

    await waitFor(() => {
      expect(screen.getByText("Test Product")).toBeInTheDocument();
    });

    expect(screen.getByText("Condition:")).toBeInTheDocument();
    expect(screen.getByText("new")).toBeInTheDocument();
    expect(
      screen.getByText("7-day return policy available"),
    ).toBeInTheDocument();
  });

  it("handles product without rating", async () => {
    const productWithoutRating = {
      ...mockProduct,
      averageRating: 0,
      reviewCount: 0,
    };
    mockProductsService.getBySlug.mockResolvedValue(productWithoutRating);

    await act(async () => {
      render(
        <ProductPage params={Promise.resolve({ slug: "test-product" })} />,
      );
    });

    await waitFor(() => {
      expect(screen.getByText("Test Product")).toBeInTheDocument();
    });

    // Should not display rating section
    expect(screen.queryByText("ratings")).not.toBeInTheDocument();
  });

  it("displays discount information correctly", async () => {
    await act(async () => {
      render(
        <ProductPage params={Promise.resolve({ slug: "test-product" })} />,
      );
    });

    await waitFor(() => {
      expect(screen.getByText("Test Product")).toBeInTheDocument();
    });

    expect(screen.getByText("-23%")).toBeInTheDocument();
    expect(screen.getByText("M.R.P.:")).toBeInTheDocument();
    expect(screen.getByText("₹1,299")).toBeInTheDocument();
  });

  it("handles product without discount", async () => {
    const productWithoutDiscount = { ...mockProduct, compareAtPrice: null };
    mockProductsService.getBySlug.mockResolvedValue(productWithoutDiscount);

    await act(async () => {
      render(
        <ProductPage params={Promise.resolve({ slug: "test-product" })} />,
      );
    });

    await waitFor(() => {
      expect(screen.getByText("Test Product")).toBeInTheDocument();
    });

    expect(screen.queryByText("-23%")).not.toBeInTheDocument();
    expect(screen.queryByText("M.R.P.:")).not.toBeInTheDocument();
  });

  it("passes correct props to child components", async () => {
    await act(async () => {
      render(
        <ProductPage params={Promise.resolve({ slug: "test-product" })} />,
      );
    });

    await waitFor(() => {
      expect(screen.getByTestId("product-reviews")).toBeInTheDocument();
    });

    // Check that components receive correct props
    expect(screen.getByTestId("product-reviews")).toHaveAttribute(
      "data-product-id",
      "product-1",
    );
    expect(screen.getByTestId("product-variants")).toHaveAttribute(
      "data-product-id",
      "product-1",
    );
    expect(screen.getByTestId("product-variants")).toHaveAttribute(
      "data-category-id",
      "cat-1",
    );
    expect(screen.getByTestId("seller-products")).toHaveAttribute(
      "data-shop-id",
      "shop-1",
    );
    expect(screen.getByTestId("seller-products")).toHaveAttribute(
      "data-shop-name",
      "Test Shop",
    );
    expect(screen.getByTestId("similar-products")).toHaveAttribute(
      "data-product-id",
      "product-1",
    );
  });

  it("handles retry on error", async () => {
    mockProductsService.getBySlug.mockRejectedValueOnce(
      new Error("Network error"),
    );
    mockProductsService.getBySlug.mockResolvedValueOnce(mockProduct);

    await act(async () => {
      render(
        <ProductPage params={Promise.resolve({ slug: "test-product" })} />,
      );
    });

    await waitFor(() => {
      expect(screen.getByText("Network error")).toBeInTheDocument();
    });

    const retryButton = screen.getByTestId("retry-button");
    fireEvent.click(retryButton);

    await waitFor(() => {
      expect(mockProductsService.getBySlug).toHaveBeenCalledTimes(2);
      expect(screen.getByText("Test Product")).toBeInTheDocument();
    });
  });

  it("handles go back on error", async () => {
    mockProductsService.getBySlug.mockRejectedValueOnce(
      new Error("Product not found"),
    );

    await act(async () => {
      render(
        <ProductPage params={Promise.resolve({ slug: "test-product" })} />,
      );
    });

    await waitFor(() => {
      expect(screen.getByText("Product not found")).toBeInTheDocument();
    });

    const goBackButton = screen.getByRole("button", { name: /go back/i });
    fireEvent.click(goBackButton);

    expect(mockPush).toHaveBeenCalledWith("/products");
  });

  it("displays product without shop information", async () => {
    const productWithoutShop = { ...mockProduct, shopId: "unknown-shop" };
    mockShopsService.getBySlug.mockRejectedValue(new Error("Shop not found"));
    mockProductsService.getBySlug.mockResolvedValue(productWithoutShop);

    await act(async () => {
      render(
        <ProductPage params={Promise.resolve({ slug: "test-product" })} />,
      );
    });

    await waitFor(() => {
      expect(screen.getByText("Test Product")).toBeInTheDocument();
    });

    // Should show "Seller" when shop not found
    expect(screen.getByText("Ships from: Seller")).toBeInTheDocument();
    expect(screen.getByText("Sold by: Seller")).toBeInTheDocument();
  });

  it("handles product with multiple images", async () => {
    const productWithManyImages = {
      ...mockProduct,
      images: ["/img1.jpg", "/img2.jpg", "/img3.jpg", "/img4.jpg", "/img5.jpg"],
    };
    mockProductsService.getBySlug.mockResolvedValue(productWithManyImages);

    await act(async () => {
      render(
        <ProductPage params={Promise.resolve({ slug: "test-product" })} />,
      );
    });

    await waitFor(() => {
      expect(screen.getByTestId("product-gallery")).toBeInTheDocument();
    });

    // Should display all images
    expect(screen.getAllByTestId("media-item")).toHaveLength(6); // 5 images + 1 video
  });
});
