# 🏗️ Application Architecture & Data Flow Diagram

**Last Updated:** November 4, 2025  
**Purpose:** Technical architecture visualization for justforview.in

---

## 🎯 System Architecture Overview

```mermaid
graph TB
    subgraph Client["🌐 Client Layer"]
        BROWSER[Web Browser]
        MOBILE[Mobile Browser]
    end

    subgraph NextJS["⚡ Next.js 14 App Router"]
        PAGES[📄 Pages/Routes]
        COMPONENTS[🧩 Components]
        CONTEXTS[🔄 Context Providers]
        API_CLIENT[📡 API Client]
    end

    subgraph Services["🛠️ Service Layer"]
        PRODUCT_SERVICE[📦 Product Service]
        USER_SERVICE[👤 User Service]
        ORDER_SERVICE[📋 Order Service]
        CATEGORY_SERVICE[📑 Category Service]
        REVIEW_SERVICE[⭐ Review Service]
        CART_SERVICE[🛒 Cart Service]
        WISHLIST_SERVICE[❤️ Wishlist Service]
    end

    subgraph APIRoutes["🔌 API Routes"]
        PRODUCTS_API[/api/products]
        USERS_API[/api/user]
        ORDERS_API[/api/orders]
        CATEGORIES_API[/api/categories]
        REVIEWS_API[/api/reviews]
        CART_API[/api/cart]
    end

    subgraph Backend["💾 Backend Services"]
        FIREBASE_AUTH[🔐 Firebase Auth]
        FIRESTORE[🗄️ Firestore DB]
        STORAGE[📁 Firebase Storage]
        CACHE[⚡ Cache Layer]
    end

    subgraph External["🌍 External Services"]
        RAZORPAY[💳 Razorpay Payment]
        PAYPAL[💵 PayPal]
        EMAIL[📧 Email Service]
        SMS[📱 SMS Service]
    end

    BROWSER --> PAGES
    MOBILE --> PAGES

    PAGES --> COMPONENTS
    PAGES --> CONTEXTS

    COMPONENTS --> API_CLIENT
    CONTEXTS --> API_CLIENT

    API_CLIENT --> PRODUCT_SERVICE
    API_CLIENT --> USER_SERVICE
    API_CLIENT --> ORDER_SERVICE
    API_CLIENT --> CATEGORY_SERVICE
    API_CLIENT --> REVIEW_SERVICE
    API_CLIENT --> CART_SERVICE
    API_CLIENT --> WISHLIST_SERVICE

    PRODUCT_SERVICE --> PRODUCTS_API
    USER_SERVICE --> USERS_API
    ORDER_SERVICE --> ORDERS_API
    CATEGORY_SERVICE --> CATEGORIES_API
    REVIEW_SERVICE --> REVIEWS_API
    CART_SERVICE --> CART_API

    PRODUCTS_API --> FIRESTORE
    USERS_API --> FIRESTORE
    ORDERS_API --> FIRESTORE
    CATEGORIES_API --> FIRESTORE
    REVIEWS_API --> FIRESTORE
    CART_API --> FIRESTORE

    USERS_API --> FIREBASE_AUTH
    PRODUCTS_API --> STORAGE

    PRODUCTS_API --> CACHE
    CATEGORIES_API --> CACHE

    ORDERS_API --> RAZORPAY
    ORDERS_API --> PAYPAL
    ORDERS_API --> EMAIL
    ORDERS_API --> SMS
```

---

## 🔄 Data Flow by Feature

### 1. Product Browsing Flow

