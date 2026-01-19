/**
 * Auction Listing Page
 *
 * Dynamic auction listing with filters, search, sorting, and pagination.
 * Similar to product listing but with auction-specific features.
 *
 * URL Examples:
 * - /buy-auction-all - All auctions
 * - /buy-auction-electronics - Electronics category
 * - /buy-auction-all?status=active&sort=ending-soon
 * - /buy-auction-fashion?minBid=1000
 *
 * @page /buy-auction-[...filters] - Auction listing
 */

import { AuctionCard, Breadcrumb } from "@letitrip/react-library";
import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

// Types
interface PageProps {
  params: {
    filters: string[];
  };
  searchParams: {
    q?: string;
    sort?: string;
    minBid?: string;
    maxBid?: string;
    status?: string;
    shopSlug?: string;
    featured?: string;
    cursor?: string;
    limit?: string;
  };
}

// Category mapping
const CATEGORY_MAP: Record<string, string> = {
  all: "All Auctions",
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

/**
 * Generate dynamic metadata for SEO
 */
export async function generateMetadata({
  params,
  searchParams,
}: PageProps): Promise<Metadata> {
  const category = params.filters?.[0] || "all";
  const categoryName = CATEGORY_MAP[category] || "Auctions";
  const searchQuery = searchParams.q;

  let title = `${categoryName} | Let It Rip Auctions`;
  let description = `Bid on ${categoryName.toLowerCase()} auctions and win amazing deals.`;

  if (searchQuery) {
    title = `"${searchQuery}" in ${categoryName} | Let It Rip`;
    description = `Auction search results for "${searchQuery}" in ${categoryName.toLowerCase()}.`;
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
  { label: "Ending Soon", value: "ending-soon" },
  { label: "Newly Listed", value: "newest" },
  { label: "Current Bid: Low to High", value: "bid-asc" },
  { label: "Current Bid: High to Low", value: "bid-desc" },
  { label: "Most Popular", value: "popular" },
];

/**
 * Fetch auctions server-side
 */
async function getAuctions(
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
  if (searchParams.minBid) queryParams.set("minBid", searchParams.minBid);
  if (searchParams.maxBid) queryParams.set("maxBid", searchParams.maxBid);
  if (searchParams.status) queryParams.set("status", searchParams.status);
  if (searchParams.shopSlug) queryParams.set("shopSlug", searchParams.shopSlug);
  if (searchParams.featured === "true") queryParams.set("featured", "true");
  if (searchParams.cursor) queryParams.set("cursor", searchParams.cursor);
  if (searchParams.limit) queryParams.set("limit", searchParams.limit);
  else queryParams.set("limit", "24");

  try {
    const res = await fetch(
      `${baseUrl}/api/auctions?${queryParams.toString()}`,
      {
        next: { revalidate: 60 }, // Cache for 1 minute (auctions change frequently)
      },
    );

    if (!res.ok) {
      console.error("Failed to fetch auctions:", res.status);
      return { auctions: [], hasMore: false, nextCursor: null };
    }

    const data = await res.json();
    return {
      auctions: data.data?.auctions || [],
      hasMore: data.data?.hasMore || false,
      nextCursor: data.data?.nextCursor || null,
    };
  } catch (error) {
    console.error("Error fetching auctions:", error);
    return { auctions: [], hasMore: false, nextCursor: null };
  }
}

export default async function AuctionListingPage({
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
  const { auctions, hasMore, nextCursor } = await getAuctions(
    params,
    searchParams,
  );

  // Current filters
  const currentSort = searchParams.sort || "ending-soon";

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumbs */}
        <Breadcrumb
          currentPath={`/buy-auction-${category}`}
          LinkComponent={Link as any}
        />

        {/* Header */}
        <div className="mt-6 mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {searchParams.q ? `Search: "${searchParams.q}"` : categoryName}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {auctions.length} {auctions.length === 1 ? "auction" : "auctions"}{" "}
            found
          </p>
        </div>

        {/* Status Filter Pills */}
        <div className="flex flex-wrap gap-3 mb-6">
          <Link
            href={`/buy-auction-${category}`}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              !searchParams.status
                ? "bg-blue-600 text-white"
                : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
            }`}
          >
            All Auctions
          </Link>
          <Link
            href={`/buy-auction-${category}?status=active`}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              searchParams.status === "active"
                ? "bg-green-600 text-white"
                : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
            }`}
          >
            Active
          </Link>
          <Link
            href={`/buy-auction-${category}?status=ending-soon`}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              searchParams.status === "ending-soon"
                ? "bg-orange-600 text-white"
                : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
            }`}
          >
            Ending Soon
          </Link>
          <Link
            href={`/buy-auction-${category}?status=completed`}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              searchParams.status === "completed"
                ? "bg-gray-600 text-white"
                : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
            }`}
          >
            Completed
          </Link>
        </div>

        {/* Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Showing {auctions.length} auctions
          </div>

          {/* Sort Dropdown */}
          <select
            value={currentSort}
            onChange={(e) => {
              const url = new URL(window.location.href);
              if (e.target.value !== "ending-soon") {
                url.searchParams.set("sort", e.target.value);
              } else {
                url.searchParams.delete("sort");
              }
              window.location.href = url.toString();
            }}
            className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Auctions Grid */}
        {auctions.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-8">
              {auctions.map((auction: any) => (
                <AuctionCard
                  key={auction.id}
                  auction={{
                    id: auction.id,
                    name: auction.title,
                    slug: auction.slug,
                    images: auction.images || [],
                    videos: auction.videos,
                    currentBid: auction.currentBid,
                    startingBid: auction.startingBid,
                    bidCount: auction.bidCount || 0,
                    endTime: auction.endTime,
                    condition: auction.condition,
                    featured: auction.featured,
                    status: auction.status,
                    shop: auction.shopName
                      ? {
                          id: auction.shopId || "",
                          name: auction.shopName,
                          isVerified: auction.shopVerified,
                        }
                      : undefined,
                  }}
                  variant="public"
                  LinkComponent={Link as any}
                  ImageComponent={"img" as any}
                  formatPrice={(price) => `₹${price.toLocaleString()}`}
                  formatTimeRemaining={(endTime) => {
                    if (!endTime) return "Ended";
                    const end = new Date(endTime);
                    const now = new Date();
                    const diff = end.getTime() - now.getTime();
                    if (diff <= 0) return "Ended";
                    const hours = Math.floor(diff / (1000 * 60 * 60));
                    const minutes = Math.floor(
                      (diff % (1000 * 60 * 60)) / (1000 * 60),
                    );
                    if (hours > 24) {
                      const days = Math.floor(hours / 24);
                      return `${days}d ${hours % 24}h`;
                    }
                    return `${hours}h ${minutes}m`;
                  }}
                  getTimeRemaining={(endTime) => {
                    if (!endTime) return { totalMs: 0, isEnded: true };
                    const end = new Date(endTime);
                    const now = new Date();
                    const diff = end.getTime() - now.getTime();
                    return { totalMs: diff, isEnded: diff <= 0 };
                  }}
                  cn={(...classes) =>
                    classes.filter((c) => typeof c === "string").join(" ")
                  }
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
            <div className="text-6xl mb-4">🔨</div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No auctions found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Try adjusting your filters or check back later
            </p>
            <Link
              href="/buy-auction-all"
              className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition"
            >
              View All Auctions
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
