/**
 * @fileoverview Service Module
 * @module src/services/demo-data.service
 * @description This file contains service functions for demo-data operations
 * 
 * @created 2025-12-05
 * @author Development Team
 */

/**
 * Demo Data Service
 * Generates comprehensive, meaningful demo data for TCG, Beyblades, and Figurines
 * with multi-parent category logic, variants, and complete e-commerce flows.
 *
 * All demo data uses DEMO_ prefix for easy identification and cleanup.
 * Supports step-by-step generation for better control and rollback capability.
 */

import { apiService } from "./api.service";
import { ADMIN_ROUTES } from "@/constants/api-routes";

/**
 * DemoStep type
 * 
 * @typedef {Object} DemoStep
 * @description Type definition for DemoStep
 */
export type DemoStep =
  | "categories"
  | "users"
  | "shops"
  | "products"
  | "auctions"
  | "bids"
  | "reviews"
  | "orders"
  | "extras"
  | "settings";

// Cleanup steps are in reverse order (to handle dependencies)
/**
 * Cleanup Steps
 * @constant
 */
export const CLEANUP_STEPS: DemoStep[] = [
  "settings",
  "extras",
  "orders",
  "reviews",
  "bids",
  "auctions",
  "products",
  "shops",
  "users",
  "categories",
];

/**
 * Generation Steps
 * @constant
 */
export const GENERATION_STEPS: DemoStep[] = [
  "categories",
  "users",
  "shops",
  "products",
  "auctions",
  "bids",
  "reviews",
  "orders",
  "extras",
  "settings",
];

/**
 * DemoDataSummary interface
 * 
 * @interface
 * @description Defines the structure and contract for DemoDataSummary
 */
export interface DemoDataSummary {
  /** Categories */
  categories: number;
  /** Users */
  users: number;
  /** Shops */
  shops: number;
  /** Products */
  products: number;
  /** Auctions */
  auctions: number;
  /** Bids */
  bids: number;
  /** Orders */
  orders: number;
  /** Payments */
  payments: number;
  /** Shipments */
  shipments: number;
  /** Reviews */
  reviews?: number;
  /** Hero Slides */
  heroSlides?: number;
  /** Favorites */
  favorites?: number;
  /** Carts */
  carts?: number;
  /** Notifications */
  notifications?: number;
  /** Settings */
  settings?: number;
  /** Prefix */
  prefix: string;
  /** Created At */
  createdAt: string;
}

/**
 * StepResult interface
 * 
 * @interface
 * @description Defines the structure and contract for StepResult
 */
export interface StepResult {
  /** Success */
  success: boolean;
  /** Step */
  step: DemoStep;
  /** Data */
  data?: any;
  /** Error */
  error?: string;
}

/**
 * GenerationState interface
 * 
 * @interface
 * @description Defines the structure and contract for GenerationState
 */
export interface GenerationState {
  /** Category Map */
  categoryMap?: Record<string, string>;
  /** Sellers */
  sellers?: Array<{ id: string; name: string }>;
  /** Buyers */
  buyers?: Array<{ id: string; name: string }>;
  /** Users */
  users?: Array<{ id: string; name: string; role: string }>;
  /** Shops */
  shops?: Array<{ id: string; ownerId: string; name: string; slug: string }>;
  /** Products */
  products?: string[];
  /** Products By Shop */
  productsByShop?: Record<string, string[]>;
  /** Auctions */
  auctions?: string[];
  /** Credentials */
  credentials?: any;
}

/**
 * DemoDataService class
 * 
 * @class
 * @description Description of DemoDataService class functionality
 */
class DemoDataService {
  private readonly ROUTES = ADMIN_ROUTES.DEMO;

  /**
   * Step-by-step generation methods
   */

  async generateCategories(scale: number = 10): Promise<StepResult> {
    return apiService.post<StepResult>(
      this.ROUTES.GENERATE_STEP("categories"),
      { scale },
    );
  }

  async generateUsers(scale: number = 10): Promise<StepResult> {
    return apiService.post<StepResult>(this.ROUTES.GENERATE_STEP("users"), {
      scale,
    });
  }

