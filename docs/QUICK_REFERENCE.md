# Quick Reference Guide

## 🚀 Common Commands

```bash
# Development
npm run dev              # Start development server (http://localhost:3000)
npm run build            # Build for production
npm start                # Start production server
npm run type-check       # Check TypeScript types
npm run lint             # Run ESLint

# Testing API (examples using curl)
# Register
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123","name":"John Doe"}'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'

# Get Products (public)
curl http://localhost:3000/api/products
```

## 📁 Key Files

| File                             | Purpose                                |
| -------------------------------- | -------------------------------------- |
| `.env`                           | Environment variables (DO NOT COMMIT!) |
| `src/app/api/`                   | API route handlers                     |
| `src/lib/api/services/`          | Business logic                         |
| `src/lib/auth/jwt.ts`            | JWT utilities (server-only)            |
| `src/lib/auth/middleware.ts`     | Auth middleware                        |
| `src/lib/firebase/admin.ts`      | Firebase Admin SDK                     |
| `src/types/index.ts`             | TypeScript types                       |
| `src/lib/validations/schemas.ts` | Zod schemas                            |

## 🔐 Environment Variables Quick Setup

```bash
# Generate JWT secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Copy to .env
cp .env.example .env

# Edit .env with your values
```

Required variables:

- `FIREBASE_ADMIN_*` - From Firebase Console → Service Accounts
- `JWT_SECRET` - Generate with command above
- `NEXT_PUBLIC_RAZORPAY_KEY_ID` - From Razorpay Dashboard
- `RAZORPAY_KEY_SECRET` - From Razorpay Dashboard
- `SHIPROCKET_EMAIL` - Your Shiprocket email
- `SHIPROCKET_PASSWORD` - Your Shiprocket password

## 🛠️ API Endpoints Cheat Sheet

### Authentication

```
POST   /api/auth/register       # Register new user
POST   /api/auth/login          # Login user
POST   /api/auth/logout         # Logout user
GET    /api/auth/me             # Get current user (auth required)
PATCH  /api/auth/profile        # Update profile (auth required)
```

### Products

```
GET    /api/products            # Get all products (public)
POST   /api/products            # Create product (admin)
GET    /api/products/:id        # Get product by ID
PATCH  /api/products/:id        # Update product (admin)
DELETE /api/products/:id        # Delete product (admin)
```

### Cart

```
GET    /api/cart                # Get cart (auth required)
POST   /api/cart/items          # Add to cart (auth required)
PATCH  /api/cart/items/:id      # Update quantity (auth required)
DELETE /api/cart/items/:id      # Remove from cart (auth required)
```

### Orders

```
GET    /api/orders              # Get user orders (auth required)
POST   /api/orders              # Create order (auth required)
GET    /api/orders/:id          # Get order details (auth required)
```

### Auctions

```
GET    /api/auctions/active     # Get active auctions (public)
GET    /api/auctions/:id        # Get auction details (public)
POST   /api/auctions/:id/bids   # Place bid (auth required)
```

## 💻 Code Examples

### Using API from Frontend

```typescript
// Login
import { authApi } from "@/lib/api";

const { user, token } = await authApi.login({
  email: "user@example.com",
  password: "password123",
});

// Get products
import { productsApi } from "@/lib/api";

const products = await productsApi.getAll({
  category: "electronics",
  page: 1,
  pageSize: 20,
});

// Add to cart
import { cartApi } from "@/lib/api";

await cartApi.addItem("product_id", 2);
```

### Using API from Mobile

```typescript
// Login
const response = await fetch("https://yoursite.com/api/auth/login", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    email: "user@example.com",
    password: "password123",
  }),
});

const { data } = await response.json();
const token = data.token;

// Use token for authenticated requests
const products = await fetch("https://yoursite.com/api/products", {
  headers: {
    Authorization: `Bearer ${token}`,
  },
});
```

## 🔒 Protecting Routes

