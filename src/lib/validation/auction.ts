/**
 * Auction Validation Schemas
 *
 * Zod schemas for validating auction data
 * Used in auction creation, update, and bidding
 */

import { z } from "zod";

/**
 * Slug validation regex
 */
const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/**
 * Auction Status enum
 */
export const AuctionStatus = z.enum([
  "draft",
  "scheduled",
  "live",
  "ended",
  "cancelled",
]);

/**
 * Create Auction Schema
 */
export const createAuctionSchema = z
  .object({
    // Basic Information
    name: z
      .string()
      .min(10, "Auction name must be at least 10 characters")
      .max(200, "Auction name must not exceed 200 characters")
      .trim(),

    slug: z
      .string()
      .min(3, "Slug must be at least 3 characters")
      .max(200, "Slug must not exceed 200 characters")
      .regex(
        slugRegex,
        "Slug must contain only lowercase letters, numbers, and hyphens",
      )
      .trim(),

    description: z
      .string()
      .min(50, "Description must be at least 50 characters")
      .max(5000, "Description must not exceed 5000 characters")
      .trim(),

    shortDescription: z
      .string()
      .max(200, "Short description must not exceed 200 characters")
      .trim()
      .optional(),

    // Shop Reference
    shopId: z.string().min(1, "Shop ID is required"),

    // Category (optional for auctions, but helps with discovery)
    categoryId: z.string().optional(),

    // Bidding
    startingBid: z
      .number()
      .positive("Starting bid must be positive")
      .min(1, "Starting bid must be at least ₹1")
      .max(10000000, "Starting bid must not exceed ₹1 Crore"),

    reservePrice: z
      .number()
      .positive("Reserve price must be positive")
      .optional()
      .nullable(), // Minimum price to sell, hidden from bidders

    bidIncrement: z
      .number()
      .positive("Bid increment must be positive")
      .default(10)
      .optional(), // Minimum increment for next bid

    // Timing
    startTime: z.coerce.date(),

    endTime: z.coerce.date(),

    // Duration helper (alternative to endTime)
    durationHours: z
      .number()
      .int()
      .positive()
      .max(720) // Max 30 days
      .optional(), // Will calculate endTime if provided

    // Media
    images: z
      .array(z.string().url())
      .min(1, "At least one image is required")
      .max(10, "Maximum 10 images allowed"),

    videos: z
      .array(z.string().url())
      .max(3, "Maximum 3 videos allowed")
      .optional(),

    // Item Details
    condition: z.enum(["new", "used", "refurbished"]).default("used"),

    brand: z
      .string()
      .max(100, "Brand must not exceed 100 characters")
      .trim()
      .optional(),

    manufacturer: z
      .string()
      .max(100, "Manufacturer must not exceed 100 characters")
      .trim()
      .optional(),

    countryOfOrigin: z.string().default("Japan").optional(),

    // Specifications
    specifications: z
      .array(
        z.object({
          name: z.string().min(1).max(100),
          value: z.string().min(1).max(500),
        }),
      )
      .optional(),

    // Shipping
    shippingCost: z
      .number()
      .min(0, "Shipping cost cannot be negative")
      .default(0)
      .optional(),

    shippingClass: z
      .enum(["standard", "express", "heavy", "fragile"])
      .default("standard")
      .optional(),

    internationalShipping: z.boolean().default(false).optional(),

    // Buyer Requirements
    requiresVerifiedBidders: z.boolean().default(false).optional(),

    minimumBidderRating: z.number().min(0).max(5).optional(), // Minimum rating to bid

    // Auto-bid Settings
    allowAutoBid: z.boolean().default(true).optional(),

    maxAutoBidders: z.number().int().positive().optional(), // Limit auto-bidders

    // Payment Terms
    paymentDueHours: z.number().int().positive().default(48).optional(), // Hours after auction ends

    acceptedPaymentMethods: z
      .array(z.enum(["razorpay", "paypal", "cod"]))
      .min(1, "At least one payment method required")
      .default(["razorpay", "paypal"])
      .optional(),

    // Return Policy
    returnsAccepted: z.boolean().default(false).optional(),

    returnWindowDays: z.number().int().min(0).max(14).optional(), // Shorter window for auctions

    returnConditions: z.string().max(500).optional(),

    // Tags
    tags: z
      .array(z.string().max(50))
      .max(20, "Maximum 20 tags allowed")
      .optional(),

    // SEO
    metaTitle: z
      .string()
      .max(60, "Meta title must not exceed 60 characters")
      .optional(),

    metaDescription: z
      .string()
      .max(160, "Meta description must not exceed 160 characters")
      .optional(),

    // Status
    status: AuctionStatus.default("draft"),

    // Flags (admin only)
    isFeatured: z.boolean().default(false).optional(),

    featuredPriority: z.number().int().min(0).max(100).optional(), // Higher = more prominent

    // Moderation
    requiresApproval: z.boolean().default(true).optional(), // Admin approval before going live
  })
  .refine(
    (data) => {
      // Validate that endTime is after startTime
      return data.endTime > data.startTime;
    },
    {
      message: "End time must be after start time",
      path: ["endTime"],
    },
  )
  .refine(
    (data) => {
      // Validate that reserve price is greater than starting bid
      if (data.reservePrice) {
        return data.reservePrice >= data.startingBid;
      }
      return true;
    },
    {
      message: "Reserve price must be greater than or equal to starting bid",
      path: ["reservePrice"],
    },
  )
  .refine(
    (data) => {
      // Validate auction duration (min 1 hour, max 30 days)
      const durationMs = data.endTime.getTime() - data.startTime.getTime();
      const durationHours = durationMs / (1000 * 60 * 60);
      return durationHours >= 1 && durationHours <= 720;
    },
    {
      message: "Auction duration must be between 1 hour and 30 days",
      path: ["endTime"],
    },
  )
  .refine(
    (data) => {
      // Validate return window if returns accepted
      if (data.returnsAccepted && !data.returnWindowDays) {
        return false;
      }
      return true;
    },
    {
      message: "Return window must be specified if returns are accepted",
      path: ["returnWindowDays"],
    },
  );

