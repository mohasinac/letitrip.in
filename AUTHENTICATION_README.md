# Firebase Authentication System

This project implements a comprehensive authentication system using Firebase with support for email/password, phone/OTP, and Google OAuth authentication methods.

## Features

### Authentication Methods

- **Email/Password**: Traditional email and password authentication
- **Phone/OTP**: Phone number authentication with OTP verification
- **Google OAuth**: One-click Google sign-in
- **Role-based Access Control**: Support for admin, seller, and user roles

### Security Features

- **Secure Cookie Management**: Authentication tokens stored in secure cookies
- **Route Protection**: Middleware-based route protection
- **Role-based Guards**: Component-level access control
- **CSRF Protection**: Built-in protection against CSRF attacks
- **Age Verification**: 18+ age verification requirement

## Setup Instructions

### 1. Firebase Project Setup

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create a new project or use existing project
3. Enable Authentication with Email/Password and Google providers
4. Enable Firestore database
5. Create a service account for admin operations

### 2. Environment Configuration

1. Copy `.env.example` to `.env.local`
2. Fill in your Firebase configuration:

```bash
# Client configuration (from Firebase project settings)
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Admin configuration (from service account key)
FIREBASE_ADMIN_PROJECT_ID=your_project_id
FIREBASE_ADMIN_CLIENT_EMAIL=your_service_account@project.iam.gserviceaccount.com
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_KEY\n-----END PRIVATE KEY-----\n"
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Run Development Server

```bash
npm run dev
```

## Usage

### Authentication Pages

- **Login**: `/login` - Multi-method login page
- **Register**: `/register` - Multi-method registration page
- **Profile**: `/profile` - User profile management (protected)

### Authentication Context

The `AuthContext` provides comprehensive authentication state management:

```typescript
import { useAuth } from "@/contexts/AuthContext";

function MyComponent() {
  const { user, login, logout, loading, error } = useAuth();

  // Use authentication state and methods
}
```

### Enhanced Authentication Hook

The `useEnhancedAuth` hook provides additional functionality:

```typescript
import { useEnhancedAuth } from "@/hooks/auth/useEnhancedAuth";

function MyComponent() {
  const { user, sendOTP, verifyOTP, loginWithGoogle, hasRole, canAccess } =
    useEnhancedAuth();
}
```

### Route Protection

#### Middleware Protection

Routes are automatically protected by middleware in `middleware.ts`:

```typescript
// Protected routes require authentication
const protectedRoutes = ["/profile", "/dashboard", "/admin"];

// Auth routes redirect authenticated users
const authRoutes = ["/login", "/register"];
```

#### Component-level Guards

Use auth guards for fine-grained access control:

```typescript
import { UserGuard, AdminGuard, SellerGuard } from '@/components/auth/AuthGuard';

// Require any authenticated user
<UserGuard>
  <ProtectedContent />
</UserGuard>

// Require admin role
<AdminGuard>
  <AdminContent />
</AdminGuard>

// Require seller or admin role
<SellerGuard>
  <SellerContent />
</SellerGuard>
```

### API Protection

Protect API routes with Firebase authentication:

```typescript
import { createFirebaseHandler } from "@/lib/auth/firebase-api-auth";

export const GET = createFirebaseHandler(
  async (request, user) => {
    // user is automatically verified and includes role information
    return NextResponse.json({ data: "protected data" });
  },
  {
    requireAdmin: true, // Optional: require specific role
  }
);
```

### Role-based Access

The system supports three user roles:

- **User**: Basic authenticated user
- **Seller**: Can manage products and orders
- **Admin**: Full system access

Check user roles and permissions:

```typescript
const { user, hasRole, canAccess } = useEnhancedAuth();

if (hasRole("admin")) {
  // Admin-only functionality
}

