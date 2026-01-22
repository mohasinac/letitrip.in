import LoginForm from "@/components/auth/LoginForm";
import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Login | Let It Rip",
  description:
    "Sign in to your Let It Rip account to shop, bid, and manage your orders.",
};

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Welcome Back
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Sign in to your account to continue
          </p>
        </div>

        {/* Login Form */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          <LoginForm />
        </div>

        {/* Terms */}
        <p className="mt-6 text-center text-xs text-gray-500 dark:text-gray-400">
          By continuing, you agree to our{" "}
          <Link href="/terms" className="text-blue-600 hover:underline">
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="text-blue-600 hover:underline">
            Privacy Policy
          </Link>
        </p>
      </div>
    </div>
  );
}
