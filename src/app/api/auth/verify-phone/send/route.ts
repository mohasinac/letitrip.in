/**
 * @fileoverview TypeScript Module
 * @module src/app/api/auth/verify-phone/send/route
 * @description This file contains functionality related to route
 * 
 * @created 2025-12-05
 * @author Development Team
 */

import { otpService } from "@/app/api/lib/services/otp.service";
import { getUserFromRequest } from "@/app/api/middleware/rbac-auth";
import { logError } from "@/lib/firebase-error-logger";
import { smsService } from "@/services/sms.service";
import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/auth/verify-phone/send
 * Send OTP to user's phone via SMS
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

    // Get phone from user claims or metadata
    /**
     * Performs phone operation
     *
     * @param {any} user as any).phoneNumber || (user as any).phone;

    if (!phone - The user as any).phone number || (user as any).phone;

    if (!phone
     *
     * @returns {any} The phone result
     */

    /**
     * Performs phone operation
     *
     * @param {any} user as any).phoneNumber || (user as any).phone;

    if (!phone - The user as any).phone number || (user as any).phone;

    if (!phone
     *
     * @returns {any} The phone result
     */

    const phone = (user as any).phoneNumber || (user as any).phone;

    if (!phone) {
      return NextResponse.json(
        { success: false, error: "No phone number found" },
        { status: 400 }
      );
    }

    if (!phone) {
      return NextResponse.json(
        { success: false, error: "No phone number found" },
        { status: 400 }
      );
    }

    // Check if already verified
    const isVerified = await otpService.isVerified(user.uid, "phone");
    if (isVerified) {
      return NextResponse.json({
        /** Success */
        success: true,
        /** Message */
        message: "Phone already verified",
        /** Already Verified */
        alreadyVerified: true,
      });
    }

    // Send OTP
    const result = await otpService.sendOTP({
      /** User Id */
      userId: user.uid,
      /** Type */
      type: "phone",
      /** Destination */
      destination: phone,
    });

    // Get OTP and send via SMS
    // Note: In production, the OTP would only be sent via SMS, not returned
    // This is for development/testing purposes
    const otpDoc = await (otpService as any).getActiveOTP(
      user.uid,
      "phone",
      phone
    );
    if (otpDoc) {
      await smsService.sendOTP(phone, otpDoc.otp);
    }

    return NextResponse.json({
      /** Success */
      success: true,
      /** Message */
      message: "OTP sent to your phone",
      /** Otp Id */
      otpId: result.id,
      /** Expires At */
      expiresAt: result.expiresAt.toISOString(),
    });
  } catch (error) {
    logError(error as Error, {
      /** Component */
      component: "VerifyPhoneSendAPI.POST",
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
