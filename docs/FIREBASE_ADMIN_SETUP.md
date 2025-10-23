# Firebase Admin Credentials Setup Guide

## 🚨 **Current Issue**

Your Firebase Admin credentials are not properly configured. The `.env.local` file contains placeholder values:

```bash
FIREBASE_ADMIN_CLIENT_EMAIL=your_client_email
FIREBASE_ADMIN_PRIVATE_KEY="your_private_key"
```

## 🔧 **Solution: Get Firebase Service Account Credentials**

### **Step 1: Access Firebase Console**

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `justforview1`
3. Click the gear icon ⚙️ → **Project Settings**

### **Step 2: Generate Service Account Key**

1. Go to **Service Accounts** tab
2. Click **Generate new private key**
3. Download the JSON file (e.g., `justforview1-firebase-adminsdk-xxxxx.json`)

### **Step 3: Extract Credentials from JSON**

The downloaded JSON file will look like this:

```json
{
  "type": "service_account",
  "project_id": "justforview1",
  "private_key_id": "...",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-xxxxx@justforview1.iam.gserviceaccount.com",
  "client_id": "...",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "...",
  "client_x509_cert_url": "..."
}
```

### **Step 4: Update .env.local**

Copy these values from your JSON file:

```bash
# Firebase Admin SDK (Replace with your actual values)
FIREBASE_ADMIN_PROJECT_ID=justforview1
FIREBASE_ADMIN_CLIENT_EMAIL=firebase-adminsdk-xxxxx@justforview1.iam.gserviceaccount.com
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour_Actual_Private_Key_Here\n-----END PRIVATE KEY-----\n"
```

## ⚠️ **Important Security Notes**

### **DO NOT:**

- ❌ Commit `.env.local` to version control
- ❌ Share the private key publicly
- ❌ Use these credentials on the client-side

### **DO:**

- ✅ Keep credentials in `.env.local` for development
- ✅ Use environment variables in production (Vercel)
- ✅ Add `.env.local` to `.gitignore`

## 🚀 **For Production (Vercel) Setup**

### **Step 1: Vercel Environment Variables**

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Add these variables:

```bash
FIREBASE_ADMIN_PROJECT_ID=justforview1
FIREBASE_ADMIN_CLIENT_EMAIL=firebase-adminsdk-xxxxx@justforview1.iam.gserviceaccount.com
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour_Private_Key\n-----END PRIVATE KEY-----\n"
```

### **Step 2: Redeploy**

After adding environment variables to Vercel, redeploy your application.

## 🧪 **Test Firebase Connection**

After updating credentials, you can test the connection by:

1. **Starting development server:**

   ```bash
   npm run dev
   ```

2. **Try registration/login** at:

   - http://localhost:3000/register
   - http://localhost:3000/login

3. **Check console for errors** - Should not see Firebase credential errors

## 🔍 **Troubleshooting**

### **Common Issues:**

1. **Private Key Format**

   - Must include `\n` characters
   - Should be wrapped in quotes
   - Include full `-----BEGIN PRIVATE KEY-----` and `-----END PRIVATE KEY-----`

2. **Project ID Mismatch**

   - Ensure `FIREBASE_ADMIN_PROJECT_ID` matches your Firebase project
   - Should be `justforview1` based on your config

3. **Client Email Format**
   - Should end with `@justforview1.iam.gserviceaccount.com`
   - Must be from the service account JSON

### **Validation Script**

You can create a simple test to validate credentials:

```javascript
// test-firebase.js
const admin = require("firebase-admin");

const serviceAccount = {
  projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
  clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n"),
};

try {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
  console.log("✅ Firebase Admin initialized successfully!");
} catch (error) {
  console.error("❌ Firebase Admin error:", error.message);
}
```

## 📝 **Sample .env.local Template**

Here's what your `.env.local` should look like with real values:

```bash
# Firebase Admin SDK (Replace with your actual service account values)
FIREBASE_ADMIN_PROJECT_ID=justforview1
FIREBASE_ADMIN_CLIENT_EMAIL=firebase-adminsdk-abc123@justforview1.iam.gserviceaccount.com
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...\n-----END PRIVATE KEY-----\n"

# Firebase Client SDK (Already configured correctly)
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyCL2eA6_wFSMcyel9pxntnVOm7SFh2iWTM
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=justforview1.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=justforview1
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=justforview1.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=995821948299
NEXT_PUBLIC_FIREBASE_APP_ID=1:995821948299:web:38d1decb11eca69c7d738e

# Other variables (already configured)
JWT_SECRET=super_secure_jwt_secret_key_for_justforview_ecommerce_platform_2024
# ... rest of your config
```

## ✅ **Next Steps**

1. **Download service account JSON** from Firebase Console
2. **Extract credentials** from the JSON file
3. **Update .env.local** with real values
4. **Test locally** by trying registration/login
5. **Update Vercel environment variables** for production
6. **Redeploy** your application

Once you complete these steps, your Firebase Admin SDK will be properly configured and you should be able to create users with different roles successfully! 🎉
