/**
 * User Model
 * 
 * Database layer for user operations with transaction safety and concurrency control
 * 
 * Features:
 * - Transaction-safe create/update operations
 * - Optimistic locking using version field
 * - Email uniqueness validation
 * - Role management
 * - Account status management (active, banned, suspended)
 * - Search and filtering
 */

import { getAdminDb, getAdminAuth } from '../database/admin';
import { User } from "@/types/shared";
import { ConflictError, NotFoundError, InternalServerError } from '../middleware/error-handler';

// Extend User with version for concurrency control
export interface UserWithVersion extends User {
  version: number;
  status?: 'active' | 'inactive' | 'suspended' | 'banned';
  emailVerified?: boolean;
  phoneVerified?: boolean;
  preferences?: {
    newsletter?: boolean;
    smsNotifications?: boolean;
    orderUpdates?: boolean;
    language?: string;
    timezone?: string;
  };
  metadata?: {
    lastLoginAt?: string;
    lastLoginIp?: string;
    loginCount?: number;
    bannedAt?: string;
    bannedBy?: string;
    banReason?: string;
    suspendedAt?: string;
    suspendedUntil?: string;
    suspensionReason?: string;
  };
}

export class UserModel {
  private collection: FirebaseFirestore.CollectionReference;

  constructor() {
    const db = getAdminDb();
    this.collection = db.collection('users');
  }

  /**
   * Create a new user with transaction safety
   * Validates email uniqueness within a transaction
   */
  async create(data: Partial<UserWithVersion> & { email: string }): Promise<UserWithVersion> {
    const db = getAdminDb();
    
    try {
      // Run in transaction to ensure email uniqueness
      const user = await db.runTransaction(async (transaction) => {
        // Check if email already exists
        const existingQuery = await transaction.get(
          this.collection.where('email', '==', data.email.toLowerCase()).limit(1)
        );

        if (!existingQuery.empty) {
          throw new ConflictError(`User with email "${data.email}" already exists`);
        }

        // Create user data
        const now = new Date().toISOString();
        const userData: Omit<UserWithVersion, 'id'> = {
          // Required fields
          email: data.email.toLowerCase(),
          name: data.name || '',
          role: data.role || 'user',
          
          // Optional fields
          phone: data.phone,
          avatar: data.avatar,
          addresses: data.addresses || [],
          preferredCurrency: data.preferredCurrency || 'INR',
          isOver18: data.isOver18,
          
          // Status fields
          status: 'active',
          emailVerified: false,
          phoneVerified: false,
          
          // Preferences
          preferences: {
            newsletter: true,
            smsNotifications: true,
            orderUpdates: true,
            language: 'en',
            timezone: 'Asia/Kolkata',
            ...data.preferences,
          },
          
          // Metadata
          metadata: {
            loginCount: 0,
          },
          
          // Timestamps
          createdAt: now,
          updatedAt: now,
          
          // Concurrency control
          version: 1,
        };

        // If user ID is provided (from Firebase Auth), use it
        let docRef: FirebaseFirestore.DocumentReference;
        if (data.id) {
          docRef = this.collection.doc(data.id);
        } else {
          docRef = this.collection.doc();
        }
        
        transaction.create(docRef, userData);

        return { id: docRef.id, ...userData };
      });

      return user;
    } catch (error) {
      if (error instanceof ConflictError) {
        throw error;
      }
      console.error('[UserModel] Create error:', error);
      throw new InternalServerError('Failed to create user');
    }
  }

  /**
   * Find user by ID
   */
  async findById(id: string): Promise<UserWithVersion | null> {
    try {
      const doc = await this.collection.doc(id).get();
      
      if (!doc.exists) {
        return null;
      }

      return {
        id: doc.id,
        ...doc.data(),
      } as UserWithVersion;
    } catch (error) {
      console.error('[UserModel] FindById error:', error);
      throw new InternalServerError('Failed to fetch user');
    }
  }

  /**
   * Find user by email
   */
  async findByEmail(email: string): Promise<UserWithVersion | null> {
    try {
      const snapshot = await this.collection
        .where('email', '==', email.toLowerCase())
        .limit(1)
        .get();

      if (snapshot.empty) {
        return null;
      }

      const doc = snapshot.docs[0];
      return {
        id: doc.id,
        ...doc.data(),
      } as UserWithVersion;
    } catch (error) {
      console.error('[UserModel] FindByEmail error:', error);
      throw new InternalServerError('Failed to fetch user');
    }
  }

