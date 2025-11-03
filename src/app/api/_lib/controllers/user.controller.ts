/**
 * User Controller
 * 
 * Business logic layer for user operations
 * 
 * Features:
 * - Role-Based Access Control (RBAC)
 * - Profile management
 * - Account settings
 * - User preferences
 * - Admin user management
 * - Audit logging
 */

import { userModel, UserWithVersion } from '../models/user.model';
import { User } from '@/types';
import { 
  ValidationError, 
  AuthorizationError, 
  NotFoundError,
  ConflictError 
} from '../middleware/error-handler';

export interface UserContext {
  uid: string;
  role: 'admin' | 'seller' | 'user';
  sellerId?: string;
  email?: string;
}

export class UserController {
  /**
   * Get user profile
   * Authorization: Users can view their own, admins can view any
   */
  async getUserProfile(userId: string, requestingUser?: UserContext): Promise<UserWithVersion> {
    const user = await userModel.findById(userId);

    if (!user) {
      throw new NotFoundError('User not found');
    }

    // Authorization check
    if (requestingUser) {
      if (requestingUser.role !== 'admin' && requestingUser.uid !== userId) {
        throw new AuthorizationError('You can only view your own profile');
      }
    } else {
      throw new AuthorizationError('Authentication required');
    }

    return user;
  }

  /**
   * Update user profile
   * Authorization: Users can update their own, admins can update any
   */
  async updateUserProfile(
    userId: string,
    data: Partial<UserWithVersion>,
    requestingUser: UserContext,
    expectedVersion?: number
  ): Promise<UserWithVersion> {
    // Authorization check
    if (requestingUser.role !== 'admin' && requestingUser.uid !== userId) {
      throw new AuthorizationError('You can only update your own profile');
    }

    // Business rule: Users cannot change their own role
    if (requestingUser.role !== 'admin' && data.role) {
      throw new AuthorizationError('You cannot change your own role');
    }

    // Business rule: Users cannot change their own status
    if (requestingUser.role !== 'admin' && data.status) {
      throw new AuthorizationError('You cannot change your own account status');
    }

    // Validate data
    this.validateProfileData(data);

    // Update profile
    const user = await userModel.update(userId, data, expectedVersion);

    console.log(`[UserController] Profile updated: ${userId} by user: ${requestingUser.uid}`);
    return user;
  }

  /**
   * Get account settings
   * Authorization: Users can view their own, admins can view any
   */
  async getAccountSettings(userId: string, requestingUser: UserContext): Promise<{
    emailVerified: boolean;
    phoneVerified: boolean;
    status: string;
    preferences: UserWithVersion['preferences'];
  }> {
    // Authorization check
    if (requestingUser.role !== 'admin' && requestingUser.uid !== userId) {
      throw new AuthorizationError('You can only view your own account settings');
    }

    const user = await userModel.findById(userId);

    if (!user) {
      throw new NotFoundError('User not found');
    }

    return {
      emailVerified: user.emailVerified || false,
      phoneVerified: user.phoneVerified || false,
      status: user.status || 'active',
      preferences: user.preferences,
    };
  }

  /**
   * Update account settings
   * Authorization: Users can update their own, admins can update any
   */
  async updateAccountSettings(
    userId: string,
    data: {
      preferences?: UserWithVersion['preferences'];
      preferredCurrency?: string;
    },
    requestingUser: UserContext
  ): Promise<UserWithVersion> {
    // Authorization check
    if (requestingUser.role !== 'admin' && requestingUser.uid !== userId) {
      throw new AuthorizationError('You can only update your own account settings');
    }

    // Merge preferences
    const user = await userModel.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    const updateData: Partial<UserWithVersion> = {
      preferredCurrency: data.preferredCurrency,
      preferences: {
        ...user.preferences,
        ...data.preferences,
      },
    };

    const updatedUser = await userModel.update(userId, updateData);

    console.log(`[UserController] Account settings updated: ${userId} by user: ${requestingUser.uid}`);
    return updatedUser;
  }

