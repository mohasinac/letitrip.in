# src/app - Next.js App Router Directory Documentation

## Overview

The `src/app` directory contains all Next.js App Router pages, layouts, API routes, and server actions. This follows the Next.js 13+ App Router convention where folder structure defines routes.

**Route Groups**: Pages are organized into route groups for better structure:

- `(public)` - Public pages (products, shops, categories, etc.)
- `(auth)` - Authentication pages (login, register, etc.)
- `(protected)` - Protected pages requiring authentication (user, cart, seller, etc.)
- `(admin)` - Admin dashboard pages

## Key Files

### Layout & Error Handling

#### `layout.tsx`

- **Purpose**: Root layout component for the entire application
- **Features**:
  - Provides global context providers (Auth, Theme, Search, Comparison)
  - Includes Header, Footer, BottomNav components
  - Implements PWA manifest and theme script
  - SEO metadata and JSON-LD schemas
  - Toast notifications and error initialization
  - Mobile install prompt and offline indicator
- **Providers Included**:
  - AuthProvider - Authentication state
  - ThemeProvider - Dark/light mode
  - LoginRegisterProvider - Login/register modals
  - GlobalSearchProvider - Global search state
  - ComparisonProvider - Product comparison
  - ViewingHistoryProvider - User viewing history
  - I18nProvider - Internationalization

#### `global-error.tsx`

- **Purpose**: Global error boundary for unhandled errors
- **Features**: Catches and displays errors that escape other error boundaries

#### `error.tsx`

- **Purpose**: Error boundary for app directory
- **Features**: Catches errors in page components, provides retry functionality

#### `not-found.tsx`

- **Purpose**: 404 page for non-existent routes
- **Features**: Custom 404 UI with navigation suggestions

## Route Groups

### `(public)/` - Public Pages

Public pages accessible without authentication.

#### `(public)/layout.tsx`

- **Purpose**: Minimal layout for public pages
- **Features**:
  - SEO metadata configured for public indexing
  - No authentication required
  - Relies on root layout for Header, Footer, Breadcrumbs
  - Intentionally minimal for page flexibility

**Pages**:

- `/products` - Product listing with filters and search
- `/shops` - Shop directory and individual shop pages
- `/categories` - Category navigation and filtered views
- `/auctions` - Live and upcoming auctions
- `/blog` - Blog posts and articles
- `/reviews` - Product and shop reviews
- `/search` - Global search results
- `/compare` - Product comparison tool
- `/company` - About us and company information
- `/contact` - Contact form
- `/faq` - Frequently asked questions
- `/guide` - User guides and tutorials
- `/events` - Platform events
- `/fees` - Fee structure information
- `/privacy-policy` - Privacy policy
- `/terms-of-service` - Terms of service
- `/cookie-policy` - Cookie policy
- `/shipping-policy` - Shipping policy
- `/refund-policy` - Refund policy

### `(auth)/` - Authentication Pages

Authentication-related pages. Users already logged in are redirected to their dashboard.

#### `(auth)/layout.tsx`

- **Purpose**: Client-side layout for authentication pages
- **Features**:
  - Redirects authenticated users to appropriate dashboard
  - Role-based redirect (admin → /admin, seller → /seller, user → /user)
  - Minimal centered layout for auth forms
  - Loading state during authentication check
  - No header/footer for focused experience

**Pages**:

- `/login` - User login
- `/register` - User registration
- `/logout` - Logout confirmation
- `/forgot-password` - Password reset request
- `/reset-password` - Password reset with token

### `(protected)/` - Protected Pages

Pages requiring authentication:

- `/user` - User dashboard and profile
- `/seller` - Seller dashboard
- `/cart` - Shopping cart
- `/checkout` - Checkout process
- `/support` - Support tickets

### `(admin)/` - Admin Pages

Admin dashboard and management:

- `/admin` - Admin dashboard root
- `/admin/*` - Various admin management pages

### Main Pages

#### `page.tsx` (Homepage)

- **Route**: `/`
- **Purpose**: Main landing page
- **Features**:
  - Hero section with slides
  - Featured categories
  - Featured products
  - Active auctions
  - Blog posts preview
  - SEO optimized

### Styling

#### `globals.css`

- **Purpose**: Global CSS styles and Tailwind directives
- **Features**:
  - Tailwind base, components, utilities
  - CSS custom properties for theming
  - Global typography styles
  - Utility classes

### SEO & Metadata

