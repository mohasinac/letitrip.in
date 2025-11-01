# 🚀 E-Commerce Implementation Roadmap

**Goal:** Complete working e-commerce website with full shopping features
**Timeline:** Multiple sessions (Prioritized implementation)

---

## 📋 Overview

This document outlines the implementation plan for transforming the current website into a fully functional e-commerce platform with:

- Multi-currency support
- Shopping cart & wishlist
- Secure checkout with payment integration
- Order management workflow
- Product discovery & search
- Store listings
- Category browsing
- Live search functionality
- SEO optimization

---

## 🎯 Priority Matrix

### **Session 1: Core Shopping Experience (CRITICAL)**

- ✅ Currency system with conversion
- ✅ Cart context & floating cart
- ✅ Wishlist functionality
- ✅ Basic cart page

### **Session 2: Checkout & Payments (CRITICAL)**

- ✅ Address management (CRUD)
- ✅ Checkout page with address selection
- ⏳ Payment gateway integration (Razorpay + PayPal)
- ⏳ Order creation flow
- ⏳ User profile sidebar

### **Session 3: Order Management (HIGH)**

- ⏳ Order status workflow
- ⏳ Seller order acceptance
- ⏳ Shipment creation (Shiprocket integration)
- ⏳ Order tracking updates
- ⏳ Review system (product + seller)

### **Session 4: Product Discovery (HIGH)**

- ⏳ Products listing page with filters
- ⏳ Live search with infinite scroll
- ⏳ Advanced filters (price, category, stock, etc.)
- ⏳ Sort options
- ⏳ Out of stock toggle

### **Session 5: Product Details (MEDIUM)**

- ⏳ Product detail page
- ⏳ Seller information display
- ⏳ Product variants (same root category)
- ⏳ Similar products recommendations
- ⏳ Reviews display

### **Session 6: Stores & Categories (MEDIUM)**

- ⏳ Stores listing page
- ⏳ Store filters & search
- ⏳ Categories page with products
- ⏳ Category search functionality

### **Session 7: Search & SEO (MEDIUM)**

- ⏳ Global live search
- ⏳ Search across products, sellers, categories
- ⏳ Sitemap generation on deployment
- ⏳ Fix broken links

### **Session 8: Polish & Testing (LOW)**

- ⏳ Code optimization
- ⏳ Testing & bug fixes
- ⏳ Performance optimization
- ⏳ Final deployment

---

## 📦 Session 1: Core Shopping Experience

### 1.1 Currency System

**Location:** `src/contexts/CurrencyContext.tsx`

**Features:**

- Default currency: INR
- Support for multiple currencies (USD, EUR, GBP, etc.)
- Real-time currency conversion using Exchange Rate API
- Round to nearest higher value
- Persist user's currency preference
- Currency selector in navbar

**Technical Implementation:**

```typescript
interface CurrencyContext {
  currency: string;
  setCurrency: (currency: string) => void;
  convertPrice: (price: number) => number;
  formatPrice: (price: number) => string;
  exchangeRates: Record<string, number>;
}
```

**API Integration:**

- Use ExchangeRate-API or similar service
- Cache exchange rates (update daily)
- Store in localStorage for offline support

---

### 1.2 Shopping Cart System

**Location:** `src/contexts/CartContext.tsx`

**Features:**

- Add to cart
- Update quantity
- Remove items
- Move to wishlist
- Cart persistence (Firebase + localStorage)
- Real-time subtotal calculation
- Multi-seller cart support

**Components:**

- `FloatingCart.tsx` - Bottom-right floating button with count
- `CartDrawer.tsx` - Slide-in cart panel
- `CartPage.tsx` - Full cart page at `/cart`

**Technical Implementation:**

