/**
 * Cart API Route
 * 
 * GET: Get user's cart
 * POST: Save/update cart
 * DELETE: Clear cart
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  getCart,
  saveCart,
  clearCart,
  addItemToCart,
  syncCart,
  mergeGuestCart,
  getCartSummary,
} from '../_lib/controllers/cart.controller';
import { authenticateUser } from '../_lib/auth/middleware';
import { ValidationError, NotFoundError } from '../_lib/middleware/error-handler';

/**
 * GET /api/cart
 * Protected endpoint - Get user's cart
 */
export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const user = await authenticateUser(request);

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Check for sync parameter
    const { searchParams } = new URL(request.url);
    const shouldSync = searchParams.get('sync') === 'true';

    // Fetch user data
    const { getAdminDb } = await import('../_lib/database/admin');
    const userDoc = await getAdminDb().collection('users').doc(user.userId).get();
    const userData = userDoc.data();

    if (shouldSync) {
      // Sync cart with current prices and availability
      const result = await syncCart({
        userId: user.userId,
        role: user.role as 'admin' | 'seller' | 'user',
        email: userData?.email,
      });

      return NextResponse.json({
        success: true,
        data: result.cart,
        changes: result.changes,
        message: result.changes.length > 0 
          ? 'Cart synced with changes' 
          : 'Cart synced successfully',
      });
    }

    // Get cart using controller
    const cart = await getCart({
      userId: user.userId,
      role: user.role as 'admin' | 'seller' | 'user',
      email: userData?.email,
    });

    return NextResponse.json({
      success: true,
      data: cart,
    });

  } catch (error: any) {
    console.error('Error in GET /api/cart:', error);

    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch cart' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/cart
 * Protected endpoint - Save/update cart or add item
 */
export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const user = await authenticateUser(request);

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get request body
    const body = await request.json();
    const { items, action, item, guestCartItems } = body;

    // Fetch user data
    const { getAdminDb } = await import('../_lib/database/admin');
    const userDoc = await getAdminDb().collection('users').doc(user.userId).get();
    const userData = userDoc.data();

    const context = {
      userId: user.userId,
      role: user.role as 'admin' | 'seller' | 'user',
      email: userData?.email,
    };

    // Handle different actions
    if (action === 'add' && item) {
      // Add single item to cart
      const cart = await addItemToCart(item, context);
      
      return NextResponse.json({
        success: true,
        data: cart,
        message: 'Item added to cart',
      });
    } else if (action === 'merge' && guestCartItems) {
      // Merge guest cart with user cart
      const cart = await mergeGuestCart(guestCartItems, context);
      
      return NextResponse.json({
        success: true,
        data: cart,
        message: 'Carts merged successfully',
      });
    } else if (items) {
      // Save entire cart
      const cart = await saveCart(items, context);
      
      return NextResponse.json({
        success: true,
        data: cart,
        message: 'Cart saved successfully',
      });
    } else {
      return NextResponse.json(
        { success: false, error: 'Invalid request: provide items, item with action=add, or guestCartItems with action=merge' },
        { status: 400 }
      );
    }

  } catch (error: any) {
    console.error('Error in POST /api/cart:', error);

    if (error instanceof ValidationError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      );
    }

    if (error instanceof NotFoundError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: false, error: error.message || 'Failed to save cart' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/cart
 * Protected endpoint - Clear user's cart
 */
export async function DELETE(request: NextRequest) {
  try {
    // Authenticate user
    const user = await authenticateUser(request);

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Fetch user data
    const { getAdminDb } = await import('../_lib/database/admin');
    const userDoc = await getAdminDb().collection('users').doc(user.userId).get();
    const userData = userDoc.data();

    // Clear cart using controller
    const cart = await clearCart({
      userId: user.userId,
      role: user.role as 'admin' | 'seller' | 'user',
      email: userData?.email,
    });

    return NextResponse.json({
      success: true,
      data: cart,
      message: 'Cart cleared successfully',
    });

  } catch (error: any) {
    console.error('Error in DELETE /api/cart:', error);

    return NextResponse.json(
      { success: false, error: error.message || 'Failed to clear cart' },
      { status: 500 }
    );
  }
}