#### `robots.ts`

- **Purpose**: Generates robots.txt file dynamically
- **Returns**: Robots configuration for search engines

#### `sitemap.ts`

- **Purpose**: Generates sitemap.xml dynamically
- **Returns**: Sitemap with all public pages and products

## Public Routes (Pages)

### Authentication

#### `/login` - Login page

- **File**: `login/page.tsx`
- **Purpose**: User login with email/password, Google, phone OTP
- **Features**: Form validation, remember me, forgot password link

#### `/register` - Registration page

- **File**: `register/page.tsx`
- **Purpose**: New user registration
- **Features**: Email verification, phone verification, terms acceptance

#### `/logout` - Logout page

- **File**: `logout/page.tsx`
- **Purpose**: Logs user out and redirects

#### `/forgot-password` - Password reset request

- **File**: `forgot-password/page.tsx`
- **Purpose**: Request password reset email

#### `/reset-password` - Password reset

- **File**: `reset-password/page.tsx`
- **Purpose**: Reset password with token from email

#### `/unauthorized` - Unauthorized access

- **File**: `unauthorized/page.tsx`
- **Purpose**: Shown when user lacks required permissions

#### `/forbidden` - Forbidden access

- **File**: `forbidden/page.tsx`
- **Purpose**: Shown when access is explicitly denied

### Products

#### `/products` - Product listing

- **File**: `products/page.tsx`
- **Purpose**: Browse all products with filters and sorting
- **Features**: Category filter, price range, search, pagination

#### `/products/[slug]` - Product detail

- **File**: `products/[slug]/page.tsx`
- **Purpose**: Single product page
- **Features**: Image gallery, description, reviews, add to cart, share

#### `/products/[slug]/edit` - Edit product

- **File**: `products/[slug]/edit/page.tsx`
- **Purpose**: Edit existing product (seller/admin only)
- **Auth**: Protected route

#### `/products/create` - Create product

- **File**: `products/create/page.tsx`
- **Purpose**: Create new product listing
- **Auth**: Seller role required

### Auctions

#### `/auctions` - Auction listing

- **File**: `auctions/page.tsx`
- **Purpose**: Browse active auctions
- **Features**: Filter by type, category, status, ending soon

#### `/auctions/[slug]` - Auction detail

- **File**: `auctions/[slug]/page.tsx`
- **Purpose**: Single auction page with live bidding
- **Features**: Real-time bid updates, bid history, auto-bid, countdown timer

#### `/auctions/create` - Create auction

- **File**: `auctions/create/page.tsx`
- **Purpose**: Create new auction listing
- **Auth**: Seller role required

### Categories

#### `/categories` - Category listing

- **File**: `categories/page.tsx`
- **Purpose**: Browse all product categories
- **Features**: Hierarchical category tree, category images

#### `/categories/[slug]` - Category page

- **File**: `categories/[slug]/page.tsx`
- **Purpose**: Products in specific category
- **Features**: Subcategories, filters, breadcrumbs

### Shopping

#### `/cart` - Shopping cart

- **File**: `cart/page.tsx`
- **Purpose**: View and manage shopping cart
- **Features**: Update quantities, remove items, apply coupons, proceed to checkout

#### `/checkout` - Checkout

- **File**: `checkout/page.tsx`
- **Purpose**: Complete purchase
- **Features**: Address selection, payment method, order review
- **Auth**: Login required

#### `/checkout/success` - Order confirmation

- **File**: `checkout/success/page.tsx`
- **Purpose**: Order success page after payment
- **Features**: Order summary, tracking info, download invoice

#### `/compare` - Product comparison

- **File**: `compare/page.tsx`
- **Purpose**: Compare multiple products side-by-side
- **Features**: Specification comparison, add to cart from comparison

### Shops

#### `/shops` - Shop listing

- **File**: `shops/page.tsx`
- **Purpose**: Browse all seller shops
- **Features**: Shop search, ratings, categories

#### `/shops/[slug]` - Shop page

- **File**: `shops/[slug]/page.tsx`
- **Purpose**: Individual shop storefront
- **Features**: Shop products, reviews, about, contact

#### `/shops/[slug]/about` - Shop about

- **File**: `shops/[slug]/about/page.tsx`
- **Purpose**: Detailed shop information

#### `/shops/[slug]/contact` - Shop contact

- **File**: `shops/[slug]/contact/page.tsx`
- **Purpose**: Contact shop owner

