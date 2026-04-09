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
 * - Blog Post: blog-{title-slug}-{category}[-{status}]
 * - Payout: payout-{seller-slug}-{YYYYMMDD}-{random}
 */

import { slugify } from "@mohasinac/appkit/utils";

/**
 * Generate random alphanumeric string
 * Used for uniqueness in IDs
 */
function generateRandomString(length: number = 6): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  const indices = new Uint8Array(length);
  globalThis.crypto.getRandomValues(indices);
  return Array.from(indices, (i) => chars[i % chars.length]).join("");
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
// PRE-ORDER ID GENERATION
// ============================================

export interface GeneratePreOrderIdInput {
  name: string;
  category: string;
  condition: "new" | "used" | "refurbished";
  sellerName: string;
  count?: number; // Auto-increment count for duplicate names
}

/**
 * Generate pre-order ID: preorder-{name}-{category}-{condition}-{seller-name}-{count}
 *
 * Examples:
 * - preorder-macbook-pro-m4-laptops-new-techstore-1
 * - preorder-limited-sneaker-footwear-new-brandshop-1
 */
export function generatePreOrderId(input: GeneratePreOrderIdInput): string {
  const nameSlug = slugify(input.name);
  const categorySlug = slugify(input.category);
  const conditionSlug = input.condition.toLowerCase();
  const sellerSlug = slugify(input.sellerName);
  const count = input.count || 1;

  return `preorder-${nameSlug}-${categorySlug}-${conditionSlug}-${sellerSlug}-${count}`;
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

  // Format the provided date or today's date
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const dateStr = `${year}${month}${day}`;

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
  const date = input.date || new Date();

  // Format the provided date or today's date
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const dateStr = `${year}${month}${day}`;

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
  const date = input.date || new Date();

  // Format the provided date or today's date
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const dateStr = `${year}${month}${day}`;

  const random = input.random || generateRandomString(6);

  return `bid-${productSlug}-${userSlug}-${dateStr}-${random}`;
}

// ============================================
// BLOG POST ID GENERATION
// ============================================

export interface GenerateBlogPostIdInput {
  title: string;
  category: string;
  status?: "draft" | "published" | "archived";
}

/**
 * Generate blog post ID: blog-{title-slug}-{category}[-{status}]
 * Status suffix only added for non-published posts.
 *
 * Examples:
 * - blog-top-10-rarest-anime-figures-2026-guides
 * - blog-gunpla-journey-beginners-tips
 * - blog-guide-authenticating-anime-merchandise-draft
 */
export function generateBlogPostId(input: GenerateBlogPostIdInput): string {
  const titleSlug = slugify(input.title).substring(0, 40).replace(/-+$/, "");
  const categorySlug = slugify(input.category);
  const base = `blog-${titleSlug}-${categorySlug}`;
  if (input.status && input.status !== "published") {
    return `${base}-${input.status}`;
  }
  return base;
}

// ============================================
// PAYOUT ID GENERATION
// ============================================

export interface GeneratePayoutIdInput {
  sellerName: string;
  date?: Date;
}

/**
 * Generate payout ID: payout-{seller-slug}-{YYYYMMDD}-{random}
 *
 * Examples:
 * - payout-figurevault-jp-20260301-a7b2c9
 * - payout-animecraft-apparel-20260228-x4y9z1
 */
export function generatePayoutId(input: GeneratePayoutIdInput): string {
  const sellerSlug = slugify(input.sellerName)
    .substring(0, 25)
    .replace(/-+$/, "");
  const date = input.date || new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const dateStr = `${year}${month}${day}`;
  const random = generateRandomString(6);
  return `payout-${sellerSlug}-${dateStr}-${random}`;
}

