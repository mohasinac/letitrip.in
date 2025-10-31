import React from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface StepperProps {
  steps: string[];
  currentStep: number;
  onStepClick?: (index: number) => void;
  allowJump?: boolean; // Allow clicking to jump to specific steps
  className?: string;
}

export function Stepper({
  steps,
  currentStep,
  onStepClick,
  allowJump = true,
  className,
}: StepperProps) {
  return (
    <div className={cn("w-full", className)}>
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <React.Fragment key={index}>
            <StepItem
              label={step}
              index={index + 1}
              active={index === currentStep}
              completed={index < currentStep}
              onClick={() => allowJump && onStepClick?.(index)}
              clickable={allowJump}
            />
            {index < steps.length - 1 && (
              <div
                className={cn(
                  "flex-1 h-0.5 mx-2 transition-colors",
                  index < currentStep ? "bg-primary" : "bg-border"
                )}
              />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

interface StepItemProps {
  label: string;
  index: number;
  active: boolean;
  completed: boolean;
  onClick?: () => void;
  clickable: boolean;
}

function StepItem({
  label,
  index,
  active,
  completed,
  onClick,
  clickable,
}: StepItemProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center gap-2 min-w-0",
        clickable && "cursor-pointer hover:opacity-80 transition-opacity"
      )}
      onClick={onClick}
    >
      {/* Step Circle */}
      <div
        className={cn(
          "w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all",
          "border-2 shrink-0",
          completed && "bg-success border-success text-white",
          active &&
            !completed &&
            "bg-primary border-primary text-white shadow-lg scale-110",
          !active && !completed && "bg-surface border-border text-textSecondary"
        )}
      >
        {completed ? <Check className="w-5 h-5" /> : index}
      </div>

      {/* Step Label */}
      <span
        className={cn(
          "text-xs sm:text-sm font-medium text-center transition-colors",
          "hidden sm:block", // Hide on mobile to save space
          active ? "text-text font-semibold" : "text-textSecondary"
        )}
      >
        {label}
      </span>

      {/* Mobile: Show only for active step */}
      <span
        className={cn(
          "text-xs font-medium text-center transition-colors sm:hidden",
          active ? "text-text font-semibold" : "hidden"
        )}
      >
        {label}
      </span>
    </div>
  );
}

// Vertical Stepper variant for sidebar navigation
interface VerticalStepperProps {
  steps: string[];
  currentStep: number;
  onStepClick?: (index: number) => void;
  allowJump?: boolean;
  className?: string;
}

export function VerticalStepper({
  steps,
  currentStep,
  onStepClick,
  allowJump = true,
  className,
}: VerticalStepperProps) {
  return (
    <div className={cn("space-y-2", className)}>
      {steps.map((step, index) => (
        <div key={index} className="relative">
          <button
            onClick={() => allowJump && onStepClick?.(index)}
            disabled={!allowJump}
            className={cn(
              "w-full flex items-center gap-3 p-3 rounded-lg transition-all",
              "border-2 text-left",
              index === currentStep && "bg-primary/10 border-primary shadow-sm",
              index < currentStep &&
                "bg-success/5 border-success/30 hover:bg-success/10",
              index > currentStep &&
                "bg-surface border-border hover:bg-surface-hover",
              allowJump && "cursor-pointer",
              !allowJump && "cursor-not-allowed opacity-60"
            )}
          >
            {/* Step Circle */}
            <div
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center font-semibold shrink-0",
                index < currentStep && "bg-success text-white",
                index === currentStep && "bg-primary text-white",
                index > currentStep &&
                  "bg-surface border-2 border-border text-textSecondary"
              )}
            >
              {index < currentStep ? <Check className="w-4 h-4" /> : index + 1}
            </div>

            {/* Step Label */}
            <div className="flex-1 min-w-0">
              <div
                className={cn(
                  "text-sm font-medium truncate",
                  index === currentStep && "text-primary",
                  index < currentStep && "text-success",
                  index > currentStep && "text-textSecondary"
                )}
              >
                {step}
              </div>
              <div className="text-xs text-textSecondary">
                {index < currentStep && "Completed"}
                {index === currentStep && "In progress"}
                {index > currentStep && `Step ${index + 1}`}
              </div>
            </div>
          </button>

          {/* Connector line */}
          {index < steps.length - 1 && (
            <div
              className={cn(
                "absolute left-7 top-full w-0.5 h-2 transition-colors",
                index < currentStep ? "bg-success" : "bg-border"
              )}
            />
          )}
        </div>
      ))}
    </div>
  );
}