### Search & Discovery

#### `/search` - Search results

- **File**: `search/page.tsx`
- **Purpose**: Global search results page
- **Features**: Search products, shops, auctions, blog posts

#### `/reviews` - All reviews

- **File**: `reviews/page.tsx`
- **Purpose**: Browse all product reviews
- **Features**: Filter by rating, product, date

### Content

#### `/blog` - Blog listing

- **File**: `blog/page.tsx`
- **Purpose**: Browse blog posts
- **Features**: Category filter, search, pagination

#### `/blog/[slug]` - Blog post

- **File**: `blog/[slug]/page.tsx`
- **Purpose**: Single blog post page
- **Features**: Comments, related posts, share

#### `/about` - About page

- **File**: `about/page.tsx`
- **Purpose**: Company information

#### `/contact` - Contact page

- **File**: `contact/page.tsx`
- **Purpose**: Contact form and information

#### `/faq` - FAQ page

- **File**: `faq/page.tsx`
- **Purpose**: Frequently asked questions

#### `/events` - Events listing

- **File**: `events/page.tsx`
- **Purpose**: Browse platform events

#### `/events/[id]` - Event detail

- **File**: `events/[id]/page.tsx`
- **Purpose**: Single event page

### Guides

#### `/guide/new-user` - New user guide

- **File**: `guide/new-user/page.tsx`
- **Purpose**: Onboarding guide for new users

#### `/guide/prohibited` - Prohibited items

- **File**: `guide/prohibited/page.tsx`
- **Purpose**: List of prohibited items to sell

#### `/guide/returns` - Returns guide

- **File**: `guide/returns/page.tsx`
- **Purpose**: How to return items

### Legal Pages

#### `/privacy-policy` - Privacy policy

- **File**: `privacy-policy/page.tsx`
- **Purpose**: Privacy policy and data handling

#### `/terms-of-service` - Terms of service

- **File**: `terms-of-service/page.tsx`
- **Purpose**: Platform terms and conditions

#### `/refund-policy` - Refund policy

- **File**: `refund-policy/page.tsx`
- **Purpose**: Refund and return policy

#### `/shipping-policy` - Shipping policy

- **File**: `shipping-policy/page.tsx`
- **Purpose**: Shipping methods and policies

#### `/cookie-policy` - Cookie policy

- **File**: `cookie-policy/page.tsx`
- **Purpose**: Cookie usage information

### Fees & Pricing

#### `/fees/structure` - Fee structure

- **File**: `fees/structure/page.tsx`
- **Purpose**: Platform fee breakdown

#### `/fees/payment` - Payment fees

- **File**: `fees/payment/page.tsx`
- **Purpose**: Payment gateway fees

#### `/fees/shipping` - Shipping fees

- **File**: `fees/shipping/page.tsx`
- **Purpose**: Shipping cost calculation

#### `/fees/optional` - Optional fees

- **File**: `fees/optional/page.tsx`
- **Purpose**: Optional service fees

### Company

#### `/company/overview` - Company overview

- **File**: `company/overview/page.tsx`
- **Purpose**: Company information and history

#### `/support` - Support center

- **File**: `support/page.tsx`
- **Purpose**: Help center and support options

#### `/support/ticket` - Create support ticket

- **File**: `support/ticket/page.tsx`
- **Purpose**: Submit support ticket

## User Dashboard Routes

All user routes require authentication.

### User Profile & Settings

#### `/user` - User dashboard

- **File**: `user/page.tsx`
- **Purpose**: Main user dashboard overview
- **Auth**: Login required

#### `/user/settings` - Account settings

- **File**: `user/settings/page.tsx`
- **Purpose**: Edit profile, change password

#### `/user/settings/notifications` - Notification settings

- **File**: `user/settings/notifications/page.tsx`
- **Purpose**: Manage email and push notification preferences

#### `/user/addresses` - Address book

- **File**: `user/addresses/page.tsx`
- **Purpose**: Manage shipping addresses

### Orders & Purchases

#### `/user/orders` - Order history

- **File**: `user/orders/page.tsx`
- **Purpose**: View all orders

#### `/user/orders/[id]` - Order detail

- **File**: `user/orders/[id]/page.tsx`
- **Purpose**: View single order, track shipment

#### `/user/returns` - Return requests

- **File**: `user/returns/page.tsx`
- **Purpose**: Manage product returns

### Auctions & Bidding

