"use client";

import { LoadingSpinner } from "@letitrip-library/components";

interface LoadingSpinnerWrapperProps {
  size?: "sm" | "md" | "lg" | "xl";
  color?: "primary" | "white" | "gray";
  fullScreen?: boolean;
  message?: string;
}

/**
 * Next.js wrapper for LoadingSpinner component
 */
export function LoadingSpinnerWrapper(props: LoadingSpinnerWrapperProps) {
  return <LoadingSpinner {...props} />;
}

export default LoadingSpinnerWrapper;
