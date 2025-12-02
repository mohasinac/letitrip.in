"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";
import OptimizedImage from "@/components/common/OptimizedImage";
import {
  Loader2,
  Search,
  Grid,
  List,
  Gavel,
  Filter as FilterIcon,
} from "lucide-react";
import { FormSelect } from "@/components/forms";
import { shopsService } from "@/services/shops.service";
import { productsService } from "@/services/products.service";
import { auctionsService } from "@/services/auctions.service";
import { notFound } from "@/lib/error-redirects";
import { ShopHeader } from "@/components/shop/ShopHeader";
import { ProductCard } from "@/components/cards/ProductCard";
import AuctionCard from "@/components/cards/AuctionCard";
import { CardGrid } from "@/components/cards/CardGrid";
import { EmptyState } from "@/components/common/EmptyState";
import { Price } from "@/components/common/values";
import {
  ProductFilters,
  ProductFilterValues,
} from "@/components/filters/ProductFilters";
import {
  AuctionFilters,
  AuctionFilterValues,
} from "@/components/filters/AuctionFilters";
import { useCart } from "@/hooks/useCart";
import type { ShopFE } from "@/types/frontend/shop.types";
import type { ProductCardFE } from "@/types/frontend/product.types";
import type { AuctionCardFE } from "@/types/frontend/auction.types";

interface ShopPageProps {
  params: Promise<{
    slug: string;
  }>;
}

type TabType = "products" | "auctions" | "reviews" | "about";

