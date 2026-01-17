"use client";

import { ShopAbout } from "@/components/shop/ShopAbout";
import { ShopAuctions } from "@/components/shop/ShopAuctions";
import { ShopHeader } from "@/components/shop/ShopHeader";
import { ShopPolicies } from "@/components/shop/ShopPolicies";
import { ShopProducts } from "@/components/shop/ShopProducts";
import { ShopReviews } from "@/components/shop/ShopReviews";
import { ShopStats } from "@/components/shop/ShopStats";
import { ShopTabs, type ShopTabType } from "@/components/shop/ShopTabs";
import { notFound } from "@/lib/error-redirects";
import { logError } from "@/lib/firebase-error-logger";
import { auctionsService } from "@/services/auctions.service";
import { productsService } from "@/services/products.service";
import { shopsService } from "@/services/shops.service";
import type { AuctionCardFE } from "@/types/frontend/auction.types";
import type { ProductCardFE } from "@/types/frontend/product.types";
import type { ShopFE } from "@/types/frontend/shop.types";
import {
  AuctionFilterValues,
  ProductFilterValues,
  useCart,
  useLoadingState,
} from "@letitrip/react-library";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { use, useEffect, useState } from "react";
import { toast } from "sonner";

interface ShopPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default function ShopPage({ params }: ShopPageProps) {
  const router = useRouter();
  const { addItem } = useCart();
  const { slug } = use(params);

  const [products, setProducts] = useState<ProductCardFE[]>([]);
  const [auctions, setAuctions] = useState<AuctionCardFE[]>([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [auctionsLoading, setAuctionsLoading] = useState(false);
  const {
    isLoading: loading,
    data: shop,
    setData: setShop,
    execute,
  } = useLoadingState<ShopFE>({
    onLoadError: (err) => {
      logError(err, {
        component: "ShopPage.loadShop",
        metadata: { slug },
      });
      router.push(notFound.shop(slug, err));
    },
  });

  // Tab state
  const [activeTab, setActiveTab] = useState<ShopTabType>("products");

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

  const loadShop = () =>
    execute(async () => {
      return await shopsService.getBySlug(slug);
    });

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
            .filter((brand): brand is string => Boolean(brand))
        ),
      ];
      setAvailableBrands(brands);
    } catch (error) {
      logError(error as Error, {
        component: "ShopPage.loadProducts",
        metadata: { shopId: shop?.id },
      });
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
      logError(error as Error, {
        component: "ShopPage.loadAuctions",
        metadata: { shopId: shop?.id },
      });
    } finally {
      setAuctionsLoading(false);
    }
  };

  const handleProductSort = (
    newSortBy: string,
    newSortOrder: "asc" | "desc"
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
    newSortOrder: "asc" | "desc"
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
      <ShopTabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
        reviewCount={shop.reviewCount}
        productCount={products.length}
        auctionCount={auctions.length}
        tabs={[
          { id: "products", label: "Products" },
          { id: "auctions", label: "Auctions" },
          { id: "about", label: "About" },
          { id: "reviews", label: "Reviews" },
        ]}
      />

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
