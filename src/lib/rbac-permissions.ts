/**
 * Role-Based Access Control (RBAC) Permission Helpers
 * Fine-grained permission checks for resources
 */

export type UserRole = "admin" | "seller" | "user" | "guest";

export interface AuthUser {
  uid: string;
  email: string;
  role: UserRole;
  shopId?: string; // For sellers
}

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

export type Action = "read" | "create" | "update" | "delete" | "bulk";

/**
 * Check if user can read a resource
 */
export function canReadResource(
  user: AuthUser | null,
  resourceType: ResourceType,
  data?: any
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
export function canWriteResource(
  user: AuthUser | null,
  resourceType: ResourceType,
  action: "create" | "update" = "create",
  data?: any
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
export function canDeleteResource(
  user: AuthUser | null,
  resourceType: ResourceType,
  data?: any
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
export function filterDataByRole<T extends Record<string, any>>(
  user: AuthUser | null,
  resourceType: ResourceType,
  data: T[]
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
        item.isActive === true
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
export function getRoleLevel(role: UserRole): number {
  const levels: Record<UserRole, number> = {
    admin: 100,
    seller: 50,
    user: 10,
    guest: 0,
  };
  return levels[role] || 0;
}

/**
 * Check if user has at least the required role
 */
export function hasRole(
  user: AuthUser | null,
  requiredRole: UserRole
): boolean {
  if (!user) {
    return requiredRole === "guest";
  }
  return getRoleLevel(user.role) >= getRoleLevel(requiredRole);
}

/**
 * Check if user has any of the required roles
 */
export function hasAnyRole(user: AuthUser | null, roles: UserRole[]): boolean {
  if (!user) {
    return roles.includes("guest");
  }
  return roles.includes(user.role);
}
