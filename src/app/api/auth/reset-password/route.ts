/**
 * @fileoverview TypeScript Module
 * @module src/app/api/auth/reset-password/route
 * @description This file contains functionality related to route
 * 
 * @created 2025-12-05
 * @author Development Team
 */

import { authRateLimiter } from "@/app/api/lib/utils/rate-limiter";
import { COLLECTIONS } from "@/constants/database";
import {
  VALIDATION_MESSAGES,
  VALIDATION_RULES,
} from "@/constants/validation-messages";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { emailService } from "../../lib/email/email.service";
import { adminDb } from "../../lib/firebase/config";

const RESET_TOKEN_EXPIRY = 60 * 60 * 1000; // 1 hour in milliseconds

/**
 * Request password reset (POST /api/auth/reset-password)
 * Sends a reset link to the user's email
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
      /** Message */
      message:
        "If an account exists with this email, you will receive a password reset link shortly.",
    };

    // Get user from Firestore
    const userSnapshot = await adminDb
      .collection(COLLECTIONS.USERS)
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
    await adminDb.collection(COLLECTIONS.USERS).doc(userData.uid).update({
      /** Password Reset Token */
      passwordResetToken: resetTokenHash,
      /** Password Reset Token Expiry */
      passwordResetTokenExpiry: resetTokenExpiry.toISOString(),
      /** Updated At */
      updatedAt: new Date().toISOString(),
    });

    // Generate reset link
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://letitrip.in";
    const resetLink = `${baseUrl}/reset-password?token=${resetToken}&email=${encodeURIComponent(
      email.toLowerCase(),
    )}`;

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
/**
 * Performs p u t operation
 *
 * @param {NextRequest} req - The req
 *
 * @returns {Promise<any>} Promise resolving to put result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * PUT(req);
 */

/**
 * Performs p u t operation
 *
 * @param {NextRequest} req - The req
 *
 * @returns {Promise<any>} Promise resolving to put result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * PUT(req);
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
    if (newPassword.length < VALIDATION_RULES.PASSWORD.MIN_LENGTH) {
      return NextResponse.json(
        { error: VALIDATION_MESSAGES.PASSWORD.TOO_SHORT },
        { status: 400 },
      );
    }

    // Hash the provided token to compare with stored hash
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

    // Get user from Firestore
    const userSnapshot = await adminDb
      .collection(COLLECTIONS.USERS)
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
    await adminDb.collection(COLLECTIONS.USERS).doc(userData.uid).update({
      hashedPassword,
      /** Password Reset Token */
      passwordResetToken: null,
      /** Password Reset Token Expiry */
      passwordResetTokenExpiry: null,
      /** Updated At */
      updatedAt: new Date().toISOString(),
    });

    // Invalidate all existing sessions for security
    const sessionsSnapshot = await adminDb
      .collection(COLLECTIONS.SESSIONS)
      .where("userId", "==", userData.uid)
      .get();

    const batch = adminDb.batch();
    sessionsSnapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });
    await batch.commit();

    return NextResponse.json(
      {
        /** Message */
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
