/**
 * Validation Utilities
 *
 * Centralized validation functions for common data types
 * Use these instead of inline validation logic
 */

/**
 * Validate email format
 * @param email - Email address to validate
 * @returns true if valid email format
 */
export function validateEmail(email: string): boolean {
  if (!email) return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate Indian phone number
 * Must be 10 digits starting with 6-9
 * @param phone - Phone number to validate (digits only)
 * @returns true if valid Indian phone number
 */
export function validatePhone(phone: string): boolean {
  if (!phone) return false;
  const cleaned = phone.replace(/\D/g, "");
  const phoneRegex = /^[6-9]\d{9}$/;
  return phoneRegex.test(cleaned);
}

/**
 * Validate URL format
 * @param url - URL to validate
 * @returns true if valid URL format
 */
export function validateUrl(url: string): boolean {
  if (!url) return false;
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Validate Indian pincode
 * Must be 6 digits starting with non-zero
 * @param pincode - Pincode to validate
 * @returns true if valid Indian pincode
 */
export function validatePincode(pincode: string): boolean {
  if (!pincode) return false;
  const cleaned = pincode.replace(/\D/g, "");
  return cleaned.length === 6 && /^[1-9]/.test(cleaned);
}

/**
 * Validate password strength
 * Must be at least 8 characters with uppercase, lowercase, number, and special char
 * @param password - Password to validate
 * @returns Object with validation result and error messages
 */
export function validatePassword(password: string): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push("Password must be at least 8 characters long");
  }

  if (!/[A-Z]/.test(password)) {
    errors.push("Password must contain at least one uppercase letter");
  }

  if (!/[a-z]/.test(password)) {
    errors.push("Password must contain at least one lowercase letter");
  }

  if (!/[0-9]/.test(password)) {
    errors.push("Password must contain at least one number");
  }

  if (!/[^A-Za-z0-9]/.test(password)) {
    errors.push("Password must contain at least one special character");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validate SKU format
 * Must be at least 3 characters, alphanumeric with hyphens/underscores
 * @param sku - SKU to validate
 * @returns true if valid SKU format
 */
export function validateSKU(sku: string): boolean {
  if (!sku || sku.length < 3) return false;
  return /^[A-Z0-9-_]+$/i.test(sku);
}

/**
 * Validate slug format
 * Must be lowercase alphanumeric with hyphens, no leading/trailing hyphens
 * @param slug - Slug to validate
 * @returns true if valid slug format
 */
export function validateSlug(slug: string): boolean {
  if (!slug) return false;
  if (!/^[a-z0-9-]+$/.test(slug)) return false;
  if (slug.startsWith("-") || slug.endsWith("-")) return false;
  return true;
}

/**
 * Validate Indian GST number
 * Format: 22 characters (2 state code + 10 PAN + 1 entity + 1 Z + 1 checksum)
 * @param gst - GST number to validate
 * @returns true if valid GST format
 */
export function validateGST(gst: string): boolean {
  if (!gst) return false;
  const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
  return gstRegex.test(gst.toUpperCase());
}

/**
 * Validate Indian PAN number
 * Format: 10 characters (5 letters + 4 digits + 1 letter)
 * @param pan - PAN number to validate
 * @returns true if valid PAN format
 */
export function validatePAN(pan: string): boolean {
  if (!pan) return false;
  const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
  return panRegex.test(pan.toUpperCase());
}
