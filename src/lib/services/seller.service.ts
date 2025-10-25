"use client";

import { toast } from "react-hot-toast";

export interface SellerStats {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  activeProducts: number;
  pendingOrders: number;
  completedOrders: number;
  averageRating: number;
  totalReviews: number;
  revenueChange: number;
  ordersChange: number;
  conversionRate: number;
  monthlyGoal: number;
  goalProgress: number;
}

export interface SellerAnalytics {
  salesData: {
    labels: string[];
    datasets: {
      label: string;
      data: number[];
      backgroundColor?: string;
      borderColor?: string;
    }[];
  };
  topProducts: {
    id: string;
    name: string;
    sales: number;
    revenue: number;
    views: number;
    conversionRate: number;
    image?: string;
  }[];
  recentOrders: {
    id: string;
    customerName: string;
    amount: number;
    status: string;
    date: string;
    items: number;
    paymentStatus: string;
  }[];
  productPerformance: {
    productId: string;
    name: string;
    views: number;
    clicks: number;
    sales: number;
    revenue: number;
    rating: number;
  }[];
  customerInsights: {
    newCustomers: number;
    returningCustomers: number;
    topLocations: { city: string; orders: number }[];
    ageGroups: { range: string; percentage: number }[];
  };
}

export interface SellerProduct {
  id: string;
  name: string;
  sku: string;
  category: string;
  price: number;
  comparePrice?: number;
  stock: number;
  sold: number;
  views: number;
  status: "active" | "inactive" | "draft" | "out_of_stock";
  images: string[];
  description: string;
  tags: string[];
  lowStockThreshold: number;
  createdAt: string;
  updatedAt: string;
  rating: number;
  reviewCount: number;
  isPromoted: boolean;
  promotionEndDate?: string;
}

export interface SellerOrder {
  id: string;
  orderNumber: string;
  customer: {
    id: string;
    name: string;
    email: string;
    phone?: string;
  };
  items: {
    id: string;
    productId: string;
    name: string;
    sku: string;
    quantity: number;
    price: number;
    image?: string;
  }[];
  total: number;
  status: "pending" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled" | "returned";
  paymentStatus: "pending" | "paid" | "failed" | "refunded" | "partial";
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  trackingNumber?: string;
  estimatedDelivery?: string;
  createdAt: string;
  updatedAt: string;
  notes?: string;
}

export interface SellerNotification {
  id: string;
  title: string;
  message: string;
  type: "order" | "inventory" | "review" | "promotion" | "system";
  isRead: boolean;
  createdAt: string;
  actionUrl?: string;
  priority: "low" | "medium" | "high";
  metadata?: any;
}

export interface SellerReview {
  id: string;
  productId: string;
  productName: string;
  customerName: string;
  rating: number;
  comment: string;
  images?: string[];
  isVerified: boolean;
  isPublished: boolean;
  createdAt: string;
  response?: {
    message: string;
    createdAt: string;
  };
}

export interface SellerPromotion {
  id: string;
  name: string;
  type: "discount" | "bundle" | "flash_sale" | "buy_one_get_one";
  status: "active" | "inactive" | "scheduled" | "expired";
  discount: {
    type: "percentage" | "fixed";
    value: number;
  };
  products: string[];
  startDate: string;
  endDate: string;
  usageLimit?: number;
  usageCount: number;
  minOrderValue?: number;
  createdAt: string;
}

export class SellerService {
  private static baseUrl = "/api/seller";

  // Stats and Analytics
  static async getDashboardStats(sellerId?: string): Promise<SellerStats> {
    try {
      const params = sellerId ? `?sellerId=${sellerId}` : "";
      const response = await fetch(`${this.baseUrl}/dashboard/stats${params}`, {
        credentials: "include",
        cache: "no-store",
      });
      
      if (!response.ok) {
        throw new Error("Failed to fetch dashboard stats");
      }
      
      const data = await response.json();
      return data.data || { 
        totalRevenue: 0, totalOrders: 0, totalProducts: 0, activeProducts: 0,
        pendingOrders: 0, completedOrders: 0, averageRating: 0, totalReviews: 0,
        revenueChange: 0, ordersChange: 0, conversionRate: 0, monthlyGoal: 0, goalProgress: 0
      };
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      return { 
        totalRevenue: 0, totalOrders: 0, totalProducts: 0, activeProducts: 0,
        pendingOrders: 0, completedOrders: 0, averageRating: 0, totalReviews: 0,
        revenueChange: 0, ordersChange: 0, conversionRate: 0, monthlyGoal: 0, goalProgress: 0
      };
    }
  }