export default function ShopPage({ params }: ShopPageProps) {
  const router = useRouter();
  const { addItem } = useCart();
  const { slug } = use(params);

  const [shop, setShop] = useState<ShopFE | null>(null);
  const [products, setProducts] = useState<ProductCardFE[]>([]);
  const [auctions, setAuctions] = useState<AuctionCardFE[]>([]);
  const [loading, setLoading] = useState(true);
  const [productsLoading, setProductsLoading] = useState(true);
  const [auctionsLoading, setAuctionsLoading] = useState(true);

  // Tab and view state
  const [activeTab, setActiveTab] = useState<TabType>("products");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [showFilters, setShowFilters] = useState(false);

  // Search and filters
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<string>("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [productFilters, setProductFilters] = useState<ProductFilterValues>({});
  const [availableBrands, setAvailableBrands] = useState<string[]>([]);
  const [auctionFilters, setAuctionFilters] = useState<AuctionFilterValues>({
    sortBy: "endTime",
    sortOrder: "asc",
  });
  const [showAuctionFilters, setShowAuctionFilters] = useState(false);

  useEffect(() => {
    loadShop();
  }, [slug]);

  useEffect(() => {
    if (shop) {
      loadProducts();
      loadAuctions();
    }
  }, [shop, sortBy, sortOrder]);

  const loadShop = async () => {
    try {
      setLoading(true);
      const data = await shopsService.getBySlug(slug);
      setShop(data);
    } catch (error: any) {
      console.error("Failed to load shop:", error);
      router.push(notFound.shop(slug, error));
    } finally {
      setLoading(false);
    }
  };

  const loadProducts = async () => {
    try {
      setProductsLoading(true);
      // Map sortBy and sortOrder to the correct format for the API
      let apiSortBy:
        | "relevance"
        | "price-asc"
        | "price-desc"
        | "newest"
        | "popular"
        | "rating"
        | undefined;
      if (sortBy === "price") {
        apiSortBy = sortOrder === "asc" ? "price-asc" : "price-desc";
      } else if (sortBy === "createdAt") {
        apiSortBy = "newest";
      } else if (sortBy === "sales") {
        apiSortBy = "popular";
      } else if (sortBy === "rating") {
        apiSortBy = "rating";
      }

      const response = await productsService.list({
        shopId: slug,
        search: searchQuery || undefined,
        sortBy: apiSortBy, // BUG FIX: Added sort parameter with correct type mapping
        categoryId: productFilters.categories?.[0],
        priceRange:
          productFilters.priceMin || productFilters.priceMax
            ? {
                min: productFilters.priceMin || 0,
                max: productFilters.priceMax || 999999,
              }
            : undefined,
        inStock:
          productFilters.stock === "in_stock"
            ? true
            : productFilters.stock === "out_of_stock"
            ? false
            : undefined,
        featured: productFilters.featured,
        rating: productFilters.rating,
      });

      const productsData = response.data || [];
      setProducts(productsData);

      // Extract unique brands from products for filtering
      const brands = [
        ...new Set(
          productsData
            .map((p) => p.brand)
            .filter((brand): brand is string => Boolean(brand))
        ),
      ];
      setAvailableBrands(brands);
    } catch (error) {
      console.error("Failed to load products:", error);
    } finally {
      setProductsLoading(false);
    }
  };

  const loadAuctions = async () => {
    try {
      setAuctionsLoading(true);
      const apiFilters: any = {
        shopId: slug,
        search: searchQuery || undefined,
        sortBy: auctionFilters.sortBy || sortBy,
        sortOrder: auctionFilters.sortOrder || sortOrder,
        limit: 100,
      };

      // Apply auction filters
      if (auctionFilters.status && auctionFilters.status.length > 0) {
        // For simplicity, if multiple statuses, use the first one
        apiFilters.status = auctionFilters.status[0];
      }
      if (auctionFilters.bidMin !== undefined) {
        apiFilters.minBid = auctionFilters.bidMin;
      }
      if (auctionFilters.bidMax !== undefined) {
        apiFilters.maxBid = auctionFilters.bidMax;
      }
      if (auctionFilters.featured) {
        apiFilters.featured = true;
      }
      if (auctionFilters.endingSoon) {
        apiFilters.endingSoon = true;
      }

      const response = await auctionsService.list(apiFilters);
      setAuctions(response.data || []);
    } catch (error) {
      console.error("Failed to load auctions:", error);
    } finally {
      setAuctionsLoading(false);
    }
  };

  const handleSearch = () => {
    if (activeTab === "products") {
      loadProducts();
    } else if (activeTab === "auctions") {
      loadAuctions();
    }
  };

  const handleApplyFilters = () => {
    loadProducts();
    setShowFilters(false);
  };

  const handleResetFilters = () => {
    setProductFilters({});
    setSearchQuery("");
  };

  const handleApplyAuctionFilters = () => {
    loadAuctions();
    setShowAuctionFilters(false);
  };

  const handleResetAuctionFilters = () => {
    setAuctionFilters({
      sortBy: "endTime",
      sortOrder: "asc",
    });
    setSearchQuery("");
  };

  const handleAddToCart = async (
    productId: string,
    productDetails?: {
      name: string;
      price: number;
      image: string;
      shopId: string;
      shopName: string;
    }
  ) => {
    try {
      if (!productDetails) {
        const product = products.find((p) => p.id === productId);
        if (!product) throw new Error("Product not found");
        productDetails = {
          name: product.name,
          price: product.price,
          image: product.images?.[0] || "",
          shopId: product.shopId,
          shopName: shop?.name || "",
        };
      }
      await addItem(productId, 1, undefined, productDetails);
      toast.success("Added to cart!");
    } catch (error: any) {
      toast.error(error.message || "Failed to add to cart");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (!shop) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Shop Header */}
      <ShopHeader shop={shop} />

      {/* Tabs Navigation */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-8 overflow-x-auto">
            <button
              onClick={() => setActiveTab("products")}
              className={`py-4 px-2 font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === "products"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              Products ({products.length})
            </button>
            <button
              onClick={() => setActiveTab("auctions")}
              className={`py-4 px-2 font-medium border-b-2 transition-colors whitespace-nowrap flex items-center gap-2 ${
                activeTab === "auctions"
                  ? "border-purple-600 text-purple-600"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              <Gavel className="w-4 h-4" />
              Auctions ({auctions.length})
            </button>
            <button
              onClick={() => setActiveTab("reviews")}
              className={`py-4 px-2 font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === "reviews"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              Reviews ({shop.reviewCount || 0})
            </button>
            <button
              onClick={() => setActiveTab("about")}
              className={`py-4 px-2 font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === "about"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              About
            </button>
          </div>
        </div>
      </div>

      {/* Shop Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Products Tab */}
        {activeTab === "products" && (
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Filters Sidebar */}
            <aside
              className={`lg:w-64 flex-shrink-0 ${
                showFilters ? "block" : "hidden lg:block"
              }`}
            >
              <div className="bg-white rounded-lg shadow-sm p-4 sticky top-20">
                <ProductFilters
                  filters={productFilters}
                  onChange={setProductFilters}
                  onApply={handleApplyFilters}
                  onReset={handleResetFilters}
                  availableBrands={availableBrands}
                />
              </div>
            </aside>

            {/* Products Section */}
            <div className="flex-1 bg-white rounded-lg shadow-sm p-6">
              {/* Sort & Controls */}
              <div className="mb-6">
                <div className="flex flex-col lg:flex-row gap-4 mb-4">
                  {/* Sort & View */}
                  <div className="flex-1 flex gap-2">
                    <FormSelect
                      id="shop-sort-by"
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      options={[
                        { value: "createdAt", label: "Newest" },
                        { value: "price", label: "Price" },
                        { value: "rating", label: "Rating" },
                        { value: "sales", label: "Popular" },
                      ]}
                      compact
                    />

                    <FormSelect
                      id="shop-sort-order"
                      value={sortOrder}
                      onChange={(e) =>
                        setSortOrder(e.target.value as "asc" | "desc")
                      }
                      options={[
                        { value: "desc", label: "High to Low" },
                        { value: "asc", label: "Low to High" },
                      ]}
                      compact
                    />

                    {/* View Toggle */}
                    <div className="hidden md:flex border border-gray-300 rounded-lg overflow-hidden">
                      <button
                        onClick={() => setView("grid")}
                        className={`px-3 py-2 ${
                          view === "grid"
                            ? "bg-blue-600 text-white"
                            : "bg-white text-gray-600"
                        }`}
                      >
                        <Grid className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => setView("list")}
                        className={`px-3 py-2 ${
                          view === "list"
                            ? "bg-blue-600 text-white"
                            : "bg-white text-gray-600"
                        }`}
                      >
                        <List className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Filter Toggle (Mobile) */}
                    <button
                      onClick={() => setShowFilters(!showFilters)}
                      className="lg:hidden px-4 py-2 bg-blue-600 text-white rounded-lg"
                    >
                      <FilterIcon className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Products Grid */}
              {productsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                </div>
              ) : products.length === 0 ? (
                <EmptyState
                  title="No products found"
                  description={
                    searchQuery
                      ? "Try adjusting your search"
                      : "This shop hasn't listed any products yet"
                  }
                />
              ) : (
                <>
                  <div className="mb-4 text-sm text-gray-600">
                    Showing {products.length} product
                    {products.length !== 1 ? "s" : ""}
                  </div>
                  {view === "grid" ? (
                    <CardGrid>
                      {products.map((product) => (
                        <ProductCard
                          key={product.id}
                          id={product.id}
                          name={product.name}
                          slug={product.slug}
                          price={product.price}
                          originalPrice={product.originalPrice || undefined}
                          image={product.images?.[0] || ""}
                          rating={product.rating}
                          reviewCount={product.reviewCount}
                          shopName={shop.name}
                          shopSlug={shop.slug}
                          shopId={shop.id}
                          inStock={product.stockCount > 0}
                          featured={product.featured}
                          condition={product.condition}
                          showShopName={false}
                          onAddToCart={handleAddToCart}
                        />
                      ))}
                    </CardGrid>
                  ) : (
                    <div className="space-y-4">
                      {products.map((product) => (
                        <div
                          key={product.id}
                          className="flex gap-4 p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                        >
                          <div className="relative w-32 h-32 flex-shrink-0">
                            <OptimizedImage
                              src={product.images?.[0] || ""}
                              alt={product.name}
                              fill
                              className="object-cover rounded-lg"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3
                              className="font-semibold text-gray-900 mb-2 hover:text-blue-600 cursor-pointer"
                              onClick={() =>
                                router.push(`/products/${product.slug}`)
                              }
                              onKeyDown={(e) =>
                                e.key === "Enter" &&
                                router.push(`/products/${product.slug}`)
                              }
                              role="link"
                              tabIndex={0}
                            >
                              {product.name}
                            </h3>
                            <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                              {product.rating > 0 && (
                                <span>
                                  ★ {product.rating.toFixed(1)} (
                                  {product.reviewCount})
                                </span>
                              )}
                              <span
                                className={
                                  product.stockCount > 0
                                    ? "text-green-600"
                                    : "text-red-600"
                                }
                              >
                                {product.stockCount > 0
                                  ? "In Stock"
                                  : "Out of Stock"}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <div>
                                <span className="text-2xl font-bold text-gray-900">
                                  <Price amount={product.price} />
                                </span>
                                {product.originalPrice &&
                                  product.originalPrice > product.price && (
                                    <span className="ml-2 text-gray-500 line-through">
                                      <Price amount={product.originalPrice} />
                                    </span>
                                  )}
                              </div>
                              {product.stockCount > 0 && (
                                <button
                                  onClick={() => handleAddToCart(product.id)}
                                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                  Add to Cart
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}

        {/* Auctions Tab */}
        {activeTab === "auctions" && (
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Auction Filters Sidebar */}
            <aside
              className={`lg:w-64 ${
                showAuctionFilters ? "block" : "hidden lg:block"
              }`}
            >
              <div className="lg:sticky lg:top-4">
                <AuctionFilters
                  filters={auctionFilters}
                  onChange={setAuctionFilters}
                  onApply={handleApplyAuctionFilters}
                  onReset={handleResetAuctionFilters}
                />
              </div>
            </aside>

            {/* Auctions Section */}
            <div className="flex-1">
              <div className="bg-white rounded-lg shadow-sm p-6">
                {/* Controls */}
                <div className="mb-6">
                  <div className="flex flex-col lg:flex-row gap-4 mb-4">
                    {/* Filter Toggle (Mobile) */}
                    <button
                      onClick={() => setShowAuctionFilters(!showAuctionFilters)}
                      className="lg:hidden flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                      <FilterIcon className="h-5 w-5" />
                      Filters
                    </button>

                    <div className="flex-1"></div>

                    {/* View Toggle */}
                    <div className="hidden md:flex border border-gray-300 rounded-lg overflow-hidden">
                      <button
                        onClick={() => setView("grid")}
                        className={`px-3 py-2 ${
                          view === "grid"
                            ? "bg-purple-600 text-white"
                            : "bg-white text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        <Grid className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => setView("list")}
                        className={`px-3 py-2 ${
                          view === "list"
                            ? "bg-purple-600 text-white"
                            : "bg-white text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        <List className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Auctions Grid/List */}
                {auctionsLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
                  </div>
                ) : auctions.length === 0 ? (
                  <EmptyState
                    title="No auctions found"
                    description={
                      searchQuery
                        ? "Try adjusting your search"
                        : "This shop hasn't created any auctions yet"
                    }
                  />
                ) : (
                  <>
                    <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
                      Showing {auctions.length} auction
                      {auctions.length !== 1 ? "s" : ""}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {auctions.map((auction) => (
                        <AuctionCard
                          key={auction.id}
                          auction={{
                            id: auction.id,
                            name: auction.productName || "",
                            slug: auction.productSlug || "",
                            images: auction.productImage
                              ? [auction.productImage]
                              : [],
                            currentBid:
                              auction.currentPrice || auction.startingBid || 0,
                            startingBid: auction.startingBid || 0,
                            bidCount: auction.totalBids || 0,
                            endTime: auction.endTime,
                            status: auction.status as any,
                            featured: (auction as any).featured,
                            shop: {
                              id: shop.id,
                              name: shop.name,
                              logo: shop.logo || undefined,
                              isVerified: shop.isVerified,
                            },
                          }}
                          showShopInfo={false}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Reviews Tab */}
        {activeTab === "reviews" && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Customer Reviews
            </h2>
            <EmptyState
              title="Reviews coming soon"
              description="Shop reviews will be displayed here"
            />
          </div>
        )}

        {/* About Tab */}
        {activeTab === "about" && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              About {shop.name}
            </h2>
            {shop.description ? (
              <div
                className="prose max-w-none text-gray-700 mb-8"
                dangerouslySetInnerHTML={{ __html: shop.description }}
              />
            ) : (
              <p className="text-gray-600 mb-8">No description available.</p>
            )}

            {/* Policies Section */}
            {(shop.policies?.shippingPolicy || shop.policies?.returnPolicy) && (
              <div className="grid md:grid-cols-2 gap-6">
                {shop.policies.shippingPolicy && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                      Shipping Policy
                    </h3>
                    <div className="text-gray-700">
                      {shop.policies.shippingPolicy}
                    </div>
                  </div>
                )}
                {shop.policies.returnPolicy && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                      Return Policy
                    </h3>
                    <div className="text-gray-700">
                      {shop.policies.returnPolicy}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Contact & Social */}
            {(shop.email || shop.phone) && (
              <div className="mt-8 pt-8 border-t">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Contact Information
                </h3>
                <div className="space-y-2 text-gray-700">
                  {shop.email && <div>Email: {shop.email}</div>}
                  {shop.phone && <div>Phone: {shop.phone}</div>}
                  {shop.website && (
                    <div>
                      Website:{" "}
                      <a
                        href={shop.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        {shop.website}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