```typescript
interface CartContext {
  items: CartItem[];
  addItem: (product: Product, quantity: number) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  removeItem: (itemId: string) => void;
  moveToWishlist: (itemId: string) => void;
  clearCart: () => void;
  subtotal: number;
  itemCount: number;
}

interface CartItem {
  id: string;
  productId: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
  sellerId: string;
  sellerName: string;
  stock: number;
  currency: string;
}
```

---

### 1.3 Wishlist System

**Location:** `src/contexts/WishlistContext.tsx`, `src/app/wishlist/page.tsx`

**Features:**

- Add/remove from wishlist
- Move to cart
- Wishlist persistence
- Share wishlist (future)

**Components:**

- `WishlistButton.tsx` - Heart icon button
- `WishlistPage.tsx` - Full wishlist page at `/wishlist`

---

### 1.4 Floating Cart

**Location:** `src/components/cart/FloatingCart.tsx`

**Features:**

- Fixed position bottom-right
- Item count badge
- Click to open cart drawer
- Smooth animations
- Hide on scroll down, show on scroll up

---

### 1.5 Cart Page

**Location:** `src/app/cart/page.tsx`

**Features:**

- List all cart items grouped by seller
- Quantity controls
- Remove items
- Move to wishlist
- Apply coupon
- View price breakdown
- Proceed to checkout button

**Price Breakdown:**

- Subtotal
- Discount (coupon)
- Shipping cost (calculated per seller)
- Platform fee (if applicable)
- Tax (GST)
- **Total**

---

## 💳 Session 2: Checkout & Payments

### 2.1 Address Management

**Location:** `src/app/profile/addresses/page.tsx`, `src/components/address/AddressManager.tsx`

**Features:**

- List all saved addresses
- Add new address
- Edit existing address
- Delete address
- Set default address
- Address validation (pincode API)

**Database Schema:**

```typescript
interface Address {
  id: string;
  userId: string;
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  isDefault: boolean;
  type: "home" | "work" | "other";
  createdAt: string;
  updatedAt: string;
}
```

---

### 2.2 Checkout Page

**Location:** `src/app/checkout/page.tsx`

**Features:**

- Protected route (auth required)
- Address selection/creation
- Order summary
- Payment method selection
- Coupon application
- Terms & conditions checkbox

**Sections:**

1. **Shipping Address**

   - Select from saved addresses
   - Add new address inline
   - Address validation

2. **Order Summary**

   - Items grouped by seller
   - Price breakdown
   - Coupon discount
   - Sale discount
   - Shipping charges per seller
   - Platform fee
   - Tax calculation
   - Total amount

3. **Payment Method**

   - Razorpay (Domestic - INR)
   - PayPal (International - USD, 7% extra charge)
   - COD (if enabled by seller)

4. **Checkout Actions**
   - Easy checkout (default address + default payment)
   - Normal checkout (full flow)

---

### 2.3 Payment Integration

#### Razorpay (Domestic)

**Location:** `src/lib/payment/razorpay.ts`, `src/app/api/payment/razorpay/route.ts`

**Features:**

- Create order
- Process payment
- Verify signature
- Handle webhooks
- Refund processing

**Flow:**

1. Create Razorpay order on backend
2. Open Razorpay checkout on frontend
3. User completes payment
4. Verify payment signature
5. Create order in database
6. Send confirmation email

#### PayPal (International)

**Location:** `src/lib/payment/paypal.ts`, `src/app/api/payment/paypal/route.ts`

**Features:**

- Currency conversion with 7% fee
- Create PayPal order
- Capture payment
- Handle webhooks
- Refund processing

**Additional Charge:**

- 7% extra for PayPal conversion fees
- Display prominently during checkout

---

### 2.4 Order Creation

**Location:** `src/app/api/orders/create/route.ts`

**Process:**

1. Validate cart items
2. Check stock availability
3. Apply coupons/sales
4. Calculate final prices
5. Create order in database
6. Reduce product stock
7. Save currency used
8. Send notifications
9. Clear cart
10. Redirect to order confirmation

**Database Schema:**

