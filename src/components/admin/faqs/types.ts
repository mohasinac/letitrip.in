/**
 * Shared FAQ types for admin FAQ management.
 */

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  priority: number;
  tags: string[];
  featured: boolean;
  viewCount: number;
  helpfulCount: number;
  notHelpfulCount: number;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export type FaqDrawerMode = "create" | "edit" | "delete" | null;

export const FAQ_CATEGORIES = [
  "General",
  "Account",
  "Payment",
  "Shipping",
  "Returns",
  "Products",
  "Auctions",
  "Orders",
  "Technical",
  "Other",
] as const;

export const VARIABLE_PLACEHOLDERS = [
  { key: "{{companyName}}", description: "Company name" },
  { key: "{{supportEmail}}", description: "Support email address" },
  { key: "{{supportPhone}}", description: "Support phone number" },
  { key: "{{websiteUrl}}", description: "Website URL" },
  { key: "{{companyAddress}}", description: "Company address" },
] as const;
