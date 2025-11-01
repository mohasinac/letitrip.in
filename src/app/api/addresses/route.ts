import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/database/admin";
import { verifyFirebaseToken } from "@/lib/auth/firebase-api-auth";

const ADDRESSES_COLLECTION = "addresses";

/**
 * GET /api/addresses - Get all user addresses
 */
export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const user = await verifyFirebaseToken(request);
    
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const db = getAdminDb();
    const addressesRef = db.collection(ADDRESSES_COLLECTION);
    const snapshot = await addressesRef
      .where("userId", "==", user.uid)
      .get();

    const addresses = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate().toISOString() || new Date().toISOString(),
      updatedAt: doc.data().updatedAt?.toDate().toISOString() || new Date().toISOString(),
    }));

    return NextResponse.json({ addresses });
  } catch (error) {
    console.error("Error fetching addresses:", error);
    return NextResponse.json(
      { error: "Failed to fetch addresses" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/addresses - Create a new address
 */
export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const user = await verifyFirebaseToken(request);
    
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      fullName,
      phone,
      addressLine1,
      addressLine2,
      city,
      state,
      pincode,
      country,
      type,
      isDefault
    } = body;

    // Validation
    if (!fullName || !phone || !addressLine1 || !city || !state || !pincode || !country) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const db = getAdminDb();
    const batch = db.batch();

    // If this is the default address, unset other defaults
    if (isDefault) {
      const addressesRef = db.collection(ADDRESSES_COLLECTION);
      const snapshot = await addressesRef
        .where("userId", "==", user.uid)
        .where("isDefault", "==", true)
        .get();

      snapshot.docs.forEach(doc => {
        batch.update(doc.ref, { isDefault: false });
      });
    }

    // Add the new address
    const newAddressRef = db.collection(ADDRESSES_COLLECTION).doc();
    batch.set(newAddressRef, {
      userId: user.uid,
      fullName,
      phone,
      addressLine1,
      addressLine2: addressLine2 || "",
      city,
      state,
      pincode,
      country,
      type: type || "home",
      isDefault: isDefault || false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await batch.commit();

    return NextResponse.json({
      success: true,
      addressId: newAddressRef.id,
    });
  } catch (error) {
    console.error("Error creating address:", error);
    return NextResponse.json(
      { error: "Failed to create address" },
      { status: 500 }
    );
  }
}
