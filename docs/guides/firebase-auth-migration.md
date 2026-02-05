# Firebase Authentication Migration Guide

## Overview

This project now uses **Firebase Authentication** instead of NextAuth for a simpler, more integrated authentication system.

## Benefits of Firebase Auth

### 1. **No OAuth Setup Required**
- ✅ Google Sign-In works immediately (no Client ID/Secret needed)
- ✅ Apple Sign-In works immediately (no Apple Developer account needed)
- ✅ All providers configured through Firebase Console

### 2. **Single Authentication System**
- ✅ One SDK for client and server
- ✅ One dashboard (Firebase Console)
- ✅ No duplicate authentication layers

### 3. **Better Integration**
- ✅ UIDs match between Auth and Firestore
- ✅ Security rules integrate seamlessly
- ✅ Real-time auth state listeners
- ✅ Offline persistence

### 4. **Simpler Configuration**
- ✅ Only need Firebase config (already in .env)
- ✅ No additional OAuth credentials
- ✅ No NextAuth secret key

---

## Setup Instructions

### Step 1: Enable Auth Providers in Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Navigate to **Authentication** → **Sign-in method**
4. Enable the providers you want:
   - ✅ **Email/Password** (click Enable)
   - ✅ **Google** (click Enable - no setup required!)
   - ✅ **Apple** (click Enable - no setup required!)
   - ✅ **Phone** (optional)

**That's it!** No OAuth credentials needed.

### Step 2: Verify Environment Variables

Your `.env.local` should already have these (no changes needed):

```env
# Firebase Configuration (Client-side)
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Firebase Admin (Server-side)
FIREBASE_ADMIN_PROJECT_ID=your_project_id
FIREBASE_ADMIN_CLIENT_EMAIL=your_service_account@project.iam.gserviceaccount.com
FIREBASE_ADMIN_PRIVATE_KEY=your_private_key
```

**No additional OAuth credentials required!**

---

## Usage Examples

### Sign In with Email

```typescript
import { signInWithEmail } from '@/lib/firebase/auth-helpers';

try {
  const userCredential = await signInWithEmail(email, password);
  console.log('Signed in:', userCredential.user);
} catch (error) {
  console.error('Sign in failed:', error.message);
}
```

### Sign In with Google

```typescript
import { signInWithGoogle } from '@/lib/firebase/auth-helpers';

try {
  const userCredential = await signInWithGoogle();
  console.log('Signed in with Google:', userCredential.user);
} catch (error) {
  console.error('Google sign in failed:', error.message);
}
```

### Sign In with Apple

```typescript
import { signInWithApple } from '@/lib/firebase/auth-helpers';

try {
  const userCredential = await signInWithApple();
  console.log('Signed in with Apple:', userCredential.user);
} catch (error) {
  console.error('Apple sign in failed:', error.message);
}
```

### Register New User

```typescript
import { registerWithEmail } from '@/lib/firebase/auth-helpers';

try {
  const userCredential = await registerWithEmail(email, password, displayName);
  console.log('User registered:', userCredential.user);
  // Verification email sent automatically
} catch (error) {
  console.error('Registration failed:', error.message);
}
```

### Listen to Auth State

```typescript
import { onAuthStateChanged } from '@/lib/firebase/auth-helpers';

const unsubscribe = onAuthStateChanged((user) => {
  if (user) {
    console.log('User signed in:', user);
  } else {
    console.log('User signed out');
  }
});

// Cleanup
return () => unsubscribe();
```

---

## Migration Checklist

### ✅ Completed
- [x] Firebase Auth helpers created (`src/lib/firebase/auth-helpers.ts`)
- [x] No additional environment variables needed
- [x] All credentials stay in Firebase config

### 🔄 In Progress
- [ ] Update login page to use Firebase Auth
- [ ] Update register page to use Firebase Auth
- [ ] Create server-side session middleware
- [ ] Remove NextAuth dependencies

### 📋 To Do
- [ ] Test Google Sign-In
- [ ] Test Apple Sign-In
- [ ] Test Email/Password
- [ ] Update documentation
- [ ] Remove NextAuth routes

---

## Comparison: NextAuth vs Firebase Auth

| Feature | NextAuth | Firebase Auth |
|---------|----------|---------------|
| **Google Setup** | Manual OAuth (Console + credentials) | Click "Enable" in Firebase |
| **Apple Setup** | $99/year + manual config | Click "Enable" in Firebase |
| **Environment Vars** | 5+ OAuth variables | 0 extra (use Firebase config) |
| **Authentication** | next-auth + adapters | Firebase SDK |
| **Session Management** | JWT + database adapter | Firebase tokens |
| **Maintenance** | Two systems (Auth + DB) | One system |
| **Learning Curve** | NextAuth docs + OAuth setup | Firebase docs |

---

## Server-Side Authentication

### Verify Tokens on Server

```typescript
import { adminAuth } from '@/lib/firebase/admin';

// In API route or server component
const idToken = request.headers.get('Authorization')?.replace('Bearer ', '');

try {
  const decodedToken = await adminAuth.verifyIdToken(idToken);
  const uid = decodedToken.uid;
  // User is authenticated
} catch (error) {
  // Invalid token
  return new Response('Unauthorized', { status: 401 });
}
```

### Get User from Session

```typescript
import { cookies } from 'next/headers';
import { adminAuth } from '@/lib/firebase/admin';

// In Server Component or API Route
const sessionCookie = cookies().get('session')?.value;

if (sessionCookie) {
  try {
    const decodedClaims = await adminAuth.verifySessionCookie(sessionCookie);
    const uid = decodedClaims.uid;
    // User is authenticated
  } catch (error) {
    // Invalid session
  }
}
```

---

## Troubleshooting

### Google Sign-In Not Working

1. Verify Google provider is **enabled** in Firebase Console
2. Check browser allows pop-ups
3. Verify `authDomain` is correct in Firebase config
4. Try in incognito mode (clears cookies)

### Apple Sign-In Not Working

1. Verify Apple provider is **enabled** in Firebase Console
2. Check browser allows pop-ups
3. Apple Sign-In requires **HTTPS** in production
4. Try in incognito mode

### "Pop-up blocked" Error

```typescript
// Add user feedback
try {
  await signInWithGoogle();
} catch (error) {
  if (error.message.includes('popup-blocked')) {
    alert('Please allow pop-ups for this site and try again');
  }
}
```

---

## Security Notes

### Client-Side

- Firebase Auth tokens are automatically refreshed
- Tokens stored securely in browser
- Automatic token expiration handling

### Server-Side

- Always verify tokens on server
- Use Firebase Admin SDK for privileged operations
- Check custom claims for roles/permissions

### Environment Variables

- ✅ Firebase config uses `NEXT_PUBLIC_*` (safe for client)
- ✅ Admin SDK uses server-only variables
- ✅ No OAuth secrets needed (Firebase handles internally)

---

## Next Steps

1. **Enable providers** in Firebase Console (2 minutes)
2. **Update login/register pages** to use new helpers
3. **Test authentication flows**
4. **Remove NextAuth** dependencies
5. **Enjoy simpler auth!** 🎉

---

**No OAuth setup. No additional credentials. Just Firebase.**
