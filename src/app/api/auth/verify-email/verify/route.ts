/**
 * @fileoverview TypeScript Module
 * @module src/app/api/auth/verify-email/verify/route
 * @description This file contains functionality related to route
 * 
 * @created 2025-12-05
 * @author mohasinac
 * @see {@link https://mohasin.chinnapattan.com}
 */

import { otpService } from "@/app/api/lib/services/otp.service";
import { getUserFromRequest } from "@/app/api/middleware/rbac-auth";
import { logError } from "@/lib/firebase-error-logger";
import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/auth/verify-email/verify
 * Verify OTP entered by user
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
  try {
    const user = await getUserFromRequest(request);

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    if (!user.email) {
      return NextResponse.json(
        { success: false, error: "No email address found" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { otp } = body;

    if (!otp || otp.length !== 6) {
      return NextResponse.json(
        { success: false, error: "Invalid OTP format" },
        { status: 400 }
      );
    }

    // Verify OTP
    const result = await otpService.verifyOTP({
      /** User Id */
      userId: user.uid,
      /** Type */
      type: "email",
      /** Destination */
      destination: user.email,
      otp,
    });

    if (result.success) {
      return NextResponse.json({
        /** Success */
        success: true,
        /** Message */
        message: result.message,
      });
    } else {
      return NextResponse.json(
        {
          /** Success */
          success: false,
          /** Error */
          error: result.message,
        },
        { status: 400 }
      );
    }
  } catch (error) {
    logError(error as Error, {
      /** Component */
      component: "VerifyEmailVerifyAPI.POST",
    });

    return NextResponse.json(
      {
        /** Success */
        success: false,
        /** Error */
        error: error instanceof Error ? error.message : "Failed to verify OTP",
      },
      { status: 500 }
    );
  }
}
