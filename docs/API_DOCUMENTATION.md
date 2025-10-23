# API Documentation

This project has a completely independent API layer that can be used by any client (web, mobile, desktop, etc.). All authentication is handled server-side with secure JWT tokens.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     Client Applications                      │
│  (Web UI, Mobile App, Desktop App, Third-party Integrations) │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        │ HTTP/HTTPS
                        │
┌───────────────────────▼─────────────────────────────────────┐
│                    API Layer (Next.js)                       │
│  ┌─────────────────────────────────────────────────────┐    │
│  │            API Routes (/app/api/*)                   │    │
│  │  - Authentication                                    │    │
│  │  - Products                                          │    │
│  │  - Orders                                            │    │
│  │  - Auctions                                          │    │
│  │  - Payments                                          │    │
│  │  - Shipping                                          │    │
│  └─────────────────────────────────────────────────────┘    │
│  ┌─────────────────────────────────────────────────────┐    │
│  │         Authentication Middleware                    │    │
│  │  - JWT Token Verification                           │    │
│  │  - Rate Limiting                                     │    │
│  │  - Request Validation                                │    │
│  └─────────────────────────────────────────────────────┘    │
│  ┌─────────────────────────────────────────────────────┐    │
│  │              Service Layer                           │    │
│  │  - Business Logic                                    │    │
│  │  - Data Validation                                   │    │
│  │  - External API Integration                          │    │
│  └─────────────────────────────────────────────────────┘    │
└───────────────────────┬─────────────────────────────────────┘
                        │
        ┌───────────────┴───────────────┐
        │                               │
┌───────▼────────┐            ┌─────────▼──────────┐
│    Firebase    │            │   External APIs    │
│   - Firestore  │            │   - Razorpay       │
│   - Auth       │            │   - Shiprocket     │
│   - Storage    │            │                    │
└────────────────┘            └────────────────────┘
```

## Security Features

### Server-Side Authentication

- All sensitive operations are performed server-side
- JWT tokens are generated and verified only on the server
- Passwords are hashed using bcrypt (12 rounds)
- Private keys and secrets never exposed to client
- HTTP-only cookies for token storage (web)
- Authorization headers for mobile/external clients

### API Key Management

- All API keys stored in environment variables
- Separate public/private configuration
- Firebase Admin SDK runs only on server
- Razorpay secret keys protected
- Shiprocket credentials secured

### Request Validation

- Zod schema validation on all endpoints
- Type-safe request/response handling
- Rate limiting per IP address
- CORS configuration for cross-origin requests

## Authentication Flow

### 1. Registration

```
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "name": "John Doe",
  "phone": "+919876543210"
}

Response:
{
  "success": true,
  "data": {
    "user": {
      "id": "user_id",
      "email": "user@example.com",
      "name": "John Doe",
      "role": "user"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### 2. Login

```
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123!"
}

Response:
{
  "success": true,
  "data": {
    "user": {...},
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### 3. Using the Token

#### Web Client (Cookie-based)

Tokens are automatically stored in HTTP-only cookies. No action needed.

#### Mobile/External Client (Header-based)

```
GET /api/auth/me
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## API Endpoints

### Authentication

#### Register

- **POST** `/api/auth/register`
- **Body**: `{ email, password, name, phone? }`
- **Returns**: `{ user, token }`
- **Public**: Yes

#### Login

- **POST** `/api/auth/login`
- **Body**: `{ email, password }`
- **Returns**: `{ user, token }`
- **Public**: Yes

#### Logout

- **POST** `/api/auth/logout`
- **Auth**: Required
- **Returns**: `{ message }`

#### Get Current User

- **GET** `/api/auth/me`
- **Auth**: Required
- **Returns**: `User`

#### Update Profile

- **PATCH** `/api/auth/profile`
- **Auth**: Required
- **Body**: `{ name?, phone?, avatar? }`
- **Returns**: `User`

### Products

#### Get Products

- **GET** `/api/products`
- **Query Params**:
  - `category`: string
  - `minPrice`: number
  - `maxPrice`: number
  - `tags`: string (comma-separated)
  - `search`: string
  - `sort`: 'price-asc' | 'price-desc' | 'newest' | 'popular'
  - `page`: number
  - `pageSize`: number
- **Returns**: `PaginatedResponse<Product>`
- **Public**: Yes

#### Get Product by ID

- **GET** `/api/products/:id`
- **Returns**: `Product`
- **Public**: Yes

#### Get Product by Slug

- **GET** `/api/products/slug/:slug`
- **Returns**: `Product`
- **Public**: Yes

#### Get Featured Products

- **GET** `/api/products/featured`
- **Query Params**: `limit?: number`
- **Returns**: `Product[]`
- **Public**: Yes

#### Create Product

- **POST** `/api/products`
- **Auth**: Required (Admin only)
- **Body**: `CreateProductInput`
- **Returns**: `Product`

#### Update Product

- **PATCH** `/api/products/:id`
- **Auth**: Required (Admin only)
- **Body**: `Partial<CreateProductInput>`
- **Returns**: `Product`

#### Delete Product

- **DELETE** `/api/products/:id`
- **Auth**: Required (Admin only)
- **Returns**: `void`

### Cart

#### Get Cart

- **GET** `/api/cart`
- **Auth**: Required
- **Returns**: `Cart`

#### Add to Cart

- **POST** `/api/cart/items`
- **Auth**: Required
- **Body**: `{ productId, quantity }`
- **Returns**: `Cart`

#### Update Cart Item

- **PATCH** `/api/cart/items/:productId`
- **Auth**: Required
- **Body**: `{ quantity }`
- **Returns**: `Cart`

#### Remove from Cart

- **DELETE** `/api/cart/items/:productId`
- **Auth**: Required
- **Returns**: `Cart`

### Orders

#### Get Orders

- **GET** `/api/orders`
- **Auth**: Required
- **Query Params**: Filtering options
- **Returns**: `PaginatedResponse<Order>`

#### Get Order by ID

- **GET** `/api/orders/:id`
- **Auth**: Required
- **Returns**: `Order`

#### Create Order

- **POST** `/api/orders`
- **Auth**: Required
- **Body**: `CreateOrderInput`
- **Returns**: `Order`

#### Update Order Status (Admin)

- **PATCH** `/api/orders/:id/status`
- **Auth**: Required (Admin only)
- **Body**: `{ status, trackingNumber?, notes? }`
- **Returns**: `Order`

### Auctions

#### Get Active Auctions

- **GET** `/api/auctions/active`
- **Returns**: `Auction[]`
- **Public**: Yes

#### Get Auction by ID

- **GET** `/api/auctions/:id`
- **Returns**: `Auction`
- **Public**: Yes

#### Place Bid

- **POST** `/api/auctions/:id/bids`
- **Auth**: Required
- **Body**: `{ amount, isAutoBid?, maxAutoBid? }`
- **Returns**: `Auction`

### Payments

#### Create Razorpay Order

- **POST** `/api/payment/razorpay/create-order`
- **Auth**: Required
- **Body**: `{ orderId }`
- **Returns**: `{ razorpayOrderId, amount, currency }`

#### Verify Razorpay Payment

- **POST** `/api/payment/razorpay/verify`
- **Auth**: Required
- **Body**: `{ orderId, paymentId, signature }`
- **Returns**: `void`

### Shipping

#### Get Shipping Rates

- **GET** `/api/shipping/rates`
- **Query Params**: `pincode, weight`
- **Returns**: `ShippingRate[]`
- **Public**: Yes

#### Create Shipment

- **POST** `/api/shipping/create`
- **Auth**: Required (Admin only)
- **Body**: `{ orderId, courierId }`
- **Returns**: `ShipmentDetails`

## Using the API from Different Clients

### Web Client (Next.js)

```typescript
import { authApi, productsApi } from "@/lib/api";

// Login
const { user, token } = await authApi.login({
  email: "user@example.com",
  password: "password",
});

// Get products
const products = await productsApi.getAll({
  category: "electronics",
  page: 1,
  pageSize: 20,
});
```

### Mobile App (React Native / Flutter)

```typescript
// Using fetch or axios directly
const response = await fetch("https://your-domain.com/api/auth/login", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    email: "user@example.com",
    password: "password",
  }),
});

const { data } = await response.json();
const token = data.token;

// Store token securely (AsyncStorage, SecureStore, etc.)
await SecureStore.setItemAsync("auth_token", token);

// Use token for authenticated requests
const productsResponse = await fetch("https://your-domain.com/api/products", {
  headers: {
    Authorization: `Bearer ${token}`,
  },
});
```

### External Integration

```bash
# Login and get token
curl -X POST https://your-domain.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password"}'

# Use token for requests
curl -X GET https://your-domain.com/api/products \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## Error Handling

All API responses follow a consistent format:

### Success Response

```json
{
  "success": true,
  "data": { ... }
}
```

### Error Response

```json
{
  "success": false,
  "error": "Error message",
  "errors": { ... } // Optional validation errors
}
```

### HTTP Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request / Validation Error
- `401` - Unauthorized (Missing or invalid token)
- `403` - Forbidden (Insufficient permissions)
- `404` - Not Found
- `429` - Too Many Requests (Rate limit exceeded)
- `500` - Internal Server Error

## Rate Limiting

- Default: 100 requests per 15 minutes per IP
- Configurable via environment variables
- Returns 429 status code when exceeded
- For production, use Redis-based rate limiting

## Environment Setup

See `.env.example` for required environment variables.

**Critical**: Never commit `.env` file to version control!

## Testing the API

Use tools like:

- Postman
- Insomnia
- Thunder Client (VS Code)
- curl

Example Postman collection is available in `/docs/postman`.

## Deployment

1. Set all environment variables on your hosting platform
2. Ensure Firebase Admin credentials are properly configured
3. Set up CORS for cross-origin requests if needed
4. Configure rate limiting based on your needs
5. Set up monitoring and logging

## Next Steps

1. Install dependencies: `npm install`
2. Copy `.env.example` to `.env` and fill in values
3. Run development server: `npm run dev`
4. API will be available at `http://localhost:3000/api`
