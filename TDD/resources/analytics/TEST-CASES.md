# Analytics Resource - Test Cases

## Unit Tests

### AnalyticsService

#### Revenue Analytics

```typescript
describe("AnalyticsService", () => {
  describe("getAnalytics", () => {
    it("should return analytics data for admin", async () => {
      const result = await analyticsService.getAnalytics({
        role: "admin",
        startDate: new Date("2025-01-01"),
        endDate: new Date("2025-01-31"),
      });
      expect(result.success).toBe(true);
      expect(result.data.revenue).toBeDefined();
      expect(result.data.orders).toBeDefined();
      expect(result.data.products).toBeDefined();
    });

    it("should require shop_id for seller", async () => {
      const result = await analyticsService.getAnalytics({
        role: "seller",
        startDate: new Date("2025-01-01"),
        endDate: new Date("2025-01-31"),
      });
      expect(result.success).toBe(false);
      expect(result.error).toContain("shop_id");
    });

    it("should return shop-specific data for seller", async () => {
      const result = await analyticsService.getAnalytics({
        role: "seller",
        shopId: "shop_001",
        startDate: new Date("2025-01-01"),
        endDate: new Date("2025-01-31"),
      });
      expect(result.success).toBe(true);
      // Data should be filtered to shop_001
    });

    it("should calculate revenue correctly", async () => {
      const result = await analyticsService.getAnalytics({
        role: "admin",
        startDate: new Date("2025-01-01"),
        endDate: new Date("2025-01-31"),
      });
      expect(result.data.revenue.total).toBeGreaterThanOrEqual(0);
      expect(result.data.revenue.average).toBeGreaterThanOrEqual(0);
    });

    it("should calculate order counts by status", async () => {
      const result = await analyticsService.getAnalytics({
        role: "admin",
        startDate: new Date("2025-01-01"),
        endDate: new Date("2025-01-31"),
      });
      expect(result.data.orders.total).toBe(
        result.data.orders.pending +
          result.data.orders.completed +
          result.data.orders.cancelled
      );
    });

    it("should return sales over time data", async () => {
      const result = await analyticsService.getAnalytics({
        role: "admin",
        startDate: new Date("2025-01-01"),
        endDate: new Date("2025-01-07"),
      });
      expect(Array.isArray(result.data.salesOverTime)).toBe(true);
      result.data.salesOverTime.forEach((day: any) => {
        expect(day.date).toBeDefined();
        expect(typeof day.revenue).toBe("number");
      });
    });

    it("should return top products", async () => {
      const result = await analyticsService.getAnalytics({
        role: "admin",
        startDate: new Date("2025-01-01"),
        endDate: new Date("2025-01-31"),
      });
      expect(Array.isArray(result.data.topProducts)).toBe(true);
      // Should be sorted by revenue descending
      for (let i = 1; i < result.data.topProducts.length; i++) {
        expect(result.data.topProducts[i - 1].revenue).toBeGreaterThanOrEqual(
          result.data.topProducts[i].revenue
        );
      }
    });

    it("should limit date range for sellers", async () => {
      const result = await analyticsService.getAnalytics({
        role: "seller",
        shopId: "shop_001",
        startDate: new Date("2024-01-01"), // > 90 days
        endDate: new Date("2025-01-31"),
      });
      // Should auto-adjust to max 90 days
      expect(result.success).toBe(true);
    });
  });
});
```

#### Admin Dashboard

```typescript
describe("AdminDashboardService", () => {
  describe("getDashboard", () => {
    it("should return overview metrics", async () => {
      const result = await adminDashboardService.getDashboard();
      expect(result.success).toBe(true);
      expect(result.data.overview.totalUsers).toBeDefined();
      expect(result.data.overview.totalOrders).toBeDefined();
      expect(result.data.overview.totalRevenue).toBeDefined();
    });

    it("should return today's metrics", async () => {
      const result = await adminDashboardService.getDashboard();
      expect(result.data.today.newUsers).toBeGreaterThanOrEqual(0);
      expect(result.data.today.newOrders).toBeGreaterThanOrEqual(0);
      expect(result.data.today.revenue).toBeGreaterThanOrEqual(0);
    });

    it("should return this week's metrics", async () => {
      const result = await adminDashboardService.getDashboard();
      expect(result.data.thisWeek.newUsers).toBeGreaterThanOrEqual(
        result.data.today.newUsers
      );
      expect(result.data.thisWeek.newOrders).toBeGreaterThanOrEqual(
        result.data.today.newOrders
      );
    });

    it("should return this month's metrics", async () => {
      const result = await adminDashboardService.getDashboard();
      expect(result.data.thisMonth.newUsers).toBeGreaterThanOrEqual(
        result.data.thisWeek.newUsers
      );
    });

    it("should return auction stats", async () => {
      const result = await adminDashboardService.getDashboard();
      expect(result.data.auctions.active).toBeGreaterThanOrEqual(0);
      expect(result.data.auctions.live).toBeGreaterThanOrEqual(0);
    });

    it("should return recent orders", async () => {
      const result = await adminDashboardService.getDashboard();
      expect(Array.isArray(result.data.recentOrders)).toBe(true);
      expect(result.data.recentOrders.length).toBeLessThanOrEqual(10);
    });

    it("should return top sellers", async () => {
      const result = await adminDashboardService.getDashboard();
      expect(Array.isArray(result.data.topSellers)).toBe(true);
      // Sorted by revenue descending
      for (let i = 1; i < result.data.topSellers.length; i++) {
        expect(result.data.topSellers[i - 1].revenue).toBeGreaterThanOrEqual(
          result.data.topSellers[i].revenue
        );
      }
    });
  });
});
```

