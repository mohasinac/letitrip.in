/**
 * Centralized Inline Form Field Configurations
 * 
 * Complete field definitions with validation for all resources
 * Based on documentation in docs/resources/*.md
 */

import { InlineField } from "@/types/inline-edit";

/**
 * Validation Functions
 */

// Email validation
export const validateEmail = (value: string): string | null => {
  if (!value) return "Email is required";
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(value)) return "Invalid email format";
  return null;
};

// URL validation
export const validateUrl = (value: string): string | null => {
  if (!value) return null; // Optional by default
  try {
    new URL(value);
    return null;
  } catch {
    return "Invalid URL format";
  }
};

// Phone validation (Indian format)
export const validatePhone = (value: string): string | null => {
  if (!value) return null; // Optional by default
  const phoneRegex = /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/;
  if (!phoneRegex.test(value.replace(/\s/g, ""))) {
    return "Invalid phone number";
  }
  return null;
};

// Price validation
export const validatePrice = (value: number): string | null => {
  if (value === undefined || value === null) return "Price is required";
  if (value < 0) return "Price cannot be negative";
  if (value > 10000000) return "Price seems too high";
  return null;
};

// Stock validation
export const validateStock = (value: number): string | null => {
  if (value === undefined || value === null) return "Stock is required";
  if (value < 0) return "Stock cannot be negative";
  if (!Number.isInteger(value)) return "Stock must be a whole number";
  return null;
};

// SKU validation
export const validateSKU = (value: string): string | null => {
  if (!value) return "SKU is required";
  if (value.length < 3) return "SKU must be at least 3 characters";
  if (!/^[A-Z0-9-_]+$/i.test(value)) return "SKU can only contain letters, numbers, hyphens, and underscores";
  return null;
};

// Slug validation
export const validateSlug = (value: string): string | null => {
  if (!value) return "Slug is required";
  if (!/^[a-z0-9-]+$/.test(value)) return "Slug can only contain lowercase letters, numbers, and hyphens";
  if (value.startsWith("-") || value.endsWith("-")) return "Slug cannot start or end with a hyphen";
  return null;
};

// Postal code validation
export const validatePostalCode = (value: string): string | null => {
  if (!value) return "Postal code is required";
  if (!/^\d{6}$/.test(value)) return "Postal code must be 6 digits";
  return null;
};

// Date validation (future dates)
export const validateFutureDate = (value: string): string | null => {
  if (!value) return "Date is required";
  const date = new Date(value);
  if (isNaN(date.getTime())) return "Invalid date";
  if (date < new Date()) return "Date must be in the future";
  return null;
};

// Bid amount validation
export const validateBidAmount = (value: number, formData?: Record<string, any>): string | null => {
  if (value === undefined || value === null) return "Bid amount is required";
  if (value < 0) return "Bid amount cannot be negative";
  if (formData?.startingBid && value < formData.startingBid) {
    return "Reserve price must be greater than starting bid";
  }
  return null;
};

/**
 * Product Fields - Complete set for inline editing
 */
export const getProductFields = (categories: Array<{ id: string; name: string }>): InlineField[] => [
  {
    key: "images",
    label: "Image",
    type: "image",
    required: false,
    accept: "image/*",
  },
  {
    key: "name",
    label: "Product Name",
    type: "text",
    required: true,
    placeholder: "Enter product name",
    validate: (value) => {
      if (!value || value.trim().length === 0) return "Product name is required";
      if (value.length < 3) return "Product name must be at least 3 characters";
      if (value.length > 200) return "Product name is too long (max 200 characters)";
      return null;
    },
  },
  {
    key: "sku",
    label: "SKU",
    type: "text",
    required: true,
    placeholder: "PROD-001",
    validate: validateSKU,
  },
  {
    key: "brand",
    label: "Brand",
    type: "text",
    required: false,
    placeholder: "Brand name",
  },
  {
    key: "price",
    label: "Price (₹)",
    type: "number",
    required: true,
    min: 0,
    step: 0.01,
    placeholder: "0.00",
    validate: validatePrice,
  },
  {
    key: "salePrice",
    label: "Sale Price (₹)",
    type: "number",
    required: false,
    min: 0,
    step: 0.01,
    placeholder: "Optional",
    validate: (value, formData) => {
      if (value && formData?.price && value >= formData.price) {
        return "Sale price must be less than regular price";
      }
      return null;
    },
  },
  {
    key: "stockCount",
    label: "Stock Quantity",
    type: "number",
    required: true,
    min: 0,
    placeholder: "0",
    validate: validateStock,
  },
  {
    key: "lowStockThreshold",
    label: "Low Stock Alert",
    type: "number",
    required: false,
    min: 0,
    placeholder: "5",
  },
  {
    key: "categoryId",
    label: "Category",
    type: "select",
    required: true,
    options: categories.map((cat) => ({ value: cat.id, label: cat.name })),
    validate: (value) => {
      if (!value) return "Please select a category";
      return null;
    },
  },
  {
    key: "description",
    label: "Short Description",
    type: "textarea",
    required: false,
    rows: 3,
    placeholder: "Brief description for quick view",
  },
  {
    key: "weight",
    label: "Weight (kg)",
    type: "number",
    required: false,
    min: 0,
    step: 0.01,
    placeholder: "0.00",
  },
  {
    key: "status",
    label: "Status",
    type: "select",
    required: true,
    options: [
      { value: "draft", label: "Draft" },
      { value: "published", label: "Published" },
      { value: "archived", label: "Archived" },
    ],
    validate: (value) => {
      if (!value) return "Please select a status";
      return null;
    },
  },
  {
    key: "isFeatured",
    label: "Featured",
    type: "checkbox",
    required: false,
  },
];

