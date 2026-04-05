/**
 * UI Labels — Core (Part 1 of 4)
 *
 * Split from ui.ts to avoid Turbopack chunk-generation failure
 * (EcmascriptModuleContent::new_merged error in Next.js 16 Turbopack when
 * a single file contains a large deeply-nested `as const` object).
 *
 * Do NOT import directly — use `UI_LABELS` from `@/constants`.
 */

export const _UI_LABELS_CORE = {
  // Loading states
  LOADING: {
    DEFAULT: "Loading...",
    USERS: "Loading users...",
    DATA: "Loading data...",
    PAGE: "Loading page...",
    CONTENT: "Loading content...",
    UPLOADING: "Uploading...",
    SAVING: "Saving...",
    SENDING: "Sending...",
    CHANGING: "Changing...",
    FAILED: "Failed to load data.",
  },

  // Empty states
  EMPTY: {
    NO_DATA: "No data available",
    NO_USERS: "No users found",
    NO_RESULTS: "No results found",
    NO_ITEMS: "No items to display",
    NO_EMAIL: "No email address",
    NO_PHONE: "No phone number",
    NO_ADDRESSES: "No saved addresses",
    NOT_SET: "Not set",
  },

  // Error pages
  ERROR_PAGES: {
    NOT_FOUND: {
      TITLE: "404 - Page Not Found",
      DESCRIPTION:
        "The page you're looking for doesn't exist or has been moved.",
    },
    UNAUTHORIZED: {
      TITLE: "401 - Unauthorized",
      DESCRIPTION: "You don't have permission to access this page.",
    },
    FORBIDDEN: {
      TITLE: "403 - Forbidden",
      DESCRIPTION: "Access to this resource is forbidden.",
    },
    SERVER_ERROR: {
      TITLE: "500 - Server Error",
      DESCRIPTION: "Something went wrong on our end. Please try again later.",
    },
    GENERIC_ERROR: {
      TITLE: "Oops! Something Went Wrong",
      DESCRIPTION: "An unexpected error occurred. Please try again.",
    },
    CRITICAL_ERROR: {
      TITLE: "Critical Error",
      DESCRIPTION:
        "A critical error occurred. Please try refreshing the page or contact support if the problem persists.",
    },
  },

  // Table labels
  TABLE: {
    ACTIONS: "Actions",
    NAME: "Name",
    STATUS: "Status",
    NO_DATA_TITLE: "No Data",
    NO_DATA_DESCRIPTION: "No data available",
    SHOWING: "Showing",
    OF: "of",
    ENTRIES: "entries",
    SORT_BY: "Sort by",
    PER_PAGE: "Per page",
    RESULTS: "results",
    NO_RESULTS: "No results found",
    LOAD_MORE: "Load 10 more",
    PAGINATION_LABEL: "Pagination",
  },

  // Actions
  ACTIONS: {
    SAVE: "Save",
    CANCEL: "Cancel",
    DELETE: "Delete",
    EDIT: "Edit",
    CREATE: "Create",
    UPDATE: "Update",
    SUBMIT: "Submit",
    CONFIRM: "Confirm",
    CLOSE: "Close",
    BACK: "Back",
    NEXT: "Next",
    PREVIOUS: "Previous",
    SEARCH: "Search",
    FILTER: "Filter",
    CLEAR: "Clear",
    APPLY: "Apply",
    RESET: "Reset",
    REFRESH: "Refresh",
    RETRY: "Retry",
    TRY_AGAIN: "Try Again",
    UPLOAD: "Upload",
    DOWNLOAD: "Download",
    EXPORT: "Export",
    IMPORT: "Import",
    YES: "Yes",
    NO: "No",
    LOGIN: "Login",
    LOGOUT: "Logout",
    GO_HOME: "Go Home",
    GO_HOME_NOW: "Go Home Now",
    CHANGE_PASSWORD: "Change Password",
    RESEND_VERIFICATION: "Resend Verification Email",
    EDIT_PROFILE: "Edit Profile",
    VIEW_DETAILS: "View Details",
    MANAGE: "Manage",
    VIEW: "View",
    VIEW_ALL: "View All",
    SUBSCRIBE: "Subscribe",
    UPDATE_PASSWORD: "Update Password",
    DISCARD: "Discard",
    COPY_LINK: "Copy Link",
    LINK_COPIED: "Link copied to clipboard!",
    ADD_ADDRESS: "Add new address",
    ADD_CATEGORY: "New category",
    VIEW_ALL_ARROW: "View all →",
    LOAD_MORE: "Load more",
    CLEAR_ALL: "Clear all",
    APPLY_FILTERS: "Apply filters",
    ADD_PRODUCT: "Add product",
    PLACE_ORDER: "Place order",
    SEND_MESSAGE: "Send message",
    START_SELLING: "Start selling",
    TRACK_MY_ORDER: "Track my order",
    WRITE_REVIEW: "Write a review",
    BROWSE_PRODUCTS: "Browse products",
    CLEAR_SEARCH: "Clear search",
    VIEW_MY_LISTINGS: "View my listings",
  },

  // Sort labels — plain-language; use instead of raw API values visible to users
  SORT: {
    LABEL: "Sort by",
    NEWEST_FIRST: "Newest first",
    OLDEST_FIRST: "Oldest first",
    PRICE_LOW_HIGH: "Price: low to high",
    PRICE_HIGH_LOW: "Price: high to low",
    MOST_POPULAR: "Most popular",
    ENDING_SOON: "Ending soon",
    TITLE_AZ: "Title A–Z",
  },

  // Form labels
  FORM: {
    EMAIL: "Email Address",
    PASSWORD: "Password",
    CONFIRM_PASSWORD: "Confirm Password",
    CURRENT_PASSWORD: "Current Password",
    NEW_PASSWORD: "New Password",
    FIRST_NAME: "First Name",
    LAST_NAME: "Last Name",
    DISPLAY_NAME: "Display Name",
    PHONE: "Phone Number",
    ADDRESS: "Address",
    CITY: "City",
    STATE: "State",
    ZIP_CODE: "ZIP Code",
    COUNTRY: "Country",
    EMAIL_VERIFICATION: "Email Verification",
    PHONE_VERIFICATION: "Phone Verification",
    PICKUP_ADDRESS: "Pickup Address",
    CATEGORY: "Category",
    ROLE_FILTER: "Role Filter",
  },

  // Status labels
  STATUS: {
    ALL: "All",
    ACTIVE: "Active",
    INACTIVE: "Inactive",
    PENDING: "Pending",
    APPROVED: "Approved",
    REJECTED: "Rejected",
    COMPLETED: "Completed",
    CANCELLED: "Cancelled",
    DRAFT: "Draft",
    PUBLISHED: "Published",
    ARCHIVED: "Archived",
    EMAIL_VERIFIED: "Email Verified ✓",
    EMAIL_NOT_VERIFIED: "Email Not Verified",
    PHONE_VERIFIED: "Phone Verified ✓",
    PHONE_NOT_VERIFIED: "Phone Not Verified",
    VERIFIED: "✓ Verified",
    SUBSCRIBED: "Subscribed!",
  },

  // Role labels
  ROLES: {
    ALL: "All Roles",
    USER: "User",
    SELLER: "Seller",
    MODERATOR: "Moderator",
    ADMIN: "Admin",
  },

  // Confirmation messages
  CONFIRM: {
    DELETE: "Are you sure you want to delete this?",
    CANCEL: "Are you sure you want to cancel?",
    DISCARD: "Are you sure you want to discard changes?",
    LOGOUT: "Are you sure you want to log out?",
    UNSAVED_CHANGES:
      "You have unsaved changes. Are you sure you want to leave this page?",
  },

  // Navigation labels
  NAV: {
    HOME: "Home",
    PRODUCTS: "Products",
    AUCTIONS: "Auctions",
    SELLERS: "Sellers",
    CATEGORIES: "Categories",
    PROMOTIONS: "Promotions",
    PROFILE: "Profile",
    ORDERS: "Orders",
    WISHLIST: "Wishlist",
    ADDRESSES: "Addresses",
    SETTINGS: "Settings",
    SEARCH: "Search",
    CONTACT_US: "Contact Us",
    HELP_CENTER: "Help Center",
    ACCOUNT: "Account",
    SUPPORT: "Support",
    DARK_MODE: "Dark Mode",
    SITE_SETTINGS: "Site Settings",
    CAROUSEL: "Carousel",
    SECTIONS: "Sections",
    FAQS: "FAQs",
    REVIEWS: "Reviews",
    MEDIA: "Media",
    LOGIN: "Login",
    REGISTER: "Register",
    LOGOUT: "Logout",
    DASHBOARD: "Dashboard",
    ADMIN_DASHBOARD: "Admin Dashboard",
    SELLER_DASHBOARD: "Seller Dashboard",
    MY_PROFILE: "My Profile",
    MY_ORDERS: "My Orders",
    SELLER: "Seller",
    USERS: "Users",
    PRODUCTS_ADMIN: "Products",
    MY_PRODUCTS: "My Products",
    MY_SALES: "My Sales",
    MY_AUCTIONS: "My Auctions",
    BIDS_ADMIN: "Bids",
    BLOG_ADMIN: "Blog",
    PAYOUTS_ADMIN: "Payouts",
    NEWSLETTER_ADMIN: "Newsletter",
    EVENTS_ADMIN: "Events",
  },

  // Profile section
  PROFILE: {
    EDIT_PROFILE: "Edit Profile",
    VIEW_PROFILE: "View Profile",
    MY_PROFILE: "My Profile",
    PROFILE_SETTINGS: "Profile Settings",
    PROFILE_INFORMATION: "Profile Information",
    ACCOUNT_INFORMATION: "Account Information",
    SAVED_ADDRESSES: "Saved Addresses",
    SECURITY_SETTINGS: "Security Settings",
    USER_ID: "User ID",
    DISPLAY_NAME: "Display Name",
    ROLE: "Role",
    ACCOUNT_ROLE: "Account Role",
    TOTAL_ORDERS: "Total Orders",
    SELLER_PRODUCTS_TITLE: "Listed Products",
    SELLER_REVIEWS_TITLE: "Reviews Received",
    NO_PRODUCTS: "No products listed yet",
    NO_PRODUCTS_DESC: "This seller hasn't listed any products yet.",
    NO_REVIEWS: "No reviews yet",
    NO_REVIEWS_DESC: "This seller hasn't received any reviews yet.",
    VIEW_PRODUCT: "View Product",
    VERIFIED_PURCHASE: "Verified Purchase",
    MEMBER_SINCE: "Member since",
    STAT_ORDERS: "Orders",
    STAT_AUCTIONS_WON: "Auctions Won",
    STAT_ITEMS_SOLD: "Items Sold",
    STAT_REVIEWS: "Reviews",
  },

  // Wishlist section
  WISHLIST: {
    TITLE: "My Wishlist",
    DESCRIPTION: "Save items you love to your wishlist",
    EMPTY: "Your wishlist is empty",
    ADD_TO_WISHLIST: "Add to Wishlist",
    REMOVE_FROM_WISHLIST: "Remove from Wishlist",
    ITEMS_COUNT: "Wishlist Items",
  },

  // Messages
  MESSAGES: {
    EMAIL_VERIFICATION_REQUIRED:
      "Please verify your email address to access all features. Check your inbox for a verification link.",
    PHONE_VERIFICATION_REQUIRED:
      "Verify your phone number to enable additional security features.",
    UNSAVED_CHANGES_WARNING:
      "You have unsaved changes. Are you sure you want to leave?",
    EMAIL_VERIFIED_SUCCESS:
      "Your email address has been successfully verified.",
    PHONE_VERIFIED_SUCCESS: "Your phone number has been successfully verified.",
  },

  // Auth messages and labels
  AUTH: {
    // Login page
    LOGIN: {
      TITLE: "Sign in to your account",
      OR: "Or",
      CREATE_ACCOUNT_LINK: "create a new account",
      REMEMBER_ME: "Remember me",
      FORGOT_PASSWORD_LINK: "Forgot password?",
      SIGNING_IN: "Signing in...",
      SIGN_IN: "Sign in",
      OR_CONTINUE_WITH: "Or continue with",
      GOOGLE: "Google",
    },

    // Register page
    REGISTER: {
      TITLE: "Create your account",
      SIGN_IN_LINK: "sign in to your account",
      DISPLAY_NAME_LABEL: "Display Name (Optional)",
      DISPLAY_NAME_PLACEHOLDER: "John Doe",
      CONFIRM_PASSWORD: "Confirm Password",
      ACCEPT_TERMS: "I agree to the",
      TERMS_OF_SERVICE: "Terms of Service",
      PRIVACY_POLICY: "Privacy Policy",
      AND: "and",
      OR: "Or",
      CREATING_ACCOUNT: "Creating account...",
      CREATE_ACCOUNT: "Create account",
      PASSWORDS_NO_MATCH: "Passwords do not match",
      MUST_ACCEPT_TERMS: "You must accept the terms and conditions",
      GOOGLE_REGISTER_FAILED: "Google registration failed",
    },

    // Forgot Password page
    FORGOT_PASSWORD: {
      TITLE: "Reset your password",
      PAGE_TITLE: "Forgot Your Password?",
      SUBTITLE:
        "Enter your email address and we'll send you a link to reset your password.",
      SEND_RESET_LINK: "Send Reset Link",
      SEND_RESET_EMAIL: "Send Reset Link",
      SENDING: "Sending...",
      CHECK_EMAIL: "Check Your Email",
      RESET_LINK_SENT:
        "We've sent a password reset link to your email address. Please check your inbox and spam folder.",
      RESET_LINK_SENT_TO:
        "If an account exists with {email}, you will receive a password reset link shortly.",
      LINK_EXPIRES: "The link will expire in 1 hour for security reasons.",
      REMEMBER_PASSWORD: "Remember your password?",
      SIGN_IN_LINK: "Sign in",
      RETURN_TO_LOGIN: "Return to Login",
      SEND_ANOTHER_EMAIL: "Send Another Email",
      BACK_TO: "Back to",
      FAILED_SEND_EMAIL: "Failed to send reset email",
    },

    // Reset Password page
    RESET_PASSWORD: {
      TITLE: "Create new password",
      PAGE_TITLE: "Reset Your Password",
      SUBTITLE: "Choose a strong password for your account",
      SUBTITLE_SHORT: "Enter your new password below",
      NEW_PASSWORD: "New Password",
      CONFIRM_NEW_PASSWORD: "Confirm New Password",
      CONFIRM_NEW_PASSWORD_PLACEHOLDER: "Confirm new password",
      RESET_PASSWORD: "Reset Password",
      RESETTING: "Resetting...",
      SUCCESS: "Password Reset Successful!",
      SUCCESS_MESSAGE:
        "Your password has been successfully reset. You can now log in with your new password.",
      CONTINUE_TO_LOGIN: "Continue to Login",
      GO_TO_LOGIN: "Go to Login",
      INVALID_TOKEN: "Invalid or expired reset link",
      INVALID_OR_MISSING_TOKEN: "Invalid or missing reset token",
      PASSWORDS_NO_MATCH: "Passwords do not match",
    },

    // Verify Email page
    VERIFY_EMAIL: {
      VERIFYING: "Verifying your email...",
      VERIFYING_TITLE: "Verifying Your Email",
      VERIFYING_MESSAGE: "Please wait while we verify your email address...",
      SUCCESS: "Email Verified!",
      FAILED: "Verification Failed",
      CONTINUE_TO_DASHBOARD: "Continue to Dashboard",
      GO_TO_PROFILE: "Go to Profile",
      GO_TO_HOME: "Go to Home",
      SUCCESS_MESSAGE:
        "Your email has been successfully verified. You can now access all features of your account.",
      ALREADY_VERIFIED: "Email already verified",
      NOT_YET_VERIFIED: "Email not yet verified. Please check your email.",
      PLEASE_SIGN_IN: "Please sign in to verify your email.",
      CHECK_FAILED: "Verification check failed",
      NO_TOKEN: "No verification token provided",
      INVALID_TOKEN_MESSAGE:
        "The verification link may have expired or is invalid. Please request a new verification email.",
      RESEND_LINK: "Resend verification link",
    },

    // Shared auth strings
    SHARED: {
      EMAIL_ADDRESS: "Email Address",
      PASSWORD: "Password",
      EMAIL_PLACEHOLDER: "your@email.com",
      PASSWORD_PLACEHOLDER: "••••••••",
    },

    // System messages
    PHONE_LOGIN_NOT_IMPLEMENTED: "Phone login not yet implemented",
    PHONE_REGISTER_NOT_IMPLEMENTED: "Phone registration not yet implemented",
    EMAIL_OR_PHONE_REQUIRED: "Email or phone number required",
    DEFAULT_DISPLAY_NAME: "User",
    DEFAULT_ROLE: "user",
    ID_TOKEN_REQUIRED: "ID token required",
    SESSION_CREATE_FAILED: "Failed to create session",
    SESSION_CLEAR_FAILED: "Failed to clear session",
    RATE_LIMIT_EXCEEDED: "Too many requests. Please try again later.",
    AUTHENTICATION_REQUIRED: "Authentication required",
    ACCOUNT_DISABLED: "Account disabled",
    EMAIL_VERIFICATION_REQUIRED_SHORT: "Email verification required",
    INSUFFICIENT_PERMISSIONS: "Insufficient permissions",
    ACCESS_DENIED: "Access Denied",
    REDIRECTING_IN: "Redirecting to home page in",
    SECONDS: "seconds...",
  },

  // Settings page
  SETTINGS: {
    TITLE: "Account Settings",
    UNSAVED_BANNER: "You have unsaved changes",
    UNSAVED_DETAIL: "Save your changes before leaving, or they will be lost.",
    SAVE_CHANGES: "Save Changes",
    SAVING: "Saving...",
  },

  // Avatar upload
  AVATAR: {
    TITLE: "Adjust Image",
    INSTRUCTION: "Drag to reposition • Use slider to zoom",
    ZOOM: "Zoom",
    POSITION: "Position",
    RESET: "Reset to center",
    SAVE_CHANGES: "Save Changes",
    CHOOSE_IMAGE: "Choose Image",
    CHANGE_PHOTO: "Change Photo",
    REMOVE_PHOTO: "Remove Photo",
    SAVE_AVATAR: "Save Avatar",
    CANCEL_CHANGE: "Cancel",
    UPLOADING: "Uploading...",
    SAVING: "Saving...",
    READY_TO_SAVE: "Click Save Avatar to apply your new profile picture.",
    RECOMMENDED_SIZE: "Upload a profile picture. Recommended size: 400x400px",
    SUPPORTED_FORMATS: "Supported formats: JPEG, PNG, WebP, GIF (max 5MB)",
    ZOOM_WARNING_TITLE: "Image quality warning",
    ZOOM_WARNING_MESSAGE:
      "Zooming out too much may result in a small, pixelated image. Consider uploading a larger image or keeping zoom at 100% or higher.",
    ALT_TEXT: "Profile avatar",
    ALT_PREVIEW: "Preview",
    ZOOM_IN: "Zoom in",
    ZOOM_OUT: "Zoom out",
    FALLBACK_USER: "User",
    DEFAULT_INITIAL: "U",
  },
} as const;
