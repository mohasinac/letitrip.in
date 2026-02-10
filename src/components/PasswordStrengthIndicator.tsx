/**
 * Password Strength Indicator Component
 *
 * Visual indicator for password strength with validation feedback
 */

"use client";

import React from "react";
import { PASSWORD_CONFIG, ERROR_MESSAGES, THEME_CONSTANTS } from "@/constants";

interface PasswordStrengthIndicatorProps {
  password: string;
  showRequirements?: boolean;
}

interface PasswordRequirement {
  label: string;
  met: boolean;
}

export const PasswordStrengthIndicator: React.FC<
  PasswordStrengthIndicatorProps
> = ({ password, showRequirements = true }) => {
  const requirements: PasswordRequirement[] = [
    {
      label: `At least ${PASSWORD_CONFIG.MIN_LENGTH} characters`,
      met: password.length >= PASSWORD_CONFIG.MIN_LENGTH,
    },
    {
      label: "Contains lowercase letter",
      met: /[a-z]/.test(password),
    },
    {
      label: "Contains uppercase letter",
      met: /[A-Z]/.test(password),
    },
    {
      label: "Contains number",
      met: /[0-9]/.test(password),
    },
  ];

  const metCount = requirements.filter((r) => r.met).length;
  const strength = (metCount / requirements.length) * 100;

  const getStrengthColor = () => {
    if (strength <= 25) return "bg-red-500";
    if (strength <= 50) return "bg-orange-500";
    if (strength <= 75) return "bg-yellow-500";
    return "bg-green-500";
  };

  const getStrengthLabel = () => {
    if (strength === 0) return "";
    if (strength <= 25) return "Weak";
    if (strength <= 50) return "Fair";
    if (strength <= 75) return "Good";
    return "Strong";
  };

  if (!password) return null;

  return (
    <div className="mt-2" aria-live="polite" aria-atomic="true">
      {/* Strength Bar */}
      <div className="flex items-center gap-2 mb-2">
        <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ${getStrengthColor()}`}
            style={{ width: `${strength}%` }}
            role="progressbar"
            aria-valuenow={Math.round(strength)}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`Password strength: ${getStrengthLabel() || "None"}`}
          />
        </div>
        {password && (
          <span
            className={`text-sm font-medium ${THEME_CONSTANTS.themed.textSecondary}`}
          >
            {getStrengthLabel()}
          </span>
        )}
      </div>

      {/* Requirements List */}
      {showRequirements && (
        <ul className="space-y-1">
          {requirements.map((req, index) => (
            <li
              key={index}
              className={`text-xs flex items-center gap-2 ${
                req.met
                  ? "text-green-600 dark:text-green-400"
                  : THEME_CONSTANTS.themed.textSecondary
              }`}
            >
              {req.met ? (
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              ) : (
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
              <span className="sr-only">{req.met ? "Met: " : "Not met: "}</span>
              {req.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
