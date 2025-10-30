# Seller Panel Implementation Progress

## ✅ Completed (Phase 1 & 2)

### Phase 1: Foundation

#### 1. \*\*Type Defi#### `/seller/sales` - Sales Management Page ✅

**Features:**

- ✅ List all sales with status badges
- ✅ Apply to: All products | Specific products | Specific categories
- ✅ Stats dashboard (total, active, orders, revenue)
- ✅ Search and filter functionality
- ✅ Action menu (edit, toggle, delete)
- ✅ **API Integration: Fetch, toggle, delete sales**
- ✅ Delete confirmation dialog
- ✅ Success/error notifications with Snackbar (`src/types/index.ts`)

- ✅ Enhanced `SellerShop` interface with complete shop configuration
- ✅ `PickupAddress` interface for multiple warehouse locations
- ✅ Enhanced `SellerProduct` with SEO-centered design, "buy-" prefix support
- ✅ `ProductMediaImage` and `ProductMediaVideo` with Firebase storage paths
- ✅ `SellerCoupon` - WooCommerce-style complex coupon system
- ✅ `SellerSale` - Flat discount system with free shipping
- ✅ `SellerOrder` - Complete order management with transaction snapshots
- ✅ `SellerOrderItem` - Order items with product snapshots
- ✅ `SellerShipment` - Shipment tracking with Shiprocket integration
- ✅ `ShipmentTrackingEvent` - Tracking history
- ✅ `SellerAlert` - Alert/notification system

#### 2. **Routes** (`src/constants/routes.ts`)

- ✅ Complete seller route structure
- ✅ Dashboard, Shop Setup, Products, Orders, Coupons, Sales, Shipments, Alerts
- ✅ Route groups and helper functions updated

#### 3. **Layout Components**

- ✅ `SellerSidebar.tsx` - Complete seller sidebar with navigation
  - Dashboard, Shop Setup, Products, Orders, Coupons, Sales, Shipments, Alerts, Analytics, Settings
  - Collapsible sidebar with badge support for alerts
  - Clean, Material-UI based design
- ✅ `ModernLayout.tsx` updated to support seller routes
  - Seller sidebar integration
  - Navigation menu updated with seller panel access

#### 4. **Pages Created**

- ✅ `/seller/dashboard` - Seller dashboard with quick setup guide and stats
- ✅ `/seller/shop` - Complete shop setup page with 5 tabs:
  1. Basic Info (store name, description, images)
  2. Pickup Addresses (multiple addresses with default selection)
  3. Business Details (GST, PAN, business type)
  4. SEO (title, description, keywords)
  5. Settings (COD, free shipping threshold, processing time, policies)

### Phase 2: Coupons & Sales System ✅ COMPLETE

#### **Authentication & API Infrastructure** ✅

**API Utility Functions** (`src/lib/api/seller.ts`)

- ✅ `fetchWithAuth` - Authenticated API calls with Firebase token
- ✅ `uploadWithAuth` - Authenticated file upload with FormData support
- ✅ `apiGet` - Helper for GET requests
- ✅ `apiPost` - Helper for POST requests
- ✅ `apiPut` - Helper for PUT requests
- ✅ `apiDelete` - Helper for DELETE requests

**Core API Routes:**

- ✅ `GET /api/user/profile` - Get user profile
- ✅ `PUT /api/user/profile` - Update user profile (name, phone, avatar, addresses)
- ✅ `POST /api/storage/upload` - Authenticated file upload to Firebase Storage

**Coupons API Routes** (`src/app/api/seller/coupons/`)

- ✅ `GET /api/seller/coupons` - List all coupons with filtering
- ✅ `POST /api/seller/coupons` - Create new coupon
- ✅ `GET /api/seller/coupons/[id]` - Get specific coupon
- ✅ `PUT /api/seller/coupons/[id]` - Update coupon
- ✅ `DELETE /api/seller/coupons/[id]` - Delete coupon
- ✅ `POST /api/seller/coupons/[id]/toggle` - Toggle coupon status

#### `/seller/coupons` - Coupon Management Page ✅

**Features:**

- ✅ List all coupons with status badges (active, inactive, expired, scheduled)
- ✅ Search and filter by status
- ✅ Quick actions: Enable/Disable, Duplicate, Delete
- ✅ Stats: Total coupons, active coupons, total usage
- ✅ **API Integration: Fetch, toggle, delete coupons**
- ✅ Success/error notifications with Snackbar

#### `/seller/coupons/new` - Coupon Form ✅

**Multi-tab form:**

1. **Basic Info** ✅
   - Code (auto-generate option)
   - Name & Description
   - Type: percentage | fixed | free_shipping | bogo | cart_discount
   - Value & Max discount amount
