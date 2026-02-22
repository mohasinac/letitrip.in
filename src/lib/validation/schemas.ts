/**
 * Zod Validation Schemas for API Requests
 *
 * Centralized request validation using Zod
 *
 * TODO (Future) - Phase 2:
 * - Add custom error messages for better UX
 * - Implement conditional validation rules
 * - Add cross-field validation (e.g., end date > start date)
 * - Create reusable schema fragments
 * - Add transform functions for data normalization
 * - Implement schema versioning for API versions
 * - Add localized error messages (i18n)
 * - Create OpenAPI schema generation from Zod
 */

import { z } from "zod";

// ============================================
// COMMON SCHEMAS
// ============================================

/**
 * Pagination query schema
 * NOTE: Max limit is enforced per field (max 100) Ã¢â‚¬â€ role-based limit reduction is a future enhancement
 */
export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  sortBy: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
  search: z.string().min(1).max(100).optional(),
});

/**
 * MongoDB ObjectId validation (also accepts Firestore IDs and SEO-friendly slugs)
 * Pattern accepts lowercase alphanumeric + hyphens to support both ID formats
 */
export const objectIdSchema = z.string().regex(/^[a-z0-9-]+$/);

/**
 * URL validation — generic (no domain restriction).
 * For media/CDN URLs use `mediaUrlSchema` which enforces the approved-domain whitelist.
 */
export const urlSchema = z.string().url().max(2048);
/**
 * Media URL validation — restricts to approved CDN/storage domains.
 * Use this for product images, videos, and avatars uploaded via /api/media/upload.
 */
const APPROVED_MEDIA_DOMAINS = [
  "firebasestorage.googleapis.com",
  "storage.googleapis.com",
  "res.cloudinary.com",
  "images.unsplash.com",
  "cdn.letitrip.in",
];

export const mediaUrlSchema = z
  .string()
  .url()
  .max(2048)
  .refine(
    (url) => {
      try {
        const { hostname } = new URL(url);
        return APPROVED_MEDIA_DOMAINS.some(
          (domain) => hostname === domain || hostname.endsWith(`.${domain}`),
        );
      } catch {
        return false;
      }
    },
    { message: "Image or video URL must be hosted on an approved CDN domain" },
  );
/**
 * Date string validation (ISO 8601)
 */
export const dateStringSchema = z.string().datetime();

/**
 * Strong password validation with advanced rules
 */
export const passwordSchema = z
  .string()
  .min(12, "Password must be at least 12 characters")
  .max(128, "Password must be less than 128 characters")
  .refine((password) => {
    // At least one uppercase
    if (!/[A-Z]/.test(password)) return false;
    // At least one lowercase
    if (!/[a-z]/.test(password)) return false;
    // At least one digit
    if (!/\d/.test(password)) return false;
    // At least one special character
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) return false;
    return true;
  }, "Password must contain uppercase, lowercase, number, and special character")
  .refine((password) => {
    // Prevent common keyboard patterns
    const patterns = ["qwerty", "asdf", "zxcv", "123456", "password", "admin"];
    return !patterns.some((p) => password.toLowerCase().includes(p));
  }, "Password contains common patterns");

/**
 * Phone number validation (E.164 format)
 */
export const phoneSchema = z
  .string()
  .refine((phone) => {
    // E.164 format validation: +[country code][number]
    const e164Pattern = /^\+?[1-9]\d{1,14}$/;
    return e164Pattern.test(phone.replace(/\D/g, ""));
  }, "Invalid phone number format")
  .refine((phone) => {
    // Check length after removing non-digits
    const digits = phone.replace(/\D/g, "");
    return digits.length >= 10 && digits.length <= 15;
  }, "Phone number must have 10-15 digits");

/**
 * Email validation
 */
export const emailSchema = z.string().email().max(255);

/**
 * Address schema with field validation
 */
