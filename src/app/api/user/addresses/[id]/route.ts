import { NextRequest, NextResponse } from "next/server";
import { authenticateUser, ApiResponse, validateBody } from "@/lib/auth/middleware";
import { addressSchema } from "@/lib/validations/schemas";
import { db } from "@/lib/firebase/config";
import { doc, getDoc, updateDoc, deleteDoc, collection, getDocs, query, where } from "firebase/firestore";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication
    const user = await authenticateUser(request);
    if (!user) {
      return ApiResponse.unauthorized("Authentication required");
    }

    const { id: addressId } = await params;
    const userId = user.userId;

    // Fetch address from Firestore
    const addressDoc = await getDoc(doc(db, "addresses", addressId));
    
    if (!addressDoc.exists()) {
      return NextResponse.json(
        { error: "Address not found" },
        { status: 404 }
      );
    }

    const address = {
      id: addressDoc.id,
      ...addressDoc.data(),
      createdAt: addressDoc.data()?.createdAt?.toDate?.()?.toISOString() || addressDoc.data()?.createdAt,
      updatedAt: addressDoc.data()?.updatedAt?.toDate?.()?.toISOString() || addressDoc.data()?.updatedAt
    } as any;

    // Check if address belongs to user
    if (address.userId !== userId) {
      return NextResponse.json(
        { error: "Address not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: address
    });

  } catch (error) {
    console.error("Get address error:", error);
    return NextResponse.json(
      { error: "Failed to get address" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication
    const user = await authenticateUser(request);
    if (!user) {
      return ApiResponse.unauthorized("Authentication required");
    }

    // Validate request body
    const validation = await validateBody(request, addressSchema.partial());
    if (validation.error) {
      return validation.error;
    }

    const { id: addressId } = await params;
    const userId = user.userId;
    const updateData = validation.data;

    // Check if address exists and belongs to user
    const addressDoc = await getDoc(doc(db, "addresses", addressId));
    
    if (!addressDoc.exists() || addressDoc.data()?.userId !== userId) {
      return NextResponse.json(
        { error: "Address not found" },
        { status: 404 }
      );
    }

    // If this is set as default, unset other defaults
    if (updateData.isDefault) {
      const addressesQuery = query(
        collection(db, "addresses"),
        where("userId", "==", userId),
        where("isDefault", "==", true)
      );
      
      const currentDefaultAddresses = await getDocs(addressesQuery);
      const updatePromises = currentDefaultAddresses.docs.map(addrDoc => 
        updateDoc(addrDoc.ref, { isDefault: false })
      );
      await Promise.all(updatePromises);
    }

    // Update address in Firestore
    const updatePayload = {
      ...updateData,
      updatedAt: new Date()
    };

    await updateDoc(doc(db, "addresses", addressId), updatePayload);

    // Fetch updated address
    const updatedDoc = await getDoc(doc(db, "addresses", addressId));
    const updatedAddress = {
      id: updatedDoc.id,
      ...updatedDoc.data(),
      createdAt: updatedDoc.data()?.createdAt?.toDate?.()?.toISOString() || updatedDoc.data()?.createdAt,
      updatedAt: updatedDoc.data()?.updatedAt?.toDate?.()?.toISOString() || updatedDoc.data()?.updatedAt
    };

    return NextResponse.json({
      success: true,
      message: "Address updated successfully",
      data: updatedAddress
    });

  } catch (error) {
    console.error("Update address error:", error);
    return NextResponse.json(
      { error: "Failed to update address" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication
    const user = await authenticateUser(request);
    if (!user) {
      return ApiResponse.unauthorized("Authentication required");
    }

    const { id: addressId } = await params;
    const userId = user.userId;

    // Check if address exists and belongs to user
    const addressDoc = await getDoc(doc(db, "addresses", addressId));
    
    if (!addressDoc.exists() || addressDoc.data()?.userId !== userId) {
      return NextResponse.json(
        { error: "Address not found" },
        { status: 404 }
      );
    }

    const addressData = addressDoc.data();

    // Prevent deletion of default address if it's the only one
    if (addressData?.isDefault) {
      const userAddressesQuery = query(
        collection(db, "addresses"),
        where("userId", "==", userId)
      );
      const userAddressesSnapshot = await getDocs(userAddressesQuery);
      
      if (userAddressesSnapshot.docs.length <= 1) {
        return NextResponse.json(
          { error: "Cannot delete the only address. Add another address first." },
          { status: 400 }
        );
      }
    }

    // Delete address from Firestore
    await deleteDoc(doc(db, "addresses", addressId));

    return NextResponse.json({
      success: true,
      message: "Address deleted successfully"
    });

  } catch (error) {
    console.error("Delete address error:", error);
    return NextResponse.json(
      { error: "Failed to delete address" },
      { status: 500 }
    );
  }
}
