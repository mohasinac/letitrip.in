"use client";

import { toast } from "react-hot-toast";

export interface AdminStats {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  totalCustomers: number;
  pendingOrders: number;
  lowStockProducts: number;
  revenueChange: number;
  ordersChange: number;
  customersChange: number;
  productsSold: number;
}

export interface AdminAnalytics {
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
    image?: string;
  }[];
  recentOrders: {
    id: string;
    customerName: string;
    amount: number;
    status: string;
    date: string;
    items: number;
  }[];
  customerGrowth: {
    month: string;
    newCustomers: number;
    returningCustomers: number;
  }[];
}

export interface AdminNotification {
  id: string;
  title: string;
  message: string;
  type: "info" | "warning" | "error" | "success";
  isRead: boolean;
  createdAt: string;
  actionUrl?: string;
  priority: "low" | "medium" | "high";
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: "admin" | "seller" | "user";
  status: "active" | "inactive" | "suspended";
  createdAt: string;
  lastLogin?: string;
  orders: number;
  totalSpent: number;
}

export interface AdminProduct {
  id: string;
  name: string;
  sku: string;
  category: string;
  price: number;
  stock: number;
  sold: number;
  status: "active" | "inactive" | "out_of_stock";
  images: string[];
  createdAt: string;
  updatedAt: string;
  seller?: {
    id: string;
    name: string;
  };
}

export interface AdminOrder {
  id: string;
  orderNumber: string;
  customer: {
    id: string;
    name: string;
    email: string;
  };
  items: {
    id: string;
    name: string;
    quantity: number;
    price: number;
  }[];
  total: number;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  paymentStatus: "pending" | "paid" | "failed" | "refunded";
  shippingAddress: string;
  createdAt: string;
  updatedAt: string;
}

export class AdminService {
  private static baseUrl = "/api/admin";

  // Stats and Analytics
  static async getDashboardStats(): Promise<AdminStats> {
    try {
      const response = await fetch(`${this.baseUrl}/dashboard/stats`, {
        credentials: "include",
        cache: "no-store",
      });
      
      if (!response.ok) {
        throw new Error("Failed to fetch dashboard stats");
      }
      
      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      throw error;
    }
  }

  static async getAnalytics(period: "7d" | "30d" | "90d" | "1y" = "30d"): Promise<AdminAnalytics> {
    try {
      const response = await fetch(`${this.baseUrl}/analytics?period=${period}`, {
        credentials: "include",
        cache: "no-store",
      });
      
      if (!response.ok) {
        throw new Error("Failed to fetch analytics");
      }
      
      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error("Error fetching analytics:", error);
      throw error;
    }
  }

  // Users Management
  static async getUsers(filters?: {
    search?: string;
    role?: string;
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<{ users: AdminUser[]; total: number; pages: number }> {
    try {
      const params = new URLSearchParams();
      if (filters?.search) params.append("search", filters.search);
      if (filters?.role) params.append("role", filters.role);
      if (filters?.status) params.append("status", filters.status);
      if (filters?.page) params.append("page", filters.page.toString());
      if (filters?.limit) params.append("limit", filters.limit.toString());

      const response = await fetch(`${this.baseUrl}/users?${params}`, {
        credentials: "include",
      });
      
      if (!response.ok) {
        throw new Error("Failed to fetch users");
      }
      
      const data = await response.json();
      return data.data || { users: [], total: 0, pages: 0 };
    } catch (error) {
      console.error("Error fetching users:", error);
      return { users: [], total: 0, pages: 0 };
    }
  }

  static async updateUserRole(userId: string, role: "admin" | "seller" | "user"): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/users/${userId}/role`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ role }),
      });
      
      if (!response.ok) {
        throw new Error("Failed to update user role");
      }
      
      toast.success("User role updated successfully");
    } catch (error) {
      console.error("Error updating user role:", error);
      toast.error("Failed to update user role");
      throw error;
    }
  }

  static async toggleUserStatus(userId: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/users/${userId}/toggle-status`, {
        method: "PUT",
        credentials: "include",
      });
      
      if (!response.ok) {
        throw new Error("Failed to toggle user status");
      }
      
      toast.success("User status updated successfully");
    } catch (error) {
      console.error("Error toggling user status:", error);
      toast.error("Failed to update user status");
      throw error;
    }
  }

  // Products Management
  static async getProducts(filters?: {
    search?: string;
    category?: string;
    status?: string;
    seller?: string;
    page?: number;
    limit?: number;
    sort?: string;
  }): Promise<{ products: AdminProduct[]; total: number; pages: number }> {
    try {
      const params = new URLSearchParams();
      if (filters?.search) params.append("search", filters.search);
      if (filters?.category) params.append("category", filters.category);
      if (filters?.status) params.append("status", filters.status);
      if (filters?.seller) params.append("seller", filters.seller);
      if (filters?.page) params.append("page", filters.page.toString());
      if (filters?.limit) params.append("limit", filters.limit.toString());
      if (filters?.sort) params.append("sort", filters.sort);

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

  static async updateProductStatus(productId: string, status: "active" | "inactive"): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/products/${productId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status }),
      });
      
      if (!response.ok) {
        throw new Error("Failed to update product status");
      }
      
      toast.success("Product status updated successfully");
    } catch (error) {
      console.error("Error updating product status:", error);
      toast.error("Failed to update product status");
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
  }): Promise<{ orders: AdminOrder[]; total: number; pages: number }> {
    try {
      const params = new URLSearchParams();
      if (filters?.search) params.append("search", filters.search);
      if (filters?.status) params.append("status", filters.status);
      if (filters?.paymentStatus) params.append("paymentStatus", filters.paymentStatus);
      if (filters?.dateFrom) params.append("dateFrom", filters.dateFrom);
      if (filters?.dateTo) params.append("dateTo", filters.dateTo);
      if (filters?.page) params.append("page", filters.page.toString());
      if (filters?.limit) params.append("limit", filters.limit.toString());

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
      const response = await fetch(`/api/admin/orders/${orderId}/status`, {
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

  // Notifications
  static async getNotifications(): Promise<AdminNotification[]> {
    try {
      const response = await fetch(`${this.baseUrl}/notifications`, {
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
}
