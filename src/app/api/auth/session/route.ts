/**
 * Session Management API Route
 * 
 * Handles session cookie creation and deletion for Firebase Auth.
 * Called by client after Firebase Auth login/logout.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createSessionCookie, revokeUserTokens } from '@/lib/firebase/auth-server';
import { cookies } from 'next/headers';

/**
 * POST /api/auth/session
 * Create session cookie from Firebase ID token
 */
export async function POST(request: NextRequest) {
  try {
    const { idToken } = await request.json();

    if (!idToken) {
      return NextResponse.json(
        { error: 'ID token required' },
        { status: 400 }
      );
    }

    // Create session cookie (5 days expiry)
    const expiresIn = 60 * 60 * 24 * 5 * 1000; // 5 days
    const sessionCookie = await createSessionCookie(idToken, expiresIn);

    // Set session cookie
    const cookieStore = await cookies();
    cookieStore.set('__session', sessionCookie, {
      maxAge: expiresIn / 1000,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Session creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create session' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/auth/session
 * Delete session cookie and revoke tokens
 */
export async function DELETE(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('__session')?.value;

    if (sessionCookie) {
      // Revoke user's refresh tokens
      const { adminAuth } = await import('@/lib/firebase/admin');
      const decodedClaims = await adminAuth.verifySessionCookie(sessionCookie);
      await revokeUserTokens(decodedClaims.uid);
    }

    // Delete session cookie
    cookieStore.delete('__session');
    cookieStore.delete('idToken');

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Session deletion error:', error);
    // Still delete cookies even if revocation fails
    const cookieStore = await cookies();
    cookieStore.delete('__session');
    cookieStore.delete('idToken');
    
    return NextResponse.json({ success: true });
  }
}
