/**
 * StatsCard - A card component for displaying statistics with trends and icons
 * 
 * @example
 * <StatsCard
 *   title="Total Orders"
 *   value={1234}
 *   icon={<ShoppingCart />}
 *   trend={{ value: 12, direction: "up", label: "from last month" }}
 *   color="primary"
 * />
 */

import React from 'react';
import { TrendingUp, TrendingDown, Minus, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { UnifiedCard } from '@/components/ui/unified/Card';

export interface StatsCardTrend {
  /** The trend value (e.g., 12 for 12%) */
  value: number;
  /** The direction of the trend */
  direction: 'up' | 'down' | 'neutral';
  /** Optional label (e.g., "from last month") */
  label?: string;
  /** Whether to show percentage sign */
  showPercentage?: boolean;
}

export interface StatsCardProps {
  /** The title of the stat */
  title: string;
  /** The main value to display */
  value: string | number;
  /** Optional icon to display */
  icon?: React.ReactNode;
  /** Optional trend information */
  trend?: StatsCardTrend;
  /** Color theme for the icon background */
  color?: 'primary' | 'success' | 'warning' | 'error' | 'info';
  /** Loading state */
  loading?: boolean;
  /** Optional description */
  description?: string;
  /** Click handler */
  onClick?: () => void;
  /** Additional CSS classes */
  className?: string;
  /** Format function for the value */
  formatValue?: (value: string | number) => string;
  /** Optional tooltip */
  tooltip?: string;
}

const colorClasses = {
  primary: 'bg-primary/10 text-primary',
  success: 'bg-success/10 text-success',
  warning: 'bg-warning/10 text-warning',
  error: 'bg-error/10 text-error',
  info: 'bg-info/10 text-info',
};

const trendClasses = {
  up: 'text-success',
  down: 'text-error',
  neutral: 'text-textSecondary',
};

const TrendIcon = ({ direction }: { direction: 'up' | 'down' | 'neutral' }) => {
  const icons = {
    up: TrendingUp,
    down: TrendingDown,
    neutral: Minus,
  };
  const Icon = icons[direction];
  return <Icon className="w-3 h-3" />;
};

export const StatsCard = React.forwardRef<HTMLDivElement, StatsCardProps>(
  (
    {
      title,
      value,
      icon,
      trend,
      color = 'primary',
      loading = false,
      description,
      onClick,
      className,
      formatValue,
      tooltip,
      ...props
    },
    ref
  ) => {
    const formattedValue = formatValue ? formatValue(value) : value;

    if (loading) {
      return (
        <UnifiedCard
          ref={ref}
          variant="elevated"
          className={cn('animate-pulse', className)}
          {...props}
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="h-4 bg-surface rounded w-24 mb-2" />
              <div className="h-8 bg-surface rounded w-32 mb-2" />
              <div className="h-3 bg-surface rounded w-28" />
            </div>
            <div className="w-12 h-12 bg-surface rounded-lg" />
          </div>
        </UnifiedCard>
      );
    }

    return (
      <UnifiedCard
        ref={ref}
        variant="elevated"
        className={cn(
          'transition-all duration-200',
          onClick && 'cursor-pointer hover:shadow-lg hover:-translate-y-0.5',
          className
        )}
        onClick={onClick}
        title={tooltip}
        {...props}
      >
        <div className="flex items-center justify-between">
          {/* Left side - Stats */}
          <div className="flex-1">
            <p className="text-sm text-textSecondary mb-1">{title}</p>
            <h3 className="text-2xl font-bold text-text mb-2">
              {loading ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                formattedValue
              )}
            </h3>

            {/* Trend or Description */}
            {trend && (
              <p
                className={cn(
                  'text-xs flex items-center gap-1',
                  trendClasses[trend.direction]
                )}
              >
                <TrendIcon direction={trend.direction} />
                <span className="font-medium">
                  {trend.direction === 'up' && '+'}
                  {trend.value}
                  {trend.showPercentage !== false && '%'}
                </span>
                {trend.label && (
                  <span className="text-textSecondary">{trend.label}</span>
                )}
              </p>
            )}

            {description && !trend && (
              <p className="text-xs text-textSecondary">{description}</p>
            )}
          </div>

          {/* Right side - Icon */}
          {icon && (
            <div
              className={cn(
                'p-3 rounded-lg transition-transform duration-200',
                colorClasses[color],
                onClick && 'group-hover:scale-110'
              )}
            >
              {React.cloneElement(icon as React.ReactElement, {
                className: 'w-6 h-6',
              })}
            </div>
          )}
        </div>
      </UnifiedCard>
    );
  }
);

StatsCard.displayName = 'StatsCard';

/**
 * StatsCardGrid - A responsive grid container for multiple StatsCards
 */
export interface StatsCardGridProps {
  children: React.ReactNode;
  columns?: 1 | 2 | 3 | 4;
  className?: string;
}

export const StatsCardGrid: React.FC<StatsCardGridProps> = ({
  children,
  columns = 4,
  className,
}) => {
  const gridClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
  };

  return (
    <div className={cn('grid gap-4', gridClasses[columns], className)}>
      {children}
    </div>
  );
};
