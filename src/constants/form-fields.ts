/**
 * Form Field Configurations for all entities
 *
 * This file defines field configurations used across the application for:
 * - Inline editing tables
 * - Form wizards
 * - Quick create forms
 * - Validation rules
 */

export type FieldType =
  | "text"
  | "textarea"
  | "number"
  | "email"
  | "url"
  | "tel"
  | "date"
  | "datetime-local"
  | "select"
  | "multiselect"
  | "checkbox"
  | "radio"
  | "file"
  | "image"
  | "richtext";

export type ValidatorType =
  | "required"
  | "email"
  | "url"
  | "phone"
  | "min"
  | "max"
  | "minLength"
  | "maxLength"
  | "pattern"
  | "custom";

export interface FieldValidator {
  type: ValidatorType;
  value?: any;
  message?: string;
  fn?: (value: any) => boolean | string;
}

export interface FieldOption {
  value: string | number;
  label: string;
}

export interface FormField {
  key: string;
  label: string;
  type: FieldType;
  placeholder?: string;
  helpText?: string;
  required?: boolean;
  disabled?: boolean;
  readonly?: boolean;
  defaultValue?: any;
  min?: number;
  max?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  options?: FieldOption[];
  validators?: FieldValidator[];
  group?: string; // For grouping fields in wizards
  showInTable?: boolean; // Show in inline edit tables
  showInQuickCreate?: boolean; // Show in quick create forms
  showInWizard?: boolean; // Show in form wizards
  wizardStep?: number; // Which step in wizard
}

// ==================== PRODUCT FIELDS ====================

export const PRODUCT_FIELDS: FormField[] = [
  {
    key: "name",
    label: "Product Name",
    type: "text",
    placeholder: "Enter product name",
    required: true,
    minLength: 3,
    maxLength: 200,
    showInTable: true,
    showInQuickCreate: true,
    showInWizard: true,
    wizardStep: 1,
    group: "basic",
  },
  {
    key: "sku",
    label: "SKU",
    type: "text",
    placeholder: "e.g. PROD-12345",
    required: true,
    minLength: 3,
    maxLength: 50,
    showInTable: true,
    showInQuickCreate: true,
    showInWizard: true,
    wizardStep: 1,
    group: "basic",
  },
  {
    key: "price",
    label: "Price (₹)",
    type: "number",
    placeholder: "0.00",
    required: true,
    min: 0,
    showInTable: true,
    showInQuickCreate: true,
    showInWizard: true,
    wizardStep: 2,
    group: "pricing",
  },
  {
    key: "compareAtPrice",
    label: "Compare at Price (₹)",
    type: "number",
    placeholder: "0.00",
    min: 0,
    helpText: "Original price before discount",
    showInTable: false,
    showInQuickCreate: false,
    showInWizard: true,
    wizardStep: 2,
    group: "pricing",
  },
  {
    key: "stockCount",
    label: "Stock Quantity",
    type: "number",
    placeholder: "0",
    required: true,
    min: 0,
    showInTable: true,
    showInQuickCreate: true,
    showInWizard: true,
    wizardStep: 2,
    group: "inventory",
  },
  {
    key: "lowStockThreshold",
    label: "Low Stock Alert",
    type: "number",
    placeholder: "10",
    min: 0,
    helpText: "Alert when stock falls below this number",
    showInTable: false,
    showInQuickCreate: false,
    showInWizard: true,
    wizardStep: 2,
    group: "inventory",
  },
  {
    key: "categoryId",
    label: "Category",
    type: "select",
    required: true,
    options: [], // Populated dynamically
    showInTable: true,
    showInQuickCreate: true,
    showInWizard: true,
    wizardStep: 1,
    group: "basic",
  },
  {
    key: "status",
    label: "Status",
    type: "select",
    required: true,
    defaultValue: "draft",
    options: [
      { value: "draft", label: "Draft" },
      { value: "published", label: "Published" },
      { value: "archived", label: "Archived" },
      { value: "out-of-stock", label: "Out of Stock" },
    ],
    showInTable: true,
    showInQuickCreate: true,
    showInWizard: true,
    wizardStep: 5,
    group: "publishing",
  },
  {
    key: "description",
    label: "Description",
    type: "textarea",
    placeholder: "Enter product description",
    maxLength: 500,
    helpText: "Short description (max 500 characters)",
    showInTable: false,
    showInQuickCreate: false,
    showInWizard: true,
    wizardStep: 3,
    group: "details",
  },
  {
    key: "brand",
    label: "Brand",
    type: "text",
    placeholder: "Brand name",
    maxLength: 100,
    showInTable: false,
    showInQuickCreate: false,
    showInWizard: true,
    wizardStep: 1,
    group: "basic",
  },
  {
    key: "weight",
    label: "Weight (kg)",
    type: "number",
    placeholder: "0.00",
    min: 0,
    helpText: "Product weight for shipping calculation",
    showInTable: false,
    showInQuickCreate: false,
    showInWizard: true,
    wizardStep: 2,
    group: "shipping",
  },
  {
    key: "isFeatured",
    label: "Featured",
    type: "checkbox",
    defaultValue: false,
    helpText: "Show on homepage",
    showInTable: false,
    showInQuickCreate: false,
    showInWizard: true,
    wizardStep: 5,
    group: "publishing",
  },
];

