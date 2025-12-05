/**
 * @fileoverview TypeScript Module
 * @module src/lib/validations/auction.schema
 * @description This file contains functionality related to auction.schema
 * 
 * @created 2025-12-05
 * @author mohasinac
 * @see {@link https://mohasin.chinnapattan.com}
 */

import { z } from "zod";
import {
  VALIDATION_RULES,
  VALIDATION_MESSAGES,
} from "@/constants/validation-messages";

// Auction creation/edit validation schema
/**
 * Performs auction schema operation
 *
 * @param {object} {
    
    title - The {
    
    title
 *
 * @returns {any} The auctionschema result
 *
 * @example
 * auctionSchema({});
 */
export const auctionSchema = z
  .object({
    /** Title */
    title: z
      .string()
      .min(
        VALIDATION_RULES.AUCTION.NAME.MIN_LENGTH,
        VALIDATION_MESSAGES.AUCTION.NAME_TOO_SHORT,
      )
      .max(
        VALIDATION_RULES.AUCTION.NAME.MAX_LENGTH,
        VALIDATION_MESSAGES.AUCTION.NAME_TOO_LONG,
      ),
    /** Slug */
    slug: z
      .string()
      .min(VALIDATION_RULES.SLUG.MIN_LENGTH, VALIDATION_MESSAGES.SLUG.TOO_SHORT)
      .max(VALIDATION_RULES.SLUG.MAX_LENGTH, VALIDATION_MESSAGES.SLUG.TOO_LONG)
      .regex(VALIDATION_RULES.SLUG.PATTERN, VALIDATION_MESSAGES.SLUG.INVALID),
    /** Description */
    description: z
      .string()
      .min(
        VALIDATION_RULES.AUCTION.DESCRIPTION.MIN_LENGTH,
        VALIDATION_MESSAGES.AUCTION.DESC_TOO_SHORT,
      )
      .max(
        VALIDATION_RULES.AUCTION.DESCRIPTION.MAX_LENGTH,
        VALIDATION_MESSAGES.AUCTION.DESC_TOO_LONG,
      ),
    /** Category Id */
    categoryId: z
      .string()
      .min(1, VALIDATION_MESSAGES.REQUIRED.FIELD("Category")),

    // Pricing
    /** Starting Bid */
    startingBid: z
      .number()
      .min(
        VALIDATION_RULES.AUCTION.START_PRICE.MIN,
        VALIDATION_MESSAGES.AUCTION.START_PRICE_TOO_LOW,
      )
      .max(
        VALIDATION_RULES.AUCTION.START_PRICE.MAX,
        VALIDATION_MESSAGES.AUCTION.START_PRICE_TOO_HIGH,
      ),
    /** Reserve Price */
    reservePrice: z
      .number()
      .min(0, VALIDATION_MESSAGES.NUMBER.NOT_POSITIVE)
      .optional(),
    /** Bid Increment */
    bidIncrement: z
      .number()
      .min(
        VALIDATION_RULES.AUCTION.BID_INCREMENT.MIN,
        VALIDATION_MESSAGES.AUCTION.INCREMENT_TOO_LOW,
      )
      .max(
        VALIDATION_RULES.AUCTION.BID_INCREMENT.MAX,
        "Bid increment is too high",
      )
      .default(10),
    /** Buy Now Price */
    buyNowPrice: z
      .number()
      .min(0, VALIDATION_MESSAGES.NUMBER.NOT_POSITIVE)
      .optional(),

    // Timing
    /** Start Time */
    startTime: z.coerce.date({
      /** Message */
      message: "Start time is required and must be a valid date",
    }),
    /** End Time */
    endTime: z.coerce.date({
      /** Message */
      message: "End time is required and must be a valid date",
    }),

    // Media
    /** Images */
    images: z
      .array(z.string().url("Invalid image URL"))
      .min(1, "At least one auction image is required")
      .max(VALIDATION_RULES.PRODUCT.IMAGES.MAX, "Maximum 10 images allowed"),

    // Product details
    /** Condition */
    condition: z.enum(["new", "like-new", "good", "fair"], {
      /** Message */
      message: "Please select a valid condition",
    }),

    // Policies
    /** Shipping Cost */
    shippingCost: z
      .number()
      .min(0, VALIDATION_MESSAGES.NUMBER.NOT_POSITIVE)
      .default(0),
    /** Shipping Policy */
    shippingPolicy: z.string().optional(),
    /** Return Policy */
    returnPolicy: z.string().optional(),

    // System fields
    /** Shop Id */
    shopId: z.string().min(1, VALIDATION_MESSAGES.REQUIRED.FIELD("Shop ID")),
  })
  .refine((data) => data.endTime > data.startTime, {
    /** Message */
    message: VALIDATION_MESSAGES.AUCTION.END_BEFORE_START,
    /** Path */
    path: ["endTime"],
  })
  .refine(
    (data) => !data.reservePrice || data.reservePrice >= data.startingBid,
    {
      /** Message */
      message: VALIDATION_MESSAGES.AUCTION.RESERVE_BELOW_START,
      /** Path */
      path: ["reservePrice"],
    },
  )
  .refine((data) => !data.buyNowPrice || data.buyNowPrice > data.startingBid, {
    /** Message */
    message: "Buy now price must be greater than starting bid",
    /** Path */
    path: ["buyNowPrice"],
  });

// Bid placement validation
export const placeBidSchema = z.object({
  /** Amount */
  amount: z
    .number()
    .min(1, "Bid amount must be at least ₹1")
    .max(10000000, "Bid amount is too high"),
  /** Auction Id */
  auctionId: z.string().min(1, "Auction ID is required"),
});

// Auto-bid setup validation
export const autoBidSchema = z.object({
  /** Max Amount */
  maxAmount: z
    .number()
    .min(1, "Maximum amount must be at least ₹1")
    .max(10000000, "Maximum amount is too high"),
  /** Increment */
  increment: z
    .number()
    .min(1, "Increment must be at least ₹1")
    .max(10000, "Increment is too high"),
});

/**
 * AuctionFormData type
 * 
 * @typedef {Object} AuctionFormData
 * @description Type definition for AuctionFormData
 */
/**
 * AuctionFormData type definition
 *
 * @typedef {z.infer<typeof auctionSchema>} AuctionFormData
 * @description Type definition for AuctionFormData
 */
export type AuctionFormData = z.infer<typeof auctionSchema>;
/**
 * PlaceBidFormData type
 * 
 * @typedef {Object} PlaceBidFormData
 * @description Type definition for PlaceBidFormData
 */
/**
 * PlaceBidFormData type definition
 *
 * @typedef {z.infer<typeof placeBidSchema>} PlaceBidFormData
 * @description Type definition for PlaceBidFormData
 */
export type PlaceBidFormData = z.infer<typeof placeBidSchema>;
/**
 * AutoBidFormData type
 * 
 * @typedef {Object} AutoBidFormData
 * @description Type definition for AutoBidFormData
 */
/**
 * AutoBidFormData type definition
 *
 * @typedef {z.infer<typeof autoBidSchema>} AutoBidFormData
 * @description Type definition for AutoBidFormData
 */
export type AutoBidFormData = z.infer<typeof autoBidSchema>;
