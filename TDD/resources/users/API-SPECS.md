# Users Resource - API Specifications

## Overview

User management APIs for authentication, profile management, and admin operations.

---

## Endpoints

### Authentication

#### POST /api/auth/register

Register a new user account.

**Request Body**:

```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "displayName": "John Doe",
  "phone": "+919876543210"
}
```

**Response (201)**:

```json
{
  "success": true,
  "data": {
    "uid": "user_123",
    "email": "user@example.com",
    "displayName": "John Doe",
    "role": "user",
    "createdAt": "2024-11-29T10:00:00Z"
  },
  "message": "Registration successful"
}
```

**Error Responses**:

| Status | Code                | Message                  |
| ------ | ------------------- | ------------------------ |
| 400    | `INVALID_EMAIL`     | Invalid email format     |
| 400    | `WEAK_PASSWORD`     | Password too weak        |
| 409    | `EMAIL_EXISTS`      | Email already registered |
| 429    | `TOO_MANY_REQUESTS` | Rate limit exceeded      |

---

#### POST /api/auth/login

Authenticate user and create session.

**Request Body**:

```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Response (200)**:

```json
{
  "success": true,
  "data": {
    "user": {
      "uid": "user_123",
      "email": "user@example.com",
      "displayName": "John Doe",
      "role": "user"
    },
    "token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

**Error Responses**:

| Status | Code                  | Message                   |
| ------ | --------------------- | ------------------------- |
| 401    | `INVALID_CREDENTIALS` | Invalid email or password |
| 403    | `ACCOUNT_BANNED`      | Account has been banned   |
| 403    | `EMAIL_NOT_VERIFIED`  | Please verify your email  |

---

#### POST /api/auth/logout

End user session.

**Headers**: `Authorization: Bearer <token>`

**Response (200)**:

```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

#### GET /api/auth/session

Get current session info.

**Headers**: `Authorization: Bearer <token>`

**Response (200)**:

```json
{
  "success": true,
  "data": {
    "uid": "user_123",
    "email": "user@example.com",
    "displayName": "John Doe",
    "role": "user",
    "shopId": null,
    "verified": true
  }
}
```

---

### User Profile

#### GET /api/user/profile

Get current user's profile.

**Headers**: `Authorization: Bearer <token>`

**Response (200)**:

```json
{
  "success": true,
  "data": {
    "uid": "user_123",
    "email": "user@example.com",
    "displayName": "John Doe",
    "phone": "+919876543210",
    "avatar": "https://storage.jfv.in/avatars/user_123.jpg",
    "role": "user",
    "addresses": [],
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-11-29T10:00:00Z"
  }
}
```

---

#### PATCH /api/user/profile

Update current user's profile.

**Headers**: `Authorization: Bearer <token>`

**Request Body**:

```json
{
  "displayName": "John Smith",
  "phone": "+919876543211"
}
```

**Response (200)**:

```json
{
  "success": true,
  "data": {
    "uid": "user_123",
    "displayName": "John Smith",
    "phone": "+919876543211",
    "updatedAt": "2024-11-29T11:00:00Z"
  },
  "message": "Profile updated successfully"
}
```

---

### User Addresses

#### GET /api/user/addresses

Get user's saved addresses.

**Headers**: `Authorization: Bearer <token>`

**Response (200)**:

```json
{
  "success": true,
  "data": [
    {
      "id": "addr_001",
      "type": "home",
      "name": "John Doe",
      "phone": "+919876543210",
      "addressLine1": "123 Main Street",
      "addressLine2": "Apt 4B",
      "city": "Mumbai",
      "state": "Maharashtra",
      "pincode": "400001",
      "country": "India",
      "isDefault": true
    }
  ]
}
```

---

#### POST /api/user/addresses

Add a new address.

**Headers**: `Authorization: Bearer <token>`

**Request Body**:

```json
{
  "type": "home",
  "name": "John Doe",
  "phone": "+919876543210",
  "addressLine1": "123 Main Street",
  "addressLine2": "Apt 4B",
  "city": "Mumbai",
  "state": "Maharashtra",
  "pincode": "400001",
  "isDefault": true
}
```

**Response (201)**:

```json
{
  "success": true,
  "data": {
    "id": "addr_002",
    "type": "home",
    "name": "John Doe",
    "createdAt": "2024-11-29T10:00:00Z"
  },
  "message": "Address added successfully"
}
```

---

#### PATCH /api/user/addresses/:id

Update an existing address.

**Headers**: `Authorization: Bearer <token>`

**Request Body**:

```json
{
  "phone": "+919876543211",
  "isDefault": true
}
```

**Response (200)**:

```json
{
  "success": true,
  "data": {
    "id": "addr_001",
    "phone": "+919876543211",
    "isDefault": true,
    "updatedAt": "2024-11-29T11:00:00Z"
  }
}
```

---

#### DELETE /api/user/addresses/:id

Delete an address.

**Headers**: `Authorization: Bearer <token>`

**Response (200)**:

```json
{
  "success": true,
  "message": "Address deleted successfully"
}
```

---

### Admin User Management

#### GET /api/users

List all users (Admin only).

**Headers**: `Authorization: Bearer <admin_token>`

**Query Parameters**:

| Param  | Type   | Default   | Description            |
| ------ | ------ | --------- | ---------------------- |
| page   | number | 1         | Page number            |
| limit  | number | 20        | Items per page         |
| role   | string | -         | Filter by role         |
| status | string | -         | active/inactive/banned |
| search | string | -         | Search by name/email   |
| sortBy | string | createdAt | Sort field             |
| order  | string | desc      | asc/desc               |

**Response (200)**:

```json
{
  "success": true,
  "data": [
    {
      "uid": "user_123",
      "email": "user@example.com",
      "displayName": "John Doe",
      "role": "user",
      "isActive": true,
      "isBanned": false,
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8,
    "hasMore": true
  }
}
```

---

#### GET /api/users/:id

Get user by ID (Admin only).

**Headers**: `Authorization: Bearer <admin_token>`

**Response (200)**:

```json
{
  "success": true,
  "data": {
    "uid": "user_123",
    "email": "user@example.com",
    "displayName": "John Doe",
    "phone": "+919876543210",
    "role": "user",
    "isActive": true,
    "isBanned": false,
    "shopId": null,
    "addresses": [],
    "orderCount": 15,
    "totalSpent": 250000,
    "createdAt": "2024-01-01T00:00:00Z",
    "lastLoginAt": "2024-11-29T09:00:00Z"
  }
}
```

---

#### PATCH /api/users/:id/role

Update user role (Admin only).

**Headers**: `Authorization: Bearer <admin_token>`

**Request Body**:

```json
{
  "role": "seller"
}
```

**Response (200)**:

```json
{
  "success": true,
  "data": {
    "uid": "user_123",
    "role": "seller",
    "updatedAt": "2024-11-29T10:00:00Z"
  },
  "message": "User role updated"
}
```

---

#### POST /api/users/:id/ban

Ban a user (Admin only).

**Headers**: `Authorization: Bearer <admin_token>`

**Request Body**:

```json
{
  "reason": "Violation of terms of service",
  "duration": "permanent"
}
```

**Response (200)**:

```json
{
  "success": true,
  "data": {
    "uid": "user_123",
    "isBanned": true,
    "banReason": "Violation of terms of service",
    "bannedAt": "2024-11-29T10:00:00Z"
  },
  "message": "User has been banned"
}
```

---

#### DELETE /api/users/:id/ban

Unban a user (Admin only).

**Headers**: `Authorization: Bearer <admin_token>`

**Response (200)**:

```json
{
  "success": true,
  "data": {
    "uid": "user_123",
    "isBanned": false
  },
  "message": "User has been unbanned"
}
```

---

#### POST /api/users/bulk

Bulk user operations (Admin only).

**Headers**: `Authorization: Bearer <admin_token>`

**Request Body**:

```json
{
  "action": "ban",
  "userIds": ["user_123", "user_456", "user_789"],
  "reason": "Spam accounts"
}
```

**Supported Actions**: `ban`, `unban`, `activate`, `deactivate`, `delete`

**Response (200)**:

```json
{
  "success": true,
  "data": {
    "processed": 3,
    "failed": 0,
    "results": [
      { "uid": "user_123", "success": true },
      { "uid": "user_456", "success": true },
      { "uid": "user_789", "success": true }
    ]
  }
}
```

---

## RBAC Permissions

| Endpoint                   | Guest | User | Seller | Admin |
| -------------------------- | ----- | ---- | ------ | ----- |
| POST /auth/register        | ✅    | ✅   | ✅     | ✅    |
| POST /auth/login           | ✅    | ✅   | ✅     | ✅    |
| POST /auth/logout          | ❌    | ✅   | ✅     | ✅    |
| GET /auth/session          | ❌    | ✅   | ✅     | ✅    |
| GET /user/profile          | ❌    | ✅   | ✅     | ✅    |
| PATCH /user/profile        | ❌    | ✅   | ✅     | ✅    |
| GET /user/addresses        | ❌    | ✅   | ✅     | ✅    |
| POST /user/addresses       | ❌    | ✅   | ✅     | ✅    |
| PATCH /user/addresses/:id  | ❌    | ✅\* | ✅\*   | ✅    |
| DELETE /user/addresses/:id | ❌    | ✅\* | ✅\*   | ✅    |
| GET /users                 | ❌    | ❌   | ❌     | ✅    |
| GET /users/:id             | ❌    | ❌   | ❌     | ✅    |
| PATCH /users/:id/role      | ❌    | ❌   | ❌     | ✅    |
| POST /users/:id/ban        | ❌    | ❌   | ❌     | ✅    |
| DELETE /users/:id/ban      | ❌    | ❌   | ❌     | ✅    |
| POST /users/bulk           | ❌    | ❌   | ❌     | ✅    |

\*Owner only

---

## Service Usage

```typescript
import { authService, usersService } from "@/services";

// Authentication
await authService.register({ email, password, displayName });
await authService.login({ email, password });
await authService.logout();
const session = await authService.getSession();

// Profile
const profile = await usersService.getProfile();
await usersService.updateProfile({ displayName });

// Addresses
const addresses = await usersService.getAddresses();
await usersService.addAddress(addressData);
await usersService.updateAddress(id, addressData);
await usersService.deleteAddress(id);

// Admin operations
const users = await usersService.list({ page: 1, limit: 20 });
const user = await usersService.getById(userId);
await usersService.updateRole(userId, "seller");
await usersService.ban(userId, { reason: "..." });
await usersService.unban(userId);
await usersService.bulk({ action: "ban", userIds: [...] });
```

---

## Validation Rules

### Registration

- **email**: Valid email format, max 255 chars
- **password**: Min 8 chars, 1 uppercase, 1 lowercase, 1 number
- **displayName**: 2-50 chars, alphanumeric + spaces
- **phone**: Valid Indian mobile (+91XXXXXXXXXX)

### Profile Update

- **displayName**: 2-50 chars, alphanumeric + spaces
- **phone**: Valid Indian mobile (+91XXXXXXXXXX)

### Address

- **name**: 2-100 chars, required
- **phone**: Valid Indian mobile, required
- **addressLine1**: 5-200 chars, required
- **addressLine2**: Max 200 chars, optional
- **city**: 2-100 chars, required
- **state**: Valid Indian state, required
- **pincode**: 6 digits, valid Indian pincode, required

---

## Related Files

- `/src/services/users.service.ts`
- `/src/services/auth.service.ts`
- `/src/app/api/auth/`
- `/src/app/api/users/`
- `/src/app/api/user/`
- `/src/types/backend/user.types.ts`
