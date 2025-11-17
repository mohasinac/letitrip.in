# API Architecture & Consolidation Guide

**Last Updated**: November 18, 2025

Complete guide to the API architecture, endpoints, and consolidation patterns used in JustForView.in.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Service Layer Architecture](#service-layer-architecture)
- [Available Services](#available-services)
- [API Endpoints](#api-endpoints)
- [Request/Response Patterns](#requestresponse-patterns)
- [Error Handling](#error-handling)
- [Authentication](#authentication)
- [Pagination](#pagination)

---

## 🎯 Overview

### Architecture Principles

1. **Service Layer Pattern** - All API calls abstracted through services
2. **Consistent Response Format** - Unified JSON structure across all endpoints
3. **Type Safety** - Full TypeScript typing for requests and responses
4. **Error Handling** - Centralized error handling with meaningful messages
5. **Authentication** - JWT-based auth with role-based access control (RBAC)

### Data Flow

```
Component
  ↓
Service Layer (src/services/)
  ↓
API Service (base HTTP client)
  ↓
API Routes (src/app/api/)
  ↓
Firebase Admin SDK
  ↓
Firestore/Storage/Realtime DB
```

---

## 🏗️ Service Layer Architecture

### Base API Service

**Location**: `src/services/api.service.ts`

Handles:

- HTTP requests (GET, POST, PATCH, DELETE)
- Authentication headers
- Error handling
- Response parsing

```typescript
class ApiService {
  private baseURL = "/api";

  async get<T>(path: string): Promise<T> {
    const response = await fetch(`${this.baseURL}${path}`, {
      method: "GET",
      headers: this.getHeaders(),
    });
    return this.handleResponse<T>(response);
  }

  async post<T>(path: string, data: any): Promise<T> {
    const response = await fetch(`${this.baseURL}${path}`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    return this.handleResponse<T>(response);
  }

  // ... PATCH, DELETE methods

  private getHeaders() {
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${this.getToken()}`,
    };
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Request failed");
    }
    return response.json();
  }
}

export const apiService = new ApiService();
```

### Service Pattern

Each resource has its own service class:

```typescript
// src/services/products.service.ts
import { apiService } from "./api.service";
import { Product, ProductFilters } from "@/types/product";

class ProductsService {
  private readonly BASE_PATH = "/products";

  async getProducts(filters?: ProductFilters): Promise<Product[]> {
    const params = new URLSearchParams();
    if (filters?.status) params.set("status", filters.status);
    if (filters?.categoryId) params.set("categoryId", filters.categoryId);

    const url = params.toString()
      ? `${this.BASE_PATH}?${params}`
      : this.BASE_PATH;

    const response = await apiService.get<{ products: Product[] }>(url);
    return response.products;
  }

  async getById(id: string): Promise<Product> {
    const response = await apiService.get<{ product: Product }>(
      `${this.BASE_PATH}/${id}`
    );
    return response.product;
  }

  // ... more methods
}

export const productsService = new ProductsService();
```

---

## 📦 Available Services

### Core Services

| Service             | Path          | Description                    |
| ------------------- | ------------- | ------------------------------ |
| `authService`       | `/auth`       | Authentication & authorization |
| `productsService`   | `/products`   | Product CRUD operations        |
| `auctionsService`   | `/auctions`   | Auction management & bidding   |
| `cartService`       | `/cart`       | Shopping cart operations       |
| `ordersService`     | `/orders`     | Order processing               |
| `shopsService`      | `/shops`      | Shop/vendor management         |
| `categoriesService` | `/categories` | Category hierarchy             |
| `usersService`      | `/users`      | User profile management        |

### Supporting Services

| Service                | Path             | Description                  |
| ---------------------- | ---------------- | ---------------------------- |
| `reviewsService`       | `/reviews`       | Product reviews & ratings    |
| `addressesService`     | `/addresses`     | User address management      |
| `couponsService`       | `/coupons`       | Discount codes               |
| `supportService`       | `/support`       | Support tickets              |
| `notificationsService` | `/notifications` | User notifications           |
| `mediaService`         | `/media`         | File uploads (images/videos) |
| `favoritesService`     | `/favorites`     | Wishlist/favorites           |
| `returnsService`       | `/returns`       | Order returns                |

### Admin Services

| Service                  | Path                | Description          |
| ------------------------ | ------------------- | -------------------- |
| `adminUsersService`      | `/admin/users`      | User management      |
| `adminShopsService`      | `/admin/shops`      | Shop verification    |
| `adminCategoriesService` | `/admin/categories` | Category management  |
| `testDataService`        | `/admin/test-data`  | Test data generation |

---

## 🔌 API Endpoints

### Products API

**Base Path**: `/api/products`

| Method | Endpoint        | Description           | Auth   |
| ------ | --------------- | --------------------- | ------ |
| GET    | `/`             | List products         | Public |
| GET    | `/:id`          | Get product by ID     | Public |
| POST   | `/`             | Create product        | Seller |
| PATCH  | `/:id`          | Update product        | Seller |
| DELETE | `/:id`          | Delete product        | Seller |
| GET    | `/search`       | Search products       | Public |
| GET    | `/featured`     | Get featured products | Public |
| GET    | `/shop/:shopId` | Get shop products     | Public |

**Query Parameters** (GET `/`):

- `status`: Filter by status (`draft`, `published`, `archived`)
- `categoryId`: Filter by category
- `shopId`: Filter by shop
- `featured`: Filter featured products
- `minPrice`: Minimum price
- `maxPrice`: Maximum price
- `search`: Search term
- `page`: Page number (pagination)
- `limit`: Items per page (default: 20)

**Example Request**:

```typescript
// Service usage
const products = await productsService.getProducts({
  status: "published",
  categoryId: "electronics",
  minPrice: 1000,
  maxPrice: 5000,
  page: 1,
  limit: 20,
});

// API endpoint
// GET /api/products?status=published&categoryId=electronics&minPrice=1000&maxPrice=5000&page=1&limit=20
```

**Example Response**:

```json
{
  "products": [
    {
      "id": "prod_123",
      "name": "Smartphone",
      "description": "Latest model",
      "price": 29999,
      "originalPrice": 34999,
      "images": ["url1", "url2"],
      "categoryId": "electronics",
      "shopId": "shop_123",
      "status": "published",
      "stock": 50,
      "featured": true,
      "createdAt": "2025-11-18T00:00:00.000Z",
      "updatedAt": "2025-11-18T00:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8
  }
}
```

### Auctions API

**Base Path**: `/api/auctions`

| Method | Endpoint        | Description         | Auth   |
| ------ | --------------- | ------------------- | ------ |
| GET    | `/`             | List auctions       | Public |
| GET    | `/:id`          | Get auction by ID   | Public |
| POST   | `/`             | Create auction      | Seller |
| PATCH  | `/:id`          | Update auction      | Seller |
| DELETE | `/:id`          | Delete auction      | Seller |
| POST   | `/:id/bid`      | Place bid           | User   |
| GET    | `/:id/bids`     | Get bid history     | Public |
| POST   | `/:id/auto-bid` | Enable auto-bidding | User   |

**Auction Types**:

- `regular`: Highest bidder wins
- `reverse`: Lowest bidder wins
- `silent`: Bids hidden until end

**Example Bid Request**:

```typescript
// Service usage
const result = await auctionsService.placeBid("auction_123", 5000);

// API endpoint
// POST /api/auctions/auction_123/bid
// Body: { "amount": 5000 }
```

**Example Bid Response**:

```json
{
  "success": true,
  "bidId": "bid_456",
  "currentBid": 5000,
  "bidCount": 12,
  "isHighestBidder": true
}
```

### Cart API

**Base Path**: `/api/cart`

| Method | Endpoint     | Description          | Auth |
| ------ | ------------ | -------------------- | ---- |
| GET    | `/`          | Get user cart        | User |
| POST   | `/items`     | Add item to cart     | User |
| PATCH  | `/items/:id` | Update item quantity | User |
| DELETE | `/items/:id` | Remove item          | User |
| DELETE | `/`          | Clear cart           | User |

### Orders API

**Base Path**: `/api/orders`

| Method | Endpoint      | Description         | Auth         |
| ------ | ------------- | ------------------- | ------------ |
| GET    | `/`           | List user orders    | User         |
| GET    | `/:id`        | Get order by ID     | User         |
| POST   | `/`           | Create order        | User         |
| PATCH  | `/:id`        | Update order status | Seller/Admin |
| POST   | `/:id/cancel` | Cancel order        | User         |
| POST   | `/:id/return` | Request return      | User         |

**Order Statuses**:

- `pending`: Order placed, awaiting confirmation
- `confirmed`: Seller confirmed
- `processing`: Being prepared
- `shipped`: Shipped to customer
- `delivered`: Delivered successfully
- `cancelled`: Order cancelled
- `returned`: Order returned

### Shops API

**Base Path**: `/api/shops`

| Method | Endpoint         | Description        | Auth   |
| ------ | ---------------- | ------------------ | ------ |
| GET    | `/`              | List shops         | Public |
| GET    | `/:id`           | Get shop by ID     | Public |
| POST   | `/`              | Create shop        | Seller |
| PATCH  | `/:id`           | Update shop        | Seller |
| GET    | `/:id/products`  | Get shop products  | Public |
| GET    | `/:id/auctions`  | Get shop auctions  | Public |
| GET    | `/:id/analytics` | Get shop analytics | Seller |

### Categories API

**Base Path**: `/api/categories`

| Method | Endpoint     | Description        | Auth   |
| ------ | ------------ | ------------------ | ------ |
| GET    | `/`          | List categories    | Public |
| GET    | `/:id`       | Get category by ID | Public |
| POST   | `/`          | Create category    | Admin  |
| PATCH  | `/:id`       | Update category    | Admin  |
| DELETE | `/:id`       | Delete category    | Admin  |
| GET    | `/hierarchy` | Get category tree  | Public |

### Users API

**Base Path**: `/api/users`

| Method | Endpoint                | Description           | Auth |
| ------ | ----------------------- | --------------------- | ---- |
| GET    | `/profile`              | Get user profile      | User |
| PATCH  | `/profile`              | Update profile        | User |
| GET    | `/orders`               | Get user orders       | User |
| GET    | `/favorites`            | Get favorites         | User |
| POST   | `/favorites/:productId` | Add to favorites      | User |
| DELETE | `/favorites/:productId` | Remove from favorites | User |

### Authentication API

**Base Path**: `/api/auth`

| Method | Endpoint           | Description            | Auth   |
| ------ | ------------------ | ---------------------- | ------ |
| POST   | `/register`        | Register new user      | Public |
| POST   | `/login`           | Login                  | Public |
| POST   | `/logout`          | Logout                 | User   |
| POST   | `/refresh`         | Refresh token          | User   |
| POST   | `/forgot-password` | Request password reset | Public |
| POST   | `/reset-password`  | Reset password         | Public |

---

## 📨 Request/Response Patterns

### Standard Response Format

All API responses follow this structure:

**Success Response**:

```json
{
  "success": true,
  "data": {
    /* resource data */
  },
  "message": "Operation successful"
}
```

**Error Response**:

```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": {
    /* additional error info */
  }
}
```

**Paginated Response**:

```json
{
  "data": [
    /* array of items */
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

---

## 🛡️ Error Handling

### Error Codes

| Code               | HTTP Status | Description        |
| ------------------ | ----------- | ------------------ |
| `UNAUTHORIZED`     | 401         | Not authenticated  |
| `FORBIDDEN`        | 403         | No permission      |
| `NOT_FOUND`        | 404         | Resource not found |
| `VALIDATION_ERROR` | 400         | Invalid input      |
| `CONFLICT`         | 409         | Resource conflict  |
| `INTERNAL_ERROR`   | 500         | Server error       |

### Error Handling in Services

```typescript
async getProduct(id: string): Promise<Product> {
  try {
    const response = await apiService.get<{ product: Product }>(
      `/products/${id}`
    );
    return response.product;
  } catch (error: any) {
    if (error.message.includes('not found')) {
      throw new Error('Product not found');
    }
    throw new Error('Failed to load product. Please try again.');
  }
}
```

---

## 🔐 Authentication

### JWT Authentication

**Headers**:

```
Authorization: Bearer <jwt_token>
```

**Token Payload**:

```json
{
  "userId": "user_123",
  "email": "user@example.com",
  "role": "seller",
  "shopId": "shop_123",
  "iat": 1700000000,
  "exp": 1700086400
}
```

### Role-Based Access Control (RBAC)

**Roles**:

- `admin`: Full platform access
- `seller`: Shop management, product/auction creation
- `user`: Browse, purchase, bid

**Permission Checks** (in API routes):

```typescript
import { verifyAuth } from "@/app/api/middleware/auth";

export async function POST(request: NextRequest) {
  const auth = await verifyAuth(request);

  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (auth.role !== "seller" && auth.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Process request
}
```

---

## 📄 Pagination

### Query Parameters

- `page`: Page number (1-indexed)
- `limit`: Items per page (default: 20, max: 100)

### Response Format

```json
{
  "data": [
    /* items */
  ],
  "pagination": {
    "page": 2,
    "limit": 20,
    "total": 150,
    "totalPages": 8,
    "hasNextPage": true,
    "hasPrevPage": true
  }
}
```

### Usage Example

```typescript
// Service
const { products, pagination } = await productsService.getProducts({
  page: 2,
  limit: 20,
});

// Component
function ProductList() {
  const [page, setPage] = useState(1);
  const { products, pagination } = useProducts({ page, limit: 20 });

  return (
    <div>
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}

      <Pagination
        currentPage={pagination.page}
        totalPages={pagination.totalPages}
        onPageChange={setPage}
      />
    </div>
  );
}
```

---

## 📚 Additional Resources

- [Service Layer Guide](../architecture/SERVICE-LAYER-GUIDE.md)
- [Development Guide](../development/DEVELOPMENT-GUIDE.md)
- [Architecture Overview](../architecture/ARCHITECTURE-OVERVIEW.md)

---

**Last Updated**: November 18, 2025
