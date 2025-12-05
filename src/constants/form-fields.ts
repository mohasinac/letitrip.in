/**
 * @fileoverview TypeScript Module
 * @module src/constants/form-fields
 * @description This file contains functionality related to form-fields
 * 
 * @created 2025-12-05
 * @author mohasinac
 * @see {@link https://mohasin.chinnapattan.com}
 */

/**
 * Form Field Configurations for all entities
 *
 * This file defines field configurations used across the application for:
 * - Inline editing tables
 * - Form wizards
 * - Quick create forms
 * - Validation rules
 */

/**
 * Field Type type definition
 * @typedef {FieldType}
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

/**
 * ValidatorType type
 * 
 * @typedef {Object} ValidatorType
 * @description Type definition for ValidatorType
 */
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

/**
 * FieldValidator interface
 * 
 * @interface
 * @description Defines the structure and contract for FieldValidator
 */
export interface FieldValidator {
  /** Type */
  type: ValidatorType;
  /** Value */
  value?: any;
  /** Message */
  message?: string;
  /** Fn */
  fn?: (value: any) => boolean | string;
}

/**
 * FieldOption interface
 * 
 * @interface
 * @description Defines the structure and contract for FieldOption
 */
export interface FieldOption {
  /** Value */
  value: string | number;
  /** Label */
  label: string;
}

/**
 * FormField interface
 * 
 * @interface
 * @description Defines the structure and contract for FormField
 */
export interface FormField {
  /** Key */
  key: string;
  /** Label */
  label: string;
  /** Type */
  type: FieldType;
  /** Placeholder */
  placeholder?: string;
  /** Help Text */
  helpText?: string;
  /** Required */
  required?: boolean;
  /** Disabled */
  disabled?: boolean;
  /** Readonly */
  readonly?: boolean;
  /** Default Value */
  defaultValue?: any;
  /** Min */
  min?: number;
  /** Max */
  max?: number;
  /** Min Length */
  minLength?: number;
  /** Max Length */
  maxLength?: number;
  /** Pattern */
  pattern?: string;
  /** Options */
  options?: FieldOption[];
  /** Validators */
  validators?: FieldValidator[];
  /** Group */
  group?: string; // For grouping fields in wizards
  /** ShowInTable */
  showInTable?: boolean; // Show in inline edit tables
  /** ShowInQuickCreate */
  showInQuickCreate?: boolean; // Show in quick create forms
  /** ShowInWizard */
  showInWizard?: boolean; // Show in form wizards
  /** WizardStep */
  wizardStep?: number; // Which step in wizard
}

// ==================== PRODUCT FIELDS ====================

/**
 * Product Fields
 * @constant
 */
