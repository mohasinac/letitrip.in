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
    <Button rounded="lg" gap="xs"
      type="button"
      onClick={handleCopy}
      border="default" paddingX="sm" paddingY="xs" textSize="sm" weight="medium"
      className="inline- text-[var(--appkit-color-text)] hover:bg-[var(--appkit-color-bg)] transition-colors"
    >
      🔗 {copied ? "Copied!" : "Copy Link"}
    </Button>
  );
}