  /**
   * Get user preferences
   * Authorization: Users can view their own
   */
  async getUserPreferences(userId: string, requestingUser: UserContext): Promise<UserWithVersion['preferences']> {
    // Authorization check
    if (requestingUser.role !== 'admin' && requestingUser.uid !== userId) {
      throw new AuthorizationError('You can only view your own preferences');
    }

    const user = await userModel.findById(userId);

    if (!user) {
      throw new NotFoundError('User not found');
    }

    return user.preferences;
  }

  /**
   * Update user preferences
   * Authorization: Users can update their own
   */
  async updateUserPreferences(
    userId: string,
    preferences: Partial<UserWithVersion['preferences']>,
    requestingUser: UserContext
  ): Promise<UserWithVersion> {
    // Authorization check
    if (requestingUser.role !== 'admin' && requestingUser.uid !== userId) {
      throw new AuthorizationError('You can only update your own preferences');
    }

    const user = await userModel.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    const updatedUser = await userModel.update(userId, {
      preferences: {
        ...user.preferences,
        ...preferences,
      },
    });

    console.log(`[UserController] Preferences updated: ${userId} by user: ${requestingUser.uid}`);
    return updatedUser;
  }

  /**
   * Delete account (soft delete)
   * Authorization: Users can delete their own, admins can delete any
   */
  async deleteAccount(userId: string, requestingUser: UserContext): Promise<void> {
    // Authorization check
    if (requestingUser.role !== 'admin' && requestingUser.uid !== userId) {
      throw new AuthorizationError('You can only delete your own account');
    }

    // Business rule: Admins cannot delete their own account
    if (requestingUser.role === 'admin' && requestingUser.uid === userId) {
      throw new ConflictError('Admins cannot delete their own account');
    }

    await userModel.delete(userId);

    console.log(`[UserController] Account deleted: ${userId} by user: ${requestingUser.uid}`);
  }

  /**
   * Get all users (Admin only)
   * - Pagination support
   * - Filter by role
   */
  async getAllUsersAdmin(
    filters: {
      role?: 'admin' | 'seller' | 'user';
      page?: number;
      limit?: number;
    },
    user: UserContext
  ): Promise<{ users: UserWithVersion[]; pagination: any }> {
    // RBAC: Admin only
    if (user.role !== 'admin') {
      throw new AuthorizationError('Admin access required');
    }

    const page = filters.page || 1;
    const limit = filters.limit || 100;

    // Fetch all users (we'll filter client-side for now)
    const allUsers = await userModel.findAll({});

    let filteredUsers = allUsers;

    // Apply role filter
    if (filters.role) {
      filteredUsers = filteredUsers.filter((u) => u.role === filters.role);
    }

    // Pagination
    const startIndex = (page - 1) * limit;
    const paginatedUsers = filteredUsers.slice(startIndex, startIndex + limit);

    return {
      users: paginatedUsers,
      pagination: {
        page,
        limit,
        total: filteredUsers.length,
        totalPages: Math.ceil(filteredUsers.length / limit),
      },
    };
  }

  /**
   * Search users (Admin only)
   * - Search by email or name
   */
  async searchUsersAdmin(
    query: string,
    user: UserContext
  ): Promise<UserWithVersion[]> {
    // RBAC: Admin only
    if (user.role !== 'admin') {
      throw new AuthorizationError('Admin access required');
    }

    if (!query || query.trim().length === 0) {
      throw new ValidationError('Search query is required');
    }

    // Fetch all users and filter client-side
    const allUsers = await userModel.findAll({});
    const searchLower = query.toLowerCase();

    const results = allUsers.filter(
      (u) =>
        u.email?.toLowerCase().includes(searchLower) ||
        u.name?.toLowerCase().includes(searchLower)
    );

    return results;
  }

