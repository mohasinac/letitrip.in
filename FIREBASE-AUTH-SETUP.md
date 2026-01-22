# Firebase Authentication Setup Guide

## Overview

This project uses Firebase Authentication with secure httpOnly session cookies. The client never has direct access to Firebase tokens - all tokens are handled server-side for maximum security.

## Architecture

```
┌─────────────┐         ┌──────────────┐         ┌─────────────┐
│   Client    │         │  Next.js API │         │   Firebase  │
│   (React)   │◄────────┤    Routes    │◄────────┤    Admin    │
└─────────────┘         └──────────────┘         └─────────────┘
       │                        │
       │  1. Sign in with       │
       │     Firebase Auth      │
       │────────────────────────┤
       │                        │
       │  2. Get ID Token       │
       │◄───────────────────────┤
       │                        │
       │  3. Send token to API  │
       │────────────────────────►
       │                        │  4. Verify token
       │                        │────────────────────────►
       │                        │
       │                        │  5. Create session
       │                        │◄───────────────────────
       │                        │
       │  6. httpOnly cookie    │
       │◄───────────────────────┤
       │    (token secure)      │
       │                        │
```

## Features

### 🔐 Security

- **httpOnly Cookies**: Tokens stored in httpOnly cookies, inaccessible to JavaScript
- **Server-side Validation**: All token verification happens server-side
- **Session Management**: 14-day session expiration with automatic refresh
- **Role-based Access Control (RBAC)**: Custom claims for user/seller/admin roles

### 🚀 Authentication Methods

- Email/Password
- Google OAuth
- Facebook OAuth
- (Easily extensible to other providers)

### 🛠️ Development Features

- **Role Selection on Localhost**: For testing, you can select user/seller/admin roles during registration
- **Session API**: Check authentication status without exposing tokens

## Setup Instructions

### 1. Firebase Project Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select existing
3. Enable Authentication:
   - Go to **Authentication** > **Sign-in method**
   - Enable **Email/Password**
   - Enable **Google** (add OAuth client ID)
   - Enable **Facebook** (add App ID and secret)

### 2. Generate Service Account Key

1. Go to **Project Settings** > **Service Accounts**
2. Click **Generate New Private Key**
3. Save the JSON file securely
4. Minify the JSON (remove newlines and spaces)
5. Add to `.env.local` as `FIREBASE_SERVICE_ACCOUNT_KEY`

### 3. Environment Variables

Create `.env.local`:

```env
# Firebase Client Config (from Project Settings > General)
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-ABC123

# Firebase Admin SDK (minified service account JSON)
FIREBASE_SERVICE_ACCOUNT_KEY={"type":"service_account","project_id":"..."}
```

### 4. Firestore Database Setup

Create these collections in Firestore:

```
users/
  {userId}/
    name: string
    email: string
    phone: string
    role: "user" | "seller" | "admin"
    createdAt: timestamp
    updatedAt: timestamp
    isActive: boolean
    emailVerified: boolean
```

### 5. Firestore Security Rules

Update Firestore rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection
    match /users/{userId} {
      // Users can read their own document
      allow read: if request.auth.uid == userId;

      // Only allow updates to own profile (not role)
      allow update: if request.auth.uid == userId &&
                       !request.resource.data.diff(resource.data).affectedKeys().hasAny(['role']);

      // Admins can read/write all users
      allow read, write: if request.auth.token.role == 'admin';
    }
  }
}
```

## Usage

### Client-Side

#### Login (Email/Password)

```tsx
import { auth } from "@/lib/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";

// 1. Sign in with Firebase
const userCredential = await signInWithEmailAndPassword(auth, email, password);

// 2. Get ID token
const idToken = await userCredential.user.getIdToken();

// 3. Send to server to create session
const response = await fetch("/api/auth/login", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ idToken }),
});

// 4. Session cookie is automatically set
```

#### Login (Google)

```tsx
import { auth } from "@/lib/firebase";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";

const provider = new GoogleAuthProvider();
const userCredential = await signInWithPopup(auth, provider);
const idToken = await userCredential.user.getIdToken();

await fetch("/api/auth/login", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ idToken }),
});
```

#### Register

```tsx
import { auth } from "@/lib/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";

// 1. Create user
const userCredential = await createUserWithEmailAndPassword(
  auth,
  email,
  password,
);

// 2. Get ID token
const idToken = await userCredential.user.getIdToken();

// 3. Send to server to create profile
await fetch("/api/auth/register", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    idToken,
    name: "John Doe",
    phone: "+919876543210",
    role: "admin", // Only works on localhost
  }),
});
```

#### Check Session

```tsx
const response = await fetch("/api/auth/session");
const data = await response.json();

