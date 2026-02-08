import React from "react";
import { THEME_CONSTANTS } from "@/constants";

/**
 * Card Component
 *
 * A container component for grouping related content with consistent styling.
 * Supports hover effects and multiple visual variants (default, bordered, elevated).
 * Can be composed with CardHeader, CardBody, and CardFooter for structured layouts.
 *
 * @component
 * @example
 * ```tsx
 * <Card hover variant="elevated">
 *   <CardHeader>Title</CardHeader>
 *   <CardBody>Content goes here</CardBody>
 *   <CardFooter>Footer content</CardFooter>
 * </Card>
 * ```
 */

interface CardProps {
  children: React.ReactNode;
  hover?: boolean;
  variant?: "default" | "bordered" | "elevated";
  className?: string;
}

export default function Card({
  children,
  hover = false,
  variant = "default",
  className = "",
}: CardProps) {
  const { card, themed } = THEME_CONSTANTS;

  const variantClasses = {
    default: `${themed.bgSecondary} ${card.shadow}`,
    bordered: `${themed.bgSecondary} border-2 ${themed.border}`,
    elevated: `${themed.bgSecondary} ${card.shadowElevated}`,
  };

  return (
    <div
      className={`
        ${card.base}
        ${variantClasses[variant]}
        ${hover ? card.hover : ""}
        ${className}
      `}
    >
      {children}
    </div>
  );
}

interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export function CardHeader({ children, className = "" }: CardHeaderProps) {
  const { themed } = THEME_CONSTANTS;
  return (
    <div className={`p-4 sm:p-6 border-b ${themed.borderLight} ${className}`}>
      {children}
    </div>
  );
}

interface CardBodyProps {
  children: React.ReactNode;
  className?: string;
}

export function CardBody({ children, className = "" }: CardBodyProps) {
  return <div className={`p-4 sm:p-6 ${className}`}>{children}</div>;
}

interface CardFooterProps {
  children: React.ReactNode;
  className?: string;
}

export function CardFooter({ children, className = "" }: CardFooterProps) {
  const { themed } = THEME_CONSTANTS;
  return (
    <div className={`p-4 sm:p-6 border-t ${themed.borderLight} ${className}`}>
      {children}
    </div>
  );
}
