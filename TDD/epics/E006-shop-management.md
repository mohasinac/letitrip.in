# Epic E006: Shop Management

## Overview

Complete shop lifecycle for sellers including creation, profile management, verification, and shop analytics.

## Scope

- Shop creation and setup
- Shop profile management
- Shop verification process
- Shop settings and preferences
- Shop followers
- Shop analytics (basic)

## User Roles Involved

- **Admin**: Full shop management, verification, suspension
- **Seller**: Own shop management
- **User**: View shops, follow shops
- **Guest**: View active shops

---

## Features

### F006.1: Shop Creation

**US006.1.1**: Create Shop

```
As a user
I want to create a shop
So that I can sell products

Acceptance Criteria:
- Given I am a logged-in user without a shop
- When I complete shop setup form
- Then my shop is created
- And my role changes to "seller"
- And shop status is "pending verification"
```

### F006.2: Shop Profile Management

**US006.2.1**: Update Shop Profile

```
As a seller
I want to update my shop profile
So that customers have current information

Editable Fields:
- Shop name
- Description
- Logo, Banner
- Contact: email, phone, address
- Business hours
- Return policy
- Shipping settings
```

### F006.3: Shop Verification

**US006.3.1**: Submit for Verification

```
As a seller
I want to verify my shop
So that customers trust my business
```

**US006.3.2**: Verify Shop (Admin)

```
As an admin
I want to verify shops
So that quality is maintained
```

### F006.4: Shop Settings

**US006.4.1**: Configure Shipping

```
Settings:
- Standard shipping charge
- Free shipping threshold
- Express shipping availability
```

### F006.5: Shop Discovery

**US006.5.1**: Browse Shops
**US006.5.2**: Follow Shop
**US006.5.3**: View Shop Products

---

## API Endpoints

| Endpoint                  | Method | Auth         | Description     |
| ------------------------- | ------ | ------------ | --------------- |
| `/api/shops`              | GET    | Public       | List shops      |
| `/api/shops`              | POST   | User         | Create shop     |
| `/api/shops/:slug`        | GET    | Public       | Get shop        |
| `/api/shops/:slug`        | PATCH  | Seller/Admin | Update shop     |
| `/api/shops/bulk`         | POST   | Admin        | Bulk operations |
| `/api/shops/following`    | GET    | User         | Followed shops  |
| `/api/shops/:slug/follow` | POST   | User         | Follow/unfollow |

---

## Data Models

```typescript
interface ShopBE {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logo: string | null;
  banner: string | null;
  ownerId: string;
  ownerName: string;
  ownerEmail: string;
  email: string;
  phone: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  postalCode: string | null;
  totalProducts: number;
  totalAuctions: number;
  totalOrders: number;
  totalSales: number;
  rating: number;
  reviewCount: number;
  status: "draft" | "published" | "archived" | "deleted";
  isVerified: boolean;
  settings: {
    acceptsOrders: boolean;
    minOrderAmount: number;
    shippingCharge: number;
    freeShippingAbove: number | null;
  };
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

## Related Epics

- E001: User Management (seller role)
- E002: Product Catalog (shop products)
- E018: Payout System (seller earnings)

---

## Test Documentation

- **API Specs**: `/TDD/resources/shops/API-SPECS.md`
- **Test Cases**: `/TDD/resources/shops/TEST-CASES.md`

### Test Coverage

- Unit tests for shop validation and slug generation
- Unit tests for settings management
- Integration tests for CRUD operations
- E2E tests for seller shop lifecycle
- RBAC tests for owner and admin access

---

## Pending Routes

| Route              | Priority  | Status     | Notes                                                                                |
| ------------------ | --------- | ---------- | ------------------------------------------------------------------------------------ |
| `/seller/settings` | 🟡 MEDIUM | ⬜ PENDING | Dedicated seller settings page. Alternative: `/seller/my-shops` for shop management. |
| `/seller/help`     | 🟢 LOW    | ⬜ PENDING | Seller help center. Alternative: `/support/ticket` or `/faq`.                        |

**Navigation Change**: Removed `/seller/settings` from SELLER_MENU_ITEMS in `navigation.ts`. Redirected to `/seller/my-shops`.

**See**: `TDD/PENDING-ROUTES.md` for full details