#### Seller Dashboard

```typescript
describe("SellerDashboardService", () => {
  describe("getDashboard", () => {
    it("should return shop overview", async () => {
      const result = await sellerDashboardService.getDashboard("shop_001");
      expect(result.success).toBe(true);
      expect(result.data.overview.totalProducts).toBeDefined();
      expect(result.data.overview.totalOrders).toBeDefined();
      expect(result.data.overview.averageRating).toBeDefined();
    });

    it("should return pending actions count", async () => {
      const result = await sellerDashboardService.getDashboard("shop_001");
      expect(result.data.pendingActions.ordersToShip).toBeGreaterThanOrEqual(0);
      expect(
        result.data.pendingActions.reviewsToRespond
      ).toBeGreaterThanOrEqual(0);
      expect(
        result.data.pendingActions.lowStockProducts
      ).toBeGreaterThanOrEqual(0);
    });

    it("should return recent orders for shop", async () => {
      const result = await sellerDashboardService.getDashboard("shop_001");
      expect(Array.isArray(result.data.recentOrders)).toBe(true);
      // All orders should belong to shop_001
      result.data.recentOrders.forEach((order: any) => {
        expect(order.shopId).toBe("shop_001");
      });
    });

    it("should return top products for shop", async () => {
      const result = await sellerDashboardService.getDashboard("shop_001");
      expect(Array.isArray(result.data.topProducts)).toBe(true);
    });

    it("should only show seller's own shop data", async () => {
      const result = await sellerDashboardService.getDashboard("shop_002");
      // Seller for shop_001 should not access shop_002
      expect(result.success).toBe(false);
    });
  });
});
```

---

## Integration Tests

### GET /api/analytics

```typescript
describe("GET /api/analytics", () => {
  it("should return 401 for unauthenticated request", async () => {
    const res = await fetch("/api/analytics");
    expect(res.status).toBe(401);
  });

  it("should return 403 for regular user", async () => {
    const res = await fetch("/api/analytics", {
      headers: { Authorization: `Bearer ${userToken}` },
    });
    expect(res.status).toBe(403);
  });

  it("should return 200 for admin", async () => {
    const res = await fetch("/api/analytics", {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.data.revenue).toBeDefined();
  });

  it("should return 400 for seller without shop_id", async () => {
    const res = await fetch("/api/analytics", {
      headers: { Authorization: `Bearer ${sellerToken}` },
    });
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toContain("shop_id");
  });

  it("should return 200 for seller with shop_id", async () => {
    const res = await fetch("/api/analytics?shop_id=shop_001", {
      headers: { Authorization: `Bearer ${sellerToken}` },
    });
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
  });

  it("should filter by date range", async () => {
    const res = await fetch(
      "/api/analytics?start_date=2025-01-01&end_date=2025-01-15",
      { headers: { Authorization: `Bearer ${adminToken}` } }
    );
    expect(res.status).toBe(200);
    const json = await res.json();
    // Sales over time should only include dates in range
    json.data.salesOverTime.forEach((day: any) => {
      const date = new Date(day.date);
      expect(date.getTime()).toBeGreaterThanOrEqual(
        new Date("2025-01-01").getTime()
      );
      expect(date.getTime()).toBeLessThanOrEqual(
        new Date("2025-01-15").getTime()
      );
    });
  });

  it("should handle invalid date format gracefully", async () => {
    const res = await fetch("/api/analytics?start_date=invalid", {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    // Should use default dates
    expect(res.status).toBe(200);
  });
});
```

