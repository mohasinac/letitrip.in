# Main App Source Code Documentation

> **Documentation for**: `/src` directory  
> **Last Updated**: January 19, 2026  
> **Purpose**: Central documentation for main application code structure, hooks, utilities, components, contexts, and migration recommendations

---

## 📁 Directory Structure Overview

```
src/
├── app/                    # Next.js App Router pages and API routes
│   ├── (public)/          # Public pages (unauthenticated)
│   ├── (auth)/            # Auth pages (login, register)
│   ├── (protected)/       # Protected pages (requires auth)
│   ├── (admin)/           # Admin-only pages
│   ├── api/               # API routes (44+ endpoints)
│   ├── demo/              # Demo pages
│   └── actions/           # Server actions
├── components/             # React components organized by feature
├── config/                 # App configuration files
├── constants/              # Application constants and enums
├── contexts/               # React Context providers for global state
├── emails/                 # Email templates
├── hooks/                  # Custom React hooks
├── lib/                    # Core utilities and Firebase setup
├── services/               # API service layer
├── styles/                 # Global styles and Tailwind
├── templates/              # Page templates
└── types/                  # TypeScript type definitions
```

---

## � App Structure (`/src/app`)

The Next.js App Router application with route groups for access control.

### Route Groups

| Route Group    | Purpose                  | Access Level    | Examples                               |
| -------------- | ------------------------ | --------------- | -------------------------------------- |
| `(public)/`    | Public pages             | Everyone        | Home, product listings, shop pages     |
| `(auth)/`      | Authentication pages     | Unauthenticated | Login, register, password reset        |
| `(protected)/` | User-authenticated pages | Logged-in users | Profile, orders, messages, wishlist    |
| `(admin)/`     | Admin dashboard          | Admin only      | Analytics, user management, moderation |
| `api/`         | API endpoints            | RBAC-based      | 44+ REST API routes                    |
| `actions/`     | Server actions           | Various         | Form submissions, mutations            |
| `demo/`        | Demo/sandbox pages       | Development     | Test data, component demos             |

### Public Pages Structure

```
(public)/
├── page.tsx                    # Homepage
├── products/                   # Product browsing
│   ├── [slug]/                # Product detail
│   └── category/[slug]/       # Category products
├── auctions/                   # Auction browsing
│   └── [slug]/                # Auction detail
├── shops/                      # Shop directory
│   └── [slug]/                # Shop page
├── search/                     # Search results
├── about/                      # About page
└── contact/                    # Contact page
```

### Protected Pages Structure

```
(protected)/
└── user/
    ├── profile/               # User profile
    ├── orders/                # Order history
    ├── messages/              # Messaging
    ├── wishlist/              # Favorites
    ├── addresses/             # Saved addresses
    └── settings/              # Account settings
```

### Admin Pages Structure

```
(admin)/
└── admin/
    ├── dashboard/             # Admin dashboard
    ├── analytics/             # Analytics & reports
    ├── users/                 # User management
    ├── products/              # Product management
    ├── auctions/              # Auction management
    ├── orders/                # Order management
    ├── shops/                 # Shop management
    ├── categories/            # Category management
    ├── reviews/               # Review moderation
    ├── blog/                  # Blog management
    └── settings/              # System settings
```

---

## 🔌 API Routes (`/src/app/api`)

RESTful API with **44+ endpoint groups** using Next.js App Router and Firebase.

### API Architecture

- **Framework**: Next.js 14+ App Router
- **Database**: Firebase Firestore
- **Auth**: Firebase Auth with custom RBAC
- **Middleware**: Rate limiting, caching, RBAC
- **Query Language**: Sieve (filtering, sorting, pagination)
- **Response Format**: JSON with standardized error handling

### Authentication & Authorization

All API routes use **Role-Based Access Control (RBAC)**:

- **Public**: No auth required
- **User**: Requires authentication
- **Seller**: Requires seller role
- **Admin**: Requires admin role

### API Endpoint Groups

#### 🔐 Authentication (`/api/auth`)

