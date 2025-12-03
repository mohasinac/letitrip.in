import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "../../lib/firebase/config";
import { authRateLimiter } from "@/app/api/lib/utils/rate-limiter";
import { emailService } from "../../lib/email/email.service";
import crypto from "crypto";
import bcrypt from "bcryptjs";

const RESET_TOKEN_EXPIRY = 60 * 60 * 1000; // 1 hour in milliseconds

/**
 * Request password reset (POST /api/auth/reset-password)
 * Sends a reset link to the user's email
 */
export async function POST(req: NextRequest) {
  // Rate limiting
  const identifier =
    req.headers.get("x-forwarded-for") ||
    req.headers.get("x-real-ip") ||
    "unknown";
  if (!authRateLimiter.check(identifier)) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429 },
    );
  }

  try {
    const body = await req.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Always return success to prevent email enumeration
    const successResponse = {
      message:
        "If an account exists with this email, you will receive a password reset link shortly.",
    };

    // Get user from Firestore
    const userSnapshot = await adminDb
      .collection("users")
      .where("email", "==", email.toLowerCase())
      .limit(1)
      .get();

    if (userSnapshot.empty) {
      // Don't reveal if user doesn't exist
      return NextResponse.json(successResponse, { status: 200 });
    }

    const userDoc = userSnapshot.docs[0];
    const userData = userDoc.data();

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenHash = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");
    const resetTokenExpiry = new Date(Date.now() + RESET_TOKEN_EXPIRY);

    // Store reset token in Firestore
    await adminDb.collection("users").doc(userData.uid).update({
      passwordResetToken: resetTokenHash,
      passwordResetTokenExpiry: resetTokenExpiry.toISOString(),
      updatedAt: new Date().toISOString(),
    });

    // Generate reset link
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://letitrip.in";
    const resetLink = `${baseUrl}/reset-password?token=${resetToken}&email=${encodeURIComponent(email.toLowerCase())}`;

    // Send password reset email
    try {
      await emailService.sendPasswordResetEmail(
        userData.email,
        userData.name || "User",
        resetLink,
      );
    } catch (emailError) {
      console.error("Error sending password reset email:", emailError);
      // Don't fail the request if email fails - just log it
    }

    return NextResponse.json(successResponse, { status: 200 });
  } catch (error) {
    console.error("Password reset request error:", error);
    return NextResponse.json(
      { error: "An error occurred. Please try again later." },
      { status: 500 },
    );
  }
}

/**
 * Reset password with token (PUT /api/auth/reset-password)
 */
export async function PUT(req: NextRequest) {
  // Rate limiting
  const identifier =
    req.headers.get("x-forwarded-for") ||
    req.headers.get("x-real-ip") ||
    "unknown";
  if (!authRateLimiter.check(identifier)) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429 },
    );
  }

  try {
    const body = await req.json();
    const { email, token, newPassword } = body;

    if (!email || !token || !newPassword) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // Validate password strength
    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters long" },
        { status: 400 },
      );
    }

    // Hash the provided token to compare with stored hash
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

    // Get user from Firestore
    const userSnapshot = await adminDb
      .collection("users")
      .where("email", "==", email.toLowerCase())
      .limit(1)
      .get();

    if (userSnapshot.empty) {
      return NextResponse.json(
        { error: "Invalid or expired reset token" },
        { status: 400 },
      );
    }

    const userDoc = userSnapshot.docs[0];
    const userData = userDoc.data();

    // Verify token
    if (
      !userData.passwordResetToken ||
      userData.passwordResetToken !== tokenHash
    ) {
      return NextResponse.json(
        { error: "Invalid or expired reset token" },
        { status: 400 },
      );
    }

    // Check token expiry
    if (
      !userData.passwordResetTokenExpiry ||
      new Date(userData.passwordResetTokenExpiry) < new Date()
    ) {
      return NextResponse.json(
        { error: "Reset token has expired. Please request a new one." },
        { status: 400 },
      );
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Update password and clear reset token
    await adminDb.collection("users").doc(userData.uid).update({
      hashedPassword,
      passwordResetToken: null,
      passwordResetTokenExpiry: null,
      updatedAt: new Date().toISOString(),
    });

    // Invalidate all existing sessions for security
    const sessionsSnapshot = await adminDb
      .collection("sessions")
      .where("userId", "==", userData.uid)
      .get();

    const batch = adminDb.batch();
    sessionsSnapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });
    await batch.commit();

    return NextResponse.json(
      {
        message:
          "Password has been reset successfully. Please log in with your new password.",
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Password reset error:", error);
    return NextResponse.json(
      { error: "An error occurred. Please try again later." },
      { status: 500 },
    );
  }
}
