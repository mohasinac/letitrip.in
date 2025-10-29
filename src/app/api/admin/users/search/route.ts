import { NextRequest, NextResponse } from 'next/server';
import { getAdminAuth, getAdminDb } from '@/lib/database/admin';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const searchQuery = request.nextUrl.searchParams.get('q') || '';

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

      // Search users by email or name
      const usersSnapshot = await db.collection('users').limit(100).get();
      const allUsers = usersSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          uid: doc.id,
          email: data?.email || '',
          name: data?.name || '',
          phone: data?.phone,
          role: data?.role,
          isBanned: data?.isBanned,
          createdAt: data?.createdAt,
          updatedAt: data?.updatedAt,
          ...data,
        };
      });

      const results = allUsers.filter(user => {
        const query = searchQuery.toLowerCase();
        return (
          user.email?.toLowerCase().includes(query) ||
          user.name?.toLowerCase().includes(query)
        );
      });

      return NextResponse.json(results);
    } catch (error: any) {
      console.error('Firebase token verification error:', error);
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }
  } catch (error: any) {
    console.error('Search users error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to search users' },
      { status: 500 }
    );
  }
}
