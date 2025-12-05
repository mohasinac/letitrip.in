/**
 * @fileoverview Service Module
 * @module src/app/api/lib/services/otp.service
 * @description This file contains service functions for otp operations
 * 
 * @created 2025-12-05
 * @author mohasinac
 * @see {@link https://mohasin.chinnapattan.com}
 */

import { adminDb } from "@/app/api/lib/firebase/config";
import { COLLECTIONS } from "@/constants/database";
import { logError } from "@/lib/firebase-error-logger";

/**
 * OTP Service - Backend Only
 * Generate and verify OTPs for email/phone verification
 *
 * Features:
 * - 6-digit OTP generation
 * - Time-based expiration (5 minutes default)
 * - Rate limiting (max 3 attempts, max 5 OTPs per hour)
 * - Secure verification with attempt tracking
 */

/**
 * O T P Verification interface
 * @interface OTPVerification
 */
export interface OTPVerification {
  /** Id */
  id?: string;
  /** User Id */
  userId: string;
  /** Type */
  type: "email" | "phone";
  /** Destination */
  destination: string; // email or phone number
  /** Otp */
  otp: string;
  /** Expires At */
  expiresAt: Date;
  /** Attempts */
  attempts: number;
  /** Max Attempts */
  maxAttempts: number;
  /** Verified */
  verified: boolean;
  /** Verified At */
  verifiedAt?: Date;
  /** Created At */
  createdAt: Date;
}

/**
 * SendOTPRequest interface
 * 
 * @interface
 * @description Defines the structure and contract for SendOTPRequest
 */
export interface SendOTPRequest {
  /** User Id */
  userId: string;
  /** Type */
  type: "email" | "phone";
  /** Destination */
  destination: string;
}

/**
 * VerifyOTPRequest interface
 * 
 * @interface
 * @description Defines the structure and contract for VerifyOTPRequest
 */
export interface VerifyOTPRequest {
  /** User Id */
  userId: string;
  /** Type */
  type: "email" | "phone";
  /** Destination */
  destination: string;
  /** Otp */
  otp: string;
}

