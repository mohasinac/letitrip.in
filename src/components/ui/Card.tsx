import React from "react";
import { THEME_CONSTANTS } from "@/constants";

/**
 * Card Component
 *
 * A container component for grouping related content with consistent styling.
 * Supports multiple visual variants including gradients, glass effects, and stat cards.
 * Can be composed with CardHeader, CardBody, and CardFooter for structured layouts.
 *
 * @component
 * @example
 * ```tsx
 * <Card hover variant="elevated">
 *   <CardHeader>Title</CardHeader>
 *   <CardBody>Content goes here</CardBody>
 * </Card>
 *
 * // Gradient card
 * <Card variant="gradient-indigo">
 *   <CardBody>Vibrant content</CardBody>
 * </Card>
 *
 * // Stat card
 * <Card variant="stat-teal">
 *   <CardBody>Statistics</CardBody>
 * </Card>
 * ```
 */

interface CardProps {
  children: React.ReactNode;
  hover?: boolean;
  variant?:
    | "default"
    | "bordered"
    | "elevated"
    | "interactive"
    | "glass"
    | "gradient-indigo"
    | "gradient-teal"
    | "gradient-amber"
    | "gradient-rose"
    | "stat-indigo"
    | "stat-teal"
    | "stat-amber"
    | "stat-rose"
    | "stat-emerald";
  className?: string;
}

export default function Card({
  children,
  hover = false,
  variant = "default",
  className = "",
}: CardProps) {
  const { card, themed, enhancedCard } = THEME_CONSTANTS;

  const variantClasses = {
    default: `${themed.bgSecondary} ${card.shadow}`,
    bordered: `${themed.bgSecondary} border-2 ${themed.border}`,
    elevated: `${themed.bgSecondary} ${card.shadowElevated}`,
    interactive: enhancedCard.interactive,
    glass: enhancedCard.glass,
    // Gradient variants
    "gradient-indigo": enhancedCard.gradient.indigo,
    "gradient-teal": enhancedCard.gradient.teal,
    "gradient-amber": enhancedCard.gradient.amber,
    "gradient-rose": enhancedCard.gradient.rose,
    // Stat card variants
    "stat-indigo": enhancedCard.stat.indigo,
    "stat-teal": enhancedCard.stat.teal,
    "stat-amber": enhancedCard.stat.amber,
    "stat-rose": enhancedCard.stat.rose,
    "stat-emerald": enhancedCard.stat.emerald,
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