export const PRODUCT_FIELDS: FormField[] = [
  {
    /** Key */
    key: "name",
    /** Label */
    label: "Product Name",
    /** Type */
    type: "text",
    /** Placeholder */
    placeholder: "Enter product name",
    /** Required */
    required: true,
    /** Min Length */
    minLength: 3,
    /** Max Length */
    maxLength: 200,
    /** Show In Table */
    showInTable: true,
    /** Show In Quick Create */
    showInQuickCreate: true,
    /** Show In Wizard */
    showInWizard: true,
    /** Wizard Step */
    wizardStep: 1,
    /** Group */
    group: "basic",
  },
  {
    /** Key */
    key: "sku",
    /** Label */
    label: "SKU",
    /** Type */
    type: "text",
    /** Placeholder */
    placeholder: "e.g. PROD-12345",
    /** Required */
    required: true,
    /** Min Length */
    minLength: 3,
    /** Max Length */
    maxLength: 50,
    /** Show In Table */
    showInTable: true,
    /** Show In Quick Create */
    showInQuickCreate: true,
    /** Show In Wizard */
    showInWizard: true,
    /** Wizard Step */
    wizardStep: 1,
    /** Group */
    group: "basic",
  },
  {
    /** Key */
    key: "price",
    /** Label */
    label: "Price (₹)",
    /** Type */
    type: "number",
    /** Placeholder */
    placeholder: "0.00",
    /** Required */
    required: true,
    /** Min */
    min: 0,
    /** Show In Table */
    showInTable: true,
    /** Show In Quick Create */
    showInQuickCreate: true,
    /** Show In Wizard */
    showInWizard: true,
    /** Wizard Step */
    wizardStep: 2,
    /** Group */
    group: "pricing",
  },
  {
    /** Key */
    key: "compareAtPrice",
    /** Label */
    label: "Compare at Price (₹)",
    /** Type */
    type: "number",
    /** Placeholder */
    placeholder: "0.00",
    /** Min */
    min: 0,
    /** Help Text */
    helpText: "Original price before discount",
    /** Show In Table */
    showInTable: false,
    /** Show In Quick Create */
    showInQuickCreate: false,
    /** Show In Wizard */
    showInWizard: true,
    /** Wizard Step */
    wizardStep: 2,
    /** Group */
    group: "pricing",
  },
  {
    /** Key */
    key: "stockCount",
    /** Label */
    label: "Stock Quantity",
    /** Type */
    type: "number",
    /** Placeholder */
    placeholder: "0",
    /** Required */
    required: true,
    /** Min */
    min: 0,
    /** Show In Table */
    showInTable: true,
    /** Show In Quick Create */
    showInQuickCreate: true,
    /** Show In Wizard */
    showInWizard: true,
    /** Wizard Step */
    wizardStep: 2,
    /** Group */
    group: "inventory",
  },
  {
    /** Key */
    key: "lowStockThreshold",
    /** Label */
    label: "Low Stock Alert",
    /** Type */
    type: "number",
    /** Placeholder */
    placeholder: "10",
    /** Min */
    min: 0,
    /** Help Text */
    helpText: "Alert when stock falls below this number",
    /** Show In Table */
    showInTable: false,
    /** Show In Quick Create */
    showInQuickCreate: false,
    /** Show In Wizard */
    showInWizard: true,
    /** Wizard Step */
    wizardStep: 2,
    /** Group */
    group: "inventory",
  },
  {
    /** Key */
    key: "categoryId",
    /** Label */
    label: "Category",
    /** Type */
    type: "select",
    /** Required */
    required: true,
    options: [], // Populated dynamically
    /** Show In Table */
    showInTable: true,
    /** Show In Quick Create */
    showInQuickCreate: true,
    /** Show In Wizard */
    showInWizard: true,
    /** Wizard Step */
    wizardStep: 1,
    /** Group */
    group: "basic",
  },
  {
    /** Key */
    key: "status",
    /** Label */
    label: "Status",
    /** Type */
    type: "select",
    /** Required */
    required: true,
    /** Default Value */
    defaultValue: "draft",
    /** Options */
    options: [
      { value: "draft", label: "Draft" },
      { value: "published", label: "Published" },
      { value: "archived", label: "Archived" },
      { value: "out-of-stock", label: "Out of Stock" },
    ],
    /** Show In Table */
    showInTable: true,
    /** Show In Quick Create */
    showInQuickCreate: true,
    /** Show In Wizard */
    showInWizard: true,
    /** Wizard Step */
    wizardStep: 5,
    /** Group */
    group: "publishing",
  },
  {
    /** Key */
    key: "description",
    /** Label */
    label: "Description",
    /** Type */
    type: "textarea",
    /** Placeholder */
    placeholder: "Enter product description",
    /** Max Length */
    maxLength: 500,
    /** Help Text */
    helpText: "Short description (max 500 characters)",
    /** Show In Table */
    showInTable: false,
    /** Show In Quick Create */
    showInQuickCreate: false,
    /** Show In Wizard */
    showInWizard: true,
    /** Wizard Step */
    wizardStep: 3,
    /** Group */
    group: "details",
  },
  {
    /** Key */
    key: "brand",
    /** Label */
    label: "Brand",
    /** Type */
    type: "text",
    /** Placeholder */
    placeholder: "Brand name",
    /** Max Length */
    maxLength: 100,
    /** Show In Table */
    showInTable: false,
    /** Show In Quick Create */
    showInQuickCreate: false,
    /** Show In Wizard */
    showInWizard: true,
    /** Wizard Step */
    wizardStep: 1,
    /** Group */
    group: "basic",
  },
  {
    /** Key */
    key: "weight",
    /** Label */
    label: "Weight (kg)",
    /** Type */
    type: "number",
    /** Placeholder */
    placeholder: "0.00",
    /** Min */
    min: 0,
    /** Help Text */
    helpText: "Product weight for shipping calculation",
    /** Show In Table */
    showInTable: false,
    /** Show In Quick Create */
    showInQuickCreate: false,
    /** Show In Wizard */
    showInWizard: true,
    /** Wizard Step */
    wizardStep: 2,
    /** Group */
    group: "shipping",
  },
  {
    /** Key */
    key: "featured",
    /** Label */
    label: "Featured",
    /** Type */
    type: "checkbox",
    /** Default Value */
    defaultValue: false,
    /** Help Text */
    helpText: "Show on homepage",
    /** Show In Table */
    showInTable: false,
    /** Show In Quick Create */
    showInQuickCreate: false,
    /** Show In Wizard */
    showInWizard: true,
    /** Wizard Step */
    wizardStep: 5,
    /** Group */
    group: "publishing",
  },
];

// ==================== AUCTION FIELDS ====================

/**
 * Auction Fields
 * @constant
 */