### GET /api/admin/dashboard

```typescript
describe("GET /api/admin/dashboard", () => {
  it("should return 401 for unauthenticated request", async () => {
    const res = await fetch("/api/admin/dashboard");
    expect(res.status).toBe(401);
  });

  it("should return 403 for non-admin", async () => {
    const res = await fetch("/api/admin/dashboard", {
      headers: { Authorization: `Bearer ${userToken}` },
    });
    expect(res.status).toBe(403);
  });

  it("should return 403 for seller", async () => {
    const res = await fetch("/api/admin/dashboard", {
      headers: { Authorization: `Bearer ${sellerToken}` },
    });
    expect(res.status).toBe(403);
  });

  it("should return 200 with dashboard data for admin", async () => {
    const res = await fetch("/api/admin/dashboard", {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.data.overview).toBeDefined();
    expect(json.data.today).toBeDefined();
    expect(json.data.thisWeek).toBeDefined();
    expect(json.data.thisMonth).toBeDefined();
  });

  it("should return auction statistics", async () => {
    const res = await fetch("/api/admin/dashboard", {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const json = await res.json();
    expect(json.data.auctions.active).toBeGreaterThanOrEqual(0);
    expect(json.data.auctions.live).toBeGreaterThanOrEqual(0);
  });
});
```

### GET /api/seller/dashboard

```typescript
describe("GET /api/seller/dashboard", () => {
  it("should return 401 for unauthenticated request", async () => {
    const res = await fetch("/api/seller/dashboard");
    expect(res.status).toBe(401);
  });

  it("should return 403 for regular user", async () => {
    const res = await fetch("/api/seller/dashboard", {
      headers: { Authorization: `Bearer ${userToken}` },
    });
    expect(res.status).toBe(403);
  });

  it("should return 200 for seller", async () => {
    const res = await fetch("/api/seller/dashboard", {
      headers: { Authorization: `Bearer ${sellerToken}` },
    });
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.data.overview).toBeDefined();
  });

  it("should return pending actions", async () => {
    const res = await fetch("/api/seller/dashboard", {
      headers: { Authorization: `Bearer ${sellerToken}` },
    });
    const json = await res.json();
    expect(json.data.pendingActions.ordersToShip).toBeDefined();
    expect(json.data.pendingActions.lowStockProducts).toBeDefined();
  });

  it("should return 200 for admin viewing any shop", async () => {
    const res = await fetch("/api/seller/dashboard?shop_id=shop_001", {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    expect(res.status).toBe(200);
  });
});
```

### GET /api/admin/analytics/sales

```typescript
describe("GET /api/admin/analytics/sales", () => {
  it("should return 403 for non-admin", async () => {
    const res = await fetch("/api/admin/analytics/sales", {
      headers: { Authorization: `Bearer ${sellerToken}` },
    });
    expect(res.status).toBe(403);
  });

  it("should return sales summary", async () => {
    const res = await fetch("/api/admin/analytics/sales", {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.data.summary.totalRevenue).toBeDefined();
    expect(json.data.summary.totalOrders).toBeDefined();
  });

  it("should group by day by default", async () => {
    const res = await fetch("/api/admin/analytics/sales", {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const json = await res.json();
    expect(Array.isArray(json.data.salesByPeriod)).toBe(true);
  });

  it("should group by week when specified", async () => {
    const res = await fetch("/api/admin/analytics/sales?group_by=week", {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const json = await res.json();
    expect(Array.isArray(json.data.salesByPeriod)).toBe(true);
  });

  it("should filter by shop_id", async () => {
    const res = await fetch("/api/admin/analytics/sales?shop_id=shop_001", {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    expect(res.status).toBe(200);
  });

  it("should return sales by category", async () => {
    const res = await fetch("/api/admin/analytics/sales", {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const json = await res.json();
    expect(Array.isArray(json.data.salesByCategory)).toBe(true);
  });

  it("should return payment method breakdown", async () => {
    const res = await fetch("/api/admin/analytics/sales", {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const json = await res.json();
    expect(Array.isArray(json.data.paymentMethods)).toBe(true);
  });
});
```

### GET /api/admin/analytics/users

