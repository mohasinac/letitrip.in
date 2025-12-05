/**
 * @fileoverview TypeScript Module
 * @module src/app/api/user/addresses/route
 * @description This file contains functionality related to route
 * 
 * @created 2025-12-05
 * @author Development Team
 */

import { COLLECTIONS } from "@/constants/database";
import { logError } from "@/lib/firebase-error-logger";
import { NextRequest, NextResponse } from "next/server";
import { getFirestoreAdmin } from "../../lib/firebase/admin";
import { getCurrentUser } from "../../lib/session";

/**
 * Function: G E T
 */
/**
 * Performs g e t operation
 *
 * @param {NextRequest} request - The request
 *
 * @returns {Promise<any>} Promise resolving to get result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * GET(request);
 */

/**
 * Performs g e t operation
 *
 * @param {NextRequest} request - The request
 *
 * @returns {Promise<any>} Promise resolving to get result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * GET(request);
 */

export async function GET(request: NextRequest) {
  let user: Awaited<ReturnType<typeof getCurrentUser>> | undefined;
  try {
    user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = getFirestoreAdmin();
    const addressesSnapshot = await db
      .collection(COLLECTIONS.ADDRESSES)
      .where("userId", "==", user.id)
      .orderBy("isDefault", "desc")
      .orderBy("createdAt", "desc")
      .get();

    const addresses = addressesSnapshot.docs.map((doc) => ({
      /** Id */
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json({ addresses });
  } catch (error: any) {
    logError(error as Error, {
      /** Component */
      component: "API.user.addresses.get",
      /** Metadata */
      metadata: { userId: user?.id },
    });
    return NextResponse.json(
      { error: "Failed to fetch addresses" },
      { status: 500 },
    );
  }
}

/**
 * Function: P O S T
 */
/**
 * Performs p o s t operation
 *
 * @param {NextRequest} request - The request
 *
 * @returns {Promise<any>} Promise resolving to post result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * POST(request);
 */

/**
 * Performs p o s t operation
 *
 * @param {NextRequest} request - The request
 *
 * @returns {Promise<any>} Promise resolving to post result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * POST(request);
 */

export async function POST(request: NextRequest) {
  let user: Awaited<ReturnType<typeof getCurrentUser>> | undefined;
  try {
    user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json();
    const {
      name,
      phone,
      addressLine1,
      addressLine2,
      city,
      state,
      postalCode,
      country,
      isDefault,
    } = data;

    // Validation
    if (
      !name ||
      !phone ||
      !addressLine1 ||
      !city ||
      !state ||
      !postalCode ||
      !country
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const db = getFirestoreAdmin();

    // If this is set as default, unset other defaults
    if (isDefault) {
      const defaultAddresses = await db
        .collection(COLLECTIONS.ADDRESSES)
        .where("userId", "==", user.id)
        .where("isDefault", "==", true)
        .get();

      const batch = db.batch();
      defaultAddresses.docs.forEach((doc) => {
        batch.update(doc.ref, { isDefault: false });
      });
      await batch.commit();
    }

    // Create new address
    const addressRef = db.collection(COLLECTIONS.ADDRESSES).doc();
    const newAddress = {
      /** Id */
      id: addressRef.id,
      /** User Id */
      userId: user.id,
      name,
      phone,
      addressLine1,
      /** Address Line2 */
      addressLine2: addressLine2 || null,
      city,
      state,
      postalCode,
      country,
      /** Is Default */
      isDefault: isDefault || false,
      /** Created At */
      createdAt: new Date().toISOString(),
      /** Updated At */
      updatedAt: new Date().toISOString(),
    };

    await addressRef.set(newAddress);

    return NextResponse.json({ address: newAddress }, { status: 201 });
  } catch (error: any) {
    logError(error as Error, {
      /** Component */
      component: "API.user.addresses.create",
      /** Metadata */
      metadata: { userId: user?.id },
    });
    return NextResponse.json(
      { error: "Failed to create address" },
      { status: 500 },
    );
  }
}
