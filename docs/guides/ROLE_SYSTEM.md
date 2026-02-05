# Role-Based Access Control (RBAC) System

**Complete guide to the 4-role permission system**

---

## Overview

The application uses a 4-tier role system with hierarchical permissions:

| Role          | Level | Permissions                  | Can Assign Roles |
| ------------- | ----- | ---------------------------- | ---------------- |
| **user**      | 0     | Basic user access            | None             |
| **seller**    | 1     | Can list products/services   | None             |
| **moderator** | 2     | Can promote users to sellers | seller only      |
| **admin**     | 3     | Full system access           | All roles        |

---

## Role Definitions

### 1. **User** (Default Role)

- Default role for all new registrations
- Basic application access
- Can view content, make bookings
- Cannot change other users' roles

### 2. **Seller**

- Can list products/services for sale
- Enhanced dashboard with seller tools
- Can manage their own listings
- Assigned by moderators or admins

### 3. **Moderator**

- Can manage regular users
- **Limited Permission**: Can only promote users to seller role
- Cannot assign moderator or admin roles
- Cannot demote sellers back to users (admins only)
- Useful for community management

### 4. **Admin**

- Full system access
- Can assign ANY role (including admin)
- Can enable/disable accounts
- Can modify all user data
- Special: `admin@letitrip.in` gets this role automatically

---

## Special Admin Email

**Email**: `admin@letitrip.in`

When this email registers (via ANY auth method), it automatically receives the `admin` role:

```typescript
// Automatic admin assignment
if (email === "admin@letitrip.in") {
  role = "admin";
} else {
  role = "user"; // Everyone else
}
```

**Works with**:

- ✅ Email/Password registration
- ✅ Google OAuth registration
- ✅ Apple OAuth registration

---

## Permission Checks

### API Route Protection

```typescript
import { createApiHandler } from "@/lib/api/api-handler";

// Admin-only endpoint
export const GET = createApiHandler({
  auth: true,
  roles: ["admin"], // Only admins
  handler: async ({ user }) => {
    // Your code
  },
});

// Admin OR Moderator
export const PATCH = createApiHandler({
  auth: true,
  roles: ["admin", "moderator"], // Both roles allowed
  handler: async ({ user }) => {
    // Your code
  },
});
```

### Role Change Permissions

Use `canChangeRole()` to check if a user can change someone's role:

```typescript
import { canChangeRole } from "@/lib/security/authorization";

const currentUserRole = "moderator";
const targetCurrentRole = "user";
const targetNewRole = "seller";

// Returns true - moderator CAN change user → seller
const allowed = canChangeRole(
  currentUserRole,
  targetCurrentRole,
  targetNewRole,
);

// Example: moderator trying to make someone admin
const notAllowed = canChangeRole("moderator", "user", "admin"); // false
```

### Permission Matrix

| Assigner Role | Target: user → seller | Target: user → moderator | Target: user → admin | Target: seller → user |
| ------------- | --------------------- | ------------------------ | -------------------- | --------------------- |
| **user**      | ❌ No                 | ❌ No                    | ❌ No                | ❌ No                 |
| **seller**    | ❌ No                 | ❌ No                    | ❌ No                | ❌ No                 |
| **moderator** | ✅ Yes                | ❌ No                    | ❌ No                | ❌ No                 |
| **admin**     | ✅ Yes                | ✅ Yes                   | ✅ Yes               | ✅ Yes                |

---

## Implementation Files

### 1. Type Definitions

**File**: `src/types/auth.ts`

```typescript
export type UserRole = "user" | "seller" | "moderator" | "admin";
```

### 2. Authorization Utilities

**File**: `src/lib/security/authorization.ts`

```typescript
// Check if user has required role
export function requireRole(user: any, roles: UserRole | UserRole[]): void;

// Check if user can change target's role
export function canChangeRole(
  currentUserRole: UserRole,
  targetCurrentRole: UserRole,
  targetNewRole: UserRole,
): boolean;

// Get role hierarchy level
export function getRoleLevel(role: UserRole): number;
```

### 3. Auto-Assignment Logic

**File**: `src/lib/firebase/auth-helpers.ts`

```typescript
// Helper: Get default role based on email
function getDefaultRole(email: string | null): UserRole {
  if (email === "admin@letitrip.in") {
    return "admin";
  }
  return "user";
}

// Used in all registration functions:
await createUserProfile(user, {
  role: getDefaultRole(user.email),
});
```

### 4. Admin API Route

**File**: `src/app/api/admin/users/[uid]/route.ts`

