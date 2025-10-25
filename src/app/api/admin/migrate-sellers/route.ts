import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase/admin';
import { createAdminHandler } from "@/lib/auth/api-middleware";

export const POST = createAdminHandler(async (request: NextRequest, user) => {
  try {

    const db = getAdminDb();
    let migratedCount = 0;
    let errorCount = 0;
    const errors: string[] = [];

    // Get all users with role 'seller' or 'admin'
    const usersSnapshot = await db.collection('users')
      .where('role', 'in', ['seller', 'admin'])
      .get();

    console.log(`Found ${usersSnapshot.size} seller/admin users to check for store migration`);

    for (const userDoc of usersSnapshot.docs) {
      try {
        const userId = userDoc.id;
        const userData = userDoc.data();
        
        // Check if seller document already exists
        const sellerDoc = await db.collection('sellers').doc(userId).get();
        
        if (!sellerDoc.exists) {
          // Create default store for this user
          const defaultStoreName = userData.name ? `${userData.name}'s Store` : 'My Store';
          const storeData = {
            userId: userId,
            storeName: defaultStoreName,
            storeStatus: 'offline', // Default to offline for security
            storeDescription: '',
            businessName: '',
            isActive: false,
            isVerified: false,
            awayMode: false,
            createdAt: new Date(),
            updatedAt: new Date()
          };

          await db.collection('sellers').doc(userId).set(storeData);
          migratedCount++;
          console.log(`Created store for user ${userId}: ${defaultStoreName}`);
        }
      } catch (error) {
        errorCount++;
        const errorMsg = `Failed to migrate user ${userDoc.id}: ${error instanceof Error ? error.message : 'Unknown error'}`;
        errors.push(errorMsg);
        console.error(errorMsg);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Migration completed. ${migratedCount} stores created, ${errorCount} errors.`,
      migratedCount,
      errorCount,
      errors: errors.length > 0 ? errors : undefined
    });

  } catch (error) {
    console.error('Migration error:', error);
    return NextResponse.json(
      { 
        error: 'Migration failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
});
