/**
 * Contact Validator
 * Zod schemas for contact form validation
 */

import { z } from 'zod';

/**
 * Contact form schemas
 */
export const contactFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Invalid email address'),
  subject: z.string().min(3, 'Subject must be at least 3 characters').max(200),
  message: z.string().min(10, 'Message must be at least 10 characters').max(5000),
  phone: z.string().optional(),
  category: z.enum(['general', 'order', 'product', 'auction', 'partnership', 'feedback']).optional(),
  orderNumber: z.string().optional(),
});

export const contactListFiltersSchema = z.object({
  status: z.enum(['pending', 'responded', 'closed']).optional(),
  category: z.string().optional(),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
  sortBy: z.enum(['createdAt', 'status']).default('createdAt'),
  order: z.enum(['asc', 'desc']).default('desc'),
});

/**
 * Search validator
 */
export const searchQuerySchema = z.object({
  query: z.string().min(1, 'Search query is required').max(200),
  type: z.enum(['all', 'products', 'categories', 'sellers']).default('all'),
  limit: z.number().min(1).max(50).default(20),
  page: z.number().min(1).default(1),
});

/**
 * Payment validators
 */
export const createRazorpayOrderSchema = z.object({
  amount: z.number().min(1, 'Amount must be greater than 0'),
  currency: z.string().default('INR'),
  receipt: z.string().optional(),
});

export const verifyRazorpayPaymentSchema = z.object({
  razorpay_order_id: z.string(),
  razorpay_payment_id: z.string(),
  razorpay_signature: z.string(),
});

export const createPayPalOrderSchema = z.object({
  amount: z.number().min(1),
  currency: z.string().default('USD'),
  orderId: z.string().optional(),
});

export const capturePayPalPaymentSchema = z.object({
  orderId: z.string(),
});

/**
 * Consent validator
 */
export const consentSchema = z.object({
  consentGiven: z.boolean(),
  analyticsStorage: z.enum(['granted', 'denied']),
  marketingStorage: z.enum(['granted', 'denied']).optional(),
  preferences: z.object({
    necessary: z.boolean().default(true),
    analytics: z.boolean().default(false),
    marketing: z.boolean().default(false),
  }).optional(),
  consentDate: z.string().optional(),
});

/**
 * Hero banner preferences
 */
export const heroBannerPreferencesSchema = z.object({
  lastViewedSlide: z.number().min(0).default(0),
  dismissedBanners: z.array(z.string()).default([]),
  viewCount: z.number().min(0).default(0),
});

// Type exports
export type ContactFormInput = z.infer<typeof contactFormSchema>;
export type ContactListFilters = z.infer<typeof contactListFiltersSchema>;
export type SearchQuery = z.infer<typeof searchQuerySchema>;
export type CreateRazorpayOrderInput = z.infer<typeof createRazorpayOrderSchema>;
export type VerifyRazorpayPaymentInput = z.infer<typeof verifyRazorpayPaymentSchema>;
export type CreatePayPalOrderInput = z.infer<typeof createPayPalOrderSchema>;
export type CapturePayPalPaymentInput = z.infer<typeof capturePayPalPaymentSchema>;
export type ConsentInput = z.infer<typeof consentSchema>;
export type HeroBannerPreferences = z.infer<typeof heroBannerPreferencesSchema>;
