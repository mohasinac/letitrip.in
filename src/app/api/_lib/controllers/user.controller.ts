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
   * Search users (Admin only)
   */
  async searchUsers(
    query: string,
    filters?: {
      role?: 'admin' | 'user' | 'seller';
      status?: 'active' | 'inactive' | 'suspended' | 'banned';
    },
    requestingUser?: UserContext
  ): Promise<UserWithVersion[]> {
    if (!requestingUser || requestingUser.role !== 'admin') {
      throw new AuthorizationError('Admin access required');
    }

    if (!query || query.trim().length < 2) {
      throw new ValidationError('Search query must be at least 2 characters');
    }

    const users = await userModel.search(query, filters);
    return users;
  }

  /**
   * Update user role (Admin only)
   */
  async updateUserRole(
    targetUserId: string,
    role: 'admin' | 'user' | 'seller',
    requestingUser: UserContext
  ): Promise<UserWithVersion> {
    if (requestingUser.role !== 'admin') {
      throw new AuthorizationError('Admin access required');
    }

    // Business rule: Admins cannot change their own role
    if (targetUserId === requestingUser.uid) {
      throw new ConflictError('You cannot change your own role');
    }

    // Validate role
    const validRoles: Array<'admin' | 'user' | 'seller'> = ['admin', 'user', 'seller'];
    if (!validRoles.includes(role)) {
      throw new ValidationError('Invalid role');
    }

    const user = await userModel.updateRole(targetUserId, role);

    console.log(
      `[UserController] Role updated: ${targetUserId} to ${role} by admin: ${requestingUser.uid}`
    );
    return user;
  }

  /**
   * Ban user (Admin only)
   */
  async banUser(
    targetUserId: string,
    reason: string,
    requestingUser: UserContext
  ): Promise<UserWithVersion> {
    if (requestingUser.role !== 'admin') {
      throw new AuthorizationError('Admin access required');
    }

    // Business rule: Admins cannot ban themselves
    if (targetUserId === requestingUser.uid) {
      throw new ConflictError('You cannot ban yourself');
    }

    // Validate reason
    if (!reason || reason.trim().length < 10) {
      throw new ValidationError('Ban reason must be at least 10 characters');
    }

    const user = await userModel.ban(targetUserId, reason, requestingUser.uid);

    console.log(
      `[UserController] User banned: ${targetUserId} by admin: ${requestingUser.uid}, reason: ${reason}`
    );
    return user;
  }

  /**
   * Unban user (Admin only)
   */
  async unbanUser(targetUserId: string, requestingUser: UserContext): Promise<UserWithVersion> {
    if (requestingUser.role !== 'admin') {
      throw new AuthorizationError('Admin access required');
    }

    const user = await userModel.unban(targetUserId);

    console.log(`[UserController] User unbanned: ${targetUserId} by admin: ${requestingUser.uid}`);
    return user;
  }

  /**
   * Suspend user temporarily (Admin only)
   */
  async suspendUser(
    targetUserId: string,
    reason: string,
    suspendedUntil: string,
    requestingUser: UserContext
  ): Promise<UserWithVersion> {
    if (requestingUser.role !== 'admin') {
      throw new AuthorizationError('Admin access required');
    }

    // Business rule: Admins cannot suspend themselves
    if (targetUserId === requestingUser.uid) {
      throw new ConflictError('You cannot suspend yourself');
    }

    // Validate reason
    if (!reason || reason.trim().length < 10) {
      throw new ValidationError('Suspension reason must be at least 10 characters');
    }

    // Validate suspension date
    const suspensionDate = new Date(suspendedUntil);
    if (isNaN(suspensionDate.getTime())) {
      throw new ValidationError('Invalid suspension end date');
    }

    if (suspensionDate <= new Date()) {
      throw new ValidationError('Suspension end date must be in the future');
    }

    const user = await userModel.suspend(targetUserId, reason, suspendedUntil);

    console.log(
      `[UserController] User suspended: ${targetUserId} until ${suspendedUntil} by admin: ${requestingUser.uid}`
    );
    return user;
  }

  /**
   * Permanently delete user (Admin only)
   */
  async permanentlyDeleteUser(targetUserId: string, requestingUser: UserContext): Promise<void> {
    if (requestingUser.role !== 'admin') {
      throw new AuthorizationError('Admin access required');
    }

    // Business rule: Admins cannot delete themselves
    if (targetUserId === requestingUser.uid) {
      throw new ConflictError('You cannot delete your own account');
    }

    await userModel.permanentDelete(targetUserId);

    console.log(
      `[UserController] User permanently deleted: ${targetUserId} by admin: ${requestingUser.uid}`
    );
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
}

// Export singleton instance
export const userController = new UserController();
