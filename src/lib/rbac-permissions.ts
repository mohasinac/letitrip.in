/**
 * @fileoverview TypeScript Module
 * @module src/lib/rbac-permissions
 * @description This file contains functionality related to rbac-permissions
 * 
 * @created 2025-12-05
 * @author Development Team
 */

/**
 * Role-Based Access Control (RBAC) Permission Helpers
 * Fine-grained permission checks for resources
 */

/**
 * User Role type definition
 * @typedef {UserRole}
 */
export type UserRole = "admin" | "seller" | "user" | "guest";

/**
 * AuthUser interface
 * 
 * @interface
 * @description Defines the structure and contract for AuthUser
 */
export interface AuthUser {
  /** Uid */
  uid: string;
  /** Email */
  email: string;
  /** Role */
  role: UserRole;
  shopId?: string; // For sellers
}

/**
 * ResourceType type
 * 
 * @typedef {Object} ResourceType
 * @description Type definition for ResourceType
 */
export type ResourceType =
  | "hero_slides"
  | "categories"
  | "products"
  | "auctions"
  | "orders"
  | "shops"
  | "coupons"
  | "tickets"
  | "reviews"
  | "payouts"
  | "users";

/**
 * Action type
 * 
 * @typedef {Object} Action
 * @description Type definition for Action
 */
export type Action = "read" | "create" | "update" | "delete" | "bulk";

/**
 * Check if user can read a resource
 */
/**
 * Checks if read resource
 *
 * @param {AuthUser | null} user - The user
 * @param {ResourceType} resourceType - The resource type
 * @param {any} [data] - Data object containing information
 *
 * @returns {boolean} True if condition is met, false otherwise
 *
 * @example
 * canReadResource(user, resourceType, data);
 */

/**
 * Checks if read resource
 *
 * @returns {any} The canreadresource result
 *
 * @example
 * canReadResource();
 */

export function canReadResource(
  /** User */
  user: AuthUser | null,
  /** Resource Type */
  resourceType: ResourceType,
  /** Data */
  data?: any,
): boolean {
  // Public resources - anyone can read active/published items
  if (
    resourceType === "hero_slides" ||
    resourceType === "categories" ||
    resourceType === "products" ||
    resourceType === "auctions" ||
    resourceType === "shops" ||
    resourceType === "reviews"
  ) {
    // Admin can read everything
    if (user?.role === "admin") {
      return true;
    }

    // Sellers can read own items
    if (user?.role === "seller" && data?.shopId === user.shopId) {
      return true;
    }

    // Everyone can read active/published items
    if (
      data?.status === "active" ||
      data?.status === "published" ||
      data?.isActive === true
    ) {
      return true;
    }

    return false;
  }

  // Private resources - authentication required
  if (!user) {
    return false;
  }

  // Admin can read everything
  if (user.role === "admin") {
    return true;
  }

  // Sellers can read their own resources
  if (user.role === "seller") {
    if (resourceType === "orders" || resourceType === "payouts") {
      return data?.shopId === user.shopId;
    }
    if (resourceType === "coupons") {
      return data?.createdBy === user.uid || data?.shopId === user.shopId;
    }
    if (resourceType === "tickets") {
      return data?.shopId === user.shopId || data?.createdBy === user.uid;
    }
  }

  // Users can read their own resources
  if (user.role === "user") {
    if (resourceType === "orders" || resourceType === "tickets") {
      return data?.userId === user.uid || data?.createdBy === user.uid;
    }
    // Reviews are handled at the component level
  }

  return false;
}

/**
 * Check if user can create a resource
 */
/**
 * Checks if write resource
 *
 * @returns {any} The canwriteresource result
 *
 * @example
 * canWriteResource();
 */

/**
 * Checks if write resource
 *
 * @returns {any} The canwriteresource result
 *
 * @example
 * canWriteResource();
 */

