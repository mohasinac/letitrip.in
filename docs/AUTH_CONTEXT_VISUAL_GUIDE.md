# AuthContext Visual Guide

## Component Behavior Overview

### 1. MainNavBar - User Menu

#### When NOT Logged In

```
┌─────────────────────────────────────────┐
│  [Menu] [LOGO]  [Coupons] [🔍] [🛒] [👤]│
│                                  Sign In│
└──────────────────────────────────────▼──┘
                                    ┌──────────┐
                                    │ 🔓 Sign In│
                                    │ ➕ Register│
                                    └──────────┘
```

#### When Logged In

```
┌─────────────────────────────────────────┐
│  [Menu] [LOGO]  [Coupons] [🔍] [🛒] [JD]│
│                              John Doe  ▼│
└──────────────────────────────────────▼──┘
                              ┌─────────────────┐
                              │ John Doe        │
                              │ john@example.com│
                              │─────────────────│
                              │ 📦 Orders       │
                              │ 🕐 History      │
                              │ 💬 Messages     │
                              │ ❤️  Favorites   │
                              │ ⚙️  Settings    │
                              └─────────────────┘
```

**Key Differences:**

- Avatar shows initials (JD) or profile picture
- Name displayed instead of "Sign In"
- Dropdown shows user info + full menu
- No Register option (already logged in)

---

### 2. BottomNav - Account Button

#### When NOT Logged In

```
┌──────────────────────────────────────┐
│ [🏠] [🏪] [📁] [🛒] [👤]            │
│ Home Shops Cat. Cart Account         │
│                      ↓               │
│                  /login              │
└──────────────────────────────────────┘
```

#### When Logged In

```
┌──────────────────────────────────────┐
│ [🏠] [🏪] [📁] [🛒] [👤]            │
│ Home Shops Cat. Cart Account         │
│                      ↓               │
│                /user/settings        │
└──────────────────────────────────────┘
```

**Behavior:**

- Single tap takes you to appropriate page
- Visual indicator shows active page
- Same icon, different destination

---

### 3. MobileSidebar - Sections

#### When NOT Logged In

```
┌────────────────────────────┐
│ LET IT RIP            [✕]  │
├────────────────────────────┤
│ User Menu                  │
│ • Orders                   │
│ • History                  │
│ • Messages                 │
│ • Favorites                │
│ • Settings                 │
│────────────────────────────│
│ [    Sign In    ]          │
│ [   Register    ]          │
├────────────────────────────┤
│ (Admin section hidden)     │
│ (Seller section hidden)    │
└────────────────────────────┘
```

#### When Logged In as Regular User

```
┌────────────────────────────┐
│ LET IT RIP            [✕]  │
├────────────────────────────┤
│ User Menu                  │
│ • Orders                   │
│ • History                  │
│ • Messages                 │
│ • Favorites                │
│ • Settings                 │
│────────────────────────────│
│ [🚪 Logout]                │
├────────────────────────────┤
│ (Admin section hidden)     │
│ (Seller section hidden)    │
└────────────────────────────┘
```

#### When Logged In as Seller

```
┌────────────────────────────┐
│ LET IT RIP            [✕]  │
├────────────────────────────┤
│ User Menu                  │
│ • Orders                   │
│ • History                  │
│ • Messages                 │
│ • Favorites                │
│ • Settings                 │
│────────────────────────────│
│ [🚪 Logout]                │
├────────────────────────────┤
│ ▼ Seller                   │
│ • Dashboard                │
│ • My Products              │
│ • Orders                   │
│ • Analytics                │
└────────────────────────────┘
```

#### When Logged In as Admin

```
┌────────────────────────────┐
│ LET IT RIP            [✕]  │
├────────────────────────────┤
│ User Menu                  │
│ • Orders                   │
│ • History                  │
│ • Messages                 │
│ • Favorites                │
│ • Settings                 │
│────────────────────────────│
│ [🚪 Logout]                │
├────────────────────────────┤
│ ▼ Admin                    │
│ • Dashboard                │
│ • Users                    │
│ • Products                 │
│ • Settings                 │
├────────────────────────────┤
│ ▼ Seller                   │
│ • Dashboard                │
│ • My Products              │
│ • Orders                   │
│ • Analytics                │
└────────────────────────────┘
```