```typescript
interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  sellerId: string;

  // Items
  items: OrderItem[];

  // Pricing
  subtotal: number;
  couponDiscount: number;
  saleDiscount: number;
  shippingCharges: number;
  platformFee: number;
  tax: number;
  total: number;

  // Currency
  currency: string;
  exchangeRate: number;
  originalAmount: number; // in INR

  // Payment
  paymentMethod: "razorpay" | "paypal" | "cod";
  paymentStatus: "pending" | "paid" | "failed";
  paymentId?: string;
  transactionId?: string;

  // Addresses
  shippingAddress: Address;
  billingAddress: Address;

  // Status
  status: OrderStatus;

  // Tracking
  trackingNumber?: string;
  shipmentId?: string;
  courierName?: string;

  // Notes
  customerNotes?: string;
  sellerNotes?: string;

  // Timestamps
  createdAt: string;
  updatedAt: string;
  paidAt?: string;
  approvedAt?: string;
  shippedAt?: string;
  deliveredAt?: string;
  cancelledAt?: string;
}

type OrderStatus =
  | "pending_payment"
  | "pending_approval"
  | "processing"
  | "shipped"
  | "in_transit"
  | "out_for_delivery"
  | "delivered"
  | "cancelled"
  | "refunded";
```

---

### 2.5 User Profile Sidebar

**Location:** `src/components/profile/ProfileSidebar.tsx`, `src/app/profile/layout.tsx`

**Sections:**

- Profile Information
- Orders
- Addresses
- Wishlist
- Reviews
- Settings
- Logout

---

## 📦 Session 3: Order Management

### 3.1 Order Workflow

**Status Progression:**

```
pending_payment → pending_approval → processing → shipped →
in_transit → out_for_delivery → delivered
```

**Roles & Actions:**

- **Buyer:** Place order, cancel order, confirm delivery, write review
- **Seller:** Accept/reject order, create shipment, update status
- **Admin:** Monitor all orders, intervene if needed

---

### 3.2 Seller Order Acceptance

**Location:** `src/app/seller/orders/[id]/page.tsx`

**Features:**

- View order details
- Accept order
- Reject order (with reason)
- Add internal notes

**Actions:**

- **Accept:** Status → `processing`
- **Reject:** Status → `cancelled`, refund initiated

---

### 3.3 Shipment Creation

**Location:** `src/app/seller/orders/[id]/shipment/page.tsx`

**Integration:** Shiprocket API

**Features:**

- Create shipment with Shiprocket
- Alternative: Manual shipment (own courier)
- Generate AWB code
- Print shipping label
- Update order status to `shipped`

**Shiprocket Flow:**

1. Authenticate with Shiprocket
2. Check serviceability
3. Get shipping rates
4. Create order
5. Assign courier
6. Get tracking details
7. Update order in database

---

### 3.4 Order Tracking

**Location:** `src/app/profile/orders/[id]/page.tsx`

**Features:**

- Real-time tracking status
- Timeline view
- Estimated delivery date
- Tracking number
- Courier details
- Contact seller/support

---

### 3.5 Review System

#### Product Reviews

**Location:** `src/components/reviews/ProductReview.tsx`

**Features:**

- Rating (1-5 stars)
- Review title & comment
- Upload images
- Verified purchase badge
- Helpful votes
- Seller response

**Eligibility:**

- Order status: `delivered`
- Within 30 days of delivery

#### Seller Reviews

**Location:** `src/components/reviews/SellerReview.tsx`

**Features:**

- Rating (1-5 stars)
- Review categories (communication, shipping, quality)
- Review comment
- Anonymous option

**Database Schema:**

```typescript
interface Review {
  id: string;
  type: "product" | "seller";
  targetId: string; // productId or sellerId
  userId: string;
  userName: string;
  orderId: string;
  rating: number;
  title?: string;
  comment: string;
  images?: string[];
  verified: boolean;
  helpful: number;
  status: "pending" | "approved" | "rejected";
  sellerResponse?: {
    comment: string;
    respondedAt: string;
  };
  createdAt: string;
  updatedAt: string;
}
```

