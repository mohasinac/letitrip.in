/**
 * Wishlist API Route
 * 
 * GET: Get user's wishlist
 * POST: Add item to wishlist
 * DELETE: Remove item or clear wishlist
 */

import { NextRequest, NextResponse } from 'next/server';
import { authenticateUser } from '../_lib/auth/middleware';
import { getAdminDb } from '../_lib/database/admin';

/**
 * GET /api/wishlist
 * Protected endpoint - Get user's wishlist
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

    // Get wishlist from database
    const db = getAdminDb();
    const userDoc = await db.collection('users').doc(user.userId).get();
    const userData = userDoc.data();
    
    const wishlist = userData?.wishlist || [];

    return NextResponse.json({
      success: true,
      data: {
        items: wishlist,
        itemCount: wishlist.length,
      },
    });

  } catch (error: any) {
    console.error('Error in GET /api/wishlist:', error);

    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch wishlist' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/wishlist
 * Protected endpoint - Add item to wishlist
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
    const { item } = body;

    if (!item || !item.productId) {
      return NextResponse.json(
        { success: false, error: 'Invalid item data' },
        { status: 400 }
      );
    }

    // Get current wishlist
    const db = getAdminDb();
    const userDoc = await db.collection('users').doc(user.userId).get();
    const userData = userDoc.data();
    
    const wishlist = userData?.wishlist || [];

    // Check if item already exists
    const exists = wishlist.some((w: any) => w.productId === item.productId);

    if (exists) {
      return NextResponse.json(
        { success: false, error: 'Item already in wishlist' },
        { status: 400 }
      );
    }

    // Add item to wishlist
    const newItem = {
      ...item,
      addedAt: new Date().toISOString(),
    };

    wishlist.push(newItem);

    // Update database
    await db.collection('users').doc(user.userId).update({
      wishlist,
      updatedAt: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      data: {
        items: wishlist,
        itemCount: wishlist.length,
      },
      message: 'Item added to wishlist',
    });

  } catch (error: any) {
    console.error('Error in POST /api/wishlist:', error);

    return NextResponse.json(
      { success: false, error: error.message || 'Failed to add item to wishlist' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/wishlist
 * Protected endpoint - Remove item or clear wishlist
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

    const { searchParams } = new URL(request.url);
    const itemId = searchParams.get('itemId');

    const db = getAdminDb();
    const userDoc = await db.collection('users').doc(user.userId).get();
    const userData = userDoc.data();
    
    let wishlist = userData?.wishlist || [];

    if (itemId) {
      // Remove specific item
      wishlist = wishlist.filter((item: any) => item.id !== itemId);
    } else {
      // Clear entire wishlist
      wishlist = [];
    }

    // Update database
    await db.collection('users').doc(user.userId).update({
      wishlist,
      updatedAt: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      data: {
        items: wishlist,
        itemCount: wishlist.length,
      },
      message: itemId ? 'Item removed from wishlist' : 'Wishlist cleared',
    });

  } catch (error: any) {
    console.error('Error in DELETE /api/wishlist:', error);

    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update wishlist' },
      { status: 500 }
    );
  }
}
