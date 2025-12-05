/**
 * @fileoverview TypeScript Module
 * @module src/app/api/auth/verify-email/send/route
 * @description This file contains functionality related to route
 * 
 * @created 2025-12-05
 * @author Development Team
 */

import { otpService } from "@/app/api/lib/services/otp.service";
import { getUserFromRequest } from "@/app/api/middleware/rbac-auth";
import { logError } from "@/lib/firebase-error-logger";
import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/auth/verify-email/send
 * Send OTP to user's email for verification
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

    // Check if already verified
    const isVerified = await otpService.isVerified(user.uid, "email");
    if (isVerified) {
      return NextResponse.json({
        /** Success */
        success: true,
        /** Message */
        message: "Email already verified",
        /** Already Verified */
        alreadyVerified: true,
      });
    }

    // Send OTP
    const result = await otpService.sendOTP({
      /** User Id */
      userId: user.uid,
      /** Type */
      type: "email",
      /** Destination */
      destination: user.email,
    });

    return NextResponse.json({
      /** Success */
      success: true,
      /** Message */
      message: "OTP sent to your email",
      /** Otp Id */
      otpId: result.id,
      /** Expires At */
      expiresAt: result.expiresAt.toISOString(),
    });
  } catch (error) {
    logError(error as Error, {
      /** Component */
      component: "VerifyEmailSendAPI.POST",
    });

    return NextResponse.json(
      {
        /** Success */
        success: false,
        /** Error */
        error: error instanceof Error ? error.message : "Failed to send OTP",
      },
      { status: 500 }
    );
  }
}
