/**
 * Reusable Validation Schemas
 *
 * Common Zod schemas used across API routes
 */

import { z } from "zod";

/**
 * Password validation schema with security requirements
 */
export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[0-9]/, "Password must contain at least one number");

/**
 * Email validation
 */
export const emailSchema = z
  .string()
  .email("Invalid email address")
  .toLowerCase();

/**
 * Update password schema
 */
export const updatePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: passwordSchema,
    confirmPassword: z.string().min(1, "Please confirm your new password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

/**
 * Delete account confirmation schema
 */
export const deleteAccountSchema = z.object({
  confirmation: z.literal("DELETE"),
});

/**
 * User role schema
 */
export const userRoleSchema = z.enum(["user", "moderator", "admin"]);

/**
 * Update user role schema
 */
export const updateUserRoleSchema = z.object({
  role: userRoleSchema,
});

/**
 * Toggle user status schema
 */
export const toggleUserStatusSchema = z.object({
  disabled: z.boolean(),
});

/**
 * Pagination schema
 */
export const paginationSchema = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
});

/**
 * User filter schema
 */
export const userFilterSchema = z.object({
  role: userRoleSchema.optional(),
  disabled: z.boolean().optional(),
  search: z.string().optional(),
});
