/**
 * Review Validation Schemas
 * 
 * Zod schemas for validating review-related data
 */

import { z } from 'zod';

// ============================================================================
// Enums
// ============================================================================

export const ReviewStatus = z.enum(['pending', 'approved', 'rejected']);

// ============================================================================
// Main Schemas
// ============================================================================

/**
 * Schema for creating a new review
 */
export const createReviewSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  rating: z.number()
    .int('Rating must be a whole number')
    .min(1, 'Rating must be at least 1')
    .max(5, 'Rating must be at most 5'),
  title: z.string()
    .min(5, 'Review title must be at least 5 characters')
    .max(100, 'Review title must be less than 100 characters'),
  comment: z.string()
    .min(20, 'Review comment must be at least 20 characters')
    .max(1000, 'Review comment must be less than 1000 characters'),
  images: z.array(z.string().url()).max(5, 'Maximum 5 images allowed').optional(),
  
  // Optional detailed ratings
  qualityRating: z.number().int().min(1).max(5).optional(),
  valueRating: z.number().int().min(1).max(5).optional(),
  deliveryRating: z.number().int().min(1).max(5).optional(),
  
  // Purchase verification
  orderId: z.string().optional(),
  verified: z.boolean().optional(),
});

/**
 * Schema for updating a review
 */
export const updateReviewSchema = z.object({
  rating: z.number()
    .int('Rating must be a whole number')
    .min(1, 'Rating must be at least 1')
    .max(5, 'Rating must be at most 5')
    .optional(),
  title: z.string()
    .min(5, 'Review title must be at least 5 characters')
    .max(100, 'Review title must be less than 100 characters')
    .optional(),
  comment: z.string()
    .min(20, 'Review comment must be at least 20 characters')
    .max(1000, 'Review comment must be less than 1000 characters')
    .optional(),
  images: z.array(z.string().url()).max(5, 'Maximum 5 images allowed').optional(),
  
  // Optional detailed ratings
  qualityRating: z.number().int().min(1).max(5).optional(),
  valueRating: z.number().int().min(1).max(5).optional(),
  deliveryRating: z.number().int().min(1).max(5).optional(),
});

/**
 * Schema for review filters
 */
export const reviewFiltersSchema = z.object({
  productId: z.string().optional(),
  userId: z.string().optional(),
  status: ReviewStatus.optional(),
  rating: z.number().int().min(1).max(5).optional(),
  minRating: z.number().int().min(1).max(5).optional(),
  maxRating: z.number().int().min(1).max(5).optional(),
  verified: z.boolean().optional(),
  hasImages: z.boolean().optional(),
  search: z.string().optional(), // Search in title and comment
  
  // Pagination
  page: z.number().int().positive().optional(),
  limit: z.number().int().positive().max(100).optional(),
  sortBy: z.enum(['createdAt', 'rating', 'helpful']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});

/**
 * Schema for approving a review (admin)
 */
export const approveReviewSchema = z.object({
  featured: z.boolean().optional(), // Mark as featured review
  notes: z.string().max(500).optional(),
});

/**
 * Schema for rejecting a review (admin)
 */
export const rejectReviewSchema = z.object({
  reason: z.string()
    .min(10, 'Rejection reason must be at least 10 characters')
    .max(500, 'Rejection reason must be less than 500 characters'),
});

/**
 * Schema for reporting a review
 */
export const reportReviewSchema = z.object({
  reviewId: z.string().min(1, 'Review ID is required'),
  reason: z.enum([
    'spam',
    'inappropriate',
    'offensive',
    'fake',
    'misleading',
    'other',
  ]),
  description: z.string()
    .min(20, 'Report description must be at least 20 characters')
    .max(500, 'Report description must be less than 500 characters'),
});

/**
 * Schema for marking review as helpful
 */
export const markHelpfulSchema = z.object({
  helpful: z.boolean(), // true for helpful, false for not helpful
});

/**
 * Schema for replying to a review (seller/admin)
 */
export const replyToReviewSchema = z.object({
  comment: z.string()
    .min(10, 'Reply must be at least 10 characters')
    .max(500, 'Reply must be less than 500 characters'),
});

// ============================================================================
// Type Exports
// ============================================================================

export type CreateReviewInput = z.infer<typeof createReviewSchema>;
export type UpdateReviewInput = z.infer<typeof updateReviewSchema>;
export type ReviewFilters = z.infer<typeof reviewFiltersSchema>;
export type ApproveReviewInput = z.infer<typeof approveReviewSchema>;
export type RejectReviewInput = z.infer<typeof rejectReviewSchema>;
export type ReportReviewInput = z.infer<typeof reportReviewSchema>;
export type MarkHelpfulInput = z.infer<typeof markHelpfulSchema>;
export type ReplyToReviewInput = z.infer<typeof replyToReviewSchema>;

// ============================================================================
// Validation Helper Functions
// ============================================================================

/**
 * Validate review creation data
 */
export function validateCreateReview(data: unknown) {
  return createReviewSchema.parse(data);
}

/**
 * Validate review update data
 */
export function validateUpdateReview(data: unknown) {
  return updateReviewSchema.parse(data);
}

/**
 * Validate review filters
 */
export function validateReviewFilters(data: unknown) {
  return reviewFiltersSchema.parse(data);
}

/**
 * Validate review approval
 */
export function validateApproveReview(data: unknown) {
  return approveReviewSchema.parse(data);
}

/**
 * Validate review rejection
 */
export function validateRejectReview(data: unknown) {
  return rejectReviewSchema.parse(data);
}

/**
 * Validate review report
 */
export function validateReportReview(data: unknown) {
  return reportReviewSchema.parse(data);
}
