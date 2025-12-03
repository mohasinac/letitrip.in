import { z } from "zod";
import {
  VALIDATION_RULES,
  VALIDATION_MESSAGES,
} from "@/constants/validation-messages";

// Product creation/edit validation schema
export const productSchema = z.object({
  // Step 1: Basic Info
  name: z
    .string()
    .min(
      VALIDATION_RULES.PRODUCT.NAME.MIN_LENGTH,
      VALIDATION_MESSAGES.PRODUCT.NAME_TOO_SHORT,
    )
    .max(
      VALIDATION_RULES.PRODUCT.NAME.MAX_LENGTH,
      VALIDATION_MESSAGES.PRODUCT.NAME_TOO_LONG,
    ),
  slug: z
    .string()
    .min(VALIDATION_RULES.SLUG.MIN_LENGTH, VALIDATION_MESSAGES.SLUG.TOO_SHORT)
    .max(VALIDATION_RULES.SLUG.MAX_LENGTH, VALIDATION_MESSAGES.SLUG.TOO_LONG)
    .regex(VALIDATION_RULES.SLUG.PATTERN, VALIDATION_MESSAGES.SLUG.INVALID),
  categoryId: z.string().min(1, VALIDATION_MESSAGES.PRODUCT.NO_CATEGORY),
  brand: z.string().min(1, VALIDATION_MESSAGES.REQUIRED.FIELD("Brand")),
  sku: z
    .string()
    .min(
      VALIDATION_RULES.PRODUCT.SKU.MIN_LENGTH,
      VALIDATION_MESSAGES.PRODUCT.SKU_TOO_SHORT,
    )
    .max(
      VALIDATION_RULES.PRODUCT.SKU.MAX_LENGTH,
      VALIDATION_MESSAGES.PRODUCT.SKU_TOO_LONG,
    )
    .optional(),

  // Step 2: Pricing & Stock
  price: z
    .number()
    .min(
      VALIDATION_RULES.PRODUCT.PRICE.MIN,
      VALIDATION_MESSAGES.PRODUCT.PRICE_TOO_LOW,
    )
    .max(
      VALIDATION_RULES.PRODUCT.PRICE.MAX,
      VALIDATION_MESSAGES.PRODUCT.PRICE_TOO_HIGH,
    ),
  compareAtPrice: z
    .number()
    .min(
      VALIDATION_RULES.PRODUCT.PRICE.MIN,
      VALIDATION_MESSAGES.PRODUCT.PRICE_TOO_LOW,
    )
    .optional(),
  stockCount: z
    .number()
    .int(VALIDATION_MESSAGES.NUMBER.NOT_INTEGER)
    .min(
      VALIDATION_RULES.PRODUCT.STOCK.MIN,
      VALIDATION_MESSAGES.PRODUCT.STOCK_NEGATIVE,
    ),
  lowStockThreshold: z
    .number()
    .int(VALIDATION_MESSAGES.NUMBER.NOT_INTEGER)
    .min(0, VALIDATION_MESSAGES.NUMBER.NOT_POSITIVE)
    .default(10),
  weight: z
    .number()
    .min(0, VALIDATION_MESSAGES.NUMBER.NOT_POSITIVE)
    .max(10000, "Weight is too high (max 10000kg)"),

  // Step 3: Product Details
  description: z
    .string()
    .min(
      VALIDATION_RULES.PRODUCT.DESCRIPTION.MIN_LENGTH,
      VALIDATION_MESSAGES.PRODUCT.DESC_TOO_SHORT,
    )
    .max(
      VALIDATION_RULES.PRODUCT.DESCRIPTION.MAX_LENGTH,
      VALIDATION_MESSAGES.PRODUCT.DESC_TOO_LONG,
    ),
  condition: z.enum(["new", "like-new", "good", "fair"], {
    message: "Please select a valid condition",
  }),
  features: z.array(z.string()).optional(),
  specifications: z.record(z.string(), z.string()).optional(),

  // Step 4: Media
  images: z
    .array(z.string().url("Invalid image URL"))
    .min(
      VALIDATION_RULES.PRODUCT.IMAGES.MIN,
      VALIDATION_MESSAGES.PRODUCT.NO_IMAGES,
    )
    .max(
      VALIDATION_RULES.PRODUCT.IMAGES.MAX,
      VALIDATION_MESSAGES.PRODUCT.TOO_MANY_IMAGES,
    ),
  videos: z
    .array(z.string().url("Invalid video URL"))
    .max(
      VALIDATION_RULES.PRODUCT.VIDEOS.MAX,
      VALIDATION_MESSAGES.PRODUCT.TOO_MANY_VIDEOS,
    )
    .optional(),

  // Step 5: Shipping & Policies
  shippingClass: z.enum(["standard", "express", "overnight", "free"], {
    message: "Please select a valid shipping class",
  }),
  returnPolicy: z.string().optional(),
  warrantyInfo: z.string().optional(),

  // Step 6: SEO & Publish
  metaTitle: z
    .string()
    .max(60, "Meta title should be less than 60 characters")
    .optional(),
  metaDescription: z
    .string()
    .max(160, "Meta description should be less than 160 characters")
    .optional(),
  featured: z.boolean().default(false),
  status: z.enum(["draft", "published", "archived"], {
    message: "Please select a valid status",
  }),

  // System fields
  shopId: z.string().min(1, VALIDATION_MESSAGES.PRODUCT.NO_SHOP),
});

// Type inference from schema
export type ProductFormData = z.infer<typeof productSchema>;

// Partial schema for updates
export const productUpdateSchema = productSchema.partial();

// Step-specific schemas for wizard validation
export const productStep1Schema = productSchema.pick({
  name: true,
  slug: true,
  categoryId: true,
  brand: true,
  sku: true,
});

export const productStep2Schema = productSchema.pick({
  price: true,
  compareAtPrice: true,
  stockCount: true,
  lowStockThreshold: true,
  weight: true,
});

export const productStep3Schema = productSchema.pick({
  description: true,
  condition: true,
  features: true,
  specifications: true,
});

export const productStep4Schema = productSchema.pick({
  images: true,
  videos: true,
});

export const productStep5Schema = productSchema.pick({
  shippingClass: true,
  returnPolicy: true,
  warrantyInfo: true,
});

export const productStep6Schema = productSchema.pick({
  metaTitle: true,
  metaDescription: true,
  featured: true,
  status: true,
});