```typescript
describe("GET /api/admin/analytics/users", () => {
  it("should return 403 for non-admin", async () => {
    const res = await fetch("/api/admin/analytics/users", {
      headers: { Authorization: `Bearer ${sellerToken}` },
    });
    expect(res.status).toBe(403);
  });

  it("should return user summary", async () => {
    const res = await fetch("/api/admin/analytics/users", {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.data.summary.totalUsers).toBeDefined();
    expect(json.data.summary.activeUsers).toBeDefined();
  });

  it("should return users by role", async () => {
    const res = await fetch("/api/admin/analytics/users", {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const json = await res.json();
    expect(json.data.usersByRole.user).toBeDefined();
    expect(json.data.usersByRole.seller).toBeDefined();
    expect(json.data.usersByRole.admin).toBeDefined();
  });

  it("should return signups over time", async () => {
    const res = await fetch("/api/admin/analytics/users", {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const json = await res.json();
    expect(Array.isArray(json.data.signupsByPeriod)).toBe(true);
  });

  it("should return user activity metrics", async () => {
    const res = await fetch("/api/admin/analytics/users", {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const json = await res.json();
    expect(json.data.userActivity.dailyActiveUsers).toBeDefined();
    expect(json.data.userActivity.weeklyActiveUsers).toBeDefined();
    expect(json.data.userActivity.monthlyActiveUsers).toBeDefined();
  });
});
```

---

## E2E Test Scenarios

### Admin Dashboard Flow

```typescript
describe("E2E: Admin Dashboard Flow", () => {
  it("should load admin dashboard with real-time data", async () => {
    // 1. Login as admin
    const loginRes = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "admin@example.com",
        password: "admin123",
      }),
    });
    const { token } = await loginRes.json();

    // 2. Fetch dashboard
    const dashRes = await fetch("/api/admin/dashboard", {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(dashRes.status).toBe(200);
    const { data } = await dashRes.json();

    // 3. Verify data structure
    expect(data.overview.totalUsers).toBeGreaterThan(0);
    expect(data.overview.totalOrders).toBeGreaterThanOrEqual(0);

    // 4. Fetch detailed sales analytics
    const salesRes = await fetch("/api/admin/analytics/sales", {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(salesRes.status).toBe(200);
  });
});
```

### Seller Analytics Flow

```typescript
describe("E2E: Seller Analytics Flow", () => {
  it("should show seller their shop analytics", async () => {
    // 1. Login as seller
    const loginRes = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "seller@example.com",
        password: "seller123",
      }),
    });
    const { token, shopId } = await loginRes.json();

    // 2. Fetch seller dashboard
    const dashRes = await fetch("/api/seller/dashboard", {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(dashRes.status).toBe(200);
    const { data: dashboard } = await dashRes.json();

    // 3. Verify pending actions
    expect(dashboard.pendingActions.ordersToShip).toBeGreaterThanOrEqual(0);

    // 4. Fetch detailed analytics
    const analyticsRes = await fetch(`/api/analytics?shop_id=${shopId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(analyticsRes.status).toBe(200);
    const { data: analytics } = await analyticsRes.json();

    // 5. Verify top products are from seller's shop
    expect(analytics.topProducts.every((p: any) => p.shopId === shopId)).toBe(
      true
    );
  });
});
```

---

## Test Data Requirements

### Orders for Analytics

| ID        | ShopId   | Total | Status    | Created              |
| --------- | -------- | ----- | --------- | -------------------- |
| order_001 | shop_001 | 12500 | delivered | 2025-01-15T10:00:00Z |
| order_002 | shop_001 | 8500  | delivered | 2025-01-14T10:00:00Z |
| order_003 | shop_001 | 5000  | pending   | 2025-01-15T11:00:00Z |
| order_004 | shop_002 | 15000 | delivered | 2025-01-13T10:00:00Z |
| order_005 | shop_001 | 3500  | cancelled | 2025-01-12T10:00:00Z |

### Products for Analytics

| ID       | ShopId   | Name          | Stock | Status    |
| -------- | -------- | ------------- | ----- | --------- |
| prod_001 | shop_001 | iPhone 15 Pro | 50    | published |
| prod_002 | shop_001 | MacBook Pro   | 0     | published |
| prod_003 | shop_001 | iPad Pro      | 5     | published |
| prod_004 | shop_002 | Samsung S24   | 30    | published |

### Users for Analytics

| ID       | Role   | Created              | LastActive           |
| -------- | ------ | -------------------- | -------------------- |
| user_001 | user   | 2025-01-01T10:00:00Z | 2025-01-15T10:00:00Z |
| user_002 | user   | 2025-01-10T10:00:00Z | 2025-01-14T10:00:00Z |
| user_003 | seller | 2024-06-01T10:00:00Z | 2025-01-15T08:00:00Z |
| user_004 | admin  | 2024-01-01T10:00:00Z | 2025-01-15T09:00:00Z |