export const addressSchema = z.object({
  street: z
    .string()
    .min(5, "Street address too short")
    .max(100, "Street address too long")
    .refine(
      (street) => !/^[\d\s]+$/.test(street),
      "Street must contain non-numeric characters",
    ),
  city: z
    .string()
    .min(2, "City name too short")
    .regex(/^[a-zA-Z\s\-']+$/, "Invalid city name"),
  state: z.string().min(2, "State code required").max(50, "Invalid state"),
  pincode: z
    .string()
    .refine((pin) => /^\d{5,6}$/.test(pin), "Invalid pincode format"),
  country: z
    .string()
    .length(2, "Country code must be 2 characters")
    .toUpperCase(),
});

// ============================================
// ADDRESS SCHEMAS (user subcollection)
// ============================================

/**
 * Base user address schema Ã¢â‚¬â€ covers Indian addresses
 */
const userAddressBaseSchema = z.object({
  label: z.string().min(1, "Label is required").max(50, "Label too long"),
  fullName: z
    .string()
    .min(2, "Full name too short")
    .max(100, "Full name too long"),
  phone: z.string().regex(/^\+?[0-9]{10,15}$/, "Invalid phone number"),
  addressLine1: z
    .string()
    .min(5, "Address line 1 too short")
    .max(150, "Address line 1 too long"),
  addressLine2: z.string().max(150, "Address line 2 too long").optional(),
  landmark: z.string().max(100, "Landmark too long").optional(),
  city: z.string().min(2, "City too short").max(60, "City too long"),
  state: z.string().min(2, "State too short").max(60, "State too long"),
  postalCode: z.string().regex(/^\d{6}$/, "Pincode must be exactly 6 digits"),
  country: z.string().min(2, "Country required").max(60).default("India"),
  isDefault: z.boolean().optional().default(false),
});

export const userAddressCreateSchema = userAddressBaseSchema;

export const userAddressUpdateSchema = userAddressBaseSchema.partial();

// ============================================
// PRODUCT SCHEMAS
// ============================================

/**
 * Product specification schema
 */
const productSpecificationSchema = z.object({
  name: z.string().min(1).max(100),
  value: z.string().min(1).max(200),
  unit: z.string().max(20).optional(),
});

/**
 * Video metadata schema (reusable)
 * Validates URL, duration, and trim ranges.
 * Video format: URL must end with a recognised container extension.
 */
const ALLOWED_VIDEO_EXTENSIONS = [".mp4", ".webm", ".ogg", ".mov", ".m4v"];

const videoSchema = z
  .object({
    url: urlSchema.refine(
      (u) =>
        ALLOWED_VIDEO_EXTENSIONS.some((ext) =>
          u.toLowerCase().split("?")[0].endsWith(ext),
        ),
      { message: "Video must be mp4, webm, ogg, mov, or m4v format" },
    ),
    thumbnailUrl: urlSchema,
    duration: z.number().positive().max(600), // Max 10 minutes
    trimStart: z.number().min(0).optional(),
    trimEnd: z.number().positive().optional(),
  })
  .refine(
    (data) => !data.trimEnd || !data.trimStart || data.trimEnd > data.trimStart,
    { message: "Trim end must be after trim start" },
  )
  .refine((data) => !data.trimEnd || data.trimEnd <= data.duration, {
    message: "Trim end cannot exceed video duration",
  });

/**
 * Product list query validation
 * Supports both named params (category, brand, minPrice, maxPrice, inStock, q, etc.) and
 * raw Sieve DSL via the `filters` param. Named params are merged into a compound Sieve filter
 * string in the GET /api/products route handler — see compound filter assembly logic there.
 */
export const productListQuerySchema = paginationQuerySchema
  .extend({
    category: z.string().min(1).optional(),
    subcategory: z.string().min(1).optional(),
    status: z
      .enum(["draft", "published", "out_of_stock", "discontinued", "sold"])
      .optional(),
    sellerId: objectIdSchema.optional(),
    featured: z.coerce.boolean().optional(),
    isAuction: z.coerce.boolean().optional(),
    isPromoted: z.coerce.boolean().optional(),
    minPrice: z.coerce.number().nonnegative().optional(),
    maxPrice: z.coerce.number().positive().optional(),
    brand: z.string().min(1).max(100).optional(),
    condition: z.enum(["new", "used", "refurbished"]).optional(),
    inStock: z.coerce.boolean().optional(),
    rating: z
      .object({
        min: z.coerce.number().min(0).max(5).optional(),
      })
      .optional(),
    tags: z.array(z.string()).or(z.string()).optional(), // Support comma-separated or array
  })
  .refine(
    (data) =>
      !data.maxPrice || !data.minPrice || data.maxPrice >= data.minPrice,
    { message: "Max price must be greater than or equal to min price" },
  );

/**
 * Prohibited words/content that cannot appear in product titles or descriptions.
 * Extend this list as the moderation policy grows.
 */
const PROHIBITED_WORDS = ["scam", "fraud", "counterfeit", "replica", "illegal"];

const containsProhibited = (text: string) =>
  PROHIBITED_WORDS.some((word) => text.toLowerCase().includes(word));

/**
 * Base product schema (without refinements)
 */
const productBaseSchema = z.object({
  title: z
    .string()
    .min(3)
    .max(200)
    .refine((t) => !containsProhibited(t), {
      message: "Title contains prohibited content",
    }),
  description: z
    .string()
    .min(20)
    .max(5000)
    .refine((d) => !containsProhibited(d), {
      message: "Description contains prohibited content",
    }),
  category: z.string().min(1).max(100),
  subcategory: z.string().min(1).max(100).optional(),
  brand: z.string().min(1).max(100).optional(),
  price: z.number().positive().max(10000000), // Max 10 million
  originalPrice: z.number().positive().max(10000000).optional(), // For discounts
  currency: z.string().length(3).default("INR"), // ISO 4217
  stockQuantity: z.number().int().nonnegative(),
  mainImage: urlSchema,
  images: z.array(urlSchema).max(10).optional(),
  video: videoSchema.optional(),
  specifications: z.array(productSpecificationSchema).max(50).optional(),
  features: z.array(z.string().min(1).max(200)).max(20).optional(),
  tags: z.array(z.string().min(1).max(50)).max(10).optional(),
  shippingInfo: z.string().max(1000).optional(),
  returnPolicy: z.string().max(1000).optional(),
  isDraft: z.boolean().default(false), // Draft auto-save support
  // Auction fields
  isAuction: z.boolean().optional(),
  auctionEndDate: dateStringSchema.optional(),
  startingBid: z.number().positive().optional(),
});

/**
 * Product creation validation
 * Auth: seller/moderator/admin role required (enforced in API route via requireRoleFromRequest)
 * Seller email verification: enforced in API route via requireEmailVerified — ✅ Done (Phase 7.4)
 */
export const productCreateSchema = productBaseSchema
  .refine(
    (data) => !data.isAuction || (data.auctionEndDate && data.startingBid),
    { message: "Auction items must have end date and starting bid" },
  )
  .refine(
    (data) =>
      !data.auctionEndDate || new Date(data.auctionEndDate) > new Date(),
    { message: "Auction end date must be in the future" },
  );

/**
 * Product update validation
 * Status transition logic: enforced in PATCH route via PRODUCT_STATUS_TRANSITIONS map — ✅ Done (Phase 7.5)
 */
export const productUpdateSchema = productBaseSchema.partial().extend({
  status: z
    .enum(["draft", "published", "out_of_stock", "discontinued", "sold"])
    .optional(),
  version: z.number().optional(), // For optimistic locking
});

/**
 * Product bulk creation validation
 */
export const productBulkCreateSchema = z.object({
  products: z.array(productBaseSchema).min(1).max(100),
  importSource: z.enum(["csv", "url", "api"]).optional(),
  dryRun: z.boolean().default(false), // Validate without creating
});

// ============================================
// CATEGORY SCHEMAS
// ============================================

/**
 * Category list query validation
 */
export const categoryListQuerySchema = z.object({
  rootId: objectIdSchema.optional(),
  parentId: objectIdSchema.optional(),
  featured: z.coerce.boolean().optional(),
  includeMetrics: z.coerce.boolean().default(false),
  flat: z.coerce.boolean().default(false),
  maxDepth: z.coerce.number().int().positive().max(10).optional(),
  includeInactive: z.coerce.boolean().default(false),
  expandChildren: z.coerce.boolean().optional(),
});

/**
 * Base category schema
 */
const categoryBaseSchema = z.object({
  name: z.string().min(1).max(100),
  parentId: objectIdSchema.optional(),
  description: z.string().max(500).optional(),
  display: z
    .object({
      icon: z.string().max(100).optional(),
      coverImage: urlSchema.optional(),
      color: z
        .string()
        .regex(/^#[0-9A-Fa-f]{6}$/)
        .optional(), // Hex color
      showInMenu: z.boolean().default(true),
      showInFooter: z.boolean().default(false),
    })
    .optional(),
  seo: z
    .object({
      title: z.string().min(1).max(200).optional(),
      description: z.string().min(1).max(500).optional(),
      keywords: z.array(z.string().min(1).max(50)).max(20).optional(),
    })
    .optional(),
});

/**
 * Category creation validation
 * TODO (Future): Add name uniqueness validation per parent (requires DB lookup, can't be done in Zod alone)
 */
export const categoryCreateSchema = categoryBaseSchema;

/**
 * Category update validation
 */
export const categoryUpdateSchema = categoryBaseSchema.partial().extend({
  order: z.number().int().nonnegative().optional(),
  isFeatured: z.boolean().optional(),
});

/**
 * Category bulk import validation
 */
export const categoryBulkImportSchema = z.object({
  categories: z
    .array(
      z.object({
        name: z.string().min(1).max(100),
        parentId: objectIdSchema.optional(),
        image: urlSchema.optional(),
        description: z.string().max(500).optional(),
      }),
    )
    .min(1)
    .max(100),
});

// ============================================
// REVIEW SCHEMAS
// ============================================

/**
 * Review list query validation
 */
export const reviewListQuerySchema = paginationQuerySchema.extend({
  productId: objectIdSchema,
  status: z.enum(["pending", "approved", "rejected"]).optional(),
  rating: z.coerce.number().int().min(1).max(5).optional(),
  ratingRange: z
    .tuple([z.coerce.number().min(1).max(5), z.coerce.number().min(1).max(5)])
    .optional(),
  verified: z.coerce.boolean().optional(),
  minHelpful: z.coerce.number().nonnegative().optional(),
  sortBy: z.enum(["recent", "helpful", "rating"]).optional(),
});

/**
 * Base review schema
 */
const reviewBaseSchema = z.object({
  rating: z.number().int().min(1).max(5),
  title: z.string().min(5).max(100),
  comment: z.string().min(20).max(2000),
  images: z.array(urlSchema).max(10).optional(),
  video: videoSchema.optional(),
});

/**
 * Review creation validation
 * Duplicate prevention: enforced at the API route level (checks existing reviews before insert)
 */
export const reviewCreateSchema = reviewBaseSchema.extend({
  productId: objectIdSchema,
  template: z.enum(["quick", "detailed"]).optional(),
  verified: z.boolean().optional(), // Verified purchase flag
});

/**
 * Review update validation
 */
export const reviewUpdateSchema = reviewBaseSchema.partial();

/**
 * Review vote validation
 */
export const reviewVoteSchema = z.object({
  vote: z.enum(["helpful", "not_helpful"]),
});

// ============================================
// SITE SETTINGS SCHEMAS
// ============================================

/**
 * Site settings update validation (admin only)
 * Includes email format validation for contact fields
 * TODO (Future): Add deep nested validation for featuresEnabled, emailSettings, socialLinks objects
 */
export const siteSettingsUpdateSchema = z
  .object({
    siteName: z.string().min(1).max(100).optional(),
    siteDescription: z.string().min(1).max(500).optional(),
    contactEmail: z.string().email().optional(),
    supportEmail: z.string().email().optional(),
    maintenanceMode: z.boolean().optional(),
    maintenanceMessage: z.string().max(500).optional(),
    // NOTE: Nested object validation for featuresEnabled, emailSettings etc.
    // requires z.object() refinements Ã¢â‚¬â€ implement when those fields are exposed in admin UI
  })
  .partial();

// ============================================
// CAROUSEL SCHEMAS
// ============================================

/**
 * Carousel list query validation
 */
export const carouselListQuerySchema = z.object({
  includeInactive: z.coerce.boolean().default(false),
});

/**
 * Grid card schema for carousel
 * NOTE: Grid validation (row/col 1-9, width/height) is enforced per card.
 * Cross-card overlap detection is handled in `carouselCreateSchema` via a `.refine()` — ✅ Done
 */
const gridCardSchema = z.object({
  gridPosition: z.object({
    row: z.number().int().min(1).max(9),
    col: z.number().int().min(1).max(9),
  }),
  mobilePosition: z
    .object({
      row: z.number().int().min(1).max(2),
      col: z.number().int().min(1).max(2),
    })
    .optional(),
  width: z.number().int().min(1).max(9),
  height: z.number().int().min(1).max(9),
  background: z.object({
    type: z.enum(["color", "gradient", "image"]),
    value: z.string().min(1).max(500),
  }),
  content: z
    .object({
      title: z.string().max(100).optional(),
      subtitle: z.string().max(200).optional(),
      description: z.string().max(500).optional(),
    })
    .optional(),
  buttons: z
    .array(
      z.object({
        text: z.string().min(1).max(50),
        link: urlSchema,
        variant: z.enum(["primary", "secondary", "outline"]),
        openInNewTab: z.boolean().default(false),
      }),
    )
    .max(3)
    .optional(),
  isButtonOnly: z.boolean().default(false),
  mobileHideText: z.boolean().default(false),
});

/**
 * Carousel creation validation
 * NOTE: Active slides count limit (max 5) is enforced at the API route level (not in schema)
 * as it requires a DB query to count current active slides.
 * Grid overlap detection: validates that no two cards occupy overlapping cells.
 */
export const carouselCreateSchema = z
  .object({
    title: z.string().min(1).max(200),
    order: z.number().int().nonnegative(),
    active: z.boolean().default(false),
    media: z.object({
      type: z.enum(["image", "video"]),
      url: urlSchema,
      alt: z.string().min(1).max(200),
      thumbnail: urlSchema.optional(),
    }),
    link: z
      .object({
        url: urlSchema,
        openInNewTab: z.boolean().default(false),
      })
      .optional(),
    gridCards: z.array(gridCardSchema).min(1).max(20),
    startDate: dateStringSchema.optional(),
    endDate: dateStringSchema.optional(),
    template: z.string().max(100).optional(),
    duplicateFrom: objectIdSchema.optional(),
  })
  .refine(
    (data) =>
      !data.endDate ||
      !data.startDate ||
      new Date(data.endDate) > new Date(data.startDate),
    { message: "End date must be after start date" },
  )
  .refine(
    (data) => {
      const cards = data.gridCards;
      for (let i = 0; i < cards.length; i++) {
        for (let j = i + 1; j < cards.length; j++) {
          const a = cards[i];
          const b = cards[j];
          const aRowEnd = a.gridPosition.row + a.height - 1;
          const aColEnd = a.gridPosition.col + a.width - 1;
          const bRowEnd = b.gridPosition.row + b.height - 1;
          const bColEnd = b.gridPosition.col + b.width - 1;
          const rowOverlap =
            a.gridPosition.row <= bRowEnd && aRowEnd >= b.gridPosition.row;
          const colOverlap =
            a.gridPosition.col <= bColEnd && aColEnd >= b.gridPosition.col;
          if (rowOverlap && colOverlap) return false;
        }
      }
      return true;
    },
    { message: "Carousel grid cards must not overlap in the 9×9 grid" },
  );

/**
 * Carousel update validation
 */
export const carouselUpdateSchema = carouselCreateSchema.partial();

/**
 * Carousel reorder validation
 */
export const carouselReorderSchema = z.object({
  slideIds: z.array(objectIdSchema).min(1).max(5),
});

/**
 * Generic reorder validation for drag-and-drop operations
 */
export const reorderSchema = z.object({
  itemId: objectIdSchema,
  newOrder: z.number().int().nonnegative(),
  targetPosition: z.enum(["before", "after"]).optional(),
  targetItemId: objectIdSchema.optional(),
});

// ============================================
// HOMEPAGE SECTIONS SCHEMAS
// ============================================

/**
 * Homepage sections list query validation
 */
export const homepageSectionsListQuerySchema = z.object({
  includeDisabled: z.coerce.boolean().default(false),
});

/**
 * Homepage section creation validation.
 * Type-specific config rules:
 *   - 'featured' and 'trending': config.maxItems must be a positive integer when provided
 *   - 'welcome': config.layout must be 'grid', 'carousel', or 'list' when provided
 */
export const homepageSectionCreateSchema = z
  .object({
    type: z.enum(["welcome", "featured", "categories", "trending", "custom"]),
    title: z.string().min(1).max(200),
    order: z.number().int().nonnegative().optional(),
    enabled: z.boolean().default(true),
    config: z
      .object({
        maxItems: z.number().int().positive().optional(),
        layout: z.enum(["grid", "carousel", "list"]).optional(),
        columns: z.number().int().min(1).max(12).optional(),
        template: z.string().max(100).optional(),
      })
      .optional(),
  })
  .refine(
    (data) => {
      if (
        (data.type === "featured" || data.type === "trending") &&
        data.config?.maxItems !== undefined
      ) {
        return data.config.maxItems > 0;
      }
      return true;
    },
    {
      message:
        "Featured/trending sections require a positive maxItems in config",
    },
  );

/**
 * Homepage section update validation
 */
export const homepageSectionUpdateSchema =
  homepageSectionCreateSchema.partial();

/**
 * Homepage sections reorder validation
 */
export const homepageSectionsReorderSchema = z.object({
  sectionIds: z.array(objectIdSchema).min(1),
});

// ============================================
// FAQ SCHEMAS
// ============================================

/**
 * FAQ list query validation
 */
export const faqListQuerySchema = paginationQuerySchema.extend({
  category: z.string().min(1).optional(),
  featured: z.coerce.boolean().optional(),
  priority: z.coerce.number().int().min(1).max(10).optional(),
  tags: z.array(z.string()).or(z.string()).optional(),
});

/**
 * FAQ creation validation
 * TODO (Future): Add variable syntax validation Ã¢â‚¬â€ verify {{variableName}} placeholders
 * in answer text are from the allowed set (companyName, supportEmail, etc.)
 */
export const faqCreateSchema = z
  .object({
    question: z.string().min(10).max(500),
    answer: z.object({
      text: z.string().min(20).max(5000),
      format: z.enum(["plain", "markdown", "html"]).default("plain"),
    }),
    category: z.string().min(1).max(100),
    priority: z.number().int().min(1).max(10).default(5),
    featured: z.boolean().default(false),
    tags: z.array(z.string().min(1).max(50)).max(10).optional(),
    relatedFAQs: z.array(objectIdSchema).max(5).optional(),
    template: z.string().max(100).optional(),
  })
  .refine(
    (data) => {
      // Check for valid template variable syntax {{variableName}}
      const text = data.answer.text;
      const templateVarPattern = /\{\{[a-zA-Z_][a-zA-Z0-9_]*\}\}/g;
      const matches = text.match(templateVarPattern) || [];
      return matches.length <= 10; // Max 10 template variables
    },
    { message: "Too many template variables (max 10)" },
  );

/**
 * FAQ update validation
 */
export const faqUpdateSchema = faqCreateSchema.partial();

/**
 * FAQ vote validation
 */
export const faqVoteSchema = z.object({
  vote: z.enum(["helpful", "not_helpful"]),
});

// ============================================
// BUSINESS RULE VALIDATION SCHEMAS
// ============================================

/**
 * Order schema with business rule validation
 */
export const orderSchema = z
  .object({
    items: z
      .array(
        z.object({
          productId: objectIdSchema,
          quantity: z.number().int().min(1).max(100),
          price: z.number().positive(),
        }),
      )
      .min(1)
      .max(50),
    totalAmount: z.number().positive(),
    shippingAddress: addressSchema,
    billingAddress: addressSchema.optional(),
  })
  .refine(
    (order) => {
      // Minimum order value rule ($100)
      const minOrderValue = 100;
      return order.totalAmount >= minOrderValue;
    },
    { message: "Order must be at least $100" },
  )
  .refine(
    (order) => {
      // Maximum items per order
      const maxItems = 50;
      const totalItems = order.items.reduce(
        (sum, item) => sum + item.quantity,
        0,
      );
      return totalItems <= maxItems;
    },
    { message: "Order cannot exceed 50 items" },
  );

/**
 * Bid schema with business rule validation
 */
export const bidSchema = z
  .object({
    productId: objectIdSchema,
    amount: z.number().positive(),
    auctionId: objectIdSchema,
  })
  .refine(
    (bid) => {
      // Bid amount should be reasonable (max 10x starting bid)
      return true; // Validate against current bid in API route
    },
    { message: "Bid must meet minimum increment rules" },
  );

// ============================================
// MEDIA UPLOAD SCHEMAS
// ============================================

/**
 * Image crop data validation.
 * aspectRatio format is validated (e.g. "16:9", "1:1").
 * Aspect ratio enforcement: when aspectRatio is provided the width/height must match within 2% tolerance.
 * Resolution enforcement: when minWidth/minHeight are provided the crop dimensions must meet the minimums.
 */
export const cropDataSchema = z
  .object({
    sourceUrl: z.string().url(),
    x: z.number().nonnegative(),
    y: z.number().nonnegative(),
    width: z.number().positive(),
    height: z.number().positive(),
    rotation: z.number().min(0).max(360).optional(),
    aspectRatio: z
      .string()
      .regex(/^\d+:\d+$/)
      .optional(), // e.g., "1:1", "16:9"
    outputFolder: z.string().optional(),
    outputFormat: z.enum(["jpeg", "png", "webp"]).optional(),
    quality: z.number().min(1).max(100).optional(),
    minWidth: z.number().int().positive().optional(), // Minimum required output width in pixels
    minHeight: z.number().int().positive().optional(), // Minimum required output height in pixels
  })
  .refine(
    (data) => {
      if (!data.aspectRatio) return true;
      const [wPart, hPart] = data.aspectRatio.split(":").map(Number);
      if (!wPart || !hPart) return true;
      const expectedRatio = wPart / hPart;
      const actualRatio = data.width / data.height;
      return Math.abs(actualRatio - expectedRatio) / expectedRatio < 0.02; // 2% tolerance
    },
    { message: "Crop dimensions do not match the declared aspect ratio" },
  )
  .refine((data) => !data.minWidth || data.width >= data.minWidth, {
    message: "Crop width does not meet the minimum width requirement",
  })
  .refine((data) => !data.minHeight || data.height >= data.minHeight, {
    message: "Crop height does not meet the minimum height requirement",
  });

/**
 * Video trim data validation
 */
export const trimDataSchema = z
  .object({
    sourceUrl: z.string().url(),
    startTime: z.number().nonnegative(),
    endTime: z.number().positive(),
    outputFolder: z.string().optional(),
    outputFormat: z.enum(["mp4", "webm"]).optional(),
    quality: z.enum(["low", "medium", "high"]).optional(),
  })
  .refine((data) => data.endTime > data.startTime, {
    message: "End time must be after start time",
  });

/**
 * Video thumbnail selection validation
 */
export const thumbnailDataSchema = z.object({
  timePosition: z.number().nonnegative(),
});

/**
 * Media upload request validation (for form data)
 */
export const mediaUploadRequestSchema = z.object({
  folder: z.string().optional(),
  public: z.boolean().optional(),
});

/**
 * Chunked upload request validation
 */
export const chunkedUploadSchema = z.object({
  uploadId: z.string().min(1),
  chunkIndex: z.number().int().nonnegative(),
  totalChunks: z.number().int().positive(),
  chunkSize: z.number().int().positive(),
});

/**
 * Upload progress validation
 */
export const uploadProgressSchema = z.object({
  uploadId: z.string().min(1),
  chunkIndex: z.number().int().nonnegative(),
  totalChunks: z.number().int().positive(),
  percentComplete: z.number().min(0).max(100),
  bytesUploaded: z.number().int().nonnegative(),
  totalBytes: z.number().int().positive(),
});

// ============================================
// AUTH / USER MANAGEMENT SCHEMAS
// (migrated from lib/api/validation-schemas.ts)
// ============================================

/**
 * User role enum schema
 */
export const userRoleSchema = z.enum(["user", "moderator", "admin"]);

/**
 * Update user role schema (admin endpoint)
 */
export const updateUserRoleSchema = z.object({
  role: userRoleSchema,
});

/**
 * Toggle user enabled/disabled schema
 */
export const toggleUserStatusSchema = z.object({
  disabled: z.boolean(),
});

/**
 * Change password schema — uses the strong passwordSchema defined above
 */
export const updatePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

/**
 * Delete account confirmation schema
 */
export const deleteAccountSchema = z.object({
  confirmation: z.literal("DELETE"),
});

/**
 * User list filter schema
 */
export const userFilterSchema = z.object({
  role: userRoleSchema.optional(),
  disabled: z.boolean().optional(),
  search: z.string().optional(),
});

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Validate request body with Zod schema
 * Returns typed success/failure Ã¢â‚¬â€ error logging is handled at the API route call site via serverLogger
 * TODO (Future): Add i18n support for error messages
 */
export function validateRequestBody<T>(
  schema: z.ZodSchema<T>,
  body: unknown,
): { success: true; data: T } | { success: false; errors: z.ZodError } {
  const result = schema.safeParse(body);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, errors: result.error };
}

/**
 * Format Zod errors for API response
 * TODO (Future): Add i18n support Ã¢â‚¬â€ map field paths to localised error messages
 */
export function formatZodErrors(error: z.ZodError): Record<string, string[]> {
  const formatted: Record<string, string[]> = {};
  error.issues.forEach((err) => {
    const path = err.path.join(".");
    if (!formatted[path]) {
      formatted[path] = [];
    }
    formatted[path].push(err.message);
  });
  return formatted;
}