---

### 3.6 Stock Management

**Automatic Stock Update:**

- Reduce stock when order is created
- Restore stock if order is cancelled
- Mark as out of stock when quantity = 0

**Out of Stock Handling:**

- Show "Out of Stock" badge
- Disable "Add to Cart" button
- Show notification option
- Similar products suggestion

---

## 🔍 Session 4: Product Discovery

### 4.1 Products Page

**Location:** `src/app/products/page.tsx`

**Features:**

- Infinite scroll (lazy loading)
- Live search
- Advanced filters
- Sort options
- Grid/List view toggle
- Show/hide out of stock

**Layout:**

```
┌─────────────────────────────────────────────┐
│ [Search Bar]          [Sort ▼] [View Toggle]│
├───────────┬─────────────────────────────────┤
│           │                                 │
│  Filters  │      Product Grid              │
│           │      (Infinite Scroll)         │
│           │                                 │
│           │                                 │
└───────────┴─────────────────────────────────┘
```

---

### 4.2 Filters (Left Sidebar)

**Location:** `src/components/products/ProductFilters.tsx`

**Filter Categories:**

1. **Categories** (hierarchical)

   - Multiple selection
   - Show count per category

2. **Price Range**

   - Min/Max input
   - Slider (optional)
   - Preset ranges

3. **Seller**

   - Search sellers
   - Multiple selection

4. **Rating**

   - 4 stars & up
   - 3 stars & up
   - 2 stars & up

5. **Condition**

   - New
   - Like New
   - Used

6. **Availability**

   - In Stock
   - Out of Stock
   - Pre-order

7. **Brand** (if applicable)

   - Multiple selection

8. **Tags**

   - Multiple selection

9. **Special Offers**
   - On Sale
   - Free Shipping
   - Coupons Available

**Filter Actions:**

- Apply Filters
- Clear All
- Save Filter (logged in users)

---

### 4.3 Sort Options

**Location:** Dropdown in header

**Options:**

- Relevance (default)
- Price: Low to High
- Price: High to Low
- Newest First
- Best Selling
- Top Rated
- Discount: High to Low

---

### 4.4 Live Search

**Location:** Search bar in header

**Features:**

- Search as you type (debounced)
- Highlight matching text
- Show results count
- No results message
- Recent searches (logged in)

**Search Filters Applied:**

- Product name
- Product description
- Category name
- Seller name
- Tags
- SKU

---

### 4.5 Infinite Scroll

**Technical Implementation:**

- Intersection Observer API
- Load 20 products per page
- Show loading indicator
- End of results message

---

## 📄 Session 5: Product Details

### 5.1 Product Detail Page

**Location:** `src/app/products/[slug]/page.tsx`

**Layout:**

```
┌─────────────────────────────────────────────┐
│ Breadcrumb                                  │
├─────────────┬───────────────────────────────┤
│             │  Product Title               │
│   Images    │  Rating & Reviews            │
│  (Gallery)  │  Price & Discount            │
│             │  Variants (if any)           │
│             │  Quantity Selector           │
│             │  [Add to Cart] [Wishlist]   │
├─────────────┴───────────────────────────────┤
│  Product Description                        │
│  Specifications                             │
│  Seller Information                         │
├─────────────────────────────────────────────┤
│  Product Variants (Same Root Category)     │
├─────────────────────────────────────────────┤
│  Similar Products                           │
├─────────────────────────────────────────────┤
│  Customer Reviews                           │
└─────────────────────────────────────────────┘
```

---

### 5.2 Image Gallery

**Features:**

- Main image display
- Thumbnail navigation
- Zoom on hover
- Full-screen mode
- Video support
- 360° view (if available)

---

### 5.3 Seller Information Card