| Endpoint                | Method | Auth   | Description         |
| ----------------------- | ------ | ------ | ------------------- |
| `/auth/login`           | POST   | Public | User login          |
| `/auth/register`        | POST   | Public | User registration   |
| `/auth/logout`          | POST   | User   | User logout         |
| `/auth/session`         | GET    | Public | Get current session |
| `/auth/verify-email`    | POST   | Public | Email verification  |
| `/auth/reset-password`  | POST   | Public | Password reset      |
| `/auth/change-password` | POST   | User   | Change password     |

#### 👤 Users (`/api/users`, `/api/user`)

| Endpoint          | Method         | Auth  | Description      |
| ----------------- | -------------- | ----- | ---------------- |
| `/users`          | GET            | Admin | List all users   |
| `/users/:id`      | GET/PUT/DELETE | Admin | User CRUD        |
| `/users/bulk`     | POST           | Admin | Bulk operations  |
| `/users/:id/ban`  | POST           | Admin | Ban/unban user   |
| `/user/profile`   | GET/PUT        | User  | User profile     |
| `/user/addresses` | GET/POST       | User  | Manage addresses |
| `/user/orders`    | GET            | User  | User orders      |
| `/user/wishlist`  | GET            | User  | User wishlist    |

#### 🛍️ Products (`/api/products`)

| Endpoint                | Method     | Auth         | Description                |
| ----------------------- | ---------- | ------------ | -------------------------- |
| `/products`             | GET        | Public       | List products (with Sieve) |
| `/products`             | POST       | Seller       | Create product             |
| `/products/:id`         | GET        | Public       | Product by ID              |
| `/products/:slug`       | GET        | Public       | Product by slug            |
| `/products/:id`         | PUT/DELETE | Seller/Admin | Update/delete product      |
| `/products/bulk`        | POST       | Admin        | Bulk operations            |
| `/products/:id/reviews` | GET        | Public       | Product reviews            |

#### 🎯 Auctions (`/api/auctions`)

| Endpoint                 | Method | Auth   | Description         |
| ------------------------ | ------ | ------ | ------------------- |
| `/auctions`              | GET    | Public | List auctions       |
| `/auctions`              | POST   | Seller | Create auction      |
| `/auctions/:id`          | GET    | Public | Auction details     |
| `/auctions/:id/bids`     | GET    | Public | Auction bids        |
| `/auctions/:id/bids`     | POST   | User   | Place bid           |
| `/auctions/:id/auto-bid` | POST   | User   | Enable auto-bidding |
| `/auctions/:id/watch`    | POST   | User   | Watch auction       |
| `/auctions/my-bids`      | GET    | User   | User's bids         |
| `/auctions/watchlist`    | GET    | User   | Watched auctions    |
| `/auctions/won`          | GET    | User   | Won auctions        |

#### 📁 Categories (`/api/categories`)

| Endpoint                          | Method     | Auth   | Description         |
| --------------------------------- | ---------- | ------ | ------------------- |
| `/categories`                     | GET        | Public | List categories     |
| `/categories`                     | POST       | Admin  | Create category     |
| `/categories/:id`                 | GET        | Public | Category by ID      |
| `/categories/:slug`               | GET        | Public | Category by slug    |
| `/categories/:id`                 | PUT/DELETE | Admin  | Update/delete       |
| `/categories/tree`                | GET        | Public | Category tree       |
| `/categories/featured`            | GET        | Public | Featured categories |
| `/categories/:slug/products`      | GET        | Public | Category products   |
| `/categories/:slug/subcategories` | GET        | Public | Subcategories       |

#### 🏪 Shops (`/api/shops`)

| Endpoint              | Method | Auth         | Description   |
| --------------------- | ------ | ------------ | ------------- |
| `/shops`              | GET    | Public       | List shops    |
| `/shops/:id`          | GET    | Public       | Shop details  |
| `/shops/:slug`        | GET    | Public       | Shop by slug  |
| `/shops/:id`          | PUT    | Seller/Admin | Update shop   |
| `/shops/:id/products` | GET    | Public       | Shop products |
| `/shops/:id/auctions` | GET    | Public       | Shop auctions |
| `/shops/:id/reviews`  | GET    | Public       | Shop reviews  |

#### 🛒 Cart (`/api/cart`)

