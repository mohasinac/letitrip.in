"use client";

/**
 * Client Link Wrapper
 * 
 * A client component wrapper for Next.js Link that can be passed
 * to other client components without serialization issues.
 */

import Link from "next/link";
import type { ComponentType, ReactNode } from "react";

export interface ClientLinkProps {
  href: string;
  className?: string;
  children: ReactNode;
  target?: string;
  rel?: string;
  "aria-label"?: string;
  onClick?: (e: React.MouseEvent) => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  onKeyDown?: (e: React.KeyboardEvent) => void;
  role?: string;
  tabIndex?: number;
}

/**
 * ClientLink component
 * 
 * A client-side wrapper around Next.js Link that can be passed
 * to other client components as the LinkComponent prop.
 */
export const ClientLink: ComponentType<ClientLinkProps> = ({
  href,
  className,
  children,
  target,
  rel,
  "aria-label": ariaLabel,
  onClick,
  onMouseEnter,
  onMouseLeave,
  onKeyDown,
  role,
  tabIndex,
}) => {
  return (
    <Link
      href={href}
      className={className}
      target={target}
      rel={rel}
      aria-label={ariaLabel}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onKeyDown={onKeyDown}
      role={role}
      tabIndex={tabIndex}
    >
      {children}
    </Link>
  );
};

export default ClientLink;
