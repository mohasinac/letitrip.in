import React from "react";
import { Link } from "@/i18n/navigation";
import { THEME_CONSTANTS } from "@/constants";

/**
 * TextLink Component
 *
 * The single component for ALL anchor/link elements in the app.
 * Use instead of raw `<a>` tags or importing `Link` from `@/i18n/navigation` directly.
 *
 * - Internal URLs (no http/https/mailto prefix) → renders locale-aware `<Link>`
 * - External URLs / mailto / tel → renders `<a target="_blank" rel="noopener noreferrer">`
 * - Pass `external={true}` to force external rendering for any URL.
 *
 * @example
 * ```tsx
 * // Internal navigation
 * <TextLink href={ROUTES.PRODUCTS.LIST}>Browse products</TextLink>
 *
 * // External site
 * <TextLink href="https://example.com" variant="muted">Visit site</TextLink>
 *
 * // Navigation link (no underline, hover colour only)
 * <TextLink href={ROUTES.AUTH.LOGIN} variant="nav">Log in</TextLink>
 *
 * // Danger / destructive link
 * <TextLink href="#" variant="danger" onClick={handleDelete}>Delete account</TextLink>
 * ```
 */

/** Returns true when `href` should open in a new tab (http/https/mailto/tel). */
function isExternalUrl(href: string): boolean {
  return (
    href.startsWith("http://") ||
    href.startsWith("https://") ||
    href.startsWith("mailto:") ||
    href.startsWith("tel:")
  );
}

export interface TextLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  /** Destination URL. Internal paths use locale-aware `Link`; external URLs open in a new tab. */
  href: string;
  /** Visual style variant. Defaults to `"default"` (indigo, hover underline). */
  variant?: "default" | "muted" | "nav" | "danger" | "inherit" | "bare";
  /**
   * Force the link to render as an external `<a>` tag.
   * Auto-detected when `href` starts with http/https/mailto/tel.
   */
  external?: boolean;
  children: React.ReactNode;
}

export function TextLink({
  href,
  variant = "default",
  external,
  className = "",
  children,
  ...props
}: TextLinkProps) {
  const { themed } = THEME_CONSTANTS;

  const variantClasses: Record<
    NonNullable<TextLinkProps["variant"]>,
    string
  > = {
    default:
      "text-primary hover:text-primary/80 underline-offset-2 hover:underline transition-colors duration-150",
    muted: `${themed.textMuted} hover:text-zinc-900 dark:hover:text-white underline-offset-2 hover:underline transition-colors duration-150`,
    nav: `${themed.textSecondary} hover:text-primary transition-colors duration-150`,
    danger:
      "text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 underline-offset-2 hover:underline transition-colors duration-150",
    inherit:
      "underline-offset-2 hover:underline transition-colors duration-150",
    bare: "",
  };

  const resolvedClass = `${variantClasses[variant]} ${className}`.trim();
  const shouldBeExternal = external ?? isExternalUrl(href);

  if (shouldBeExternal) {
    return (
      <Link
        href={href}
        className={resolvedClass}
        target="_blank"
        rel="noopener noreferrer"
        {...props}
      >
        {children}
      </Link>
    );
  }

  // Suppress spread-type warning: next-intl Link is compatible with anchor attrs
  const linkProps = props as Record<string, unknown>;
  return (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    <Link href={href as any} className={resolvedClass} {...(linkProps as any)}>
      {children}
    </Link>
  );
}