```mermaid
sequenceDiagram
    actor User
    participant Browser
    participant ProductPage
    participant APIClient
    participant ProductService
    participant CacheLayer
    participant ProductsAPI
    participant Firestore

    User->>Browser: Visit /products
    Browser->>ProductPage: Render page
    ProductPage->>APIClient: api.products.getProducts()
    APIClient->>ProductService: getProducts(filters)
    ProductService->>CacheLayer: Check cache

    alt Cache Hit
        CacheLayer-->>ProductService: Return cached data
    else Cache Miss
        ProductService->>ProductsAPI: GET /api/products
        ProductsAPI->>Firestore: Query products
        Firestore-->>ProductsAPI: Return products
        ProductsAPI-->>ProductService: Response
        ProductService->>CacheLayer: Store in cache
    end

    ProductService-->>APIClient: Products data
    APIClient-->>ProductPage: Update state
    ProductPage-->>Browser: Render products
    Browser-->>User: Display products
```

---

### 2. Add to Cart Flow

```mermaid
sequenceDiagram
    actor User
    participant Browser
    participant ProductDetail
    participant CartContext
    participant APIClient
    participant CartService
    participant CartAPI
    participant Firestore

    User->>Browser: Click "Add to Cart"
    Browser->>ProductDetail: handleAddToCart()
    ProductDetail->>CartContext: addItem(product)

    CartContext->>CartContext: Update local state
    CartContext-->>ProductDetail: Optimistic update
    ProductDetail-->>Browser: Show success toast

    CartContext->>APIClient: Sync cart
    APIClient->>CartService: saveCart(items)
    CartService->>CartAPI: POST /api/cart
    CartAPI->>Firestore: Update cart
    Firestore-->>CartAPI: Confirm
    CartAPI-->>CartService: Success
    CartService-->>APIClient: Cart saved
    APIClient-->>CartContext: Sync complete
```

---

### 3. User Authentication Flow

```mermaid
sequenceDiagram
    actor User
    participant Browser
    participant LoginPage
    participant AuthContext
    participant FirebaseAuth
    participant UsersAPI
    participant Firestore

    User->>Browser: Enter credentials
    Browser->>LoginPage: Submit form
    LoginPage->>AuthContext: login(email, password)
    AuthContext->>FirebaseAuth: signInWithEmailAndPassword()
    FirebaseAuth-->>AuthContext: User token

    AuthContext->>UsersAPI: GET /api/user/profile
    UsersAPI->>Firestore: Get user data
    Firestore-->>UsersAPI: User profile
    UsersAPI-->>AuthContext: Profile data

    AuthContext->>AuthContext: Store in context
    AuthContext-->>LoginPage: Login success
    LoginPage->>Browser: Redirect to /profile
```

---

### 4. Order Creation Flow

```mermaid
sequenceDiagram
    actor User
    participant Browser
    participant CheckoutPage
    participant OrderService
    participant OrdersAPI
    participant Firestore
    participant RazorpayAPI
    participant EmailService

    User->>Browser: Click "Place Order"
    Browser->>CheckoutPage: handlePlaceOrder()
    CheckoutPage->>OrderService: createOrder(data)

    OrderService->>OrdersAPI: POST /api/orders
    OrdersAPI->>Firestore: Create order doc
    Firestore-->>OrdersAPI: Order created

    OrdersAPI->>RazorpayAPI: Create payment order
    RazorpayAPI-->>OrdersAPI: Payment order ID

    OrdersAPI-->>OrderService: Order + Payment ID
    OrderService-->>CheckoutPage: Response

    CheckoutPage->>Browser: Open Razorpay modal
    User->>Browser: Complete payment
    Browser->>RazorpayAPI: Payment info
    RazorpayAPI-->>Browser: Payment success

    Browser->>OrdersAPI: POST /api/orders/verify
    OrdersAPI->>Firestore: Update order status
    OrdersAPI->>EmailService: Send confirmation
    EmailService-->>User: Email sent

    OrdersAPI-->>Browser: Success
    Browser->>CheckoutPage: Redirect to success page
```

---

### 5. Seller Product Management Flow

