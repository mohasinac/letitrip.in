import type { FAQCategory, FAQDocument } from "@/db/schema";

export type FaqDrawerMode = "create" | "edit" | "delete" | null;

export type FAQ = FAQDocument;

export const FAQ_CATEGORIES: readonly FAQCategory[] = [
  "general",
  "orders_payment",
  "shipping_delivery",
  "returns_refunds",
  "product_information",
  "account_security",
  "technical_support",
] as const;

export const VARIABLE_PLACEHOLDERS = [
  { key: "{{companyName}}", description: "Company name" },
  { key: "{{supportEmail}}", description: "Support email address" },
  { key: "{{supportPhone}}", description: "Support phone number" },
  { key: "{{websiteUrl}}", description: "Website URL" },
  { key: "{{companyAddress}}", description: "Company address" },
] as const;
