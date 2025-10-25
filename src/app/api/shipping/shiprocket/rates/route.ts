/**
 * Shiprocket Rate Calculator API Route
 */

import { NextRequest, NextResponse } from 'next/server';
import { shiprocketService } from '@/lib/services/shiprocket';
import { getAdminAuth } from '@/lib/database/admin';
import { HTTP_STATUS, ERROR_MESSAGES } from '@/lib/config/api';

// POST: Calculate shipping rates
export async function POST(request: NextRequest) {
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

    const { 
      pickup_postcode, 
      delivery_postcode, 
      weight, 
      cod, 
      declared_value 
    } = await request.json();

    // Validate required fields
    if (!pickup_postcode || !delivery_postcode || !weight) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: HTTP_STATUS.BAD_REQUEST }
      );
    }

    // Validate pincode format
    const pincodeRegex = /^\d{6}$/;
    if (!pincodeRegex.test(pickup_postcode) || !pincodeRegex.test(delivery_postcode)) {
      return NextResponse.json(
        { success: false, error: 'Invalid pincode format' },
        { status: HTTP_STATUS.BAD_REQUEST }
      );
    }

    const rates = await shiprocketService.calculateRates({
      pickup_postcode,
      delivery_postcode,
      weight: parseFloat(weight),
      cod: cod ? 1 : 0,
      declared_value: declared_value || 1000,
    });

    return NextResponse.json({
      success: true,
      data: rates,
    });
  } catch (error: any) {
    console.error('Calculate shipping rates error:', error);
    return NextResponse.json(
      { success: false, error: error.message || ERROR_MESSAGES.SHIPPING_UNAVAILABLE },
      { status: HTTP_STATUS.BAD_REQUEST }
    );
  }
}
