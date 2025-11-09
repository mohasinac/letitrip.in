import { NextRequest, NextResponse } from 'next/server';
import { Collections } from '@/app/api/lib/firebase/collections';
import { getCurrentUser } from '../../lib/session';

// PATCH /api/cart/[itemId] - Update cart item quantity
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ itemId: string }> }
) {
  try {
    const { itemId } = await params;
    const user = await getCurrentUser(request);
    
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { quantity } = body;

    if (quantity === undefined || quantity < 0) {
      return NextResponse.json({ success: false, error: 'Invalid quantity' }, { status: 400 });
    }

    // Get cart item
    const itemDoc = await Collections.cart().doc(itemId).get();
    
    if (!itemDoc.exists) {
      return NextResponse.json({ success: false, error: 'Cart item not found' }, { status: 404 });
    }

    const itemData = itemDoc.data();

    // Verify ownership
    if (itemData.user_id !== user.id) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    // Check stock
    const productDoc = await Collections.products().doc(itemData.product_id).get();
    const product = productDoc.data();

    if (!product) {
      return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 });
    }

    if (product.stock_count < quantity) {
      return NextResponse.json({ 
        success: false, 
        error: `Only ${product.stock_count} items available` 
      }, { status: 400 });
    }

    // Update quantity
    const now = new Date().toISOString();
    await itemDoc.ref.update({
      quantity,
      updated_at: now,
    });

    return NextResponse.json({ 
      success: true, 
      data: { id: itemId, quantity },
      message: 'Cart item updated'
    });
  } catch (error) {
    console.error('Error updating cart item:', error);
    return NextResponse.json({ success: false, error: 'Failed to update cart item' }, { status: 500 });
  }
}

// DELETE /api/cart/[itemId] - Remove cart item
export async function DELETE(
  request: NextRequest,
  { params }: { params: { itemId: string } }
) {
  try {
    const user = await getCurrentUser(request);
    
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Get cart item
    const itemDoc = await Collections.cart().doc(params.itemId).get();
    
    if (!itemDoc.exists) {
      return NextResponse.json({ success: false, error: 'Cart item not found' }, { status: 404 });
    }

    const itemData = itemDoc.data();

    // Verify ownership
    if (itemData.user_id !== user.id) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    // Delete item
    await itemDoc.ref.delete();

    return NextResponse.json({ success: true, message: 'Item removed from cart' });
  } catch (error) {
    console.error('Error removing cart item:', error);
    return NextResponse.json({ success: false, error: 'Failed to remove cart item' }, { status: 500 });
  }
}
