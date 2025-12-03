import { z } from "zod";
import {
  VALIDATION_RULES,
  VALIDATION_MESSAGES,
} from "@/constants/validation-messages";

// Shop validation schema
export const shopSchema = z.object({
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
  slug: z
    .string()
    .min(VALIDATION_RULES.SLUG.MIN_LENGTH, VALIDATION_MESSAGES.SLUG.TOO_SHORT)
    .max(VALIDATION_RULES.SLUG.MAX_LENGTH, VALIDATION_MESSAGES.SLUG.TOO_LONG)
    .regex(VALIDATION_RULES.SLUG.PATTERN, VALIDATION_MESSAGES.SLUG.INVALID),
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
  logo: z.string().url("Invalid logo URL").optional(),
  banner: z.string().url("Invalid banner URL").optional(),
  phone: z
    .string()
    .regex(VALIDATION_RULES.PHONE.PATTERN, VALIDATION_MESSAGES.PHONE.INVALID)
    .optional(),
  email: z.string().email("Invalid email address").optional(),
  address: z
    .object({
      line1: z
        .string()
        .min(
          VALIDATION_RULES.ADDRESS.LINE1.MIN_LENGTH,
          VALIDATION_MESSAGES.ADDRESS.LINE1_TOO_SHORT,
        ),
      line2: z.string().optional(),
      city: z
        .string()
        .min(
          VALIDATION_RULES.ADDRESS.CITY.MIN_LENGTH,
          VALIDATION_MESSAGES.ADDRESS.CITY_TOO_SHORT,
        ),
      state: z
        .string()
        .min(
          VALIDATION_RULES.ADDRESS.STATE.MIN_LENGTH,
          VALIDATION_MESSAGES.ADDRESS.STATE_TOO_SHORT,
        ),
      pincode: z
        .string()
        .regex(
          VALIDATION_RULES.ADDRESS.PINCODE.PATTERN,
          VALIDATION_MESSAGES.ADDRESS.PINCODE_INVALID,
        ),
      country: z.string().default(VALIDATION_RULES.ADDRESS.COUNTRY),
    })
    .optional(),
  policies: z
    .object({
      shipping: z.string().optional(),
      returns: z.string().optional(),
      privacy: z.string().optional(),
    })
    .optional(),
  isActive: z.boolean().default(true),
  isVerified: z.boolean().default(false),
});

export type ShopFormData = z.infer<typeof shopSchema>;
