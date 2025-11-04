/**
 * Review Controller
 * 
 * Business logic layer for review operations with RBAC
 * 
 * Role-Based Access Control:
 * - Public: View approved reviews
 * - User: Create review (if purchased), view own reviews, update/delete own
 * - Seller: View reviews for their products
 * - Admin: Full moderation, view all reviews
 * 
 * Features:
 * - Purchase verification for reviews
 * - Review moderation workflow
 * - Average rating calculation
 * - Helpful count tracking
 */

import { reviewModel, ReviewWithVersion } from '../models/review.model';
import {
  AuthorizationError,
  ValidationError,
  NotFoundError,
} from '../middleware/error-handler';

// ============================================================================
// Types
// ============================================================================

/**
 * User context for RBAC
 */
export interface UserContext {
  userId: string;
  role: 'admin' | 'seller' | 'user';
  email?: string;
}

/**
 * Review filters
 */
export interface ReviewFilters {
  productId?: string;
  userId?: string;
  status?: 'pending' | 'approved' | 'rejected';
  rating?: number;
  minRating?: number;
  maxRating?: number;
  verified?: boolean;
  page?: number;
  limit?: number;
  sortBy?: 'createdAt' | 'rating' | 'helpful';
  sortOrder?: 'asc' | 'desc';
}

/**
 * Create review input
 */
export interface CreateReviewInput {
  productId: string;
  rating: number;
  title: string;
  comment: string;
  images?: string[];
  orderId?: string; // For verification
}

/**
 * Update review input
 */
export interface UpdateReviewInput {
  rating?: number;
  title?: string;
  comment?: string;
  images?: string[];
}

// ============================================================================
// Controller Functions
// ============================================================================

/**
 * Create a new review
 * User only, must have purchased the product
 */
export async function createReview(
  data: CreateReviewInput,
  userContext: UserContext
): Promise<ReviewWithVersion> {
  // Only authenticated users can create reviews
  if (!userContext || userContext.role === 'admin') {
    throw new AuthorizationError('Only customers can create reviews');
  }
  
  // Validate rating
  if (data.rating < 1 || data.rating > 5) {
    throw new ValidationError('Rating must be between 1 and 5');
  }
  
  // Validate title
  if (!data.title || data.title.length < 5 || data.title.length > 100) {
    throw new ValidationError('Title must be between 5 and 100 characters');
  }
  
  // Validate comment
  if (!data.comment || data.comment.length < 20 || data.comment.length > 1000) {
    throw new ValidationError('Comment must be between 20 and 1000 characters');
  }
  
  // Validate images
  if (data.images && data.images.length > 5) {
    throw new ValidationError('Maximum 5 images allowed');
  }
  
  // Check if user can review (purchased the product)
  const canReview = await reviewModel.canUserReview(userContext.userId, data.productId);
  
  return await reviewModel.create({
    ...data,
    userId: userContext.userId,
    userName: userContext.email?.split('@')[0] || 'Anonymous',
    verified: canReview, // Mark as verified if purchased
  });
}

/**
 * Get reviews for a product
 * Public access (only approved reviews for non-admins)
 */
export async function getProductReviews(
  productId: string,
  filters: ReviewFilters = {},
  userContext?: UserContext
): Promise<ReviewWithVersion[]> {
  // Non-admins can only see approved reviews
  if (!userContext || userContext.role !== 'admin') {
    filters.status = 'approved';
  }
  
  return await reviewModel.findByProduct(productId, filters);
}

/**
 * Get user's own reviews
 * User only (own reviews)
 */
export async function getUserReviews(
  userContext: UserContext,
  filters: ReviewFilters = {}
): Promise<ReviewWithVersion[]> {
  // Filter out 'helpful' from sortBy for findByUser
  const userFilters: any = { ...filters };
  if (userFilters.sortBy === 'helpful') {
    userFilters.sortBy = 'createdAt';
  }
  return await reviewModel.findByUser(userContext.userId, userFilters);
}

/**
 * Get all reviews with filters
 * Admin only
 */
export async function getAllReviews(
  filters: ReviewFilters = {},
  userContext: UserContext
): Promise<ReviewWithVersion[]> {
  // Authorization check
  if (userContext.role !== 'admin') {
    throw new AuthorizationError('Only admins can view all reviews');
  }
  
  return await reviewModel.findAll(filters);
}

/**
 * Get review by ID
 * Public for approved, owner/admin for others
 */
export async function getReviewById(
  id: string,
  userContext?: UserContext
): Promise<ReviewWithVersion> {
  const review = await reviewModel.findById(id);
  
  if (!review) {
    throw new NotFoundError('Review not found');
  }
  
  // Check access
  if (review.status !== 'approved') {
    if (!userContext) {
      throw new NotFoundError('Review not found');
    }
    
    // Only owner or admin can view non-approved reviews
    if (userContext.userId !== review.userId && userContext.role !== 'admin') {
      throw new AuthorizationError('You do not have permission to view this review');
    }
  }
  
  return review;
}

/**
 * Update review
 * User only (own reviews), before approval
 */
