# Analytics Resource - API Specifications

## Overview

Analytics APIs providing dashboard metrics, sales data, and performance reports for admins and sellers.

---

## Data Models

### Analytics Response

```typescript
interface AnalyticsData {
  revenue: {
    total: number; // Total revenue in paise
    average: number; // Average order value
    trend: number; // Percentage change vs previous period
  };
  orders: {
    total: number;
    pending: number;
    completed: number;
    cancelled: number;
  };
  products: {
    total: number;
    active: number;
    outOfStock: number;
  };
  customers: {
    total: number;
    new: number;
    returning: number;
  };
  conversionRate: number;
  averageOrderValue: number;
  salesOverTime: Array<{
    date: string;
    revenue: number;
    orders?: number;
  }>;
  topProducts: Array<{
    id: string;
    name: string;
    revenue: number;
    quantity: number;
  }>;
  revenueByCategory: Array<{
    categoryId: string;
    categoryName: string;
    revenue: number;
    percentage: number;
  }>;
}
```

### Admin Dashboard

```typescript
interface AdminDashboard {
  overview: {
    totalUsers: number;
    totalSellers: number;
    totalProducts: number;
    totalOrders: number;
    totalRevenue: number;
    platformGMV: number;
  };
  today: {
    newUsers: number;
    newOrders: number;
    revenue: number;
  };
  thisWeek: {
    newUsers: number;
    newOrders: number;
    revenue: number;
  };
  thisMonth: {
    newUsers: number;
    newOrders: number;
    revenue: number;
  };
  auctions: {
    active: number;
    live: number;
    endingSoon: number;
    totalBids: number;
  };
  recentOrders: Array<OrderSummary>;
  topSellers: Array<{
    shopId: string;
    shopName: string;
    revenue: number;
    orderCount: number;
  }>;
}
```

### Seller Dashboard

```typescript
interface SellerDashboard {
  overview: {
    totalProducts: number;
    activeProducts: number;
    totalOrders: number;
    totalRevenue: number;
    averageRating: number;
    totalReviews: number;
  };
  today: {
    orders: number;
    revenue: number;
    views: number;
  };
  thisWeek: {
    orders: number;
    revenue: number;
    views: number;
  };
  thisMonth: {
    orders: number;
    revenue: number;
    views: number;
  };
  pendingActions: {
    ordersToShip: number;
    reviewsToRespond: number;
    lowStockProducts: number;
  };
  recentOrders: Array<OrderSummary>;
  topProducts: Array<{
    id: string;
    name: string;
    revenue: number;
    quantity: number;
  }>;
}
```

---

## Endpoints

### GET /api/analytics

Get analytics data for the authenticated user (seller or admin).

**Authentication**: Required (Seller or Admin)

**Query Parameters**:

| Param       | Type   | Default  | Description                    |
| ----------- | ------ | -------- | ------------------------------ |
| shop_id     | string | -        | Shop ID (required for sellers) |
| start_date  | string | -30 days | Start date (ISO format)        |
| end_date    | string | today    | End date (ISO format)          |
| granularity | string | day      | day, week, month               |

**Response (200)**:

```json
{
  "success": true,
  "data": {
    "revenue": {
      "total": 1250000,
      "average": 2500,
      "trend": 15.5
    },
    "orders": {
      "total": 500,
      "pending": 25,
      "completed": 450,
      "cancelled": 25
    },
    "products": {
      "total": 150,
      "active": 120,
      "outOfStock": 10
    },
    "customers": {
      "total": 350,
      "new": 50,
      "returning": 300
    },
    "conversionRate": 3.5,
    "averageOrderValue": 2500,
    "salesOverTime": [
      { "date": "2025-01-01", "revenue": 45000 },
      { "date": "2025-01-02", "revenue": 52000 },
      { "date": "2025-01-03", "revenue": 38000 }
    ],
    "topProducts": [
      {
        "id": "prod_001",
        "name": "iPhone 15 Pro",
        "revenue": 650000,
        "quantity": 50
      },
      {
        "id": "prod_002",
        "name": "MacBook Pro",
        "revenue": 400000,
        "quantity": 20
      }
    ],
    "revenueByCategory": [
      {
        "categoryId": "cat_mobiles",
        "categoryName": "Mobiles",
        "revenue": 750000,
        "percentage": 60
      },
      {
        "categoryId": "cat_laptops",
        "categoryName": "Laptops",
        "revenue": 500000,
        "percentage": 40
      }
    ]
  }
}
```

