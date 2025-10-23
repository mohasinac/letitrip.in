/**
 * Shiprocket Serviceability Check API Route
 */

import { NextRequest, NextResponse } from 'next/server';
import { shiprocketService } from '@/lib/services/shiprocket';
import { HTTP_STATUS, ERROR_MESSAGES } from '@/lib/config/api';

// POST: Check serviceability for pincodes
export async function POST(request: NextRequest) {
  try {
    const { pickup_postcode, delivery_postcode, weight, cod } = await request.json();

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

    const serviceabilityResult = await shiprocketService.checkServiceability({
      pickup_postcode,
      delivery_postcode,
      weight: parseFloat(weight),
      cod: cod ? 1 : 0,
    });

    return NextResponse.json({
      success: true,
      data: serviceabilityResult,
    });
  } catch (error: any) {
    console.error('Check serviceability error:', error);
    return NextResponse.json(
      { success: false, error: error.message || ERROR_MESSAGES.SHIPPING_UNAVAILABLE },
      { status: HTTP_STATUS.BAD_REQUEST }
    );
  }
}

// GET: Check serviceability with query parameters (for simple checks)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const pickup_postcode = searchParams.get('pickup_postcode');
    const delivery_postcode = searchParams.get('delivery_postcode');
    const weight = searchParams.get('weight');
    const cod = searchParams.get('cod') === 'true';

    if (!pickup_postcode || !delivery_postcode || !weight) {
      return NextResponse.json(
        { success: false, error: 'Missing required parameters' },
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

    const serviceabilityResult = await shiprocketService.checkServiceability({
      pickup_postcode,
      delivery_postcode,
      weight: parseFloat(weight),
      cod: cod ? 1 : 0,
    });

    return NextResponse.json({
      success: true,
      data: serviceabilityResult,
    });
  } catch (error: any) {
    console.error('Check serviceability error:', error);
    return NextResponse.json(
      { success: false, error: error.message || ERROR_MESSAGES.SHIPPING_UNAVAILABLE },
      { status: HTTP_STATUS.BAD_REQUEST }
    );
  }
}
