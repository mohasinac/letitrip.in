/**
 * @fileoverview TypeScript Module
 * @module src/lib/validations/category.schema
 * @description This file contains functionality related to category.schema
 * 
 * @created 2025-12-05
 * @author Development Team
 */

import { z } from "zod";
import {
  VALIDATION_RULES,
  VALIDATION_MESSAGES,
} from "@/constants/validation-messages";

// Category validation schema
export const categorySchema = z.object({
  /** Name */
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
  /** Slug */
  slug: z
    .string()
    .min(VALIDATION_RULES.SLUG.MIN_LENGTH, VALIDATION_MESSAGES.SLUG.TOO_SHORT)
    .max(VALIDATION_RULES.SLUG.MAX_LENGTH, VALIDATION_MESSAGES.SLUG.TOO_LONG)
    .regex(VALIDATION_RULES.SLUG.PATTERN, VALIDATION_MESSAGES.SLUG.INVALID),
  /** Description */
  description: z
    .string()
    .max(
      VALIDATION_RULES.CATEGORY.DESCRIPTION.MAX_LENGTH,
      VALIDATION_MESSAGES.CATEGORY.DESC_TOO_LONG,
    )
    .optional(),
  /** Parent Ids */
  parentIds: z.array(z.string()).optional(),
  /** Icon */
  icon: z
    .string()
    .max(50, "Icon name must be less than 50 characters")
    .optional(),
  /** Image */
  image: z.string().url("Invalid image URL").optional(),
  /** Banner */
  banner: z.string().url("Invalid banner URL").optional(),
  /** Is Active */
  isActive: z.boolean().default(true),
  /** Featured */
  featured: z.boolean().default(false),
  /** Sort Order */
  sortOrder: z
    .number()
    .int(VALIDATION_MESSAGES.NUMBER.NOT_INTEGER)
    .min(0, VALIDATION_MESSAGES.NUMBER.NOT_POSITIVE)
    .default(0),
  /** Meta Title */
  metaTitle: z
    .string()
    .max(60, "Meta title should be less than 60 characters")
    .optional(),
  /** Meta Description */
  metaDescription: z
    .string()
    .max(160, "Meta description should be less than 160 characters")
    .optional(),
});

/**
 * CategoryFormData type
 * 
 * @typedef {Object} CategoryFormData
 * @description Type definition for CategoryFormData
 */
/**
 * CategoryFormData type definition
 *
 * @typedef {z.infer<typeof categorySchema>} CategoryFormData
 * @description Type definition for CategoryFormData
 */
export type CategoryFormData = z.infer<typeof categorySchema>;
