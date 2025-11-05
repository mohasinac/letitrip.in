# 🎯 User Journey & Use Case Diagrams

**Last Updated:** November 4, 2025  
**Purpose:** Visual representation of user flows and use cases

---

## 👥 User Personas

### 1. Guest User (Visitor)

- Can browse products
- Can search and filter
- Can view product details
- Cannot checkout or save items

### 2. Registered Customer

- All guest features +
- Can place orders
- Can save to wishlist
- Can write reviews
- Can manage profile

### 3. Seller

- All customer features +
- Can add/edit products
- Can manage orders
- Can view analytics
- Can manage store

### 4. Admin

- All features +
- Can manage all users
- Can approve products
- Can manage categories
- Full system access

---

## 🛒 Customer Journey Map

### Journey 1: First-Time Purchase

```mermaid
journey
    title First-Time Customer Purchase Journey
    section Discovery
      Visit website: 5: Guest
      Browse products: 4: Guest
      Search for item: 4: Guest
    section Evaluation
      View product details: 5: Guest
      Read reviews: 4: Guest
      Compare prices: 3: Guest
    section Decision
      Add to cart: 5: Guest
      Sign up required: 2: Guest
      Create account: 3: Customer
    section Purchase
      Select address: 4: Customer
      Choose payment: 4: Customer
      Complete payment: 5: Customer
    section Post-Purchase
      Receive confirmation: 5: Customer
      Track order: 5: Customer
      Receive product: 5: Customer
      Write review: 4: Customer
```

---

### Journey 2: Returning Customer

```mermaid
journey
    title Returning Customer Journey
    section Login
      Visit website: 5: Customer
      Auto-login: 5: Customer
    section Browse
      View recommendations: 5: Customer
      Check wishlist: 4: Customer
      Search products: 5: Customer
    section Quick Purchase
      Add to cart: 5: Customer
      Use saved address: 5: Customer
      One-click checkout: 5: Customer
    section Track
      View order status: 5: Customer
      Download invoice: 4: Customer
```

---

### Journey 3: Seller Onboarding

```mermaid
journey
    title Seller Onboarding Journey
    section Registration
      Sign up as seller: 3: Guest
      Verify documents: 2: Seller
      Wait for approval: 2: Seller
      Get approved: 5: Seller
    section Setup
      Create store profile: 4: Seller
      Add first product: 4: Seller
      Upload images: 3: Seller
      Set pricing: 4: Seller
    section Operations
      Receive first order: 5: Seller
      Process order: 4: Seller
      Update inventory: 4: Seller
      View analytics: 5: Seller
```

---

## 🎬 Use Case Diagrams

### Customer Use Cases

```mermaid
graph LR
    CUSTOMER((Customer))

    CUSTOMER --> BROWSE[Browse Products]
    CUSTOMER --> SEARCH[Search Products]
    CUSTOMER --> VIEW[View Details]
    CUSTOMER --> CART[Manage Cart]
    CUSTOMER --> WISHLIST[Manage Wishlist]
    CUSTOMER --> CHECKOUT[Checkout]
    CUSTOMER --> ORDERS[View Orders]
    CUSTOMER --> REVIEWS[Write Reviews]
    CUSTOMER --> PROFILE[Manage Profile]

    BROWSE --> FILTER[Apply Filters]
    BROWSE --> SORT[Sort Results]

    VIEW --> IMAGES[View Gallery]
    VIEW --> VARIANTS[Check Variants]
    VIEW --> RELATED[See Related]

    CART --> ADD[Add Items]
    CART --> UPDATE[Update Quantity]
    CART --> REMOVE[Remove Items]

    CHECKOUT --> ADDRESS[Select Address]
    CHECKOUT --> PAYMENT[Choose Payment]
    CHECKOUT --> COUPON[Apply Coupon]

    ORDERS --> TRACK[Track Order]
    ORDERS --> CANCEL[Cancel Order]
    ORDERS --> INVOICE[Download Invoice]
```

---

### Seller Use Cases

