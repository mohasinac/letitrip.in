# Epic E017: Analytics & Reporting

## Overview

Analytics dashboards for admins and sellers to track performance metrics.

## Scope

- Admin dashboard analytics
- Seller dashboard analytics
- Sales reports
- User activity metrics
- Product performance

## User Roles Involved

- **Admin**: Platform-wide analytics
- **Seller**: Own shop analytics
- **User**: No access
- **Guest**: No access

---

## Features

### F017.1: Admin Analytics

**US017.1.1**: Platform Dashboard

```
Metrics:
- Total users, orders, revenue
- New users (day/week/month)
- Active auctions
- Platform GMV
```

**US017.1.2**: Sales Analytics
**US017.1.3**: User Analytics

### F017.2: Seller Analytics

**US017.2.1**: Shop Dashboard

```
Metrics:
- Total products, orders, revenue
- Average rating
- Top products
- Recent orders
```

**US017.2.2**: Revenue Analytics
**US017.2.3**: Product Performance

---

## API Endpoints

| Endpoint                | Method | Auth         | Description      |
| ----------------------- | ------ | ------------ | ---------------- |
| `/api/admin/dashboard`  | GET    | Admin        | Admin dashboard  |
| `/api/seller/dashboard` | GET    | Seller       | Seller dashboard |
| `/api/analytics`        | GET    | Seller/Admin | Analytics data   |

## Related Epics

- E005: Order Management (sales data)
- E002: Product Catalog (product metrics)
- E001: User Management (user metrics)

---

## Test Documentation

- **API Specs**: `/TDD/resources/analytics/API-SPECS.md`
- **Test Cases**: `/TDD/resources/analytics/TEST-CASES.md`

### Test Coverage

- Unit tests for analytics calculations
- Unit tests for dashboard aggregations
- Integration tests for admin/seller dashboards
- RBAC tests for analytics access
- Performance tests for dashboard load times

---

## Pending Routes

| Route                       | Priority  | Status     | Notes                                                             |
| --------------------------- | --------- | ---------- | ----------------------------------------------------------------- |
| `/admin/analytics`          | 🔴 HIGH   | ⬜ PENDING | Main analytics dashboard. Currently redirects to `/admin/orders`. |
| `/admin/analytics/sales`    | 🟡 MEDIUM | ⬜ PENDING | Detailed sales analytics page.                                    |
| `/admin/analytics/users`    | 🟡 MEDIUM | ⬜ PENDING | User analytics and growth metrics.                                |
| `/admin/analytics/products` | 🟡 MEDIUM | ⬜ PENDING | Product performance analytics.                                    |
| `/seller/analytics`         | 🟡 MEDIUM | ⬜ PENDING | Seller shop analytics. Currently uses `/seller` dashboard.        |

**See**: `TDD/PENDING-ROUTES.md` for full details
