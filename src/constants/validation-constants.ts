/**
 * Validation Constants
 *
 * Centralized constants for field length, pattern, and value validation rules
 * used across forms, schemas, and API validations.
 */

// ============================================================================
// AUCTION VALIDATION RULES
// ============================================================================

export const AUCTION_VALIDATION = {
  NAME: {
    MIN_LENGTH: 10,
    MAX_LENGTH: 200,
    MIN_MESSAGE: "Auction name must be at least 10 characters",
    MAX_MESSAGE: "Auction name must not exceed 200 characters",
  },

  SLUG: {
    MIN_LENGTH: 3,
    MAX_LENGTH: 200,
    MIN_MESSAGE: "Slug must be at least 3 characters",
    MAX_MESSAGE: "Slug must not exceed 200 characters",
  },

  DESCRIPTION: {
    MIN_LENGTH: 50,
    MAX_LENGTH: 5000,
    MIN_MESSAGE: "Description must be at least 50 characters",
    MAX_MESSAGE: "Description must not exceed 5000 characters",
  },

  SHORT_DESCRIPTION: {
    MAX_LENGTH: 200,
    MAX_MESSAGE: "Short description must not exceed 200 characters",
  },

  BRAND: {
    MAX_LENGTH: 100,
    MAX_MESSAGE: "Brand must not exceed 100 characters",
  },

  MANUFACTURER: {
    MAX_LENGTH: 100,
    MAX_MESSAGE: "Manufacturer must not exceed 100 characters",
  },

  IMAGES: {
    MIN_COUNT: 1,
    MAX_COUNT: 10,
    MIN_MESSAGE: "At least one image is required",
    MAX_MESSAGE: "Maximum 10 images allowed",
  },

  VIDEOS: {
    MAX_COUNT: 3,
    MAX_MESSAGE: "Maximum 3 videos allowed",
  },

  SPECIFICATIONS: {
    NAME: {
      MIN_LENGTH: 1,
      MAX_LENGTH: 100,
    },
    VALUE: {
      MIN_LENGTH: 1,
      MAX_LENGTH: 500,
    },
  },
} as const;

// ============================================================================
// PRODUCT VALIDATION RULES
// ============================================================================

export const PRODUCT_VALIDATION = {
  NAME: {
    MIN_LENGTH: 5,
    MAX_LENGTH: 255,
    MIN_MESSAGE: "Product name must be at least 5 characters",
    MAX_MESSAGE: "Product name must not exceed 255 characters",
  },

  DESCRIPTION: {
    MIN_LENGTH: 20,
    MAX_LENGTH: 2000,
    MIN_MESSAGE: "Description must be at least 20 characters",
    MAX_MESSAGE: "Description must not exceed 2000 characters",
  },

  SKU: {
    MIN_LENGTH: 3,
    MAX_LENGTH: 50,
    MIN_MESSAGE: "SKU must be at least 3 characters",
    MAX_MESSAGE: "SKU must not exceed 50 characters",
  },

  PRICE: {
    MIN_VALUE: 0,
    MIN_MESSAGE: "Price must be 0 or greater",
  },
} as const;

// ============================================================================
// REVIEW VALIDATION RULES
// ============================================================================

export const REVIEW_VALIDATION = {
  TITLE: {
    MIN_LENGTH: 5,
    MAX_LENGTH: 100,
    MIN_MESSAGE: "Review title must be at least 5 characters",
    MAX_MESSAGE: "Review title must not exceed 100 characters",
  },

  COMMENT: {
    MIN_LENGTH: 10,
    MAX_LENGTH: 2000,
    MIN_MESSAGE: "Review comment must be at least 10 characters",
    MAX_MESSAGE: "Review comment must not exceed 2000 characters",
  },

  RATING: {
    MIN_VALUE: 1,
    MAX_VALUE: 5,
    MIN_MESSAGE: "Rating must be at least 1 star",
    MAX_MESSAGE: "Rating must not exceed 5 stars",
  },

  IMAGES: {
    MAX_COUNT: 5,
    MAX_MESSAGE: "Maximum 5 images allowed per review",
  },
} as const;

// ============================================================================
// USER PROFILE VALIDATION RULES
// ============================================================================

