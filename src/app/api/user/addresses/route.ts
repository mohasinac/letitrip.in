import { NextRequest, NextResponse } from "next/server";
import { createUserHandler } from "@/lib/auth/api-middleware";
import { ApiResponse, validateBody } from "@/lib/auth/middleware";
import { addressSchema } from "@/lib/validations/schemas";
import { db } from "@/lib/firebase/config";
import { collection, getDocs, query, where, orderBy, addDoc, updateDoc, doc } from "firebase/firestore";

export const GET = createUserHandler(async (request: NextRequest, user) => {
  try {

    const userId = user.userId;

    // Fetch addresses from Firestore
    const addressesQuery = query(
      collection(db, "addresses"),
      where("userId", "==", userId),
      orderBy("createdAt", "desc")
    );

    const addressesSnapshot = await getDocs(addressesQuery);
    const addresses = addressesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || doc.data().createdAt,
      updatedAt: doc.data().updatedAt?.toDate?.()?.toISOString() || doc.data().updatedAt
    }));

    return NextResponse.json({
      success: true,
      data: addresses
    });

  } catch (error) {
    console.error("Get addresses error:", error);
    return NextResponse.json(
      { error: "Failed to get addresses" },
      { status: 500 }
    );
  }
});

export const POST = createUserHandler(async (request: NextRequest, user) => {
  try {

    // Validate request body
    const validation = await validateBody(request, addressSchema);
    if (validation.error) {
      return validation.error;
    }

    const userId = user.userId;
    const addressData = validation.data;

    // If this is set as default, unset other defaults
    if (addressData.isDefault) {
      const addressesQuery = query(
        collection(db, "addresses"),
        where("userId", "==", userId),
        where("isDefault", "==", true)
      );
      
      const currentDefaultAddresses = await getDocs(addressesQuery);
      const updatePromises = currentDefaultAddresses.docs.map(addressDoc => 
        updateDoc(addressDoc.ref, { isDefault: false })
      );
      await Promise.all(updatePromises);
    }

    // Create new address in Firestore
    const newAddressData = {
      userId,
      ...addressData,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const docRef = await addDoc(collection(db, "addresses"), newAddressData);

    const newAddress = {
      id: docRef.id,
      ...newAddressData,
      createdAt: newAddressData.createdAt.toISOString(),
      updatedAt: newAddressData.updatedAt.toISOString()
    };

    return NextResponse.json({
      success: true,
      message: "Address added successfully",
      data: newAddress
    }, { status: 201 });

  } catch (error) {
    console.error("Add address error:", error);
    return NextResponse.json(
      { error: "Failed to add address" },
      { status: 500 }
    );
  }
});
