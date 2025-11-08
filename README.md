# JustForView.in - Auction Platform

Modern, scalable auction and e-commerce platform built for the Indian market with Next.js 14+, TypeScript, Firebase, and Socket.IO.

## 🚀 Features

### Auction System

- ✅ **Real-time Bidding**: Live auction updates using Socket.IO
- ✅ **Multiple Auction Types**: Regular, Reverse, and Silent auctions
- ✅ **Auto-bidding**: Automated bidding up to user-defined maximum
- ✅ **Auction Scheduling**: Automated start/end times with notifications
- ✅ **Bid History**: Complete audit trail of all bids

### E-commerce

- ✅ **Multi-vendor Platform**: Support for multiple shops and sellers
- ✅ **Product Catalog**: Hierarchical categories with advanced filtering
- ✅ **Shopping Cart**: Session-based cart with real-time updates
- ✅ **Order Management**: Complete order lifecycle tracking
- ✅ **Coupon System**: Discount codes and promotional offers

### Backend & Infrastructure

- ✅ **Rate Limiting**: Supports 200 concurrent users with sliding window algorithm
- ✅ **Caching**: In-memory cache with ETag support for efficient API responses
- ✅ **Error Logging**: Winston-based logging system with multiple transports
- ✅ **Firebase Integration**: Firestore, Storage, and Authentication
- ✅ **Error Tracking**: Sentry integration for production monitoring
- ✅ **Service Layer**: Centralized API abstraction with no mocks

### Frontend & UI

- ✅ **Error Boundaries**: Comprehensive error handling for 404, 500, and 401 errors
- ✅ **Authentication**: Secure login/register with role-based access control
- ✅ **Responsive Design**: Mobile-first Tailwind CSS design
- ✅ **Modern UI**: Gradient backgrounds, smooth transitions, loading states
- ✅ **Media Upload**: Image and video upload with Firebase Storage
- ✅ **Viewing History**: Track and display user's product viewing history

## 📁 Project Structure

```
justforview.in/
├── src/
│   ├── app/                           # Next.js App Router (Pages & Routes)
│   │   ├── api/                       # API Routes
│   │   │   ├── lib/firebase/         # Firebase Admin & Client SDK
│   │   │   ├── middleware/           # Rate limiting, caching, logging
│   │   │   ├── auth/                 # Authentication endpoints
│   │   │   ├── auctions/             # Auction management endpoints
│   │   │   ├── products/             # Product CRUD endpoints
│   │   │   ├── cart/                 # Shopping cart endpoints
│   │   │   ├── orders/               # Order processing endpoints
│   │   │   └── health/               # Health check endpoint
│   │   ├── auctions/                 # Auction pages & details
│   │   ├── products/                 # Product listing & details
│   │   ├── seller/                   # Seller dashboard
│   │   ├── admin/                    # Admin panel
│   │   ├── cart/                     # Shopping cart page
│   │   ├── checkout/                 # Checkout flow
│   │   ├── user/                     # User profile & settings
│   │   ├── login/                    # Login page
│   │   ├── register/                 # Registration page
│   │   ├── unauthorized/             # 401 error page
│   │   ├── not-found.tsx             # 404 error page
│   │   ├── error.tsx                 # Error boundary
│   │   ├── global-error.tsx          # Global error boundary
│   │   └── layout.tsx                # Root layout with header/footer
│   ├── components/                   # React Components
│   │   ├── admin/                    # Admin-specific components
│   │   ├── auction/                  # Auction components (bidding, timer)
│   │   ├── auth/                     # Auth components (AuthGuard, login forms)
│   │   ├── cart/                     # Shopping cart components
│   │   ├── checkout/                 # Checkout flow components
│   │   ├── product/                  # Product display components
│   │   ├── seller/                   # Seller dashboard components
│   │   ├── shop/                     # Shop/vendor components
│   │   ├── layout/                   # Layout components (Header, Footer, Nav)
│   │   └── common/                   # Shared UI components
│   ├── services/                     # API Service Layer (NO MOCKS)
│   │   ├── api.service.ts            # Base HTTP client
│   │   ├── auth.service.ts           # Authentication service
│   │   ├── auctions.service.ts       # Auction operations
│   │   ├── products.service.ts       # Product operations
│   │   ├── cart.service.ts           # Cart operations
│   │   ├── orders.service.ts         # Order operations
│   │   └── media.service.ts          # Media upload/management
│   ├── hooks/                        # Custom React Hooks
│   │   ├── useAuctionSocket.ts       # Real-time auction updates
│   │   ├── useCart.ts                # Shopping cart state
│   │   ├── useMediaUpload.ts         # File upload handling
│   │   └── useViewingHistory.ts      # Product view tracking
│   ├── contexts/                     # React Context Providers
│   │   ├── AuthContext.tsx           # Global auth state
│   │   └── UploadContext.tsx         # Upload queue state
│   ├── lib/                          # Utility Libraries
│   │   ├── socket-server.ts          # Socket.IO server setup
│   │   ├── auction-scheduler.ts      # Automated auction timing
│   │   ├── rbac.ts                   # Role-based access control
│   │   ├── formatters.ts             # Date, currency formatters
│   │   └── utils.ts                  # General utilities
│   ├── types/                        # TypeScript Type Definitions
│   └── constants/                    # App Constants & Config
├── scripts/                          # Utility Scripts
│   ├── test-api.js                   # API endpoint testing
│   ├── test-auction-automation.js    # Auction system tests
│   └── load-test.js                  # Performance testing
├── logs/                             # Application Logs
├── public/                           # Static Assets
├── .env.example                      # Environment variables template
├── firebase.json                     # Firebase configuration
├── server.js                         # Custom Next.js server
├── README.md                         # This file
├── AI-AGENT-GUIDE.md                 # AI Agent development guide
└── package.json
```

