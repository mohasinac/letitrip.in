/**
 * @fileoverview TypeScript Module
 * @module src/constants/validation-messages
 * @description This file contains functionality related to validation-messages
 * 
 * @created 2025-12-05
 * @author Development Team
 */

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

/**
 * Validation Rules
 * @constant
 */
export const VALIDATION_RULES = {
  // Name fields
  /** N A M E */
  NAME: {
    MIN_LENGTH: 2,
    MAX_LENGTH: 100,
    /** P A T T E R N */
    PATTERN: /^[a-zA-Z\s.'-]+$/,
  },

  // Username
  /** U S E R N A M E */
  USERNAME: {
    MIN_LENGTH: 3,
    MAX_LENGTH: 30,
    /** P A T T E R N */
    PATTERN: /^[a-zA-Z0-9_-]+$/,
  },

  // Email
  /** E M A I L */
  EMAIL: {
    /** P A T T E R N */
    PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    MAX_LENGTH: 255,
  },

  // Phone (Indian numbers)
  /** P H O N E */
  PHONE: {
    /** P A T T E R N */
    PATTERN: /^[6-9]\d{9}$/,
    MIN_LENGTH: 10,
    MAX_LENGTH: 10,
  },

  // Password
  /** P A S S W O R D */
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
  /** A D D R E S S */
  ADDRESS: {
    /** L I N E1 */
    LINE1: { MIN_LENGTH: 5, MAX_LENGTH: 100 },
    /** L I N E2 */
    LINE2: { MAX_LENGTH: 100 },
    /** C I T Y */
    CITY: { MIN_LENGTH: 2, MAX_LENGTH: 50 },
    /** S T A T E */
    STATE: { MIN_LENGTH: 2, MAX_LENGTH: 50 },
    /** P I N C O D E */
    PINCODE: { PATTERN: /^\d{6}$/, LENGTH: 6 },
    /** L A N D M A R K */
    LANDMARK: { MAX_LENGTH: 100 },
    /** C O U N T R Y */
    COUNTRY: "India",
  },

  // Slug
  /** S L U G */
  SLUG: {
    MIN_LENGTH: 3,
    MAX_LENGTH: 100,
    /** P A T T E R N */
    PATTERN: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
  },

  // Product
  /** P R O D U C T */
  PRODUCT: {
    /** N A M E */
    NAME: { MIN_LENGTH: 3, MAX_LENGTH: 200 },
    /** D E S C R I P T I O N */
    DESCRIPTION: { MIN_LENGTH: 20, MAX_LENGTH: 5000 },
    /** S K U */
    SKU: { MIN_LENGTH: 3, MAX_LENGTH: 50 },
    /** P R I C E */
    PRICE: { MIN: 1, MAX: 10000000 },
    /** S T O C K */
    STOCK: { MIN: 0, MAX: 1000000 },
    /** I M A G E S */
    IMAGES: { MIN: 1, MAX: 10 },
    /** V I D E O S */
    VIDEOS: { MAX: 3 },
    /** T A G S */
    TAGS: { MAX: 10 },
  },

  // Shop
  /** S H O P */
  SHOP: {
    /** N A M E */
    NAME: { MIN_LENGTH: 3, MAX_LENGTH: 100 },
    /** D E S C R I P T I O N */
    DESCRIPTION: { MIN_LENGTH: 20, MAX_LENGTH: 2000 },
    /** T A G L I N E */
    TAGLINE: { MAX_LENGTH: 100 },
    /** P O L I C Y */
    POLICY: { MAX_LENGTH: 5000 },
  },

  // Category
  /** C A T E G O R Y */
  CATEGORY: {
    /** N A M E */
    NAME: { MIN_LENGTH: 2, MAX_LENGTH: 100 },
    /** D E S C R I P T I O N */
    DESCRIPTION: { MAX_LENGTH: 500 },
  },

  // Auction
  /** A U C T I O N */
  AUCTION: {
    /** N A M E */
    NAME: { MIN_LENGTH: 3, MAX_LENGTH: 200 },
    /** D E S C R I P T I O N */
    DESCRIPTION: { MIN_LENGTH: 20, MAX_LENGTH: 5000 },
    START_PRICE: { MIN: 1, MAX: 10000000 },
    RESERVE_PRICE: { MIN: 1, MAX: 10000000 },
    BID_INCREMENT: { MIN: 1, MAX: 100000 },
    DURATION: { MIN_HOURS: 1, MAX_HOURS: 720 }, // 1 hour to 30 days
  },

  // Review
  /** R E V I E W */
  REVIEW: {
    /** T I T L E */
    TITLE: { MIN_LENGTH: 5, MAX_LENGTH: 100 },
    /** C O N T E N T */
    CONTENT: { MIN_LENGTH: 20, MAX_LENGTH: 2000 },
    /** R A T I N G */
    RATING: { MIN: 1, MAX: 5 },
  },

  // GST
  /** G S T */
  GST: {
    /** P A T T E R N */
    PATTERN: /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/,
    /** L E N G T H */
    LENGTH: 15,
  },

  // PAN
  /** P A N */
  PAN: {
    /** P A T T E R N */
    PATTERN: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/,
    /** L E N G T H */
    LENGTH: 10,
  },

  // IFSC Code
  /** I F S C */
  IFSC: {
    /** P A T T E R N */
    PATTERN: /^[A-Z]{4}0[A-Z0-9]{6}$/,
    /** L E N G T H */
    LENGTH: 11,
  },

  // Bank Account
  BANK_ACCOUNT: {
    MIN_LENGTH: 9,
    MAX_LENGTH: 18,
    /** P A T T E R N */
    PATTERN: /^[0-9]+$/,
  },

  // OTP
  /** O T P */
  OTP: {
    /** L E N G T H */
    LENGTH: 6,
    /** P A T T E R N */
    PATTERN: /^\d{6}$/,
    EXPIRY_MINUTES: 10,
  },

  // URL
  /** U R L */
  URL: {
    /** P A T T E R N */
    PATTERN: /^https?:\/\/.+/,
    MAX_LENGTH: 2048,
  },

  // File Upload
  /** F I L E */
  FILE: {
    /** I M A G E */
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
    /** V I D E O */
    VIDEO: {
      MAX_SIZE_MB: 50,
      ALLOWED_TYPES: ["video/mp4", "video/webm"] as string[],
      ALLOWED_EXTENSIONS: [".mp4", ".webm"],
    },
    /** D O C U M E N T */
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

/**
 * Validation Messages
 * @constant
 */
export const VALIDATION_MESSAGES = {
  // Required fields
  /** R E Q U I R E D */
  REQUIRED: {
    /** F I E L D */
    FIELD: (fieldName: string) => `${fieldName} is required`,
    /** G E N E R I C */
    GENERIC: "This field is required",
    /** S E L E C T */
    SELECT: "Please select an option",
    /** C H E C K B O X */
    CHECKBOX: "Please check this box to continue",
    /** F I L E */
    FILE: "Please upload a file",
  },

  // Name validation
  /** N A M E */
  NAME: {
    TOO_SHORT: `Name must be at least ${VALIDATION_RULES.NAME.MIN_LENGTH} characters`,
    TOO_LONG: `Name must be less than ${VALIDATION_RULES.NAME.MAX_LENGTH} characters`,
    INVALID_CHARS:
      "Name can only contain letters, spaces, dots, hyphens and apostrophes",
  },

  // Username validation
  /** U S E R N A M E */
  USERNAME: {
    TOO_SHORT: `Username must be at least ${VALIDATION_RULES.USERNAME.MIN_LENGTH} characters`,
    TOO_LONG: `Username must be less than ${VALIDATION_RULES.USERNAME.MAX_LENGTH} characters`,
    INVALID_CHARS:
      "Username can only contain letters, numbers, underscores and hyphens",
    /** T A K E N */
    TAKEN: "This username is already taken",
  },

  // Email validation
  /** E M A I L */
  EMAIL: {
    /** I N V A L I D */
    INVALID: "Please enter a valid email address",
    TOO_LONG: `Email must be less than ${VALIDATION_RULES.EMAIL.MAX_LENGTH} characters`,
    /** T A K E N */
    TAKEN: "This email is already registered",
  },

  // Phone validation
  /** P H O N E */
  PHONE: {
    /** I N V A L I D */
    INVALID: "Please enter a valid 10-digit Indian mobile number",
    MUST_START_WITH: "Phone number must start with 6, 7, 8, or 9",
    TOO_SHORT: "Phone number must be 10 digits",
    TOO_LONG: "Phone number must be 10 digits",
  },

  // Password validation
  /** P A S S W O R D */
  PASSWORD: {
    TOO_SHORT: `Password must be at least ${VALIDATION_RULES.PASSWORD.MIN_LENGTH} characters`,
    TOO_LONG: `Password must be less than ${VALIDATION_RULES.PASSWORD.MAX_LENGTH} characters`,
    REQUIRE_UPPERCASE: "Password must contain at least one uppercase letter",
    REQUIRE_LOWERCASE: "Password must contain at least one lowercase letter",
    REQUIRE_NUMBER: "Password must contain at least one number",
    REQUIRE_SPECIAL:
      "Password must contain at least one special character (!@#$%^&*)",
    /** M I S M A T C H */
    MISMATCH: "Passwords do not match",
    /** W E A K */
    WEAK: "Password is too weak. Please use a stronger password.",
  },

  // Address validation
  /** A D D R E S S */
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
  /** S L U G */
  SLUG: {
    TOO_SHORT: `Slug must be at least ${VALIDATION_RULES.SLUG.MIN_LENGTH} characters`,
    TOO_LONG: `Slug must be less than ${VALIDATION_RULES.SLUG.MAX_LENGTH} characters`,
    /** I N V A L I D */
    INVALID: "Slug can only contain lowercase letters, numbers, and hyphens",
    /** T A K E N */
    TAKEN: "This slug is already taken",
  },

  // Bank validation
  /** B A N K */
  BANK: {
    ACCOUNT_NUMBER_INVALID: "Please enter a valid account number",
    IFSC_INVALID: "Please enter a valid IFSC code",
    HOLDER_NAME_INVALID: "Please enter account holder name",
    BANK_NAME_INVALID: "Please enter bank name",
  },

  // Product validation
  /** P R O D U C T */
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
  /** S H O P */
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
  /** C A T E G O R Y */
  CATEGORY: {
    NAME_TOO_SHORT: `Category name must be at least ${VALIDATION_RULES.CATEGORY.NAME.MIN_LENGTH} characters`,
    NAME_TOO_LONG: `Category name must be less than ${VALIDATION_RULES.CATEGORY.NAME.MAX_LENGTH} characters`,
    DESC_TOO_LONG: `Description must be less than ${VALIDATION_RULES.CATEGORY.DESCRIPTION.MAX_LENGTH} characters`,
  },

  // Auction validation
  /** A U C T I O N */
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
  /** R E V I E W */
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
  /** T A X */
  TAX: {
    GST_INVALID: "Invalid GST number format (e.g., 22AAAAA0000A1Z5)",
    PAN_INVALID: "Invalid PAN format (e.g., ABCDE1234F)",
    IFSC_INVALID: "Invalid IFSC code format (e.g., SBIN0001234)",
    ACCOUNT_INVALID: "Invalid bank account number",
  },

  // OTP validation
  /** O T P */
  OTP: {
    /** I N V A L I D */
    INVALID: "Invalid OTP. Please enter 6 digits",
    /** E X P I R E D */
    EXPIRED: "OTP has expired. Please request a new one",
    /** I N C O R R E C T */
    INCORRECT: "Incorrect OTP. Please try again",
    MAX_ATTEMPTS: "Too many failed attempts. Please request a new OTP",
  },

  // File upload validation
  /** F I L E */
  FILE: {
    TOO_LARGE: (maxSizeMB: number) =>
      `File size must be less than ${maxSizeMB}MB`,
    INVALID_TYPE: (allowedTypes: string[]) =>
      `Invalid file type. Allowed types: ${allowedTypes.join(", ")}`,
    UPLOAD_FAILED: "File upload failed. Please try again",
    UNSUPPORTED_FORMAT: "Unsupported file format",
  },

  // General validation
  /** G E N E R A L */
  GENERAL: {
    INVALID_INPUT: "Invalid input provided",
    SERVER_ERROR: "Server error occurred. Please try again",
    NETWORK_ERROR: "Network error. Please check your connection",
    /** U N A U T H O R I Z E D */
    UNAUTHORIZED: "You are not authorized to perform this action",
    NOT_FOUND: "Resource not found",
    /** C O N F L I C T */
    CONFLICT: "Resource already exists",
    RATE_LIMIT: "Too many requests. Please try again later",
  },

  // Date validation
  /** D A T E */
  DATE: {
    /** I N V A L I D */
    INVALID: "Invalid date format",
    IN_PAST: "Date cannot be in the past",
    IN_FUTURE: "Date cannot be in the future",
    /** B E F O R E */
    BEFORE: (date: string) => `Date must be before ${date}`,
    /** A F T E R */
    AFTER: (date: string) => `Date must be after ${date}`,
  },

  // Number validation
  /** N U M B E R */
  NUMBER: {
    /** I N V A L I D */
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
/**
 * Checks if valid email
 *
 * @param {string} email - The email
 *
 * @returns {boolean} True if condition is met, false otherwise
 *
 * @example
 * isValidEmail("example");
 */

/**
 * Checks if valid email
 *
 * @param {string} email - The email
 *
 * @returns {boolean} True if condition is met, false otherwise
 *
 * @example
 * isValidEmail("example");
 */

export function isValidEmail(email: string): boolean {
  return VALIDATION_RULES.EMAIL.PATTERN.test(email);
}

/**
 * Check if Indian phone number is valid
 */
/**
 * Checks if valid phone
 *
 * @param {string} phone - The phone
 *
 * @returns {boolean} True if condition is met, false otherwise
 *
 * @example
 * isValidPhone("example");
 */

/**
 * Checks if valid phone
 *
 * @param {string} phone - The phone
 *
 * @returns {boolean} True if condition is met, false otherwise
 *
 * @example
 * isValidPhone("example");
 */

export function isValidPhone(phone: string): boolean {
  return VALIDATION_RULES.PHONE.PATTERN.test(phone);
}

/**
 * Check if GST number is valid
 */
/**
 * Checks if valid g s t
 *
 * @param {string} gst - The gst
 *
 * @returns {boolean} True if condition is met, false otherwise
 *
 * @example
 * isValidGST("example");
 */

/**
 * Checks if valid g s t
 *
 * @param {string} gst - The gst
 *
 * @returns {boolean} True if condition is met, false otherwise
 *
 * @example
 * isValidGST("example");
 */

export function isValidGST(gst: string): boolean {
  return VALIDATION_RULES.GST.PATTERN.test(gst);
}

/**
 * Check if PAN is valid
 */
/**
 * Checks if valid p a n
 *
 * @param {string} pan - The pan
 *
 * @returns {boolean} True if condition is met, false otherwise
 *
 * @example
 * isValidPAN("example");
 */

/**
 * Checks if valid p a n
 *
 * @param {string} pan - The pan
 *
 * @returns {boolean} True if condition is met, false otherwise
 *
 * @example
 * isValidPAN("example");
 */

export function isValidPAN(pan: string): boolean {
  return VALIDATION_RULES.PAN.PATTERN.test(pan);
}

/**
 * Check if IFSC code is valid
 */
/**
 * Checks if valid i f s c
 *
 * @param {string} ifsc - The ifsc
 *
 * @returns {boolean} True if condition is met, false otherwise
 *
 * @example
 * isValidIFSC("example");
 */

/**
 * Checks if valid i f s c
 *
 * @param {string} ifsc - The ifsc
 *
 * @returns {boolean} True if condition is met, false otherwise
 *
 * @example
 * isValidIFSC("example");
 */

export function isValidIFSC(ifsc: string): boolean {
  return VALIDATION_RULES.IFSC.PATTERN.test(ifsc);
}

/**
 * Check if slug is valid
 */
/**
 * Checks if valid slug
 *
 * @param {string} slug - URL-friendly identifier
 *
 * @returns {boolean} True if condition is met, false otherwise
 *
 * @example
 * isValidSlug("example");
 */

/**
 * Checks if valid slug
 *
 * @param {string} slug - URL-friendly identifier
 *
 * @returns {boolean} True if condition is met, false otherwise
 *
 * @example
 * isValidSlug("example");
 */

export function isValidSlug(slug: string): boolean {
  return VALIDATION_RULES.SLUG.PATTERN.test(slug);
}

/**
 * Check if password meets requirements
 */
/**
 * Checks if valid password
 *
 * @param {string} password - The password
 *
 * @returns {boolean} True if condition is met, false otherwise
 *
 * @example
 * isValidPassword("example");
 */

/**
 * Checks if valid password
 *
 * @param {string} password - The password
 *
 * @returns {boolean} True if condition is met, false otherwise
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * isValidPassword("example");
 */

export function isValidPassword(password: string): {
  /** Valid */
  valid: boolean;
  /** Errors */
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
    /** Valid */
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validate file upload
 */
/**
 * Validates file
 *
 * @param {File} file - The file
 * @param {"image" | "video" | "document"} type - The type
 *
 * @returns {boolean} True if condition is met, false otherwise
 *
 * @example
 * validateFile(file, type);
 */

/**
 * Validates file
 *
 * @returns {any} The validatefile result
 *
 * @example
 * validateFile();
 */

export function validateFile(
  /** File */
  file: File,
  /** Type */
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
      /** Valid */
      valid: false,
      /** Error */
      error: VALIDATION_MESSAGES.FILE.TOO_LARGE(rules.MAX_SIZE_MB),
    };
  }

  // Check file type
  if (!rules.ALLOWED_TYPES.includes(file.type)) {
    return {
      /** Valid */
      valid: false,
      /** Error */
      error: VALIDATION_MESSAGES.FILE.INVALID_TYPE(rules.ALLOWED_EXTENSIONS),
    };
  }

  return { valid: true };
}

/**
 * Get password strength (0-4)
 * 0: Very weak, 1: Weak, 2: Fair, 3: Good, 4: Strong
 */
/**
 * Retrieves password strength
 *
 * @param {string} password - The password
 *
 * @returns {string} The passwordstrength result
 *
 * @example
 * getPasswordStrength("example");
 */

/**
 * Retrieves password strength
 *
 * @param {string} password - The password
 *
 * @returns {string} The passwordstrength result
 *
 * @example
 * getPasswordStrength("example");
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
