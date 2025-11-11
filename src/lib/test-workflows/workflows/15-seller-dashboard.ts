/**
 * Workflow #15: Seller Dashboard & Analytics
 *
 * Complete seller analytics and dashboard workflow:
 * 1. Navigate to seller dashboard
 * 2. View dashboard overview metrics
 * 3. Check revenue metrics
 * 4. View sales data (7-day chart)
 * 5. Check top products
 * 6. View customer insights
 * 7. Check category performance
 * 8. View traffic analytics
 * 9. Check conversion rates
 * 10. Export sales report (CSV)
 * 11. View analytics for different time periods
 * 12. Generate summary report
 *
 * Expected time: 10-12 minutes
 * Success criteria: All analytics endpoints return data successfully
 */

import { analyticsService } from "@/services/analytics.service";
import { shopsService } from "@/services/shops.service";
import { TEST_CONFIG, getSafeShopId } from "../test-config";
import { BaseWorkflow, WorkflowResult, ShopHelpers } from "../helpers";

export class SellerDashboardAnalyticsWorkflow extends BaseWorkflow {
  private shopId: string | null = null;

  async run(): Promise<WorkflowResult> {
    this.initialize();

    try {
      // Step 1: Navigate to seller dashboard
      await this.executeStep("Navigate to Seller Dashboard", async () => {
        console.log("Navigating to /seller/dashboard");

        // Get shop ID from test config
        this.shopId = getSafeShopId();

        if (!this.shopId) {
          throw new Error("No shop ID available - seller role required");
        }

        // Verify shop exists
        const shop = await shopsService.getBySlug(this.shopId);

        console.log(
          `Accessing dashboard for shop: ${ShopHelpers.getName(shop)} (${
            this.shopId
          })`
        );
      });

      // Step 2: View dashboard overview metrics
      await this.executeStep("View Dashboard Overview", async () => {
        if (!this.shopId) {
          throw new Error("Shop ID not available");
        }

        const overview = await analyticsService.getOverview({
          shopId: this.shopId,
        });

        console.log(`Total Revenue: ₹${overview.totalRevenue}`);
        console.log(`Total Orders: ${overview.totalOrders}`);
        console.log(`Total Products: ${overview.totalProducts}`);
        console.log(`Total Customers: ${overview.totalCustomers}`);
        console.log(`Average Order Value: ₹${overview.averageOrderValue}`);
      });

      // Step 3: Check revenue metrics
      await this.executeStep("Check Revenue Metrics", async () => {
        if (!this.shopId) {
          throw new Error("Shop ID not available");
        }

        const overview = await analyticsService.getOverview({
          shopId: this.shopId,
        });

        console.log(
          `Revenue Growth: ${overview.revenueGrowth > 0 ? "+" : ""}${
            overview.revenueGrowth
          }%`
        );
        console.log(
          `Orders Growth: ${overview.ordersGrowth > 0 ? "+" : ""}${
            overview.ordersGrowth
          }%`
        );
        console.log(`Conversion Rate: ${overview.conversionRate.toFixed(2)}%`);
      });

      // Step 4: View sales data (7-day chart)
      await this.executeStep("View Sales Data (7-Day)", async () => {
        if (!this.shopId) {
          throw new Error("Shop ID not available");
        }

        const salesData = await analyticsService.getSalesData({
          shopId: this.shopId,
          period: "day",
        });

        console.log(`Sales data points: ${salesData.length}`);

        if (salesData.length > 0) {
          const recentSales = salesData.slice(-7); // Last 7 days
          console.log("Recent 7-day sales:");
          recentSales.forEach((day) => {
            console.log(
              `  ${day.date}: ₹${day.revenue} (${day.orders} orders)`
            );
          });
        }
      });

      // Step 5: Check top products
      await this.executeStep("Check Top Products", async () => {
        if (!this.shopId) {
          throw new Error("Shop ID not available");
        }

        const topProducts = await analyticsService.getTopProducts({
          shopId: this.shopId,
          limit: 5,
        });

        console.log(`Top ${topProducts.length} products:`);
        topProducts.forEach((product, index) => {
          console.log(
            `  ${index + 1}. ${product.productName}: ₹${product.revenue} (${
              product.sales
            } sales)`
          );
        });
      });

      // Step 6: View customer insights
      await this.executeStep("View Customer Insights", async () => {
        if (!this.shopId) {
          throw new Error("Shop ID not available");
        }

        const customerAnalytics = await analyticsService.getCustomerAnalytics({
          shopId: this.shopId,
        });

        console.log("Customer analytics data retrieved");
        console.log(
          `Customer data points: ${
            JSON.stringify(customerAnalytics).length
          } bytes`
        );
      });

      // Step 7: Check category performance
      await this.executeStep("Check Category Performance", async () => {
        if (!this.shopId) {
          throw new Error("Shop ID not available");
        }

        const categoryPerformance =
          await analyticsService.getCategoryPerformance({
            shopId: this.shopId,
          });

        console.log(
          `Category performance: ${categoryPerformance.length} categories`
        );

        if (categoryPerformance.length > 0) {
          const topCategory = categoryPerformance[0];
          console.log(
            `Top category: ${topCategory.categoryName} - ₹${topCategory.revenue}`
          );
        }
      });

      // Step 8: View traffic analytics
      await this.executeStep("View Traffic Analytics", async () => {
        if (!this.shopId) {
          throw new Error("Shop ID not available");
        }

        const trafficAnalytics = await analyticsService.getTrafficAnalytics({
          shopId: this.shopId,
        });

        console.log("Traffic analytics data retrieved");
        console.log(
          `Traffic data: ${JSON.stringify(trafficAnalytics).length} bytes`
        );
      });

      // Step 9: Check conversion rates
      await this.executeStep("Check Conversion Rates", async () => {
        if (!this.shopId) {
          throw new Error("Shop ID not available");
        }

        const overview = await analyticsService.getOverview({
          shopId: this.shopId,
        });

        const conversionRate = overview.conversionRate;
        const avgOrderValue = overview.averageOrderValue;

        console.log(`Conversion Rate: ${conversionRate.toFixed(2)}%`);
        console.log(`Average Order Value: ₹${avgOrderValue.toFixed(2)}`);

        if (conversionRate > 0) {
          console.log("Conversion tracking is active and working correctly");
        }
      });

      // Step 10: Export sales report (CSV)
      await this.executeStep("Export Sales Report (CSV)", async () => {
        if (!this.shopId) {
          throw new Error("Shop ID not available");
        }

        const csvBlob = await analyticsService.exportData(
          {
            shopId: this.shopId,
            period: "week",
          },
          "csv"
        );

        console.log(`Sales report exported: ${csvBlob.size} bytes (CSV)`);
      });

      // Step 11: View analytics for different time periods
      await this.executeStep(
        "View Analytics for Different Periods",
        async () => {
          if (!this.shopId) {
            throw new Error("Shop ID not available");
          }

          const periods = ["day", "week", "month"] as const;

          for (const period of periods) {
            const salesData = await analyticsService.getSalesData({
              shopId: this.shopId,
              period,
            });

            console.log(
              `Sales data for ${period}: ${salesData.length} data points`
            );
          }

          console.log("Successfully retrieved analytics for all time periods");
        }
      );

      // Step 12: Generate summary report
      await this.executeStep("Generate Summary Report", async () => {
        if (!this.shopId) {
          throw new Error("Shop ID not available");
        }

        const overview = await analyticsService.getOverview({
          shopId: this.shopId,
        });
        const topProducts = await analyticsService.getTopProducts({
          shopId: this.shopId,
          limit: 3,
        });

        console.log("\n=== SELLER DASHBOARD SUMMARY REPORT ===");
        console.log(`Shop ID: ${this.shopId}`);
        console.log(`Total Revenue: ₹${overview.totalRevenue}`);
        console.log(`Total Orders: ${overview.totalOrders}`);
        console.log(`Total Customers: ${overview.totalCustomers}`);
        console.log(`Conversion Rate: ${overview.conversionRate}%`);
        console.log(
          `Revenue Growth: ${overview.revenueGrowth > 0 ? "+" : ""}${
            overview.revenueGrowth
          }%`
        );

        if (topProducts.length > 0) {
          console.log("\nTop Products:");
          topProducts.forEach((p, i) => {
            console.log(`  ${i + 1}. ${p.productName} (₹${p.revenue})`);
          });
        }

        console.log("=======================================\n");
      });
    } catch (error) {
      console.error("Workflow failed:", error);
      throw error;
    }

    return this.printSummary();
  }
}