```mermaid
sequenceDiagram
    actor Seller
    participant Browser
    participant SellerProductPage
    participant ProductService
    participant ProductsAPI
    participant StorageAPI
    participant Firestore

    Seller->>Browser: Fill product form
    Browser->>SellerProductPage: Submit form

    SellerProductPage->>StorageAPI: Upload images
    StorageAPI-->>SellerProductPage: Image URLs

    SellerProductPage->>ProductService: createProduct(data)
    ProductService->>ProductsAPI: POST /api/products

    ProductsAPI->>Firestore: Create product doc
    Firestore-->>ProductsAPI: Product created

    ProductsAPI-->>ProductService: Success
    ProductService-->>SellerProductPage: Product data
    SellerProductPage-->>Browser: Show success
    Browser->>SellerProductPage: Redirect to products list
```

---

## 🗄️ Database Schema Relationships

```mermaid
erDiagram
    USERS ||--o{ ORDERS : places
    USERS ||--o{ REVIEWS : writes
    USERS ||--o{ ADDRESSES : has
    USERS ||--|| CART : has
    USERS ||--|| WISHLIST : has

    USERS {
        string id PK
        string email
        string name
        string role
        string avatar
        timestamp createdAt
    }

    PRODUCTS ||--o{ ORDER_ITEMS : contains
    PRODUCTS ||--o{ REVIEWS : has
    PRODUCTS ||--o{ CART_ITEMS : in
    PRODUCTS ||--o{ WISHLIST_ITEMS : in
    PRODUCTS }o--|| CATEGORIES : belongs_to
    PRODUCTS }o--|| SELLERS : sold_by

    PRODUCTS {
        string id PK
        string name
        string slug
        number price
        number quantity
        string category FK
        string sellerId FK
    }

    ORDERS ||--|{ ORDER_ITEMS : contains
    ORDERS }o--|| ADDRESSES : ships_to

    ORDERS {
        string id PK
        string userId FK
        string status
        number total
        timestamp createdAt
    }

    ORDER_ITEMS {
        string orderId FK
        string productId FK
        number quantity
        number price
    }

    CATEGORIES ||--o{ CATEGORIES : has_children

    CATEGORIES {
        string id PK
        string name
        string slug
        string parentId FK
        boolean isActive
    }

    REVIEWS {
        string id PK
        string userId FK
        string productId FK
        number rating
        string comment
        timestamp createdAt
    }

    CART {
        string userId PK
        array items
        timestamp updatedAt
    }

    CART_ITEMS {
        string productId FK
        number quantity
        timestamp addedAt
    }

    WISHLIST {
        string userId PK
        array items
        timestamp updatedAt
    }

    WISHLIST_ITEMS {
        string productId FK
        timestamp addedAt
    }

    ADDRESSES {
        string id PK
        string userId FK
        string name
        string phone
        string addressLine1
        string city
        string state
        string pincode
        boolean isDefault
    }

    SELLERS ||--o{ PRODUCTS : sells

    SELLERS {
        string id PK
        string userId FK
        string storeName
        boolean isVerified
        string gst
    }
```

---

## 🔐 Authentication & Authorization Flow

```mermaid
graph TD
    REQUEST[📨 Incoming Request]

    REQUEST --> AUTH_CHECK{Auth Token?}

    AUTH_CHECK -->|No| PUBLIC_ROUTE{Public Route?}
    AUTH_CHECK -->|Yes| VERIFY_TOKEN[🔍 Verify Firebase Token]

    PUBLIC_ROUTE -->|Yes| ALLOW[✅ Allow Access]
    PUBLIC_ROUTE -->|No| DENY[❌ Redirect to Login]

    VERIFY_TOKEN --> TOKEN_VALID{Valid?}

    TOKEN_VALID -->|No| DENY
    TOKEN_VALID -->|Yes| GET_USER[👤 Get User Data]

    GET_USER --> CHECK_ROLE{Check Role}

    CHECK_ROLE -->|Admin Route| IS_ADMIN{Is Admin?}
    CHECK_ROLE -->|Seller Route| IS_SELLER{Is Seller?}
    CHECK_ROLE -->|User Route| ALLOW

    IS_ADMIN -->|Yes| ALLOW
    IS_ADMIN -->|No| DENY

    IS_SELLER -->|Yes| ALLOW
    IS_SELLER -->|No| DENY
```

