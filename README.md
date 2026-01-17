# LetItRip.in - Modern Auction & E-commerce Platform

> A comprehensive Next.js-based marketplace platform for India with real-time auctions, product listings, multi-vendor shops, and advanced e-commerce features.

## 📋 Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Route Structure](#route-structure)
  - [Public Routes](#public-routes)
  - [Protected Routes](#protected-routes)
  - [Admin Routes](#admin-routes)
  - [Auth Routes](#auth-routes)
- [Component Architecture](#component-architecture)
- [Key Features](#key-features)
- [Getting Started](#getting-started)
- [API Routes](#api-routes)
- [State Management](#state-management)
- [Testing](#testing)

---

## 🎯 Overview

LetItRip.in is a full-featured auction and e-commerce platform built with Next.js 16, featuring:

- **Real-time Auctions** with live bidding
- **Multi-vendor Marketplace** with shop management
- **Product Listings** with advanced search and filters
- **User Profiles** with order history and watchlists
- **Admin Dashboard** for platform management
- **Seller Dashboard** for vendor operations
- **Blog System** with categories and tags
- **Review & Rating System**
- **Shopping Cart & Checkout**
- **Payment Integration** (Razorpay)
- **Firebase Backend** (Firestore, Storage, Auth)

---

## 🛠 Tech Stack

### Frontend

- **Next.js 16.1** - React framework with App Router
- **React 19.2** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first styling
- **@letitrip/react-library** - Custom component library (82 components, 26 hooks)

### Backend & Services

- **Firebase**
  - Firestore - NoSQL database
  - Storage - File uploads
  - Auth - Authentication
  - Functions - Serverless backend
- **Next.js API Routes** - Server-side endpoints
- **Razorpay** - Payment processing

### State & Data

- **TanStack Query (React Query)** - Server state management
- **React Context** - Global state (Auth, Cart, Theme)
- **React Hook Form** - Form management
- **Zod** - Schema validation

### Tools & Libraries

- **Lucide React** - Icons
- **React Quill** - Rich text editor
- **Recharts** - Data visualization
- **DnD Kit** - Drag and drop
- **Playwright** - E2E testing
- **Jest** - Unit testing

---

## 🏗 Architecture

### Route Groups (Next.js 13+ App Router)

The app uses Next.js route groups to organize pages by access level:

```
src/app/
├── (public)/       # Public-facing pages (no auth required)
├── (protected)/    # Authenticated user pages
├── (admin)/        # Admin-only pages
├── (auth)/         # Login/register pages
├── api/            # API routes
├── actions/        # Server actions
└── demo/           # Component demos
```

### Component Structure

```
src/components/
├── homepage/       # Homepage sections (Hero, Featured, etc.)
├── product/        # Product display components
├── auction/        # Auction-specific components
├── cart/           # Shopping cart components
├── checkout/       # Checkout flow components
├── user/           # User profile components
├── seller/         # Seller dashboard components
├── admin/          # Admin dashboard components
├── layout/         # Layout components (Header, Footer, Sidebar)
├── navigation/     # Navigation components
├── auth/           # Authentication components
├── search/         # Search and filter components
├── common/         # Remaining app-specific shared components
├── providers/      # Context providers
└── ui/             # Base UI components
```

**Note**: Most reusable components (forms, tables, filters, pagination, UI elements) have been migrated to `@letitrip/react-library` and are imported from there.

---

## 🗺 Route Structure

### Public Routes (`(public)/`)

These routes are accessible to all visitors without authentication.

#### Homepage

- **`/`** - Homepage
  - **Components**: `HeroSection`, `WelcomeHero`, `ProductsSection`, `AuctionsSection`, `FeaturedCategoriesSection`, `FeaturedShopsSection`, `FeaturedBlogsSection`, `RecentReviewsSection`, `ValueProposition`, `FAQSection`, `RecentlyViewedWidget`
  - **Purpose**: Main landing page with featured content, hero slides, and sections
  - **Features**: Responsive layout, dynamic content loading, recently viewed products

#### Products

- **`/products`** - Product listing page

  - **Components**: `ProductListClient`, `ProductFilters`, `SearchBar`, `Pagination`
  - **Purpose**: Browse all products with filtering and search
  - **Features**: Category filters, price range, sorting, infinite scroll option

- **`/products/[slug]`** - Product detail page

  - **Components**: `ProductDetailClient`, `ProductGallery`, `ProductInfo`, `ReviewsList`, `RelatedProducts`, `BreadcrumbNav`
  - **Purpose**: View detailed product information
  - **Features**: Image gallery, add to cart, reviews, similar products

- **`/products/[slug]/edit`** - Edit product (Protected - seller only)

  - **Components**: `ProductEditForm`, `ImageUploadWithCrop`, `CategorySelector`
  - **Purpose**: Edit existing product
  - **Features**: Image management, pricing, inventory, variants

- **`/products/create`** - Create new product (Protected - seller only)
  - **Components**: `ProductCreateForm`, `WizardForm`, `FormField components`
  - **Purpose**: Add new product listing
  - **Features**: Multi-step form, image upload, variant management

#### Auctions

- **`/auctions`** - Auction listing page

  - **Components**: `AuctionListClient`, `AuctionFilters`, `AuctionCard`
  - **Purpose**: Browse live and upcoming auctions
  - **Features**: Real-time status, countdown timers, bid history

- **`/auctions/[id]`** - Auction detail page
  - **Components**: `AuctionDetailClient`, `BiddingPanel`, `BidHistory`, `AuctionTimer`
  - **Purpose**: View auction details and place bids
  - **Features**: Real-time bidding, auto-bid, bid notifications

#### Shops

- **`/shops`** - Shop listing page

  - **Components**: `ShopListClient`, `ShopCard`, `ShopFilters`
  - **Purpose**: Browse all vendor shops
  - **Features**: Shop ratings, product count, featured shops

- **`/shops/[slug]`** - Shop detail page

  - **Components**: `ShopDetailClient`, `ShopHeader`, `ShopProducts`, `ShopReviews`
  - **Purpose**: View shop profile and products
  - **Features**: Shop info, product listings, reviews, contact

- **`/shops/[slug]/about`** - Shop about page

  - **Components**: `ShopAbout`, `ShopStats`, `ShopPolicies`
  - **Purpose**: Detailed shop information
  - **Features**: Business details, policies, seller info

- **`/shops/[slug]/contact`** - Shop contact page
  - **Components**: `ShopContactForm`, `ShopAddress`
  - **Purpose**: Contact shop owner
  - **Features**: Contact form, business hours, location

#### Categories

- **`/categories`** - Category listing page

  - **Components**: `CategoryGridClient`, `CategoryCard`
  - **Purpose**: Browse all product categories
  - **Features**: Hierarchical categories, product counts

- **`/categories/[slug]`** - Category page
  - **Components**: `CategoryPageClient`, `ProductList`, `CategoryFilters`
  - **Purpose**: View products in category
  - **Features**: Category tree, filters, sorting

#### Blog

- **`/blog`** - Blog listing page

  - **Components**: `BlogListClient`, `BlogCard`, `BlogFilters`
  - **Purpose**: Browse blog posts
  - **Features**: Categories, tags, search, pagination

- **`/blog/[slug]`** - Blog post detail
  - **Components**: `BlogPostClient`, `BlogContent`, `RelatedPosts`, `Comments`
  - **Purpose**: Read blog post
  - **Features**: Rich content, images, related posts

#### Search & Compare

- **`/search`** - Global search page

  - **Components**: `SearchPageClient`, `SearchResults`, `SearchFilters`, `ContentTypeFilter`
  - **Purpose**: Search across products, shops, auctions
  - **Features**: Multi-type search, advanced filters, sorting

- **`/compare`** - Product comparison page
  - **Components**: `ComparePageClient`, `ComparisonTable`, `ProductCompareCard`
  - **Purpose**: Compare multiple products side-by-side
  - **Features**: Feature comparison, price comparison, add to cart

#### Reviews

- **`/reviews`** - All reviews page
  - **Components**: `ReviewListClient`, `ReviewCard`, `ReviewFilters`
  - **Purpose**: Browse all product reviews
  - **Features**: Rating filters, verified purchases, helpful votes

#### Events

- **`/events`** - Events listing page

  - **Components**: `EventListClient`, `EventCard`
  - **Purpose**: Browse platform events
  - **Features**: Upcoming events, event categories

- **`/events/[id]`** - Event detail page
  - **Components**: `EventDetailClient`, `EventInfo`, `EventRegistration`
  - **Purpose**: View event details and register
  - **Features**: Event info, registration, calendar add

#### Information Pages

- **`/contact`** - Contact page

  - **Components**: `ContactForm`, `ContactInfo`, `FAQSection`
  - **Purpose**: Contact platform support
  - **Features**: Support form, email, phone

- **`/faq`** - FAQ page

  - **Components**: `FAQClient`, `FAQAccordion`, `FAQSearch`
  - **Purpose**: Frequently asked questions
  - **Features**: Searchable, categorized, collapsible

- **`/about`** - About page
  - **Components**: `AboutContent`, `TeamSection`, `ValueProposition`
  - **Purpose**: About the platform
  - **Features**: Company info, mission, team

#### Legal Pages

- **`/terms-of-service`** - Terms of service
- **`/privacy-policy`** - Privacy policy
- **`/refund-policy`** - Refund policy
- **`/shipping-policy`** - Shipping policy
- **`/cookie-policy`** - Cookie policy
  - **Components**: `LegalContent` (shared template)
  - **Purpose**: Legal documentation
  - **Features**: Formatted legal text, last updated date

#### Fee Structure

- **`/fees/structure`** - Fee structure page

  - **Components**: `FeeStructureContent`, `PricingTable`
  - **Purpose**: Platform fee information
  - **Features**: Fee breakdown, pricing tiers

- **`/fees/shipping`** - Shipping fees page

  - **Components**: `ShippingFeesContent`, `ShippingCalculator`
  - **Purpose**: Shipping cost information
  - **Features**: Zone-wise rates, calculator

- **`/fees/optional`** - Optional fees page
  - **Components**: `OptionalFeesContent`, `ServicesList`
  - **Purpose**: Optional service fees
  - **Features**: Feature add-ons, premium services

#### Guides

- **`/guide/new-user`** - New user guide
- **`/guide/returns`** - Returns guide
- **`/guide/prohibited`** - Prohibited items guide
  - **Components**: `GuideContent`, `GuideNavigation`, `GuideSidebar`
  - **Purpose**: User guides and documentation
  - **Features**: Step-by-step guides, images, video tutorials

---

### Protected Routes (`(protected)/`)

These routes require user authentication. Redirects to `/login` if not authenticated.

#### Cart & Checkout

- **`/cart`** - Shopping cart

  - **Components**: `CartPageClient`, `CartItems`, `CartSummary`, `CouponInput`
  - **Purpose**: View and manage cart items
  - **Features**: Quantity update, remove items, apply coupons, shipping calculation

- **`/checkout`** - Checkout page

  - **Components**: `CheckoutForm`, `AddressSelector`, `PaymentOptions`, `OrderSummary`
  - **Purpose**: Complete purchase
  - **Features**: Address selection, payment method, order review, place order

- **`/checkout/success`** - Order confirmation
  - **Components**: `OrderConfirmation`, `OrderDetails`, `OrderTracking`
  - **Purpose**: Order success page
  - **Features**: Order number, details, download invoice, tracking

#### User Dashboard

- **`/user/profile`** - User profile

  - **Components**: `ProfileForm`, `AvatarUpload`, `ProfileStats`
  - **Purpose**: Manage user profile
  - **Features**: Edit details, avatar upload, password change

- **`/user/addresses`** - Address management

  - **Components**: `AddressListClient`, `AddressForm`, `AddressSelectorWithCreate`
  - **Purpose**: Manage delivery addresses
  - **Features**: Add, edit, delete addresses, set default

- **`/user/orders`** - Order history

  - **Components**: `OrderListClient`, `OrderCard`, `OrderFilters`
  - **Purpose**: View past orders
  - **Features**: Order status, track shipment, reorder, cancel

- **`/user/orders/[id]`** - Order details

  - **Components**: `OrderDetailClient`, `OrderItems`, `OrderTimeline`, `InvoiceDownload`
  - **Purpose**: View specific order
  - **Features**: Item details, status tracking, invoice, support

- **`/user/bids`** - Bid history

  - **Components**: `BidListClient`, `BidCard`, `BidStatus`
  - **Purpose**: View auction bids
  - **Features**: Active bids, won auctions, bid history

- **`/user/watchlist`** - Watchlist

  - **Components**: `WatchlistClient`, `WatchlistProductCard`, `PriceAlerts`
  - **Purpose**: Saved products for later
  - **Features**: Add/remove products, price drop alerts

- **`/user/reviews`** - User reviews

  - **Components**: `UserReviewsClient`, `ReviewForm`, `ReviewCard`
  - **Purpose**: Manage user reviews
  - **Features**: Write reviews, edit reviews, view history

- **`/user/messages`** - Messages inbox

  - **Components**: `MessagesClient`, `ConversationList`, `MessageThread`, `MessageInput`
  - **Purpose**: Communication with sellers/support
  - **Features**: Real-time messaging, attachments, notifications

- **`/user/favorites`** - Favorite shops

  - **Components**: `FavoritesClient`, `ShopCard`
  - **Purpose**: Saved favorite shops
  - **Features**: Follow shops, notifications

- **`/user/notifications`** - Notifications

  - **Components**: `NotificationsClient`, `NotificationItem`, `NotificationFilters`
  - **Purpose**: View all notifications
  - **Features**: Mark as read, filter by type, delete

- **`/user/wallet`** - Wallet/Credits

  - **Components**: `WalletClient`, `TransactionHistory`, `AddFunds`
  - **Purpose**: Manage wallet balance
  - **Features**: Add funds, transaction history, refunds

- **`/user/settings`** - User settings
  - **Components**: `SettingsClient`, `SettingsSection`, `NotificationPreferences`
  - **Purpose**: Account settings
  - **Features**: Privacy settings, notifications, preferences

#### Seller Dashboard

- **`/seller`** - Seller overview

  - **Components**: `SellerDashboard`, `StatCard`, `RecentOrders`, `SalesChart`
  - **Purpose**: Seller dashboard home
  - **Features**: Sales stats, charts, quick actions

- **`/seller/shop`** - Shop management

  - **Components**: `ShopSettingsForm`, `ShopBanner`, `BusinessInfo`
  - **Purpose**: Manage shop profile
  - **Features**: Shop details, branding, policies

- **`/seller/products`** - Product management

  - **Components**: `ProductListClient`, `DataTable`, `BulkActions`
  - **Purpose**: Manage product inventory
  - **Features**: Add/edit/delete products, bulk actions, stock management

- **`/seller/products/create`** - Create product

  - **Components**: `ProductCreateForm`, `WizardForm`, `ImageUploadWithCrop`
  - **Purpose**: Add new product
  - **Features**: Multi-step form, image upload, variants, pricing

- **`/seller/products/[id]/edit`** - Edit product

  - **Components**: `ProductEditForm`, `ProductVariants`, `InventoryManager`
  - **Purpose**: Edit existing product
  - **Features**: Update details, images, stock, variants

- **`/seller/orders`** - Order management

  - **Components**: `SellerOrdersClient`, `OrderTable`, `OrderActions`
  - **Purpose**: Manage customer orders
  - **Features**: Process orders, update status, print labels

- **`/seller/orders/[id]`** - Order details

  - **Components**: `SellerOrderDetail`, `OrderTimeline`, `ShippingLabel`
  - **Purpose**: View order details
  - **Features**: Customer info, items, shipping, actions

- **`/seller/auctions`** - Auction management

  - **Components**: `AuctionListClient`, `AuctionTable`, `AuctionStatus`
  - **Purpose**: Manage auctions
  - **Features**: Create auctions, monitor bids, end auctions

- **`/seller/auctions/create`** - Create auction

  - **Components**: `AuctionCreateForm`, `VideoUploadWithThumbnail`, `AuctionSettings`
  - **Purpose**: Create new auction
  - **Features**: Item details, starting bid, duration, reserve price

- **`/seller/auctions/[id]`** - Auction details

  - **Components**: `AuctionDetailClient`, `BidList`, `AuctionControls`
  - **Purpose**: Monitor auction
  - **Features**: Live bids, analytics, end early

- **`/seller/analytics`** - Seller analytics

  - **Components**: `AnalyticsClient`, `SalesChart`, `ProductPerformance`, `RevenueReport`
  - **Purpose**: Sales analytics
  - **Features**: Charts, reports, insights, export data

- **`/seller/payouts`** - Payout management

  - **Components**: `PayoutsClient`, `PayoutHistory`, `BankDetails`
  - **Purpose**: Track earnings and payouts
  - **Features**: Pending payouts, history, bank account setup

- **`/seller/reviews`** - Seller reviews

  - **Components**: `SellerReviewsClient`, `ReviewCard`, `ReviewResponse`
  - **Purpose**: Manage product reviews
  - **Features**: Respond to reviews, flag inappropriate

- **`/seller/settings`** - Seller settings

  - **Components**: `SellerSettingsClient`, `ShippingSettings`, `PaymentSettings`
  - **Purpose**: Configure seller preferences
  - **Features**: Shipping, payments, notifications, policies

- **`/seller/help`** - Seller help center
  - **Components**: `SellerHelpClient`, `HelpArticles`, `ContactSupport`
  - **Purpose**: Seller resources and support
  - **Features**: Guides, FAQs, contact support

#### Support

- **`/support/ticket`** - Create support ticket

  - **Components**: `SupportTicketForm`, `FileUpload`, `IssueCategories`
  - **Purpose**: Submit support request
  - **Features**: Describe issue, attach files, track ticket

- **`/support/tickets`** - View tickets

  - **Components**: `TicketListClient`, `TicketCard`, `TicketFilters`
  - **Purpose**: View all support tickets
  - **Features**: Ticket status, replies, filter by status

- **`/support/tickets/[id]`** - Ticket details
  - **Components**: `TicketDetailClient`, `TicketMessages`, `TicketActions`
  - **Purpose**: View ticket conversation
  - **Features**: Message thread, attachments, close ticket

---

### Admin Routes (`(admin)/admin/`)

Admin-only routes for platform management. Requires admin role authentication.

#### Admin Dashboard

- **`/admin`** - Admin home

  - **Components**: `AdminDashboard`, `StatsOverview`, `ActivityFeed`, `QuickActions`
  - **Purpose**: Admin dashboard overview
  - **Features**: Platform stats, recent activity, alerts

- **`/admin/dashboard`** - Detailed dashboard
  - **Components**: `DetailedDashboard`, `RevenueChart`, `UserGrowth`, `OrderMetrics`
  - **Purpose**: Comprehensive platform metrics
  - **Features**: Charts, KPIs, trends, export reports

#### User Management

- **`/admin/users`** - User list

  - **Components**: `UserListClient`, `DataTable`, `UserFilters`, `BulkActions`
  - **Purpose**: Manage platform users
  - **Features**: View users, search, filter, suspend, delete

- **`/admin/users/[id]`** - User details
  - **Components**: `UserDetailClient`, `UserInfo`, `UserActivity`, `UserOrders`
  - **Purpose**: View user profile
  - **Features**: User info, orders, activity, actions

#### Product Management

- **`/admin/products`** - Product list

  - **Components**: `AdminProductsClient`, `DataTable`, `ProductFilters`
  - **Purpose**: Moderate all products
  - **Features**: Approve, reject, edit, delete products

- **`/admin/products/[id]/edit`** - Edit product
  - **Components**: `AdminProductEdit`, `ProductForm`, `ModerationNotes`
  - **Purpose**: Edit any product
  - **Features**: Full product control, moderation notes

#### Category Management

- **`/admin/categories`** - Category list

  - **Components**: `CategoryTreeClient`, `CategoryTable`, `CategoryActions`
  - **Purpose**: Manage categories
  - **Features**: Add, edit, delete, reorder categories

- **`/admin/categories/create`** - Create category

  - **Components**: `CategoryCreateForm`, `ParentSelector`, `CategoryIcon`
  - **Purpose**: Add new category
  - **Features**: Parent selection, icon, featured image

- **`/admin/categories/[slug]/edit`** - Edit category
  - **Components**: `CategoryEditForm`, `CategoryTree`, `SubcategoryManager`
  - **Purpose**: Edit category
  - **Features**: Update details, move in tree, merge

#### Shop Management

- **`/admin/shops`** - Shop list

  - **Components**: `ShopListClient`, `DataTable`, `ShopFilters`, `ShopActions`
  - **Purpose**: Manage all shops
  - **Features**: Approve, suspend, verify shops

- **`/admin/shops/[id]/edit`** - Edit shop
  - **Components**: `ShopEditForm`, `ShopVerification`, `ModerationNotes`
  - **Purpose**: Edit shop details
  - **Features**: Full control, verification, notes

#### Order Management

- **`/admin/orders`** - Order list

  - **Components**: `AdminOrdersClient`, `DataTable`, `OrderFilters`, `OrderActions`
  - **Purpose**: View all orders
  - **Features**: Monitor, cancel, refund orders

- **`/admin/orders/[id]`** - Order details
  - **Components**: `AdminOrderDetail`, `OrderTimeline`, `OrderActions`
  - **Purpose**: View order details
  - **Features**: Full order info, status change, refund

#### Auction Management

- **`/admin/auctions`** - Auction list

  - **Components**: `AdminAuctionsClient`, `DataTable`, `AuctionFilters`
  - **Purpose**: Manage all auctions
  - **Features**: Approve, monitor, end auctions

- **`/admin/auctions/live`** - Live auctions

  - **Components**: `LiveAuctionsClient`, `LiveAuctionCard`, `BidMonitor`
  - **Purpose**: Monitor live auctions
  - **Features**: Real-time bids, intervention, alerts

- **`/admin/auctions/moderation`** - Auction moderation
  - **Components**: `AuctionModerationClient`, `ModerationQueue`, `AuctionReview`
  - **Purpose**: Approve pending auctions
  - **Features**: Review, approve, reject auctions

#### Review Management

- **`/admin/reviews`** - Review list
  - **Components**: `AdminReviewsClient`, `DataTable`, `ReviewFilters`
  - **Purpose**: Moderate reviews
  - **Features**: Approve, hide, delete reviews

#### Payment & Payout Management

- **`/admin/payments`** - Payment list

  - **Components**: `PaymentListClient`, `DataTable`, `PaymentFilters`, `PaymentDetails`
  - **Purpose**: View all payments
  - **Features**: Payment history, status, refunds

- **`/admin/payouts`** - Payout management
  - **Components**: `PayoutListClient`, `DataTable`, `PayoutFilters`, `ProcessPayout`
  - **Purpose**: Manage seller payouts
  - **Features**: Approve, process, reject payouts

#### Returns Management

- **`/admin/returns`** - Return requests
  - **Components**: `ReturnListClient`, `DataTable`, `ReturnFilters`, `ReturnActions`
  - **Purpose**: Manage return requests
  - **Features**: Approve, reject, track returns

#### Coupon Management

- **`/admin/coupons`** - Coupon list

  - **Components**: `CouponListClient`, `DataTable`, `CouponFilters`
  - **Purpose**: Manage discount coupons
  - **Features**: Create, edit, activate, deactivate

- **`/admin/coupons/create`** - Create coupon

  - **Components**: `CouponCreateForm`, `DiscountSettings`, `UsageLimits`
  - **Purpose**: Create new coupon
  - **Features**: Discount type, validity, usage limits

- **`/admin/coupons/[id]/edit`** - Edit coupon
  - **Components**: `CouponEditForm`, `CouponUsageStats`
  - **Purpose**: Edit coupon
  - **Features**: Update details, view usage stats

#### Blog Management

- **`/admin/blog`** - Blog post list

  - **Components**: `BlogListClient`, `DataTable`, `BlogFilters`
  - **Purpose**: Manage blog posts
  - **Features**: Create, edit, publish, delete posts

- **`/admin/blog/create`** - Create blog post

  - **Components**: `BlogCreateForm`, `RichTextEditor`, `FeaturedImage`, `SEOSettings`
  - **Purpose**: Create blog post
  - **Features**: Rich content, images, SEO, scheduling

- **`/admin/blog/[id]/edit`** - Edit blog post

  - **Components**: `BlogEditForm`, `RichTextEditor`, `PostSettings`
  - **Purpose**: Edit blog post
  - **Features**: Update content, republish

- **`/admin/blog/categories`** - Blog categories

  - **Components**: `BlogCategoryList`, `CategoryForm`
  - **Purpose**: Manage blog categories
  - **Features**: Add, edit, delete categories

- **`/admin/blog/tags`** - Blog tags
  - **Components**: `BlogTagList`, `TagForm`
  - **Purpose**: Manage blog tags
  - **Features**: Add, edit, delete tags

#### Homepage Management

- **`/admin/homepage`** - Homepage settings

  - **Components**: `HomepageSettings`, `SectionToggle`, `FeaturedContent`
  - **Purpose**: Configure homepage
  - **Features**: Enable/disable sections, featured content

- **`/admin/hero-slides`** - Hero slides

  - **Components**: `HeroSlideList`, `DataTable`, `SlideActions`
  - **Purpose**: Manage hero carousel
  - **Features**: Add, edit, reorder, activate slides

- **`/admin/hero-slides/create`** - Create slide

  - **Components**: `HeroSlideForm`, `ImageUploadWithCrop`, `LinkSettings`
  - **Purpose**: Create hero slide
  - **Features**: Image, title, link, schedule

- **`/admin/hero-slides/[id]/edit`** - Edit slide

  - **Components**: `HeroSlideEditForm`, `SlidePreview`
  - **Purpose**: Edit hero slide
  - **Features**: Update content, preview

- **`/admin/featured-sections`** - Featured sections
  - **Components**: `FeaturedSectionList`, `SectionConfig`
  - **Purpose**: Manage featured sections
  - **Features**: Products, categories, shops sections

#### Event Management

- **`/admin/events`** - Event list

  - **Components**: `EventListClient`, `DataTable`, `EventFilters`
  - **Purpose**: Manage platform events
  - **Features**: Create, edit, publish events

- **`/admin/events/[id]`** - Event details
  - **Components**: `EventEditForm`, `EventSettings`, `EventRegistrations`
  - **Purpose**: Edit event
  - **Features**: Update details, view registrations

#### Email Management

- **`/admin/emails`** - Email templates
  - **Components**: `EmailTemplateList`, `TemplateEditor`
  - **Purpose**: Manage email templates
  - **Features**: Edit templates, test emails

#### Support Ticket Management

- **`/admin/support-tickets`** - Ticket list

  - **Components**: `AdminTicketList`, `DataTable`, `TicketFilters`
  - **Purpose**: Manage support tickets
  - **Features**: Assign, respond, close tickets

- **`/admin/support-tickets/[id]`** - Ticket details

  - **Components**: `AdminTicketDetail`, `TicketThread`, `AdminResponse`
  - **Purpose**: View and respond to ticket
  - **Features**: Full conversation, assign, resolve

- **`/admin/tickets`** - Internal tickets (alternative view)
  - Similar to support-tickets but different URL structure

#### Analytics

- **`/admin/analytics`** - Analytics dashboard

  - **Components**: `AnalyticsDashboard`, `RevenueChart`, `UserMetrics`, `ProductMetrics`
  - **Purpose**: Platform analytics
  - **Features**: Revenue, users, products, trends

- **`/admin/analytics/sales`** - Sales analytics

  - **Components**: `SalesAnalytics`, `SalesChart`, `TopProducts`, `SalesReports`
  - **Purpose**: Detailed sales data
  - **Features**: Period comparison, export reports

- **`/admin/analytics/users`** - User analytics

  - **Components**: `UserAnalytics`, `UserGrowth`, `UserSegments`, `ActivityHeatmap`
  - **Purpose**: User insights
  - **Features**: Growth, retention, activity

- **`/admin/analytics/payments`** - Payment analytics

  - **Components**: `PaymentAnalytics`, `PaymentMethodChart`, `TransactionVolume`
  - **Purpose**: Payment insights
  - **Features**: Payment methods, success rates

- **`/admin/analytics/auctions`** - Auction analytics
  - **Components**: `AuctionAnalytics`, `AuctionMetrics`, `BidAnalysis`
  - **Purpose**: Auction performance
  - **Features**: Conversion rates, bid metrics

#### Static Assets

- **`/admin/static-assets`** - Asset management
  - **Components**: `StaticAssetManager`, `FileUpload`, `AssetGallery`
  - **Purpose**: Manage platform assets
  - **Features**: Upload, organize, delete images/files

#### RipLimit (Platform Credits)

- **`/admin/riplimit`** - RipLimit management
  - **Components**: `RipLimitClient`, `CreditManager`, `RefundList`
  - **Purpose**: Manage platform credit system
  - **Features**: Refunds, adjustments, credit history

#### Settings

- **`/admin/settings`** - Settings overview

  - **Components**: `SettingsNav`, `SettingsSidebar`
  - **Purpose**: Admin settings navigation
  - **Features**: Access all settings sections

- **`/admin/settings/general`** - General settings

  - **Components**: `GeneralSettings`, `PlatformInfo`, `MaintenanceMode`
  - **Purpose**: Basic platform settings
  - **Features**: Site name, logo, maintenance mode

- **`/admin/settings/payment`** - Payment settings

  - **Components**: `PaymentSettings`, `GatewayConfig`
  - **Purpose**: Configure payment gateways
  - **Features**: Razorpay, COD, settings

- **`/admin/settings/payment-gateways`** - Payment gateway details

  - **Components**: `PaymentGatewayList`, `GatewayForm`
  - **Purpose**: Manage payment providers
  - **Features**: Add, configure gateways

- **`/admin/settings/shipping`** - Shipping settings

  - **Components**: `ShippingSettings`, `ShippingZones`, `ShippingRates`
  - **Purpose**: Configure shipping
  - **Features**: Zones, rates, carriers

- **`/admin/settings/email`** - Email settings

  - **Components**: `EmailSettings`, `SMTPConfig`, `EmailTemplates`
  - **Purpose**: Email configuration
  - **Features**: SMTP, sender info, templates

- **`/admin/settings/notifications`** - Notification settings

  - **Components**: `NotificationSettings`, `NotificationTypes`
  - **Purpose**: Configure notifications
  - **Features**: Email, push, SMS settings

- **`/admin/settings/address-api`** - Address API settings

  - **Components**: `AddressAPISettings`, `APIKeyConfig`
  - **Purpose**: Configure address lookup APIs
  - **Features**: Google Places, postal code APIs

- **`/admin/settings/whatsapp`** - WhatsApp settings

  - **Components**: `WhatsAppSettings`, `MessageTemplates`
  - **Purpose**: WhatsApp integration
  - **Features**: API config, message templates

- **`/admin/settings/features`** - Feature flags

  - **Components**: `FeatureFlags`, `FeatureToggle`
  - **Purpose**: Enable/disable features
  - **Features**: Toggle auctions, reviews, etc.

- **`/admin/settings/maintenance`** - Maintenance mode
  - **Components**: `MaintenanceSettings`, `MaintenanceMessage`
  - **Purpose**: Maintenance mode control
  - **Features**: Enable, custom message, allowed IPs

#### Demo & Development

- **`/admin/demo`** - Component demo

  - **Components**: Various demo components
  - **Purpose**: Test components
  - **Features**: Component playground

- **`/admin/component-demo`** - Component showcase

  - **Components**: Component examples
  - **Purpose**: Component documentation
  - **Features**: Live examples

- **`/admin/demo-credentials`** - Demo credentials
  - **Components**: `DemoCredentials`, `TestAccounts`
  - **Purpose**: Test account info
  - **Features**: Demo login credentials

---

### Auth Routes (`(auth)/`)

Authentication and account management routes. No auth required (except logout).

- **`/login`** - Login page

  - **Components**: `LoginForm`, `SocialLogin`, `RememberMe`
  - **Purpose**: User authentication
  - **Features**: Email/password, social login, remember me

- **`/register`** - Registration page

  - **Components**: `RegisterForm`, `TermsCheckbox`, `EmailVerification`
  - **Purpose**: Create new account
  - **Features**: Form validation, email verification

- **`/forgot-password`** - Forgot password

  - **Components**: `ForgotPasswordForm`, `EmailInput`
  - **Purpose**: Password recovery
  - **Features**: Send reset email

- **`/reset-password`** - Reset password

  - **Components**: `ResetPasswordForm`, `PasswordStrength`
  - **Purpose**: Set new password
  - **Features**: Token validation, password confirmation

- **`/logout`** - Logout handler
  - **Purpose**: Sign out user
  - **Features**: Clear session, redirect to home

---

### Special Routes

#### Error Pages

- **`/error.tsx`** - Error boundary

  - **Components**: `ErrorBoundary`, `ErrorMessage`
  - **Purpose**: Handle runtime errors
  - **Features**: Error display, retry, report

- **`/global-error.tsx`** - Global error handler

  - **Components**: `GlobalErrorBoundary`
  - **Purpose**: Root-level error handling
  - **Features**: Fallback UI

- **`/not-found.tsx`** - 404 page

  - **Components**: `NotFoundContent`, `SearchSuggestions`
  - **Purpose**: Handle missing routes
  - **Features**: Helpful links, search

- **`/forbidden`** - 403 page

  - **Components**: `ForbiddenContent`
  - **Purpose**: Access denied
  - **Features**: Reason, contact support

- **`/unauthorized`** - 401 page
  - **Components**: `UnauthorizedContent`, `LoginLink`
  - **Purpose**: Requires authentication
  - **Features**: Login prompt, redirect

#### Demo Routes

- **`/demo/form-accessibility`** - Form accessibility demo
- **`/demo/virtual-scroll`** - Virtual scrolling demo
  - **Purpose**: Development/testing
  - **Features**: Component demos, testing

#### SEO & Metadata

- **`/robots.ts`** - Robots.txt configuration

  - **Purpose**: SEO, crawler control
  - **Features**: Dynamic robots.txt

- **`/sitemap.ts`** - Sitemap generation
  - **Purpose**: SEO, site structure
  - **Features**: Dynamic sitemap.xml

---

## 🧩 Component Architecture

### Component Hierarchy

```
App (RootLayout)
├── Providers (AuthProvider, CartProvider, ThemeProvider, etc.)
├── Header (Navigation, Search, Cart Icon, User Menu)
├── Main Content (Page-specific)
└── Footer (Links, Newsletter, Social)
```

### Key Component Categories

#### 1. Layout Components (`src/components/layout/`)

- **Header** - Main navigation, search, cart, user menu
- **Footer** - Site links, newsletter, social media
- **Sidebar** - Admin/seller navigation
- **MobileNav** - Mobile navigation drawer
- **Breadcrumbs** - Page navigation trail

#### 2. Homepage Components (`src/components/homepage/`)

- **HeroSection** - Main hero carousel with slides
- **WelcomeHero** - Welcome message for authenticated users
- **ProductsSection** - Featured products grid
- **AuctionsSection** - Live/upcoming auctions
- **FeaturedCategoriesSection** - Category cards
- **FeaturedShopsSection** - Top shops
- **FeaturedBlogsSection** - Recent blog posts
- **RecentReviewsSection** - Latest reviews
- **ValueProposition** - Why choose us section
- **FAQSection** - Quick FAQs

#### 3. Product Components (`src/components/product/`)

- **ProductCard** - Product grid item
- **ProductList** - Product listing
- **ProductDetail** - Full product view
- **ProductGallery** - Image carousel/zoom
- **ProductInfo** - Details, price, stock
- **ProductVariants** - Size, color options
- **AddToCart** - Add to cart button
- **RecentlyViewedWidget** - Recently viewed products
- **RelatedProducts** - Similar items
- **ProductReviews** - Review list

#### 4. Auction Components (`src/components/auction/`)

- **AuctionCard** - Auction grid item
- **AuctionDetail** - Full auction view
- **BiddingPanel** - Place bid interface
- **BidHistory** - List of bids
- **AuctionTimer** - Countdown timer
- **AutoBid** - Automatic bidding setup
- **WinnerAnnouncement** - Auction end notice

#### 5. Cart & Checkout Components (`src/components/cart/`, `src/components/checkout/`)

- **CartDrawer** - Slide-out cart
- **CartItems** - Items in cart
- **CartSummary** - Total, shipping, discount
- **CheckoutForm** - Multi-step checkout
- **AddressSelector** - Delivery address
- **PaymentOptions** - Payment method selection
- **OrderSummary** - Final review before payment

#### 6. User Components (`src/components/user/`)

- **ProfileForm** - Edit profile
- **ProfileStats** - User statistics
- **OrderHistory** - Past orders
- **OrderCard** - Order item
- **AddressList** - Saved addresses
- **WatchlistCard** - Watchlist item
- **ReviewForm** - Write review
- **NotificationList** - User notifications

#### 7. Seller Components (`src/components/seller/`)

- **SellerDashboard** - Seller home
- **SalesChart** - Revenue visualization
- **OrderTable** - Seller orders
- **ProductManager** - Product CRUD
- **InventoryManager** - Stock management
- **ShopSettings** - Shop profile
- **PayoutHistory** - Earnings tracking

#### 8. Admin Components (`src/components/admin/`)

- **AdminDashboard** - Admin home
- **StatsOverview** - Platform metrics
- **UserTable** - User management
- **ProductModeration** - Product approval
- **OrderManagement** - Order oversight
- **CategoryManager** - Category tree
- **CouponManager** - Discount management
- **SettingsPanel** - Platform settings

#### 9. Auth Components (`src/components/auth/`)

- **LoginForm** - Sign in
- **RegisterForm** - Sign up
- **SocialLogin** - OAuth buttons
- **ForgotPasswordForm** - Password reset
- **EmailVerification** - Verify email

#### 10. Navigation Components (`src/components/navigation/`)

- **MainNav** - Primary navigation
- **CategoryNav** - Category menu
- **MegaMenu** - Multi-column dropdown
- **UserMenu** - Account dropdown
- **BreadcrumbNav** - Page breadcrumbs

#### 11. Search Components (`src/components/search/`)

- **SearchBar** - Search input (from library)
- **SearchResults** - Result display
- **SearchFilters** - Filter sidebar (from library)
- **SearchSuggestions** - Autocomplete

#### 12. Provider Components (`src/components/providers/`)

- **AuthProvider** - Authentication context
- **CartProvider** - Shopping cart state
- **ThemeProvider** - Dark/light mode
- **ToastProvider** - Notifications (from library)
- **QueryProvider** - React Query setup
- **FirebaseProvider** - Firebase initialization

#### 13. Common Components (`src/components/common/`)

- **ErrorBoundary** - Error handling
- **ErrorInitializer** - Error setup
- **NotImplemented** - Placeholder
- **StatsCard** - Stat display
- **Skeletons** - Loading states (app-specific)

#### 14. Form Components (from `@letitrip/react-library`)

- **FormField** - Generic form field
- **FormInput** - Text input
- **FormTextarea** - Multiline input
- **FormSelect** - Dropdown
- **FormCheckbox** - Checkbox
- **FormRadio** - Radio buttons
- **FormDatePicker** - Date picker
- **FormCurrencyInput** - Money input
- **RichTextEditor** - WYSIWYG editor
- **ImageUploadWithCrop** - Image upload with cropping
- **VideoUploadWithThumbnail** - Video upload

#### 15. Table Components (from `@letitrip/react-library`)

- **DataTable** - Sortable, filterable table
- **ResponsiveTable** - Mobile-friendly table
- **BulkActionBar** - Multi-select actions
- **ActionMenu** - Row actions dropdown
- **StatusBadge** - Status indicator
- **EmptyState** - No data message
- **ErrorState** - Error display
- **PageState** - Loading/error/empty states

#### 16. UI Components (from `@letitrip/react-library`)

- **Button** - Primary button
- **Card** - Content container
- **Toast** - Notification toast
- **ConfirmDialog** - Confirmation modal
- **ErrorMessage** - Error display
- **FieldError** - Form field error
- **ThemeToggle** - Dark mode toggle
- **StatCard** - Metric card
- **OptimizedImage** - Image component

---

## 🔥 Key Features

### 1. Real-time Auctions

- Live bidding with WebSocket updates
- Automatic bid increments
- Countdown timers
- Bid history tracking
- Winner notifications
- Reserve price handling

### 2. Multi-vendor Marketplace

- Seller registration and verification
- Shop profiles and branding
- Product management dashboard
- Order fulfillment workflow
- Payout management
- Performance analytics

### 3. Advanced Search & Filtering

- Full-text search across products, shops, auctions
- Multi-faceted filters (category, price, rating, etc.)
- Sort options (price, date, popularity)
- Saved searches
- Search suggestions

### 4. Shopping Cart & Checkout

- Add to cart from product/auction pages
- Quantity updates
- Coupon application
- Multiple address support
- Payment gateway integration (Razorpay)
- Order confirmation emails

### 5. User Management

- Registration with email verification
- Social login (OAuth)
- Profile management
- Order history
- Watchlist/favorites
- Review system
- Messaging system

### 6. Admin Dashboard

- Platform analytics and insights
- User, product, shop, order management
- Content moderation
- Blog management
- Homepage customization
- Settings and configuration
- Payment and payout management

### 7. Blog System

- Rich content editor
- Categories and tags
- Featured images
- SEO optimization
- Comments (optional)
- Related posts

### 8. Review & Rating System

- Product reviews
- Shop ratings
- Verified purchase badges
- Review moderation
- Helpful votes
- Review images

### 9. Notification System

- Email notifications
- In-app notifications
- Push notifications (optional)
- Notification preferences
- Real-time updates

### 10. Responsive Design

- Mobile-first approach
- Tablet optimization
- Desktop layouts
- Touch-friendly interfaces
- Progressive Web App (PWA) capabilities

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn
- Firebase project (Firestore, Storage, Auth)
- Razorpay account (for payments)

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/mohasinac/letitrip.in.git
   cd letitrip.in
   ```

2. **Install dependencies**

   ```bash
   npm install
   # Also install library dependencies
   cd react-library && npm install && cd ..
   ```

3. **Environment setup**

   - Copy `.env.example` to `.env.local`
   - Fill in Firebase credentials
   - Add Razorpay keys
   - Configure other services

4. **Firebase setup**

   ```bash
   # Deploy Firestore rules and indexes
   npm run setup:firebase-rules

   # Deploy custom indexes
   npm run indexes:deploy
   ```

5. **Build the library**

   ```bash
   npm run lib:build
   ```

6. **Run development server**

   ```bash
   npm run dev
   ```

7. **Open browser**
   - Navigate to `http://localhost:3000`

### Project Structure

```
letitrip.in/
├── src/
│   ├── app/                 # Next.js App Router pages
│   ├── components/          # React components
│   ├── lib/                 # Utility functions
│   ├── services/            # API services
│   ├── hooks/               # Next.js-specific hooks
│   ├── contexts/            # React contexts
│   ├── types/               # TypeScript types
│   ├── config/              # Configuration files
│   ├── constants/           # Constants
│   └── styles/              # Global styles
├── react-library/           # Shared component library
│   ├── src/
│   │   ├── components/      # Library components
│   │   ├── hooks/           # Library hooks
│   │   ├── adapters/        # Service adapters
│   │   ├── types/           # Library types
│   │   └── utils/           # Utilities
│   └── stories/             # Storybook stories
├── functions/               # Firebase Cloud Functions
├── tests/                   # Test suites (submodule)
├── firestore-indexes/       # Firestore index definitions
├── public/                  # Static assets
└── scripts/                 # Build and deployment scripts
```

---

## 🔌 API Routes

All API routes are in `src/app/api/v1/`. Key endpoints:

### Authentication

- `POST /api/v1/auth/register` - Register user
- `POST /api/v1/auth/login` - Login user
- `POST /api/v1/auth/logout` - Logout user
- `POST /api/v1/auth/forgot-password` - Password reset
- `POST /api/v1/auth/verify-email` - Verify email

### Products

- `GET /api/v1/products` - List products
- `GET /api/v1/products/[id]` - Get product
- `POST /api/v1/products` - Create product (seller)
- `PUT /api/v1/products/[id]` - Update product (seller)
- `DELETE /api/v1/products/[id]` - Delete product (seller)

### Auctions

- `GET /api/v1/auctions` - List auctions
- `GET /api/v1/auctions/[id]` - Get auction
- `POST /api/v1/auctions` - Create auction (seller)
- `POST /api/v1/auctions/[id]/bid` - Place bid
- `GET /api/v1/auctions/[id]/bids` - Get bid history

### Cart

- `GET /api/v1/cart` - Get cart
- `POST /api/v1/cart/add` - Add to cart
- `PUT /api/v1/cart/update` - Update cart item
- `DELETE /api/v1/cart/remove` - Remove from cart
- `DELETE /api/v1/cart/clear` - Clear cart

### Orders

- `GET /api/v1/orders` - List orders
- `GET /api/v1/orders/[id]` - Get order
- `POST /api/v1/orders` - Create order
- `PUT /api/v1/orders/[id]/status` - Update status (seller)
- `POST /api/v1/orders/[id]/cancel` - Cancel order

### Payments

- `POST /api/v1/payments/create` - Create payment
- `POST /api/v1/payments/verify` - Verify payment
- `POST /api/v1/payments/refund` - Refund payment

### Reviews

- `GET /api/v1/reviews` - List reviews
- `POST /api/v1/reviews` - Create review
- `PUT /api/v1/reviews/[id]` - Update review
- `DELETE /api/v1/reviews/[id]` - Delete review

### Admin

- `GET /api/v1/admin/stats` - Platform statistics
- `GET /api/v1/admin/users` - List users
- `PUT /api/v1/admin/users/[id]/suspend` - Suspend user
- `GET /api/v1/admin/analytics` - Analytics data

---

## 🔄 State Management

### Global State (React Context)

- **AuthContext** - User authentication state
- **CartContext** - Shopping cart state
- **ThemeContext** - Dark/light mode
- **GlobalSearchContext** - Search state
- **ComparisonContext** - Product comparison
- **ViewingHistoryContext** - Browsing history
- **LoginRegisterContext** - Modal state

### Server State (TanStack Query)

- Product data
- Auction data
- Order data
- User data
- Shop data
- Category data
- Review data

### Local State

- Form state (React Hook Form)
- UI state (modals, drawers, tooltips)
- Filter state (URL-based with useUrlFilters)
- Pagination state (URL-based with useUrlPagination)

---

## 🧪 Testing

### Test Structure

```
tests/                        # Test suite (submodule)
├── e2e/                      # Playwright E2E tests
│   ├── auth.spec.ts
│   ├── checkout.spec.ts
│   ├── search.spec.ts
│   └── upload-components.spec.ts
├── integration/              # Integration tests
│   ├── auth-flow.test.ts
│   ├── product-media-upload.test.tsx
│   └── auction-media-upload.test.tsx
├── src/                      # Unit tests
│   ├── components/           # Component tests
│   ├── hooks/                # Hook tests (Next.js-specific)
│   └── services/             # Service tests
└── TDD/                      # Test-driven development

react-library/src/__tests__/  # Library tests
├── components/               # Component tests (28+ files)
├── hooks/                    # Hook tests (7+ files)
├── integration/              # Upload integration tests
└── performance/              # Performance tests
```

### Running Tests

```bash
# Unit tests (Jest)
npm test

# E2E tests (Playwright)
npx playwright test

# Library tests (Vitest)
npm run lib:test

# Coverage
npm run test:coverage
```

---

## 📦 Component Library (`@letitrip/react-library`)

### Usage

All reusable UI components have been migrated to the library:

```typescript
import {
  Button,
  Card,
  DataTable,
  FormInput,
  SearchBar,
  Toast,
  useDebounce,
  useMediaUpload,
} from "@letitrip/react-library";
```

### Library Categories

- **Forms** (20 components) - FormField, FormInput, FormSelect, RichTextEditor, etc.
- **Tables** (13 components) - DataTable, ResponsiveTable, BulkActionBar, etc.
- **Filters** (19 components) - FilterSidebar, SearchBar, PriceRangeFilter, etc.
- **Pagination** (3 components) - AdvancedPagination, SimplePagination, CursorPagination
- **UI** (22 components) - Button, Card, Toast, ConfirmDialog, etc.
- **Selectors** (9 components) - CategorySelector, AddressSelectorWithCreate, etc.
- **Wrappers** (4 components) - ResourceListWrapper, ResourceDetailWrapper, etc.
- **Values** (20 components) - Price, Currency, Rating, StockStatus, etc.
- **Hooks** (26 hooks) - useQuery, useMutation, useFilters, useFormState, etc.

### Documentation

- Library docs: `react-library/README.md`
- Storybook: `npm run lib:storybook`
- Component tests: `react-library/src/__tests__/`

---

## 🔐 Authentication & Authorization

### User Roles

- **Guest** - Unauthenticated visitors (browse, search)
- **User** - Registered customers (buy, bid, review)
- **Seller** - Vendors (sell products, manage shop)
- **Admin** - Platform administrators (full access)

### Protected Routes

- Route groups enforce authentication at layout level
- Middleware checks user roles
- Redirects to `/login` if unauthenticated
- Shows 403 Forbidden if insufficient permissions

### Firebase Auth

- Email/password authentication
- Social login (Google, Facebook, etc.)
- Email verification
- Password reset
- Session management

---

## 🎨 Styling & Theming

### Tailwind CSS

- Utility-first CSS framework
- Custom color palette
- Responsive breakpoints
- Dark mode support
- Custom components via @apply

### Theme System

- Light/dark mode toggle
- Persisted preference (localStorage)
- ThemeProvider context
- CSS variables for colors

---

## 🚢 Deployment

### Build

```bash
npm run build
```

### Deploy to Vercel

```bash
npm run deploy:vercel
```

### Deploy to Firebase

```bash
npm run deploy:firebase
```

### Environment Sync

```bash
npm run sync:env
```

---

## 📄 License

This project is proprietary software. All rights reserved.

---

## 🤝 Contributing

This is a private project. For authorized contributors:

1. Create feature branch from `main`
2. Make changes with descriptive commits
3. Run tests before pushing
4. Create pull request
5. Code review and merge

---

## 📞 Support

For issues or questions:

- Email: support@letitrip.in
- Documentation: See individual component README files
- API Docs: `/api/v1/docs` (when running)

---

## 🏗 Architecture Decisions

### Why Next.js App Router?

- Server-side rendering (SSR) for SEO
- Static generation for performance
- File-based routing
- API routes
- React Server Components
- Optimized image loading

### Why Firebase?

- Real-time database (Firestore)
- Scalable file storage
- Built-in authentication
- Serverless functions
- No server management
- Pay-as-you-go pricing

### Why Component Library?

- Framework-agnostic reusable components
- Consistent UI across app
- Independent testing
- Separate versioning
- Storybook documentation
- Reduced main app bundle size

### Why TanStack Query?

- Automatic caching
- Background refetching
- Optimistic updates
- Request deduplication
- Pagination support
- Error handling

---

## 📊 Performance Optimizations

1. **Code Splitting** - Dynamic imports for non-critical components
2. **Image Optimization** - Next.js Image component, lazy loading
3. **Bundle Analysis** - Webpack bundle analyzer
4. **Tree Shaking** - Remove unused code
5. **Caching** - React Query caching, CDN caching
6. **Compression** - Gzip/Brotli compression
7. **Lazy Loading** - Route-based code splitting
8. **Virtual Scrolling** - For large lists (TanStack Virtual)

---

## 🔮 Future Enhancements

- Progressive Web App (PWA) features
- Mobile app (React Native)
- Real-time chat (Firebase Realtime Database)
- Advanced analytics dashboard
- Multi-language support (i18next)
- Multi-currency support
- Subscription plans
- Affiliate program
- Wishlist sharing
- Social features

---

**Last Updated:** January 16, 2026  
**Version:** 1.0.0
