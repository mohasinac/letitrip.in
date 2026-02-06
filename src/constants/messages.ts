/**
 * Application Messages Constants
 *
 * Centralized message strings for consistency across the application
 */

export const ERROR_MESSAGES = {
  // Authentication Errors
  AUTH: {
    UNAUTHORIZED: "You must be logged in to access this resource",
    FORBIDDEN: "You do not have permission to access this resource",
    SESSION_EXPIRED: "Your session has expired. Please login again",
    INVALID_CREDENTIALS: "Invalid email or password",
    ACCOUNT_DISABLED: "Your account has been disabled",
    EMAIL_NOT_VERIFIED: "Please verify your email address to continue",
    REGISTRATION_FAILED: "Registration failed. Please try again",
    LOGIN_FAILED: "Login failed. Please try again",
  },

  // Validation Errors
  VALIDATION: {
    REQUIRED_FIELD: "This field is required",
    INVALID_EMAIL: "Please enter a valid email address",
    INVALID_PHONE: "Please enter a valid phone number",
    PASSWORD_TOO_SHORT: "Password must be at least 8 characters",
    PASSWORD_NO_LOWERCASE:
      "Password must contain at least one lowercase letter",
    PASSWORD_NO_UPPERCASE:
      "Password must contain at least one uppercase letter",
    PASSWORD_NO_NUMBER: "Password must contain at least one number",
    PASSWORD_MISMATCH: "Passwords do not match",
    INVALID_INPUT: "Invalid input provided",
  },

  // User/Profile Errors
  USER: {
    NOT_FOUND: "User not found",
    ALREADY_EXISTS: "A user with this email or phone already exists",
    EMAIL_ALREADY_REGISTERED: "This email is already registered",
    UPDATE_FAILED: "Failed to update user profile",
    PROFILE_INCOMPLETE: "Please complete your profile",
    NOT_AUTHENTICATED: "User not authenticated",
    CANNOT_MODIFY_SELF: "You cannot modify your own account",
    INSUFFICIENT_ROLE_PERMISSION:
      "You do not have permission to assign this role",
    ACCOUNT_DISABLED: "Your account has been disabled",
  },

  // Password Errors
  PASSWORD: {
    REQUIRED: "Password is required",
    TOO_SHORT: "Password must be at least 8 characters",
    NO_UPPERCASE: "Password must contain at least one uppercase letter",
    NO_LOWERCASE: "Password must contain at least one lowercase letter",
    NO_NUMBER: "Password must contain at least one number",
    INCORRECT: "Current password is incorrect",
    CHANGE_FAILED: "Failed to change password",
    RESET_FAILED: "Failed to reset password",
    TOKEN_INVALID: "Invalid or expired reset token",
    TOKEN_EXPIRED: "Reset token has expired",
    TOKEN_USED: "Reset token has already been used",
    SOCIAL_PROVIDER_NO_PASSWORD:
      "Password change not available. You signed in with a social provider.",
  },

  // Email Verification Errors
  EMAIL: {
    SEND_FAILED: "Failed to send email. Please try again",
    VERIFICATION_FAILED: "Failed to verify email",
    ALREADY_VERIFIED: "Email is already verified",
    TOKEN_INVALID: "Invalid or expired verification token",
    TOKEN_EXPIRED: "Verification token has expired",
    NO_EMAIL: "No email address associated with this account",
  },

  // File Upload Errors
  UPLOAD: {
    INVALID_TYPE: "Invalid file type",
    FILE_TOO_LARGE: "File size exceeds maximum allowed",
    UPLOAD_FAILED: "Failed to upload file",
    SAVE_FAILED: "Failed to save. Upload has been rolled back",
    AUTH_REQUIRED: "Authentication required. Please sign in and try again",
    DELETE_FAILED: "Failed to remove photo",
  },

  // Generic Errors
  GENERIC: {
    INTERNAL_ERROR: "An unexpected error occurred. Please try again",
    NOT_FOUND: "The requested resource was not found",
    BAD_REQUEST: "Invalid request",
    NETWORK_ERROR: "Network error. Please check your connection",
    TIMEOUT: "Request timed out. Please try again",
    UNKNOWN: "An unknown error occurred",
    USER_ID_REQUIRED: "User ID is required",
    PROFILE_PRIVATE: "This profile is private",
  },
} as const;

export const SUCCESS_MESSAGES = {
  // Authentication Success
  AUTH: {
    LOGIN_SUCCESS: "Welcome back!",
    LOGOUT_SUCCESS: "You have been logged out successfully",
    REGISTER_SUCCESS: "Account created successfully",
  },

  // User/Profile Success
  USER: {
    PROFILE_UPDATED: "Profile updated successfully",
    PASSWORD_CHANGED: "Password changed successfully",
    SETTINGS_SAVED: "Settings saved successfully",
    USER_UPDATED: "User updated successfully",
  },

  // Upload Success
  UPLOAD: {
    AVATAR_UPLOADED: "Avatar uploaded successfully",
    AVATAR_REMOVED: "Avatar removed successfully",
    FILE_UPLOADED: "File uploaded successfully",
  },

  // Email Success
  EMAIL: {
    VERIFICATION_SENT: "Verification email sent successfully",
    VERIFIED: "Email verified successfully",
    RESET_SENT: "Password reset link sent to your email",
  },

  // Password Reset Success
  PASSWORD: {
    RESET_SUCCESS: "Password reset successfully",
    RESET_EMAIL_SENT: "Password reset link sent to your email",
    UPDATED: "Password updated successfully",
  },

  // Account Success
  ACCOUNT: {
    DELETED: "Account deleted successfully",
  },
} as const;

export const INFO_MESSAGES = {
  EMAIL: {
    CHECK_INBOX: "Please check your email inbox for the verification link",
    CHECK_SPAM: "If you don't see the email, please check your spam folder",
  },

  PASSWORD: {
    REQUIREMENTS:
      "Password must be at least 8 characters and contain uppercase, lowercase, and numbers",
  },

  GENERAL: {
    LOADING: "Loading...",
    SAVING: "Saving...",
    PROCESSING: "Processing...",
  },
} as const;

export const CONFIRMATION_MESSAGES = {
  LOGOUT: "Are you sure you want to logout?",
  DELETE_ACCOUNT:
    "Are you sure you want to delete your account? This action cannot be undone.",
  DISCARD_CHANGES: "Are you sure you want to discard your changes?",
} as const;
