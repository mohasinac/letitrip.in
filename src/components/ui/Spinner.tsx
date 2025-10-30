/**
 * Reusable Loading Spinner Component
 */

"use client";

import React from "react";
import { cn } from "@/lib/utils";

export interface SpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  label?: string;
}

const sizeClasses = {
  sm: "spinner-sm",
  md: "spinner-md",
  lg: "spinner-lg",
};

export const Spinner: React.FC<SpinnerProps> = ({
  size = "md",
  className,
  label,
}) => {
  return (
    <div className="flex flex-col items-center justify-center gap-2">
      <div className={cn("spinner", sizeClasses[size], className)} />
      {label && <p className="text-sm text-muted">{label}</p>}
    </div>
  );
};

export interface LoadingOverlayProps {
  loading: boolean;
  label?: string;
  children: React.ReactNode;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  loading,
  label,
  children,
}) => {
  return (
    <div className="relative">
      {children}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-50">
          <Spinner size="lg" label={label} />
        </div>
      )}
    </div>
  );
};