| Endpoint         | Method | Auth | Description      |
| ---------------- | ------ | ---- | ---------------- |
| `/cart`          | GET    | User | Get cart         |
| `/cart`          | POST   | User | Add to cart      |
| `/cart/:id`      | PUT    | User | Update cart item |
| `/cart/:id`      | DELETE | User | Remove from cart |
| `/cart/clear`    | POST   | User | Clear cart       |
| `/cart/validate` | POST   | User | Validate cart    |

#### 📦 Orders (`/api/orders`)

| Endpoint               | Method | Auth         | Description   |
| ---------------------- | ------ | ------------ | ------------- |
| `/orders`              | GET    | User/Admin   | List orders   |
| `/orders`              | POST   | User         | Create order  |
| `/orders/:id`          | GET    | User/Admin   | Order details |
| `/orders/:id`          | PUT    | Seller/Admin | Update order  |
| `/orders/:id/cancel`   | POST   | User         | Cancel order  |
| `/orders/:id/tracking` | GET    | User         | Track order   |
| `/orders/:id/invoice`  | GET    | User         | Order invoice |

#### 💳 Payments (`/api/payments`)

| Endpoint               | Method | Auth       | Description     |
| ---------------------- | ------ | ---------- | --------------- |
| `/payments`            | GET    | Admin      | List payments   |
| `/payments/:id`        | GET    | User/Admin | Payment details |
| `/payments/verify`     | POST   | User       | Verify payment  |
| `/payments/:id/refund` | POST   | Admin      | Refund payment  |
| `/payments/methods`    | GET    | Public     | Payment methods |

#### 🎟️ Coupons (`/api/coupons`)

| Endpoint            | Method | Auth   | Description     |
| ------------------- | ------ | ------ | --------------- |
| `/coupons`          | GET    | Admin  | List coupons    |
| `/coupons/:code`    | GET    | Public | Get coupon      |
| `/coupons/validate` | POST   | User   | Validate coupon |
| `/coupons/apply`    | POST   | User   | Apply coupon    |

#### 📸 Media (`/api/media`)

| Endpoint                 | Method | Auth  | Description     |
| ------------------------ | ------ | ----- | --------------- |
| `/media/upload`          | POST   | User  | Upload file     |
| `/media/upload-multiple` | POST   | User  | Upload multiple |
| `/media/delete`          | DELETE | User  | Delete file     |
| `/media`                 | GET    | Admin | List media      |

#### 🔍 Search (`/api/search`)

| Endpoint           | Method | Auth   | Description     |
| ------------------ | ------ | ------ | --------------- |
| `/search`          | GET    | Public | Global search   |
| `/search/products` | GET    | Public | Search products |
| `/search/auctions` | GET    | Public | Search auctions |
| `/search/shops`    | GET    | Public | Search shops    |

#### ⭐ Reviews (`/api/reviews`)

| Endpoint               | Method         | Auth       | Description   |
| ---------------------- | -------------- | ---------- | ------------- |
| `/reviews`             | GET            | Public     | List reviews  |
| `/reviews`             | POST           | User       | Create review |
| `/reviews/:id`         | GET/PUT/DELETE | User/Admin | Review CRUD   |
| `/reviews/:id/helpful` | POST           | User       | Mark helpful  |

#### 💰 Payouts (`/api/payouts`)

| Endpoint           | Method | Auth         | Description     |
| ------------------ | ------ | ------------ | --------------- |
| `/payouts`         | GET    | Seller/Admin | List payouts    |
| `/payouts/request` | POST   | Seller       | Request payout  |
| `/payouts/:id`     | GET    | Seller/Admin | Payout details  |
| `/payouts/pending` | GET    | Admin        | Pending payouts |

#### 📊 Analytics (`/api/analytics`)

| Endpoint     | Method | Auth         | Description    |
| ------------ | ------ | ------------ | -------------- |
| `/analytics` | GET    | Seller/Admin | Analytics data |

#### 🎫 Support Tickets (`/api/tickets`)

| Endpoint             | Method  | Auth       | Description     |
| -------------------- | ------- | ---------- | --------------- |
| `/tickets`           | GET     | User       | List tickets    |
| `/tickets`           | POST    | User       | Create ticket   |
| `/tickets/:id`       | GET/PUT | User/Admin | Ticket CRUD     |
| `/tickets/:id/reply` | POST    | User/Admin | Reply to ticket |

#### 🔄 Returns (`/api/returns`)

