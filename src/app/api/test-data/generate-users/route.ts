/**
 * @fileoverview TypeScript Module
 * @module src/app/api/test-data/generate-users/route
 * @description This file contains functionality related to route
 * 
 * @created 2025-12-05
 * @author mohasinac
 * @see {@link https://mohasin.chinnapattan.com}
 */

import { getFirestoreAdmin } from "@/app/api/lib/firebase/admin";
import { COLLECTIONS } from "@/constants/database";
import { logError } from "@/lib/firebase-error-logger";
import { faker } from "@faker-js/faker";
import { NextRequest, NextResponse } from "next/server";

/**
 * PREFIX constant
 * 
 * @constant
 * @type {any}
 * @description Configuration constant for prefix
 */
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
    const { count = 10 } = await req.json();
    const db = getFirestoreAdmin();
    const users = [];

    for (let i = 0; i < count; i++) {
      /**
 * Custom React hook for r data
 *
 * @returns {any} The userdata result
 *
 */
const userData = {
        /** Email */
        email: `${PREFIX}user${i + 1}_${Date.now()}@example.com`,
        /** Name */
        name: `${PREFIX}${faker.person.fullName()}`,
        /** Phone */
        phone: `+91${faker.number.int({ min: 6000000000, max: 9999999999 })}`,
        /** Role */
        role: (() => {
          if (i === 0) return "admin";
          if (i < count * 0.3) return "seller";
          return "user";
        })(),
        is_banned: false,
        email_verified: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        /** Profile */
        profile: {
          avatar: `https://ui-avatars.com/api/?name=${PREFIX}User${
            i + 1
          }&background=random`,
          /** Bio */
          bio: faker.lorem.sentence(),
        },
      };

      const docRef = await db.collection(COLLECTIONS.USERS).add(userData);
      users.push({ id: docRef.id, ...userData });
    }

    return NextResponse.json({ success: true, users, count: users.length });
  } catch (error: any) {
    logError(error as Error, {
      /** Component */
      component: "API.testData.generateUsers",
    });
    return NextResponse.json(
      { success: false, error: error.message || "Failed to generate users" },
      { status: 500 }
    );
  }
}
