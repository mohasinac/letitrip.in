/**
 * Permission System
 * 
 * Granular permission-based access control for the application.
 * Replaces simple role-based checks with fine-grained permissions.
 * 
 * @example
 * ```typescript
 * // Check single permission
 * if (hasPermission(user, 'products.create')) {
 *   // User can create products
 * }
 * 
 * // Check multiple permissions (any)
 * if (hasPermission(user, ['products.create', 'products.edit'])) {
 *   // User can create OR edit products
 * }
 * 
 * // Check multiple permissions (all)
 * if (hasAllPermissions(user, ['products.create', 'products.publish'])) {
 *   // User can create AND publish products
 * }
 * ```
 */

import { UserRole, USER_ROLES } from "@/constants/statuses";

/**
 * Permission categories and actions
 */
export const PERMISSIONS = {
  // Product permissions
  PRODUCTS_VIEW: "products.view",
  PRODUCTS_CREATE: "products.create",
  PRODUCTS_EDIT: "products.edit",
  PRODUCTS_DELETE: "products.delete",
  PRODUCTS_PUBLISH: "products.publish",
  PRODUCTS_FEATURE: "products.feature",
  PRODUCTS_MANAGE_ALL: "products.manage_all", // Admin can manage all products

  // Order permissions
  ORDERS_VIEW_OWN: "orders.view_own",
  ORDERS_VIEW_ALL: "orders.view_all",
  ORDERS_CREATE: "orders.create",
  ORDERS_UPDATE: "orders.update",
  ORDERS_CANCEL: "orders.cancel",
  ORDERS_REFUND: "orders.refund",
  ORDERS_MANAGE_ALL: "orders.manage_all", // Admin can manage all orders

  // Shop permissions
  SHOPS_VIEW: "shops.view",
  SHOPS_CREATE: "shops.create",
  SHOPS_EDIT: "shops.edit",
  SHOPS_DELETE: "shops.delete",
  SHOPS_MANAGE_ALL: "shops.manage_all", // Admin can manage all shops

  // User permissions
  USERS_VIEW: "users.view",
  USERS_EDIT_OWN: "users.edit_own",
  USERS_EDIT_ALL: "users.edit_all",
  USERS_DELETE: "users.delete",
  USERS_MANAGE_ROLES: "users.manage_roles",

  // Review permissions
  REVIEWS_VIEW: "reviews.view",
  REVIEWS_CREATE: "reviews.create",
  REVIEWS_EDIT_OWN: "reviews.edit_own",
  REVIEWS_DELETE_OWN: "reviews.delete_own",
  REVIEWS_MODERATE: "reviews.moderate", // Delete/edit any review

  // Category permissions
  CATEGORIES_VIEW: "categories.view",
  CATEGORIES_CREATE: "categories.create",
  CATEGORIES_EDIT: "categories.edit",
  CATEGORIES_DELETE: "categories.delete",

  // Auction permissions
  AUCTIONS_VIEW: "auctions.view",
  AUCTIONS_CREATE: "auctions.create",
  AUCTIONS_EDIT: "auctions.edit",
  AUCTIONS_DELETE: "auctions.delete",
  AUCTIONS_BID: "auctions.bid",
  AUCTIONS_MANAGE_ALL: "auctions.manage_all",

  // Payment permissions
  PAYMENTS_VIEW_OWN: "payments.view_own",
  PAYMENTS_VIEW_ALL: "payments.view_all",
  PAYMENTS_PROCESS: "payments.process",
  PAYMENTS_REFUND: "payments.refund",

  // Analytics permissions
  ANALYTICS_VIEW_OWN: "analytics.view_own",
  ANALYTICS_VIEW_ALL: "analytics.view_all",

  // Support permissions
  SUPPORT_VIEW_OWN: "support.view_own",
  SUPPORT_CREATE: "support.create",
  SUPPORT_MANAGE_ALL: "support.manage_all",

  // Admin permissions
  ADMIN_DASHBOARD: "admin.dashboard",
  ADMIN_SETTINGS: "admin.settings",
  ADMIN_MANAGE_SYSTEM: "admin.manage_system",
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

/**
 * Role-to-Permissions mapping
 * Defines what permissions each role has by default
 */
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  // Admin has all permissions
  [USER_ROLES.ADMIN]: [
    // Products
    PERMISSIONS.PRODUCTS_VIEW,
    PERMISSIONS.PRODUCTS_CREATE,
    PERMISSIONS.PRODUCTS_EDIT,
    PERMISSIONS.PRODUCTS_DELETE,
    PERMISSIONS.PRODUCTS_PUBLISH,
    PERMISSIONS.PRODUCTS_FEATURE,
    PERMISSIONS.PRODUCTS_MANAGE_ALL,
    // Orders
    PERMISSIONS.ORDERS_VIEW_OWN,
    PERMISSIONS.ORDERS_VIEW_ALL,
    PERMISSIONS.ORDERS_CREATE,
    PERMISSIONS.ORDERS_UPDATE,
    PERMISSIONS.ORDERS_CANCEL,
    PERMISSIONS.ORDERS_REFUND,
    PERMISSIONS.ORDERS_MANAGE_ALL,
    // Shops
    PERMISSIONS.SHOPS_VIEW,
    PERMISSIONS.SHOPS_CREATE,
    PERMISSIONS.SHOPS_EDIT,
    PERMISSIONS.SHOPS_DELETE,
    PERMISSIONS.SHOPS_MANAGE_ALL,
    // Users
    PERMISSIONS.USERS_VIEW,
    PERMISSIONS.USERS_EDIT_OWN,
    PERMISSIONS.USERS_EDIT_ALL,
    PERMISSIONS.USERS_DELETE,
    PERMISSIONS.USERS_MANAGE_ROLES,
    // Reviews
    PERMISSIONS.REVIEWS_VIEW,
    PERMISSIONS.REVIEWS_CREATE,
    PERMISSIONS.REVIEWS_EDIT_OWN,
    PERMISSIONS.REVIEWS_DELETE_OWN,
    PERMISSIONS.REVIEWS_MODERATE,
    // Categories
    PERMISSIONS.CATEGORIES_VIEW,
    PERMISSIONS.CATEGORIES_CREATE,
    PERMISSIONS.CATEGORIES_EDIT,
    PERMISSIONS.CATEGORIES_DELETE,
    // Auctions
    PERMISSIONS.AUCTIONS_VIEW,
    PERMISSIONS.AUCTIONS_CREATE,
    PERMISSIONS.AUCTIONS_EDIT,
    PERMISSIONS.AUCTIONS_DELETE,
    PERMISSIONS.AUCTIONS_BID,
    PERMISSIONS.AUCTIONS_MANAGE_ALL,
    // Payments
    PERMISSIONS.PAYMENTS_VIEW_OWN,
    PERMISSIONS.PAYMENTS_VIEW_ALL,
    PERMISSIONS.PAYMENTS_PROCESS,
    PERMISSIONS.PAYMENTS_REFUND,
    // Analytics
    PERMISSIONS.ANALYTICS_VIEW_OWN,
    PERMISSIONS.ANALYTICS_VIEW_ALL,
    // Support
    PERMISSIONS.SUPPORT_VIEW_OWN,
    PERMISSIONS.SUPPORT_CREATE,
    PERMISSIONS.SUPPORT_MANAGE_ALL,
    // Admin
    PERMISSIONS.ADMIN_DASHBOARD,
    PERMISSIONS.ADMIN_SETTINGS,
    PERMISSIONS.ADMIN_MANAGE_SYSTEM,
  ],

  // Seller permissions
  [USER_ROLES.SELLER]: [
    // Products (own)
    PERMISSIONS.PRODUCTS_VIEW,
    PERMISSIONS.PRODUCTS_CREATE,
    PERMISSIONS.PRODUCTS_EDIT,
    PERMISSIONS.PRODUCTS_DELETE,
    PERMISSIONS.PRODUCTS_PUBLISH,
    // Orders (own shop)
    PERMISSIONS.ORDERS_VIEW_OWN,
    PERMISSIONS.ORDERS_UPDATE,
    PERMISSIONS.ORDERS_CANCEL,
    // Shops (own)
    PERMISSIONS.SHOPS_VIEW,
    PERMISSIONS.SHOPS_CREATE,
    PERMISSIONS.SHOPS_EDIT,
    // Users (own profile)
    PERMISSIONS.USERS_VIEW,
    PERMISSIONS.USERS_EDIT_OWN,
    // Reviews
    PERMISSIONS.REVIEWS_VIEW,
    PERMISSIONS.REVIEWS_CREATE,
    PERMISSIONS.REVIEWS_EDIT_OWN,
    PERMISSIONS.REVIEWS_DELETE_OWN,
    // Categories
    PERMISSIONS.CATEGORIES_VIEW,
    // Auctions
    PERMISSIONS.AUCTIONS_VIEW,
    PERMISSIONS.AUCTIONS_CREATE,
    PERMISSIONS.AUCTIONS_EDIT,
    PERMISSIONS.AUCTIONS_DELETE,
    PERMISSIONS.AUCTIONS_BID,
    // Payments (own)
    PERMISSIONS.PAYMENTS_VIEW_OWN,
    // Analytics (own)
    PERMISSIONS.ANALYTICS_VIEW_OWN,
    // Support
    PERMISSIONS.SUPPORT_VIEW_OWN,
    PERMISSIONS.SUPPORT_CREATE,
  ],

  // Regular user permissions
  [USER_ROLES.USER]: [
    // Products (view only)
    PERMISSIONS.PRODUCTS_VIEW,
    // Orders (own)
    PERMISSIONS.ORDERS_VIEW_OWN,
    PERMISSIONS.ORDERS_CREATE,
    PERMISSIONS.ORDERS_CANCEL,
    // Shops (view)
    PERMISSIONS.SHOPS_VIEW,
    // Users (own profile)
    PERMISSIONS.USERS_VIEW,
    PERMISSIONS.USERS_EDIT_OWN,
    // Reviews
    PERMISSIONS.REVIEWS_VIEW,
    PERMISSIONS.REVIEWS_CREATE,
    PERMISSIONS.REVIEWS_EDIT_OWN,
    PERMISSIONS.REVIEWS_DELETE_OWN,
    // Categories
    PERMISSIONS.CATEGORIES_VIEW,
    // Auctions
    PERMISSIONS.AUCTIONS_VIEW,
    PERMISSIONS.AUCTIONS_BID,
    // Payments (own)
    PERMISSIONS.PAYMENTS_VIEW_OWN,
    // Support
    PERMISSIONS.SUPPORT_VIEW_OWN,
    PERMISSIONS.SUPPORT_CREATE,
  ],

  // Guest permissions (minimal)
  [USER_ROLES.GUEST]: [
    // Products (view only)
    PERMISSIONS.PRODUCTS_VIEW,
    // Shops (view)
    PERMISSIONS.SHOPS_VIEW,
    // Reviews (view only)
    PERMISSIONS.REVIEWS_VIEW,
    // Categories
    PERMISSIONS.CATEGORIES_VIEW,
    // Auctions (view only)
    PERMISSIONS.AUCTIONS_VIEW,
  ],
};