**Location:** Right sidebar or below product info

**Display:**

- Seller name & logo
- Seller rating
- Total products
- Response time
- Ships from location
- [Visit Store] button
- [Contact Seller] button

---

### 5.4 Product Variants

**Location:** Below seller info

**Display:**

- Products with same root category
- Quick switch between variants
- Show differences (price, color, size, etc.)
- Maintain scroll position

**Example:**

```
Beyblade Burst Valkyrie
├── Red Edition ($25)
├── Blue Edition ($27) ← Current
└── Gold Limited Edition ($35)
```

---

### 5.5 Similar Products

**Location:** Below product details

**Algorithm:**

- Same categories (root and parents)
- Similar price range
- Same seller (if high rated)
- Exclude current product
- Show 8-12 products

---

### 5.6 Reviews Section

**Features:**

- Average rating
- Rating distribution
- Verified purchases filter
- Sort (most helpful, recent, highest/lowest rating)
- Pagination
- Images in reviews
- Helpful votes
- Report review

---

## 🏪 Session 6: Stores & Categories

### 6.1 Stores Page

**Location:** `src/app/stores/page.tsx`

**Features:**

- List all stores
- Show active and inactive (toggle)
- Search stores
- Filter by category
- Sort options
- Grid view

**Layout:**

```
┌─────────────────────────────────────────────┐
│ [Search] [Show Inactive ☐]    [Sort ▼]     │
├───────────┬─────────────────────────────────┤
│           │                                 │
│  Filters  │      Store Cards (Grid)        │
│           │                                 │
└───────────┴─────────────────────────────────┘
```

**Store Card:**

- Store logo
- Store name
- Rating & reviews
- Total products
- Categories
- "Active" or "Inactive" badge
- [Visit Store] button

---

### 6.2 Store Filters

**Filter Options:**

- Category
- Rating (4+, 3+)
- Location (city, state)
- Shipping (free shipping available)

---

### 6.3 Store Detail Page

**Location:** `src/app/stores/[id]/page.tsx`

**Sections:**

1. Store Header

   - Cover image
   - Logo
   - Name & description
   - Rating & stats
   - [Follow] button

2. Store Tabs

   - Products
   - About
   - Reviews
   - Policies

3. Products Grid
   - Filter by category
   - Search within store
   - Sort options

---

### 6.4 Categories Page

**Location:** `src/app/categories/page.tsx`, `src/app/categories/[slug]/page.tsx`

**Two Modes:**

#### Mode 1: All Categories (No slug)

**URL:** `/categories`

- Show all root categories
- Hierarchical display
- Category cards with image
- Product count per category

#### Mode 2: Category Products (With slug)

**URL:** `/categories/[slug]`

- Show products in category
- Include child categories
- Breadcrumb navigation
- Same filters as products page
- Search within category

**Search:**

- Search products in category
- Search child categories
- Combined results

---

## 🔎 Session 7: Search & SEO

### 7.1 Global Live Search

**Location:** `src/components/layout/GlobalSearch.tsx`

**Features:**

- Search across all content types
- Real-time results (debounced)
- Categorized results
- Keyboard navigation
- Recent searches

**Search Targets:**

1. **Products**

   - Name, description, SKU, tags
   - Show: image, name, price, rating

2. **Categories**

   - Name, description
   - Show: icon, name, product count

3. **Sellers/Stores**

   - Store name, description
   - Show: logo, name, rating

4. **Pages** (if sitemap exists)
   - Page titles, meta descriptions
   - Show: title, description, URL

**UI:**

```
┌─────────────────────────────────────┐
│ 🔍 Search...                       │
├─────────────────────────────────────┤
│ Products (12)                       │
│  • Product 1                        │
│  • Product 2                        │
│ [View all products]                 │
├─────────────────────────────────────┤
│ Categories (3)                      │
│  • Category 1                       │
│  • Category 2                       │
├─────────────────────────────────────┤
│ Stores (5)                          │
│  • Store 1                          │
│  • Store 2                          │
└─────────────────────────────────────┘
```

