"use client";

import { THEME_CONSTANTS } from "@/constants";

const { themed } = THEME_CONSTANTS;

interface Step {
  number: number;
  label: string;
}

interface CheckoutStepperProps {
  steps: Step[];
  currentStep: number;
}

export function CheckoutStepper({ steps, currentStep }: CheckoutStepperProps) {
  return (
    <nav aria-label="Checkout steps" className="mb-8">
      <ol className="flex items-center gap-0">
        {steps.map((step, i) => {
          const isComplete = step.number < currentStep;
          const isActive = step.number === currentStep;
          const isLast = i === steps.length - 1;

          return (
            <li key={step.number} className="flex items-center flex-1">
              {/* Step indicator */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold border-2 transition-colors ${
                    isComplete
                      ? "bg-indigo-600 border-indigo-600 text-white"
                      : isActive
                        ? "border-indigo-600 text-indigo-600 bg-transparent"
                        : `${themed.border} text-gray-400`
                  }`}
                >
                  {isComplete ? (
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2.5}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  ) : (
                    step.number
                  )}
                </div>
                <span
                  className={`text-sm font-medium hidden sm:block ${
                    isActive
                      ? "text-indigo-600"
                      : isComplete
                        ? themed.textPrimary
                        : "text-gray-400"
                  }`}
                >
                  {step.label}
                </span>
              </div>

              {/* Connector */}
              {!isLast && (
                <div
                  className={`flex-1 h-0.5 mx-3 transition-colors ${
                    isComplete
                      ? "bg-indigo-600"
                      : `${themed.border} bg-gray-200`
                  }`}
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
