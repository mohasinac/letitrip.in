"use client";

import { useState } from "react";
import { THEME_CONSTANTS, API_ENDPOINTS } from "@/constants";
import { Button } from "@/components";

export function NewsletterSection() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !email.includes("@")) {
      setStatus("error");
      setMessage("Please enter a valid email address");
      return;
    }

    setStatus("loading");

    try {
      const response = await fetch(API_ENDPOINTS.NEWSLETTER.SUBSCRIBE, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus("success");
        setMessage(
          "Thank you for subscribing! Check your email for confirmation.",
        );
        setEmail("");
      } else {
        setStatus("error");
        setMessage(data.message || "Something went wrong. Please try again.");
      }
    } catch (error) {
      setStatus("error");
      setMessage("Network error. Please try again later.");
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
            Stay Updated
          </h2>
          <p
            className={`${THEME_CONSTANTS.typography.body} ${THEME_CONSTANTS.themed.textSecondary} max-w-xl mx-auto mb-8`}
          >
            Subscribe to our newsletter for exclusive deals, new arrivals, and
            insider tips
          </p>

          {/* Form */}
          <form onSubmit={handleSubmit} className="max-w-md mx-auto">
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                className={`flex-1 ${THEME_CONSTANTS.spacing.padding.md} ${THEME_CONSTANTS.borderRadius.lg} ${THEME_CONSTANTS.themed.bgPrimary} ${THEME_CONSTANTS.themed.textPrimary} border ${THEME_CONSTANTS.themed.border} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                disabled={status === "loading" || status === "success"}
              />
              <Button
                type="submit"
                variant="primary"
                disabled={status === "loading" || status === "success"}
              >
                {status === "loading"
                  ? "Subscribing..."
                  : status === "success"
                    ? "Subscribed!"
                    : "Subscribe"}
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
            We respect your privacy. Unsubscribe at any time.{" "}
            <button
              className="text-blue-600 dark:text-blue-400 hover:underline"
              onClick={() => (window.location.href = "/privacy-policy")}
            >
              Privacy Policy
            </button>
          </p>
        </div>
      </div>
    </section>
  );
}
