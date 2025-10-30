/**
 * API Route: User Sessions
 * Handles session creation, updates, and management via cookies
 * Path: /api/sessions
 * 
 * REFACTORED: Uses standardized API utilities
 */

import { createApiHandler, successResponse, errorResponse, HTTP_STATUS } from '@/lib/api';
import { CookieSessionService } from '@/lib/auth/cookie-session';

/**
 * GET /api/sessions
 * Get current session data from cookie
 */
export const GET = createApiHandler(async (request) => {
  const session = await CookieSessionService.getOrCreateSession();
  return successResponse(session);
});

/**
 * POST /api/sessions
 * Create or update session via actions
 */
export const POST = createApiHandler(async (request) => {
  const body = await request.json();
  const { action, data } = body;

  if (!action) {
    return errorResponse('Action is required', HTTP_STATUS.BAD_REQUEST);
  }

  let result;

  switch (action) {
    case 'update_page':
      if (!data?.page) {
        return errorResponse('Page URL is required', HTTP_STATUS.BAD_REQUEST);
      }
      await CookieSessionService.updateLastVisitedPage(data.page);
      result = { updated: true, page: data.page };
      break;

    case 'update_cart':
      if (data?.count === undefined) {
        return errorResponse('Cart count is required', HTTP_STATUS.BAD_REQUEST);
      }
      await CookieSessionService.updateCartCount(data.count);
      result = { updated: true, cartCount: data.count };
      break;

    case 'set_user':
      if (!data?.userId) {
        return errorResponse('User ID is required', HTTP_STATUS.BAD_REQUEST);
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
      return errorResponse('Invalid action', HTTP_STATUS.BAD_REQUEST);
  }

  return successResponse(result);
});

/**
 * PATCH /api/sessions
 * Update session data
 */
export const PATCH = createApiHandler(async (request) => {
  const body = await request.json();
  const { action, data } = body;

  if (!action) {
    return errorResponse('Action is required', HTTP_STATUS.BAD_REQUEST);
  }

  let result;

  switch (action) {
    case 'update_page':
      if (!data?.page) {
        return errorResponse('Page URL is required', HTTP_STATUS.BAD_REQUEST);
      }
      await CookieSessionService.updateLastVisitedPage(data.page);
      result = { updated: true, page: data.page };
      break;

    case 'update_cart':
      if (data?.count === undefined) {
        return errorResponse('Cart count is required', HTTP_STATUS.BAD_REQUEST);
      }
      await CookieSessionService.updateCartCount(data.count);
      result = { updated: true, cartCount: data.count };
      break;

    default:
      return errorResponse('Invalid action', HTTP_STATUS.BAD_REQUEST);
  }

  return successResponse(result);
});

/**
 * DELETE /api/sessions
 * Clear session (logout)
 */
export const DELETE = createApiHandler(async (request) => {
  await CookieSessionService.clearSession();
  return successResponse({ message: 'Session cleared' });
});
