import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth, getAdminDb } from "@/lib/database/admin";

/**
 * GET /api/seller/shop
 * Get seller's shop information including addresses
 */
export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { success: false, error: "Unauthorized - No token provided" },
        { status: 401 }
      );
    }

    const token = authHeader.split("Bearer ")[1];
    const decodedToken = await getAdminAuth().verifyIdToken(token);
    const sellerId = decodedToken.uid;
    const role = decodedToken.role || "user";

    // Only sellers and admins can access
    if (role !== "seller" && role !== "admin") {
      return NextResponse.json(
        { success: false, error: "Forbidden - Seller access required" },
        { status: 403 }
      );
    }

    const db = getAdminDb();

    // Get shop data
    const shopDoc = await db.collection("sellers").doc(sellerId).get();

    if (!shopDoc.exists) {
      return NextResponse.json({
        success: true,
        data: {
          shopName: "",
          addresses: [],
          exists: false,
        },
        message: "Shop not found - please set up your shop first",
      });
    }

    const shopData = shopDoc.data();

    // Extract addresses
    const addresses = shopData?.addresses || [];

    // Format addresses
    const formattedAddresses = addresses.map((addr: any) => ({
      id: addr.id,
      label: addr.label || "Default Address",
      name: addr.name || "",
      phone: addr.phone || "",
      address: addr.address || "",
      city: addr.city || "",
      state: addr.state || "",
      pincode: addr.pincode || "",
      country: addr.country || "India",
      isDefault: addr.isDefault || false,
      addressType: addr.addressType || "pickup",
    }));

    return NextResponse.json({
      success: true,
      data: {
        shopName: shopData?.shopName || "",
        addresses: formattedAddresses,
        exists: true,
      },
    });
  } catch (error: any) {
    console.error("Error fetching shop data:", error);

    // Handle specific Firebase errors
    if (error.code === "auth/id-token-expired") {
      return NextResponse.json(
        { success: false, error: "Token expired - Please login again" },
        { status: 401 }
      );
    }

    if (error.code === "auth/argument-error") {
      return NextResponse.json(
        { success: false, error: "Invalid token format" },
        { status: 401 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch shop data",
        details: error.message,
      },
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
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { success: false, error: "Unauthorized - No token provided" },
        { status: 401 }
      );
    }

    const token = authHeader.split("Bearer ")[1];
    const decodedToken = await getAdminAuth().verifyIdToken(token);
    const sellerId = decodedToken.uid;
    const role = decodedToken.role || "user";

    // Only sellers and admins can create/update
    if (role !== "seller" && role !== "admin") {
      return NextResponse.json(
        { success: false, error: "Forbidden - Seller access required" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const db = getAdminDb();

    // Get existing shop data
    const shopDoc = await db.collection("sellers").doc(sellerId).get();
    const existingData = shopDoc.exists ? shopDoc.data() : {};

    // Prepare update data
    const updateData: any = {
      ...existingData,
      updatedAt: new Date().toISOString(),
    };

    // Update only provided fields
    if (body.shopName !== undefined) updateData.shopName = body.shopName;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.logo !== undefined) updateData.logo = body.logo;
    if (body.coverImage !== undefined) updateData.coverImage = body.coverImage;
    if (body.addresses !== undefined) updateData.addresses = body.addresses;
    if (body.businessDetails !== undefined)
      updateData.businessDetails = body.businessDetails;
    if (body.seo !== undefined) updateData.seo = body.seo;
    if (body.settings !== undefined) updateData.settings = body.settings;

    // Add createdAt if new shop
    if (!shopDoc.exists) {
      updateData.createdAt = new Date().toISOString();
      updateData.sellerId = sellerId;
      updateData.status = "active";
    }

    // Save to Firestore
    await db.collection("sellers").doc(sellerId).set(updateData, { merge: true });

    return NextResponse.json({
      success: true,
      data: updateData,
      message: shopDoc.exists ? "Shop updated successfully" : "Shop created successfully",
    });
  } catch (error: any) {
    console.error("Error saving shop data:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to save shop data",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
