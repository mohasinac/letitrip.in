/**
 * Review Model
 * 
 * Database layer for review operations with transaction safety and concurrency control
 * 
 * Features:
 * - Transaction-safe create/update operations
 * - Optimistic locking using version field
 * - Review moderation (pending, approved, rejected)
 * - Average rating calculation
 * - Purchase verification
 * - Helpful count tracking
 */

import { getAdminDb } from '../database/admin';
import { Review } from "@/types/shared";
import { ConflictError, NotFoundError, ValidationError } from '../middleware/error-handler';

// Extend Review with version for concurrency control
export interface ReviewWithVersion extends Review {
  version: number;
}

export class ReviewModel {
  private collection: FirebaseFirestore.CollectionReference;

  constructor() {
    const db = getAdminDb();
    this.collection = db.collection('reviews');
  }

  /**
   * Create a new review
   */
  async create(data: Partial<ReviewWithVersion> & { userId: string; productId: string }): Promise<ReviewWithVersion> {
    const db = getAdminDb();
    
    try {
      const review = await db.runTransaction(async (transaction) => {
        // Check if user already reviewed this product
        const existingSnapshot = await transaction.get(
          db.collection('reviews')
            .where('userId', '==', data.userId)
            .where('productId', '==', data.productId)
            .limit(1)
        );
        
        if (!existingSnapshot.empty) {
          throw new ConflictError('You have already reviewed this product');
        }
        
        // Create review document
        const reviewRef = this.collection.doc();
        const now = new Date().toISOString();
        
        const reviewData: ReviewWithVersion = {
          id: reviewRef.id,
          productId: data.productId,
          userId: data.userId,
          userName: data.userName || 'Anonymous',
          userAvatar: data.userAvatar,
          rating: data.rating || 0,
          title: data.title || '',
          comment: data.comment || '',
          images: data.images || [],
          verified: data.verified ?? false,
          helpful: 0,
          status: 'pending', // All reviews start as pending
          createdAt: now,
          updatedAt: now,
          version: 1,
        };
        
        transaction.set(reviewRef, reviewData);
        
        return reviewData;
      });
      
      return review;
    } catch (error: any) {
      if (error instanceof ConflictError || error instanceof ValidationError) {
        throw error;
      }
      throw new Error(`Failed to create review: ${error.message}`);
    }
  }

  /**
   * Find review by ID
   */
  async findById(id: string): Promise<ReviewWithVersion | null> {
    const doc = await this.collection.doc(id).get();
    
    if (!doc.exists) {
      return null;
    }
    
    return doc.data() as ReviewWithVersion;
  }

  /**
   * Find all reviews for a product
   */
  async findByProduct(productId: string, filters: {
    status?: 'pending' | 'approved' | 'rejected';
    rating?: number;
    minRating?: number;
    maxRating?: number;
    verified?: boolean;
    page?: number;
    limit?: number;
    sortBy?: 'createdAt' | 'rating' | 'helpful';
    sortOrder?: 'asc' | 'desc';
  } = {}): Promise<ReviewWithVersion[]> {
    let query: FirebaseFirestore.Query = this.collection
      .where('productId', '==', productId);
    
    // Apply filters
    if (filters.status) {
      query = query.where('status', '==', filters.status);
    }
    
    if (filters.rating) {
      query = query.where('rating', '==', filters.rating);
    }
    
    if (filters.verified !== undefined) {
      query = query.where('verified', '==', filters.verified);
    }
    
    // Sorting
    const sortBy = filters.sortBy || 'createdAt';
    const sortOrder = filters.sortOrder || 'desc';
    query = query.orderBy(sortBy, sortOrder);
    
    // Pagination
    if (filters.limit) {
      const offset = filters.page ? (filters.page - 1) * filters.limit : 0;
      query = query.offset(offset).limit(filters.limit);
    }
    
    const snapshot = await query.get();
    let reviews = snapshot.docs.map(doc => doc.data() as ReviewWithVersion);
    
    // Client-side filters (Firestore limitations)
    if (filters.minRating) {
      reviews = reviews.filter(r => r.rating >= filters.minRating!);
    }
    
    if (filters.maxRating) {
      reviews = reviews.filter(r => r.rating <= filters.maxRating!);
    }
    
    return reviews;
  }

  /**
   * Find all reviews by a user
   */
  async findByUser(userId: string, filters: {
    status?: 'pending' | 'approved' | 'rejected';
    page?: number;
    limit?: number;
    sortBy?: 'createdAt' | 'rating';
    sortOrder?: 'asc' | 'desc';
  } = {}): Promise<ReviewWithVersion[]> {
    let query: FirebaseFirestore.Query = this.collection
      .where('userId', '==', userId);
    
    if (filters.status) {
      query = query.where('status', '==', filters.status);
    }
    
    // Sorting
    const sortBy = filters.sortBy || 'createdAt';
    const sortOrder = filters.sortOrder || 'desc';
    query = query.orderBy(sortBy, sortOrder);
    
    // Pagination
    if (filters.limit) {
      const offset = filters.page ? (filters.page - 1) * filters.limit : 0;
      query = query.offset(offset).limit(filters.limit);
    }
    
    const snapshot = await query.get();
    return snapshot.docs.map(doc => doc.data() as ReviewWithVersion);
  }