```mermaid
graph LR
    SELLER((Seller))

    SELLER --> PRODUCTS[Manage Products]
    SELLER --> ORDERS_M[Manage Orders]
    SELLER --> INVENTORY[Manage Inventory]
    SELLER --> ANALYTICS[View Analytics]
    SELLER --> STORE[Manage Store]
    SELLER --> COUPONS[Manage Coupons]

    PRODUCTS --> ADD_P[Add Product]
    PRODUCTS --> EDIT_P[Edit Product]
    PRODUCTS --> DELETE_P[Delete Product]
    PRODUCTS --> IMAGES_P[Upload Images]

    ORDERS_M --> VIEW_O[View Orders]
    ORDERS_M --> UPDATE_O[Update Status]
    ORDERS_M --> SHIP_O[Mark Shipped]
    ORDERS_M --> CANCEL_O[Cancel Order]

    INVENTORY --> UPDATE_I[Update Stock]
    INVENTORY --> BULK_I[Bulk Update]
    INVENTORY --> ALERTS_I[Stock Alerts]

    ANALYTICS --> SALES_A[Sales Reports]
    ANALYTICS --> PRODUCTS_A[Product Stats]
    ANALYTICS --> REVENUE_A[Revenue Charts]
```

---

### Admin Use Cases

```mermaid
graph LR
    ADMIN((Admin))

    ADMIN --> USERS_A[Manage Users]
    ADMIN --> PRODUCTS_A[Manage Products]
    ADMIN --> ORDERS_A[Manage Orders]
    ADMIN --> CATEGORIES_A[Manage Categories]
    ADMIN --> SELLERS_A[Manage Sellers]
    ADMIN --> SYSTEM_A[System Settings]

    USERS_A --> VIEW_U[View Users]
    USERS_A --> ROLE_U[Change Roles]
    USERS_A --> BAN_U[Ban Users]
    USERS_A --> DELETE_U[Delete Users]

    PRODUCTS_A --> APPROVE_P[Approve Products]
    PRODUCTS_A --> REJECT_P[Reject Products]
    PRODUCTS_A --> FEATURE_P[Feature Products]
    PRODUCTS_A --> DELETE_PA[Delete Products]

    CATEGORIES_A --> ADD_C[Add Category]
    CATEGORIES_A --> EDIT_C[Edit Category]
    CATEGORIES_A --> DELETE_C[Delete Category]
    CATEGORIES_A --> REORDER_C[Reorder Tree]

    SELLERS_A --> APPROVE_S[Approve Sellers]
    SELLERS_A --> VERIFY_S[Verify Documents]
    SELLERS_A --> SUSPEND_S[Suspend Sellers]

    SYSTEM_A --> CONFIG[Configuration]
    SYSTEM_A --> EMAIL_S[Email Settings]
    SYSTEM_A --> PAYMENT_S[Payment Gateway]
```

---

## 🔄 Detailed User Flows

### Flow 1: Product Purchase Flow

```mermaid
flowchart TD
    START([User Starts]) --> HOME[Home Page]
    HOME --> BROWSE{How to find?}

    BROWSE -->|Search| SEARCH[Search Products]
    BROWSE -->|Browse| CATEGORY[Browse Categories]
    BROWSE -->|Featured| FEATURED[Featured Section]

    SEARCH --> RESULTS[Search Results]
    CATEGORY --> RESULTS
    FEATURED --> PRODUCT_DETAIL
    RESULTS --> PRODUCT_DETAIL[Product Detail Page]

    PRODUCT_DETAIL --> DECISION{Want to buy?}

    DECISION -->|Not sure| COMPARE[Compare Products]
    DECISION -->|Maybe later| WISHLIST_ADD[Add to Wishlist]
    DECISION -->|Yes| CHECK_STOCK{In Stock?}

    COMPARE --> PRODUCT_DETAIL
    WISHLIST_ADD --> CONTINUE[Continue Shopping]

    CHECK_STOCK -->|No| OUT_OF_STOCK[Show Out of Stock]
    CHECK_STOCK -->|Yes| ADD_CART[Add to Cart]

    OUT_OF_STOCK --> NOTIFY[Notify When Available]
    ADD_CART --> CART_PAGE[Cart Page]

    CART_PAGE --> MORE{Add more?}
    MORE -->|Yes| CONTINUE
    MORE -->|No| AUTH_CHECK{Logged in?}

    CONTINUE --> HOME

    AUTH_CHECK -->|No| LOGIN[Login/Sign Up]
    AUTH_CHECK -->|Yes| CHECKOUT[Checkout Page]

    LOGIN --> CHECKOUT

    CHECKOUT --> ADDRESS_SELECT{Has Address?}

    ADDRESS_SELECT -->|No| ADD_ADDRESS[Add Address]
    ADDRESS_SELECT -->|Yes| SELECT_ADDRESS[Select Address]

    ADD_ADDRESS --> SELECT_ADDRESS
    SELECT_ADDRESS --> COUPON{Apply Coupon?}

    COUPON -->|Yes| VALIDATE_COUPON[Validate Coupon]
    COUPON -->|No| PAYMENT_METHOD

    VALIDATE_COUPON --> PAYMENT_METHOD[Select Payment]

    PAYMENT_METHOD --> PAYMENT_TYPE{Payment Type?}

    PAYMENT_TYPE -->|Online| GATEWAY[Payment Gateway]
    PAYMENT_TYPE -->|COD| PLACE_ORDER[Place Order]

    GATEWAY --> PAYMENT_SUCCESS{Success?}

    PAYMENT_SUCCESS -->|Yes| PLACE_ORDER
    PAYMENT_SUCCESS -->|No| PAYMENT_FAILED[Payment Failed]

    PAYMENT_FAILED --> RETRY{Retry?}
    RETRY -->|Yes| PAYMENT_METHOD
    RETRY -->|No| CART_PAGE

    PLACE_ORDER --> ORDER_CONFIRM[Order Confirmation]
    ORDER_CONFIRM --> EMAIL[Send Email]
    ORDER_CONFIRM --> END([Journey Complete])
```

