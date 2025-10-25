import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/database/admin';
import { verifySellerOrAdmin } from '@/lib/auth/firebase-api-auth';

export async function GET(request: NextRequest) {
  try {
    const user = await verifySellerOrAdmin(request);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized - Seller or Admin access required' },
        { status: 401 }
      );
    }

    const db = getAdminDb();
    const sellerId = user.uid;

    // Get default store name from user data
    const defaultStoreName = user.userData?.name ? `${user.userData.name}'s Store` : 'My Store';

    // Get seller profile/store settings
    const sellerDoc = await db.collection('sellers').doc(sellerId).get();
    
    if (!sellerDoc.exists) {
      // Create default store if it doesn't exist
      const defaultStoreData = {
        userId: sellerId,
        storeName: defaultStoreName,
        storeStatus: 'offline', // Default to offline
        storeDescription: '',
        businessName: '',
        isActive: false,
        isVerified: false,
        awayMode: false,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await db.collection('sellers').doc(sellerId).set(defaultStoreData);

      return NextResponse.json({
        storeName: defaultStoreName,
        storeStatus: 'offline',
        storeDescription: '',
        businessName: ''
      }      );
    }

    const sellerData = sellerDoc.data();
    
    return NextResponse.json({
      storeName: sellerData?.storeName || '',
      storeStatus: sellerData?.storeStatus || 'live',
      storeDescription: sellerData?.storeDescription || '',
      businessName: sellerData?.businessName || ''
    });

  } catch (error) {
    console.error('Error fetching store settings:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await verifySellerOrAdmin(request);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized - Seller or Admin access required' },
        { status: 401 }
      );
    }

    const db = getAdminDb();
    const sellerId = user.uid;

    // Parse request body
    const { storeName, storeStatus, storeDescription, businessName } = await request.json();

    console.log('Store settings update request:', {
      sellerId,
      userRole: user.role,
      storeName,
      storeStatus
    });

    // Validate required fields
    if (!storeName || !storeName.trim()) {
      return NextResponse.json(
        { error: 'Store name is required' },
        { status: 400 }
      );
    }

    if (!['live', 'maintenance', 'offline'].includes(storeStatus)) {
      return NextResponse.json(
        { error: 'Invalid store status' },
        { status: 400 }
      );
    }

    // Check if seller document exists
    const sellerDoc = await db.collection('sellers').doc(sellerId).get();
    const isNewStore = !sellerDoc.exists;

    // Update seller document
    const updateData = {
      userId: sellerId,
      storeName: storeName.trim(),
      storeStatus,
      storeDescription: storeDescription?.trim() || '',
      businessName: businessName?.trim() || '',
      isActive: storeStatus === 'live', // Store is active when status is live
      ...(isNewStore ? {
        isVerified: false,
        awayMode: false,
        createdAt: new Date()
      } : {}),
      updatedAt: new Date()
    };

    console.log('Updating seller document:', updateData);

    await db.collection('sellers').doc(sellerId).set(updateData, { merge: true });

    console.log('Store settings updated successfully');

    return NextResponse.json({ 
      message: 'Store settings updated successfully',
      ...updateData 
    });

  } catch (error) {
    console.error('Error updating store settings:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
