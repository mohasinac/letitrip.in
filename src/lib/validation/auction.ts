/**
 * @fileoverview TypeScript Module
 * @module src/lib/validation/auction
 * @description This file contains functionality related to auction
 * 
 * @created 2025-12-05
 * @author Development Team
 */

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
    /** Name */
    name: z
      .string()
      .min(10, "Auction name must be at least 10 characters")
      .max(200, "Auction name must not exceed 200 characters")
      .trim(),

    /** Slug */
    slug: z
      .string()
      .min(3, "Slug must be at least 3 characters")
      .max(200, "Slug must not exceed 200 characters")
      .regex(
        slugRegex,
        "Slug must contain only lowercase letters, numbers, and hyphens",
      )
      .trim(),

    /** Description */
    description: z
      .string()
      .min(50, "Description must be at least 50 characters")
      .max(5000, "Description must not exceed 5000 characters")
      .trim(),

    /** Short Description */
    shortDescription: z
      .string()
      .max(200, "Short description must not exceed 200 characters")
      .trim()
      .optional(),

    // Shop Reference
    /** Shop Id */
    shopId: z.string().min(1, "Shop ID is required"),

    // Category (optional for auctions, but helps with discovery)
    /** Category Id */
    categoryId: z.string().optional(),

    // Bidding
    /** Starting Bid */
    startingBid: z
      .number()
      .positive("Starting bid must be positive")
      .min(1, "Starting bid must be at least ₹1")
      .max(10000000, "Starting bid must not exceed ₹1 Crore"),

    /** Reserve Price */
    reservePrice: z
      .number()
      .positive("Reserve price must be positive")
      .optional()
      .nullable(), // Minimum price to sell, hidden from bidders

    /** Bid Increment */
    bidIncrement: z
      .number()
      .positive("Bid increment must be positive")
      .default(10)
      .optional(), // Minimum increment for next bid

    // Timing
    /** Start Time */
    startTime: z.coerce.date(),

    /** End Time */
    endTime: z.coerce.date(),

    // Duration helper (alternative to endTime)
    /** Duration Hours */
    durationHours: z
      .number()
      .int()
      .positive()
      .max(720) // Max 30 days
      .optional(), // Will calculate endTime if provided

    // Media
    /** Images */
    images: z
      .array(z.string().url())
      .min(1, "At least one image is required")
      .max(10, "Maximum 10 images allowed"),

    /** Videos */
    videos: z
      .array(z.string().url())
      .max(3, "Maximum 3 videos allowed")
      .optional(),

    // Item Details
    /** Condition */
    condition: z.enum(["new", "used", "refurbished"]).default("used"),

    /** Brand */
    brand: z
      .string()
      .max(100, "Brand must not exceed 100 characters")
      .trim()
      .optional(),

    /** Manufacturer */
    manufacturer: z
      .string()
      .max(100, "Manufacturer must not exceed 100 characters")
      .trim()
      .optional(),

    /** Country Of Origin */
    countryOfOrigin: z.string().default("Japan").optional(),

    // Specifications
    /** Specifications */
    specifications: z
      .array(
        z.object({
          /** Name */
          name: z.string().min(1).max(100),
          /** Value */
          value: z.string().min(1).max(500),
        }),
      )
      .optional(),

    // Shipping
    /** Shipping Cost */
    shippingCost: z
      .number()
      .min(0, "Shipping cost cannot be negative")
      .default(0)
      .optional(),

    /** Shipping Class */
    shippingClass: z
      .enum(["standard", "express", "heavy", "fragile"])
      .default("standard")
      .optional(),

    /** International Shipping */
    internationalShipping: z.boolean().default(false).optional(),

    // Buyer Requirements
    /** Requires Verified Bidders */
    requiresVerifiedBidders: z.boolean().default(false).optional(),

    minimumBidderRating: z.number().min(0).max(5).optional(), // Minimum rating to bid

    // Auto-bid Settings
    /** Allow Auto Bid */
    allowAutoBid: z.boolean().default(true).optional(),

    maxAutoBidders: z.number().int().positive().optional(), // Limit auto-bidders

    // Payment Terms
    paymentDueHours: z.number().int().positive().default(48).optional(), // Hours after auction ends

    /** Accepted Payment Methods */
    acceptedPaymentMethods: z
      .array(z.enum(["razorpay", "paypal", "cod"]))
      .min(1, "At least one payment method required")
      .default(["razorpay", "paypal"])
      .optional(),

    // Return Policy
    /** Returns Accepted */
    returnsAccepted: z.boolean().default(false).optional(),

    returnWindowDays: z.number().int().min(0).max(14).optional(), // Shorter window for auctions

    /** Return Conditions */
    returnConditions: z.string().max(500).optional(),

    // Tags
    /** Tags */
    tags: z
      .array(z.string().max(50))
      .max(20, "Maximum 20 tags allowed")
      .optional(),

    // SEO
    /** Meta Title */
    metaTitle: z
      .string()
      .max(60, "Meta title must not exceed 60 characters")
      .optional(),

    /** Meta Description */
    metaDescription: z
      .string()
      .max(160, "Meta description must not exceed 160 characters")
      .optional(),

    // Status
    /** Status */
    status: AuctionStatus.default("draft"),

    // Flags (admin only)
    /** Featured */
    featured: z.boolean().default(false).optional(),

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
      /** Message */
      message: "End time must be after start time",
      /** Path */
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
      /** Message */
      message: "Reserve price must be greater than or equal to starting bid",
      /** Path */
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
      /** Message */
      message: "Auction duration must be between 1 hour and 30 days",
      /** Path */
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
      /** Message */
      message: "Return window must be specified if returns are accepted",
      /** Path */
      path: ["returnWindowDays"],
    },
  );

