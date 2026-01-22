/**
 * Register Form Component
 *
 * Client-side registration form with Firebase authentication.
 * Supports email/password and social registration (Google, Facebook).
 * Includes role dropdown for localhost development.
 */

"use client";

import { auth } from "@/lib/firebase";
import {
  createUserWithEmailAndPassword,
  FacebookAuthProvider,
  GoogleAuthProvider,
  signInWithPopup,
  updateProfile,
} from "firebase/auth";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function RegisterForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLocalhost, setIsLocalhost] = useState(false);
  const [selectedRole, setSelectedRole] = useState<"user" | "seller" | "admin">(
    "user",
  );

  useEffect(() => {
    // Check if running on localhost
    setIsLocalhost(
      window.location.hostname === "localhost" ||
        window.location.hostname === "127.0.0.1",
    );
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const formData = new FormData(e.currentTarget);
      const email = (formData.get("email") as string)?.trim();
      const password = formData.get("password") as string;
      const confirmPassword = formData.get("confirmPassword") as string;
      const name = formData.get("name") as string;
      const countryCode = formData.get("countryCode") as string;
      const phone = (formData.get("phone") as string)?.trim();
      const fullPhone = phone ? `${countryCode}${phone}` : "";

      // Validate either email or phone is provided
      if (!email && !phone) {
        throw new Error("Please provide either email or phone number");
      }

      // Validate passwords match
      if (password !== confirmPassword) {
        throw new Error("Passwords do not match");
      }

      // Validate password strength
      if (password.length < 6) {
        throw new Error("Password must be at least 6 characters");
      }

      // Create user with Firebase (requires email, use phone-based email if only phone provided)
      const authEmail =
        email || `${phone.replace(/\D/g, "")}@phone.letitrip.in`;
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        authEmail,
        password,
      );

      // Update profile with name
      await updateProfile(userCredential.user, {
        displayName: name,
      });

      // Get ID token
      const idToken = await userCredential.user.getIdToken();

      // Send token to server to create profile
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idToken,
          name,
          email: email || "",
          phone: fullPhone || "",
          role: isLocalhost ? selectedRole : "user",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Registration failed");
      }

      // Redirect based on role
      if (data.user.role === "admin") {
        router.push("/admin/dashboard");
      } else if (data.user.role === "seller") {
        router.push("/seller/dashboard");
      } else {
        router.push("/");
      }
    } catch (err: any) {
      console.error("Registration error:", err);
      setError(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const handleSocialRegister = async (provider: "google" | "facebook") => {
    setError("");
    setLoading(true);

    try {
      let authProvider;
      if (provider === "google") {
        authProvider = new GoogleAuthProvider();
      } else {
        authProvider = new FacebookAuthProvider();
      }

      // Sign in with popup
      const userCredential = await signInWithPopup(auth, authProvider);

      // Get ID token
      const idToken = await userCredential.user.getIdToken();

      // Send token to server to create profile
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idToken,
          name: userCredential.user.displayName || "",
          phone: userCredential.user.phoneNumber || "",
          role: isLocalhost ? selectedRole : "user",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Registration failed");
      }

      // Redirect based on role
      if (data.user.role === "admin") {
        router.push("/admin/dashboard");
      } else if (data.user.role === "seller") {
        router.push("/seller/dashboard");
      } else {
        router.push("/");
      }
    } catch (err: any) {
      console.error("Social registration error:", err);
      setError(err.message || "Social registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}

      {isLocalhost && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-lg text-sm">
          <strong>Development Mode:</strong> You can select a role for testing.
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Full Name */}
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            Full Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            placeholder="Enter your full name"
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:text-white"
            required
            disabled={loading}
          />
        </div>

        {/* Email */}
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            Email Address{" "}
            <span className="text-xs font-normal text-gray-500 dark:text-gray-400">
              (Email OR Phone required)
            </span>
          </label>
          <input
            type="email"
            id="email"
            name="email"
            placeholder="Enter your email"
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:text-white"
            disabled={loading}
          />
        </div>

        {/* Phone Number */}
        <div>
          <label
            htmlFor="phone"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            Phone Number{" "}
            <span className="text-xs font-normal text-gray-500 dark:text-gray-400">
              (Email OR Phone required)
            </span>
          </label>
          <div className="flex gap-2">
            <select
              name="countryCode"
              className="px-3 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:text-white"
            >
              <option value="+91">+91</option>
              <option value="+1">+1</option>
              <option value="+44">+44</option>
            </select>
            <input
              type="tel"
              id="phone"
              name="phone"
              placeholder="Enter your phone number"
              className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:text-white"
              disabled={loading}
            />
          </div>
        </div>

        {/* Role Selection (Localhost Only) */}
        {isLocalhost && (
          <div>
            <label
              htmlFor="role"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Role (Development Only)
            </label>
            <select
              id="role"
              value={selectedRole}
              onChange={(e) =>
                setSelectedRole(e.target.value as "user" | "seller" | "admin")
              }
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:text-white"
            >
              <option value="user">User</option>
              <option value="seller">Seller</option>
              <option value="admin">Admin</option>
            </select>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              This option is only available on localhost for testing purposes.
            </p>
          </div>
        )}

        {/* Password */}
        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              name="password"
              placeholder="Create a strong password"
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:text-white"
              required
              disabled={loading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              title="Toggle password visibility"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {showPassword ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                  />
                ) : (
                  <>
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </>
                )}
              </svg>
            </button>
          </div>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Use 8+ characters with uppercase, lowercase, and numbers
          </p>
        </div>

        {/* Confirm Password */}
        <div>
          <label
            htmlFor="confirmPassword"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            Confirm Password
          </label>
          <div className="relative">
            <input
              type={showConfirmPassword ? "text" : "password"}
              id="confirmPassword"
              name="confirmPassword"
              placeholder="Re-enter your password"
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:text-white"
              required
              disabled={loading}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {showConfirmPassword ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                  />
                ) : (
                  <>
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </>
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Terms Checkbox */}
        <div className="flex items-start">
          <input
            type="checkbox"
            id="terms"
            name="terms"
            className="w-4 h-4 mt-1 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            required
          />
          <label
            htmlFor="terms"
            className="ml-2 text-sm text-gray-700 dark:text-gray-300"
          >
            I agree to the{" "}
            <Link
              href="/terms"
              className="text-blue-600 hover:underline"
              target="_blank"
            >
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link
              href="/privacy"
              className="text-blue-600 hover:underline"
              target="_blank"
            >
              Privacy Policy
            </Link>
          </label>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Creating Account..." : "Create Account"}
        </button>
      </form>

      {/* Divider */}
      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300 dark:border-gray-700" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
            Or sign up with
          </span>
        </div>
      </div>

      {/* Social Registration */}
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => handleSocialRegister("google")}
          disabled={loading}
          className="flex items-center justify-center gap-2 px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition disabled:opacity-50"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
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
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Google
          </span>
        </button>

        <button
          type="button"
          onClick={() => handleSocialRegister("facebook")}
          disabled={loading}
          className="flex items-center justify-center gap-2 px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition disabled:opacity-50"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
          </svg>
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Facebook
          </span>
        </button>
      </div>

      {/* Sign In Link */}
      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
          >
            Sign in
          </Link>
        </p>
      </div>
    </>
  );
}