export async function updateReview(
  id: string,
  data: UpdateReviewInput,
  userContext: UserContext
): Promise<ReviewWithVersion> {
  // Get existing review
  const review = await reviewModel.findById(id);
  
  if (!review) {
    throw new NotFoundError('Review not found');
  }
  
  // Authorization check
  if (userContext.userId !== review.userId) {
    throw new AuthorizationError('You can only update your own reviews');
  }
  
  // Can't update approved/rejected reviews
  if (review.status !== 'pending') {
    throw new ValidationError('Cannot update reviews that have been moderated');
  }
  
  // Validate if provided
  if (data.rating && (data.rating < 1 || data.rating > 5)) {
    throw new ValidationError('Rating must be between 1 and 5');
  }
  
  if (data.title && (data.title.length < 5 || data.title.length > 100)) {
    throw new ValidationError('Title must be between 5 and 100 characters');
  }
  
  if (data.comment && (data.comment.length < 20 || data.comment.length > 1000)) {
    throw new ValidationError('Comment must be between 20 and 1000 characters');
  }
  
  if (data.images && data.images.length > 5) {
    throw new ValidationError('Maximum 5 images allowed');
  }
  
  return await reviewModel.update(id, data, userContext.userId);
}

/**
 * Delete review
 * User can delete own, Admin can delete any
 */
export async function deleteReview(
  id: string,
  userContext: UserContext
): Promise<void> {
  // Get existing review
  const review = await reviewModel.findById(id);
  
  if (!review) {
    throw new NotFoundError('Review not found');
  }
  
  // Authorization check
  if (userContext.userId !== review.userId && userContext.role !== 'admin') {
    throw new AuthorizationError('You can only delete your own reviews');
  }
  
  await reviewModel.delete(id);
}

/**
 * Approve review
 * Admin only
 */
export async function approveReview(
  id: string,
  userContext: UserContext
): Promise<ReviewWithVersion> {
  // Authorization check
  if (userContext.role !== 'admin') {
    throw new AuthorizationError('Only admins can approve reviews');
  }
  
  return await reviewModel.updateStatus(id, 'approved', userContext.userId);
}

/**
 * Reject review
 * Admin only
 */
export async function rejectReview(
  id: string,
  reason: string,
  userContext: UserContext
): Promise<ReviewWithVersion> {
  // Authorization check
  if (userContext.role !== 'admin') {
    throw new AuthorizationError('Only admins can reject reviews');
  }
  
  if (!reason || reason.length < 10) {
    throw new ValidationError('Rejection reason must be at least 10 characters');
  }
  
  return await reviewModel.updateStatus(id, 'rejected', userContext.userId);
}

/**
 * Mark review as helpful
 * Public access
 */
export async function markReviewHelpful(id: string): Promise<void> {
  const review = await reviewModel.findById(id);
  
  if (!review) {
    throw new NotFoundError('Review not found');
  }
  
  if (review.status !== 'approved') {
    throw new ValidationError('Can only mark approved reviews as helpful');
  }
  
  await reviewModel.incrementHelpful(id);
}

/**
 * Get average rating for a product
 * Public access
 */
export async function getProductRating(productId: string): Promise<{
  average: number;
  count: number;
  distribution: Record<number, number>;
}> {
  return await reviewModel.getAverageRating(productId);
}

/**
 * Get pending reviews count
 * Admin only
 */
export async function getPendingReviewsCount(
  userContext: UserContext
): Promise<number> {
  // Authorization check
  if (userContext.role !== 'admin') {
    throw new AuthorizationError('Only admins can view pending reviews count');
  }
  
  return await reviewModel.getPendingCount();
}

/**
 * Bulk approve reviews
 * Admin only
 */
export async function bulkApproveReviews(
  reviewIds: string[],
  userContext: UserContext
): Promise<{ success: number; failed: number; errors: string[] }> {
  // Authorization check
  if (userContext.role !== 'admin') {
    throw new AuthorizationError('Only admins can bulk approve reviews');
  }
  
  if (!reviewIds || reviewIds.length === 0) {
    throw new ValidationError('At least one review ID is required');
  }
  
  const errors: string[] = [];
  let successCount = 0;
  let failedCount = 0;
  
  for (const reviewId of reviewIds) {
    try {
      await reviewModel.updateStatus(reviewId, 'approved', userContext.userId);
      successCount++;
    } catch (error: any) {
      errors.push(`Failed to approve ${reviewId}: ${error.message}`);
      failedCount++;
    }
  }
  
  return { success: successCount, failed: failedCount, errors };
}

/**
 * Bulk reject reviews
 * Admin only
 */
export async function bulkRejectReviews(
  reviewIds: string[],
  reason: string,
  userContext: UserContext
): Promise<{ success: number; failed: number; errors: string[] }> {
  // Authorization check
  if (userContext.role !== 'admin') {
    throw new AuthorizationError('Only admins can bulk reject reviews');
  }
  
  if (!reviewIds || reviewIds.length === 0) {
    throw new ValidationError('At least one review ID is required');
  }
  
  if (!reason || reason.length < 10) {
    throw new ValidationError('Rejection reason must be at least 10 characters');
  }
  
  const errors: string[] = [];
  let successCount = 0;
  let failedCount = 0;
  
  for (const reviewId of reviewIds) {
    try {
      await reviewModel.updateStatus(reviewId, 'rejected', userContext.userId);
      successCount++;
    } catch (error: any) {
      errors.push(`Failed to reject ${reviewId}: ${error.message}`);
      failedCount++;
    }
  }
  
  return { success: successCount, failed: failedCount, errors };
}

/**
 * Check if user can review product
 * User only
 */
export async function canUserReviewProduct(
  productId: string,
  userContext: UserContext
): Promise<boolean> {
  return await reviewModel.canUserReview(userContext.userId, productId);
}

/**
 * Count reviews
 * Admin only
 */
export async function countReviews(
  filters: ReviewFilters = {},
  userContext: UserContext
): Promise<number> {
  // Authorization check
  if (userContext.role !== 'admin') {
    throw new AuthorizationError('Only admins can count reviews');
  }
  
  return await reviewModel.count(filters);
}