export const AUCTION_FIELDS: FormField[] = [
  {
    /** Key */
    key: "title",
    /** Label */
    label: "Auction Title",
    /** Type */
    type: "text",
    /** Placeholder */
    placeholder: "Enter auction title",
    /** Required */
    required: true,
    /** Min Length */
    minLength: 5,
    /** Max Length */
    maxLength: 200,
    /** Show In Table */
    showInTable: true,
    /** Show In Quick Create */
    showInQuickCreate: true,
    /** Show In Wizard */
    showInWizard: true,
    /** Wizard Step */
    wizardStep: 1,
    /** Group */
    group: "basic",
  },
  {
    /** Key */
    key: "startingBid",
    /** Label */
    label: "Starting Bid (₹)",
    /** Type */
    type: "number",
    /** Placeholder */
    placeholder: "0.00",
    /** Required */
    required: true,
    /** Min */
    min: 1,
    /** Show In Table */
    showInTable: true,
    /** Show In Quick Create */
    showInQuickCreate: true,
    /** Show In Wizard */
    showInWizard: true,
    /** Wizard Step */
    wizardStep: 2,
    /** Group */
    group: "bidding",
  },
  {
    /** Key */
    key: "reservePrice",
    /** Label */
    label: "Reserve Price (₹)",
    /** Type */
    type: "number",
    /** Placeholder */
    placeholder: "0.00",
    /** Min */
    min: 0,
    /** Help Text */
    helpText: "Minimum price to accept (optional)",
    /** Show In Table */
    showInTable: false,
    /** Show In Quick Create */
    showInQuickCreate: false,
    /** Show In Wizard */
    showInWizard: true,
    /** Wizard Step */
    wizardStep: 2,
    /** Group */
    group: "bidding",
  },
  {
    /** Key */
    key: "bidIncrement",
    /** Label */
    label: "Bid Increment (₹)",
    /** Type */
    type: "number",
    /** Placeholder */
    placeholder: "100",
    /** Required */
    required: true,
    /** Min */
    min: 1,
    /** Help Text */
    helpText: "Minimum amount to increase bid",
    /** Show In Table */
    showInTable: true,
    /** Show In Quick Create */
    showInQuickCreate: true,
    /** Show In Wizard */
    showInWizard: true,
    /** Wizard Step */
    wizardStep: 2,
    /** Group */
    group: "bidding",
  },
  {
    /** Key */
    key: "buyoutPrice",
    /** Label */
    label: "Buy Now Price (₹)",
    /** Type */
    type: "number",
    /** Placeholder */
    placeholder: "0.00",
    /** Min */
    min: 0,
    /** Help Text */
    helpText: "Price to end auction immediately (optional)",
    /** Show In Table */
    showInTable: false,
    /** Show In Quick Create */
    showInQuickCreate: false,
    /** Show In Wizard */
    showInWizard: true,
    /** Wizard Step */
    wizardStep: 2,
    /** Group */
    group: "bidding",
  },
  {
    /** Key */
    key: "startDate",
    /** Label */
    label: "Start Date",
    /** Type */
    type: "datetime-local",
    /** Required */
    required: true,
    /** Show In Table */
    showInTable: true,
    /** Show In Quick Create */
    showInQuickCreate: true,
    /** Show In Wizard */
    showInWizard: true,
    /** Wizard Step */
    wizardStep: 3,
    /** Group */
    group: "schedule",
  },
  {
    /** Key */
    key: "endDate",
    /** Label */
    label: "End Date",
    /** Type */
    type: "datetime-local",
    /** Required */
    required: true,
    /** Show In Table */
    showInTable: true,
    /** Show In Quick Create */
    showInQuickCreate: true,
    /** Show In Wizard */
    showInWizard: true,
    /** Wizard Step */
    wizardStep: 3,
    /** Group */
    group: "schedule",
  },
  {
    /** Key */
    key: "status",
    /** Label */
    label: "Status",
    /** Type */
    type: "select",
    /** Required */
    required: true,
    /** Default Value */
    defaultValue: "upcoming",
    /** Options */
    options: [
      { value: "upcoming", label: "Upcoming" },
      { value: "active", label: "Active" },
      { value: "ended", label: "Ended" },
      { value: "cancelled", label: "Cancelled" },
    ],
    /** Show In Table */
    showInTable: true,
    /** Show In Quick Create */
    showInQuickCreate: true,
    /** Show In Wizard */
    showInWizard: true,
    /** Wizard Step */
    wizardStep: 5,
    /** Group */
    group: "publishing",
  },
  {
    /** Key */
    key: "category",
    /** Label */
    label: "Category",
    /** Type */
    type: "select",
    /** Required */
    required: true,
    options: [], // Populated dynamically
    /** Show In Table */
    showInTable: true,
    /** Show In Quick Create */
    showInQuickCreate: true,
    /** Show In Wizard */
    showInWizard: true,
    /** Wizard Step */
    wizardStep: 1,
    /** Group */
    group: "basic",
  },
  {
    /** Key */
    key: "description",
    /** Label */
    label: "Description",
    /** Type */
    type: "textarea",
    /** Placeholder */
    placeholder: "Enter auction description",
    /** Max Length */
    maxLength: 1000,
    /** Show In Table */
    showInTable: false,
    /** Show In Quick Create */
    showInQuickCreate: false,
    /** Show In Wizard */
    showInWizard: true,
    /** Wizard Step */
    wizardStep: 1,
    /** Group */
    group: "basic",
  },
  {
    /** Key */
    key: "featured",
    /** Label */
    label: "Featured",
    /** Type */
    type: "checkbox",
    /** Default Value */
    defaultValue: false,
    /** Help Text */
    helpText: "Show on homepage",
    /** Show In Table */
    showInTable: false,
    /** Show In Quick Create */
    showInQuickCreate: false,
    /** Show In Wizard */
    showInWizard: true,
    /** Wizard Step */
    wizardStep: 5,
    /** Group */
    group: "publishing",
  },
];

