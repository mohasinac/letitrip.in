import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/jwt";
import { getAdminDb } from "@/lib/firebase/admin";

interface UserStats {
  ordersCount: number;
  totalSpent: number;
}

async function getUserStats(userId: string): Promise<UserStats> {
  try {
    const db = getAdminDb();
    // Get orders count and total spent from orders collection
    const ordersSnapshot = await db
      .collection('orders')
      .where('userId', '==', userId)
      .get();

    let totalSpent = 0;
    ordersSnapshot.docs.forEach((doc: any) => {
      const order = doc.data();
      if (order.status === 'delivered' || order.status === 'completed') {
        totalSpent += order.total || 0;
      }
    });

    return {
      ordersCount: ordersSnapshot.size,
      totalSpent,
    };
  } catch (error) {
    console.error('Error getting user stats:', error);
    return { ordersCount: 0, totalSpent: 0 };
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = getAdminDb();
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const role = searchParams.get('role');
    const search = searchParams.get('search');

    let query: any = db.collection('users');

    // Apply role filter
    if (role && role !== 'all') {
      query = query.where('role', '==', role);
    }

    const snapshot = await query.orderBy('createdAt', 'desc').get();
    
    const allUsers = await Promise.all(
      snapshot.docs.map(async (doc: any) => {
        const userData = doc.data();
        
        // Apply search filter
        if (search) {
          const searchLower = search.toLowerCase();
          if (!userData.name?.toLowerCase().includes(searchLower) &&
              !userData.email?.toLowerCase().includes(searchLower)) {
            return null;
          }
        }

        const stats = await getUserStats(doc.id);
        
        // Get store information for sellers and admins
        let storeInfo = {};
        if (userData.role === 'seller' || userData.role === 'admin') {
          try {
            // Get seller information
            const storeDoc = await db.collection('sellers').doc(doc.id).get();
            if (storeDoc.exists) {
              const storeData = storeDoc.data();
              storeInfo = {
                storeName: storeData?.storeName,
                storeStatus: storeData?.storeStatus || "offline",
                isFeatured: storeData?.isFeatured || false,
                businessName: storeData?.businessName,
                storeDescription: storeData?.description,
                storeAddress: storeData?.address,
                storePhone: storeData?.phone,
                storeWebsite: storeData?.website,
                storeRegistrationDate: storeData?.createdAt?.toDate?.()?.toISOString(),
              };
            }

            // Get additional store stats from stores collection
            const storeSnapshot = await db.collection('stores').where('ownerId', '==', doc.id).limit(1).get();
            if (!storeSnapshot.empty) {
              const storeDoc = storeSnapshot.docs[0];
              const storeData = storeDoc.data();
              
              // Get products count
              const productsSnapshot = await db.collection('products').where('sellerId', '==', doc.id).get();
              
              // Get reviews for this store
              const reviewsSnapshot = await db.collection('reviews').where('storeId', '==', storeDoc.id).get();
              let totalRating = 0;
              reviewsSnapshot.docs.forEach(review => {
                const reviewData = review.data();
                totalRating += reviewData.rating || 0;
              });
              
              storeInfo = {
                ...storeInfo,
                totalProducts: productsSnapshot.size,
                totalRevenue: storeData.totalRevenue || 0,
                averageRating: reviewsSnapshot.size > 0 ? totalRating / reviewsSnapshot.size : 0,
                reviewCount: reviewsSnapshot.size,
              };
            }
          } catch (error) {
            console.error(`Error fetching store info for user ${doc.id}:`, error);
          }
        }
        
        return {
          id: doc.id,
          name: userData.name || userData.displayName || 'Unknown',
          email: userData.email || '',
          role: userData.role || 'user',
          verified: userData.verified || userData.emailVerified || false,
          createdAt: userData.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
          updatedAt: userData.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
          lastLoginAt: userData.lastLoginAt?.toDate?.()?.toISOString(),
          ...stats,
          ...storeInfo,
        };
      })
    );

    // Filter out null results from search
    const filteredUsers = allUsers.filter(user => user !== null);

    // Apply pagination
    const offset = (page - 1) * limit;
    const paginatedUsers = filteredUsers.slice(offset, offset + limit);

    return NextResponse.json({
      success: true,
      users: paginatedUsers,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(filteredUsers.length / limit),
        totalUsers: filteredUsers.length,
        hasMore: offset + limit < filteredUsers.length
      }
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}