  /**
   * Get user by ID (Admin only)
   * - Full user details
   */
  async getUserByIdAdmin(
    userId: string,
    user: UserContext
  ): Promise<UserWithVersion> {
    // RBAC: Admin only
    if (user.role !== 'admin') {
      throw new AuthorizationError('Admin access required');
    }

    const targetUser = await userModel.findById(userId);

    if (!targetUser) {
      throw new NotFoundError('User not found');
    }

    return targetUser;
  }

  /**
   * Update user role (Admin only)
   * - Change user role (user, seller, admin)
   * - Prevents admin from demoting themselves
   */
  async updateUserRoleAdmin(
    userId: string,
    newRole: 'admin' | 'seller' | 'user',
    user: UserContext
  ): Promise<UserWithVersion> {
    // RBAC: Admin only
    if (user.role !== 'admin') {
      throw new AuthorizationError('Admin access required');
    }

    // Validate role
    if (!['admin', 'seller', 'user'].includes(newRole)) {
      throw new ValidationError('Invalid role. Must be: admin, seller, or user');
    }

    // Prevent admin from changing their own role
    if (userId === user.uid) {
      throw new AuthorizationError('You cannot change your own role');
    }

    // Check if user exists
    const targetUser = await userModel.findById(userId);
    if (!targetUser) {
      throw new NotFoundError('User not found');
    }

    // Update role
    const updatedUser = await userModel.update(userId, {
      role: newRole,
    });

    return updatedUser;
  }

  /**
   * Ban/Unban user (Admin only)
   * - Toggle user ban status
   * - Prevents admin from banning themselves
   */
  async banUserAdmin(
    userId: string,
    isBanned: boolean,
    user: UserContext
  ): Promise<UserWithVersion> {
    // RBAC: Admin only
    if (user.role !== 'admin') {
      throw new AuthorizationError('Admin access required');
    }

    // Prevent admin from banning themselves
    if (userId === user.uid) {
      throw new AuthorizationError('You cannot ban yourself');
    }

    // Check if user exists
    const targetUser = await userModel.findById(userId);
    if (!targetUser) {
      throw new NotFoundError('User not found');
    }

    // Update ban status
    const updatedUser = await userModel.update(userId, {
      isBanned: isBanned,
    } as any);

    return updatedUser;
  }

  /**
   * Update user details (Admin only)
   * - Admin can update any user field
   * - Includes role and ban status
   */
  async updateUserAdmin(
    userId: string,
    data: {
      role?: 'admin' | 'seller' | 'user';
      isBanned?: boolean;
      name?: string;
      phone?: string;
      [key: string]: any;
    },
    user: UserContext
  ): Promise<UserWithVersion> {
    // RBAC: Admin only
    if (user.role !== 'admin') {
      throw new AuthorizationError('Admin access required');
    }

    // Prevent admin from modifying themselves in critical ways
    if (userId === user.uid) {
      if (data.role !== undefined || data.isBanned !== undefined) {
        throw new AuthorizationError('You cannot change your own role or ban status');
      }
    }

    // Check if user exists
    const targetUser = await userModel.findById(userId);
    if (!targetUser) {
      throw new NotFoundError('User not found');
    }

    // Validate role if provided
    if (data.role && !['admin', 'seller', 'user'].includes(data.role)) {
      throw new ValidationError('Invalid role. Must be: admin, seller, or user');
    }

    // Update user
    const updatedUser = await userModel.update(userId, data);

    return updatedUser;
  }