**Role-Based Visibility:**

- ❌ Guest: No admin/seller sections
- ✅ User: No admin/seller sections
- ✅ Seller: Seller section only
- ✅ Admin: Both admin AND seller sections

---

### 4. FeaturedCategories - Show More

#### Initial View (8 Categories)

```
┌─────────────────────────────────────────────────────────┐
│ [🎨] [❤️] [💎] [⛰️] [🎧] [🎮] [👕] [🎵] [➡️ More]      │
│ Art  Toy  Gem Mount Head Game Fashion Music             │
└─────────────────────────────────────────────────────────┘
```

#### After Clicking "Show More"

```
┌──────────────────────────────────────────────────────────────────┐
│ [🎨] [❤️] [💎] [⛰️] [🎧] [🎮] [👕] [🎵] [📦] [🛍️] [...] [...]  │
│ Art  Toy  Gem Mount Head Game Fashion Music Books Shop  Tech Sport│
└──────────────────────────────────────────────────────────────────┘
```

**Behavior:**

- Initially shows 8 categories
- "Show More" button has dashed border
- Clicking expands to show all
- Button disappears after expansion
- Scroll arrows work on both views

---

## Role Matrix

### Visual Key

- 🟢 = Visible/Accessible
- 🔴 = Hidden/Not Accessible
- 🟡 = Conditionally Visible

### Feature Visibility by Role

| Component/Feature  | Guest | User | Seller | Admin |
| ------------------ | ----- | ---- | ------ | ----- |
| **MainNavBar**     |
| Sign In Button     | 🟢    | 🔴   | 🔴     | 🔴    |
| User Profile       | 🔴    | 🟢   | 🟢     | 🟢    |
| User Menu Dropdown | 🔴    | 🟢   | 🟢     | 🟢    |
| **BottomNav**      |
| Account → Login    | 🟢    | 🔴   | 🔴     | 🔴    |
| Account → Profile  | 🔴    | 🟢   | 🟢     | 🟢    |
| **MobileSidebar**  |
| Sign In/Register   | 🟢    | 🔴   | 🔴     | 🔴    |
| Logout Button      | 🔴    | 🟢   | 🟢     | 🟢    |
| Admin Section      | 🔴    | 🔴   | 🔴     | 🟢    |
| Seller Section     | 🔴    | 🔴   | 🟢     | 🟢    |

---

## User Journey Maps

### Journey 1: Guest → Registered User

```
1. Visitor arrives (Guest)
   ├─ MainNavBar shows "Sign In"
   ├─ BottomNav Account → /login
   └─ Sidebar shows Sign In/Register

2. Clicks "Sign In" or "Register"
   └─ Goes to auth page

3. Completes registration/login
   └─ Session created, cookie set

4. AuthContext updates
   ├─ user state populated
   └─ isAuthenticated = true

5. UI Updates Everywhere
   ├─ MainNavBar shows name + avatar
   ├─ BottomNav Account → /user/settings
   └─ Sidebar shows Logout button

6. User can now:
   ├─ View orders
   ├─ Save favorites
   ├─ Access profile
   └─ Use all user features
```

### Journey 2: User → Seller → Admin

```
1. Regular User
   ├─ Basic menu access
   └─ No admin/seller sections

2. Granted Seller Role (backend)
   └─ role changed to 'seller'

3. User refreshes or logs in again
   └─ AuthContext.isSeller = true

4. UI Updates
   ├─ Sidebar shows Seller section
   └─ Can access seller dashboard

5. Later Promoted to Admin
   └─ role changed to 'admin'

6. User refreshes or logs in again
   ├─ AuthContext.isAdmin = true
   └─ AuthContext.isAdminOrSeller = true

7. Full UI Access
   ├─ Sidebar shows Admin section
   ├─ Sidebar shows Seller section
   └─ Can access all features
```