/**
 * User interface for permission checking
 */
export interface UserWithPermissions {
  id?: string;
  role: UserRole;
  customPermissions?: Permission[]; // Additional permissions beyond role defaults
}

/**
 * Check if a user has a specific permission or any of multiple permissions
 * 
 * @param user - User object with role and optional custom permissions
 * @param permission - Single permission or array of permissions (any match)
 * @returns true if user has the permission(s)
 */
export function hasPermission(
  user: UserWithPermissions | null | undefined,
  permission: Permission | Permission[]
): boolean {
  if (!user) return false;

  // Get role-based permissions
  const rolePermissions = ROLE_PERMISSIONS[user.role] || [];
  
  // Combine with custom permissions if any
  const allPermissions = [
    ...rolePermissions,
    ...(user.customPermissions || []),
  ];

  // Check single permission
  if (typeof permission === "string") {
    return allPermissions.includes(permission);
  }

  // Check multiple permissions (any match)
  return permission.some((p) => allPermissions.includes(p));
}

/**
 * Check if a user has ALL specified permissions
 * 
 * @param user - User object with role and optional custom permissions
 * @param permissions - Array of permissions (all required)
 * @returns true if user has all permissions
 */
export function hasAllPermissions(
  user: UserWithPermissions | null | undefined,
  permissions: Permission[]
): boolean {
  if (!user) return false;

  // Get role-based permissions
  const rolePermissions = ROLE_PERMISSIONS[user.role] || [];
  
  // Combine with custom permissions if any
  const allPermissions = [
    ...rolePermissions,
    ...(user.customPermissions || []),
  ];

  // Check all permissions
  return permissions.every((p) => allPermissions.includes(p));
}