export function canWriteResource(
  /** User */
  user: AuthUser | null,
  /** Resource Type */
  resourceType: ResourceType,
  /** Action */
  action: "create" | "update" = "create",
  /** Data */
  data?: any,
): boolean {
  if (!user) {
    return false;
  }

  // Admin can do everything
  if (user.role === "admin") {
    return true;
  }

  // Sellers permissions
  if (user.role === "seller") {
    // Can create/update own items
    if (
      resourceType === "products" ||
      resourceType === "auctions" ||
      resourceType === "coupons"
    ) {
      if (action === "create") {
        return true; // Will be associated with their shopId
      }
      if (action === "update") {
        return data?.shopId === user.shopId || data?.createdBy === user.uid;
      }
    }

    // Can create/update own shop
    if (resourceType === "shops") {
      if (action === "create") {
        return !user.shopId; // Can only create if don't have one
      }
      if (action === "update") {
        return data?.id === user.shopId || data?.ownerId === user.uid;
      }
    }

    // Can update orders for their shop
    if (resourceType === "orders" && action === "update") {
      return data?.shopId === user.shopId;
    }

    // Can request payouts
    if (resourceType === "payouts") {
      return action === "create" || data?.shopId === user.shopId;
    }

    // Can reply to tickets
    if (resourceType === "tickets") {
      return data?.shopId === user.shopId || data?.createdBy === user.uid;
    }

    return false;
  }

  // User permissions
  if (user.role === "user") {
    // Can create tickets and reviews
    if (
      resourceType === "tickets" ||
      resourceType === "reviews" ||
      resourceType === "orders"
    ) {
      if (action === "create") {
        return true;
      }
      if (action === "update") {
        return data?.userId === user.uid || data?.createdBy === user.uid;
      }
    }

    return false;
  }

  return false;
}

/**
 * Check if user can delete a resource
 */
/**
 * Checks if delete resource
 *
 * @param {AuthUser | null} user - The user
 * @param {ResourceType} resourceType - The resource type
 * @param {any} [data] - Data object containing information
 *
 * @returns {boolean} True if condition is met, false otherwise
 *
 * @example
 * canDeleteResource(user, resourceType, data);
 */

/**
 * Checks if delete resource
 *
 * @returns {any} The candeleteresource result
 *
 * @example
 * canDeleteResource();
 */

export function canDeleteResource(
  /** User */
  user: AuthUser | null,
  /** Resource Type */
  resourceType: ResourceType,
  /** Data */
  data?: any,
): boolean {
  if (!user) {
    return false;
  }

  // Admin can delete everything
  if (user.role === "admin") {
    return true;
  }

  // Sellers can delete their own items
  if (user.role === "seller") {
    if (
      resourceType === "products" ||
      resourceType === "auctions" ||
      resourceType === "coupons"
    ) {
      return data?.shopId === user.shopId || data?.createdBy === user.uid;
    }

    return false;
  }

  // Users can delete their own items
  if (user.role === "user") {
    if (resourceType === "tickets" || resourceType === "reviews") {
      return data?.userId === user.uid;
    }

    return false;
  }

  return false;
}

/**
 * Filter data based on user role and permissions
 */
/**
 * Filters data by role
 *
 * @param {AuthUser | null} user - The user
 * @param {ResourceType} resourceType - The resource type
 * @param {T[]} data - Data object containing information
 *
 * @returns {any} The filterdatabyrole result
 *
 * @example
 * filterDataByRole(user, resourceType, data);
 */

/**
 * Filters data by role
 *
 * @returns {any} The filterdatabyrole result
 *
 * @example
 * filterDataByRole();
 */

