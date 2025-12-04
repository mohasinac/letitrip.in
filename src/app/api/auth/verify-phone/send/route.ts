import { otpService } from "@/app/api/lib/services/otp.service";
import { getUserFromRequest } from "@/app/api/middleware/rbac-auth";
import { logError } from "@/lib/firebase-error-logger";
import { smsService } from "@/services/sms.service";
import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/auth/verify-phone/send
 * Send OTP to user's phone via SMS
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
        success: true,
        message: "Phone already verified",
        alreadyVerified: true,
      });
    }

    // Send OTP
    const result = await otpService.sendOTP({
      userId: user.uid,
      type: "phone",
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
      success: true,
      message: "OTP sent to your phone",
      otpId: result.id,
      expiresAt: result.expiresAt.toISOString(),
    });
  } catch (error) {
    logError(error as Error, {
      component: "VerifyPhoneSendAPI.POST",
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
