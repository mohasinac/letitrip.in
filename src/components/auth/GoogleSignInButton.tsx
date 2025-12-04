"use client";

import { useAuth } from "@/contexts/AuthContext";
import { logError } from "@/lib/firebase-error-logger";
import { getApps, initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { toast } from "sonner";

// Initialize Firebase client for Google Auth popup
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
};

// Initialize Firebase app only if not already initialized
const app =
  getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);

interface GoogleSignInButtonProps {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
  className?: string;
  variant?: "full" | "icon";
  disabled?: boolean;
  redirectPath?: string;
}

// Inner component that uses useSearchParams
function GoogleSignInButtonInner({
  onSuccess,
  onError,
  className = "",
  variant = "full",
  disabled = false,
  redirectPath,
}: GoogleSignInButtonProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { loginWithGoogle } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    if (loading || disabled) return;

    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      provider.addScope("email");
      provider.addScope("profile");

      // Open Google sign-in popup
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Get the ID token to verify on backend
      const idToken = await user.getIdToken();

      // Send to our backend to create/update user and session
      const response = await loginWithGoogle(idToken, {
        displayName: user.displayName || undefined,
        email: user.email || undefined,
        photoURL: user.photoURL || undefined,
      });

      if (response.isNewUser) {
        toast.success("Welcome! Your account has been created.");
      } else {
        toast.success("Welcome back!");
      }

      // Redirect to specified URL or home
      const redirect = redirectPath || searchParams.get("redirect") || "/";

      if (onSuccess) {
        onSuccess();
      }

      // Small delay to ensure state is updated before redirect
      setTimeout(() => {
        router.replace(redirect);
      }, 100);
    } catch (error: any) {
      logError(error as Error, {
        component: "GoogleSignInButton.handleGoogleSignIn",
        redirect,
      });

      // Handle specific errors
      let errorMessage = "Failed to sign in with Google";
      if (error.code === "auth/popup-closed-by-user") {
        errorMessage = "Sign-in cancelled";
      } else if (error.code === "auth/popup-blocked") {
        errorMessage = "Popup was blocked. Please allow popups for this site.";
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast.error(errorMessage);

      if (onError) {
        onError(error);
      }
    } finally {
      setLoading(false);
    }
  };

  if (variant === "icon") {
    return (
      <button
        type="button"
        onClick={handleGoogleSignIn}
        disabled={loading || disabled}
        className={`flex items-center justify-center p-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
        aria-label="Sign in with Google"
      >
        {loading ? (
          <div className="w-5 h-5 border-2 border-gray-300 dark:border-gray-500 border-t-gray-600 dark:border-t-gray-200 rounded-full animate-spin" />
        ) : (
          <GoogleIcon className="w-5 h-5" />
        )}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleGoogleSignIn}
      disabled={loading || disabled}
      className={`w-full min-h-[48px] flex items-center justify-center gap-3 py-3 px-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-medium hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
      {loading ? (
        <>
          <div className="w-5 h-5 border-2 border-gray-300 dark:border-gray-500 border-t-gray-600 dark:border-t-gray-200 rounded-full animate-spin" />
          <span>Signing in...</span>
        </>
      ) : (
        <>
          <GoogleIcon className="w-5 h-5" />
          <span>Continue with Google</span>
        </>
      )}
    </button>
  );
}

// Fallback component for loading state
function GoogleSignInButtonFallback({
  className = "",
  variant = "full",
}: Pick<GoogleSignInButtonProps, "className" | "variant">) {
  if (variant === "icon") {
    return (
      <button
        type="button"
        disabled
        className={`flex items-center justify-center p-3 border border-gray-300 dark:border-gray-600 rounded-lg opacity-50 cursor-not-allowed ${className}`}
        aria-label="Sign in with Google"
      >
        <div className="w-5 h-5 border-2 border-gray-300 dark:border-gray-500 border-t-gray-600 dark:border-t-gray-200 rounded-full animate-spin" />
      </button>
    );
  }

  return (
    <button
      type="button"
      disabled
      className={`w-full min-h-[48px] flex items-center justify-center gap-3 py-3 px-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-medium opacity-50 cursor-not-allowed ${className}`}
    >
      <div className="w-5 h-5 border-2 border-gray-300 dark:border-gray-500 border-t-gray-600 dark:border-t-gray-200 rounded-full animate-spin" />
      <span>Loading...</span>
    </button>
  );
}

// Exported component wrapped in Suspense
export function GoogleSignInButton(props: GoogleSignInButtonProps) {
  return (
    <Suspense
      fallback={
        <GoogleSignInButtonFallback
          className={props.className}
          variant={props.variant}
        />
      }
    >
      <GoogleSignInButtonInner {...props} />
    </Suspense>
  );
}

// Google "G" logo SVG
function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}
