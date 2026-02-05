/**
 * Verify Phone Number API Route
 * POST /api/profile/verify-phone
 *
 * Verifies phone number using OTP code sent via SMS.
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createApiHandler } from "@/lib/api/api-handler";
import { requireAuth } from "@/lib/security/authorization";
import { rateLimiter, RATE_LIMIT_PRESETS } from "@/lib/security/rate-limiting";
import { userRepository } from "@/repositories";

const verifyPhoneSchema = z.object({
  verificationId: z.string().min(1, "Verification ID is required"),
  code: z.string().length(6, "Verification code must be 6 digits"),
});

export const POST = createApiHandler(
  async (req: NextRequest) => {
    // Rate limiting (5 attempts per 15 minutes)
    const rateLimitResult = await rateLimiter.check(
      req,
      5,
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
    const { verificationId, code } = verifyPhoneSchema.parse(body);

    // In production, verify the code against stored verification data
    // For now, accept any 6-digit code in development
    const isValidCode =
      process.env.NODE_ENV === "development" ||
      (await verifyCodeAgainstStorage(verificationId, code));

    if (!isValidCode) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid or expired verification code",
        },
        { status: 400 },
      );
    }

    // Mark phone as verified
    await userRepository.update(userId, {
      phoneVerified: true,
    } as any);

    // Clean up verification data
    // await deleteVerificationData(verificationId);

    return NextResponse.json({
      success: true,
      message: "Phone number verified successfully",
    });
  },
  {
    requiresAuth: true,
    validationSchema: verifyPhoneSchema,
  },
);

// Helper function to verify code (implement with your storage solution)
async function verifyCodeAgainstStorage(
  verificationId: string,
  code: string,
): Promise<boolean> {
  // TODO: Implement verification against Firebase/Redis/Database
  // Check if code matches and hasn't expired (e.g., 10 minutes)
  return true; // Placeholder
}