---

### Flow 2: Seller Product Upload Flow

```mermaid
flowchart TD
    START([Seller Starts]) --> LOGIN_S[Login to Seller Panel]
    LOGIN_S --> DASHBOARD[Seller Dashboard]

    DASHBOARD --> PRODUCTS_PAGE[My Products]
    PRODUCTS_PAGE --> ADD_NEW[Click Add Product]

    ADD_NEW --> FORM[Product Form]

    FORM --> BASIC[Enter Basic Info]
    BASIC --> CATEGORY_SELECT[Select Category]
    CATEGORY_SELECT --> IMAGES[Upload Images]

    IMAGES --> IMG_UPLOAD{Upload Success?}
    IMG_UPLOAD -->|No| IMG_ERROR[Show Error]
    IMG_UPLOAD -->|Yes| PRICING[Set Pricing]

    IMG_ERROR --> IMAGES

    PRICING --> INVENTORY_SET[Set Inventory]
    INVENTORY_SET --> SPECS[Add Specifications]
    SPECS --> DESC[Add Description]
    DESC --> FEATURES[Add Features]

    FEATURES --> PREVIEW[Preview Product]
    PREVIEW --> REVIEW_CHECK{Looks Good?}

    REVIEW_CHECK -->|No| FORM
    REVIEW_CHECK -->|Yes| SUBMIT[Submit Product]

    SUBMIT --> VALIDATION{Validation}

    VALIDATION -->|Failed| SHOW_ERRORS[Show Errors]
    VALIDATION -->|Passed| SAVE_DB[Save to Database]

    SHOW_ERRORS --> FORM

    SAVE_DB --> ADMIN_APPROVAL{Needs Approval?}

    ADMIN_APPROVAL -->|Yes| PENDING[Pending Approval]
    ADMIN_APPROVAL -->|No| PUBLISHED[Published]

    PENDING --> NOTIFY_SELLER[Notify Seller]
    PUBLISHED --> NOTIFY_SUCCESS[Success Message]

    NOTIFY_SUCCESS --> END([Product Live])
    NOTIFY_SELLER --> END2([Awaiting Approval])
```

---

### Flow 3: Admin Approval Flow