// ============================================
// MEDIA FILENAME GENERATION
// ============================================
//
// All filenames are SEO-friendly slugs so that a shared Storage URL is
// immediately self-describing (entity type, subject, context, index, ext).
//
// Naming patterns (all lowercase, hyphen-separated):
//   product image  → product-{name}-{category}-{store}-image-{n}.{ext}
//   product video  → product-{name}-{category}-{store}-video-{n}.{ext}
//   auction image  → auction-{name}-{category}-{store}-image-{n}.{ext}
//   preorder image → preorder-{name}-{category}-{store}-image-{n}.{ext}
//   store logo     → store-{name}-logo.{ext}
//   store banner   → store-{name}-banner.{ext}
//   blog image     → blog-{title}-{category}-image-{n}.{ext}
//   event image    → event-{title}-image-{n}.{ext}
//   category image → category-{name}-image.{ext}
//   user avatar    → user-{firstName}-{lastName}-avatar.{ext}
//   carousel image → carousel-{title}-image.{ext}
//   cropped image  → {original-basename}-cropped.{ext}
//   trimmed video  → {original-basename}-trimmed.{ext}
//   invoice        → invoice-{orderId}-{YYYYMMDD}.pdf
//   payout doc     → payout-doc-{sellerName}-{YYYYMMDD}.pdf

/** Strip the extension from a filename/path and return only the basename slug */
function basenameStem(filenameOrPath: string): string {
  const filename = filenameOrPath.split("/").pop() ?? filenameOrPath;
  const dotIndex = filename.lastIndexOf(".");
  return dotIndex > 0 ? filename.slice(0, dotIndex) : filename;
}

// ---- Product image ----

export interface GenerateProductImageFilenameInput {
  name: string;
  category: string;
  store: string;
  index?: number; // 1-based, defaults to 1
  ext?: string; // default: 'webp'
}

/**
 * Generate product image filename.
 * Example: product-iphone-15-pro-smartphones-techstore-image-1.webp
 */
export function generateProductImageFilename(
  input: GenerateProductImageFilenameInput,
): string {
  const name = slugify(input.name).substring(0, 40).replace(/-+$/, "");
  const category = slugify(input.category).substring(0, 20).replace(/-+$/, "");
  const store = slugify(input.store).substring(0, 20).replace(/-+$/, "");
  const n = input.index ?? 1;
  const ext = (input.ext ?? "webp").replace(/^\./, "");
  return `product-${name}-${category}-${store}-image-${n}.${ext}`;
}

// ---- Product video ----

export interface GenerateProductVideoFilenameInput {
  name: string;
  category: string;
  store: string;
  index?: number;
  ext?: string; // default: 'mp4'
}

/**
 * Generate product video filename.
 * Example: product-iphone-15-pro-smartphones-techstore-video-1.mp4
 */
export function generateProductVideoFilename(
  input: GenerateProductVideoFilenameInput,
): string {
  const name = slugify(input.name).substring(0, 40).replace(/-+$/, "");
  const category = slugify(input.category).substring(0, 20).replace(/-+$/, "");
  const store = slugify(input.store).substring(0, 20).replace(/-+$/, "");
  const n = input.index ?? 1;
  const ext = (input.ext ?? "mp4").replace(/^\./, "");
  return `product-${name}-${category}-${store}-video-${n}.${ext}`;
}

// ---- Auction image ----

export interface GenerateAuctionImageFilenameInput {
  name: string;
  category: string;
  store: string;
  index?: number;
  ext?: string; // default: 'webp'
}

/**
 * Generate auction image filename.
 * Example: auction-vintage-watch-watches-collectibles-image-1.webp
 */
export function generateAuctionImageFilename(
  input: GenerateAuctionImageFilenameInput,
): string {
  const name = slugify(input.name).substring(0, 40).replace(/-+$/, "");
  const category = slugify(input.category).substring(0, 20).replace(/-+$/, "");
  const store = slugify(input.store).substring(0, 20).replace(/-+$/, "");
  const n = input.index ?? 1;
  const ext = (input.ext ?? "webp").replace(/^\./, "");
  return `auction-${name}-${category}-${store}-image-${n}.${ext}`;
}