| Endpoint       | Method  | Auth       | Description   |
| -------------- | ------- | ---------- | ------------- |
| `/returns`     | POST    | User       | Create return |
| `/returns/:id` | GET/PUT | User/Admin | Return CRUD   |

#### 🏠 Homepage (`/api/homepage`, `/api/hero-slides`)

| Endpoint           | Method     | Auth         | Description         |
| ------------------ | ---------- | ------------ | ------------------- |
| `/homepage`        | GET/PUT    | Public/Admin | Homepage settings   |
| `/hero-slides`     | GET        | Public       | List hero slides    |
| `/hero-slides`     | POST       | Admin        | Create hero slide   |
| `/hero-slides/:id` | PUT/DELETE | Admin        | Update/delete slide |

#### 📧 Email (`/api/email`)

| Endpoint      | Method | Auth | Description |
| ------------- | ------ | ---- | ----------- |
| `/email/send` | POST   | User | Send email  |

#### 🏥 System (`/api/health`)

| Endpoint  | Method | Auth   | Description  |
| --------- | ------ | ------ | ------------ |
| `/health` | GET    | Public | Health check |

### API Features

#### 🔍 Sieve Query Language

All list endpoints support advanced filtering:

```
GET /api/products?filters=price>100,price<500&sorts=-created_at&page=1&pageSize=20
```

**Supported Operations**:

- **Filtering**: `==`, `!=`, `>`, `<`, `>=`, `<=`, `@=` (contains), `_=` (starts with), `!@=` (not contains)
- **Sorting**: Prefix with `-` for descending
- **Pagination**: `page` and `pageSize` parameters
- **Field Selection**: Coming soon

#### 🛡️ Middleware Stack

Each API route uses a combination of:

1. **Rate Limiting** - Prevents abuse
2. **RBAC Auth** - Role-based access control
3. **Caching** - Response caching for performance
4. **Error Handling** - Standardized error responses
5. **Validation** - Request/response validation

#### 📝 Response Format

```typescript
// Success Response
{
  "data": {...},
  "meta": {
    "page": 1,
    "pageSize": 20,
    "totalCount": 100,
    "totalPages": 5
  }
}

// Error Response
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input",
    "details": [...]
  }
}
```

### API Constants

All endpoints are defined in [src/constants/api-routes.ts](src/constants/api-routes.ts):

```typescript
import { API_ROUTES } from "@/constants/api-routes";

// Usage
const url = API_ROUTES.PRODUCT.BY_ID("product-123");
// => "/products/product-123"
```

---

## �🎣 Hooks (`/src/hooks`)

### ✅ Can Be Replaced by Library

These hooks are **simple wrappers** around `@letitrip/react-library` hooks. They exist only to inject app-specific contexts. Consider importing directly from the library if context injection isn't needed.

| Hook                       | Status          | Library Equivalent                          | Recommendation                                                              |
| -------------------------- | --------------- | ------------------------------------------- | --------------------------------------------------------------------------- |
| `useAuthActions.ts`        | 🟡 Wrapper      | `@letitrip/react-library`                   | **Keep** - Injects AuthActionsContext                                       |
| `useAuthState.ts`          | 🟡 Wrapper      | `@letitrip/react-library`                   | **Keep** - Injects AuthStateContext                                         |
| `useConversationState.ts`  | ✅ Duplicate    | `@letitrip/react-library`                   | **DELETE** - Use library version directly                                   |
| `useDialogState.ts`        | ✅ Available    | `@letitrip/react-library` (useDialogState)  | **DELETE** - Use library version                                            |
| `useFetchResourceList.ts`  | ✅ Available    | `@letitrip/react-library` (useResourceList) | **Review & Migrate** - Library has better version                           |
| `usePasswordFieldState.ts` | ✅ Available    | `@letitrip/react-library`                   | **DELETE** - Use library version                                            |
| `useSafeLoad.ts`           | ✅ Available    | `@letitrip/react-library`                   | **DELETE** - Use library version                                            |
| `useUrlPagination.ts`      | ⚠️ App-specific | `@letitrip/react-library`                   | **Review** - App version uses Next.js router, library is framework-agnostic |
| `useVirtualList.ts`        | ✅ Duplicate    | `@letitrip/react-library`                   | **DELETE** - Use library version                                            |

