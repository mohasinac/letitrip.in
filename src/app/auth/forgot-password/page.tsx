"use client";

/**
 * Forgot Password Page
 *
 * Refactored to use API client, hooks, and reusable components
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, Button, Alert, FormField, Heading, Text } from "@/components";
import { ROUTES, THEME_CONSTANTS, UI_LABELS } from "@/constants";
import { useForgotPassword } from "@/hooks";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [touched, setTouched] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { mutate: forgotPassword, isLoading } = useForgotPassword({
    onSuccess: () => setSuccess(true),
    onError: (err) =>
      setError(err.message || UI_LABELS.AUTH.FORGOT_PASSWORD.FAILED_SEND_EMAIL),
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    await forgotPassword({ email: email.trim() });
  };

  if (success) {
    return (
      <div className="flex items-center justify-center py-8 sm:py-12 w-full">
        <Card className="max-w-md w-full p-6 sm:p-8">
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
              {UI_LABELS.AUTH.FORGOT_PASSWORD.CHECK_EMAIL}
            </Heading>
            <Text className="text-gray-600 mb-6">
              {UI_LABELS.AUTH.FORGOT_PASSWORD.RESET_LINK_SENT_TO.replace(
                "{email}",
                email,
              )}
            </Text>
            <Text className="text-gray-500 mb-6 block text-sm">
              {UI_LABELS.AUTH.FORGOT_PASSWORD.LINK_EXPIRES}
            </Text>
          </div>

          <div className={THEME_CONSTANTS.spacing.stackSmall}>
            <Button
              variant="primary"
              onClick={() => router.push(ROUTES.AUTH.LOGIN)}
              className="w-full"
            >
              {UI_LABELS.AUTH.FORGOT_PASSWORD.RETURN_TO_LOGIN}
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
              {UI_LABELS.AUTH.FORGOT_PASSWORD.SEND_ANOTHER_EMAIL}
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center py-8 sm:py-12 w-full">
      <Card className="max-w-md w-full p-6 sm:p-8">
        <div className="text-center mb-6">
          <Heading level={4} className="mb-2">
            {UI_LABELS.AUTH.FORGOT_PASSWORD.PAGE_TITLE}
          </Heading>
          <Text className="text-gray-600">
            {UI_LABELS.AUTH.FORGOT_PASSWORD.SUBTITLE}
          </Text>
        </div>

        {error && (
          <Alert variant="error" className="mb-4">
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit} className={THEME_CONSTANTS.spacing.stack}>
          <FormField
            label={UI_LABELS.AUTH.SHARED.EMAIL_ADDRESS}
            name="email"
            type="email"
            value={email}
            onChange={setEmail}
            onBlur={() => setTouched(true)}
            touched={touched}
            placeholder={UI_LABELS.AUTH.SHARED.EMAIL_PLACEHOLDER}
            disabled={isLoading}
            required
          />

          <Button
            type="submit"
            variant="primary"
            disabled={isLoading || !email}
            className="w-full"
          >
            {isLoading
              ? UI_LABELS.AUTH.FORGOT_PASSWORD.SENDING
              : UI_LABELS.AUTH.FORGOT_PASSWORD.SEND_RESET_EMAIL}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <Text className="text-gray-600 text-sm">
            {UI_LABELS.AUTH.FORGOT_PASSWORD.REMEMBER_PASSWORD}{" "}
            <Link
              href={ROUTES.AUTH.LOGIN}
              className="text-blue-600 hover:underline"
            >
              {UI_LABELS.AUTH.FORGOT_PASSWORD.SIGN_IN_LINK}
            </Link>
          </Text>
        </div>
      </Card>
    </div>
  );
}
