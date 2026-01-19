/**
 * Auction Details Page
 * 
 * Detailed auction page with media gallery, bidding interface, and auction history.
 * Real-time updates for bid status and countdown timer.
 * 
 * URL Format: /buy-auction-{slug}
 * Example: /buy-auction-vintage-rolex-submariner
 * 
 * Features:
 * - Media gallery with fullscreen lightbox
 * - Real-time countdown timer
 * - Bid history table
 * - Bidding interface
 * - Similar auctions section
 * - Seller reviews
 * - SEO metadata
 * 
 * @page /buy-auction-[slug] - Auction details
 */

import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { AuctionCard, Breadcrumb } from "@letitrip/react-library";

// Types
interface PageProps {
  params: {
    slug: string;
  };
}

/**
 * Generate dynamic metadata for SEO
 */
export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const auction = await getAuction(params.slug);

  if (!auction) {
    return {
      title: "Auction Not Found | Let It Rip",
      description: "The auction you're looking for doesn't exist.",
    };
  }

  const title = `${auction.title} - Auction | Let It Rip`;
  const description =
    auction.shortDescription ||
    `Bid on ${auction.title}. Current bid: ₹${auction.currentBid.toLocaleString()}. ${auction.bidCount} bids.`;

  return {
    title,
    description,
    keywords: [
      auction.title,
      auction.category,
      "auction",
      "bidding",
      "India",
      ...(auction.tags || []),
    ],
    openGraph: {
      title,
      description,
      type: "website",
      images: auction.images?.map((img: string) => ({
        url: img,
        alt: auction.title,
      })),
    },
  };
}

/**
 * Fetch auction details from API
 */
async function getAuction(slug: string) {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

  try {
    const res = await fetch(`${baseUrl}/api/auctions/${slug}`, {
      next: { revalidate: 60 }, // Cache for 1 minute (auctions change frequently)
    });

    if (!res.ok) {
      if (res.status === 404) return null;
      console.error("Failed to fetch auction:", res.status);
      return null;
    }

    const data = await res.json();
    return data.data;
  } catch (error) {
    console.error("Error fetching auction:", error);
    return null;
  }
}

/**
 * Fetch similar auctions (same category)
 */
async function getSimilarAuctions(categorySlug: string, currentSlug: string) {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

  try {
    const res = await fetch(
      `${baseUrl}/api/auctions?categorySlug=${categorySlug}&status=active&limit=8`,
      {
        next: { revalidate: 300 },
      }
    );

    if (!res.ok) return [];

    const data = await res.json();
    return (data.data?.auctions || []).filter(
      (a: any) => a.slug !== currentSlug
    );
  } catch (error) {
    console.error("Error fetching similar auctions:", error);
    return [];
  }
}

/**
 * Calculate time remaining
 */