**Response (400) - Missing shop_id for seller**:

```json
{
  "success": false,
  "error": "shop_id is required"
}
```

**Response (401)**:

```json
{
  "success": false,
  "error": "Unauthorized"
}
```

**Response (403)**:

```json
{
  "success": false,
  "error": "Forbidden"
}
```

---

### GET /api/admin/dashboard

Get admin dashboard metrics.

**Authentication**: Admin required

**Response (200)**:

```json
{
  "success": true,
  "data": {
    "overview": {
      "totalUsers": 15000,
      "totalSellers": 500,
      "totalProducts": 25000,
      "totalOrders": 50000,
      "totalRevenue": 125000000,
      "platformGMV": 150000000
    },
    "today": {
      "newUsers": 45,
      "newOrders": 120,
      "revenue": 350000
    },
    "thisWeek": {
      "newUsers": 280,
      "newOrders": 850,
      "revenue": 2500000
    },
    "thisMonth": {
      "newUsers": 1200,
      "newOrders": 3500,
      "revenue": 10500000
    },
    "auctions": {
      "active": 150,
      "live": 25,
      "endingSoon": 10,
      "totalBids": 5000
    },
    "recentOrders": [
      {
        "id": "order_001",
        "total": 12500,
        "status": "confirmed",
        "createdAt": "2025-01-15T10:30:00Z"
      }
    ],
    "topSellers": [
      {
        "shopId": "shop_001",
        "shopName": "Tech Store",
        "revenue": 2500000,
        "orderCount": 500
      }
    ]
  }
}
```

---

### GET /api/seller/dashboard

Get seller dashboard metrics.

**Authentication**: Seller required

**Query Parameters**:

| Param   | Type   | Default | Description |
| ------- | ------ | ------- | ----------- |
| shop_id | string | -       | Shop ID     |

**Response (200)**:

```json
{
  "success": true,
  "data": {
    "overview": {
      "totalProducts": 150,
      "activeProducts": 120,
      "totalOrders": 500,
      "totalRevenue": 1250000,
      "averageRating": 4.7,
      "totalReviews": 250
    },
    "today": {
      "orders": 5,
      "revenue": 12500,
      "views": 250
    },
    "thisWeek": {
      "orders": 35,
      "revenue": 87500,
      "views": 1800
    },
    "thisMonth": {
      "orders": 150,
      "revenue": 375000,
      "views": 7500
    },
    "pendingActions": {
      "ordersToShip": 12,
      "reviewsToRespond": 5,
      "lowStockProducts": 8
    },
    "recentOrders": [
      {
        "id": "order_001",
        "customerName": "John Doe",
        "total": 5000,
        "status": "pending",
        "createdAt": "2025-01-15T09:00:00Z"
      }
    ],
    "topProducts": [
      {
        "id": "prod_001",
        "name": "iPhone 15 Pro",
        "revenue": 650000,
        "quantity": 50
      }
    ]
  }
}
```

---

### GET /api/admin/analytics/sales

Detailed sales analytics for admins.

**Authentication**: Admin required

**Query Parameters**:

| Param       | Type   | Default  | Description            |
| ----------- | ------ | -------- | ---------------------- |
| start_date  | string | -30 days | Start date (ISO)       |
| end_date    | string | today    | End date (ISO)         |
| group_by    | string | day      | day, week, month, shop |
| shop_id     | string | -        | Filter by shop         |
| category_id | string | -        | Filter by category     |

**Response (200)**:

```json
{
  "success": true,
  "data": {
    "summary": {
      "totalRevenue": 10500000,
      "totalOrders": 3500,
      "averageOrderValue": 3000,
      "revenueTrend": 12.5,
      "ordersTrend": 8.3
    },
    "salesByPeriod": [
      {
        "period": "2025-01-01",
        "revenue": 350000,
        "orders": 120,
        "aov": 2917
      },
      {
        "period": "2025-01-02",
        "revenue": 420000,
        "orders": 140,
        "aov": 3000
      }
    ],
    "salesByCategory": [
      {
        "categoryId": "cat_electronics",
        "categoryName": "Electronics",
        "revenue": 5500000,
        "orders": 1800,
        "percentage": 52.4
      }
    ],
    "salesByShop": [
      {
        "shopId": "shop_001",
        "shopName": "Tech Store",
        "revenue": 2500000,
        "orders": 800,
        "percentage": 23.8
      }
    ],
    "paymentMethods": [
      {
        "method": "upi",
        "count": 2100,
        "revenue": 6300000,
        "percentage": 60
      },
      {
        "method": "card",
        "count": 1050,
        "revenue": 3150000,
        "percentage": 30
      },
      {
        "method": "cod",
        "count": 350,
        "revenue": 1050000,
        "percentage": 10
      }
    ]
  }
}
```

