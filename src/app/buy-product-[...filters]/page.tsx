/**
 * Product Listing Page
 *
 * Dynamic product listing with filters, search, sorting, and pagination.
 * Supports multiple view modes (grid/table) and SEO-friendly URLs.
 *
 * URL Examples:
 * - /buy-product-all - All products
 * - /buy-product-electronics - Electronics category
 * - /buy-product-all?sort=price-asc&inStock=true
 * - /buy-product-fashion?minPrice=500&maxPrice=2000
 *
 * @page /buy-product-[...filters] - Product listing
 */

import { Breadcrumb, ProductCard } from "@letitrip/react-library";
import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ClientLink } from "@/components/common/ClientLink";
import { SortDropdown } from "@/components/common/SortDropdown";

// Types
interface PageProps {
  params: {
    filters: string[];
  };
  searchParams: {
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
  };
}

// Category mapping
const CATEGORY_MAP: Record<string, string> = {
  all: "All Products",
  electronics: "Electronics",
  fashion: "Fashion & Apparel",
  "home-garden": "Home & Garden",
  sports: "Sports & Outdoors",
  books: "Books & Media",
  toys: "Toys & Games",
  automotive: "Automotive",
  "health-beauty": "Health & Beauty",
  jewelry: "Jewelry & Accessories",
  "art-collectibles": "Art & Collectibles",
};

// Generate metadata dynamically
export async function generateMetadata({
  params,
  searchParams,
}: PageProps): Promise<Metadata> {
  const category = params.filters?.[0] || "all";
  const categoryName = CATEGORY_MAP[category] || "Products";
  const searchQuery = searchParams.q;

  let title = `${categoryName} | Let It Rip`;
  let description = `Browse ${categoryName.toLowerCase()} with great deals and verified sellers.`;

  if (searchQuery) {
    title = `"${searchQuery}" in ${categoryName} | Let It Rip`;
    description = `Search results for "${searchQuery}" in ${categoryName.toLowerCase()}.`;
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
async function getProducts(
  params: PageProps["params"],
  searchParams: PageProps["searchParams"],
) {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
  const category = params.filters?.[0];

  // Build query params
  const queryParams = new URLSearchParams();

  if (category && category !== "all") {
    queryParams.set("categorySlug", category);
  }
  if (searchParams.q) queryParams.set("search", searchParams.q);
  if (searchParams.sort) queryParams.set("sort", searchParams.sort);
  if (searchParams.minPrice) queryParams.set("minPrice", searchParams.minPrice);
  if (searchParams.maxPrice) queryParams.set("maxPrice", searchParams.maxPrice);
  if (searchParams.condition)
    queryParams.set("condition", searchParams.condition);
  if (searchParams.shopSlug) queryParams.set("shopSlug", searchParams.shopSlug);
  if (searchParams.inStock === "true") queryParams.set("inStock", "true");
  if (searchParams.featured === "true") queryParams.set("featured", "true");
  if (searchParams.cursor) queryParams.set("cursor", searchParams.cursor);
  if (searchParams.limit) queryParams.set("limit", searchParams.limit);
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
    return {
      products: data.data?.products || [],
      hasMore: data.data?.hasMore || false,
      nextCursor: data.data?.nextCursor || null,
    };
  } catch (error) {
    console.error("Error fetching products:", error);
    return { products: [], hasMore: false, nextCursor: null };
  }
}

export default async function ProductListingPage({
  params,
  searchParams,
}: PageProps) {
  const category = params.filters?.[0] || "all";
  const categoryName = CATEGORY_MAP[category];

  // Validate category
  if (!categoryName) {
    notFound();
  }

  // Fetch data
  const { products, hasMore, nextCursor } = await getProducts(
    params,
    searchParams,
  );

  // Build breadcrumbs
  const breadcrumbs = [
    { label: "Home", href: "/" },
    { label: "Products", href: "/buy-product-all" },
  ];

  if (category !== "all") {
    breadcrumbs.push({
      label: categoryName,
      href: `/buy-product-${category}`,
    });
  }

  // Current filters
  const currentSort = searchParams.sort || "newest";

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumbs */}
        <Breadcrumb
          currentPath={`/buy-product-${category}`}
          LinkComponent={ClientLink}
        />

        {/* Header */}
        <div className="mt-6 mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {searchParams.q ? `Search: "${searchParams.q}"` : categoryName}
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
                  LinkComponent={ClientLink}
                  ImageComponent={"img" as any}
                  formatPrice={(price) => `₹${price.toLocaleString()}`}
                  formatDiscount={(discount) => `-${discount}%`}
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
              href="/buy-product-all"
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
