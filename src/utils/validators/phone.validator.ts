/**
 * Phone Number Validation Utilities
 *
 * Centralized phone number validation and formatting
 */

/**
 * Validate phone number format (international)
 */
export function isValidPhone(phone: string): boolean {
  // Matches international format: +1234567890 or +1 234 567 8900
  const phoneRegex = /^\+?[\d\s-()]+$/;
  const cleaned = phone.replace(/[\s-()]/g, "");

  return phoneRegex.test(phone) && cleaned.length >= 10 && cleaned.length <= 15;
}

/**
 * Normalize phone number (remove formatting)
 */
export function normalizePhone(phone: string): string {
  return phone.replace(/[\s-()]/g, "");
}

/**
 * Format phone number for display
 */
export function formatPhone(phone: string, countryCode: string = "US"): string {
  const cleaned = normalizePhone(phone);

  if (countryCode === "US" && cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }

  if (cleaned.startsWith("+")) {
    return cleaned;
  }

  return `+${cleaned}`;
}

/**
 * Extract country code from phone number
 */
export function extractCountryCode(phone: string): string | null {
  const cleaned = normalizePhone(phone);

  if (cleaned.startsWith("+1")) return "+1";
  if (cleaned.startsWith("+44")) return "+44";
  if (cleaned.startsWith("+91")) return "+91";

  const match = cleaned.match(/^\+(\d{1,3})/);
  return match ? `+${match[1]}` : null;
}
