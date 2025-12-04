import { db } from "@/lib/firebase/firebase-admin";
import { COLLECTIONS } from "@/constants/database";
import { logError } from "@/lib/firebase-error-logger";

/**
 * OTP Service - Generate and verify OTPs for email/phone verification
 *
 * Features:
 * - 6-digit OTP generation
 * - Time-based expiration (5 minutes default)
 * - Rate limiting (max 3 attempts, max 5 OTPs per hour)
 * - Secure verification with attempt tracking
 */

export interface OTPVerification {
  id?: string;
  userId: string;
  type: "email" | "phone";
  destination: string; // email or phone number
  otp: string;
  expiresAt: Date;
  attempts: number;
  maxAttempts: number;
  verified: boolean;
  verifiedAt?: Date;
  createdAt: Date;
}

export interface SendOTPRequest {
  userId: string;
  type: "email" | "phone";
  destination: string;
}

export interface VerifyOTPRequest {
  userId: string;
  type: "email" | "phone";
  destination: string;
  otp: string;
}

class OTPService {
  private readonly OTP_LENGTH = 6;
  private readonly OTP_EXPIRY_MINUTES = 5;
  private readonly MAX_ATTEMPTS = 3;
  private readonly MAX_OTP_PER_HOUR = 5;

  /**
   * Generate a random 6-digit OTP
   */
  private generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  /**
   * Check if user has exceeded rate limits
   */
  private async checkRateLimit(
    userId: string,
    type: "email" | "phone",
  ): Promise<boolean> {
    try {
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

      const snapshot = await db
        .collection(COLLECTIONS.OTP_VERIFICATIONS)
        .where("userId", "==", userId)
        .where("type", "==", type)
        .where("createdAt", ">=", oneHourAgo)
        .get();

      return snapshot.size < this.MAX_OTP_PER_HOUR;
    } catch (error) {
      logError(error as Error, {
        component: "OTPService.checkRateLimit",
        metadata: { userId, type },
      });
      throw new Error("Failed to check rate limit");
    }
  }

  /**
   * Get active (non-expired, non-verified) OTP for destination
   */
  private async getActiveOTP(
    userId: string,
    type: "email" | "phone",
    destination: string,
  ): Promise<OTPVerification | null> {
    try {
      const now = new Date();

      const snapshot = await db
        .collection(COLLECTIONS.OTP_VERIFICATIONS)
        .where("userId", "==", userId)
        .where("type", "==", type)
        .where("destination", "==", destination)
        .where("verified", "==", false)
        .where("expiresAt", ">", now)
        .orderBy("expiresAt", "desc")
        .limit(1)
        .get();

      if (snapshot.empty) {
        return null;
      }

      const doc = snapshot.docs[0];
      return {
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        expiresAt: doc.data().expiresAt?.toDate(),
        verifiedAt: doc.data().verifiedAt?.toDate(),
      } as OTPVerification;
    } catch (error) {
      logError(error as Error, {
        component: "OTPService.getActiveOTP",
        metadata: { userId, type, destination },
      });
      return null;
    }
  }

  /**
   * Send OTP to user's email or phone
   * Returns the OTP ID for verification
   */
  async sendOTP(
    request: SendOTPRequest,
  ): Promise<{ id: string; expiresAt: Date }> {
    try {
      // Check rate limit
      const withinLimit = await this.checkRateLimit(
        request.userId,
        request.type,
      );
      if (!withinLimit) {
        throw new Error("Too many OTP requests. Please try again later.");
      }

      // Check for existing active OTP
      const existingOTP = await this.getActiveOTP(
        request.userId,
        request.type,
        request.destination,
      );

      if (existingOTP) {
        // Return existing OTP info without generating new one
        return {
          id: existingOTP.id!,
          expiresAt: existingOTP.expiresAt,
        };
      }

      // Generate new OTP
      const otp = this.generateOTP();
      const now = new Date();
      const expiresAt = new Date(
        now.getTime() + this.OTP_EXPIRY_MINUTES * 60 * 1000,
      );

      const otpData: Omit<OTPVerification, "id"> = {
        userId: request.userId,
        type: request.type,
        destination: request.destination,
        otp,
        expiresAt,
        attempts: 0,
        maxAttempts: this.MAX_ATTEMPTS,
        verified: false,
        createdAt: now,
      };

      // Save to database
      const docRef = await db
        .collection(COLLECTIONS.OTP_VERIFICATIONS)
        .add(otpData);

      // TODO: Send OTP via email/SMS service
      // This will be implemented in Task 108 (SMS) and email templates
      console.log(
        `[OTP] Generated OTP for ${request.type} ${request.destination}: ${otp}`,
      );

      return {
        id: docRef.id,
        expiresAt,
      };
    } catch (error) {
      logError(error as Error, {
        component: "OTPService.sendOTP",
        metadata: request,
      });
      throw error;
    }
  }

