import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase/admin';
import { getAuth } from 'firebase-admin/auth';

export async function GET(request: NextRequest) {
  try {
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

    // Get user info to create default store name
    const userDoc = await db.collection('users').doc(sellerId).get();
    const userData = userDoc.exists ? userDoc.data() : null;
    const defaultStoreName = userData?.name ? `${userData.name}'s Store` : 'My Store';

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
      });
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

    // Parse request body
    const { storeName, storeStatus, storeDescription, businessName } = await request.json();

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

    await db.collection('sellers').doc(sellerId).set(updateData, { merge: true });

    return NextResponse.json({ 
      message: 'Store settings updated successfully',
      ...updateData 
    });

  } catch (error) {
    console.error('Error updating store settings:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