## 🛠️ Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Variables

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Fill in your Firebase and Sentry credentials:

```env
# Firebase Admin SDK (Backend)
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@your-project-id.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour Key\n-----END PRIVATE KEY-----\n"

# Firebase Client SDK (Frontend)
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id

# Sentry (Error Tracking)
NEXT_PUBLIC_SENTRY_DSN=your-sentry-dsn
SENTRY_AUTH_TOKEN=your-sentry-auth-token

# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

### 3. Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select existing
3. Enable Authentication > Email/Password
4. Create Firestore Database with rules from `firestore.rules`
5. Enable Firebase Storage with rules from `storage.rules`
6. Create indexes from `firestore.indexes.json`
7. Generate service account key:
   - Go to Project Settings > Service Accounts
   - Click "Generate New Private Key"
   - Copy credentials to `.env.local`

### 4. Firebase Collections Setup

Create these Firestore collections:

- `users` - User profiles
- `products` - Product listings
- `auctions` - Auction items
- `bids` - Bid history
- `orders` - Order records
- `carts` - Shopping carts
- `shops` - Seller shops
- `categories` - Product categories
- `coupons` - Discount codes

### 5. Run Development Server

```bash
npm run dev
```

The application will start on [http://localhost:3000](http://localhost:3000)

Socket.IO server will run on the same port for real-time features.

## 📚 API Quick Reference

### Authentication

#### Register

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"securePassword123","name":"John Doe"}'
```

#### Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"securePassword123"}'
```

### Auctions

#### Get Active Auctions

```bash
curl http://localhost:3000/api/auctions?status=active
```

#### Place Bid

```bash
curl -X POST http://localhost:3000/api/auctions/[id]/bids \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"amount":1000}'
```

### Products

#### Search Products

```bash
curl "http://localhost:3000/api/products?search=laptop&category=electronics"
```

#### Get Product Details

```bash
curl http://localhost:3000/api/products/[id]
```

### Cart

#### Add to Cart

```bash
curl -X POST http://localhost:3000/api/cart \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"productId":"abc123","quantity":1}'
```

### Health Check

```bash
curl http://localhost:3000/api/health
```

## 🔒 Authentication & Security

### Authentication Flow

1. User submits credentials via `/login` or `/register` page
2. Request goes through middleware (rate limiting, logging)
3. Backend verifies credentials with Firebase Authentication
4. Custom token is generated and returned with user data
5. Token and user profile stored in localStorage
6. `AuthContext` provides global auth state
7. `AuthGuard` component protects authenticated routes
8. `apiService` automatically adds token to all API requests

### Role-Based Access Control (RBAC)

- **admin**: Full system access, manage users, products, auctions
- **seller**: Create/manage products, shops, and auctions
- **user**: Browse, bid, purchase, manage orders
- **guest**: Browse public content only

### Protected Routes

Use `AuthGuard` component to protect pages:

```tsx
<AuthGuard requireAuth={true} allowedRoles={["seller", "admin"]}>
  <SellerDashboard />
