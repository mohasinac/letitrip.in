/**
 * System Constants for API Layer
 * Centralized calculations and business logic constants
 */

export const RATING_CONSTANTS = {
  // Rating calculation weights
  RATING_WEIGHTS: {
    VERIFIED_PURCHASE: 1.2, // Verified purchases get 20% more weight
    RECENT_REVIEW: 1.1, // Reviews from last 30 days get 10% more weight
    DETAILED_REVIEW: 1.05, // Reviews with 50+ characters get 5% more weight
    WITH_IMAGES: 1.15, // Reviews with images get 15% more weight
  },

  // Rating thresholds
  THRESHOLDS: {
    MIN_REVIEWS_FOR_AVERAGE: 3, // Minimum reviews needed for valid average
    DETAILED_REVIEW_MIN_CHARS: 50, // Minimum characters for detailed review
    RECENT_DAYS_THRESHOLD: 30, // Days to consider review as "recent"
    HIGH_RATING_THRESHOLD: 4.0, // Threshold for "high rating" badge
    LOW_RATING_THRESHOLD: 2.5, // Threshold for "low rating" warning
  },

  // Default values
  DEFAULTS: {
    NEW_PRODUCT_RATING: 0, // Default rating for new products
    FALLBACK_RATING: 3.0, // Fallback when calculation fails
    MAX_RATING: 5, // Maximum possible rating
    MIN_RATING: 1, // Minimum possible rating
  },
};

export const SELLER_CONSTANTS = {
  // Performance metrics
  PERFORMANCE: {
    EXCELLENT_RATING_THRESHOLD: 4.8,
    GOOD_RATING_THRESHOLD: 4.0,
    AVERAGE_RATING_THRESHOLD: 3.5,
    POOR_RATING_THRESHOLD: 2.5,
  },

  // Order fulfillment
  FULFILLMENT: {
    FAST_SHIPPING_DAYS: 2,
    STANDARD_SHIPPING_DAYS: 5,
    SLOW_SHIPPING_DAYS: 10,
  },

  // Conversion rates
  CONVERSION: {
    EXCELLENT_RATE: 5.0, // 5%+
    GOOD_RATE: 3.0, // 3-5%
    AVERAGE_RATE: 1.5, // 1.5-3%
    POOR_RATE: 1.0, // <1.5%
  },

  // Review response rates
  REVIEW_RESPONSE: {
    TARGET_RESPONSE_RATE: 0.3, // 30% of orders should get reviews
    MIN_RESPONSE_RATE: 0.1, // 10% minimum response rate
    EXCELLENT_RESPONSE_RATE: 0.5, // 50% excellent response rate
  },
};

export const ORDER_CONSTANTS = {
  // Status progression
  STATUS_FLOW: [
    "pending",
    "confirmed",
    "processing",
    "shipped",
    "delivered",
    "completed",
  ],

  // Timeouts (in hours)
  TIMEOUTS: {
    PAYMENT_TIMEOUT: 24, // Cancel unpaid orders after 24 hours
    CONFIRMATION_TIMEOUT: 72, // Auto-confirm after 72 hours
    SHIPPING_TIMEOUT: 168, // 7 days to ship
    DELIVERY_TIMEOUT: 336, // 14 days for delivery
  },

  // Default shipping estimates (in days)
  SHIPPING_ESTIMATES: {
    STANDARD: 5,
    EXPRESS: 2,
    OVERNIGHT: 1,
    INTERNATIONAL: 14,
  },
};

export const PRODUCT_CONSTANTS = {
  // Inventory thresholds
  INVENTORY: {
    LOW_STOCK_THRESHOLD: 10,
    OUT_OF_STOCK_THRESHOLD: 0,
    REORDER_THRESHOLD: 5,
  },

  // Pricing
  PRICING: {
    MIN_PRICE: 1, // Minimum product price
    MAX_DISCOUNT_PERCENT: 90, // Maximum discount percentage
    TAX_RATE: 0.18, // Default tax rate (18% GST for India)
  },

  // Search and filtering
  SEARCH: {
    MIN_SEARCH_LENGTH: 2, // Minimum search query length
    MAX_RESULTS_PER_PAGE: 50, // Maximum results per page
    DEFAULT_RESULTS_PER_PAGE: 20, // Default results per page
  },
};

export const AUCTION_CONSTANTS = {
  // Bidding rules
  BIDDING: {
    MIN_BID_INCREMENT: 50, // Minimum bid increment in rupees
    MIN_BID_INCREMENT_PERCENT: 0.05, // 5% minimum increment
    AUTO_EXTEND_MINUTES: 5, // Auto-extend auction by 5 minutes on last-minute bids
    LAST_MINUTE_THRESHOLD: 300, // 5 minutes in seconds
  },

  // Auction durations (in hours)
  DURATIONS: {
    MIN_DURATION: 24, // Minimum 24 hours
    MAX_DURATION: 720, // Maximum 30 days
    DEFAULT_DURATION: 168, // Default 7 days
  },

  // Status timeouts
  TIMEOUTS: {
    PAYMENT_TIMEOUT: 48, // Winner has 48 hours to pay
    SELLER_CONFIRMATION: 24, // Seller has 24 hours to confirm
  },
};

