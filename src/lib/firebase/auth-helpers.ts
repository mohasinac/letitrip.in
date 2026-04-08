/**
 * Firebase Authentication Helper Functions
 *
 * Client-side authentication utilities using Firebase Auth SDK.
 * All credentials are securely managed through environment variables.
 *
 * Features:
 * - Email/Password authentication
 * - Google OAuth (no manual setup needed)
 * - Apple OAuth (no manual setup needed)
 * - Email verification
 * - Password reset
 * - Session ID-based tracking
 *
 * Benefits over NextAuth:
 * - No OAuth client ID/secret needed
 * - Built-in provider configuration
 * - Single authentication system
 * - Direct Firebase integration
 * - Session tracking in Firestore
 */

import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signInWithPhoneNumber,
  GoogleAuthProvider,
  OAuthProvider,
  PhoneAuthProvider,
  RecaptchaVerifier,
  sendEmailVerification,
  sendPasswordResetEmail,
  confirmPasswordReset,
  applyActionCode,
  updateProfile,
  EmailAuthProvider,
  reauthenticateWithCredential,
  User,
  UserCredential,
  signOut as firebaseSignOut,
  onAuthStateChanged as firebaseOnAuthStateChanged,
} from "firebase/auth";
import { auth } from "./config";
import { AuthenticationError, ApiError } from "@/lib/errors";
import { ERROR_MESSAGES, API_ENDPOINTS } from "@/constants";
import { logger } from "@/classes";
import { apiClient } from "@mohasinac/http";

/**
 * Helper: Create session via API call
 * Creates both Firebase session cookie AND tracks session in Firestore
 * Returns the session ID for client-side tracking
 */
async function createSession(idToken: string): Promise<string | null> {
  try {
    const data = await apiClient.post(API_ENDPOINTS.AUTH.CREATE_SESSION, {
      idToken,
    });
    return (data as { sessionId?: string }).sessionId || null;
  } catch (error) {
    logger.error("Session creation error", { error });
    // Don't throw - allow auth to succeed even if session creation fails
    return null;
  }
}

/**
 * Helper: Destroy session via API call
 * Clears both Firebase session cookie AND marks session as revoked in Firestore
 */
async function destroySession(): Promise<void> {
  try {
    await apiClient.delete(API_ENDPOINTS.AUTH.CREATE_SESSION);
  } catch (error) {
    logger.error("Session destruction error", { error });
  }
}

/**
 * Sign in with email and password
 * Creates session after successful authentication
 */
export async function signInWithEmail(
  email: string,
  password: string,
): Promise<UserCredential & { sessionId?: string }> {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password,
    );

    // Create session cookie and track in Firestore
    const idToken = await userCredential.user.getIdToken();
    const sessionId = await createSession(idToken);

    return { ...userCredential, sessionId: sessionId || undefined };
  } catch (error: any) {
    logger.error("Email sign in error", { error });
    throw new AuthenticationError(
      error.message || "Failed to sign in with email",
      { provider: "email", email },
    );
  }
}

/**
 * Sync Firebase client SDK auth state after server-side login.
 * Signs in via Firebase SDK only — does NOT create a new session cookie.
 * Use this when the server has already created the session (e.g. after server-side login).
 */
export async function syncFirebaseAuth(
  email: string,
  password: string,
): Promise<UserCredential> {
  try {
    return await signInWithEmailAndPassword(auth, email, password);
  } catch (error: any) {
    logger.error("Firebase auth sync error", { error });
    throw new AuthenticationError(
      error.message || "Failed to sync authentication state",
      { provider: "email", email },
    );
  }
}

/**
 * Register with email and password
 * Creates user profile, sends verification, and establishes session
 */
export async function registerWithEmail(
  email: string,
  password: string,
  displayName: string,
): Promise<UserCredential & { sessionId?: string }> {
  try {
    // Create user account
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password,
    );
    const user = userCredential.user;

    // Update profile
    await updateProfile(user, { displayName });

    // Send verification email
    await sendEmailVerification(user);

    // Create session cookie via API and track in Firestore
    const idToken = await user.getIdToken();
    const sessionId = await createSession(idToken);

    return { ...userCredential, sessionId: sessionId || undefined };
  } catch (error: any) {
    logger.error("Email registration error", { error });
    throw new AuthenticationError(
      error.message || "Failed to register with email",
      { provider: "email", email },
    );
  }
}

