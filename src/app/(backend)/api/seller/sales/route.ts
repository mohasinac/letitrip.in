import { NextRequest, NextResponse } from 'next/server';
import { verifySellerSession } from '../../_lib/auth/admin-auth';
import { Timestamp } from 'firebase-admin/firestore';
import {
  AuthorizationError,
  ValidationError,
  NotFoundError,
} from '../../_lib/middleware/error-handler';



/**
 * GET /api/seller/sales
 * List all sales for the authenticated seller with optional filtering
 */
export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const session = await verifySellerSession(request);
    const db = getAdminDb();

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    // Build query
    let query: any = db.collection('sales').where('sellerId', '==', seller.uid);

    // Filter by status
    if (status) {
      query = query.where('status', '==', status);
    }

    // Execute query
    const snapshot = await query.orderBy('createdAt', 'desc').get();

    // Map documents to sales array
    const sales = snapshot.docs.map((doc: any) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        startDate: data.startDate?.toDate?.() || data.startDate,
        endDate: data.endDate?.toDate?.() || data.endDate,
        createdAt: data.createdAt?.toDate?.() || data.createdAt,
        updatedAt: data.updatedAt?.toDate?.() || data.updatedAt,
      };
    });

    // Apply client-side search filter if provided
    let filteredSales = sales;
    if (search) {
      const searchLower = search.toLowerCase();
      filteredSales = sales.filter(
        (sale: any) =>
          sale.name?.toLowerCase().includes(searchLower) ||
          sale.description?.toLowerCase().includes(searchLower)
      );
    }

    return NextResponse.json({
      success: true,
      data: filteredSales,
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

    console.error('Error listing sales:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to list sales' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/seller/sales
 * Create a new sale
 */
export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const session = await verifySellerSession(request);
    const db = getAdminDb();

    // Parse request body
    const body = await request.json();

    // Validate required fields
    const requiredFields = ['name', 'discountType', 'discountValue', 'applyTo'];
    for (const field of requiredFields) {
      if (!body[field]) {
        throw new ValidationError(`Missing required field: ${field}`);
      }
    }

    // Validate discount type
    if (!['percentage', 'fixed'].includes(body.discountType)) {
      throw new ValidationError(
        "Invalid discount type. Must be 'percentage' or 'fixed'"
      );
    }

    // Validate applyTo
    if (
      !['all', 'specific_products', 'specific_categories'].includes(
        body.applyTo
      )
    ) {
      throw new ValidationError(
        "Invalid applyTo value. Must be 'all', 'specific_products', or 'specific_categories'"
      );
    }

    // Validate that products/categories are provided when needed
    if (
      body.applyTo === 'specific_products' &&
      !body.applicableProducts?.length
    ) {
      throw new ValidationError(
        "Products must be specified when applyTo is 'specific_products'"
      );
    }

    if (
      body.applyTo === 'specific_categories' &&
      !body.applicableCategories?.length
    ) {
      throw new ValidationError(
        "Categories must be specified when applyTo is 'specific_categories'"
      );
    }

    // Prepare sale data
    const now = Timestamp.now();
    const saleData = {
      sellerId: seller.uid,
      name: body.name,
      description: body.description || '',
      discountType: body.discountType,
      discountValue: parseFloat(body.discountValue),
      applyTo: body.applyTo,
      applicableProducts: body.applicableProducts || [],
      applicableCategories: body.applicableCategories || [],
      enableFreeShipping: body.enableFreeShipping || false,
      isPermanent: body.isPermanent || false,
      startDate: body.startDate
        ? Timestamp.fromDate(new Date(body.startDate))
        : now,
      endDate: body.endDate ? Timestamp.fromDate(new Date(body.endDate)) : null,
      status: body.status || 'active',
      stats: {
        ordersCount: 0,
        revenue: 0,
        discountGiven: 0,
      },
      createdAt: now,
      updatedAt: now,
    };

    // Create sale in Firestore
    const docRef = await db.collection('sales').add(saleData);

    // Return created sale
    const createdSale = {
      id: docRef.id,
      ...saleData,
      startDate: saleData.startDate?.toDate?.(),
      endDate: saleData.endDate?.toDate?.(),
      createdAt: saleData.createdAt.toDate(),
      updatedAt: saleData.updatedAt.toDate(),
    };

    return NextResponse.json(
      {
        success: true,
        data: createdSale,
        message: 'Sale created successfully',
      },
      { status: 201 }
    );
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

    console.error('Error creating sale:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create sale' },
      { status: 500 }
    );
  }
}
