# Authentication System - Quick Reference

## 🎯 What's Implemented

✅ **Server-Side Session Authentication** with NextAuth v5
✅ **Firebase Firestore** for user data storage  
✅ **Multiple Login Methods**: Email, Phone, Google, Apple
✅ **Role-Based Access Control** (user, admin, moderator)
✅ **Protected Routes** with middleware
✅ **Login & Registration Pages** with validation
✅ **Password Security** with bcrypt hashing
✅ **JWT Sessions** with 30-day expiration

---

## 📁 File Structure

```
src/
├── app/
│   ├── api/
│   │   └── auth/
│   │       ├── [...nextauth]/route.ts   # Auth API handler
│   │       └── register/route.ts         # Registration endpoint
│   ├── auth/
│   │   ├── login/page.tsx                # Login page
│   │   └── register/page.tsx             # Registration page
│   └── layout.tsx                        # Added AuthProvider
├── components/
│   ├── auth/
│   │   ├── ProtectedRoute.tsx            # Route protection HOC
│   │   ├── RoleGate.tsx                  # Role-based UI components
│   │   └── index.ts
│   └── providers/
│       └── AuthProvider.tsx              # Session provider wrapper
├── lib/
│   ├── auth.ts                           # NextAuth configuration
│   ├── auth-utils.ts                     # Auth helper functions
│   └── firebase/
│       ├── config.ts                     # Client Firebase config
│       └── admin.ts                      # Server Firebase Admin
├── types/
│   └── auth.ts                           # TypeScript types
└── middleware.ts                         # Route protection middleware
```

---

## 🔧 Setup Required

### 1. Install Dependencies ✅
Already installed:
- `next-auth@beta`
- `firebase`
- `firebase-admin`
- `@auth/firebase-adapter`
- `bcryptjs`

### 2. Configure Environment Variables

Copy `.env.local.example` to `.env.local` and fill in:

```env
# Firebase Client
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# Firebase Admin
FIREBASE_ADMIN_PROJECT_ID=
FIREBASE_ADMIN_CLIENT_EMAIL=
FIREBASE_ADMIN_PRIVATE_KEY=

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=

# OAuth (Optional)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
APPLE_ID=
APPLE_SECRET=
```

### 3. Firebase Setup

1. Create Firebase project
2. Enable Authentication (Email, Phone, Google, Apple)
3. Create Firestore database
4. Get service account key
5. Copy credentials to `.env.local`

**See detailed setup:** [Firebase Auth Setup Guide](./firebase-auth-setup.md)

---

## 🚀 Usage Examples

### Protect a Route

```tsx
import { ProtectedRoute } from '@/components/auth';

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <h1>Protected Content</h1>
    </ProtectedRoute>
  );
}
```

### Admin-Only Route

```tsx
import { ProtectedRoute } from '@/components/auth';

export default function AdminPage() {
  return (
    <ProtectedRoute requiredRole="admin">
      <h1>Admin Panel</h1>
    </ProtectedRoute>
  );
}
```

### Role-Based UI

```tsx
import { AdminOnly, RoleGate } from '@/components/auth';

function MyComponent() {
  return (
    <>
      <AdminOnly>
        <button>Admin Settings</button>
      </AdminOnly>
      
      <RoleGate allowedRoles={['admin', 'moderator']}>
        <button>Moderate</button>
      </RoleGate>
    </>
  );
}
```

### Get Current User

```tsx
'use client';
import { useCurrentUser } from '@/components/auth';

function Profile() {
  const { user, role, isAuthenticated } = useCurrentUser();
  
  return <p>Role: {role}</p>;
}
```

### Sign In/Out

```tsx
'use client';
import { signInWithCredentials, signOut } from '@/lib/auth-utils';

// Sign in
await signInWithCredentials({
  email: 'user@example.com',
  password: 'password123',
});

// Sign out
await signOut();
```

---

## 🔐 Authentication Flow

