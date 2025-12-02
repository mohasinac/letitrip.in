export interface ShopFormData {
  name: string;
  slug: string;
  description: string;
  category: string;
  logoUrl: string;
  bannerUrl: string;
  themeColor: string;
  contactEmail?: string;
  contactPhone?: string;
  addressLine1?: string;
  city?: string;
  state?: string;
  pincode?: string;
  bankName?: string;
  accountHolderName?: string;
  accountNumber?: string;
  ifsc?: string;
}

export type OnChange = (field: keyof ShopFormData, value: string) => void;
