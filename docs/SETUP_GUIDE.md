# JustForView E-commerce Store

A modern, full-featured e-commerce platform built with Next.js 14, Firebase, TypeScript, and independent API architecture.

## 🚀 Features

### Core Features

- ✅ **Server-Side Authentication** - Secure JWT-based authentication with HTTP-only cookies
- ✅ **Independent API Layer** - RESTful API that can be used by web, mobile, or any client
- ✅ **Product Management** - Full CRUD operations with images, variants, and inventory
- ✅ **Shopping Cart** - Real-time cart management
- ✅ **Order Management** - Complete order lifecycle with status tracking
- ✅ **Auction System** - Live bidding with auto-bid functionality
- ✅ **User Reviews & Ratings** - Product reviews with verification
- ✅ **Payment Integration** - Razorpay payment gateway
- ✅ **Shipping Integration** - Shiprocket API for logistics
- ✅ **SEO Optimized** - Next.js App Router with metadata API
- ✅ **Admin Dashboard** - Product and order management
- ✅ **Rate Limiting** - API protection
- ✅ **Type Safety** - Full TypeScript coverage with Zod validation

### Technical Highlights

- **Next.js 14** with App Router
- **Firebase Admin SDK** for server-side operations
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **Zod** for schema validation
- **Axios** for API requests
- **JWT** for authentication
- **bcrypt** for password hashing

## 📁 Project Structure

```
justforview.in/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # API Routes (Backend)
│   │   │   ├── auth/         # Authentication endpoints
│   │   │   ├── products/     # Product endpoints
│   │   │   ├── orders/       # Order endpoints
│   │   │   ├── cart/         # Cart endpoints
│   │   │   ├── auctions/     # Auction endpoints
│   │   │   ├── payment/      # Payment endpoints
│   │   │   └── shipping/     # Shipping endpoints
│   │   ├── (pages)/          # Frontend pages
│   │   └── layout.tsx        # Root layout
│   ├── components/            # React components
│   ├── lib/                   # Utility libraries
│   │   ├── api/              # API services
│   │   │   ├── client.ts     # API client
│   │   │   ├── index.ts      # API hooks
│   │   │   └── services/     # Business logic
│   │   ├── auth/             # Authentication
│   │   │   ├── jwt.ts        # JWT utilities
│   │   │   └── middleware.ts # Auth middleware
│   │   ├── firebase/         # Firebase config
│   │   │   └── admin.ts      # Admin SDK (server-only)
│   │   └── validations/      # Zod schemas
│   ├── types/                 # TypeScript types
│   └── utils/                 # Helper functions
├── .env.example              # Environment variables template
├── API_DOCUMENTATION.md      # Complete API docs
├── package.json
├── tsconfig.json
├── next.config.js
└── tailwind.config.js
```

## 🔧 Setup Instructions

### Prerequisites

- Node.js 18+
- npm or yarn
- Firebase project
- Razorpay account
- Shiprocket account

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd justforview.in
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Copy `.env.example` to `.env` and fill in all values:

```bash
cp .env.example .env
```

Required environment variables:

#### Firebase Admin (Server-side)

```env
FIREBASE_ADMIN_PROJECT_ID=your_project_id
FIREBASE_ADMIN_CLIENT_EMAIL=your_service_account_email
FIREBASE_ADMIN_PRIVATE_KEY="your_private_key"
```

To get Firebase Admin credentials:

1. Go to Firebase Console → Project Settings → Service Accounts
2. Click "Generate New Private Key"
3. Copy the values from the downloaded JSON file

#### Firebase Client (Public)

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

#### JWT Secret

```env
JWT_SECRET=your_super_secret_key_at_least_32_characters_long
```

Generate a secure secret:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

#### Razorpay

```env
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxxxx
RAZORPAY_KEY_SECRET=your_secret_key
```

#### Shiprocket

