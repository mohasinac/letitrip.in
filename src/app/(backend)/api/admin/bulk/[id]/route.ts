/**
 * Admin Bulk Job Status API
 * GET /api/admin/bulk/[id] - Get job status and details
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAdminAuth, getAdminDb } from '../../../_lib/database/admin';
import { AuthorizationError, NotFoundError } from '../../../_lib/middleware/error-handler';

/**
 * Verify admin authentication
 */
async function verifyAdminAuth(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  
  if (!authHeader?.startsWith('Bearer ')) {
    throw new AuthorizationError('Authentication required');
  }

  const token = authHeader.substring(7);
  const auth = getAdminAuth();
  
  try {
    const decodedToken = await auth.verifyIdToken(token);
    const role = decodedToken.role || 'user';

    if (role !== 'admin') {
      throw new AuthorizationError('Admin access required');
    }

    return {
      uid: decodedToken.uid,
      role: role as 'admin',
      email: decodedToken.email,
    };
  } catch (error: any) {
    throw new AuthorizationError('Invalid or expired token');
  }
}

/**
 * GET /api/admin/bulk/[id]
 * Get bulk job status and details
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // Verify admin authentication
    await verifyAdminAuth(request);

    // Await params (Next.js 15 requirement)
    const params = await context.params;
    const jobId = params.id;

    const db = getAdminDb();
    const doc = await db.collection('bulk_jobs').doc(jobId).get();

    if (!doc.exists) {
      throw new NotFoundError('Bulk job not found');
    }

    const data = doc.data();

    return NextResponse.json({
      success: true,
      data: {
        id: doc.id,
        ...data,
        // Convert Firestore timestamps to ISO strings
        createdAt: data?.createdAt?.toDate?.()?.toISOString() || data?.createdAt,
        updatedAt: data?.updatedAt?.toDate?.()?.toISOString() || data?.updatedAt,
        startedAt: data?.startedAt?.toDate?.()?.toISOString() || data?.startedAt,
        completedAt: data?.completedAt?.toDate?.()?.toISOString() || data?.completedAt,
      },
    });
  } catch (error: any) {
    console.error('Error in GET /api/admin/bulk/[id]:', error);

    if (error instanceof AuthorizationError || error instanceof NotFoundError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: error.statusCode }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to fetch job status' },
      { status: 500 }
    );
  }
}
