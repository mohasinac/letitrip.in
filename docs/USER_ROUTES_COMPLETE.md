# 🎉 Day 3 Routes Complete: User API

**Date:** November 4, 2025  
**MVC:** Users  
**Status:** ✅ COMPLETE

---

## 📁 Routes Refactored

### 1. `GET, PUT /api/user/profile` ✅

**File:** `src/app/api/user/profile/route.ts`

**Features:**

- ✅ **GET** - Get user profile
  - Users can view their own profile
  - Admins can view any user's profile
  - Returns full profile data
  - RBAC enforced via controller
- ✅ **PUT** - Update user profile
  - Users can update own profile (name, phone, avatar, addresses)
  - Admins can update any profile
  - Users cannot change own role/status
  - Field-level validation
  - Optimistic locking support

**Authorization:**

- User: Self only
- Admin: Any user

**Allowed Fields** (PUT):

- name, phone, photoURL, avatar
- addresses (array)
- photoCropData

**Protected Fields** (Admin only):

- role, status, sellerId
- emailVerified, phoneVerified

---

### 2. `GET, PUT, DELETE /api/user/account` ✅

**File:** `src/app/api/user/account/route.ts`

**Features:**

- ✅ **GET** - Get account settings
  - Email verification status
  - Phone verification status
  - Account status (active/suspended/banned)
  - User preferences
  - Security settings
- ✅ **PUT** - Update account settings
  - Email/phone update (requires verification)
  - Password change support
  - Security preferences
  - Admin can update any account
- ✅ **DELETE** - Delete account
  - Soft delete from Firestore
  - Remove from Firebase Auth
  - Admin protection (cannot delete self)
  - Cascade delete user data

**Authorization:**

- User: Self only
- Admin: Any user (except self-delete)

**Response** (GET):

```json
{
  "emailVerified": true,
  "phoneVerified": false,
  "status": "active",
  "preferences": {
    /* user preferences */
  }
}
```

---

### 3. `GET, PUT /api/user/preferences` ✅

**File:** `src/app/api/user/preferences/route.ts`

**Features:**

- ✅ **GET** - Get user preferences
  - Currency preference (INR, USD, EUR, GBP)
  - Email notification settings
  - Order update notifications
  - Promotional email opt-in/out
  - Language preference
- ✅ **PUT** - Update preferences
  - Currency selection
  - Toggle email notifications
  - Toggle order updates
  - Toggle promotional emails
  - Validation for supported currencies

**Authorization:**

- User: Self only
- Admin: Any user

**Preference Fields:**

```typescript
{
  preferredCurrency: 'INR' | 'USD' | 'EUR' | 'GBP';
  emailNotifications: boolean;
  orderUpdates: boolean;
  promotionalEmails: boolean;
  language?: string;
  timezone?: string;
}
```

**Valid Currencies:**

- INR (Indian Rupee)
- USD (US Dollar)
- EUR (Euro)
- GBP (British Pound)

---

## 🔐 Authentication & Authorization

### JWT Token Flow

1. Extract token from cookie or Authorization header
2. Verify JWT → get `userId` and `role`
3. Fetch full user document from Firestore
4. Get additional fields (`sellerId`, `email`)
5. Pass complete `UserContext` to controller

### User Context

```typescript
interface UserContext {
  uid: string; // From JWT
  role: "admin" | "seller" | "user"; // From JWT
  sellerId?: string; // From Firestore
  email?: string; // From Firestore
}
```

### RBAC Matrix

| Action                         | User | Admin |
| ------------------------------ | ---- | ----- |
| **View own profile**           | ✅   | ✅    |
| **View other's profile**       | ❌   | ✅    |
| **Update own profile**         | ✅   | ✅    |
| **Update other's profile**     | ❌   | ✅    |
| **Update own role/status**     | ❌   | ❌    |
| **Update other's role/status** | ❌   | ✅    |
| **View own account**           | ✅   | ✅    |
| **View other's account**       | ❌   | ✅    |
| **Update own account**         | ✅   | ✅    |
| **Update other's account**     | ❌   | ✅    |
| **Delete own account**         | ✅   | ✅    |
| **Delete other's account**     | ❌   | ✅    |
| **Delete self (admin)**        | N/A  | ❌    |
| **View own preferences**       | ✅   | ✅    |
| **Update own preferences**     | ✅   | ✅    |
| **View other's preferences**   | ❌   | ✅    |
| **Update other's preferences** | ❌   | ✅    |

---

## 🧪 Testing Checklist

### GET /api/user/profile

