/**
 * User Session Sync API Route
 * POST /api/user/sync-session
 * Syncs guest session data (cart, last visited page) to user's database
 */

import { NextRequest, NextResponse } from 'next/server';
import { createUserHandler } from '@/lib/auth/api-middleware';
import { getAdminDb } from '@/lib/database/admin';

export const POST = createUserHandler(async (request: NextRequest, user) => {
  try {
    const { sessionData } = await request.json();

    if (!sessionData) {
      return NextResponse.json(
        { success: false, error: 'Session data is required' },
        { status: 400 }
      );
    }

    const db = getAdminDb();
    const userId = user.userId;

    // Store session data in user's document
    const userRef = db.collection('users').doc(userId);
    
    await userRef.update({
      guestSessionData: {
        ...sessionData,
        syncedAt: new Date().toISOString(),
      },
      lastVisitedPage: sessionData.lastVisitedPage || null,
      updatedAt: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      message: 'Session synced successfully',
    });
  } catch (error: any) {
    console.error('Session sync error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to sync session' },
      { status: 500 }
    );
  }
});