/**
 * Sign in with Google
 * No OAuth credentials needed - Firebase handles everything!
 * Creates session after successful authentication
 */
export async function signInWithGoogle(): Promise<
  UserCredential & { sessionId?: string }
> {
  try {
    const provider = new GoogleAuthProvider();

    // Optional: Request additional scopes
    provider.addScope("profile");
    provider.addScope("email");

    const userCredential = await signInWithPopup(auth, provider);

    // Create session cookie via API (profile will be created automatically if needed)
    const idToken = await userCredential.user.getIdToken();
    const sessionId = await createSession(idToken);

    return { ...userCredential, sessionId: sessionId || undefined };
  } catch (error: any) {
    logger.error("Google sign in error", { error });

    if (error.code === "auth/popup-closed-by-user") {
      throw new AuthenticationError("Sign-in cancelled", {
        provider: "google",
        cancelled: true,
      });
    }
    if (error.code === "auth/popup-blocked") {
      throw new AuthenticationError(
        "Popup blocked. Please allow popups for this site.",
        { provider: "google", popupBlocked: true },
      );
    }

    throw new AuthenticationError(
      error.message || ERROR_MESSAGES.AUTH.SIGN_IN_FAILED,
    );
  }
}

/**
 * Sign in with Apple
 * No OAuth credentials needed - Firebase handles everything!
 * Creates session after successful authentication
 */
export async function signInWithApple(): Promise<
  UserCredential & { sessionId?: string }
> {
  try {
    const provider = new OAuthProvider("apple.com");

    // Optional: Request additional scopes
    provider.addScope("email");
    provider.addScope("name");

    const userCredential = await signInWithPopup(auth, provider);

    // Create session cookie via API (profile will be created automatically if needed)
    const idToken = await userCredential.user.getIdToken();
    const sessionId = await createSession(idToken);

    return { ...userCredential, sessionId: sessionId || undefined };
  } catch (error: any) {
    logger.error("Apple sign in error", { error });

    if (error.code === "auth/popup-closed-by-user") {
      throw new AuthenticationError(ERROR_MESSAGES.AUTH.SIGN_IN_CANCELLED, {
        provider: "apple",
        cancelled: true,
      });
    }
    if (error.code === "auth/popup-blocked") {
      throw new AuthenticationError(ERROR_MESSAGES.AUTH.POPUP_BLOCKED, {
        provider: "apple",
        popupBlocked: true,
      });
    }

    throw new AuthenticationError(
      error.message || ERROR_MESSAGES.AUTH.SIGN_IN_FAILED,
    );
  }
}

/** Module-level reCAPTCHA verifier — only one active instance allowed by Firebase. */
let _phoneRecaptcha: RecaptchaVerifier | null = null;

/**
 * Send a phone OTP to the given number.
 * Manages the reCAPTCHA verifier lifecycle internally — no Firebase imports needed
 * in calling hooks/components.
 *
 * @returns verificationId — pass to `reauthenticateWithPhone` to confirm.
 */
export async function sendPhoneOtp(
  phoneNumber: string,
  recaptchaContainerId: string,
): Promise<string> {
  // Clear any stale verifier from a previous send attempt (e.g. Resend OTP).
  if (_phoneRecaptcha) {
    try {
      _phoneRecaptcha.clear();
    } catch {}
    _phoneRecaptcha = null;
  }

  try {
    const verifier = new RecaptchaVerifier(auth, recaptchaContainerId, {
      size: "invisible",
    });
    _phoneRecaptcha = verifier;

    const result = await signInWithPhoneNumber(auth, phoneNumber, verifier);
    return result.verificationId;
  } catch (error: any) {
    logger.error("Phone OTP send error", { error });
    throw new AuthenticationError(error.message || "Failed to send OTP", {
      provider: "phone",
      phoneNumber,
    });
  }
}