/**
 * Update Auction Schema
 */
export const updateAuctionSchema = createAuctionSchema.partial().extend({
  // Can't change these once auction is live
  /** Starting Bid */
  startingBid: z.number().optional(),
  /** Start Time */
  startTime: z.coerce.date().optional(),
});

/**
 * Place Bid Schema
 */
export const placeBidSchema = z
  .object({
    /** Auction Id */
    auctionId: z.string().min(1, "Auction ID is required"),

    /** Bid Amount */
    bidAmount: z
      .number()
      .positive("Bid amount must be positive")
      .min(1, "Bid amount must be at least ₹1"),

    /** Is Auto Bid */
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
      /** Message */
      message: "Max auto-bid must be greater than current bid amount",
      /** Path */
      path: ["maxAutoBid"],
    },
  );

/**
 * Auction Query Filter Schema
 */
export const auctionQuerySchema = z.object({
  // Pagination
  /** Page */
  page: z.coerce.number().int().min(1).default(1).optional(),
  /** Limit */
  limit: z.coerce.number().int().min(1).max(100).default(20).optional(),

  // Sorting
  /** Sort By */
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
  /** Sort Order */
  sortOrder: z.enum(["asc", "desc"]).default("asc").optional(),

  // Filters
  /** Shop Id */
  shopId: z.string().optional(),
  /** Category Id */
  categoryId: z.string().optional(),
  /** Status */
  status: AuctionStatus.optional(),

  /** Featured */
  featured: z.coerce.boolean().optional(),

  // Condition
  /** Condition */
  condition: z.enum(["new", "used", "refurbished"]).optional(),

  // Bid range
  /** Min Current Bid */
  minCurrentBid: z.coerce.number().positive().optional(),
  /** Max Current Bid */
  maxCurrentBid: z.coerce.number().positive().optional(),

  // Time filters
  endingSoon: z.coerce.boolean().optional(), // Ending in next 24 hours
  startingSoon: z.coerce.boolean().optional(), // Starting in next 24 hours

  // Only show auctions the user is bidding on
  /** User Bidding */
  userBidding: z.coerce.boolean().optional(),

  // Only show auctions the user is watching
  /** User Watching */
  userWatching: z.coerce.boolean().optional(),

  // Search
  /** Search */
  search: z.string().optional(),
});

/**
 * Feature Auction Schema (admin only)
 */
export const featureAuctionSchema = z.object({
  /** Featured */
  featured: z.boolean(),
  /** Featured Priority */
  featuredPriority: z.number().int().min(0).max(100).optional(),
});

/**
 * Extend Auction Time Schema (admin only, in case of issues)
 */
export const extendAuctionSchema = z.object({
  additionalHours: z.number().int().positive().max(24), // Max 24 hour extension
  /** Reason */
  reason: z.string().min(10, "Reason must be at least 10 characters").max(200),
});

