"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail } from "lucide-react";
import {
  THEME_CONSTANTS,
  API_ENDPOINTS,
  UI_LABELS,
  UI_PLACEHOLDERS,
  ROUTES,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
} from "@/constants";
import { Button, Input } from "@/components";
import { useApiMutation, useMessage } from "@/hooks";
import { apiClient } from "@/lib/api-client";

export function NewsletterSection() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const { message, showSuccess, showError } = useMessage();

  const { mutate, isLoading } = useApiMutation<unknown, { email: string }>({
    mutationFn: (vars) =>
      apiClient.post(API_ENDPOINTS.NEWSLETTER.SUBSCRIBE, vars),
    onSuccess: () => {
      setSubscribed(true);
      setEmail("");
      showSuccess(SUCCESS_MESSAGES.NEWSLETTER.SUBSCRIBED);
    },
    onError: (err) => {
      showError(err.message || ERROR_MESSAGES.GENERIC.INTERNAL_ERROR);
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      showError(ERROR_MESSAGES.VALIDATION.INVALID_EMAIL);
      return;
    }
    await mutate({ email });
  };

  return (
    <section
      className={`${THEME_CONSTANTS.spacing.padding.xl} ${THEME_CONSTANTS.themed.bgPrimary}`}
    >
      <div className="w-full">
        <div
          className={`${THEME_CONSTANTS.themed.bgSecondary} ${THEME_CONSTANTS.borderRadius["2xl"]} ${THEME_CONSTANTS.spacing.padding.xl} text-center`}
        >
          {/* Mail icon from lucide-react */}
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-50 dark:bg-indigo-900/30 mb-6 mx-auto">
            <Mail className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
          </div>

          {/* Heading */}
          <h2
            className={`${THEME_CONSTANTS.typography.h2} ${THEME_CONSTANTS.themed.textPrimary} mb-3`}
          >
            {UI_LABELS.HOMEPAGE.NEWSLETTER.TITLE}
          </h2>
          <p
            className={`${THEME_CONSTANTS.typography.body} ${THEME_CONSTANTS.themed.textSecondary} ${THEME_CONSTANTS.container.xl} mx-auto mb-8`}
          >
            {UI_LABELS.HOMEPAGE.NEWSLETTER.SUBTITLE}
          </p>

          {/* Success State */}
          {subscribed ? (
            <div className="max-w-md mx-auto">
              <p
                className={`${THEME_CONSTANTS.typography.body} text-green-600 dark:text-green-400 font-medium`}
              >
                {SUCCESS_MESSAGES.NEWSLETTER.SUBSCRIBED}
              </p>
            </div>
          ) : (
            /* Form */
            <form onSubmit={handleSubmit} className="max-w-md mx-auto">
              <div className="flex flex-col sm:flex-row gap-3">
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={UI_PLACEHOLDERS.EMAIL}
                  className="flex-1"
                  disabled={isLoading}
                />
                <Button type="submit" variant="primary" disabled={isLoading}>
                  {isLoading
                    ? UI_LABELS.LOADING.DEFAULT
                    : UI_LABELS.ACTIONS.SUBSCRIBE}
                </Button>
              </div>

              {/* Inline message */}
              {message && (
                <p
                  className={`${THEME_CONSTANTS.typography.small} mt-3 ${
                    message.type === "success"
                      ? "text-green-600 dark:text-green-400"
                      : "text-red-600 dark:text-red-400"
                  }`}
                >
                  {message.text}
                </p>
              )}
            </form>
          )}

          {/* Privacy Note */}
          <p
            className={`${THEME_CONSTANTS.typography.small} ${THEME_CONSTANTS.themed.textSecondary} mt-6`}
          >
            {UI_LABELS.HOMEPAGE.NEWSLETTER.PRIVACY_NOTE}{" "}
            <Link
              href={ROUTES.PUBLIC.PRIVACY}
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              {UI_LABELS.FOOTER.PRIVACY_POLICY}
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}
