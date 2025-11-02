/**
 * Payment Validator
 * Zod schemas for payment validation
 */

import { z } from 'zod';

/**
 * Razorpay order creation schema
 */
export const razorpayCreateOrderSchema = z.object({
  amount: z.number()
    .positive('Amount must be positive')
    .max(10000000, 'Amount too large'), // 1 crore max
  
  currency: z.string()
    .length(3, 'Currency must be 3 characters')
    .default('INR'),
  
  orderId: z.string()
    .min(1, 'Order ID is required'),
  
  customerId: z.string().optional(),
  
  notes: z.record(z.string()).optional(),
});

/**
 * Razorpay payment verification schema
 */
export const razorpayVerifySchema = z.object({
  razorpay_order_id: z.string().min(1, 'Order ID is required'),
  razorpay_payment_id: z.string().min(1, 'Payment ID is required'),
  razorpay_signature: z.string().min(1, 'Signature is required'),
  orderId: z.string().min(1, 'Internal order ID is required'),
});

/**
 * PayPal order creation schema
 */
export const paypalCreateOrderSchema = z.object({
  amount: z.number()
    .positive('Amount must be positive')
    .max(10000000, 'Amount too large'),
  
  currency: z.string()
    .length(3, 'Currency must be 3 characters')
    .default('USD'),
  
  orderId: z.string()
    .min(1, 'Order ID is required'),
  
  customerId: z.string().optional(),
  
  description: z.string().optional(),
});

/**
 * PayPal capture payment schema
 */
export const paypalCaptureSchema = z.object({
  paypalOrderId: z.string().min(1, 'PayPal order ID is required'),
  orderId: z.string().min(1, 'Internal order ID is required'),
});

// Type exports
export type RazorpayCreateOrderInput = z.infer<typeof razorpayCreateOrderSchema>;
export type RazorpayVerifyInput = z.infer<typeof razorpayVerifySchema>;
export type PaypalCreateOrderInput = z.infer<typeof paypalCreateOrderSchema>;
export type PaypalCaptureInput = z.infer<typeof paypalCaptureSchema>;
