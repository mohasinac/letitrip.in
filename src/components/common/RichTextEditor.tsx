"use client";

import React, { useCallback, useMemo, useRef } from "react";

/**
 * Rich Text Editor Component
 * For product descriptions, blog posts, and other rich content
 * Includes basic formatting, lists, links, and HTML output
 */

type EditorTool =
  | "bold"
  | "italic"
  | "underline"
  | "strikethrough"
  | "h1"
  | "h2"
  | "h3"
  | "ul"
  | "ol"
  | "link"
  | "blockquote"
  | "code"
  | "undo"
  | "redo"
  | "clear";

interface EditorButton {
  tool: EditorTool;
  icon: string;
  label: string;
  command?: string;
  value?: string;
}

interface RichTextEditorProps {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: number;
  maxHeight?: number;
  disabled?: boolean;
  error?: string;
  showCharCount?: boolean;
  maxChars?: number;
  tools?: EditorTool[];
  className?: string;
}

const DEFAULT_TOOLS: EditorTool[] = [
  "bold",
  "italic",
  "underline",
  "strikethrough",
  "h1",
  "h2",
  "h3",
  "ul",
  "ol",
  "link",
  "blockquote",
  "undo",
  "redo",
  "clear",
];

const EDITOR_BUTTONS: EditorButton[] = [
  { tool: "bold", icon: "𝐁", label: "Bold", command: "bold" },
  { tool: "italic", icon: "𝐼", label: "Italic", command: "italic" },
  { tool: "underline", icon: "U̲", label: "Underline", command: "underline" },
  {
    tool: "strikethrough",
    icon: "S̶",
    label: "Strikethrough",
    command: "strikeThrough",
  },
  {
    tool: "h1",
    icon: "H1",
    label: "Heading 1",
    command: "formatBlock",
    value: "h1",
  },
  {
    tool: "h2",
    icon: "H2",
    label: "Heading 2",
    command: "formatBlock",
    value: "h2",
  },
  {
    tool: "h3",
    icon: "H3",
    label: "Heading 3",
    command: "formatBlock",
    value: "h3",
  },
  {
    tool: "ul",
    icon: "• List",
    label: "Bullet List",
    command: "insertUnorderedList",
  },
  {
    tool: "ol",
    icon: "1. List",
    label: "Numbered List",
    command: "insertOrderedList",
  },
  { tool: "link", icon: "🔗", label: "Insert Link", command: "createLink" },
  {
    tool: "blockquote",
    icon: "❝",
    label: "Quote",
    command: "formatBlock",
    value: "blockquote",
  },
  { tool: "undo", icon: "↶", label: "Undo", command: "undo" },
  { tool: "redo", icon: "↷", label: "Redo", command: "redo" },
  { tool: "clear", icon: "✕", label: "Clear Format", command: "removeFormat" },
];