// ==================== CATEGORY FIELDS ====================

/**
 * Category Fields
 * @constant
 */
export const CATEGORY_FIELDS: FormField[] = [
  {
    /** Key */
    key: "name",
    /** Label */
    label: "Category Name",
    /** Type */
    type: "text",
    /** Placeholder */
    placeholder: "Enter category name",
    /** Required */
    required: true,
    /** Min Length */
    minLength: 2,
    /** Max Length */
    maxLength: 100,
    /** Show In Table */
    showInTable: true,
    /** Show In Quick Create */
    showInQuickCreate: true,
    /** Show In Wizard */
    showInWizard: true,
    /** Wizard Step */
    wizardStep: 1,
    /** Group */
    group: "basic",
  },
  {
    /** Key */
    key: "slug",
    /** Label */
    label: "URL Slug",
    /** Type */
    type: "text",
    /** Placeholder */
    placeholder: "auto-generated",
    /** Required */
    required: true,
    /** Pattern */
    pattern: "^[a-z0-9-]+$",
    /** Help Text */
    helpText: "URL-friendly name (auto-generated from name)",
    /** Show In Table */
    showInTable: true,
    /** Show In Quick Create */
    showInQuickCreate: false,
    /** Show In Wizard */
    showInWizard: true,
    /** Wizard Step */
    wizardStep: 3,
    /** Group */
    group: "seo",
  },
  {
    /** Key */
    key: "parentId",
    /** Label */
    label: "Parent Category",
    /** Type */
    type: "select",
    options: [{ value: "", label: "None (Top Level)" }], // Populated dynamically
    /** Help Text */
    helpText: "Select parent category for subcategory",
    /** Show In Table */
    showInTable: true,
    /** Show In Quick Create */
    showInQuickCreate: true,
    /** Show In Wizard */
    showInWizard: true,
    /** Wizard Step */
    wizardStep: 1,
    /** Group */
    group: "basic",
  },
  {
    /** Key */
    key: "description",
    /** Label */
    label: "Description",
    /** Type */
    type: "textarea",
    /** Placeholder */
    placeholder: "Enter category description",
    /** Max Length */
    maxLength: 500,
    /** Show In Table */
    showInTable: false,
    /** Show In Quick Create */
    showInQuickCreate: false,
    /** Show In Wizard */
    showInWizard: true,
    /** Wizard Step */
    wizardStep: 1,
    /** Group */
    group: "basic",
  },
  {
    /** Key */
    key: "icon",
    /** Label */
    label: "Icon",
    /** Type */
    type: "text",
    /** Placeholder */
    placeholder: "Icon name or emoji",
    /** Max Length */
    maxLength: 50,
    /** Help Text */
    helpText: "Lucide icon name or emoji",
    /** Show In Table */
    showInTable: true,
    /** Show In Quick Create */
    showInQuickCreate: false,
    /** Show In Wizard */
    showInWizard: true,
    /** Wizard Step */
    wizardStep: 2,
    /** Group */
    group: "media",
  },
  {
    /** Key */
    key: "displayOrder",
    /** Label */
    label: "Display Order",
    /** Type */
    type: "number",
    /** Placeholder */
    placeholder: "0",
    /** Min */
    min: 0,
    /** Default Value */
    defaultValue: 0,
    /** Help Text */
    helpText: "Lower numbers appear first",
    /** Show In Table */
    showInTable: true,
    /** Show In Quick Create */
    showInQuickCreate: false,
    /** Show In Wizard */
    showInWizard: true,
    /** Wizard Step */
    wizardStep: 4,
    /** Group */
    group: "display",
  },
  {
    /** Key */
    key: "featured",
    /** Label */
    label: "Featured",
    /** Type */
    type: "checkbox",
    /** Default Value */
    defaultValue: false,
    /** Show In Table */
    showInTable: false,
    /** Show In Quick Create */
    showInQuickCreate: false,
    /** Show In Wizard */
    showInWizard: true,
    /** Wizard Step */
    wizardStep: 4,
    /** Group */
    group: "display",
  },
  {
    /** Key */
    key: "showOnHomepage",
    /** Label */
    label: "Show on Homepage",
    /** Type */
    type: "checkbox",
    /** Default Value */
    defaultValue: false,
    /** Show In Table */
    showInTable: false,
    /** Show In Quick Create */
    showInQuickCreate: false,
    /** Show In Wizard */
    showInWizard: true,
    /** Wizard Step */
    wizardStep: 4,
    /** Group */
    group: "display",
  },
  {
    /** Key */
    key: "isActive",
    /** Label */
    label: "Active",
    /** Type */
    type: "checkbox",
    /** Default Value */
    defaultValue: true,
    /** Show In Table */
    showInTable: true,
    /** Show In Quick Create */
    showInQuickCreate: true,
    /** Show In Wizard */
    showInWizard: true,
    /** Wizard Step */
    wizardStep: 4,
    /** Group */
    group: "display",
  },
  {
    /** Key */
    key: "metaTitle",
    /** Label */
    label: "Meta Title",
    /** Type */
    type: "text",
    /** Placeholder */
    placeholder: "SEO title",
    /** Max Length */
    maxLength: 60,
    /** Help Text */
    helpText: "For search engines (max 60 characters)",
    /** Show In Table */
    showInTable: false,
    /** Show In Quick Create */
    showInQuickCreate: false,
    /** Show In Wizard */
    showInWizard: true,
    /** Wizard Step */
    wizardStep: 3,
    /** Group */
    group: "seo",
  },
  {
    /** Key */
    key: "metaDescription",
    /** Label */
    label: "Meta Description",
    /** Type */
    type: "textarea",
    /** Placeholder */
    placeholder: "SEO description",
    /** Max Length */
    maxLength: 160,
    /** Help Text */
    helpText: "For search engines (max 160 characters)",
    /** Show In Table */
    showInTable: false,
    /** Show In Quick Create */
    showInQuickCreate: false,
    /** Show In Wizard */
    showInWizard: true,
    /** Wizard Step */
    wizardStep: 3,
    /** Group */
    group: "seo",
  },
];