```mermaid
flowchart TD
    START([Admin Task]) --> LOGIN_A[Login to Admin Panel]
    LOGIN_A --> ADMIN_DASH[Admin Dashboard]

    ADMIN_DASH --> PENDING_ITEMS{Pending Items}

    PENDING_ITEMS -->|Products| PENDING_PRODUCTS[Pending Products]
    PENDING_ITEMS -->|Sellers| PENDING_SELLERS[Pending Sellers]
    PENDING_ITEMS -->|Orders| FLAGGED_ORDERS[Flagged Orders]

    PENDING_PRODUCTS --> VIEW_PRODUCT[View Product]
    VIEW_PRODUCT --> CHECK_QUALITY{Quality Check}

    CHECK_QUALITY -->|Issues| REQUEST_CHANGES[Request Changes]
    CHECK_QUALITY -->|Spam| REJECT_PRODUCT[Reject Product]
    CHECK_QUALITY -->|Good| APPROVE_PRODUCT[Approve Product]

    REQUEST_CHANGES --> NOTIFY_SELLER_CHANGES[Notify Seller]
    REJECT_PRODUCT --> NOTIFY_SELLER_REJECT[Notify Seller]
    APPROVE_PRODUCT --> PUBLISH[Publish Product]

    PUBLISH --> NOTIFY_SELLER_SUCCESS[Notify Seller]

    PENDING_SELLERS --> VIEW_SELLER[View Seller]
    VIEW_SELLER --> VERIFY_DOCS{Verify Documents}

    VERIFY_DOCS -->|Invalid| REJECT_SELLER[Reject Application]
    VERIFY_DOCS -->|Valid| APPROVE_SELLER[Approve Seller]

    APPROVE_SELLER --> GRANT_ACCESS[Grant Seller Access]
    GRANT_ACCESS --> NOTIFY_SELLER_APPROVED[Send Welcome Email]

    FLAGGED_ORDERS --> REVIEW_ORDER[Review Order]
    REVIEW_ORDER --> TAKE_ACTION{Action Needed?}

    TAKE_ACTION -->|Cancel| CANCEL_ORDER[Cancel Order]
    TAKE_ACTION -->|Refund| PROCESS_REFUND[Process Refund]
    TAKE_ACTION -->|Investigate| CONTACT_PARTIES[Contact Parties]
    TAKE_ACTION -->|Resolve| MARK_RESOLVED[Mark Resolved]

    NOTIFY_SELLER_SUCCESS --> END([Task Complete])
    NOTIFY_SELLER_APPROVED --> END
    MARK_RESOLVED --> END
```

---

## 📱 Mobile vs Desktop Flow Differences

### Mobile User Flow

```mermaid
flowchart LR
    MOBILE_USER[📱 Mobile User]

    MOBILE_USER --> HAMBURGER[☰ Hamburger Menu]
    HAMBURGER --> MENU[Side Drawer]

    MENU --> CATEGORIES_M[Categories]
    MENU --> PROFILE_M[Profile]
    MENU --> CART_M[Cart]
    MENU --> ORDERS_M[Orders]

    MOBILE_USER --> BOTTOM_NAV[Bottom Navigation]
    BOTTOM_NAV --> HOME_M[Home]
    BOTTOM_NAV --> SEARCH_M[Search]
    BOTTOM_NAV --> CART_MB[Cart]
    BOTTOM_NAV --> PROFILE_MB[Profile]
```

### Desktop User Flow

```mermaid
flowchart LR
    DESKTOP_USER[🖥️ Desktop User]

    DESKTOP_USER --> TOP_NAV[Top Navigation Bar]

    TOP_NAV --> HOME_D[Home]
    TOP_NAV --> PRODUCTS_D[Products]
    TOP_NAV --> CATEGORIES_D[Categories Dropdown]
    TOP_NAV --> SEARCH_D[Search Bar]
    TOP_NAV --> CART_D[Cart Icon]
    TOP_NAV --> USER_D[User Menu]

    USER_D --> PROFILE_D[Profile]
    USER_D --> ORDERS_D[Orders]
    USER_D --> WISHLIST_D[Wishlist]
    USER_D --> SETTINGS_D[Settings]
    USER_D --> LOGOUT_D[Logout]
```

---

## 🎯 Critical User Paths

### Path 1: Guest to Customer Conversion

```mermaid
stateDiagram-v2
    [*] --> GuestUser: Visit Site
    GuestUser --> BrowsingProducts: Browse
    BrowsingProducts --> ViewingProduct: Select Product
    ViewingProduct --> InCart: Add to Cart
    InCart --> SignUpPrompt: Proceed to Checkout
    SignUpPrompt --> RegisteredUser: Sign Up
    RegisteredUser --> CheckoutProcess: Continue
    CheckoutProcess --> OrderPlaced: Complete Payment
    OrderPlaced --> [*]: Success

    SignUpPrompt --> GuestCheckout: Continue as Guest
    GuestCheckout --> OrderPlaced
```

---

### Path 2: Product Discovery to Purchase