/**
 * Auction Fields - Complete set for inline editing
 */
export const getAuctionFields = (categories?: Array<{ id: string; name: string }>): InlineField[] => [
  {
    key: "images",
    label: "Image",
    type: "image",
    required: false,
    accept: "image/*",
  },
  {
    key: "name",
    label: "Auction Title",
    type: "text",
    required: true,
    placeholder: "Enter auction title",
    validate: (value) => {
      if (!value || value.trim().length === 0) return "Auction title is required";
      if (value.length < 5) return "Title must be at least 5 characters";
      if (value.length > 200) return "Title is too long (max 200 characters)";
      return null;
    },
  },
  {
    key: "startingBid",
    label: "Starting Bid (₹)",
    type: "number",
    required: true,
    min: 1,
    step: 1,
    placeholder: "100",
    validate: (value) => {
      if (!value || value < 1) return "Starting bid must be at least ₹1";
      if (value > 10000000) return "Starting bid seems too high";
      return null;
    },
  },
  {
    key: "reservePrice",
    label: "Reserve Price (₹)",
    type: "number",
    required: false,
    min: 0,
    step: 1,
    placeholder: "Optional minimum",
    validate: validateBidAmount,
  },
  {
    key: "bidIncrement",
    label: "Bid Increment (₹)",
    type: "number",
    required: false,
    min: 1,
    step: 1,
    placeholder: "10",
    validate: (value) => {
      if (value && value < 1) return "Bid increment must be at least ₹1";
      return null;
    },
  },
  {
    key: "buyNowPrice",
    label: "Buy Now Price (₹)",
    type: "number",
    required: false,
    min: 0,
    step: 1,
    placeholder: "Optional instant buy",
    validate: (value, formData) => {
      if (value && formData?.startingBid && value <= formData.startingBid) {
        return "Buy now price must be greater than starting bid";
      }
      return null;
    },
  },
  {
    key: "startTime",
    label: "Start Time",
    type: "date",
    required: true,
    validate: validateFutureDate,
  },
  {
    key: "endTime",
    label: "End Time",
    type: "date",
    required: true,
    validate: (value, formData) => {
      if (!value) return "End time is required";
      const endDate = new Date(value);
      if (isNaN(endDate.getTime())) return "Invalid date";
      
      if (formData?.startTime) {
        const startDate = new Date(formData.startTime);
        if (endDate <= startDate) return "End time must be after start time";
        
        // Minimum auction duration: 1 hour
        const minDuration = 60 * 60 * 1000;
        if (endDate.getTime() - startDate.getTime() < minDuration) {
          return "Auction must run for at least 1 hour";
        }
      }
      return null;
    },
  },
  ...(categories
    ? [
        {
          key: "categoryId",
          label: "Category",
          type: "select" as const,
          required: true,
          options: categories.map((cat) => ({ value: cat.id, label: cat.name })),
          validate: (value: any) => {
            if (!value) return "Please select a category";
            return null;
          },
        },
      ]
    : []),
  {
    key: "status",
    label: "Status",
    type: "select",
    required: true,
    options: [
      { value: "draft", label: "Draft" },
      { value: "scheduled", label: "Scheduled" },
      { value: "live", label: "Live" },
      { value: "ended", label: "Ended" },
      { value: "cancelled", label: "Cancelled" },
    ],
    validate: (value) => {
      if (!value) return "Please select a status";
      return null;
    },
  },
];