/**
 * OTPService class
 * 
 * @class
 * @description Description of OTPService class functionality
 */
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
    /** User Id */
    userId: string,
    /** Type */
    type: "email" | "phone"
  ): Promise<boolean> {
    try {
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

      const snapshot = await adminDb
        .collection(COLLECTIONS.OTP_VERIFICATIONS)
        .where("userId", "==", userId)
        .where("type", "==", type)
        .where("createdAt", ">=", oneHourAgo)
        .get();

      return snapshot.size < this.MAX_OTP_PER_HOUR;
    } catch (error) {
      logError(error as Error, {
        /** Component */
        component: "OTPService.checkRateLimit",
        /** Metadata */
        metadata: { userId, type },
      });
      throw new Error("Failed to check rate limit");
    }
  }

  /**
   * Get active (non-expired, non-verified) OTP for destination
   */
  private async getActiveOTP(
    /** User Id */
    userId: string,
    /** Type */
    type: "email" | "phone",
    /** Destination */
    destination: string
  ): Promise<OTPVerification | null> {
    try {
      const now = new Date();

      const snapshot = await adminDb
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
        /** Id */
        id: doc.id,
        ...doc.data(),
        /** Created At */
        createdAt: doc.data().createdAt?.toDate(),
        /** Expires At */
        expiresAt: doc.data().expiresAt?.toDate(),
        /** Verified At */
        verifiedAt: doc.data().verifiedAt?.toDate(),
      } as OTPVerification;
    } catch (error) {
      logError(error as Error, {
        /** Component */
        component: "OTPService.getActiveOTP",
        /** Metadata */
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
    /** Request */
    request: SendOTPRequest
  ): Promise<{ id: string; expiresAt: Date }> {
    try {
      // Check rate limit
      const withinLimit = await this.checkRateLimit(
        request.userId,
        request.type
      );
      if (!withinLimit) {
        throw new Error("Too many OTP requests. Please try again later.");
      }

      // Check for existing active OTP
      const existingOTP = await this.getActiveOTP(
        request.userId,
        request.type,
        request.destination
      );

      if (existingOTP) {
        // Return existing OTP info without generating new one
        return {
          /** Id */
          id: existingOTP.id!,
          /** Expires At */
          expiresAt: existingOTP.expiresAt,
        };
      }

      // Generate new OTP
      const otp = this.generateOTP();
      const now = new Date();
      const expiresAt = new Date(
        now.getTime() + this.OTP_EXPIRY_MINUTES * 60 * 1000
      );

      const otpData: Omit<OTPVerification, "id"> = {
        /** User Id */
        userId: request.userId,
        /** Type */
        type: request.type,
        /** Destination */
        destination: request.destination,
        otp,
        expiresAt,
        /** Attempts */
        attempts: 0,
        /** Max Attempts */
        maxAttempts: this.MAX_ATTEMPTS,
        /** Verified */
        verified: false,
        /** Created At */
        createdAt: now,
      };

      // Save to database
      const docRef = await adminDb
        .collection(COLLECTIONS.OTP_VERIFICATIONS)
        .add(otpData);

      // TODO: Send OTP via email/SMS service
      // This will be implemented in Task 108 (SMS) and email templates
      console.log(
        `[OTP] Generated OTP for ${request.type} ${request.destination}: ${otp}`
      );

      return {
        /** Id */
        id: docRef.id,
        expiresAt,
      };
    } catch (error) {
      logError(error as Error, {
        /** Component */
        component: "OTPService.sendOTP",
        /** Metadata */
        metadata: request,
      });
      throw error;
    }
  }

  /**
   * Verify OTP entered by user
   */
  async verifyOTP(
    /** Request */
    request: VerifyOTPRequest
  ): Promise<{ success: boolean; message: string }> {
    try {
      // Get active OTP
      const otpDoc = await this.getActiveOTP(
        request.userId,
        request.type,
        request.destination
      );

      if (!otpDoc) {
        return {
          /** Success */
          success: false,
          /** Message */
          message: "No active OTP found. Please request a new one.",
        };
      }

      // Check if max attempts exceeded
      if (otpDoc.attempts >= otpDoc.maxAttempts) {
        return {
          /** Success */
          success: false,
          /** Message */
          message:
            "Maximum verification attempts exceeded. Please request a new OTP.",
        };
      }

      // Check if OTP is expired
      if (new Date() > otpDoc.expiresAt) {
        return {
          /** Success */
          success: false,
          /** Message */
          message: "OTP has expired. Please request a new one.",
        };
      }

      // Increment attempts
      await adminDb
        .collection(COLLECTIONS.OTP_VERIFICATIONS)
        .doc(otpDoc.id!)
        .update({
          /** Attempts */
          attempts: otpDoc.attempts + 1,
        });

      // Verify OTP
      if (request.otp !== otpDoc.otp) {
        const remainingAttempts = otpDoc.maxAttempts - (otpDoc.attempts + 1);
        return {
          /** Success */
          success: false,
          /** Message */
          message: `Invalid OTP. ${remainingAttempts} attempts remaining.`,
        };
      }

      // Mark as verified
      await adminDb
        .collection(COLLECTIONS.OTP_VERIFICATIONS)
        .doc(otpDoc.id!)
        .update({
          /** Verified */
          verified: true,
          /** Verified At */
          verifiedAt: new Date(),
        });

      // Update user's verification status
      await this.updateUserVerificationStatus(request.userId, request.type);

      return {
        /** Success */
        success: true,
        /** Message */
        message: "Verification successful!",
      };
    } catch (error) {
      logError(error as Error, {
        /** Component */
        component: "OTPService.verifyOTP",
        /** Metadata */
        metadata: request,
      });
      throw error;
    }
  }

  /**
   * Update user's emailVerified or phoneVerified status
   */
  private async updateUserVerificationStatus(
    /** User Id */
    userId: string,
    /** Type */
    type: "email" | "phone"
  ): Promise<void> {
    try {
      const field = type === "email" ? "emailVerified" : "phoneVerified";
      const verifiedAtField =
        type === "email" ? "emailVerifiedAt" : "phoneVerifiedAt";

      await adminDb
        .collection(COLLECTIONS.USERS)
        .doc(userId)
        .update({
          [field]: true,
          [verifiedAtField]: new Date(),
        });
    } catch (error) {
      logError(error as Error, {
        /** Component */
        component: "OTPService.updateUserVerificationStatus",
        /** Metadata */
        metadata: { userId, type },
      });
      // Don't throw - verification succeeded even if status update fails
    }
  }

  /**
   * Resend OTP (invalidates previous OTP and generates new one)
   */
  async resendOTP(
    /** Request */
    request: SendOTPRequest
  ): Promise<{ id: string; expiresAt: Date }> {
    try {
      // Invalidate any existing OTPs for this destination
      const existingOTP = await this.getActiveOTP(
        request.userId,
        request.type,
        request.destination
      );

      if (existingOTP && existingOTP.id) {
        await adminDb
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
        /** Component */
        component: "OTPService.resendOTP",
        /** Metadata */
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
      const userDoc = await adminDb
        .collection(COLLECTIONS.USERS)
        .doc(userId)
        .get();

      if (!userDoc.exists) {
        return false;
      }

      const field = type === "email" ? "emailVerified" : "phoneVerified";
      return userDoc.data()?.[field] === true;
    } catch (error) {
      logError(error as Error, {
        /** Component */
        component: "OTPService.isVerified",
        /** Metadata */
        metadata: { userId, type },
      });
      return false;
    }
  }
}

export const otpService = new OTPService();
