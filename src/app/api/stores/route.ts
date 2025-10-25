import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/database/admin";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const category = searchParams.get("category") || "";
    const storeStatus = searchParams.get("storeStatus") || "";
    const sort = searchParams.get("sort") || "rating";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "12");

    // Fetch sellers from Firestore database
    const db = getAdminDb();
    let query = db.collection("users").where("role", "==", "seller");

    // Apply category filter if specified
    if (category && category !== "All") {
      query = query.where("category", "==", category);
    }

    // Get all sellers matching filter
    const snapshot = await query.get();
    
    // Enhance sellers with store information
    const sellersWithStoreInfo = await Promise.all(
      snapshot.docs.map(async (doc: any) => {
        const userData = doc.data();
        
        // Get store information from sellers collection
        try {
          const storeDoc = await db.collection("sellers").doc(doc.id).get();
          const storeData = storeDoc.exists ? storeDoc.data() : {};
          
          // Get additional store stats
          let storeStats = {
            totalProducts: 0,
            totalSales: 0,
            rating: 0,
            reviewCount: 0,
          };

          try {
            // Get products count
            const productsSnapshot = await db.collection('products').where('sellerId', '==', doc.id).get();
            storeStats.totalProducts = productsSnapshot.size;

            // Get orders count (sales)
            const ordersSnapshot = await db.collection('orders').where('sellerId', '==', doc.id).get();
            storeStats.totalSales = ordersSnapshot.size;

            // Get reviews and calculate average rating
            const reviewsSnapshot = await db.collection('reviews').where('sellerId', '==', doc.id).get();
            if (!reviewsSnapshot.empty) {
              let totalRating = 0;
              reviewsSnapshot.docs.forEach(review => {
                const reviewData = review.data();
                totalRating += reviewData.rating || 0;
              });
              storeStats.rating = totalRating / reviewsSnapshot.size;
              storeStats.reviewCount = reviewsSnapshot.size;
            }
          } catch (statsError) {
            console.error(`Error fetching stats for seller ${doc.id}:`, statsError);
          }
          
          return {
            id: doc.id,
            name: userData.name || userData.displayName || 'Unknown',
            email: userData.email || '',
            verified: userData.verified || userData.emailVerified || false,
            // Store information
            storeName: storeData?.storeName,
            storeStatus: storeData?.storeStatus || 'offline',
            storeDescription: storeData?.storeDescription || storeData?.description,
            isFeatured: storeData?.isFeatured || false,
            businessName: storeData?.businessName || userData.businessName,
            // Compute display name priority: storeName > businessName > name
            displayName: storeData?.storeName || storeData?.businessName || userData.businessName || userData.name || 'Unknown Store',
            // Additional store data
            description: storeData?.storeDescription || userData.description || 'No description available',
            location: storeData?.location || userData.location || 'Unknown',
            category: userData.category || storeData?.category || 'General',
            avatar: userData.avatar || userData.photoURL,
            joinedDate: userData.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
            lastSeen: userData.lastLoginAt?.toDate?.()?.toISOString() || userData.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
            isActive: userData.isActive !== false, // default to true unless explicitly false
            // Stats
            ...storeStats,
          };
        } catch (error) {
          console.error(`Error fetching store info for seller ${doc.id}:`, error);
          return {
            id: doc.id,
            name: userData.name || 'Unknown',
            email: userData.email || '',
            verified: false,
            displayName: userData.businessName || userData.name || 'Unknown Store',
            storeStatus: 'offline',
            isFeatured: false,
            description: 'No description available',
            location: 'Unknown',
            category: 'General',
            joinedDate: new Date().toISOString(),
            lastSeen: new Date().toISOString(),
            isActive: false,
            totalProducts: 0,
            totalSales: 0,
            rating: 0,
            reviewCount: 0,
          };
        }
      })
    );

    // Filter out stores that are offline unless specifically searching for them or filtering by status
    let sellers = sellersWithStoreInfo.filter((seller: any) => {
      // If specific store status is requested, honor it
      if (storeStatus && storeStatus !== '') {
        return seller.storeStatus === storeStatus;
      }
      
      // Always show live and maintenance stores
      if (seller.storeStatus === 'live' || seller.storeStatus === 'maintenance') {
        return true;
      }
      // Only show offline stores if they are featured or if specifically searching
      return seller.isFeatured || search.length > 0;
    });

    // Apply search filter in memory (for text search across multiple fields)
    if (search) {
      const searchLower = search.toLowerCase();
      sellers = sellers.filter((seller: any) =>
        (seller.displayName || "").toLowerCase().includes(searchLower) ||
        (seller.storeName || "").toLowerCase().includes(searchLower) ||
        (seller.businessName || "").toLowerCase().includes(searchLower) ||
        (seller.storeDescription || "").toLowerCase().includes(searchLower) ||
        (seller.description || "").toLowerCase().includes(searchLower) ||
        (seller.location || "").toLowerCase().includes(searchLower) ||
        (seller.category || "").toLowerCase().includes(searchLower)
      );
    }

    // Apply sorting (featured stores first)
    switch (sort) {
      case "rating":
        sellers.sort((a: any, b: any) => {
          // Featured stores first
          if (a.isFeatured !== b.isFeatured) {
            return b.isFeatured ? 1 : -1;
          }
          return (b.rating || 0) - (a.rating || 0);
        });
        break;
      case "sales":
        sellers.sort((a: any, b: any) => {
          if (a.isFeatured !== b.isFeatured) {
            return b.isFeatured ? 1 : -1;
          }
          return (b.totalSales || 0) - (a.totalSales || 0);
        });
        break;
      case "products":
        sellers.sort((a: any, b: any) => {
          if (a.isFeatured !== b.isFeatured) {
            return b.isFeatured ? 1 : -1;
          }
          return (b.totalProducts || 0) - (a.totalProducts || 0);
        });
        break;
      case "newest":
        sellers.sort((a: any, b: any) => {
          if (a.isFeatured !== b.isFeatured) {
            return b.isFeatured ? 1 : -1;
          }
          const dateA = new Date(b.joinedDate || 0).getTime();
          const dateB = new Date(a.joinedDate || 0).getTime();
          return dateA - dateB;
        });
        break;
      case "oldest":
        sellers.sort((a: any, b: any) => {
          if (a.isFeatured !== b.isFeatured) {
            return b.isFeatured ? 1 : -1;
          }
          const dateA = new Date(a.joinedDate || 0).getTime();
          const dateB = new Date(b.joinedDate || 0).getTime();
          return dateA - dateB;
        });
        break;
      default:
        // Default: featured first, then by name
        sellers.sort((a: any, b: any) => {
          if (a.isFeatured !== b.isFeatured) {
            return b.isFeatured ? 1 : -1;
          }
          return (a.displayName || "").localeCompare(b.displayName || "");
        });
        break;
    }

    // Calculate pagination
    const total = sellers.length;
    const totalPages = Math.ceil(total / limit);
    const offset = (page - 1) * limit;
    const paginatedSellers = sellers.slice(offset, offset + limit);

    // Get available categories from database
    const categorySnapshot = await db.collection("users")
      .where("role", "==", "seller")
      .select("category")
      .get();
    const categories = [...new Set(
      categorySnapshot.docs
        .map((doc: any) => doc.data().category)
        .filter(Boolean)
    )];

    return NextResponse.json({
      sellers: paginatedSellers,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
      categories,
      filters: {
        search,
        category,
        storeStatus,
        sort,
      },
    });
  } catch (error) {
    console.error("Error fetching sellers:", error);
    return NextResponse.json(
      { error: "Failed to fetch sellers. Please try again." },
      { status: 500 }
    );
  }
}
