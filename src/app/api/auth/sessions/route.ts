import { NextRequest, NextResponse } from 'next/server';
import { withMiddleware } from '../../middleware';
import { requireAuth, AuthenticatedRequest } from '../../middleware/auth';
import { 
  getUserSessions, 
  deleteSession, 
  deleteAllUserSessions 
} from '../../lib/session';

async function getSessionsHandler(req: AuthenticatedRequest) {
  try {
    if (!req.session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get all active sessions for the user
    const sessions = await getUserSessions(req.session.userId);

    return NextResponse.json(
      {
        sessions: sessions.map(session => ({
          sessionId: session.sessionId,
          createdAt: session.createdAt,
          expiresAt: session.expiresAt,
          lastActivity: session.lastActivity,
          userAgent: session.userAgent,
          ipAddress: session.ipAddress,
          isCurrent: session.sessionId === req.session!.sessionId,
        }))
      },
      { status: 200 }
    );

  } catch (error: any) {
    console.error('Get sessions error:', error);

    return NextResponse.json(
      { 
        error: 'Failed to get sessions',
        message: process.env.NODE_ENV === 'production' 
          ? 'An unexpected error occurred' 
          : error.message 
      },
      { status: 500 }
    );
  }
}

async function deleteSessionHandler(req: AuthenticatedRequest) {
  try {
    if (!req.session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { sessionId, deleteAll } = body;

    // Delete all sessions
    if (deleteAll) {
      await deleteAllUserSessions(req.session.userId);
      return NextResponse.json(
        { message: 'All sessions deleted successfully' },
        { status: 200 }
      );
    }

    // Delete specific session
    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }

    // Verify the session belongs to the user
    const sessions = await getUserSessions(req.session.userId);
    const sessionToDelete = sessions.find(s => s.sessionId === sessionId);

    if (!sessionToDelete) {
      return NextResponse.json(
        { error: 'Session not found or does not belong to user' },
        { status: 404 }
      );
    }

    await deleteSession(sessionId);

    return NextResponse.json(
      { message: 'Session deleted successfully' },
      { status: 200 }
    );

  } catch (error: any) {
    console.error('Delete session error:', error);

    return NextResponse.json(
      { 
        error: 'Failed to delete session',
        message: process.env.NODE_ENV === 'production' 
          ? 'An unexpected error occurred' 
          : error.message 
      },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  return withMiddleware(req, (r) => requireAuth(r, getSessionsHandler), {
    rateLimit: {
      maxRequests: 20,
      windowMs: 60 * 1000,
    },
  });
}

export async function DELETE(req: NextRequest) {
  return withMiddleware(req, (r) => requireAuth(r, deleteSessionHandler), {
    rateLimit: {
      maxRequests: 10,
      windowMs: 60 * 1000,
    },
  });
}
