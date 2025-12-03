// Auction wizard step component types

export interface AuctionFormData {
  // Basic Info (Step 1 Required)
  title: string;
  slug: string;
  category: string;
  auctionType: string;
  description: string;
  condition: string;
  images: string[];
  videos: string[];

  // Bidding Rules (Step 2 Optional)
  startingBid: string;
  reservePrice: string;
  bidIncrement: string;
  buyNowPrice: string;

  // Schedule (Step 2 Optional)
  startTime: Date;
  endTime: Date;
  autoExtendMinutes: string;

  // Shipping & Terms (Step 2 Optional)
  shippingTerms: string;
  returnPolicy: string;
  status: string;
  featured: boolean;
}

export interface StepProps {
  formData: AuctionFormData;
  setFormData: React.Dispatch<React.SetStateAction<AuctionFormData>>;
}

export interface RequiredStepProps extends StepProps {
  categories: Array<{ id: string; name: string; slug: string }>;
  auctionTypes: Array<{ value: string; label: string; description: string }>;
  slugError: string;
  setSlugError: (error: string) => void;
  isValidatingSlug: boolean;
  validateSlug: (slug: string) => void;
  uploadingImages: boolean;
  setUploadingImages: (uploading: boolean) => void;
  uploadProgress: Record<string, number>;
  setUploadProgress: React.Dispatch<
    React.SetStateAction<Record<string, number>>
  >;
}

export interface OptionalStepProps extends StepProps {
  expandedSections: Record<string, boolean>;
  toggleSection: (section: string) => void;
}