```typescript
// Require authentication
import { withAuth } from "@/lib/auth/middleware";

export const GET = withAuth(async (request, user) => {
  // user is authenticated
  return Response.json({ data: user });
});

// Require admin
import { withAdmin } from "@/lib/auth/middleware";

export const POST = withAdmin(async (request, user) => {
  // user is authenticated admin
  return Response.json({ message: "Admin only" });
});

// With rate limiting
import { withRateLimit } from "@/lib/auth/middleware";

export const GET = withRateLimit(async (request) => {
  // Rate limited
  return Response.json({ data: [] });
});
```

## 🎨 Creating New Service

```typescript
// src/lib/api/services/example.service.ts
import { getAdminDb } from "../../firebase/admin";

export class ExampleService {
  static async getData(id: string) {
    const db = getAdminDb();
    const doc = await db.collection("examples").doc(id).get();
    return doc.data();
  }

  static async createData(data: any) {
    const db = getAdminDb();
    const ref = db.collection("examples").doc();
    await ref.set({ ...data, createdAt: new Date().toISOString() });
    return ref.id;
  }
}
```

## 🧪 Testing

```bash
# Install testing tools (if needed)
npm install --save-dev jest @testing-library/react @testing-library/jest-dom

# Or use tools like:
# - Postman
# - Insomnia
# - Thunder Client (VS Code extension)
# - curl
```

## 🐛 Debugging

```typescript
// Enable debug logs
console.log("Debug info:", data);

// Check authentication
import { getCurrentUser } from "@/lib/auth/jwt";
const user = await getCurrentUser();
console.log("Current user:", user);

// Check Firebase connection
import { getAdminDb } from "@/lib/firebase/admin";
const db = getAdminDb();
const snapshot = await db.collection("users").limit(1).get();
console.log("Firebase connected:", !snapshot.empty);
```

## 📊 Firebase Firestore Structure

```
firestore/
├── users/
│   └── {userId}/
│       ├── email: string
│       ├── name: string
│       ├── role: 'user' | 'admin'
│       ├── passwordHash: string
│       ├── addresses: Address[]
│       └── createdAt: timestamp
├── products/
│   └── {productId}/
│       ├── name: string
│       ├── slug: string
│       ├── price: number
│       ├── quantity: number
│       ├── images: Image[]
│       └── status: string
├── orders/
│   └── {orderId}/
│       ├── userId: string
│       ├── items: OrderItem[]
│       ├── total: number
│       ├── status: string
│       └── createdAt: timestamp
└── auctions/
    └── {auctionId}/
        ├── productId: string
        ├── currentBid: number
        ├── endTime: timestamp
        └── bids: Bid[]
```

## 🚀 Deployment Checklist

- [ ] Set all environment variables
- [ ] Configure Firebase project
- [ ] Set up Firestore security rules
- [ ] Enable Firebase Authentication
- [ ] Set up Razorpay account
- [ ] Set up Shiprocket account
- [ ] Test API endpoints
- [ ] Create first admin user
- [ ] Configure CORS if needed
- [ ] Set up monitoring/logging
- [ ] Configure rate limiting
- [ ] Review security settings

## 📞 Quick Help

| Issue            | Solution                         |
| ---------------- | -------------------------------- |
| Module not found | Run `npm install`                |
| Firebase errors  | Check `.env` credentials         |
| JWT errors       | Ensure `JWT_SECRET` is 32+ chars |
| CORS errors      | Configure in `next.config.js`    |
| Type errors      | Run `npm run type-check`         |
| Port in use      | Change port or kill process      |

## 📚 Documentation Links

- [Setup Guide](./SETUP_GUIDE.md)
- [API Documentation](./API_DOCUMENTATION.md)
- [Project Summary](./PROJECT_SUMMARY.md)
- [Firebase Docs](https://firebase.google.com/docs)
- [Next.js Docs](https://nextjs.org/docs)
- [Razorpay Docs](https://razorpay.com/docs/)
- [Shiprocket Docs](https://apidocs.shiprocket.in/)

---

**Pro Tip**: Bookmark this file for quick reference during development!