```typescript
export const PATCH = createApiHandler({
  auth: true,
  roles: ["admin", "moderator"], // Both can access
  schema: updateUserSchema,
  handler: async ({ request, body, user }) => {
    const uid = request.url.split("/").pop()!;

    // Prevent self-modification
    if (user && user.uid === uid) {
      return errorResponse("You cannot modify your own account", 403);
    }

    // Get target user
    const targetUser = await userRepository.findById(uid);

    // Check role change permissions
    if (body!.role && user) {
      const canChange = canChangeRole(user.role, targetUser.role, body!.role);

      if (!canChange) {
        return errorResponse(
          "You do not have permission to assign this role",
          403,
        );
      }
    }

    // Update user
    await userRepository.update(uid, body!);
    return successResponse(updatedUser, "User updated successfully");
  },
});
```

### 5. Admin UI

**File**: `src/app/admin/users/page.tsx`

Role dropdown in user management:

```tsx
<select
  value={u.role}
  onChange={(e) => handleUpdateUser(u.uid, { role: e.target.value })}
>
  <option value="user">User</option>
  <option value="seller">Seller</option>
  <option value="moderator">Moderator</option>
  <option value="admin">Admin</option>
</select>
```

---

## Testing Scenarios

### 1. Test Admin Email Auto-Assignment

```bash
# Register with admin@letitrip.in
1. Go to /auth/register
2. Enter: admin@letitrip.in, password, name
3. Register
4. Check Firebase Console → Firestore → users collection
5. Verify role = "admin" ✅
```

### 2. Test Moderator Permissions

```bash
# Create moderator account
1. Register as user1@test.com
2. As admin, change role to "moderator"
3. Sign out, sign in as user1@test.com
4. Go to /admin/users
5. Try to change a user's role to "seller" → Should succeed ✅
6. Try to change a user's role to "admin" → Should fail with 403 ❌
```

### 3. Test Self-Modification Prevention

```bash
# Try to change own role
1. Sign in as admin
2. Go to /admin/users
3. Find your own account in the list
4. Role dropdown should be disabled ✅
5. Try API call: PATCH /api/admin/users/{your-uid} { role: "user" }
6. Should return: "You cannot modify your own account" ❌
```

---

## Security Notes

### ✅ DO:

- Use `requireRole()` on all protected API routes
- Check permissions before role changes with `canChangeRole()`
- Prevent users from modifying their own role
- Log all role changes for audit trail

### ❌ DON'T:

- Allow client-side role changes without server validation
- Trust role from client request - always verify on server
- Skip permission checks assuming frontend will prevent it
- Allow users to escalate their own privileges

---

## Future Enhancements

Consider adding:

1. **Role Change History**
   - Track who changed roles and when
   - Firestore subcollection: `users/{uid}/roleHistory`

2. **Custom Permissions**
   - Fine-grained permissions beyond roles
   - Example: `canManageTrips`, `canViewAnalytics`

3. **Temporary Roles**
   - Time-limited moderator access
   - Auto-revoke after expiration

4. **Role Requests**
   - Users can request seller role
   - Moderators approve/deny requests

5. **Audit Logging**
   - Log all permission checks
   - Monitor failed authorization attempts

---

## API Reference

### Check User Role

```typescript
GET /api/auth/session
Response: {
  user: {
    uid: string,
    email: string,
    role: "user" | "seller" | "moderator" | "admin"
  }
}
```

### Update User Role (Admin/Moderator)

```typescript
PATCH /api/admin/users/{uid}
Headers: { Cookie: "session=..." }
Body: {
  role?: "user" | "seller" | "moderator" | "admin",
  disabled?: boolean
}
Response: {
  success: true,
  data: { /* updated user */ }
}
```

### List Users (Admin/Moderator)

```typescript
GET /api/admin/users?page=1&pageSize=20&role=user
Headers: { Cookie: "session=..." }
Response: {
  success: true,
  data: {
    users: [/* user list */],
    pagination: { page, pageSize, totalPages, totalUsers }
  }
}
```

---

## Troubleshooting

### Issue: admin@letitrip.in not getting admin role

**Check**:

1. Is `getDefaultRole()` function implemented?
2. Is it called in ALL registration methods?
3. Check Firestore users collection
4. Clear cookies and re-register

### Issue: Moderator can't change roles

**Check**:

1. Is moderator role set in Firestore?
2. Is API route allowing `roles: ['admin', 'moderator']`?
3. Check browser console for 403 errors
4. Verify `canChangeRole()` logic

### Issue: Users can change their own role

**Check**:

1. Is `user.uid === targetUid` check in place?
2. Is role dropdown disabled in UI for own account?
3. Check API route for self-modification prevention

---

## Summary

✅ **4 roles**: user (default), seller, moderator, admin  
✅ **Auto-admin**: admin@letitrip.in → admin role  
✅ **Permissions**: Moderator can only assign seller  
✅ **Security**: Self-modification prevented  
✅ **UI**: Admin dashboard shows all roles

**The role system is production-ready!** 🎉
