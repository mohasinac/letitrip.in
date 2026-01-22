/**
 * Seller Shop Management API
 *
 * Get and update seller's shop profile.
 *
 * @route GET /api/seller/shop - Get shop details (requires seller/admin)
 * @route PUT /api/seller/shop - Update shop details (requires seller/admin)
 */

import { db } from "@/lib/firebase";
import { requireRole } from "@/lib/session";
import {
  collection,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { NextRequest, NextResponse } from "next/server";

/**
 * GET - Get seller's shop details
 */
export async function GET(request: NextRequest) {
  try {
    const session = await requireRole(["seller", "admin"]);
    const userId = session.userId;

    // Query shop by seller ID
    const shopQuery = query(
      collection(db, "shops"),
      where("sellerId", "==", userId),
    );

    const querySnapshot = await getDocs(shopQuery);

    if (querySnapshot.empty) {
      return NextResponse.json({ error: "Shop not found" }, { status: 404 });
    }

    const shopDoc = querySnapshot.docs[0];
    const shopData = {
      id: shopDoc.id,
      ...shopDoc.data(),
    };

    return NextResponse.json(
      {
        success: true,
        data: shopData,
      },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("Error fetching shop:", error);

    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (error.message === "Forbidden") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json(
      {
        error: "Failed to fetch shop",
        details: error.message,
      },
      { status: 500 },
    );
  }
}

/**
 * PUT - Update seller's shop details
 */
export async function PUT(request: NextRequest) {
  try {
    const session = await requireRole(["seller", "admin"]);
    const userId = session.userId;

    const body = await request.json();

    // Query shop by seller ID
    const shopQuery = query(
      collection(db, "shops"),
      where("sellerId", "==", userId),
    );

    const querySnapshot = await getDocs(shopQuery);

    if (querySnapshot.empty) {
      return NextResponse.json({ error: "Shop not found" }, { status: 404 });
    }

    const shopDoc = querySnapshot.docs[0];

    // Update allowed fields
    const updateData: any = {
      updatedAt: serverTimestamp(),
    };

    if (body.name) updateData.name = body.name;
    if (body.description) updateData.description = body.description;
    if (body.logo) updateData.logo = body.logo;
    if (body.banner) updateData.banner = body.banner;
    if (body.phone) updateData.phone = body.phone;
    if (body.email) updateData.email = body.email;
    if (body.address) updateData.address = body.address;
    if (body.socialLinks) updateData.socialLinks = body.socialLinks;
    if (body.businessHours) updateData.businessHours = body.businessHours;
    if (body.policies) updateData.policies = body.policies;

    await updateDoc(shopDoc.ref, updateData);

    return NextResponse.json(
      {
        success: true,
        message: "Shop updated successfully",
      },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("Error updating shop:", error);

    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (error.message === "Forbidden") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json(
      {
        error: "Failed to update shop",
        details: error.message,
      },
      { status: 500 },
    );
  }
}
