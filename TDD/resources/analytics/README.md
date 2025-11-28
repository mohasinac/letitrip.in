# Analytics Resource

## Overview

Analytics and reporting APIs for admin and seller dashboards, including sales metrics, user activity, and product performance.

## Related Epic

- E017: Analytics & Reporting

## API Endpoints

| Endpoint                      | Method | Auth         | Description              |
| ----------------------------- | ------ | ------------ | ------------------------ |
| `/api/analytics`              | GET    | Seller/Admin | Get analytics data       |
| `/api/admin/dashboard`        | GET    | Admin        | Admin dashboard metrics  |
| `/api/seller/dashboard`       | GET    | Seller       | Seller dashboard metrics |
| `/api/admin/analytics/sales`  | GET    | Admin        | Platform sales analytics |
| `/api/admin/analytics/users`  | GET    | Admin        | User analytics           |
| `/api/seller/analytics/sales` | GET    | Seller       | Shop sales analytics     |

## Metrics Provided

### Admin Dashboard

- Total users, orders, revenue
- New users (day/week/month)
- Active auctions
- Platform GMV

### Seller Dashboard

- Total products, orders, revenue
- Average rating
- Top products
- Recent orders

## Files

- `API-SPECS.md` - Detailed endpoint documentation
- `TEST-CASES.md` - Unit and integration test cases
