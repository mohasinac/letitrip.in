"use client";

/**
 * Forgot Password Page
 *
 * Refactored to use API client, hooks, and reusable components
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, Button, Alert } from "@/components";
import { FormField } from "@/components/FormField";
import { Heading, Text } from "@/components/typography";
import { SUCCESS_MESSAGES, ROUTES, API_ENDPOINTS } from "@/constants";
import { apiClient } from "@/lib/api-client";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [touched, setTouched] = useState(false);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiClient.post(
        API_ENDPOINTS.AUTH.FORGOT_PASSWORD,
        {
          email: email.trim(),
        },
      );

      if (response.success) {
        setSuccess(true);
      } else {
        setError(response.error?.message || "Failed to send reset email");
      }
    } catch (err: any) {
      setError(err.message || "Failed to send reset email");
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-8">
        <Card className="max-w-md w-full p-8">
          <div className="text-center mb-6">
            <div className="mb-4 text-green-500">
              <svg
                className="w-16 h-16 mx-auto"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>
            <Heading level={4} className="mb-2">
              Check Your Email
            </Heading>
            <Text className="text-gray-600 mb-6">
              If an account exists with <strong>{email}</strong>, you will
              receive a password reset link shortly.
            </Text>
            <Text className="text-gray-500 mb-6 block text-sm">
              The link will expire in 1 hour for security reasons.
            </Text>
          </div>

          <div className="space-y-3">
            <Button
              variant="primary"
              onClick={() => router.push(ROUTES.AUTH.LOGIN)}
              className="w-full"
            >
              Return to Login
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                setSuccess(false);
                setEmail("");
                setTouched(false);
              }}
              className="w-full"
            >
              Send Another Email
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8">
      <Card className="max-w-md w-full p-8">
        <div className="text-center mb-6">
          <Heading level={4} className="mb-2">
            Forgot Your Password?
          </Heading>
          <Text className="text-gray-600">
            Enter your email address and we'll send you a link to reset your
            password.
          </Text>
        </div>

        {error && (
          <Alert variant="error" className="mb-4">
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField
            label="Email Address"
            name="email"
            type="email"
            value={email}
            onChange={setEmail}
            onBlur={() => setTouched(true)}
            touched={touched}
            placeholder="your@email.com"
            disabled={isLoading}
            required
          />

          <Button
            type="submit"
            variant="primary"
            disabled={isLoading || !email}
            className="w-full"
          >
            {isLoading ? "Sending..." : "Send Reset Link"}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <Text className="text-gray-600 text-sm">
            Remember your password?{" "}
            <Link
              href={ROUTES.AUTH.LOGIN}
              className="text-blue-600 hover:underline"
            >
              Sign in
            </Link>
          </Text>
        </div>
      </Card>
    </div>
  );
}
