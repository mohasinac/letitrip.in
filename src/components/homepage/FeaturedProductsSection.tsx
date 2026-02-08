"use client";

import Image from "next/image";
import { useApiQuery } from "@/hooks";
import { API_ENDPOINTS } from "@/constants/api-endpoints";
import { THEME_CONSTANTS } from "@/constants";
import { Button } from "@/components";

interface Product {
  id: string;
  title: string;
  slug: string;
  price: number;
  currency: string;
  mainImage: string;
  isPromoted: boolean;
  brand?: string;
  category: string;
}

export function FeaturedProductsSection() {
  const { data, isLoading } = useApiQuery<{ products: Product[] }>({
    queryKey: ["products", "featured"],
    queryFn: () =>
      fetch(
        `${API_ENDPOINTS.PRODUCTS.LIST}?isPromoted=true&status=published&limit=18`,
      ).then((r) => r.json()),
  });

  if (isLoading) {
    return (
      <section
        className={`${THEME_CONSTANTS.spacing.padding.xl} ${THEME_CONSTANTS.themed.bgSecondary}`}
      >
        <div className={`${THEME_CONSTANTS.container["2xl"]} mx-auto`}>
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-lg mb-8 max-w-xs animate-pulse" />
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6">
            {[...Array(18)].map((_, i) => (
              <div key={i} className="space-y-3">
                <div className="aspect-square bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-20" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  const products = data?.products || [];

  if (products.length === 0) {
    return null;
  }

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <section
      className={`${THEME_CONSTANTS.spacing.padding.xl} ${THEME_CONSTANTS.themed.bgSecondary}`}
    >
      <div className={`${THEME_CONSTANTS.container["2xl"]} mx-auto`}>
        {/* Section Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2
              className={`${THEME_CONSTANTS.typography.h2} ${THEME_CONSTANTS.themed.textPrimary} mb-2`}
            >
              Featured Products
            </h2>
            <p
              className={`${THEME_CONSTANTS.typography.body} ${THEME_CONSTANTS.themed.textSecondary}`}
            >
              Handpicked items just for you
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => (window.location.href = "/products")}
          >
            View All
          </Button>
        </div>

        {/* Products Grid - 2 rows of 9 products each on desktop */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-9 gap-3 md:gap-4">
          {products.slice(0, 18).map((product) => (
            <button
              key={product.id}
              className={`group ${THEME_CONSTANTS.themed.bgPrimary} ${THEME_CONSTANTS.borderRadius.lg} overflow-hidden hover:shadow-xl transition-all`}
              onClick={() =>
                (window.location.href = `/products/${product.slug}`)
              }
            >
              {/* Product Image */}
              <div className="relative aspect-square overflow-hidden">
                <Image
                  src={product.mainImage}
                  alt={product.title}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-300"
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 11vw"
                />
                {product.isPromoted && (
                  <div className="absolute top-2 left-2 bg-yellow-500 text-white text-xs font-bold px-2 py-1 rounded">
                    Featured
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div
                className={`${THEME_CONSTANTS.spacing.padding.sm} text-left`}
              >
                {product.brand && (
                  <p
                    className={`${THEME_CONSTANTS.typography.small} ${THEME_CONSTANTS.themed.textSecondary} mb-1`}
                  >
                    {product.brand}
                  </p>
                )}
                <h3
                  className={`${THEME_CONSTANTS.typography.body} ${THEME_CONSTANTS.themed.textPrimary} font-medium mb-2 line-clamp-2 min-h-[2.5rem]`}
                >
                  {product.title}
                </h3>
                <p
                  className={`${THEME_CONSTANTS.typography.h4} ${THEME_CONSTANTS.themed.textPrimary} font-bold`}
                >
                  {formatPrice(product.price, product.currency)}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