#### `/user/bids` - Bid history

- **File**: `user/bids/page.tsx`
- **Purpose**: View all bids placed

#### `/user/won-auctions` - Won auctions

- **File**: `user/won-auctions/page.tsx`
- **Purpose**: Auctions won by user

#### `/user/watchlist` - Auction watchlist

- **File**: `user/watchlist/page.tsx`
- **Purpose**: Auctions being watched

### Social & Activity

#### `/user/favorites` - Favorite products

- **File**: `user/favorites/page.tsx`
- **Purpose**: Saved products

#### `/user/following` - Following shops

- **File**: `user/following/page.tsx`
- **Purpose**: Shops user is following

#### `/user/history` - Viewing history

- **File**: `user/history/page.tsx`
- **Purpose**: Recently viewed products

#### `/user/reviews` - My reviews

- **File**: `user/reviews/page.tsx`
- **Purpose**: Reviews written by user

### Communication

#### `/user/messages` - Messages

- **File**: `user/messages/page.tsx`
- **Purpose**: User messaging inbox

#### `/user/notifications` - Notifications

- **File**: `user/notifications/page.tsx`
- **Purpose**: All notifications

#### `/user/tickets` - Support tickets

- **File**: `user/tickets/page.tsx`
- **Purpose**: User support tickets

#### `/user/tickets/[id]` - Ticket detail

- **File**: `user/tickets/[id]/page.tsx`
- **Purpose**: View single support ticket

### RipLimit (Credit System)

#### `/user/riplimit` - RipLimit dashboard

- **File**: `user/riplimit/page.tsx`
- **Purpose**: View credit balance, transactions

## Seller Dashboard Routes

All seller routes require seller role.

### Seller Overview

#### `/seller` - Seller dashboard

- **File**: `seller/page.tsx`
- **Purpose**: Main seller dashboard with stats
- **Auth**: Seller role required

#### `/seller/analytics` - Analytics

- **File**: `seller/analytics/page.tsx`
- **Purpose**: Sales analytics and reports

#### `/seller/revenue` - Revenue

- **File**: `seller/revenue/page.tsx`
- **Purpose**: Revenue tracking and payouts

#### `/seller/settings` - Seller settings

- **File**: `seller/settings/page.tsx`
- **Purpose**: Seller account configuration

#### `/seller/help` - Seller help

- **File**: `seller/help/page.tsx`
- **Purpose**: Seller resources and guides

### Shop Management

#### `/seller/my-shops` - My shops

- **File**: `seller/my-shops/page.tsx`
- **Purpose**: Manage seller shops

#### `/seller/my-shops/create` - Create shop

- **File**: `seller/my-shops/create/page.tsx`
- **Purpose**: Create new shop

#### `/seller/my-shops/[slug]` - Shop dashboard

- **File**: `seller/my-shops/[slug]/page.tsx`
- **Purpose**: Individual shop management

#### `/seller/my-shops/[slug]/edit` - Edit shop

- **File**: `seller/my-shops/[slug]/edit/page.tsx`
- **Purpose**: Edit shop details

#### `/seller/my-shops/[slug]/settings` - Shop settings

- **File**: `seller/my-shops/[slug]/settings/page.tsx`
- **Purpose**: Configure shop settings

### Product Management

#### `/seller/products` - Product management

- **File**: `seller/products/page.tsx`
- **Purpose**: View and manage all seller products

#### `/seller/products/create` - Create product

- **File**: `seller/products/create/page.tsx`
- **Purpose**: Add new product

#### `/seller/products/[slug]/edit` - Edit product

- **File**: `seller/products/[slug]/edit/page.tsx`
- **Purpose**: Edit existing product

### Auction Management

#### `/seller/auctions` - Auction management

- **File**: `seller/auctions/page.tsx`
- **Purpose**: View and manage seller auctions

#### `/seller/auctions/create` - Create auction

- **File**: `seller/auctions/create/page.tsx`
- **Purpose**: Create new auction

#### `/seller/auctions/[slug]/edit` - Edit auction

- **File**: `seller/auctions/[slug]/edit/page.tsx`
- **Purpose**: Edit auction details

### Orders & Fulfillment

#### `/seller/orders` - Order management

- **File**: `seller/orders/page.tsx`
- **Purpose**: Manage incoming orders

#### `/seller/orders/[id]` - Order detail

- **File**: `seller/orders/[id]/page.tsx`
- **Purpose**: Process individual order