/**
 * Category Fields - Complete set for inline editing
 */
export const getCategoryFields = (allCategories: Array<{ id: string; name: string }>, editingId?: string): InlineField[] => [
  {
    key: "image",
    label: "Image",
    type: "image",
    required: false,
    accept: "image/*",
  },
  {
    key: "icon",
    label: "Icon URL",
    type: "url",
    required: false,
    placeholder: "https://...",
    validate: validateUrl,
  },
  {
    key: "name",
    label: "Category Name",
    type: "text",
    required: true,
    placeholder: "Enter category name",
    validate: (value) => {
      if (!value || value.trim().length === 0) return "Category name is required";
      if (value.length < 2) return "Name must be at least 2 characters";
      if (value.length > 100) return "Name is too long (max 100 characters)";
      return null;
    },
  },
  {
    key: "slug",
    label: "Slug",
    type: "text",
    required: true,
    placeholder: "category-slug",
    validate: validateSlug,
  },
  {
    key: "parent_id",
    label: "Parent Category",
    type: "select",
    required: false,
    options: [
      { value: "", label: "None (Root Category)" },
      ...allCategories
        .filter((c) => c.id !== editingId) // Prevent self-parent
        .map((c) => ({ value: c.id, label: c.name })),
    ],
  },
  {
    key: "description",
    label: "Description",
    type: "textarea",
    required: false,
    rows: 3,
    placeholder: "Category description",
  },
  {
    key: "displayOrder",
    label: "Display Order",
    type: "number",
    required: false,
    min: 0,
    placeholder: "0",
  },
  {
    key: "is_featured",
    label: "Featured",
    type: "checkbox",
    required: false,
  },
  {
    key: "show_on_homepage",
    label: "Show on Homepage",
    type: "checkbox",
    required: false,
  },
  {
    key: "is_active",
    label: "Active",
    type: "checkbox",
    required: false,
  },
];

/**
 * Shop Fields - Complete set for inline editing
 */
export const getShopFields = (): InlineField[] => [
  {
    key: "logo",
    label: "Logo",
    type: "image",
    required: false,
    accept: "image/*",
  },
  {
    key: "name",
    label: "Shop Name",
    type: "text",
    required: true,
    placeholder: "Enter shop name",
    validate: (value) => {
      if (!value || value.trim().length === 0) return "Shop name is required";
      if (value.length < 3) return "Name must be at least 3 characters";
      if (value.length > 100) return "Name is too long (max 100 characters)";
      return null;
    },
  },
  {
    key: "slug",
    label: "Slug",
    type: "text",
    required: true,
    placeholder: "shop-slug",
    validate: validateSlug,
  },
  {
    key: "description",
    label: "Description",
    type: "textarea",
    required: false,
    rows: 3,
    placeholder: "Shop description",
  },
  {
    key: "email",
    label: "Email",
    type: "email",
    required: true,
    placeholder: "shop@example.com",
    validate: validateEmail,
  },
  {
    key: "phone",
    label: "Phone",
    type: "text",
    required: true,
    placeholder: "+91 98765 43210",
    validate: (value) => {
      if (!value) return "Phone is required";
      return validatePhone(value);
    },
  },
  {
    key: "location",
    label: "Location",
    type: "text",
    required: true,
    placeholder: "City, State",
    validate: (value) => {
      if (!value || value.trim().length === 0) return "Location is required";
      return null;
    },
  },
  {
    key: "website",
    label: "Website",
    type: "url",
    required: false,
    placeholder: "https://...",
    validate: validateUrl,
  },
  {
    key: "gst",
    label: "GST Number",
    type: "text",
    required: false,
    placeholder: "22AAAAA0000A1Z5",
    validate: (value) => {
      if (!value) return null;
      if (!/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(value)) {
        return "Invalid GST number format";
      }
      return null;
    },
  },
  {
    key: "isVerified",
    label: "Verified",
    type: "checkbox",
    required: false,
  },
  {
    key: "isFeatured",
    label: "Featured",
    type: "checkbox",
    required: false,
  },
  {
    key: "showOnHomepage",
    label: "Show on Homepage",
    type: "checkbox",
    required: false,
  },
];

/**
 * User Fields - For admin user management
 */
