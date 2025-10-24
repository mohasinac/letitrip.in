# JustForView E-commerce Platform

## 📖 Overview

**JustForView** is a modern, enterprise-grade e-commerce platform with comprehensive authentication, role-based access control, and database-driven architecture built for scalability and security.

---

## 🎯 Key Features

✅ **Enhanced Authentication** - JWT cookies with claims-based authorization  
✅ **Role-Based Access Control** - Admin, Seller, Customer with granular permissions  
✅ **Database-Driven** - All data from Firestore (no mock data)  
✅ **Product Management** - Full CRUD with inventory tracking  
✅ **Auction System** - Live bidding with auto-bid functionality  
✅ **Payment Integration** - Razorpay integration  
✅ **Shipping Integration** - Shiprocket API  
✅ **Review Filters** - Advanced filtering by rating, category, seller rating, verified purchases  
✅ **Seller Dashboard** - Complete seller interface with analytics  
✅ **Cookie Consent & GDPR** - Full consent management  
✅ **Server-Side Security** - HTTP-only cookies, CSRF protection  
✅ **Full TypeScript** - Type-safe throughout  
✅ **SEO Optimized** - Next.js App Router with dynamic metadata

---

## � Quick Start

```bash
# Clone and install
git clone <your-repo-url>
cd justforview.in
npm install

# Setup environment
cp .env.example .env.local
# Fill in Firebase, Razorpay, and other API keys

# Development
npm run dev
# Visit http://localhost:3000

# Production build
npm run build
```

---

## 📊 Current Status

- **Branch**: `feature/dynamic-pages-implementation`
- **Build**: ✅ Passing (123 routes, 0 errors)
- **TypeScript**: ✅ 0 errors
- **Database**: ✅ Firestore with real data (no mock data)
- **Deployment**: ✅ Production-ready on Vercel

---

## 🧪 Latest Features

### Review Filters Enhancement

- 🔍 Full-text search in reviews
- ⭐ Filter by star rating (1-5)
- 📦 Filter by product category
- 🏆 Filter by seller rating
- ✅ Filter by verified purchases only
- 📊 Advanced sorting (recent, helpful, rating)

**Related Files:**

- `/src/app/reviews/page.tsx` - Enhanced UI with 5 filter types
- `/src/app/api/reviews/route.ts` - API with filter support

---

## 🏗️ Architecture

```
Client → Enhanced Auth Context → JWT Middleware → API Routes → Services → Firebase/External APIs
                ↓
        Cookie Consent & RBAC → Role-Based Access Control → Secure Session Management
```

### Project Structure

```
justforview.in/
├── scripts/                    # Build and deployment scripts
│   ├── build-static.js
│   ├── fix-api-routes.js
│   ├── init-firebase.js
│   └── setup-vercel-env.js
├── src/
│   ├── app/
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── (auth)/             # Authentication pages
│   │   │   ├── forgot-password/
│   │   │   ├── login/
│   │   │   └── register/
│   │   ├── (shop)/             # Shop pages
│   │   │   └── products/
│   │   ├── admin/              # Admin dashboard
│   │   │   ├── categories/
│   │   │   ├── coupons/
│   │   │   ├── dashboard/
│   │   │   ├── orders/
│   │   │   └── products/
│   │   ├── seller/             # Seller dashboard
│   │   │   ├── deals/
│   │   │   ├── orders/
│   │   │   ├── products/
│   │   │   └── dashboard/
│   │   ├── api/                # API Routes (Backend)
│   │   │   ├── auth/
│   │   │   ├── admin/
│   │   │   ├── products/
│   │   │   ├── orders/
│   │   │   ├── payment/
│   │   │   └── shipping/
│   │   ├── auctions/           # Auction system
│   │   ├── cart/               # Shopping cart
│   │   ├── checkout/           # Checkout process
│   │   ├── profile/            # User profile
│   │   ├── orders/             # Order management
│   │   ├── wishlist/           # User wishlist
│   │   └── [other pages]/      # Additional pages
│   ├── components/
│   │   ├── admin/              # Admin components
│   │   ├── auth/               # Auth components
│   │   │   ├── RoleGuard.tsx
│   │   │   └── CookieConsent.tsx
│   │   ├── categories/         # Category components
│   │   ├── layout/             # Layout components
│   │   │   ├── Header.tsx
│   │   │   ├── Footer.tsx
│   │   │   └── Sidebar.tsx
│   │   ├── products/           # Product components
│   │   ├── seller/             # Seller components
│   │   │   └── SellerSidebar.tsx
│   │   └── ui/                 # UI components
│   ├── contexts/
│   │   ├── AuthContext.tsx     # Enhanced authentication
│   │   ├── CartContext.tsx     # Shopping cart state
│   │   └── CategoriesContext.tsx
│   ├── hooks/
│   │   ├── useEnhancedAuth.ts  # Auth hook
│   │   ├── useAuthRedirect.ts  # Auth redirects
│   │   ├── useCategories.ts    # Categories hook
│   │   ├── useFirebase.ts      # Firebase hook
│   │   └── useProducts.ts      # Products hook
│   ├── lib/
│   │   ├── api/                # API services
│   │   ├── auth/               # JWT, roles, middleware
│   │   │   ├── jwt.ts
│   │   │   ├── roles.ts
│   │   │   └── middleware.ts
│   │   ├── config/             # Configuration
│   │   │   ├── firebase.ts
│   │   │   └── payment.ts
│   │   ├── firebase/           # Firebase services
│   │   │   ├── admin.ts
│   │   │   └── client.ts
│   │   ├── services/           # Business logic
│   │   │   ├── auth.service.ts
│   │   │   ├── product.service.ts
│   │   │   ├── razorpay.ts
│   │   │   └── shiprocket.ts
│   │   ├── storage/            # Storage utilities
│   │   ├── utils/              # Utility functions
│   │   └── validations/        # Zod schemas
│   └── types/
│       └── index.ts            # TypeScript definitions
├── firebase.json               # Firebase configuration
├── vercel.json                 # Vercel deployment config
├── next.config.js              # Next.js configuration
├── tailwind.config.js          # Tailwind CSS config
└── package.json                # Dependencies
```

