import { z } from "zod";

// Category validation schema
export const categorySchema = z.object({
  name: z
    .string()
    .min(2, "Category name must be at least 2 characters")
    .max(100, "Category name must be less than 100 characters"),
  slug: z
    .string()
    .min(2, "Slug must be at least 2 characters")
    .max(100, "Slug must be less than 100 characters")
    .regex(
      /^[a-z0-9-]+$/,
      "Slug can only contain lowercase letters, numbers, and hyphens"
    ),
  description: z
    .string()
    .max(500, "Description must be less than 500 characters")
    .optional(),
  parentIds: z.array(z.string()).optional(),
  icon: z
    .string()
    .max(50, "Icon name must be less than 50 characters")
    .optional(),
  image: z.string().url("Invalid image URL").optional(),
  banner: z.string().url("Invalid banner URL").optional(),
  isActive: z.boolean().default(true),
  featured: z.boolean().default(false),
  sortOrder: z
    .number()
    .int("Sort order must be a whole number")
    .min(0, "Sort order must be positive")
    .default(0),
  metaTitle: z
    .string()
    .max(60, "Meta title should be less than 60 characters")
    .optional(),
  metaDescription: z
    .string()
    .max(160, "Meta description should be less than 160 characters")
    .optional(),
});

export type CategoryFormData = z.infer<typeof categorySchema>;