### 🔧 App-Specific Hooks (Keep)

These hooks contain **business logic specific** to the LetItRip.in app and should be kept.

| Hook                    | Purpose                                            | Dependencies   | Notes                                                 |
| ----------------------- | -------------------------------------------------- | -------------- | ----------------------------------------------------- |
| `useHeaderStats.ts`     | Fetch header stats (cart, notifications, messages) | API Service    | **Keep** - App-specific business logic                |
| `useNavigationGuard.ts` | Prevent navigation with unsaved changes            | Next.js Router | **Keep** - But consider using library version as base |

### 📁 Query Hooks (`/src/hooks/queries`)

Domain-specific React Query hooks for data fetching:

| Hook             | Purpose                | Service               | Status                  |
| ---------------- | ---------------------- | --------------------- | ----------------------- |
| `useCart.ts`     | Cart data fetching     | cart.service.ts       | **Keep** - App-specific |
| `useCategory.ts` | Category data fetching | categories.service.ts | **Keep** - App-specific |
| `useOrder.ts`    | Order data fetching    | orders.service.ts     | **Keep** - App-specific |
| `useProduct.ts`  | Product data fetching  | products.service.ts   | **Keep** - App-specific |
| `useShop.ts`     | Shop data fetching     | shops.service.ts      | **Keep** - App-specific |
| `useUser.ts`     | User data fetching     | users.service.ts      | **Keep** - App-specific |

---

## 🔧 Utilities (`/src/lib`)

### Core Utilities

| File              | Purpose                | Library Alternative          | Recommendation                                        |
| ----------------- | ---------------------- | ---------------------------- | ----------------------------------------------------- |
| `utils.ts`        | `cn()` class merger    | `@letitrip/react-library/cn` | **DELETE** - Use library version                      |
| `formatters.ts`   | Price, date formatting | `@letitrip/react-library`    | **Review** - Merge app-specific formatters to library |
| `validators.ts`   | Form validation        | `@letitrip/react-library`    | **Review** - Migrate to library                       |
| `date-utils.ts`   | Date manipulation      | `@letitrip/react-library`    | **Review** - Merge with library                       |
| `price.utils.ts`  | Price calculations     | `@letitrip/react-library`    | **Review** - Already in library                       |
| `sanitize.ts`     | XSS sanitization       | `@letitrip/react-library`    | ✅ Already in library                                 |
| `errors.ts`       | Error handling         | `@letitrip/react-library`    | ✅ Already in library                                 |
| `error-logger.ts` | Error logging          | `@letitrip/react-library`    | ✅ Already in library                                 |

### App-Specific Utilities (Keep)

| File                          | Purpose                          | Status                  |
| ----------------------------- | -------------------------------- | ----------------------- |
| `firebase/`                   | Firebase initialization & config | **Keep** - App-specific |
| `firebase-error-logger.ts`    | Firebase error logging           | **Keep** - App-specific |
| `analytics.ts`                | Analytics tracking               | **Keep** - App-specific |
| `seo/`                        | SEO utilities                    | **Keep** - App-specific |
| `theme/`                      | Theme management                 | **Keep** - App-specific |
| `i18n/`                       | Internationalization             | **Keep** - App-specific |
| `media/`                      | Media processing                 | **Keep** - App-specific |
| `rbac-permissions.ts`         | Role-based access control        | **Keep** - App-specific |
| `payment-gateway-selector.ts` | Payment gateway logic            | **Keep** - App-specific |
| `category-hierarchy.ts`       | Category tree logic              | **Keep** - App-specific |
| `link-utils.ts`               | URL utilities                    | **Keep** - App-specific |
| `rate-limiter.ts`             | Rate limiting                    | **Keep** - App-specific |

### Utils Subdirectory (`/src/lib/utils/`)

| File                | Purpose                   | Status                                 |
| ------------------- | ------------------------- | -------------------------------------- |
| `category-utils.ts` | Category helper functions | **Keep** - App-specific business logic |

---

## 📦 Constants (`/src/constants`)

All constants are **app-specific** and should be kept. They define business rules, routes, API endpoints, and configuration for LetItRip.in.

### Structure

