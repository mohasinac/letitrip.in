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
 *
 * Benefits over NextAuth:
 * - No OAuth client ID/secret needed
 * - Built-in provider configuration
 * - Single authentication system
 * - Direct Firebase integration
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
  updateProfile,
  User,
  UserCredential,
  signOut as firebaseSignOut,
  onAuthStateChanged as firebaseOnAuthStateChanged,
} from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "./config";
import { UserRole } from "@/types/auth";
import { USER_COLLECTION } from "@/db/schema/users";

/**
 * Helper: Create session cookie via API call
 * (Session cookies must be created server-side)
 */
async function createSession(idToken: string): Promise<void> {
  try {
    const response = await fetch("/api/auth/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken }),
    });

    if (!response.ok) {
      throw new Error("Failed to create session");
    }
  } catch (error) {
    console.error("Session creation error:", error);
    // Don't throw - allow auth to succeed even if session creation fails
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
 */
export async function signInWithEmail(
  email: string,
  password: string,
): Promise<UserCredential> {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password,
    );
    return userCredential;
  } catch (error: any) {
    console.error("Email sign in error:", error);
    throw new Error(error.message || "Failed to sign in with email");
  }
}

/**
 * Register with email and password
 */
export async function registerWithEmail(
  email: string,
  password: string,
  displayName: string,
): Promise<UserCredential> {
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

    // Create Firestore user document with appropriate role
    await createUserProfile(user, { role: getDefaultRole(email) });

    // Send verification email
    await sendEmailVerification(user);

    // Create session cookie via API
    const idToken = await user.getIdToken();
    await createSession(idToken);

    return userCredential;
  } catch (error: any) {
    console.error("Email registration error:", error);
    throw new Error(error.message || "Failed to register with email");
  }
}

/**
 * Sign in with Google
 * No OAuth credentials needed - Firebase handles everything!
 */
export async function signInWithGoogle(): Promise<UserCredential> {
  try {
    const provider = new GoogleAuthProvider();

    // Optional: Request additional scopes
    provider.addScope("profile");
    provider.addScope("email");

    const userCredential = await signInWithPopup(auth, provider);

    // Create session cookie via API
    const idToken = await userCredential.user.getIdToken();
    await createSession(idToken);

    // Create/update user profile in Firestore with appropriate role
    await createUserProfile(userCredential.user, {
      role: getDefaultRole(userCredential.user.email),
    });

    return userCredential;
  } catch (error: any) {
    console.error("Google sign in error:", error);

    if (error.code === "auth/popup-closed-by-user") {
      throw new Error("Sign-in cancelled");
    }
    if (error.code === "auth/popup-blocked") {
      throw new Error(
        "Pop-up blocked by browser. Please allow pop-ups and try again.",
      );
    }

    throw new Error(error.message || "Failed to sign in with Google");
  }
}

/**
 * Sign in with Apple
 * No OAuth credentials needed - Firebase handles everything!
 */
export async function signInWithApple(): Promise<UserCredential> {
  try {
    const provider = new OAuthProvider("apple.com");

    // Optional: Request additional scopes
    provider.addScope("email");
    provider.addScope("name");

    const userCredential = await signInWithPopup(auth, provider);

    // Create session cookie via API
    const idToken = await userCredential.user.getIdToken();
    await createSession(idToken);

    // Create/update user profile in Firestore with appropriate role
    await createUserProfile(userCredential.user, {
      role: getDefaultRole(userCredential.user.email),
    });

    return userCredential;
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
    throw new Error(error.message || "Failed to sign in with phone");
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
    throw new Error(error.message || "Failed to send password reset email");
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
    throw new Error(error.message || "Failed to send verification email");
  }
}

/**
 * Sign out
 */
export async function signOut(): Promise<void> {
  try {
    await firebaseSignOut(auth);
  } catch (error: any) {
    console.error("Sign out error:", error);
    throw new Error(error.message || "Failed to sign out");
  }
}

/**
 * Create or update user profile in Firestore
 */
async function createUserProfile(
  user: User,
  additionalData: { role: UserRole },
): Promise<void> {
  const userRef = doc(db, USER_COLLECTION, user.uid);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    // Create new user profile
    try {
      await setDoc(userRef, {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        phoneNumber: null,
        phoneVerified: false,
        emailVerified: user.emailVerified,
        role: additionalData.role,
        disabled: false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error("Error creating user profile:", error);
      throw error;
    }
  } else {
    // Update last sign in
    try {
      await setDoc(
        userRef,
        {
          updatedAt: serverTimestamp(),
          emailVerified: user.emailVerified,
        },
        { merge: true },
      );
    } catch (error) {
      console.error("Error updating user profile:", error);
    }
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
