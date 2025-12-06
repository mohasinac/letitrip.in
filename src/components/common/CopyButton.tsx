/**
 * @fileoverview Copy to Clipboard Component
 * @module src/components/common/CopyButton
 * @description Button component for copying text to clipboard with feedback
 *
 * @created 2025-12-06
 * @pattern Reusable Component
 */

"use client";

import { toastAction } from "@/lib/toast-helper";
import { cn } from "@/lib/utils";
import { Check, Copy } from "lucide-react";
import { useState } from "react";

interface CopyButtonProps {
  /** Text to copy */
  text: string;
  /** Button label (default: "Copy") */
  label?: string;
  /** Show label text */
  showLabel?: boolean;
  /** Custom className */
  className?: string;
  /** Size variant */
  size?: "sm" | "md" | "lg";
  /** Style variant */
  variant?: "default" | "ghost" | "outline";
  /** Callback after successful copy */
  onCopy?: () => void;
}

/**
 * CopyButton component for copying text to clipboard
 * Shows check icon briefly after successful copy
 */
export function CopyButton({
  text,
  label = "Copy",
  showLabel = false,
  className,
  size = "md",
  variant = "ghost",
  onCopy,
}: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toastAction.copied();
      if (onCopy) onCopy();

      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  const sizeClasses = {
    sm: "px-2 py-1 text-xs",
    md: "px-3 py-2 text-sm",
    lg: "px-4 py-3 text-base",
  };

  const variantClasses = {
    default: "bg-purple-600 hover:bg-purple-700 text-white",
    ghost:
      "hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300",
    outline:
      "border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300",
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={cn(
        "inline-flex items-center gap-2 rounded-lg font-medium transition-colors",
        sizeClasses[size],
        variantClasses[variant],
        copied && "text-green-600 dark:text-green-400",
        className
      )}
      disabled={copied}
      aria-label={copied ? "Copied!" : label}
    >
      {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
      {showLabel && <span>{copied ? "Copied!" : label}</span>}
    </button>
  );
}

/**
 * Inline copy button (small, no label, for use in text)
 */
export function InlineCopyButton({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
  return (
    <CopyButton
      text={text}
      size="sm"
      variant="ghost"
      className={cn("ml-1", className)}
    />
  );
}

/**
 * Code block with copy button
 */
export function CopyableCode({
  code,
  language,
  className,
}: {
  code: string;
  language?: string;
  className?: string;
}) {
  return (
    <div className={cn("relative group", className)}>
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <CopyButton text={code} variant="outline" size="sm" />
      </div>
      <pre className="bg-gray-900 dark:bg-gray-950 text-gray-100 p-4 rounded-lg overflow-x-auto">
        <code className={language ? `language-${language}` : undefined}>
          {code}
        </code>
      </pre>
    </div>
  );
}

export default CopyButton;