// ==================== AUCTION FIELDS ====================

export const AUCTION_FIELDS: FormField[] = [
  {
    key: "title",
    label: "Auction Title",
    type: "text",
    placeholder: "Enter auction title",
    required: true,
    minLength: 5,
    maxLength: 200,
    showInTable: true,
    showInQuickCreate: true,
    showInWizard: true,
    wizardStep: 1,
    group: "basic",
  },
  {
    key: "startingBid",
    label: "Starting Bid (₹)",
    type: "number",
    placeholder: "0.00",
    required: true,
    min: 1,
    showInTable: true,
    showInQuickCreate: true,
    showInWizard: true,
    wizardStep: 2,
    group: "bidding",
  },
  {
    key: "reservePrice",
    label: "Reserve Price (₹)",
    type: "number",
    placeholder: "0.00",
    min: 0,
    helpText: "Minimum price to accept (optional)",
    showInTable: false,
    showInQuickCreate: false,
    showInWizard: true,
    wizardStep: 2,
    group: "bidding",
  },
  {
    key: "bidIncrement",
    label: "Bid Increment (₹)",
    type: "number",
    placeholder: "100",
    required: true,
    min: 1,
    helpText: "Minimum amount to increase bid",
    showInTable: true,
    showInQuickCreate: true,
    showInWizard: true,
    wizardStep: 2,
    group: "bidding",
  },
  {
    key: "buyoutPrice",
    label: "Buy Now Price (₹)",
    type: "number",
    placeholder: "0.00",
    min: 0,
    helpText: "Price to end auction immediately (optional)",
    showInTable: false,
    showInQuickCreate: false,
    showInWizard: true,
    wizardStep: 2,
    group: "bidding",
  },
  {
    key: "startDate",
    label: "Start Date",
    type: "datetime-local",
    required: true,
    showInTable: true,
    showInQuickCreate: true,
    showInWizard: true,
    wizardStep: 3,
    group: "schedule",
  },
  {
    key: "endDate",
    label: "End Date",
    type: "datetime-local",
    required: true,
    showInTable: true,
    showInQuickCreate: true,
    showInWizard: true,
    wizardStep: 3,
    group: "schedule",
  },
  {
    key: "status",
    label: "Status",
    type: "select",
    required: true,
    defaultValue: "upcoming",
    options: [
      { value: "upcoming", label: "Upcoming" },
      { value: "active", label: "Active" },
      { value: "ended", label: "Ended" },
      { value: "cancelled", label: "Cancelled" },
    ],
    showInTable: true,
    showInQuickCreate: true,
    showInWizard: true,
    wizardStep: 5,
    group: "publishing",
  },
  {
    key: "category",
    label: "Category",
    type: "select",
    required: true,
    options: [], // Populated dynamically
    showInTable: true,
    showInQuickCreate: true,
    showInWizard: true,
    wizardStep: 1,
    group: "basic",
  },
  {
    key: "description",
    label: "Description",
    type: "textarea",
    placeholder: "Enter auction description",
    maxLength: 1000,
    showInTable: false,
    showInQuickCreate: false,
    showInWizard: true,
    wizardStep: 1,
    group: "basic",
  },
  {
    key: "isFeatured",
    label: "Featured",
    type: "checkbox",
    defaultValue: false,
    helpText: "Show on homepage",
    showInTable: false,
    showInQuickCreate: false,
    showInWizard: true,
    wizardStep: 5,
    group: "publishing",
  },
];

// ==================== CATEGORY FIELDS ====================

