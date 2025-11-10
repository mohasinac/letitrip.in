# Letitrip.in - Complete Setup Guide

## 🎯 Overview

Letitrip.in is deployed on **Vercel** with Firebase as the backend database. This guide covers the complete setup process.

---

## ✅ Current Configuration

### Domain & URLs

- **Production Domain**: https://letitrip.in
- **API Endpoint**: https://letitrip.in/api
- **Firebase Project**: letitrip-in-app

### Environment Configuration

All environment variables are configured in:

- `.env.local` - Local development
- `.env.production` - Production template for Vercel
- `.env.local.example` - Public template

### Site Constants

Centralized configuration in `src/constants/site.ts`:

- Site name, domain, URLs
- Business information
- Feature flags
- Application settings

---

## 📋 Setup Instructions

### Step 1: Local Development Setup

```powershell
# Clone the repository
git clone https://github.com/mohasinac/letitrip.in
cd letitrip.in

# Install dependencies
npm install

# Environment is already configured in .env.local
# Start development server
npm run dev
```

Open http://localhost:3000 to verify the application works.

### Step 2: Firebase Setup (Rules Only)

We only need to deploy Firebase security rules, not host on Firebase.

```powershell
# Install Firebase CLI (if not installed)
npm install -g firebase-tools

# Login to Firebase
firebase login

# Set the project
firebase use letitrip-in-app

# Deploy security rules only
npm run setup:firebase-rules
```

This deploys:

- ✅ Firestore security rules
- ✅ Firestore indexes
- ✅ Storage security rules
- ✅ Realtime Database rules

### Step 3: Enable Firebase Services

