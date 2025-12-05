/**
 * @fileoverview TypeScript Module
 * @module src/app/api/test-data/generate-addresses/route
 * @description This file contains functionality related to route
 * 
 * @created 2025-12-05
 * @author Development Team
 */

import { getFirestoreAdmin } from "@/app/api/lib/firebase/admin";
import { COLLECTIONS } from "@/constants/database";
import { logError } from "@/lib/firebase-error-logger";
import { faker } from "@faker-js/faker";
import { NextRequest, NextResponse } from "next/server";

const PREFIX = "TEST_";

/**
 * Function: P O S T
 */
/**
 * Performs p o s t operation
 *
 * @param {NextRequest} req - The req
 *
 * @returns {Promise<any>} Promise resolving to post result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * POST(req);
 */

/**
 * Performs p o s t operation
 *
 * @param {NextRequest} req - The req
 *
 * @returns {Promise<any>} Promise resolving to post result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * POST(req);
 */

export async function POST(req: NextRequest) {
  try {
    const { addressesPerUser = 2 } = await req.json();
    const db = getFirestoreAdmin();

    // Get all test users
    const usersSnapshot = await db
      .collection(COLLECTIONS.USERS)
      .where("email", ">=", PREFIX)
      .where("email", "<=", PREFIX + "\uf8ff")
      .get();

    if (usersSnapshot.empty) {
      return NextResponse.json({
        /** Success */
        success: false,
        /** Error */
        error: "No test users found. Please generate users first.",
      });
    }

    const indianStates = [
      "Andhra Pradesh",
      "Karnataka",
      "Kerala",
      "Tamil Nadu",
      "Telangana",
      "Maharashtra",
      "Gujarat",
      "Rajasthan",
      "Delhi",
      "West Bengal",
      "Uttar Pradesh",
      "Punjab",
      "Haryana",
      "Madhya Pradesh",
    ];

    const addressTypes = [
      "home",
      "work",
      "billing",
      "shipping",
      "office",
      "other",
    ];

    const addresses = [];
    let addressCount = 0;

    for (const userDoc of usersSnapshot.docs) {
      const userId = userDoc.id;
      const userName = userDoc.data().name || "User";

      // Generate 1-3 addresses per user
      const numAddresses = Math.min(
        addressesPerUser,
        faker.number.int({ min: 1, max: 3 })
      );

      for (let i = 0; i < numAddresses; i++) {
        const state = faker.helpers.arrayElement(indianStates);
        const addressType = addressTypes[i] || "other";

        const addressData = {
          /** Id */
          id: `${PREFIX}address_${Date.now()}_${addressCount + 1}`,
          /** User Id */
          userId: userId,
          /** Type */
          type: addressType,
          isDefault: i === 0, // First address is default

          // Contact information
          /** Full Name */
          fullName: userName.replace(PREFIX, ""),
          /** Phone */
          phone: `+91${faker.number.int({ min: 6000000000, max: 9999999999 })}`,
          /** Alternate Phone */
          alternatePhone:
            i > 0
              ? `+91${faker.number.int({ min: 6000000000, max: 9999999999 })}`
              : undefined,
          /** Email */
          email: userDoc.data().email,

          // Address details
          /** Address Line1 */
          addressLine1: faker.location.streetAddress(),
          /** Address Line2 */
          addressLine2:
            Math.random() < 0.5 ? faker.location.secondaryAddress() : undefined,
          /** Landmark */
          landmark: faker.helpers.arrayElement([
            "Near Metro Station",
            "Opposite Bank",
            "Behind Mall",
            "Near Hospital",
            "Main Road",
            "Market Area",
          ]),
          /** City */
          city: faker.location.city(),
          /** State */
          state: state,
          /** Pincode */
          pincode: faker.number.int({ min: 110001, max: 999999 }).toString(),
          /** Country */
          country: "India",

          // Additional flags
          isVerified: Math.random() < 0.7, // 70% verified
          /** Is Active */
          isActive: true,

          // Timestamps
          /** Created At */
          createdAt: new Date().toISOString(),
          /** Updated At */
          updatedAt: new Date().toISOString(),
        };

        await db.collection(COLLECTIONS.ADDRESSES).add(addressData);
        addresses.push({
          /** Id */
          id: addressData.id,
          /** Type */
          type: addressData.type,
          /** City */
          city: addressData.city,
          /** State */
          state: addressData.state,
          /** Is Default */
          isDefault: addressData.isDefault,
        });
        addressCount++;
      }
    }

    return NextResponse.json({
      /** Success */
      success: true,
      /** Count */
      count: addressCount,
      /** Users Processed */
      usersProcessed: usersSnapshot.docs.length,
      /** Addresses */
      addresses: addresses,
    });
  } catch (error: any) {
    logError(error as Error, {
      /** Component */
      component: "API.testData.generateAddresses",
    });
    return NextResponse.json(
      {
        /** Success */
        success: false,
        /** Error */
        error: error.message || "Failed to generate addresses",
      },
      { status: 500 }
    );
  }
}