export const CATEGORY_FIELDS: FormField[] = [
  {
    key: "name",
    label: "Category Name",
    type: "text",
    placeholder: "Enter category name",
    required: true,
    minLength: 2,
    maxLength: 100,
    showInTable: true,
    showInQuickCreate: true,
    showInWizard: true,
    wizardStep: 1,
    group: "basic",
  },
  {
    key: "slug",
    label: "URL Slug",
    type: "text",
    placeholder: "auto-generated",
    required: true,
    pattern: "^[a-z0-9-]+$",
    helpText: "URL-friendly name (auto-generated from name)",
    showInTable: true,
    showInQuickCreate: false,
    showInWizard: true,
    wizardStep: 3,
    group: "seo",
  },
  {
    key: "parentId",
    label: "Parent Category",
    type: "select",
    options: [{ value: "", label: "None (Top Level)" }], // Populated dynamically
    helpText: "Select parent category for subcategory",
    showInTable: true,
    showInQuickCreate: true,
    showInWizard: true,
    wizardStep: 1,
    group: "basic",
  },
  {
    key: "description",
    label: "Description",
    type: "textarea",
    placeholder: "Enter category description",
    maxLength: 500,
    showInTable: false,
    showInQuickCreate: false,
    showInWizard: true,
    wizardStep: 1,
    group: "basic",
  },
  {
    key: "icon",
    label: "Icon",
    type: "text",
    placeholder: "Icon name or emoji",
    maxLength: 50,
    helpText: "Lucide icon name or emoji",
    showInTable: true,
    showInQuickCreate: false,
    showInWizard: true,
    wizardStep: 2,
    group: "media",
  },
  {
    key: "displayOrder",
    label: "Display Order",
    type: "number",
    placeholder: "0",
    min: 0,
    defaultValue: 0,
    helpText: "Lower numbers appear first",
    showInTable: true,
    showInQuickCreate: false,
    showInWizard: true,
    wizardStep: 4,
    group: "display",
  },
  {
    key: "isFeatured",
    label: "Featured",
    type: "checkbox",
    defaultValue: false,
    showInTable: false,
    showInQuickCreate: false,
    showInWizard: true,
    wizardStep: 4,
    group: "display",
  },
  {
    key: "showOnHomepage",
    label: "Show on Homepage",
    type: "checkbox",
    defaultValue: false,
    showInTable: false,
    showInQuickCreate: false,
    showInWizard: true,
    wizardStep: 4,
    group: "display",
  },
  {
    key: "isActive",
    label: "Active",
    type: "checkbox",
    defaultValue: true,
    showInTable: true,
    showInQuickCreate: true,
    showInWizard: true,
    wizardStep: 4,
    group: "display",
  },
  {
    key: "metaTitle",
    label: "Meta Title",
    type: "text",
    placeholder: "SEO title",
    maxLength: 60,
    helpText: "For search engines (max 60 characters)",
    showInTable: false,
    showInQuickCreate: false,
    showInWizard: true,
    wizardStep: 3,
    group: "seo",
  },
  {
    key: "metaDescription",
    label: "Meta Description",
    type: "textarea",
    placeholder: "SEO description",
    maxLength: 160,
    helpText: "For search engines (max 160 characters)",
    showInTable: false,
    showInQuickCreate: false,
    showInWizard: true,
    wizardStep: 3,
    group: "seo",
  },
];

// ==================== SHOP FIELDS ====================

