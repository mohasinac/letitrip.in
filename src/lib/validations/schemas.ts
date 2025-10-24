/**
 * Zod Validation Schemas for API Requests
 */

import { z } from 'zod';

// Auth Schemas
export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().optional(),
  role: z.enum(['admin', 'seller', 'user']).default('user'),
  isOver18: z.boolean().refine((val) => val === true, {
    message: 'You must be 18 or older to create an account',
  }),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const updateProfileSchema = z.object({
  name: z.string().min(2).optional(),
  phone: z.string().optional(),
  avatar: z.string().url().optional(),
});

// Address Schema
export const addressSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  phone: z.string().min(10, 'Valid phone number is required'),
  addressLine1: z.string().min(5, 'Address is required'),
  addressLine2: z.string().optional(),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  pincode: z.string().regex(/^\d{6}$/, 'Valid 6-digit pincode is required'),
  country: z.string().default('India'),
  isDefault: z.boolean().default(false),
});

// Product Schemas
export const createProductSchema = z.object({
  name: z.string().min(2, 'Product name is required'),
  slug: z.string().regex(/^[a-z0-9-]+$/, 'Invalid slug format'),
  description: z.string().min(10, 'Description is required'),
  shortDescription: z.string().optional(),
  price: z.number().positive('Price must be positive'),
  compareAtPrice: z.number().positive().optional(),
  cost: z.number().positive().optional(),
  sku: z.string().min(1, 'SKU is required'),
  barcode: z.string().optional(),
  quantity: z.number().int().nonnegative('Quantity must be non-negative'),
  lowStockThreshold: z.number().int().nonnegative().default(10),
  weight: z.number().positive('Weight is required for shipping calculations'),
  weightUnit: z.enum(['kg', 'g', 'lb', 'oz']).default('kg'),
  dimensions: z.object({
    length: z.number().positive(),
    width: z.number().positive(),
    height: z.number().positive(),
    unit: z.enum(['cm', 'in']),
  }).optional(),
  images: z.array(z.object({
    url: z.string().url(),
    alt: z.string(),
    order: z.number().int(),
  })).min(1, 'At least one image is required'),
  category: z.string().min(1, 'Category is required'),
  tags: z.array(z.string()).default([]),
  status: z.enum(['active', 'draft', 'archived']).default('draft'),
  isFeatured: z.boolean().default(false),
  seo: z.object({
    title: z.string().max(60),
    description: z.string().max(160),
    keywords: z.array(z.string()),
  }),
});

export const updateProductSchema = createProductSchema.partial();

// Category Schemas
export const createCategorySchema = z.object({
  name: z.string().min(2, 'Category name is required'),
  slug: z.string().regex(/^[a-z0-9-]+$/, 'Invalid slug format'),
  description: z.string().optional(),
  image: z.string().url().optional(),
  parentId: z.string().optional(),
  order: z.number().int().nonnegative().default(0),
  status: z.enum(['active', 'inactive']).default('active'),
});

export const updateCategorySchema = createCategorySchema.partial();

// Order Schemas
export const createOrderSchema = z.object({
  items: z.array(z.object({
    productId: z.string(),
    quantity: z.number().int().positive(),
  })).min(1, 'Order must have at least one item'),
  shippingAddressId: z.string(),
  billingAddressId: z.string(),
  paymentMethod: z.enum(['razorpay', 'cod']),
  couponCode: z.string().optional(),
  notes: z.string().optional(),
});

export const updateOrderStatusSchema = z.object({
  status: z.enum(['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded']),
  trackingNumber: z.string().optional(),
  notes: z.string().optional(),
});

// Cart Schemas
export const addToCartSchema = z.object({
  productId: z.string(),
  quantity: z.number().int().positive().default(1),
});

export const updateCartItemSchema = z.object({
  quantity: z.number().int().nonnegative(),
});

// Auction Schemas
export const createAuctionSchema = z.object({
  productId: z.string(),
  startingPrice: z.number().positive('Starting price must be positive'),
  reservePrice: z.number().positive().optional(),
  buyNowPrice: z.number().positive().optional(),
  startTime: z.string().datetime(),
  endTime: z.string().datetime(),
});

export const placeBidSchema = z.object({
  amount: z.number().positive('Bid amount must be positive'),
  isAutoBid: z.boolean().default(false),
  maxAutoBid: z.number().positive().optional(),
});

// Review Schemas
export const createReviewSchema = z.object({
  productId: z.string(),
  rating: z.number().int().min(1).max(5),
  title: z.string().min(2, 'Review title is required'),
  comment: z.string().min(10, 'Review comment must be at least 10 characters'),
  images: z.array(z.string().url()).optional(),
});

export const updateReviewSchema = createReviewSchema.partial().omit({ productId: true });

// Payment Schemas
export const verifyPaymentSchema = z.object({
  orderId: z.string(),
  paymentId: z.string(),
  signature: z.string(),
});

// Shipping Schemas
export const getShippingRatesSchema = z.object({
  pincode: z.string().regex(/^\d{6}$/, 'Valid 6-digit pincode is required'),
  weight: z.number().positive('Weight must be positive'),
});

export const createShipmentSchema = z.object({
  orderId: z.string(),
  courierId: z.number().int().positive(),
});

// Query Schemas
export const paginationSchema = z.object({
  page: z.number().int().positive().default(1),
  pageSize: z.number().int().positive().max(100).default(20),
});

export const productFilterSchema = paginationSchema.extend({
  category: z.string().optional(),
  minPrice: z.number().nonnegative().optional(),
  maxPrice: z.number().positive().optional(),
  tags: z.array(z.string()).optional(),
  search: z.string().optional(),
  sort: z.enum(['price-asc', 'price-desc', 'newest', 'popular']).optional(),
});

export const orderFilterSchema = paginationSchema.extend({
  status: z.enum(['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded']).optional(),
  paymentStatus: z.enum(['pending', 'paid', 'failed', 'refunded']).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  search: z.string().optional(),
});

// Type exports
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type PlaceBidInput = z.infer<typeof placeBidSchema>;