2. **Usage Restrictions** ✅
   - Minimum order amount
   - Maximum uses (total & per user)
   - Date range (start/end) or permanent
3. **Product/Category Selection** ✅
   - Applicable products (multi-select)
   - Applicable categories (multi-select)
   - Excluded products
   - Excluded categories
4. **Advanced Restrictions** ✅
   - First-time customers only
   - New/existing customers
   - Min/max quantity
   - Allowed payment methods (COD/Prepaid)
   - Allowed/excluded user emails
5. **Stacking & Priority** ✅
   - Can be combined with other coupons
   - Priority order (higher = applied first)

**API Integration:**

- ✅ Create coupon with full validation
- ✅ Loading states during save
- ✅ Success/error notifications
- ✅ Automatic redirect after creation

#### `/seller/sales` - Sales Management Page ✅

**Features:**

- ✅ List all sales with status badges
- ✅ Apply to: All products | Specific products | Specific categories
- ✅ Stats dashboard (total, active, orders, revenue)
- ✅ Search and filter functionality
- ✅ Action menu (edit, toggle, delete)

#### `/seller/sales/new` - Sale Form ✅

**Form fields:**

- ✅ Name & Description
- ✅ Discount type (percentage | fixed)
- ✅ Discount value with input adornment
- ✅ Apply to (all/specific products/categories) with radio selection
- ✅ Product/category multi-selector with Autocomplete
- ✅ Enable free shipping toggle
- ✅ Date range or permanent option
- ✅ Status selection
- ✅ Live preview of sale configuration

**Note:** Sale creation API integration pending

### Phase 3: Products System 🚧 IN PROGRESS

#### `/seller/products` - Products List ✅

**Features:**

- ✅ Data table with sorting/filtering
- ✅ Columns: Image, Name, SKU, Price, Stock, Status, Category
- ✅ Quick actions: Edit, Delete, Duplicate, Archive
- ✅ Stats: Total products, active, out of stock, low stock
- ✅ **API Integration: Fetch, delete products**
- ✅ Delete confirmation dialog
- ✅ Success/error notifications

**Products API Routes** (`src/app/api/seller/products/`)

- ✅ `GET /api/seller/products` - List all products with filtering
- ✅ `POST /api/seller/products` - Create new product
- ✅ `GET /api/seller/products/[id]` - Get specific product
- ✅ `PUT /api/seller/products/[id]` - Update product
- ✅ `DELETE /api/seller/products/[id]` - Delete product

**Firebase Infrastructure:**

- ✅ Firestore indexes for `seller_products` collection
- ✅ Firestore security rules for seller access
- ✅ Storage rules for `/sellers/{sellerId}/products/` paths
- ✅ Storage rules for `/sellers/{sellerId}/shop/` assets

#### `/seller/products/new` - Add Product (Multi-step Form)

**Step 1: Product Details**

- Product name (auto-generate SEO slug with "buy-" prefix)
- Short description
- Full description (rich text editor)
- Category selection (only leaf categories allowed)
- Tags (multi-select/create)

**Step 2: Pricing & Inventory**

- Regular price
- Compare at price (strikethrough)
- Cost (for profit calculation)
- SKU (auto-generate option)
- Stock quantity
- Low stock threshold
- Track inventory toggle
- Pickup address selection (from shop addresses)
- Default address auto-selected

**Step 3: Media Upload**

- Image uploader with preview (img1-img5)
- Camera support for mobile
- WhatsApp-style image editor (800x800 frame)
- Video uploader (v1, v2)
- Drag-and-drop reordering
- Firebase storage: `seller/products/{slug}/`
- Alt text for each image

**Step 4: Item Condition & Features**

- Condition: New | Used-Mint | Used-Good | Used-Fair | Damaged
- Returnable toggle
- Return period (days) if returnable
- Free shipping toggle
- Shipping method: Seller | Shiprocket | Pickup
- Product features (bullet points)
- Specifications (key-value pairs)
- Weight & dimensions

**Step 5: SEO**

- SEO title (auto-generated, editable)
- SEO description (auto-generated, editable)
- SEO keywords
- Slug with "buy-" prefix (auto-generated)
- Preview snippet
- Start date (default: now)
- Expiration date (optional, permanent if empty)

**Right Side Preview:**

- Live preview of product card
- Shows how it will look on the site
- Updates as form is filled

#### `/seller/products/[id]/edit` - Edit Product

- Same form as add product
- Pre-filled with existing data
- Additional option to archive/delete

### Phase 4: Orders System

#### `/seller/orders` - Orders List

**Features:**

