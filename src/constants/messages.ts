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
    INSUFFICIENT_PERMISSIONS:
      "You do not have sufficient permissions for this action",
    SESSION_EXPIRED: "Your session has expired. Please login again",
    SESSION_CREATION_FAILED: "Failed to create session. Please try again",
    INVALID_CREDENTIALS: "Invalid email or password",
    ACCOUNT_DISABLED: "Your account has been disabled",
    EMAIL_NOT_VERIFIED: "Please verify your email address to continue",
    REGISTRATION_FAILED: "Registration failed. Please try again",
    LOGIN_FAILED: "Login failed. Please try again",
    SIGN_IN_FAILED: "Sign-in failed. Please try again",
    SIGN_IN_CANCELLED: "Sign-in was cancelled",
    POPUP_BLOCKED:
      "Pop-up blocked by browser. Please allow pop-ups and try again",
    API_KEY_NOT_CONFIGURED: "Firebase API key not configured",
    TOKEN_EXCHANGE_FAILED: "Failed to exchange custom token for ID token",
    ADMIN_ACCESS_REQUIRED: "Admin access required",
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
    FAILED: "Validation failed",
    MESSAGE_TOO_SHORT: "Message must be at least 10 characters",
    TOKEN_REQUIRED: "Verification token is required",
    VERIFICATION_FIELDS_REQUIRED: "Verification ID and code are required",
    VERIFICATION_CODE_FORMAT: "Verification code must be 6 digits",
    PRODUCT_ID_REQUIRED: "productId is required",
    INVALID_TIME_RANGE: "Invalid time range",
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
    TERMS_NOT_ACCEPTED: "You must accept the terms and conditions to register",
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
    TOO_WEAK: "Password is too weak. Please use a stronger password.",
    SAME_AS_CURRENT: "New password must be different from current password",
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
    SERVER_CONFIG_ERROR: "Server configuration error",
    NOT_IMPLEMENTED: "This feature is not yet implemented",
  },

  // Database Errors
  DATABASE: {
    FETCH_FAILED: "Failed to fetch data",
    NOT_FOUND: "Record not found",
    CONNECTION_ERROR: "Database connection error",
  },

  // Session Errors
  SESSION: {
    FETCH_FAILED: "Failed to fetch sessions",
    FETCH_USER_PROFILE_ERROR: "Error fetching user profile",
    FIRESTORE_SUBSCRIPTION_ERROR: "Firestore subscription error",
    VALIDATION_FAILED: "Session validation failed",
    SERVER_LOGOUT_ERROR: "Server logout error",
    SIGN_OUT_ERROR: "Sign out error",
    CREATION_ERROR: "Session creation error",
    NOT_FOUND: "Session not found",
    INVALID: "Invalid session",
    ID_REQUIRED: "Session ID required",
    INVALID_COOKIE: "Invalid session cookie",
    REVOKED_OR_EXPIRED: "Session revoked or expired",
    USER_NOT_FOUND_OR_DISABLED: "User not found or disabled",
    CANNOT_REVOKE_OTHERS: "You can only revoke your own sessions",
  },

  // Admin Errors
  ADMIN: {
    REVOKE_SESSION_FAILED: "Failed to revoke session",
    REVOKE_USER_SESSIONS_FAILED: "Failed to revoke user sessions",
    UPDATE_USER_ROLE_FAILED: "Failed to update user role",
    BAN_USER_FAILED: "Failed to ban user",
    UNBAN_USER_FAILED: "Failed to unban user",
    DELETE_USER_FAILED: "Failed to delete user",
    LOAD_SETTINGS_FAILED: "Failed to load settings",
    SAVE_SETTINGS_FAILED: "Failed to save settings",
    ALGOLIA_NOT_CONFIGURED:
      "Algolia is not configured. Set ALGOLIA_APP_ID and ALGOLIA_ADMIN_API_KEY.",
    ALGOLIA_SYNC_FAILED: "Failed to sync products to Algolia",
  },

  // Review Errors
  REVIEW: {
    APPROVE_FAILED: "Failed to approve review",
    REJECT_FAILED: "Failed to reject review",
    DELETE_FAILED: "Failed to delete review",
    APPROVE_BULK_FAILED: "Failed to approve some reviews",
    FETCH_FAILED: "Failed to load reviews",
    SUBMIT_FAILED: "Failed to submit review",
    NOT_FOUND: "Review not found",
    ALREADY_REVIEWED: "You have already reviewed this product",
    PURCHASE_REQUIRED: "You must purchase this product before leaving a review",
    UPDATE_NOT_ALLOWED: "You do not have permission to update this review",
    DELETE_NOT_ALLOWED: "You do not have permission to delete this review",
    UPDATE_FAILED: "Failed to update review",
    VOTE_FAILED: "Failed to record vote",
  },

  // FAQ Errors
  FAQ: {
    VOTE_FAILED: "Failed to submit vote",
    SAVE_FAILED: "Failed to save FAQ",
    DELETE_FAILED: "Failed to delete FAQ",
    FETCH_FAILED: "Failed to load FAQs",
    UPDATE_FAILED: "Failed to update FAQ",
    NOT_FOUND: "FAQ not found",
    CREATE_FAILED: "Failed to create FAQ",
  },

  // Category Errors
  CATEGORY: {
    SAVE_FAILED: "Failed to save category",
    DELETE_FAILED: "Failed to delete category",
    FETCH_FAILED: "Failed to load categories",
    UPDATE_FAILED: "Failed to update category",
    CREATE_FAILED: "Failed to create category",
    NOT_FOUND: "Category not found",
    NOT_FOUND_AFTER_UPDATE: "Category not found after update",
    HAS_CHILDREN: "Cannot delete category with children",
    HAS_PRODUCTS: "Cannot delete category with products",
  },

  // Carousel Errors
  CAROUSEL: {
    SAVE_FAILED: "Failed to save slide",
    DELETE_FAILED: "Failed to delete slide",
    FETCH_FAILED: "Failed to load carousel slides",
    UPDATE_FAILED: "Failed to update slide",
    CREATE_FAILED: "Failed to create slide",
    NOT_FOUND: "Carousel slide not found",
    MAX_ACTIVE_REACHED: "Maximum 5 active carousel slides allowed",
    REORDER_FAILED: "Failed to reorder carousel slides",
  },

  // Homepage Section Errors
  SECTION: {
    SAVE_FAILED: "Failed to save section",
    DELETE_FAILED: "Failed to delete section",
    FETCH_FAILED: "Failed to load sections",
    UPDATE_FAILED: "Failed to update section",
    CREATE_FAILED: "Failed to create section",
    NOT_FOUND: "Homepage section not found",
    REORDER_FAILED: "Failed to reorder homepage sections",
  },

  // Order Errors
  ORDER: {
    FETCH_FAILED: "Failed to load orders",
    UPDATE_FAILED: "Failed to update order",
    CREATE_FAILED: "Failed to create order",
    CANCEL_FAILED: "Failed to cancel order",
    NOT_FOUND: "Order not found",
    CANNOT_CANCEL: "This order cannot be cancelled",
  },

  // Payout Errors
  PAYOUT: {
    FETCH_FAILED: "Failed to load payouts",
    CREATE_FAILED: "Failed to create payout request",
    UPDATE_FAILED: "Failed to update payout",
    NOT_FOUND: "Payout not found",
    NO_EARNINGS: "No available earnings to request a payout",
    ALREADY_PENDING: "You already have a pending payout request",
    INVALID_METHOD: "Invalid payment method",
  },

  // Product Errors
  PRODUCT: {
    FETCH_FAILED: "Failed to load products",
    UPDATE_FAILED: "Failed to update product",
    CREATE_FAILED: "Failed to create product",
    DELETE_FAILED: "Failed to delete product",
    NOT_FOUND: "Product not found",
    NOT_FOUND_AFTER_UPDATE: "Product not found after update",
    UPDATE_NOT_ALLOWED: "You do not have permission to update this product",
    DELETE_NOT_ALLOWED: "You do not have permission to delete this product",
    INVALID_STATUS_TRANSITION: "This status change is not allowed",
  },

  // Phone Errors
  PHONE: {
    NO_PHONE: "No phone number associated with this account",
    ALREADY_IN_USE: "Phone number is already in use",
    VERIFY_FAILED: "Failed to verify phone number",
    ADD_FAILED: "Failed to add phone number",
  },

  // Media Errors
  MEDIA: {
    TRIM_FAILED: "Failed to trim video",
    CROP_FAILED: "Failed to crop image",
    NO_FILE: "No file provided",
  },

  // Address Errors
  ADDRESS: {
    FETCH_FAILED: "Failed to load addresses",
    CREATE_FAILED: "Failed to add address",
    UPDATE_FAILED: "Failed to update address",
    DELETE_FAILED: "Failed to delete address",
    SET_DEFAULT_FAILED: "Failed to set default address",
    NOT_FOUND: "Address not found",
  },

  // Cart Errors
  CART: {
    FETCH_FAILED: "Failed to load cart",
    ADD_FAILED: "Failed to add item to cart",
    UPDATE_FAILED: "Failed to update cart item",
    REMOVE_FAILED: "Failed to remove item from cart",
    CLEAR_FAILED: "Failed to clear cart",
    ITEM_NOT_FOUND: "Cart item not found",
    PRODUCT_NOT_FOUND: "Product not found or unavailable",
    OUT_OF_STOCK: "Product is out of stock",
    INSUFFICIENT_STOCK: "Insufficient stock available",
  },

  // Checkout Errors
  CHECKOUT: {
    FAILED: "Failed to place order. Please try again.",
    CART_EMPTY: "Your cart is empty",
    ADDRESS_REQUIRED: "Please select a shipping address",
    PRODUCT_UNAVAILABLE: "One or more products are no longer available",
    INSUFFICIENT_STOCK: "Insufficient stock for one or more items",
    PAYMENT_FAILED: "Payment processing failed",
  },
  COUPON: {
    NOT_FOUND: "Coupon not found",
    FETCH_FAILED: "Failed to load coupons",
    CREATE_FAILED: "Failed to create coupon",
    UPDATE_FAILED: "Failed to update coupon",
    DELETE_FAILED: "Failed to delete coupon",
    INVALID: "This coupon is invalid or has expired",
    ALREADY_USED: "You have already used this coupon",
    USAGE_LIMIT_REACHED: "This coupon has reached its usage limit",
    MIN_PURCHASE_NOT_MET: "Minimum purchase amount not met for this coupon",
    NOT_APPLICABLE: "This coupon is not applicable to your cart",
    DUPLICATE_CODE: "A coupon with this code already exists",
  },
  NEWSLETTER: {
    SUBSCRIBE_FAILED: "Failed to subscribe to newsletter",
    INVALID_EMAIL: "Please enter a valid email address to subscribe",
  },

  // Wishlist Errors
  WISHLIST: {
    FETCH_FAILED: "Failed to load wishlist",
    ADD_FAILED: "Failed to add item to wishlist",
    REMOVE_FAILED: "Failed to remove item from wishlist",
    ALREADY_EXISTS: "Item is already in your wishlist",
    NOT_FOUND: "Item not found in wishlist",
  },

  BID: {
    FETCH_FAILED: "Failed to load bids",
    CREATE_FAILED: "Failed to place bid",
    NOT_FOUND: "Bid not found",
    AUCTION_ENDED: "This auction has already ended",
    AUCTION_NOT_FOUND: "Auction product not found",
    NOT_AN_AUCTION: "This product is not an auction",
    BID_TOO_LOW: "Your bid must be higher than the current bid",
    OWN_AUCTION: "You cannot bid on your own auction",
  },

  CONTACT: {
    SEND_FAILED: "Failed to send your message. Please try again.",
    VALIDATION_FAILED: "Please fill in all required fields.",
  },

  BLOG: {
    NOT_FOUND: "Blog post not found",
    FETCH_FAILED: "Failed to fetch blog posts",
    FETCH_POST_FAILED: "Failed to fetch blog post",
    CREATE_FAILED: "Failed to create blog post",
    UPDATE_FAILED: "Failed to update blog post",
    DELETE_FAILED: "Failed to delete blog post",
    SLUG_TAKEN: "A post with this slug already exists",
  },

  PROMOTIONS: {
    FETCH_FAILED: "Failed to fetch promotions",
  },

  NOTIFICATION: {
    NOT_FOUND: "Notification not found",
    FETCH_FAILED: "Failed to fetch notifications",
    CREATE_FAILED: "Failed to create notification",
    UPDATE_FAILED: "Failed to update notification",
    DELETE_FAILED: "Failed to delete notification",
    COUNT_FAILED: "Failed to get unread count",
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
    SITE_SETTINGS_AUDIT_LOG: "AUDIT: Admin updated site settings",
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
    CART_GET_ERROR: "GET /api/cart error:",
    CART_POST_ERROR: "POST /api/cart error:",
    CART_ITEM_PATCH_ERROR: "error:", // Template: `PATCH /api/cart/${itemId} error:`
    CART_ITEM_DELETE_ERROR: "error:", // Template: `DELETE /api/cart/${itemId} error:`
    MEDIA_UPLOAD_ERROR: "POST /api/media/upload error:",
    MEDIA_TRIM_ERROR: "POST /api/media/trim error:",
    MEDIA_CROP_ERROR: "POST /api/media/crop error:",
    PROFILE_UPDATE_ERROR: "Profile update error:",
    ADMIN_SESSIONS_ERROR: "Admin sessions fetch error:",
    LOGOUT_REVOCATION_ERROR: "Session revocation error:",
    LOGOUT_TOKEN_ERROR: "Token revocation error:",
  },
} as const;

