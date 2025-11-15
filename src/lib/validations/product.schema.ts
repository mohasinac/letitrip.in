import { z } from "zod";

// Product creation/edit validation schema
export const productSchema = z.object({
  // Step 1: Basic Info
  name: z
    .string()
    .min(3, "Product name must be at least 3 characters")
    .max(200, "Product name must be less than 200 characters"),
  slug: z
    .string()
    .min(3, "Slug must be at least 3 characters")
    .max(200, "Slug must be less than 200 characters")
    .regex(
      /^[a-z0-9-]+$/,
      "Slug can only contain lowercase letters, numbers, and hyphens"
    ),
  categoryId: z.string().min(1, "Please select a category"),
  brand: z.string().min(1, "Brand is required"),
  sku: z.string().optional(),

  // Step 2: Pricing & Stock
  price: z
    .number()
    .min(0, "Price must be positive")
    .max(10000000, "Price is too high"),
  compareAtPrice: z
    .number()
    .min(0, "Compare price must be positive")
    .optional(),
  stockCount: z
    .number()
    .int("Stock must be a whole number")
    .min(0, "Stock cannot be negative"),
  lowStockThreshold: z
    .number()
    .int("Low stock threshold must be a whole number")
    .min(0, "Threshold cannot be negative")
    .default(10),
  weight: z
    .number()
    .min(0, "Weight must be positive")
    .max(10000, "Weight is too high (max 10000kg)"),

  // Step 3: Product Details
  description: z
    .string()
    .min(10, "Description must be at least 10 characters")
    .max(5000, "Description must be less than 5000 characters"),
  condition: z.enum(["new", "like-new", "good", "fair"], {
    message: "Please select a valid condition",
  }),
  features: z.array(z.string()).optional(),
  specifications: z.record(z.string(), z.string()).optional(),

  // Step 4: Media
  images: z
    .array(z.string().url("Invalid image URL"))
    .min(1, "At least one product image is required")
    .max(10, "Maximum 10 images allowed"),
  videos: z
    .array(z.string().url("Invalid video URL"))
    .max(5, "Maximum 5 videos allowed")
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
  isFeatured: z.boolean().default(false),
  status: z.enum(["draft", "published", "archived"], {
    message: "Please select a valid status",
  }),

  // System fields
  shopId: z.string().min(1, "Shop ID is required"),
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
  isFeatured: true,
  status: true,
});
