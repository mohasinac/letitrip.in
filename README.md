# JustForView E-commerce Platform

## 📖 Overview

**JustForView** is a modern, enterprise-grade e-commerce platform with **comprehensive authentication** and **role-based access control** built for scalability and security.

### 🎯 Key Features

- ✅ **Enhanced Authentication System** - JWT cookies with claims-based authorization
- ✅ **Role-Based Access Control (RBAC)** - Admin, Seller, Customer roles with granular permissions
- ✅ **Cookie Consent & GDPR Compliance** - Full consent management with storage preferences
- ✅ **Server-Side Security** - HTTP-only cookies, CSRF protection, secure session management
- ✅ **Independent RESTful API** - Multi-platform ready architecture
- ✅ **Full TypeScript** - Type-safe throughout with enhanced type definitions
- ✅ **Product Management** - Full CRUD with inventory tracking
- ✅ **Auction System** - Live bidding with auto-bid functionality
- ✅ **Payment Integration** - Razorpay integration
- ✅ **Shipping Integration** - Shiprocket API
- ✅ **SEO Optimized** - Next.js App Router with dynamic metadata

## 🚦 Quick Start

```bash
# Clone the repository
git clone <your-repo-url>
cd justforview.in

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env.local
# Fill in your Firebase, Razorpay, and other API keys

# Initialize Firebase (if needed)
npm run firebase:init

# Run development server
npm run dev

# Visit http://localhost:3000
```

## 🌐 Live Demo

**Production URL:** https://justforview-f7msczfiv-mohasin-ahamed-chinnapattans-projects.vercel.app

### Test Accounts
- **Customer:** customer@example.com / password123
- **Seller:** seller@example.com / password123  
- **Admin:** admin@example.com / password123

## 📚 Documentation

All documentation has been organized in the `docs/` folder:
- **Setup Guide** - Complete installation and configuration
- **API Documentation** - Comprehensive API reference
- **Authentication Guide** - Enhanced auth system details
- **Deployment Guide** - Production deployment instructions

## 🏗️ Architecture

```
Client → Enhanced Auth Context → JWT Middleware → API Routes → Services → Firebase/External APIs
                ↓
        Cookie Consent & RBAC → Role-Based Access Control → Secure Session Management
```

### Project Structure

```
src/
├── app/
│   ├── api/                    # API Routes (Backend)
│   ├── (auth)/                 # Authentication pages
│   ├── admin/                  # Admin dashboard
│   └── seller/                 # Seller dashboard
├── components/
│   ├── auth/                   # Auth components (RoleGuard, CookieConsent)
│   ├── admin/                  # Admin-specific components
│   └── seller/                 # Seller-specific components
├── contexts/
│   └── AuthContext.tsx         # Enhanced authentication context
├── hooks/
│   └── useEnhancedAuth.ts      # Comprehensive auth hook
├── lib/
│   ├── api/services/           # Business logic services
│   ├── auth/                   # JWT, roles, middleware
│   ├── firebase/               # Firebase Admin SDK
│   └── validations/            # Zod schemas
└── types/                      # TypeScript definitions
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
import { useEnhancedAuth } from '@/hooks/useEnhancedAuth';

function MyComponent() {
  const { 
    user, 
    isAuthenticated, 
    hasPermission, 
    hasRole,
    login,
    logout 
  } = useEnhancedAuth();

  if (hasRole('admin')) {
    return <AdminDashboard />;
  }

  if (hasPermission('products', 'create')) {
    return <CreateProduct />;
  }

  return <CustomerView />;
}
```

### Role-Based Access Control

```typescript
import { RoleGuard } from '@/components/auth/RoleGuard';

<RoleGuard roles={['admin', 'seller']} permissions={[{ resource: 'products', action: 'manage' }]}>
  <ProductManagement />
</RoleGuard>
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
- **Current Branch**: `auth-part-2`
- **Deployment**: Production-ready on Vercel
- **Test Coverage**: Authentication system fully tested
- **Documentation**: Organized in `docs/` folder

## �📄 License

MIT License

---

**Built with ❤️ for modern e-commerce needs**
