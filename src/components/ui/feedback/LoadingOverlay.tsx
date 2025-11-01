/**
 * LoadingOverlay Component
 * 
 * A versatile loading overlay component that displays loading states with various
 * animations and optional cancellation support.
 * 
 * @example
 * ```tsx
 * <LoadingOverlay 
 *   visible={loading}
 *   message="Loading products..."
 *   variant="spinner"
 *   cancellable={true}
 *   onCancel={handleCancel}
 * />
 * ```
 */

import React, { useEffect, useState } from 'react';
import { Loader2, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import UnifiedButton from '@/components/ui/unified/Button';

export interface LoadingOverlayProps {
  /** Whether the overlay is visible */
  visible: boolean;
  /** Loading message to display */
  message?: string;
  /** Variant of the loading animation */
  variant?: 'spinner' | 'pulse' | 'dots' | 'bars';
  /** Whether to blur the background */
  blur?: boolean;
  /** Progress percentage (0-100) */
  progress?: number;
  /** Whether the operation can be cancelled */
  cancellable?: boolean;
  /** Callback when cancel is clicked */
  onCancel?: () => void;
  /** Timeout in milliseconds before showing slow warning */
  timeout?: number;
  /** Whether to show as a small inline loader instead of full overlay */
  inline?: boolean;
  /** Custom z-index */
  zIndex?: number;
  /** Additional class name */
  className?: string;
}

export const LoadingOverlay = React.forwardRef<HTMLDivElement, LoadingOverlayProps>(
  (
    {
      visible,
      message = 'Loading...',
      variant = 'spinner',
      blur = true,
      progress,
      cancellable = false,
      onCancel,
      timeout = 10000,
      inline = false,
      zIndex = 50,
      className,
    },
    ref
  ) => {
    const [showSlowWarning, setShowSlowWarning] = useState(false);

    useEffect(() => {
      if (!visible || !timeout) return;

      const timer = setTimeout(() => {
        setShowSlowWarning(true);
      }, timeout);

      return () => {
        clearTimeout(timer);
        setShowSlowWarning(false);
      };
    }, [visible, timeout]);

    if (!visible) return null;

    const renderAnimation = () => {
      switch (variant) {
        case 'spinner':
          return <Loader2 className="w-8 h-8 animate-spin text-primary" />;

        case 'pulse':
          return (
            <div className="flex gap-2">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="w-3 h-3 bg-primary rounded-full animate-pulse"
                  style={{ animationDelay: `${i * 0.15}s` }}
                />
              ))}
            </div>
          );

        case 'dots':
          return (
            <div className="flex gap-2">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="w-2 h-2 bg-primary rounded-full animate-bounce"
                  style={{ animationDelay: `${i * 0.1}s` }}
                />
              ))}
            </div>
          );

        case 'bars':
          return (
            <div className="flex gap-1 items-end h-8">
              {[0, 1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="w-1.5 bg-primary rounded-full animate-pulse"
                  style={{
                    height: `${20 + Math.random() * 80}%`,
                    animationDelay: `${i * 0.1}s`,
                  }}
                />
              ))}
            </div>
          );

        default:
          return <Loader2 className="w-8 h-8 animate-spin text-primary" />;
      }
    };

    if (inline) {
      return (
        <div
          ref={ref}
          className={cn(
            'flex flex-col items-center justify-center py-8',
            className
          )}
        >
          {renderAnimation()}
          {message && (
            <p className="text-sm text-textSecondary mt-3">{message}</p>
          )}
          {typeof progress === 'number' && (
            <div className="w-full max-w-xs mt-4">
              <div className="h-1.5 bg-surface rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-300 rounded-full"
                  style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
                />
              </div>
              <p className="text-xs text-textSecondary text-center mt-2">
                {Math.round(progress)}%
              </p>
            </div>
          )}
        </div>
      );
    }

    return (
      <div
        ref={ref}
        className={cn(
          'fixed inset-0 flex items-center justify-center transition-all duration-200',
          blur ? 'backdrop-blur-sm' : '',
          className
        )}
        style={{ zIndex }}
      >
        {/* Background overlay */}
        <div className="absolute inset-0 bg-black/50" />

        {/* Content */}
        <div className="relative bg-surface border border-border rounded-lg p-6 shadow-2xl max-w-sm mx-4 min-w-[280px]">
          {/* Cancel button */}
          {cancellable && onCancel && (
            <button
              onClick={onCancel}
              className="absolute top-3 right-3 text-textSecondary hover:text-text transition-colors"
              aria-label="Cancel"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          {/* Animation */}
          <div className="flex justify-center mb-4">{renderAnimation()}</div>

          {/* Message */}
          {message && (
            <p className="text-center text-text font-medium mb-2">{message}</p>
          )}

          {/* Progress bar */}
          {typeof progress === 'number' && (
            <div className="mt-4">
              <div className="h-2 bg-background rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-300 rounded-full"
                  style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
                />
              </div>
              <p className="text-xs text-textSecondary text-center mt-2">
                {Math.round(progress)}%
              </p>
            </div>
          )}

          {/* Slow warning */}
          {showSlowWarning && (
            <div className="mt-4 p-3 bg-warning/10 border border-warning/20 rounded-lg">
              <p className="text-xs text-warning text-center">
                This is taking longer than expected...
              </p>
            </div>
          )}

          {/* Cancel action */}
          {cancellable && onCancel && (
            <div className="mt-4 flex justify-center">
              <UnifiedButton
                variant="outline"
                size="sm"
                onClick={onCancel}
              >
                Cancel
              </UnifiedButton>
            </div>
          )}
        </div>
      </div>
    );
  }
);

LoadingOverlay.displayName = 'LoadingOverlay';

/**
 * Hook for managing loading overlay state
 * 
 * @example
 * ```tsx
 * const { showLoading, hideLoading, setProgress } = useLoadingOverlay();
 * 
 * const handleSubmit = async () => {
 *   showLoading('Saving product...');
 *   try {
 *     await saveProduct();
 *     hideLoading();
 *   } catch (error) {
 *     hideLoading();
 *   }
 * };
 * ```
 */
export function useLoadingOverlay() {
  const [state, setState] = useState({
    visible: false,
    message: 'Loading...',
    progress: undefined as number | undefined,
  });

  const showLoading = (message?: string, progress?: number) => {
    setState({ visible: true, message: message || 'Loading...', progress });
  };

  const hideLoading = () => {
    setState((prev) => ({ ...prev, visible: false }));
  };

  const setProgress = (progress: number) => {
    setState((prev) => ({ ...prev, progress }));
  };

  const setMessage = (message: string) => {
    setState((prev) => ({ ...prev, message }));
  };

  return {
    ...state,
    showLoading,
    hideLoading,
    setProgress,
    setMessage,
  };
}
