/**
 * Seller Products API
 * GET /api/seller/products - List seller's products
 * POST /api/seller/products - Create new product
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAdminAuth, getAdminDb } from '../../_lib/database/admin';
import { Timestamp } from 'firebase-admin/firestore';
import { AuthorizationError, ValidationError } from '../../_lib/middleware/error-handler';

/**
 * Verify seller authentication
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
 * GET /api/seller/products
 * List all products for the authenticated seller with optional filtering
 */
export async function GET(request: NextRequest) {
  try {
    // Verify seller authentication
    const seller = await verifySellerAuth(request);
    const sellerId = seller.uid;

    const adminDb = getAdminDb();

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const category = searchParams.get('category');

    // Build query
    let query = adminDb
      .collection('products')
      .where('sellerId', '==', sellerId);

    // Filter by status
    if (status) {
      query = query.where('status', '==', status);
    }

    // Filter by category
    if (category) {
      query = query.where('categoryId', '==', category);
    }

    // Execute query
    const snapshot = await query.orderBy('createdAt', 'desc').get();

    // Map documents to products array
    const products = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate?.() || data.createdAt,
        updatedAt: data.updatedAt?.toDate?.() || data.updatedAt,
        startDate: data.startDate?.toDate?.() || data.startDate,
        expirationDate: data.expirationDate?.toDate?.() || data.expirationDate,
      };
    });

    // Apply client-side search filter if provided
    let filteredProducts = products;
    if (search) {
      const searchLower = search.toLowerCase();
      filteredProducts = products.filter(
        (product: any) =>
          product.name?.toLowerCase().includes(searchLower) ||
          product.sku?.toLowerCase().includes(searchLower) ||
          product.seo?.slug?.toLowerCase().includes(searchLower)
      );
    }

    return NextResponse.json({
      success: true,
      data: filteredProducts,
    });
  } catch (error: any) {
    console.error('Error in GET /api/seller/products:', error);

    if (error instanceof AuthorizationError || error instanceof ValidationError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: error.statusCode }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to list products' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/seller/products
 * Create a new product
 */
export async function POST(request: NextRequest) {
  try {
    // Verify seller authentication
    const seller = await verifySellerAuth(request);
    const sellerId = seller.uid;

    const adminDb = getAdminDb();
    const body = await request.json();

    // Validate required fields
    const requiredFields = ['name', 'categoryId', 'pricing', 'inventory', 'seo'];
    for (const field of requiredFields) {
      if (!body[field]) {
        throw new ValidationError(`Missing required field: ${field}`);
      }
    }

    // Validate SKU uniqueness if provided
    if (body.sku) {
      const existingProduct = await adminDb
        .collection('products')
        .where('sellerId', '==', sellerId)
        .where('sku', '==', body.sku)
        .limit(1)
        .get();

      if (!existingProduct.empty) {
        throw new ValidationError('SKU already exists for your products');
      }
    }

    // Validate slug uniqueness
    if (body.seo?.slug) {
      const existingSlug = await adminDb
        .collection('products')
        .where('seo.slug', '==', body.seo.slug)
        .limit(1)
        .get();

      if (!existingSlug.empty) {
        throw new ValidationError('Slug already exists. Please use a different one.');
      }
    }

    // Validate that categoryId is a leaf category (no children)
    const categoryDoc = await adminDb
      .collection('categories')
      .doc(body.categoryId)
      .get();

    if (!categoryDoc.exists) {
      throw new ValidationError('Invalid category. Category not found.');
    }

    const categoryData = categoryDoc.data();
    const childIds = categoryData?.childIds || [];

    if (childIds.length > 0) {
      throw new ValidationError(
        'Invalid category. Products can only be assigned to leaf categories (categories without sub-categories).'
      );
    }

    if (!categoryData?.isActive) {
      throw new ValidationError('Invalid category. Selected category is not active.');
    }

    // Prepare product data
    const now = Timestamp.now();
    const productData = {
      sellerId,
      name: body.name,
      shortDescription: body.shortDescription || '',
      description: body.description || '',
      categoryId: body.categoryId,
      categoryName: body.categoryName || '',
      tags: body.tags || [],
      sku: body.sku || '',

      pricing: {
        price: parseFloat(body.pricing.price),
        compareAtPrice: body.pricing.compareAtPrice
          ? parseFloat(body.pricing.compareAtPrice)
          : null,
        cost: body.pricing.cost ? parseFloat(body.pricing.cost) : null,
      },

      inventory: {
        quantity: parseInt(body.inventory.quantity) || 0,
        lowStockThreshold: parseInt(body.inventory.lowStockThreshold) || 1,
        trackInventory: body.inventory.trackInventory !== false,
        isUnique: body.inventory.isUnique || false,
        sku: body.inventory.sku || body.sku || '',
      },

      pickupAddressId: body.pickupAddressId || null,

      media: {
        images: body.media?.images || [],
        videos: body.media?.videos || [],
      },

      condition: body.condition || 'new',
      isReturnable: body.isReturnable !== false,
      returnPeriodDays: body.isReturnable ? body.returnPeriodDays || 7 : 0,
      hasFreeShipping: body.hasFreeShipping || false,
      shippingMethod: body.shippingMethod || 'seller',
      features: body.features || [],
      specifications: body.specifications || {},
      dimensions: body.dimensions || null,

      seo: {
        title: body.seo.title,
        description: body.seo.description || '',
        keywords: body.seo.keywords || [],
        slug: body.seo.slug,
      },

      startDate: body.startDate
        ? Timestamp.fromDate(new Date(body.startDate))
        : now,
      expirationDate: body.expirationDate
        ? Timestamp.fromDate(new Date(body.expirationDate))
        : null,

      status: body.status || 'draft',

      stats: {
        views: 0,
        sales: 0,
        revenue: 0,
      },

      createdAt: now,
      updatedAt: now,
    };

    // Create product in Firestore
    const docRef = await adminDb.collection('products').add(productData);

    // Return created product
    const createdProduct = {
      id: docRef.id,
      ...productData,
      createdAt: productData.createdAt.toDate(),
      updatedAt: productData.updatedAt.toDate(),
      startDate: productData.startDate?.toDate?.(),
      expirationDate: productData.expirationDate?.toDate?.(),
    };

    return NextResponse.json(
      {
        success: true,
        data: createdProduct,
        message: 'Product created successfully',
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error in POST /api/seller/products:', error);

    if (error instanceof AuthorizationError || error instanceof ValidationError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: error.statusCode }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to create product' },
      { status: 500 }
    );
  }
}
