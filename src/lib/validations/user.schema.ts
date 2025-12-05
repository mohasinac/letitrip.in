/**
 * @fileoverview TypeScript Module
 * @module src/lib/validations/user.schema
 * @description This file contains functionality related to user.schema
 * 
 * @created 2025-12-05
 * @author Development Team
 */

import { z } from "zod";
import {
  VALIDATION_RULES,
  VALIDATION_MESSAGES,
} from "@/constants/validation-messages";

// User profile validation schema
export const userProfileSchema = z.object({
  /** Full Name */
  fullName: z
    .string()
    .min(VALIDATION_RULES.NAME.MIN_LENGTH, VALIDATION_MESSAGES.NAME.TOO_SHORT)
    .max(VALIDATION_RULES.NAME.MAX_LENGTH, VALIDATION_MESSAGES.NAME.TOO_LONG),
  /** First Name */
  firstName: z
    .string()
    .min(1, VALIDATION_MESSAGES.REQUIRED.FIELD("First name"))
    .max(50, "First name must be less than 50 characters"),
  /** Last Name */
  lastName: z
    .string()
    .min(1, VALIDATION_MESSAGES.REQUIRED.FIELD("Last name"))
    .max(50, "Last name must be less than 50 characters"),
  /** Display Name */
  displayName: z
    .string()
    .min(2, "Display name must be at least 2 characters")
    .max(50, "Display name must be less than 50 characters")
    .optional(),
  /** Email */
  email: z
    .string()
    .email(VALIDATION_MESSAGES.EMAIL.INVALID)
    .max(VALIDATION_RULES.EMAIL.MAX_LENGTH, VALIDATION_MESSAGES.EMAIL.TOO_LONG),
  /** Phone */
  phone: z
    .string()
    .regex(VALIDATION_RULES.PHONE.PATTERN, VALIDATION_MESSAGES.PHONE.INVALID)
    .optional(),
  /** Bio */
  bio: z.string().max(500, "Bio must be less than 500 characters").optional(),
  /** Photo U R L */
  photoURL: z.string().url("Invalid photo URL").optional(),
});

// Password change validation
export const changePasswordSchema = z
  .object({
    /** Current Password */
    currentPassword: z
      .string()
      .min(1, VALIDATION_MESSAGES.REQUIRED.FIELD("Current password")),
    /** New Password */
    newPassword: z
      .string()
      .min(
        VALIDATION_RULES.PASSWORD.MIN_LENGTH,
        VALIDATION_MESSAGES.PASSWORD.TOO_SHORT,
      )
      .regex(/[A-Z]/, VALIDATION_MESSAGES.PASSWORD.REQUIRE_UPPERCASE)
      .regex(/[a-z]/, VALIDATION_MESSAGES.PASSWORD.REQUIRE_LOWERCASE)
      .regex(/[0-9]/, VALIDATION_MESSAGES.PASSWORD.REQUIRE_NUMBER)
      .regex(
        VALIDATION_RULES.PASSWORD.SPECIAL_CHARS,
        VALIDATION_MESSAGES.PASSWORD.REQUIRE_SPECIAL,
      ),
    /** Confirm Password */
    confirmPassword: z
      .string()
      .min(
        VALIDATION_RULES.PASSWORD.MIN_LENGTH,
        VALIDATION_MESSAGES.REQUIRED.FIELD("Confirm password"),
      ),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    /** Message */
    message: VALIDATION_MESSAGES.PASSWORD.MISMATCH,
    /** Path */
    path: ["confirmPassword"],
  })
  .refine((data) => data.newPassword !== data.currentPassword, {
    /** Message */
    message: "New password must be different from current password",
    /** Path */
    path: ["newPassword"],
  });

