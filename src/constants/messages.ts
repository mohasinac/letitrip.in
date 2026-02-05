/**
 * Application Messages Constants
 * 
 * Centralized message strings for consistency across the application
 */

export const ERROR_MESSAGES = {
  // Authentication Errors
  AUTH: {
    UNAUTHORIZED: 'You must be logged in to access this resource',
    FORBIDDEN: 'You do not have permission to access this resource',
    SESSION_EXPIRED: 'Your session has expired. Please login again',
    INVALID_CREDENTIALS: 'Invalid email or password',
    ACCOUNT_DISABLED: 'Your account has been disabled',
    EMAIL_NOT_VERIFIED: 'Please verify your email address to continue',
  },

  // Validation Errors
  VALIDATION: {
    REQUIRED_FIELD: 'This field is required',
    INVALID_EMAIL: 'Please enter a valid email address',
    INVALID_PHONE: 'Please enter a valid phone number',
    PASSWORD_TOO_SHORT: 'Password must be at least 8 characters',
    PASSWORD_NO_LOWERCASE: 'Password must contain at least one lowercase letter',
    PASSWORD_NO_UPPERCASE: 'Password must contain at least one uppercase letter',
    PASSWORD_NO_NUMBER: 'Password must contain at least one number',
    PASSWORD_MISMATCH: 'Passwords do not match',
    INVALID_INPUT: 'Invalid input provided',
  },

  // User/Profile Errors
  USER: {
    NOT_FOUND: 'User not found',
    ALREADY_EXISTS: 'A user with this email or phone already exists',
    UPDATE_FAILED: 'Failed to update user profile',
    PROFILE_INCOMPLETE: 'Please complete your profile',
  },

  // Password Errors
  PASSWORD: {
    INCORRECT: 'Current password is incorrect',
    CHANGE_FAILED: 'Failed to change password',
    RESET_FAILED: 'Failed to reset password',
    TOKEN_INVALID: 'Invalid or expired reset token',
    TOKEN_EXPIRED: 'Reset token has expired',
    TOKEN_USED: 'Reset token has already been used',
  },

  // Email Verification Errors
  EMAIL: {
    SEND_FAILED: 'Failed to send email. Please try again',
    VERIFICATION_FAILED: 'Failed to verify email',
    ALREADY_VERIFIED: 'Email is already verified',
    TOKEN_INVALID: 'Invalid or expired verification token',
    TOKEN_EXPIRED: 'Verification token has expired',
    NO_EMAIL: 'No email address associated with this account',
  },

  // Generic Errors
  GENERIC: {
    INTERNAL_ERROR: 'An unexpected error occurred. Please try again',
    NOT_FOUND: 'The requested resource was not found',
    BAD_REQUEST: 'Invalid request',
    NETWORK_ERROR: 'Network error. Please check your connection',
    TIMEOUT: 'Request timed out. Please try again',
    UNKNOWN: 'An unknown error occurred',
  },
} as const;

export const SUCCESS_MESSAGES = {
  // Authentication Success
  AUTH: {
    LOGIN_SUCCESS: 'Welcome back!',
    LOGOUT_SUCCESS: 'You have been logged out successfully',
    REGISTER_SUCCESS: 'Account created successfully',
  },

  // User/Profile Success
  USER: {
    PROFILE_UPDATED: 'Profile updated successfully',
    PASSWORD_CHANGED: 'Password changed successfully',
  },

  // Email Success
  EMAIL: {
    VERIFICATION_SENT: 'Verification email sent successfully',
    VERIFIED: 'Email verified successfully',
    RESET_SENT: 'Password reset link sent to your email',
  },

  // Password Reset Success
  PASSWORD: {
    RESET_SUCCESS: 'Password reset successfully',
  },
} as const;

export const INFO_MESSAGES = {
  EMAIL: {
    CHECK_INBOX: 'Please check your email inbox for the verification link',
    CHECK_SPAM: 'If you don\'t see the email, please check your spam folder',
  },

  PASSWORD: {
    REQUIREMENTS: 'Password must be at least 8 characters and contain uppercase, lowercase, and numbers',
  },

  GENERAL: {
    LOADING: 'Loading...',
    SAVING: 'Saving...',
    PROCESSING: 'Processing...',
  },
} as const;

export const CONFIRMATION_MESSAGES = {
  LOGOUT: 'Are you sure you want to logout?',
  DELETE_ACCOUNT: 'Are you sure you want to delete your account? This action cannot be undone.',
  DISCARD_CHANGES: 'Are you sure you want to discard your changes?',
} as const;
