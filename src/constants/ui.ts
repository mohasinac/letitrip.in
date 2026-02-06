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
  },

  // Empty states
  EMPTY: {
    NO_DATA: "No data available",
    NO_USERS: "No users found",
    NO_RESULTS: "No results found",
    NO_ITEMS: "No items to display",
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
    SHOPS: "Shops",
    STICKERS: "Stickers",
    PROFILE: "Profile",
    ORDERS: "Orders",
    WISHLIST: "Wishlist",
    ADDRESSES: "Addresses",
    SETTINGS: "Settings",
    CONTACT_US: "Contact Us",
    HELP_CENTER: "Help Center",
    ACCOUNT: "Account",
    SUPPORT: "Support",
  },

  // Auth messages
  AUTH: {
    PHONE_LOGIN_NOT_IMPLEMENTED: "Phone login not yet implemented",
    PHONE_REGISTER_NOT_IMPLEMENTED: "Phone registration not yet implemented",
    EMAIL_OR_PHONE_REQUIRED: "Email or phone number required",
    DEFAULT_DISPLAY_NAME: "User",
    ID_TOKEN_REQUIRED: "ID token required",
    SESSION_CREATE_FAILED: "Failed to create session",
    SESSION_CLEAR_FAILED: "Failed to clear session",
    RATE_LIMIT_EXCEEDED: "Too many requests. Please try again later.",
  },

  // Settings page
  SETTINGS: {
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
  EMAIL_VERIFICATION: "Please verify your email to access all features",
  AVATAR_UPLOAD: "Upload a profile picture. Recommended size: 400x400px",
  AVATAR_FORMATS: "Supported formats: JPEG, PNG, WebP, GIF (max 5MB)",
} as const;
