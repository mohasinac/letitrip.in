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
import { UserRole } from "@/types/auth";
import { AuthenticationError, ApiError } from "@/lib/errors";

/**
 * Helper: Create session via API call
 * Creates both Firebase session cookie AND tracks session in Firestore
 * Returns the session ID for client-side tracking
 */
async function createSession(idToken: string): Promise<string | null> {
  try {
    const response = await fetch("/api/auth/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken }),
      credentials: "include", // Important for cookies
    });

    if (!response.ok) {
      const error = await response.json();
      console.error("Session creation failed:", error);
      throw new Error(error.message || "Failed to create session");
    }

    const data = await response.json();
    return data.sessionId || null;
  } catch (error) {
    console.error("Session creation error:", error);
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
    await fetch("/api/auth/session", {
      method: "DELETE",
      credentials: "include",
    });
  } catch (error) {
    console.error("Session destruction error:", error);
  }
}

/**
 * Get default role based on email
 * Special case: admin@letitrip.in gets admin role
 */
function getDefaultRole(email: string | null): UserRole {
  if (email === "admin@letitrip.in") {
    return "admin";
  }
  return "user";
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
    console.error("Email sign in error:", error);
    throw new AuthenticationError(
      error.message || "Failed to sign in with email",
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
    console.error("Email registration error:", error);
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
    console.error("Google sign in error:", error);

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

    throw new Error(error.message || "Failed to sign in with Google");
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
    console.error("Apple sign in error:", error);

    if (error.code === "auth/popup-closed-by-user") {
      throw new Error("Sign-in cancelled");
    }
    if (error.code === "auth/popup-blocked") {
      throw new Error(
        "Pop-up blocked by browser. Please allow pop-ups and try again.",
      );
    }

    throw new Error(error.message || "Failed to sign in with Apple");
  }
}

/**
 * Sign in with phone number
 * Requires reCAPTCHA verification
 */
export async function signInWithPhone(
  phoneNumber: string,
  recaptchaContainerId: string,
): Promise<any> {
  try {
    const recaptchaVerifier = new RecaptchaVerifier(
      auth,
      recaptchaContainerId,
      {
        size: "invisible",
      },
    );

    const confirmationResult = await signInWithPhoneNumber(
      auth,
      phoneNumber,
      recaptchaVerifier,
    );
    return confirmationResult;
  } catch (error: any) {
    console.error("Phone sign in error:", error);
    throw new AuthenticationError(
      error.message || "Failed to sign in with phone",
      { provider: "phone", phoneNumber },
    );
  }
}

/**
 * Send password reset email
 */
export async function resetPassword(email: string): Promise<void> {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error: any) {
    console.error("Password reset error:", error);
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
    console.error("Email verification error:", error);
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
    console.error("Sign out error:", error);
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
    console.error("Re-authentication error:", error);
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
    console.error("Password reset error:", error);
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
    console.error("Email verification error:", error);
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
  return auth.currentUser;
}

/**
 * Listen for auth state changes
 */
export function onAuthStateChanged(
  callback: (user: User | null) => void,
): () => void {
  return firebaseOnAuthStateChanged(auth, callback);
}
