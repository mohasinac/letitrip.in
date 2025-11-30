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

export type DemoStep = 
  | "categories"
  | "users"
  | "shops"
  | "products"
  | "auctions"
  | "bids"
  | "reviews"
  | "orders"
  | "extras";

// Cleanup steps are in reverse order (to handle dependencies)
export const CLEANUP_STEPS: DemoStep[] = [
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
];

export interface DemoDataSummary {
  categories: number;
  users: number;
  shops: number;
  products: number;
  auctions: number;
  bids: number;
  orders: number;
  payments: number;
  shipments: number;
  reviews?: number;
  prefix: string;
  createdAt: string;
}

export interface StepResult {
  success: boolean;
  step: DemoStep;
  data?: any;
  error?: string;
}

export interface GenerationState {
  categoryMap?: Record<string, string>;
  sellers?: Array<{ id: string; name: string }>;
  buyers?: Array<{ id: string; name: string }>;
  users?: Array<{ id: string; name: string; role: string }>;
  shops?: Array<{ id: string; ownerId: string; name: string; slug: string }>;
  products?: string[];
  productsByShop?: Record<string, string[]>;
  auctions?: string[];
  credentials?: any;
}

class DemoDataService {
  private readonly ROUTES = ADMIN_ROUTES.DEMO;

  /**
   * Step-by-step generation methods
   */

  async generateCategories(): Promise<StepResult> {
    return apiService.post<StepResult>(this.ROUTES.GENERATE_STEP("categories"));
  }

  async generateUsers(): Promise<StepResult> {
    return apiService.post<StepResult>(this.ROUTES.GENERATE_STEP("users"));
  }

  async generateShops(sellers: Array<{ id: string; name: string }>): Promise<StepResult> {
    return apiService.post<StepResult>(this.ROUTES.GENERATE_STEP("shops"), { sellers });
  }

  async generateProducts(
    shops: Array<{ id: string; ownerId: string; name: string; slug: string }>,
    categoryMap: Record<string, string>
  ): Promise<StepResult> {
    return apiService.post<StepResult>(this.ROUTES.GENERATE_STEP("products"), { shops, categoryMap });
  }

  async generateAuctions(
    shops: Array<{ id: string; ownerId: string; name: string; slug: string }>,
    productsByShop: Record<string, string[]>
  ): Promise<StepResult> {
    return apiService.post<StepResult>(this.ROUTES.GENERATE_STEP("auctions"), { shops, productsByShop });
  }

  async generateBids(
    auctions: string[],
    buyers: Array<{ id: string; name: string }>
  ): Promise<StepResult> {
    return apiService.post<StepResult>(this.ROUTES.GENERATE_STEP("bids"), { auctions, buyers });
  }

  async generateReviews(
    products: string[],
    buyers: Array<{ id: string; name: string }>
  ): Promise<StepResult> {
    return apiService.post<StepResult>(this.ROUTES.GENERATE_STEP("reviews"), { products, buyers });
  }

  async generateOrders(
    shops: Array<{ id: string; ownerId: string; name: string; slug: string }>,
    buyers: Array<{ id: string; name: string }>,
    productsByShop: Record<string, string[]>
  ): Promise<StepResult> {
    return apiService.post<StepResult>(this.ROUTES.GENERATE_STEP("orders"), { shops, buyers, productsByShop });
  }

  async generateExtras(params: {
    shops?: Array<{ id: string; ownerId: string; name: string; slug: string }>;
    buyers?: Array<{ id: string; name: string }>;
    users?: Array<{ id: string; name: string; role: string }>;
    products?: string[];
  }): Promise<StepResult> {
    return apiService.post<StepResult>(this.ROUTES.GENERATE_STEP("extras"), params);
  }

  /**
   * Get statistics for existing demo data (counts all DEMO_ prefixed data)
   */
  async getStats(): Promise<{
    exists: boolean;
    summary: DemoDataSummary | null;
  }> {
    return apiService.get<{
      exists: boolean;
      summary: DemoDataSummary | null;
    }>(this.ROUTES.STATS);
  }

  /**
   * Cleanup all demo data with DEMO_ prefix
   */
  async cleanupAll(): Promise<{
    deleted: number;
    prefix: string;
    breakdown?: Array<{ collection: string; count: number }>;
  }> {
    return apiService.delete<{
      deleted: number;
      prefix: string;
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
