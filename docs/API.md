# Backend API Documentation

## Overview

This backend API is built with Next.js 15 App Router and includes comprehensive middleware for rate limiting, caching, and error logging.

## Features

### 1. Rate Limiting Middleware

- **Support**: 200 concurrent users
- **Window**: 1 minute sliding window
- **Headers**:
  - `X-RateLimit-Limit`: Maximum requests allowed
  - `X-RateLimit-Remaining`: Requests remaining
  - `X-RateLimit-Reset`: Timestamp when limit resets
  - `Retry-After`: Seconds until retry (on 429 response)

### 2. Cache Middleware

- **Type**: In-memory caching with ETag support
- **Default TTL**: 5 minutes (configurable)
- **Features**:
  - ETags for efficient cache validation
  - 304 Not Modified responses
  - Cache-Control headers
  - Manual cache invalidation

### 3. Error Logging Middleware

- **Logger**: Winston with multiple transports
- **Log Files**:
  - `logs/error.log`: Error-level logs
  - `logs/api.log`: API request/response logs
  - `logs/combined.log`: All logs
- **Features**:
  - Request/response logging
  - Error tracking with stack traces
  - Performance metrics (duration)
  - IP and user agent tracking

### 4. Firebase Integration

- **Location**: `src/app/api/lib/firebase/`
- **Admin SDK**: Server-side authentication and Firestore
- **Client SDK**: Browser-side Firebase initialization

## API Endpoints

### Authentication

#### POST `/api/auth/register`

Register a new user account.

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "name": "John Doe",
  "phoneNumber": "+1234567890" // optional
}
```

**Response (201):**

```json
{
  "message": "User registered successfully",
  "user": {
    "uid": "user-id",
    "email": "user@example.com",
    "name": "John Doe",
    "isEmailVerified": false
  },
  "token": "custom-firebase-token"
}
```

**Rate Limit**: 10 requests per minute

---

#### POST `/api/auth/login`

Login with email and password.

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response (200):**

```json
{
  "message": "Login successful",
  "user": {
    "uid": "user-id",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "user",
    "isEmailVerified": false,
    "profile": {
      "avatar": null,
      "bio": null,
      "address": null
    }
  },
  "token": "custom-firebase-token"
}
```

**Rate Limit**: 15 requests per minute

---

## Middleware Usage

### Using All Middleware Together

```typescript
import { withMiddleware } from "@/app/api/middleware";

async function handler(req: NextRequest) {
  // Your API logic here
  return NextResponse.json({ data: "response" });
}

export async function GET(req: NextRequest) {
  return withMiddleware(req, handler, {
    rateLimit: {
      maxRequests: 100,
      windowMs: 60000,
    },
    cache: {
      ttl: 300000, // 5 minutes
    },
  });
}
```

### Using Individual Middleware

```typescript
import { withRateLimit, withCache, withLogger } from "@/app/api/middleware";

// Rate limiting only
export async function POST(req: NextRequest) {
  return withRateLimit(req, handler, {
    maxRequests: 10,
    windowMs: 60000,
  });
}

// Caching only (GET requests)
export async function GET(req: NextRequest) {
  return withCache(req, handler, {
    ttl: 600000, // 10 minutes
  });
}

// Logging only
export async function PUT(req: NextRequest) {
  return withLogger(req, handler, {
    userId: "user-123",
  });
}
```

### Manual Cache Invalidation

```typescript
import { cacheManager } from "@/app/api/middleware";

// Invalidate all cache
cacheManager.invalidate();

// Invalidate specific pattern
cacheManager.invalidate("cache:/api/products.*");
```

### Manual Logging

```typescript
import { apiLogger } from "@/app/api/middleware";

// Log info
apiLogger.info("Operation successful", { userId: "user-123" });

// Log error
apiLogger.error("Operation failed", error, { userId: "user-123" });

// Log warning
apiLogger.warn("Rate limit approaching", { remaining: 10 });
```

## Error Responses

### 400 Bad Request

```json
{
  "error": "Missing required fields",
  "fields": ["email", "password"]
}
```

### 401 Unauthorized

```json
{
  "error": "Invalid credentials"
}
```

### 403 Forbidden

```json
{
  "error": "Account has been disabled"
}
```

### 404 Not Found

```json
{
  "error": "Resource not found"
}
```

### 429 Too Many Requests

```json
{
  "error": "Too many requests, please try again later.",
  "retryAfter": 45
}
```

### 500 Internal Server Error

```json
{
  "error": "Internal Server Error",
  "message": "An unexpected error occurred"
}
```

## Environment Variables

See `.env.example` for required environment variables:

- **Firebase Admin SDK**: `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`
- **Firebase Client SDK**: `NEXT_PUBLIC_FIREBASE_*`
- **Application**: `NODE_ENV`, `LOG_LEVEL`

## Database Schema

### Users Collection (`users`)

```typescript
{
  uid: string;
  email: string;
  name: string;
  phoneNumber?: string;
  hashedPassword: string;
  role: 'user' | 'admin' | 'seller';
  isEmailVerified: boolean;
  createdAt: string; // ISO timestamp
  updatedAt: string; // ISO timestamp
  lastLogin?: string; // ISO timestamp
  profile: {
    avatar?: string;
    bio?: string;
    address?: any;
  };
  preferences: {
    notifications: boolean;
    newsletter: boolean;
  };
}
```

## Security Considerations

1. **Password Hashing**: Uses bcrypt with 12 salt rounds
2. **Rate Limiting**: Protects against brute force and DDoS
3. **Input Validation**: Validates all user inputs
4. **Error Handling**: Doesn't expose sensitive information in production
5. **Logging**: Tracks all API requests for audit purposes
6. **Firebase Security**: Uses Admin SDK for server-side verification

## Production Recommendations

1. **Redis**: Replace in-memory cache with Redis for distributed systems
2. **Rate Limiting**: Use Redis-backed rate limiting for multi-server deployments
3. **Monitoring**: Set up error alerting with Sentry or similar
4. **Load Balancer**: Use a load balancer with sticky sessions
5. **CDN**: Cache static assets and responses at edge locations
6. **Environment**: Ensure all sensitive variables are properly set