// ---- Pre-order image ----

export interface GeneratePreOrderImageFilenameInput {
  name: string;
  category: string;
  store: string;
  index?: number;
  ext?: string; // default: 'webp'
}

/**
 * Generate pre-order image filename.
 * Example: preorder-macbook-pro-m4-laptops-techstore-image-1.webp
 */
export function generatePreOrderImageFilename(
  input: GeneratePreOrderImageFilenameInput,
): string {
  const name = slugify(input.name).substring(0, 40).replace(/-+$/, "");
  const category = slugify(input.category).substring(0, 20).replace(/-+$/, "");
  const store = slugify(input.store).substring(0, 20).replace(/-+$/, "");
  const n = input.index ?? 1;
  const ext = (input.ext ?? "webp").replace(/^\./, "");
  return `preorder-${name}-${category}-${store}-image-${n}.${ext}`;
}

// ---- Store logo / banner ----

/**
 * Generate store logo filename.
 * Example: store-figurevault-jp-logo.webp
 */
export function generateStoreLogoFilename(
  storeName: string,
  ext: string = "webp",
): string {
  const store = slugify(storeName).substring(0, 40).replace(/-+$/, "");
  const cleanExt = ext.replace(/^\./, "");
  return `store-${store}-logo.${cleanExt}`;
}

/**
 * Generate store banner filename.
 * Example: store-figurevault-jp-banner.webp
 */
export function generateStoreBannerFilename(
  storeName: string,
  ext: string = "webp",
): string {
  const store = slugify(storeName).substring(0, 40).replace(/-+$/, "");
  const cleanExt = ext.replace(/^\./, "");
  return `store-${store}-banner.${cleanExt}`;
}

// ---- Blog post image ----

export interface GenerateBlogImageFilenameInput {
  title: string;
  category: string;
  index?: number;
  ext?: string; // default: 'webp'
}

/**
 * Generate blog post image filename.
 * Example: blog-top-10-rarest-anime-figures-guides-image-1.webp
 */
export function generateBlogImageFilename(
  input: GenerateBlogImageFilenameInput,
): string {
  const title = slugify(input.title).substring(0, 40).replace(/-+$/, "");
  const category = slugify(input.category).substring(0, 20).replace(/-+$/, "");
  const n = input.index ?? 1;
  const ext = (input.ext ?? "webp").replace(/^\./, "");
  return `blog-${title}-${category}-image-${n}.${ext}`;
}

// ---- Event image ----

export interface GenerateEventImageFilenameInput {
  title: string;
  index?: number;
  ext?: string; // default: 'webp'
}

/**
 * Generate event image filename.
 * Example: event-tokyo-toys-expo-2026-image-1.webp
 */
export function generateEventImageFilename(
  input: GenerateEventImageFilenameInput,
): string {
  const title = slugify(input.title).substring(0, 50).replace(/-+$/, "");
  const n = input.index ?? 1;
  const ext = (input.ext ?? "webp").replace(/^\./, "");
  return `event-${title}-image-${n}.${ext}`;
}

// ---- Category image ----

/**
 * Generate category image filename.
 * Example: category-smartphones-image.webp
 */
export function generateCategoryImageFilename(
  categoryName: string,
  ext: string = "webp",
): string {
  const name = slugify(categoryName).substring(0, 40).replace(/-+$/, "");
  const cleanExt = ext.replace(/^\./, "");
  return `category-${name}-image.${cleanExt}`;
}

// ---- User avatar ----

/**
 * Generate user avatar filename.
 * Example: user-john-doe-avatar.webp
 */
export function generateUserAvatarFilename(
  firstName: string,
  lastName: string,
  ext: string = "webp",
): string {
  const first = slugify(firstName).substring(0, 20).replace(/-+$/, "");
  const last = slugify(lastName).substring(0, 20).replace(/-+$/, "");
  const cleanExt = ext.replace(/^\./, "");
  return `user-${first}-${last}-avatar.${cleanExt}`;
}

