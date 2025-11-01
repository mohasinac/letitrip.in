/**
 * EmptyState - A component for displaying empty states with actions
 *
 * @example
 * <EmptyState
 *   icon={<Package />}
 *   title="No products found"
 *   description="Get started by adding your first product"
 *   action={{
 *     label: "Add Product",
 *     onClick: handleCreate,
 *     icon: <Plus />
 *   }}
 * />
 */

import React from "react";
import { cn } from "@/lib/utils";
import { UnifiedButton } from "@/components/ui/unified/Button";

export interface EmptyStateAction {
  /** Button label */
  label: string;
  /** Click handler */
  onClick: () => void;
  /** Optional icon */
  icon?: React.ReactNode;
  /** Button variant */
  variant?: "primary" | "outline" | "ghost";
  /** Loading state */
  loading?: boolean;
}

export interface EmptyStateProps {
  /** Icon or illustration to display */
  icon?: React.ReactNode;
  /** Main title */
  title: string;
  /** Description text */
  description?: string;
  /** Primary action button */
  action?: EmptyStateAction;
  /** Secondary action button */
  secondaryAction?: EmptyStateAction;
  /** Variant determines the style */
  variant?:
    | "no-data"
    | "no-results"
    | "error"
    | "no-permission"
    | "coming-soon";
  /** Additional CSS classes */
  className?: string;
  /** Custom image URL instead of icon */
  image?: string;
  /** Image alt text */
  imageAlt?: string;
  /** Additional content to render below actions */
  children?: React.ReactNode;
}

const variantStyles = {
  "no-data": {
    iconColor: "text-textSecondary",
    titleColor: "text-text",
    bgColor: "bg-transparent",
  },
  "no-results": {
    iconColor: "text-info",
    titleColor: "text-text",
    bgColor: "bg-info/5",
  },
  error: {
    iconColor: "text-error",
    titleColor: "text-error",
    bgColor: "bg-error/5",
  },
  "no-permission": {
    iconColor: "text-warning",
    titleColor: "text-text",
    bgColor: "bg-warning/5",
  },
  "coming-soon": {
    iconColor: "text-primary",
    titleColor: "text-text",
    bgColor: "bg-primary/5",
  },
};

export const EmptyState = React.forwardRef<HTMLDivElement, EmptyStateProps>(
  (
    {
      icon,
      title,
      description,
      action,
      secondaryAction,
      variant = "no-data",
      className,
      image,
      imageAlt,
      children,
      ...props
    },
    ref
  ) => {
    const styles = variantStyles[variant];

    return (
      <div
        ref={ref}
        className={cn(
          "flex flex-col items-center justify-center text-center py-12 px-4 rounded-lg",
          styles.bgColor,
          className
        )}
        {...props}
      >
        {/* Icon or Image */}
        {image ? (
          <img
            src={image}
            alt={imageAlt || title}
            className="w-48 h-48 object-contain mb-6 opacity-80"
          />
        ) : icon ? (
          <div className={cn("mb-6", styles.iconColor)}>
            {React.cloneElement(icon as React.ReactElement, {
              className: "w-16 h-16 mx-auto",
              strokeWidth: 1.5,
            })}
          </div>
        ) : null}

        {/* Title */}
        <h3 className={cn("text-lg font-semibold mb-2", styles.titleColor)}>
          {title}
        </h3>

        {/* Description */}
        {description && (
          <p className="text-textSecondary text-sm mb-6 max-w-md">
            {description}
          </p>
        )}

        {/* Actions */}
        {(action || secondaryAction) && (
          <div className="flex flex-col sm:flex-row gap-3 items-center">
            {action && (
              <UnifiedButton
                onClick={action.onClick}
                variant={action.variant || "primary"}
                loading={action.loading}
                className="min-w-[140px]"
              >
                {action.icon && (
                  <span className="mr-2">
                    {React.cloneElement(action.icon as React.ReactElement, {
                      className: "w-4 h-4",
                    })}
                  </span>
                )}
                {action.label}
              </UnifiedButton>
            )}

            {secondaryAction && (
              <UnifiedButton
                onClick={secondaryAction.onClick}
                variant={secondaryAction.variant || "outline"}
                loading={secondaryAction.loading}
                className="min-w-[140px]"
              >
                {secondaryAction.icon && (
                  <span className="mr-2">
                    {React.cloneElement(
                      secondaryAction.icon as React.ReactElement,
                      {
                        className: "w-4 h-4",
                      }
                    )}
                  </span>
                )}
                {secondaryAction.label}
              </UnifiedButton>
            )}
          </div>
        )}

        {/* Additional Content */}
        {children && <div className="mt-6 w-full">{children}</div>}
      </div>
    );
  }
);

EmptyState.displayName = "EmptyState";

/**
 * Common preset empty states for quick use
 */
export const EmptyStatePresets = {
  NoProducts: (props: Partial<EmptyStateProps>) => (
    <EmptyState
      title="No products found"
      description="Get started by adding your first product to your store"
      variant="no-data"
      {...props}
    />
  ),
  NoOrders: (props: Partial<EmptyStateProps>) => (
    <EmptyState
      title="No orders yet"
      description="When customers place orders, they will appear here"
      variant="no-data"
      {...props}
    />
  ),
  NoSearchResults: (props: Partial<EmptyStateProps>) => (
    <EmptyState
      title="No results found"
      description="Try adjusting your search or filters to find what you're looking for"
      variant="no-results"
      {...props}
    />
  ),
  Error: (props: Partial<EmptyStateProps>) => (
    <EmptyState
      title="Something went wrong"
      description="We couldn't load the data. Please try again."
      variant="error"
      {...props}
    />
  ),
  NoPermission: (props: Partial<EmptyStateProps>) => (
    <EmptyState
      title="Access Denied"
      description="You don't have permission to view this content"
      variant="no-permission"
      {...props}
    />
  ),
  ComingSoon: (props: Partial<EmptyStateProps>) => (
    <EmptyState
      title="Coming Soon"
      description="This feature is currently under development"
      variant="coming-soon"
      {...props}
    />
  ),
};
