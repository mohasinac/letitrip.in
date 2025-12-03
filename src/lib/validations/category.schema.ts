import { z } from "zod";
import {
  VALIDATION_RULES,
  VALIDATION_MESSAGES,
} from "@/constants/validation-messages";

// Category validation schema
export const categorySchema = z.object({
  name: z
    .string()
    .min(
      VALIDATION_RULES.CATEGORY.NAME.MIN_LENGTH,
      VALIDATION_MESSAGES.CATEGORY.NAME_TOO_SHORT,
    )
    .max(
      VALIDATION_RULES.CATEGORY.NAME.MAX_LENGTH,
      VALIDATION_MESSAGES.CATEGORY.NAME_TOO_LONG,
    ),
  slug: z
    .string()
    .min(VALIDATION_RULES.SLUG.MIN_LENGTH, VALIDATION_MESSAGES.SLUG.TOO_SHORT)
    .max(VALIDATION_RULES.SLUG.MAX_LENGTH, VALIDATION_MESSAGES.SLUG.TOO_LONG)
    .regex(VALIDATION_RULES.SLUG.PATTERN, VALIDATION_MESSAGES.SLUG.INVALID),
  description: z
    .string()
    .max(
      VALIDATION_RULES.CATEGORY.DESCRIPTION.MAX_LENGTH,
      VALIDATION_MESSAGES.CATEGORY.DESC_TOO_LONG,
    )
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
    .int(VALIDATION_MESSAGES.NUMBER.NOT_INTEGER)
    .min(0, VALIDATION_MESSAGES.NUMBER.NOT_POSITIVE)
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
