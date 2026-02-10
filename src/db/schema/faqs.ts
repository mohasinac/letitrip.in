/**
 * FAQs Collection Schema
 *
 * Firestore schema definition for FAQ management with dynamic variable interpolation
 */

import { generateFAQId, type GenerateFAQIdInput } from "@/utils";

// ============================================
// FAQ TYPE ENUMS & INTERFACES
// ============================================
export type FAQCategory =
  | "orders_payment"
  | "shipping_delivery"
  | "returns_refunds"
  | "product_information"
  | "account_security"
  | "technical_support"
  | "general";

/**
 * Rich text answer format (can be extended for Tiptap/Slate)
 */
export interface FAQAnswer {
  text: string; // Main answer text with variable placeholders {{variableName}}
  format: "plain" | "markdown" | "html"; // Text format
}

/**
 * FAQ statistics
 */
export interface FAQStats {
  views: number; // Total views
  helpful: number; // "Helpful" votes
  notHelpful: number; // "Not Helpful" votes
  lastViewed?: Date;
}

/**
 * FAQ SEO settings
 */
export interface FAQSEO {
  slug: string; // URL-friendly slug
  metaTitle?: string;
  metaDescription?: string;
}

// ============================================
// 1. COLLECTION INTERFACE & NAME
// ============================================
export interface FAQDocument {
  id: string;
  question: string;
  answer: FAQAnswer;
  category: FAQCategory;

  // Display Settings
  showOnHomepage: boolean; // Display in homepage FAQ section
  showInFooter: boolean; // Display in footer quick links
  isPinned: boolean; // Pin to top of category
  order: number; // Sort order within category
  priority: number; // Display priority (higher = more important)

  // Organization
  tags: string[]; // Search tags
  relatedFAQs: string[]; // IDs of related FAQs

  // Variable Interpolation
  useSiteSettings: boolean; // Enable variable interpolation from siteSettings
  variables?: Record<string, string>; // Custom variable overrides (key-value pairs)

  // Statistics
  stats: FAQStats;

  // SEO
  seo: FAQSEO;

  // Status
  isActive: boolean;

  // Metadata
  createdBy: string; // Admin user ID
  createdAt: Date;
  updatedAt: Date;
}

export const FAQS_COLLECTION = "faqs" as const;

// ============================================
// 2. INDEXED FIELDS
// ============================================
/**
 * Fields indexed in Firestore for query performance
 *
 * Purpose:
 * - category + order: Get FAQs by category in display order
 * - isActive + showOnHomepage + priority: Get homepage FAQs ordered by priority
 * - isActive + showInFooter: Get footer FAQs
 * - isActive + isPinned + category: Get pinned FAQs per category
 * - isActive + stats.helpful DESC: Get most helpful FAQs
 * - tags array-contains: Search FAQs by tag
 * - seo.slug: Unique FAQ page lookup
 */
export const FAQS_INDEXED_FIELDS = [
  "seo.slug", // For unique lookup
  "category", // For category filtering
  "order", // For sorting within category
  "showOnHomepage", // For homepage filtering
  "showInFooter", // For footer filtering
  "isPinned", // For pinned FAQs
  "priority", // For sorting by importance
  "tags", // For tag-based search (array-contains)
  "isActive", // For active FAQ filtering
  "stats.helpful", // For sorting by helpfulness
  "createdBy", // For admin filtering
  "createdAt", // For date sorting
] as const;

// ============================================
// 3. RELATIONSHIPS
// ============================================
/**
 * RELATIONSHIPS:
 *
 * users (1) ----< (N) faqs
 * siteSettings (1) ----< (N) faqs (via variable interpolation)
 * faqs (N) >----< (M) faqs (self-referential via relatedFAQs)
 *
 * Foreign Keys:
 * - faqs/{id}.createdBy references users/{uid}
 * - faqs/{id}.relatedFAQs[i] references faqs/{id}
 * - faqs/{id}.variables interpolated from siteSettings/global.faq.variables
 *
 * CASCADE BEHAVIOR:
 * - When FAQ deleted: Remove from other FAQs' relatedFAQs arrays
 * - When user deleted: Set createdBy to null or "deleted_user"
 * - When siteSettings updated: Invalidate FAQ cache to refresh interpolated values
 */

// ============================================
// 4. HELPER CONSTANTS
// ============================================
/**
 * FAQ category labels
 */
export const FAQ_CATEGORY_LABELS: Record<FAQCategory, string> = {
  orders_payment: "Orders & Payment",
  shipping_delivery: "Shipping & Delivery",
  returns_refunds: "Returns & Refunds",
  product_information: "Product Information",
  account_security: "Account & Security",
  technical_support: "Technical Support",
  general: "General Questions",
};

/**
 * Default FAQ data
 */
export const DEFAULT_FAQ_DATA: Partial<FAQDocument> = {
  showOnHomepage: false,
  showInFooter: false,
  isPinned: false,
  order: 0,
  priority: 0,
  tags: [],
  relatedFAQs: [],
  useSiteSettings: true,
  variables: {},
  stats: {
    views: 0,
    helpful: 0,
    notHelpful: 0,
  },
  isActive: true,
};

/**
 * Fields that are publicly readable
 */
