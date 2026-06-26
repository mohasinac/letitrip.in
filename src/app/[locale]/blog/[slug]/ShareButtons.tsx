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
        border="default" paddingX="sm" paddingY="xs" textSize="sm" weight="medium"
        className="inline- text-[var(--appkit-color-text)] hover:bg-[var(--appkit-color-bg)] transition-colors"
      >
        🔗 {copied ? "Copied!" : "Copy Link"}
      </Button>
      <Button rounded="lg" gap="xs"
        type="button"
        onClick={handleTwitterShare}
        border="default" paddingX="sm" paddingY="xs" textSize="sm" weight="medium"
        className="inline- text-[var(--appkit-color-text)] hover:bg-[var(--appkit-color-bg)] transition-colors"
      >
        🐦 Share on X
      </Button>
    </Row>
  );
}
