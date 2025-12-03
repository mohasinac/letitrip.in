import { apiService } from "./api.service";
import type {
  AnalyticsFiltersFE,
  AnalyticsOverviewFE,
  SalesDataPointFE,
  TopProductFE,
  CategoryPerformanceFE,
  CustomerAnalyticsFE,
  TrafficAnalyticsFE,
} from "@/types/frontend/analytics.types";

class AnalyticsService {
  // Get analytics overview (seller: own, admin: all)
  async getOverview(
    filters?: AnalyticsFiltersFE,
  ): Promise<AnalyticsOverviewFE> {
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

    return apiService.get<AnalyticsOverviewFE>(endpoint);
  }

  // Get sales data (time series)
  async getSalesData(
    filters?: AnalyticsFiltersFE,
  ): Promise<SalesDataPointFE[]> {
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

    return apiService.get<SalesDataPointFE[]>(endpoint);
  }

  // Get top products
  async getTopProducts(
    filters?: AnalyticsFiltersFE & { limit?: number },
  ): Promise<TopProductFE[]> {
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

    return apiService.get<TopProductFE[]>(endpoint);
  }

  // Get category performance
  async getCategoryPerformance(
    filters?: AnalyticsFiltersFE,
  ): Promise<CategoryPerformanceFE[]> {
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

    return apiService.get<CategoryPerformanceFE[]>(endpoint);
  }

  // Get customer analytics
  async getCustomerAnalytics(
    filters?: AnalyticsFiltersFE,
  ): Promise<CustomerAnalyticsFE[]> {
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

    return apiService.get<CustomerAnalyticsFE[]>(endpoint);
  }

  // Get traffic analytics
  async getTrafficAnalytics(
    filters?: AnalyticsFiltersFE,
  ): Promise<TrafficAnalyticsFE> {
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

    return apiService.get<TrafficAnalyticsFE>(endpoint);
  }

  // Export analytics data
  async exportData(
    filters?: AnalyticsFiltersFE,
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

  // Track event (client-side event logging)
  trackEvent(eventName: string, eventData?: Record<string, any>): void {
    // In development, log to console
    if (process.env.NODE_ENV === "development") {
      console.log(`[Analytics Event] ${eventName}`, eventData);
    }

    // In production, send to analytics endpoint (if available)
    // This is a fire-and-forget operation, no need to await
    if (typeof window !== "undefined") {
      try {
        // You can integrate with Google Analytics, Mixpanel, etc. here
        // For now, just log to console in dev mode
        // Example: window.gtag?.('event', eventName, eventData);
      } catch (error) {
        // Silently fail - analytics should not break the app
        console.debug("Analytics tracking failed:", error);
      }
    }
  }
}

export const analyticsService = new AnalyticsService();