export const SUCCESS_MESSAGES = {
  CLIPBOARD: {
    LINK_COPIED: "Link copied to clipboard!",
  },
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
    PHONE_VERIFIED: "Phone number verified successfully",
    ACCOUNT_DELETED: "User account deleted successfully",
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
    VALIDATED: "Phone number validated successfully",
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

  // Admin Success
  ADMIN: {
    SETTINGS_SAVED: "Settings saved successfully",
    USER_ROLE_UPDATED: "User role updated successfully",
    USER_BANNED: "User banned successfully",
    USER_UNBANNED: "User unbanned successfully",
    USER_DELETED: "User deleted successfully",
    SESSION_REVOKED: "Session revoked successfully",
    SESSIONS_REVOKED: "User sessions revoked successfully",
    ALGOLIA_SYNCED: "Products synced to Algolia successfully",
  },

  // Review Success
  REVIEW: {
    APPROVED: "Review approved successfully",
    REJECTED: "Review rejected successfully",
    DELETED: "Review deleted successfully",
    BULK_APPROVED: "All pending reviews approved successfully",
    SUBMITTED: "Review submitted successfully",
    SUBMITTED_PENDING_MODERATION:
      "Review submitted successfully. It will be visible after moderation.",
    VOTE_RECORDED: "Vote recorded successfully",
  },

  // FAQ Success
  FAQ: {
    SAVED: "FAQ saved successfully",
    DELETED: "FAQ deleted successfully",
    UPDATED: "FAQ updated successfully",
    CREATED: "FAQ created successfully",
    VOTE_SUBMITTED: "Vote submitted successfully",
    VOTE_HELPFUL: "Thank you for your feedback!",
    VOTE_NOT_HELPFUL:
      "Thank you for your feedback. We'll work to improve this answer.",
  },

  // Category Success
  CATEGORY: {
    SAVED: "Category saved successfully",
    DELETED: "Category deleted successfully",
    UPDATED: "Category updated successfully",
    CREATED: "Category created successfully",
  },

  // Carousel Success
  CAROUSEL: {
    SAVED: "Slide saved successfully",
    DELETED: "Slide deleted successfully",
    UPDATED: "Slide updated successfully",
    CREATED: "Slide created successfully",
    REORDERED: "Carousel slides reordered successfully",
  },

  // Homepage Section Success
  SECTION: {
    SAVED: "Section saved successfully",
    DELETED: "Section deleted successfully",
    UPDATED: "Section updated successfully",
    CREATED: "Section created successfully",
    REORDERED: "Homepage sections reordered successfully",
  },

  // Order Success
  ORDER: {
    CREATED: "Order placed successfully",
    UPDATED: "Order updated successfully",
    CANCELLED: "Order cancelled successfully",
  },

  // Payout Success
  PAYOUT: {
    CREATED: "Payout request submitted successfully",
    UPDATED: "Payout updated successfully",
    COMPLETED: "Payout processed successfully",
  },

  // Product Success
  PRODUCT: {
    CREATED: "Product created successfully",
    UPDATED: "Product updated successfully",
    DELETED: "Product deleted successfully",
  },

  // Address Success
  ADDRESS: {
    CREATED: "Address added successfully",
    UPDATED: "Address updated successfully",
    DELETED: "Address deleted successfully",
    DEFAULT_SET: "Default address set successfully",
  },

  // Cart Success
  CART: {
    ITEM_ADDED: "Item added to cart",
    ITEM_UPDATED: "Cart updated",
    ITEM_REMOVED: "Item removed from cart",
    CLEARED: "Cart cleared",
  },

  // Checkout Success
  CHECKOUT: {
    ORDER_PLACED: "Order placed successfully!",
    PAYMENT_RECEIVED: "Payment received. Your order is confirmed.",
  },
  // Coupon Success
  COUPON: {
    CREATED: "Coupon created successfully",
    UPDATED: "Coupon updated successfully",
    DELETED: "Coupon deleted successfully",
    DEACTIVATED: "Coupon deactivated",
    REACTIVATED: "Coupon reactivated",
    APPLIED: "Coupon applied successfully",
    VALIDATED: "Coupon is valid",
  },
  SESSION: {
    ACTIVITY_UPDATED: "Activity updated",
  },

  // Media Success
  MEDIA: {
    VIDEO_TRIMMED: "Video trimmed successfully",
    IMAGE_CROPPED: "Image cropped successfully",
  },

  // Phone Success (additional)
  PHONE_VALIDATED: "Phone number validated successfully",

  // Logs Success
  LOGS: {
    WRITTEN: "Log written successfully",
  },

  // Newsletter Success
  NEWSLETTER: {
    SUBSCRIBED: "Thank you for subscribing! Check your email for confirmation.",
  },

  // Wishlist Success
  WISHLIST: {
    ADDED: "Item added to wishlist",
    REMOVED: "Item removed from wishlist",
    CLEARED: "Wishlist cleared",
  },

  BID: {
    PLACED: "Bid placed successfully",
  },

  CONTACT: {
    SENT: "Your message has been sent! We'll get back to you shortly.",
  },

  BLOG: {
    CREATED: "Blog post created successfully",
    UPDATED: "Blog post updated successfully",
    DELETED: "Blog post deleted successfully",
    PUBLISHED: "Blog post published successfully",
  },

  NOTIFICATION: {
    SENT: "Notification sent successfully",
    READ: "Notification marked as read",
    ALL_READ: "All notifications marked as read",
    DELETED: "Notification deleted",
    ALL_CLEARED: "All notifications cleared",
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