  static async getAnalytics(
    sellerId?: string,
    period: "7d" | "30d" | "90d" | "1y" = "30d"
  ): Promise<SellerAnalytics> {
    try {
      const params = new URLSearchParams();
      if (sellerId) params.append("sellerId", sellerId);
      params.append("period", period);

      const response = await fetch(`${this.baseUrl}/analytics?${params}`, {
        credentials: "include",
        cache: "no-store",
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error("Analytics API Error:", {
          status: response.status,
          statusText: response.statusText,
          error: errorData.error || 'Failed to fetch analytics'
        });
        throw new Error(errorData.error || "Failed to fetch analytics");
      }
      
      const data = await response.json();
      return data.data || { 
        salesData: { labels: [], datasets: [] }, 
        topProducts: [], 
        recentOrders: [], 
        productPerformance: [],
        customerInsights: { newCustomers: 0, returningCustomers: 0, topLocations: [], ageGroups: [] }
      };
    } catch (error) {
      console.error("Error fetching analytics:", error);
      return { 
        salesData: { labels: [], datasets: [] }, 
        topProducts: [], 
        recentOrders: [], 
        productPerformance: [],
        customerInsights: { newCustomers: 0, returningCustomers: 0, topLocations: [], ageGroups: [] }
      };
    }
  }

  // Products Management
  static async getProducts(filters?: {
    search?: string;
    category?: string;
    status?: string;
    tag?: string;
    page?: number;
    limit?: number;
    sort?: string;
    sellerId?: string;
  }): Promise<{ products: SellerProduct[]; total: number; pages: number }> {
    try {
      const params = new URLSearchParams();
      if (filters?.search) params.append("search", filters.search);
      if (filters?.category) params.append("category", filters.category);
      if (filters?.status) params.append("status", filters.status);
      if (filters?.tag) params.append("tag", filters.tag);
      if (filters?.page) params.append("page", filters.page.toString());
      if (filters?.limit) params.append("limit", filters.limit.toString());
      if (filters?.sort) params.append("sort", filters.sort);
      if (filters?.sellerId) params.append("sellerId", filters.sellerId);

      const response = await fetch(`${this.baseUrl}/products?${params}`, {
        credentials: "include",
      });
      
      if (!response.ok) {
        throw new Error("Failed to fetch products");
      }
      
      const data = await response.json();
      return data.data || { products: [], total: 0, pages: 0 };
    } catch (error) {
      console.error("Error fetching products:", error);
      return { products: [], total: 0, pages: 0 };
    }
  }

  static async createProduct(productData: Partial<SellerProduct>): Promise<SellerProduct> {
    try {
      const response = await fetch(`${this.baseUrl}/products`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(productData),
      });
      
      if (!response.ok) {
        throw new Error("Failed to create product");
      }
      
      const data = await response.json();
      toast.success("Product created successfully");
      return data.data;
    } catch (error) {
      console.error("Error creating product:", error);
      toast.error("Failed to create product");
      throw error;
    }
  }

  static async updateProduct(productId: string, productData: Partial<SellerProduct>): Promise<SellerProduct> {
    try {
      const response = await fetch(`${this.baseUrl}/products/${productId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(productData),
      });
      
      if (!response.ok) {
        throw new Error("Failed to update product");
      }
      
      const data = await response.json();
      toast.success("Product updated successfully");
      return data.data;
    } catch (error) {
      console.error("Error updating product:", error);
      toast.error("Failed to update product");
      throw error;
    }
  }

  static async deleteProduct(productId: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/products/${productId}`, {
        method: "DELETE",
        credentials: "include",
      });
      
      if (!response.ok) {
        throw new Error("Failed to delete product");
      }
      
      toast.success("Product deleted successfully");
    } catch (error) {
      console.error("Error deleting product:", error);
      toast.error("Failed to delete product");
      throw error;
    }
  }

