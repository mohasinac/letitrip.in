# Epic E001: User Management

## Overview

Complete user lifecycle management including registration, authentication, profile management, and administrative controls.

## Scope

- User registration and authentication
- Profile management
- Address management
- Session management
- Admin user controls (ban, role change, bulk operations)

## User Roles Involved

- **Admin**: Full user management
- **Seller**: Own profile only
- **User**: Own profile only
- **Guest**: Registration only

---

## Features

### F001.1: User Registration

**Priority**: P0 (Critical)

#### User Stories

**US001.1.1**: Guest Registration

```
As a guest
I want to register with email and password
So that I can access the platform as a user

Acceptance Criteria:
- Given I am on the registration page
- When I enter valid email, password, and confirm password
- Then my account is created and I am logged in
- And I receive a verification email

Validation Rules:
- Email must be valid format and unique
- Password minimum 8 characters
- Password must contain uppercase, lowercase, number
- Display name required (2-50 characters)
```

**US001.1.2**: Email Verification

```
As a newly registered user
I want to verify my email
So that my account is fully activated

Acceptance Criteria:
- Given I received a verification email
- When I click the verification link
- Then my email is marked as verified
- And I can access all user features
```

### F001.2: User Authentication

**Priority**: P0 (Critical)

#### User Stories

**US001.2.1**: User Login

```
As a registered user
I want to login with email and password
So that I can access my account

Acceptance Criteria:
- Given I am on the login page
- When I enter valid credentials
- Then I am authenticated and redirected to dashboard
- And my session is created

Error Cases:
- Invalid email: "Email not found"
- Invalid password: "Incorrect password"
- Account banned: "Your account has been suspended"
- Email not verified: "Please verify your email"
```

**US001.2.2**: User Logout

```
As a logged-in user
I want to logout
So that my session is terminated securely

Acceptance Criteria:
- Given I am logged in
- When I click logout
- Then my session is terminated
- And I am redirected to home page
- And authentication cookies are cleared
```

**US001.2.3**: Session Management

```
As a user
I want to view and manage my active sessions
So that I can secure my account

Acceptance Criteria:
- Given I am on the settings page
- When I view active sessions
- Then I see all devices with active sessions
- And I can terminate any session remotely
```

### F001.3: Profile Management

**Priority**: P1 (High)

#### User Stories

**US001.3.1**: View Profile

```
As a logged-in user
I want to view my profile
So that I can see my account information

Acceptance Criteria:
- Given I am on my profile page
- When the page loads
- Then I see my name, email, photo, and other details
- And I see my stats (orders, reviews, etc.)
```

**US001.3.2**: Update Profile

```
As a logged-in user
I want to update my profile information
So that my account reflects current information

Acceptance Criteria:
- Given I am on the edit profile page
- When I update my details and save
- Then my profile is updated
- And I see a success message

Editable Fields:
- Display name
- First name, Last name
- Phone number
- Bio
- Location
- Profile photo
```

**US001.3.3**: Update Notification Preferences

```
As a logged-in user
I want to manage my notification preferences
So that I receive only relevant notifications

Acceptance Criteria:
- Given I am on settings page
- When I toggle notification preferences
- Then my preferences are saved
- And future notifications respect these settings

Options:
- Email notifications (on/off)
- Push notifications (on/off)
- Order updates
- Auction updates
- Promotional emails
```

### F001.4: Address Management

**Priority**: P1 (High)

#### User Stories

**US001.4.1**: Add Address

```
As a logged-in user
I want to add a shipping address
So that I can receive orders

Acceptance Criteria:
- Given I am on the addresses page
- When I add a new address with valid details
- Then the address is saved to my account
- And I can select it during checkout

Required Fields:
- Full name
- Phone number
- Address line 1
- City, State, Postal code
- Country (default: India)
```

**US001.4.2**: Update Address

```
As a logged-in user
I want to update my addresses
So that delivery information is accurate

Acceptance Criteria:
- Given I have saved addresses
- When I edit and save an address
- Then the address is updated
```

**US001.4.3**: Delete Address

```
As a logged-in user
I want to delete an address
So that I can remove outdated information

Acceptance Criteria:
- Given I have saved addresses
- When I delete an address
- Then it is removed from my account
- And cannot be used for future orders
```

**US001.4.4**: Set Default Address

```
As a logged-in user
I want to set a default address
So that checkout is faster

Acceptance Criteria:
- Given I have multiple addresses
- When I set one as default
- Then it is pre-selected during checkout
```

### F001.5: Admin User Management

**Priority**: P1 (High)

#### User Stories

**US001.5.1**: List Users (Admin)

```
As an admin
I want to view all users
So that I can manage the platform users

Acceptance Criteria:
- Given I am an admin on the users page
- When the page loads
- Then I see a paginated list of all users
- And I can filter by role, status, verification

Filters:
- Role: admin, seller, user
- Status: active, inactive, blocked, suspended
- Email verified: yes/no
- Has shop: yes/no
- Date range
```