// ==================== SHOP FIELDS ====================

/**
 * Shop Fields
 * @constant
 */
export const SHOP_FIELDS: FormField[] = [
  {
    /** Key */
    key: "name",
    /** Label */
    label: "Shop Name",
    /** Type */
    type: "text",
    /** Placeholder */
    placeholder: "Enter shop name",
    /** Required */
    required: true,
    /** Min Length */
    minLength: 3,
    /** Max Length */
    maxLength: 100,
    /** Show In Table */
    showInTable: true,
    /** Show In Quick Create */
    showInQuickCreate: true,
    /** Show In Wizard */
    showInWizard: true,
    /** Wizard Step */
    wizardStep: 1,
    /** Group */
    group: "basic",
  },
  {
    /** Key */
    key: "slug",
    /** Label */
    label: "URL Slug",
    /** Type */
    type: "text",
    /** Placeholder */
    placeholder: "auto-generated",
    /** Required */
    required: true,
    /** Pattern */
    pattern: "^[a-z0-9-]+$",
    /** Help Text */
    helpText: "URL-friendly name",
    /** Show In Table */
    showInTable: false,
    /** Show In Quick Create */
    showInQuickCreate: false,
    /** Show In Wizard */
    showInWizard: true,
    /** Wizard Step */
    wizardStep: 5,
    /** Group */
    group: "settings",
  },
  {
    /** Key */
    key: "description",
    /** Label */
    label: "Description",
    /** Type */
    type: "textarea",
    /** Placeholder */
    placeholder: "Describe your shop",
    /** Required */
    required: true,
    /** Min Length */
    minLength: 20,
    /** Max Length */
    maxLength: 500,
    /** Show In Table */
    showInTable: false,
    /** Show In Quick Create */
    showInQuickCreate: false,
    /** Show In Wizard */
    showInWizard: true,
    /** Wizard Step */
    wizardStep: 1,
    /** Group */
    group: "basic",
  },
  {
    /** Key */
    key: "location",
    /** Label */
    label: "Location",
    /** Type */
    type: "text",
    /** Placeholder */
    placeholder: "City, State",
    /** Required */
    required: true,
    /** Max Length */
    maxLength: 100,
    /** Show In Table */
    showInTable: true,
    /** Show In Quick Create */
    showInQuickCreate: true,
    /** Show In Wizard */
    showInWizard: true,
    /** Wizard Step */
    wizardStep: 3,
    /** Group */
    group: "contact",
  },
  {
    /** Key */
    key: "email",
    /** Label */
    label: "Email",
    /** Type */
    type: "email",
    /** Placeholder */
    placeholder: "shop@example.com",
    /** Required */
    required: true,
    /** Validators */
    validators: [{ type: "email", message: "Invalid email format" }],
    /** Show In Table */
    showInTable: true,
    /** Show In Quick Create */
    showInQuickCreate: true,
    /** Show In Wizard */
    showInWizard: true,
    /** Wizard Step */
    wizardStep: 3,
    /** Group */
    group: "contact",
  },
  {
    /** Key */
    key: "phone",
    /** Label */
    label: "Phone",
    /** Type */
    type: "tel",
    /** Placeholder */
    placeholder: "+91 1234567890",
    /** Required */
    required: true,
    /** Validators */
    validators: [{ type: "phone", message: "Invalid phone number" }],
    /** Show In Table */
    showInTable: false,
    /** Show In Quick Create */
    showInQuickCreate: false,
    /** Show In Wizard */
    showInWizard: true,
    /** Wizard Step */
    wizardStep: 3,
    /** Group */
    group: "contact",
  },
  {
    /** Key */
    key: "address",
    /** Label */
    label: "Address",
    /** Type */
    type: "textarea",
    /** Placeholder */
    placeholder: "Street address",
    /** Max Length */
    maxLength: 200,
    /** Show In Table */
    showInTable: false,
    /** Show In Quick Create */
    showInQuickCreate: false,
    /** Show In Wizard */
    showInWizard: true,
    /** Wizard Step */
    wizardStep: 3,
    /** Group */
    group: "contact",
  },
  {
    /** Key */
    key: "isVerified",
    /** Label */
    label: "Verified",
    /** Type */
    type: "checkbox",
    /** Default Value */
    defaultValue: false,
    /** Readonly */
    readonly: true,
    /** Help Text */
    helpText: "Admin only",
    /** Show In Table */
    showInTable: true,
    /** Show In Quick Create */
    showInQuickCreate: false,
    /** Show In Wizard */
    showInWizard: false,
  },
  {
    /** Key */
    key: "featured",
    /** Label */
    label: "Featured",
    /** Type */
    type: "checkbox",
    /** Default Value */
    defaultValue: false,
    /** Show In Table */
    showInTable: false,
    /** Show In Quick Create */
    showInQuickCreate: false,
    /** Show In Wizard */
    showInWizard: true,
    /** Wizard Step */
    wizardStep: 5,
    /** Group */
    group: "settings",
  },
  {
    /** Key */
    key: "showOnHomepage",
    /** Label */
    label: "Show on Homepage",
    /** Type */
    type: "checkbox",
    /** Default Value */
    defaultValue: false,
    /** Show In Table */
    showInTable: false,
    /** Show In Quick Create */
    showInQuickCreate: false,
    /** Show In Wizard */
    showInWizard: true,
    /** Wizard Step */
    wizardStep: 5,
    /** Group */
    group: "settings",
  },
  {
    /** Key */
    key: "isBanned",
    /** Label */
    label: "Banned",
    /** Type */
    type: "checkbox",
    /** Default Value */
    defaultValue: false,
    /** Readonly */
    readonly: true,
    /** Help Text */
    helpText: "Admin only",
    /** Show In Table */
    showInTable: true,
    /** Show In Quick Create */
    showInQuickCreate: false,
    /** Show In Wizard */
    showInWizard: false,
  },
];