## 🔐 Enhanced Security Features

### Authentication & Authorization

- **JWT Cookies**: HTTP-only cookies with secure flags
- **Claims-Based Auth**: Rich user claims with permissions
- **Role-Based Access Control**: Admin, Seller, Customer roles
- **Session Management**: Secure session handling with automatic refresh
- **Password Security**: bcrypt hashing (12 rounds)

### Privacy & Compliance

- **Cookie Consent**: GDPR-compliant consent management
- **Storage Preferences**: Granular storage permissions
- **Data Protection**: Secure data handling with user consent
- **Fallback Storage**: localStorage fallback when cookies disabled

### Security Measures

- **CSRF Protection**: Cross-site request forgery prevention
- **Secure Redirects**: Safe redirect handling
- **Input Validation**: Comprehensive Zod schema validation
- **Rate Limiting**: API endpoint protection
- **Error Handling**: Secure error responses

## 📱 Using the Enhanced Authentication

### React Components

```typescript
import { useEnhancedAuth } from "@/hooks/useEnhancedAuth";

function MyComponent() {
  const { user, isAuthenticated, hasPermission, hasRole, login, logout } =
    useEnhancedAuth();

  if (hasRole("admin")) {
    return <AdminDashboard />;
  }

  if (hasPermission("products", "create")) {
    return <CreateProduct />;
  }

  return <CustomerView />;
}
```

### Role-Based Access Control

```typescript
import { RoleGuard } from "@/components/auth/RoleGuard";

<RoleGuard
  roles={["admin", "seller"]}
  permissions={[{ resource: "products", action: "manage" }]}
>
  <ProductManagement />
</RoleGuard>;
```

### API Usage

```bash
# Login (sets HTTP-only cookie)
curl -X POST https://yoursite.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password"}'

# Subsequent requests use cookies automatically
curl -X GET https://yoursite.com/api/user/profile \
  -H "Cookie: auth-token=<cookie-value>"
```

## 🌟 Tech Stack

### Frontend

- **Next.js 16.0.0** - React framework with App Router
- **React 19** - Latest React with concurrent features
- **TypeScript 5.6** - Full type safety
- **Tailwind CSS** - Utility-first styling

### Backend & Database

- **Firebase Firestore** - NoSQL database
- **Firebase Authentication** - User management
- **Firebase Storage** - File storage
- **Firebase Admin SDK** - Server-side operations

### Authentication & Security

- **JWT (jsonwebtoken)** - Token-based authentication
- **bcryptjs** - Password hashing
- **HTTP-only cookies** - Secure token storage
- **Zod** - Runtime validation

### Integrations

- **Razorpay** - Payment processing
- **Shiprocket** - Shipping management
- **Vercel** - Hosting and deployment

## � Recent Updates

### Authentication Enhancement (auth-part-2)

- ✅ Complete authentication system overhaul
- ✅ JWT cookies with claims-based authorization
- ✅ Role-based access control (RBAC)
- ✅ Cookie consent & GDPR compliance
- ✅ Enhanced security measures
- ✅ Comprehensive session management

### Development Status

- **Current Branch**: `feature/dynamic-pages-implementation`
- **Deployment**: Production-ready on Vercel
- **Test Coverage**: Authentication system fully tested

## �📄 License

MIT License

---

**Built with ❤️ for modern e-commerce needs**