---

### 7.2 Search Results Page

**Location:** `src/app/search/page.tsx`

**Features:**

- Tabs: All, Products, Categories, Stores, Pages
- Filters applicable to each type
- Pagination
- Sort options
- Search suggestions

---

### 7.3 Sitemap Generation

**Location:** `src/app/sitemap.ts`

**Features:**

- Generate on deployment
- Include all pages
- Dynamic routes (products, categories, stores)
- Priority & frequency
- Last modified dates

**URLs to Include:**

- Static pages
- Product pages
- Category pages
- Store pages
- Blog posts (if any)

**Implementation:**

```typescript
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL;

  // Static pages
  const staticPages = [
    { url: baseUrl, priority: 1.0, changeFrequency: "daily" },
    { url: `${baseUrl}/products`, priority: 0.9, changeFrequency: "daily" },
    { url: `${baseUrl}/categories`, priority: 0.8, changeFrequency: "weekly" },
    // ... more static pages
  ];

  // Dynamic pages (fetch from DB)
  const products = await getProductsForSitemap();
  const categories = await getCategoriesForSitemap();
  const stores = await getStoresForSitemap();

  // Combine all URLs
  return [...staticPages, ...products, ...categories, ...stores];
}
```

---

### 7.4 Fix Broken Links

**Tasks:**

1. Audit all internal links
2. Check external links
3. Verify navigation menu
4. Test breadcrumbs
5. Validate redirects
6. Update documentation

**Tools:**

- Broken Link Checker
- Manual testing
- Chrome DevTools Network tab

---

## 🔧 Session 8: Polish & Testing

### 8.1 Code Optimization

- Remove unused imports
- Optimize images
- Lazy load components
- Code splitting
- Minimize bundle size
- Remove console logs

### 8.2 Reusable Components

**Create/Refactor:**

- `PriceDisplay.tsx` - With currency support
- `ProductCard.tsx` - Consistent across pages
- `FilterPanel.tsx` - Reusable filters
- `SortDropdown.tsx` - Consistent sorting
- `EmptyState.tsx` - No results states
- `LoadingState.tsx` - Loading indicators
- `ErrorState.tsx` - Error handling

### 8.3 Testing Checklist

- [ ] User Registration/Login
- [ ] Add to Cart
- [ ] Cart operations (update, remove, wishlist)
- [ ] Checkout flow
- [ ] Payment (test mode)
- [ ] Order creation
- [ ] Order tracking
- [ ] Product search
- [ ] Filters & sorting
- [ ] Wishlist
- [ ] Reviews
- [ ] Currency conversion
- [ ] Mobile responsiveness
- [ ] Cross-browser testing

### 8.4 Performance Optimization

- Lighthouse audit
- Core Web Vitals
- Image optimization
- Caching strategy
- CDN setup
- Database indexing

### 8.5 Security

- Input validation
- XSS protection
- CSRF tokens
- SQL injection prevention
- Rate limiting
- Environment variables

---

## 📚 Database Collections

### Required Collections:

1. **users**
2. **products**
3. **categories**
4. **orders**
5. **orderItems**
6. **addresses** ✨ NEW
7. **cart** ✨ NEW
8. **wishlist** ✨ NEW
9. **reviews** ✨ NEW
10. **sellers/stores**
11. **coupons**
12. **sales**
13. **notifications**
14. **payments** ✨ NEW
15. **shipments** ✨ NEW
16. **exchangeRates** ✨ NEW

---

## 🔌 API Routes Required

### Cart & Wishlist

- `POST /api/cart/add`
- `PUT /api/cart/update`
- `DELETE /api/cart/remove`
- `GET /api/cart`
- `POST /api/wishlist/add`
- `DELETE /api/wishlist/remove`
- `GET /api/wishlist`

