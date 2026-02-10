/**
 * FAQ Variables Helper
 *
 * Utilities for interpolating variables in FAQ answers from siteSettings
 */

import { siteSettingsRepository } from "@/repositories";
import { serverLogger } from "@/lib/server-logger";

/**
 * Extract variable placeholders from text
 * Matches {{variableName}} patterns
 *
 * @param text - Text containing variable placeholders
 * @returns Array of variable names
 *
 * @example
 * extractVariables("Ships in {{shippingDays}} days")
 * // Returns: ["shippingDays"]
 */
export function extractVariables(text: string): string[] {
  const regex = /\{\{(\w+)\}\}/g;
  const matches = text.matchAll(regex);
  return Array.from(matches, (m) => m[1]);
}

/**
 * Interpolate variables in text
 * Replaces {{variableName}} with actual values
 *
 * @param text - Text containing variable placeholders
 * @param variables - Variable key-value pairs
 * @returns Text with variables replaced
 *
 * @example
 * interpolateVariables(
 *   "Ships in {{shippingDays}} days",
 *   { shippingDays: "2-3" }
 * )
 * // Returns: "Ships in 2-3 days"
 */
export function interpolateVariables(
  text: string,
  variables: Record<string, string | number>,
): string {
  let result = text;
  const placeholders = extractVariables(text);

  for (const varName of placeholders) {
    const value = variables[varName];
    if (value !== undefined) {
      const regex = new RegExp(`\\{\\{${varName}\\}\\}`, "g");
      result = result.replace(regex, String(value));
    }
  }

  return result;
}

/**
 * Validate that all variables in text exist in site settings
 *
 * @param text - Text containing variable placeholders
 * @param siteSettings - Site settings variables
 * @returns Object with validation result
 *
 * @example
 * validateVariables("Ships in {{shippingDays}} days", siteSettings)
 * // Returns: { valid: true, missing: [] }
 */
export function validateVariables(
  text: string,
  siteSettings: Record<string, string | number>,
): {
  valid: boolean;
  missing: string[];
} {
  const placeholders = extractVariables(text);
  const missing = placeholders.filter((varName) => !(varName in siteSettings));

  return {
    valid: missing.length === 0,
    missing,
  };
}

/**
 * Get all available variables from site settings
 *
 * @returns Promise<Record<string, string | number>>
 */
export async function getAvailableVariables(): Promise<
  Record<string, string | number>
> {
  try {
    return await siteSettingsRepository.getFAQVariables();
  } catch (error) {
    serverLogger.error("Failed to get FAQ variables", { error });
    return {};
  }
}

/**
 * Interpolate FAQ answer with site settings variables
 * Fetches variables from site settings and applies them
 *
 * @param text - FAQ answer text with placeholders
 * @param customVariables - Optional custom variable overrides
 * @returns Promise<string> - Text with variables interpolated
 *
 * @example
 * await interpolateFAQAnswer("Ships in {{shippingDays}} days")
 * // Returns: "Ships in 2-3 days" (from siteSettings)
 */
export async function interpolateFAQAnswer(
  text: string,
  customVariables?: Record<string, string | number>,
): Promise<string> {
  try {
    // Get site settings variables
    const siteVariables = await getAvailableVariables();

    // Merge with custom variables (custom overrides site)
    const allVariables = {
      ...siteVariables,
      ...(customVariables || {}),
    };

    // Interpolate
    return interpolateVariables(text, allVariables);
  } catch (error) {
    serverLogger.error("Failed to interpolate FAQ answer", { error });
    return text; // Return original text on error
  }
}

/**
 * Batch interpolate multiple FAQ answers
 *
 * @param answers - Array of FAQ answer texts
 * @param customVariables - Optional custom variable overrides
 * @returns Promise<string[]> - Array of interpolated texts
 */
export async function batchInterpolateFAQAnswers(
  answers: string[],
  customVariables?: Record<string, string | number>,
): Promise<string[]> {
  try {
    // Get site settings variables once
    const siteVariables = await getAvailableVariables();

    // Merge with custom variables
    const allVariables = {
      ...siteVariables,
      ...(customVariables || {}),
    };

    // Interpolate all answers
    return answers.map((text) => interpolateVariables(text, allVariables));
  } catch (error) {
    serverLogger.error("Failed to batch interpolate FAQ answers", { error });
    return answers; // Return original texts on error
  }
}

/**
 * Validate FAQ answer before saving
 * Checks if all variables exist in site settings
 *
 * @param text - FAQ answer text to validate
 * @returns Promise<{valid: boolean, missing: string[], message?: string}>
 */
export async function validateFAQAnswer(text: string): Promise<{
  valid: boolean;
  missing: string[];
  message?: string;
}> {
  try {
    const siteVariables = await getAvailableVariables();
    const validation = validateVariables(text, siteVariables);

    return {
      ...validation,
      message: validation.valid
        ? "All variables are valid"
        : `Missing variables: ${validation.missing.join(", ")}`,
    };
  } catch (error) {
    return {
      valid: false,
      missing: [],
      message: "Failed to validate variables",
    };
  }
}

/**
 * Get variable usage statistics across all FAQs
 * Useful for understanding which variables are most used
 *
 * @param faqAnswers - Array of FAQ answer texts
 * @returns Record<string, number> - Variable name → usage count
 *
 * @example
 * getVariableUsageStats([
 *   "Ships in {{shippingDays}} days",
 *   "Minimum order: {{minOrderValue}}",
 *   "Support: {{supportEmail}}"
 * ])
 * // Returns: { shippingDays: 1, minOrderValue: 1, supportEmail: 1 }
 */
export function getVariableUsageStats(
  faqAnswers: string[],
): Record<string, number> {
  const usage: Record<string, number> = {};

  for (const text of faqAnswers) {
    const variables = extractVariables(text);
    for (const varName of variables) {
      usage[varName] = (usage[varName] || 0) + 1;
    }
  }

  return usage;
}

/**
 * Find FAQs with missing variables
 * Returns FAQ indices that reference undefined variables
 *
 * @param faqAnswers - Array of FAQ answer texts
 * @param siteVariables - Site settings variables
 * @returns Array of { index, missing } objects
 */
export function findFAQsWithMissingVariables(
  faqAnswers: string[],
  siteVariables: Record<string, string | number>,
): Array<{ index: number; missing: string[] }> {
  const results: Array<{ index: number; missing: string[] }> = [];

  faqAnswers.forEach((text, index) => {
    const validation = validateVariables(text, siteVariables);
    if (!validation.valid) {
      results.push({
        index,
        missing: validation.missing,
      });
    }
  });

  return results;
}

/**
 * Preview FAQ answer with interpolated variables
 * Useful for showing admins what the FAQ will look like
 *
 * @param text - FAQ answer text with placeholders
 * @param customVariables - Optional custom variables for preview
 * @returns Promise<{original: string, interpolated: string, variables: Record}>
 */
export async function previewFAQAnswer(
  text: string,
  customVariables?: Record<string, string | number>,
): Promise<{
  original: string;
  interpolated: string;
  variables: Record<string, string | number>;
  usedVariables: string[];
}> {
  const siteVariables = await getAvailableVariables();
  const allVariables = {
    ...siteVariables,
    ...(customVariables || {}),
  };

  const usedVariables = extractVariables(text);
  const interpolated = interpolateVariables(text, allVariables);

  return {
    original: text,
    interpolated,
    variables: allVariables,
    usedVariables,
  };
}
