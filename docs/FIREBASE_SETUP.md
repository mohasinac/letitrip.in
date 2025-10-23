# Firebase Setup Guide

This guide will help you set up Firebase for the JustForView.in project with proper Firestore and Storage rules.

## Prerequisites

1. **Node.js** (v18+ recommended)
2. **Firebase CLI** installed globally
3. **Firebase Project** created in Firebase Console

## Quick Setup

### 1. Install Firebase CLI (if not already installed)

```powershell
npm install -g firebase-tools
```

### 2. Login to Firebase

```powershell
firebase login
```

### 3. Initialize Firebase in your project

```powershell
# Navigate to your project directory
cd "c:\Users\mohsi\OneDrive\Desktop\project\justforview.in"

# Initialize Firebase (this will use the existing firebase.json)
firebase init
```

When prompted, select:

- ✅ Firestore: Configure security rules and indexes files
- ✅ Storage: Configure a security rules file for Cloud Storage
- ✅ Hosting: Configure files for Firebase Hosting

### 4. Environment Variables Setup

Copy `.env.example` to `.env.local` and update the values:

```powershell
Copy-Item .env.example .env.local
```

Update `.env.local` with your Firebase configuration:

```env
# Get these from Firebase Console > Project Settings > General
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id

# Get these from Firebase Console > Project Settings > Service Accounts
FIREBASE_ADMIN_PROJECT_ID=your_project_id
FIREBASE_ADMIN_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your_project.iam.gserviceaccount.com
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour_Private_Key_Here\n-----END PRIVATE KEY-----\n"
```

### 5. Deploy Firebase Rules and Indexes

```powershell
# Deploy Firestore rules and indexes
firebase deploy --only firestore

# Deploy Storage rules
firebase deploy --only storage
```

### 6. Initialize Sample Data

```powershell
# Initialize Firebase with sample data
npm run firebase:init

# Or just initialize data without creating admin user
npm run firebase:init-data
```

## Detailed Setup Instructions

### Getting Firebase Configuration

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project (or create a new one)
3. Go to **Project Settings** (gear icon)
4. In the **General** tab, scroll down to "Your apps"
5. Click on the web app icon (</>) or "Add app" if none exists
6. Copy the configuration values to your `.env.local`

### Getting Firebase Admin SDK Credentials

1. In Firebase Console, go to **Project Settings**
2. Click on the **Service Accounts** tab
3. Click **Generate new private key**
4. Download the JSON file
5. Extract the values and add them to `.env.local`:
   - `project_id` → `FIREBASE_ADMIN_PROJECT_ID`
   - `client_email` → `FIREBASE_ADMIN_CLIENT_EMAIL`
   - `private_key` → `FIREBASE_ADMIN_PRIVATE_KEY`

### Firestore Security Rules

The project includes comprehensive security rules in `firestore.rules`:

- **Products**: Read access for all, write access for admins only
- **Users**: Users can only read/write their own data
- **Orders**: Users can access their own orders, admins can access all
- **Auctions**: Public read, authenticated users can create/bid
- **Cart/Watchlist**: Private to each user
- **Reviews**: Public read, authenticated users can create

### Storage Security Rules

The project includes storage rules in `storage.rules`:

- **Product Images**: Public read, authenticated write with size limits
- **User Profiles**: Public read, users can upload their own
- **Auction Images**: Public read, authenticated write
- **Order/Return Documents**: Private to order owners and admins

### Firestore Indexes

The project includes optimized indexes in `firestore.indexes.json` for:

- Product queries (by category, featured status, price, etc.)
- Auction queries (by status, end time, seller)
- Order queries (by user, status, date)
- Review queries (by product, user, date)

## Available Scripts

```powershell
# Initialize Firebase with all data and admin user
npm run firebase:init

# Initialize only sample data
npm run firebase:init-data

# Create only admin user
npm run firebase:create-admin

# Deploy all Firebase resources
npm run firebase:deploy

# Deploy only rules
npm run firebase:deploy-rules

# Start Firebase emulators for development
npm run firebase:emulator

# Show environment setup instructions
npm run firebase:env-setup
```

## Firebase Emulators (Development)

For local development, you can use Firebase emulators:

1. **Start emulators**:

   ```powershell
   npm run firebase:emulator
   ```

2. **Set environment variable**:

   ```env
   USE_FIREBASE_EMULATOR=true
   ```

3. **Access Emulator UI**: http://localhost:4000

## Default Admin User

After running `npm run firebase:init`, an admin user will be created:

- **Email**: admin@justforview.in
- **Password**: admin123456
- **Role**: admin

## Database Collections Structure

### Products Collection

```
products/
├── id (string)
├── name (string)
├── slug (string)
├── description (string)
├── price (number)
├── quantity (number)
├── images (array)
├── category (string)
├── status (string)
├── isFeatured (boolean)
└── createdAt (timestamp)
```

### Auctions Collection

```
auctions/
├── id (string)
├── title (string)
├── description (string)
├── currentBid (number)
├── startingBid (number)
├── endTime (timestamp)
├── status (string)
├── sellerId (string)
└── bids/ (subcollection)
    ├── bidderId (string)
    ├── amount (number)
    └── bidTime (timestamp)
```

### Users Collection

```
users/
├── id (string)
├── email (string)
├── name (string)
├── role (string)
├── emailVerified (boolean)
└── addresses/ (subcollection)
    ├── addressLine1 (string)
    ├── city (string)
    ├── state (string)
    └── pincode (string)
```

## Troubleshooting

### Common Issues

1. **Permission Denied**

   - Check if Firestore rules are deployed
   - Verify user authentication status
   - Ensure user has proper role/permissions

2. **Admin SDK Initialization Failed**

   - Verify `FIREBASE_ADMIN_PRIVATE_KEY` format (should include `\n` for line breaks)
   - Check service account permissions
   - Ensure project ID matches

3. **Emulator Connection Issues**
   - Make sure emulators are running
   - Check if ports are available (8080, 9099, 9199)
   - Verify `USE_FIREBASE_EMULATOR` setting

### Getting Help

1. Check Firebase Console logs
2. Review browser developer console
3. Check server logs for Admin SDK errors
4. Verify environment variables are loaded correctly

## Production Deployment

1. **Set production environment variables**
2. **Deploy to Firebase Hosting**:
   ```powershell
   npm run build
   firebase deploy --only hosting
   ```
3. **Monitor performance** in Firebase Console
4. **Set up backup** for Firestore data

## Security Best Practices

1. **Never expose Admin SDK credentials** to client-side
2. **Use environment variables** for all sensitive data
3. **Regularly review security rules**
4. **Monitor authentication anomalies**
5. **Set up proper CORS** for production
6. **Enable audit logging** for sensitive operations

This setup provides a robust, secure, and scalable Firebase implementation for your e-commerce platform with proper separation of client and server-side operations.
