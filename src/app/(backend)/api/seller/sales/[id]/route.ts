import { NextRequest, NextResponse } from 'next/server';
import { getAdminAuth, getAdminDb } from '../../../_lib/database/admin';
import { Timestamp } from 'firebase-admin/firestore';
import {
  AuthorizationError,
  ValidationError,
  NotFoundError,
} from '../../../_lib/middleware/error-handler';


/**
 * Helper function to verify seller authentication
 */
async function verifySellerAuth(request: NextRequest) {
  const authHeader = request.headers.get('authorization');

  if (!authHeader?.startsWith('Bearer ')) {
    throw new AuthorizationError('Authentication required');
  }

  const token = authHeader.substring(7);
  const auth = getAdminAuth();

  try {
    const decodedToken = await auth.verifyIdToken(token);
    const role = decodedToken.role || 'user';

    if (role !== 'seller' && role !== 'admin') {
      throw new AuthorizationError('Seller access required');
    }

    return {
      uid: decodedToken.uid,
      role: role as 'seller' | 'admin',
      email: decodedToken.email,
    };
  } catch (error: any) {
    throw new AuthorizationError('Invalid or expired token');
  }
}

/**
 * GET /api/seller/sales/[id]
 * Get a specific sale by ID
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // Verify authentication
    const seller = await verifySellerAuth(request);
    const { id } = await context.params;
    const db = getAdminDb();

    // Get sale document
    const docRef = db.collection('sales').doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      throw new NotFoundError('Sale not found');
    }

    const saleData = doc.data();

    // Verify ownership (unless admin)
    if (seller.role !== 'admin' && saleData?.sellerId !== seller.uid) {
      throw new AuthorizationError('Not your sale');
    }

    // Convert Firestore timestamps to dates
    const sale = {
      id: doc.id,
      ...saleData,
      startDate: saleData?.startDate?.toDate?.() || saleData?.startDate,
      endDate: saleData?.endDate?.toDate?.() || saleData?.endDate,
      createdAt: saleData?.createdAt?.toDate?.() || saleData?.createdAt,
      updatedAt: saleData?.updatedAt?.toDate?.() || saleData?.updatedAt,
    };

    return NextResponse.json({
      success: true,
      data: sale,
    });
  } catch (error: any) {
    if (
      error instanceof AuthorizationError ||
      error instanceof ValidationError ||
      error instanceof NotFoundError
    ) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: error.statusCode }
      );
    }

    console.error('Error fetching sale:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch sale' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/seller/sales/[id]
 * Update a specific sale
 */
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // Verify authentication
    const seller = await verifySellerAuth(request);
    const { id } = await context.params;
    const db = getAdminDb();

    // Parse request body
    const body = await request.json();

    // Get existing sale
    const docRef = db.collection('sales').doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      throw new NotFoundError('Sale not found');
    }

    const existingSale = doc.data();

    // Verify ownership (unless admin)
    if (seller.role !== 'admin' && existingSale?.sellerId !== seller.uid) {
      throw new AuthorizationError('Not your sale');
    }

    // Prepare update data
    const updateData: any = {
      updatedAt: Timestamp.now(),
    };

    // Only update fields that are provided
    if (body.name !== undefined) updateData.name = body.name;
    if (body.description !== undefined)
      updateData.description = body.description;
    if (body.discountType !== undefined) {
      if (!['percentage', 'fixed'].includes(body.discountType)) {
        throw new ValidationError(
          "Invalid discount type. Must be 'percentage' or 'fixed'"
        );
      }
      updateData.discountType = body.discountType;
    }
    if (body.discountValue !== undefined) {
      updateData.discountValue = parseFloat(body.discountValue);
    }
    if (body.applyTo !== undefined) {
      if (
        !['all', 'specific_products', 'specific_categories'].includes(
          body.applyTo
        )
      ) {
        throw new ValidationError(
          "Invalid applyTo value. Must be 'all', 'specific_products', or 'specific_categories'"
        );
      }
      updateData.applyTo = body.applyTo;
    }
    if (body.applicableProducts !== undefined) {
      updateData.applicableProducts = body.applicableProducts;
    }
    if (body.applicableCategories !== undefined) {
      updateData.applicableCategories = body.applicableCategories;
    }
    if (body.enableFreeShipping !== undefined) {
      updateData.enableFreeShipping = body.enableFreeShipping;
    }
    if (body.isPermanent !== undefined) {
      updateData.isPermanent = body.isPermanent;
    }
    if (body.startDate !== undefined) {
      updateData.startDate = body.startDate
        ? Timestamp.fromDate(new Date(body.startDate))
        : Timestamp.now();
    }
    if (body.endDate !== undefined) {
      updateData.endDate = body.endDate
        ? Timestamp.fromDate(new Date(body.endDate))
        : null;
    }
    if (body.status !== undefined) {
      updateData.status = body.status;
    }

    // Update sale in Firestore
    await docRef.update(updateData);

    // Get updated sale
    const updatedDoc = await docRef.get();
    const updatedSale = {
      id: updatedDoc.id,
      ...updatedDoc.data(),
      startDate: updatedDoc.data()?.startDate?.toDate?.(),
      endDate: updatedDoc.data()?.endDate?.toDate?.(),
      createdAt: updatedDoc.data()?.createdAt?.toDate?.(),
      updatedAt: updatedDoc.data()?.updatedAt?.toDate?.(),
    };

    return NextResponse.json({
      success: true,
      data: updatedSale,
      message: 'Sale updated successfully',
    });
  } catch (error: any) {
    if (
      error instanceof AuthorizationError ||
      error instanceof ValidationError ||
      error instanceof NotFoundError
    ) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: error.statusCode }
      );
    }

    console.error('Error updating sale:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update sale' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/seller/sales/[id]
 * Delete a specific sale
 */
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // Verify authentication
    const seller = await verifySellerAuth(request);
    const { id } = await context.params;
    const db = getAdminDb();

    // Get sale document
    const docRef = db.collection('sales').doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      throw new NotFoundError('Sale not found');
    }

    const saleData = doc.data();

    // Verify ownership (unless admin)
    if (seller.role !== 'admin' && saleData?.sellerId !== seller.uid) {
      throw new AuthorizationError('Not your sale');
    }

    // Delete the sale
    await docRef.delete();

    return NextResponse.json({
      success: true,
      message: 'Sale deleted successfully',
    });
  } catch (error: any) {
    if (
      error instanceof AuthorizationError ||
      error instanceof ValidationError ||
      error instanceof NotFoundError
    ) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: error.statusCode }
      );
    }

    console.error('Error deleting sale:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete sale' },
      { status: 500 }
    );
  }
}
