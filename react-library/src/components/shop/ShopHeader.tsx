import React, { ComponentType } from "react";

export interface ShopHeaderProps {
  shop: {
    name: string;
    slug: string;
    logo?: string;
    banner?: string;
    rating: number;
    reviewCount: number;
    city?: string;
    state?: string;
    isVerified?: boolean;
    productCount?: number;
    createdAt?: string;
  };
  isFollowing: boolean;
  followLoading: boolean;
  checkingFollow: boolean;
  onFollow: () => void;
  onShare: () => void;
  // Component injections
  ImageComponent: ComponentType<{
    src: string;
    alt: string;
    fill?: boolean;
    width?: number;
    height?: number;
    className?: string;
    objectFit?: "cover" | "contain";
  }>;
  DateDisplayComponent?: ComponentType<{
    date: string;
    format?: string;
    className?: string;
  }>;
  // Icon injections
  icons?: {
    star?: React.ReactNode;
    mapPin?: React.ReactNode;
    heart?: React.ReactNode;
    share?: React.ReactNode;
  };
}

export function ShopHeader({
  shop,
  isFollowing,
  followLoading,
  checkingFollow,
  onFollow,
  onShare,
  ImageComponent,
  DateDisplayComponent,
  icons = {},
}: ShopHeaderProps) {
  // Default SVG icons
  const defaultStarIcon = (
    <svg
      className="w-4 h-4 fill-yellow-400 text-yellow-400"
      fill="currentColor"
      viewBox="0 0 20 20"
    >
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
  );

  const defaultMapPinIcon = (
    <svg
      className="w-4 h-4"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
      />
    </svg>
  );

  const defaultHeartIcon = (isFollowing: boolean) => (
    <svg
      className={`w-4 h-4 inline mr-2 ${isFollowing ? "fill-current" : ""}`}
      fill={isFollowing ? "currentColor" : "none"}
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
      />
    </svg>
  );

  const defaultShareIcon = (
    <svg
      className="w-5 h-5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
      />
    </svg>
  );

  return (
    <div className="bg-white border-b border-gray-200">
      {/* Banner */}
      {shop.banner && (
        <div className="w-full h-48 md:h-64 relative">
          <ImageComponent
            src={shop.banner}
            alt={`${shop.name} banner`}
            fill
            objectFit="cover"
          />
        </div>
      )}

      {/* Shop Info */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
          {/* Logo */}
          <div className="flex-shrink-0">
            {shop.logo ? (
              <ImageComponent
                src={shop.logo}
                alt={shop.name}
                width={96}
                height={96}
                className="rounded-lg border-4 border-white shadow-lg"
                objectFit="cover"
              />
            ) : (
              <div className="w-24 h-24 rounded-lg bg-gray-200 flex items-center justify-center border-4 border-white shadow-lg">
                <span className="text-3xl font-bold text-gray-400">
                  {shop.name.charAt(0)}
                </span>
              </div>
            )}
          </div>

          {/* Info & Actions */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4 mb-3">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {shop.name}
                </h1>
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                  {shop.rating > 0 && (
                    <div className="flex items-center gap-1">
                      {icons.star || defaultStarIcon}
                      <span className="font-medium">
                        {shop.rating.toFixed(1)}
                      </span>
                      <span>({shop.reviewCount} reviews)</span>
                    </div>
                  )}
                  {(shop.city || shop.state) && (
                    <div className="flex items-center gap-1">
                      {icons.mapPin || defaultMapPinIcon}
                      <span>
                        {[shop.city, shop.state].filter(Boolean).join(", ")}
                      </span>
                    </div>
                  )}
                  {shop.isVerified && (
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                      Verified Seller
                    </span>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 flex-shrink-0">
                <button
                  onClick={onFollow}
                  disabled={followLoading || checkingFollow}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 ${
                    isFollowing
                      ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      : "bg-blue-600 text-white hover:bg-blue-700"
                  }`}
                >
                  {icons.heart ? (
                    <span className="inline mr-2">{icons.heart}</span>
                  ) : (
                    defaultHeartIcon(isFollowing)
                  )}
                  {checkingFollow
                    ? "..."
                    : isFollowing
                    ? "Following"
                    : "Follow"}
                </button>
                <button
                  onClick={onShare}
                  className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700"
                >
                  {icons.share || defaultShareIcon}
                </button>
              </div>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap gap-6 text-sm">
              <div>
                <span className="font-semibold text-gray-900">
                  {shop.productCount || 0}
                </span>
                <span className="text-gray-600 ml-1">Products</span>
              </div>
              {shop.createdAt && DateDisplayComponent && (
                <div>
                  <span className="text-gray-600">Joined </span>
                  <DateDisplayComponent
                    date={shop.createdAt}
                    format="long"
                    className="font-semibold text-gray-900"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
