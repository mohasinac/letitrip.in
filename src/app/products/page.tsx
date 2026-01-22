/**
 * All Products Listing Page
 *
 * Shows all products without category filtering.
 * This is a dedicated page for /buy-product-all route.
 *
 * @page /buy-product-all - All products listing
 */

import { Metadata } from "next";
import Link from "next/link";

import { Breadcrumb } from "@/components/common/Breadcrumb";
import { ProductCard } from "@/components/common/ProductCard";

import { ROUTES } from "@/constants/routes";
import { ClientLink, SortDropdown } from "@mohasinac/react-library";

// Types
interface PageProps {
  searchParams: Promise<{
    q?: string;
    sort?: string;
    minPrice?: string;
    maxPrice?: string;
    condition?: string;
    shopSlug?: string;
    inStock?: string;
    featured?: string;
    cursor?: string;
    limit?: string;
  }>;
}

// Generate metadata
export async function generateMetadata({
  searchParams,
}: PageProps): Promise<Metadata> {
  const { q } = await searchParams;
  const searchQuery = q;

  let title = "All Products | Let It Rip";
  let description =
    "Browse all products with great deals and verified sellers.";

  if (searchQuery) {
    title = `"${searchQuery}" in All Products | Let It Rip`;
    description = `Search results for "${searchQuery}" in all products.`;
  }

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
    },
  };
}

// Sort options
const SORT_OPTIONS = [
  { label: "Newest First", value: "newest" },
  { label: "Price: Low to High", value: "price-asc" },
  { label: "Price: High to Low", value: "price-desc" },
  { label: "Most Popular", value: "popular" },
  { label: "Highest Rated", value: "rating" },
];

// Fetch products server-side
async function getProducts(searchParams: PageProps["searchParams"]) {
  const params = await searchParams;
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3002";

  // Build query params
  const queryParams = new URLSearchParams();

  if (params.q) queryParams.set("search", params.q);
  if (params.sort) queryParams.set("sort", params.sort);
  if (params.minPrice) queryParams.set("minPrice", params.minPrice);
  if (params.maxPrice) queryParams.set("maxPrice", params.maxPrice);
  if (params.condition) queryParams.set("condition", params.condition);
  if (params.shopSlug) queryParams.set("shopSlug", params.shopSlug);
  if (params.inStock === "true") queryParams.set("inStock", "true");
  if (params.featured === "true") queryParams.set("featured", "true");
  if (params.cursor) queryParams.set("cursor", params.cursor);
  if (params.limit) queryParams.set("limit", params.limit);
  else queryParams.set("limit", "24");

  try {
    const res = await fetch(
      `${baseUrl}/api/products?${queryParams.toString()}`,
      {
        next: { revalidate: 300 }, // Cache for 5 minutes
      },
    );

    if (!res.ok) {
      console.error("Failed to fetch products:", res.status);
      return { products: [], hasMore: false, nextCursor: null };
    }

    const data = await res.json();
    // API will return fallback data if Firebase fails
    return {
      products: data.data?.products || [],
      hasMore: data.data?.hasMore || false,
      nextCursor: data.data?.nextCursor || null,
      fallback: data.fallback || false,
    };
  } catch (error) {
    console.error("Error fetching products:", error);
    return { products: [], hasMore: false, nextCursor: null };
  }
}

export default async function AllProductsPage({ searchParams }: PageProps) {
  // Fetch data
  const { products, hasMore, nextCursor } = await getProducts(searchParams);
  const { sort = "newest", q } = await searchParams;

  // Build breadcrumbs
  const breadcrumbs = [
    { label: "Home", href: ROUTES.HOME },
    { label: "All Products", href: ROUTES.PRODUCTS.LIST },
  ];

  // Current filters
  const currentSort = sort;

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumbs */}
        <Breadcrumb
          currentPath={ROUTES.PRODUCTS.LIST}
          LinkComponent={ClientLink}
        />

        {/* Header */}
        <div className="mt-6 mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {q ? `Search: "${q}"` : "All Products"}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {products.length} {products.length === 1 ? "product" : "products"}{" "}
            found
          </p>
        </div>

        {/* Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Showing {products.length} products
          </div>

          {/* Sort Dropdown */}
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

            {/* Pagination */}
            {hasMore && (
              <div className="flex justify-center">
                <Link
                  href={`?${new URLSearchParams({
                    ...searchParams,
                    cursor: nextCursor,
                  }).toString()}`}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition"
                >
                  Load More
                </Link>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No products found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Try adjusting your filters or search query
            </p>
            <Link
              href={ROUTES.PRODUCTS.LIST}
              className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition"
            >
              View All Products
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
