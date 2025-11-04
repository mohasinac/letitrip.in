/**
 * System Validator
 * Zod schemas for system-level operations
 */

import { z } from 'zod';

/**
 * Cookie consent schema
 */
export const cookieConsentSchema = z.object({
  necessary: z.boolean().default(true),
  analytics: z.boolean().default(false),
  marketing: z.boolean().default(false),
  preferences: z.boolean().default(false),
  timestamp: z.string().datetime().optional(),
});

/**
 * Hero banner preference schema
 */
export const heroBannerPreferenceSchema = z.object({
  dismissed: z.boolean(),
  bannerId: z.string().optional(),
  expiresAt: z.string().datetime().optional(),
});

/**
 * Error logging schema
 */
export const errorLogSchema = z.object({
  message: z.string().min(1, 'Error message is required'),
  stack: z.string().optional(),
  componentStack: z.string().optional(),
  url: z.string().url().optional(),
  userAgent: z.string().optional(),
  severity: z.enum(['low', 'medium', 'high', 'critical']).default('medium'),
  metadata: z.record(z.any()).optional(),
});

/**
 * Search query schema
 */
export const searchQuerySchema = z.object({
  query: z.string()
    .min(1, 'Search query is required')
    .max(200, 'Query too long'),
  
  type: z.enum(['all', 'products', 'categories', 'content'])
    .default('all'),
  
  limit: z.number()
    .int()
    .positive()
    .max(50)
    .default(10),
  
  offset: z.number()
    .int()
    .nonnegative()
    .default(0),
});

// Type exports
export type CookieConsentInput = z.infer<typeof cookieConsentSchema>;
export type HeroBannerPreferenceInput = z.infer<typeof heroBannerPreferenceSchema>;
export type ErrorLogInput = z.infer<typeof errorLogSchema>;
export type SearchQueryInput = z.infer<typeof searchQuerySchema>;
