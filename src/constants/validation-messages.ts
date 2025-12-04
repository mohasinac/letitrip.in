/**
 * Centralized Validation Messages and Rules
 *
 * This file contains all validation messages, rules, and error constants
 * used across forms, wizards, and API endpoints to ensure consistency.
 *
 * Usage:
 * ```ts
 * import { VALIDATION_MESSAGES, VALIDATION_RULES } from '@/constants/validation-messages';
 *
 * // In Zod schemas:
 * z.string().min(VALIDATION_RULES.NAME.MIN_LENGTH, VALIDATION_MESSAGES.NAME.TOO_SHORT)
 *
 * // In custom validators:
 * if (value.length < VALIDATION_RULES.NAME.MIN_LENGTH) {
 *   return VALIDATION_MESSAGES.NAME.TOO_SHORT;
 * }
 * ```
 */

// ============================================================================
// VALIDATION RULES (min/max lengths, patterns, etc.)
// ============================================================================

export const VALIDATION_RULES = {
  // Name fields
  NAME: {
    MIN_LENGTH: 2,
    MAX_LENGTH: 100,
    PATTERN: /^[a-zA-Z\s.'-]+$/,
  },

  // Username
  USERNAME: {
    MIN_LENGTH: 3,
    MAX_LENGTH: 30,
    PATTERN: /^[a-zA-Z0-9_-]+$/,
  },

  // Email
  EMAIL: {
    PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    MAX_LENGTH: 255,
  },

  // Phone (Indian numbers)
  PHONE: {
    PATTERN: /^[6-9]\d{9}$/,
    MIN_LENGTH: 10,
    MAX_LENGTH: 10,
  },

  // Password
  PASSWORD: {
    MIN_LENGTH: 8,
    MAX_LENGTH: 128,
    REQUIRE_UPPERCASE: true,
    REQUIRE_LOWERCASE: true,
    REQUIRE_NUMBER: true,
    REQUIRE_SPECIAL: true,
    SPECIAL_CHARS: /[!@#$%^&*(),.?":{}|<>]/,
  },

  // Address
  ADDRESS: {
    LINE1: { MIN_LENGTH: 5, MAX_LENGTH: 100 },
    LINE2: { MAX_LENGTH: 100 },
    CITY: { MIN_LENGTH: 2, MAX_LENGTH: 50 },
    STATE: { MIN_LENGTH: 2, MAX_LENGTH: 50 },
    PINCODE: { PATTERN: /^\d{6}$/, LENGTH: 6 },
    LANDMARK: { MAX_LENGTH: 100 },
    COUNTRY: "India",
  },

  // Slug
  SLUG: {
    MIN_LENGTH: 3,
    MAX_LENGTH: 100,
    PATTERN: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
  },

  // Product
  PRODUCT: {
    NAME: { MIN_LENGTH: 3, MAX_LENGTH: 200 },
    DESCRIPTION: { MIN_LENGTH: 20, MAX_LENGTH: 5000 },
    SKU: { MIN_LENGTH: 3, MAX_LENGTH: 50 },
    PRICE: { MIN: 1, MAX: 10000000 },
    STOCK: { MIN: 0, MAX: 1000000 },
    IMAGES: { MIN: 1, MAX: 10 },
    VIDEOS: { MAX: 3 },
    TAGS: { MAX: 10 },
  },

  // Shop
  SHOP: {
    NAME: { MIN_LENGTH: 3, MAX_LENGTH: 100 },
    DESCRIPTION: { MIN_LENGTH: 20, MAX_LENGTH: 2000 },
    TAGLINE: { MAX_LENGTH: 100 },
    POLICY: { MAX_LENGTH: 5000 },
  },

  // Category
  CATEGORY: {
    NAME: { MIN_LENGTH: 2, MAX_LENGTH: 100 },
    DESCRIPTION: { MAX_LENGTH: 500 },
  },

  // Auction
  AUCTION: {
    NAME: { MIN_LENGTH: 3, MAX_LENGTH: 200 },
    DESCRIPTION: { MIN_LENGTH: 20, MAX_LENGTH: 5000 },
    START_PRICE: { MIN: 1, MAX: 10000000 },
    RESERVE_PRICE: { MIN: 1, MAX: 10000000 },
    BID_INCREMENT: { MIN: 1, MAX: 100000 },
    DURATION: { MIN_HOURS: 1, MAX_HOURS: 720 }, // 1 hour to 30 days
  },

  // Review
  REVIEW: {
    TITLE: { MIN_LENGTH: 5, MAX_LENGTH: 100 },
    CONTENT: { MIN_LENGTH: 20, MAX_LENGTH: 2000 },
    RATING: { MIN: 1, MAX: 5 },
  },

  // GST
  GST: {
    PATTERN: /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/,
    LENGTH: 15,
  },

  // PAN
  PAN: {
    PATTERN: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/,
    LENGTH: 10,
  },

  // IFSC Code
  IFSC: {
    PATTERN: /^[A-Z]{4}0[A-Z0-9]{6}$/,
    LENGTH: 11,
  },

  // Bank Account
  BANK_ACCOUNT: {
    MIN_LENGTH: 9,
    MAX_LENGTH: 18,
    PATTERN: /^[0-9]+$/,
  },

  // OTP
  OTP: {
    LENGTH: 6,
    PATTERN: /^\d{6}$/,
    EXPIRY_MINUTES: 10,
  },

  // URL
  URL: {
    PATTERN: /^https?:\/\/.+/,
    MAX_LENGTH: 2048,
  },

  // File Upload
  FILE: {
    IMAGE: {
      MAX_SIZE_MB: 5,
      ALLOWED_TYPES: [
        "image/jpeg",
        "image/png",
        "image/webp",
        "image/jpg",
      ] as string[],
      ALLOWED_EXTENSIONS: [".jpg", ".jpeg", ".png", ".webp"],
    },
    VIDEO: {
      MAX_SIZE_MB: 50,
      ALLOWED_TYPES: ["video/mp4", "video/webm"] as string[],
      ALLOWED_EXTENSIONS: [".mp4", ".webm"],
    },
    DOCUMENT: {
      MAX_SIZE_MB: 10,
      ALLOWED_TYPES: ["application/pdf", "image/jpeg", "image/png"] as string[],
      ALLOWED_EXTENSIONS: [".pdf", ".jpg", ".jpeg", ".png"],
    },
  },
};

// ============================================================================
// VALIDATION MESSAGES
// ============================================================================

export const VALIDATION_MESSAGES = {
  // Required fields
  REQUIRED: {
    FIELD: (fieldName: string) => `${fieldName} is required`,
    GENERIC: "This field is required",
    SELECT: "Please select an option",
    CHECKBOX: "Please check this box to continue",
    FILE: "Please upload a file",
  },

  // Name validation
  NAME: {
    TOO_SHORT: `Name must be at least ${VALIDATION_RULES.NAME.MIN_LENGTH} characters`,
    TOO_LONG: `Name must be less than ${VALIDATION_RULES.NAME.MAX_LENGTH} characters`,
    INVALID_CHARS:
      "Name can only contain letters, spaces, dots, hyphens and apostrophes",
  },

  // Username validation
  USERNAME: {
    TOO_SHORT: `Username must be at least ${VALIDATION_RULES.USERNAME.MIN_LENGTH} characters`,
    TOO_LONG: `Username must be less than ${VALIDATION_RULES.USERNAME.MAX_LENGTH} characters`,
    INVALID_CHARS:
      "Username can only contain letters, numbers, underscores and hyphens",
    TAKEN: "This username is already taken",
  },

  // Email validation
  EMAIL: {
    INVALID: "Please enter a valid email address",
    TOO_LONG: `Email must be less than ${VALIDATION_RULES.EMAIL.MAX_LENGTH} characters`,
    TAKEN: "This email is already registered",
  },

  // Phone validation
  PHONE: {
    INVALID: "Please enter a valid 10-digit Indian mobile number",
    MUST_START_WITH: "Phone number must start with 6, 7, 8, or 9",
    TOO_SHORT: "Phone number must be 10 digits",
    TOO_LONG: "Phone number must be 10 digits",
  },

  // Password validation
  PASSWORD: {
    TOO_SHORT: `Password must be at least ${VALIDATION_RULES.PASSWORD.MIN_LENGTH} characters`,
    TOO_LONG: `Password must be less than ${VALIDATION_RULES.PASSWORD.MAX_LENGTH} characters`,
    REQUIRE_UPPERCASE: "Password must contain at least one uppercase letter",
    REQUIRE_LOWERCASE: "Password must contain at least one lowercase letter",
    REQUIRE_NUMBER: "Password must contain at least one number",
    REQUIRE_SPECIAL:
      "Password must contain at least one special character (!@#$%^&*)",
    MISMATCH: "Passwords do not match",
    WEAK: "Password is too weak. Please use a stronger password.",
  },

  // Address validation
  ADDRESS: {
    LINE1_TOO_SHORT: `Address must be at least ${VALIDATION_RULES.ADDRESS.LINE1.MIN_LENGTH} characters`,
    LINE1_TOO_LONG: `Address must be less than ${VALIDATION_RULES.ADDRESS.LINE1.MAX_LENGTH} characters`,
    LINE2_TOO_LONG: `Address line 2 must be less than ${VALIDATION_RULES.ADDRESS.LINE2.MAX_LENGTH} characters`,
    CITY_TOO_SHORT: `City must be at least ${VALIDATION_RULES.ADDRESS.CITY.MIN_LENGTH} characters`,
    CITY_TOO_LONG: `City must be less than ${VALIDATION_RULES.ADDRESS.CITY.MAX_LENGTH} characters`,
    STATE_TOO_SHORT: `State must be at least ${VALIDATION_RULES.ADDRESS.STATE.MIN_LENGTH} characters`,
    STATE_TOO_LONG: `State must be less than ${VALIDATION_RULES.ADDRESS.STATE.MAX_LENGTH} characters`,
    PINCODE_INVALID: "Pincode must be exactly 6 digits",
    LANDMARK_TOO_LONG: `Landmark must be less than ${VALIDATION_RULES.ADDRESS.LANDMARK.MAX_LENGTH} characters`,
    TYPE_INVALID: "Please select a valid address type (home, work, or other)",
  },

  // Slug validation
  SLUG: {
    TOO_SHORT: `Slug must be at least ${VALIDATION_RULES.SLUG.MIN_LENGTH} characters`,
    TOO_LONG: `Slug must be less than ${VALIDATION_RULES.SLUG.MAX_LENGTH} characters`,
    INVALID: "Slug can only contain lowercase letters, numbers, and hyphens",
    TAKEN: "This slug is already taken",
  },

  // Bank validation
  BANK: {
    ACCOUNT_NUMBER_INVALID: "Please enter a valid account number",
    IFSC_INVALID: "Please enter a valid IFSC code",
    HOLDER_NAME_INVALID: "Please enter account holder name",
    BANK_NAME_INVALID: "Please enter bank name",
  },

  // Product validation
  PRODUCT: {
    NAME_TOO_SHORT: `Product name must be at least ${VALIDATION_RULES.PRODUCT.NAME.MIN_LENGTH} characters`,
    NAME_TOO_LONG: `Product name must be less than ${VALIDATION_RULES.PRODUCT.NAME.MAX_LENGTH} characters`,
    DESC_TOO_SHORT: `Description must be at least ${VALIDATION_RULES.PRODUCT.DESCRIPTION.MIN_LENGTH} characters`,
    DESC_TOO_LONG: `Description must be less than ${VALIDATION_RULES.PRODUCT.DESCRIPTION.MAX_LENGTH} characters`,
    SKU_TOO_SHORT: `SKU must be at least ${VALIDATION_RULES.PRODUCT.SKU.MIN_LENGTH} characters`,
    SKU_TOO_LONG: `SKU must be less than ${VALIDATION_RULES.PRODUCT.SKU.MAX_LENGTH} characters`,
    PRICE_TOO_LOW: `Price must be at least ₹${VALIDATION_RULES.PRODUCT.PRICE.MIN}`,
    PRICE_TOO_HIGH: `Price must be less than ₹${VALIDATION_RULES.PRODUCT.PRICE.MAX}`,
    STOCK_NEGATIVE: "Stock cannot be negative",
    STOCK_TOO_HIGH: `Stock must be less than ${VALIDATION_RULES.PRODUCT.STOCK.MAX}`,
    NO_IMAGES: "Please upload at least one product image",
    TOO_MANY_IMAGES: `Maximum ${VALIDATION_RULES.PRODUCT.IMAGES.MAX} images allowed`,
    TOO_MANY_VIDEOS: `Maximum ${VALIDATION_RULES.PRODUCT.VIDEOS.MAX} videos allowed`,
    TOO_MANY_TAGS: `Maximum ${VALIDATION_RULES.PRODUCT.TAGS.MAX} tags allowed`,
    NO_CATEGORY: "Please select a category",
    NO_SHOP: "Please select a shop",
  },

  // Shop validation
  SHOP: {
    NAME_TOO_SHORT: `Shop name must be at least ${VALIDATION_RULES.SHOP.NAME.MIN_LENGTH} characters`,
    NAME_TOO_LONG: `Shop name must be less than ${VALIDATION_RULES.SHOP.NAME.MAX_LENGTH} characters`,
    DESC_TOO_SHORT: `Description must be at least ${VALIDATION_RULES.SHOP.DESCRIPTION.MIN_LENGTH} characters`,
    DESC_TOO_LONG: `Description must be less than ${VALIDATION_RULES.SHOP.DESCRIPTION.MAX_LENGTH} characters`,
    TAGLINE_TOO_LONG: `Tagline must be less than ${VALIDATION_RULES.SHOP.TAGLINE.MAX_LENGTH} characters`,
    POLICY_TOO_LONG: `Policy must be less than ${VALIDATION_RULES.SHOP.POLICY.MAX_LENGTH} characters`,
    NO_CATEGORY: "Please select at least one category",
  },

  // Category validation
  CATEGORY: {
    NAME_TOO_SHORT: `Category name must be at least ${VALIDATION_RULES.CATEGORY.NAME.MIN_LENGTH} characters`,
    NAME_TOO_LONG: `Category name must be less than ${VALIDATION_RULES.CATEGORY.NAME.MAX_LENGTH} characters`,
    DESC_TOO_LONG: `Description must be less than ${VALIDATION_RULES.CATEGORY.DESCRIPTION.MAX_LENGTH} characters`,
  },

  // Auction validation
  AUCTION: {
    NAME_TOO_SHORT: `Auction name must be at least ${VALIDATION_RULES.AUCTION.NAME.MIN_LENGTH} characters`,
    NAME_TOO_LONG: `Auction name must be less than ${VALIDATION_RULES.AUCTION.NAME.MAX_LENGTH} characters`,
    DESC_TOO_SHORT: `Description must be at least ${VALIDATION_RULES.AUCTION.DESCRIPTION.MIN_LENGTH} characters`,
    DESC_TOO_LONG: `Description must be less than ${VALIDATION_RULES.AUCTION.DESCRIPTION.MAX_LENGTH} characters`,
    START_PRICE_TOO_LOW: `Starting price must be at least ₹${VALIDATION_RULES.AUCTION.START_PRICE.MIN}`,
    START_PRICE_TOO_HIGH: `Starting price must be less than ₹${VALIDATION_RULES.AUCTION.START_PRICE.MAX}`,
    RESERVE_BELOW_START: "Reserve price must be higher than starting price",
    INCREMENT_TOO_LOW: `Bid increment must be at least ₹${VALIDATION_RULES.AUCTION.BID_INCREMENT.MIN}`,
    DURATION_TOO_SHORT: `Auction must run for at least ${VALIDATION_RULES.AUCTION.DURATION.MIN_HOURS} hour`,
    DURATION_TOO_LONG: `Auction cannot run for more than ${
      VALIDATION_RULES.AUCTION.DURATION.MAX_HOURS / 24
    } days`,
    START_IN_PAST: "Start time cannot be in the past",
    END_BEFORE_START: "End time must be after start time",
  },

  // Review validation
  REVIEW: {
    TITLE_TOO_SHORT: `Title must be at least ${VALIDATION_RULES.REVIEW.TITLE.MIN_LENGTH} characters`,
    TITLE_TOO_LONG: `Title must be less than ${VALIDATION_RULES.REVIEW.TITLE.MAX_LENGTH} characters`,
    CONTENT_TOO_SHORT: `Review must be at least ${VALIDATION_RULES.REVIEW.CONTENT.MIN_LENGTH} characters`,
    CONTENT_TOO_LONG: `Review must be less than ${VALIDATION_RULES.REVIEW.CONTENT.MAX_LENGTH} characters`,
    RATING_INVALID: "Please provide a rating between 1 and 5 stars",
    ALREADY_REVIEWED: "You have already reviewed this item",
    NOT_PURCHASED: "You can only review items you've purchased",
  },

  // Tax IDs validation
  TAX: {
    GST_INVALID: "Invalid GST number format (e.g., 22AAAAA0000A1Z5)",
    PAN_INVALID: "Invalid PAN format (e.g., ABCDE1234F)",
    IFSC_INVALID: "Invalid IFSC code format (e.g., SBIN0001234)",
    ACCOUNT_INVALID: "Invalid bank account number",
  },

  // OTP validation
  OTP: {
    INVALID: "Invalid OTP. Please enter 6 digits",
    EXPIRED: "OTP has expired. Please request a new one",
    INCORRECT: "Incorrect OTP. Please try again",
    MAX_ATTEMPTS: "Too many failed attempts. Please request a new OTP",
  },

  // File upload validation
  FILE: {
    TOO_LARGE: (maxSizeMB: number) =>
      `File size must be less than ${maxSizeMB}MB`,
    INVALID_TYPE: (allowedTypes: string[]) =>
      `Invalid file type. Allowed types: ${allowedTypes.join(", ")}`,
    UPLOAD_FAILED: "File upload failed. Please try again",
    UNSUPPORTED_FORMAT: "Unsupported file format",
  },

  // General validation
  GENERAL: {
    INVALID_INPUT: "Invalid input provided",
    SERVER_ERROR: "Server error occurred. Please try again",
    NETWORK_ERROR: "Network error. Please check your connection",
    UNAUTHORIZED: "You are not authorized to perform this action",
    NOT_FOUND: "Resource not found",
    CONFLICT: "Resource already exists",
    RATE_LIMIT: "Too many requests. Please try again later",
  },

  // Date validation
  DATE: {
    INVALID: "Invalid date format",
    IN_PAST: "Date cannot be in the past",
    IN_FUTURE: "Date cannot be in the future",
    BEFORE: (date: string) => `Date must be before ${date}`,
    AFTER: (date: string) => `Date must be after ${date}`,
  },

  // Number validation
  NUMBER: {
    INVALID: "Please enter a valid number",
    TOO_SMALL: (min: number) => `Value must be at least ${min}`,
    TOO_LARGE: (max: number) => `Value must be at most ${max}`,
    NOT_INTEGER: "Value must be a whole number",
    NOT_POSITIVE: "Value must be positive",
  },
} as const;

// ============================================================================
// VALIDATION HELPERS
// ============================================================================

/**
 * Check if email is valid
 */
export function isValidEmail(email: string): boolean {
  return VALIDATION_RULES.EMAIL.PATTERN.test(email);
}

/**
 * Check if Indian phone number is valid
 */
export function isValidPhone(phone: string): boolean {
  return VALIDATION_RULES.PHONE.PATTERN.test(phone);
}

/**
 * Check if GST number is valid
 */
export function isValidGST(gst: string): boolean {
  return VALIDATION_RULES.GST.PATTERN.test(gst);
}

/**
 * Check if PAN is valid
 */
export function isValidPAN(pan: string): boolean {
  return VALIDATION_RULES.PAN.PATTERN.test(pan);
}

/**
 * Check if IFSC code is valid
 */
export function isValidIFSC(ifsc: string): boolean {
  return VALIDATION_RULES.IFSC.PATTERN.test(ifsc);
}

/**
 * Check if slug is valid
 */
export function isValidSlug(slug: string): boolean {
  return VALIDATION_RULES.SLUG.PATTERN.test(slug);
}

/**
 * Check if password meets requirements
 */
export function isValidPassword(password: string): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (password.length < VALIDATION_RULES.PASSWORD.MIN_LENGTH) {
    errors.push(VALIDATION_MESSAGES.PASSWORD.TOO_SHORT);
  }

  if (password.length > VALIDATION_RULES.PASSWORD.MAX_LENGTH) {
    errors.push(VALIDATION_MESSAGES.PASSWORD.TOO_LONG);
  }

  if (VALIDATION_RULES.PASSWORD.REQUIRE_UPPERCASE && !/[A-Z]/.test(password)) {
    errors.push(VALIDATION_MESSAGES.PASSWORD.REQUIRE_UPPERCASE);
  }

  if (VALIDATION_RULES.PASSWORD.REQUIRE_LOWERCASE && !/[a-z]/.test(password)) {
    errors.push(VALIDATION_MESSAGES.PASSWORD.REQUIRE_LOWERCASE);
  }

  if (VALIDATION_RULES.PASSWORD.REQUIRE_NUMBER && !/\d/.test(password)) {
    errors.push(VALIDATION_MESSAGES.PASSWORD.REQUIRE_NUMBER);
  }

  if (
    VALIDATION_RULES.PASSWORD.REQUIRE_SPECIAL &&
    !VALIDATION_RULES.PASSWORD.SPECIAL_CHARS.test(password)
  ) {
    errors.push(VALIDATION_MESSAGES.PASSWORD.REQUIRE_SPECIAL);
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validate file upload
 */
export function validateFile(
  file: File,
  type: "image" | "video" | "document",
): { valid: boolean; error?: string } {
  const rules =
    VALIDATION_RULES.FILE[
      type.toUpperCase() as keyof typeof VALIDATION_RULES.FILE
    ];

  // Check file size
  const maxSizeBytes = rules.MAX_SIZE_MB * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    return {
      valid: false,
      error: VALIDATION_MESSAGES.FILE.TOO_LARGE(rules.MAX_SIZE_MB),
    };
  }

  // Check file type
  if (!rules.ALLOWED_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: VALIDATION_MESSAGES.FILE.INVALID_TYPE(rules.ALLOWED_EXTENSIONS),
    };
  }

  return { valid: true };
}

/**
 * Get password strength (0-4)
 * 0: Very weak, 1: Weak, 2: Fair, 3: Good, 4: Strong
 */
export function getPasswordStrength(password: string): number {
  let strength = 0;

  if (password.length >= 8) strength++;
  if (password.length >= 12) strength++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
  if (/\d/.test(password)) strength++;
  if (VALIDATION_RULES.PASSWORD.SPECIAL_CHARS.test(password)) strength++;

  return Math.min(strength, 4);
}
