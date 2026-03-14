"use client";

import { THEME_CONSTANTS } from "@/constants";
import { Li, Nav, Ol, Span } from "@/components";
import { classNames } from "@/helpers";

const { themed, flex } = THEME_CONSTANTS;

export interface StepperNavProps {
  steps: { number: number; label: string }[];
  currentStep: number;
  className?: string;
}

export function StepperNav({ steps, currentStep, className }: StepperNavProps) {
  return (
    <Nav aria-label="Steps" className={classNames("mb-8", className)}>
      <Ol className="flex items-center gap-0">
        {steps.map((step, i) => {
          const isComplete = step.number < currentStep;
          const isActive = step.number === currentStep;
          const isLast = i === steps.length - 1;

          return (
            <Li key={step.number} className="flex items-center flex-1">
              {/* Step indicator */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <div
                  className={classNames(
                    "w-8 h-8 rounded-full text-sm font-semibold border-2 transition-colors",
                    flex.center,
                    isComplete
                      ? "bg-primary border-primary text-white"
                      : isActive
                        ? "border-primary text-primary bg-transparent"
                        : classNames(
                            themed.border,
                            "text-zinc-500 dark:text-zinc-400",
                          ),
                  )}
                >
                  {isComplete ? (
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      aria-hidden="true"
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
                <Span
                  className={classNames(
                    "text-sm font-medium hidden sm:block",
                    isActive
                      ? "text-primary"
                      : isComplete
                        ? themed.textPrimary
                        : "text-zinc-500 dark:text-zinc-400",
                  )}
                >
                  {step.label}
                </Span>
              </div>

              {/* Connector */}
              {!isLast && (
                <div
                  className={classNames(
                    "flex-1 h-0.5 mx-3 transition-colors",
                    isComplete
                      ? "bg-primary"
                      : classNames(themed.border, "bg-zinc-200"),
                  )}
                />
              )}
            </Li>
          );
        })}
      </Ol>
    </Nav>
  );
}