if (canAccess("products_manage")) {
  // User can manage products
}
```

## API Endpoints

### Authentication

- `POST /api/auth/register` - User registration
- `GET /api/auth/me` - Get current user data
- `POST /api/auth/send-otp` - Send OTP to phone number
- `POST /api/auth/verify-otp` - Verify OTP and authenticate

### User Management

- `PUT /api/user/profile` - Update user profile
- `POST /api/auth/change-password` - Change user password

## Phone Authentication Flow

1. User enters phone number
2. System sends OTP via SMS
3. User enters 6-digit OTP
4. System verifies OTP and creates/authenticates user
5. User is automatically signed in

**Note**: For demo purposes, the OTP is set to `123456`. In production, integrate with a real SMS service.

## Cookie Management

The system uses secure cookies for authentication:

```typescript
import { authCookies } from "@/lib/auth/cookies";

// Store authentication token
authCookies.setAuthToken(token);

// Get user data from cookies
const userData = authCookies.getUserData();

// Check authentication status
const isAuthenticated = authCookies.isAuthenticated();

// Clear all auth data
authCookies.clearAll();
```

## Security Considerations

1. **HTTPS Only**: Use HTTPS in production for secure cookie transmission
2. **Token Expiration**: Firebase tokens automatically expire and refresh
3. **Role Verification**: Always verify roles server-side for sensitive operations
4. **Input Validation**: All user inputs are validated using Zod schemas
5. **CSRF Protection**: Cookies use SameSite attributes for CSRF protection

## Firestore Database Structure

Users are stored in Firestore with the following structure:

```json
{
  "users": {
    "user_id": {
      "id": "user_id",
      "name": "User Name",
      "email": "user@example.com",
      "phone": "+1234567890",
      "role": "user",
      "isEmailVerified": false,
      "isPhoneVerified": true,
      "addresses": [],
      "createdAt": "timestamp",
      "updatedAt": "timestamp",
      "profile": {
        "avatar": null,
        "bio": null,
        "preferences": {
          "notifications": true,
          "marketing": false
        }
      }
    }
  }
}
```

## Error Handling

The system includes comprehensive error handling:

- **Client-side**: Toast notifications for user feedback
- **Server-side**: Structured error responses with appropriate HTTP status codes
- **Validation**: Zod schema validation for all inputs
- **Firebase Errors**: Proper handling of Firebase authentication errors

## Testing

### Manual Testing

1. **Email Registration**:

   - Visit `/register`
   - Choose email method
   - Fill in details and register
   - Login with created credentials

2. **Phone Authentication**:

   - Visit `/login` or `/register`
   - Choose phone method
   - Enter phone number
   - Use OTP `123456` for demo

3. **Google OAuth**:

   - Click "Continue with Google"
   - Complete Google authentication flow
   - Account created automatically if not exists

4. **Role Protection**:
   - Try accessing `/profile` without authentication
   - Should redirect to login with return URL

## Deployment

### Environment Variables

Ensure all environment variables are set in your deployment platform:

```bash
# Production environment variables
NEXT_PUBLIC_FIREBASE_API_KEY=your_production_api_key
FIREBASE_ADMIN_PRIVATE_KEY=your_production_private_key
# ... other variables
```

### Firebase Security Rules

Set up proper Firestore security rules:

```javascript
// Firestore rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // Admin-only collections
    match /admin/{document=**} {
      allow read, write: if request.auth != null
        && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
  }
}
```

## Troubleshooting

### Common Issues

1. **Firebase Configuration**:

   - Verify all environment variables are set correctly
   - Check Firebase project settings match configuration

2. **Authentication Failures**:

   - Check browser console for Firebase errors
   - Verify Firebase Authentication is enabled for your providers

3. **Role Access Issues**:

   - Ensure user roles are set correctly in Firestore
   - Check custom claims are properly configured

4. **Cookie Issues**:
   - Verify secure cookie settings for your domain
   - Check SameSite cookie attributes

### Debug Mode

Enable debug logging by setting:

```bash
NODE_ENV=development
```

This will show detailed authentication logs in the browser console.

## Contributing

1. Follow the established code patterns
2. Add proper TypeScript types
3. Include error handling
4. Test authentication flows
5. Update documentation for new features

## License

This authentication system is part of the JustForView project and follows the project's licensing terms.
