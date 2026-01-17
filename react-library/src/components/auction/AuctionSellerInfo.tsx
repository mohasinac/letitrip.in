import React, { ComponentType } from "react";

export interface AuctionSellerInfoProps {
  sellerId: string;
  sellerName: string;
  sellerAvatar?: string;
  sellerRating: number;
  sellerReviewCount: number;
  memberSince: string;
  shopId?: string;
  shopName?: string;
  shopSlug?: string;
  onContactSeller?: () => void;
  className?: string;
  // Component injections
  LinkComponent: ComponentType<{
    href: string;
    className?: string;
    children: React.ReactNode;
  }>;
  // Icon injections
  icons?: {
    store?: React.ReactNode;
    star?: React.ReactNode;
    calendar?: React.ReactNode;
    messageCircle?: React.ReactNode;
  };
}

export function AuctionSellerInfo({
  sellerId,
  sellerName,
  sellerAvatar,
  sellerRating,
  sellerReviewCount,
  memberSince,
  shopId,
  shopName,
  shopSlug,
  onContactSeller,
  className = "",
  LinkComponent,
  icons = {},
}: AuctionSellerInfoProps) {
  const memberSinceDate = new Date(memberSince);
  const memberYears = new Date().getFullYear() - memberSinceDate.getFullYear();

  // Default SVG icons
  const defaultStoreIcon = (
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
        d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
      />
    </svg>
  );

  const defaultStarIcon = (
    <svg
      className="w-4 h-4 fill-current"
      fill="currentColor"
      viewBox="0 0 20 20"
    >
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
  );

  const defaultCalendarIcon = (
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
        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
      />
    </svg>
  );

  const defaultMessageCircleIcon = (
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
        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
      />
    </svg>
  );

  return (
    <div
      className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}
    >
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Seller Information
      </h3>

      {/* Seller Avatar & Name */}
      <div className="flex items-center gap-4 mb-4">
        <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden flex-shrink-0">
          {sellerAvatar ? (
            <img
              src={sellerAvatar}
              alt={sellerName}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-2xl font-semibold text-gray-600">
              {sellerName.charAt(0).toUpperCase()}
            </span>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-gray-900 mb-1">{sellerName}</h4>

          {/* Rating */}
          {sellerRating > 0 && (
            <div className="flex items-center gap-2 text-sm">
              <div className="flex items-center gap-1 text-yellow-400">
                {icons.star || defaultStarIcon}
                <span className="text-gray-900 font-medium">
                  {sellerRating.toFixed(1)}
                </span>
              </div>
              <span className="text-gray-600">
                ({sellerReviewCount} reviews)
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Member Since */}
      <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
        {icons.calendar || defaultCalendarIcon}
        <span>
          Member since{" "}
          {memberSinceDate.toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
          })}
          {memberYears > 0 &&
            ` (${memberYears} year${memberYears > 1 ? "s" : ""})`}
        </span>
      </div>

      {/* Shop Link */}
      {shopSlug && (
        <LinkComponent
          href={`/shops/${shopSlug}`}
          className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors mb-3"
        >
          {icons.store || defaultStoreIcon}
          <span className="font-medium">Visit {shopName || "Shop"}</span>
        </LinkComponent>
      )}

      {/* Contact Seller */}
      {onContactSeller && (
        <button
          type="button"
          onClick={onContactSeller}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
        >
          {icons.messageCircle || defaultMessageCircleIcon}
          <span>Contact Seller</span>
        </button>
      )}

      {/* Trust Indicators */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <p className="text-xs text-gray-500">
          All sellers are verified and must follow our seller guidelines.
        </p>
      </div>
    </div>
  );
}
