/**
 * Seller Orders API
 *
 * View and manage orders for seller's products.
 *
 * @route GET /api/seller/orders - List seller's orders (requires seller/admin)
 */

import { db } from "@/lib/firebase";
import { requireRole } from "@/lib/session";
import {
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  startAfter,
  where,
} from "firebase/firestore";
import { NextRequest, NextResponse } from "next/server";

/**
 * GET - List seller's orders
 */
export async function GET(request: NextRequest) {
  try {
    const session = await requireRole(["seller", "admin"]);
    const userId = session.userId;

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const pageLimit = Math.min(
      parseInt(searchParams.get("limit") || "20"),
      100,
    );
    const cursor = searchParams.get("cursor");

    // Build query - find orders containing seller's products
    const constraints: any[] = [];

    if (status) {
      constraints.push(where("status", "==", status));
    }

    constraints.push(orderBy("createdAt", "desc"));
    constraints.push(limit(pageLimit));

    if (cursor) {
      const cursorDoc = await getDocs(
        query(collection(db, "orders"), where("__name__", "==", cursor)),
      );
      if (!cursorDoc.empty) {
        constraints.push(startAfter(cursorDoc.docs[0]));
      }
    }

    const ordersQuery = query(collection(db, "orders"), ...constraints);
    const querySnapshot = await getDocs(ordersQuery);

    // Filter orders that contain seller's products
    const orders = querySnapshot.docs
      .map((doc) => {
        const orderData = doc.data();
        // Filter items to only show seller's items
        const sellerItems = orderData.items?.filter(
          (item: any) => item.sellerId === userId,
        );

        if (sellerItems && sellerItems.length > 0) {
          return {
            id: doc.id,
            ...orderData,
            items: sellerItems, // Only show seller's items
          };
        }
        return null;
      })
      .filter((order) => order !== null);

    const lastDoc = querySnapshot.docs[querySnapshot.docs.length - 1];
    const nextCursor = lastDoc ? lastDoc.id : null;

    return NextResponse.json(
      {
        success: true,
        data: {
          orders,
          nextCursor,
          hasMore: querySnapshot.docs.length === pageLimit,
        },
      },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("Error fetching seller orders:", error);

    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (error.message === "Forbidden") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json(
      {
        error: "Failed to fetch orders",
        details: error.message,
      },
      { status: 500 },
    );
  }
}
