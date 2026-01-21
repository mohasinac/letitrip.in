/**
 * Category Detail Page
 *
 * Shows products in a specific category with filters and sorting.
 *
 * @page /categories/[slug] - Category detail page
 */

import { Breadcrumb } from "@/components/common/Breadcrumb";
import { ProductCard } from "@/components/common/ProductCard";
import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { API_ENDPOINTS } from "@/constants/api-endpoints";
import { ROUTES } from "@/constants/routes";
import {
  FALLBACK_CATEGORIES,
  FALLBACK_PRODUCTS,
  fetchWithFallback,
} from "@/lib/fallback-data";
import { ClientLink, SortDropdown } from "@mohasinac/react-library";

interface PageProps {
  params: {
    slug: string;
  };
  searchParams: {
    sort?: string;
    minPrice?: string;
    maxPrice?: string;
    cursor?: string;
  };
}

// Fetch category details
async function getCategoryDetails(slug: string) {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

  return fetchWithFallback(
    async () => {
      const res = await fetch(
        `${baseUrl}${API_ENDPOINTS.CATEGORIES.DETAIL(slug)}`,
        {
          next: { revalidate: 300 },
        },
      );

      if (!res.ok) throw new Error("Failed to fetch category");
      const data = await res.json();
      return data.data;
    },
    FALLBACK_CATEGORIES[0],
    `Failed to fetch category ${slug}, using fallback`,
  );
}

// Fetch category products
async function getCategoryProducts(
  slug: string,
  searchParams: PageProps["searchParams"],
) {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

  const queryParams = new URLSearchParams();
  queryParams.set("categorySlug", slug);
  if (searchParams.sort) queryParams.set("sort", searchParams.sort);
  if (searchParams.minPrice) queryParams.set("minPrice", searchParams.minPrice);
  if (searchParams.maxPrice) queryParams.set("maxPrice", searchParams.maxPrice);
  if (searchParams.cursor) queryParams.set("cursor", searchParams.cursor);
  queryParams.set("limit", "24");

  return fetchWithFallback(
    async () => {
      const res = await fetch(
        `${baseUrl}/api/products?${queryParams.toString()}`,
        { next: { revalidate: 300 } },
      );

      if (!res.ok) throw new Error("Failed to fetch products");
      const data = await res.json();
      return {
        products: data.data?.products || [],
        hasMore: data.data?.hasMore || false,
        nextCursor: data.data?.nextCursor || null,
      };
    },
    {
      products: FALLBACK_PRODUCTS,
      hasMore: false,
      nextCursor: null,
    },
    `Failed to fetch category products, using fallback`,
  );
}

// Generate metadata
export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const category = await getCategoryDetails(params.slug);

  return {
    title: `${category.name} - Shop by Category | Let It Rip`,
    description: `Browse ${category.name} products. ${category.productCount}+ items available.`,
    openGraph: {
      title: `${category.name} | Let It Rip`,
      description: `Shop ${category.name} products on Let It Rip`,
      images: category.image ? [category.image] : [],
    },
  };
}

const SORT_OPTIONS = [
  { label: "Newest First", value: "newest" },
  { label: "Price: Low to High", value: "price-asc" },
  { label: "Price: High to Low", value: "price-desc" },
  { label: "Most Popular", value: "popular" },
  { label: "Highest Rated", value: "rating" },
];

export default async function CategoryDetailPage({
  params,
  searchParams,
}: PageProps) {
  const category = await getCategoryDetails(params.slug);
  const { products, hasMore, nextCursor } = await getCategoryProducts(
    params.slug,
    searchParams,
  );

  if (!category) {
    notFound();
  }

  const currentSort = searchParams.sort || "newest";

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumbs */}
        <Breadcrumb
          currentPath={ROUTES.CATEGORIES.DETAIL(params.slug)}
          LinkComponent={ClientLink}
        />

        {/* Category Header */}
        <div className="mt-6 mb-8">
          <div className="relative h-48 bg-gradient-to-r from-primary/20 to-primary/10 rounded-lg overflow-hidden mb-6">
            {category.image && (
              <img
                src={category.image}
                alt={category.name}
                className="w-full h-full object-cover opacity-50"
              />
            )}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                  {category.name}
                </h1>
                <p className="text-lg text-gray-600 dark:text-gray-400">
                  {category.productCount?.toLocaleString()} products available
                </p>
              </div>
            </div>
          </div>

          {/* Subcategories */}
          {category.subcategories && category.subcategories.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Browse:
              </span>
              {category.subcategories.map((sub: string, index: number) => (
                <Link
                  key={index}
                  href={`${ROUTES.CATEGORIES.DETAIL(
                    params.slug,
                  )}?subcategory=${sub}`}
                  className="px-4 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-750 transition"
                >
                  {sub}
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Showing {products.length} of{" "}
            {category.productCount?.toLocaleString()} products
          </div>
          <SortDropdown
            currentSort={currentSort}
            options={SORT_OPTIONS}
            defaultValue="newest"
          />
        </div>

        {/* Products Grid */}
        {products.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-8">
              {products.map((product: any) => (
                <ProductCard
                  key={product.id}
                  id={product.id}
                  name={product.name}
                  slug={product.slug}
                  price={product.price}
                  originalPrice={product.originalPrice}
                  image={product.images?.[0]}
                  images={product.images}
                  rating={product.rating}
                  reviewCount={product.reviewCount}
                  inStock={product.stock > 0}
                  featured={product.featured}
                  condition={product.condition}
                  shopName={product.shopName}
                  shopSlug={product.shopSlug}
                  variant="public"
                />
              ))}
            </div>

            {/* Load More */}
            {hasMore && (
              <div className="flex justify-center">
                <Link
                  href={`?${new URLSearchParams({
                    ...searchParams,
                    cursor: nextCursor,
                  }).toString()}`}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition"
                >
                  Load More Products
                </Link>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">📦</div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No Products Found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              No products available in this category yet. Check back soon!
            </p>
            <Link
              href={ROUTES.PRODUCTS.LIST}
              className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition"
            >
              Browse All Products
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