// Registration validation
export const registerSchema = z
  .object({
    /** Full Name */
    fullName: z
      .string()
      .min(VALIDATION_RULES.NAME.MIN_LENGTH, VALIDATION_MESSAGES.NAME.TOO_SHORT)
      .max(VALIDATION_RULES.NAME.MAX_LENGTH, VALIDATION_MESSAGES.NAME.TOO_LONG),
    /** Email */
    email: z
      .string()
      .email(VALIDATION_MESSAGES.EMAIL.INVALID)
      .max(
        VALIDATION_RULES.EMAIL.MAX_LENGTH,
        VALIDATION_MESSAGES.EMAIL.TOO_LONG,
      ),
    /** Password */
    password: z
      .string()
      .min(
        VALIDATION_RULES.PASSWORD.MIN_LENGTH,
        VALIDATION_MESSAGES.PASSWORD.TOO_SHORT,
      )
      .regex(/[A-Z]/, VALIDATION_MESSAGES.PASSWORD.REQUIRE_UPPERCASE)
      .regex(/[a-z]/, VALIDATION_MESSAGES.PASSWORD.REQUIRE_LOWERCASE)
      .regex(/[0-9]/, VALIDATION_MESSAGES.PASSWORD.REQUIRE_NUMBER)
      .regex(
        VALIDATION_RULES.PASSWORD.SPECIAL_CHARS,
        VALIDATION_MESSAGES.PASSWORD.REQUIRE_SPECIAL,
      ),
    /** Confirm Password */
    confirmPassword: z
      .string()
      .min(
        VALIDATION_RULES.PASSWORD.MIN_LENGTH,
        VALIDATION_MESSAGES.REQUIRED.FIELD("Confirm password"),
      ),
    /** Agree To Terms */
    agreeToTerms: z.boolean().refine((val) => val === true, {
      /** Message */
      message: "You must agree to the terms and conditions",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    /** Message */
    message: VALIDATION_MESSAGES.PASSWORD.MISMATCH,
    /** Path */
    path: ["confirmPassword"],
  });

// Login validation
export const loginSchema = z.object({
  /** Email */
  email: z.string().email(VALIDATION_MESSAGES.EMAIL.INVALID),
  /** Password */
  password: z.string().min(1, VALIDATION_MESSAGES.REQUIRED.FIELD("Password")),
  /** Remember Me */
  rememberMe: z.boolean().optional(),
});

// OTP verification
export const otpVerificationSchema = z.object({
  /** Otp */
  otp: z
    .string()
    .length(VALIDATION_RULES.OTP.LENGTH, VALIDATION_MESSAGES.OTP.INVALID)
    .regex(VALIDATION_RULES.OTP.PATTERN, VALIDATION_MESSAGES.OTP.INVALID),
});

/**
 * UserProfileFormData type
 * 
 * @typedef {Object} UserProfileFormData
 * @description Type definition for UserProfileFormData
 */
/**
 * UserProfileFormData type definition
 *
 * @typedef {z.infer<typeof userProfileSchema>} UserProfileFormData
 * @description Type definition for UserProfileFormData
 */
export type UserProfileFormData = z.infer<typeof userProfileSchema>;
/**
 * ChangePasswordFormData type
 * 
 * @typedef {Object} ChangePasswordFormData
 * @description Type definition for ChangePasswordFormData
 */
/**
 * ChangePasswordFormData type definition
 *
 * @typedef {z.infer<typeof changePasswordSchema>} ChangePasswordFormData
 * @description Type definition for ChangePasswordFormData
 */
export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;
/**
 * RegisterFormData type
 * 
 * @typedef {Object} RegisterFormData
 * @description Type definition for RegisterFormData
 */
/**
 * RegisterFormData type definition
 *
 * @typedef {z.infer<typeof registerSchema>} RegisterFormData
 * @description Type definition for RegisterFormData
 */
export type RegisterFormData = z.infer<typeof registerSchema>;
/**
 * LoginFormData type
 * 
 * @typedef {Object} LoginFormData
 * @description Type definition for LoginFormData
 */
/**
 * LoginFormData type definition
 *
 * @typedef {z.infer<typeof loginSchema>} LoginFormData
 * @description Type definition for LoginFormData
 */
export type LoginFormData = z.infer<typeof loginSchema>;
/**
 * OTPVerificationFormData type
 * 
 * @typedef {Object} OTPVerificationFormData
 * @description Type definition for OTPVerificationFormData
 */
/**
 * OTPVerificationFormData type definition
 *
 * @typedef {z.infer<typeof otpVerificationSchema>} OTPVerificationFormData
 * @description Type definition for OTPVerificationFormData
 */
export type OTPVerificationFormData = z.infer<typeof otpVerificationSchema>;