### Registration

1. User fills registration form (`/auth/register`)
2. Form validates data (email/phone, password strength, terms)
3. API creates user in Firestore with hashed password
4. Auto-login after successful registration
5. Redirect to dashboard

### Login

1. User enters email/phone + password (`/auth/login`)
2. Credentials verified against Firestore
3. JWT session created (30-day expiration)
4. Redirect to callback URL or dashboard

### OAuth (Google/Apple)

1. User clicks social login button
2. Redirected to OAuth provider
3. User authorizes
4. Account created/linked in Firestore
5. Session created, redirect to dashboard

---

## 👥 User Roles

### Default Role: `user`
- Basic access
- Can view own profile
- Standard permissions

### Role: `moderator`
- All user permissions
- Can moderate content
- Access to moderation tools

### Role: `admin`
- All moderator permissions
- Can manage users
- Change user roles
- Access admin panel
- Full system access

---

## 🛡️ Security Features

✅ **Password Hashing**: bcrypt with 12 salt rounds
✅ **Server-Side Sessions**: JWT stored in HTTP-only cookies
✅ **CSRF Protection**: Built into NextAuth
✅ **Middleware Protection**: Auto-redirect unauthenticated users
✅ **Role Verification**: Server-side role checks
✅ **Firestore Rules**: User data access restrictions
✅ **Input Validation**: Client and server validation
✅ **Secure Cookies**: HTTP-only, secure flag in production

---

## 📋 Next Steps

### Now that auth is set up, you can:

1. **Create Admin Dashboard**
   - User management interface
   - Role assignment
   - User statistics
   - Activity logs

2. **Add Email Verification**
   - Send verification emails
   - Verify email endpoint
   - Resend verification

3. **Implement Password Reset**
   - Forgot password flow
   - Reset token generation
   - Reset form

4. **Add Profile Management**
   - Update profile page
   - Change password
   - Upload photo
   - Delete account

5. **Build User Management (Admin)**
   - List all users
   - Filter/search users
   - Change user roles
   - Disable/enable accounts
   - View user activity

---

## 🧪 Testing

### Test Login

1. Start dev server: `npm run dev`
2. Go to `http://localhost:3000/auth/register`
3. Register a test account
4. Try logging in at `/auth/login`
5. Access protected routes

### Test Roles

1. Manually set role in Firestore:
   ```javascript
   {
     uid: "user_id",
     role: "admin"  // Change this
   }
   ```

2. Test admin routes and UI

### Test OAuth

1. Configure OAuth providers in `.env.local`
2. Test Google login button
3. Test Apple login button
4. Verify account creation in Firestore

---

## 🐛 Troubleshooting

**Build Errors:**
```bash
npm run build
# Check for TypeScript errors
```

**Auth Not Working:**
1. Check `.env.local` variables
2. Verify Firebase credentials
3. Check browser console for errors
4. Verify Firestore rules

**Sessions Not Persisting:**
1. Check `NEXTAUTH_SECRET` is set
2. Clear cookies and try again
3. Check for cookie blocking

---

## 📚 Documentation

- **[Firebase Auth Setup](./firebase-auth-setup.md)** - Complete setup guide
- **[NextAuth Docs](https://next-auth.js.org/)** - Official NextAuth documentation
- **[Firebase Docs](https://firebase.google.com/docs)** - Firebase documentation

---

## ✅ Checklist

Before going to production:

- [ ] Firebase project configured
- [ ] Environment variables set
- [ ] Firestore security rules updated
- [ ] OAuth providers configured
- [ ] Test all login methods
- [ ] Test role-based access
- [ ] Build succeeds (`npm run build`)
- [ ] Update `NEXTAUTH_URL` for production
- [ ] Generate strong `NEXTAUTH_SECRET`
- [ ] Enable Firebase authentication limits
- [ ] Set up monitoring and logging

---

**Authentication system is ready! Start building your admin panel.** 🚀
