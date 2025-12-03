export interface ShopFormData {
  // BasicInfoStep
  name: string;
  slug: string;
  description: string;
  category: string;
  phone: string;
  email: string;
  countryCode: string;

  // BrandingStep
  logoUrl: string;
  bannerUrl: string;
  themeColor: string;
  tagline?: string;
  about?: string;

  // ContactLegalStep
  businessAddressId?: string; // ID of saved address
  address?: string; // Fallback formatted address
  gstin?: string;
  pan?: string;
  cin?: string;
  addressLine1?: string;
  city?: string;
  state?: string;
  pincode?: string;

  // BankingStep
  bankName?: string;
  accountHolderName?: string;
  accountNumber?: string;
  ifsc?: string;

  // PoliciesStep
  returnPolicy?: string;
  shippingPolicy?: string;
  tos?: string;
  privacy?: string;

  // SettingsStep
  defaultShippingFee?: number;
  supportEmail?: string;
  enableCOD?: boolean;
  enableReturns?: boolean;
  showContact?: boolean;
}

export type OnChange = (
  field: keyof ShopFormData,
  value: string | number | boolean | undefined
) => void;
export type OnShopChange = OnChange;
