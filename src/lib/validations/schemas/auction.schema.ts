import { z } from "zod";
import {
  VALIDATION_RULES,
  VALIDATION_MESSAGES,
} from "@/constants/validation-messages";

// Auction creation/edit validation schema
export const auctionSchema = z
  .object({
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
    slug: z
      .string()
      .min(VALIDATION_RULES.SLUG.MIN_LENGTH, VALIDATION_MESSAGES.SLUG.TOO_SHORT)
      .max(VALIDATION_RULES.SLUG.MAX_LENGTH, VALIDATION_MESSAGES.SLUG.TOO_LONG)
      .regex(VALIDATION_RULES.SLUG.PATTERN, VALIDATION_MESSAGES.SLUG.INVALID),
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
    categoryId: z
      .string()
      .min(1, VALIDATION_MESSAGES.REQUIRED.FIELD("Category")),

    // Pricing
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
    reservePrice: z
      .number()
      .min(0, VALIDATION_MESSAGES.NUMBER.NOT_POSITIVE)
      .optional(),
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
    buyNowPrice: z
      .number()
      .min(0, VALIDATION_MESSAGES.NUMBER.NOT_POSITIVE)
      .optional(),

    // Timing
    startTime: z.coerce.date({
      message: "Start time is required and must be a valid date",
    }),
    endTime: z.coerce.date({
      message: "End time is required and must be a valid date",
    }),

    // Media
    images: z
      .array(z.string().url("Invalid image URL"))
      .min(1, "At least one auction image is required")
      .max(VALIDATION_RULES.PRODUCT.IMAGES.MAX, "Maximum 10 images allowed"),

    // Product details
    condition: z.enum(["new", "like-new", "good", "fair"], {
      message: "Please select a valid condition",
    }),

    // Policies
    shippingCost: z
      .number()
      .min(0, VALIDATION_MESSAGES.NUMBER.NOT_POSITIVE)
      .default(0),
    shippingPolicy: z.string().optional(),
    returnPolicy: z.string().optional(),

    // System fields
    shopId: z.string().min(1, VALIDATION_MESSAGES.REQUIRED.FIELD("Shop ID")),
  })
  .refine((data) => data.endTime > data.startTime, {
    message: VALIDATION_MESSAGES.AUCTION.END_BEFORE_START,
    path: ["endTime"],
  })
  .refine(
    (data) => !data.reservePrice || data.reservePrice >= data.startingBid,
    {
      message: VALIDATION_MESSAGES.AUCTION.RESERVE_BELOW_START,
      path: ["reservePrice"],
    },
  )
  .refine((data) => !data.buyNowPrice || data.buyNowPrice > data.startingBid, {
    message: "Buy now price must be greater than starting bid",
    path: ["buyNowPrice"],
  });

// Bid placement validation
export const placeBidSchema = z.object({
  amount: z
    .number()
    .min(1, "Bid amount must be at least ₹1")
    .max(10000000, "Bid amount is too high"),
  auctionId: z.string().min(1, "Auction ID is required"),
});

// Auto-bid setup validation
export const autoBidSchema = z.object({
  maxAmount: z
    .number()
    .min(1, "Maximum amount must be at least ₹1")
    .max(10000000, "Maximum amount is too high"),
  increment: z
    .number()
    .min(1, "Increment must be at least ₹1")
    .max(10000, "Increment is too high"),
});

export type AuctionFormData = z.infer<typeof auctionSchema>;
export type PlaceBidFormData = z.infer<typeof placeBidSchema>;
export type AutoBidFormData = z.infer<typeof autoBidSchema>;
