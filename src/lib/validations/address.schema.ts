/**
 * @fileoverview TypeScript Module
 * @module src/lib/validations/address.schema
 * @description This file contains functionality related to address.schema
 * 
 * @created 2025-12-05
 * @author Development Team
 */

import { z } from "zod";
import {
  VALIDATION_RULES,
  VALIDATION_MESSAGES,
} from "@/constants/validation-messages";

// Address validation schema
export const addressSchema = z.object({
  /** Full Name */
  fullName: z
    .string()
    .min(VALIDATION_RULES.NAME.MIN_LENGTH, VALIDATION_MESSAGES.NAME.TOO_SHORT)
    .max(VALIDATION_RULES.NAME.MAX_LENGTH, VALIDATION_MESSAGES.NAME.TOO_LONG),
  /** Phone */
  phone: z
    .string()
    .regex(VALIDATION_RULES.PHONE.PATTERN, VALIDATION_MESSAGES.PHONE.INVALID),
  /** Line1 */
  line1: z
    .string()
    .min(
      VALIDATION_RULES.ADDRESS.LINE1.MIN_LENGTH,
      VALIDATION_MESSAGES.ADDRESS.LINE1_TOO_SHORT,
    )
    .max(
      VALIDATION_RULES.ADDRESS.LINE1.MAX_LENGTH,
      VALIDATION_MESSAGES.ADDRESS.LINE1_TOO_LONG,
    ),
  /** Line2 */
  line2: z
    .string()
    .max(
      VALIDATION_RULES.ADDRESS.LINE2.MAX_LENGTH,
      VALIDATION_MESSAGES.ADDRESS.LINE2_TOO_LONG,
    )
    .optional(),
  /** City */
  city: z
    .string()
    .min(
      VALIDATION_RULES.ADDRESS.CITY.MIN_LENGTH,
      VALIDATION_MESSAGES.ADDRESS.CITY_TOO_SHORT,
    )
    .max(
      VALIDATION_RULES.ADDRESS.CITY.MAX_LENGTH,
      VALIDATION_MESSAGES.ADDRESS.CITY_TOO_LONG,
    ),
  /** State */
  state: z
    .string()
    .min(
      VALIDATION_RULES.ADDRESS.STATE.MIN_LENGTH,
      VALIDATION_MESSAGES.ADDRESS.STATE_TOO_SHORT,
    )
    .max(
      VALIDATION_RULES.ADDRESS.STATE.MAX_LENGTH,
      VALIDATION_MESSAGES.ADDRESS.STATE_TOO_LONG,
    ),
  /** Pincode */
  pincode: z
    .string()
    .regex(
      VALIDATION_RULES.ADDRESS.PINCODE.PATTERN,
      VALIDATION_MESSAGES.ADDRESS.PINCODE_INVALID,
    ),
  /** Country */
  country: z.string().min(2, "Country is required").default("India"),
  /** Type */
  type: z.enum(["home", "work", "other"], {
    /** Message */
    message: VALIDATION_MESSAGES.ADDRESS.TYPE_INVALID,
  }),
  /** Is Default */
  isDefault: z.boolean().default(false),
  /** Landmark */
  landmark: z
    .string()
    .max(
      VALIDATION_RULES.ADDRESS.LANDMARK.MAX_LENGTH,
      VALIDATION_MESSAGES.ADDRESS.LANDMARK_TOO_LONG,
    )
    .optional(),
});

/**
 * AddressFormData type
 * 
 * @typedef {Object} AddressFormData
 * @description Type definition for AddressFormData
 */
/**
 * AddressFormData type definition
 *
 * @typedef {z.infer<typeof addressSchema>} AddressFormData
 * @description Type definition for AddressFormData
 */
export type AddressFormData = z.infer<typeof addressSchema>;