export const USER_VALIDATION = {
  FIRST_NAME: {
    MIN_LENGTH: 2,
    MAX_LENGTH: 50,
    MIN_MESSAGE: "First name must be at least 2 characters",
    MAX_MESSAGE: "First name must not exceed 50 characters",
  },

  LAST_NAME: {
    MIN_LENGTH: 2,
    MAX_LENGTH: 50,
    MIN_MESSAGE: "Last name must be at least 2 characters",
    MAX_MESSAGE: "Last name must not exceed 50 characters",
  },

  PHONE: {
    MIN_LENGTH: 10,
    MAX_LENGTH: 15,
    MIN_MESSAGE: "Phone number must be at least 10 digits",
    MAX_MESSAGE: "Phone number must not exceed 15 digits",
  },

  BIO: {
    MAX_LENGTH: 500,
    MAX_MESSAGE: "Bio must not exceed 500 characters",
  },

  PASSWORD: {
    MIN_LENGTH: 8,
    MAX_LENGTH: 128,
    MIN_MESSAGE: "Password must be at least 8 characters",
    MAX_MESSAGE: "Password must not exceed 128 characters",
  },
} as const;

// ============================================================================
// SHOP VALIDATION RULES
// ============================================================================

export const SHOP_VALIDATION = {
  NAME: {
    MIN_LENGTH: 3,
    MAX_LENGTH: 100,
    MIN_MESSAGE: "Shop name must be at least 3 characters",
    MAX_MESSAGE: "Shop name must not exceed 100 characters",
  },

  SLUG: {
    MIN_LENGTH: 3,
    MAX_LENGTH: 100,
    MIN_MESSAGE: "Slug must be at least 3 characters",
    MAX_MESSAGE: "Slug must not exceed 100 characters",
  },

  DESCRIPTION: {
    MIN_LENGTH: 50,
    MAX_LENGTH: 2000,
    MIN_MESSAGE: "Description must be at least 50 characters",
    MAX_MESSAGE: "Description must not exceed 2000 characters",
  },

  PHONE: {
    MIN_LENGTH: 10,
    MAX_LENGTH: 15,
    MIN_MESSAGE: "Phone must be at least 10 digits",
    MAX_MESSAGE: "Phone must not exceed 15 digits",
  },

  ADDRESS: {
    MAX_LENGTH: 500,
    MAX_MESSAGE: "Address must not exceed 500 characters",
  },

  LOCATION: {
    MIN_LENGTH: 2,
    MAX_LENGTH: 100,
    MIN_MESSAGE: "Location must be at least 2 characters",
    MAX_MESSAGE: "Location must not exceed 100 characters",
  },

  POLICY: {
    MAX_LENGTH: 1000,
    MAX_MESSAGE: "Policy must not exceed 1000 characters",
  },
} as const;

// ============================================================================
// ADDRESS VALIDATION RULES
// ============================================================================

export const ADDRESS_VALIDATION = {
  STREET: {
    MIN_LENGTH: 5,
    MAX_LENGTH: 255,
    MIN_MESSAGE: "Street address must be at least 5 characters",
    MAX_MESSAGE: "Street address must not exceed 255 characters",
  },

  CITY: {
    MIN_LENGTH: 2,
    MAX_LENGTH: 100,
    MIN_MESSAGE: "City must be at least 2 characters",
    MAX_MESSAGE: "City must not exceed 100 characters",
  },

  STATE: {
    MIN_LENGTH: 2,
    MAX_LENGTH: 100,
    MIN_MESSAGE: "State must be at least 2 characters",
    MAX_MESSAGE: "State must not exceed 100 characters",
  },

  POSTAL_CODE: {
    MIN_LENGTH: 3,
    MAX_LENGTH: 20,
    MIN_MESSAGE: "Postal code must be at least 3 characters",
    MAX_MESSAGE: "Postal code must not exceed 20 characters",
  },

  COUNTRY: {
    MIN_LENGTH: 2,
    MAX_LENGTH: 100,
    MIN_MESSAGE: "Country must be at least 2 characters",
    MAX_MESSAGE: "Country must not exceed 100 characters",
  },
} as const;

// ============================================================================
// CATEGORY VALIDATION RULES
// ============================================================================

export const CATEGORY_VALIDATION = {
  NAME: {
    MIN_LENGTH: 2,
    MAX_LENGTH: 100,
    MIN_MESSAGE: "Category name must be at least 2 characters",
    MAX_MESSAGE: "Category name must not exceed 100 characters",
  },

  SLUG: {
    MIN_LENGTH: 2,
    MAX_LENGTH: 100,
    MIN_MESSAGE: "Slug must be at least 2 characters",
    MAX_MESSAGE: "Slug must not exceed 100 characters",
  },

  DESCRIPTION: {
    MAX_LENGTH: 1000,
    MAX_MESSAGE: "Description must not exceed 1000 characters",
  },

  ICON: {
    MAX_LENGTH: 50,
    MAX_MESSAGE: "Icon name must not exceed 50 characters",
  },

  META_TITLE: {
    MAX_LENGTH: 60,
    MAX_MESSAGE: "Meta title must not exceed 60 characters",
  },

  META_DESCRIPTION: {
    MAX_LENGTH: 160,
    MAX_MESSAGE: "Meta description must not exceed 160 characters",
  },

  COMMISSION: {
    MIN_VALUE: 0,
    MAX_VALUE: 100,
  },
} as const;

