/**
 * All Auctions Listing Page
 *
 * Shows all auctions without category filtering.
 * This is a dedicated page for /buy-auction-all route.
 *
 * @page /buy-auction-all - All auctions listing
 */

import { AuctionCard } from "@/components/common/AuctionCard";
import { Metadata } from "next";
import Link from "next/link";

import { ClientLink } from "@/components/common/ClientLink";
import { SortDropdown } from "@/components/common/SortDropdown";
import { ROUTES } from "@/constants/routes";
import { FALLBACK_AUCTIONS } from "@/lib/fallback-data";

// Types
interface PageProps {
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

// Generate metadata
export async function generateMetadata({
  searchParams,
}: PageProps): Promise<Metadata> {
  const searchQuery = searchParams.q;

  let title = "All Auctions | Let It Rip";
  let description =
    "Browse all live auctions. Bid on electronics, fashion, collectibles and more.";

  if (searchQuery) {
    title = `"${searchQuery}" in All Auctions | Let It Rip`;
    description = `Search results for "${searchQuery}" in all auctions.`;
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
  { label: "Price: Low to High", value: "price-asc" },
  { label: "Price: High to Low", value: "price-desc" },
  { label: "Most Bids", value: "popular" },
];

// Fetch auctions server-side
async function getAuctions(searchParams: PageProps["searchParams"]) {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

  // Build query params
  const queryParams = new URLSearchParams();

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
        next: { revalidate: 60 }, // Cache for 1 minute
      },
    );

    if (!res.ok) {
      console.error(
        "Failed to fetch auctions:",
        res.status,
        "- Using fallback data",
      );
      return { auctions: FALLBACK_AUCTIONS, hasMore: false, nextCursor: null };
    }

    const data = await res.json();
    const auctions = data.data?.auctions || [];
    // If API returns empty array, use fallback data for better UX
    if (auctions.length === 0) {
      console.log("API returned empty array - Using fallback data");
      return { auctions: FALLBACK_AUCTIONS, hasMore: false, nextCursor: null };
    }
    return {
      auctions,
      hasMore: data.data?.hasMore || false,
      nextCursor: data.data?.nextCursor || null,
    };
  } catch (error) {
    console.error("Error fetching auctions:", error, "- Using fallback data");
    return { auctions: FALLBACK_AUCTIONS, hasMore: false, nextCursor: null };
  }
}

export default async function AllAuctionsPage({ searchParams }: PageProps) {
  // Fetch data
  const { auctions, hasMore, nextCursor } = await getAuctions(searchParams);

  // Build breadcrumbs
  const breadcrumbs = [
    { label: "Home", href: ROUTES.HOME },
    { label: "All Auctions", href: ROUTES.AUCTIONS.LIST },
  ];

  // Filter info
  const activeFilters = [];
  if (searchParams.status) activeFilters.push(`Status: ${searchParams.status}`);
  if (searchParams.minBid)
    activeFilters.push(`Min Bid: ₹${searchParams.minBid}`);
  if (searchParams.maxBid)
    activeFilters.push(`Max Bid: ₹${searchParams.maxBid}`);
  if (searchParams.featured) activeFilters.push("Featured");

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumbs */}
        <div className="mb-6">
          <nav className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
            {breadcrumbs.map((crumb, index) => (
              <span key={index} className="flex items-center">
                {index > 0 && <span className="mx-2">/</span>}
                {index === breadcrumbs.length - 1 ? (
                  <span className="text-gray-900 dark:text-white font-medium">
                    {crumb.label}
                  </span>
                ) : (
                  <ClientLink href={crumb.href} className="hover:text-primary">
                    {crumb.label}
                  </ClientLink>
                )}
              </span>
            ))}
          </nav>
        </div>

        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {searchParams.q
              ? `Search: "${searchParams.q}"`
              : "All Live Auctions"}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {auctions.length} auctions found
            {activeFilters.length > 0 && ` · ${activeFilters.join(" · ")}`}
          </p>
        </div>

        {/* Filters & Sort Bar */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
          {/* Active Filters */}
          {activeFilters.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {activeFilters.map((filter, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1 bg-primary/10 text-primary text-sm rounded-full"
                >
                  {filter}
                  <button className="ml-2 text-primary hover:text-primary/80">
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}

          {/* Sort Dropdown */}
          <SortDropdown
            options={SORT_OPTIONS}
            currentSort={searchParams.sort || "ending-soon"}
          />
        </div>

        {/* Auctions Grid */}
        {auctions.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
              {auctions.map((auction: any) => (
                <AuctionCard
                  key={auction.id}
                  id={auction.id}
                  title={auction.title}
                  slug={auction.slug}
                  currentBid={auction.currentBid}
                  startingPrice={auction.startingPrice}
                  buyNowPrice={auction.buyNowPrice}
                  image={auction.images?.[0]}
                  images={auction.images}
                  endTime={auction.endTime}
                  bidCount={auction.bidCount}
                  condition={auction.condition}
                  shopName={auction.shopName}
                  shopSlug={auction.shopSlug}
                  status={auction.status}
                  variant="public"
                />
              ))}
            </div>

            {/* Pagination */}
            {hasMore && nextCursor && (
              <div className="flex justify-center">
                <Link
                  href={`${ROUTES.AUCTIONS.LIST}?${new URLSearchParams({
                    ...searchParams,
                    cursor: nextCursor,
                  }).toString()}`}
                  className="px-6 py-3 bg-primary hover:bg-primary/90 text-white font-semibold rounded-lg transition"
                >
                  Load More
                </Link>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🔨</div>
            <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
              No auctions found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {searchParams.q
                ? `No results for "${searchParams.q}"`
                : "No live auctions available at the moment"}
            </p>
            <Link
              href={ROUTES.HOME}
              className="inline-block px-6 py-3 bg-primary hover:bg-primary/90 text-white font-semibold rounded-lg transition"
            >
              Go Home
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}