/**
 * Update Auction Schema
 */
export const updateAuctionSchema = createAuctionSchema.partial().extend({
  // Can't change these once auction is live
  startingBid: z.number().optional(),
  startTime: z.coerce.date().optional(),
});

/**
 * Place Bid Schema
 */
export const placeBidSchema = z
  .object({
    auctionId: z.string().min(1, "Auction ID is required"),

    bidAmount: z
      .number()
      .positive("Bid amount must be positive")
      .min(1, "Bid amount must be at least ₹1"),

    isAutoBid: z.boolean().default(false).optional(),

    maxAutoBid: z.number().positive().optional(), // Maximum amount for auto-bidding
  })
  .refine(
    (data) => {
      // If auto-bid, maxAutoBid must be provided and greater than bidAmount
      if (data.isAutoBid) {
        return data.maxAutoBid && data.maxAutoBid > data.bidAmount;
      }
      return true;
    },
    {
      message: "Max auto-bid must be greater than current bid amount",
      path: ["maxAutoBid"],
    },
  );

/**
 * Auction Query Filter Schema
 */
export const auctionQuerySchema = z.object({
  // Pagination
  page: z.coerce.number().int().min(1).default(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20).optional(),

  // Sorting
  sortBy: z
    .enum([
      "name",
      "startTime",
      "endTime",
      "currentBid",
      "bidCount",
      "createdAt",
      "timeLeft",
    ])
    .default("endTime")
    .optional(),
  sortOrder: z.enum(["asc", "desc"]).default("asc").optional(),

  // Filters
  shopId: z.string().optional(),
  categoryId: z.string().optional(),
  status: AuctionStatus.optional(),

  isFeatured: z.coerce.boolean().optional(),

  // Condition
  condition: z.enum(["new", "used", "refurbished"]).optional(),

  // Bid range
  minCurrentBid: z.coerce.number().positive().optional(),
  maxCurrentBid: z.coerce.number().positive().optional(),

  // Time filters
  endingSoon: z.coerce.boolean().optional(), // Ending in next 24 hours
  startingSoon: z.coerce.boolean().optional(), // Starting in next 24 hours

  // Only show auctions the user is bidding on
  userBidding: z.coerce.boolean().optional(),

  // Only show auctions the user is watching
  userWatching: z.coerce.boolean().optional(),

  // Search
  search: z.string().optional(),
});

