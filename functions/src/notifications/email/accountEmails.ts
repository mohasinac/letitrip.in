/**
 * Email Notifications - Account Emails
 *
 * Firebase Functions for sending account-related emails
 *
 * @status IMPLEMENTED
 * @task 1.5.6
 */

import * as admin from "firebase-admin";
import * as functions from "firebase-functions/v2";

/**
 * Send welcome email when user account is created
 * Note: Using Firestore trigger since Firebase Auth triggers in v2 require different setup
 */
export const sendWelcome = functions.firestore.onDocumentCreated(
  "users/{userId}",
  async (event) => {
    try {
      const userData = event.data?.data();
      if (!userData) return;
      if (!userData.email) return;

      const db = admin.firestore();

      // Check if user has emailPreferences set to receive account emails
      const emailPreferences = userData.emailPreferences;
      if (emailPreferences && emailPreferences.account === false) {
        functions.logger.info(
          `User ${event.params.userId} has account emails disabled`
        );
        return;
      }

      // Add to email queue
      await db.collection("emailQueue").add({
        to: userData.email,
        template: "welcome",
        category: "ACCOUNT",
        data: {
          userName: userData.displayName || userData.name || "User",
          userEmail: userData.email,
          verificationLink: userData.emailVerified
            ? null
            : `${process.env.NEXT_PUBLIC_BASE_URL}/verify-email?uid=${event.params.userId}`,
        },
        status: "pending",
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      functions.logger.info(
        `Welcome email queued for user ${event.params.userId}`
      );
    } catch (error) {
      functions.logger.error("Error sending welcome email:", error);
    }
  }
);

/**
 * Send email verification when user requests it
 */
export const sendVerification = functions.firestore.onDocumentCreated(
  "emailVerificationRequests/{requestId}",
  async (event) => {
    try {
      const requestData = event.data?.data();
      if (!requestData) return;

      const db = admin.firestore();

      // Get user data
      const userDoc = await db
        .collection("users")
        .doc(requestData.userId)
        .get();
      const userData = userDoc.data();

      if (!userData?.email) return;

      // Generate verification link
      const verificationLink = `${process.env.NEXT_PUBLIC_BASE_URL}/verify-email?token=${requestData.token}`;

      // Add to email queue
      await db.collection("emailQueue").add({
        to: userData.email,
        template: "email_verification",
        category: "ACCOUNT",
        data: {
          userName: userData.displayName || userData.name || "User",
          verificationLink,
        },
        status: "pending",
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      functions.logger.info(
        `Verification email queued for user ${requestData.userId}`
      );
    } catch (error) {
      functions.logger.error("Error sending verification email:", error);
    }
  }
);

/**
 * Send password reset email when user requests it
 */
export const sendPasswordReset = functions.firestore.onDocumentCreated(
  "passwordResetRequests/{requestId}",
  async (event) => {
    try {
      const requestData = event.data?.data();
      if (!requestData) return;

      const db = admin.firestore();

      // Get user data
      const userDoc = await db
        .collection("users")
        .doc(requestData.userId)
        .get();
      const userData = userDoc.data();

      if (!userData?.email) return;

      // Generate reset link
      const resetLink = `${process.env.NEXT_PUBLIC_BASE_URL}/reset-password?token=${requestData.token}`;

      // Calculate expiry in minutes
      const expiresInMs = requestData.expiresAt?.toMillis() - Date.now();
      const expiresIn = Math.floor(expiresInMs / (1000 * 60)); // Convert to minutes

      // Add to email queue
      await db.collection("emailQueue").add({
        to: userData.email,
        template: "password_reset",
        category: "ACCOUNT",
        data: {
          userName: userData.displayName || userData.name || "User",
          userEmail: userData.email,
          resetLink,
          expiresIn: expiresIn > 0 ? expiresIn : 60, // Default 60 minutes
        },
        status: "pending",
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      functions.logger.info(
        `Password reset email queued for user ${requestData.userId}`
      );
    } catch (error) {
      functions.logger.error("Error sending password reset email:", error);
    }
  }
);
