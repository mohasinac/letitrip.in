"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
import { apiClient } from "@/lib/api-client";

export function NewsletterSection() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !email.includes("@")) {
      setStatus("error");
      setMessage(ERROR_MESSAGES.VALIDATION.INVALID_EMAIL);
      return;
    }

    setStatus("loading");

    try {
      await apiClient.post(API_ENDPOINTS.NEWSLETTER.SUBSCRIBE, { email });
      setStatus("success");
      setMessage(SUCCESS_MESSAGES.NEWSLETTER.SUBSCRIBED);
      setEmail("");
    } catch (error: any) {
      setStatus("error");
      setMessage(error.message || ERROR_MESSAGES.GENERIC.INTERNAL_ERROR);
    }
  };

  return (
    <section
      className={`${THEME_CONSTANTS.spacing.padding.xl} ${THEME_CONSTANTS.themed.bgPrimary}`}
    >
      <div className="w-full">
        <div
          className={`${THEME_CONSTANTS.themed.bgSecondary} ${THEME_CONSTANTS.borderRadius["2xl"]} ${THEME_CONSTANTS.spacing.padding.xl} text-center`}
        >
          {/* Icon */}
          <div className="text-6xl mb-6">📬</div>

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

          {/* Form */}
          <form onSubmit={handleSubmit} className="max-w-md mx-auto">
            <div className="flex flex-col sm:flex-row gap-3">
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={UI_PLACEHOLDERS.EMAIL}
                className="flex-1"
                disabled={status === "loading" || status === "success"}
              />
              <Button
                type="submit"
                variant="primary"
                disabled={status === "loading" || status === "success"}
              >
                {status === "loading"
                  ? UI_LABELS.LOADING.DEFAULT
                  : status === "success"
                    ? UI_LABELS.STATUS.SUBSCRIBED
                    : UI_LABELS.ACTIONS.SUBSCRIBE}
              </Button>
            </div>

            {/* Status Messages */}
            {status === "success" && (
              <p
                className={`${THEME_CONSTANTS.typography.small} text-green-600 dark:text-green-400 mt-3`}
              >
                {message}
              </p>
            )}
            {status === "error" && (
              <p
                className={`${THEME_CONSTANTS.typography.small} text-red-600 dark:text-red-400 mt-3`}
              >
                {message}
              </p>
            )}
          </form>

          {/* Privacy Note */}
          <p
            className={`${THEME_CONSTANTS.typography.small} ${THEME_CONSTANTS.themed.textSecondary} mt-6`}
          >
            {UI_LABELS.HOMEPAGE.NEWSLETTER.PRIVACY_NOTE}{" "}
            <button
              className="text-blue-600 dark:text-blue-400 hover:underline"
              onClick={() => router.push(ROUTES.PUBLIC.PRIVACY)}
            >
              {UI_LABELS.FOOTER.PRIVACY_POLICY}
            </button>
          </p>
        </div>
      </div>
    </section>
  );
}
