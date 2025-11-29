/**
 * Demo Data Service
 * Generates comprehensive, meaningful demo data for TCG, Beyblades, and Figurines
 * with multi-parent category logic, variants, and complete e-commerce flows
 */

import { apiService } from "./api.service";
import type { OrderFE } from "@/types/frontend/order.types";
import type { ProductCardFE } from "@/types/frontend/product.types";
import type { CategoryCardFE } from "@/types/frontend/category.types";

export interface DemoDataConfig {
  includeCategories?: boolean;
  includeUsers?: boolean;
  includeShop?: boolean;
  includeProducts?: boolean;
  includeAuctions?: boolean;
  includeOrders?: boolean;
  includeBids?: boolean;
  includeAnalytics?: boolean;
}

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

export interface DemoProgress {
  step: string;
  progress: number;
  message: string;
  data?: any;
}

export interface DemoAnalyticsFE {
  orders: OrderFE[];
  shipments: Array<{
    id: string;
    orderId: string;
    trackingNumber: string;
    carrier: string;
    status: string;
    estimatedDelivery: string;
  }>;
  payments: Array<{
    id: string;
    orderId: string;
    amount: number;
    method: string;
    status: string;
    date: string;
  }>;
  payouts: Array<{
    id: string;
    shopId: string;
    amount: number;
    status: string;
    date: string;
  }>;
  pendingPayouts: Array<{
    shopId: string;
    shopName: string;
    amount: number;
    orderCount: number;
  }>;
  userActivity: Array<{
    userId: string;
    userName: string;
    ordersPlaced: number;
    totalSpent: number;
    lastActive: string;
  }>;
  auctionActivity: Array<{
    auctionId: string;
    title: string;
    bidsCount: number;
    currentBid: number;
    status: string;
  }>;
  salesByCategory: Array<{
    categoryId: string;
    categoryName: string;
    productCount: number;
    totalSales: number;
    revenue: number;
  }>;
  revenueOverTime: Array<{
    date: string;
    revenue: number;
    orders: number;
  }>;
}

export interface DemoVisualizationFE {
  categoryTree: CategoryCardFE[];
  productsByCategory: Record<string, ProductCardFE[]>;
  ordersByUser: Record<
    string,
    Array<{
      orderId: string;
      total: number;
      status: string;
      date: string;
    }>
  >;
  auctionCompetition: Array<{
    auctionId: string;
    title: string;
    bidders: number;
    highestBid: number;
  }>;
  paymentMethods: Record<string, number>;
  shippingStatus: Record<string, number>;
}

export interface UserActionSimulation {
  type: "browse" | "add-to-cart" | "purchase" | "bid" | "review";
  productId?: string;
  auctionId?: string;
  data?: Record<string, unknown>;
}

export interface SimulationResultFE {
  success: boolean;
  results: Array<{
    action: string;
    status: "success" | "error";
    message: string;
    data?: Record<string, unknown>;
  }>;
}

class DemoDataService {
  private readonly BASE_PATH = "/admin/demo";

  /**
   * Generate complete demo data ecosystem
   */
  async generateDemoData(
    config: DemoDataConfig = {},
  ): Promise<{ prefix: string; summary: DemoDataSummary }> {
    const response = await apiService.post<{
      prefix: string;
      summary: DemoDataSummary;
    }>(`${this.BASE_PATH}/generate`, config);
    return response;
  }

  /**
   * Get generation progress (for real-time updates)
   */
  async getProgress(sessionId: string): Promise<DemoProgress> {
    const response = await apiService.get<DemoProgress>(
      `${this.BASE_PATH}/progress/${sessionId}`,
    );
    return response;
  }

  /**
   * Get demo data summary and analytics
   */
  async getSummary(sessionId?: string): Promise<DemoDataSummary> {
    const url = sessionId
      ? `${this.BASE_PATH}/summary/${sessionId}`
      : `${this.BASE_PATH}/summary`;
    const response = await apiService.get<DemoDataSummary>(url);
    return response;
  }

  /**
   * Get all demo sessions
   */
  async getDemoSessions(): Promise<DemoDataSummary[]> {
    const response = await apiService.get<{ sessions: DemoDataSummary[] }>(
      `${this.BASE_PATH}/summary`,
    );
    return response.sessions || [];
  }

  /**
   * Get detailed analytics for a demo session
   */
  async getAnalytics(sessionId: string): Promise<DemoAnalyticsFE> {
    const response = await apiService.get<DemoAnalyticsFE>(
      `${this.BASE_PATH}/analytics/${sessionId}`,
    );
    return response;
  }

  /**
   * Get visualization data
   */
  async getVisualization(sessionId: string): Promise<DemoVisualizationFE> {
    const response = await apiService.get<DemoVisualizationFE>(
      `${this.BASE_PATH}/visualization/${sessionId}`,
    );
    return response;
  }

  /**
   * Cleanup demo data by session ID
   */
  async cleanupSession(sessionId: string): Promise<{
    deleted: {
      categories: number;
      users: number;
      shops: number;
      products: number;
      auctions: number;
      bids: number;
      orders: number;
      orderItems: number;
      payments: number;
      shipments: number;
      reviews: number;
    };
  }> {
    const response = await apiService.delete<{
      deleted: {
        categories: number;
        users: number;
        shops: number;
        products: number;
        auctions: number;
        bids: number;
        orders: number;
        orderItems: number;
        payments: number;
        shipments: number;
        reviews: number;
      };
    }>(`${this.BASE_PATH}/cleanup/${sessionId}`);
    return response;
  }

  /**
   * Get statistics for existing demo data
   */
  async getStats(): Promise<{
    exists: boolean;
    summary: DemoDataSummary | null;
  }> {
    const response = await apiService.get<{
      exists: boolean;
      summary: DemoDataSummary | null;
    }>(`${this.BASE_PATH}/stats`);
    return response;
  }

  /**
   * Cleanup all demo data with DEMO_ prefix
   */
  async cleanupAll(): Promise<{
    deleted: number;
    prefix: string;
  }> {
    const response = await apiService.delete<{
      deleted: number;
      prefix: string;
    }>(`${this.BASE_PATH}/cleanup-all`);
    return response;
  }

  /**
   * Simulate user actions (browsing, adding to cart, purchasing)
   */
  async simulateUserActions(
    sessionId: string,
    userId: string,
    actions: UserActionSimulation[],
  ): Promise<SimulationResultFE> {
    const response = await apiService.post<SimulationResultFE>(
      `${this.BASE_PATH}/simulate/${sessionId}/user/${userId}`,
      { actions },
    );
    return response;
  }

  /**
   * Export demo data for analysis
   */
  async exportData(
    sessionId: string,
    format: "json" | "csv" = "json",
  ): Promise<Blob> {
    const response = await fetch(
      `${this.BASE_PATH}/export/${sessionId}?format=${format}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      },
    );
    return await response.blob();
  }

  /**
   * Get demo data for specific entity type
   */
  async getEntityData<T = unknown>(
    sessionId: string,
    entityType:
      | "categories"
      | "users"
      | "shops"
      | "products"
      | "auctions"
      | "orders"
      | "bids",
  ): Promise<T[]> {
    const response = await apiService.get<{ data: T[] }>(
      `${this.BASE_PATH}/${sessionId}/${entityType}`,
    );
    return response.data || [];
  }
}

export const demoDataService = new DemoDataService();
