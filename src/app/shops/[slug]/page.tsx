"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Gavel } from "lucide-react";
import { shopsService } from "@/services/shops.service";
import { productsService } from "@/services/products.service";
import { auctionsService } from "@/services/auctions.service";
import { notFound } from "@/lib/error-redirects";
import { ShopHeader } from "@/components/shop/ShopHeader";
import { ShopAbout } from "@/components/shop/ShopAbout";
import { ShopStats } from "@/components/shop/ShopStats";
import { ShopProducts } from "@/components/shop/ShopProducts";
import { ShopAuctions } from "@/components/shop/ShopAuctions";
import { ShopReviews } from "@/components/shop/ShopReviews";
import { ShopPolicies } from "@/components/shop/ShopPolicies";
import { useCart } from "@/hooks/useCart";
import type { ShopFE } from "@/types/frontend/shop.types";
import type { ProductCardFE } from "@/types/frontend/product.types";
import type { AuctionCardFE } from "@/types/frontend/auction.types";
import { ProductFilterValues } from "@/components/filters/ProductFilters";
import { AuctionFilterValues } from "@/components/filters/AuctionFilters";

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
  const [productsLoading, setProductsLoading] = useState(false);
  const [auctionsLoading, setAuctionsLoading] = useState(false);

  // Tab state
  const [activeTab, setActiveTab] = useState<TabType>("products");

  // Filters and sort state
  const [sortBy, setSortBy] = useState<string>("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [productFilters, setProductFilters] = useState<ProductFilterValues>({});
  const [auctionFilters, setAuctionFilters] = useState<AuctionFilterValues>({
    sortBy: "endTime",
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
        sortBy: apiSortBy,
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

      const brands = [
        ...new Set(
          productsData
            .map((p) => p.brand)
            .filter((brand): brand is string => Boolean(brand)),
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
      console.error("Failed to load auctions:", error);
    } finally {
      setAuctionsLoading(false);
    }
  };

  const handleProductSort = (
    newSortBy: string,
    newSortOrder: "asc" | "desc",
  ) => {
    setSortBy(newSortBy);
    setSortOrder(newSortOrder);
  };

  const handleProductFilters = (filters: ProductFilterValues) => {
    setProductFilters(filters);
    loadProducts();
  };

  const handleAuctionSort = (
    newSortBy: string,
    newSortOrder: "asc" | "desc",
  ) => {
    setSortBy(newSortBy);
    setSortOrder(newSortOrder);
  };

  const handleAuctionFilters = (filters: AuctionFilterValues) => {
    setAuctionFilters(filters);
    loadAuctions();
  };

  const handleAddToCart = async (
    productId: string,
    productDetails?: {
      name: string;
      price: number;
      image: string;
      shopId: string;
      shopName: string;
    },
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
