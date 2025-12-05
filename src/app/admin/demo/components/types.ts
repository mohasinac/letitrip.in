/**
 * @fileoverview Type Definitions
 * @module src/app/admin/demo/components/types
 * @description This file contains TypeScript type definitions for types
 * 
 * @created 2025-12-05
 * @author Development Team
 */

import { DemoStep, DemoDataSummary } from "@/services/demo-data.service";

/**
 * DeletionBreakdown interface
 * 
 * @interface
 * @description Defines the structure and contract for DeletionBreakdown
 */
export interface DeletionBreakdown {
  /** Collection */
  collection: string;
  /** Count */
  count: number;
}

/**
 * UserCredential interface
 * 
 * @interface
 * @description Defines the structure and contract for UserCredential
 */
export interface UserCredential {
  /** Email */
  email: string;
  /** Password */
  password: string;
  /** Name */
  name: string;
}

/**
 * CredentialsData interface
 * 
 * @interface
 * @description Defines the structure and contract for CredentialsData
 */
export interface CredentialsData {
  /** Admins */
  admins: UserCredential[];
  /** Moderators */
  moderators: UserCredential[];
  /** Support */
  support: UserCredential[];
  /** Sellers */
  sellers: UserCredential[];
  /** Buyers */
  buyers: UserCredential[];
}

/**
 * StepStatus interface
 * 
 * @interface
 * @description Defines the structure and contract for StepStatus
 */
export interface StepStatus {
  /** Status */
  status: "pending" | "running" | "completed" | "error";
  /** Count */
  count?: number;
  /** Error */
  error?: string;
}

/**
 * ExtendedSummary interface
 * 
 * @interface
 * @description Defines the structure and contract for ExtendedSummary
 */
export interface ExtendedSummary extends DemoDataSummary {
  /** Carts */
  carts?: number;
  /** Cart Items */
  cartItems?: number;
  /** Favorites */
  favorites?: number;
  /** Conversations */
  conversations?: number;
  /** Messages */
  messages?: number;
  /** Media */
  media?: number;
  /** Blog Posts */
  blogPosts?: number;
  /** Blog Categories */
  blogCategories?: number;
  /** Blog Tags */
  blogTags?: number;
  /** Hero Slides */
  heroSlides?: number;
  /** Returns */
  returns?: number;
  /** Tickets */
  tickets?: number;
  /** Payouts */
  payouts?: number;
  /** Addresses */
  addresses?: number;
  /** Settings */
  settings?: number;
  /** Feature Flags */
  featureFlags?: number;
  /** Notifications */
  notifications?: number;
  /** Featured Categories */
  featuredCategories?: number;
  /** Products Per Shop */
  productsPerShop?: number;
  /** Auctions Per Shop */
  auctionsPerShop?: number;
  /** Featured Auctions */
  featuredAuctions?: number;
  /** Users By Role */
  usersByRole?: {
    /** Admins */
    admins: number;
    /** Moderators */
    moderators: number;
    /** Support */
    support: number;
    /** Sellers */
    sellers: number;
    /** Buyers */
    buyers: number;
  };
}

/**
 * DemoStepConfig type
 * 
 * @typedef {Object} DemoStepConfig
 * @description Type definition for DemoStepConfig
 */
export type DemoStepConfig = {
  /** Id */
  id: DemoStep;
  /** Label */
  label: string;
  /** Icon */
  icon: React.ComponentType<{ className?: string }>;
  /** Description */
  description: string;
};
