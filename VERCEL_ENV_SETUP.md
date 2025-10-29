# Vercel Environment Variables Setup Guide

This document explains how to configure environment variables in Vercel for the JustForView.in project.

## How to Add Environment Variables in Vercel

### Method 1: Via Vercel Dashboard

1. Go to your project on Vercel: https://vercel.com/dashboard
2. Select your project: `justforview-in`
3. Go to **Settings** → **Environment Variables**
4. Add each variable listed below
5. Select which environments (Production, Preview, Development) should have access to each variable

### Method 2: Via Vercel CLI

```bash
# Set a production environment variable
vercel env add VARIABLE_NAME production

# Set for all environments
vercel env add VARIABLE_NAME production preview development
```

### Method 3: Via vercel.json (Not Recommended for Secrets)

Only use this for non-sensitive configuration. Never commit secrets to git!

## Required Environment Variables

### 🔥 Firebase Client (Public - Safe to expose)

```bash
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyCL2eA6_wFSMcyel9pxntnVOm7SFh2iWTM
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=justforview1.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=justforview1
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=justforview1.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=995821948299
NEXT_PUBLIC_FIREBASE_APP_ID=1:995821948299:web:38d1decb11eca69c7d738e
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-4BLN02DGVX
```

**Environments**: Production, Preview, Development

### 🔐 Firebase Admin SDK (Server-side ONLY - CRITICAL!)

```bash
FIREBASE_ADMIN_PROJECT_ID=justforview1
FIREBASE_ADMIN_CLIENT_EMAIL=firebase-adminsdk-xxxxx@justforview1.iam.gserviceaccount.com
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

**Environments**: Production, Preview, Development

**⚠️ IMPORTANT**:

- Get these from Firebase Console → Project Settings → Service Accounts → Generate New Private Key
- The private key must include `\n` for newlines and be wrapped in quotes
- Keep these values SECRET - never commit to git!

### 🌐 App Configuration

```bash
NEXT_PUBLIC_APP_URL=https://justforview.in
NEXT_PUBLIC_API_URL=/api
```

**Environments**:

- Production: Use your production domain
- Preview: Use `https://${VERCEL_URL}`
- Development: Use `http://localhost:3000`

### 🔑 Authentication

```bash
JWT_SECRET=your_jwt_secret_minimum_32_characters_long
JWT_EXPIRES_IN=7d
```

**Environments**: Production, Preview, Development

**How to generate JWT_SECRET**:

```bash
# Generate a secure random string
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 💳 Payment Gateway (Razorpay)

```bash
RAZORPAY_KEY_ID=rzp_live_xxxxxxxxxx
RAZORPAY_KEY_SECRET=your_secret_key
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_live_xxxxxxxxxx
```

**Environments**:

- Production: Use live keys (`rzp_live_`)
- Preview/Development: Use test keys (`rzp_test_`)

**Get from**: Razorpay Dashboard → Settings → API Keys

### 📦 Shipping (Shiprocket) - Optional

```bash
SHIPROCKET_BASE_URL=https://apiv2.shiprocket.in/v1
SHIPROCKET_EMAIL=your_email@example.com
SHIPROCKET_PASSWORD=your_password
SHIPROCKET_CHANNEL_ID=your_channel_id
```

**Environments**: Production, Preview

### 🚩 Feature Flags - Optional

```bash
NEXT_PUBLIC_ENABLE_ANALYTICS=true
NEXT_PUBLIC_ENABLE_SENTRY=false
NEXT_PUBLIC_MAINTENANCE_MODE=false
```

**Environments**: Production, Preview, Development

## Automatic Vercel Variables

These are automatically set by Vercel (no action needed):

- `VERCEL=1`
- `VERCEL_ENV` (production, preview, or development)
- `VERCEL_URL` (deployment URL)
- `VERCEL_GIT_COMMIT_SHA`
- `NODE_ENV` (production in production/preview, development in development)

## Quick Setup Commands

### Using Vercel CLI

```bash
# Install Vercel CLI if not already installed
npm i -g vercel@latest

# Login to Vercel
vercel login

# Link your project
vercel link

# Add environment variables interactively
vercel env add NEXT_PUBLIC_FIREBASE_API_KEY production
vercel env add FIREBASE_ADMIN_PROJECT_ID production
vercel env add JWT_SECRET production
vercel env add RAZORPAY_KEY_ID production
# ... repeat for all required variables

# Or pull existing environment variables
vercel env pull .env.local
```

## Verification

After adding environment variables, verify they're set correctly:

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Check all required variables are present
3. Redeploy your application: `vercel --prod`
4. Check the deployment logs for any missing variable warnings

## Security Best Practices

✅ **DO**:

- Use different values for production, preview, and development
- Rotate secrets regularly
- Use test API keys in preview/development environments
- Store secrets in Vercel's encrypted environment variables

❌ **DON'T**:

- Commit `.env.local` or `.env.production` to git
- Share private keys publicly
- Use production credentials in development
- Expose server-side secrets with `NEXT_PUBLIC_` prefix

## Troubleshooting

### "Missing environment variable" error

1. Check variable name spelling (case-sensitive)
2. Verify variable is set for the correct environment (production/preview/development)
3. Redeploy after adding variables: `vercel --prod`

### Firebase Admin SDK not working

1. Ensure `FIREBASE_ADMIN_PRIVATE_KEY` includes `\n` for newlines
2. Wrap the entire key in double quotes
3. Example format:
   ```
   "-----BEGIN PRIVATE KEY-----\nMIIEvQIBAD...\n-----END PRIVATE KEY-----\n"
   ```

### Auth not persisting across pages

1. Check `JWT_SECRET` is set and consistent across all environments
2. Verify `NEXT_PUBLIC_API_URL` is correct
3. Ensure cookies are enabled in browser
4. Check Firebase persistence is set to `browserLocalPersistence`

## Support

For more help:

- Vercel Docs: https://vercel.com/docs/concepts/projects/environment-variables
- Firebase Docs: https://firebase.google.com/docs/admin/setup
- Project Issues: Open an issue in the repository