### Checkout & Orders

- `POST /api/checkout/validate`
- `POST /api/orders/create`
- `GET /api/orders/:id`
- `GET /api/orders` (user orders)
- `POST /api/orders/:id/cancel`
- `POST /api/orders/:id/review`

### Addresses

- `GET /api/addresses`
- `POST /api/addresses`
- `PUT /api/addresses/:id`
- `DELETE /api/addresses/:id`

### Payments

- `POST /api/payment/razorpay/create`
- `POST /api/payment/razorpay/verify`
- `POST /api/payment/paypal/create`
- `POST /api/payment/paypal/capture`
- `POST /api/payment/webhook` (both)

### Seller Operations

- `POST /api/seller/orders/:id/accept`
- `POST /api/seller/orders/:id/reject`
- `POST /api/seller/shipments/create`
- `GET /api/seller/shipments/:id/track`

### Reviews

- `POST /api/reviews`
- `GET /api/reviews/product/:id`
- `GET /api/reviews/seller/:id`
- `POST /api/reviews/:id/helpful`

### Products & Search

- `GET /api/products` (with filters)
- `GET /api/products/:slug`
- `GET /api/search` (global)
- `GET /api/stores`
- `GET /api/stores/:id`
- `GET /api/categories`
- `GET /api/categories/:slug/products`

### Currency

- `GET /api/currency/rates`
- `POST /api/currency/convert`

---

## 🎨 UI/UX Considerations

### Design Principles

- Consistent color scheme
- Clear call-to-actions
- Loading states for all async operations
- Error handling with user-friendly messages
- Responsive design (mobile-first)
- Accessibility (WCAG 2.1 AA)

### Animations

- Smooth transitions
- Skeleton loaders
- Micro-interactions
- Toast notifications

### Mobile Experience

- Touch-friendly buttons (min 44px)
- Swipe gestures
- Bottom navigation
- Floating action buttons
- Optimized images

---

## 🔐 Authentication & Authorization

### Auth Rules

- Cart: Can work without auth (localStorage)
- Wishlist: Requires auth
- Checkout: Requires auth
- Orders: Requires auth
- Reviews: Requires auth + verified purchase
- Seller actions: Requires seller role

### Session Management

- JWT tokens in httpOnly cookies
- Refresh token mechanism
- Remember me option
- Session timeout
- Multi-device support

---

## 📧 Notifications

### Email Notifications

- Order confirmation
- Payment success/failure
- Order shipped
- Order delivered
- Review reminder
- Promotional (opt-in)

### In-App Notifications

- Real-time updates using Socket.IO
- Bell icon with badge
- Notification center
- Mark as read

### Push Notifications (Future)

- Browser push notifications
- Mobile app notifications

---

## 🌐 Internationalization (Future)

### Multi-language Support

- English (default)
- Hindi
- Other regional languages

### Localization

- Date formats
- Number formats
- Currency formats
- Address formats

---

## 📊 Analytics & Tracking

### Events to Track

- Page views
- Product views
- Add to cart
- Checkout initiated
- Order completed
- Search queries
- Filters used
- Cart abandonment

### Tools

- Google Analytics
- Facebook Pixel
- Custom analytics dashboard

---

## 🚀 Deployment Checklist

### Pre-Deployment

- [ ] All features tested
- [ ] Environment variables set
- [ ] Database indexes created
- [ ] Payment gateways in production mode
- [ ] SSL certificate installed
- [ ] Domain configured
- [ ] CDN setup
- [ ] Backup strategy

### Post-Deployment

- [ ] Smoke tests
- [ ] Monitor error logs
- [ ] Check payment webhooks
- [ ] Verify email sending
- [ ] Test order flow
- [ ] Monitor performance
- [ ] User feedback collection

---

## 📝 Notes

### Technical Decisions