**US001.5.2**: View User Details (Admin)

```
As an admin
I want to view detailed user information
So that I can understand user activity

Acceptance Criteria:
- Given I am viewing the user list
- When I click on a user
- Then I see full profile details
- And activity stats (orders, reviews, etc.)
- And session history
```

**US001.5.3**: Ban/Unban User (Admin)

```
As an admin
I want to ban/unban users
So that I can enforce platform rules

Acceptance Criteria:
- Given I am viewing a user's details
- When I ban the user with a reason
- Then the user cannot login
- And sees "Account suspended" message

- When I unban a user
- Then the user can login again
```

**US001.5.4**: Change User Role (Admin)

```
As an admin
I want to change user roles
So that I can grant/revoke permissions

Acceptance Criteria:
- Given I am viewing a user's details
- When I change their role
- Then their permissions update immediately
- And audit log is created

Role Transitions:
- User → Seller (requires shop creation)
- Seller → User (shop is deactivated)
- Any → Admin (super admin only)
```

**US001.5.5**: Bulk User Operations (Admin)

```
As an admin
I want to perform bulk operations on users
So that I can manage users efficiently

Acceptance Criteria:
- Given I select multiple users
- When I choose a bulk action
- Then the action is applied to all selected

Bulk Actions:
- Activate
- Deactivate
- Delete
- Verify email
```

---

## API Endpoints

| Endpoint                  | Method | Auth   | Description          |
| ------------------------- | ------ | ------ | -------------------- |
| `/api/auth/register`      | POST   | Public | Register new user    |
| `/api/auth/login`         | POST   | Public | Login user           |
| `/api/auth/logout`        | POST   | User   | Logout user          |
| `/api/auth/me`            | GET    | User   | Get current user     |
| `/api/auth/sessions`      | GET    | User   | List active sessions |
| `/api/auth/sessions/:id`  | DELETE | User   | Terminate session    |
| `/api/user/profile`       | GET    | User   | Get own profile      |
| `/api/user/profile`       | PATCH  | User   | Update own profile   |
| `/api/user/addresses`     | GET    | User   | List addresses       |
| `/api/user/addresses`     | POST   | User   | Add address          |
| `/api/user/addresses/:id` | PATCH  | User   | Update address       |
| `/api/user/addresses/:id` | DELETE | User   | Delete address       |
| `/api/users`              | GET    | Admin  | List all users       |
| `/api/users/:id`          | GET    | Admin  | Get user details     |
| `/api/users/:id`          | PATCH  | Admin  | Update user          |
| `/api/users/:id/ban`      | POST   | Admin  | Ban/unban user       |
| `/api/users/:id/role`     | POST   | Admin  | Change role          |
| `/api/users/bulk`         | POST   | Admin  | Bulk operations      |

---

## Data Models

### UserBE (Backend)

```typescript
interface UserBE {
  id: string;
  uid: string;
  email: string;
  displayName: string | null;
  photoURL: string | null;
  phoneNumber: string | null;
  role: "admin" | "seller" | "user" | "guest";
  status: "active" | "inactive" | "blocked" | "suspended";
  firstName: string | null;
  lastName: string | null;
  bio: string | null;
  location: string | null;
  emailVerified: boolean;
  phoneVerified: boolean;
  shopId: string | null;
  shopName: string | null;
  shopSlug: string | null;
  totalOrders: number;
  totalSpent: number;
  totalSales: number;
  totalProducts: number;
  totalAuctions: number;
  rating: number;
  reviewCount: number;
  notifications: {
    email: boolean;
    push: boolean;
    orderUpdates: boolean;
    auctionUpdates: boolean;
    promotions: boolean;
  };
  createdAt: Timestamp;
  updatedAt: Timestamp;
  lastLoginAt: Timestamp | null;
}
```

### AddressBE (Backend)

```typescript
interface AddressBE {
  id: string;
  userId: string;
  fullName: string;
  phoneNumber: string;
  addressLine1: string;
  addressLine2: string | null;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

---

## Test Scenarios

### Unit Tests

- [ ] Validate email format
- [ ] Validate password strength
- [ ] Validate phone number format (India)
- [ ] Validate postal code format (India)

### Integration Tests

- [ ] Registration flow with email verification
- [ ] Login with valid/invalid credentials
- [ ] Session creation and termination
- [ ] Profile update with validation
- [ ] Address CRUD operations

### E2E Tests

- [ ] Complete registration to login flow
- [ ] Password reset flow
- [ ] Admin ban user → user cannot login
- [ ] Admin change role → permissions update

---

## Dependencies

- Firebase Auth for authentication
- Firestore for user data storage
- Firebase Storage for profile photos
- Email service for verification emails

## Related Epics

- E006: Shop Management (seller profile)
- E005: Order Management (order history)
- E010: Support Tickets (user tickets)