</AuthGuard>
```

## 🛡️ Error Handling

### UI Error Boundaries

- **`error.tsx`**: Catches errors in app routes
- **`global-error.tsx`**: Catches errors in root layout
- **`not-found.tsx`**: Custom 404 page
- **`unauthorized/page.tsx`**: Custom 401 page

### API Error Responses

All API errors follow this format:

```json
{
  "error": "Error type",
  "message": "Detailed error message"
}
```

Common status codes:

- `400`: Bad Request (validation errors)
- `401`: Unauthorized (invalid credentials)
- `403`: Forbidden (insufficient permissions)
- `404`: Not Found
- `429`: Too Many Requests (rate limit exceeded)
- `500`: Internal Server Error

## 🧪 Testing

### Automated Test Scripts

```bash
# Test all API endpoints
node scripts/test-api.js

# Test auction automation system
node scripts/test-auction-automation.js

# Test authentication flow
node scripts/test-session-auth.js

# Performance/Load testing
node scripts/load-test.js
```

### Manual API Testing

```bash
# Health check
curl http://localhost:3000/api/health

# Register new user
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"password123","name":"Test User"}'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"password123"}'

# Get active auctions
curl http://localhost:3000/api/auctions?status=active
```

### Test Rate Limiting (PowerShell)

```powershell
# Send 250 requests to test rate limiter (200 req/min limit)
1..250 | ForEach-Object {
  Invoke-WebRequest -Uri "http://localhost:3000/api/health" -Method GET
  Write-Host "Request $_"
}
# Should receive 429 (Too Many Requests) after 200 requests
```

### Test Real-time Auctions

1. Open multiple browser tabs to an active auction
2. Place bids from different tabs
3. Observe real-time updates across all tabs
4. Check bid history updates instantly

## 📦 Production Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Docker

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## 🔧 Configuration

### Rate Limiting

Edit `src/app/api/middleware/ratelimiter.ts`:

```typescript
const config = {
  maxRequests: 200, // Max requests per window
  windowMs: 60000, // Time window in milliseconds (1 min)
};
```

### Caching

Edit `src/app/api/middleware/cache.ts`:

```typescript
const config = {
  ttl: 300000, // Cache TTL in milliseconds (5 min)
};
```

### Logging

Edit `src/app/api/middleware/logger.ts`:

```typescript
level: process.env.LOG_LEVEL || "debug", // Log level
  logger.add(new winston.transports.Console());
```

### Auction Settings

Edit `src/lib/auction-scheduler.ts`:

```typescript
const config = {
  checkInterval: 60000, // Check for auctions every 1 min
  notifyBefore: 300000, // Notify 5 min before auction ends
  autoEndGracePeriod: 5000, // Grace period after auction end
};
```

### Socket.IO Configuration

Edit `src/lib/socket-server.ts`:

```typescript
const io = new Server(server, {
  cors: { origin: "*" },
  pingTimeout: 60000,
  pingInterval: 25000,
});
```

## 🎨 Development Guide

### Architecture Principles

- **Service Layer**: All API calls through services (no direct fetch in components)
- **No Mocks**: Real APIs only, services connect to actual backend
- **Server/Client Split**: Server Components by default, "use client" for interactivity
- **Type Safety**: Comprehensive TypeScript types for all data structures

### Adding New Features

1. **Define Types** in `src/types/`
2. **Create Service** in `src/services/` for API calls
3. **Build Components** in appropriate `src/components/` folder
4. **Add Routes** in `src/app/` following App Router pattern
5. **Add API Endpoints** in `src/app/api/` if needed

### Styling with Tailwind

All pages use Tailwind CSS with custom configuration:

- **Colors**: See `constants/colors.ts` for theme colors
- **Breakpoints**: Mobile-first responsive design
- **Components**: Reusable patterns in `src/components/common/`

### Adding Protected Routes

```tsx
import AuthGuard from "@/components/auth/AuthGuard";

