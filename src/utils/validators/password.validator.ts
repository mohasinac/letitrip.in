/**
 * Password Validation Utilities
 *
 * Centralized password validation and strength checking
 */

export interface PasswordStrength {
  score: number; // 0-4
  level: "too-weak" | "weak" | "fair" | "good" | "strong";
  feedback: string[];
}

export interface PasswordRequirements {
  minLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumbers: boolean;
  requireSpecialChars: boolean;
}

const DEFAULT_REQUIREMENTS: PasswordRequirements = {
  minLength: 8,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: true,
};

/**
 * Checks if a password meets specified security requirements
 *
 * @param password - The password to validate
 * @param requirements - Optional custom requirements (uses defaults if not provided)
 * @returns An object with valid boolean and array of missing requirements
 *
 * @example
 * ```typescript
 * const result = meetsPasswordRequirements('Test123!');
 * console.log(result); // { valid: true, missing: [] }
 * const result2 = meetsPasswordRequirements('weak');
 * console.log(result2.missing); // ['At least 8 characters', 'One uppercase letter', ...]
 * ```
 */
export function meetsPasswordRequirements(
  password: string,
  requirements: PasswordRequirements = DEFAULT_REQUIREMENTS,
): { valid: boolean; missing: string[] } {
  const missing: string[] = [];

  if (password.length < requirements.minLength) {
    missing.push(`At least ${requirements.minLength} characters`);
  }

  if (requirements.requireUppercase && !/[A-Z]/.test(password)) {
    missing.push("One uppercase letter");
  }

  if (requirements.requireLowercase && !/[a-z]/.test(password)) {
    missing.push("One lowercase letter");
  }

  if (requirements.requireNumbers && !/\d/.test(password)) {
    missing.push("One number");
  }

  if (
    requirements.requireSpecialChars &&
    !/[!@#$%^&*(),.?":{}|<>]/.test(password)
  ) {
    missing.push("One special character");
  }

  return {
    valid: missing.length === 0,
    missing,
  };
}

/**
 * Calculates password strength and provides feedback
 *
 * @param password - The password to evaluate
 * @returns An object with score (0-4), level, and feedback array
 *
 * @example
 * ```typescript
 * const result = calculatePasswordStrength('MyP@ssw0rd!');
 * console.log(result.level); // 'strong'
 * console.log(result.score); // 4
 * const weakResult = calculatePasswordStrength('password');
 * console.log(weakResult.feedback); // ['Avoid common passwords']
 * ```
 */
export function calculatePasswordStrength(password: string): PasswordStrength {
  let score = 0;
  const feedback: string[] = [];

  // Length check
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (password.length < 8) {
    feedback.push("Password is too short");
  }

  // Character variety
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score++;

  // Common patterns (reduce score)
  if (/(.)\1{2,}/.test(password)) {
    score = Math.max(0, score - 1);
    feedback.push("Avoid repeated characters");
  }

  if (/^(?:password|123456|qwerty)/i.test(password)) {
    score = 0;
    feedback.push("Avoid common passwords");
  }

  // Normalize score to 0-4
  score = Math.min(4, Math.max(0, score));

  // Determine level
  let level: PasswordStrength["level"];
  if (score === 0) level = "too-weak";
  else if (score === 1) level = "weak";
  else if (score === 2) level = "fair";
  else if (score === 3) level = "good";
  else level = "strong";

  return { score, level, feedback };
}

/**
 * Checks if a password is in the list of commonly used passwords
 *
 * @param password - The password to check
 * @returns True if the password is a commonly used weak password
 *
 * @example
 * ```typescript
 * console.log(isCommonPassword('password')); // true
 * console.log(isCommonPassword('MyUnique!Pass123')); // false
 * ```
 */
export function isCommonPassword(password: string): boolean {
  const commonPasswords = [
    "password",
    "123456",
    "123456789",
    "qwerty",
    "abc123",
    "monkey",
    "1234567",
    "letmein",
    "trustno1",
    "dragon",
    "baseball",
    "iloveyou",
    "master",
    "sunshine",
    "ashley",
    "bailey",
    "passw0rd",
    "shadow",
    "123123",
    "654321",
  ];

  return commonPasswords.includes(password.toLowerCase());
}