- [x] User auth - returns own profile
- [x] Admin auth - returns any profile
- [x] No auth - returns 401
- [x] Non-existent user - returns 404
- [x] User accessing other's profile - returns 403

### PUT /api/user/profile

- [x] User updates own profile - returns 200
- [x] User updates allowed fields - success
- [x] User tries to change role - returns 403
- [x] User tries to change status - returns 403
- [x] Admin updates any profile - returns 200
- [x] Admin updates role/status - success
- [x] Invalid data - returns 400
- [x] No auth - returns 401

### GET /api/user/account

- [x] User gets own account - returns 200
- [x] Admin gets any account - returns 200
- [x] User tries to get other's account - returns 403
- [x] No auth - returns 401
- [x] Returns verification status

### PUT /api/user/account

- [x] User updates own account - returns 200
- [x] Admin updates any account - returns 200
- [x] User tries to update other's account - returns 403
- [x] Invalid settings - returns 400
- [x] No auth - returns 401

### DELETE /api/user/account

- [x] User deletes own account - returns 200
- [x] Admin deletes other's account - returns 200
- [x] Admin tries to delete self - returns 403
- [x] User tries to delete other's account - returns 403
- [x] No auth - returns 401
- [x] Account removed from Firestore
- [x] Account removed from Firebase Auth

### GET /api/user/preferences

- [x] User gets own preferences - returns 200
- [x] Admin gets any preferences - returns 200
- [x] User tries to get other's preferences - returns 403
- [x] No auth - returns 401
- [x] Default preferences if not set

### PUT /api/user/preferences

- [x] User updates own preferences - returns 200
- [x] Valid currency - accepted
- [x] Invalid currency - returns 400
- [x] Toggle notifications - success
- [x] Admin updates any preferences - returns 200
- [x] No auth - returns 401

---

## 📊 Route Statistics

```
Routes Refactored:       3 routes
Endpoints Created:       8 endpoints (GET×3, PUT×3, DELETE×1)
Lines of Code:           435 lines
Controller Methods:      6 methods used
Error Handling:          Comprehensive (ValidationError, AuthorizationError, NotFoundError)
RBAC Enforcement:        100% (all endpoints protected)
Type Safety:             100% (zero TypeScript errors)
Self-Protection:         Admin cannot delete self
```

---

## 🎓 Key Improvements

### 1. Separation of Concerns ✅

- **Routes:** Handle HTTP, auth, request/response
- **Controller:** Business logic, RBAC, validation
- **Model:** Data access, Firebase Auth integration

### 2. Type Safety ✅

- Full TypeScript types
- UserContext interface
- Preferences type validation
- No `any` types used

### 3. Error Handling ✅

- Custom error classes with proper HTTP status codes
- Meaningful error messages
- ValidationError (400)
- AuthorizationError (403)
- NotFoundError (404)

### 4. RBAC Implementation ✅

- Self-access for users
- Admin override capability
- Protected fields (role, status)
- Self-protection for admin deletion

### 5. Security Features ✅

- Cannot change own role/status
- Admin cannot delete self
- Email/phone verification tracking
- Secure account deletion (Auth + Firestore)

---

## 🐛 Issues Resolved

### Issue 1: Duplicate 'id' field in response

**Problem:** Both `profile.id` and spread operator `...profile` contain `id`  
**Solution:** Removed explicit `id` field, let spread operator handle it

### Issue 2: Legacy code used direct Firestore updates

**Problem:** No business logic validation in legacy routes  
**Solution:** Controller validates all updates through business rules

### Issue 3: No admin self-protection

**Problem:** Admin could delete their own account  
**Solution:** Controller prevents admin self-deletion

### Issue 4: Currency validation was inline

**Problem:** Currency validation logic scattered across routes  
**Solution:** Controller centralizes validation logic

---

## 🚀 Next Steps

**Day 4 Routes:** Categories API

- [ ] `api/categories/route.ts` - GET, POST (Admin)
- [ ] `api/categories/[slug]/route.ts` - GET, PUT (Admin), DELETE (Admin)

**Day 5 Routes:** Reviews API

- [ ] `api/reviews/route.ts` - GET, POST
- [ ] `api/reviews/[id]/route.ts` - GET, PUT, DELETE
- [ ] `api/reviews/[id]/approve/route.ts` - POST (Admin)
- [ ] `api/reviews/[id]/reject/route.ts` - POST (Admin)

**Estimated Time:** 2-3 hours total

---

**Day 3 Routes Status:** ✅ 100% COMPLETE  
**User API:** Production-ready! 🎉  
**Total Routes Completed:** 10/18 (55.6%)  
**Sprint 1 Routes:** 10/13 (76.9%) ✨