| File                          | Purpose             | Examples                                    |
| ----------------------------- | ------------------- | ------------------------------------------- |
| `routes.ts`                   | All app routes      | `/products`, `/auctions`, `/user/dashboard` |
| `api-routes.ts`               | API endpoint paths  | `/api/products`, `/api/cart`                |
| `api-constants.ts`            | API configuration   | Base URLs, headers                          |
| `categories.ts`               | Product categories  | Electronics, Fashion, Home & Garden         |
| `statuses.ts`                 | Status enums        | ORDER_STATUS, AUCTION_STATUS                |
| `validation-constants.ts`     | Validation rules    | Min/max lengths, patterns                   |
| `validation-messages.ts`      | Error messages      | Form validation messages                    |
| `business-logic-constants.ts` | Business rules      | Commission rates, limits                    |
| `limits.ts`                   | System limits       | Max file size, max items                    |
| `navigation.ts`               | Nav menu structure  | Header, footer, sidebar links               |
| `site.ts`                     | Site metadata       | Site name, description, contact             |
| `colors.ts`                   | Brand colors        | Primary, secondary, accent colors           |
| `filters.ts`                  | Filter options      | Price ranges, sort options                  |
| `form-fields.ts`              | Form configurations | Field definitions                           |
| `tabs.ts`                     | Tab configurations  | User dashboard tabs                         |
| `ui-constants.ts`             | UI constants        | Animation durations, z-indexes              |
| `time-constants.ts`           | Time values         | Durations, intervals                        |
| `about.ts`                    | About page content  | Company info                                |
| `faq.ts`                      | FAQ content         | Questions and answers                       |
| `footer.ts`                   | Footer content      | Links, copyright                            |
| `whatsapp-templates.ts`       | WhatsApp messages   | Message templates                           |

**Recommendation**: ✅ **Keep all constants** - They are app-specific business logic.

---

## 🎨 Components (`/src/components`)

Components are organized by feature/domain. All are app-specific and should be kept.

### Structure

```
components/
├── admin/              # Admin dashboard components
├── auction/            # Auction-related components
├── auth/               # Authentication UI
├── cards/              # Card components (Product, Shop, User)
├── cart/               # Cart & checkout components
├── category/           # Category browsing
├── checkout/           # Checkout flow
├── common/             # Shared/reusable components
├── error-boundary.tsx  # Error boundary wrapper
├── events/             # Event management
├── filters/            # Filter components
├── forms/              # Form components
├── homepage/           # Homepage sections
├── layout/             # Layout components (Header, Footer)
├── media/              # Image/video components
├── mobile/             # Mobile-specific UI
├── navigation/         # Navigation components
├── product/            # Product display components
├── products/           # Product listing components
├── providers/          # Context providers
├── search/             # Search UI
├── seller/             # Seller dashboard
├── shop/               # Shop pages
├── ui/                 # Base UI components (Button, Input, etc.)
├── upload/             # File upload components
├── user/               # User profile components
├── wizards/            # Multi-step wizards
└── wrappers/           # HOC wrappers
```

### Library vs App Components

The `@letitrip/react-library` package contains **base UI components** (buttons, inputs, modals, etc.) and **framework-agnostic utilities**.

**Main App Components** are **feature-specific** and use the library components as building blocks.

**Recommendation**: ✅ **Keep all app components** - They implement business logic and features.

---

## 🌍 Contexts (`/src/contexts`)

React Context providers for global state management.

### Context Files

| Context                     | Purpose                   | Library Alternative                  | Status                           |
| --------------------------- | ------------------------- | ------------------------------------ | -------------------------------- |
| `AuthContext.tsx`           | Authentication state      | Uses `@letitrip/react-library` hooks | **Keep** - App-specific provider |
| `auth/`                     | Split auth contexts       | AuthStateContext, AuthActionsContext | **Keep** - App-specific          |
| `ComparisonContext.tsx`     | Product comparison        | None                                 | **Keep** - App-specific feature  |
| `FeatureFlagContext.tsx`    | Feature flags             | None                                 | **Keep** - App-specific          |
| `GlobalSearchContext.tsx`   | Global search state       | None                                 | **Keep** - App-specific          |
| `LoginRegisterContext.tsx`  | Login/register form state | None                                 | **Keep** - App-specific          |
| `ModalContext.tsx`          | Modal management          | None                                 | **Keep** - App-specific          |
| `NotificationContext.tsx`   | Toast notifications       | None                                 | **Keep** - App-specific          |
| `ServicesContext.tsx`       | Service injection         | Uses library adapters                | **Keep** - App-specific          |
| `ThemeContext.tsx`          | Theme switching           | None                                 | **Keep** - App-specific          |
| `UploadContext.tsx`         | File upload state         | None                                 | **Keep** - App-specific          |
| `ViewingHistoryContext.tsx` | Recently viewed products  | None                                 | **Keep** - App-specific          |

