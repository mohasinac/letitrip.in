/**
 * API Route: User Sessions
 * Handles session creation, updates, and management via cookies
 * Path: /api/sessions
 */

import { NextRequest, NextResponse } from 'next/server';
import { CookieSessionService } from '@/lib/auth/cookie-session';

/**
 * GET /api/sessions
 * Get current session data from cookie
 */
export async function GET(request: NextRequest) {
  try {
    const session = await CookieSessionService.getOrCreateSession();

    return NextResponse.json({
      success: true,
      data: session,
    });
  } catch (error) {
    console.error('Error fetching session:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch session' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/sessions
 * Create or update session via actions
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, data } = body;

    if (!action) {
      return NextResponse.json(
        { success: false, error: 'Action is required' },
        { status: 400 }
      );
    }

    let result;

    switch (action) {
      case 'update_page':
        if (!data?.page) {
          return NextResponse.json(
            { success: false, error: 'Page URL is required' },
            { status: 400 }
          );
        }
        await CookieSessionService.updateLastVisitedPage(data.page);
        result = { updated: true, page: data.page };
        break;

      case 'update_cart':
        if (data?.count === undefined) {
          return NextResponse.json(
            { success: false, error: 'Cart count is required' },
            { status: 400 }
          );
        }
        await CookieSessionService.updateCartCount(data.count);
        result = { updated: true, cartCount: data.count };
        break;

      case 'set_user':
        if (!data?.userId) {
          return NextResponse.json(
            { success: false, error: 'User ID is required' },
            { status: 400 }
          );
        }
        await CookieSessionService.setUserInSession(data.userId);
        result = { updated: true, userId: data.userId };
        break;

      case 'get_last_page':
        const lastPage = await CookieSessionService.getLastVisitedPage();
        result = { lastVisitedPage: lastPage };
        break;

      case 'get_cart_count':
        const cartCount = await CookieSessionService.getCartCount();
        result = { cartCount };
        break;

      case 'get_user':
        const userId = await CookieSessionService.getUserIdFromSession();
        result = { userId };
        break;

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Error in session action:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process session action' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/sessions
 * Update session data
 */
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, data } = body;

    if (!action) {
      return NextResponse.json(
        { success: false, error: 'Action is required' },
        { status: 400 }
      );
    }

    let result;

    switch (action) {
      case 'update_page':
        if (!data?.page) {
          return NextResponse.json(
            { success: false, error: 'Page URL is required' },
            { status: 400 }
          );
        }
        await CookieSessionService.updateLastVisitedPage(data.page);
        result = { updated: true, page: data.page };
        break;

      case 'update_cart':
        if (data?.count === undefined) {
          return NextResponse.json(
            { success: false, error: 'Cart count is required' },
            { status: 400 }
          );
        }
        await CookieSessionService.updateCartCount(data.count);
        result = { updated: true, cartCount: data.count };
        break;

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Error updating session:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update session' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/sessions
 * Clear session (logout)
 */
export async function DELETE(request: NextRequest) {
  try {
    await CookieSessionService.clearSession();

    return NextResponse.json({
      success: true,
      message: 'Session cleared',
    });
  } catch (error) {
    console.error('Error clearing session:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to clear session' },
      { status: 500 }
    );
  }
}
