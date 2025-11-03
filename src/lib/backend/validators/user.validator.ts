/**
 * User Validation Schemas
 * 
 * Zod schemas for validating user-related data
 */

import { z } from 'zod';

// ============================================================================
// Enums
// ============================================================================

export const UserRole = z.enum(['customer', 'seller', 'admin']);

export const UserStatus = z.enum(['active', 'inactive', 'suspended', 'banned']);

// ============================================================================
// Sub-schemas
// ============================================================================

const addressSchema = z.object({
  id: z.string().optional(),
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number'),
  addressLine1: z.string().min(5, 'Address line 1 is required'),
  addressLine2: z.string().optional(),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  country: z.string().min(2, 'Country is required'),
  postalCode: z.string().min(3, 'Postal code is required'),
  landmark: z.string().optional(),
  isDefault: z.boolean().optional(),
});

const sellerProfileSchema = z.object({
  businessName: z.string().min(2, 'Business name is required'),
  businessType: z.string().optional(),
  gstNumber: z.string().optional(),
  panNumber: z.string().optional(),
  bankAccountNumber: z.string().optional(),
  bankIfscCode: z.string().optional(),
  bankAccountHolderName: z.string().optional(),
  businessAddress: addressSchema.optional(),
  businessPhone: z.string().optional(),
  businessEmail: z.string().email().optional(),
  verified: z.boolean().optional(),
  rating: z.number().min(0).max(5).optional(),
  totalOrders: z.number().int().nonnegative().optional(),
});

// ============================================================================
// Main Schemas
// ============================================================================

/**
 * Schema for user registration
 */
export const registerUserSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number').optional(),
  role: UserRole.optional().default('customer'),
});

/**
 * Schema for user login
 */
export const loginUserSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional(),
});

/**
 * Schema for updating user profile
 */
export const updateProfileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number').optional(),
  email: z.string().email('Invalid email address').optional(),
  avatar: z.string().url().optional(),
  dateOfBirth: z.string().optional(),
  gender: z.enum(['male', 'female', 'other', 'prefer_not_to_say']).optional(),
  preferences: z.object({
    newsletter: z.boolean().optional(),
    smsNotifications: z.boolean().optional(),
    orderUpdates: z.boolean().optional(),
  }).optional(),
});

/**
 * Schema for changing password
 */
export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  confirmPassword: z.string(),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

/**
 * Schema for password reset request
 */
export const resetPasswordRequestSchema = z.object({
  email: z.string().email('Invalid email address'),
});

/**
 * Schema for password reset
 */
export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  newPassword: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  confirmPassword: z.string(),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

/**
 * Schema for adding/updating address
 */
export const addressInputSchema = addressSchema.omit({ id: true });

/**
 * Schema for updating seller profile
 */
export const updateSellerProfileSchema = sellerProfileSchema.partial();

/**
 * Schema for user filters (admin)
 */
export const userFiltersSchema = z.object({
  role: UserRole.optional(),
  status: UserStatus.optional(),
  search: z.string().optional(), // Search by name, email, phone
  verified: z.boolean().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  
  // Pagination
  page: z.number().int().positive().optional(),
  limit: z.number().int().positive().max(100).optional(),
  sortBy: z.enum(['createdAt', 'name', 'email', 'role']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});

/**
 * Schema for admin updating user (admin only)
 */
export const adminUpdateUserSchema = z.object({
  name: z.string().min(2).optional(),
  email: z.string().email().optional(),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/).optional(),
  role: UserRole.optional(),
  status: UserStatus.optional(),
  emailVerified: z.boolean().optional(),
  phoneVerified: z.boolean().optional(),
});

/**
 * Schema for OTP verification
 */
export const verifyOTPSchema = z.object({
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number'),
  otp: z.string().length(6, 'OTP must be 6 digits'),
});

/**
 * Schema for sending OTP
 */
export const sendOTPSchema = z.object({
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number'),
  purpose: z.enum(['login', 'verification', 'reset_password']).optional(),
});

// ============================================================================
// Type Exports
// ============================================================================

export type Address = z.infer<typeof addressSchema>;
export type AddressInput = z.infer<typeof addressInputSchema>;
export type SellerProfile = z.infer<typeof sellerProfileSchema>;
export type RegisterUserInput = z.infer<typeof registerUserSchema>;
export type LoginUserInput = z.infer<typeof loginUserSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type ResetPasswordRequestInput = z.infer<typeof resetPasswordRequestSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type UpdateSellerProfileInput = z.infer<typeof updateSellerProfileSchema>;
export type UserFilters = z.infer<typeof userFiltersSchema>;
export type AdminUpdateUserInput = z.infer<typeof adminUpdateUserSchema>;
export type VerifyOTPInput = z.infer<typeof verifyOTPSchema>;
export type SendOTPInput = z.infer<typeof sendOTPSchema>;

// ============================================================================
// Validation Helper Functions
// ============================================================================

export function validateRegisterUser(data: unknown) {
  return registerUserSchema.parse(data);
}

export function validateLoginUser(data: unknown) {
  return loginUserSchema.parse(data);
}

export function validateUpdateProfile(data: unknown) {
  return updateProfileSchema.parse(data);
}

export function validateChangePassword(data: unknown) {
  return changePasswordSchema.parse(data);
}

export function validateAddress(data: unknown) {
  return addressInputSchema.parse(data);
}

export function validateUserFilters(data: unknown) {
  return userFiltersSchema.parse(data);
}