export function filterDataByRole<T extends Record<string, any>>(
  /** User */
  user: AuthUser | null,
  /** Resource Type */
  resourceType: ResourceType,
  /** Data */
  data: T[],
): T[] {
  // Admin sees everything
  if (user?.role === "admin") {
    return data;
  }

  // No user - show only public data
  if (!user) {
    return data.filter(
      (item) =>
        item.status === "active" ||
        item.status === "published" ||
        item.isActive === true,
    );
  }

  // Sellers see their own + public
  if (user.role === "seller") {
    return data.filter((item) => {
      // Own items
      if (item.shopId === user.shopId || item.createdBy === user.uid) {
        return true;
      }

      // Public items
      if (
        item.status === "active" ||
        item.status === "published" ||
        item.isActive === true
      ) {
        return true;
      }

      return false;
    });
  }

  // Users see their own + public
  if (user.role === "user") {
    return data.filter((item) => {
      // Own items
      if (item.userId === user.uid || item.createdBy === user.uid) {
        return true;
      }

      // Public items
      if (
        item.status === "active" ||
        item.status === "published" ||
        item.isActive === true
      ) {
        return true;
      }

      return false;
    });
  }

  return data;
}

/**
 * Check if user owns a resource
 */
/**
 * Checks if resource owner
 *
 * @param {AuthUser | null} user - The user
 * @param {any} data - Data object containing information
 *
 * @returns {boolean} True if condition is met, false otherwise
 *
 * @example
 * isResourceOwner(user, data);
 */

/**
 * Checks if resource owner
 *
 * @param {AuthUser | null} user - The user
 * @param {any} data - Data object containing information
 *
 * @returns {boolean} True if condition is met, false otherwise
 *
 * @example
 * isResourceOwner(user, data);
 */

export function isResourceOwner(user: AuthUser | null, data: any): boolean {
  if (!user) {
    return false;
  }

  // Check various ownership fields
  return (
    data?.userId === user.uid ||
    data?.createdBy === user.uid ||
    data?.ownerId === user.uid ||
    (user.role === "seller" && data?.shopId === user.shopId)
  );
}

/**
 * Get role hierarchy level (higher = more permissions)
 */
/**
 * Retrieves role level
 *
 * @param {UserRole} role - The role
 *
 * @returns {number} The rolelevel result
 *
 * @example
 * getRoleLevel(role);
 */

/**
 * Retrieves role level
 *
 * @param {UserRole} role - The role
 *
 * @returns {number} The rolelevel result
 *
 * @example
 * getRoleLevel(role);
 */

export function getRoleLevel(role: UserRole): number {
  const levels: Record<UserRole, number> = {
    /** Admin */
    admin: 100,
    /** Seller */
    seller: 50,
    /** User */
    user: 10,
    /** Guest */
    guest: 0,
  };
  return levels[role] || 0;
}

/**
 * Check if user has at least the required role
 */
/**
 * Checks if role
 *
 * @param {AuthUser | null} user - The user
 * @param {UserRole} requiredRole - The required role
 *
 * @returns {boolean} True if condition is met, false otherwise
 *
 * @example
 * hasRole(user, requiredRole);
 */

/**
 * Checks if role
 *
 * @returns {any} The hasrole result
 *
 * @example
 * hasRole();
 */

export function hasRole(
  /** User */
  user: AuthUser | null,
  /** Required Role */
  requiredRole: UserRole,
): boolean {
  if (!user) {
    return requiredRole === "guest";
  }
  return getRoleLevel(user.role) >= getRoleLevel(requiredRole);
}

/**
 * Check if user has any of the required roles
 */
/**
 * Checks if any role
 *
 * @param {AuthUser | null} user - The user
 * @param {UserRole[]} roles - The roles
 *
 * @returns {boolean} True if condition is met, false otherwise
 *
 * @example
 * hasAnyRole(user, roles);
 */

/**
 * Checks if any role
 *
 * @param {AuthUser | null} user - The user
 * @param {UserRole[]} roles - The roles
 *
 * @returns {boolean} True if condition is met, false otherwise
 *
 * @example
 * hasAnyRole(user, roles);
 */

export function hasAnyRole(user: AuthUser | null, roles: UserRole[]): boolean {
  if (!user) {
    return roles.includes("guest");
  }
  return roles.includes(user.role);
}
