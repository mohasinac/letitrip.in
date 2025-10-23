/**
 * Shiprocket Tracking API Route
 */

import { NextRequest, NextResponse } from 'next/server';
import { shiprocketService } from '@/lib/services/shiprocket';
import { getAdminAuth } from '@/lib/firebase/admin';
import { HTTP_STATUS, ERROR_MESSAGES } from '@/lib/config/api';

// GET: Track shipment by AWB code
export async function GET(
  request: NextRequest,
  { params }: { params: { awb: string } }
) {
  try {
    // Verify user authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: ERROR_MESSAGES.UNAUTHORIZED },
        { status: HTTP_STATUS.UNAUTHORIZED }
      );
    }

    const token = authHeader.split(' ')[1];
    const auth = getAdminAuth();
    await auth.verifyIdToken(token);

    const awbCode = params.awb;
    if (!awbCode) {
      return NextResponse.json(
        { success: false, error: 'AWB code is required' },
        { status: HTTP_STATUS.BAD_REQUEST }
      );
    }

    const trackingInfo = await shiprocketService.trackShipment(awbCode);

    return NextResponse.json({
      success: true,
      data: trackingInfo,
    });
  } catch (error: any) {
    console.error('Track shipment error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to track shipment' },
      { status: HTTP_STATUS.BAD_REQUEST }
    );
  }
}
