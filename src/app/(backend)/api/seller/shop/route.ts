import { NextRequest, NextResponse } from 'next/server';
import { verifySellerSession } from '../../_lib/auth/admin-auth';
import { Timestamp } from 'firebase-admin/firestore';
import { AuthorizationError } from '../../_lib/middleware/error-handler';



/**
 * GET /api/seller/shop
 * Get seller's shop information including addresses
 */
export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const session = await verifySellerSession(request);
    const db = getAdminDb();

    // Get shop data
    const shopDoc = await db.collection('sellers').doc(seller.uid).get();

    if (!shopDoc.exists) {
      return NextResponse.json({
        success: true,
        data: {
          shopName: '',
          addresses: [],
          exists: false,
        },
        message: 'Shop not found - please set up your shop first',
      });
    }

    const shopData = shopDoc.data();

    // Extract and format addresses
    const addresses = shopData?.addresses || [];
    const formattedAddresses = addresses.map((addr: any) => ({
      id: addr.id,
      label: addr.label || 'Default Address',
      name: addr.name || '',
      phone: addr.phone || '',
      address: addr.address || '',
      city: addr.city || '',
      state: addr.state || '',
      pincode: addr.pincode || '',
      country: addr.country || 'India',
      isDefault: addr.isDefault || false,
      addressType: addr.addressType || 'pickup',
    }));

    return NextResponse.json({
      success: true,
      data: {
        shopName: shopData?.shopName || '',
        addresses: formattedAddresses,
        exists: true,
      },
    });
  } catch (error: any) {
    if (error instanceof AuthorizationError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: error.statusCode }
      );
    }

    console.error('Error fetching shop data:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch shop data' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/seller/shop
 * Create or update seller's shop information
 */
export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const session = await verifySellerSession(request);
    const db = getAdminDb();

    // Parse body
    const body = await request.json();

    // Get existing shop data
    const shopDoc = await db.collection('sellers').doc(seller.uid).get();
    const existingData = shopDoc.exists ? shopDoc.data() : {};

    // Prepare update data
    const updateData: any = {
      ...existingData,
      updatedAt: Timestamp.now(),
    };

    // Update only provided fields
    if (body.shopName !== undefined) updateData.shopName = body.shopName;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.logo !== undefined) updateData.logo = body.logo;
    if (body.coverImage !== undefined) updateData.coverImage = body.coverImage;
    if (body.addresses !== undefined) updateData.addresses = body.addresses;
    if (body.businessDetails !== undefined) updateData.businessDetails = body.businessDetails;
    if (body.seo !== undefined) updateData.seo = body.seo;
    if (body.settings !== undefined) updateData.settings = body.settings;

    // Add createdAt if new shop
    if (!shopDoc.exists) {
      updateData.createdAt = Timestamp.now();
      updateData.sellerId = seller.uid;
      updateData.status = 'active';
    }

    // Save to Firestore
    await db
      .collection('sellers')
      .doc(seller.uid)
      .set(updateData, { merge: true });

    return NextResponse.json({
      success: true,
      data: updateData,
      message: shopDoc.exists
        ? 'Shop updated successfully'
        : 'Shop created successfully',
    });
  } catch (error: any) {
    if (error instanceof AuthorizationError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: error.statusCode }
      );
    }

    console.error('Error saving shop data:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to save shop data' },
      { status: 500 }
    );
  }
}
