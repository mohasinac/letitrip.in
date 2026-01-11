/**
 * FormRichText Component
 *
 * Rich text editor component using React Quill
 * Supports text formatting, lists, links, and images
 */

"use client";

import { cn } from "@/lib/utils";
import dynamic from "next/dynamic";
import React, { forwardRef, useMemo } from "react";
import "react-quill/dist/quill.snow.css";

// Dynamically import ReactQuill to avoid SSR issues
const ReactQuill = dynamic(() => import("react-quill"), {
  ssr: false,
  loading: () => (
    <div className="border border-gray-300 rounded-lg p-4 bg-gray-50 animate-pulse">
      <div className="h-10 bg-gray-200 rounded mb-2"></div>
      <div className="h-32 bg-gray-200 rounded"></div>
    </div>
  ),
});

export interface FormRichTextProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange"> {
  label?: string;
  error?: string;
  helperText?: string;
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  fullWidth?: boolean;
  compact?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  minHeight?: string;
  maxHeight?: string;
  required?: boolean;
  showToolbar?: boolean; // Show formatting toolbar (default: true)
  modules?: "minimal" | "standard" | "full"; // Toolbar configuration preset
}

export const FormRichText = forwardRef<HTMLDivElement, FormRichTextProps>(
  (
    {
      label,
      error,
      helperText,
      value = "",
      onChange,
      placeholder = "Enter text...",
      fullWidth = true,
      compact = false,
      className,
      disabled = false,
      readOnly = false,
      minHeight = "150px",
      maxHeight,
      required = false,
      showToolbar = true,
      modules: modulePreset = "standard",
      ...props
    },
    ref
  ) => {
    // Define toolbar configurations
    const toolbarModules = useMemo(() => {
      const presets = {
        minimal: {
          toolbar: [["bold", "italic", "underline"], ["link"]],
        },
        standard: {
          toolbar: [
            [{ header: [1, 2, 3, false] }],
            ["bold", "italic", "underline", "strike"],
            [{ list: "ordered" }, { list: "bullet" }],
            ["link", "blockquote"],
            ["clean"],
          ],
        },
        full: {
          toolbar: [
            [{ header: [1, 2, 3, 4, 5, 6, false] }],
            [{ font: [] }],
            [{ size: ["small", false, "large", "huge"] }],
            ["bold", "italic", "underline", "strike"],
            [{ color: [] }, { background: [] }],
            [{ script: "sub" }, { script: "super" }],
            [
              { list: "ordered" },
              { list: "bullet" },
              { indent: "-1" },
              { indent: "+1" },
            ],
            [{ direction: "rtl" }, { align: [] }],
            ["link", "image", "video"],
            ["blockquote", "code-block"],
            ["clean"],
          ],
        },
      };

      return presets[modulePreset];
    }, [modulePreset]);

    // Quill formats to allow
    const formats = [
      "header",
      "font",
      "size",
      "bold",
      "italic",
      "underline",
      "strike",
      "color",
      "background",
      "script",
      "list",
      "bullet",
      "indent",
      "direction",
      "align",
      "link",
      "image",
      "video",
      "blockquote",
      "code-block",
    ];

    // Handle change
    const handleChange = (content: string) => {
      onChange?.(content);
    };

    return (
      <div
        ref={ref}
        className={cn(fullWidth && "w-full", className)}
        {...props}
      >
        {/* Label */}
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}

        {/* Editor Container */}
        <div
          className={cn(
            "border rounded-lg overflow-hidden transition-all",
            error
              ? "border-red-300 focus-within:border-red-500 focus-within:ring-1 focus-within:ring-red-500"
              : "border-gray-300 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500",
            disabled && "opacity-50 cursor-not-allowed bg-gray-50",
            readOnly && "bg-gray-50"
          )}
          style={{
            minHeight,
            maxHeight,
          }}
        >
          <ReactQuill
            theme={showToolbar ? "snow" : "bubble"}
            value={value}
            onChange={handleChange}
            placeholder={placeholder}
            readOnly={readOnly || disabled}
            modules={showToolbar ? toolbarModules : { toolbar: false }}
            formats={formats}
            className={cn(
              "rich-text-editor",
              compact && "compact",
              !showToolbar && "no-toolbar"
            )}
            style={{
              minHeight: showToolbar ? `calc(${minHeight} - 42px)` : minHeight,
              maxHeight: maxHeight
                ? showToolbar
                  ? `calc(${maxHeight} - 42px)`
                  : maxHeight
                : undefined,
            }}
          />
        </div>

        {/* Error message */}
        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}

        {/* Helper text */}
        {helperText && !error && (
          <p className="mt-1 text-sm text-gray-500">{helperText}</p>
        )}

        {/* Character count (if value exists) */}
        {value && !error && !helperText && (
          <p className="mt-1 text-xs text-gray-400 text-right">
            {value.replace(/<[^>]*>/g, "").length} characters
          </p>
        )}

        {/* Custom styles for Quill editor */}
        <style jsx global>{`
          .rich-text-editor .ql-container {
            font-family: inherit;
            font-size: 0.875rem;
          }

          .rich-text-editor .ql-editor {
            min-height: ${minHeight};
            ${maxHeight ? `max-height: ${maxHeight};` : ""}
            overflow-y: auto;
            padding: ${compact ? "0.75rem" : "1rem"};
          }

          .rich-text-editor .ql-editor.ql-blank::before {
            font-style: normal;
            color: #9ca3af;
          }

          .rich-text-editor .ql-toolbar {
            background-color: #f9fafb;
            border: none;
            border-bottom: 1px solid #e5e7eb;
            padding: ${compact ? "0.5rem" : "0.75rem"};
          }

          .rich-text-editor .ql-toolbar button {
            width: 28px;
            height: 28px;
            padding: 4px;
          }

          .rich-text-editor .ql-toolbar button:hover {
            background-color: #e5e7eb;
            border-radius: 4px;
          }

          .rich-text-editor .ql-toolbar button.ql-active {
            background-color: #dbeafe;
            color: #2563eb;
            border-radius: 4px;
          }

          .rich-text-editor .ql-stroke {
            stroke: #4b5563;
          }

          .rich-text-editor .ql-fill {
            fill: #4b5563;
          }

          .rich-text-editor .ql-picker-label {
            color: #4b5563;
          }

          .rich-text-editor.compact .ql-toolbar {
            padding: 0.5rem;
          }

          .rich-text-editor.compact .ql-toolbar button {
            width: 24px;
            height: 24px;
            padding: 3px;
          }

          .rich-text-editor.no-toolbar .ql-container {
            border: none;
          }

          /* Disabled state */
          .rich-text-editor .ql-container.ql-disabled .ql-editor {
            background-color: #f9fafb;
            cursor: not-allowed;
          }

          /* Better list styling */
          .rich-text-editor .ql-editor ul,
          .rich-text-editor .ql-editor ol {
            padding-left: 1.5rem;
          }

          .rich-text-editor .ql-editor li {
            margin-bottom: 0.25rem;
          }

          /* Better link styling */
          .rich-text-editor .ql-editor a {
            color: #2563eb;
            text-decoration: underline;
          }

          .rich-text-editor .ql-editor a:hover {
            color: #1d4ed8;
          }

          /* Better blockquote styling */
          .rich-text-editor .ql-editor blockquote {
            border-left: 4px solid #e5e7eb;
            padding-left: 1rem;
            margin: 1rem 0;
            color: #6b7280;
            font-style: italic;
          }

          /* Better code block styling */
          .rich-text-editor .ql-editor pre.ql-syntax {
            background-color: #1f2937;
            color: #f9fafb;
            border-radius: 0.375rem;
            padding: 1rem;
            overflow-x: auto;
            font-family: "Monaco", "Courier New", monospace;
            font-size: 0.8125rem;
            line-height: 1.5;
          }

          /* Better heading styles */
          .rich-text-editor .ql-editor h1 {
            font-size: 2rem;
            font-weight: 700;
            margin-top: 1.5rem;
            margin-bottom: 1rem;
            line-height: 1.25;
          }

          .rich-text-editor .ql-editor h2 {
            font-size: 1.5rem;
            font-weight: 600;
            margin-top: 1.25rem;
            margin-bottom: 0.75rem;
            line-height: 1.3;
          }

          .rich-text-editor .ql-editor h3 {
            font-size: 1.25rem;
            font-weight: 600;
            margin-top: 1rem;
            margin-bottom: 0.5rem;
            line-height: 1.4;
          }

          /* Better image styling */
          .rich-text-editor .ql-editor img {
            max-width: 100%;
            height: auto;
            border-radius: 0.375rem;
            margin: 0.5rem 0;
          }

          /* Focus state for better accessibility */
          .rich-text-editor .ql-editor:focus {
            outline: none;
          }

          /* Scrollbar styling */
          .rich-text-editor .ql-editor::-webkit-scrollbar {
            width: 8px;
          }

          .rich-text-editor .ql-editor::-webkit-scrollbar-track {
            background: #f1f1f1;
            border-radius: 4px;
          }

          .rich-text-editor .ql-editor::-webkit-scrollbar-thumb {
            background: #cbd5e1;
            border-radius: 4px;
          }

          .rich-text-editor .ql-editor::-webkit-scrollbar-thumb:hover {
            background: #94a3b8;
          }
        `}</style>
      </div>
    );
  }
);

FormRichText.displayName = "FormRichText";
