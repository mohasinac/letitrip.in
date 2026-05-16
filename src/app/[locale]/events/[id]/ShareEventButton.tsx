"use client";

import { useState } from "react";
import { useToast, Button } from "@mohasinac/appkit/client";

export function ShareEventButton() {
  const [copied, setCopied] = useState(false);
  const { showToast } = useToast();

  const handleCopy = () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopied(true);
      showToast("Link copied to clipboard!", "success");
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <Button
      type="button"
      onClick={handleCopy}
      className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 px-3 py-1.5 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
    >
      🔗 {copied ? "Copied!" : "Copy Link"}
    </Button>
  );
}
