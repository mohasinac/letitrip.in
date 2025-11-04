// Validation utility functions
import { z } from "zod";

export const emailSchema = z.string().email("Invalid email address");

export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
    "Password must contain at least one uppercase letter, one lowercase letter, and one number",
  );

export const phoneSchema = z
  .string()
  .regex(/^[6-9]\d{9}$/, "Invalid Indian mobile number format")
  .length(10, "Mobile number must be exactly 10 digits");

export const pinCodeSchema = z
  .string()
  .regex(/^[1-9][0-9]{5}$/, "Invalid PIN code format")
  .length(6, "PIN code must be exactly 6 digits");

export const gstSchema = z
  .string()
  .regex(
    /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/,
    "Invalid GST number format",
  )
  .length(15, "GST number must be exactly 15 characters");

export const panSchema = z
  .string()
  .regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, "Invalid PAN number format")
  .length(10, "PAN number must be exactly 10 characters");

export const aadharSchema = z
  .string()
  .regex(/^[2-9]{1}[0-9]{3}[0-9]{4}[0-9]{4}$/, "Invalid Aadhar number format")
  .length(12, "Aadhar number must be exactly 12 digits");

export const urlSchema = z.string().url("Invalid URL format");

export const requiredStringSchema = (fieldName: string) =>
  z.string().min(1, `${fieldName} is required`);

export const optionalStringSchema = z.string().optional();

export const numberSchema = (min?: number, max?: number) => {
  let schema = z.number();
  if (min !== undefined) schema = schema.min(min, `Must be at least ${min}`);
  if (max !== undefined) schema = schema.max(max, `Must be at most ${max}`);
  return schema;
};

export const positiveNumberSchema = z
  .number()
  .positive("Must be a positive number");

export const priceSchema = z
  .number()
  .positive("Price must be positive")
  .multipleOf(0.01, "Price must have at most 2 decimal places");

export const validateEmail = (email: string): boolean => {
  return emailSchema.safeParse(email).success;
};

export const validatePassword = (password: string): boolean => {
  return passwordSchema.safeParse(password).success;
};

export const validatePhone = (phone: string): boolean => {
  return phoneSchema.safeParse(phone).success;
};

export const validatePinCode = (pinCode: string): boolean => {
  return pinCodeSchema.safeParse(pinCode).success;
};

export const validateGST = (gst: string): boolean => {
  return gstSchema.safeParse(gst).success;
};

export const validatePAN = (pan: string): boolean => {
  return panSchema.safeParse(pan).success;
};

export const validateAadhar = (aadhar: string): boolean => {
  return aadharSchema.safeParse(aadhar).success;
};

export const validateUrl = (url: string): boolean => {
  return urlSchema.safeParse(url).success;
};

export const validateRequired = (value: any, fieldName = "Field"): boolean => {
  if (typeof value === "string") {
    return value.trim().length > 0;
  }
  return value !== null && value !== undefined;
};

export const validateLength = (
  value: string,
  min: number,
  max?: number,
): boolean => {
  if (value.length < min) return false;
  if (max && value.length > max) return false;
  return true;
};

export const validateFileSize = (file: File, maxSizeInMB: number): boolean => {
  const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
  return file.size <= maxSizeInBytes;
};

export const validateFileType = (
  file: File,
  allowedTypes: string[],
): boolean => {
  return allowedTypes.includes(file.type);
};

export const validateImageFile = (file: File): boolean => {
  const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
  return validateFileType(file, allowedTypes);
};
