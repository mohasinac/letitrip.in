/**
 * @fileoverview TypeScript Module
 * @module src/lib/validations/shop.schema
 * @description This file contains functionality related to shop.schema
 * 
 * @created 2025-12-05
 * @author Development Team
 */

import { z } from "zod";
import {
  VALIDATION_RULES,
  VALIDATION_MESSAGES,
} from "@/constants/validation-messages";

// Shop validation schema
export const shopSchema = z.object({
  /** Name */
  name: z
    .string()
    .min(
      VALIDATION_RULES.SHOP.NAME.MIN_LENGTH,
      VALIDATION_MESSAGES.SHOP.NAME_TOO_SHORT,
    )
    .max(
      VALIDATION_RULES.SHOP.NAME.MAX_LENGTH,
      VALIDATION_MESSAGES.SHOP.NAME_TOO_LONG,
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
    .min(
      VALIDATION_RULES.SHOP.DESCRIPTION.MIN_LENGTH,
      VALIDATION_MESSAGES.SHOP.DESC_TOO_SHORT,
    )
    .max(
      VALIDATION_RULES.SHOP.DESCRIPTION.MAX_LENGTH,
      VALIDATION_MESSAGES.SHOP.DESC_TOO_LONG,
    ),
  /** Logo */
  logo: z.string().url("Invalid logo URL").optional(),
  /** Banner */
  banner: z.string().url("Invalid banner URL").optional(),
  /** Phone */
  phone: z
    .string()
    .regex(VALIDATION_RULES.PHONE.PATTERN, VALIDATION_MESSAGES.PHONE.INVALID)
    .optional(),
  /** Email */
  email: z.string().email("Invalid email address").optional(),
  /** Address */
  address: z
    .object({
      /** Line1 */
      line1: z
        .string()
        .min(
          VALIDATION_RULES.ADDRESS.LINE1.MIN_LENGTH,
          VALIDATION_MESSAGES.ADDRESS.LINE1_TOO_SHORT,
        ),
      /** Line2 */
      line2: z.string().optional(),
      /** City */
      city: z
        .string()
        .min(
          VALIDATION_RULES.ADDRESS.CITY.MIN_LENGTH,
          VALIDATION_MESSAGES.ADDRESS.CITY_TOO_SHORT,
        ),
      /** State */
      state: z
        .string()
        .min(
          VALIDATION_RULES.ADDRESS.STATE.MIN_LENGTH,
          VALIDATION_MESSAGES.ADDRESS.STATE_TOO_SHORT,
        ),
      /** Pincode */
      pincode: z
        .string()
        .regex(
          VALIDATION_RULES.ADDRESS.PINCODE.PATTERN,
          VALIDATION_MESSAGES.ADDRESS.PINCODE_INVALID,
        ),
      /** Country */
      country: z.string().default(VALIDATION_RULES.ADDRESS.COUNTRY),
    })
    .optional(),
  /** Policies */
  policies: z
    .object({
      /** Shipping */
      shipping: z.string().optional(),
      /** Returns */
      returns: z.string().optional(),
      /** Privacy */
      privacy: z.string().optional(),
    })
    .optional(),
  /** Is Active */
  isActive: z.boolean().default(true),
  /** Is Verified */
  isVerified: z.boolean().default(false),
});

/**
 * ShopFormData type
 * 
 * @typedef {Object} ShopFormData
 * @description Type definition for ShopFormData
 */
/**
 * ShopFormData type definition
 *
 * @typedef {z.infer<typeof shopSchema>} ShopFormData
 * @description Type definition for ShopFormData
 */
export type ShopFormData = z.infer<typeof shopSchema>;
