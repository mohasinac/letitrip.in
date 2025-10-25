import { NextRequest, NextResponse } from "next/server";
import { createUserHandler } from "@/lib/auth/api-middleware";
import { authenticateUser } from "@/lib/auth/middleware";

export const GET = createUserHandler(async (request: NextRequest, user) => {
  try {
    // Check authentication
    const user = await authenticateUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = user.userId;

    // Get database
    const { getAdminDb } = await import('@/lib/firebase/admin');
    const db = getAdminDb();

    // Fetch user statistics from Firestore
    const ordersSnapshot = await db.collection('orders')
      .where('userId', '==', userId)
      .get();

    const orders = ordersSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // Calculate stats
    const totalOrders = orders.length;
    const totalSpent = orders.reduce((sum, order: any) => sum + (order.total || 0), 0);
    const activeOrders = orders.filter((order: any) => 
      ['pending', 'processing', 'shipped'].includes(order.status)
    ).length;

    // Fetch wishlist count
    const wishlistSnapshot = await db.collection('wishlists')
      .where('userId', '==', userId)
      .get();

    const wishlistItems = wishlistSnapshot.size > 0 
      ? wishlistSnapshot.docs[0].data().items?.length || 0 
      : 0;

    return NextResponse.json({
      success: true,
      stats: {
        totalOrders,
        totalSpent: parseFloat(totalSpent.toFixed(2)),
        activeOrders,
        wishlistItems,
      }
    });
  } catch (error) {
    console.error("Error fetching user dashboard stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard statistics" },
      { status: 500 }
    );
  }
});
