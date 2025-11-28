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
