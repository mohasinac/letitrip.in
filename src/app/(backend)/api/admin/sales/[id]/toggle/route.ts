/**
 * Admin Sale Toggle API
 * POST /api/admin/sales/[id]/toggle - Toggle sale active status
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '../../../../_lib/database/admin';
import { verifyAdminSession } from '../../../../_lib/auth/admin-auth';
import { AuthorizationError, ValidationError, NotFoundError } from '../../../../_lib/middleware/error-handler';

/**
 * POST /api/admin/sales/[id]/toggle
 * Toggle sale active status
 */
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // Verify admin authentication
    await verifyAdminSession(request);

    // Await params (Next.js 15 requirement)
    const params = await context.params;
    const saleId = params.id;

    if (!saleId) {
      throw new ValidationError('Sale ID is required');
    }

    const db = getAdminDb();
    const saleRef = db.collection('sales').doc(saleId);

    // Get current sale
    const saleDoc = await saleRef.get();
    if (!saleDoc.exists) {
      throw new NotFoundError('Sale not found');
    }

    const saleData = saleDoc.data();
    const newStatus = saleData?.status === 'active' ? 'inactive' : 'active';

    // Update sale status
    await saleRef.update({
      status: newStatus,
      updatedAt: new Date(),
    });

    return NextResponse.json({
      success: true,
      message: 'Sale status updated successfully',
      data: { status: newStatus },
    });
  } catch (error: any) {
    console.error('Error in POST /api/admin/sales/[id]/toggle:', error);

    if (error instanceof AuthorizationError || error instanceof ValidationError || error instanceof NotFoundError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: error.statusCode }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to toggle sale status' },
      { status: 500 }
    );
  }
}