1. **Currency Conversion:** Use server-side caching for exchange rates
2. **Cart Persistence:** Use both Firebase and localStorage for reliability
3. **Search:** Implement Algolia or Elasticsearch for better search experience (future)
4. **Images:** Use Next.js Image component with optimization
5. **Payments:** Start with Razorpay, add PayPal later if needed

### Future Enhancements

- AI-powered product recommendations
- Live chat support
- Social login (Google, Facebook)
- Wallet/Store credit system
- Gift cards
- Subscription products
- Auction system enhancement
- Affiliate program
- Seller analytics dashboard
- Mobile app (React Native)

---

## 🎯 Success Metrics

### Key Performance Indicators (KPIs)

- Conversion rate
- Average order value
- Cart abandonment rate
- Customer retention rate
- Product views to purchases
- Search effectiveness
- Page load time
- Mobile vs desktop traffic
- Payment success rate

---

## 🆘 Support & Resources

### Documentation

- Next.js 16 docs
- Firebase docs
- Razorpay API docs
- PayPal API docs
- Shiprocket API docs
- Tailwind CSS docs

### External Services

- **Exchange Rates:** exchangerate-api.com
- **Payment:** Razorpay, PayPal
- **Shipping:** Shiprocket
- **Email:** SendGrid / AWS SES
- **CDN:** Vercel, Cloudflare
- **Monitoring:** Sentry

---

## 📅 Estimated Timeline

**Total Time:** 40-60 hours across 8 sessions

- Session 1: 6-8 hours
- Session 2: 8-10 hours
- Session 3: 6-8 hours
- Session 4: 5-6 hours
- Session 5: 5-6 hours
- Session 6: 4-5 hours
- Session 7: 4-5 hours
- Session 8: 6-8 hours

---

## ✅ Current Status

**Last Updated:** November 1, 2025

### Completed (November 1, 2025 Session)

**Phase 1-3: Core Shopping Experience ✅**

- ✅ Currency system with multi-currency support (INR, USD, EUR, GBP)
- ✅ Cart context with localStorage persistence
- ✅ Wishlist context with localStorage persistence
- ✅ FloatingCart component site-wide
- ✅ CartDrawer slide-in panel
- ✅ Cart page (/cart) with full management
- ✅ Wishlist page (/wishlist) with grid layout
- ✅ WishlistButton reusable component
- ✅ Address management (CRUD operations)
- ✅ Address API routes with Firebase auth
- ✅ useAddresses custom hook
- ✅ AddressForm modal component
- ✅ AddressCard display component
- ✅ Addresses management page (/profile/addresses)
- ✅ Checkout page (/checkout) with address selection

**Previously Completed:**

- ✅ Admin panel
- ✅ Seller dashboard
- ✅ Product management
- ✅ Category management
- ✅ Order management (basic)
- ✅ Coupon system
- ✅ Sales system
- ✅ User authentication

### In Progress

- 🔄 Payment gateway integration (Razorpay + PayPal)
- 🔄 Order creation workflow

### Pending

- ⏳ Order status workflow
- ⏳ Seller order acceptance
- ⏳ Shipment creation (Shiprocket)
- ⏳ Order tracking
- ⏳ Review system
- ⏳ Products page with filters
- ⏳ Product detail pages
- ⏳ Stores & Categories pages
- ⏳ Global search
- ⏳ SEO & Sitemap

---

## 🎯 Next Steps

1. ✅ ~~Review this document~~ - DONE
2. ✅ ~~Set up development environment~~ - DONE
3. ✅ ~~Begin Session 1: Core Shopping Experience~~ - COMPLETE
4. **Next: Implement payment gateways (Razorpay + PayPal)**
5. **Next: Create order workflow**
6. Test checkout flow end-to-end
7. Implement product listing with filters
8. Deploy to staging after payment integration

---

**Remember:** This is an ambitious goal. Focus on getting core features working first, then polish. MVP (Minimum Viable Product) approach is recommended.

Good luck! 🚀