if (data.authenticated) {
  console.log("User:", data.user);
  // { userId, email, role, name }
}
```

#### Logout

```tsx
await fetch("/api/auth/logout", { method: "POST" });
```

### Server-Side

#### API Routes

```tsx
import { requireAuth, requireRole } from "@/lib/session";

export async function GET() {
  // Require authentication
  const session = await requireAuth(); // throws if not authenticated

  // Require specific role
  const session = await requireRole(["admin", "seller"]);

  return Response.json({ user: session });
}
```

#### Server Components

```tsx
import { getSession } from "@/lib/session";

export default async function Page() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  return <div>Welcome {session.name}</div>;
}
```

## API Routes

### POST /api/auth/login

Create session from Firebase ID token

**Request:**

```json
{
  "idToken": "eyJhbGciOiJSUzI1NiIsImtpZCI6..."
}
```

**Response:**

```json
{
  "success": true,
  "user": {
    "userId": "abc123",
    "email": "user@example.com",
    "role": "user",
    "name": "John Doe"
  }
}
```

### POST /api/auth/register

Create user profile and session

**Request:**

```json
{
  "idToken": "eyJhbGciOiJSUzI1NiIsImtpZCI6...",
  "name": "John Doe",
  "phone": "+919876543210",
  "role": "admin" // Only on localhost
}
```

**Response:**

```json
{
  "success": true,
  "user": {
    "userId": "abc123",
    "email": "user@example.com",
    "role": "admin",
    "name": "John Doe"
  }
}
```

### POST /api/auth/logout

Destroy session

**Response:**

```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

### GET /api/auth/session

Get current session

**Response:**

```json
{
  "authenticated": true,
  "user": {
    "userId": "abc123",
    "email": "user@example.com",
    "role": "user",
    "name": "John Doe"
  }
}
```

## Role-Based Access Control (RBAC)

### Roles

- **user**: Regular customer (default)
- **seller**: Can create and manage products/auctions
- **admin**: Full access to admin panel

### Setting Roles

**On Localhost (Development):**

- Role dropdown appears during registration
- Select any role for testing

**In Production:**

- All new registrations default to "user" role
- Admins must manually promote users via Firebase Console or Admin Panel

### Checking Roles (Server-side)

```tsx
import { requireRole } from "@/lib/session";

export async function POST() {
  // Only admins and sellers can access
  await requireRole(["admin", "seller"]);

  // Your logic here
}
```

## Security Best Practices

✅ **DO:**

- Always verify tokens server-side
- Use httpOnly cookies for sessions
- Set short session expiration (14 days max)
- Validate user input on server
- Use HTTPS in production
- Rotate service account keys periodically

❌ **DON'T:**

- Store tokens in localStorage/sessionStorage
- Send tokens in URL parameters
- Trust client-side role checks
- Expose service account keys in client code
- Use long session expiration times

## Troubleshooting

### "Invalid authentication token"

- Check if Firebase project ID matches
- Verify service account key is valid
- Ensure token hasn't expired

### "Unauthorized" on API calls

- Clear cookies and re-login
- Check session expiration
- Verify API route is using `requireAuth()`

### Role dropdown not showing

- Only appears on localhost/127.0.0.1
- Check browser console for errors

### Social login fails

- Verify OAuth credentials in Firebase Console
- Check authorized redirect URIs
- Ensure provider is enabled

## Files Reference

- `src/lib/firebase.ts` - Client-side Firebase setup
- `src/lib/firebase-admin.ts` - Server-side Firebase Admin SDK
- `src/lib/session.ts` - Session management utilities
- `src/app/api/auth/login/route.ts` - Login API
- `src/app/api/auth/register/route.ts` - Registration API
- `src/app/api/auth/logout/route.ts` - Logout API
- `src/app/api/auth/session/route.ts` - Session check API
- `src/components/auth/LoginForm.tsx` - Login form component
- `src/components/auth/RegisterForm.tsx` - Register form component

## Testing

1. **Test Registration:**

   - Open http://localhost:3000/register
   - Select "admin" role (localhost only)
   - Register with email/password or social login

2. **Test Login:**

   - Open http://localhost:3000/login
   - Login with registered credentials
   - Check session: `await fetch('/api/auth/session')`

3. **Test RBAC:**

   - Create protected API route with `requireRole(['admin'])`
   - Try accessing as different roles
   - Verify 403 Forbidden for unauthorized roles

4. **Test Logout:**
   - Call `/api/auth/logout`
   - Verify session is cleared
   - Confirm redirect to login

## Next Steps

1. Implement middleware for route protection
2. Add email verification flow
3. Add password reset functionality
4. Create admin panel for user management
5. Add audit logging for authentication events
