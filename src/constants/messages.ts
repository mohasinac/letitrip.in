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
    INVALID_INDIAN_MOBILE: "Enter a valid 10-digit mobile number",
    INVALID_PINCODE: "Enter a valid 6-digit pincode",
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
    UPLOAD_ERROR: "Upload error:",
    SAVE_FAILED: "Failed to save. Upload has been rolled back",
    SAVE_ROLLBACK: "Save failed, cleaning up:",
    AUTH_REQUIRED: "Authentication required. Please sign in and try again",
    DELETE_FAILED: "Failed to remove photo",
    DELETE_OLD_FILE_FAILED: "Failed to delete old file:",
    CLEANUP_FAILED: "Failed to cleanup uploaded file:",
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

  // Database Errors
  DATABASE: {
    FETCH_FAILED: "Failed to fetch data",
    NOT_FOUND: "Record not found",
    CONNECTION_ERROR: "Database connection error",
  },

  // Session Errors
  SESSION: {
    FETCH_USER_PROFILE_ERROR: "Error fetching user profile",
    FIRESTORE_SUBSCRIPTION_ERROR: "Firestore subscription error",
    VALIDATION_FAILED: "Session validation failed",
    SERVER_LOGOUT_ERROR: "Server logout error",
    SIGN_OUT_ERROR: "Sign out error",
    CREATION_ERROR: "Session creation error",
  },

  // FAQ Errors
  FAQ: {
    VOTE_FAILED: "Failed to submit vote",
  },

  // Admin Errors
  ADMIN: {
    REVOKE_SESSION_FAILED: "Failed to revoke session",
    REVOKE_USER_SESSIONS_FAILED: "Failed to revoke user sessions",
  },

  // API Route Errors (server-side logging)
  API: {
    ROUTE_ERROR: "error:", // Used as suffix: "GET /api/endpoint error:"
    CAROUSEL_GET_ERROR: "GET /api/carousel error:",
    CAROUSEL_POST_ERROR: "POST /api/carousel error:",
    CAROUSEL_ID_GET_ERROR: "error:", // Template: `GET /api/carousel/${id} error:`
    CAROUSEL_ID_PATCH_ERROR: "error:", // Template: `PATCH /api/carousel/${id} error:`
    CAROUSEL_ID_DELETE_ERROR: "error:", // Template: `DELETE /api/carousel/${id} error:`
    SITE_SETTINGS_GET_ERROR: "GET /api/site-settings error:",
    SITE_SETTINGS_PATCH_ERROR: "PATCH /api/site-settings error:",
    REVIEWS_GET_ERROR: "GET /api/reviews error:",
    REVIEWS_POST_ERROR: "POST /api/reviews error:",
    REVIEWS_ID_GET_ERROR: "error:", // Template: `GET /api/reviews/${id} error:`
    REVIEWS_ID_PATCH_ERROR: "error:", // Template: `PATCH /api/reviews/${id} error:`
    REVIEWS_ID_DELETE_ERROR: "error:", // Template: `DELETE /api/reviews/${id} error:`
    REVIEWS_VOTE_POST_ERROR: "error:", // Template: `POST /api/reviews/${id}/vote error:`
    PRODUCTS_GET_ERROR: "GET /api/products error:",
    PRODUCTS_POST_ERROR: "POST /api/products error:",
    PRODUCTS_ID_GET_ERROR: "error:", // Template: `GET /api/products/${id} error:`
    PRODUCTS_ID_PATCH_ERROR: "error:", // Template: `PATCH /api/products/${id} error:`
    PRODUCTS_ID_DELETE_ERROR: "error:", // Template: `DELETE /api/products/${id} error:`
    MEDIA_UPLOAD_ERROR: "POST /api/media/upload error:",
    MEDIA_TRIM_ERROR: "POST /api/media/trim error:",
    MEDIA_CROP_ERROR: "POST /api/media/crop error:",
    PROFILE_UPDATE_ERROR: "Profile update error:",
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
    VERIFIED_SUCCESS: "Your email address has been successfully verified.",
    RESET_SENT: "Password reset link sent to your email",
  },

  // Phone Success
  PHONE: {
    VERIFIED: "Phone verified successfully",
    VERIFIED_SUCCESS: "Your phone number has been successfully verified.",
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
