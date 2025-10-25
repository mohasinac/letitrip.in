import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
import { SellerInfoService } from '@/lib/services/seller-info.service';

export async function GET(request: NextRequest) {
  try {
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

    // Get seller information
    const sellerInfo = await SellerInfoService.getSellerInfo(sellerId);
    
    if (!sellerInfo) {
      return NextResponse.json(
        { error: 'Seller not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(sellerInfo);

  } catch (error) {
    console.error('Error fetching seller info:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
