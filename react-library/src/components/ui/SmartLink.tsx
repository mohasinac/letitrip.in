/**
 * SmartLink Component
 *
 * Framework-agnostic smart link that automatically handles internal/external links.
 * Shows icons for external and download links.
 *
 * @example
 * ```tsx
 * <SmartLink href="/products">Internal Link</SmartLink>
 * <SmartLink href="https://example.com" showExternalIcon>External</SmartLink>
 * <SmartLink href="/file.pdf" download>Download PDF</SmartLink>
 * ```
 */

import React from "react";

export interface SmartLinkProps
  extends Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href"> {
  /** Link destination */
  href: string;
  /** Link children */
  children: React.ReactNode;
  /** Force external behavior */
  external?: boolean;
  /** Open in new tab */
  newTab?: boolean;
  /** Show external link icon */
  showExternalIcon?: boolean;
  /** Show download icon */
  showDownloadIcon?: boolean;
  /** Download attribute */
  download?: boolean | string;
  /** Custom rel attribute */
  rel?: string;
  /** Custom target attribute */
  target?: string;
  /** Additional CSS classes */
  className?: string;
  /** Custom ExternalLink icon */
  ExternalIcon?: React.ComponentType<{ className?: string }>;
  /** Custom Download icon */
  DownloadIcon?: React.ComponentType<{ className?: string }>;
}

// Inline cn utility
function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(" ");
}

// Default inline SVG icons
function DefaultExternalIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        d="M4.25 5.5a.75.75 0 00-.75.75v8.5c0 .414.336.75.75.75h8.5a.75.75 0 00.75-.75v-4a.75.75 0 011.5 0v4A2.25 2.25 0 0112.75 17h-8.5A2.25 2.25 0 012 14.75v-8.5A2.25 2.25 0 014.25 4h5a.75.75 0 010 1.5h-5z"
        clipRule="evenodd"
      />
      <path
        fillRule="evenodd"
        d="M6.194 12.753a.75.75 0 001.06.053L16.5 4.44v2.81a.75.75 0 001.5 0v-4.5a.75.75 0 00-.75-.75h-4.5a.75.75 0 000 1.5h2.553l-9.056 8.194a.75.75 0 00-.053 1.06z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function DefaultDownloadIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M10.75 2.75a.75.75 0 00-1.5 0v8.614L6.295 8.235a.75.75 0 10-1.09 1.03l4.25 4.5a.75.75 0 001.09 0l4.25-4.5a.75.75 0 00-1.09-1.03l-2.955 3.129V2.75z" />
      <path d="M3.5 12.75a.75.75 0 00-1.5 0v2.5A2.75 2.75 0 004.75 18h10.5A2.75 2.75 0 0018 15.25v-2.5a.75.75 0 00-1.5 0v2.5c0 .69-.56 1.25-1.25 1.25H4.75c-.69 0-1.25-.56-1.25-1.25v-2.5z" />
    </svg>
  );
}

// Helper functions
function isExternalUrl(href: string): boolean {
  return /^https?:\/\//.test(href) || href.startsWith("//");
}

function isDownloadableLink(href: string): boolean {
  const downloadableExtensions = [
    ".pdf",
    ".zip",
    ".doc",
    ".docx",
    ".xls",
    ".xlsx",
    ".csv",
  ];
  return downloadableExtensions.some((ext) => href.toLowerCase().endsWith(ext));
}

export function SmartLink({
  href,
  children,
  external: forceExternal,
  newTab,
  showExternalIcon = true,
  showDownloadIcon = true,
  download,
  rel: customRel,
  target: customTarget,
  className = "",
  ExternalIcon = DefaultExternalIcon,
  DownloadIcon = DefaultDownloadIcon,
  ...props
}: SmartLinkProps) {
  const isExternal = forceExternal ?? isExternalUrl(href);
  const isDownload = download || isDownloadableLink(href);
  const shouldOpenNewTab = newTab || isExternal;

  // Build rel attribute
  const relParts: string[] = [];
  if (customRel) {
    relParts.push(customRel);
  } else if (isExternal) {
    relParts.push("noopener", "noreferrer");
  }
  const rel = relParts.length > 0 ? relParts.join(" ") : undefined;

  // Build target attribute
  const target = customTarget ?? (shouldOpenNewTab ? "_blank" : undefined);

  // Build download attribute
  const downloadAttr = download === true ? "" : download || undefined;

  return (
    <a
      href={href}
      rel={rel}
      target={target}
      download={downloadAttr}
      className={cn("inline-flex items-center gap-1", className)}
      {...props}
    >
      {children}
      {showExternalIcon && isExternal && !isDownload && (
        <ExternalIcon className="w-4 h-4 inline-block flex-shrink-0" />
      )}
      {showDownloadIcon && isDownload && (
        <DownloadIcon className="w-4 h-4 inline-block flex-shrink-0" />
      )}
    </a>
  );
}

export default SmartLink;