#### `/seller/returns` - Return requests

- **File**: `seller/returns/page.tsx`
- **Purpose**: Manage return requests

### Marketing

#### `/seller/coupons` - Coupon management

- **File**: `seller/coupons/page.tsx`
- **Purpose**: Create and manage discount coupons

#### `/seller/coupons/create` - Create coupon

- **File**: `seller/coupons/create/page.tsx`
- **Purpose**: Create new coupon

#### `/seller/coupons/[code]/edit` - Edit coupon

- **File**: `seller/coupons/[code]/edit/page.tsx`
- **Purpose**: Edit existing coupon

### Communication

#### `/seller/messages` - Seller messages

- **File**: `seller/messages/page.tsx`
- **Purpose**: Seller messaging inbox

#### `/seller/reviews` - Product reviews

- **File**: `seller/reviews/page.tsx`
- **Purpose**: View and respond to reviews

#### `/seller/support-tickets` - Support tickets

- **File**: `seller/support-tickets/page.tsx`
- **Purpose**: Customer support tickets

## Admin Routes

All admin routes require admin role.

#### `/admin/users` - User management

- **File**: `admin/users/page.tsx`
- **Auth**: Admin only

#### `/admin/shops` - Shop management

- **File**: `admin/shops/page.tsx`
- **Auth**: Admin only

#### `/admin/orders` - Order management

- **File**: `admin/orders/page.tsx`
- **Auth**: Admin only

#### `/admin/orders/[id]` - Order detail

- **File**: `admin/orders/[id]/page.tsx`
- **Auth**: Admin only

#### `/admin/payments` - Payment management

- **File**: `admin/payments/page.tsx`
- **Auth**: Admin only

#### `/admin/payouts` - Payout management

- **File**: `admin/payouts/page.tsx`
- **Auth**: Admin only

#### `/admin/returns` - Return management

- **File**: `admin/returns/page.tsx`
- **Auth**: Admin only

#### `/admin/riplimit` - RipLimit management

- **File**: `admin/riplimit/page.tsx`
- **Auth**: Admin only

## API Routes (`/api`)

API routes provide backend endpoints for the application.

### Authentication

- `api/auth/*` - Authentication endpoints

### Admin APIs

- `api/admin/*` - Admin operations

### Analytics

- `api/analytics/*` - Analytics data

### Auctions

- `api/auctions/*` - Auction operations

### Blog

- `api/blog/*` - Blog content

### Cart

- `api/cart/*` - Shopping cart operations

### Categories

- `api/categories/*` - Category management

### Checkout

- `api/checkout/*` - Checkout process

### Coupons

- `api/coupons/*` - Coupon validation and management

### Email

- `api/email/*` - Email sending

### Events

- `api/events/*` - Event management

### Favorites

- `api/favorites/*` - User favorites

### Header

- `api/header/*` - Header data (cart count, notifications)

### Header Stats

- `api/header-stats/*` - Header statistics

### Health

- `api/health/*` - API health checks

### Hero Slides

- `api/hero-slides/*` - Homepage slides

### Homepage

- `api/homepage/*` - Homepage data

### Lib

- `api/lib/*` - Utility endpoints

### Location

- `api/location/*` - Location services (geocoding, addresses)

### Media

- `api/media/*` - File upload and management

### Messages

- `api/messages/*` - User messaging

### Middleware

- `api/middleware/*` - API middleware
- **`api/_middleware/rate-limit.ts`** - Rate limiting middleware

  - **Exports**:
    - `withRateLimit(handler, options)` - HOF to wrap API route handlers with rate limiting
    - `RateLimitMiddleware` - Pre-configured middleware wrappers (auth, api, public, passwordReset, search)
    - `createRateLimitedHandler(handler, config)` - Utility to create custom rate limited handlers
    - `RateLimitOptions` - Configuration interface
    - `ApiRouteHandler` - Type definition for API route handlers
  - **Features**:
    - Automatic IP-based rate limiting (supports x-forwarded-for, x-real-ip, cf-connecting-ip)
    - Configurable rate limiters (use pre-configured or custom RateLimiter instances)
    - Custom identifier functions (IP, user ID, API key, etc.)
    - Skip function for conditional rate limiting
    - Custom error handlers for 429 responses
    - Automatic rate limit headers (X-RateLimit-Consumed, X-RateLimit-Remaining, X-RateLimit-Reset, Retry-After)
    - Integrates with RateLimiter from `src/lib/rate-limiter.ts`
  - **Usage**:

    ```typescript
    // Using pre-configured limiter
    export const GET = withRateLimit(handler, { limiter: RateLimiters.api });

    // Using convenience wrapper
    export const POST = RateLimitMiddleware.auth(handler);

    // Custom configuration
    export const PUT = createRateLimitedHandler(handler, {
      points: 50,
      duration: 60,
      getIdentifier: (req) => req.headers.get("x-user-id") || "anonymous",
    });
    ```

