"use client";

import React from "react";
import { THEME_CONSTANTS } from "@/constants";

/**
 * Form Component
 *
 * A wrapper component for forms with consistent spacing between form elements.
 * Use with FormGroup and FormActions for structured form layouts.
 *
 * @component
 * @example
 * ```tsx
 * <Form onSubmit={handleSubmit}>
 *   <FormGroup columns={2}>
 *     <Input label="First Name" />
 *     <Input label="Last Name" />
 *   </FormGroup>
 *   <FormGroup columns={1}>
 *     <FormField type="image" name="cover" label="Cover Image" onUpload={upload} />
 *   </FormGroup>
 *   <FormActions align="right">
 *     <Button type="submit">Submit</Button>
 *   </FormActions>
 * </Form>
 * ```
 */

interface FormProps extends React.FormHTMLAttributes<HTMLFormElement> {
  children: React.ReactNode;
}

export default function Form({
  children,
  className = "",
  ...props
}: FormProps) {
  const { spacing } = THEME_CONSTANTS;
  return (
    <form className={`${spacing.formGroup} ${className}`} {...props}>
      {children}
    </form>
  );
}

// ── FormGroup ────────────────────────────────────────────────────────────────

type GapToken = "none" | "xs" | "sm" | "md" | "lg" | "xl";

const GAP_MAP: Record<GapToken, string> = {
  none: "gap-0",
  xs: "gap-2",
  sm: "gap-3",
  md: "gap-4 lg:gap-6",
  lg: "gap-6 lg:gap-8",
  xl: "gap-8 lg:gap-10",
};

interface FormGroupProps {
  children: React.ReactNode;
  /** Number of columns — responsive from mobile (1) up to the specified count. */
  columns?: 1 | 2 | 3 | 4;
  /** Gap between fields. Defaults to "md". */
  gap?: GapToken;
  className?: string;
}

export function FormGroup({
  children,
  columns = 1,
  gap = "md",
  className = "",
}: FormGroupProps) {
  const gridClasses = {
    1: "grid-cols-1",
    2: "grid-cols-1 md:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
  };

  return (
    <div
      className={`grid ${gridClasses[columns]} ${GAP_MAP[gap]} ${className}`}
    >
      {children}
    </div>
  );
}

/**
 * FormFieldSpan — wraps a child so it spans the full width of a FormGroup grid.
 * Use for image/media uploads or rich-text editors inside multi-column FormGroups.
 *
 * @example
 * <FormGroup columns={2}>
 *   <FormField name="title" label="Title" />
 *   <FormField name="slug" label="Slug" />
 *   <FormFieldSpan>
 *     <FormField type="image" name="cover" onUpload={upload} />
 *   </FormFieldSpan>
 * </FormGroup>
 */
interface FormFieldSpanProps {
  children: React.ReactNode;
  className?: string;
}

export function FormFieldSpan({
  children,
  className = "",
}: FormFieldSpanProps) {
  return <div className={`col-span-full ${className}`}>{children}</div>;
}

// ── FormActions ──────────────────────────────────────────────────────────────

interface FormActionsProps {
  children: React.ReactNode;
  align?: "left" | "center" | "right" | "between";
  className?: string;
}

export function FormActions({
  children,
  align = "left",
  className = "",
}: FormActionsProps) {
  const { themed, spacing } = THEME_CONSTANTS;

  const alignClasses = {
    left: "justify-start",
    center: "justify-center",
    right: "justify-end",
    between: "justify-between",
  };

  return (
    <div
      className={`flex flex-wrap items-center ${spacing.inline} pt-4 border-t ${themed.borderLight} ${alignClasses[align]} ${className}`}
    >
      {children}
    </div>
  );
}
