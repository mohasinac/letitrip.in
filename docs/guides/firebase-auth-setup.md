# Firebase Authentication Setup Guide

Complete guide for setting up Firebase authentication with server-side sessions.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Firebase Project Setup](#firebase-project-setup)
- [Environment Configuration](#environment-configuration)
- [Authentication Features](#authentication-features)
- [Usage Examples](#usage-examples)
- [User Management](#user-management)
- [Security Best Practices](#security-best-practices)

---

## Prerequisites

- Node.js 18+
- Firebase account
- Google Cloud Console access (for OAuth)
- Apple Developer account (for Apple login, optional)

---

## Firebase Project Setup

### 1. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Enter project name (e.g., "letitrip")
4. Enable Google Analytics (optional)
5. Create project

### 2. Enable Authentication Methods

1. In Firebase Console, go to **Authentication** → **Sign-in method**
2. Enable the following providers:

**Email/Password:**
- Click "Email/Password"
- Toggle "Enable"
- Save

**Google:**
- Click "Google"
- Toggle "Enable"
- Select support email
- Save

**Phone:**
- Click "Phone"
- Toggle "Enable"
- Add test phone numbers for development (optional)
- Save

### 3. Create Firestore Database

1. Go to **Firestore Database**
2. Click "Create database"
3. Start in **production mode**
4. Choose location (closest to your users)
5. Enable

### 4. Set Firestore Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection
    match /users/{userId} {
      // Users can read their own data
      allow read: if request.auth != null && request.auth.uid == userId;
      
      // Only admins can write user data
      allow write: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Public read, authenticated write for other collections
    match /{document=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

### 5. Get Firebase Configuration

1. Go to **Project Settings** (gear icon)
2. Scroll down to "Your apps"
3. Click web icon (</>) to add a web app
4. Register app with nickname
5. Copy configuration object

### 6. Generate Service Account Key

1. Go to **Project Settings** → **Service accounts**
2. Click "Generate new private key"
3. Save the JSON file securely
4. Extract these values:
   - `project_id`
   - `client_email`
   - `private_key`

---

## Environment Configuration

### 1. Copy Environment Template

```bash
cp .env.local.example .env.local
```

### 2. Fill in Firebase Configuration

Open `.env.local` and add your Firebase credentials:

```env
# Firebase Client Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789012
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789012:web:abcdef123456

# Firebase Admin SDK (from service account key)
FIREBASE_ADMIN_PROJECT_ID=your-project-id
FIREBASE_ADMIN_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----\n"

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=generate_with_openssl_random_32_characters
```

### 3. Generate NextAuth Secret

```bash
# Generate random secret
openssl rand -base64 32

# Add to .env.local as NEXTAUTH_SECRET
```

### 4. Configure OAuth Providers (Optional)

**Google OAuth:**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project (or create new one)
3. Enable Google+ API
4. Go to **Credentials** → **Create Credentials** → **OAuth client ID**
5. Select "Web application"
6. Add authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google`
   - `https://yourdomain.com/api/auth/callback/google`
7. Copy Client ID and Client Secret

```env
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

**Apple Sign In:**
1. Go to [Apple Developer](https://developer.apple.com/)
2. Go to **Certificates, Identifiers & Profiles**
3. Create new **Service ID**
4. Configure domain and return URL
5. Generate key

```env
APPLE_ID=com.yourdomain.app
APPLE_SECRET=your-apple-secret
```

---

## Authentication Features

### ✅ Email/Phone Login

- Users can sign in with email OR phone number
- Password authentication with bcrypt hashing
- Remember me option
- Forgot password flow

### ✅ Social Login

- **Google OAuth** - One-click Google sign in
- **Apple Sign In** - Apple ID authentication
- Automatic account linking

### ✅ User Registration

- Email or phone-based registration
- Password strength indicator
- Terms and conditions acceptance
- Email verification (optional)
- Auto-login after registration

### ✅ Role-Based Access Control

- Default role: **user**
- Additional roles: **admin**, **moderator**
- Custom roles can be added
- Server-side role verification

### ✅ Server-Side Sessions

- JWT-based sessions
- 30-day session expiration
- Secure HTTP-only cookies
- CSRF protection

### ✅ Profile Management

- Update display name
- Change email/phone
- Change password
- Upload profile photo
- Account deletion

---

## Usage Examples

### Protect a Page

```tsx
// app/dashboard/page.tsx
import { ProtectedRoute } from '@/components/auth';

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <div>
        <h1>Dashboard</h1>
        <p>This page is protected</p>
      </div>
    </ProtectedRoute>
  );
}
```

### Admin-Only Page

```tsx
// app/admin/page.tsx
import { ProtectedRoute } from '@/components/auth';

export default function AdminPage() {
  return (
    <ProtectedRoute requiredRole="admin">
      <div>
        <h1>Admin Panel</h1>
        <p>Only admins can see this</p>
      </div>
    </ProtectedRoute>
  );
}
```

### Role-Based UI

```tsx
import { RoleGate, AdminOnly } from '@/components/auth';

function MyComponent() {
  return (
    <div>
      <h1>Welcome</h1>
      
      {/* Show only to admins */}
      <AdminOnly>
        <button>Admin Settings</button>
      </AdminOnly>
      
      {/* Show only to moderators or admins */}
      <RoleGate allowedRoles={['admin', 'moderator']}>
        <button>Moderation Tools</button>
      </RoleGate>
    </div>
  );
}
```

### Get Current User

```tsx
'use client';

import { useCurrentUser } from '@/components/auth';

function Profile() {
  const { user, isLoading, isAuthenticated, role } = useCurrentUser();
  
  if (isLoading) return <div>Loading...</div>;
  if (!isAuthenticated) return <div>Not logged in</div>;
  
  return (
    <div>
      <h1>Welcome, {user.name}</h1>
      <p>Email: {user.email}</p>
      <p>Role: {role}</p>
    </div>
  );
}
```

### Sign Out

```tsx
'use client';

import { signOut } from '@/lib/auth-utils';

function LogoutButton() {
  const handleLogout = async () => {
    await signOut();
  };
  
  return <button onClick={handleLogout}>Sign Out</button>;
}
```

---

## User Management

### Change User Role (Admin Only)

Create API route for role management:

```tsx
// app/api/admin/users/[userId]/role/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { adminDb } from '@/lib/firebase/admin';
import { UserRole } from '@/types/auth';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  const session = await auth();
  
  // Check if user is admin
  if (!session || (session.user as any).role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }
  
  const { role } = await request.json();
  
  // Validate role
  const validRoles: UserRole[] = ['user', 'admin', 'moderator'];
  if (!validRoles.includes(role)) {
    return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
  }
  
  // Update user role
  await adminDb.collection('users').doc(params.userId).update({
    role,
    updatedAt: new Date(),
  });
  
  return NextResponse.json({ success: true });
}
```

### Get All Users (Admin Only)

```tsx
// app/api/admin/users/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { adminDb } from '@/lib/firebase/admin';

export async function GET(request: NextRequest) {
  const session = await auth();
  
  if (!session || (session.user as any).role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }
  
  const usersSnapshot = await adminDb.collection('users').get();
  const users = usersSnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  }));
  
  return NextResponse.json({ users });
}
```

---

## Security Best Practices

### ✅ Environment Variables

- Never commit `.env.local` to version control
- Use different credentials for development/production
- Rotate secrets regularly

### ✅ Password Security

- Minimum 8 characters
- Bcrypt hashing with salt rounds = 12
- Password strength indicator
- No password hints

### ✅ Session Security

- HTTP-only cookies
- Secure flag in production
- CSRF tokens
- 30-day max session age

### ✅ Firebase Security Rules

- Restrict user data access
- Validate data on write
- Use server-side verification
- Disable public write access

### ✅ Rate Limiting

Add rate limiting to auth routes:

```tsx
// middleware.ts
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '1 m'),
});

// Apply to auth routes
```

---

## Testing

### Test Accounts

Create test accounts in Firebase Console:

1. Go to **Authentication** → **Users**
2. Click "Add user"
3. Enter email and password
4. Set custom claims in Firestore

### Test Phone Authentication

Add test phone numbers in Firebase Console:

1. Go to **Authentication** → **Sign-in method** → **Phone**
2. Add test numbers with verification codes
3. Use in development

---

## Troubleshooting

### Common Issues

**"User not found"**
- Check Firestore for user document
- Verify email/phone is correct
- Check authentication provider is enabled

**"Invalid password"**
- Verify bcrypt comparison
- Check password is being hashed correctly
- Ensure consistent salt rounds

**OAuth not working**
- Verify OAuth credentials
- Check redirect URIs match exactly
- Ensure scopes are correct

**Session not persisting**
- Check NEXTAUTH_SECRET is set
- Verify cookies are not blocked
- Check domain matches

---

## Next Steps

- [Create admin dashboard](./admin-dashboard.md)
- [Implement user management](./user-management.md)
- [Add email verification](./email-verification.md)
- [Set up password reset](./password-reset.md)

---

**Setup Complete!** 🎉

Your authentication system is now configured and ready to use.