// ============================================================================
// COUPON/PROMOTION VALIDATION RULES
// ============================================================================

export const COUPON_VALIDATION = {
  CODE: {
    MIN_LENGTH: 3,
    MAX_LENGTH: 50,
    MIN_MESSAGE: "Coupon code must be at least 3 characters",
    MAX_MESSAGE: "Coupon code must not exceed 50 characters",
    PATTERN: /^[A-Z0-9]+$/,
    PATTERN_MESSAGE:
      "Coupon code must contain only uppercase letters and numbers",
  },

  DESCRIPTION: {
    MAX_LENGTH: 500,
    MAX_MESSAGE: "Description must not exceed 500 characters",
  },

  DISCOUNT_PERCENTAGE: {
    MIN_VALUE: 1,
    MAX_VALUE: 100,
    MIN_MESSAGE: "Discount percentage must be at least 1%",
    MAX_MESSAGE: "Discount percentage must not exceed 100%",
  },

  FLAT_DISCOUNT: {
    MIN_VALUE: 0,
    MIN_MESSAGE: "Discount amount must be 0 or greater",
  },

  MIN_PURCHASE_AMOUNT: {
    MIN_VALUE: 0,
    MIN_MESSAGE: "Minimum purchase amount must be 0 or greater",
  },
} as const;

// ============================================================================
// BLOG/CONTENT VALIDATION RULES
// ============================================================================

export const CONTENT_VALIDATION = {
  TITLE: {
    MIN_LENGTH: 5,
    MAX_LENGTH: 255,
    MIN_MESSAGE: "Title must be at least 5 characters",
    MAX_MESSAGE: "Title must not exceed 255 characters",
  },

  SLUG: {
    MIN_LENGTH: 5,
    MAX_LENGTH: 255,
    MIN_MESSAGE: "Slug must be at least 5 characters",
    MAX_MESSAGE: "Slug must not exceed 255 characters",
  },

  CONTENT: {
    MIN_LENGTH: 50,
    MAX_LENGTH: 10000,
    MIN_MESSAGE: "Content must be at least 50 characters",
    MAX_MESSAGE: "Content must not exceed 10000 characters",
  },

  EXCERPT: {
    MAX_LENGTH: 500,
    MAX_MESSAGE: "Excerpt must not exceed 500 characters",
  },

  TAGS: {
    MAX_COUNT: 10,
    MAX_MESSAGE: "Maximum 10 tags allowed",
    TAG_MAX_LENGTH: 50,
  },
} as const;

// ============================================================================
// MESSAGE/COMMUNICATION VALIDATION RULES
// ============================================================================

export const MESSAGE_VALIDATION = {
  SUBJECT: {
    MIN_LENGTH: 3,
    MAX_LENGTH: 200,
    MIN_MESSAGE: "Subject must be at least 3 characters",
    MAX_MESSAGE: "Subject must not exceed 200 characters",
  },

  BODY: {
    MIN_LENGTH: 5,
    MAX_LENGTH: 5000,
    MIN_MESSAGE: "Message must be at least 5 characters",
    MAX_MESSAGE: "Message must not exceed 5000 characters",
  },

  ATTACHMENT_SIZE_MB: 10,
  MAX_ATTACHMENTS: 5,
} as const;

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get validation message for a field
 * @param config Validation config object with MIN_MESSAGE/MAX_MESSAGE properties
 * @param type "min" or "max"
 */
export function getValidationMessage(
  config: { MIN_MESSAGE?: string; MAX_MESSAGE?: string },
  type: "min" | "max"
): string {
  return type === "min" ? config.MIN_MESSAGE || "" : config.MAX_MESSAGE || "";
}

/**
 * Check if value meets length requirements
 * @param value String value to check
 * @param config Validation config with MIN_LENGTH and/or MAX_LENGTH
 */
export function validateLength(
  value: string,
  config: { MIN_LENGTH?: number; MAX_LENGTH?: number }
): boolean {
  if (config.MIN_LENGTH && value.length < config.MIN_LENGTH) return false;
  if (config.MAX_LENGTH && value.length > config.MAX_LENGTH) return false;
  return true;
}

/**
 * Check if value meets numeric requirements
 * @param value Numeric value to check
 * @param config Validation config with MIN_VALUE and/or MAX_VALUE
 */
export function validateRange(
  value: number,
  config: { MIN_VALUE?: number; MAX_VALUE?: number }
): boolean {
  if (config.MIN_VALUE !== undefined && value < config.MIN_VALUE) return false;
  if (config.MAX_VALUE !== undefined && value > config.MAX_VALUE) return false;
  return true;
}
