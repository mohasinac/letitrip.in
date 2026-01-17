"use client";

import {
  NotImplemented as LibraryNotImplemented,
  NotImplementedPage as LibraryNotImplementedPage,
  type NotImplementedProps as LibraryNotImplementedProps,
} from "@letitrip/react-library";
import Link from "next/link";

interface NotImplementedProps
  extends Omit<LibraryNotImplementedProps, "LinkComponent"> {}

/**
 * NotImplemented Component
 *
 * A placeholder component for features that are planned but not yet implemented.
 * Shows a friendly message with optional links to track progress.
 *
 * @example
 * <NotImplemented
 *   title="Advanced Analytics"
 *   description="Detailed sales and traffic analytics will be available soon."
 *   featureName="E025 - Analytics Dashboard"
 *   backHref="/admin"
 *   expectedDate="Q1 2025"
 * />
 */
export function NotImplemented(props: NotImplementedProps) {
  return <LibraryNotImplemented {...props} LinkComponent={Link as any} />;
}

/**
 * NotImplementedPage Component
 *
 * Full page wrapper for the NotImplemented component with consistent styling.
 */
export function NotImplementedPage(props: NotImplementedProps) {
  return <LibraryNotImplementedPage {...props} LinkComponent={Link as any} />;
}

export default NotImplemented;