---

## State Flow Diagram

```
┌─────────────────────────────────────────────────┐
│              AuthContext State                   │
├─────────────────────────────────────────────────┤
│                                                  │
│  user: null                                      │
│  loading: true                                   │
│  isAuthenticated: false                          │
│                                                  │
│              ↓ (Initial Load)                    │
│                                                  │
│  1. Check localStorage (cached user)             │
│  2. Call /api/auth/me (validate session)         │
│                                                  │
│              ↓                                   │
│                                                  │
│  ┌─────────────────┬──────────────────┐         │
│  │ Session Valid   │ Session Invalid  │         │
│  └────────┬────────┴────────┬─────────┘         │
│           ↓                 ↓                    │
│  user: User object   user: null                 │
│  loading: false      loading: false             │
│  isAuthenticated:    isAuthenticated:           │
│    true                false                     │
│                                                  │
│  Computed:           Computed:                   │
│  • isAdmin          • isAdmin = false            │
│  • isSeller         • isSeller = false           │
│  • isAdminOrSeller  • isAdminOrSeller = false    │
│                                                  │
└─────────────────────────────────────────────────┘
                      ↓
        All components re-render
        with correct auth state
```

---

## Authentication Decision Tree

```
Is User Authenticated?
├─ NO (Guest)
│  ├─ Show: Sign In button
│  ├─ Show: Register option
│  ├─ Hide: User profile
│  ├─ Hide: Logout button
│  ├─ Hide: Admin section
│  ├─ Hide: Seller section
│  └─ Redirect: Account → /login
│
└─ YES (Authenticated)
   │
   ├─ What is user.role?
   │
   ├─ "user" (Regular User)
   │  ├─ Show: User profile
   │  ├─ Show: User menu
   │  ├─ Show: Logout button
   │  ├─ Hide: Admin section
   │  ├─ Hide: Seller section
   │  └─ Access: /user/settings
   │
   ├─ "seller" (Seller)
   │  ├─ Show: User profile
   │  ├─ Show: User menu
   │  ├─ Show: Logout button
   │  ├─ Hide: Admin section
   │  ├─ Show: Seller section ✓
   │  └─ Access: /user/settings, /seller/*
   │
   └─ "admin" (Administrator)
      ├─ Show: User profile
      ├─ Show: User menu
      ├─ Show: Logout button
      ├─ Show: Admin section ✓
      ├─ Show: Seller section ✓
      └─ Access: /user/*, /seller/*, /admin/*
```

---

## Quick Reference

### Getting Auth State in Any Component

```typescript
import { useAuth } from "@/contexts/AuthContext";

function MyComponent() {
  const {
    user, // User object or null
    loading, // Boolean: true during auth ops
    isAuthenticated, // Boolean: is user logged in?
    isAdmin, // Boolean: is role === 'admin'?
    isSeller, // Boolean: is role === 'seller'?
    isAdminOrSeller, // Boolean: admin OR seller?
    login, // Function: login(email, pwd)
    register, // Function: register(data)
    logout, // Function: logout()
    refreshUser, // Function: refreshUser()
  } = useAuth();

  // Use any of these values/functions
}
```

### Common Patterns

```typescript
// Show content only for authenticated users
{
  isAuthenticated && <ProtectedContent />;
}

// Show content only for guests
{
  !isAuthenticated && <LoginPrompt />;
}

// Show content only for admins
{
  isAdmin && <AdminPanel />;
}

// Show content for sellers or admins
{
  isAdminOrSeller && <SellerDashboard />;
}

// Show loading state
{
  loading ? <Spinner /> : <Content />;
}

// Access user data
{
  user && <p>Welcome, {user.name}!</p>;
}
```

---

This visual guide helps understand how the AuthContext affects the UI across different components and user roles.
