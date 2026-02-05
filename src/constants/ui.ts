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
} as const;