export const SHOP_FIELDS: FormField[] = [
  {
    key: "name",
    label: "Shop Name",
    type: "text",
    placeholder: "Enter shop name",
    required: true,
    minLength: 3,
    maxLength: 100,
    showInTable: true,
    showInQuickCreate: true,
    showInWizard: true,
    wizardStep: 1,
    group: "basic",
  },
  {
    key: "slug",
    label: "URL Slug",
    type: "text",
    placeholder: "auto-generated",
    required: true,
    pattern: "^[a-z0-9-]+$",
    helpText: "URL-friendly name",
    showInTable: false,
    showInQuickCreate: false,
    showInWizard: true,
    wizardStep: 5,
    group: "settings",
  },
  {
    key: "description",
    label: "Description",
    type: "textarea",
    placeholder: "Describe your shop",
    required: true,
    minLength: 20,
    maxLength: 500,
    showInTable: false,
    showInQuickCreate: false,
    showInWizard: true,
    wizardStep: 1,
    group: "basic",
  },
  {
    key: "location",
    label: "Location",
    type: "text",
    placeholder: "City, State",
    required: true,
    maxLength: 100,
    showInTable: true,
    showInQuickCreate: true,
    showInWizard: true,
    wizardStep: 3,
    group: "contact",
  },
  {
    key: "email",
    label: "Email",
    type: "email",
    placeholder: "shop@example.com",
    required: true,
    validators: [{ type: "email", message: "Invalid email format" }],
    showInTable: true,
    showInQuickCreate: true,
    showInWizard: true,
    wizardStep: 3,
    group: "contact",
  },
  {
    key: "phone",
    label: "Phone",
    type: "tel",
    placeholder: "+91 1234567890",
    required: true,
    validators: [{ type: "phone", message: "Invalid phone number" }],
    showInTable: false,
    showInQuickCreate: false,
    showInWizard: true,
    wizardStep: 3,
    group: "contact",
  },
  {
    key: "address",
    label: "Address",
    type: "textarea",
    placeholder: "Street address",
    maxLength: 200,
    showInTable: false,
    showInQuickCreate: false,
    showInWizard: true,
    wizardStep: 3,
    group: "contact",
  },
  {
    key: "isVerified",
    label: "Verified",
    type: "checkbox",
    defaultValue: false,
    readonly: true,
    helpText: "Admin only",
    showInTable: true,
    showInQuickCreate: false,
    showInWizard: false,
  },
  {
    key: "isFeatured",
    label: "Featured",
    type: "checkbox",
    defaultValue: false,
    showInTable: false,
    showInQuickCreate: false,
    showInWizard: true,
    wizardStep: 5,
    group: "settings",
  },
  {
    key: "showOnHomepage",
    label: "Show on Homepage",
    type: "checkbox",
    defaultValue: false,
    showInTable: false,
    showInQuickCreate: false,
    showInWizard: true,
    wizardStep: 5,
    group: "settings",
  },
  {
    key: "isBanned",
    label: "Banned",
    type: "checkbox",
    defaultValue: false,
    readonly: true,
    helpText: "Admin only",
    showInTable: true,
    showInQuickCreate: false,
    showInWizard: false,
  },
];

// ==================== USER FIELDS ====================

export const USER_FIELDS: FormField[] = [
  {
    key: "name",
    label: "Full Name",
    type: "text",
    placeholder: "John Doe",
    required: true,
    minLength: 2,
    maxLength: 100,
    showInTable: true,
    showInQuickCreate: true,
  },
  {
    key: "email",
    label: "Email",
    type: "email",
    placeholder: "user@example.com",
    required: true,
    validators: [{ type: "email", message: "Invalid email format" }],
    showInTable: true,
    showInQuickCreate: true,
  },
  {
    key: "phone",
    label: "Phone",
    type: "tel",
    placeholder: "+91 1234567890",
    validators: [{ type: "phone", message: "Invalid phone number" }],
    showInTable: true,
    showInQuickCreate: false,
  },
  {
    key: "role",
    label: "Role",
    type: "select",
    required: true,
    defaultValue: "user",
    options: [
      { value: "user", label: "User" },
      { value: "seller", label: "Seller" },
      { value: "admin", label: "Admin" },
    ],
    showInTable: true,
    showInQuickCreate: true,
  },
  {
    key: "isBanned",
    label: "Banned",
    type: "checkbox",
    defaultValue: false,
    showInTable: true,
    showInQuickCreate: false,
  },
];

// ==================== COUPON FIELDS ====================

export const COUPON_FIELDS: FormField[] = [
  {
    key: "code",
    label: "Coupon Code",
    type: "text",
    placeholder: "SAVE20",
    required: true,
    minLength: 3,
    maxLength: 50,
    pattern: "^[A-Z0-9-]+$",
    helpText: "Uppercase letters, numbers, and hyphens only",
    showInTable: true,
    showInQuickCreate: true,
  },
  {
    key: "discountType",
    label: "Discount Type",
    type: "select",
    required: true,
    options: [
      { value: "percentage", label: "Percentage" },
      { value: "fixed", label: "Fixed Amount" },
    ],
    showInTable: true,
    showInQuickCreate: true,
  },
  {
    key: "discountValue",
    label: "Discount Value",
    type: "number",
    placeholder: "0",
    required: true,
    min: 0,
    helpText: "Percentage (1-100) or fixed amount",
    showInTable: true,
    showInQuickCreate: true,
  },
  {
    key: "minPurchase",
    label: "Min Purchase (₹)",
    type: "number",
    placeholder: "0",
    min: 0,
    helpText: "Minimum cart value to apply coupon",
    showInTable: false,
    showInQuickCreate: false,
  },
  {
    key: "maxDiscount",
    label: "Max Discount (₹)",
    type: "number",
    placeholder: "0",
    min: 0,
    helpText: "Maximum discount amount (for percentage coupons)",
    showInTable: false,
    showInQuickCreate: false,
  },
  {
    key: "usageLimit",
    label: "Usage Limit",
    type: "number",
    placeholder: "0",
    min: 0,
    helpText: "0 = unlimited",
    showInTable: true,
    showInQuickCreate: false,
  },
  {
    key: "expiresAt",
    label: "Expires At",
    type: "datetime-local",
    required: true,
    showInTable: true,
    showInQuickCreate: true,
  },
  {
    key: "isActive",
    label: "Active",
    type: "checkbox",
    defaultValue: true,
    showInTable: true,
    showInQuickCreate: true,
  },
];

