/**
 * SEO-Friendly ID Generation Utilities
 *
 * All unique IDs in the system are SEO-friendly strings that follow specific patterns.
 * These IDs are used for document IDs, URLs, barcodes, and QR codes.
 *
 * ID Generation Patterns:
 * - Category: category-{name}-{parent/root-name}
 * - Review: review-{product-name}-{user-first-name}-{date}
 * - Product: product-{name}-{category}-{condition}-{seller-name}-{count}
 * - Auction: auction-{name}-{category}-{condition}-{seller-name}-{count}
 * - Order: order-{product-count}-{date}-{random-number}
 * - User: user-{first-name}-{last-name}-{email-starting}
 * - FAQ: faq-{category}-{question-slug}
 * - Coupon: coupon-{code} (user-provided code)
 * - Carousel: carousel-{title-slug}-{timestamp}
 * - Homepage Section: section-{type}-{timestamp}
 */

import { slugify } from "./formatters/string.formatter";

/**
 * Generate random alphanumeric string
 * Used for uniqueness in IDs
 */
function generateRandomString(length: number = 6): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Get date string in YYYYMMDD format
 */
function getDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}${month}${day}`;
}

/**
 * Get timestamp string
 */
function getTimestamp(): string {
  return Date.now().toString();
}

// ============================================
// CATEGORY ID GENERATION
// ============================================

export interface GenerateCategoryIdInput {
  name: string;
  parentName?: string; // Parent category name (if has parent)
  rootName?: string; // Root category name (if tier > 0)
}

/**
 * Generate category ID: category-{name}-{parent/root-name}
 *
 * Examples:
 * - Root: category-electronics
 * - Child: category-smartphones-electronics
 * - Grandchild: category-android-smartphones
 */
export function generateCategoryId(input: GenerateCategoryIdInput): string {
  const nameSlug = slugify(input.name);

  if (input.parentName) {
    // Has immediate parent
    const parentSlug = slugify(input.parentName);
    return `category-${nameSlug}-${parentSlug}`;
  } else if (input.rootName) {
    // No parent but has root
    const rootSlug = slugify(input.rootName);
    return `category-${nameSlug}-${rootSlug}`;
  } else {
    // Root category
    return `category-${nameSlug}`;
  }
}

// ============================================
// USER ID GENERATION
// ============================================

export interface GenerateUserIdInput {
  firstName: string;
  lastName: string;
  email: string;
}

/**
 * Generate user ID: user-{first-name}-{last-name}-{email-starting}
 *
 * Examples:
 * - user-john-doe-johndoe
 * - user-jane-smith-janes
 */
export function generateUserId(input: GenerateUserIdInput): string {
  const firstSlug = slugify(input.firstName);
  const lastSlug = slugify(input.lastName);
  const emailPrefix = input.email.split("@")[0].toLowerCase().substring(0, 8);
  const emailSlug = slugify(emailPrefix);

  return `user-${firstSlug}-${lastSlug}-${emailSlug}`;
}

// ============================================
// PRODUCT ID GENERATION
// ============================================

export interface GenerateProductIdInput {
  name: string;
  category: string;
  condition: "new" | "used" | "refurbished"; // Product condition
  sellerName: string;
  count?: number; // Auto-increment count for duplicate names
}

/**
 * Generate product ID: product-{name}-{category}-{condition}-{seller-name}-{count}
 *
 * Examples:
 * - product-iphone-15-pro-smartphones-new-techstore-1
 * - product-samsung-galaxy-s24-smartphones-used-gadgetshop-1
 */
export function generateProductId(input: GenerateProductIdInput): string {
  const nameSlug = slugify(input.name);
  const categorySlug = slugify(input.category);
  const conditionSlug = input.condition.toLowerCase();
  const sellerSlug = slugify(input.sellerName);
  const count = input.count || 1;

  return `product-${nameSlug}-${categorySlug}-${conditionSlug}-${sellerSlug}-${count}`;
}

// ============================================
// AUCTION ID GENERATION
// ============================================

export interface GenerateAuctionIdInput {
  name: string;
  category: string;
  condition: "new" | "used" | "refurbished";
  sellerName: string;
  count?: number; // Auto-increment count for duplicate names
}

/**
 * Generate auction ID: auction-{name}-{category}-{condition}-{seller-name}-{count}
 *
 * Examples:
 * - auction-vintage-watch-watches-used-collectibles-1
 * - auction-rare-book-books-used-bookshop-2
 */
export function generateAuctionId(input: GenerateAuctionIdInput): string {
  const nameSlug = slugify(input.name);
  const categorySlug = slugify(input.category);
  const conditionSlug = input.condition.toLowerCase();
  const sellerSlug = slugify(input.sellerName);
  const count = input.count || 1;

  return `auction-${nameSlug}-${categorySlug}-${conditionSlug}-${sellerSlug}-${count}`;
}

// ============================================
// REVIEW ID GENERATION
// ============================================

export interface GenerateReviewIdInput {
  productName: string;
  userFirstName: string;
  date?: Date; // Optional, defaults to now
}

/**
 * Generate review ID: review-{product-name}-{user-first-name}-{date}
 *
 * Examples:
 * - review-iphone-15-pro-john-20260207
 * - review-samsung-galaxy-jane-20260207
 */
export function generateReviewId(input: GenerateReviewIdInput): string {
  const productSlug = slugify(input.productName);
  const userSlug = slugify(input.userFirstName);
  const date = input.date || new Date();
  const dateStr = getDateString();

  return `review-${productSlug}-${userSlug}-${dateStr}`;
}

// ============================================
// ORDER ID GENERATION
// ============================================

export interface GenerateOrderIdInput {
  productCount: number; // Number of items in order
  date?: Date; // Optional, defaults to now
}

/**
 * Generate order ID: order-{product-count}-{date}-{random-number}
 *
 * Examples:
 * - order-3-20260207-a7b2c9
 * - order-1-20260207-x4y9z1
 */
export function generateOrderId(input: GenerateOrderIdInput): string {
  const dateStr = getDateString();
  const random = generateRandomString(6);

  return `order-${input.productCount}-${dateStr}-${random}`;
}

// ============================================
// FAQ ID GENERATION
// ============================================

export interface GenerateFAQIdInput {
  category: string; // FAQ category (shipping, returns, etc.)
  question: string; // FAQ question text
}

/**
 * Generate FAQ ID: faq-{category}-{question-slug}
 *
 * Examples:
 * - faq-shipping-how-long-does-delivery-take
 * - faq-returns-what-is-your-return-policy
 */
export function generateFAQId(input: GenerateFAQIdInput): string {
  const categorySlug = slugify(input.category);
  const questionSlug = slugify(input.question).substring(0, 50); // Limit length

  return `faq-${categorySlug}-${questionSlug}`;
}

// ============================================
// COUPON ID GENERATION
// ============================================

/**
 * Generate coupon ID from user-provided code: coupon-{code}
 *
 * Examples:
 * - coupon-SAVE20
 * - coupon-FREESHIP
 */
export function generateCouponId(code: string): string {
  const codeSlug = code.toUpperCase().replace(/[^A-Z0-9]/g, "");
  return `coupon-${codeSlug}`;
}

// ============================================
// CAROUSEL SLIDE ID GENERATION
// ============================================

export interface GenerateCarouselIdInput {
  title: string;
}

/**
 * Generate carousel slide ID: carousel-{title-slug}-{timestamp}
 *
 * Examples:
 * - carousel-winter-sale-1707300000000
 * - carousel-new-arrivals-1707300000001
 */
export function generateCarouselId(input: GenerateCarouselIdInput): string {
  const titleSlug = slugify(input.title).substring(0, 30);
  const timestamp = getTimestamp();

  return `carousel-${titleSlug}-${timestamp}`;
}

// ============================================
// HOMEPAGE SECTION ID GENERATION
// ============================================

export interface GenerateHomepageSectionIdInput {
  type: string; // Section type (welcome, categories, products, etc.)
}

/**
 * Generate homepage section ID: section-{type}-{timestamp}
 *
 * Examples:
 * - section-welcome-1707300000000
 * - section-categories-1707300000001
 */
export function generateHomepageSectionId(
  input: GenerateHomepageSectionIdInput,
): string {
  const typeSlug = slugify(input.type);
  const timestamp = getTimestamp();

  return `section-${typeSlug}-${timestamp}`;
}

// ============================================
// BID ID GENERATION
// ============================================

export interface GenerateBidIdInput {
  productName: string;
  userFirstName: string;
  date?: Date; // Optional, defaults to now
  random?: string; // Optional random suffix for uniqueness
}

/**
 * Generate bid ID: bid-{product-name}-{user-first-name}-{date}-{random}
 *
 * Examples:
 * - bid-vintage-camera-john-20260210-a7b2c9
 * - bid-rare-watch-jane-20260210-x4y9z1
 */
export function generateBidId(input: GenerateBidIdInput): string {
  const productSlug = slugify(input.productName).substring(0, 30);
  const userSlug = slugify(input.userFirstName);
  const dateStr = input.date ? getDateString() : getDateString();
  const random = input.random || generateRandomString(6);

  return `bid-${productSlug}-${userSlug}-${dateStr}-${random}`;
}

// ============================================
// BARCODE GENERATION
// ============================================

/**
 * Generate barcode-compatible string from ID
 * - Converts ID to numeric string suitable for barcode encoding
 * - Uses simple character-to-number mapping
 *
 * This is a placeholder - actual barcode generation should use
 * a proper library like jsbarcode or barcode-generator
 *
 * @deprecated Not currently used in the codebase. Retained for potential future use.
 */
export function generateBarcodeFromId(id: string): string {
  // Convert string to numeric representation
  let numeric = "";
  for (let i = 0; i < id.length; i++) {
    const char = id.charAt(i);
    if (char >= "0" && char <= "9") {
      numeric += char;
    } else {
      // Convert letter to number (a=10, b=11, ..., z=35)
      const code = char.charCodeAt(0);
      if (code >= 97 && code <= 122) {
        numeric += (code - 87).toString();
      }
    }
  }

  // Pad or truncate to standard barcode length (12-13 digits for EAN/UPC)
  return numeric.padEnd(12, "0").substring(0, 12);
}

// ============================================
// QR CODE DATA GENERATION
// ============================================

/**
 * Generate QR code data from ID
 * - Returns full URL for the entity
 * - QR code libraries can encode this URL
 *
 * This is a placeholder - actual QR generation should use
 * a proper library like qrcode or react-qr-code
 *
 * @deprecated Not currently used in the codebase. Retained for potential future use.
 */
export function generateQRCodeData(
  id: string,
  baseUrl: string = "https://letitrip.in",
): string {
  // Determine entity type from ID prefix
  const prefix = id.split("-")[0];

  const urlMap: Record<string, string> = {
    product: `/products/${id}`,
    auction: `/auctions/${id}`,
    category: `/categories/${id}`,
    order: `/orders/${id}`,
    user: `/profile/${id}`,
    review: `/reviews/${id}`,
    faq: `/faqs/${id}`,
    coupon: `/coupons/${id}`,
  };

  const path = urlMap[prefix] || `/${id}`;
  return `${baseUrl}${path}`;
}

// ============================================
// HELPER: CHECK IF ID EXISTS
// ============================================

/**
 * Helper to check if an ID already exists in a collection
 * Used by repositories to auto-increment count for duplicate names
 *
 * @param getExistingId - Async function to fetch existing document
 * @returns True if ID exists, false otherwise
 */
export async function idExists(
  getExistingId: () => Promise<any>,
): Promise<boolean> {
  try {
    const doc = await getExistingId();
    return !!doc;
  } catch (error) {
    return false;
  }
}

/**
 * Helper to generate unique ID with auto-incrementing count
 * Keeps trying with incrementing count until unique ID is found
 *
 * @param generateId - Function to generate ID with count parameter
 * @param checkExists - Function to check if ID exists
 * @param maxAttempts - Maximum number of attempts (default: 100)
 * @returns Unique ID
 */
export async function generateUniqueId(
  generateId: (count: number) => string,
  checkExists: (id: string) => Promise<boolean>,
  maxAttempts: number = 100,
): Promise<string> {
  for (let count = 1; count <= maxAttempts; count++) {
    const id = generateId(count);
    const exists = await checkExists(id);

    if (!exists) {
      return id;
    }
  }

  // Fallback: add random string if max attempts reached
  const baseId = generateId(maxAttempts);
  const random = generateRandomString(4);
  return `${baseId}-${random}`;
}