/**
 * Cancel Auction Schema
 */
export const cancelAuctionSchema = z.object({
  /** Reason */
  reason: z.string().min(10, "Reason must be at least 10 characters").max(500),
  /** Refund Bidders */
  refundBidders: z.boolean().default(true).optional(),
});

/**
 * Watchlist Schema
 */
export const watchAuctionSchema = z.object({
  /** Auction Id */
  auctionId: z.string().min(1, "Auction ID is required"),
  /** Notify Before End */
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
  /** Auction Id */
  auctionId: z.string().min(1, "Auction ID is required"),
  /** Page */
  page: z.coerce.number().int().min(1).default(1).optional(),
  /** Limit */
  limit: z.coerce.number().int().min(1).max(100).default(50).optional(),
});

/**
 * Type exports
 */
export type CreateAuctionInput = z.infer<typeof createAuctionSchema>;
/**
 * UpdateAuctionInput type
 * 
 * @typedef {Object} UpdateAuctionInput
 * @description Type definition for UpdateAuctionInput
 */
export type UpdateAuctionInput = z.infer<typeof updateAuctionSchema>;
/**
 * PlaceBidInput type
 * 
 * @typedef {Object} PlaceBidInput
 * @description Type definition for PlaceBidInput
 */
export type PlaceBidInput = z.infer<typeof placeBidSchema>;
/**
 * AuctionQuery type
 * 
 * @typedef {Object} AuctionQuery
 * @description Type definition for AuctionQuery
 */
export type AuctionQuery = z.infer<typeof auctionQuerySchema>;
/**
 * FeatureAuctionInput type
 * 
 * @typedef {Object} FeatureAuctionInput
 * @description Type definition for FeatureAuctionInput
 */
export type FeatureAuctionInput = z.infer<typeof featureAuctionSchema>;
/**
 * ExtendAuctionInput type
 * 
 * @typedef {Object} ExtendAuctionInput
 * @description Type definition for ExtendAuctionInput
 */
export type ExtendAuctionInput = z.infer<typeof extendAuctionSchema>;
/**
 * CancelAuctionInput type
 * 
 * @typedef {Object} CancelAuctionInput
 * @description Type definition for CancelAuctionInput
 */
export type CancelAuctionInput = z.infer<typeof cancelAuctionSchema>;
/**
 * WatchAuctionInput type
 * 
 * @typedef {Object} WatchAuctionInput
 * @description Type definition for WatchAuctionInput
 */
export type WatchAuctionInput = z.infer<typeof watchAuctionSchema>;
/**
 * BidHistoryQuery type
 * 
 * @typedef {Object} BidHistoryQuery
 * @description Type definition for BidHistoryQuery
 */
export type BidHistoryQuery = z.infer<typeof bidHistoryQuerySchema>;

/**
 * Utility: Calculate auction end time from duration
 */
/**
 * Calculates end time
 *
 * @param {Date} startTime - The start time
 * @param {number} durationHours - The duration hours
 *
 * @returns {number} The calculateendtime result
 *
 * @example
 * calculateEndTime(startTime, 123);
 */

/**
 * Calculates end time
 *
 * @param {Date} startTime - The start time
 * @param {number} durationHours - The duration hours
 *
 * @returns {number} The calculateendtime result
 *
 * @example
 * calculateEndTime(startTime, 123);
 */

export function calculateEndTime(startTime: Date, durationHours: number): Date {
  return new Date(startTime.getTime() + durationHours * 60 * 60 * 1000);
}

/**
 * Utility: Calculate time remaining
 */
/**
 * Retrieves time remaining
 *
 * @param {Date | undefined | null} endTime - The end time
 *
 * @returns {number} The timeremaining result
 *
 * @example
 * getTimeRemaining(endTime);
 */

/**
 * Retrieves time remaining
 *
 * @param {Date | undefined | null} endTime - The end time
 *
 * @returns {number} The timeremaining result
 *
 * @example
 * getTimeRemaining(endTime);
 */

