/**
 * Role-based access control utilities
 */

export type UserRole = 'admin' | 'seller' | 'user';

/**
 * Check if a user has access to a specific role's features
 */
export function hasRoleAccess(userRole: UserRole, requiredRole: UserRole): boolean {
  // Role hierarchy: admin > seller > user
  const roleHierarchy: Record<UserRole, number> = {
    admin: 3,
    seller: 2,
    user: 1,
  };

  return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
}

/**
 * Get available dashboard access for a user role
 */
export function getAvailableDashboards(userRole: UserRole): Array<{
  name: string;
  path: string;
  description: string;
}> {
  const dashboards = [];

  // Admin can access admin dashboard
  if (hasRoleAccess(userRole, 'admin')) {
    dashboards.push({
      name: 'Admin Dashboard',
      path: '/admin/dashboard',
      description: 'Manage the entire platform',
    });
  }

  // Admin and seller can access seller dashboard
  if (hasRoleAccess(userRole, 'seller')) {
    dashboards.push({
      name: 'Seller Dashboard',
      path: '/seller/dashboard',
      description: 'Manage your products and orders',
    });
  }

  // All roles can access user features (account, orders, etc.)
  if (hasRoleAccess(userRole, 'user')) {
    dashboards.push({
      name: 'My Account',
      path: '/account',
      description: 'Manage your account and orders',
    });
  }

  return dashboards;
}

/**
 * Check if user can access admin features
 */
export function canAccessAdmin(userRole: UserRole): boolean {
  return hasRoleAccess(userRole, 'admin');
}

/**
 * Check if user can access seller features
 */
export function canAccessSeller(userRole: UserRole): boolean {
  return hasRoleAccess(userRole, 'seller');
}

/**
 * Get user role display name
 */
export function getRoleDisplayName(role: UserRole): string {
  const roleNames: Record<UserRole, string> = {
    admin: 'Administrator',
    seller: 'Seller',
    user: 'Customer',
  };
  return roleNames[role];
}

/**
 * Get role badge color classes
 */
export function getRoleBadgeClasses(role: UserRole): string {
  const roleColors: Record<UserRole, string> = {
    admin: 'bg-red-100 text-red-800 border-red-200',
    seller: 'bg-blue-100 text-blue-800 border-blue-200',
    user: 'bg-gray-100 text-gray-800 border-gray-200',
  };
  return roleColors[role];
}
