# Deployment Guide - JustForView.in

**Production Deployment Checklist & Instructions**

Last Updated: November 8, 2025

---

## 📋 Table of Contents

1. [Pre-Deployment Checklist](#pre-deployment-checklist)
2. [Environment Setup](#environment-setup)
3. [Database Configuration](#database-configuration)
4. [Firebase Setup](#firebase-setup)
5. [Next.js Configuration](#nextjs-configuration)
6. [Security Hardening](#security-hardening)
7. [Performance Optimization](#performance-optimization)
8. [Deployment Steps](#deployment-steps)
9. [Post-Deployment](#post-deployment)
10. [Monitoring & Maintenance](#monitoring--maintenance)
11. [Rollback Procedure](#rollback-procedure)
12. [Troubleshooting](#troubleshooting)

---

## 🚀 Pre-Deployment Checklist

### Code Quality

- [ ] All tests pass (`npm test`)
- [ ] TypeScript compilation succeeds (`npm run build`)
- [ ] No console errors or warnings in production build
- [ ] Code linting passes (`npm run lint`)
- [ ] Security audit passes (`npm audit --production`)

### Documentation

- [ ] API documentation is up to date
- [ ] README.md reflects current state
- [ ] Environment variables documented
- [ ] Architecture diagrams updated

### Features

- [ ] All HIGH PRIORITY features complete (88%+ completion)
- [ ] Critical user flows tested (registration, login, checkout, bidding)
- [ ] Payment gateway tested with test credentials
- [ ] Email/SMS notifications tested
- [ ] Session authentication working

### Performance

- [ ] Lighthouse score > 90 for key pages
- [ ] Images optimized (WebP format, lazy loading)
- [ ] Bundle size analyzed (`npm run analyze`)
- [ ] API response times < 500ms (p95)

### Security

- [ ] All secrets moved to environment variables
- [ ] Firebase security rules configured
- [ ] Rate limiting implemented
- [ ] CORS configured properly
- [ ] Session secrets generated (strong, random)
- [ ] HTTPS enforced
- [ ] SQL injection / XSS protection verified

---

## 🔧 Environment Setup

### Required Environment Variables

Create a `.env.production` file with the following:

```bash
# ==========================================
# NODE ENVIRONMENT
# ==========================================
NODE_ENV=production
NEXT_PUBLIC_SITE_URL=https://justforview.in
NEXT_PUBLIC_API_URL=https://justforview.in/api

# ==========================================
# FIREBASE CONFIGURATION (Admin SDK)
# ==========================================
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project-id.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour-Private-Key-Here\n-----END PRIVATE KEY-----\n"
FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com

# ==========================================
# FIREBASE CLIENT CONFIG (Public)
# ==========================================
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789012
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789012:web:abcdef123456
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX

# ==========================================
# SESSION MANAGEMENT
# ==========================================
SESSION_SECRET=generate-a-strong-random-secret-min-32-chars
# Generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# ==========================================
# PAYMENT GATEWAY (Razorpay)
# ==========================================
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_live_xxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your_razorpay_secret_key

# ==========================================
# EMAIL SERVICE (Optional - SendGrid/SES)
# ==========================================
EMAIL_FROM=noreply@justforview.in
SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxx
# OR
AWS_SES_REGION=us-east-1
AWS_SES_ACCESS_KEY_ID=AKIAXXXXXXXXXXXXXXXX
AWS_SES_SECRET_ACCESS_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# ==========================================
# SMS SERVICE (Optional - Twilio/AWS SNS)
# ==========================================
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_PHONE_NUMBER=+1234567890

# ==========================================
# REDIS (Optional - for caching & rate limiting)
# ==========================================
REDIS_URL=redis://username:password@redis-host:6379

# ==========================================
# ERROR MONITORING (Optional - Sentry)
# ==========================================
NEXT_PUBLIC_SENTRY_DSN=https://xxxxxxxx@sentry.io/xxxxxxx
SENTRY_AUTH_TOKEN=your_sentry_auth_token
SENTRY_ORG=your-org
SENTRY_PROJECT=your-project

# ==========================================
# ANALYTICS (Optional)
# ==========================================
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
NEXT_PUBLIC_GOOGLE_TAG_MANAGER_ID=GTM-XXXXXXX

# ==========================================
# WEBSOCKET SERVER (for live auctions)
# ==========================================
NEXT_PUBLIC_SOCKET_URL=wss://justforview.in
SOCKET_PORT=3001
```

### Environment Variable Security

1. **Never commit `.env` files** to version control
2. **Use separate configs** for dev/staging/production
3. **Rotate secrets** every 90 days minimum
4. **Use secret management** (AWS Secrets Manager, Google Secret Manager)
5. **Validate environment** on app startup

---

## 🗄️ Database Configuration

### Firestore Production Setup

#### 1. Create Production Collections

Ensure these collections exist:

```
users/
shops/
products/
categories/
orders/
coupons/
auctions/
bids/
reviews/
cart/
addresses/
sessions/
favorites/
follows/
```

#### 2. Create Indexes

Run the Firestore index setup:

```bash
firebase deploy --only firestore:indexes
```

Required composite indexes (from `firestore.indexes.json`):

```json
{
  "indexes": [
    {
      "collectionGroup": "products",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "shop_id", "order": "ASCENDING" },
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "created_at", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "orders",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "customer_id", "order": "ASCENDING" },
        { "fieldPath": "created_at", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "auctions",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "end_time", "order": "ASCENDING" }
      ]
    },
    {
      "collectionGroup": "sessions",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "user_id", "order": "ASCENDING" },
        { "fieldPath": "expires_at", "order": "ASCENDING" }
      ]
    }
  ]
}
```

#### 3. Security Rules

Deploy production security rules:

```bash
firebase deploy --only firestore:rules
```

**Key Rules** (from `firestore.rules`):

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Helper functions
    function isAuthenticated() {
      return request.auth != null;
    }

    function isAdmin() {
      return isAuthenticated() &&
             get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }

    function isSeller() {
      return isAuthenticated() &&
             get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'seller';
    }

    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }

    // Users collection
    match /users/{userId} {
      allow read: if isAuthenticated();
      allow create: if isAuthenticated() && request.auth.uid == userId;
      allow update: if isOwner(userId) || isAdmin();
      allow delete: if isAdmin();
    }

    // Shops collection
    match /shops/{shopId} {
      allow read: if true; // Public read
      allow create: if isSeller() || isAdmin();
      allow update: if isOwner(resource.data.owner_id) || isAdmin();
      allow delete: if isAdmin();
    }

    // Products collection
    match /products/{productId} {
      allow read: if true; // Public read
      allow create: if isSeller() || isAdmin();
      allow update: if isOwner(resource.data.shop_id) || isAdmin();
      allow delete: if isOwner(resource.data.shop_id) || isAdmin();
    }

    // Orders collection
    match /orders/{orderId} {
      allow read: if isOwner(resource.data.customer_id) || isAdmin();
      allow create: if isAuthenticated();
      allow update: if isAdmin();
      allow delete: if isAdmin();
    }

    // Sessions collection (server-side only)
    match /sessions/{sessionId} {
      allow read: if false; // No direct client access
      allow write: if false; // Server-side only
    }

    // Cart collection
    match /cart/{itemId} {
      allow read: if isAuthenticated() && isOwner(resource.data.user_id);
      allow create: if isAuthenticated();
      allow update: if isAuthenticated() && isOwner(resource.data.user_id);
      allow delete: if isAuthenticated() && isOwner(resource.data.user_id);
    }
  }
}
```

#### 4. Storage Rules

Deploy storage rules:

```bash
firebase deploy --only storage
```

**Storage Rules** (from `storage.rules`):

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {

    // Helper functions
    function isAuthenticated() {
      return request.auth != null;
    }

    function isValidImage() {
      return request.resource.contentType.matches('image/.*') &&
             request.resource.size < 5 * 1024 * 1024; // 5MB max
    }

    function isValidVideo() {
      return request.resource.contentType.matches('video/.*') &&
             request.resource.size < 50 * 1024 * 1024; // 50MB max
    }

    // Product images
    match /products/{productId}/{allPaths=**} {
      allow read: if true; // Public read
      allow write: if isAuthenticated() && (isValidImage() || isValidVideo());
    }

    // Shop images
    match /shops/{shopId}/{allPaths=**} {
      allow read: if true; // Public read
      allow write: if isAuthenticated() && isValidImage();
    }

    // User avatars
    match /users/{userId}/avatar {
      allow read: if true; // Public read
      allow write: if isAuthenticated() &&
                      request.auth.uid == userId &&
                      isValidImage();
    }

    // Review media
    match /reviews/{reviewId}/{allPaths=**} {
      allow read: if true; // Public read
      allow write: if isAuthenticated() && isValidImage();
    }
  }
}
```

---

## 🔥 Firebase Setup

### 1. Service Account Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to **Project Settings** > **Service Accounts**
4. Click **Generate New Private Key**
5. Save JSON file securely (DON'T commit to Git!)
6. Extract values for `.env.production`:
   - `project_id` → `FIREBASE_PROJECT_ID`
   - `client_email` → `FIREBASE_CLIENT_EMAIL`
   - `private_key` → `FIREBASE_PRIVATE_KEY` (keep \n characters)

### 2. Enable Firebase Services

Enable these Firebase services:

- ✅ **Firestore Database** (Native mode)
- ✅ **Firebase Authentication** (Email/Password)
- ✅ **Firebase Storage** (for images/videos)
- ✅ **Firebase Hosting** (optional - for static assets)

### 3. Authentication Configuration

1. Go to **Authentication** > **Sign-in method**
2. Enable **Email/Password**
3. Configure authorized domains:
   - `justforview.in`
   - `www.justforview.in`
   - Your staging domain (if any)

### 4. Storage Buckets

Create storage buckets:

```
products/       - Product images and videos
shops/          - Shop logos and banners
users/          - User avatars
reviews/        - Review images
```

---

## ⚙️ Next.js Configuration

### 1. Production Build

Update `next.config.js`:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,

  // Image optimization
  images: {
    domains: ["firebasestorage.googleapis.com", "storage.googleapis.com"],
    formats: ["image/webp", "image/avif"],
  },

  // Headers for security
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },

  // Redirects
  async redirects() {
    return [
      {
        source: "/admin",
        destination: "/admin/dashboard",
        permanent: true,
      },
      {
        source: "/seller",
        destination: "/seller/dashboard",
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;
```

### 2. Build and Test

```bash
# Install dependencies
npm ci --production

# Run production build
npm run build

# Test production build locally
npm start

# Check for build errors
npm run lint
```

### 3. Bundle Analysis

```bash
# Analyze bundle size
npm run analyze

# Look for:
# - Bundle size < 500KB (first load)
# - Code splitting properly configured
# - No duplicate dependencies
```

---

## 🔒 Security Hardening

### 1. Generate Strong Secrets

```bash
# Generate SESSION_SECRET
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Output example: 8f4b3d7e9a2c1f6b5d8e7a4c3f2e1d9b6a5c4f3e2d1c9b8a7f6e5d4c3b2a1f0
```

### 2. HTTPS Configuration

#### Option A: Using Vercel/Netlify

- Automatic HTTPS with Let's Encrypt
- No configuration needed

#### Option B: Using Custom Server (AWS/GCP/Azure)

```bash
# Install certbot
sudo apt-get install certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d justforview.in -d www.justforview.in

# Auto-renewal (cron job)
sudo certbot renew --dry-run
```

### 3. Rate Limiting (Production)

Create `src/app/api/lib/rate-limiter-redis.ts`:

```typescript
import { Redis } from "ioredis";

const redis = new Redis(process.env.REDIS_URL || "redis://localhost:6379");

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

export async function checkRateLimit(
  identifier: string,
  config: RateLimitConfig
): Promise<{ allowed: boolean; remaining: number; resetAt: Date }> {
  const key = `rate_limit:${identifier}`;
  const now = Date.now();
  const windowStart = now - config.windowMs;

  // Remove old entries
  await redis.zremrangebyscore(key, 0, windowStart);

  // Count requests in window
  const count = await redis.zcard(key);

  if (count >= config.maxRequests) {
    const resetAt = new Date(
      (await redis.zrange(key, 0, 0, "WITHSCORES"))[1] + config.windowMs
    );

    return {
      allowed: false,
      remaining: 0,
      resetAt,
    };
  }

  // Add current request
  await redis.zadd(key, now, `${now}-${Math.random()}`);
  await redis.expire(key, Math.ceil(config.windowMs / 1000));

  return {
    allowed: true,
    remaining: config.maxRequests - count - 1,
    resetAt: new Date(now + config.windowMs),
  };
}
```

### 4. Content Security Policy

Add CSP header in `next.config.js`:

```javascript
{
  key: 'Content-Security-Policy',
  value: `
    default-src 'self';
    script-src 'self' 'unsafe-eval' 'unsafe-inline' *.googleapis.com;
    style-src 'self' 'unsafe-inline' *.googleapis.com;
    img-src 'self' data: blob: *.googleapis.com *.firebasestorage.com;
    font-src 'self' data: *.googleapis.com;
    connect-src 'self' *.googleapis.com *.razorpay.com wss:;
    frame-src 'self' *.razorpay.com;
  `.replace(/\s+/g, ' ').trim(),
}
```

### 5. Environment Variable Validation

Create `src/lib/validate-env.ts`:

```typescript
const requiredEnvVars = [
  "FIREBASE_PROJECT_ID",
  "FIREBASE_CLIENT_EMAIL",
  "FIREBASE_PRIVATE_KEY",
  "SESSION_SECRET",
  "NEXT_PUBLIC_RAZORPAY_KEY_ID",
  "RAZORPAY_KEY_SECRET",
];

export function validateEnvironment() {
  const missing = requiredEnvVars.filter((varName) => !process.env[varName]);

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(", ")}`
    );
  }

  // Validate SESSION_SECRET length
  if (process.env.SESSION_SECRET!.length < 32) {
    throw new Error("SESSION_SECRET must be at least 32 characters long");
  }

  console.log("✅ Environment validation passed");
}
```

Add to `instrumentation.ts`:

```typescript
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("./lib/validate-env").then((mod) => mod.validateEnvironment());
  }
}
```

---

## ⚡ Performance Optimization

### 1. Image Optimization

```typescript
// Use Next.js Image component everywhere
import Image from "next/image";

<Image
  src="/path/to/image.jpg"
  alt="Description"
  width={800}
  height={600}
  loading="lazy"
  quality={85}
/>;
```

### 2. Code Splitting

```typescript
// Dynamic imports for heavy components
import dynamic from "next/dynamic";

const HeavyChart = dynamic(() => import("@/components/HeavyChart"), {
  loading: () => <Loader />,
  ssr: false,
});
```

### 3. Redis Caching

```typescript
import { Redis } from "ioredis";

const redis = new Redis(process.env.REDIS_URL);

export async function getCachedData<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl = 3600 // 1 hour
): Promise<T> {
  const cached = await redis.get(key);

  if (cached) {
    return JSON.parse(cached);
  }

  const data = await fetcher();
  await redis.setex(key, ttl, JSON.stringify(data));

  return data;
}
```

### 4. Database Query Optimization

```typescript
// Use select() to fetch only needed fields
const shops = await db
  .collection("shops")
  .select("name", "logo", "rating")
  .where("is_verified", "==", true)
  .limit(20)
  .get();

// Use pagination for large datasets
const page = 1;
const limit = 20;
const lastDoc = null; // Store from previous query

const query = db
  .collection("products")
  .orderBy("created_at", "desc")
  .limit(limit);

if (lastDoc) {
  query.startAfter(lastDoc);
}
```

---

## 🚀 Deployment Steps

### Option 1: Deploy to Vercel (Recommended)

#### Step 1: Install Vercel CLI

```bash
npm install -g vercel
```

#### Step 2: Login

```bash
vercel login
```

#### Step 3: Configure Project

```bash
# Link to Vercel project
vercel link

# Set environment variables
vercel env add FIREBASE_PROJECT_ID production
vercel env add FIREBASE_CLIENT_EMAIL production
vercel env add FIREBASE_PRIVATE_KEY production
vercel env add SESSION_SECRET production
# ... (add all required env vars)
```

#### Step 4: Deploy

```bash
# Deploy to production
vercel --prod

# Or configure automatic deployments from Git
# Connect your GitHub repo in Vercel dashboard
```

#### Step 5: Custom Domain

```bash
# Add custom domain
vercel domains add justforview.in
vercel domains add www.justforview.in

# Configure DNS:
# A Record: @ → 76.76.21.21
# CNAME: www → cname.vercel-dns.com
```

---

### Option 2: Deploy to Google Cloud Run

#### Step 1: Build Docker Image

```dockerfile
# Dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED 1

RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000

CMD ["node", "server.js"]
```

#### Step 2: Build and Push

```bash
# Build image
docker build -t gcr.io/your-project-id/justforview:latest .

# Push to Google Container Registry
docker push gcr.io/your-project-id/justforview:latest
```

#### Step 3: Deploy to Cloud Run

```bash
gcloud run deploy justforview \
  --image gcr.io/your-project-id/justforview:latest \
  --platform managed \
  --region asia-south1 \
  --allow-unauthenticated \
  --set-env-vars "NODE_ENV=production,FIREBASE_PROJECT_ID=xxx,..." \
  --max-instances 10 \
  --min-instances 1 \
  --memory 2Gi \
  --cpu 2 \
  --timeout 60s
```

---

### Option 3: Deploy to AWS (EC2 + Load Balancer)

#### Step 1: Launch EC2 Instance

- **Instance Type**: t3.medium (2 vCPU, 4GB RAM)
- **OS**: Ubuntu 22.04 LTS
- **Security Group**: Allow ports 80, 443, 22

#### Step 2: Install Node.js and PM2

```bash
# SSH into instance
ssh ubuntu@your-ec2-ip

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2
sudo npm install -g pm2

# Install Nginx
sudo apt-get install nginx
```

#### Step 3: Deploy Application

```bash
# Clone repository
git clone https://github.com/your-org/justforview.git
cd justforview

# Install dependencies
npm ci --production

# Build application
npm run build

# Start with PM2
pm2 start npm --name "justforview" -- start
pm2 save
pm2 startup
```

#### Step 4: Configure Nginx

```nginx
# /etc/nginx/sites-available/justforview
server {
    listen 80;
    server_name justforview.in www.justforview.in;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/justforview /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

---

## ✅ Post-Deployment

### 1. Smoke Tests

Run these tests immediately after deployment:

```bash
# Health check
curl https://justforview.in/api/health

# User registration
curl -X POST https://justforview.in/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!","name":"Test User"}'

# Product listing
curl https://justforview.in/api/products?limit=10

# Image loading
curl -I https://justforview.in/_next/image?url=/logo.png
```

### 2. Performance Checks

```bash
# Lighthouse audit
npx lighthouse https://justforview.in --view

# Load testing (k6)
k6 run load-test.js

# Check First Contentful Paint (FCP) < 1.8s
# Check Largest Contentful Paint (LCP) < 2.5s
# Check Time to Interactive (TTI) < 3.8s
```

### 3. Set Up Monitoring

#### Sentry (Error Tracking)

```typescript
// src/lib/sentry.ts
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1,
  beforeSend(event) {
    // Don't send certain errors
    if (event.exception?.values?.[0]?.value?.includes("ResizeObserver")) {
      return null;
    }
    return event;
  },
});
```

#### Google Analytics

```typescript
// src/lib/analytics.ts
export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

export const pageview = (url: string) => {
  window.gtag("config", GA_MEASUREMENT_ID, {
    page_path: url,
  });
};

export const event = ({
  action,
  category,
  label,
  value,
}: {
  action: string;
  category: string;
  label?: string;
  value?: number;
}) => {
  window.gtag("event", action, {
    event_category: category,
    event_label: label,
    value: value,
  });
};
```

### 4. Database Backups

```bash
# Automated Firestore backups
gcloud firestore export gs://your-backup-bucket/firestore-backups

# Schedule daily backups
gcloud scheduler jobs create http firestore-backup \
  --schedule="0 2 * * *" \
  --uri="https://firestore.googleapis.com/v1/projects/your-project-id/databases/(default):export" \
  --message-body='{"outputUriPrefix":"gs://your-backup-bucket/scheduled-backups"}' \
  --time-zone="Asia/Kolkata"
```

### 5. SSL Certificate

```bash
# Verify SSL
openssl s_client -connect justforview.in:443 -servername justforview.in

# Check expiry
echo | openssl s_client -connect justforview.in:443 2>/dev/null | openssl x509 -noout -dates
```

---

## 📊 Monitoring & Maintenance

### 1. Application Monitoring

#### Key Metrics to Track

- **Availability**: > 99.9% uptime
- **Response Time**: p95 < 500ms
- **Error Rate**: < 0.1%
- **CPU Usage**: < 70%
- **Memory Usage**: < 80%
- **Database Connections**: Monitor connection pool

#### Tools

- **Uptime Monitoring**: Uptime Robot, Pingdom
- **APM**: New Relic, Datadog, AppSignal
- **Logs**: CloudWatch, Google Cloud Logging, Logtail

### 2. Database Monitoring

```typescript
// Monitor Firestore usage
import { getFirestore } from "firebase-admin/firestore";

async function monitorFirestoreUsage() {
  const db = getFirestore();

  // Document counts
  const collections = ["users", "shops", "products", "orders"];
  for (const collection of collections) {
    const snapshot = await db.collection(collection).count().get();
    console.log(`${collection}: ${snapshot.data().count} documents`);
  }

  // Check for slow queries
  // Use Firebase Console > Firestore > Usage tab
}
```

### 3. Session Cleanup

```typescript
// Scheduled job to clean expired sessions
import { getFirestoreAdmin } from "@/app/api/lib/firebase/admin";

export async function cleanupExpiredSessions() {
  const db = getFirestoreAdmin();
  const now = new Date().toISOString();

  const expiredSessions = await db
    .collection("sessions")
    .where("expires_at", "<", now)
    .get();

  const batch = db.batch();
  expiredSessions.docs.forEach((doc) => {
    batch.delete(doc.ref);
  });

  await batch.commit();
  console.log(`Cleaned ${expiredSessions.size} expired sessions`);
}

// Run daily via cron or Cloud Scheduler
```

### 4. Auction Job Monitoring

```bash
# Check auction cron job status
curl https://justforview.in/api/auctions/cron

# Monitor auction closures
# Check logs for "Auction closed" events
# Alert if no auctions closed in 24 hours despite active auctions
```

### 5. Security Audits

```bash
# Run security audit monthly
npm audit

# Check dependencies for vulnerabilities
npm audit --production

# Update dependencies
npm update

# Check for outdated packages
npm outdated
```

---

## 🔄 Rollback Procedure

### Quick Rollback (Vercel)

```bash
# List deployments
vercel list

# Rollback to previous deployment
vercel rollback <deployment-url>
```

### Manual Rollback (PM2)

```bash
# Stop current version
pm2 stop justforview

# Checkout previous version
git checkout <previous-commit-hash>

# Rebuild
npm ci
npm run build

# Restart
pm2 restart justforview
```

### Database Rollback

```bash
# Restore from backup
gcloud firestore import gs://your-backup-bucket/firestore-backups/[TIMESTAMP]
```

---

## 🔧 Troubleshooting

### Common Issues

#### 1. Session Authentication Failing

**Symptoms**: Users can't log in, "Unauthorized" errors

**Solutions**:

```bash
# Check SESSION_SECRET is set
echo $SESSION_SECRET

# Verify cookie domain matches
# In browser DevTools > Application > Cookies

# Check Firestore sessions collection
# Verify session documents are being created

# Clear old sessions
node scripts/cleanup-sessions.js
```

#### 2. Firebase Connection Errors

**Symptoms**: "Firebase Admin not configured" errors

**Solutions**:

```bash
# Verify environment variables
node -e "console.log(process.env.FIREBASE_PROJECT_ID)"

# Check private key format (should have \n preserved)
# Regenerate service account key if needed

# Test Firebase connection
node scripts/test-firebase.js
```

#### 3. Slow API Responses

**Symptoms**: Timeouts, high response times

**Solutions**:

```bash
# Check database indexes
firebase firestore:indexes

# Enable caching
# Add Redis layer for frequently accessed data

# Optimize queries
# Use .select() to fetch only needed fields
# Add pagination

# Check server resources
top
df -h
```

#### 4. Payment Gateway Issues

**Symptoms**: Razorpay checkout failing

**Solutions**:

```bash
# Verify Razorpay keys
echo $NEXT_PUBLIC_RAZORPAY_KEY_ID
echo $RAZORPAY_KEY_SECRET

# Check webhook URL is registered in Razorpay dashboard
# Test webhook: https://justforview.in/api/webhooks/razorpay

# Verify signature validation in webhook handler

# Check payment logs in Razorpay dashboard
```

#### 5. WebSocket Connection Failing

**Symptoms**: Live auction bidding not working

**Solutions**:

```bash
# Check WebSocket server is running
pm2 list | grep socket

# Verify SOCKET_PORT is correct
echo $SOCKET_PORT

# Check firewall rules allow WebSocket connections
sudo ufw status

# Test WebSocket connection
wscat -c wss://justforview.in

# Check CORS configuration
# Verify origin headers
```

---

## 📞 Support Contacts

### Emergency Contacts

- **DevOps Lead**: devops@justforview.in
- **Backend Lead**: backend@justforview.in
- **On-Call**: +91-XXXXXXXXXX

### Service Providers

- **Hosting**: Vercel Support (support@vercel.com)
- **Database**: Firebase Support (firebase-support@google.com)
- **Payment**: Razorpay Support (support@razorpay.com)

### Escalation Path

1. Check logs and error messages
2. Search documentation and troubleshooting guide
3. Contact DevOps team
4. Escalate to service provider support
5. Create incident in project management tool

---

## ✅ Final Checklist

Before going live:

- [ ] All environment variables set correctly
- [ ] Firebase security rules deployed
- [ ] SSL certificate installed and verified
- [ ] DNS configured and propagated
- [ ] Monitoring tools set up
- [ ] Error tracking configured
- [ ] Backup strategy in place
- [ ] Load testing completed
- [ ] Security audit passed
- [ ] Performance optimization done
- [ ] Rollback procedure tested
- [ ] Team trained on deployment process
- [ ] Documentation updated
- [ ] Stakeholders notified

---

**Deployment Date**: ******\_******  
**Deployed By**: ******\_******  
**Version**: ******\_******  
**Status**: ⬜ Success ⬜ Partial ⬜ Failed

---

**🎉 Congratulations on your deployment!**

Monitor the application closely for the first 24-48 hours. Have the rollback procedure ready just in case.

For questions or issues, refer to the troubleshooting section or contact the DevOps team.
