# 🗺️ Routes & Pages Reference

**Project:** HobbiesSpot.com - Beyblade Ecommerce Platform  
**Last Updated:** November 2, 2025

---

## Table of Contents

1. [Public Routes](#public-routes)
2. [Authentication Routes](#authentication-routes)
3. [User Routes (Protected)](#user-routes-protected)
4. [Seller Routes (Seller/Admin)](#seller-routes)
5. [Admin Routes (Admin Only)](#admin-routes)
6. [Game Routes](#game-routes)
7. [API Routes](#api-routes)

---

## Public Routes

### `/` - Homepage

- **File:** `src/app/page.tsx`
- **Purpose:** Main landing page
- **Features:** Hero section, featured products, categories
- **Auth:** Not required

### `/products` - Product Listing

- **File:** `src/app/products/page.tsx`
- **Purpose:** Browse all products
- **Features:** Filters, search, pagination
- **Auth:** Not required

### `/products/[slug]` - Product Detail

- **File:** `src/app/products/[slug]/page.tsx`
- **Purpose:** Individual product page
- **Features:** Images, description, add to cart, reviews
- **Auth:** Not required

### `/categories` - Category Browse

- **File:** `src/app/categories/page.tsx`
- **Purpose:** Browse by category
- **Features:** Category tree, navigation
- **Auth:** Not required

### `/categories/[slug]` - Category Page

- **File:** `src/app/categories/[slug]/page.tsx`
- **Purpose:** Products in specific category
- **Features:** Filtered product list
- **Auth:** Not required

### `/about` - About Page

- **File:** `src/app/about/page.tsx`
- **Purpose:** Company information
- **Auth:** Not required

### `/contact` - Contact Page

- **File:** `src/app/contact/page.tsx`
- **Purpose:** Contact form
- **Auth:** Not required

### `/faq` - FAQ Page

- **File:** `src/app/faq/page.tsx`
- **Purpose:** Frequently asked questions
- **Auth:** Not required

### `/privacy` - Privacy Policy

- **File:** `src/app/privacy/page.tsx`
- **Purpose:** Privacy policy
- **Auth:** Not required

### `/terms` - Terms of Service

- **File:** `src/app/terms/page.tsx`
- **Purpose:** Terms and conditions
- **Auth:** Not required

### `/cookies` - Cookie Policy

- **File:** `src/app/cookies/page.tsx`
- **Purpose:** Cookie usage policy
- **Auth:** Not required

---

## Authentication Routes

### `/login` - Login Page

- **File:** `src/app/login/page.tsx`
- **Purpose:** User login
- **Features:** Email/password, social login
- **Redirect:** If authenticated → dashboard

### `/register` - Registration Page

- **File:** `src/app/register/page.tsx`
- **Purpose:** New user registration
- **Features:** Form validation, role selection
- **Redirect:** If authenticated → dashboard

---

## User Routes (Protected)

### `/profile` - User Profile

- **File:** `src/app/profile/page.tsx`
- **Purpose:** View/edit profile
- **Auth:** Required
- **Features:** Profile picture, basic info, address

### `/orders` - My Orders

- **File:** `src/app/orders/page.tsx`
- **Purpose:** View order history
- **Auth:** Required
- **Features:** Order list, status tracking

### `/orders/[id]` - Order Detail

- **File:** `src/app/orders/[id]/page.tsx`
- **Purpose:** Detailed order view
- **Auth:** Required
- **Features:** Items, status, tracking, invoice

### `/cart` - Shopping Cart

- **File:** `src/app/cart/page.tsx`
- **Purpose:** View cart
- **Auth:** Optional (guest cart supported)
- **Features:** Update quantities, remove items

### `/cart/checkout` - Checkout

- **File:** `src/app/cart/checkout/page.tsx`
- **Purpose:** Complete purchase
- **Auth:** Required
- **Features:** Address selection, payment

### `/wishlist` - Wishlist

- **File:** `src/app/wishlist/page.tsx`
- **Purpose:** Saved items
- **Auth:** Required
- **Features:** Add to cart, remove items

---

## Seller Routes

**Base:** `/seller/*`  
**Auth:** Seller or Admin role required  
**Layout:** `src/app/seller/layout.tsx` with `SellerSidebar`

### `/seller/dashboard` - Seller Dashboard

- **File:** `src/app/seller/dashboard/page.tsx`
- **Purpose:** Overview stats
- **Features:** Sales, orders, products summary

### `/seller/shop` - Shop Setup

- **File:** `src/app/seller/shop/page.tsx`
- **Components:**
  - `BasicInfoTab.tsx`
  - `AddressTab.tsx`
  - `SeoTab.tsx`
- **Purpose:** Configure shop settings
- **Features:** Shop name, description, address, SEO

### `/seller/products` - Products List

- **File:** `src/app/seller/products/page.tsx`
- **Purpose:** Manage products
- **Features:** List, search, edit, delete
- **Table:** ModernDataTable with pagination

### `/seller/products/new` - Add Product

- **File:** `src/app/seller/products/new/page.tsx`
- **Purpose:** Create new product
- **Features:** Multi-step form (4 steps)
  1. Basic Info & Pricing
  2. Media Upload
  3. SEO & Publishing
  4. Condition & Features

### `/seller/products/[id]/edit` - Edit Product

- **File:** `src/app/seller/products/[id]/edit/page.tsx`
- **Purpose:** Edit existing product
- **Features:** Same as new product form

### `/seller/orders` - Orders List

- **File:** `src/app/seller/orders/page.tsx`
- **Purpose:** View seller orders
- **Features:** Status filters, search, pagination

### `/seller/orders/[id]` - Order Detail

- **File:** `src/app/seller/orders/[id]/page.tsx`
- **Purpose:** Manage order
- **Features:** Update status, generate invoice, shipping

### `/seller/coupons` - Coupons List

- **File:** `src/app/seller/coupons/page.tsx`
- **Purpose:** Manage coupons
- **Features:** Active/expired filters

### `/seller/coupons/new` - Create Coupon

- **File:** `src/app/seller/coupons/new/page.tsx`
- **Purpose:** Create discount coupon
- **Features:** Type, value, constraints

### `/seller/coupons/[id]/edit` - Edit Coupon

- **File:** `src/app/seller/coupons/[id]/edit/page.tsx`
- **Purpose:** Modify coupon

### `/seller/sales` - Sales/Promotions

- **File:** `src/app/seller/sales/page.tsx`
- **Purpose:** Manage sales events

### `/seller/sales/new` - Create Sale

- **File:** `src/app/seller/sales/new/page.tsx`
- **Purpose:** Create promotion

### `/seller/sales/[id]/edit` - Edit Sale

- **File:** `src/app/seller/sales/[id]/edit/page.tsx`
- **Purpose:** Modify sale

### `/seller/shipments` - Shipments

- **File:** `src/app/seller/shipments/page.tsx`
- **Purpose:** Track shipments
- **Features:** Status tracking

### `/seller/shipments/[id]` - Shipment Detail

- **File:** `src/app/seller/shipments/[id]/page.tsx`
- **Purpose:** Shipment details

### `/seller/analytics` - Analytics Dashboard

- **File:** `src/app/seller/analytics/page.tsx`
- **Purpose:** Sales analytics
- **Features:** Charts, period filters, export

### `/seller/alerts` - Notifications

- **File:** `src/app/seller/alerts/page.tsx`
- **Purpose:** System notifications
- **Features:** Unread count, mark as read

---

## Admin Routes

**Base:** `/admin/*`  
**Auth:** Admin role required  
**Layout:** `src/app/admin/layout.tsx` with `AdminSidebar`

### `/admin/dashboard` - Admin Dashboard

- **File:** `src/app/admin/dashboard/page.tsx`
- **Purpose:** Platform overview
- **Features:** Users, orders, products stats

### `/admin/users` - User Management

- **File:** `src/app/admin/users/page.tsx`
- **Purpose:** Manage users
- **Features:** List, edit roles, suspend

### `/admin/categories` - Category Management

- **File:** `src/app/admin/categories/page.tsx`
- **Purpose:** Manage product categories
- **Features:** Tree structure, CRUD operations

### `/admin/products` - All Products

- **File:** `src/app/admin/products/page.tsx`
- **Purpose:** View all products
- **Features:** Approve, reject, moderate

### `/admin/orders` - All Orders

- **File:** `src/app/admin/orders/page.tsx`
- **Purpose:** View all orders
- **Features:** Status management

### `/admin/settings` - Platform Settings

- **File:** `src/app/admin/settings/page.tsx`
- **Purpose:** Configure platform

### `/admin/settings/game` - Game Settings

- **File:** `src/app/admin/settings/game/page.tsx`
- **Purpose:** Configure game parameters

### `/admin/settings/featured-categories` - Featured Categories

- **File:** `src/app/admin/settings/featured-categories/page.tsx`
- **Purpose:** Manage homepage featured categories

### `/admin/component-showcase` - Component Demo

- **File:** `src/app/admin/component-showcase/page.tsx`
- **Purpose:** Demo Phase 0 components
- **Usage:** Development reference

---

## Game Routes

### `/game` - Game Page

- **File:** `src/app/game/page.tsx`
- **Purpose:** Beyblade battle game
- **Features:** Single player mode

### `/game/multiplayer` - Multiplayer Lobby

- **File:** `src/app/game/multiplayer/page.tsx`
- **Purpose:** Join/create multiplayer battles
- **Features:** Real-time matchmaking

### Game Components (`src/app/game/components/`)

- `BattleArena.tsx` - Main game arena
- `BeybladeDisplay.tsx` - Beyblade rendering
- `GameControls.tsx` - Control interface
- `GameHUD.tsx` - Heads-up display
- `VirtualDPad.tsx` - Mobile controls
- `SpecialControlsHelp.tsx` - Help overlay
- `MultiplayerLobby.tsx` - Lobby component
- `MultiplayerBeybladeSelect.tsx` - Selection UI

---

## API Routes

See [API_ROUTES_REFERENCE.md](./API_ROUTES_REFERENCE.md) for complete API documentation.

**Quick Reference:**

### Public APIs

- `GET /api/products` - List products
- `GET /api/categories` - List categories
- `GET /api/beyblades` - Game data

### Auth APIs

- `POST /api/auth/login` - Login
- `POST /api/auth/register` - Register
- `GET /api/auth/me` - Current user
- `POST /api/auth/logout` - Logout

### Seller APIs

- `/api/seller/products` - CRUD operations
- `/api/seller/orders` - Order management
- `/api/seller/analytics` - Analytics data

### Admin APIs

- `/api/admin/users` - User management
- `/api/admin/categories` - Category CRUD
- `/api/admin/settings` - Platform settings

---

## Page File Structure

### Typical Page Structure

```tsx
// src/app/[route]/page.tsx
import { Metadata } from "next";
import RoleGuard from "@/components/features/auth/RoleGuard";
import { PageHeader } from "@/components/ui/admin-seller/PageHeader";

export const metadata: Metadata = {
  title: "Page Title | HobbiesSpot",
  description: "Page description",
};

export default function PageName() {
  return (
    <RoleGuard allowedRoles={["seller", "admin"]}>
      <div className="container mx-auto px-4 py-8">
        <PageHeader title="Page Title" />
        {/* Page content */}
      </div>
    </RoleGuard>
  );
}
```

---

## Route Protection

### Middleware (`middleware.ts`)

**Protected Routes:**

- `/profile/*`
- `/dashboard/*`
- `/admin/*`
- `/seller/*`
- `/orders/*`
- `/cart/checkout`

**Public Routes:**

- `/`
- `/products/*`
- `/categories/*`
- `/about`, `/contact`, `/faq`
- `/login`, `/register`

**Redirect Logic:**

- Unauthenticated → `/login?redirect=[intended-path]`
- Authenticated + auth route → `/` or dashboard
- Wrong role → 403 or redirect to appropriate dashboard

---

## Navigation Structure

### Main Navigation (ModernLayout v1.2.0)

**Navbar Links:**

1. Home (/)
2. Products (/products) ⭐ NEW
3. Categories (/categories)
4. Stores (/stores) ⭐ NEW
5. Game (/game)
6. Contact (/contact)

**Quick Actions:**

- 🔍 Search (/search) ⭐ NEW
- 🛒 Shopping Cart (/cart) ⭐ NEW
- 🌙 Theme Toggle
- 👤 User Profile Menu

### Footer Navigation (30+ Links)

**Shop Section:**

- All Products (/products)
- Categories (/categories)
- Stores (/stores)
- New Arrivals (/products?sort=newest)
- Best Sellers (/products?sort=popular)
- On Sale (/products?sale=true)

**Customer Service:**

- Contact Us (/contact)
- Help Center (/help)
- FAQ (/faq)
- Track Order (/account/orders)
- Returns (/account/returns)
- Shipping Info (/shipping)

**Company:**

- About Us (/about)
- Careers (/careers)
- Blog (/blog)
- Beyblade Game (/game)
- Terms of Service (/terms)
- Privacy Policy (/privacy)

**Bottom Bar:**

- Sitemap (/sitemap)
- Accessibility (/accessibility)
- Cookie Policy (/cookies)

**Social Media:**

- Facebook (external)
- Twitter (external)
- Instagram (external)

### User Menu (Authenticated)

- Profile (/profile)
- Orders (/account/orders)
- Wishlist (/account/wishlist)
- Settings (/account/settings)
- Logout

**Admin/Seller Access:**

- Admin Panel (/admin) - Admin only
- Seller Panel (/seller/dashboard) - Seller/Admin

### Admin Sidebar Menu (v1.2.0)

13 Menu Items with Logical Grouping:

**Analytics & Overview:**

1. Dashboard (/admin)
2. Analytics (/admin/analytics)

**Content Management:** 3. Products (/admin/products) 4. Categories (/admin/categories) 5. Orders (/admin/orders) 6. Users (/admin/users)

**Marketing & Sales:** 7. Coupons (/admin/coupons) ⭐ NEW 8. Sales (/admin/sales) ⭐ NEW 9. Reviews (/admin/reviews) ⭐ NEW 10. Support (/admin/support) 11. Notifications (/admin/notifications) ⭐ NEW

**System:** 12. Game (/admin/game/beyblades) 13. Settings (/admin/settings)

**Features:**

- Gradient header (blue → purple)
- Progress bar footer (75%)
- Icon animations (pulse on active)
- Sticky positioning
- Collapsible (80px ↔ 256px)

### Seller Sidebar Menu (v1.2.0)

11 Menu Items with Logical Grouping:

**Overview:**

1. Dashboard (/seller/dashboard)
2. Shop Setup (/seller/shop-setup)

**Inventory & Orders:** 3. Products (/seller/products) 4. Orders (/seller/orders) 5. Shipments (/seller/shipments)

**Marketing:** 6. Coupons (/seller/coupons) 7. Sales (/seller/sales)

**Analytics:** 8. Analytics (/seller/analytics) 9. Revenue (/seller/analytics?tab=revenue) ⭐ NEW

**Notifications & Settings:** 10. Alerts (/seller/alerts) - with badge system 11. Settings (/seller/settings)

**Features:**

- Green gradient theme (green → emerald)
- Store status indicator (🟢 Active)
- Enhanced badge system (bounce animation)
- Sticky positioning
- Collapsible (80px ↔ 256px)

---

## Route Parameters

### Dynamic Routes

| Route Pattern            | Parameter | Type          | Example         |
| ------------------------ | --------- | ------------- | --------------- |
| `/products/[slug]`       | slug      | Product slug  | `storm-pegasus` |
| `/categories/[slug]`     | slug      | Category slug | `attack-types`  |
| `/orders/[id]`           | id        | Order ID      | `ORD123456`     |
| `/seller/orders/[id]`    | id        | Order ID      | `ORD123456`     |
| `/seller/products/[id]`  | id        | Product ID    | `abc123`        |
| `/seller/coupons/[id]`   | id        | Coupon ID     | `coupon123`     |
| `/seller/sales/[id]`     | id        | Sale ID       | `sale456`       |
| `/seller/shipments/[id]` | id        | Shipment ID   | `ship789`       |

### Query Parameters

| Route               | Query Params                          | Purpose           |
| ------------------- | ------------------------------------- | ----------------- |
| `/products`         | `page`, `limit`, `category`, `search` | Pagination/filter |
| `/categories`       | `format` (tree/list), `search`        | Display mode      |
| `/seller/orders`    | `status`, `page`, `limit`             | Filter orders     |
| `/seller/analytics` | `period` (7days, 30days, etc.)        | Date range        |

---

## SEO & Metadata

All pages include:

- Title (< 60 characters)
- Description (150-160 characters)
- OpenGraph tags
- Twitter cards
- Canonical URLs

**Dynamic Metadata Example:**

```tsx
export async function generateMetadata({ params }): Promise<Metadata> {
  const product = await getProduct(params.slug);

  return {
    title: `${product.name} | HobbiesSpot`,
    description: product.description,
    openGraph: {
      title: product.name,
      description: product.description,
      images: [product.image],
    },
  };
}
```

---

## Quick Reference

### Adding a New Page

1. Create file: `src/app/[route]/page.tsx`
2. Add metadata export
3. Add auth protection if needed
4. Use PageHeader for consistency
5. Update navigation if needed

### Page Size Guidelines

- Simple pages: < 200 lines
- Complex pages: < 300 lines
- Use components for anything larger
- Split into tabs if multi-section

---

_Last Updated: November 2, 2025_  
_For component usage, see [COMPONENTS_REFERENCE.md](./COMPONENTS_REFERENCE.md)_