export function getTimeRemaining(endTime: Date | undefined | null): {
  /** Total Ms */
  totalMs: number;
  /** Days */
  days: number;
  /** Hours */
  hours: number;
  /** Minutes */
  minutes: number;
  /** Seconds */
  seconds: number;
  /** Is Ended */
  isEnded: boolean;
} {
  // Handle null/undefined endTime
  if (!endTime || !(endTime instanceof Date) || isNaN(endTime.getTime())) {
    return {
      /** Total Ms */
      totalMs: 0,
      /** Days */
      days: 0,
      /** Hours */
      hours: 0,
      /** Minutes */
      minutes: 0,
      /** Seconds */
      seconds: 0,
      /** Is Ended */
      isEnded: true,
    };
  }

  const now = new Date();
  const totalMs = endTime.getTime() - now.getTime();

  if (totalMs <= 0) {
    return {
      /** Total Ms */
      totalMs: 0,
      /** Days */
      days: 0,
      /** Hours */
      hours: 0,
      /** Minutes */
      minutes: 0,
      /** Seconds */
      seconds: 0,
      /** Is Ended */
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
    /** Is Ended */
    isEnded: false,
  };
}

/**
 * Utility: Check if auction is ending soon (within 24 hours)
 */
/**
 * Checks if ending soon
 *
 * @param {Date} endTime - The end time
 *
 * @returns {boolean} True if condition is met, false otherwise
 *
 * @example
 * isEndingSoon(endTime);
 */

/**
 * Checks if ending soon
 *
 * @param {Date} endTime - The end time
 *
 * @returns {boolean} True if condition is met, false otherwise
 *
 * @example
 * isEndingSoon(endTime);
 */

export function isEndingSoon(endTime: Date): boolean {
  const { totalMs, isEnded } = getTimeRemaining(endTime);
  return !isEnded && totalMs <= 24 * 60 * 60 * 1000;
}

/**
 * Utility: Validate bid amount
 */
/**
 * Checks if valid bid amount
 *
 * @param {number} bidAmount - The bid amount
 * @param {number} currentBid - The current bid
 * @param {number} [bidIncrement] - The bid increment
 *
 * @returns {boolean} True if condition is met, false otherwise
 *
 * @example
 * isValidBidAmount(123, 123, 123);
 */

/**
 * Checks if valid bid amount
 *
 * @returns {number} The isvalidbidamount result
 *
 * @example
 * isValidBidAmount();
 */

export function isValidBidAmount(
  /** Bid Amount */
  bidAmount: number,
  /** Current Bid */
  currentBid: number,
  /** Bid Increment */
  bidIncrement: number = 10,
): boolean {
  return bidAmount >= currentBid + bidIncrement;
}

/**
 * Utility: Calculate next minimum bid
 */
/**
 * Retrieves next minimum bid
 *
 * @param {number} currentBid - The current bid
 * @param {number} startingBid - The starting bid
 * @param {number} [bidIncrement] - The bid increment
 *
 * @returns {number} The nextminimumbid result
 *
 * @example
 * getNextMinimumBid(123, 123, 123);
 */

/**
 * Retrieves next minimum bid
 *
 * @returns {number} The nextminimumbid result
 *
 * @example
 * getNextMinimumBid();
 */

export function getNextMinimumBid(
  /** Current Bid */
  currentBid: number,
  /** Starting Bid */
  startingBid: number,
  /** Bid Increment */
  bidIncrement: number = 10,
): number {
  const base = currentBid > 0 ? currentBid : startingBid;
  return base + bidIncrement;
}

/**
 * Utility: Check if user can bid (based on timing)
 */
/**
 * Checks if bid
 *
 * @param {Date} startTime - The start time
 * @param {Date} endTime - The end time
 *
 * @returns {boolean} True if condition is met, false otherwise
 *
 * @example
 * canBid(startTime, endTime);
 */

/**
 * Checks if bid
 *
 * @returns {any} The canbid result
 *
 * @example
 * canBid();
 */

export function canBid(
  /** Start Time */
  startTime: Date,
  /** End Time */
  endTime: Date,
): {
  /** Can Bid */
  canBid: boolean;
  /** Reason */
  reason?: string;
} {
  const now = new Date();

  if (now < startTime) {
    return {
      /** Can Bid */
      canBid: false,
      /** Reason */
      reason: "Auction has not started yet",
    };
  }

  if (now >= endTime) {
    return {
      /** Can Bid */
      canBid: false,
      /** Reason */
      reason: "Auction has ended",
    };
  }

  return { canBid: true };
}
