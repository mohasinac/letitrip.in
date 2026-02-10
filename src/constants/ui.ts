/**
 * UI Constants
 *
 * Centralized UI strings and labels used throughout the application
 */

export const UI_LABELS = {
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
    UPDATE_PASSWORD: "Update Password",
    DISCARD: "Discard",
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
  },

  // Status labels
  STATUS: {
    ACTIVE: "Active",
    INACTIVE: "Inactive",
    PENDING: "Pending",
    APPROVED: "Approved",
    REJECTED: "Rejected",
    COMPLETED: "Completed",
    CANCELLED: "Cancelled",
    DRAFT: "Draft",
    PUBLISHED: "Published",
    EMAIL_VERIFIED: "Email Verified ✓",
    EMAIL_NOT_VERIFIED: "Email Not Verified",
    PHONE_VERIFIED: "Phone Verified ✓",
    PHONE_NOT_VERIFIED: "Phone Not Verified",
    VERIFIED: "✓ Verified",
  },

  // Role labels
  ROLES: {
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
    CONTACT_US: "Contact Us",
    HELP_CENTER: "Help Center",
    ACCOUNT: "Account",
    SUPPORT: "Support",
    DARK_MODE: "Dark Mode",
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
    ROLE: "Role",
    ACCOUNT_ROLE: "Account Role",
    TOTAL_ORDERS: "Total Orders",
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

  // Auth messages
  AUTH: {
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

  // Admin content management
  ADMIN: {
    CONTENT: {
      TITLE: "Content Management",
      SUBTITLE: "Manage products, orders, and reviews",
      PRODUCTS: {
        TITLE: "Products",
        SUBTITLE: "Manage all product listings",
        VIEW: "View Products",
        CREATE: "Create Product",
        EDIT: "Edit Product",
        DELETE: "Delete Product",
        ICON: "📦",
      },
      ORDERS: {
        TITLE: "Orders",
        SUBTITLE: "Manage all orders",
        VIEW: "View Orders",
        DETAILS: "Order Details",
        APPROVE: "Approve Order",
        REJECT: "Reject Order",
        ICON: "🛒",
      },
      REVIEWS: {
        TITLE: "Reviews",
        SUBTITLE: "Moderate user reviews",
        VIEW: "View Reviews",
        APPROVE: "Approve Review",
        REJECT: "Reject Review",
        DELETE: "Delete Review",
        ICON: "⭐",
      },
      COMING_SOON: {
        TITLE: "Content Management Coming Soon",
        MESSAGE:
          "Advanced content management features are currently under development",
        ICON: "🚧",
      },
    },
  },

  // FAQ section
  FAQ: {
    WAS_THIS_HELPFUL: "Was this helpful?",
    HELPFUL: "Helpful",
    NOT_HELPFUL: "Not Helpful",
    RELATED_QUESTIONS: "Related Questions",
    VIEW_ALL: "View All FAQs",
    SEARCH_PLACEHOLDER: "Search FAQs...",
  },
} as const;

export const UI_PLACEHOLDERS = {
  EMAIL: "Enter your email address",
  PASSWORD: "Enter your password",
  SEARCH: "Search...",
  PHONE: "Enter phone number",
  NAME: "Enter your name",
  MESSAGE: "Enter your message",
  DESCRIPTION: "Enter description",
} as const;

export const UI_HELP_TEXT = {
  PASSWORD_REQUIREMENTS:
    "Must be at least 8 characters with uppercase, lowercase, and number",
  PHONE_FORMAT: "Format: +[country code][number]",
  PHONE_10_DIGIT: "Enter 10-digit mobile number",
  EMAIL_VERIFICATION: "Please verify your email to access all features",
  AVATAR_UPLOAD: "Upload a profile picture. Recommended size: 400x400px",
  AVATAR_FORMATS: "Supported formats: JPEG, PNG, WebP, GIF (max 5MB)",
} as const;