```mermaid
stateDiagram-v2
    [*] --> HomePage: Land on Site

    HomePage --> SearchPath: Use Search
    HomePage --> BrowsePath: Browse Categories
    HomePage --> FeaturePath: Click Featured

    SearchPath --> ProductListing
    BrowsePath --> CategoryPage
    CategoryPage --> ProductListing
    FeaturePath --> ProductDetail

    ProductListing --> ProductDetail

    ProductDetail --> AddedToCart: Add to Cart
    ProductDetail --> AddedToWishlist: Add to Wishlist

    AddedToWishlist --> ProductDetail: Continue Shopping
    AddedToCart --> CartPage

    CartPage --> Checkout
    Checkout --> PaymentGateway
    PaymentGateway --> OrderSuccess
    OrderSuccess --> [*]
```

---

### Path 3: Order Tracking Journey

```mermaid
stateDiagram-v2
    [*] --> OrderPlaced: Order Created

    OrderPlaced --> OrderConfirmed: Payment Verified
    OrderConfirmed --> OrderProcessing: Seller Confirms
    OrderProcessing --> OrderShipped: Dispatched
    OrderShipped --> OutForDelivery: In Transit
    OutForDelivery --> OrderDelivered: Delivered
    OrderDelivered --> [*]: Complete

    OrderPlaced --> OrderCancelled: User Cancels
    OrderProcessing --> OrderCancelled: Seller Cancels
    OrderCancelled --> RefundProcessed: Refund
    RefundProcessed --> [*]

    OrderDelivered --> ReturnRequested: Return
    ReturnRequested --> ReturnApproved: Approved
    ReturnApproved --> RefundProcessed
```

---

## 🔍 Search & Discovery Flow

```mermaid
flowchart TD
    USER[User Searches]

    USER --> SEARCH_INPUT[Enter Search Query]
    SEARCH_INPUT --> API_CALL[API: searchProducts]

    API_CALL --> CACHE{Check Cache}
    CACHE -->|Hit| RETURN_CACHED[Return Cached Results]
    CACHE -->|Miss| DB_SEARCH[Search Database]

    DB_SEARCH --> RELEVANCE[Calculate Relevance]
    RELEVANCE --> RANK[Rank Results]
    RANK --> FILTER_APPLY[Apply Filters]
    FILTER_APPLY --> RESULTS[Display Results]

    RETURN_CACHED --> RESULTS

    RESULTS --> USER_ACTION{User Action}

    USER_ACTION -->|Click Product| PRODUCT_PAGE[Product Detail]
    USER_ACTION -->|Refine Search| FILTERS[Apply More Filters]
    USER_ACTION -->|Sort| RESORT[Re-sort Results]

    FILTERS --> API_CALL
    RESORT --> RESULTS
```

---

## 📊 Analytics & Tracking Points

```mermaid
flowchart LR
    USER_ACTION[User Action]

    USER_ACTION --> PAGE_VIEW[Track Page View]
    USER_ACTION --> CLICK_EVENT[Track Clicks]
    USER_ACTION --> ADD_CART[Track Add to Cart]
    USER_ACTION --> PURCHASE[Track Purchase]
    USER_ACTION --> SEARCH[Track Search]

    PAGE_VIEW --> GA[Google Analytics]
    CLICK_EVENT --> GA
    ADD_CART --> GA
    PURCHASE --> GA
    SEARCH --> GA

    GA --> DASHBOARD[Analytics Dashboard]

    DASHBOARD --> REPORTS[Generate Reports]
    REPORTS --> INSIGHTS[Business Insights]
    INSIGHTS --> DECISIONS[Business Decisions]
```

---

## 🔗 Related Documentation

- **[Application Routes Diagram](APPLICATION_ROUTES_DIAGRAM.md)** - All routes
- **[Architecture Diagram](ARCHITECTURE_DIAGRAM.md)** - Technical architecture
- **[UI Files Documentation](UI_FILES_DOCUMENTATION.md)** - Component details
- **[Documentation Index](../DOCUMENTATION_INDEX.md)** - All documentation

---

**Last Updated:** November 4, 2025  
**Maintained by:** Development Team  
**Diagram Format:** Mermaid (GitHub/VS Code compatible)

---

## 💡 How to Use These Diagrams

### For Product Planning

- Use journey maps to identify pain points
- Review flows to optimize conversion
- Analyze drop-off points

### For Development

- Follow use cases to implement features
- Use flows for testing scenarios
- Reference for state management

### For UX Design

- Journey maps for user research
- Flows for wireframe creation
- Paths for usability testing

### For Training

- Show to new team members
- Explain system capabilities
- Document user stories