  /**
   * Verify OTP entered by user
   */
  async verifyOTP(
    request: VerifyOTPRequest,
  ): Promise<{ success: boolean; message: string }> {
    try {
      // Get active OTP
      const otpDoc = await this.getActiveOTP(
        request.userId,
        request.type,
        request.destination,
      );

      if (!otpDoc) {
        return {
          success: false,
          message: "No active OTP found. Please request a new one.",
        };
      }

      // Check if max attempts exceeded
      if (otpDoc.attempts >= otpDoc.maxAttempts) {
        return {
          success: false,
          message:
            "Maximum verification attempts exceeded. Please request a new OTP.",
        };
      }

      // Check if OTP is expired
      if (new Date() > otpDoc.expiresAt) {
        return {
          success: false,
          message: "OTP has expired. Please request a new one.",
        };
      }

      // Increment attempts
      await db
        .collection(COLLECTIONS.OTP_VERIFICATIONS)
        .doc(otpDoc.id!)
        .update({
          attempts: otpDoc.attempts + 1,
        });

      // Verify OTP
      if (request.otp !== otpDoc.otp) {
        const remainingAttempts = otpDoc.maxAttempts - (otpDoc.attempts + 1);
        return {
          success: false,
          message: `Invalid OTP. ${remainingAttempts} attempts remaining.`,
        };
      }

      // Mark as verified
      await db
        .collection(COLLECTIONS.OTP_VERIFICATIONS)
        .doc(otpDoc.id!)
        .update({
          verified: true,
          verifiedAt: new Date(),
        });

      // Update user's verification status
      await this.updateUserVerificationStatus(request.userId, request.type);

      return {
        success: true,
        message: "Verification successful!",
      };
    } catch (error) {
      logError(error as Error, {
        component: "OTPService.verifyOTP",
        metadata: request,
      });
      throw error;
    }
  }

  /**
   * Update user's emailVerified or phoneVerified status
   */
  private async updateUserVerificationStatus(
    userId: string,
    type: "email" | "phone",
  ): Promise<void> {
    try {
      const field = type === "email" ? "emailVerified" : "phoneVerified";
      const verifiedAtField =
        type === "email" ? "emailVerifiedAt" : "phoneVerifiedAt";

      await db
        .collection(COLLECTIONS.USERS)
        .doc(userId)
        .update({
          [field]: true,
          [verifiedAtField]: new Date(),
        });
    } catch (error) {
      logError(error as Error, {
        component: "OTPService.updateUserVerificationStatus",
        metadata: { userId, type },
      });
      // Don't throw - verification succeeded even if status update fails
    }
  }

  /**
   * Resend OTP (invalidates previous OTP and generates new one)
   */
  async resendOTP(
    request: SendOTPRequest,
  ): Promise<{ id: string; expiresAt: Date }> {
    try {
      // Invalidate any existing OTPs for this destination
      const existingOTP = await this.getActiveOTP(
        request.userId,
        request.type,
        request.destination,
      );

      if (existingOTP && existingOTP.id) {
        await db
          .collection(COLLECTIONS.OTP_VERIFICATIONS)
          .doc(existingOTP.id)
          .update({
            verified: true, // Mark as used to prevent reuse
          });
      }

      // Send new OTP
      return await this.sendOTP(request);
    } catch (error) {
      logError(error as Error, {
        component: "OTPService.resendOTP",
        metadata: request,
      });
      throw error;
    }
  }

  /**
   * Check if user has verified email/phone
   */
  async isVerified(userId: string, type: "email" | "phone"): Promise<boolean> {
    try {
      const userDoc = await db.collection(COLLECTIONS.USERS).doc(userId).get();

      if (!userDoc.exists) {
        return false;
      }

      const field = type === "email" ? "emailVerified" : "phoneVerified";
      return userDoc.data()?.[field] === true;
    } catch (error) {
      logError(error as Error, {
        component: "OTPService.isVerified",
        metadata: { userId, type },
      });
      return false;
    }
  }
}

export const otpService = new OTPService();
