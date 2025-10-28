import { NextRequest, NextResponse } from 'next/server';
import { getAdminAuth, getAdminDb } from '@/lib/database/admin';

export async function PUT(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { isBanned } = body;

    try {
      const token = authHeader.substring(7);
      const auth = getAdminAuth();
      const decodedToken = await auth.verifyIdToken(token);

      // Check if user is admin
      const db = getAdminDb();
      const userDoc = await db.collection('users').doc(decodedToken.uid).get();
      const userData = userDoc.data();

      if (!userData || userData.role !== 'admin') {
        return NextResponse.json(
          { success: false, error: 'Admin access required' },
          { status: 403 }
        );
      }

      // Update ban status
      await db.collection('users').doc(params.userId).update({
        isBanned: Boolean(isBanned),
        updatedAt: new Date().toISOString(),
      });

      return NextResponse.json({
        success: true,
        message: `User ${isBanned ? 'banned' : 'unbanned'} successfully`,
      });
    } catch (error: any) {
      console.error('Firebase token verification error:', error);
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }
  } catch (error: any) {
    console.error('Ban user error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to ban/unban user' },
      { status: 500 }
    );
  }
}
