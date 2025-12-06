/**
 * @fileoverview React Component
 * @module src/app/shops/[slug]/page
 * @description This file contains the page component and its related functionality
 * 
 * @created 2025-12-05
 * @author mohasinac
 * @see {@link https://mohasin.chinnapattan.com}
 */

"use client";

import { AuctionFilterValues } from "@/components/filters/AuctionFilters";
import { ProductFilterValues } from "@/components/filters/ProductFilters";
import { ShopAbout } from "@/components/shop/ShopAbout";
import { ShopAuctions } from "@/components/shop/ShopAuctions";
import { ShopHeader } from "@/components/shop/ShopHeader";
import { ShopPolicies } from "@/components/shop/ShopPolicies";
import { ShopProducts } from "@/components/shop/ShopProducts";
import { ShopReviews } from "@/components/shop/ShopReviews";
import { ShopStats } from "@/components/shop/ShopStats";
import { useCart } from "@/hooks/useCart";
import { useLoadingState } from "@/hooks/useLoadingState";
import { notFound } from "@/lib/error-redirects";
import { logError } from "@/lib/firebase-error-logger";
import { auctionsService } from "@/services/auctions.service";
import { productsService } from "@/services/products.service";
import { shopsService } from "@/services/shops.service";
import type { AuctionCardFE } from "@/types/frontend/auction.types";
import type { ProductCardFE } from "@/types/frontend/product.types";
import type { ShopFE } from "@/types/frontend/shop.types";
import { Gavel, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { use, useEffect, useState } from "react";
import { toastAction, toastErr } from "@/lib/toast-helper";

/**
 * ShopPageProps interface
 * 
 * @interface
 * @description Defines the structure and contract for ShopPageProps
 */
interface ShopPageProps {
  /** Params */
  params: Promise<{
    /** Slug */
    slug: string;
  }>;
}

/**
 * TabType type
 * 
 * @typedef {Object} TabType
 * @description Type definition for TabType
 */
type TabType = "products" | "auctions" | "reviews" | "about";

export default /**
 * Performs shop page operation
 *
 * @param {ShopPageProps} { params } - The { params }
 *
 * @returns {any} The shoppage result
 *
 */
function ShopPage({ params }: ShopPageProps) {
  const router = useRouter();
  const { addItem } = useCart();
  const { slug } = use(params);

  const [products, setProducts] = useState<ProductCardFE[]>([]);
  const [auctions, setAuctions] = useState<AuctionCardFE[]>([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [auctionsLoading, setAuctionsLoading] = useState(false);
  const {
    /** Is Loading */
    isLoading: loading,
    /** Data */
    data: shop,
    /** Set Data */
    setData: setShop,
    execute,
  } = useLoadingState<ShopFE>({
    /** On Load Error */
    onLoadError: (err) => {
      logError(err, {
        /** Component */
        component: "ShopPage.loadShop",
        /** Metadata */
        metadata: { slug },
      });
      router.push(notFound.shop(slug, err));
    },
  });

  // Tab state
  const [activeTab, setActiveTab] = useState<TabType>("products");

  // Filters and sort state
  const [sortBy, setSortBy] = useState<string>("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [productFilters, setProductFilters] = useState<ProductFilterValues>({});
  const [auctionFilters, setAuctionFilters] = useState<AuctionFilterValues>({
    /** Sort By */
    sortBy: "endTime",
    /** Sort Order */
    sortOrder: "asc",
  });
  const [availableBrands, setAvailableBrands] = useState<string[]>([]);

  useEffect(() => {
    loadShop();
  }, [slug]);

  useEffect(() => {
    if (shop) {
      if (activeTab === "products") {
        loadProducts();
      } else if (activeTab === "auctions") {
        loadAuctions();
      }
    }
  }, [shop, sortBy, sortOrder, activeTab]);

  /**
   * Fetches shop from server
   *
   * @returns {Promise<any>} Promise resolving to shop result
   *
   * @throws {Error} When operation fails or validation errors occur
   */

  /**
   * Fetches shop from server
   *
   * @returns {Promise<any>} Promise resolving to shop result
   *
   * @throws {Error} When operation fails or validation errors occur
   */

  const loadShop = () =>
    execute(async () => {
      return await shopsService.getBySlug(slug);
    });

  /**
   * Performs async operation
   *
   * @returns {Promise<any>} Promise resolving to async  result
   *
   * @throws {Error} When operation fails or validation errors occur
   */

  /**
   * Performs async operation
   *
   * @returns {Promise<any>} Promise resolving to async  result
   *
   * @throws {Error} When operation fails or validation errors occur
   */

  const loadProducts = async () => {
    try {
      setProductsLoading(true);
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
        /** Shop Id */
        shopId: slug,
        /** Sort By */
        sortBy: apiSortBy,
        /** Category Id */
        categoryId: productFilters.categories?.[0],
        /** Price Range */
        priceRange:
          productFilters.priceMin || productFilters.priceMax
            ? {
                /** Min */
                min: productFilters.priceMin || 0,
                /** Max */
                max: productFilters.priceMax || 999999,
              }
            : undefined,
        /** In Stock */
        inStock:
          productFilters.stock === "in_stock"
            ? true
            : productFilters.stock === "out_of_stock"
              ? false
              : undefined,
        /** Featured */
        featured: productFilters.featured,
        /** Rating */
        rating: productFilters.rating,
      });

      const productsData = response.data || [];
      setProducts(productsData);

      /**
 * Performs brands operation
 *
 * @param {any} productsData.map((p - The productsdata.map((p
 *
 * @returns {any} The brands result
 *
 */
const brands = [
        ...new Set(
          productsData
            .map((p) => p.brand)
            .filter((brand): brand is string => Boolean(brand)),
        ),
      ];
      setAvailableBrands(brands);
    } catch (error) {
      logError(error as Error, {
        /** Component */
        component: "ShopPage.loadProducts",
        /** Metadata */
        metadata: { shopId: shop?.id },
      });
    } finally {
      setProductsLoading(false);
    }
  };

  /**
   * Performs async operation
   *
   * @returns {Promise<any>} Promise resolving to async  result
   *
   * @throws {Error} When operation fails or validation errors occur
   */

  /**
   * Performs async operation
   *
   * @returns {Promise<any>} Promise resolving to async  result
   *
   * @throws {Error} When operation fails or validation errors occur
   */

  const loadAuctions = async () => {
    try {
      setAuctionsLoading(true);
      const apiFilters: any = {
        /** Shop Id */
        shopId: slug,
        /** Limit */
        limit: 100,
      };
      if (auctionFilters.status && auctionFilters.status.length > 0) {
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
      logError(error as Error, {
        /** Component */
        component: "ShopPage.loadAuctions",
        /** Metadata */
        metadata: { shopId: shop?.id },
      });
    } finally {
      setAuctionsLoading(false);
    }
  };

  /**
   * Handles product sort event
   *
   * @param {string} newSortBy - The new sort by
   * @param {"asc" | "desc"} newSortOrder - The new sort order
   *
   * @returns {string} The handleproductsort result
   */

  /**
   * Handles product sort event
   *
   * @returns {string} The handleproductsort result
   */

  const handleProductSort = (
    /** New Sort By */
    newSortBy: string,
    /** New Sort Order */
    newSortOrder: "asc" | "desc",
  ) => {
    setSortBy(newSortBy);
    setSortOrder(newSortOrder);
  };

  /**
   * Handles product filters event
   *
   * @param {ProductFilterValues} filters - The filters
   *
   * @returns {any} The handleproductfilters result
   */

  /**
   * Handles product filters event
   *
   * @param {ProductFilterValues} filters - The filters
   *
   * @returns {any} The handleproductfilters result
   */

  const handleProductFilters = (filters: ProductFilterValues) => {
    setProductFilters(filters);
    loadProducts();
  };

  /**
   * Handles auction sort event
   *
   * @param {string} newSortBy - The new sort by
   * @param {"asc" | "desc"} newSortOrder - The new sort order
   *
   * @returns {string} The handleauctionsort result
   */

  /**
   * Handles auction sort event
   *
   * @returns {string} The handleauctionsort result
   */

  const handleAuctionSort = (
    /** New Sort By */
    newSortBy: string,
    /** New Sort Order */
    newSortOrder: "asc" | "desc",
  ) => {
    setSortBy(newSortBy);
    setSortOrder(newSortOrder);
  };

  /**
   * Handles auction filters event
   *
   * @param {AuctionFilterValues} filters - The filters
   *
   * @returns {any} The handleauctionfilters result
   */

  /**
   * Handles auction filters event
   *
   * @param {AuctionFilterValues} filters - The filters
   *
   * @returns {any} The handleauctionfilters result
   */

  const handleAuctionFilters = (filters: AuctionFilterValues) => {
    setAuctionFilters(filters);
    loadAuctions();
  };

  /**
   * Performs async operation
   *
   * @returns {Promise<any>} Promise resolving to async  result
   *
   * @throws {Error} When operation fails or validation errors occur
   */

  /**
   * Performs async operation
   *
   * @returns {Promise<any>} Promise resolving to async  result
   *
   * @throws {Error} When operation fails or validation errors occur
   */

  const handleAddToCart = async (
    /** Product Id */
    productId: string,
    /** Product Details */
    productDetails?: {
      /** Name */
      name: string;
      /** Price */
      price: number;
      /** Image */
      image: string;
      /** Shop /**
 * Performs product operation
 *
 * @param {any} (p - The (p
 *
 * @returns {any} The product result
 *
 */
Id */
      shopId: string;
      /** Shop Name */
      shopName: string;
    },
  ) => {
    try {
      if (!productDetails) {
        const product = products.find((p) => p.id === productId);
        if (!product) throw new Error("Product not found");
        productDetails = {
          /** Name */
          name: product.name,
          /** Price */
          price: product.price,
          /** Image */
          image: product.images?.[0] || "",
          /** Shop Id */
          shopId: product.shopId,
          /** Shop Name */
          shopName: shop?.name || "",
        };
      }
      await addItem(productId, 1, undefined, productDetails);
      toastAction.addedToCart();
    } catch (error: any) {
      toastErr.custom(error.message || "Failed to add to cart");
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
              Products
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
              Auctions
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
          <ShopProducts
            products={products}
            loading={productsLoading}
            shopName={shop.name}
            shopId={shop.id}
            shopSlug={shop.slug}
            onSortChange={handleProductSort}
            onFiltersChange={handleProductFilters}
            onAddToCart={handleAddToCart}
            availableBrands={availableBrands}
          />
        )}

        {/* Auctions Tab */}
        {activeTab === "auctions" && (
          <ShopAuctions
            auctions={auctions}
            loading={auctionsLoading}
            shopId={shop.id}
            shopName={shop.name}
            shopLogo={shop.logo || undefined}
            isVerified={shop.isVerified}
            onSortChange={handleAuctionSort}
            onFiltersChange={handleAuctionFilters}
          />
        )}

        {/* Reviews Tab */}
        {activeTab === "reviews" && <ShopReviews shop={shop} />}

        {/* About Tab */}
        {activeTab === "about" && (
          <div className="space-y-6">
            <ShopStats shop={shop} />
            <ShopAbout shop={shop} />
            <ShopPolicies shop={shop} />
          </div>
        )}
      </div>
    </div>
  );
}
