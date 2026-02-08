/**
 * Zod Validation Schemas for API Requests
 *
 * Centralized request validation using Zod
 *
 * TODO - Phase 2 Refactoring:
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
 * TODO: Add max limit enforcement per user role
 */
export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  sortBy: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
  search: z.string().min(1).max(100).optional(),
});

/**
 * MongoDB ObjectId validation
 * TODO: Support both MongoDB IDs and SEO-friendly slugs
 */
export const objectIdSchema = z.string().regex(/^[a-z0-9-]+$/);

/**
 * URL validation
 * TODO: Add domain whitelist for security
 */
export const urlSchema = z.string().url().max(2048);

/**
 * Date string validation (ISO 8601)
 */
export const dateStringSchema = z.string().datetime();

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
 * TODO: Add video format validation
 * TODO: Add resolution validation
 */
const videoSchema = z
  .object({
    url: urlSchema,
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
 * TODO: Add compound filters support
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
    tags: z.array(z.string()).or(z.string()).optional(), // Support comma-separated or array
  })
  .refine(
    (data) =>
      !data.maxPrice || !data.minPrice || data.maxPrice >= data.minPrice,
    { message: "Max price must be greater than or equal to min price" },
  );

/**
 * Base product schema (without refinements)
 */
const productBaseSchema = z.object({
  title: z.string().min(3).max(200),
  description: z.string().min(20).max(5000),
  category: z.string().min(1).max(100),
  subcategory: z.string().min(1).max(100).optional(),
  brand: z.string().min(1).max(100).optional(),
  price: z.number().positive().max(10000000), // Max 10 million
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
  // Auction fields
  isAuction: z.boolean().optional(),
  auctionEndDate: dateStringSchema.optional(),
  startingBid: z.number().positive().optional(),
});

/**
 * Product creation validation
 * TODO: Add seller verification requirement
 * TODO: Add prohibited words filter
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
 * TODO: Add status transition validation
 */
export const productUpdateSchema = productBaseSchema.partial().extend({
  status: z
    .enum(["draft", "published", "out_of_stock", "discontinued", "sold"])
    .optional(),
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
 * TODO: Add name uniqueness validation per parent
 */
export const categoryCreateSchema = categoryBaseSchema;

/**
 * Category update validation
 */
export const categoryUpdateSchema = categoryBaseSchema.partial().extend({
  order: z.number().int().nonnegative().optional(),
  isFeatured: z.boolean().optional(),
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
  verified: z.coerce.boolean().optional(),
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
 * TODO: Add duplicate review prevention
 */
export const reviewCreateSchema = reviewBaseSchema.extend({
  productId: objectIdSchema,
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
 * TODO: Add nested object validation
 * TODO: Add email format validation
 */
export const siteSettingsUpdateSchema = z
  .object({
    siteName: z.string().min(1).max(100).optional(),
    siteDescription: z.string().min(1).max(500).optional(),
    contactEmail: z.string().email().optional(),
    supportEmail: z.string().email().optional(),
    maintenanceMode: z.boolean().optional(),
    maintenanceMessage: z.string().max(500).optional(),
    // TODO: Add validation for nested objects (featuresEnabled, emailSettings, etc.)
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
 * TODO: Add grid position conflict detection
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
 * TODO: Add active slides count validation (max 5)
 */
export const carouselCreateSchema = z.object({
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
});

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
 * Homepage section creation validation
 * TODO: Add type-specific config validation
 */
export const homepageSectionCreateSchema = z.object({
  type: z.string().min(1).max(50),
  title: z.string().min(1).max(200),
  order: z.number().int().nonnegative(),
  enabled: z.boolean().default(true),
  config: z.record(z.string(), z.unknown()), // Type-specific config
});

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
 * TODO: Add variable syntax validation in answer text
 */
export const faqCreateSchema = z.object({
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
});

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
// MEDIA UPLOAD SCHEMAS
// ============================================

/**
 * Image crop data validation
 * TODO: Add aspect ratio enforcement
 */
export const cropDataSchema = z.object({
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

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Validate request body with Zod schema
 * TODO: Add error transformation for better messages
 * TODO: Add logging for validation failures
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
 * TODO: Add i18n support
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