export const FAQS_PUBLIC_FIELDS = [
  "id",
  "question",
  "answer",
  "category",
  "showOnHomepage",
  "showInFooter",
  "isPinned",
  "order",
  "priority",
  "tags",
  "relatedFAQs",
  "stats.views",
  "stats.helpful",
  "stats.notHelpful",
  "seo.slug",
  "seo.metaTitle",
  "seo.metaDescription",
  "isActive",
  "createdAt",
] as const;

/**
 * Fields that admins can update
 */
export const FAQS_UPDATABLE_FIELDS = [
  "question",
  "answer",
  "category",
  "showOnHomepage",
  "showInFooter",
  "isPinned",
  "order",
  "priority",
  "tags",
  "relatedFAQs",
  "useSiteSettings",
  "variables",
  "seo",
  "isActive",
] as const;

// ============================================
// 5. TYPE UTILITIES
// ============================================
/**
 * Type for creating new FAQs (omit system-generated fields)
 */
export type FAQCreateInput = Omit<
  FAQDocument,
  "id" | "createdAt" | "updatedAt" | "stats"
>;

/**
 * Type for updating FAQs
 */
export type FAQUpdateInput = Partial<
  Pick<
    FAQDocument,
    | "question"
    | "answer"
    | "category"
    | "showOnHomepage"
    | "showInFooter"
    | "isPinned"
    | "order"
    | "priority"
    | "tags"
    | "relatedFAQs"
    | "useSiteSettings"
    | "variables"
    | "seo"
    | "isActive"
  >
>;

/**
 * Type for FAQ with interpolated variables (for display)
 */
export interface FAQWithInterpolatedAnswer extends Omit<FAQDocument, "answer"> {
  answer: FAQAnswer & { interpolated: string }; // Original + interpolated text
}

// ============================================
// 6. QUERY HELPERS
// ============================================
/**
 * Firestore query helper functions for type-safe queries
 */
export const faqQueryHelpers = {
  bySlug: (slug: string) => ["seo.slug", "==", slug] as const,
  byCategory: (category: FAQCategory) => ["category", "==", category] as const,
  homepage: () => ["showOnHomepage", "==", true] as const,
  footer: () => ["showInFooter", "==", true] as const,
  pinned: () => ["isPinned", "==", true] as const,
  active: () => ["isActive", "==", true] as const,
  byTag: (tag: string) => ["tags", "array-contains", tag] as const,
  byCreator: (userId: string) => ["createdBy", "==", userId] as const,
} as const;

// ============================================
// 7. VARIABLE INTERPOLATION HELPERS
// ============================================
/**
 * Extract variable placeholders from text
 * Matches {{variableName}} patterns
 */
export function extractVariablePlaceholders(text: string): string[] {
  const regex = /\{\{(\w+)\}\}/g;
  const matches = text.matchAll(regex);
  return Array.from(matches, (m) => m[1]);
}

/**
 * Check if FAQ uses variable interpolation
 */
export function usesVariableInterpolation(faq: FAQDocument): boolean {
  if (!faq.useSiteSettings) return false;
  const placeholders = extractVariablePlaceholders(faq.answer.text);
  return placeholders.length > 0;
}

/**
 * Validate FAQ answer has valid variable placeholders
 * Returns array of invalid variable names (not found in siteSettings or custom variables)
 */
export function validateFAQVariables(
  faq: FAQDocument,
  siteSettingsVariables: Record<string, string | number>,
): string[] {
  if (!faq.useSiteSettings) return [];

  const placeholders = extractVariablePlaceholders(faq.answer.text);
  const availableVars = {
    ...siteSettingsVariables,
    ...(faq.variables || {}),
  };

  return placeholders.filter((varName) => !(varName in availableVars));
}

/**
 * Simple slugify function for FAQ questions
 */
export function slugifyQuestion(question: string): string {
  return question
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "") // Remove non-word chars
    .replace(/[\s_-]+/g, "-") // Replace spaces with single dash
    .replace(/^-+|-+$/g, "") // Remove leading/trailing dashes
    .slice(0, 60); // Limit length
}

/**
 * Generate SEO-friendly FAQ ID
 * Pattern: faq-{category}-{question-slug}
 *
 * @param category - FAQ category
 * @param question - FAQ question text
 * @returns SEO-friendly FAQ ID
 *
 * Example: createFAQId("shipping", "How long does delivery take?")
 *   → "faq-shipping-how-long-does-delivery-take"
 */
export function createFAQId(category: FAQCategory, question: string): string {
  return generateFAQId({ category, question });
}

/**
 * Check if FAQ is popular (high engagement)
 */
export function isPopularFAQ(faq: FAQDocument): boolean {
  const { views, helpful, notHelpful } = faq.stats;
  const totalVotes = helpful + notHelpful;
  const helpfulnessRatio = totalVotes > 0 ? helpful / totalVotes : 0;

  // Popular if: 100+ views AND 70%+ helpful ratio
  return views >= 100 && helpfulnessRatio >= 0.7;
}

/**
 * Get FAQ helpfulness percentage
 */
export function getHelpfulnessPercentage(faq: FAQDocument): number {
  const { helpful, notHelpful } = faq.stats;
  const total = helpful + notHelpful;
  if (total === 0) return 0;
  return Math.round((helpful / total) * 100);
}