---

### GET /api/admin/analytics/users

User analytics for admins.

**Authentication**: Admin required

**Query Parameters**:

| Param      | Type   | Default  | Description      |
| ---------- | ------ | -------- | ---------------- |
| start_date | string | -30 days | Start date (ISO) |
| end_date   | string | today    | End date (ISO)   |

**Response (200)**:

```json
{
  "success": true,
  "data": {
    "summary": {
      "totalUsers": 15000,
      "activeUsers": 8500,
      "newUsers": 1200,
      "churnedUsers": 150,
      "retentionRate": 85.5
    },
    "usersByRole": {
      "user": 14200,
      "seller": 500,
      "admin": 10
    },
    "signupsByPeriod": [
      {
        "period": "2025-01-01",
        "count": 45
      },
      {
        "period": "2025-01-02",
        "count": 52
      }
    ],
    "usersByLocation": [
      {
        "state": "Maharashtra",
        "count": 3500,
        "percentage": 23.3
      },
      {
        "state": "Karnataka",
        "count": 2800,
        "percentage": 18.7
      }
    ],
    "userActivity": {
      "dailyActiveUsers": 2500,
      "weeklyActiveUsers": 5500,
      "monthlyActiveUsers": 8500
    },
    "topBuyers": [
      {
        "userId": "user_001",
        "name": "John Doe",
        "orderCount": 25,
        "totalSpent": 125000
      }
    ]
  }
}
```

---

### GET /api/seller/analytics/sales

Seller sales analytics.

**Authentication**: Seller required

**Query Parameters**:

| Param      | Type   | Default  | Description        |
| ---------- | ------ | -------- | ------------------ |
| shop_id    | string | -        | Shop ID (required) |
| start_date | string | -30 days | Start date (ISO)   |
| end_date   | string | today    | End date (ISO)     |
| group_by   | string | day      | day, week, month   |

**Response (200)**:

```json
{
  "success": true,
  "data": {
    "summary": {
      "totalRevenue": 375000,
      "totalOrders": 150,
      "averageOrderValue": 2500,
      "revenueTrend": 18.5,
      "ordersTrend": 12.3
    },
    "salesByPeriod": [
      {
        "period": "2025-01-01",
        "revenue": 12500,
        "orders": 5,
        "aov": 2500
      }
    ],
    "salesByCategory": [
      {
        "categoryId": "cat_mobiles",
        "categoryName": "Mobiles",
        "revenue": 250000,
        "orders": 100,
        "percentage": 66.7
      }
    ],
    "productPerformance": [
      {
        "productId": "prod_001",
        "productName": "iPhone 15 Pro",
        "revenue": 130000,
        "quantity": 10,
        "views": 500,
        "conversionRate": 2.0
      }
    ]
  }
}
```

---

## RBAC Permissions

| Action                  | Admin | Seller | User | Guest |
| ----------------------- | ----- | ------ | ---- | ----- |
| View platform analytics | ✅    | ❌     | ❌   | ❌    |
| View admin dashboard    | ✅    | ❌     | ❌   | ❌    |
| View seller dashboard   | ❌    | ✅     | ❌   | ❌    |
| View shop analytics     | ✅    | ✅\*   | ❌   | ❌    |
| Export analytics        | ✅    | ✅\*   | ❌   | ❌    |

\*Seller can only access their own shop's analytics

---

## Date Range Limits

| Role   | Max Range | Default Range |
| ------ | --------- | ------------- |
| Admin  | 365 days  | 30 days       |
| Seller | 90 days   | 30 days       |

---

## Implementation Notes

1. **Caching**: Dashboard data should be cached with 5-minute TTL
2. **Aggregation**: Use Firestore aggregation or pre-computed summaries for large datasets
3. **Date Handling**: All dates are in IST (India Standard Time)
4. **Revenue**: All revenue values are in paise (1 INR = 100 paise)
5. **Trends**: Calculated as percentage change vs previous equivalent period
6. **Rate Limiting**: 60 requests/minute for analytics endpoints
