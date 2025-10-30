/**
 * Zod Validation Schemas for API Requests
 * @deprecated Use comprehensive-schemas.ts for new schemas
 * This file is kept for backward compatibility
 */

import { z } from "zod";

// Re-export from comprehensive schemas for backward compatibility
export {
  registerSchema,
  loginSchema,
  updateProfileSchema,
  addressSchema,
  createProductSchema,
  updateProductSchema,
  createCategorySchema,
  updateCategorySchema,
  categorySEOSchema,
  createOrderSchema,
  updateOrderStatusSchema,
  addToCartSchema,
  updateCartItemSchema,
  createAuctionSchema,
  placeBidSchema,
  createReviewSchema,
  updateReviewSchema,
  verifyPaymentSchema,
  getShippingRatesSchema,
  createShipmentSchema,
  paginationSchema,
  productFilterSchema,
  orderFilterSchema,
  // Type exports
  type RegisterInput,
  type LoginInput,
  type CreateProductInput,
  type UpdateProductInput,
  type CreateOrderInput,
  type PlaceBidInput,
} from "./comprehensive-schemas";

// Legacy schemas that are still used (keep these for now)
export const createAuctionSchema_legacy = z.object({
  productId: z.string(),
  startingPrice: z.number().positive("Starting price must be positive"),
  reservePrice: z.number().positive().optional(),
  buyNowPrice: z.number().positive().optional(),
  startTime: z.string().datetime(),
  endTime: z.string().datetime(),
});

export const placeBidSchema_legacy = z.object({
  amount: z.number().positive("Bid amount must be positive"),
  isAutoBid: z.boolean().default(false),
  maxAutoBid: z.number().positive().optional(),
});

// Legacy filter schemas
export const productFilterSchema_legacy = z.object({
  page: z.number().int().positive().default(1),
  pageSize: z.number().int().positive().max(100).default(20),
  category: z.string().optional(),
  minPrice: z.number().nonnegative().optional(),
  maxPrice: z.number().positive().optional(),
  tags: z.array(z.string()).optional(),
  search: z.string().optional(),
  sort: z.enum(["price-asc", "price-desc", "newest", "popular"]).optional(),
});

export const orderFilterSchema_legacy = z.object({
  page: z.number().int().positive().default(1),
  pageSize: z.number().int().positive().max(100).default(20),
  status: z
    .enum([
      "pending",
      "confirmed",
      "processing",
      "shipped",
      "delivered",
      "cancelled",
      "refunded",
    ])
    .optional(),
  paymentStatus: z.enum(["pending", "paid", "failed", "refunded"]).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  search: z.string().optional(),
});

// Quick validation functions for common use cases
export const validateEmail = (email: string) => {
  return z.string().email().safeParse(email);
};

export const validatePhone = (phone: string) => {
  return z
    .string()
    .regex(/^[+]?[\d\s\-\(\)]{10,15}$/)
    .safeParse(phone);
};

export const validatePincode = (pincode: string) => {
  return z
    .string()
    .regex(/^\d{6}$/)
    .safeParse(pincode);
};

export const validatePassword = (password: string) => {
  return z
    .string()
    .min(8)
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .safeParse(password);
};