// ==================== USER FIELDS ====================

/**
 * User Fields
 * @constant
 */
export const USER_FIELDS: FormField[] = [
  {
    /** Key */
    key: "name",
    /** Label */
    label: "Full Name",
    /** Type */
    type: "text",
    /** Placeholder */
    placeholder: "John Doe",
    /** Required */
    required: true,
    /** Min Length */
    minLength: 2,
    /** Max Length */
    maxLength: 100,
    /** Show In Table */
    showInTable: true,
    /** Show In Quick Create */
    showInQuickCreate: true,
  },
  {
    /** Key */
    key: "email",
    /** Label */
    label: "Email",
    /** Type */
    type: "email",
    /** Placeholder */
    placeholder: "user@example.com",
    /** Required */
    required: true,
    /** Validators */
    validators: [{ type: "email", message: "Invalid email format" }],
    /** Show In Table */
    showInTable: true,
    /** Show In Quick Create */
    showInQuickCreate: true,
  },
  {
    /** Key */
    key: "phone",
    /** Label */
    label: "Phone",
    /** Type */
    type: "tel",
    /** Placeholder */
    placeholder: "+91 1234567890",
    /** Validators */
    validators: [{ type: "phone", message: "Invalid phone number" }],
    /** Show In Table */
    showInTable: true,
    /** Show In Quick Create */
    showInQuickCreate: false,
  },
  {
    /** Key */
    key: "role",
    /** Label */
    label: "Role",
    /** Type */
    type: "select",
    /** Required */
    required: true,
    /** Default Value */
    defaultValue: "user",
    /** Options */
    options: [
      { value: "user", label: "User" },
      { value: "seller", label: "Seller" },
      { value: "admin", label: "Admin" },
    ],
    /** Show In Table */
    showInTable: true,
    /** Show In Quick Create */
    showInQuickCreate: true,
  },
  {
    /** Key */
    key: "isBanned",
    /** Label */
    label: "Banned",
    /** Type */
    type: "checkbox",
    /** Default Value */
    defaultValue: false,
    /** Show In Table */
    showInTable: true,
    /** Show In Quick Create */
    showInQuickCreate: false,
  },
];

// ==================== COUPON FIELDS ====================

/**
 * Coupon Fields
 * @constant
 */
