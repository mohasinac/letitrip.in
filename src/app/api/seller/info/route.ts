import { NextRequest, NextResponse } from 'next/server';
import { SellerInfoService } from '@/lib/services/seller-info.service';
import { createSellerHandler } from '@/lib/auth/api-middleware';

export const GET = createSellerHandler(async (request: NextRequest, user) => {
  try {
    const sellerId = user.userId;

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
});