---

## 🎯 API Client Architecture

```mermaid
graph TB
    subgraph Application["Application Layer"]
        COMPONENT[React Component]
    end

    subgraph APIClient["📡 API Client (lib/api.ts)"]
        INTERCEPTOR[Request Interceptor]
        RETRY[Retry Logic]
        CACHE[Cache Manager]
        ERROR[Error Handler]
    end

    subgraph Services["Service Layer"]
        PRODUCT_SRV[Product Service]
        USER_SRV[User Service]
        ORDER_SRV[Order Service]
        CART_SRV[Cart Service]
        WISHLIST_SRV[Wishlist Service]
        CATEGORY_SRV[Category Service]
        REVIEW_SRV[Review Service]
    end

    subgraph APIRoutes["API Routes"]
        ROUTES[Next.js API Routes]
    end

    COMPONENT --> PRODUCT_SRV
    COMPONENT --> USER_SRV
    COMPONENT --> ORDER_SRV
    COMPONENT --> CART_SRV

    PRODUCT_SRV --> INTERCEPTOR
    USER_SRV --> INTERCEPTOR
    ORDER_SRV --> INTERCEPTOR
    CART_SRV --> INTERCEPTOR
    WISHLIST_SRV --> INTERCEPTOR
    CATEGORY_SRV --> INTERCEPTOR
    REVIEW_SRV --> INTERCEPTOR

    INTERCEPTOR --> CACHE
    CACHE --> RETRY
    RETRY --> ERROR
    ERROR --> ROUTES

    ROUTES --> INTERCEPTOR
```

---

## 🔄 State Management Architecture

```mermaid
graph LR
    subgraph Contexts["🔄 React Contexts"]
        AUTH[Auth Context]
        CART[Cart Context]
        WISHLIST[Wishlist Context]
        CURRENCY[Currency Context]
    end

    subgraph LocalState["📦 Component State"]
        PRODUCTS[Products State]
        FILTERS[Filters State]
        UI[UI State]
    end

    subgraph APIState["📡 API State"]
        CACHE_STATE[Cached Data]
        LOADING[Loading States]
        ERRORS[Error States]
    end

    COMPONENTS[Components] --> AUTH
    COMPONENTS --> CART
    COMPONENTS --> WISHLIST
    COMPONENTS --> CURRENCY
    COMPONENTS --> PRODUCTS
    COMPONENTS --> FILTERS
    COMPONENTS --> UI

    AUTH --> API_CLIENT[API Client]
    CART --> API_CLIENT
    WISHLIST --> API_CLIENT

    API_CLIENT --> CACHE_STATE
    API_CLIENT --> LOADING
    API_CLIENT --> ERRORS
```

---

## 🚀 Performance Optimization Layers

```mermaid
graph TD
    USER[👤 User Request]

    USER --> CDN{CDN Cache?}

    CDN -->|Hit| RETURN_CDN[⚡ Return from CDN]
    CDN -->|Miss| NEXT_CACHE{Next.js Cache?}

    NEXT_CACHE -->|Hit| RETURN_NEXT[⚡ Return from Next.js]
    NEXT_CACHE -->|Miss| API_CACHE{API Cache?}

    API_CACHE -->|Hit| RETURN_API[⚡ Return from API Cache]
    API_CACHE -->|Miss| DB{Database}

    DB --> COMPUTE[🔧 Compute Response]
    COMPUTE --> STORE_CACHE[💾 Store in Caches]
    STORE_CACHE --> RETURN_USER[📤 Return to User]

    RETURN_CDN --> USER
    RETURN_NEXT --> USER
    RETURN_API --> USER
    RETURN_USER --> USER
```

