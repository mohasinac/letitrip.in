/**
 * Form Field Component
 *
 * Unified form field: text inputs, selects, textareas, image upload, and media upload.
 * Delegates to existing primitives (Input, Textarea, Select, ImageUpload, MediaUploadField).
 *
 * For image/media types, pass `onUpload` from `useMediaUpload().upload`.
 */

"use client";

import React from "react";
import { Label, Text, Span } from "@mohasinac/appkit/ui";
import { ImageUpload, MediaUploadField } from "@mohasinac/appkit/features/media";
import {
  Input,
  Select,
  Textarea,
} from "@/components";
import { THEME_CONSTANTS } from "@/constants";

const { input, themed } = THEME_CONSTANTS;

export interface SelectOption {
  value: string;
  label: string;
}

export interface FormFieldProps {
  label?: string;
  name: string;
  type?:
    | "text"
    | "email"
    | "password"
    | "tel"
    | "number"
    | "datetime-local"
    | "textarea"
    | "select"
    | "image"
    | "media";
  value?: string;
  onChange?: (value: string) => void;
  onBlur?: () => void;
  error?: string;
  touched?: boolean;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  autoComplete?: string;
  rows?: number;
  helpText?: string;
  options?: SelectOption[];

  // ── Media props (type="image" | type="media") ──────────────────────
  /** Upload fn — required for type="image" and type="media". Use useMediaUpload().upload. */
  onUpload?: (file: File) => Promise<string>;
  /** Capture source for image/media fields */
  captureSource?: "file-only" | "camera-only" | "both";
  /** Camera capture mode for type="media" */
  captureMode?: "photo" | "video" | "both";
  /** Accepted MIME types for image/media upload */
  accept?: string;
  /** Max file size in MB for image/media upload */
  maxSizeMB?: number;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  name,
  type = "text",
  value = "",
  onChange,
  onBlur,
  error,
  touched,
  placeholder,
  required = false,
  disabled = false,
  autoComplete,
  rows,
  helpText,
  options = [],
  onUpload,
  captureSource,
  captureMode,
  accept,
  maxSizeMB,
}) => {
  const showError = error
    ? touched !== undefined
      ? touched && !!error
      : !!error
    : false;
  const inputId = `field-${name}`;
  const errorId = `${inputId}-error`;

  const ariaProps = {
    "aria-required": required || undefined,
    "aria-invalid": showError || undefined,
    "aria-describedby": showError ? errorId : undefined,
  };

  const errorClasses = showError ? input.error : "";

  // ── Image upload ───────────────────────────────────────────────────
  if (type === "image" && onUpload) {
    return (
      <div className="w-full">
        <ImageUpload
          currentImage={value || undefined}
          onUpload={onUpload}
          onChange={(url) => onChange?.(url)}
          label={label ? `${label}${required ? " *" : ""}` : undefined}
          helperText={helpText}
          captureSource={captureSource ?? "file-only"}
          accept={accept}
          maxSizeMB={maxSizeMB}
        />
        {showError && (
          <Text
            id={errorId}
            size="sm"
            variant="error"
            className="mt-1.5"
            role="alert"
          >
            {error}
          </Text>
        )}
      </div>
    );
  }

  // ── Media upload (video/document/any) ──────────────────────────────
  if (type === "media" && onUpload) {
    return (
      <div className="w-full">
        <MediaUploadField
          label={`${label || name}${required ? " *" : ""}`}
          value={value}
          onChange={(url) => onChange?.(url)}
          onUpload={onUpload}
          disabled={disabled}
          helperText={helpText}
          captureSource={captureSource ?? "file-only"}
          captureMode={captureMode ?? "both"}
          accept={accept}
          maxSizeMB={maxSizeMB}
        />
        {showError && (
          <Text
            id={errorId}
            size="sm"
            variant="error"
            className="mt-1.5"
            role="alert"
          >
            {error}
          </Text>
        )}
      </div>
    );
  }

  // ── Standard fields (text, select, textarea) ───────────────────────
  return (
    <div className="w-full">
      {label && (
        <Label
          htmlFor={inputId}
          className={`block text-sm font-medium ${themed.textSecondary} mb-1.5`}
        >
          {label}
          {required && (
            <Span className="text-red-500 dark:text-red-400 ml-1">*</Span>
          )}
        </Label>
      )}

      {type === "select" ? (
        <Select
          id={inputId}
          name={name}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          onBlur={onBlur}
          disabled={disabled}
          options={options}
          className={errorClasses}
          {...ariaProps}
        />
      ) : type === "textarea" ? (
        <Textarea
          id={inputId}
          name={name}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          onBlur={onBlur}
          placeholder={placeholder}
          disabled={disabled}
          rows={rows}
          className={errorClasses}
          {...ariaProps}
        />
      ) : (
        <Input
          id={inputId}
          name={name}
          type={type}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          onBlur={onBlur}
          placeholder={placeholder}
          disabled={disabled}
          autoComplete={autoComplete}
          className={errorClasses}
          {...ariaProps}
        />
      )}

      {helpText && !showError && (
        <Text size="sm" variant="secondary" className="mt-1.5">
          {helpText}
        </Text>
      )}

      {showError && (
        <Text
          id={errorId}
          size="sm"
          variant="error"
          className="mt-1.5"
          role="alert"
        >
          {error}
        </Text>
      )}
    </div>
  );
};

export default FormField;