```env
SHIPROCKET_EMAIL=your_email
SHIPROCKET_PASSWORD=your_password
```

### 4. Set up Firebase

1. Create a new Firebase project
2. Enable Firestore Database
3. Enable Authentication (Email/Password)
4. Enable Storage
5. Set up Firestore security rules (see below)

#### Firestore Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection
    match /users/{userId} {
      allow read: if request.auth != null && request.auth.uid == userId;
      allow write: if request.auth != null && request.auth.uid == userId;
    }

    // Products collection (public read, admin write)
    match /products/{productId} {
      allow read: if true;
      allow write: if request.auth != null && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }

    // Orders collection
    match /orders/{orderId} {
      allow read: if request.auth != null &&
        (resource.data.userId == request.auth.uid ||
         get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin');
      allow create: if request.auth != null;
      allow update: if request.auth != null &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
  }
}
```

### 5. Run the development server

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

The API will be available at `http://localhost:3000/api`

### 6. Create your first admin user

After registration, manually update the user's role in Firestore:

1. Go to Firebase Console → Firestore
2. Find your user document in the `users` collection
3. Add/update the `role` field to `"admin"`

## 📱 Using the API

### From the Web UI

The web UI automatically uses the API through the provided hooks:

```typescript
import { authApi, productsApi } from "@/lib/api";

// Login
const { user, token } = await authApi.login({
  email: "user@example.com",
  password: "password",
});

// Get products
const products = await productsApi.getAll({ page: 1 });
```

### From a Mobile App

```typescript
// Login
const response = await fetch("https://your-domain.com/api/auth/login", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ email, password }),
});

const { data } = await response.json();
const token = data.token;

// Use token for authenticated requests
const productsResponse = await fetch("https://your-domain.com/api/products", {
  headers: { Authorization: `Bearer ${token}` },
});
```

See [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) for complete API reference.

## 🔐 Security Features

1. **Server-Side Authentication**: All auth logic runs on the server
2. **JWT Tokens**: Secure token generation with configurable expiration
3. **HTTP-Only Cookies**: Tokens stored securely (web)
4. **Password Hashing**: bcrypt with 12 rounds
5. **Request Validation**: Zod schema validation on all inputs
6. **Rate Limiting**: Protection against API abuse
7. **CORS Configuration**: Control cross-origin access
8. **Environment Variables**: Sensitive data never exposed to client

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in Vercel
3. Add all environment variables
4. Deploy

### Other Platforms

Works on any platform that supports Next.js:

- Netlify
- AWS Amplify
- Railway
- Render
- Self-hosted

## 📚 Documentation

- [API Documentation](./API_DOCUMENTATION.md) - Complete API reference
- [Firebase Setup](./docs/firebase-setup.md) - Detailed Firebase configuration
- [Deployment Guide](./docs/deployment.md) - Production deployment steps

## 🛠️ Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run type checking
npm run type-check

# Run linter
npm run lint
```

## 📝 Environment Variables

See `.env.example` for all required environment variables.

**Important**: Never commit your `.env` file!

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

For issues and questions:

1. Check the [API Documentation](./API_DOCUMENTATION.md)
2. Review existing GitHub issues
3. Create a new issue with detailed information

## 🎯 Roadmap

- [ ] Real-time notifications
- [ ] Wishlist functionality
- [ ] Advanced search with Algolia
- [ ] Email notifications
- [ ] SMS notifications
- [ ] Multi-language support
- [ ] PWA support
- [ ] Advanced analytics dashboard
- [ ] Coupon system
- [ ] Loyalty points
- [ ] Social login
- [ ] Product comparison
- [ ] Recently viewed products

## 🔗 Useful Links

- [Next.js Documentation](https://nextjs.org/docs)
- [Firebase Documentation](https://firebase.google.com/docs)
- [Razorpay Documentation](https://razorpay.com/docs/)
- [Shiprocket Documentation](https://apidocs.shiprocket.in/)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
