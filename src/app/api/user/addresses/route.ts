/**
 * User Addresses API Routes
 * 
 * Handles user shipping/billing addresses with create-on-fly support.
 * 
 * @route GET /api/user/addresses - List user addresses
 * @route POST /api/user/addresses - Add new address
 * @route PUT /api/user/addresses/[id] - Update address
 * @route DELETE /api/user/addresses/[id] - Delete address
 * 
 * @example
 * ```tsx
 * // List addresses
 * const response = await fetch('/api/user/addresses?userId=user-id');
 * 
 * // Add address
 * const response = await fetch('/api/user/addresses', {
 *   method: 'POST',
 *   body: JSON.stringify({
 *     userId: 'user-id',
 *     type: 'shipping',
 *     fullName: 'John Doe',
 *     ...
 *   })
 * });
 * ```
 */

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  orderBy,
} from "firebase/firestore";

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
 * List all addresses for a user.
 * 
 * Query Parameters:
 * - userId: User ID (required)
 * - type: Filter by address type (shipping/billing/both)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const type = searchParams.get("type");

    if (!userId) {
      return NextResponse.json(
        { error: "userId is required" },
        { status: 400 }
      );
    }

    // Build query
    const constraints: any[] = [
      where("userId", "==", userId),
      orderBy("isDefault", "desc"),
      orderBy("createdAt", "desc"),
    ];

    if (type) {
      constraints.unshift(where("type", "in", [type, "both"]));
    }

    const addressesQuery = query(
      collection(db, "addresses"),
      ...constraints
    );

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
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error fetching addresses:", error);
    return NextResponse.json(
      { error: "Failed to fetch addresses", details: error.message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/user/addresses
 * 
 * Add a new address for the user.
 * Supports create-on-fly during checkout.
 * 
 * Request Body:
 * - userId: User ID (required)
 * - type: Address type (shipping/billing/both) (required)
 * - fullName: Full name (required)
 * - phone: Phone number (required)
 * - addressLine1: Address line 1 (required)
 * - addressLine2: Address line 2 (optional)
 * - city: City (required)
 * - state: State (required)
 * - zipCode: ZIP code (required)
 * - country: Country (required)
 * - isDefault: Set as default address (default false)
 * - label: Address label (e.g., "Home")
 */
export async function POST(request: NextRequest) {
  try {
    const body: Address = await request.json();
    const {
      userId,
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
    if (!userId || !type || !fullName || !phone || !addressLine1 || !city || !state || !zipCode || !country) {
      return NextResponse.json(
        { error: "Missing required address fields" },
        { status: 400 }
      );
    }

    // If this is set as default, unset other default addresses
    if (isDefault) {
      const existingDefaultQuery = query(
        collection(db, "addresses"),
        where("userId", "==", userId),
        where("isDefault", "==", true)
      );
      const existingDefaults = await getDocs(existingDefaultQuery);

      const updatePromises = existingDefaults.docs.map((doc) =>
        updateDoc(doc.ref, { isDefault: false })
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
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error adding address:", error);

    if (error.code === "permission-denied") {
      return NextResponse.json(
        { error: "Insufficient permissions to add address" },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { error: "Failed to add address", details: error.message },
      { status: 500 }
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
        { status: 400 }
      );
    }

    // Verify address belongs to user
    const addressDoc = await getDocs(
      query(
        collection(db, "addresses"),
        where("__name__", "==", addressId),
        where("userId", "==", userId)
      )
    );

    if (addressDoc.empty) {
      return NextResponse.json(
        { error: "Address not found or access denied" },
        { status: 404 }
      );
    }

    // If setting as default, unset other defaults
    if (body.isDefault === true) {
      const existingDefaultQuery = query(
        collection(db, "addresses"),
        where("userId", "==", userId),
        where("isDefault", "==", true)
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
      query(collection(db, "addresses"), where("__name__", "==", addressId))
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
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error updating address:", error);

    if (error.code === "permission-denied") {
      return NextResponse.json(
        { error: "Insufficient permissions to update address" },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { error: "Failed to update address", details: error.message },
      { status: 500 }
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
        { status: 400 }
      );
    }

    // Verify address belongs to user before deleting
    const addressDoc = await getDocs(
      query(
        collection(db, "addresses"),
        where("__name__", "==", addressId),
        where("userId", "==", userId)
      )
    );

    if (addressDoc.empty) {
      return NextResponse.json(
        { error: "Address not found or access denied" },
        { status: 404 }
      );
    }

    // Delete address
    await deleteDoc(doc(db, "addresses", addressId));

    return NextResponse.json(
      {
        success: true,
        message: "Address deleted successfully",
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error deleting address:", error);

    if (error.code === "permission-denied") {
      return NextResponse.json(
        { error: "Insufficient permissions to delete address" },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { error: "Failed to delete address", details: error.message },
      { status: 500 }
    );
  }
}
