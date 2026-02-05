/**
 * Validation Schemas
 *
 * Centralized validation using Zod
 */

import { z } from "zod";
import { NextRequest } from "next/server";
import {
  ERROR_MESSAGES,
  PASSWORD_CONFIG,
  VALIDATION_CONFIG,
} from "@/constants";

/**
 * Password validation rules
 */
export const passwordSchema = z
  .string()
  .min(PASSWORD_CONFIG.MIN_LENGTH, ERROR_MESSAGES.VALIDATION.PASSWORD_TOO_SHORT)
  .regex(/[a-z]/, ERROR_MESSAGES.VALIDATION.PASSWORD_NO_LOWERCASE)
  .regex(/[A-Z]/, ERROR_MESSAGES.VALIDATION.PASSWORD_NO_UPPERCASE)
  .regex(/[0-9]/, ERROR_MESSAGES.VALIDATION.PASSWORD_NO_NUMBER);

/**
 * Email validation
 */
export const emailSchema = z.string().email("Invalid email address");

/**
 * Profile update schema
 */
export const updateProfileSchema = z.object({
  displayName: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name must be less than 50 characters")
    .optional(),
  photoURL: z.string().url("Invalid photo URL").optional(),
});

/**
 * Change password schema
 */
export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: passwordSchema,
});

/**
 * Request password reset schema
 */
export const requestResetSchema = z.object({
  email: emailSchema,
});

/**
 * Complete password reset schema
 */
export const resetPasswordSchema = z.object({
  token: z.string().min(1, "Token is required"),
  newPassword: passwordSchema,
});

/**
 * Verify email schema
 */
export const verifyEmailSchema = z.object({
  token: z.string().min(1, "Token is required"),
});

/**
 * Helper to validate request body
 */
export async function validateRequest<T>(
  request: Request,
  schema: z.ZodSchema<T>,
): Promise<
  { success: true; data: T } | { success: false; error: string; details: any }
> {
  try {
    const body = await request.json();
    const result = schema.safeParse(body);

    if (!result.success) {
      return {
        success: false,
        error: "Validation failed",
        details: result.error.issues,
      };
    }

    return { success: true, data: result.data };
  } catch (error) {
    return {
      success: false,
      error: "Invalid request body",
      details: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
