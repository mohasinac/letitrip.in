import { z } from "zod";
import {
  VALIDATION_RULES,
  VALIDATION_MESSAGES,
} from "@/constants/validation-messages";

// Address validation schema
export const addressSchema = z.object({
  fullName: z
    .string()
    .min(VALIDATION_RULES.NAME.MIN_LENGTH, VALIDATION_MESSAGES.NAME.TOO_SHORT)
    .max(VALIDATION_RULES.NAME.MAX_LENGTH, VALIDATION_MESSAGES.NAME.TOO_LONG),
  phone: z
    .string()
    .regex(VALIDATION_RULES.PHONE.PATTERN, VALIDATION_MESSAGES.PHONE.INVALID),
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
  line2: z
    .string()
    .max(
      VALIDATION_RULES.ADDRESS.LINE2.MAX_LENGTH,
      VALIDATION_MESSAGES.ADDRESS.LINE2_TOO_LONG,
    )
    .optional(),
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
  pincode: z
    .string()
    .regex(
      VALIDATION_RULES.ADDRESS.PINCODE.PATTERN,
      VALIDATION_MESSAGES.ADDRESS.PINCODE_INVALID,
    ),
  country: z.string().min(2, "Country is required").default("India"),
  type: z.enum(["home", "work", "other"], {
    message: VALIDATION_MESSAGES.ADDRESS.TYPE_INVALID,
  }),
  isDefault: z.boolean().default(false),
  landmark: z
    .string()
    .max(
      VALIDATION_RULES.ADDRESS.LANDMARK.MAX_LENGTH,
      VALIDATION_MESSAGES.ADDRESS.LANDMARK_TOO_LONG,
    )
    .optional(),
});

export type AddressFormData = z.infer<typeof addressSchema>;
