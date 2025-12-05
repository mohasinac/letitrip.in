/**
 * @fileoverview TypeScript Module
 * @module src/app/api/user/addresses/[id]/route
 * @description This file contains functionality related to route
 * 
 * @created 2025-12-05
 * @author mohasinac
 * @see {@link https://mohasin.chinnapattan.com}
 */

import { COLLECTIONS } from "@/constants/database";
import { logError } from "@/lib/firebase-error-logger";
import { NextRequest, NextResponse } from "next/server";
import { getFirestoreAdmin } from "../../../lib/firebase/admin";
import { getCurrentUser } from "../../../lib/session";

/**
 * Function: G E T
 */
/**
 * Performs g e t operation
 *
 * @param {NextRequest} request - The request
 * @param {{ params} { params } - The { params }
 *
 * @returns {Promise<any>} Promise resolving to get result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * GET(request, {});
 */

/**
 * Performs g e t operation
 *
 * @param {NextRequest} /** Request */
  request - The /**  request */
  request
 * @param {{ params} { params } - The { params }
 *
 * @returns {Promise<any>} Promise resolving to get result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * GET(/** Request */
  request, {});
 */

/**
 * Retrieves 
 *
 * @param {NextRequest} request - The request
 * @param {{ params: Promise<{ id: string }> }} { params } - The { params }
 *
 * @returns {Promise<any>} The get result
 *
 * @example
 * GET(request, {});
 */
export async function GET(
  /** Request */
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
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
      /** Component */
      component: "API.user.addresses.getById",
      /** Metadata */
      metadata: { addressId: id, userId: user?.id },
    });
    return NextResponse.json(
      { error: "Failed to fetch address" },
      { status: 500 },
    );
  }
}

/**
 * Function: P A T C H
 */
/**
 * Performs p a t c h operation
 *
 * @param {NextRequest} request - The request
 * @param {{ params} { params } - The { params }
 *
 * @returns {Promise<any>} Promise resolving to patch result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * PATCH(request, {});
 */

/**
 * Performs p a t c h operation
 *
 * @param {NextRequest} /** Request */
  request - The /**  request */
  request
 * @param {{ pa/**
 * Performs p a t c h operation
 *
 * @param {NextRequest} request - The request
 * @param {{ params: Promise<{ id: string }> }} { params } - The { params }
 *
 * @returns {Promise<any>} The patch result
 *
 * @example
 * PATCH(request, {});
 */
rams} { params } - The { params }
 *
 * @returns {Promise<any>} Promise resolving to patch result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * PATCH(/** Request */
  request, {});
 */

export async function PATCH(
  /** Request */
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
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

      /**
 * Performs batch operation
 *
 * @returns {any} The batch result
 *
 */
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
      /** Updated At */
      updatedAt: new Date().toISOString(),
    };

    await addressRef.update(updateData);

    const updatedDoc = await addressRef.get();
    const updatedAddress = { id: updatedDoc.id, ...updatedDoc.data() };

    return NextResponse.json({ address: updatedAddress });
  } catch (error: any) {
    logError(error as Error, {
      /** Component */
      component: "API.user.addresses.update",
      /** Metadata */
      metadata: { addressId: id, userId: user?.id },
    });
    return NextResponse.json(
      { error: "Failed to update address" },
      { status: 500 },
    );
  }
}

/**
 * Function: D E L E T E
 */
/**
 * Performs d e l e t e operation
 *
 * @param {NextRequest} request - The request
 * @param {{ params} { params } - The { params }
 *
 * @returns {Promise<any>} Promise resolving to delete result
 *
/**
 * Deletes 
 *
 * @param {NextRequest} request - The request
 * @param {{ params: Promise<{ id: string }> }} { params } - The { params }
 *
 * @returns {Promise<any>} The delete result
 *
 * @example
 * DELETE(request, {});
 */
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * DELETE(request, {});
 */

/**
 * Performs d e l e t e operation
 *
 * @param {NextRequest} /** Request */
  request - The /**  request */
  request
 * @param {{ params} { params } - The { params }
 *
 * @returns {Promise<any>} Promise resolving to delete result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * DELETE(/** Request */
  request, {});
 */

export async function DELETE(
  /** Request */
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
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
      /** Component */
      component: "API.user.addresses.delete",
      /** Metadata */
      metadata: { addressId: id, userId: user?.id },
    });
    return NextResponse.json(
      { error: "Failed to delete address" },
      { status: 500 },
    );
  }
}