**Recommendation**: ✅ **Keep all contexts** - They manage app-specific state.

---

## 🛠️ Services (`/src/services`)

API service layer - all HTTP requests go through these services.

### Service Architecture

All services extend `BaseService` which provides:

- HTTP methods (GET, POST, PUT, DELETE, PATCH)
- Error handling with `logServiceError` from `@letitrip/react-library`
- Request/response transformation
- Loading states

### Service Files

| Service                   | Purpose               | Status   |
| ------------------------- | --------------------- | -------- |
| `base-service.ts`         | Base service class    | **Keep** |
| `api.service.ts`          | Generic API service   | **Keep** |
| `auth.service.ts`         | Authentication API    | **Keep** |
| `products.service.ts`     | Product CRUD          | **Keep** |
| `auctions.service.ts`     | Auction management    | **Keep** |
| `cart.service.ts`         | Cart operations       | **Keep** |
| `orders.service.ts`       | Order management      | **Keep** |
| `payment.service.ts`      | Payment processing    | **Keep** |
| `shops.service.ts`        | Shop management       | **Keep** |
| `users.service.ts`        | User management       | **Keep** |
| `categories.service.ts`   | Category data         | **Keep** |
| `reviews.service.ts`      | Review system         | **Keep** |
| `favorites.service.ts`    | Favorites/wishlist    | **Keep** |
| `messages.service.ts`     | Messaging             | **Keep** |
| `notification.service.ts` | Notifications         | **Keep** |
| `search.service.ts`       | Search functionality  | **Keep** |
| `media.service.ts`        | Media upload          | **Keep** |
| `shipping.service.ts`     | Shipping calculations | **Keep** |
| `returns.service.ts`      | Returns/refunds       | **Keep** |
| `comparison.service.ts`   | Product comparison    | **Keep** |
| `blog.service.ts`         | Blog/content          | **Keep** |
| `analytics.service.ts`    | Analytics tracking    | **Keep** |

**Plus 20+ more services for specific features...**

**Recommendation**: ✅ **Keep all services** - They implement app-specific API logic.

---

## 📄 Config (`/src/config`)

Configuration files for the application.

| File                 | Purpose           | Status                  |
| -------------------- | ----------------- | ----------------------- |
| Various config files | App configuration | **Keep** - App-specific |

---

## 📧 Emails (`/src/emails`)

Email templates (likely React Email or similar).

**Recommendation**: ✅ **Keep** - App-specific email templates.

---

## 🎨 Styles (`/src/styles`)

Global styles and Tailwind CSS configuration.

**Recommendation**: ✅ **Keep** - App-specific styling.

---

## 📝 Templates (`/src/templates`)

Page templates.

**Recommendation**: ✅ **Keep** - App-specific templates.

---

## 📘 Types (`/src/types`)

TypeScript type definitions for the application.

**Recommendation**: ✅ **Keep** - App-specific types.

---

## 🔄 Migration Action Plan

### Phase 1: Remove Duplicate Hooks (Low Risk)

**DELETE these files** and update imports to use `@letitrip/react-library`:

```typescript
// BEFORE
import { useDialogState } from "@/hooks/useDialogState";
import { usePasswordFieldState } from "@/hooks/usePasswordFieldState";
import { useSafeLoad } from "@/hooks/useSafeLoad";
import { useVirtualList } from "@/hooks/useVirtualList";
import { useConversationState } from "@/hooks/useConversationState";

// AFTER
import {
  useDialogState,
  usePasswordFieldState,
  useSafeLoad,
  useVirtualList,
  useConversationState,
} from "@letitrip/react-library";
```

**Files to delete:**

