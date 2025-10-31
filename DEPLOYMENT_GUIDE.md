# 🚀 Deployment Guide for HobbiesSpot

Complete guide to deploy your Next.js + Socket.io application to production.

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Setup](#environment-setup)
3. [Vercel Deployment (Recommended)](#vercel-deployment)
4. [Render.com Setup (Socket.io Server)](#rendercom-setup)
5. [Firebase Configuration](#firebase-configuration)
6. [Domain Setup](#domain-setup)
7. [Post-Deployment Checklist](#post-deployment-checklist)
8. [Troubleshooting](#troubleshooting)

---

## 🎯 Prerequisites

Before deploying, ensure you have:

- [ ] **Node.js** 18.x or higher installed
- [ ] **Git** repository with your code
- [ ] **Vercel Account** (free tier available)
- [ ] **Render.com Account** (for Socket.io - free tier available)
- [ ] **Firebase Project** set up
- [ ] **Domain Name** (hobbiesspot.com) with DNS access
- [ ] **Razorpay Account** (for payments)

---

## 🔐 Environment Setup

### 1. Create Production Environment File

Create `.env.production` in your project root:

```bash
# ===========================================
# APP CONFIGURATION
# ===========================================
NEXT_PUBLIC_APP_URL=https://hobbiesspot.com
NEXT_PUBLIC_API_URL=/api
NODE_ENV=production

# ===========================================
# FIREBASE CLIENT (Public)
# ===========================================
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyCL2eA6_wFSMcyel9pxntnVOm7SFh2iWTM
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=justforview1.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=justforview1
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=justforview1.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=995821948299
NEXT_PUBLIC_FIREBASE_APP_ID=1:995821948299:web:38d1decb11eca69c7d738e
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-4BLN02DGVX

# ===========================================
# FIREBASE ADMIN SDK (Server-side ONLY)
# ===========================================
FIREBASE_ADMIN_PROJECT_ID=justforview1
FIREBASE_ADMIN_CLIENT_EMAIL=firebase-adminsdk-xxxxx@justforview1.iam.gserviceaccount.com
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_ACTUAL_PRIVATE_KEY\n-----END PRIVATE KEY-----\n"

# ===========================================
# AUTHENTICATION
# ===========================================
JWT_SECRET=your_secure_jwt_secret_at_least_32_characters_long
JWT_EXPIRES_IN=7d

# ===========================================
# PAYMENT GATEWAY (Razorpay)
# ===========================================
RAZORPAY_KEY_ID=rzp_live_your_live_key_id
RAZORPAY_KEY_SECRET=your_live_razorpay_secret
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_live_your_live_key_id

# ===========================================
# SOCKET.IO SERVER
# ===========================================
NEXT_PUBLIC_SOCKET_URL=https://hobbiesspot-socket.onrender.com

# ===========================================
# ALLOWED ORIGINS (CORS)
# ===========================================
ALLOWED_ORIGINS=https://hobbiesspot.com,https://www.hobbiesspot.com,https://*.vercel.app

# ===========================================
# FEATURE FLAGS
# ===========================================
NEXT_PUBLIC_ENABLE_ANALYTICS=true
NEXT_PUBLIC_ENABLE_SENTRY=false
NEXT_PUBLIC_MAINTENANCE_MODE=false
```

### 2. Security Checklist

- [ ] **Never commit** `.env.production` or `.env.local` to Git
- [ ] Add `.env*.local` to `.gitignore`
- [ ] Generate a strong JWT_SECRET: `openssl rand -base64 32`
- [ ] Use **production** Razorpay keys (not test keys)
- [ ] Download Firebase Admin SDK from Firebase Console
- [ ] Keep all secrets in environment variables

---

## 🌐 Vercel Deployment

Vercel is perfect for Next.js applications with automatic deployments.

### Step 1: Install Vercel CLI

```powershell
npm install -g vercel
```

### Step 2: Login to Vercel

```powershell
vercel login
```

### Step 3: Link Your Project

```powershell
# From your project root
vercel link
```

Follow the prompts:

- **Set up and deploy?** → Yes
- **Scope:** → Select your account
- **Link to existing project?** → No (first time)
- **Project name:** → `hobbiesspot`
- **Directory:** → `./` (current directory)

### Step 4: Add Environment Variables

#### Option A: Using Vercel Dashboard (Recommended)

1. Go to https://vercel.com/dashboard
2. Select your project → **Settings** → **Environment Variables**
3. Add all variables from `.env.production` one by one
4. Set environment: **Production**, **Preview**, and **Development**

#### Option B: Using Vercel CLI

```powershell
# Add variables one by one
vercel env add NEXT_PUBLIC_APP_URL production
# Enter value: https://hobbiesspot.com

vercel env add JWT_SECRET production
# Enter value: your_secret_here

# Or use the sync script
npm run vercel:env-sync
```

### Step 5: Deploy to Production

```powershell
# Deploy to production
npm run deploy

# Or use Vercel CLI directly
vercel --prod
```

### Step 6: Configure Custom Domain

1. Go to **Project Settings** → **Domains**
2. Add domain: `hobbiesspot.com`
3. Add domain: `www.hobbiesspot.com`
4. Follow DNS configuration instructions (see [Domain Setup](#domain-setup))

### Automatic Deployments

Vercel automatically deploys when you push to Git:

- **Production**: Pushes to `main` branch → `hobbiesspot.com`
- **Preview**: Pushes to other branches → `branch-name.vercel.app`
- **Pull Requests**: Automatic preview deployments

---

## 🔌 Render.com Setup

Render.com will host your Socket.io server separately.

### Step 1: Create New Web Service

1. Go to https://render.com/dashboard
2. Click **New** → **Web Service**
3. Connect your GitHub repository
4. Configure:

**Basic Settings:**

- **Name**: `hobbiesspot-socket`
- **Region**: Choose closest to your users
- **Branch**: `main`
- **Root Directory**: Leave empty
- **Runtime**: `Node`
- **Build Command**: `npm install`
- **Start Command**: `node server.js`

**Instance:**

- **Free** (for testing) or **Starter $7/month** (for always-on)

### Step 2: Add Environment Variables

In Render dashboard, add these environment variables:

```
NODE_ENV=production
ALLOWED_ORIGINS=https://hobbiesspot.com,https://www.hobbiesspot.com,https://*.vercel.app
PORT=10000
```

Add all other required env vars from your `.env.production`

### Step 3: Deploy

1. Click **Create Web Service**
2. Wait for deployment (5-10 minutes first time)
3. Note your service URL: `https://hobbiesspot-socket.onrender.com`

### Step 4: Update Vercel Environment

Add the Render URL to your Vercel environment:

```powershell
vercel env add NEXT_PUBLIC_SOCKET_URL production
# Value: https://hobbiesspot-socket.onrender.com
```

Redeploy Vercel: `vercel --prod`

---

## 🔥 Firebase Configuration

### Step 1: Verify Firebase Project

1. Go to https://console.firebase.google.com
2. Select project: `justforview1`
3. Verify services are enabled:
   - ✅ Authentication (Email/Password)
   - ✅ Firestore Database
   - ✅ Storage

### Step 2: Configure Authentication

**Settings** → **Authentication** → **Sign-in method**:

- Enable **Email/Password**
- Authorized domains:
  - `hobbiesspot.com`
  - `www.hobbiesspot.com`
  - Your Vercel domain

### Step 3: Update Firestore Rules

Deploy security rules:

```powershell
firebase deploy --only firestore:rules
```

### Step 4: Update Storage Rules

Deploy storage rules:

```powershell
firebase deploy --only storage:rules
```

### Step 5: Configure CORS for Storage

Create `cors.json`:

```json
[
  {
    "origin": ["https://hobbiesspot.com", "https://www.hobbiesspot.com"],
    "method": ["GET", "HEAD", "PUT", "POST", "DELETE"],
    "maxAgeSeconds": 3600
  }
]
```

Apply CORS:

```powershell
gsutil cors set cors.json gs://justforview1.firebasestorage.app
```

### Step 6: Download Service Account Key

1. **Firebase Console** → **Project Settings** → **Service Accounts**
2. Click **Generate New Private Key**
3. Save the JSON file securely
4. Copy the values to your environment variables:
   - `FIREBASE_ADMIN_PROJECT_ID`
   - `FIREBASE_ADMIN_CLIENT_EMAIL`
   - `FIREBASE_ADMIN_PRIVATE_KEY` (include the `\n` characters)

---

## 🌍 Domain Setup

### Configure DNS for hobbiesspot.com

Add these DNS records at your domain registrar:

#### For Vercel (Next.js App):

| Type  | Name | Value                |
| ----- | ---- | -------------------- |
| A     | @    | 76.76.21.21          |
| CNAME | www  | cname.vercel-dns.com |

#### Verify in Vercel:

1. **Project Settings** → **Domains**
2. Wait for SSL certificate (automatic, 1-2 minutes)
3. Test: https://hobbiesspot.com

### SSL/HTTPS

- **Vercel**: Automatic SSL via Let's Encrypt ✅
- **Render**: Automatic SSL via Let's Encrypt ✅
- No manual configuration needed!

---

## ✅ Post-Deployment Checklist

### Functionality Tests

- [ ] **Homepage loads**: https://hobbiesspot.com
- [ ] **Authentication works**: Sign up, login, logout
- [ ] **Products display**: Category pages, product details
- [ ] **Search works**: Try searching for "beyblade"
- [ ] **Shopping cart**: Add items, update quantities
- [ ] **Checkout flow**: Test order placement
- [ ] **Image uploads**: Test product image uploads
- [ ] **Real-time features**: Test Socket.io connection
- [ ] **Payment gateway**: Test Razorpay integration (use test mode first)

### SEO & Performance

- [ ] **Sitemap accessible**: https://hobbiesspot.com/sitemap.xml
- [ ] **Robots.txt accessible**: https://hobbiesspot.com/robots.txt
- [ ] **Meta tags**: Check with https://metatags.io
- [ ] **Open Graph**: Test with https://developers.facebook.com/tools/debug
- [ ] **Twitter Cards**: Test with https://cards-dev.twitter.com/validator
- [ ] **Google Search Console**: Submit sitemap
- [ ] **Google Analytics**: Verify tracking (if enabled)
- [ ] **Page speed**: Test with https://pagespeed.web.dev
- [ ] **Lighthouse score**: Run in Chrome DevTools

### Security

- [ ] **HTTPS enabled**: No mixed content warnings
- [ ] **Security headers**: Check with https://securityheaders.com
- [ ] **Firebase rules**: Verify they're restrictive
- [ ] **API endpoints**: Test authorization
- [ ] **CORS configured**: Only allowed origins
- [ ] **Secrets secure**: No exposed API keys in client code
- [ ] **Rate limiting**: Test API rate limits

### Monitoring

- [ ] **Vercel Analytics**: Enable in dashboard
- [ ] **Error tracking**: Check Vercel logs
- [ ] **Render logs**: Monitor Socket.io server
- [ ] **Firebase usage**: Check quota usage
- [ ] **Uptime monitoring**: Use UptimeRobot or similar

---

## 🐛 Troubleshooting

### Build Fails on Vercel

**Error: TypeScript errors**

```
Solution: Your next.config.js has ignoreBuildErrors: true
This allows builds with TS errors, but fix them for production!
```

**Error: Out of memory**

```powershell
# In Vercel dashboard, increase Node.js memory:
# Settings → General → Node.js Version → 18.x
# Build & Development Settings → Environment Variables
# Add: NODE_OPTIONS=--max_old_space_size=4096
```

### Socket.io Connection Issues

**Error: Socket disconnects immediately**

```javascript
// Check CORS in server.js
// Ensure ALLOWED_ORIGINS includes your domain
ALLOWED_ORIGINS=https://hobbiesspot.com
```

**Error: 503 Service Unavailable**

```
Render free tier sleeps after 15 minutes of inactivity.
Solution: Upgrade to Starter plan ($7/month) for always-on.
Or: Implement wake-up ping from client side.
```

### Firebase Authentication Errors

**Error: "auth/unauthorized-domain"**

```
Solution:
1. Firebase Console → Authentication → Settings
2. Add hobbiesspot.com to Authorized Domains
```

**Error: CORS errors on Storage**

```powershell
# Apply CORS configuration
gsutil cors set cors.json gs://justforview1.firebasestorage.app
```

### Payment Integration Issues

**Error: Razorpay test mode in production**

```
Solution: Update to live keys
RAZORPAY_KEY_ID=rzp_live_xxx (not rzp_test_xxx)
```

### Environment Variables Not Working

```powershell
# Redeploy after adding env vars
vercel --prod --force

# Verify env vars are set
vercel env ls
```

### Cache Issues

```powershell
# Clear build cache on Vercel
# Dashboard → Deployments → ⋯ → Redeploy
# Check "Clear build cache"
```

---

## 📊 Monitoring & Maintenance

### Regular Tasks

**Daily:**

- Check error logs in Vercel
- Monitor Firebase quota
- Review order/payment status

**Weekly:**

- Review Lighthouse scores
- Check Search Console for errors
- Update dependencies if needed

**Monthly:**

- Security audit
- Backup Firebase data
- Review and optimize costs

### Useful Commands

```powershell
# Check deployment status
vercel ls

# View logs
vercel logs hobbiesspot --follow

# Rollback to previous deployment
vercel rollback

# Run production build locally
npm run build && npm start

# Check for dependency updates
npm outdated
```

---

## 🎉 Success Criteria

Your deployment is successful when:

✅ All pages load with HTTPS
✅ Authentication works correctly
✅ Products display and search works
✅ Shopping cart and checkout functional
✅ Real-time features working
✅ SEO metadata visible in page source
✅ No console errors
✅ Lighthouse score > 90
✅ Domain properly configured
✅ SSL certificates valid

---

## 📞 Support Resources

- **Vercel Documentation**: https://vercel.com/docs
- **Render Documentation**: https://render.com/docs
- **Firebase Documentation**: https://firebase.google.com/docs
- **Next.js Documentation**: https://nextjs.org/docs
- **Razorpay Documentation**: https://razorpay.com/docs

---

**Last Updated**: October 31, 2025
**Application**: HobbiesSpot (hobbiesspot.com)
**Stack**: Next.js 16 + Firebase + Socket.io