  async generateShops(
    /** Sellers */
    sellers: Array<{ id: string; name: string }>,
    /** Scale */
    scale: number = 10,
  ): Promise<StepResult> {
    return apiService.post<StepResult>(this.ROUTES.GENERATE_STEP("shops"), {
      sellers,
      scale,
    });
  }

  async generateProducts(
    /** Shops */
    shops: Array<{ id: string; ownerId: string; name: string; slug: string }>,
    /** Category Map */
    categoryMap: Record<string, string>,
    /** Scale */
    scale: number = 10,
  ): Promise<StepResult> {
    return apiService.post<StepResult>(this.ROUTES.GENERATE_STEP("products"), {
      shops,
      categoryMap,
      scale,
    });
  }

  async generateAuctions(
    /** Shops */
    shops: Array<{ id: string; ownerId: string; name: string; slug: string }>,
    /** Products By Shop */
    productsByShop: Record<string, string[]>,
    /** Scale */
    scale: number = 10,
  ): Promise<StepResult> {
    return apiService.post<StepResult>(this.ROUTES.GENERATE_STEP("auctions"), {
      shops,
      productsByShop,
      scale,
    });
  }

  async generateBids(
    /** Auctions */
    auctions: string[],
    /** Buyers */
    buyers: Array<{ id: string; name: string }>,
    /** Scale */
    scale: number = 10,
  ): Promise<StepResult> {
    return apiService.post<StepResult>(this.ROUTES.GENERATE_STEP("bids"), {
      auctions,
      buyers,
      scale,
    });
  }

  async generateReviews(
    /** Products */
    products: string[],
    /** Buyers */
    buyers: Array<{ id: string; name: string }>,
    /** Scale */
    scale: number = 10,
  ): Promise<StepResult> {
    return apiService.post<StepResult>(this.ROUTES.GENERATE_STEP("reviews"), {
      products,
      buyers,
      scale,
    });
  }

  async generateOrders(
    /** Shops */
    shops: Array<{ id: string; ownerId: string; name: string; slug: string }>,
    /** Buyers */
    buyers: Array<{ id: string; name: string }>,
    /** Products By Shop */
    productsByShop: Record<string, string[]>,
    /** Scale */
    scale: number = 10,
  ): Promise<StepResult> {
    return apiService.post<StepResult>(this.ROUTES.GENERATE_STEP("orders"), {
      shops,
      buyers,
      productsByShop,
      scale,
    });
  }

  async generateExtras(params: {
    /** Shops */
    shops?: Array<{ id: string; ownerId: string; name: string; slug: string }>;
    /** Buyers */
    buyers?: Array<{ id: string; name: string }>;
    /** Users */
    users?: Array<{ id: string; name: string; role: string }>;
    /** Products */
    products?: string[];
    /** Scale */
    scale?: number;
  }): Promise<StepResult> {
    return apiService.post<StepResult>(
      this.ROUTES.GENERATE_STEP("extras"),
      params,
    );
  }

  async generateSettings(scale: number = 10): Promise<StepResult> {
    return apiService.post<StepResult>(this.ROUTES.GENERATE_STEP("settings"), {
      scale,
    });
  }

  /**
   * Get statistics for existing demo data (counts all DEMO_ prefixed data)
   */
  async getStats(): Promise<{
    /** Exists */
    exists: boolean;
    /** Summary */
    summary: DemoDataSummary | null;
  }> {
    return apiService.get<{
      /** Exists */
      exists: boolean;
      /** Summary */
      summary: DemoDataSummary | null;
    }>(this.ROUTES.STATS);
  }

  /**
   * Cleanup all demo data with DEMO_ prefix
   */
  async cleanupAll(): Promise<{
    /** Deleted */
    deleted: number;
    /** Prefix */
    prefix: string;
    /** Breakdown */
    breakdown?: Array<{ collection: string; count: number }>;
  }> {
    return apiService.delete<{
      /** Deleted */
      deleted: number;
      /** Prefix */
      prefix: string;
      /** Breakdown */
      breakdown?: Array<{ collection: string; count: number }>;
    }>(this.ROUTES.CLEANUP_ALL);
  }

  /**
   * Step-by-step cleanup methods
   */
  async cleanupStep(step: DemoStep): Promise<StepResult> {
    return apiService.delete<StepResult>(`/admin/demo/cleanup/${step}`);
  }
}

export const demoDataService = new DemoDataService();
