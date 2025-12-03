"use client";

import React, { forwardRef, useMemo } from "react";
import Link from "next/link";
import { getLinkType, resolveUrl, isDownloadableLink } from "@/lib/link-utils";

/**
 * External link icon (opens in new tab indicator)
 */
const ExternalIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 20 20"
    fill="currentColor"
    className={className}
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

/**
 * Download icon
 */
const DownloadIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 20 20"
    fill="currentColor"
    className={className}
    aria-hidden="true"
  >
    <path d="M10.75 2.75a.75.75 0 00-1.5 0v8.614L6.295 8.235a.75.75 0 10-1.09 1.03l4.25 4.5a.75.75 0 001.09 0l4.25-4.5a.75.75 0 00-1.09-1.03l-2.955 3.129V2.75z" />
    <path d="M3.5 12.75a.75.75 0 00-1.5 0v2.5A2.75 2.75 0 004.75 18h10.5A2.75 2.75 0 0018 15.25v-2.5a.75.75 0 00-1.5 0v2.5c0 .69-.56 1.25-1.25 1.25H4.75c-.69 0-1.25-.56-1.25-1.25v-2.5z" />
  </svg>
);

export interface SmartLinkProps extends Omit<
  React.AnchorHTMLAttributes<HTMLAnchorElement>,
  "href"
> {
  /** The link destination - can be relative path or full URL */
  href: string;
  /** Children to render inside the link */
  children: React.ReactNode;
  /** Additional CSS classes */
  className?: string;
  /** Force external behavior (opens in new tab) */
  external?: boolean;
  /** Force internal behavior (uses Next.js Link) */
  internal?: boolean;
  /** Open in new tab regardless of link type */
  newTab?: boolean;
  /** Show external link icon for external links */
  showExternalIcon?: boolean;
  /** Show download icon for downloadable files */
  showDownloadIcon?: boolean;
  /** Mark as download link with optional filename */
  download?: boolean | string;
  /** Custom rel attribute (overrides default) */
  rel?: string;
  /** Custom target attribute (overrides default) */
  target?: string;
  /** Prefetch the page (for Next.js Link) */
  prefetch?: boolean;
  /** Scroll to top on navigation (for Next.js Link) */
  scroll?: boolean;
  /** Replace instead of push to history (for Next.js Link) */
  replace?: boolean;
  /** Additional rel values to append (nofollow, sponsored, ugc) */
  relAppend?: string[];
  /** Callback when link is clicked */
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
  /** Disable the link */
  disabled?: boolean;
  /** Accessible label for screen readers */
  "aria-label"?: string;
  /** Title attribute */
  title?: string;
}

/**
 * SmartLink Component
 *
 * A flexible link component that automatically handles:
 * - Internal links using Next.js Link for client-side navigation
 * - External links with proper security attributes
 * - Email links (mailto:)
 * - Phone links (tel:)
 * - Download links
 *
 * @example
 * // Internal link (uses Next.js Link)
 * <SmartLink href="/products">Products</SmartLink>
 *
 * // External link (opens in new tab with security attrs)
 * <SmartLink href="https://example.com">Visit</SmartLink>
 *
 * // Show external icon
 * <SmartLink href="https://example.com" showExternalIcon>
 *   External Site <ExternalIcon />
 * </SmartLink>
 *
 * // Force new tab for internal link
 * <SmartLink href="/about" newTab>About (new tab)</SmartLink>
 *
 * // Download link
 * <SmartLink href="/files/report.pdf" download="report.pdf">
 *   Download Report
 * </SmartLink>
 */
