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

    // Get auction and verify ownership
    const auctionDoc = await db.collection('auctions').doc(id).get();
    
    if (!auctionDoc.exists) {
      return NextResponse.json(
        { error: 'Auction not found' },
        { status: 404 }
      );
    }

    const auctionData = auctionDoc.data();
    
    // Verify the auction belongs to this seller
    if (auctionData?.sellerId !== sellerId) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    return NextResponse.json({
      id: auctionDoc.id,
      ...auctionData,
      startTime: auctionData?.startTime?.toDate?.()?.toISOString() || new Date().toISOString(),
      endTime: auctionData?.endTime?.toDate?.()?.toISOString() || new Date().toISOString(),
      createdAt: auctionData?.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
      updatedAt: auctionData?.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error fetching auction:', error);
    return NextResponse.json(
      { error: 'Failed to fetch auction' },
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

    // Get auction and verify ownership
    const auctionRef = db.collection('auctions').doc(id);
    const auctionDoc = await auctionRef.get();
    
    if (!auctionDoc.exists) {
      return NextResponse.json(
        { error: 'Auction not found' },
        { status: 404 }
      );
    }

    const auctionData = auctionDoc.data();
    
    // Verify the auction belongs to this seller
    if (auctionData?.sellerId !== sellerId) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    // Check if auction can be modified
    if (auctionData?.status === 'ended' || auctionData?.status === 'cancelled') {
      return NextResponse.json(
        { error: 'Cannot modify ended or cancelled auction' },
        { status: 400 }
      );
    }

    // Update the auction
    const updateData = {
      ...body,
      updatedAt: new Date(),
    };

    // Remove fields that shouldn't be updated
    delete updateData.id;
    delete updateData.createdAt;
    delete updateData.sellerId;
    delete updateData.currentBid; // Don't allow manual bid updates
    delete updateData.bidCount; // Don't allow manual bid count updates

    await auctionRef.update(updateData);

    // Get updated auction
    const updatedDoc = await auctionRef.get();
    const updatedData = updatedDoc.data();

    return NextResponse.json({
      id: updatedDoc.id,
      ...updatedData,
      startTime: updatedData?.startTime?.toDate?.()?.toISOString() || new Date().toISOString(),
      endTime: updatedData?.endTime?.toDate?.()?.toISOString() || new Date().toISOString(),
      createdAt: updatedData?.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
      updatedAt: updatedData?.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error updating auction:', error);
    return NextResponse.json(
      { error: 'Failed to update auction' },
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

    // Get auction and verify ownership
    const auctionRef = db.collection('auctions').doc(id);
    const auctionDoc = await auctionRef.get();
    
    if (!auctionDoc.exists) {
      return NextResponse.json(
        { error: 'Auction not found' },
        { status: 404 }
      );
    }

    const auctionData = auctionDoc.data();
    
    // Verify the auction belongs to this seller
    if (auctionData?.sellerId !== sellerId) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    // Check if auction can be deleted (only upcoming and cancelled auctions)
    if (auctionData?.status === 'active' && auctionData?.bidCount > 0) {
      return NextResponse.json(
        { error: 'Cannot delete active auction with bids. Consider ending it instead.' },
        { status: 400 }
      );
    }

    if (auctionData?.status === 'ended') {
      return NextResponse.json(
        { error: 'Cannot delete ended auction' },
        { status: 400 }
      );
    }

    // Delete related bids if any
    const bidsSnapshot = await db.collection('bids')
      .where('auctionId', '==', id)
      .get();

    const batch = db.batch();
    bidsSnapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
    });

    // Delete the auction
    batch.delete(auctionRef);
    await batch.commit();

    return NextResponse.json({
      message: 'Auction deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting auction:', error);
    return NextResponse.json(
      { error: 'Failed to delete auction' },
      { status: 500 }
    );
  }
}
