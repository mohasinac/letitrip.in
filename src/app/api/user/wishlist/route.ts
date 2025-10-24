import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase/admin';

export async function GET(request: NextRequest) {
  try {
    const db = getAdminDb();
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Get user's wishlist items
    const wishlistSnapshot = await db.collection('wishlist')
      .where('userId', '==', userId)
      .orderBy('addedAt', 'desc')
      .get();

    const wishlistItems: any[] = [];

    for (const doc of wishlistSnapshot.docs) {
      const wishlistData = doc.data();
      
      // Get product details
      let product = null;
      if (wishlistData.productId) {
        try {
          const productDoc = await db.collection('products').doc(wishlistData.productId).get();
          if (productDoc.exists) {
            const productData = productDoc.data();
            if (productData) {
              product = {
                id: productDoc.id,
                ...productData,
                createdAt: productData.createdAt?.toDate?.()?.toISOString(),
                updatedAt: productData.updatedAt?.toDate?.()?.toISOString(),
              } as any;
            }
          }
        } catch (error) {
          console.error('Error fetching product details:', error);
        }
      }

      if (product) {
        wishlistItems.push({
          id: doc.id,
          name: product.name,
          price: product.price,
          compareAtPrice: product.compareAtPrice,
          image: product.images?.[0]?.url || '/images/placeholder.jpg',
          category: product.category,
          inStock: product.quantity > 0,
          addedAt: wishlistData.addedAt?.toDate?.()?.toISOString() || wishlistData.addedAt,
          slug: product.slug,
          productId: product.id,
        });
      }
    }

    return NextResponse.json(wishlistItems);
  } catch (error) {
    console.error('Error fetching wishlist:', error);
    return NextResponse.json(
      { error: 'Failed to fetch wishlist' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const db = getAdminDb();
    const body = await request.json();
    const { userId, productId } = body;

    if (!userId || !productId) {
      return NextResponse.json(
        { error: 'User ID and Product ID are required' },
        { status: 400 }
      );
    }

    // Check if item already exists in wishlist
    const existingItem = await db.collection('wishlist')
      .where('userId', '==', userId)
      .where('productId', '==', productId)
      .get();

    if (!existingItem.empty) {
      return NextResponse.json(
        { error: 'Item already in wishlist' },
        { status: 400 }
      );
    }

    // Add to wishlist
    const wishlistItem = {
      userId,
      productId,
      addedAt: new Date(),
    };

    const docRef = await db.collection('wishlist').add(wishlistItem);
    
    return NextResponse.json({
      id: docRef.id,
      ...wishlistItem,
      message: 'Item added to wishlist'
    });
  } catch (error) {
    console.error('Error adding to wishlist:', error);
    return NextResponse.json(
      { error: 'Failed to add to wishlist' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const db = getAdminDb();
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const productId = searchParams.get('productId');

    if (!userId || !productId) {
      return NextResponse.json(
        { error: 'User ID and Product ID are required' },
        { status: 400 }
      );
    }

    // Find and remove from wishlist
    const wishlistQuery = await db.collection('wishlist')
      .where('userId', '==', userId)
      .where('productId', '==', productId)
      .get();

    if (wishlistQuery.empty) {
      return NextResponse.json(
        { error: 'Item not found in wishlist' },
        { status: 404 }
      );
    }

    // Delete the item
    await wishlistQuery.docs[0].ref.delete();
    
    return NextResponse.json({
      message: 'Item removed from wishlist'
    });
  } catch (error) {
    console.error('Error removing from wishlist:', error);
    return NextResponse.json(
      { error: 'Failed to remove from wishlist' },
      { status: 500 }
    );
  }
}