### Notifications

- `api/notifications/*` - User notifications

### Orders

- `api/orders/*` - Order management

### Payments

- `api/payments/*` - Payment processing

### Payouts

- `api/payouts/*` - Seller payouts

### Products

- `api/products/*` - Product operations

### Protected

- `api/protected/*` - Protected API routes

### Returns

- `api/returns/*` - Return management

### Reviews

- `api/reviews/*` - Product reviews

### RipLimit

- `api/riplimit/*` - Credit system

### Search

- `api/search/*` - Search functionality

### Seller

- `api/seller/*` - Seller operations

### Shipping

- `api/shipping/*` - Shipping calculations and tracking

### Shops

- `api/shops/*` - Shop management

### Test Data

- `api/test-data/*` - Test data generation (dev only)

### Tickets

- `api/tickets/*` - Support tickets

### User

- `api/user/*` - User profile and settings

### Users

- `api/users/*` - User management (admin)

### WhatsApp

- `api/whatsapp/*` - WhatsApp integration

### Address

- `api/address/*` - Address operations

### Addresses

- `api/addresses/*` - Address management

## Server Actions (`/actions`)

Server actions for Next.js Server Actions feature.

#### `actions/payment.ts`

- **Purpose**: Server actions for payment processing
- **Functions**: Payment initiation, verification, refunds
- **Usage**: Called from client components using Server Actions

## Route Patterns

### Dynamic Routes

- `[slug]` - Dynamic product/auction/shop slug
- `[id]` - Dynamic order/ticket/event ID
- `[code]` - Dynamic coupon code

### Route Groups

- `(auth)` - Authentication pages (could be grouped)
- `(dashboard)` - User/seller/admin dashboards (could be grouped)
- `(public)` - Public content pages (could be grouped)

### Protected Routes

Routes requiring authentication:

- `/user/*` - User dashboard routes
- `/seller/*` - Seller dashboard routes
- `/admin/*` - Admin dashboard routes
- `/checkout` - Checkout page

## Conventions

### File Structure

- `page.tsx` - Route page component
- `layout.tsx` - Shared layout for route segment
- `loading.tsx` - Loading UI for route segment
- `error.tsx` - Error boundary for route segment
- `not-found.tsx` - 404 UI for route segment

### Metadata

Each page exports metadata for SEO:

```typescript
export const metadata: Metadata = {
  title: "Page Title",
  description: "Page description",
  // ...
};
```

### Page Components

Page components are async Server Components by default:

```typescript
export default async function Page({ params, searchParams }: PageProps) {
  // Server-side data fetching
  return <div>...</div>;
}
```

## Key Features

### Server Components

- Default for all pages
- Fetch data on server
- Zero JavaScript bundle for static content

### Client Components

- Use `'use client'` directive
- Interactive components (forms, modals, etc.)
- Client-side state management

### Data Fetching

- Server Components fetch directly
- API routes for client-side fetching
- React Server Actions for mutations

### SEO Optimization

- Metadata for each page
- JSON-LD structured data
- Dynamic sitemap and robots.txt
- Open Graph tags

### Error Handling

- Global error boundary
- Page-level error boundaries
- Not found pages

### Loading States

- Loading.tsx for suspense boundaries
- Streaming SSR
- Progressive enhancement

## Performance Optimizations

- Static page generation where possible
- Incremental Static Regeneration (ISR)
- Dynamic imports for heavy components
- Image optimization with next/image
- Font optimization with next/font
- Route prefetching
- Middleware for edge computing

## Internationalization

- i18n provider in root layout
- Locale-based routing (could be added)
- Translation support for all pages

## Accessibility

- Semantic HTML
- ARIA labels
- Keyboard navigation
- Focus management
- Screen reader support

## Mobile Optimization

- Responsive design with Tailwind
- Bottom navigation for mobile
- PWA features (manifest, install prompt)
- Offline indicator
- Touch-friendly UI