export const SmartLink = forwardRef<HTMLAnchorElement, SmartLinkProps>(
  (
    {
      href,
      children,
      className = "",
      external,
      internal,
      newTab,
      showExternalIcon,
      showDownloadIcon,
      download,
      rel,
      target,
      prefetch = true,
      scroll = true,
      replace = false,
      relAppend = [],
      onClick,
      disabled,
      "aria-label": ariaLabel,
      title,
      ...props
    },
    ref,
  ) => {
    // Determine link type and behavior
    const linkInfo = useMemo(() => {
      // Empty or disabled - render as span
      if (!href || disabled) {
        return {
          type: "disabled" as const,
          isInternal: false,
          openInNewTab: false,
          resolvedHref: href || "#",
        };
      }

      // Determine type
      const linkType = getLinkType(href);

      // Force external/internal behavior if specified
      const isForceExternal = external === true;
      const isForceInternal = internal === true;

      // Determine if internal
      let isInternalResult = linkType === "internal" || linkType === "anchor";
      if (isForceExternal) isInternalResult = false;
      if (isForceInternal) isInternalResult = true;

      // Determine if should open in new tab
      let openInNewTab = newTab === true || linkType === "external";
      if (isForceInternal && !newTab) openInNewTab = false;

      // Check if downloadable
      const isDownload = download !== undefined && download !== false;
      const isDownloadable = isDownload || isDownloadableLink(href);

      return {
        type: linkType,
        isInternal: isInternalResult,
        openInNewTab,
        resolvedHref: resolveUrl(href),
        isDownloadable,
      };
    }, [href, external, internal, newTab, download, disabled]);

    // Build rel attribute
    const computedRel = useMemo(() => {
      if (rel) return rel;

      const relParts: string[] = [];

      // Add security attributes for external links
      if (linkInfo.openInNewTab || !linkInfo.isInternal) {
        relParts.push("noopener", "noreferrer");
      }

      // Append additional rel values
      if (relAppend.length > 0) {
        relParts.push(...relAppend);
      }

      return relParts.length > 0 ? [...new Set(relParts)].join(" ") : undefined;
    }, [rel, linkInfo.openInNewTab, linkInfo.isInternal, relAppend]);

    // Build target attribute
    const computedTarget =
      target || (linkInfo.openInNewTab ? "_blank" : undefined);

    // Build download attribute
    const downloadAttr = useMemo(() => {
      if (download === false) return undefined;
      if (download === true) return "";
      if (typeof download === "string") return download;
      return undefined;
    }, [download]);

    // Build aria-label
    const computedAriaLabel = useMemo(() => {
      if (ariaLabel) return ariaLabel;

      const label: string[] = [];

      if (!linkInfo.isInternal) {
        label.push("Opens in new tab");
      }

      if (linkInfo.isDownloadable) {
        label.push("Download file");
      }

      return label.length > 0 ? label.join(", ") : undefined;
    }, [ariaLabel, linkInfo.isInternal, linkInfo.isDownloadable]);

    // Handle click
    const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
      if (disabled) {
        e.preventDefault();
        return;
      }

      onClick?.(e);
    };

    // Disabled state - render as span
    if (disabled || !href) {
      return (
        <span
          className={`cursor-not-allowed opacity-50 ${className}`}
          aria-disabled="true"
          role="link"
          tabIndex={-1}
        >
          {children}
        </span>
      );
    }

    // Build the content with optional icons
    const content = (
      <>
        {children}
        {showExternalIcon && !linkInfo.isInternal && (
          <ExternalIcon className="inline-block w-3 h-3 ml-1 align-baseline" />
        )}
        {showDownloadIcon && linkInfo.isDownloadable && (
          <DownloadIcon className="inline-block w-3 h-3 ml-1 align-baseline" />
        )}
      </>
    );

    // Email and phone links - use regular anchor
    if (linkInfo.type === "email" || linkInfo.type === "phone") {
      return (
        <a
          ref={ref}
          href={href}
          className={className}
          onClick={handleClick}
          aria-label={computedAriaLabel}
          title={title}
          {...props}
        >
          {content}
        </a>
      );
    }

    // Internal link - use Next.js Link
    if (linkInfo.isInternal) {
      return (
        <Link
          ref={ref}
          href={href}
          className={className}
          prefetch={prefetch}
          scroll={scroll}
          replace={replace}
          target={computedTarget}
          rel={computedRel}
          download={downloadAttr}
          onClick={handleClick}
          aria-label={computedAriaLabel}
          title={title}
          {...props}
        >
          {content}
        </Link>
      );
    }

    // External link - use regular anchor
    return (
      <a
        ref={ref}
        href={href}
        className={className}
        target={computedTarget}
        rel={computedRel}
        download={downloadAttr}
        onClick={handleClick}
        aria-label={computedAriaLabel}
        title={title}
        {...props}
      >
        {content}
      </a>
    );
  },
);

SmartLink.displayName = "SmartLink";

export default SmartLink;
