import { otpService } from "@/app/api/lib/services/otp.service";
import { getUserFromRequest } from "@/app/api/middleware/rbac-auth";
import { logError } from "@/lib/firebase-error-logger";
import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/auth/verify-email/send
 * Send OTP to user's email for verification
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
    const isVerified = await otpService.isVerified(user.id, "email");
    if (isVerified) {
      return NextResponse.json({
        success: true,
        message: "Email already verified",
        alreadyVerified: true,
      });
    }

    // Send OTP
    const result = await otpService.sendOTP({
      userId: user.id,
      type: "email",
      destination: user.email,
    });

    return NextResponse.json({
      success: true,
      message: "OTP sent to your email",
      otpId: result.id,
      expiresAt: result.expiresAt.toISOString(),
    });
  } catch (error) {
    logError(error as Error, {
      component: "VerifyEmailSendAPI.POST",
    });

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to send OTP",
      },
      { status: 500 }
    );
  }
}