export const COUPON_FIELDS: FormField[] = [
  {
    /** Key */
    key: "code",
    /** Label */
    label: "Coupon Code",
    /** Type */
    type: "text",
    /** Placeholder */
    placeholder: "SAVE20",
    /** Required */
    required: true,
    /** Min Length */
    minLength: 3,
    /** Max Length */
    maxLength: 50,
    /** Pattern */
    pattern: "^[A-Z0-9-]+$",
    /** Help Text */
    helpText: "Uppercase letters, numbers, and hyphens only",
    /** Show In Table */
    showInTable: true,
    /** Show In Quick Create */
    showInQuickCreate: true,
  },
  {
    /** Key */
    key: "discountType",
    /** Label */
    label: "Discount Type",
    /** Type */
    type: "select",
    /** Required */
    required: true,
    /** Options */
    options: [
      { value: "percentage", label: "Percentage" },
      { value: "fixed", label: "Fixed Amount" },
    ],
    /** Show In Table */
    showInTable: true,
    /** Show In Quick Create */
    showInQuickCreate: true,
  },
  {
    /** Key */
    key: "discountValue",
    /** Label */
    label: "Discount Value",
    /** Type */
    type: "number",
    /** Placeholder */
    placeholder: "0",
    /** Required */
    required: true,
    /** Min */
    min: 0,
    /** Help Text */
    helpText: "Percentage (1-100) or fixed amount",
    /** Show In Table */
    showInTable: true,
    /** Show In Quick Create */
    showInQuickCreate: true,
  },
  {
    /** Key */
    key: "minPurchase",
    /** Label */
    label: "Min Purchase (₹)",
    /** Type */
    type: "number",
    /** Placeholder */
    placeholder: "0",
    /** Min */
    min: 0,
    /** Help Text */
    helpText: "Minimum cart value to apply coupon",
    /** Show In Table */
    showInTable: false,
    /** Show In Quick Create */
    showInQuickCreate: false,
  },
  {
    /** Key */
    key: "maxDiscount",
    /** Label */
    label: "Max Discount (₹)",
    /** Type */
    type: "number",
    /** Placeholder */
    placeholder: "0",
    /** Min */
    min: 0,
    /** Help Text */
    helpText: "Maximum discount amount (for percentage coupons)",
    /** Show In Table */
    showInTable: false,
    /** Show In Quick Create */
    showInQuickCreate: false,
  },
  {
    /** Key */
    key: "usageLimit",
    /** Label */
    label: "Usage Limit",
    /** Type */
    type: "number",
    /** Placeholder */
    placeholder: "0",
    /** Min */
    min: 0,
    /** Help Text */
    helpText: "0 = unlimited",
    /** Show In Table */
    showInTable: true,
    /** Show In Quick Create */
    showInQuickCreate: false,
  },
  {
    /** Key */
    key: "expiresAt",
    /** Label */
    label: "Expires At",
    /** Type */
    type: "datetime-local",
    /** Required */
    required: true,
    /** Show In Table */
    showInTable: true,
    /** Show In Quick Create */
    showInQuickCreate: true,
  },
  {
    /** Key */
    key: "isActive",
    /** Label */
    label: "Active",
    /** Type */
    type: "checkbox",
    /** Default Value */
    defaultValue: true,
    /** Show In Table */
    showInTable: true,
    /** Show In Quick Create */
    showInQuickCreate: true,
  },
];

// ==================== HERO SLIDE FIELDS ====================

/**
 * Hero Slide Fields
 * @constant
 */
export const HERO_SLIDE_FIELDS: FormField[] = [
  {
    /** Key */
    key: "title",
    /** Label */
    label: "Title",
    /** Type */
    type: "text",
    /** Placeholder */
    placeholder: "Main headline",
    /** Required */
    required: true,
    /** Show In Table */
    showInTable: true,
    /** Show In Quick Create */
    showInQuickCreate: true,
    /** Group */
    group: "content",
  },
  {
    /** Key */
    key: "subtitle",
    /** Label */
    label: "Subtitle",
    /** Type */
    type: "text",
    /** Placeholder */
    placeholder: "Secondary text",
    /** Show In Table */
    showInTable: false,
    /** Show In Quick Create */
    showInQuickCreate: true,
    /** Group */
    group: "content",
  },
  {
    /** Key */
    key: "image_url",
    /** Label */
    label: "Image",
    /** Type */
    type: "image",
    /** Placeholder */
    placeholder: "shop",
    /** Required */
    required: true,
    /** Show In Table */
    showInTable: true,
    /** Show In Quick Create */
    showInQuickCreate: true,
    /** Group */
    group: "media",
  },
  {
    /** Key */
    key: "link_url",
    /** Label */
    label: "Link URL",
    /** Type */
    type: "url",
    placeholder: "/products or https://...",
    /** Show In Table */
    showInTable: false,
    /** Show In Quick Create */
    showInQuickCreate: true,
    /** Validators */
    validators: [
      { type: "url", message: "Must be a valid URL or path (e.g., /products)" },
    ],
    /** Group */
    group: "content",
  },
  {
    /** Key */
    key: "cta_text",
    /** Label */
    label: "CTA Text",
    /** Type */
    type: "text",
    /** Placeholder */
    placeholder: "Shop Now",
    /** Show In Table */
    showInTable: false,
    /** Show In Quick Create */
    showInQuickCreate: true,
    /** Group */
    group: "content",
  },
  {
    /** Key */
    key: "display_order",
    /** Label */
    label: "Display Order",
    /** Type */
    type: "number",
    /** Placeholder */
    placeholder: "0",
    /** Min */
    min: 0,
    /** Default Value */
    defaultValue: 0,
    /** Help Text */
    helpText: "Lower numbers appear first",
    /** Show In Table */
    showInTable: true,
    /** Show In Quick Create */
    showInQuickCreate: false,
    /** Group */
    group: "settings",
  },
  {
    /** Key */
    key: "is_active",
    /** Label */
    label: "Active",
    /** Type */
    type: "checkbox",
    /** Default Value */
    defaultValue: true,
    /** Show In Table */
    showInTable: true,
    /** Show In Quick Create */
    showInQuickCreate: true,
    /** Group */
    group: "settings",
  },
  {
    /** Key */
    key: "show_in_carousel",
    /** Label */
    label: "Show in Carousel",
    /** Type */
    type: "checkbox",
    /** Default Value */
    defaultValue: true,
    /** Show In Table */
    showInTable: true,
    /** Show In Quick Create */
    showInQuickCreate: false,
    /** Group */
    group: "settings",
  },
];