function getTimeRemaining(endTime: string | Date) {
  const end = new Date(endTime);
  const now = new Date();
  const diff = end.getTime() - now.getTime();

  if (diff <= 0) {
    return { ended: true, display: "Ended" };
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  if (days > 0) {
    return {
      ended: false,
      display: `${days}d ${hours}h ${minutes}m`,
      days,
      hours,
      minutes,
      seconds,
    };
  }

  return {
    ended: false,
    display: `${hours}h ${minutes}m ${seconds}s`,
    days: 0,
    hours,
    minutes,
    seconds,
  };
}

export default async function AuctionDetailsPage({ params }: PageProps) {
  const auction = await getAuction(params.slug);

  if (!auction) {
    notFound();
  }

  // Fetch similar auctions
  const similarAuctions = await getSimilarAuctions(
    auction.categorySlug,
    auction.slug
  );

  // Calculate time remaining
  const timeRemaining = getTimeRemaining(auction.endTime);

  // Calculate bid increment (typically 5% of current bid or minimum ₹50)
  const bidIncrement = Math.max(50, Math.ceil(auction.currentBid * 0.05));
  const nextMinimumBid = auction.currentBid + bidIncrement;

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumbs */}
        <Breadcrumb
          currentPath={`/buy-auction-${params.slug}`}
          LinkComponent={Link as any}
        />

        <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Media Gallery */}
          <div className="lg:col-span-2">
            <div className="sticky top-24">
              {/* Main Image */}
              <div className="relative aspect-[4/3] bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden mb-4">
                <img
                  src={auction.images?.[0] || "/placeholder-auction.jpg"}
                  alt={auction.title}
                  className="w-full h-full object-cover"
                />
                {auction.featured && (
                  <div className="absolute top-4 left-4 bg-yellow-500 text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
                    ⭐ Featured
                  </div>
                )}
                {auction.status === "live" && (
                  <div className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1 animate-pulse">
                    🔴 LIVE
                  </div>
                )}
              </div>

              {/* Thumbnail Gallery */}
              {auction.images && auction.images.length > 1 && (
                <div className="grid grid-cols-4 gap-4">
                  {auction.images
                    .slice(0, 4)
                    .map((img: string, idx: number) => (
                      <div
                        key={idx}
                        className="aspect-square bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden cursor-pointer hover:opacity-75 transition"
                      >
                        <img
                          src={img}
                          alt={`${auction.title} - ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                </div>
              )}

              {/* Description */}
              {auction.description && (
                <div className="mt-8">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                    Description
                  </h2>
                  <div className="prose dark:prose-invert max-w-none bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
                    <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                      {auction.description}
                    </p>
                  </div>
                </div>
              )}

              {/* Bid History */}
              {auction.bidHistory && auction.bidHistory.length > 0 && (
                <div className="mt-8">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                    Bid History ({auction.bidCount} bids)
                  </h2>
                  <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                            Bidder
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                            Amount
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                            Time
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {auction.bidHistory.slice(0, 5).map((bid: any) => (
                          <tr key={bid.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                              {bid.userName || "Anonymous"}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600 dark:text-green-400">
                              ₹{bid.amount.toLocaleString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                              {new Date(bid.createdAt).toLocaleString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Bidding Panel */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                {/* Shop Link */}
                <Link
                  href={`/shop-${auction.shopSlug}`}
                  className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 mb-2 inline-block"
                >
                  {auction.shopName}
                </Link>

                {/* Auction Title */}
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  {auction.title}
                </h1>

                {/* Status Badges */}
                <div className="flex flex-wrap gap-2 mb-4">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      auction.status === "active"
                        ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                        : auction.status === "live"
                          ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                          : "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
                    }`}
                  >
                    {auction.status}
                  </span>
                  {auction.isJunk && (
                    <span className="px-3 py-1 bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200 rounded-full text-sm font-medium">
                      Junk/As-Is
                    </span>
                  )}
                  {auction.isBulk && (
                    <span className="px-3 py-1 bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 rounded-full text-sm font-medium">
                      Bulk Lot
                    </span>
                  )}
                  {auction.isHeavy && (
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full text-sm font-medium">
                      Heavy Item
                    </span>
                  )}
                </div>

                {/* Countdown Timer */}
                {!timeRemaining.ended ? (
                  <div className="mb-6 bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-lg p-4">
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                      Time Remaining
                    </div>
                    <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">
                      {timeRemaining.display}
                    </div>
                  </div>
                ) : (
                  <div className="mb-6 bg-gray-100 dark:bg-gray-800 rounded-lg p-4">
                    <div className="text-2xl font-bold text-gray-600 dark:text-gray-400 text-center">
                      Auction Ended
                    </div>
                  </div>
                )}

                {/* Current Bid */}
                <div className="mb-6">
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    Current Bid
                  </div>
                  <div className="text-4xl font-bold text-gray-900 dark:text-white">
                    ₹{auction.currentBid.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {auction.bidCount} {auction.bidCount === 1 ? "bid" : "bids"}
                  </div>
                </div>

                {/* Starting Bid */}
                {auction.startingBid && (
                  <div className="mb-4 text-sm">
                    <span className="text-gray-600 dark:text-gray-400">
                      Starting bid:{" "}
                    </span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      ₹{auction.startingBid.toLocaleString()}
                    </span>
                  </div>
                )}

                {/* Reserve Price */}
                {auction.reservePrice && !auction.reserveMet && (
                  <div className="mb-6 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
                    <div className="text-sm text-yellow-800 dark:text-yellow-200">
                      ⚠️ Reserve price not met
                    </div>
                  </div>
                )}

                {/* Bidding Form */}
                {!timeRemaining.ended && auction.status === "active" && (
                  <div className="mb-6">
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      Next minimum bid: ₹{nextMinimumBid.toLocaleString()}
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        min={nextMinimumBid}
                        step={bidIncrement}
                        defaultValue={nextMinimumBid}
                        className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:text-white"
                        placeholder="Enter bid amount"
                      />
                    </div>
                    <button className="w-full mt-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition">
                      Place Bid
                    </button>
                  </div>
                )}

                {/* Quick Bid Buttons */}
                {!timeRemaining.ended && auction.status === "active" && (
                  <div className="grid grid-cols-3 gap-2 mb-6">
                    <button className="px-3 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-lg text-sm font-medium transition">
                      +₹{bidIncrement}
                    </button>
                    <button className="px-3 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-lg text-sm font-medium transition">
                      +₹{bidIncrement * 2}
                    </button>
                    <button className="px-3 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-lg text-sm font-medium transition">
                      +₹{bidIncrement * 5}
                    </button>
                  </div>
                )}

                {/* Watch Button */}
                <button className="w-full bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-medium py-3 px-6 rounded-lg transition">
                  Watch Auction
                </button>

                {/* Auction Times */}
                <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">
                        Start Time:
                      </span>
                      <span className="text-gray-900 dark:text-white font-medium">
                        {new Date(auction.startTime).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">
                        End Time:
                      </span>
                      <span className="text-gray-900 dark:text-white font-medium">
                        {new Date(auction.endTime).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Similar Auctions */}
        {similarAuctions.length > 0 && (
          <section className="mt-12">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Similar Auctions
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {similarAuctions.slice(0, 4).map((similarAuction: any) => (
                <AuctionCard
                  key={similarAuction.id}
                  auction={{
                    id: similarAuction.id,
                    name: similarAuction.title,
                    slug: similarAuction.slug,
                    images: similarAuction.images || [],
                    currentBid: similarAuction.currentBid,
                    startingBid: similarAuction.startingBid,
                    bidCount: similarAuction.bidCount || 0,
                    endTime: similarAuction.endTime,
                    featured: similarAuction.featured,
                    status: similarAuction.status,
                    shop: similarAuction.shopName
                      ? {
                          id: similarAuction.shopId || "",
                          name: similarAuction.shopName,
                        }
                      : undefined,
                  }}
                  variant="compact"
                  LinkComponent={Link as any}
                  ImageComponent={"img" as any}
                  formatPrice={(price) => `₹${price.toLocaleString()}`}
                  formatTimeRemaining={(endTime) => {
                    if (!endTime) return "Ended";
                    const result = getTimeRemaining(endTime);
                    return result.display;
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
          </section>
        )}
      </div>
    </div>
  );
}