export default function RichTextEditor({
  value,
  onChange,
  placeholder = "Enter text...",
  minHeight = 200,
  maxHeight = 600,
  disabled = false,
  error,
  showCharCount = false,
  maxChars,
  tools = DEFAULT_TOOLS,
  className = "",
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const isInitialized = useRef(false);

  // Filter buttons based on enabled tools
  const visibleButtons = useMemo(
    () => EDITOR_BUTTONS.filter((btn) => tools.includes(btn.tool)),
    [tools]
  );

  // Initialize editor content only once
  React.useEffect(() => {
    if (editorRef.current && !isInitialized.current) {
      editorRef.current.innerHTML = value;
      isInitialized.current = true;
    }
  }, []);

  // Execute editor command
  const executeCommand = useCallback(
    (command: string, value?: string) => {
      if (disabled) return;

      if (command === "createLink") {
        const url = prompt("Enter URL:");
        if (url) {
          document.execCommand(command, false, url);
        }
      } else {
        document.execCommand(command, false, value);
      }

      // Update value after command
      if (editorRef.current) {
        onChange(editorRef.current.innerHTML);
      }

      // Refocus editor
      editorRef.current?.focus();
    },
    [disabled, onChange]
  );

  // Handle content change
  const handleInput = useCallback(() => {
    if (editorRef.current) {
      const html = editorRef.current.innerHTML;

      // Check character limit
      if (maxChars) {
        const text = editorRef.current.innerText;
        if (text.length > maxChars) {
          return; // Don't update if over limit
        }
      }

      onChange(html);
    }
  }, [maxChars, onChange]);

  // Handle paste (strip formatting optionally)
  const handlePaste = useCallback(
    (e: React.ClipboardEvent) => {
      if (disabled) return;

      e.preventDefault();
      const text = e.clipboardData.getData("text/plain");
      document.execCommand("insertText", false, text);
    },
    [disabled]
  );

  // Get character count
  const charCount = useMemo(() => {
    if (!showCharCount) return 0;
    const div = document.createElement("div");
    div.innerHTML = value;
    return div.innerText.length;
  }, [value, showCharCount]);

  // Check if over limit
  const isOverLimit = maxChars ? charCount > maxChars : false;

  return (
    <div className={`rich-text-editor ${className}`}>
      {/* Toolbar */}
      <div
        className={`
        flex flex-wrap gap-1 p-2 border-b border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800
        rounded-t-lg
        ${disabled ? "opacity-50 cursor-not-allowed" : ""}
      `}
      >
        {visibleButtons.map((btn, idx) => (
          <React.Fragment key={btn.tool}>
            {/* Add separator before undo/redo and clear */}
            {(btn.tool === "undo" || btn.tool === "clear") && idx > 0 && (
              <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />
            )}

            <button
              type="button"
              onClick={() => executeCommand(btn.command || "", btn.value)}
              disabled={disabled}
              className={`
                px-2 py-1 text-sm rounded
                text-gray-700 dark:text-gray-300
                hover:bg-gray-200 dark:hover:bg-gray-700
                active:bg-gray-300 dark:active:bg-gray-600
                disabled:cursor-not-allowed disabled:opacity-50
                transition-colors
              `}
              title={btn.label}
              aria-label={btn.label}
            >
              {btn.icon}
            </button>
          </React.Fragment>
        ))}
      </div>

      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable={!disabled}
        onInput={handleInput}
        onPaste={handlePaste}
        dir="ltr"
        suppressContentEditableWarning
        className={`
          px-4 py-3 outline-none overflow-y-auto
          prose prose-sm max-w-none dark:prose-invert
          text-gray-900 dark:text-white text-left
          ${
            disabled
              ? "bg-gray-100 dark:bg-gray-700 cursor-not-allowed"
              : "bg-white dark:bg-gray-800"
          }
          ${error ? "border-red-500" : "border-gray-300 dark:border-gray-600"}
          border-x border-b rounded-b-lg
          focus:ring-2 focus:ring-blue-500
        `}
        style={{
          minHeight: `${minHeight}px`,
          maxHeight: `${maxHeight}px`,
          textAlign: "left",
          unicodeBidi: "plaintext",
        }}
        data-placeholder={!value ? placeholder : ""}
      />

      {/* Footer */}
      <div className="flex justify-between items-center mt-2 text-sm">
        {/* Error message */}
        {error && (
          <span className="text-red-600 dark:text-red-400">{error}</span>
        )}

        {/* Character count */}
        {showCharCount && (
          <span
            className={`
            ml-auto
            ${
              isOverLimit
                ? "text-red-600 dark:text-red-400 font-semibold"
                : "text-gray-600 dark:text-gray-400"
            }
          `}
          >
            {charCount}
            {maxChars ? ` / ${maxChars}` : ""} characters
          </span>
        )}
      </div>

      {/* CSS for placeholder */}
      <style jsx>{`
        [contenteditable][data-placeholder]:empty:before {
          content: attr(data-placeholder);
          color: #9ca3af;
          pointer-events: none;
        }
        [contenteditable]:focus {
          outline: none;
        }
      `}</style>
    </div>
  );
}