// ==================== HERO SLIDE FIELDS ====================

export const HERO_SLIDE_FIELDS: FormField[] = [
  {
    key: "title",
    label: "Title",
    type: "text",
    placeholder: "Main headline",
    required: true,
    showInTable: true,
    showInQuickCreate: true,
    group: "content",
  },
  {
    key: "subtitle",
    label: "Subtitle",
    type: "text",
    placeholder: "Secondary text",
    showInTable: false,
    showInQuickCreate: true,
    group: "content",
  },
  {
    key: "image_url",
    label: "Image",
    type: "image",
    placeholder: "shop",
    required: true,
    showInTable: true,
    showInQuickCreate: true,
    group: "media",
  },
  {
    key: "link_url",
    label: "Link URL",
    type: "url",
    placeholder: "https://...",
    showInTable: false,
    showInQuickCreate: true,
    validators: [{ type: "url", message: "Must be a valid URL" }],
    group: "content",
  },
  {
    key: "cta_text",
    label: "CTA Text",
    type: "text",
    placeholder: "Shop Now",
    showInTable: false,
    showInQuickCreate: true,
    group: "content",
  },
  {
    key: "display_order",
    label: "Display Order",
    type: "number",
    placeholder: "0",
    min: 0,
    defaultValue: 0,
    helpText: "Lower numbers appear first",
    showInTable: true,
    showInQuickCreate: false,
    group: "settings",
  },
  {
    key: "is_active",
    label: "Active",
    type: "checkbox",
    defaultValue: true,
    showInTable: true,
    showInQuickCreate: true,
    group: "settings",
  },
  {
    key: "show_in_carousel",
    label: "Show in Carousel",
    type: "checkbox",
    defaultValue: true,
    showInTable: true,
    showInQuickCreate: false,
    group: "settings",
  },
];

// ==================== HELPER FUNCTIONS ====================

/**
 * Get fields for a specific context
 */
export function getFieldsForContext(
  fields: FormField[],
  context: "table" | "quickCreate" | "wizard"
): FormField[] {
  const key = `showIn${
    context.charAt(0).toUpperCase() + context.slice(1)
  }` as keyof FormField;
  return fields.filter((field) => field[key] === true);
}

/**
 * Get fields for a specific wizard step
 */
export function getFieldsForWizardStep(
  fields: FormField[],
  step: number
): FormField[] {
  return fields.filter(
    (field) => field.wizardStep === step && field.showInWizard
  );
}

/**
 * Get fields grouped by group name
 */
export function getFieldsByGroup(
  fields: FormField[]
): Record<string, FormField[]> {
  return fields.reduce((groups, field) => {
    const group = field.group || "default";
    if (!groups[group]) {
      groups[group] = [];
    }
    groups[group].push(field);
    return groups;
  }, {} as Record<string, FormField[]>);
}

/**
 * Convert FormField to InlineField format (for backward compatibility)
 */
export function toInlineField(field: FormField): any {
  return {
    key: field.key,
    label: field.label,
    type: field.type,
    placeholder: field.placeholder,
    required: field.required,
    disabled: field.disabled,
    readonly: field.readonly,
    min: field.min,
    max: field.max,
    minLength: field.minLength,
    maxLength: field.maxLength,
    pattern: field.pattern,
    options: field.options,
  };
}

/**
 * Convert array of FormFields to InlineFields
 */
export function toInlineFields(fields: FormField[]): any[] {
  return fields.map(toInlineField);
}
