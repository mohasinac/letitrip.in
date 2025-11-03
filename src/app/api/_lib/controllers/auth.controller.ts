/**
 * Auth Controller
 * 
 * Business logic layer for authentication operations with RBAC
 * 
 * Features:
 * - User registration (email/password, phone/OTP)
 * - JWT token verification
 * - Password management
 * - OTP generation and verification
 * - Account management
 * - Session handling
 */

import { authModel, RegisterUserData } from '../models/auth.model';
import {
  AuthorizationError,
  ValidationError,
  NotFoundError,
  ConflictError,
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
 * Registration input
 */
export interface RegisterInput {
  email?: string;
  password?: string;
  name: string;
  phone?: string;
  role?: 'admin' | 'seller' | 'user';
  provider?: 'email' | 'phone' | 'google' | 'facebook';
}

/**
 * Login input
 */
export interface LoginInput {
  email?: string;
  phone?: string;
  password?: string;
  otp?: string;
}

/**
 * Password change input
 */
export interface ChangePasswordInput {
  currentPassword: string;
  newPassword: string;
}

// ============================================================================
// Controller Functions
// ============================================================================

/**
 * Register a new user with email/password
 */
export async function registerWithEmail(
  data: RegisterInput
): Promise<{ uid: string; user: any; message: string }> {
  // Validate input
  if (!data.email) {
    throw new ValidationError('Email is required');
  }

  if (!data.password || data.password.length < 6) {
    throw new ValidationError('Password must be at least 6 characters');
  }

  if (!data.name || data.name.length < 2) {
    throw new ValidationError('Name must be at least 2 characters');
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(data.email)) {
    throw new ValidationError('Invalid email format');
  }

  // Only admins can create admin or seller accounts
  // This validation should be done at route level with admin check
  // For public registration, force role to 'user'
  if (data.role === 'admin' || data.role === 'seller') {
    data.role = 'user';
  }

  const registerData: RegisterUserData = {
    email: data.email,
    password: data.password,
    name: data.name,
    phone: data.phone,
    role: data.role || 'user',
    provider: 'email',
  };

  const result = await authModel.registerWithEmail(registerData);

  return {
    ...result,
    message: 'Registration successful',
  };
}

/**
 * Register a new user with phone/OTP
 */
export async function registerWithPhone(
  data: RegisterInput
): Promise<{ uid: string; user: any; message: string }> {
  // Validate input
  if (!data.phone) {
    throw new ValidationError('Phone number is required');
  }

  if (!data.name || data.name.length < 2) {
    throw new ValidationError('Name must be at least 2 characters');
  }

  // Validate phone format (basic validation)
  const phoneRegex = /^\+?[1-9]\d{1,14}$/;
  if (!phoneRegex.test(data.phone)) {
    throw new ValidationError('Invalid phone number format');
  }

  const registerData: RegisterUserData = {
    email: data.email || '',
    name: data.name,
    phone: data.phone,
    role: data.role || 'user',
    provider: 'phone',
  };

  const result = await authModel.registerWithPhone(registerData);

  return {
    ...result,
    message: 'Registration successful',
  };
}

/**
 * Get current user information
 */
export async function getCurrentUser(token: string): Promise<any> {
  if (!token) {
    throw new AuthorizationError('Authentication token is required');
  }

  const user = await authModel.getUserByToken(token);

  return user;
}

/**
 * Change user password
 */
export async function changePassword(
  userId: string,
  data: ChangePasswordInput,
  userContext: UserContext
): Promise<{ message: string }> {
  // Validate user can only change their own password
  if (userContext.userId !== userId) {
    throw new AuthorizationError('You can only change your own password');
  }

  // Validate input
  if (!data.currentPassword) {
    throw new ValidationError('Current password is required');
  }

  if (!data.newPassword || data.newPassword.length < 6) {
    throw new ValidationError('New password must be at least 6 characters');
  }

  if (data.currentPassword === data.newPassword) {
    throw new ValidationError('New password must be different from current password');
  }

  await authModel.changePassword(userId, data.currentPassword, data.newPassword);

  return {
    message: 'Password changed successfully',
  };
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(email: string): Promise<{ message: string }> {
  if (!email) {
    throw new ValidationError('Email is required');
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new ValidationError('Invalid email format');
  }

  await authModel.sendPasswordResetEmail(email);

  return {
    message: 'Password reset email sent successfully',
  };
}

/**
 * Generate and send OTP
 */
export async function sendOTP(phone: string): Promise<{ message: string; otp?: string }> {
  if (!phone) {
    throw new ValidationError('Phone number is required');
  }

  // Validate phone format
  const phoneRegex = /^\+?[1-9]\d{1,14}$/;
  if (!phoneRegex.test(phone)) {
    throw new ValidationError('Invalid phone number format');
  }

  const otp = await authModel.generateOTP(phone);

  // In production, send OTP via SMS service
  // For development, return OTP in response
  console.log(`OTP for ${phone}: ${otp}`);

  return {
    message: 'OTP sent successfully',
    // Remove OTP from response in production
    otp: process.env.NODE_ENV === 'development' ? otp : undefined,
  };
}

/**
 * Verify OTP
 */
export async function verifyOTP(
  phone: string,
  otp: string
): Promise<{ verified: boolean; message: string }> {
  if (!phone) {
    throw new ValidationError('Phone number is required');
  }

  if (!otp || otp.length !== 6) {
    throw new ValidationError('Invalid OTP format');
  }

  const verified = await authModel.verifyOTP(phone, otp);

  return {
    verified,
    message: 'OTP verified successfully',
  };
}

/**
 * Delete user account
 */
export async function deleteAccount(
  userId: string,
  userContext: UserContext
): Promise<{ message: string }> {
  // Users can only delete their own account
  // Admins can delete any account except their own (self-protection)
  if (userContext.role === 'admin') {
    if (userContext.userId === userId) {
      throw new AuthorizationError('Admins cannot delete their own account');
    }
    // Admin can delete other accounts
  } else if (userContext.userId !== userId) {
    throw new AuthorizationError('You can only delete your own account');
  }

  await authModel.deleteAccount(userId);

  return {
    message: 'Account deleted successfully',
  };
}

/**
 * Verify email address
 */
export async function verifyEmail(
  userId: string,
  userContext: UserContext
): Promise<{ message: string }> {
  // Only admins or the user themselves can verify email
  if (userContext.role !== 'admin' && userContext.userId !== userId) {
    throw new AuthorizationError('Unauthorized to verify email');
  }

  await authModel.setEmailVerified(userId, true);

  return {
    message: 'Email verified successfully',
  };
}

/**
 * Verify phone number
 */
export async function verifyPhone(
  userId: string,
  userContext: UserContext
): Promise<{ message: string }> {
  // Only admins or the user themselves can verify phone
  if (userContext.role !== 'admin' && userContext.userId !== userId) {
    throw new AuthorizationError('Unauthorized to verify phone');
  }

  await authModel.setPhoneVerified(userId, true);

  return {
    message: 'Phone verified successfully',
  };
}

/**
 * Validate JWT token and return user context
 */
export async function validateToken(token: string): Promise<UserContext> {
  if (!token) {
    throw new AuthorizationError('Authentication token is required');
  }

  const decodedToken = await authModel.verifyToken(token);

  // Get user role from Firestore
  const user = await authModel.getUserByToken(token);

  return {
    userId: decodedToken.uid,
    role: user.role || 'user',
    email: user.email,
  };
}

/**
 * Check if user exists by email
 */
export async function checkUserExists(email: string): Promise<{ exists: boolean }> {
  if (!email) {
    throw new ValidationError('Email is required');
  }

  const user = await authModel.getUserByEmail(email);

  return {
    exists: !!user,
  };
}

/**
 * Check if phone number exists
 */
export async function checkPhoneExists(phone: string): Promise<{ exists: boolean }> {
  if (!phone) {
    throw new ValidationError('Phone number is required');
  }

  const user = await authModel.getUserByPhone(phone);

  return {
    exists: !!user,
  };
}
