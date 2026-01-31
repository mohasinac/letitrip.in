/**
 * Shop Detail Page
 *
 * Displays detailed information about a specific shop/seller.
 * Shows products, reviews, ratings, and shop information.
 *
 * @page /shops/[slug] - Shop detail page
 */

import { Breadcrumb, ProductCard } from "@mohasinac/react-library";
import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ClientShopHeader } from "@/components/common/ClientShopHeader";
import { API_ENDPOINTS } from "@/constants/api-endpoints";
import { ROUTES } from "@/constants/routes";
import {
  FALLBACK_PRODUCTS,
  FALLBACK_SHOPS,
  fetchWithFallback,
} from "@/lib/fallback-data";
import { ClientLink, SortDropdown } from "@mohasinac/react-library";

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
  searchParams: Promise<{
    sort?: string;
    category?: string;
    cursor?: string;
  }>;
}

// Fetch shop details
async function getShopDetails(slug: string) {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3002";

  return fetchWithFallback(
    async () => {
      const res = await fetch(`${baseUrl}${API_ENDPOINTS.SHOPS.DETAIL(slug)}`, {
        next: { revalidate: 300 },
      });

      if (!res.ok) throw new Error("Failed to fetch shop");
      const data = await res.json();
      return data.data;
    },
    FALLBACK_SHOPS[0],
    `Failed to fetch shop ${slug}, using fallback`,
  );
}

// Fetch shop products
async function getShopProducts(
  slug: string,
  searchParams: PageProps["searchParams"],
) {
  const params = await searchParams;
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3002";

  const queryParams = new URLSearchParams();
  queryParams.set("shopSlug", slug);
  if (params.sort) queryParams.set("sort", params.sort);
  if (params.category) queryParams.set("categorySlug", params.category);
  if (params.cursor) queryParams.set("cursor", params.cursor);
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
    `Failed to fetch shop products, using fallback`,
  );
}

// Generate metadata
export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const shop = await getShopDetails(resolvedParams.slug);

  return {
    title: `${shop.name} - Shop | Let It Rip`,
    description: shop.description || `Browse products from ${shop.name}`,
    openGraph: {
      title: `${shop.name} | Let It Rip`,
      description: shop.description,
      images: shop.banner ? [shop.banner] : [],
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

export default async function ShopDetailPage({
  params,
  searchParams,
}: PageProps) {
  const { slug } = await params;
  const { sort = "newest" } = await searchParams;

  const shop = await getShopDetails(slug);
  const { products, hasMore, nextCursor } = await getShopProducts(
    slug,
    searchParams,
  );

  if (!shop) {
    notFound();
  }

  const currentSort = sort;

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumbs */}
        <Breadcrumb
          currentPath={ROUTES.SHOPS.DETAIL(slug)}
          LinkComponent={ClientLink}
        />

        {/* Shop Header */}
        <div className="mt-6 mb-8 bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
          <ClientShopHeader shop={shop} ImageComponent={"img" as any} />
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b border-gray-200 dark:border-gray-700">
          <button className="px-4 py-2 font-semibold text-primary border-b-2 border-primary">
            Products ({products.length})
          </button>
          <button className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
            Reviews ({shop.reviewCount})
          </button>
          <button className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
            About
          </button>
        </div>

        {/* Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {products.length} {products.length === 1 ? "product" : "products"}
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
                    ...(await searchParams),
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
              No Products Yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              This shop hasn't listed any products yet. Check back later!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
