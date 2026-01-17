import React, { ComponentType } from "react";

export interface ReviewCardProps {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  productId?: string;
  productName?: string;
  productImage?: string;
  shopId?: string;
  shopName?: string;
  rating: number;
  title?: string;
  comment: string;
  media?: string[];
  verifiedPurchase: boolean;
  helpfulCount: number;
  isHelpful?: boolean;
  createdAt: Date | string;
  onMarkHelpful?: (id: string) => void;
  compact?: boolean;
  showProduct?: boolean;

  // Component Injection
  LinkComponent?: ComponentType<any>;
  ImageComponent?: ComponentType<any>;
  StarIcon?: ComponentType<{ className?: string; fill?: string }>;
  ThumbsUpIcon?: ComponentType<{ className?: string; fill?: string }>;
  ShieldCheckIcon?: ComponentType<{ className?: string }>;
  CalendarIcon?: ComponentType<{ className?: string }>;
  PackageIcon?: ComponentType<{ className?: string }>;

  // Date formatting
  formatDate?: (date: Date | string) => string;
}

export const ReviewCard: React.FC<ReviewCardProps> = ({
  id,
  userId,
  userName,
  userAvatar,
  productId,
  productName,
  productImage,
  shopId,
  shopName,
  rating,
  title,
  comment,
  media = [],
  verifiedPurchase,
  helpfulCount,
  isHelpful = false,
  createdAt,
  onMarkHelpful,
  compact = false,
  showProduct = true,
  LinkComponent = "a",
  ImageComponent,
  StarIcon,
  ThumbsUpIcon,
  ShieldCheckIcon,
  CalendarIcon,
  PackageIcon,
  formatDate,
}) => {
  const reviewDate =
    typeof createdAt === "string" ? new Date(createdAt) : createdAt;

  const handleMarkHelpful = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onMarkHelpful) {
      onMarkHelpful(id);
    }
  };

  // Render star rating
  const renderStars = () => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => {
          const filled = star <= rating;
          if (StarIcon) {
            return (
              <StarIcon
                key={star}
                className={`w-4 h-4 ${
                  filled
                    ? "fill-yellow-400 text-yellow-400"
                    : "fill-gray-200 dark:fill-gray-600 text-gray-200 dark:text-gray-600"
                }`}
              />
            );
          }
          return (
            <svg
              key={star}
              className={`w-4 h-4 ${
                filled
                  ? "fill-yellow-400 text-yellow-400"
                  : "fill-gray-200 dark:fill-gray-600 text-gray-200 dark:text-gray-600"
              }`}
              viewBox="0 0 24 24"
              fill={filled ? "currentColor" : "none"}
              stroke="currentColor"
              strokeWidth="2"
            >
              <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
            </svg>
          );
        })}
      </div>
    );
  };

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden hover:shadow-md transition-shadow duration-200">
      <div className={`p-${compact ? "3" : "4"}`}>
        {/* Header: User Info & Rating */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            {/* User Avatar */}
            {userAvatar && ImageComponent ? (
              <ImageComponent
                src={userAvatar}
                alt={userName}
                width={40}
                height={40}
                className="rounded-full"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold text-sm">
                {userName.charAt(0).toUpperCase()}
              </div>
            )}

            {/* User Name & Verified Badge */}
            <div>
              <div className="flex items-center gap-2">
                <span className="font-medium text-gray-900 dark:text-white">
                  {userName}
                </span>
                {verifiedPurchase && (
                  <div className="flex items-center gap-1 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs px-2 py-0.5 rounded">
                    {ShieldCheckIcon ? (
                      <ShieldCheckIcon className="w-3 h-3" />
                    ) : (
                      <svg
                        className="w-3 h-3"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M9 12l2 2 4-4" />
                        <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3V7c0-1.66 4-3 9-3s9 1.34 9 3z" />
                        <path d="M12 2v20" />
                      </svg>
                    )}
                    <span>Verified Purchase</span>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                {CalendarIcon ? (
                  <CalendarIcon className="w-3 h-3" />
                ) : (
                  <svg
                    className="w-3 h-3"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                )}
                <time dateTime={reviewDate.toISOString()}>
                  {formatDate
                    ? formatDate(reviewDate)
                    : reviewDate.toLocaleDateString()}
                </time>
              </div>
            </div>
          </div>

          {/* Rating Stars */}
          {renderStars()}
        </div>

        {/* Review Title */}
        {title && (
          <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
            {title}
          </h4>
        )}

        {/* Review Comment */}
        <p
          className={`text-sm text-gray-700 dark:text-gray-300 ${
            compact ? "line-clamp-2" : "line-clamp-4"
          } mb-3`}
        >
          {comment}
        </p>

        {/* Review Media */}
        {!compact && media.length > 0 && ImageComponent && (
          <div className="flex gap-2 mb-3 overflow-x-auto">
            {media.slice(0, 4).map((mediaUrl, index) => (
              <div
                key={`media-${mediaUrl}-${index}`}
                className="relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700"
              >
                <ImageComponent
                  src={mediaUrl}
                  alt={`Review image ${index + 1}`}
                  fill={true}
                  className="object-cover"
                  sizes="80px"
                />
              </div>
            ))}
            {media.length > 4 && (
              <div className="w-20 h-20 flex-shrink-0 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-500 dark:text-gray-400 text-sm font-medium">
                +{media.length - 4}
              </div>
            )}
          </div>
        )}

        {/* Product Info (if showing) */}
        {showProduct && productId && productName && (
          <LinkComponent
            href={`/products/${productId}`}
            onClick={(e: React.MouseEvent) => e.stopPropagation()}
            className="flex items-center gap-3 p-2 mb-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
          >
            {productImage && ImageComponent && (
              <div className="relative w-12 h-12 flex-shrink-0 rounded overflow-hidden bg-white dark:bg-gray-600">
                <ImageComponent
                  src={productImage}
                  alt={productName}
                  fill={true}
                  className="object-cover"
                  sizes="48px"
                />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 mb-0.5">
                {PackageIcon ? (
                  <PackageIcon className="w-3 h-3" />
                ) : (
                  <svg
                    className="w-3 h-3"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                    <polyline points="3.29,7 12,12 20.71,7" />
                    <line x1="12" y1="22" x2="12" y2="12" />
                  </svg>
                )}
                <span>Reviewed Product</span>
              </div>
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {productName}
              </p>
              {shopName && (
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {shopName}
                </p>
              )}
            </div>
          </LinkComponent>
        )}

        {/* Footer: Helpful Button */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-700">
          <button
            onClick={handleMarkHelpful}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              isHelpful
                ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                : "bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600"
            }`}
            disabled={isHelpful}
          >
            {ThumbsUpIcon ? (
              <ThumbsUpIcon
                className={`w-4 h-4 ${isHelpful ? "fill-current" : ""}`}
              />
            ) : (
              <svg
                className={`w-4 h-4 ${isHelpful ? "fill-current" : ""}`}
                viewBox="0 0 24 24"
                fill={isHelpful ? "currentColor" : "none"}
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
              </svg>
            )}
            <span>Helpful</span>
            {helpfulCount > 0 && (
              <span className="text-xs">({helpfulCount})</span>
            )}
          </button>

          {shopName && !showProduct && shopId && (
            <LinkComponent
              href={`/shops/${shopId}`}
              onClick={(e: React.MouseEvent) => e.stopPropagation()}
              className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
            >
              {shopName}
            </LinkComponent>
          )}
        </div>
      </div>
    </div>
  );
};