// ---- Carousel image ----

/**
 * Generate carousel slide image filename.
 * Example: carousel-winter-sale-image.webp
 */
export function generateCarouselImageFilename(
  title: string,
  ext: string = "webp",
): string {
  const slug = slugify(title).substring(0, 40).replace(/-+$/, "");
  const cleanExt = ext.replace(/^\./, "");
  return `carousel-${slug}-image.${cleanExt}`;
}

// ---- Cropped image ----

/**
 * Generate cropped image filename derived from the original file's basename.
 * Example: product-iphone-15-pro-smartphones-techstore-image-1-cropped.webp
 *
 * @param originalFilenameOrPath - Filename or Storage path of the source file
 * @param ext - Output extension (defaults to original extension or 'webp')
 */
export function generateCroppedImageFilename(
  originalFilenameOrPath: string,
  ext?: string,
): string {
  const stem = basenameStem(originalFilenameOrPath);
  const originalExt = originalFilenameOrPath.includes(".")
    ? originalFilenameOrPath.split(".").pop()!
    : "webp";
  const cleanExt = (ext ?? originalExt).replace(/^\./, "");
  return `${stem}-cropped.${cleanExt}`;
}

// ---- Trimmed video ----

/**
 * Generate trimmed video filename derived from the original file's basename.
 * Example: product-iphone-15-pro-smartphones-techstore-video-1-trimmed.mp4
 *
 * @param originalFilenameOrPath - Filename or Storage path of the source file
 * @param ext - Output extension (defaults to original extension or 'mp4')
 */
export function generateTrimmedVideoFilename(
  originalFilenameOrPath: string,
  ext?: string,
): string {
  const stem = basenameStem(originalFilenameOrPath);
  const originalExt = originalFilenameOrPath.includes(".")
    ? originalFilenameOrPath.split(".").pop()!
    : "mp4";
  const cleanExt = (ext ?? originalExt).replace(/^\./, "");
  return `${stem}-trimmed.${cleanExt}`;
}

// ---- Invoice PDF ----

/**
 * Generate invoice filename tied to the order ID and date.
 * Example: invoice-order-3-20260301-a7b2c9-20260301.pdf
 *
 * @param orderId  - The SEO-friendly order ID (e.g. `order-3-20260301-a7b2c9`)
 * @param date     - Invoice date (defaults to today)
 */
export function generateInvoiceFilename(
  orderId: string,
  date: Date = new Date(),
): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const dateStr = `${year}${month}${day}`;
  return `invoice-${orderId}-${dateStr}.pdf`;
}

// ---- Payout document PDF ----

/**
 * Generate payout document filename tied to the seller and date.
 * Example: payout-doc-figurevault-jp-20260301.pdf
 *
 * @param sellerName - Seller display name
 * @param date       - Payout date (defaults to today)
 */
export function generatePayoutDocFilename(
  sellerName: string,
  date: Date = new Date(),
): string {
  const seller = slugify(sellerName).substring(0, 30).replace(/-+$/, "");
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const dateStr = `${year}${month}${day}`;
  return `payout-doc-${seller}-${dateStr}.pdf`;
}

// ---- Unified dispatcher ----

export type MediaFilenameContext =
  | ({ type: "product-image" } & GenerateProductImageFilenameInput)
  | ({ type: "product-video" } & GenerateProductVideoFilenameInput)
  | ({ type: "auction-image" } & GenerateAuctionImageFilenameInput)
  | ({ type: "preorder-image" } & GeneratePreOrderImageFilenameInput)
  | { type: "store-logo"; store: string; ext?: string }
  | { type: "store-banner"; store: string; ext?: string }
  | ({ type: "blog-image" } & GenerateBlogImageFilenameInput)
  | ({ type: "event-image" } & GenerateEventImageFilenameInput)
  | { type: "category-image"; name: string; ext?: string }
  | { type: "user-avatar"; firstName: string; lastName: string; ext?: string }
  | { type: "carousel-image"; title: string; ext?: string }
  | { type: "invoice"; orderId: string; date?: Date; ext?: string }
  | { type: "payout-doc"; sellerName: string; date?: Date; ext?: string };