---

## 📊 Caching Strategy by Layer

```mermaid
graph TB
    subgraph Browser["🌐 Browser Layer"]
        LOCAL_STORAGE[localStorage<br/>Cart, Wishlist, Recent]
        SESSION_STORAGE[sessionStorage<br/>Filters, UI State]
        MEMORY[React State<br/>Component Data]
    end

    subgraph Client["📡 Client Cache"]
        API_CACHE[API Client Cache<br/>5min TTL<br/>Products, Categories]
    end

    subgraph Server["⚡ Server Cache"]
        NEXT_CACHE[Next.js Cache<br/>ISR/SSG<br/>Static Pages]
        API_ROUTE_CACHE[API Route Cache<br/>1-5min TTL<br/>API Responses]
    end

    subgraph Database["💾 Database"]
        FIRESTORE[Firestore<br/>Source of Truth]
    end

    BROWSER --> Client
    Client --> Server
    Server --> Database
```

---

## 🔌 Third-Party Integrations

```mermaid
graph LR
    APP[Application]

    subgraph Payments["💳 Payment Gateways"]
        RAZORPAY[Razorpay]
        PAYPAL[PayPal]
    end

    subgraph Firebase["🔥 Firebase"]
        AUTH[Authentication]
        FIRESTORE_DB[Firestore]
        STORAGE_FB[Storage]
        HOSTING[Hosting]
    end

    subgraph Communications["📱 Communications"]
        EMAIL_SRV[Email Service]
        SMS_SRV[SMS Service]
        WHATSAPP[WhatsApp API]
    end

    subgraph Analytics["📊 Analytics"]
        GA[Google Analytics]
        SENTRY[Sentry Error Tracking]
    end

    APP --> RAZORPAY
    APP --> PAYPAL
    APP --> AUTH
    APP --> FIRESTORE_DB
    APP --> STORAGE_FB
    APP --> EMAIL_SRV
    APP --> SMS_SRV
    APP --> WHATSAPP
    APP --> GA
    APP --> SENTRY
```

---

## 🛡️ Security Architecture

```mermaid
graph TD
    REQUEST[📨 Client Request]

    REQUEST --> HTTPS{HTTPS?}
    HTTPS -->|No| REJECT[❌ Reject]
    HTTPS -->|Yes| CORS{CORS Valid?}

    CORS -->|No| REJECT
    CORS -->|Yes| RATE_LIMIT{Rate Limit OK?}

    RATE_LIMIT -->|No| REJECT
    RATE_LIMIT -->|Yes| AUTH_TOKEN{Auth Token?}

    AUTH_TOKEN -->|Required & Missing| REJECT
    AUTH_TOKEN -->|Valid| VERIFY[🔐 Verify Token]
    AUTH_TOKEN -->|Not Required| INPUT_VALIDATE

    VERIFY --> TOKEN_OK{Token Valid?}
    TOKEN_OK -->|No| REJECT
    TOKEN_OK -->|Yes| ROLE_CHECK{Role Check}

    ROLE_CHECK -->|Authorized| INPUT_VALIDATE[🔍 Input Validation]
    ROLE_CHECK -->|Unauthorized| REJECT

    INPUT_VALIDATE --> SANITIZE[🧹 Sanitize Input]
    SANITIZE --> XSS_CHECK[🛡️ XSS Protection]
    XSS_CHECK --> SQL_CHECK[🛡️ Injection Check]
    SQL_CHECK --> PROCESS[✅ Process Request]

    PROCESS --> RESPONSE[📤 Send Response]
```

---

## 📱 Mobile Responsive Architecture