  /**
   * Get all users (Admin only)
   */
  async getAllUsers(
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
    },
    requestingUser?: UserContext
  ): Promise<UserWithVersion[]> {
    if (!requestingUser || requestingUser.role !== 'admin') {
      throw new AuthorizationError('Admin access required');
    }

    const users = await userModel.findAll(filters, pagination);
    return users;
  }

  /**
   * Count users (Admin only)
   */
  async countUsers(
    filters?: {
      role?: 'admin' | 'user' | 'seller';
      status?: 'active' | 'inactive' | 'suspended' | 'banned';
      emailVerified?: boolean;
      startDate?: string;
      endDate?: string;
    },
    requestingUser?: UserContext
  ): Promise<number> {
    if (!requestingUser || requestingUser.role !== 'admin') {
      throw new AuthorizationError('Admin access required');
    }

    return await userModel.count(filters);
  }

  /**
   * Bulk update users (Admin only)
   */
  async bulkUpdateUsers(
    updates: Array<{ id: string; data: Partial<UserWithVersion> }>,
    requestingUser: UserContext
  ): Promise<void> {
    if (requestingUser.role !== 'admin') {
      throw new AuthorizationError('Admin access required');
    }

    // Business rule: Cannot bulk update to change roles to admin
    for (const update of updates) {
      if (update.data.role === 'admin') {
        throw new ValidationError('Cannot bulk update users to admin role');
      }
    }

    await userModel.bulkUpdate(updates);

    console.log(`[UserController] Bulk update: ${updates.length} users by admin: ${requestingUser.uid}`);
  }

  /**
   * Get user by email (Admin only)
   */
  async getUserByEmail(email: string, requestingUser: UserContext): Promise<UserWithVersion> {
    if (requestingUser.role !== 'admin') {
      throw new AuthorizationError('Admin access required');
    }

    const user = await userModel.findByEmail(email);

    if (!user) {
      throw new NotFoundError('User not found');
    }

    return user;
  }

  /**
   * Update last login (System use)
   */
  async updateLastLogin(userId: string, ipAddress?: string): Promise<void> {
    await userModel.updateLastLogin(userId, ipAddress);
  }

  /**
   * Private: Validate profile data
   */
  private validateProfileData(data: Partial<UserWithVersion>): void {
    // Name validation
    if (data.name !== undefined && data.name.trim().length < 2) {
      throw new ValidationError('Name must be at least 2 characters');
    }

    // Email validation (basic)
    if (data.email !== undefined) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(data.email)) {
        throw new ValidationError('Invalid email format');
      }
    }

    // Phone validation
    if (data.phone !== undefined && data.phone.trim().length > 0) {
      const phoneRegex = /^[0-9]{10}$/;
      const cleanPhone = data.phone.replace(/[\s\-\+]/g, '');
      if (!phoneRegex.test(cleanPhone)) {
        throw new ValidationError('Invalid phone number format (must be 10 digits)');
      }
    }

    // Avatar validation
    if (data.avatar !== undefined && data.avatar.trim().length > 0) {
      try {
        new URL(data.avatar);
      } catch {
        throw new ValidationError('Invalid avatar URL');
      }
    }

    // Currency validation
    if (data.preferredCurrency !== undefined) {
      const validCurrencies = ['INR', 'USD', 'EUR', 'GBP', 'AUD', 'CAD'];
      if (!validCurrencies.includes(data.preferredCurrency)) {
        throw new ValidationError('Invalid currency');
      }
    }
  }

  /**
   * Create or update user document (admin only)
   * Useful when Firebase Auth user exists but no Firestore document
   */
  async createUserDocumentAdmin(
    userId: string,
    data: {
      email?: string;
      name?: string;
      phone?: string;
      role?: 'user' | 'seller' | 'admin';
    },
    user: UserContext
  ): Promise<any> {
    // RBAC check
    if (user.role !== 'admin') {
      throw new AuthorizationError('Admin access required');
    }

    // Validate role if provided
    if (data.role && !['user', 'seller', 'admin'].includes(data.role)) {
      throw new ValidationError('Invalid role. Must be user, seller, or admin');
    }

    // Create user document with default values
    const userDocData: any = {
      uid: userId,
      email: data.email || '',
      name: data.name || 'User',
      phone: data.phone || undefined,
      role: data.role || 'user',
      isEmailVerified: false,
      isPhoneVerified: false,
      addresses: [],
      profile: {},
      isBanned: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
    };

    // Create or merge document (use update without version check for creation)
    const updatedUser = await userModel.update(userId, userDocData);

    return updatedUser;
  }
}

// Export singleton instance
export const userController = new UserController();