  /**
   * Find all reviews with filters (admin)
   */
  async findAll(filters: {
    productId?: string;
    userId?: string;
    status?: 'pending' | 'approved' | 'rejected';
    rating?: number;
    verified?: boolean;
    page?: number;
    limit?: number;
    sortBy?: 'createdAt' | 'rating' | 'helpful';
    sortOrder?: 'asc' | 'desc';
  } = {}): Promise<ReviewWithVersion[]> {
    let query: FirebaseFirestore.Query = this.collection;
    
    // Apply filters
    if (filters.productId) {
      query = query.where('productId', '==', filters.productId);
    }
    
    if (filters.userId) {
      query = query.where('userId', '==', filters.userId);
    }
    
    if (filters.status) {
      query = query.where('status', '==', filters.status);
    }
    
    if (filters.rating) {
      query = query.where('rating', '==', filters.rating);
    }
    
    if (filters.verified !== undefined) {
      query = query.where('verified', '==', filters.verified);
    }
    
    // Sorting
    const sortBy = filters.sortBy || 'createdAt';
    const sortOrder = filters.sortOrder || 'desc';
    query = query.orderBy(sortBy, sortOrder);
    
    // Pagination
    if (filters.limit) {
      const offset = filters.page ? (filters.page - 1) * filters.limit : 0;
      query = query.offset(offset).limit(filters.limit);
    }
    
    const snapshot = await query.get();
    return snapshot.docs.map(doc => doc.data() as ReviewWithVersion);
  }

  /**
   * Update review
   */
  async update(id: string, data: Partial<ReviewWithVersion>, userId: string): Promise<ReviewWithVersion> {
    const db = getAdminDb();
    
    try {
      const review = await db.runTransaction(async (transaction) => {
        const reviewRef = this.collection.doc(id);
        const reviewDoc = await transaction.get(reviewRef);
        
        if (!reviewDoc.exists) {
          throw new NotFoundError('Review not found');
        }
        
        const existingReview = reviewDoc.data() as ReviewWithVersion;
        
        // Optimistic locking check
        if (data.version && data.version !== existingReview.version) {
          throw new ConflictError('Review has been modified by another user');
        }
        
        const updatedData: any = {
          ...existingReview,
          ...data,
          id,
          updatedAt: new Date().toISOString(),
          version: existingReview.version + 1,
        };
        
        transaction.update(reviewRef, updatedData);
        
        return updatedData as ReviewWithVersion;
      });
      
      return review;
    } catch (error: any) {
      if (error instanceof NotFoundError || error instanceof ConflictError) {
        throw error;
      }
      throw new Error(`Failed to update review: ${error.message}`);
    }
  }

  /**
   * Update review status (approve/reject)
   */
  async updateStatus(
    id: string,
    status: 'approved' | 'rejected',
    adminId: string
  ): Promise<ReviewWithVersion> {
    return await this.update(id, { status }, adminId);
  }

  /**
   * Delete review
   */
  async delete(id: string): Promise<void> {
    const review = await this.findById(id);
    if (!review) {
      throw new NotFoundError('Review not found');
    }
    
    await this.collection.doc(id).delete();
  }

  /**
   * Increment helpful count
   */
  async incrementHelpful(id: string): Promise<void> {
    const db = getAdminDb();
    const reviewRef = this.collection.doc(id);
    
    await db.runTransaction(async (transaction) => {
      const reviewDoc = await transaction.get(reviewRef);
      
      if (!reviewDoc.exists) {
        throw new NotFoundError('Review not found');
      }
      
      const review = reviewDoc.data() as ReviewWithVersion;
      
      transaction.update(reviewRef, {
        helpful: review.helpful + 1,
        updatedAt: new Date().toISOString(),
      });
    });
  }

  /**
   * Get average rating for a product
   */
  async getAverageRating(productId: string): Promise<{
    average: number;
    count: number;
    distribution: Record<number, number>;
  }> {
    const reviews = await this.findByProduct(productId, { status: 'approved' });
    
    if (reviews.length === 0) {
      return {
        average: 0,
        count: 0,
        distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      };
    }
    
    // Calculate average
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    const average = sum / reviews.length;
    
    // Calculate distribution
    const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    reviews.forEach(review => {
      distribution[review.rating] = (distribution[review.rating] || 0) + 1;
    });
    
    return {
      average: Math.round(average * 10) / 10, // Round to 1 decimal
      count: reviews.length,
      distribution,
    };
  }

  /**
   * Count reviews
   */
  async count(filters: {
    productId?: string;
    userId?: string;
    status?: 'pending' | 'approved' | 'rejected';
  } = {}): Promise<number> {
    const reviews = await this.findAll(filters);
    return reviews.length;
  }

  /**
   * Check if user can review product (purchased it)
   */
  async canUserReview(userId: string, productId: string): Promise<boolean> {
    const db = getAdminDb();
    
    // Check if user has purchased this product
    const orderSnapshot = await db.collection('orders')
      .where('userId', '==', userId)
      .where('status', 'in', ['delivered', 'completed'])
      .get();
    
    for (const orderDoc of orderSnapshot.docs) {
      const order = orderDoc.data();
      const hasPurchased = order.items?.some((item: any) => item.productId === productId);
      if (hasPurchased) {
        return true;
      }
    }
    
    return false;
  }

  /**
   * Get pending reviews count
   */
  async getPendingCount(): Promise<number> {
    return await this.count({ status: 'pending' });
  }
}

// Export singleton instance
export const reviewModel = new ReviewModel();
