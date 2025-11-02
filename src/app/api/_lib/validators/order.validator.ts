/**
 * Order Validation Schemas
 * 
 * Zod schemas for validating order-related data
 */

import { z } from 'zod';

// ============================================================================
// Enums
// ============================================================================

export const OrderStatus = z.enum([
  'pending',
  'confirmed',
  'processing',
  'shipped',
  'delivered',
  'cancelled',
  'refunded',
]);

export const PaymentStatus = z.enum([
  'pending',
  'processing',
  'completed',
  'failed',
  'refunded',
]);

export const PaymentMethod = z.enum([
  'razorpay',
  'paypal',
  'cod',
  'upi',
]);

// ============================================================================
// Sub-schemas
// ============================================================================

const orderItemSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  name: z.string().min(1, 'Product name is required'),
  slug: z.string().optional(),
  price: z.number().positive('Price must be positive'),
  quantity: z.number().int().positive('Quantity must be positive'),
  image: z.string().url().optional(),
  variant: z.string().optional(),
  sellerId: z.string().optional(),
});

const shippingAddressSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number'),
  addressLine1: z.string().min(5, 'Address line 1 is required'),
  addressLine2: z.string().optional(),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  country: z.string().min(2, 'Country is required'),
  postalCode: z.string().min(3, 'Postal code is required'),
  landmark: z.string().optional(),
});

const paymentDetailsSchema = z.object({
  method: PaymentMethod,
  transactionId: z.string().optional(),
  razorpayOrderId: z.string().optional(),
  razorpayPaymentId: z.string().optional(),
  razorpaySignature: z.string().optional(),
  paypalOrderId: z.string().optional(),
  paypalPayerId: z.string().optional(),
});

// ============================================================================
// Main Schemas
// ============================================================================

/**
 * Schema for creating a new order
 */
export const createOrderSchema = z.object({
  items: z.array(orderItemSchema).min(1, 'Order must have at least one item'),
  shippingAddress: shippingAddressSchema,
  billingAddress: shippingAddressSchema.optional(),
  paymentMethod: PaymentMethod,
  paymentDetails: paymentDetailsSchema.optional(),
  
  // Pricing
  subtotal: z.number().positive('Subtotal must be positive'),
  shippingCost: z.number().nonnegative('Shipping cost cannot be negative'),
  tax: z.number().nonnegative('Tax cannot be negative'),
  discount: z.number().nonnegative('Discount cannot be negative').optional(),
  total: z.number().positive('Total must be positive'),
  
  // Additional fields
  notes: z.string().max(500, 'Notes must be less than 500 characters').optional(),
  couponCode: z.string().optional(),
});

/**
 * Schema for updating order status
 */
export const updateOrderStatusSchema = z.object({
  status: OrderStatus,
  trackingNumber: z.string().optional(),
  carrier: z.string().optional(),
  estimatedDelivery: z.string().optional(),
  notes: z.string().max(500).optional(),
});

/**
 * Schema for canceling an order
 */
export const cancelOrderSchema = z.object({
  reason: z.string().min(10, 'Cancellation reason must be at least 10 characters').max(500),
  requestRefund: z.boolean().optional(),
});

/**
 * Schema for tracking an order
 */
export const trackOrderSchema = z.object({
  orderNumber: z.string().min(1, 'Order number is required'),
  email: z.string().email('Invalid email address'),
});

/**
 * Schema for order filters
 */
export const orderFiltersSchema = z.object({
  status: OrderStatus.optional(),
  paymentStatus: PaymentStatus.optional(),
  paymentMethod: PaymentMethod.optional(),
  userId: z.string().optional(),
  sellerId: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  minTotal: z.number().optional(),
  maxTotal: z.number().optional(),
  search: z.string().optional(), // Search by order number, customer name, etc.
  
  // Pagination
  page: z.number().int().positive().optional(),
  limit: z.number().int().positive().max(100).optional(),
  sortBy: z.enum(['createdAt', 'total', 'status']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});

/**
 * Schema for updating payment status
 */
export const updatePaymentStatusSchema = z.object({
  paymentStatus: PaymentStatus,
  transactionId: z.string().optional(),
  notes: z.string().max(500).optional(),
});

// ============================================================================
// Type Exports
// ============================================================================

export type OrderItem = z.infer<typeof orderItemSchema>;
export type ShippingAddress = z.infer<typeof shippingAddressSchema>;
export type PaymentDetails = z.infer<typeof paymentDetailsSchema>;
export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;
export type CancelOrderInput = z.infer<typeof cancelOrderSchema>;
export type TrackOrderInput = z.infer<typeof trackOrderSchema>;
export type OrderFilters = z.infer<typeof orderFiltersSchema>;
export type UpdatePaymentStatusInput = z.infer<typeof updatePaymentStatusSchema>;

// ============================================================================
// Validation Helper Functions
// ============================================================================

/**
 * Validate order creation data
 */
export function validateCreateOrder(data: unknown) {
  return createOrderSchema.parse(data);
}

/**
 * Validate order status update
 */
export function validateUpdateOrderStatus(data: unknown) {
  return updateOrderStatusSchema.parse(data);
}

/**
 * Validate order cancellation
 */
export function validateCancelOrder(data: unknown) {
  return cancelOrderSchema.parse(data);
}

/**
 * Validate order tracking request
 */
export function validateTrackOrder(data: unknown) {
  return trackOrderSchema.parse(data);
}

/**
 * Validate order filters
 */
export function validateOrderFilters(data: unknown) {
  return orderFiltersSchema.parse(data);
}
