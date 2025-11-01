/**
 * DataCard - A flexible card component for displaying structured data
 * 
 * @example
 * <DataCard
 *   title="Order Information"
 *   icon={<ShoppingCart />}
 *   data={[
 *     { label: "Order ID", value: order.id, copy: true },
 *     { label: "Status", value: <StatusBadge status={order.status} /> },
 *     { label: "Total", value: formatCurrency(order.total), highlight: true },
 *   ]}
 *   columns={2}
 * />
 */

import React, { useState } from 'react';
import { Copy, Check, ExternalLink, Edit, MoreVertical } from 'lucide-react';
import { cn } from '@/lib/utils';
import { UnifiedCard, CardHeader, CardContent } from '@/components/ui/unified/Card';
import { UnifiedButton } from '@/components/ui/unified/Button';
import Link from 'next/link';

export interface DataCardField {
  /** Field label */
  label: string;
  /** Field value (can be React node for custom rendering) */
  value: React.ReactNode;
  /** Enable copy to clipboard */
  copy?: boolean;
  /** Highlight this field (bold, larger) */
  highlight?: boolean;
  /** Link to navigate to */
  link?: string;
  /** Open link in new tab */
  linkExternal?: boolean;
  /** Custom className for the value */
  valueClassName?: string;
  /** Hide on mobile */
  hideOnMobile?: boolean;
}

export interface DataCardAction {
  /** Action label */
  label: string;
  /** Click handler */
  onClick: () => void;
  /** Optional icon */
  icon?: React.ReactNode;
  /** Button variant */
  variant?: 'primary' | 'outline' | 'ghost' | 'destructive';
  /** Loading state */
  loading?: boolean;
  /** Disabled state */
  disabled?: boolean;
}

export interface DataCardProps {
  /** Card title */
  title: string;
  /** Optional icon for the header */
  icon?: React.ReactNode;
  /** Optional subtitle/description */
  subtitle?: string;
  /** Array of data fields to display */
  data: DataCardField[];
  /** Number of columns for the grid layout */
  columns?: 1 | 2 | 3;
  /** Action buttons to display in the header */
  actions?: DataCardAction[];
  /** Loading state */
  loading?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** Collapsible card */
  collapsible?: boolean;
  /** Default collapsed state */
  defaultCollapsed?: boolean;
  /** Card variant */
  variant?: 'default' | 'elevated' | 'outlined' | 'filled' | 'glass';
}

export const DataCard = React.forwardRef<HTMLDivElement, DataCardProps>(
  (
    {
      title,
      icon,
      subtitle,
      data,
      columns = 2,
      actions,
      loading = false,
      className,
      collapsible = false,
      defaultCollapsed = false,
      variant = 'default',
      ...props
    },
    ref
  ) => {
    const [collapsed, setCollapsed] = useState(defaultCollapsed);
    const [copiedField, setCopiedField] = useState<string | null>(null);

    const handleCopy = async (text: string, label: string) => {
      try {
        await navigator.clipboard.writeText(text);
        setCopiedField(label);
        setTimeout(() => setCopiedField(null), 2000);
      } catch (error) {
        console.error('Failed to copy:', error);
      }
    };

    const gridClasses = {
      1: 'grid-cols-1',
      2: 'grid-cols-1 md:grid-cols-2',
      3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    };

    if (loading) {
      return (
        <UnifiedCard
          ref={ref}
          variant={variant}
          className={cn('animate-pulse', className)}
          {...props}
        >
          <CardHeader
            title="Loading..."
            action={
              <div className="flex gap-2">
                <div className="h-8 w-16 bg-surface rounded" />
                <div className="h-8 w-16 bg-surface rounded" />
              </div>
            }
          />
          <CardContent>
            <div className={cn('grid gap-4', gridClasses[columns])}>
              {Array.from({ length: columns * 2 }).map((_, i) => (
                <div key={i}>
                  <div className="h-3 bg-surface rounded w-20 mb-2" />
                  <div className="h-5 bg-surface rounded w-32" />
                </div>
              ))}
            </div>
          </CardContent>
        </UnifiedCard>
      );
    }

    return (
      <UnifiedCard
        ref={ref}
        variant={variant}
        className={className}
        {...props}
      >
        <CardHeader
          title={title}
          subtitle={subtitle}
          avatar={
            icon && (
              <span className="text-primary">
                {React.cloneElement(icon as React.ReactElement, {
                  className: 'w-5 h-5',
                })}
              </span>
            )
          }
          action={
            <div className="flex items-center gap-2">
              {actions?.map((action, index) => (
                <UnifiedButton
                  key={index}
                  onClick={action.onClick}
                  variant={action.variant || 'ghost'}
                  size="sm"
                  loading={action.loading}
                  disabled={action.disabled}
                >
                  {action.icon && (
                    <span className="mr-1">
                      {React.cloneElement(action.icon as React.ReactElement, {
                        className: 'w-4 h-4',
                      })}
                    </span>
                  )}
                  {action.label}
                </UnifiedButton>
              ))}
              {collapsible && (
                <UnifiedButton
                  onClick={() => setCollapsed(!collapsed)}
                  variant="ghost"
                  size="sm"
                >
                  {collapsed ? 'Expand' : 'Collapse'}
                </UnifiedButton>
              )}
            </div>
          }
        />

        {!collapsed && (
          <CardContent>
            <div className={cn('grid gap-4', gridClasses[columns])}>
              {data.map((field, index) => {
                const valueAsString =
                  typeof field.value === 'string' || typeof field.value === 'number'
                    ? String(field.value)
                    : '';
                const isCopied = copiedField === field.label;

                return (
                  <div
                    key={index}
                    className={cn(
                      'space-y-1',
                      field.hideOnMobile && 'hidden md:block'
                    )}
                  >
                    <p className="text-xs text-textSecondary font-medium">
                      {field.label}
                    </p>
                    <div className="flex items-center gap-2">
                      <div
                        className={cn(
                          'font-medium flex-1',
                          field.highlight && 'text-lg text-primary font-semibold',
                          field.valueClassName
                        )}
                      >
                        {field.link ? (
                          <Link
                            href={field.link}
                            target={field.linkExternal ? '_blank' : undefined}
                            rel={field.linkExternal ? 'noopener noreferrer' : undefined}
                            className="text-primary hover:underline inline-flex items-center gap-1"
                          >
                            {field.value}
                            {field.linkExternal && <ExternalLink className="w-3 h-3" />}
                          </Link>
                        ) : (
                          field.value
                        )}
                      </div>

                      {/* Copy Button */}
                      {field.copy && valueAsString && (
                        <button
                          onClick={() => handleCopy(valueAsString, field.label)}
                          className={cn(
                            'p-1 rounded hover:bg-surface transition-colors',
                            isCopied && 'text-success'
                          )}
                          title="Copy to clipboard"
                        >
                          {isCopied ? (
                            <Check className="w-4 h-4" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        )}
      </UnifiedCard>
    );
  }
);

DataCard.displayName = 'DataCard';

/**
 * DataCardGroup - A container for multiple related DataCards
 */
export interface DataCardGroupProps {
  children: React.ReactNode;
  className?: string;
  /** Vertical spacing between cards */
  spacing?: 'sm' | 'md' | 'lg';
}

export const DataCardGroup: React.FC<DataCardGroupProps> = ({
  children,
  className,
  spacing = 'md',
}) => {
  const spacingClasses = {
    sm: 'space-y-2',
    md: 'space-y-4',
    lg: 'space-y-6',
  };

  return (
    <div className={cn(spacingClasses[spacing], className)}>{children}</div>
  );
};
