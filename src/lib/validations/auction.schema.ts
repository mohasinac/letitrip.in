import { z } from "zod";

// Auction creation/edit validation schema
export const auctionSchema = z
  .object({
    title: z
      .string()
      .min(3, "Title must be at least 3 characters")
      .max(200, "Title must be less than 200 characters"),
    slug: z
      .string()
      .min(3, "Slug must be at least 3 characters")
      .max(200, "Slug must be less than 200 characters")
      .regex(
        /^[a-z0-9-]+$/,
        "Slug can only contain lowercase letters, numbers, and hyphens",
      ),
    description: z
      .string()
      .min(10, "Description must be at least 10 characters")
      .max(5000, "Description must be less than 5000 characters"),
    categoryId: z.string().min(1, "Please select a category"),

    // Pricing
    startingBid: z
      .number()
      .min(1, "Starting bid must be at least ₹1")
      .max(10000000, "Starting bid is too high"),
    reservePrice: z
      .number()
      .min(0, "Reserve price must be positive")
      .optional(),
    bidIncrement: z
      .number()
      .min(1, "Bid increment must be at least ₹1")
      .max(100000, "Bid increment is too high")
      .default(10),
    buyNowPrice: z.number().min(0, "Buy now price must be positive").optional(),

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
      .max(10, "Maximum 10 images allowed"),

    // Product details
    condition: z.enum(["new", "like-new", "good", "fair"], {
      message: "Please select a valid condition",
    }),

    // Policies
    shippingCost: z
      .number()
      .min(0, "Shipping cost must be positive")
      .default(0),
    shippingPolicy: z.string().optional(),
    returnPolicy: z.string().optional(),

    // System fields
    shopId: z.string().min(1, "Shop ID is required"),
  })
  .refine((data) => data.endTime > data.startTime, {
    message: "End time must be after start time",
    path: ["endTime"],
  })
  .refine(
    (data) => !data.reservePrice || data.reservePrice >= data.startingBid,
    {
      message: "Reserve price must be greater than or equal to starting bid",
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
