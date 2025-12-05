/**
 * @fileoverview Type Definitions
 * @module src/components/seller/shop-wizard/types
 * @description This file contains TypeScript type definitions for types
 * 
 * @created 2025-12-05
 * @author mohasinac
 * @see {@link https://mohasin.chinnapattan.com}
 */

/**
 * Shop Form Data interface
 * @interface ShopFormData
 */
export interface ShopFormData {
  // BasicInfoStep
  /** Name */
  name: string;
  /** Slug */
  slug: string;
  /** Description */
  description: string;
  /** Category */
  category: string;
  /** Phone */
  phone: string;
  /** Email */
  email: string;
  /** Country Code */
  countryCode: string;

  // BrandingStep
  /** Logo Url */
  logoUrl: string;
  /** Banner Url */
  bannerUrl: string;
  /** Theme Color */
  themeColor: string;
  /** Tagline */
  tagline?: string;
  /** About */
  about?: string;

  // ContactLegalStep
  /** BusinessAddressId */
  businessAddressId?: string; // ID of saved address
  /** Address */
  address?: string; // Fallback formatted address
  /** Gstin */
  gstin?: string;
  /** Pan */
  pan?: string;
  /** Cin */
  cin?: string;
  /** Address Line1 */
  addressLine1?: string;
  /** City */
  city?: string;
  /** State */
  state?: string;
  /** Pincode */
  pincode?: string;

  // BankingStep
  /** Bank Name */
  bankName?: string;
  /** Account Holder Name */
  accountHolderName?: string;
  /** Account Number */
  accountNumber?: string;
  /** Ifsc */
  ifsc?: string;

  // PoliciesStep
  /** Return Policy */
  returnPolicy?: string;
  /** Shipping Policy */
  shippingPolicy?: string;
  /** Tos */
  tos?: string;
  /** Privacy */
  privacy?: string;

  // SettingsStep
  /** Default Shipping Fee */
  defaultShippingFee?: number;
  /** Support Email */
  supportEmail?: string;
  /** Enable C O D */
  enableCOD?: boolean;
  /** Enable Returns */
  enableReturns?: boolean;
  /** Show Contact */
  showContact?: boolean;
}

/**
 * OnChange type
 * 
 * @typedef {Object} OnChange
 * @description Type definition for OnChange
 */
export type OnChange = (
  /** Field */
  field: keyof ShopFormData,
  /** Value */
  value: string | number | boolean | undefined,
) => void;
/**
 * OnShopChange type
 * 
 * @typedef {Object} OnShopChange
 * @description Type definition for OnShopChange
 */
export type OnShopChange = OnChange;