/**
 * Unified dispatcher — returns a SEO-friendly filename for any media context.
 *
 * @example
 * generateMediaFilename({ type: 'product-image', name: 'iPhone 15 Pro', category: 'Smartphones', store: 'TechStore', index: 2 })
 * // → "product-iphone-15-pro-smartphones-techstore-image-2.webp"
 */
export function generateMediaFilename(ctx: MediaFilenameContext): string {
  switch (ctx.type) {
    case "product-image":
      return generateProductImageFilename(ctx);
    case "product-video":
      return generateProductVideoFilename(ctx);
    case "auction-image":
      return generateAuctionImageFilename(ctx);
    case "preorder-image":
      return generatePreOrderImageFilename(ctx);
    case "store-logo":
      return generateStoreLogoFilename(ctx.store, ctx.ext);
    case "store-banner":
      return generateStoreBannerFilename(ctx.store, ctx.ext);
    case "blog-image":
      return generateBlogImageFilename(ctx);
    case "event-image":
      return generateEventImageFilename(ctx);
    case "category-image":
      return generateCategoryImageFilename(ctx.name, ctx.ext);
    case "user-avatar":
      return generateUserAvatarFilename(ctx.firstName, ctx.lastName, ctx.ext);
    case "carousel-image":
      return generateCarouselImageFilename(ctx.title, ctx.ext);
    case "invoice":
      return generateInvoiceFilename(ctx.orderId, ctx.date);
    case "payout-doc":
      return generatePayoutDocFilename(ctx.sellerName, ctx.date);
  }
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
  } catch (_e) {
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

// ─── Barcode / QR helpers ────────────────────────────────────────────────────

/**
 * Generates a numeric EAN-12-compatible barcode string from a document ID.
 * Extracts any digit runs from the ID; pads or trims to 12 digits.
 */
export function generateBarcodeFromId(id: string): string {
  const digits = id.replace(/\D/g, "");
  if (digits.length >= 12) return digits.slice(0, 12);
  return digits.padEnd(12, "0");
}

/**
 * Generates the deep-link URL to embed in a QR code for a given document ID.
 * Infers the path type from the ID prefix.
 */
export function generateQRCodeData(
  id: string,
  baseUrl: string = "https://letitrip.in",
): string {
  if (id.startsWith("product-")) return `${baseUrl}/products/${id}`;
  if (id.startsWith("auction-")) return `${baseUrl}/auctions/${id}`;
  if (id.startsWith("category-")) return `${baseUrl}/categories/${id}`;
  if (id.startsWith("store-")) return `${baseUrl}/stores/${id}`;
  if (id.startsWith("event-")) return `${baseUrl}/events/${id}`;
  return `${baseUrl}/${id}`;
}

// ============================================
// OFFER ID GENERATION
// ============================================

export interface GenerateOfferIdInput {
  productId: string;
  buyerUid: string;
  date?: Date;
}

/**
 * Generate offer ID: offer-{product-prefix}-{buyer-prefix}-{YYYYMMDD}-{random}
 *
 * Examples:
 * - offer-product-vintage-camera-user-john-20260313-a7b2c9
 */
export function generateOfferId(input: GenerateOfferIdInput): string {
  const productPrefix = slugify(input.productId)
    .substring(0, 20)
    .replace(/-+$/, "");
  const buyerPrefix = slugify(input.buyerUid)
    .substring(0, 12)
    .replace(/-+$/, "");
  const date = input.date || new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const dateStr = `${year}${month}${day}`;
  const random = generateRandomString(6);
  return `offer-${productPrefix}-${buyerPrefix}-${dateStr}-${random}`;
}
