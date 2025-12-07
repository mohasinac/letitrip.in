import { z } from "zod";
import {
  VALIDATION_RULES,
  VALIDATION_MESSAGES,
} from "@/constants/validation-messages";

// User profile validation schema
export const userProfileSchema = z.object({
  fullName: z
    .string()
    .min(VALIDATION_RULES.NAME.MIN_LENGTH, VALIDATION_MESSAGES.NAME.TOO_SHORT)
    .max(VALIDATION_RULES.NAME.MAX_LENGTH, VALIDATION_MESSAGES.NAME.TOO_LONG),
  firstName: z
    .string()
    .min(1, VALIDATION_MESSAGES.REQUIRED.FIELD("First name"))
    .max(50, "First name must be less than 50 characters"),
  lastName: z
    .string()
    .min(1, VALIDATION_MESSAGES.REQUIRED.FIELD("Last name"))
    .max(50, "Last name must be less than 50 characters"),
  displayName: z
    .string()
    .min(2, "Display name must be at least 2 characters")
    .max(50, "Display name must be less than 50 characters")
    .optional(),
  email: z
    .string()
    .email(VALIDATION_MESSAGES.EMAIL.INVALID)
    .max(VALIDATION_RULES.EMAIL.MAX_LENGTH, VALIDATION_MESSAGES.EMAIL.TOO_LONG),
  phone: z
    .string()
    .regex(VALIDATION_RULES.PHONE.PATTERN, VALIDATION_MESSAGES.PHONE.INVALID)
    .optional(),
  bio: z.string().max(500, "Bio must be less than 500 characters").optional(),
  photoURL: z.string().url("Invalid photo URL").optional(),
});

// Password change validation
export const changePasswordSchema = z
  .object({
    currentPassword: z
      .string()
      .min(1, VALIDATION_MESSAGES.REQUIRED.FIELD("Current password")),
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
    confirmPassword: z
      .string()
      .min(
        VALIDATION_RULES.PASSWORD.MIN_LENGTH,
        VALIDATION_MESSAGES.REQUIRED.FIELD("Confirm password"),
      ),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: VALIDATION_MESSAGES.PASSWORD.MISMATCH,
    path: ["confirmPassword"],
  })
  .refine((data) => data.newPassword !== data.currentPassword, {
    message: "New password must be different from current password",
    path: ["newPassword"],
  });

// Registration validation
export const registerSchema = z
  .object({
    fullName: z
      .string()
      .min(VALIDATION_RULES.NAME.MIN_LENGTH, VALIDATION_MESSAGES.NAME.TOO_SHORT)
      .max(VALIDATION_RULES.NAME.MAX_LENGTH, VALIDATION_MESSAGES.NAME.TOO_LONG),
    email: z
      .string()
      .email(VALIDATION_MESSAGES.EMAIL.INVALID)
      .max(
        VALIDATION_RULES.EMAIL.MAX_LENGTH,
        VALIDATION_MESSAGES.EMAIL.TOO_LONG,
      ),
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
    confirmPassword: z
      .string()
      .min(
        VALIDATION_RULES.PASSWORD.MIN_LENGTH,
        VALIDATION_MESSAGES.REQUIRED.FIELD("Confirm password"),
      ),
    agreeToTerms: z.boolean().refine((val) => val === true, {
      message: "You must agree to the terms and conditions",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: VALIDATION_MESSAGES.PASSWORD.MISMATCH,
    path: ["confirmPassword"],
  });

// Login validation
export const loginSchema = z.object({
  email: z.string().email(VALIDATION_MESSAGES.EMAIL.INVALID),
  password: z.string().min(1, VALIDATION_MESSAGES.REQUIRED.FIELD("Password")),
  rememberMe: z.boolean().optional(),
});

// OTP verification
export const otpVerificationSchema = z.object({
  otp: z
    .string()
    .length(VALIDATION_RULES.OTP.LENGTH, VALIDATION_MESSAGES.OTP.INVALID)
    .regex(VALIDATION_RULES.OTP.PATTERN, VALIDATION_MESSAGES.OTP.INVALID),
});

export type UserProfileFormData = z.infer<typeof userProfileSchema>;
export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type LoginFormData = z.infer<typeof loginSchema>;
export type OTPVerificationFormData = z.infer<typeof otpVerificationSchema>;