  /**
   * Find user by phone
   */
  async findByPhone(phone: string): Promise<UserWithVersion | null> {
    try {
      const snapshot = await this.collection
        .where('phone', '==', phone)
        .limit(1)
        .get();

      if (snapshot.empty) {
        return null;
      }

      const doc = snapshot.docs[0];
      return {
        id: doc.id,
        ...doc.data(),
      } as UserWithVersion;
    } catch (error) {
      console.error('[UserModel] FindByPhone error:', error);
      throw new InternalServerError('Failed to fetch user');
    }
  }

  /**
   * Find all users with filtering and pagination (Admin)
   */
  async findAll(
    filters?: {
      role?: 'admin' | 'user' | 'seller';
      status?: 'active' | 'inactive' | 'suspended' | 'banned';
      emailVerified?: boolean;
      startDate?: string;
      endDate?: string;
      search?: string;
    },
    pagination?: {
      limit?: number;
      offset?: number;
    }
  ): Promise<UserWithVersion[]> {
    try {
      let query: FirebaseFirestore.Query = this.collection;

      // Apply filters
      if (filters?.role) {
        query = query.where('role', '==', filters.role);
      }
      if (filters?.status) {
        query = query.where('status', '==', filters.status);
      }
      if (filters?.emailVerified !== undefined) {
        query = query.where('emailVerified', '==', filters.emailVerified);
      }
      if (filters?.startDate) {
        query = query.where('createdAt', '>=', filters.startDate);
      }
      if (filters?.endDate) {
        query = query.where('createdAt', '<=', filters.endDate);
      }

      // Sort by most recent
      query = query.orderBy('createdAt', 'desc');

      // Pagination
      const limit = pagination?.limit ?? 50;
      const offset = pagination?.offset ?? 0;
      query = query.limit(limit).offset(offset);

      const snapshot = await query.get();
      let users = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      } as UserWithVersion));

      // In-memory search filter (name, email, phone)
      if (filters?.search) {
        const searchLower = filters.search.toLowerCase();
        users = users.filter(user => 
          user.name?.toLowerCase().includes(searchLower) ||
          user.email?.toLowerCase().includes(searchLower) ||
          user.phone?.includes(filters.search!)
        );
      }

      return users;
    } catch (error) {
      console.error('[UserModel] FindAll error:', error);
      throw new InternalServerError('Failed to fetch users');
    }
  }

  /**
   * Search users by text (Admin)
   */
  async search(
    query: string,
    filters?: {
      role?: 'admin' | 'user' | 'seller';
      status?: 'active' | 'inactive' | 'suspended' | 'banned';
    }
  ): Promise<UserWithVersion[]> {
    try {
      let firestoreQuery: FirebaseFirestore.Query = this.collection;

      if (filters?.role) {
        firestoreQuery = firestoreQuery.where('role', '==', filters.role);
      }
      if (filters?.status) {
        firestoreQuery = firestoreQuery.where('status', '==', filters.status);
      }

      const snapshot = await firestoreQuery.limit(100).get();
      
      // Filter in-memory by search query
      const searchLower = query.toLowerCase();
      const users = snapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data(),
        } as UserWithVersion))
        .filter(user => {
          return (
            user.name?.toLowerCase().includes(searchLower) ||
            user.email?.toLowerCase().includes(searchLower) ||
            user.phone?.includes(query)
          );
        });

      return users;
    } catch (error) {
      console.error('[UserModel] Search error:', error);
      throw new InternalServerError('Failed to search users');
    }
  }

  /**
   * Update user with optimistic locking
   */
  async update(
    id: string,
    data: Partial<UserWithVersion>,
    expectedVersion?: number
  ): Promise<UserWithVersion> {
    const db = getAdminDb();

    try {
      const docRef = this.collection.doc(id);

      const user = await db.runTransaction(async (transaction) => {
        const doc = await transaction.get(docRef);

        if (!doc.exists) {
          throw new NotFoundError('User not found');
        }

        const currentData = doc.data() as UserWithVersion;

        // Optimistic locking: check version if provided
        if (expectedVersion !== undefined && currentData.version !== expectedVersion) {
          throw new ConflictError(
            `User was modified by another process. Expected version ${expectedVersion}, got ${currentData.version}`
          );
        }

        // If email is being updated, check uniqueness
        if (data.email && data.email.toLowerCase() !== currentData.email) {
          const existingQuery = await transaction.get(
            this.collection.where('email', '==', data.email.toLowerCase()).limit(1)
          );
          if (!existingQuery.empty && existingQuery.docs[0].id !== id) {
            throw new ConflictError(`Email ${data.email} is already in use`);
          }
        }

        const now = new Date().toISOString();
        const updateData = {
          ...data,
          email: data.email ? data.email.toLowerCase() : currentData.email,
          updatedAt: now,
          version: currentData.version + 1,
        };

        transaction.update(docRef, updateData);

        return {
          ...currentData,
          ...updateData,
          id: doc.id,
        } as UserWithVersion;
      });

      return user;
    } catch (error) {
      if (error instanceof NotFoundError || error instanceof ConflictError) {
        throw error;
      }
      console.error('[UserModel] Update error:', error);
      throw new InternalServerError('Failed to update user');
    }
  }

  /**
   * Update user role (Admin only)
   */
  async updateRole(
    id: string,
    role: 'admin' | 'user' | 'seller'
  ): Promise<UserWithVersion> {
    const db = getAdminDb();
    const auth = getAdminAuth();

    try {
      // Update Firestore
      const user = await this.update(id, { role });

      // Update Firebase Auth custom claims
      await auth.setCustomUserClaims(id, { role });

      return user;
    } catch (error) {
      console.error('[UserModel] UpdateRole error:', error);
      throw new InternalServerError('Failed to update user role');
    }
  }

  /**
   * Ban user (Admin only)
   */
  async ban(id: string, reason: string, bannedBy: string): Promise<UserWithVersion> {
    const db = getAdminDb();
    const auth = getAdminAuth();

    try {
      const docRef = this.collection.doc(id);

      const user = await db.runTransaction(async (transaction) => {
        const doc = await transaction.get(docRef);

        if (!doc.exists) {
          throw new NotFoundError('User not found');
        }

        const currentData = doc.data() as UserWithVersion;

        if (currentData.status === 'banned') {
          throw new ConflictError('User is already banned');
        }

        const now = new Date().toISOString();
        const updateData = {
          status: 'banned' as const,
          metadata: {
            ...currentData.metadata,
            bannedAt: now,
            bannedBy,
            banReason: reason,
          },
          updatedAt: now,
          version: currentData.version + 1,
        };

        transaction.update(docRef, updateData);

        return {
          ...currentData,
          ...updateData,
          id: doc.id,
        } as UserWithVersion;
      });

      // Disable Firebase Auth account
      await auth.updateUser(id, { disabled: true });

      return user;
    } catch (error) {
      if (error instanceof NotFoundError || error instanceof ConflictError) {
        throw error;
      }
      console.error('[UserModel] Ban error:', error);
      throw new InternalServerError('Failed to ban user');
    }
  }

  /**
   * Unban user (Admin only)
   */
  async unban(id: string): Promise<UserWithVersion> {
    const db = getAdminDb();
    const auth = getAdminAuth();

    try {
      const docRef = this.collection.doc(id);

      const user = await db.runTransaction(async (transaction) => {
        const doc = await transaction.get(docRef);

        if (!doc.exists) {
          throw new NotFoundError('User not found');
        }

        const currentData = doc.data() as UserWithVersion;

        if (currentData.status !== 'banned') {
          throw new ConflictError('User is not banned');
        }

        const now = new Date().toISOString();
        const updateData = {
          status: 'active' as const,
          metadata: {
            ...currentData.metadata,
            bannedAt: undefined,
            bannedBy: undefined,
            banReason: undefined,
          },
          updatedAt: now,
          version: currentData.version + 1,
        };

        transaction.update(docRef, updateData);

        return {
          ...currentData,
          ...updateData,
          id: doc.id,
        } as UserWithVersion;
      });

      // Enable Firebase Auth account
      await auth.updateUser(id, { disabled: false });

      return user;
    } catch (error) {
      if (error instanceof NotFoundError || error instanceof ConflictError) {
        throw error;
      }
      console.error('[UserModel] Unban error:', error);
      throw new InternalServerError('Failed to unban user');
    }
  }

  /**
   * Suspend user temporarily (Admin only)
   */
  async suspend(
    id: string,
    reason: string,
    suspendedUntil: string
  ): Promise<UserWithVersion> {
    const db = getAdminDb();

    try {
      const docRef = this.collection.doc(id);

      const user = await db.runTransaction(async (transaction) => {
        const doc = await transaction.get(docRef);

        if (!doc.exists) {
          throw new NotFoundError('User not found');
        }

        const currentData = doc.data() as UserWithVersion;

        const now = new Date().toISOString();
        const updateData = {
          status: 'suspended' as const,
          metadata: {
            ...currentData.metadata,
            suspendedAt: now,
            suspendedUntil,
            suspensionReason: reason,
          },
          updatedAt: now,
          version: currentData.version + 1,
        };

        transaction.update(docRef, updateData);

        return {
          ...currentData,
          ...updateData,
          id: doc.id,
        } as UserWithVersion;
      });

      return user;
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      console.error('[UserModel] Suspend error:', error);
      throw new InternalServerError('Failed to suspend user');
    }
  }

  /**
   * Delete user (soft delete - deactivate)
   */
  async delete(id: string): Promise<void> {
    try {
      await this.update(id, { status: 'inactive' });
    } catch (error) {
      console.error('[UserModel] Delete error:', error);
      throw new InternalServerError('Failed to delete user');
    }
  }

  /**
   * Permanently delete user (Admin only)
   */
  async permanentDelete(id: string): Promise<void> {
    const db = getAdminDb();
    const auth = getAdminAuth();

    try {
      // Delete from Firestore
      const docRef = this.collection.doc(id);
      const doc = await docRef.get();

      if (!doc.exists) {
        throw new NotFoundError('User not found');
      }

      await docRef.delete();

      // Delete from Firebase Auth
      try {
        await auth.deleteUser(id);
      } catch (authError) {
        console.warn('[UserModel] Firebase Auth delete failed:', authError);
        // Continue even if auth deletion fails
      }
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      console.error('[UserModel] PermanentDelete error:', error);
      throw new InternalServerError('Failed to permanently delete user');
    }
  }

  /**
   * Update last login information
   */
  async updateLastLogin(id: string, ipAddress?: string): Promise<void> {
    const db = getAdminDb();

    try {
      const docRef = this.collection.doc(id);
      const doc = await docRef.get();

      if (!doc.exists) {
        return; // Silent fail for login tracking
      }

      const currentData = doc.data() as UserWithVersion;
      const now = new Date().toISOString();

      await docRef.update({
        metadata: {
          ...currentData.metadata,
          lastLoginAt: now,
          lastLoginIp: ipAddress,
          loginCount: (currentData.metadata?.loginCount || 0) + 1,
        },
        updatedAt: now,
      });
    } catch (error) {
      console.error('[UserModel] UpdateLastLogin error:', error);
      // Don't throw - this is non-critical
    }
  }

  /**
   * Count users with filters
   */
  async count(filters?: {
    role?: 'admin' | 'user' | 'seller';
    status?: 'active' | 'inactive' | 'suspended' | 'banned';
    emailVerified?: boolean;
    startDate?: string;
    endDate?: string;
  }): Promise<number> {
    try {
      let query: FirebaseFirestore.Query = this.collection;

      if (filters?.role) {
        query = query.where('role', '==', filters.role);
      }
      if (filters?.status) {
        query = query.where('status', '==', filters.status);
      }
      if (filters?.emailVerified !== undefined) {
        query = query.where('emailVerified', '==', filters.emailVerified);
      }
      if (filters?.startDate) {
        query = query.where('createdAt', '>=', filters.startDate);
      }
      if (filters?.endDate) {
        query = query.where('createdAt', '<=', filters.endDate);
      }

      const snapshot = await query.count().get();
      return snapshot.data().count;
    } catch (error) {
      console.error('[UserModel] Count error:', error);
      throw new InternalServerError('Failed to count users');
    }
  }

  /**
   * Bulk update users (Admin only)
   */
  async bulkUpdate(
    updates: Array<{ id: string; data: Partial<UserWithVersion> }>
  ): Promise<void> {
    const db = getAdminDb();
    const batch = db.batch();

    try {
      const now = new Date().toISOString();

      for (const { id, data } of updates) {
        const docRef = this.collection.doc(id);
        batch.update(docRef, {
          ...data,
          updatedAt: now,
        });
      }

      await batch.commit();
    } catch (error) {
      console.error('[UserModel] BulkUpdate error:', error);
      throw new InternalServerError('Failed to bulk update users');
    }
  }
}

// Export singleton instance
export const userModel = new UserModel();