- Tabbed view: All | Pending Approval | Processing | Shipped | Delivered | Cancelled
- Auto-approve in 3 days for pending orders
- Search by order number, customer name, email
- Filter by status, date range, payment method
- Columns: Order #, Customer, Items, Total, Status, Payment, Date
- Quick actions: Approve, Reject, View Details, Print Invoice

**Order Status Flow:**

1. Pending → Auto-approve in 3 days or manual approve/reject
2. Approved → Processing
3. Processing → Ready to ship (generate shipping label)
4. Shipped → In transit
5. Delivered → Complete

#### `/seller/orders/[id]` - Order Detail

**Sections:**

1. **Order Summary**

   - Order number, date, status
   - Customer info (name, email, phone)
   - Shipping & billing addresses
   - Payment status & method

2. **Order Items**

   - Product snapshot (immutable copy from transactionSnapshot)
   - Name, image, SKU, price, quantity, total
   - Cannot delete products from here (snapshot preserved)

3. **Pricing Breakdown**

   - Subtotal
   - Coupon discount (if applied, show coupon code & details)
   - Sale discount (if applied, show sale name & details)
   - Shipping charges
   - Tax
   - Total

4. **Timeline**

   - Order placed
   - Payment received/pending
   - Approved/Rejected (with reason if rejected)
   - Processing started
   - Shipped (with tracking)
   - Delivered

5. **Actions**
   - Approve order (if pending)
   - Reject order (with reason)
   - Generate invoice (PDF)
   - Initiate shipment (moves to shipments page)
   - Cancel order
   - Add seller notes
   - Add internal notes

### Phase 5: Shipments System

#### `/seller/shipments` - Shipments List

**Features:**

- Tabbed view: Pending | Pickup Scheduled | In Transit | Delivered | Failed
- Integration with Shiprocket API
- Search by tracking number, order number
- Filter by status, carrier
- Columns: Order #, Tracking #, Carrier, From, To, Status, Date

#### `/seller/shipments/[id]` - Shipment Detail

**Features:**

1. **Shipment Info**

   - Shiprocket order ID & shipment ID
   - Tracking number (clickable link)
   - Carrier & service
   - Package dimensions & weight

2. **Addresses**

   - From: Pickup address
   - To: Customer shipping address

3. **Tracking History**

   - Timeline of tracking events
   - Status, location, description, timestamp
   - Real-time updates from carrier

4. **Documents**

   - Shipping label (print/download)
   - Invoice (auto-generated)
   - Manifest (for bulk shipments)

5. **Actions**
   - Track shipment (refresh status)
   - Print shipping label
   - Print invoice
   - Cancel shipment (if not yet picked up)
   - Request pickup (if Shiprocket)

### Phase 6: Alerts & Analytics

#### `/seller/alerts` - Notifications Center

**Features:**

- List of all alerts/notifications
- Filter by type: New Order | Pending Approval | Pending Shipment | Low Stock | Delivered | Return Request | Review | System
- Mark as read/unread
- Bulk actions
- Alert cards with:
  - Icon based on type
  - Title & message
  - Timestamp
  - Action button (View Order, View Product, etc.)
  - Severity badge (info, warning, error, success)

**Alert Types:**

1. **New Order** - When a new order is placed
2. **Pending Approval** - Orders awaiting approval (2 days reminder)
3. **Pending Shipment** - Orders ready to ship
4. **Low Stock** - Products below threshold
5. **Order Delivered** - Successful delivery
6. **Return Request** - Customer initiated return
7. **Review** - New product review
8. **System** - Important system notifications

#### `/seller/analytics` - Analytics Dashboard

**Metrics:**

1. **Overview Cards**

   - Total revenue (all time, this month, today)
   - Total orders (all time, this month, today)
   - Average order value
   - Conversion rate

2. **Charts**

   - Revenue over time (line chart)
   - Orders by status (pie chart)
   - Top selling products (bar chart)
   - Sales by category (donut chart)

3. **Tables**

   - Top selling products
   - Recent orders
   - Best customers
   - Low stock alerts

4. **Export**
   - Export data to CSV/Excel
   - Date range selector
   - Custom reports

## 🔧 API Endpoints to Create

### Shop Management

- `POST /api/seller/shop` - Create/update shop
- `GET /api/seller/shop` - Get shop details
- `POST /api/seller/shop/addresses` - Add pickup address
- `PUT /api/seller/shop/addresses/:id` - Update pickup address
- `DELETE /api/seller/shop/addresses/:id` - Delete pickup address

### Products

- `GET /api/seller/products` - List products
- `POST /api/seller/products` - Create product
- `GET /api/seller/products/:id` - Get product
- `PUT /api/seller/products/:id` - Update product
- `DELETE /api/seller/products/:id` - Delete product
- `POST /api/seller/products/:id/media` - Upload media
- `GET /api/seller/products/categories/leaf` - Get leaf categories only