```mermaid
graph LR
    DEVICE[Device]

    DEVICE --> DETECT{Screen Size}

    DETECT -->|Mobile < 640px| MOBILE_UI[📱 Mobile UI]
    DETECT -->|Tablet 640-1024px| TABLET_UI[📱 Tablet UI]
    DETECT -->|Desktop > 1024px| DESKTOP_UI[🖥️ Desktop UI]

    MOBILE_UI --> TOUCH[Touch Optimized]
    MOBILE_UI --> BOTTOM_NAV[Bottom Navigation]
    MOBILE_UI --> DRAWER[Drawer Menu]

    TABLET_UI --> HYBRID[Hybrid Layout]
    TABLET_UI --> SIDE_PANEL[Side Panels]

    DESKTOP_UI --> HOVER[Hover Effects]
    DESKTOP_UI --> SIDEBAR_FIX[Fixed Sidebar]
    DESKTOP_UI --> MULTI_COL[Multi-column]
```

---

## 🔄 Real-time Updates Architecture

```mermaid
sequenceDiagram
    participant Client
    participant Frontend
    participant Firebase
    participant Firestore

    Client->>Frontend: Load page
    Frontend->>Firebase: Subscribe to collection
    Firebase->>Firestore: Listen to changes

    loop Real-time Updates
        Firestore-->>Firebase: Document changed
        Firebase-->>Frontend: Push update
        Frontend-->>Client: Update UI
    end

    Client->>Frontend: User action
    Frontend->>Firebase: Write data
    Firebase->>Firestore: Update document
    Firestore-->>Firebase: Confirm
    Firebase-->>Frontend: Success
```

---

## 📦 Deployment Architecture

```mermaid
graph TB
    DEV[👨‍💻 Developer]

    DEV --> GIT[📂 Git Push]
    GIT --> GITHUB[🐙 GitHub]

    GITHUB --> VERCEL_DEPLOY{🚀 Vercel Deploy}

    VERCEL_DEPLOY --> BUILD[🔨 Build Process]
    BUILD --> TEST[🧪 Run Tests]
    TEST --> SUCCESS{Success?}

    SUCCESS -->|Yes| DEPLOY_PROD[🌍 Deploy Production]
    SUCCESS -->|No| NOTIFY_FAIL[📧 Notify Failure]

    DEPLOY_PROD --> CDN[⚡ Vercel CDN]
    DEPLOY_PROD --> EDGE[🌐 Edge Functions]

    CDN --> USERS[👥 Users]
    EDGE --> USERS

    DEPLOY_PROD --> FIREBASE[🔥 Firebase Backend]
    FIREBASE --> FIRESTORE_PROD[💾 Production DB]
```

---

## 🎯 Load Balancing & Scalability

```mermaid
graph TD
    USERS[👥 Users]

    USERS --> LB[⚖️ Load Balancer]

    LB --> SERVER1[🖥️ Server 1]
    LB --> SERVER2[🖥️ Server 2]
    LB --> SERVER3[🖥️ Server 3]

    SERVER1 --> CACHE_CLUSTER[⚡ Cache Cluster]
    SERVER2 --> CACHE_CLUSTER
    SERVER3 --> CACHE_CLUSTER

    CACHE_CLUSTER --> DB_PRIMARY[💾 Primary DB]
    DB_PRIMARY --> DB_REPLICA1[💾 Replica 1]
    DB_PRIMARY --> DB_REPLICA2[💾 Replica 2]

    SERVER1 --> STORAGE[📁 Storage]
    SERVER2 --> STORAGE
    SERVER3 --> STORAGE
```

---

## 🔗 Related Documentation

- **[Routes Diagram](APPLICATION_ROUTES_DIAGRAM.md)** - All application routes
- **[UI Files Documentation](UI_FILES_DOCUMENTATION.md)** - Component details
- **[API Services Guide](API_SERVICES_COMPLETE_GUIDE.md)** - API reference
- **[Documentation Index](../DOCUMENTATION_INDEX.md)** - All docs

---

**Last Updated:** November 4, 2025  
**Maintained by:** Development Team  
**Diagram Format:** Mermaid (GitHub/VS Code compatible)
