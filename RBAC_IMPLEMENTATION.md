# Role-Based Access Control (RBAC) Implementation

## Overview

The application now implements a hierarchical role-based access control system where users can have different levels of access based on their assigned roles.

## Role Hierarchy

```
Admin (Highest Level)
  ↳ Can access: Admin Dashboard + Seller Dashboard + User Features
  ↳ Navigation: Shows BOTH Admin + Seller buttons

Seller (Middle Level)
  ↳ Can access: Seller Dashboard + User Features
  ↳ Navigation: Shows ONLY Seller button

User (Base Level)
  ↳ Can access: User Features only
  ↳ Navigation: Shows NO role-based buttons
```

## Implementation Components

### 1. Role Utility Functions (`/src/lib/auth/roles.ts`)

- `hasRoleAccess(userRole, requiredRole)` - Checks if user role has access to required role level
- `getAvailableDashboards(userRole)` - Returns list of dashboards user can access
- `canAccessAdmin(userRole)` - Quick check for admin access
- `canAccessSeller(userRole)` - Quick check for seller access

### 2. RoleGuard Component (`/src/components/auth/RoleGuard.tsx`)

- Wraps protected pages/components
- Automatically redirects unauthorized users
- Shows loading state during auth check
- Usage: `<RoleGuard requiredRole="admin">...</RoleGuard>`

### 3. Header Navigation (`/src/components/layout/Header.tsx`)

- Shows role-appropriate navigation buttons beside user profile
- **Admin users**: See BOTH Admin + Seller buttons (hierarchical access)
- **Seller users**: See ONLY Seller button
- **Regular users**: See NO role-based buttons
- Mobile-responsive design with hamburger menu
- Integrates with role utility functions

### 4. Protected Dashboard Pages

- **Admin Dashboard** (`/src/app/admin/dashboard/page.tsx`)
  - Protected with `<RoleGuard requiredRole="admin">`
  - Only admins can access
- **Seller Dashboard** (`/src/app/seller/dashboard/page.tsx`)
  - Protected with `<RoleGuard requiredRole="seller">`
  - Admins and sellers can access

## Dashboard Features

### Admin Dashboard Components

1. **StatsCards** - Overview metrics (users, orders, revenue, products)
2. **SalesChart** - Monthly sales visualization
3. **UserActivityChart** - User engagement metrics
4. **QuickActions** - Common admin tasks
5. **RecentOrders** - Latest order management
6. **TopProducts** - Best performing products
7. **RecentReviews** - Customer feedback overview

### Seller Dashboard Components

1. **SellerStatsCards** - Seller-specific metrics
2. **SellerSalesChart** - Seller revenue tracking
3. **SellerOrders** - Order management for seller
4. **SellerProducts** - Product inventory management
5. **SellerQuickActions** - Seller workflow shortcuts
6. **SellerNotifications** - Important alerts and updates

## Design System

- **Inspired by Shiprocket Dashboard** - Clean, professional e-commerce focused design
- **Tailwind CSS** - Utility-first styling for consistency
- **Chart.js Integration** - Interactive data visualizations
- **Heroicons** - Consistent iconography
- **Responsive Design** - Mobile-first approach

## Authentication Flow

1. User logs in through `/login`
2. JWT token contains user role information
3. `RoleGuard` components check token on protected routes
4. Navigation dynamically shows available dashboards
5. Unauthorized access redirects to login page

## API Integration

The dashboards integrate with existing API routes:

- `/api/auth/me` - Get current user and role
- `/api/orders` - Order management
- `/api/products` - Product management
- `/api/user/*` - User-specific data

## Testing

Visit `/test-roles` to test the role-based access control system with different user roles.

## Usage Examples

### Protecting a Page

```tsx
import RoleGuard from "@/components/auth/RoleGuard";

export default function AdminPage() {
  return (
    <RoleGuard requiredRole="admin">
      <div>Admin only content</div>
    </RoleGuard>
  );
}
```

### Checking Role Access

```tsx
import { hasRoleAccess, canAccessAdmin } from "@/lib/auth/roles";

// Check if user can access seller features
const canAccess = hasRoleAccess(user.role, "seller");

// Quick admin check
const isAdmin = canAccessAdmin(user.role);
```

### Getting Available Dashboards

```tsx
import { getAvailableDashboards } from "@/lib/auth/roles";

const dashboards = getAvailableDashboards(user.role);
// Returns array of { name, path } objects
```

## Deployment URLs

- **Production**: https://justforview-bwouds4j9-mohasin-ahamed-chinnapattans-projects.vercel.app
- **Test Roles**: https://justforview-bwouds4j9-mohasin-ahamed-chinnapattans-projects.vercel.app/test-roles
- **Admin Dashboard**: https://justforview-bwouds4j9-mohasin-ahamed-chinnapattans-projects.vercel.app/admin/dashboard
- **Seller Dashboard**: https://justforview-bwouds4j9-mohasin-ahamed-chinnapattans-projects.vercel.app/seller/dashboard

## Future Enhancements

- Role-based API endpoint protection
- Granular permissions within roles
- Role assignment management interface
- Audit logging for role-based actions
- Dynamic role switching for testing
