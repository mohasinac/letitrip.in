# Environment Setup & Configuration Guide

**Last Updated**: November 18, 2025

Complete guide for setting up environment variables and configuration for JustForView.in.

---

## 📋 Table of Contents

- [Prerequisites](#prerequisites)
- [Environment Variables](#environment-variables)
- [Firebase Setup](#firebase-setup)
- [Vercel Setup](#vercel-setup)
- [Local Development](#local-development)
- [Production Deployment](#production-deployment)

---

## ✅ Prerequisites

### Required Accounts

1. **Firebase Account** (FREE tier)

   - Visit: https://console.firebase.google.com
   - Create new project

2. **Vercel Account** (optional, FREE tier)

   - Visit: https://vercel.com
   - Connect GitHub account

3. **Payment Gateways** (optional for testing)
   - Razorpay: https://razorpay.com
   - PayPal: https://developer.paypal.com

### Required Software

- **Node.js**: 20+ (LTS)
- **npm**: 10+
- **Git**: Latest version

---

## 🔐 Environment Variables

### Overview

Two environment files:

- `.env.local` - Local development (NOT committed to Git)
- `.env.production` - Production (Vercel environment variables)

### Required Variables

Create `.env.local` in project root:

```bash
# ======================================
# FIREBASE ADMIN SDK (Backend)
# ======================================
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour-Private-Key-Here\n-----END PRIVATE KEY-----\n"

# ======================================
# FIREBASE CLIENT SDK (Frontend)
# ======================================
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789012
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789012:web:abcdef123456
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://your-project-default-rtdb.firebaseio.com

# ======================================
# APPLICATION
# ======================================
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
NEXT_PUBLIC_APP_URL=http://localhost:3000

# ======================================
# OPTIONAL - PAYMENT GATEWAYS
# ======================================
# Razorpay
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_XXXXXXXXXXXX
RAZORPAY_KEY_SECRET=your_razorpay_secret

# PayPal
NEXT_PUBLIC_PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_CLIENT_SECRET=your_paypal_secret

# ======================================
# OPTIONAL - NOTIFICATIONS
# ======================================
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/your-webhook-url
```

### Variable Descriptions

#### Firebase Admin SDK (Required)

**Where to Get**:

1. Firebase Console → Project Settings
2. Service Accounts tab
3. Generate New Private Key button
4. Download JSON file

**Extract from JSON**:

```json
{
  "project_id": "your-project-id", // → FIREBASE_PROJECT_ID
  "client_email": "firebase-adminsdk@...", // → FIREBASE_CLIENT_EMAIL
  "private_key": "-----BEGIN PRIVATE KEY-----..." // → FIREBASE_PRIVATE_KEY
}
```

**IMPORTANT**: For `FIREBASE_PRIVATE_KEY`, replace actual newlines with `\n`:

```bash
# Correct format (wrapped in quotes, \n for newlines)
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQE...\n-----END PRIVATE KEY-----\n"
```

#### Firebase Client SDK (Required)

**Where to Get**:

1. Firebase Console → Project Settings
2. General tab
3. Your apps section → Web app
4. Firebase SDK snippet → Config

**Copy values from config object**:

```javascript
const firebaseConfig = {
  apiKey: "AIza...", // → NEXT_PUBLIC_FIREBASE_API_KEY
  authDomain: "...", // → NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
  projectId: "...", // → NEXT_PUBLIC_FIREBASE_PROJECT_ID
  storageBucket: "...", // → NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
  messagingSenderId: "...", // → NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
  appId: "...", // → NEXT_PUBLIC_FIREBASE_APP_ID
  measurementId: "...", // → NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};
```

**Realtime Database URL**:

1. Firebase Console → Realtime Database
2. Copy database URL (looks like: `https://your-project-default-rtdb.firebaseio.com`)
3. Set as `NEXT_PUBLIC_FIREBASE_DATABASE_URL`

#### JWT Secret (Required)

Generate a secure random string:

```bash
# Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Using OpenSSL
openssl rand -hex 32
```

#### Payment Gateways (Optional)

**Razorpay** (Indian market):

1. Sign up at https://razorpay.com
2. Dashboard → Settings → API Keys
3. Generate Test/Live keys

**PayPal** (International):

1. Sign up at https://developer.paypal.com
2. Create App
3. Copy Client ID and Secret

#### Discord Webhook (Optional)

For team notifications:

1. Discord Server → Server Settings
2. Integrations → Webhooks → New Webhook
3. Copy Webhook URL

---

## 🔥 Firebase Setup

### Step 1: Create Firebase Project

1. Go to https://console.firebase.google.com
2. Click "Add project"
3. Enter project name (e.g., "justforview-prod")
4. Disable Google Analytics (optional)
5. Click "Create project"

### Step 2: Enable Authentication

1. Firebase Console → Authentication
2. Get Started
3. Sign-in method tab
4. Enable providers:
   - **Email/Password** (Required)
   - **Google** (Optional)
   - **Phone** (Optional)

### Step 3: Create Firestore Database

1. Firebase Console → Firestore Database
2. Create database
3. Start in **test mode** (for development)
4. Choose location: `asia-south1` (Mumbai) for India

**Important**: Update security rules after setup (see Deployment Guide).

### Step 4: Enable Storage

1. Firebase Console → Storage
2. Get Started
3. Start in **test mode** (for development)
4. Choose same location as Firestore

**Important**: Update security rules after setup (see Deployment Guide).

### Step 5: Create Realtime Database

1. Firebase Console → Realtime Database
2. Create Database
3. Start in **test mode** (for development)
4. Choose same location as Firestore

### Step 6: Get Service Account

1. Firebase Console → Project Settings → Service Accounts
2. Click "Generate New Private Key"
3. Save JSON file securely (DON'T commit to Git)
4. Extract values for environment variables

### Step 7: Get Web App Config

1. Firebase Console → Project Settings → General
2. Your apps → Add app → Web
3. Register app
4. Copy Firebase SDK configuration
5. Add to environment variables

---

## ☁️ Vercel Setup

### Step 1: Install Vercel CLI

```bash
npm install -g vercel
```

### Step 2: Login

```bash
vercel login
```

### Step 3: Link Project

```bash
cd justforview.in
vercel link
```

### Step 4: Set Environment Variables

**Option A: Using Vercel Dashboard**

1. Vercel Dashboard → Your Project
2. Settings → Environment Variables
3. Add each variable from `.env.local`
4. Select "Production", "Preview", and "Development" as needed

**Option B: Using Vercel CLI**

```bash
# Single variable
vercel env add FIREBASE_PROJECT_ID

# From .env.local (use provided script)
npm run sync:vercel-env
```

### Step 5: Deploy

```bash
# Preview deployment
vercel

# Production deployment
vercel --prod
```

---

## 💻 Local Development

### Step 1: Clone Repository

```bash
git clone https://github.com/mohasinac/justforview.in.git
cd justforview.in
```

### Step 2: Install Dependencies

```bash
npm install
```

### Step 3: Create Environment File

```bash
cp .env.example .env.local
```

Edit `.env.local` with your values (see Environment Variables section above).

### Step 4: Start Development Server

```bash
npm run dev
```

Open http://localhost:3000 in your browser.

### Step 5: Verify Setup

**Check Firebase Connection**:

- Try registering a new user
- Check Firebase Authentication console for new user

**Check Database**:

- Browse categories (should load from Firestore)
- Check Firestore console for data

**Check Storage**:

- Try uploading a product image
- Check Firebase Storage console for uploaded files

---

## 🚀 Production Deployment

### Pre-Deployment Checklist

- ✅ All environment variables set in Vercel
- ✅ Firebase Security Rules configured
- ✅ Firebase Indexes created
- ✅ Payment gateways configured (if used)
- ✅ Production domain configured
- ✅ SSL certificate enabled (automatic with Vercel)

### Firebase Security Rules

**Firestore Rules** (`firestore.rules`):

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth.uid == userId;
    }

    // Products collection
    match /products/{productId} {
      allow read: if true;
      allow write: if request.auth != null &&
                     (request.auth.token.role == 'seller' ||
                      request.auth.token.role == 'admin');
    }

    // Add more rules for other collections
  }
}
```

**Storage Rules** (`storage.rules`):

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /product-images/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null &&
                     (request.auth.token.role == 'seller' ||
                      request.auth.token.role == 'admin');
    }

    // Add more rules for other paths
  }
}
```

**Realtime Database Rules** (Firebase Console):

```json
{
  "rules": {
    "auctions": {
      "$auctionId": {
        ".read": true,
        ".write": "auth != null",
        "bids": {
          ".indexOn": ["timestamp"]
        }
      }
    }
  }
}
```

### Deploy Rules & Indexes

```bash
# Deploy Firestore rules
firebase deploy --only firestore:rules

# Deploy Firestore indexes
firebase deploy --only firestore:indexes

# Deploy Storage rules
firebase deploy --only storage

# Deploy Realtime Database rules
firebase deploy --only database

# Deploy all
firebase deploy
```

### Deploy to Vercel

```bash
# Using CLI
vercel --prod

# Or push to main branch (auto-deploy if connected to GitHub)
git push origin main
```

### Post-Deployment Verification

1. **Test Authentication**: Register and login
2. **Test Database**: Browse products, create test product (as seller)
3. **Test Storage**: Upload images
4. **Test Payments**: Create test order (use test mode)
5. **Test Real-time**: Place bid on auction
6. **Check Logs**: Monitor for errors

---

## 🔧 Troubleshooting

### Common Issues

**1. Firebase Admin SDK Authentication Failed**

```
Error: Firebase Admin SDK initialization failed
```

**Solution**:

- Verify `FIREBASE_PRIVATE_KEY` format (must have `\n` for newlines)
- Ensure private key is wrapped in quotes
- Check service account has proper permissions

**2. Firebase Client SDK Initialization Failed**

```
Error: Firebase configuration invalid
```

**Solution**:

- Verify all `NEXT_PUBLIC_FIREBASE_*` variables are set
- Check values match Firebase Console exactly
- Restart dev server after changing .env.local

**3. CORS Errors**

```
Access to fetch blocked by CORS policy
```

**Solution**:

- Ensure `NEXT_PUBLIC_APP_URL` matches your domain
- Check Firebase Auth authorized domains (Firebase Console → Authentication → Settings)

**4. Storage Upload Failed**

```
Error: Insufficient permissions
```

**Solution**:

- Check Firebase Storage rules
- Verify user is authenticated
- Ensure user has correct role

**5. Vercel Deployment Failed**

```
Error: Build failed
```

**Solution**:

- Check Vercel build logs
- Verify all environment variables are set
- Run `npm run build` locally to catch errors

---

## 📚 Additional Resources

- [Deployment Guide](DEPLOYMENT-GUIDE.md)
- [Firebase Functions Setup](FIREBASE-FUNCTIONS.md)
- [Quick Start Guide](../getting-started/00-QUICK-START.md)
- [Common Issues](../guides/COMMON-ISSUES.md)

---

## 🔗 Useful Links

- **Firebase Console**: https://console.firebase.google.com
- **Vercel Dashboard**: https://vercel.com/dashboard
- **Firebase Documentation**: https://firebase.google.com/docs
- **Next.js Documentation**: https://nextjs.org/docs

---

**Last Updated**: November 18, 2025