/**
 * Feature Auction Schema (admin only)
 */
export const featureAuctionSchema = z.object({
  isFeatured: z.boolean(),
  featuredPriority: z.number().int().min(0).max(100).optional(),
});

/**
 * Extend Auction Time Schema (admin only, in case of issues)
 */
export const extendAuctionSchema = z.object({
  additionalHours: z.number().int().positive().max(24), // Max 24 hour extension
  reason: z.string().min(10, "Reason must be at least 10 characters").max(200),
});

/**
 * Cancel Auction Schema
 */
export const cancelAuctionSchema = z.object({
  reason: z.string().min(10, "Reason must be at least 10 characters").max(500),
  refundBidders: z.boolean().default(true).optional(),
});

/**
 * Watchlist Schema
 */
export const watchAuctionSchema = z.object({
  auctionId: z.string().min(1, "Auction ID is required"),
  notifyBeforeEnd: z
    .number()
    .int()
    .positive()
    .default(60) // Notify 60 minutes before end
    .optional(),
});

/**
 * Bid History Query Schema
 */
export const bidHistoryQuerySchema = z.object({
  auctionId: z.string().min(1, "Auction ID is required"),
  page: z.coerce.number().int().min(1).default(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(50).optional(),
});

/**
 * Type exports
 */
export type CreateAuctionInput = z.infer<typeof createAuctionSchema>;
export type UpdateAuctionInput = z.infer<typeof updateAuctionSchema>;
export type PlaceBidInput = z.infer<typeof placeBidSchema>;
export type AuctionQuery = z.infer<typeof auctionQuerySchema>;
export type FeatureAuctionInput = z.infer<typeof featureAuctionSchema>;
export type ExtendAuctionInput = z.infer<typeof extendAuctionSchema>;
export type CancelAuctionInput = z.infer<typeof cancelAuctionSchema>;
export type WatchAuctionInput = z.infer<typeof watchAuctionSchema>;
export type BidHistoryQuery = z.infer<typeof bidHistoryQuerySchema>;

/**
 * Utility: Calculate auction end time from duration
 */
export function calculateEndTime(startTime: Date, durationHours: number): Date {
  return new Date(startTime.getTime() + durationHours * 60 * 60 * 1000);
}

/**
 * Utility: Calculate time remaining
 */
export function getTimeRemaining(endTime: Date): {
  totalMs: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isEnded: boolean;
} {
  const now = new Date();
  const totalMs = endTime.getTime() - now.getTime();

  if (totalMs <= 0) {
    return {
      totalMs: 0,
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      isEnded: true,
    };
  }

  const days = Math.floor(totalMs / (1000 * 60 * 60 * 24));
  const hours = Math.floor(
    (totalMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
  );
  const minutes = Math.floor((totalMs % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((totalMs % (1000 * 60)) / 1000);

  return {
    totalMs,
    days,
    hours,
    minutes,
    seconds,
    isEnded: false,
  };
}

/**
 * Utility: Check if auction is ending soon (within 24 hours)
 */
export function isEndingSoon(endTime: Date): boolean {
  const { totalMs, isEnded } = getTimeRemaining(endTime);
  return !isEnded && totalMs <= 24 * 60 * 60 * 1000;
}

/**
 * Utility: Validate bid amount
 */
export function isValidBidAmount(
  bidAmount: number,
  currentBid: number,
  bidIncrement: number = 10,
): boolean {
  return bidAmount >= currentBid + bidIncrement;
}

/**
 * Utility: Calculate next minimum bid
 */
export function getNextMinimumBid(
  currentBid: number,
  startingBid: number,
  bidIncrement: number = 10,
): number {
  const base = currentBid > 0 ? currentBid : startingBid;
  return base + bidIncrement;
}

/**
 * Utility: Check if user can bid (based on timing)
 */
export function canBid(
  startTime: Date,
  endTime: Date,
): {
  canBid: boolean;
  reason?: string;
} {
  const now = new Date();

  if (now < startTime) {
    return {
      canBid: false,
      reason: "Auction has not started yet",
    };
  }

  if (now >= endTime) {
    return {
      canBid: false,
      reason: "Auction has ended",
    };
  }

  return { canBid: true };
}
