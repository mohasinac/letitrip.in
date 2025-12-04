import { getUserFromRequest } from "@/app/api/middleware/rbac-auth";
import { logError } from "@/lib/firebase-error-logger";
import { otpService } from "@/services/otp.service";
import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/auth/verify-phone/verify
 * Verify OTP entered by user for phone verification
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

    if (!user.phone) {
      return NextResponse.json(
        { success: false, error: "No phone number found" },
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
      userId: user.id,
      type: "phone",
      destination: user.phone,
      otp,
    });

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: result.message,
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          error: result.message,
        },
        { status: 400 }
      );
    }
  } catch (error) {
    logError(error as Error, {
      component: "VerifyPhoneVerifyAPI.POST",
    });

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to verify OTP",
      },
      { status: 500 }
    );
  }
}