Go to [Firebase Console](https://console.firebase.google.com/project/letitrip-in-app):

1. **Authentication**

   - Enable Email/Password provider
   - (Optional) Enable Google Sign-in

2. **Firestore Database**

   - Verify rules are deployed
   - Check indexes are created

3. **Storage**

   - Verify rules are deployed
   - Confirm bucket exists

4. **Realtime Database**
   - Verify rules are deployed

### Step 4: Vercel Deployment

#### Option A: Vercel Dashboard (Recommended)

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Import project from GitHub: `mohasinac/letitrip.in`
3. Configure settings:

   - Framework: Next.js
   - Root Directory: `./`
   - Build Command: `npm run build`
   - Domain: `letitrip.in` (already configured)

4. Add Environment Variables:

```bash
# Copy all variables from .env.production and set them in Vercel
# Go to: Project Settings → Environment Variables

# Firebase Admin (Backend)
FIREBASE_PROJECT_ID=letitrip-in-app
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-fbsvc@letitrip-in-app.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY=[Your private key from .env.production]
FIREBASE_STORAGE_BUCKET=letitrip-in-app.firebasestorage.app

# Firebase Client (Frontend)
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyDKu0X3g26L0wMdAO1pZaO5VXSMUe7eA4c
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=letitrip-in-app.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=letitrip-in-app
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=letitrip-in-app.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=949266230223
NEXT_PUBLIC_FIREBASE_APP_ID=1:949266230223:web:cd24c9a606509cec5f00ba
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-VJM46P2595
NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://letitrip-in-app-default-rtdb.asia-southeast1.firebasedatabase.app

# Site Configuration
NEXT_PUBLIC_API_URL=https://letitrip.in/api
NEXT_PUBLIC_SITE_URL=https://letitrip.in
NEXT_PUBLIC_SITE_NAME=Letitrip
NEXT_PUBLIC_DOMAIN=letitrip.in

# Session Configuration
SESSION_SECRET=OFOjb2nFD7HAXoQqb4kotFiv/PCL2ioleP8laJdp7ho=

# Coupon Configuration
COUPON_CODE_LENGTH=8
COUPON_CODE_PREFIX=LT

# Feature Flags
NEXT_PUBLIC_ENABLE_ANALYTICS=true
```

5. Click "Deploy"

#### Option B: Vercel CLI

```powershell
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Link project
vercel link

# Add environment variables using the helper
npm run setup:vercel

# Deploy to production
vercel --prod
```

---

## 🔧 Configuration Files

### Environment Files

- `.env.local` - Local development (gitignored)
- `.env.production` - Production template
- `.env.local.example` - Public template

### Firebase Configuration

- `firebase.json` - Firebase project configuration
- `firestore.rules` - Firestore security rules
- `firestore.indexes.json` - Firestore indexes
- `storage.rules` - Storage security rules
- `database.rules.json` - Realtime Database rules

### Vercel Configuration

- `vercel.json` - Vercel deployment settings
- Optimized for Mumbai region (bom1)
- Security headers configured

### Site Constants

- `src/constants/site.ts` - Centralized site configuration
  - Domain: letitrip.in
  - Site name: Letitrip
  - Contact email: support@letitrip.in
  - Coupon prefix: LT
  - All URLs and settings

---

## 🧪 Testing

### Local Testing

```powershell
npm run dev
# Test at http://localhost:3000
```

### Production Testing

After deployment to https://letitrip.in:

1. **Authentication**

   - Register new account
   - Login/Logout
   - Password reset

2. **Firestore**

   - Create product
   - View in Firebase Console

3. **Storage**

   - Upload product image
   - Verify in Storage bucket

4. **Real-time Features**
   - Test auction bidding
   - Verify Socket.IO connection

---

## 🔐 Security

### Protected Files (Gitignored)

- `.env.local`
- `.env.production`
- `*firebase*adminsdk*.json`
- `.firebase/`
- All log files

### Firebase Security

- ✅ Firestore rules deployed
- ✅ Storage rules deployed
- ✅ Database rules deployed
- ✅ Service account secured

### Vercel Security

- ✅ Environment variables encrypted
- ✅ HTTPS enforced
- ✅ Security headers configured
- ✅ Mumbai region for India users

---

## 📊 Post-Deployment

### 1. Create Admin User

```
Firebase Console → Authentication → Add User
Then in Firestore → users collection:
{
  "email": "admin@letitrip.in",
  "role": "admin",
  "displayName": "Admin",
  "created_at": [timestamp]
}
```

### 2. Verify Domain

- Go to Vercel → Your Project → Domains
- Confirm `letitrip.in` is active
- Verify SSL certificate is issued

### 3. Test All Features

- User registration/login
- Product creation
- Image uploads
- Auction bidding
- Order processing
- Payment integration

### 4. Set Up Monitoring

- Vercel Analytics
- Firebase Usage Monitoring
- Error tracking (if using Sentry)

---

## 🚀 Deployment Workflow

### Regular Deployments

```powershell
# Push to GitHub
git add .
git commit -m "Your changes"
git push origin main

# Vercel auto-deploys from GitHub
# View deployment at https://vercel.com/dashboard
```

### Update Firebase Rules

```powershell
# After modifying firestore.rules, storage.rules, etc.
npm run setup:firebase-rules
```

---

## 📚 Important Links

- **Production**: https://letitrip.in
- **Repository**: https://github.com/mohasinac/letitrip.in
- **Firebase Console**: https://console.firebase.google.com/project/letitrip-in-app
- **Vercel Dashboard**: https://vercel.com/dashboard

---

## 🛠️ Available Scripts

```json
{
  "dev": "Start local development server",
  "build": "Build for production",
  "start": "Start production server",
  "setup:vercel": "Get Vercel environment setup commands",
  "setup:firebase-rules": "Deploy Firebase security rules only"
}
```

---

## 🎉 All Set!

Your Letitrip.in platform is configured and ready to deploy:

- ✅ Domain configured: letitrip.in
- ✅ Firebase project ready: letitrip-in-app
- ✅ Environment variables set
- ✅ Site constants centralized
- ✅ Security rules configured
- ✅ Vercel deployment ready

**Next Step**: Deploy to Vercel and go live! 🚀