// ==================== HELPER FUNCTIONS ====================

/**
 * Get fields for a specific context
 */
/**
 * Retrieves fields for context
 *
 * @param {FormField[]} fields - The fields
 * @param {"table" | "quickCreate" | "wizard"} context - The context
 *
 * @returns {any} The fieldsforcontext result
 *
 * @example
 * getFieldsForContext(fields, context);
 */

/**
 * Retrieves fields for context
 *
 * @returns {any} The fieldsforcontext result
 *
 * @example
 * getFieldsForContext();
 */

export function getFieldsForContext(
  /** Fields */
  fields: FormField[],
  /** Context */
  context: "table" | "quickCreate" | "wizard",
): FormField[] {
  /**
 * Performs key operation
 *
 * @param {any} 0 - The 0
 *
 * @returns {any} The key result
 *
 */
const key = `showIn${
    context.charAt(0).toUpperCase() + context.slice(1)
  }` as keyof FormField;
  return fields.filter((field) => field[key] === true);
}

/**
 * Get fields for a specific wizard step
 */
/**
 * Retrieves fields for wizard step
 *
 * @param {FormField[]} fields - The fields
 * @param {number} step - The step
 *
 * @returns {number} The fieldsforwizardstep result
 *
 * @example
 * getFieldsForWizardStep(fields, 123);
 */

/**
 * Retrieves fields for wizard step
 *
 * @returns {number} The fieldsforwizardstep result
 *
 * @example
 * getFieldsForWizardStep();
 */

export function getFieldsForWizardStep(
  /** Fields */
  fields: FormField[],
  /** Step */
  step: number,
): FormField[] {
  return fields.filter(
    (field) => field.wizardStep === step && field.showInWizard,
  );
}

/**
 * Get fields grouped by group name
 */
/**
 * Retrieves fields by group
 *
 * @param {FormField[]} fields - The fields
 *
 * @returns {any} The fieldsbygroup result
 *
 * @example
 * getFieldsByGroup(fields);
 */

/**
 * Retrieves fields by group
 *
 * @param {FormField[]} /** Fields */
  fields - The /**  fields */
  fields
 *
 * @returns {any} The fieldsbygroup result
 *
 * @example
 * getFieldsByGroup(/** Fields */
  fields);
 */

/**
 * Retrieves fields by group
 *
 * @param {FormField[]} fields - The fields
 *
 * @returns {Record<string, FormField[]>} The getfieldsbygroup result
 *
 * @example
 * getFieldsByGroup([]);
 */
export function getFieldsByGroup(
  /** Fields */
  fields: FormField[],
): Record<string, FormField[]> {
  return fields.reduce(
    (groups, field) => {
      const group = field.group || "default";
      if (!groups[group]) {
        groups[group] = [];
      }
      groups[group].push(field);
      return groups;
    },
    {} as Record<string, FormField[]>,
  );
}

/**
 * Convert FormField to InlineField format (for backward compatibility)
 */
/**
 * Performs to inline field operation
 *
 * @param {FormField} field - The field
 *
 * @returns {any} The toinlinefield result
 *
 * @example
 * toInlineField(field);
 */

/**
 * Performs to inline field operation
 *
 * @param {FormField} field - The field
 *
 * @returns {any} The toinlinefield result
 *
 * @example
 * toInlineField(field);
 */

export function toInlineField(field: FormField): any {
  return {
    /** Key */
    key: field.key,
    /** Label */
    label: field.label,
    /** Type */
    type: field.type,
    /** Placeholder */
    placeholder: field.placeholder,
    /** Required */
    required: field.required,
    /** Disabled */
    disabled: field.disabled,
    /** Readonly */
    readonly: field.readonly,
    /** Min */
    min: field.min,
    /** Max */
    max: field.max,
    /** Min Length */
    minLength: field.minLength,
    /** Max Length */
    maxLength: field.maxLength,
    /** Pattern */
    pattern: field.pattern,
    /** Options */
    options: field.options,
  };
}

/**
 * Convert array of FormFields to InlineFields
 */
/**
 * Performs to inline fields operation
 *
 * @param {FormField[]} fields - The fields
 *
 * @returns {any} The toinlinefields result
 *
 * @example
 * toInlineFields(fields);
 */

/**
 * Performs to inline fields operation
 *
 * @param {FormField[]} fields - The fields
 *
 * @returns {any} The toinlinefields result
 *
 * @example
 * toInlineFields(fields);
 */

export function toInlineFields(fields: FormField[]): any[] {
  return fields.map(toInlineField);
}
