/**
 * User Addresses API Routes
 *
 * Handles user shipping/billing addresses. Uses session for authentication.
 *
 * @route GET /api/user/addresses - List current user's addresses (requires auth)
 * @route POST /api/user/addresses - Add new address (requires auth)
 *
 * @example
 * ```tsx
 * // List addresses (uses session automatically)
 * const response = await fetch('/api/user/addresses');
 *
 * // Add address
 * const response = await fetch('/api/user/addresses', {
 *   method: 'POST',
 *   body: JSON.stringify({
 *     type: 'shipping',
 *     fullName: 'John Doe',
 *     phone: '+91 1234567890',
 *     addressLine1: '123 Street',
 *     city: 'Mumbai',
 *     state: 'Maharashtra',
 *     zipCode: '400001',
 *     country: 'India'
 *   })
 * });
 * ```
 */

import { db } from "@/lib/firebase";
import { requireAuth } from "@/lib/session";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { NextRequest, NextResponse } from "next/server";

interface Address {
  userId: string;
  type: "shipping" | "billing" | "both";
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  isDefault?: boolean;
  label?: string; // e.g., "Home", "Office"
}

/**
 * GET /api/user/addresses
 *
 * List all addresses for current user (requires authentication).
 *
 * Query Parameters:
 * - type: Filter by address type (shipping/billing/both) [optional]
 */
export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth();
    const userId = session.userId;

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");

    // Build query
    const constraints: any[] = [
      where("userId", "==", userId),
      orderBy("isDefault", "desc"),
      orderBy("createdAt", "desc"),
    ];

    if (type) {
      constraints.unshift(where("type", "in", [type, "both"]));
    }

    const addressesQuery = query(collection(db, "addresses"), ...constraints);

    const querySnapshot = await getDocs(addressesQuery);

    const addresses = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json(
      {
        success: true,
        data: {
          addresses,
          count: addresses.length,
        },
      },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("Error fetching addresses:", error);

    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json(
      { error: "Failed to fetch addresses", details: error.message },
      { status: 500 },
    );
  }
}

/**
 * POST /api/user/addresses
 *
 * Add a new address for current user (requires authentication).
 */
export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth();
    const userId = session.userId;

    const body = await request.json();
    const {
      type,
      fullName,
      phone,
      addressLine1,
      addressLine2,
      city,
      state,
      zipCode,
      country,
      isDefault = false,
      label,
    } = body;

    // Validate required fields
    if (
      !type ||
      !fullName ||
      !phone ||
      !addressLine1 ||
      !city ||
      !state ||
      !zipCode ||
      !country
    ) {
      return NextResponse.json(
        { error: "Missing required address fields" },
        { status: 400 },
      );
    }

    // If this is set as default, unset other default addresses
    if (isDefault) {
      const existingDefaultQuery = query(
        collection(db, "addresses"),
        where("userId", "==", userId),
        where("isDefault", "==", true),
      );
      const existingDefaults = await getDocs(existingDefaultQuery);

      const updatePromises = existingDefaults.docs.map((doc) =>
        updateDoc(doc.ref, { isDefault: false }),
      );
      await Promise.all(updatePromises);
    }

    // Create address document
    const addressData = {
      userId,
      type,
      fullName,
      phone,
      addressLine1,
      addressLine2: addressLine2 || "",
      city,
      state,
      zipCode,
      country,
      isDefault,
      label: label || "",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const docRef = await addDoc(collection(db, "addresses"), addressData);

    return NextResponse.json(
      {
        success: true,
        data: {
          id: docRef.id,
          ...addressData,
        },
        message: "Address added successfully",
      },
      { status: 201 },
    );
  } catch (error: any) {
    console.error("Error adding address:", error);

    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (error.code === "permission-denied") {
      return NextResponse.json(
        { error: "Insufficient permissions to add address" },
        { status: 403 },
      );
    }

    return NextResponse.json(
      { error: "Failed to add address", details: error.message },
      { status: 500 },
    );
  }
}

/**
 * PUT /api/user/addresses
 *
 * Update an existing address.
 *
 * Query Parameters:
 * - id: Address ID (required)
 * - userId: User ID (required, for verification)
 *
 * Request Body: (all fields optional)
 * - type, fullName, phone, addressLine1, addressLine2
 * - city, state, zipCode, country, isDefault, label
 */
export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const addressId = searchParams.get("id");
    const userId = searchParams.get("userId");
    const body = await request.json();

    if (!addressId || !userId) {
      return NextResponse.json(
        { error: "id and userId are required" },
        { status: 400 },
      );
    }

    // Verify address belongs to user
    const addressDoc = await getDocs(
      query(
        collection(db, "addresses"),
        where("__name__", "==", addressId),
        where("userId", "==", userId),
      ),
    );

    if (addressDoc.empty) {
      return NextResponse.json(
        { error: "Address not found or access denied" },
        { status: 404 },
      );
    }

    // If setting as default, unset other defaults
    if (body.isDefault === true) {
      const existingDefaultQuery = query(
        collection(db, "addresses"),
        where("userId", "==", userId),
        where("isDefault", "==", true),
      );
      const existingDefaults = await getDocs(existingDefaultQuery);

      const updatePromises = existingDefaults.docs
        .filter((doc) => doc.id !== addressId)
        .map((doc) => updateDoc(doc.ref, { isDefault: false }));
      await Promise.all(updatePromises);
    }

    // Update address
    const updates = {
      ...body,
      updatedAt: serverTimestamp(),
    };
    delete updates.userId; // Prevent userId update

    await updateDoc(doc(db, "addresses", addressId), updates);

    // Get updated data
    const updatedDoc = await getDocs(
      query(collection(db, "addresses"), where("__name__", "==", addressId)),
    );

    const updatedData = {
      id: updatedDoc.docs[0].id,
      ...updatedDoc.docs[0].data(),
    };

    return NextResponse.json(
      {
        success: true,
        data: updatedData,
        message: "Address updated successfully",
      },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("Error updating address:", error);

    if (error.code === "permission-denied") {
      return NextResponse.json(
        { error: "Insufficient permissions to update address" },
        { status: 403 },
      );
    }

    return NextResponse.json(
      { error: "Failed to update address", details: error.message },
      { status: 500 },
    );
  }
}

/**
 * DELETE /api/user/addresses
 *
 * Delete an address.
 *
 * Query Parameters:
 * - id: Address ID (required)
 * - userId: User ID (required, for verification)
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const addressId = searchParams.get("id");
    const userId = searchParams.get("userId");

    if (!addressId || !userId) {
      return NextResponse.json(
        { error: "id and userId are required" },
        { status: 400 },
      );
    }

    // Verify address belongs to user before deleting
    const addressDoc = await getDocs(
      query(
        collection(db, "addresses"),
        where("__name__", "==", addressId),
        where("userId", "==", userId),
      ),
    );

    if (addressDoc.empty) {
      return NextResponse.json(
        { error: "Address not found or access denied" },
        { status: 404 },
      );
    }

    // Delete address
    await deleteDoc(doc(db, "addresses", addressId));

    return NextResponse.json(
      {
        success: true,
        message: "Address deleted successfully",
      },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("Error deleting address:", error);

    if (error.code === "permission-denied") {
      return NextResponse.json(
        { error: "Insufficient permissions to delete address" },
        { status: 403 },
      );
    }

    return NextResponse.json(
      { error: "Failed to delete address", details: error.message },
      { status: 500 },
    );
  }
}
