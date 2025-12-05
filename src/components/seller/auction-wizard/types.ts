/**
 * @fileoverview Type Definitions
 * @module src/components/seller/auction-wizard/types
 * @description This file contains TypeScript type definitions for types
 * 
 * @created 2025-12-05
 * @author mohasinac
 * @see {@link https://mohasin.chinnapattan.com}
 */

// Auction wizard step component types

/**
 * AuctionFormData interface
 * 
 * @interface
 * @description Defines the structure and contract for AuctionFormData
 */
export interface AuctionFormData {
  // Basic Info (Step 1 Required)
  /** Title */
  title: string;
  /** Slug */
  slug: string;
  /** Shop Id */
  shopId: string;
  /** Category */
  category: string;
  /** Auction Type */
  auctionType: string;
  /** Description */
  description: string;
  /** Condition */
  condition: string;
  /** Images */
  images: string[];
  /** Videos */
  videos: string[];

  // Bidding Rules (Step 2 Optional)
  /** Starting Bid */
  startingBid: string;
  /** Reserve Price */
  reservePrice: string;
  /** Bid Increment */
  bidIncrement: string;
  /** Buy Now Price */
  buyNowPrice: string;

  // Schedule (Step 2 Optional)
  /** Start Time */
  startTime: Date;
  /** End Time */
  endTime: Date;
  /** Auto Extend Minutes */
  autoExtendMinutes: string;

  // Shipping & Terms (Step 2 Optional)
  /** Pickup Address Id */
  pickupAddressId?: string;
  /** Shipping Terms */
  shippingTerms: string;
  /** Return Policy */
  returnPolicy: string;
  /** Status */
  status: string;
  /** Featured */
  featured: boolean;
}

/**
 * StepProps interface
 * 
 * @interface
 * @description Defines the structure and contract for StepProps
 */
export interface StepProps {
  /** Form Data */
  formData: AuctionFormData;
  /** Set Form Data */
  setFormData: React.Dispatch<React.SetStateAction<AuctionFormData>>;
}

/**
 * RequiredStepProps interface
 * 
 * @interface
 * @description Defines the structure and contract for RequiredStepProps
 */
export interface RequiredStepProps extends StepProps {
  /** Categories */
  categories: Array<{ id: string; name: string; slug: string }>;
  /** Auction Types */
  auctionTypes: Array<{ value: string; label: string; description: string }>;
  /** Slug Error */
  slugError: string;
  /** Set Slug Error */
  setSlugError: (error: string) => void;
  /** Is Validating Slug */
  isValidatingSlug: boolean;
  /** Validate Slug */
  validateSlug: (slug: string) => void;
  /** Uploading Images */
  uploadingImages: boolean;
  /** Set Uploading Images */
  setUploadingImages: (uploading: boolean) => void;
  /** Upload Progress */
  uploadProgress: Record<string, number>;
  /** Set Upload Progress */
  setUploadProgress: React.Dispatch<
    React.SetStateAction<Record<string, number>>
  >;
}

/**
 * OptionalStepProps interface
 * 
 * @interface
 * @description Defines the structure and contract for OptionalStepProps
 */
export interface OptionalStepProps extends StepProps {
  /** Expanded Sections */
  expandedSections: Record<string, boolean>;
  /** Toggle Section */
  toggleSection: (section: string) => void;
}
