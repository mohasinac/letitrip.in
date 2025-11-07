/**
 * Role-Based Access Control (RBAC) Utilities
 * 
 * Provides utilities for checking user permissions and roles
 * Used throughout the application for access control
 */

export type UserRole = 'guest' | 'user' | 'seller' | 'admin';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  [key: string]: any;
}

/**
 * Role hierarchy (higher number = more permissions)
 */
const ROLE_HIERARCHY: Record<UserRole, number> = {
  guest: 0,
  user: 1,
  seller: 2,
  admin: 3,
};

/**
 * Check if user has a specific role
 */
export function hasRole(user: User | null, role: UserRole): boolean {
  if (!user) return role === 'guest';
  return user.role === role;
}

/**
 * Check if user has at least the specified role (or higher)
 */
export function hasMinimumRole(user: User | null, minimumRole: UserRole): boolean {
  if (!user) return minimumRole === 'guest';
  return ROLE_HIERARCHY[user.role] >= ROLE_HIERARCHY[minimumRole];
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(user: User | null): boolean {
  return user !== null && user.role !== 'guest';
}

/**
 * Check if user is a seller or admin
 */
export function canManageShop(user: User | null): boolean {
  return hasMinimumRole(user, 'seller');
}

/**
 * Check if user is admin
 */
export function isAdmin(user: User | null): boolean {
  return hasRole(user, 'admin');
}

/**
 * Check if user is seller
 */
export function isSeller(user: User | null): boolean {
  return hasRole(user, 'seller');
}

/**
 * Check if user owns a resource
 */
export function isOwner(user: User | null, resourceUserId: string): boolean {
  if (!user) return false;
  return user.id === resourceUserId;
}

/**
 * Check if user can edit a resource (owner or admin)
 */
export function canEdit(user: User | null, resourceUserId: string): boolean {
  if (!user) return false;
  return isOwner(user, resourceUserId) || isAdmin(user);
}

/**
 * Check if user can delete a resource (owner or admin)
 */
export function canDelete(user: User | null, resourceUserId: string): boolean {
  return canEdit(user, resourceUserId);
}

/**
 * Check if user can create shops
 */
export function canCreateShop(user: User | null, userShopCount: number = 0): boolean {
  if (!user || !hasMinimumRole(user, 'seller')) return false;
  
  // Admin has unlimited shops
  if (isAdmin(user)) return true;
  
  // Regular sellers can create 1 shop
  return userShopCount < 1;
}

/**
 * Check if user can create auctions
 */
export function canCreateAuction(user: User | null, shopActiveAuctionCount: number = 0): boolean {
  if (!user || !hasMinimumRole(user, 'seller')) return false;
  
  // Admin has unlimited auctions
  if (isAdmin(user)) return true;
  
  // Regular sellers can have max 5 active auctions per shop
  return shopActiveAuctionCount < 5;
}

/**
 * Check if user can verify shops (admin only)
 */
export function canVerifyShop(user: User | null): boolean {
  return isAdmin(user);
}

/**
 * Check if user can ban shops/users (admin only)
 */
export function canBanUser(user: User | null): boolean {
  return isAdmin(user);
}

/**
 * Check if user can change user roles (admin only)
 */
export function canChangeUserRole(user: User | null): boolean {
  return isAdmin(user);
}

/**
 * Check if user can view analytics
 */
export function canViewAnalytics(user: User | null, shopOwnerId?: string): boolean {
  if (!user) return false;
  
  // Admin can view all analytics
  if (isAdmin(user)) return true;
  
  // Seller can view their own shop analytics
  if (shopOwnerId) {
    return isSeller(user) && isOwner(user, shopOwnerId);
  }
  
  return false;
}

/**
 * Check if user can process refunds
 */
export function canProcessRefund(user: User | null, shopOwnerId?: string): boolean {
  if (!user) return false;
  
  // Admin can process any refund
  if (isAdmin(user)) return true;
  
  // Shop owner can process refunds for their shop
  if (shopOwnerId) {
    return isOwner(user, shopOwnerId);
  }
  
  return false;
}

/**
 * Check if user can approve returns
 */
export function canApproveReturn(user: User | null, shopOwnerId?: string): boolean {
  return canProcessRefund(user, shopOwnerId);
}

/**
 * Check if user can initiate return
 */
export function canInitiateReturn(user: User | null, orderUserId: string): boolean {
  if (!user) return false;
  return isOwner(user, orderUserId);
}

/**
 * Check if user can review a product (must have purchased)
 */
export function canReviewProduct(user: User | null, hasPurchased: boolean): boolean {
  if (!user || !isAuthenticated(user)) return false;
  return hasPurchased;
}

/**
 * Check if user can reply to review (shop owner or admin)
 */
export function canReplyToReview(user: User | null, shopOwnerId: string): boolean {
  if (!user) return false;
  return isAdmin(user) || isOwner(user, shopOwnerId);
}

/**
 * Check if user can moderate content (admin only)
 */
export function canModerateContent(user: User | null): boolean {
  return isAdmin(user);
}

/**
 * Get allowed actions for a user on a resource
 */
export interface ResourceActions {
  canView: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canModerate: boolean;
}

export function getResourceActions(
  user: User | null,
  resourceUserId: string,
  isPublic: boolean = false
): ResourceActions {
  return {
    canView: isPublic || isAuthenticated(user),
    canEdit: canEdit(user, resourceUserId),
    canDelete: canDelete(user, resourceUserId),
    canModerate: canModerateContent(user),
  };
}

/**
 * Filter query based on user role
 * Used in API routes to filter results based on user permissions
 */
export interface QueryFilter {
  // For shops/products/auctions
  status?: string[];
  userId?: string;
  shopId?: string;
  isPublic?: boolean;
  
  // For orders/returns
  customerId?: string;
  sellerId?: string;
  
  // Additional filters
  [key: string]: any;
}

export function getQueryFilterByRole(
  user: User | null,
  baseFilter: QueryFilter = {}
): QueryFilter {
  const filter: QueryFilter = { ...baseFilter };
  
  if (!user || hasRole(user, 'guest')) {
    // Guest: only public, verified content
    filter.isPublic = true;
    filter.status = ['active', 'published', 'verified'];
  } else if (hasRole(user, 'user')) {
    // User: public content + their own content
    // This is typically handled at the query level with OR conditions
    filter.isPublic = true;
  } else if (hasRole(user, 'seller')) {
    // Seller: public content + their own shops/products
    // Typically shows own content in dashboard, public in marketplace
    // No additional filters needed here
  } else if (hasRole(user, 'admin')) {
    // Admin: all content (no filters)
    // Remove restrictive filters
    delete filter.isPublic;
    delete filter.status;
  }
  
  return filter;
}

/**
 * Check if user can access a specific route
 */
export function canAccessRoute(user: User | null, requiredRole: UserRole): boolean {
  return hasMinimumRole(user, requiredRole);
}

/**
 * Get user display name
 */
export function getUserDisplayName(user: User | null): string {
  if (!user) return 'Guest';
  return user.name || user.email || 'User';
}

/**
 * Get role display name
 */
export function getRoleDisplayName(role: UserRole): string {
  const roleNames: Record<UserRole, string> = {
    guest: 'Guest',
    user: 'User',
    seller: 'Seller',
    admin: 'Administrator',
  };
  return roleNames[role] || 'Unknown';
}

/**
 * Get role badge color (for UI)
 */
export function getRoleBadgeColor(role: UserRole): string {
  const colors: Record<UserRole, string> = {
    guest: 'gray',
    user: 'blue',
    seller: 'green',
    admin: 'purple',
  };
  return colors[role] || 'gray';
}
