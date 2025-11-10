# Letitrip.in - Deployment & Setup Guide

## Firebase Project Configuration

### Project Details

- **Project ID**: letitrip-in-app
- **Project Name**: Letitrip
- **Region**: Asia Southeast 1
- **Repository**: https://github.com/mohasinac/letitrip.in

## Setup Instructions

### 1. Firebase Configuration

#### Deploy Firebase Rules & Indexes

```bash
# Login to Firebase
firebase login

# Initialize Firebase (if not already done)
firebase init

# Deploy Firestore rules and indexes
firebase deploy --only firestore:rules
firebase deploy --only firestore:indexes

# Deploy Storage rules
firebase deploy --only storage

# Deploy Realtime Database rules
firebase deploy --only database
```

#### Enable Firebase Services

1. **Authentication**
   - Go to Firebase Console → Authentication
   - Enable Email/Password provider
   - Enable Google Sign-in (optional)
2. **Firestore Database**
   - Already configured with security rules in `firestore.rules`
   - Indexes configured in `firestore.indexes.json`
3. **Firebase Storage**
   - Rules configured in `storage.rules`
   - Buckets: `letitrip-in-app.firebasestorage.app`
4. **Realtime Database**
   - Rules configured in `database.rules.json`
   - Database URL: `https://letitrip-in-app-default-rtdb.asia-southeast1.firebasedatabase.app`

### 2. Environment Variables

#### Local Development

Environment variables are configured in `.env.local` (not tracked in git)

#### Production (Vercel)

Set the following environment variables in Vercel Dashboard:

```bash
# Firebase Admin (Server-side)
FIREBASE_PROJECT_ID=letitrip-in-app
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-fbsvc@letitrip-in-app.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n[Your Private Key]\n-----END PRIVATE KEY-----\n"
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

# Session Secret (Generate a secure random string)
SESSION_SECRET=[Generate using: openssl rand -base64 32]
```

### 3. Vercel Deployment

#### Connect Repository

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New" → "Project"
3. Import from GitHub: `mohasinac/letitrip.in`

#### Configure Project

- **Framework Preset**: Next.js
- **Root Directory**: ./
- **Build Command**: `npm run build`
- **Output Directory**: .next
- **Install Command**: `npm install`

#### Region Settings

- **Primary Region**: Mumbai (bom1)
- **Serverless Functions Region**: Mumbai (bom1)

#### Environment Variables

Add all environment variables from the `.env.production` file

### 4. Custom Domain (Optional)

1. Go to Vercel Project Settings → Domains
2. Add your custom domain: `letitrip.in`
3. Configure DNS records as instructed by Vercel

### 5. Firebase Security Setup

#### Service Account Key

The Firebase Admin SDK service account key is stored securely:

- **Local**: In `.env.local` (gitignored)
- **Production**: In Vercel environment variables
- **Never commit**: The JSON key file to git

#### Firestore Security Rules

Review and customize `firestore.rules` for your security requirements:

- User authentication checks
- Role-based access control (admin, seller, buyer)
- Data validation rules

#### Storage Security Rules

Review and customize `storage.rules`:

- File type restrictions
- File size limits
- User-based access control

### 6. Initial Data Setup

#### Create Admin User

```bash
# Use Firebase Console
1. Go to Firebase Console → Authentication
2. Add a new user with email/password
3. Copy the user UID
4. Go to Firestore → users collection
5. Create a document with the UID as document ID
6. Set fields:
   - email: "admin@letitrip.in"
   - role: "admin"
   - displayName: "Admin"
   - created_at: [current timestamp]
```

#### Seed Categories (Optional)

Use the admin panel or API to create initial product categories

### 7. Testing

#### Local Testing

```bash
npm run dev
```

#### Production Testing

After deployment, test:

- Authentication flow
- Product listings
- Auction functionality
- Payment integration
- File uploads
- Real-time features

### 8. Monitoring

#### Firebase Console

- Monitor authentication users
- Check Firestore usage
- Monitor Storage usage
- Review Database usage

#### Vercel Analytics

- Check deployment logs
- Monitor function execution
- Review performance metrics

## Troubleshooting

### Firebase Admin Initialization Fails

- Verify environment variables are set correctly
- Check private key format (must include \n for line breaks)
- Ensure service account has proper permissions

### CORS Issues

- Check allowed domains in Firebase Console
- Verify API routes are configured correctly

### Storage Upload Fails

- Check storage rules
- Verify bucket name in environment variables
- Check file size limits

## Security Checklist

- [ ] Firebase Admin SDK key secured in environment variables
- [ ] Firestore rules deployed and tested
- [ ] Storage rules deployed and tested
- [ ] Database rules deployed and tested
- [ ] Session secret is randomly generated
- [ ] API rate limiting configured
- [ ] HTTPS enforced in production
- [ ] Environment variables never committed to git
- [ ] Firebase service account JSON file gitignored

## Next Steps

1. Complete Vercel deployment
2. Configure custom domain
3. Set up monitoring and alerts
4. Configure backup strategy
5. Set up CI/CD pipeline
6. Enable Firebase App Check (optional)
7. Configure CDN for static assets
