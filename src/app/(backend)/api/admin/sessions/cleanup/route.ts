import { NextRequest, NextResponse } from 'next/server';
import { cleanupExpiredSessions } from '../../../_lib/auth/session-store';

/**
 * POST /api/admin/sessions/cleanup - Clean up expired sessions
 * 
 * This endpoint can be called periodically by a cron job (e.g., Vercel Cron)
 * to remove expired sessions from Firestore and free up storage
 * 
 * Authorization: No auth required (should be called by cron with secret key)
 */
export async function POST(request: NextRequest) {
  try {
    // Verify cron secret (optional security)
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Clean up expired sessions
    const deletedCount = await cleanupExpiredSessions();
    
    return NextResponse.json({
      success: true,
      message: `Cleaned up ${deletedCount} expired sessions`,
      deletedCount,
    });
  } catch (error: any) {
    console.error('Error cleaning up sessions:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to cleanup sessions' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/admin/sessions/cleanup - Get cleanup stats (no action)
 */
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Use POST to trigger cleanup',
      endpoint: '/api/admin/sessions/cleanup',
    });
  } catch (error: any) {
    console.error('Error:', error);
    return NextResponse.json(
      { success: false, error: 'Server error' },
      { status: 500 }
    );
  }
}
