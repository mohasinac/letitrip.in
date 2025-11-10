import { apiService } from "./api.service";

interface AnalyticsFilters {
  shopId?: string;
  startDate?: string;
  endDate?: string;
  period?: "day" | "week" | "month" | "year";
}

interface AnalyticsOverview {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  totalCustomers: number;
  averageOrderValue: number;
  conversionRate: number;
  revenueGrowth: number;
  ordersGrowth: number;
}

interface SalesData {
  date: string;
  revenue: number;
  orders: number;
  customers: number;
}

interface TopProduct {
  productId: string;
  productName: string;
  sales: number;
  revenue: number;
  views: number;
}

interface CategoryPerformance {
  categoryId: string;
  categoryName: string;
  revenue: number;
  orders: number;
  products: number;
}

class AnalyticsService {
  // Get analytics overview (seller: own, admin: all)
  async getOverview(filters?: AnalyticsFilters): Promise<AnalyticsOverview> {
    const params = new URLSearchParams();

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });
    }

    const queryString = params.toString();
    const endpoint = queryString ? `/analytics?${queryString}` : "/analytics";

    return apiService.get<AnalyticsOverview>(endpoint);
  }

  // Get sales data (time series)
  async getSalesData(filters?: AnalyticsFilters): Promise<SalesData[]> {
    const params = new URLSearchParams();

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });
    }

    const queryString = params.toString();
    const endpoint = queryString
      ? `/analytics/sales?${queryString}`
      : "/analytics/sales";

    return apiService.get<SalesData[]>(endpoint);
  }

  // Get top products
  async getTopProducts(
    filters?: AnalyticsFilters & { limit?: number },
  ): Promise<TopProduct[]> {
    const params = new URLSearchParams();

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });
    }

    const queryString = params.toString();
    const endpoint = queryString
      ? `/analytics/top-products?${queryString}`
      : "/analytics/top-products";

    return apiService.get<TopProduct[]>(endpoint);
  }

  // Get category performance
  async getCategoryPerformance(
    filters?: AnalyticsFilters,
  ): Promise<CategoryPerformance[]> {
    const params = new URLSearchParams();

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });
    }

    const queryString = params.toString();
    const endpoint = queryString
      ? `/analytics/categories?${queryString}`
      : "/analytics/categories";

    return apiService.get<CategoryPerformance[]>(endpoint);
  }

  // Get customer analytics
  async getCustomerAnalytics(filters?: AnalyticsFilters): Promise<any> {
    const params = new URLSearchParams();

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });
    }

    const queryString = params.toString();
    const endpoint = queryString
      ? `/analytics/customers?${queryString}`
      : "/analytics/customers";

    return apiService.get<any>(endpoint);
  }

  // Get traffic analytics
  async getTrafficAnalytics(filters?: AnalyticsFilters): Promise<any> {
    const params = new URLSearchParams();

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });
    }

    const queryString = params.toString();
    const endpoint = queryString
      ? `/analytics/traffic?${queryString}`
      : "/analytics/traffic";

    return apiService.get<any>(endpoint);
  }

  // Export analytics data
  async exportData(
    filters?: AnalyticsFilters,
    format: "csv" | "pdf" = "csv",
  ): Promise<Blob> {
    const params = new URLSearchParams();

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });
    }

    params.append("format", format);

    const queryString = params.toString();
    const endpoint = `/analytics/export?${queryString}`;

    const response = await fetch(`${endpoint}`, {
      method: "GET",
    });

    if (!response.ok) {
      throw new Error("Failed to export analytics data");
    }

    return response.blob();
  }
}

export const analyticsService = new AnalyticsService();
export type {
  AnalyticsFilters,
  AnalyticsOverview,
  SalesData,
  TopProduct,
  CategoryPerformance,
};
