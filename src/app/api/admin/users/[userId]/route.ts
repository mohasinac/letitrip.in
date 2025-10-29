import { NextRequest, NextResponse } from 'next/server';
import { getAdminAuth, getAdminDb } from '@/lib/database/admin';

export async function GET(
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

      // Get specific user
      const targetUserDoc = await db.collection('users').doc(params.userId).get();
      if (!targetUserDoc.exists) {
        return NextResponse.json(
          { success: false, error: 'User not found' },
          { status: 404 }
        );
      }

      const user = {
        id: targetUserDoc.id,
        uid: targetUserDoc.id,
        ...targetUserDoc.data(),
      };

      return NextResponse.json(user);
    } catch (error: any) {
      console.error('Firebase token verification error:', error);
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }
  } catch (error: any) {
    console.error('Get user error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch user' },
      { status: 500 }
    );
  }
}

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
    const { role, isBanned } = body;

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

      // Update user
      const updateData: any = {};
      if (role) {
        updateData.role = role;
      }
      if (isBanned !== undefined) {
        updateData.isBanned = isBanned;
      }

      if (Object.keys(updateData).length === 0) {
        return NextResponse.json(
          { success: false, error: 'No update data provided' },
          { status: 400 }
        );
      }

      updateData.updatedAt = new Date().toISOString();

      await db.collection('users').doc(params.userId).update(updateData);

      return NextResponse.json({
        success: true,
        message: 'User updated successfully',
        data: updateData,
      });
    } catch (error: any) {
      console.error('Firebase token verification error:', error);
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }
  } catch (error: any) {
    console.error('Update user error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update user' },
      { status: 500 }
    );
  }
}