export default function ProtectedPage() {
  return (
    <AuthGuard requireAuth={true} allowedRoles={["seller", "admin"]}>
      <YourComponent />
    </AuthGuard>
  );
}
```

### Creating Custom Hooks

```tsx
// src/hooks/useCustomHook.ts
import { useState, useEffect } from "react";
import { someService } from "@/services/some.service";

export function useCustomHook() {
  const [data, setData] = useState(null);

  useEffect(() => {
    someService.getData().then(setData);
  }, []);

  return { data };
}
```

### Adding New Services

```typescript
// src/services/new-feature.service.ts
import { apiService } from "./api.service";

class NewFeatureService {
  async getData() {
    return apiService.get("/api/new-feature");
  }

  async createData(payload: any) {
    return apiService.post("/api/new-feature", payload);
  }
}

export const newFeatureService = new NewFeatureService();
```

## 📊 Monitoring & Observability

### Log Files

- `logs/error.log` - Error-level logs only
- `logs/api.log` - API request/response logs
- `logs/combined.log` - All application logs

### Production Monitoring

```bash
# Run production monitoring script
node scripts/monitor-production.js

# Configure Sentry alerts
node scripts/configure-sentry-alerts.js
```

### Rate Limit Headers

Check these headers in API responses:

- `X-RateLimit-Limit` - Maximum requests allowed
- `X-RateLimit-Remaining` - Requests remaining in window
- `X-RateLimit-Reset` - Timestamp when limit resets

### Error Tracking (Sentry)

- **Client Errors**: Tracked in browser via `sentry.client.config.ts`
- **Server Errors**: Tracked in API routes via `sentry.server.config.ts`
- **Edge Errors**: Tracked in edge functions via `sentry.edge.config.ts`

### Performance Metrics

- Page load times tracked with Next.js analytics
- API response times logged in `logs/api.log`
- Real-time auction performance monitored via Socket.IO events

### Health Checks

```bash
# Check application health
curl http://localhost:3000/api/health

# Check Firebase connection
curl http://localhost:3000/api/health/firebase

# Check Socket.IO server
curl http://localhost:3000/socket.io/
```

## 🚀 Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import project in Vercel dashboard
3. Add environment variables from `.env.local`
4. Deploy

### Custom Server Deployment

```bash
# Build the application
npm run build

# Start production server (uses server.js)
npm start
```

### Docker Deployment

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

### Firebase Hosting

```bash
# Deploy to Firebase
firebase deploy
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Follow existing code patterns and architecture
4. Test changes: `npm run build` and run test scripts
5. Commit changes: `git commit -m 'Add amazing feature'`
6. Push to branch: `git push origin feature/amazing-feature`
7. Open Pull Request with detailed description

### Development Guidelines

- Read existing code before making changes
- Use the service layer for all API calls
- Add TypeScript types for new features
- Write clear, concise commit messages
- Test thoroughly before submitting PR
- Follow the patterns in `AI-AGENT-GUIDE.md`

## � Additional Resources

- **[AI-AGENT-GUIDE.md](./AI-AGENT-GUIDE.md)** - Comprehensive guide for AI-assisted development
- [Next.js Documentation](https://nextjs.org/docs) - Next.js framework
- [Firebase Documentation](https://firebase.google.com/docs) - Firebase services
- [Tailwind CSS](https://tailwindcss.com/docs) - Utility-first CSS
- [Socket.IO Documentation](https://socket.io/docs/v4/) - Real-time communication
- [TypeScript Handbook](https://www.typescriptlang.org/docs/) - TypeScript language

## 📧 Support

- **Email**: support@justforview.in
- **Issues**: Open a GitHub issue for bugs or feature requests
- **Documentation**: Check `AI-AGENT-GUIDE.md` for development help

## 📝 License

This project is proprietary software. All rights reserved.

---

**Built with ❤️ for the Indian auction market**
