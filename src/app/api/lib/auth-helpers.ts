/**
 * Authentication Helper Functions
 * Reusable utilities for session-based authentication in API routes
 */

import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from './session';
import { getFirestoreAdmin } from './firebase/admin';
import { COLLECTIONS } from '@/constants/database';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: string;
}

export interface AuthError {
  status: number;
  message: string;
}

/**
 * Get authenticated user from request
 * Returns user data or null if not authenticated
 */
export async function getAuthUser(req: NextRequest): Promise<AuthUser | null> {
  return await getCurrentUser(req);
}

/**
 * Require authentication - throws error if not authenticated
 * Use this at the start of protected API routes
 */
export async function requireAuth(req: NextRequest): Promise<AuthUser> {
  const user = await getCurrentUser(req);
  
  if (!user) {
    throw {
      status: 401,
      message: 'Unauthorized - Please log in to continue',
    } as AuthError;
  }
  
  return user;
}

/**
 * Require specific role - throws error if user doesn't have required role
 */
export async function requireRole(
  req: NextRequest,
  allowedRoles: string[]
): Promise<AuthUser> {
  const user = await requireAuth(req);
  
  if (!allowedRoles.includes(user.role)) {
    throw {
      status: 403,
      message: `Forbidden - ${allowedRoles.join(' or ')} role required`,
    } as AuthError;
  }
  
  return user;
}

/**
 * Get user's shops - returns array of shop IDs owned by the user
 * Useful for seller dashboard and other seller-specific operations
 */
export async function getUserShops(userId: string): Promise<string[]> {
  try {
    const db = getFirestoreAdmin();
    const shopsSnapshot = await db
      .collection(COLLECTIONS.SHOPS)
      .where('owner_id', '==', userId)
      .where('is_banned', '==', false)
      .select('__name__') // Only fetch document IDs for performance
      .get();
    
    return shopsSnapshot.docs.map(doc => doc.id);
  } catch (error) {
    console.error('Error fetching user shops:', error);
    return [];
  }
}

/**
 * Get user's primary shop ID
 * Returns the first active shop owned by the user, or null if none found
 * For sellers with multiple shops, you might want to add a "primary_shop" field to user document
 */
export async function getPrimaryShopId(userId: string): Promise<string | null> {
  try {
    const db = getFirestoreAdmin();
    const shopsSnapshot = await db
      .collection(COLLECTIONS.SHOPS)
      .where('owner_id', '==', userId)
      .where('is_banned', '==', false)
      .orderBy('created_at', 'desc')
      .limit(1)
      .get();
    
    if (shopsSnapshot.empty) {
      return null;
    }
    
    return shopsSnapshot.docs[0].id;
  } catch (error) {
    console.error('Error fetching primary shop:', error);
    return null;
  }
}

/**
 * Verify user owns a specific shop
 * Returns true if user is the owner or is an admin
 */
export async function verifyShopOwnership(
  userId: string,
  shopId: string,
  userRole: string
): Promise<boolean> {
  // Admins can access any shop
  if (userRole === 'admin') {
    return true;
  }
  
  try {
    const db = getFirestoreAdmin();
    const shopDoc = await db
      .collection(COLLECTIONS.SHOPS)
      .doc(shopId)
      .get();
    
    if (!shopDoc.exists) {
      return false;
    }
    
    const shopData = shopDoc.data();
    return shopData?.owner_id === userId;
  } catch (error) {
    console.error('Error verifying shop ownership:', error);
    return false;
  }
}

/**
 * Handle authentication errors consistently
 * Use in catch blocks of API routes
 */
export function handleAuthError(error: any): NextResponse {
  if (error.status) {
    return NextResponse.json(
      { error: error.message },
      { status: error.status }
    );
  }
  
  console.error('Unexpected auth error:', error);
  return NextResponse.json(
    { error: 'Internal server error' },
    { status: 500 }
  );
}

/**
 * Get shop ID from query params or user's primary shop
 * Useful for seller APIs that need a shop_id parameter
 * 
 * Priority:
 * 1. shop_id from query params (if provided and user has access)
 * 2. User's primary shop (for sellers)
 * 3. null (if no shop found)
 */
export async function getShopIdFromRequest(
  req: NextRequest,
  user: AuthUser
): Promise<string | null> {
  const { searchParams } = new URL(req.url);
  const shopIdParam = searchParams.get('shop_id');
  
  // If shop_id provided in params, verify ownership
  if (shopIdParam) {
    const hasAccess = await verifyShopOwnership(user.id, shopIdParam, user.role);
    if (hasAccess) {
      return shopIdParam;
    }
    
    // User doesn't have access to requested shop
    throw {
      status: 403,
      message: 'You do not have access to this shop',
    } as AuthError;
  }
  
  // For sellers, get their primary shop
  if (user.role === 'seller') {
    return await getPrimaryShopId(user.id);
  }
  
  // Admins need to explicitly specify shop_id
  if (user.role === 'admin') {
    return null; // Admins should provide shop_id or get all shops
  }
  
  return null;
}

/**
 * Example usage in API route:
 * 
 * ```typescript
 * import { requireAuth, getShopIdFromRequest, handleAuthError } from '@/app/api/lib/auth-helpers';
 * 
 * export async function GET(req: NextRequest) {
 *   try {
 *     const user = await requireAuth(req);
 *     const shopId = await getShopIdFromRequest(req, user);
 *     
 *     if (!shopId) {
 *       return NextResponse.json(
 *         { error: 'No shop found. Please create a shop first.' },
 *         { status: 404 }
 *       );
 *     }
 *     
 *     // Use shopId for your queries...
 *     
 *   } catch (error) {
 *     return handleAuthError(error);
 *   }
 * }
 * ```
 */