  // Orders Management
  static async getOrders(filters?: {
    search?: string;
    status?: string;
    paymentStatus?: string;
    dateFrom?: string;
    dateTo?: string;
    page?: number;
    limit?: number;
    sellerId?: string;
  }): Promise<{ orders: SellerOrder[]; total: number; pages: number }> {
    try {
      const params = new URLSearchParams();
      if (filters?.search) params.append("search", filters.search);
      if (filters?.status) params.append("status", filters.status);
      if (filters?.paymentStatus) params.append("paymentStatus", filters.paymentStatus);
      if (filters?.dateFrom) params.append("dateFrom", filters.dateFrom);
      if (filters?.dateTo) params.append("dateTo", filters.dateTo);
      if (filters?.page) params.append("page", filters.page.toString());
      if (filters?.limit) params.append("limit", filters.limit.toString());
      if (filters?.sellerId) params.append("sellerId", filters.sellerId);

      const response = await fetch(`${this.baseUrl}/orders?${params}`, {
        credentials: "include",
      });
      
      if (!response.ok) {
        throw new Error("Failed to fetch orders");
      }
      
      const data = await response.json();
      return data.data || { orders: [], total: 0, pages: 0 };
    } catch (error) {
      console.error("Error fetching orders:", error);
      return { orders: [], total: 0, pages: 0 };
    }
  }

  static async updateOrderStatus(orderId: string, status: string): Promise<boolean> {
    try {
      const response = await fetch(`/api/seller/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        throw new Error('Failed to update order status');
      }

      return true;
    } catch (error) {
      console.error('Error updating order status:', error);
      throw error;
    }
  }

  // Reviews Management
  static async getReviews(filters?: {
    productId?: string;
    rating?: number;
    isPublished?: boolean;
    page?: number;
    limit?: number;
    sellerId?: string;
  }): Promise<{ reviews: SellerReview[]; total: number; pages: number }> {
    try {
      const params = new URLSearchParams();
      if (filters?.productId) params.append("productId", filters.productId);
      if (filters?.rating) params.append("rating", filters.rating.toString());
      if (filters?.isPublished !== undefined) params.append("isPublished", filters.isPublished.toString());
      if (filters?.page) params.append("page", filters.page.toString());
      if (filters?.limit) params.append("limit", filters.limit.toString());
      if (filters?.sellerId) params.append("sellerId", filters.sellerId);

      const response = await fetch(`${this.baseUrl}/reviews?${params}`, {
        credentials: "include",
      });
      
      if (!response.ok) {
        throw new Error("Failed to fetch reviews");
      }
      
      const data = await response.json();
      return data.data || { reviews: [], total: 0, pages: 0 };
    } catch (error) {
      console.error("Error fetching reviews:", error);
      return { reviews: [], total: 0, pages: 0 };
    }
  }

  static async respondToReview(reviewId: string, response: string): Promise<void> {
    try {
      const apiResponse = await fetch(`${this.baseUrl}/reviews/${reviewId}/respond`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ response }),
      });
      
      if (!apiResponse.ok) {
        throw new Error("Failed to respond to review");
      }
      
      toast.success("Review response added successfully");
    } catch (error) {
      console.error("Error responding to review:", error);
      toast.error("Failed to respond to review");
      throw error;
    }
  }

  // Notifications
  static async getNotifications(sellerId?: string): Promise<SellerNotification[]> {
    try {
      const params = sellerId ? `?sellerId=${sellerId}` : "";
      const response = await fetch(`${this.baseUrl}/notifications${params}`, {
        credentials: "include",
      });
      
      if (!response.ok) {
        throw new Error("Failed to fetch notifications");
      }
      
      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error("Error fetching notifications:", error);
      return [];
    }
  }

  static async markNotificationAsRead(notificationId: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/notifications/${notificationId}/read`, {
        method: "PUT",
        credentials: "include",
      });
      
      if (!response.ok) {
        throw new Error("Failed to mark notification as read");
      }
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  }

  // Promotions
  static async getPromotions(sellerId?: string): Promise<SellerPromotion[]> {
    try {
      const params = sellerId ? `?sellerId=${sellerId}` : "";
      const response = await fetch(`${this.baseUrl}/promotions${params}`, {
        credentials: "include",
      });
      
      if (!response.ok) {
        throw new Error("Failed to fetch promotions");
      }
      
      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error("Error fetching promotions:", error);
      return [];
    }
  }

  static async createPromotion(promotionData: Partial<SellerPromotion>): Promise<SellerPromotion> {
    try {
      const response = await fetch(`${this.baseUrl}/promotions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(promotionData),
      });
      
      if (!response.ok) {
        throw new Error("Failed to create promotion");
      }
      
      const data = await response.json();
      toast.success("Promotion created successfully");
      return data.data;
    } catch (error) {
      console.error("Error creating promotion:", error);
      toast.error("Failed to create promotion");
      throw error;
    }
  }
}
