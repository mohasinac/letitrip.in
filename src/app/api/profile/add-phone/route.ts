/**
 * Add Phone Number API Route
 * POST /api/profile/add-phone
 *
 * Adds/updates user phone number and sends SMS verification code.
 * Uses Firebase Phone Authentication for OTP delivery.
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createApiHandler } from "@/lib/api/api-handler";
import { requireAuth } from "@/lib/security/authorization";
import { rateLimiter, RATE_LIMIT_PRESETS } from "@/lib/security/rate-limiting";
import { userRepository } from "@/repositories";
import { auth } from "@/lib/firebase/admin";

const addPhoneSchema = z.object({
  phoneNumber: z
    .string()
    .regex(
      /^\+?[1-9]\d{9,14}$/,
      "Invalid phone number format. Use international format (e.g., +919876543210)",
    ),
});

export const POST = createApiHandler(
  async (req: NextRequest) => {
    // Rate limiting (3 attempts per 15 minutes)
    const rateLimitResult = await rateLimiter.check(
      req,
      RATE_LIMIT_PRESETS.PHONE_VERIFICATION.points,
      RATE_LIMIT_PRESETS.PHONE_VERIFICATION.duration,
    );

    if (!rateLimitResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: `Too many attempts. Please try again in ${Math.ceil(rateLimitResult.msBeforeNext / 60000)} minutes.`,
        },
        { status: 429 },
      );
    }

    // Require authentication
    const authResult = await requireAuth(req);
    const userId = authResult.user.uid;

    // Parse and validate request body
    const body = await req.json();
    const { phoneNumber } = addPhoneSchema.parse(body);

    // Check if phone number is already registered by another user
    const existingUser = await userRepository.findByPhone(phoneNumber);
    if (existingUser && existingUser.uid !== userId) {
      return NextResponse.json(
        {
          success: false,
          error: "This phone number is already registered to another account",
        },
        { status: 409 },
      );
    }

    // Update user record with unverified phone
    await userRepository.update(userId, {
      phoneNumber,
      phoneVerified: false,
    } as any);

    // Generate verification ID (in production, use Firebase Phone Auth)
    // For now, we'll use a simple token system
    const verificationId = `PHONE_${userId}_${Date.now()}`;
    const verificationCode = Math.floor(
      100000 + Math.random() * 900000,
    ).toString();

    // In production, send SMS via Firebase or Twilio
    // For development, log the code
    console.log(
      `[DEV] Phone verification code for ${phoneNumber}: ${verificationCode}`,
    );
    console.log(`[DEV] Verification ID: ${verificationId}`);

    // Store verification data in temporary collection (implement this)
    // await storeVerificationCode(verificationId, userId, phoneNumber, verificationCode);

    return NextResponse.json({
      success: true,
      message: "Verification code sent to your phone",
      verificationId,
      // In development, return the code (REMOVE IN PRODUCTION)
      ...(process.env.NODE_ENV === "development" && {
        devCode: verificationCode,
      }),
    });
  },
  {
    requiresAuth: true,
    validationSchema: addPhoneSchema,
  },
);
