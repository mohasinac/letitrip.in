"use client";

import { LoadingSpinner as LibraryLoadingSpinner } from "@letitrip/react-library";

interface LoadingSpinnerWrapperProps {
  size?: "sm" | "md" | "lg" | "xl";
  color?: "primary" | "white" | "gray";
  fullScreen?: boolean;
  message?: string;
}

/**
 * Next.js wrapper for LoadingSpinner component
 */
export function LoadingSpinner(props: LoadingSpinnerWrapperProps) {
  return <LibraryLoadingSpinner {...props} />;
}

export default LoadingSpinner;
