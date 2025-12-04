import { COLLECTIONS } from "@/constants/database";
import { logError } from "@/lib/firebase-error-logger";
import { NextRequest, NextResponse } from "next/server";
import { getFirestoreAdmin } from "../../../lib/firebase/admin";
import { getCurrentUser } from "../../../lib/session";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  let id: string | undefined;
  let user: Awaited<ReturnType<typeof getCurrentUser>> | undefined;
  try {
    user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const awaitedParams = await params;
    id = awaitedParams.id;
    const db = getFirestoreAdmin();
    const addressDoc = await db.collection(COLLECTIONS.ADDRESSES).doc(id).get();

    if (!addressDoc.exists) {
      return NextResponse.json({ error: "Address not found" }, { status: 404 });
    }

    const addressData = addressDoc.data();
    const address = { id: addressDoc.id, ...addressData };

    // Verify ownership
    if (addressData?.userId !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json({ address });
  } catch (error: any) {
    logError(error as Error, {
      component: "API.user.addresses.getById",
      metadata: { addressId: id, userId: user?.id },
    });
    return NextResponse.json(
      { error: "Failed to fetch address" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  let id: string | undefined;
  let user: Awaited<ReturnType<typeof getCurrentUser>> | undefined;
  try {
    user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const awaitedParams = await params;
    id = awaitedParams.id;
    const db = getFirestoreAdmin();
    const addressRef = db.collection(COLLECTIONS.ADDRESSES).doc(id);
    const addressDoc = await addressRef.get();

    if (!addressDoc.exists) {
      return NextResponse.json({ error: "Address not found" }, { status: 404 });
    }

    const address = addressDoc.data();

    // Verify ownership
    if (address?.userId !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const data = await request.json();

    // If setting as default, unset other defaults
    if (data.isDefault === true) {
      const defaultAddresses = await db
        .collection(COLLECTIONS.ADDRESSES)
        .where("userId", "==", user.id)
        .where("isDefault", "==", true)
        .get();

      const batch = db.batch();
      defaultAddresses.docs.forEach((doc) => {
        if (doc.id !== id) {
          batch.update(doc.ref, { isDefault: false });
        }
      });
      await batch.commit();
    }

    // Update address
    const updateData = {
      ...data,
      updatedAt: new Date().toISOString(),
    };

    await addressRef.update(updateData);

    const updatedDoc = await addressRef.get();
    const updatedAddress = { id: updatedDoc.id, ...updatedDoc.data() };

    return NextResponse.json({ address: updatedAddress });
  } catch (error: any) {
    logError(error as Error, {
      component: "API.user.addresses.update",
      metadata: { addressId: id, userId: user?.id },
    });
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
  let id: string | undefined;
  let user: Awaited<ReturnType<typeof getCurrentUser>> | undefined;
  try {
    user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const awaitedParams = await params;
    id = awaitedParams.id;
    const db = getFirestoreAdmin();
    const addressRef = db.collection(COLLECTIONS.ADDRESSES).doc(id);
    const addressDoc = await addressRef.get();

    if (!addressDoc.exists) {
      return NextResponse.json({ error: "Address not found" }, { status: 404 });
    }

    const address = addressDoc.data();

    // Verify ownership
    if (address?.userId !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await addressRef.delete();

    return NextResponse.json({ success: true });
  } catch (error: any) {
    logError(error as Error, {
      component: "API.user.addresses.delete",
      metadata: { addressId: id, userId: user?.id },
    });
    return NextResponse.json(
      { error: "Failed to delete address" },
      { status: 500 }
    );
  }
}