/**
 * Get all permissions for a user
 * 
 * @param user - User object with role and optional custom permissions
 * @returns Array of all permissions the user has
 */
export function getUserPermissions(
  user: UserWithPermissions | null | undefined
): Permission[] {
  if (!user) return [];

  const rolePermissions = ROLE_PERMISSIONS[user.role] || [];
  const customPermissions = user.customPermissions || [];

  // Return unique permissions
  return Array.from(new Set([...rolePermissions, ...customPermissions]));
}

/**
 * Check if a user has a specific role
 * 
 * @param user - User object with role
 * @param role - Role or array of roles to check
 * @returns true if user has the role
 */
export function hasRole(
  user: UserWithPermissions | null | undefined,
  role: UserRole | UserRole[]
): boolean {
  if (!user) return false;

  if (typeof role === "string") {
    return user.role === role;
  }

  return role.includes(user.role);
}

/**
 * Check if a user is an admin
 * 
 * @param user - User object with role
 * @returns true if user is admin
 */
export function isAdmin(user: UserWithPermissions | null | undefined): boolean {
  return hasRole(user, USER_ROLES.ADMIN);
}

/**
 * Check if a user is a seller
 * 
 * @param user - User object with role
 * @returns true if user is seller
 */
export function isSeller(user: UserWithPermissions | null | undefined): boolean {
  return hasRole(user, USER_ROLES.SELLER);
}

/**
 * Check if a user is authenticated (not guest)
 * 
 * @param user - User object with role
 * @returns true if user is authenticated
 */
export function isAuthenticated(
  user: UserWithPermissions | null | undefined
): boolean {
  return user !== null && user !== undefined && user.role !== USER_ROLES.GUEST;
}
