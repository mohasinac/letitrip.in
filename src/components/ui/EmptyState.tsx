"use client";

import { Card, Heading, Text, Button } from "@/components";
import { THEME_CONSTANTS } from "@/constants";

/**
 * EmptyState Component
 *
 * Centered icon + title + description + CTA button.
 * Uses warm amber CTA from THEME_CONSTANTS.accent.warm.
 *
 * @example
 * ```tsx
 * <EmptyState
 *   icon={<ShoppingBagIcon />}
 *   title="No orders yet"
 *   description="Start shopping to see your orders here"
 *   actionLabel="Browse Products"
 *   onAction={() => router.push('/products')}
 * />
 * ```
 */

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  className = "",
}: EmptyStateProps) {
  const { spacing, typography, accent } = THEME_CONSTANTS;

  return (
    <Card className={`p-12 text-center ${className}`}>
      <div className="max-w-md mx-auto">
        {icon && (
          <div className="w-24 h-24 mx-auto mb-6 text-gray-400 dark:text-gray-600">
            {icon}
          </div>
        )}

        <Heading level={3} className={`${typography.sectionTitle} mb-3`}>
          {title}
        </Heading>

        {description && (
          <Text className={`${typography.sectionSubtitle} mb-6`}>
            {description}
          </Text>
        )}

        {actionLabel && onAction && (
          <Button variant="warning" onClick={onAction} size="lg">
            {actionLabel}
          </Button>
        )}
      </div>
    </Card>
  );
}
