import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from '@/lib/database/admin';
import { getAuth } from 'firebase-admin/auth';

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const decodedToken = await getAuth().verifyIdToken(token);
    const userId = decodedToken.uid;

    const body = await request.json();
    const { items } = body; // Array of cart items to add

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Invalid items array' },
        { status: 400 }
      );
    }

    const db = getAdminDb();
    const batch = db.batch();

    // Process each item
    for (const item of items) {
      const { productId, quantity, price, name, image, sku } = item;

      if (!productId || !quantity || !price || !name) {
        continue; // Skip invalid items
      }

      // Check if item already exists in cart
      const existingCartQuery = await db.collection('cart')
        .where('userId', '==', userId)
        .where('productId', '==', productId)
        .limit(1)
        .get();

      if (!existingCartQuery.empty) {
        // Update existing item
        const existingDoc = existingCartQuery.docs[0];
        const existingData = existingDoc.data();
        const newQuantity = existingData.quantity + quantity;

        batch.update(existingDoc.ref, {
          quantity: newQuantity,
          updatedAt: new Date(),
        });
      } else {
        // Add new item
        const cartRef = db.collection('cart').doc();
        batch.set(cartRef, {
          userId,
          productId,
          quantity,
          price,
          name,
          image,
          sku,
          addedAt: new Date(),
          updatedAt: new Date(),
        });
      }
    }

    await batch.commit();

    return NextResponse.json({
      success: true,
      message: `Added ${items.length} items to cart`,
    });

  } catch (error) {
    console.error('Error adding bulk items to cart:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to add items to cart',
      },
      { status: 500 }
    );
  }
}
