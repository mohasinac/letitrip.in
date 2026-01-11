"use client";

import { GoogleSignInButton } from "@/components/auth/GoogleSignInButton";
import { FormCheckbox } from "@/components/forms/FormCheckbox";
import { FormField } from "@/components/forms/FormField";
import { FormInput } from "@/components/forms/FormInput";
import { FormPhoneInput } from "@/components/forms/FormPhoneInput";
import { COMPANY_NAME } from "@/constants/navigation";
import { useLoginRegister } from "@/contexts/LoginRegisterContext";
import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

/**
 * RegisterPage Component
 * Pure presentational component for user registration
 *
 * State is managed via:
 * - useLoginRegister context: form data, validation, submission
 * - Local state: acceptTerms, redirect logic
 */
export default function RegisterPage() {
  const router = useRouter();
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [phone, setPhone] = useState("");
  const [phoneCountryCode, setPhoneCountryCode] = useState("+91");

  // Get all register form state from context
  const {
    registerForm,
    registerPassword,
    registerLoading,
    registerError,
    handleRegisterSubmit,
  } = useLoginRegister();

  // Handle registration with terms validation
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!acceptTerms) {
      registerForm.setFieldError(
        "acceptTerms" as any,
        "Please accept the Terms of Service and Privacy Policy"
      );
      return;
    }

    await handleRegisterSubmit(e);

    // Redirect after successful registration
    if (!registerError) {
      setTimeout(() => {
        router.push("/");
      }, 100);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 px-4 py-12">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block mb-4">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
              {COMPANY_NAME}
            </h1>
          </Link>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Create Your Account
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Join us and start shopping today
          </p>
        </div>

        {/* Register Form */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
          {(registerForm.errors.acceptTerms || registerError) && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-600 dark:text-red-400">
                {registerForm.errors.acceptTerms ||
                  registerError ||
                  "Registration failed. Please try again."}
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name */}
            <FormField
              label="Full Name"
              required
              error={registerForm.errors.name}
            >
              <FormInput
                type="text"
                name="name"
                value={registerForm.formData.name}
                onChange={registerForm.handleChange}
                onBlur={registerForm.handleBlur}
                placeholder="John Doe"
                autoComplete="name"
              />
            </FormField>

            {/* Email */}
            <FormField
              label="Email Address"
              required
              error={registerForm.errors.email}
            >
              <FormInput
                type="email"
                name="email"
                value={registerForm.formData.email}
                onChange={registerForm.handleChange}
                onBlur={registerForm.handleBlur}
                placeholder="you@example.com"
                autoComplete="email"
              />
            </FormField>

            {/* Phone Number (Optional) */}
            <FormField
              label="Phone Number (Optional)"
              hint="For order updates and delivery coordination"
            >
              <FormPhoneInput
                value={phone}
                countryCode={phoneCountryCode}
                onChange={(phoneValue, countryCode) => {
                  setPhone(phoneValue);
                  setPhoneCountryCode(countryCode);
                }}
                placeholder="9876543210"
                autoFormat={true}
              />
            </FormField>

            {/* Password with show/hide */}
            <FormField
              label="Password"
              required
              hint="Must be at least 8 characters with uppercase, lowercase, number, and special character"
              error={registerForm.errors.password}
            >
              <div className="relative">
                <FormInput
                  type={registerPassword.showPassword ? "text" : "password"}
                  name="password"
                  value={registerForm.formData.password}
                  onChange={registerForm.handleChange}
                  onBlur={registerForm.handleBlur}
                  placeholder="••••••••"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={registerPassword.togglePasswordVisibility}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                  aria-label={
                    registerPassword.showPassword
                      ? "Hide password"
                      : "Show password"
                  }
                >
                  {registerPassword.showPassword ? (
                    <EyeOff className="w-5 h-5 text-gray-400" />
                  ) : (
                    <Eye className="w-5 h-5 text-gray-400" />
                  )}
                </button>
              </div>
            </FormField>

            {/* Confirm Password with show/hide */}
            <FormField
              label="Confirm Password"
              required
              error={registerForm.errors.confirmPassword}
            >
              <div className="relative">
                <FormInput
                  type={
                    registerPassword.showConfirmPassword ? "text" : "password"
                  }
                  name="confirmPassword"
                  value={registerForm.formData.confirmPassword}
                  onChange={registerForm.handleChange}
                  onBlur={registerForm.handleBlur}
                  placeholder="••••••••"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={registerPassword.toggleConfirmPasswordVisibility}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                  aria-label={
                    registerPassword.showConfirmPassword
                      ? "Hide password"
                      : "Show password"
                  }
                >
                  {registerPassword.showConfirmPassword ? (
                    <EyeOff className="w-5 h-5 text-gray-400" />
                  ) : (
                    <Eye className="w-5 h-5 text-gray-400" />
                  )}
                </button>
              </div>
            </FormField>

            {/* Terms Checkbox */}
            <div className="flex items-start gap-2">
              <FormCheckbox
                id="acceptTerms"
                checked={acceptTerms}
                onChange={(e) => setAcceptTerms(e.target.checked)}
                label={
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    I agree to the{" "}
                    <Link
                      href="/terms"
                      className="text-yellow-600 hover:text-yellow-700 font-medium"
                    >
                      Terms of Service
                    </Link>{" "}
                    and{" "}
                    <Link
                      href="/privacy"
                      className="text-yellow-600 hover:text-yellow-700 font-medium"
                    >
                      Privacy Policy
                    </Link>
                  </span>
                }
              />
            </div>

            {/* Submit Button - Mobile Optimized */}
            <button
              type="submit"
              disabled={registerLoading}
              className="w-full py-3 px-4 min-h-[48px] bg-yellow-500 hover:bg-yellow-600 active:bg-yellow-700 text-gray-900 font-bold rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
            >
              {registerLoading ? (
                <span className="flex items-center justify-center">
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Creating account...
                </span>
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          {/* Social Login Divider */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                  Or sign up with
                </span>
              </div>
            </div>
          </div>

          {/* Google Sign Up */}
          <div className="mt-6">
            <GoogleSignInButton disabled={registerLoading} />
          </div>

          {/* Login Divider */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                  Already have an account?
                </span>
              </div>
            </div>
          </div>

          {/* Login Link - Mobile Optimized */}
          <div className="mt-6">
            <Link
              href="/login"
              className="w-full py-3 px-4 min-h-[48px] border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold rounded-lg hover:border-yellow-500 hover:text-yellow-600 active:bg-gray-50 dark:active:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-all text-center touch-manipulation flex items-center justify-center"
            >
              Sign In Instead
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
