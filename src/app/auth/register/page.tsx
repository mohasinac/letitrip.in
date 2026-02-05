/**
 * Registration Page
 *
 * Refactored to use API client, hooks, and reusable components
 */

"use client";

import { useState, FormEvent, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button, Alert, Checkbox } from "@/components";
import { FormField } from "@/components/FormField";
import { PasswordStrengthIndicator } from "@/components/PasswordStrengthIndicator";
import {
  registerWithEmail,
  signInWithGoogle,
  signInWithApple,
  onAuthStateChanged,
} from "@/lib/firebase/auth-helpers";
import { ERROR_MESSAGES, SUCCESS_MESSAGES, ROUTES } from "@/constants";

export default function RegisterPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    registrationType: "email" as "email" | "phone",
    email: "",
    phoneNumber: "",
    password: "",
    confirmPassword: "",
    displayName: "",
    acceptTerms: false,
  });
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Listen for auth state changes (auto-login after registration)
  useEffect(() => {
    const unsubscribe = onAuthStateChanged((user) => {
      if (user && isLoading) {
        // User registered and logged in successfully
        setMessage({
          type: "success",
          text: SUCCESS_MESSAGES.AUTH.REGISTER_SUCCESS,
        });
        setTimeout(() => router.push(ROUTES.USER.PROFILE), 1000);
      }
    });
    return () => unsubscribe();
  }, [isLoading, router]);

  const handleBlur = (field: string) => () => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setMessage(null);

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setMessage({ type: "error", text: "Passwords do not match" });
      return;
    }

    if (formData.password.length < 8) {
      setMessage({
        type: "error",
        text: ERROR_MESSAGES.VALIDATION.PASSWORD_TOO_SHORT,
      });
      return;
    }

    if (!formData.acceptTerms) {
      setMessage({
        type: "error",
        text: "You must accept the terms and conditions",
      });
      return;
    }

    if (formData.registrationType === "email" && !formData.email) {
      setMessage({
        type: "error",
        text: ERROR_MESSAGES.VALIDATION.REQUIRED_FIELD,
      });
      return;
    }

    if (formData.registrationType === "phone" && !formData.phoneNumber) {
      setMessage({
        type: "error",
        text: ERROR_MESSAGES.VALIDATION.REQUIRED_FIELD,
      });
      return;
    }

    // Register user with Firebase Auth
    setIsLoading(true);
    try {
      if (formData.registrationType === "email") {
        await registerWithEmail(
          formData.email,
          formData.password,
          formData.displayName || "User",
        );
        // Auth state listener will handle redirect
      } else {
        setMessage({
          type: "error",
          text: "Phone registration coming soon. Please use email.",
        });
        setIsLoading(false);
      }
    } catch (error: any) {
      setMessage({
        type: "error",
        text: error.message || ERROR_MESSAGES.GENERIC.INTERNAL_ERROR,
      });
      setIsLoading(false);
    }
  };

  const handleGoogleRegister = async () => {
    setIsLoading(true);
    setMessage(null);
    try {
      await signInWithGoogle();
      // Auth state listener will handle redirect
      // User profile created automatically with "user" role
    } catch (error: any) {
      setMessage({
        type: "error",
        text: error.message || "Google registration failed",
      });
      setIsLoading(false);
    }
  };

  const handleAppleRegister = async () => {
    setIsLoading(true);
    setMessage(null);
    try {
      await signInWithApple();
      // Auth state listener will handle redirect
      // User profile created automatically with "user" role
    } catch (error: any) {
      setMessage({
        type: "error",
        text: error.message || "Apple registration failed",
      });
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-950">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div>
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-white text-2xl font-bold">L</span>
            </div>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            Or{" "}
            <Link
              href={ROUTES.AUTH.LOGIN}
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              sign in to your account
            </Link>
          </p>
        </div>

        {/* Alert Messages */}
        {message && (
          <Alert variant={message.type} onClose={() => setMessage(null)}>
            {message.text}
          </Alert>
        )}

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div className="space-y-4">
            {/* Registration Type Toggle */}
            <div className="flex gap-2 p-1 bg-gray-200 dark:bg-gray-800 rounded-lg">
              <button
                type="button"
                onClick={() =>
                  setFormData({ ...formData, registrationType: "email" })
                }
                className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
                  formData.registrationType === "email"
                    ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow"
                    : "text-gray-600 dark:text-gray-400"
                }`}
              >
                Email
              </button>
              <button
                type="button"
                onClick={() =>
                  setFormData({ ...formData, registrationType: "phone" })
                }
                className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
                  formData.registrationType === "phone"
                    ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow"
                    : "text-gray-600 dark:text-gray-400"
                }`}
              >
                Phone
              </button>
            </div>

            {/* Display Name */}
            <FormField
              label="Display Name (Optional)"
              name="displayName"
              type="text"
              value={formData.displayName}
              onChange={(value) =>
                setFormData({ ...formData, displayName: value })
              }
              onBlur={handleBlur("displayName")}
              touched={touched.displayName}
              disabled={isLoading}
              placeholder="John Doe"
            />

            {/* Email or Phone */}
            {formData.registrationType === "email" ? (
              <FormField
                label="Email Address"
                name="email"
                type="email"
                value={formData.email}
                onChange={(value) => setFormData({ ...formData, email: value })}
                onBlur={handleBlur("email")}
                touched={touched.email}
                disabled={isLoading}
                placeholder="your@email.com"
                required
              />
            ) : (
              <FormField
                label="Phone Number"
                name="phoneNumber"
                type="tel"
                value={formData.phoneNumber}
                onChange={(value) =>
                  setFormData({ ...formData, phoneNumber: value })
                }
                onBlur={handleBlur("phoneNumber")}
                touched={touched.phoneNumber}
                disabled={isLoading}
                placeholder="+1234567890"
                required
              />
            )}

            {/* Password */}
            <FormField
              label="Password"
              name="password"
              type="password"
              value={formData.password}
              onChange={(value) =>
                setFormData({ ...formData, password: value })
              }
              onBlur={handleBlur("password")}
              touched={touched.password}
              disabled={isLoading}
              placeholder="••••••••"
              required
            />

            {formData.password && (
              <PasswordStrengthIndicator password={formData.password} />
            )}

            {/* Confirm Password */}
            <FormField
              label="Confirm Password"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={(value) =>
                setFormData({ ...formData, confirmPassword: value })
              }
              onBlur={handleBlur("confirmPassword")}
              touched={touched.confirmPassword}
              error={
                formData.confirmPassword &&
                formData.password !== formData.confirmPassword
                  ? "Passwords do not match"
                  : undefined
              }
              disabled={isLoading}
              placeholder="••••••••"
              required
            />

            {/* Terms and Conditions */}
            <div className="flex items-start">
              <Checkbox
                id="acceptTerms"
                checked={formData.acceptTerms}
                onChange={(e) =>
                  setFormData({ ...formData, acceptTerms: e.target.checked })
                }
              />
              <label
                htmlFor="acceptTerms"
                className="ml-2 text-sm text-gray-600 dark:text-gray-400"
              >
                I agree to the{" "}
                <Link
                  href="/terms"
                  className="text-blue-600 hover:text-blue-500"
                >
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link
                  href="/privacy"
                  className="text-blue-600 hover:text-blue-500"
                >
                  Privacy Policy
                </Link>
              </label>
            </div>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full"
            disabled={isLoading || !formData.acceptTerms}
          >
            {isLoading ? "Creating account..." : "Create account"}
          </Button>
        </form>

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300 dark:border-gray-700"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-gray-50 dark:bg-gray-950 text-gray-500">
              Or continue with
            </span>
          </div>
        </div>

        {/* Social Registration Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={handleGoogleRegister}
            disabled={isLoading}
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Google
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={handleAppleRegister}
            disabled={isLoading}
          >
            <svg
              className="w-5 h-5 mr-2"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
            </svg>
            Apple
          </Button>
        </div>
      </div>
    </div>
  );
}