export const getUserFields = (): InlineField[] => [
  {
    key: "name",
    label: "Name",
    type: "text",
    required: true,
    placeholder: "Full name",
    validate: (value) => {
      if (!value || value.trim().length === 0) return "Name is required";
      if (value.length < 2) return "Name must be at least 2 characters";
      return null;
    },
  },
  {
    key: "email",
    label: "Email",
    type: "email",
    required: true,
    placeholder: "user@example.com",
    validate: validateEmail,
  },
  {
    key: "phone",
    label: "Phone",
    type: "text",
    required: false,
    placeholder: "+91 98765 43210",
    validate: validatePhone,
  },
  {
    key: "role",
    label: "Role",
    type: "select",
    required: true,
    options: [
      { value: "user", label: "User" },
      { value: "seller", label: "Seller" },
      { value: "admin", label: "Admin" },
    ],
    validate: (value) => {
      if (!value) return "Please select a role";
      return null;
    },
  },
  {
    key: "is_banned",
    label: "Banned",
    type: "checkbox",
    required: false,
  },
  {
    key: "emailVerified",
    label: "Email Verified",
    type: "checkbox",
    required: false,
  },
];

/**
 * Coupon Fields
 */
export const getCouponFields = (): InlineField[] => [
  {
    key: "code",
    label: "Coupon Code",
    type: "text",
    required: true,
    placeholder: "SAVE20",
    validate: (value) => {
      if (!value || value.trim().length === 0) return "Coupon code is required";
      if (!/^[A-Z0-9]+$/.test(value)) return "Code must be uppercase letters and numbers only";
      if (value.length < 3) return "Code must be at least 3 characters";
      if (value.length > 20) return "Code is too long (max 20 characters)";
      return null;
    },
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
    validate: (value) => {
      if (!value) return "Please select discount type";
      return null;
    },
  },
  {
    key: "discountValue",
    label: "Discount Value",
    type: "number",
    required: true,
    min: 0,
    step: 0.01,
    validate: (value, formData) => {
      if (!value || value <= 0) return "Discount value must be greater than 0";
      if (formData?.discountType === "percentage" && value > 100) {
        return "Percentage cannot exceed 100%";
      }
      return null;
    },
  },
  {
    key: "minOrderValue",
    label: "Min Order Value (₹)",
    type: "number",
    required: false,
    min: 0,
    placeholder: "0",
  },
  {
    key: "maxDiscount",
    label: "Max Discount (₹)",
    type: "number",
    required: false,
    min: 0,
    placeholder: "Optional cap",
  },
  {
    key: "usageLimit",
    label: "Usage Limit",
    type: "number",
    required: false,
    min: 1,
    placeholder: "Unlimited",
  },
  {
    key: "expiryDate",
    label: "Expiry Date",
    type: "date",
    required: true,
    validate: validateFutureDate,
  },
  {
    key: "isActive",
    label: "Active",
    type: "checkbox",
    required: false,
  },
];

/**
 * Address Fields
 */
export const getAddressFields = (): InlineField[] => [
  {
    key: "name",
    label: "Full Name",
    type: "text",
    required: true,
    placeholder: "John Doe",
    validate: (value) => {
      if (!value || value.trim().length === 0) return "Name is required";
      return null;
    },
  },
  {
    key: "phone",
    label: "Phone Number",
    type: "text",
    required: true,
    placeholder: "+91 98765 43210",
    validate: (value) => {
      if (!value) return "Phone is required";
      return validatePhone(value);
    },
  },
  {
    key: "addressLine1",
    label: "Address Line 1",
    type: "text",
    required: true,
    placeholder: "House/Flat No., Street",
    validate: (value) => {
      if (!value || value.trim().length === 0) return "Address is required";
      return null;
    },
  },
  {
    key: "addressLine2",
    label: "Address Line 2",
    type: "text",
    required: false,
    placeholder: "Landmark, Area",
  },
  {
    key: "city",
    label: "City",
    type: "text",
    required: true,
    placeholder: "Mumbai",
    validate: (value) => {
      if (!value || value.trim().length === 0) return "City is required";
      return null;
    },
  },
  {
    key: "state",
    label: "State",
    type: "text",
    required: true,
    placeholder: "Maharashtra",
    validate: (value) => {
      if (!value || value.trim().length === 0) return "State is required";
      return null;
    },
  },
  {
    key: "postalCode",
    label: "Postal Code",
    type: "text",
    required: true,
    placeholder: "400001",
    validate: validatePostalCode,
  },
  {
    key: "country",
    label: "Country",
    type: "text",
    required: true,
    placeholder: "India",
    validate: (value) => {
      if (!value || value.trim().length === 0) return "Country is required";
      return null;
    },
  },
  {
    key: "isDefault",
    label: "Set as Default",
    type: "checkbox",
    required: false,
  },
];
