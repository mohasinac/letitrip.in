"use client";

/**
 * RichTextEditor Component
 * Framework-agnostic basic rich text editor
 *
 * Purpose: Simple rich text editor without external dependencies
 * Features: Bold, italic, underline, lists, headings
 * Note: For advanced features, integrate Quill, TinyMCE, or similar
 *
 * @example Basic Usage
 * ```tsx
 * const [content, setContent] = useState('');
 *
 * <RichTextEditor
 *   value={content}
 *   onChange={setContent}
 *   placeholder="Enter content..."
 * />
 * ```
 *
 * @example With Toolbar Customization
 * ```tsx
 * <RichTextEditor
 *   value={content}
 *   onChange={setContent}
 *   toolbar={['bold', 'italic', 'heading1', 'bulletList']}
 *   minHeight="300px"
 * />
 * ```
 */

import { useRef, useState } from "react";

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

export type ToolbarAction =
  | "bold"
  | "italic"
  | "underline"
  | "strikethrough"
  | "heading1"
  | "heading2"
  | "bulletList"
  | "numberedList"
  | "link"
  | "code";

export interface RichTextEditorProps {
  /** Current HTML content */
  value: string;
  /** Called when content changes */
  onChange: (value: string) => void;
  /** Placeholder text */
  placeholder?: string;
  /** Disabled state */
  disabled?: boolean;
  /** Minimum height */
  minHeight?: string;
  /** Toolbar actions to show */
  toolbar?: ToolbarAction[];
  /** Custom className */
  className?: string;
}

const defaultToolbar: ToolbarAction[] = [
  "bold",
  "italic",
  "underline",
  "heading1",
  "heading2",
  "bulletList",
  "numberedList",
];

const toolbarLabels: Record<ToolbarAction, string> = {
  bold: "Bold",
  italic: "Italic",
  underline: "Underline",
  strikethrough: "Strikethrough",
  heading1: "Heading 1",
  heading2: "Heading 2",
  bulletList: "Bullet List",
  numberedList: "Numbered List",
  link: "Insert Link",
  code: "Code",
};

export function RichTextEditor({
  value,
  onChange,
  placeholder = "Enter text...",
  disabled = false,
  minHeight = "200px",
  toolbar = defaultToolbar,
  className,
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isFocused, setIsFocused] = useState(false);

  const execCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
  };

  const handleToolbarAction = (action: ToolbarAction) => {
    if (disabled) return;

    switch (action) {
      case "bold":
        execCommand("bold");
        break;
      case "italic":
        execCommand("italic");
        break;
      case "underline":
        execCommand("underline");
        break;
      case "strikethrough":
        execCommand("strikeThrough");
        break;
      case "heading1":
        execCommand("formatBlock", "<h1>");
        break;
      case "heading2":
        execCommand("formatBlock", "<h2>");
        break;
      case "bulletList":
        execCommand("insertUnorderedList");
        break;
      case "numberedList":
        execCommand("insertOrderedList");
        break;
      case "link":
        const url = prompt("Enter URL:");
        if (url) execCommand("createLink", url);
        break;
      case "code":
        execCommand("formatBlock", "<pre>");
        break;
    }

    // Update value after command
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const handleInput = () => {
    if (editorRef.current && !disabled) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    if (disabled) {
      e.preventDefault();
      return;
    }

    // Prevent pasting formatted HTML, allow only plain text
    e.preventDefault();
    const text = e.clipboardData.getData("text/plain");
    document.execCommand("insertText", false, text);
  };

  return (
    <div className={cn("border rounded-lg overflow-hidden", className)}>
      {/* Toolbar */}
      <div className="flex flex-wrap gap-1 p-2 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        {toolbar.map((action) => (
          <button
            key={action}
            onClick={() => handleToolbarAction(action)}
            disabled={disabled}
            type="button"
            title={toolbarLabels[action]}
            className={cn(
              "px-3 py-1 text-sm rounded",
              "border border-gray-300 dark:border-gray-600",
              "hover:bg-gray-100 dark:hover:bg-gray-700",
              "focus:outline-none focus:ring-2 focus:ring-blue-500",
              "text-gray-700 dark:text-gray-300",
              disabled &&
                "opacity-50 cursor-not-allowed hover:bg-transparent dark:hover:bg-transparent"
            )}
          >
            {action === "bold" && <strong>B</strong>}
            {action === "italic" && <em>I</em>}
            {action === "underline" && <u>U</u>}
            {action === "strikethrough" && <s>S</s>}
            {action === "heading1" && "H1"}
            {action === "heading2" && "H2"}
            {action === "bulletList" && "• List"}
            {action === "numberedList" && "1. List"}
            {action === "link" && "Link"}
            {action === "code" && "</>"}
          </button>
        ))}
      </div>

      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable={!disabled}
        onInput={handleInput}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        onPaste={handlePaste}
        dangerouslySetInnerHTML={{ __html: value }}
        className={cn(
          "p-3 outline-none overflow-y-auto",
          "bg-white dark:bg-gray-900 text-gray-900 dark:text-white",
          "prose dark:prose-invert max-w-none",
          isFocused && "ring-2 ring-blue-500 ring-inset",
          disabled &&
            "bg-gray-50 dark:bg-gray-800 cursor-not-allowed opacity-60",
          !value &&
            !disabled &&
            "before:content-[attr(data-placeholder)] before:text-gray-400 dark:before:text-gray-500"
        )}
        style={{ minHeight }}
        data-placeholder={placeholder}
        aria-label="Rich text editor"
        role="textbox"
        aria-multiline="true"
        aria-disabled={disabled}
      />
    </div>
  );
}
