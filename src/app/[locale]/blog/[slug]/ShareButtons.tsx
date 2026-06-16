"use client";

import { useState } from "react";
import { useToast, Button } from "@mohasinac/appkit/client";
import { Div, Row, Span } from "@mohasinac/appkit/ui";
interface ShareButtonsProps {
  title: string;
}

export function ShareButtons({ title }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);
  const { showToast } = useToast();

  const handleCopy = () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopied(true);
      showToast("Link copied to clipboard!", "success");
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleTwitterShare = () => {
    window.open(
      "https://twitter.com/intent/tweet?url=" +
        encodeURIComponent(window.location.href) +
        "&text=" +
        encodeURIComponent(title),
      "_blank",
    );
  };

  return (
    <Row border="default" className="mt-6 border-t" padding="t-lg" align="center" gap="3">
      <Span size="sm" weight="medium" color="muted">Share:</Span>
      <Button rounded="lg" gap="xs" 
        type="button"
        onClick={handleCopy}
        className="inline-flex items-center border border-zinc-200 dark:border-zinc-700 px-3 py-1.5 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
      >
        🔗 {copied ? "Copied!" : "Copy Link"}
      </Button>
      <Button rounded="lg" gap="xs" 
        type="button"
        onClick={handleTwitterShare}
        className="inline-flex items-center border border-zinc-200 dark:border-zinc-700 px-3 py-1.5 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
      >
        🐦 Share on X
      </Button>
    </Row>
  );
}