- ❌ `src/hooks/useDialogState.ts`
- ❌ `src/hooks/usePasswordFieldState.ts`
- ❌ `src/hooks/useSafeLoad.ts`
- ❌ `src/hooks/useVirtualList.ts`
- ❌ `src/hooks/useConversationState.ts`

### Phase 2: Remove Duplicate Utilities (Low Risk)

**DELETE** and update imports:

```typescript
// BEFORE
import { cn } from "@/lib/utils";

// AFTER
import { cn } from "@letitrip/react-library";
```

**Files to delete:**

- ❌ `src/lib/utils.ts` (only contains `cn()` function)

### Phase 3: Review useFetchResourceList (Medium Risk)

Compare `src/hooks/useFetchResourceList.ts` with library's `useResourceList`. If functionality is identical, delete and migrate.

### Phase 4: Review useUrlPagination (Medium Risk)

The app version is tightly coupled to Next.js router. The library version is framework-agnostic. Keep app version for now, but consider migrating to library's approach.

### Phase 5: Review useNavigationGuard (Low Risk)

App version is Next.js specific. Library version is framework-agnostic. Consider using library version as base and extending if needed.

---

## 📊 Summary Statistics

### Hooks Analysis

| Category            | Count  | Action                       |
| ------------------- | ------ | ---------------------------- |
| Delete (duplicates) | 5      | Use library versions         |
| Keep (wrappers)     | 2      | Needed for context injection |
| Keep (app-specific) | 2      | Business logic               |
| Keep (query hooks)  | 6      | Domain-specific              |
| **Total**           | **15** |                              |

### Utilities Analysis

| Category            | Count   | Action               |
| ------------------- | ------- | -------------------- |
| Delete/Review       | 7       | Use library or merge |
| Keep (app-specific) | 15+     | Business logic       |
| **Total**           | **22+** |                      |

### Code Reusability Score

- **Constants**: 100% app-specific ✅
- **Components**: 100% app-specific ✅
- **Contexts**: 100% app-specific ✅
- **Services**: 100% app-specific ✅
- **Hooks**: 33% can be deleted/replaced ⚠️
- **Utilities**: ~30% can be deleted/replaced ⚠️

---

## 🎯 Quick Reference

### Import Cheat Sheet

```typescript
// ✅ USE LIBRARY - Generic utilities
import {
  cn,
  formatPrice,
  formatDate,
  useDialogState,
  usePasswordFieldState,
  useSafeLoad,
  useVirtualList,
  useConversationState,
  useDebounce,
  useLocalStorage,
  useMediaQuery,
} from "@letitrip/react-library";

// ✅ USE APP - Business logic
import { useHeaderStats } from "@/hooks/useHeaderStats";
import { useCart } from "@/hooks/queries/useCart";
import { productsService } from "@/services/products.service";
import { ROUTES } from "@/constants/routes";

// ⚠️ USE APP (but with library injection)
import { useAuthState, useAuthActions } from "@/hooks/useAuthState";
```

---

## 🔗 Related Documentation

- **Library Documentation**: `/react-library/docs/index.md`
- **Constants Documentation**: `/src/constants/README.md`
- **Migration Guide**: `/MIGRATION-QUICK-REFERENCE.md`
- **AI Agent Guide**: `/NDocs/getting-started/AI-AGENT-GUIDE.md`

---

## 💡 Best Practices

1. **Always check library first** - Before creating a new utility/hook, check if it exists in `@letitrip/react-library`
2. **Keep business logic in app** - Only generic, reusable code goes in the library
3. **Use TypeScript** - All new code should be fully typed
4. **Follow existing patterns** - Match the architecture of similar files
5. **Test after migration** - Always test when replacing hooks/utils with library versions

---

## 🚀 Getting Started

### For New Developers

1. Read this document to understand the code structure
2. Check `/NDocs/getting-started/AI-AGENT-GUIDE.md` for AI assistance
3. Review `/react-library/docs/` for available library components
4. Look at existing similar code before creating new files

### For AI Agents

- Prefer library utilities over creating new ones
- Keep business logic in the app
- Follow the migration recommendations above
- Always read existing code before editing

---

**Last Updated**: January 19, 2026  
**Maintainer**: Development Team  
**Status**: ✅ Active Development
