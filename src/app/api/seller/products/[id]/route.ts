import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase/admin';
import { getAuth } from 'firebase-admin/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = getAdminDb();
    
    // Get seller ID from authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const decodedToken = await getAuth().verifyIdToken(token);
    const sellerId = decodedToken.uid;

    // Get product and verify ownership
    const productDoc = await db.collection('products').doc(id).get();
    
    if (!productDoc.exists) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    const productData = productDoc.data();
    
    // Verify the product belongs to this seller
    if (productData?.sellerId !== sellerId) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    return NextResponse.json({
      id: productDoc.id,
      ...productData,
      createdAt: productData?.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
      updatedAt: productData?.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json(
      { error: 'Failed to fetch product' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = getAdminDb();
    const body = await request.json();
    
    // Get seller ID from authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const decodedToken = await getAuth().verifyIdToken(token);
    const sellerId = decodedToken.uid;

    // Get product and verify ownership
    const productRef = db.collection('products').doc(id);
    const productDoc = await productRef.get();
    
    if (!productDoc.exists) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    const productData = productDoc.data();
    
    // Verify the product belongs to this seller
    if (productData?.sellerId !== sellerId) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    // Update the product
    const updateData = {
      ...body,
      updatedAt: new Date(),
    };

    // Remove fields that shouldn't be updated
    delete updateData.id;
    delete updateData.createdAt;
    delete updateData.sellerId;

    await productRef.update(updateData);

    // Get updated product
    const updatedDoc = await productRef.get();
    const updatedData = updatedDoc.data();

    return NextResponse.json({
      id: updatedDoc.id,
      ...updatedData,
      createdAt: updatedData?.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
      updatedAt: updatedData?.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json(
      { error: 'Failed to update product' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = getAdminDb();
    
    // Get seller ID from authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const decodedToken = await getAuth().verifyIdToken(token);
    const sellerId = decodedToken.uid;

    // Get product and verify ownership
    const productRef = db.collection('products').doc(id);
    const productDoc = await productRef.get();
    
    if (!productDoc.exists) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    const productData = productDoc.data();
    
    // Verify the product belongs to this seller
    if (productData?.sellerId !== sellerId) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    // Check if product has active orders
    const ordersSnapshot = await db.collection('orders')
      .where('status', 'in', ['pending', 'confirmed', 'processing', 'shipped'])
      .get();

    let hasActiveOrders = false;
    ordersSnapshot.forEach(doc => {
      const order = doc.data();
      if (order.items?.some((item: any) => item.productId === id)) {
        hasActiveOrders = true;
      }
    });

    if (hasActiveOrders) {
      return NextResponse.json(
        { error: 'Cannot delete product with active orders. Consider marking it as inactive instead.' },
        { status: 400 }
      );
    }

    // Delete the product
    await productRef.delete();

    return NextResponse.json({
      message: 'Product deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json(
      { error: 'Failed to delete product' },
      { status: 500 }
    );
  }
}