### Coupons

- `GET /api/seller/coupons` - List coupons
- `POST /api/seller/coupons` - Create coupon
- `GET /api/seller/coupons/:id` - Get coupon
- `PUT /api/seller/coupons/:id` - Update coupon
- `DELETE /api/seller/coupons/:id` - Delete coupon
- `POST /api/seller/coupons/:id/toggle` - Enable/disable coupon

### Sales

- `GET /api/seller/sales` - List sales
- `POST /api/seller/sales` - Create sale
- `GET /api/seller/sales/:id` - Get sale
- `PUT /api/seller/sales/:id` - Update sale
- `DELETE /api/seller/sales/:id` - Delete sale
- `POST /api/seller/sales/:id/toggle` - Enable/disable sale

### Orders

- `GET /api/seller/orders` - List orders
- `GET /api/seller/orders/:id` - Get order details
- `POST /api/seller/orders/:id/approve` - Approve order
- `POST /api/seller/orders/:id/reject` - Reject order
- `POST /api/seller/orders/:id/cancel` - Cancel order
- `POST /api/seller/orders/:id/invoice` - Generate invoice PDF
- `POST /api/seller/orders/:id/initiate-shipment` - Start shipment

### Shipments

- `GET /api/seller/shipments` - List shipments
- `GET /api/seller/shipments/:id` - Get shipment details
- `POST /api/seller/shipments/:id/track` - Update tracking
- `POST /api/seller/shipments/:id/cancel` - Cancel shipment
- `GET /api/seller/shipments/:id/label` - Get shipping label
- `POST /api/seller/shipments/bulk-manifest` - Generate bulk manifest

### Alerts

- `GET /api/seller/alerts` - List alerts
- `PUT /api/seller/alerts/:id/read` - Mark as read
- `POST /api/seller/alerts/bulk-read` - Mark multiple as read
- `DELETE /api/seller/alerts/:id` - Delete alert

### Analytics

- `GET /api/seller/analytics/overview` - Overview stats
- `GET /api/seller/analytics/revenue` - Revenue data
- `GET /api/seller/analytics/orders` - Order statistics
- `GET /api/seller/analytics/products` - Product performance
- `GET /api/seller/analytics/customers` - Customer insights
- `POST /api/seller/analytics/export` - Export data

## 📦 Firebase Storage Structure

```
sellers/
  {sellerId}/
    shop/
      logo.jpg
      cover.jpg
    products/
      buy-{product-slug}/
        img1.jpg
        img2.jpg
        img3.jpg
        img4.jpg
        img5.jpg
        img1-whatsapp-edit.jpg  # WhatsApp edited versions
        img2-whatsapp-edit.jpg
        v1.mp4
        v2.mp4
        v1-thumbnail.jpg
        v2-thumbnail.jpg
```

## 🗄️ Firebase Firestore Collections

```
sellers/
  {sellerId}/
    - shop data
    - stats

seller_products/
  {productId}/
    - product data
    - media array
    - SEO data

seller_coupons/
  {couponId}/
    - coupon data
    - usage tracking

seller_sales/
  {saleId}/
    - sale data
    - stats

seller_orders/
  {orderId}/
    - order data
    - items array
    - transactionSnapshot (immutable)

seller_shipments/
  {shipmentId}/
    - shipment data
    - tracking history

seller_alerts/
  {alertId}/
    - alert data
```

## 🎯 Key Features Highlights

1. **Admin = Seller**: Admins automatically have seller access
2. **SEO-Centered**: All products get "buy-" prefix for SEO
3. **Transaction Snapshots**: Orders preserve product data even if products are deleted
4. **WhatsApp Editor**: 800x800 frame editor for product images
5. **Auto-Approval**: Orders auto-approve in 3 days if not manually processed
6. **Leaf Categories Only**: Products can only be assigned to leaf (end) categories
7. **Multiple Pickup Addresses**: Sellers can have multiple warehouses
8. **Complex Coupons**: WooCommerce-style coupon system with stacking
9. **Shiprocket Integration**: Full shipping label and tracking support
10. **Real-time Alerts**: Notification system for all seller actions

## 🚀 Next Steps

To continue implementation:

1. **Phase 2**: Implement coupons and sales CRUD system
2. **Phase 3**: Build multi-step product creation form with media upload
3. **Phase 4**: Implement orders management with approval workflow
4. **Phase 5**: Create shipments tracking with Shiprocket integration
5. **Phase 6**: Build alerts system and analytics dashboard

Each phase should be implemented with:

- API routes with Firebase Admin SDK
- Form validation using Zod
- Real-time updates where applicable
- Mobile-responsive design
- Loading states and error handling
- Toast notifications for user feedback
