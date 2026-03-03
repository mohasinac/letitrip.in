import React from "react";
import { Nav, Ol, Li } from "../semantic/Semantic";
import Button from "../ui/Button";
import { TextLink } from "../typography/TextLink";
import { THEME_CONSTANTS } from "@/constants";
import { Span } from "../typography/Typography";

/**
 * Breadcrumbs Component
 *
 * Navigation hierarchy showing the user's location in the application.
 * Automatically adds separators between items.
 *
 * @component
 * @example
 * ```tsx
 * <Breadcrumbs>
 *   <BreadcrumbItem href="/">Home</BreadcrumbItem>
 *   <BreadcrumbItem href="/products">Products</BreadcrumbItem>
 *   <BreadcrumbItem current>Detail</BreadcrumbItem>
 * </Breadcrumbs>
 * ```
 */

interface BreadcrumbsProps {
  children: React.ReactNode;
  separator?: React.ReactNode;
  className?: string;
}

export default function Breadcrumbs({
  children,
  separator = "/",
  className = "",
}: BreadcrumbsProps) {
  const items = React.Children.toArray(children);
  const { themed } = THEME_CONSTANTS;

  return (
    <Nav aria-label="Breadcrumb" className={className}>
      <Ol className="flex items-center gap-2 text-sm">
        {items.map((item, index) => (
          <Li key={index} className="flex items-center gap-2">
            {item}
            {index < items.length - 1 && (
              <Span
                className={`${themed.textMuted} select-none`}
                aria-hidden="true"
              >
                {separator}
              </Span>
            )}
          </Li>
        ))}
      </Ol>
    </Nav>
  );
}

// BreadcrumbItem
interface BreadcrumbItemProps {
  href?: string;
  current?: boolean;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export function BreadcrumbItem({
  href,
  current = false,
  children,
  className = "",
  onClick,
}: BreadcrumbItemProps) {
  const { themed } = THEME_CONSTANTS;

  if (current) {
    return (
      <Span
        aria-current="page"
        className={`${themed.textPrimary} font-medium ${className}`}
      >
        {children}
      </Span>
    );
  }

  if (href) {
    return (
      <TextLink
        href={href}
        onClick={onClick}
        className={`
          ${themed.textSecondary}
          hover:${themed.textPrimary}
          hover:underline
          transition-colors
          ${className}
        `}
      >
        {children}
      </TextLink>
    );
  }

  return (
    <Button
      type="button"
      onClick={onClick}
      className={`
        ${themed.textSecondary}
        hover:${themed.textPrimary}
        hover:underline
        transition-colors
        ${className}
      `}
    >
      {children}
    </Button>
  );
}
