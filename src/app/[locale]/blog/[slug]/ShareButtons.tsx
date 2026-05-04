"use client";

import { useState } from "react";

interface ShareButtonsProps {
  title: string;
}

export function ShareButtons({ title }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopied(true);
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
    <div className="flex items-center gap-3 pt-6 mt-6 border-t border-zinc-200 dark:border-zinc-700">
      <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Share:</span>
      <button
        type="button"
        onClick={handleCopy}
        className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 px-3 py-1.5 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
      >
        🔗 {copied ? "Copied!" : "Copy Link"}
      </button>
      <button
        type="button"
        onClick={handleTwitterShare}
        className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 px-3 py-1.5 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
      >
        🐦 Share on X
      </button>
    </div>
  );
}