export const NOTIFICATION_CONSTANTS = {
  // Priority levels
  PRIORITY: {
    LOW: 1,
    MEDIUM: 2,
    HIGH: 3,
    URGENT: 4,
  },

  // Auto-cleanup timeouts (in days)
  CLEANUP: {
    READ_NOTIFICATIONS: 30, // Delete read notifications after 30 days
    UNREAD_NOTIFICATIONS: 90, // Delete unread notifications after 90 days
    SYSTEM_NOTIFICATIONS: 7, // Delete system notifications after 7 days
  },
};

/**
 * Calculate weighted average rating
 */
export const calculateWeightedRating = (reviews: any[]): number => {
  if (!reviews || reviews.length === 0) {
    return RATING_CONSTANTS.DEFAULTS.NEW_PRODUCT_RATING;
  }

  if (reviews.length < RATING_CONSTANTS.THRESHOLDS.MIN_REVIEWS_FOR_AVERAGE) {
    return RATING_CONSTANTS.DEFAULTS.FALLBACK_RATING;
  }

  const now = new Date();
  let totalWeight = 0;
  let weightedSum = 0;

  reviews.forEach((review) => {
    let weight = 1;
    const reviewDate = new Date(review.createdAt);
    const daysSinceReview =
      (now.getTime() - reviewDate.getTime()) / (1000 * 60 * 60 * 24);

    // Apply weight modifiers
    if (review.verified) {
      weight *= RATING_CONSTANTS.RATING_WEIGHTS.VERIFIED_PURCHASE;
    }

    if (daysSinceReview <= RATING_CONSTANTS.THRESHOLDS.RECENT_DAYS_THRESHOLD) {
      weight *= RATING_CONSTANTS.RATING_WEIGHTS.RECENT_REVIEW;
    }

    if (
      review.comment &&
      review.comment.length >=
        RATING_CONSTANTS.THRESHOLDS.DETAILED_REVIEW_MIN_CHARS
    ) {
      weight *= RATING_CONSTANTS.RATING_WEIGHTS.DETAILED_REVIEW;
    }

    if (review.images && review.images.length > 0) {
      weight *= RATING_CONSTANTS.RATING_WEIGHTS.WITH_IMAGES;
    }

    weightedSum += review.rating * weight;
    totalWeight += weight;
  });

  const weightedAverage =
    totalWeight > 0
      ? weightedSum / totalWeight
      : RATING_CONSTANTS.DEFAULTS.FALLBACK_RATING;

  // Round to 1 decimal place and ensure it's within valid range
  return Math.max(
    RATING_CONSTANTS.DEFAULTS.MIN_RATING,
    Math.min(
      RATING_CONSTANTS.DEFAULTS.MAX_RATING,
      Math.round(weightedAverage * 10) / 10,
    ),
  );
};

/**
 * Calculate seller performance metrics
 */
export const calculateSellerPerformance = (stats: {
  totalOrders: number;
  completedOrders: number;
  totalReviews: number;
  avgShippingDays: number;
}) => {
  const { totalOrders, completedOrders, totalReviews, avgShippingDays } = stats;

  // Calculate completion rate
  const completionRate =
    totalOrders > 0 ? (completedOrders / totalOrders) * 100 : 0;

  // Calculate review response rate
  const reviewResponseRate =
    completedOrders > 0 ? totalReviews / completedOrders : 0;

  // Calculate shipping performance
  let shippingPerformance = "excellent";
  if (avgShippingDays > SELLER_CONSTANTS.FULFILLMENT.SLOW_SHIPPING_DAYS) {
    shippingPerformance = "poor";
  } else if (
    avgShippingDays > SELLER_CONSTANTS.FULFILLMENT.STANDARD_SHIPPING_DAYS
  ) {
    shippingPerformance = "average";
  } else if (
    avgShippingDays > SELLER_CONSTANTS.FULFILLMENT.FAST_SHIPPING_DAYS
  ) {
    shippingPerformance = "good";
  }

  return {
    completionRate: Math.round(completionRate * 100) / 100,
    reviewResponseRate: Math.round(reviewResponseRate * 1000) / 10, // Convert to percentage
    shippingPerformance,
    avgShippingDays,
  };
};

/**
 * Calculate estimated conversion rate based on seller performance
 */
export const calculateConversionRate = (performanceMetrics: any): number => {
  const baseRate = SELLER_CONSTANTS.CONVERSION.AVERAGE_RATE;
  let multiplier = 1;

  // Adjust based on completion rate
  if (performanceMetrics.completionRate > 95) {
    multiplier *= 1.2;
  } else if (performanceMetrics.completionRate < 80) {
    multiplier *= 0.8;
  }

  // Adjust based on shipping performance
  switch (performanceMetrics.shippingPerformance) {
    case "excellent":
      multiplier *= 1.3;
      break;
    case "good":
      multiplier *= 1.1;
      break;
    case "poor":
      multiplier *= 0.7;
      break;
  }

  const estimatedRate = baseRate * multiplier;

  return Math.max(
    SELLER_CONSTANTS.CONVERSION.POOR_RATE,
    Math.min(
      SELLER_CONSTANTS.CONVERSION.EXCELLENT_RATE,
      Math.round(estimatedRate * 100) / 100,
    ),
  );
};