/**
 * Re-authenticate the currently signed-in user with a phone OTP.
 * Call this after `sendPhoneOtp` once the user has entered the 6-digit code.
 *
 * @param verificationId - returned from `sendPhoneOtp`
 * @param code - 6-digit OTP entered by the user
 */
export async function reauthenticateWithPhone(
  verificationId: string,
  code: string,
): Promise<void> {
  const user = auth.currentUser;
  if (!user) {
    throw new AuthenticationError("You must be signed in to verify.");
  }
  try {
    const credential = PhoneAuthProvider.credential(verificationId, code);
    await reauthenticateWithCredential(user, credential);
  } catch (error: any) {
    logger.error("Phone OTP confirm error", { error });
    throw error; // re-throw with original code so caller can inspect error.code
  }
}

/**
 * Send password reset email
 */
export async function resetPassword(email: string): Promise<void> {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error: any) {
    logger.error("Password reset error", { error, email });
    throw new ApiError(
      500,
      error.message || "Failed to send password reset email",
      { email },
    );
  }
}

/**
 * Send email verification
 */
export async function verifyEmail(user: User): Promise<void> {
  try {
    await sendEmailVerification(user);
  } catch (error: any) {
    logger.error("Email verification error", { error });
    throw new ApiError(
      500,
      error.message || "Failed to send verification email",
    );
  }
}

/**
 * Sign out
 * Destroys session in Firestore and clears cookies
 */
export async function signOut(): Promise<void> {
  try {
    // Destroy session first (while we still have auth context)
    await destroySession();

    // Then sign out from Firebase
    await firebaseSignOut(auth);
  } catch (error: any) {
    logger.error("Sign out error", { error });
    throw new ApiError(500, error.message || "Failed to sign out");
  }
}

/**
 * Re-authenticate user with current password
 * Required before sensitive operations like password change
 */
export async function reauthenticateWithPassword(
  email: string,
  currentPassword: string,
): Promise<void> {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new ApiError(401, "Not authenticated");
    }

    const credential = EmailAuthProvider.credential(email, currentPassword);
    await reauthenticateWithCredential(user, credential);
  } catch (error: any) {
    logger.error("Re-authentication error", { error });
    if (error.code === "auth/wrong-password") {
      throw new ApiError(401, "Current password is incorrect");
    }
    throw new ApiError(
      500,
      error.message || "Failed to verify current password",
    );
  }
}

/**
 * Confirm password reset with token from email
 */
export async function confirmPasswordResetWithToken(
  token: string,
  newPassword: string,
): Promise<void> {
  try {
    await confirmPasswordReset(auth, token, newPassword);
  } catch (error: any) {
    logger.error("Password reset confirmation error", { error });
    if (error.code === "auth/expired-action-code") {
      throw new ApiError(400, "Reset link has expired");
    }
    if (error.code === "auth/invalid-action-code") {
      throw new ApiError(400, "Invalid or already used reset link");
    }
    throw new ApiError(500, error.message || "Failed to reset password");
  }
}

/**
 * Apply email verification code
 */
export async function applyEmailVerificationCode(code: string): Promise<void> {
  try {
    await applyActionCode(auth, code);
  } catch (error: any) {
    logger.error("Email verification code error", { error });
    if (error.code === "auth/expired-action-code") {
      throw new ApiError(400, "Verification link has expired");
    }
    if (error.code === "auth/invalid-action-code") {
      throw new ApiError(400, "Invalid or already used verification link");
    }
    throw new ApiError(500, error.message || "Failed to verify email");
  }
}

/**
 * Get current user
 */
export function getCurrentUser(): User | null {
  if (!auth) return null;
  return auth.currentUser;
}

/**
 * Listen for auth state changes
 */
export function onAuthStateChanged(
  callback: (user: User | null) => void,
): () => void {
  if (!auth) {
    // Firebase client SDK not initialized (missing NEXT_PUBLIC env vars or SSR context).
    // Immediately signal "no user" and return a no-op unsubscribe.
    callback(null);
    return () => {};
  }
  return firebaseOnAuthStateChanged(auth, callback);
}
