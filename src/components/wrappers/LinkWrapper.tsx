/**
 * Next.js Link Wrapper for React Library Components
 *
 * This wrapper bridges the gap between pure React components in @letitrip/react-library
 * and Next.js-specific Link component for client-side navigation.
 *
 * @example
 * // In library components:
 * <SomeCard LinkComponent={LinkWrapper} href="/products/123" />
 *
 * // Or wrap library components:
 * <LinkWrapper href="/products/123">
 *   <Button>View Product</Button>
 * </LinkWrapper>
 */

import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

export interface LinkWrapperProps extends ComponentProps<typeof Link> {
  children: ReactNode;
  href: string;
  className?: string;
  /** Allow external links to use <a> tag instead of Next.js Link */
  external?: boolean;
}

export function LinkWrapper({
  children,
  href,
  className,
  external = false,
  ...props
}: LinkWrapperProps) {
  // External links use standard <a> tag
  if (
    external ||
    href.startsWith("http") ||
    href.startsWith("mailto:") ||
    href.startsWith("tel:")
  ) {
    return (
      <a
        href={href}
        className={className}
        target={external ? "_blank" : undefined}
        rel={external ? "noopener noreferrer" : undefined}
        {...(props as any)}
      >
        {children}
      </a>
    );
  }

  // Internal links use Next.js Link
  return (
    <Link href={href} className={className} {...props}>
      {children}
    </Link>
  );
}

export default LinkWrapper;
