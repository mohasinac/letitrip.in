# API Endpoint Fixes - Profile Pages

## Issue

Profile edit page was calling wrong API endpoints causing "Failed to update profile" errors.

## Root Cause

The profile pages were calling `/api/users/profile` (plural) but the actual API route is `/api/user/profile` (singular).

## Files Fixed

### 1. Profile Edit Page (`src/app/profile/edit/page.tsx`)

**Changed:**

- `/api/users/profile` → `/api/user/profile`

### 2. Profile Dashboard (`src/app/profile/page.tsx`)

**Changed:**

- `/api/users/profile` → `/api/user/profile`
- Response handling: `data.user` → `data.data` (to match API response structure)

### 3. Settings Page (`src/app/profile/settings/page.tsx`)

**Changed:**

- `/api/users/preferences` → `/api/user/preferences`
- Removed `userId` from request body (now uses Firebase Auth token)

### 4. Preferences API (`src/app/api/user/preferences/route.ts`)

**Updated to:**

- Use `verifyFirebaseToken()` for authentication
- Use Firebase Admin SDK instead of client SDK
- Extract user ID from Firebase token instead of request body
- Return consistent error format with `success` field

## API Endpoint Structure

### Correct Endpoints

```
GET  /api/user/profile       - Get user profile
PUT  /api/user/profile       - Update user profile
PUT  /api/user/preferences   - Update user preferences
GET  /api/orders/track       - Track order (public)
```

### Authentication

All `/api/user/*` endpoints now require:

1. Authorization header: `Bearer <firebase-id-token>`
2. Token verification via `verifyFirebaseToken()`
3. User ID extracted from verified token

### Response Format

All endpoints return consistent format:

```typescript
{
  success: boolean,
  data?: any,
  error?: string
}
```

## Testing

✅ Profile page loads user data
✅ Edit profile updates successfully
✅ Settings save preferences
✅ Currency changes persist
✅ Notification preferences save
✅ All endpoints use correct authentication

## Security Improvements

- Removed need to pass `userId` in request body
- User identity verified from Firebase Auth token
- All operations scoped to authenticated user
- No risk of user A modifying user B's data

## Status

All profile page API endpoints are now working correctly with proper Firebase integration.
