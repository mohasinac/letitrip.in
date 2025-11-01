/**
 * ConfirmDialog Component
 * 
 * A reusable confirmation dialog for destructive or important actions.
 * Supports various levels of confirmation including type-to-confirm for critical actions.
 * 
 * @example
 * ```tsx
 * <ConfirmDialog
 *   open={showConfirm}
 *   onClose={() => setShowConfirm(false)}
 *   title="Delete Product"
 *   message="Are you sure you want to delete this product?"
 *   confirmLabel="Delete"
 *   confirmVariant="destructive"
 *   onConfirm={handleDelete}
 *   requiresTyping="DELETE"
 * />
 * ```
 */

import React, { useState, useEffect } from 'react';
import { AlertTriangle, Info, CheckCircle, XCircle, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import UnifiedButton from '@/components/ui/unified/Button';
import UnifiedCard from '@/components/ui/unified/Card';

export interface ConfirmDialogProps {
  /** Whether the dialog is open */
  open: boolean;
  /** Callback when dialog should close */
  onClose: () => void;
  /** Dialog title */
  title: string;
  /** Dialog message/description */
  message: string | React.ReactNode;
  /** Confirm button label */
  confirmLabel?: string;
  /** Cancel button label */
  cancelLabel?: string;
  /** Variant style of the dialog */
  variant?: 'info' | 'warning' | 'danger' | 'success';
  /** Button variant for confirm action */
  confirmVariant?: 'primary' | 'success' | 'warning' | 'outlined' | 'outline' | 'ghost' | 'secondary' | 'destructive' | 'contained' | 'text';
  /** Callback when confirmed */
  onConfirm: () => void | Promise<void>;
  /** Loading state during action */
  loading?: boolean;
  /** Custom icon */
  icon?: React.ReactNode;
  /** Whether to show "Don't show again" checkbox */
  showDontAskAgain?: boolean;
  /** Callback for "Don't show again" state change */
  onDontAskAgainChange?: (checked: boolean) => void;
  /** Require typing a specific word to confirm (for critical actions) */
  requiresTyping?: string;
  /** Consequence preview (what will happen) */
  consequences?: string[];
  /** Additional class name */
  className?: string;
}

export const ConfirmDialog = React.forwardRef<HTMLDivElement, ConfirmDialogProps>(
  (
    {
      open,
      onClose,
      title,
      message,
      confirmLabel = 'Confirm',
      cancelLabel = 'Cancel',
      variant = 'warning',
      confirmVariant = 'primary',
      onConfirm,
      loading = false,
      icon,
      showDontAskAgain = false,
      onDontAskAgainChange,
      requiresTyping,
      consequences = [],
      className,
    },
    ref
  ) => {
    const [dontAskAgain, setDontAskAgain] = useState(false);
    const [typedText, setTypedText] = useState('');
    const [isConfirming, setIsConfirming] = useState(false);

    useEffect(() => {
      if (!open) {
        setTypedText('');
        setDontAskAgain(false);
      }
    }, [open]);

    if (!open) return null;

    const handleConfirm = async () => {
      if (requiresTyping && typedText !== requiresTyping) {
        return;
      }

      setIsConfirming(true);
      try {
        await onConfirm();
        if (showDontAskAgain && onDontAskAgainChange) {
          onDontAskAgainChange(dontAskAgain);
        }
        onClose();
      } catch (error) {
        console.error('Confirm action failed:', error);
      } finally {
        setIsConfirming(false);
      }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !requiresTyping) {
        e.preventDefault();
        handleConfirm();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    const getIcon = () => {
      if (icon) return icon;

      switch (variant) {
        case 'info':
          return <Info className="w-6 h-6 text-info" />;
        case 'warning':
          return <AlertTriangle className="w-6 h-6 text-warning" />;
        case 'danger':
          return <XCircle className="w-6 h-6 text-error" />;
        case 'success':
          return <CheckCircle className="w-6 h-6 text-success" />;
        default:
          return <AlertTriangle className="w-6 h-6 text-warning" />;
      }
    };

    const getIconBgColor = () => {
      switch (variant) {
        case 'info':
          return 'bg-info/10';
        case 'warning':
          return 'bg-warning/10';
        case 'danger':
          return 'bg-error/10';
        case 'success':
          return 'bg-success/10';
        default:
          return 'bg-warning/10';
      }
    };

    const isConfirmDisabled =
      loading || isConfirming || (requiresTyping && typedText !== requiresTyping);

    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200"
        onKeyDown={handleKeyDown}
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Dialog */}
        <UnifiedCard
          ref={ref}
          variant="elevated"
          className={cn(
            'relative w-full max-w-md animate-in zoom-in-95 duration-200',
            className
          )}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-textSecondary hover:text-text transition-colors"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="p-6">
            {/* Icon */}
            <div className={cn('w-12 h-12 rounded-full flex items-center justify-center mb-4', getIconBgColor())}>
              {getIcon()}
            </div>

            {/* Title */}
            <h3 className="text-xl font-semibold text-text mb-2">{title}</h3>

            {/* Message */}
            <div className="text-textSecondary mb-4">
              {typeof message === 'string' ? <p>{message}</p> : message}
            </div>

            {/* Consequences */}
            {consequences.length > 0 && (
              <div className="mb-4 p-3 bg-surface rounded-lg border border-border">
                <p className="text-sm font-medium text-text mb-2">
                  This action will:
                </p>
                <ul className="space-y-1">
                  {consequences.map((consequence, index) => (
                    <li key={index} className="text-sm text-textSecondary flex items-start">
                      <span className="text-error mr-2">•</span>
                      <span>{consequence}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Type to confirm */}
            {requiresTyping && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-text mb-2">
                  Type <span className="font-mono text-error">{requiresTyping}</span> to
                  confirm:
                </label>
                <input
                  type="text"
                  value={typedText}
                  onChange={(e) => setTypedText(e.target.value)}
                  placeholder={requiresTyping}
                  className={cn(
                    'w-full px-3 py-2 bg-background border rounded-lg',
                    'text-text placeholder:text-textSecondary',
                    'focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent',
                    typedText && typedText !== requiresTyping
                      ? 'border-error'
                      : 'border-border'
                  )}
                  autoFocus
                />
                {typedText && typedText !== requiresTyping && (
                  <p className="text-xs text-error mt-1">Text does not match</p>
                )}
              </div>
            )}

            {/* Don't ask again */}
            {showDontAskAgain && (
              <label className="flex items-center gap-2 mb-4 cursor-pointer">
                <input
                  type="checkbox"
                  checked={dontAskAgain}
                  onChange={(e) => setDontAskAgain(e.target.checked)}
                  className="w-4 h-4 rounded border-border text-primary focus:ring-2 focus:ring-primary"
                />
                <span className="text-sm text-textSecondary">
                  Don't ask me again
                </span>
              </label>
            )}

            {/* Actions */}
            <div className="flex gap-3">
              <UnifiedButton
                variant="outline"
                onClick={onClose}
                disabled={isConfirming}
                className="flex-1"
              >
                {cancelLabel}
              </UnifiedButton>
              <UnifiedButton
                variant={confirmVariant}
                onClick={handleConfirm}
                disabled={isConfirming}
                loading={isConfirming || loading}
                className="flex-1"
              >
                {confirmLabel}
              </UnifiedButton>
            </div>
          </div>
        </UnifiedCard>
      </div>
    );
  }
);

ConfirmDialog.displayName = 'ConfirmDialog';

/**
 * Hook for managing confirm dialog state
 * 
 * @example
 * ```tsx
 * const { confirmDialog, confirm } = useConfirmDialog();
 * 
 * const handleDelete = async () => {
 *   const confirmed = await confirm({
 *     title: 'Delete Product',
 *     message: 'Are you sure?',
 *     variant: 'danger',
 *   });
 *   
 *   if (confirmed) {
 *     await deleteProduct();
 *   }
 * };
 * 
 * return (
 *   <>
 *     <button onClick={handleDelete}>Delete</button>
 *     <ConfirmDialog {...confirmDialog} />
 *   </>
 * );
 * ```
 */
export function useConfirmDialog() {
  const [state, setState] = useState<{
    open: boolean;
    title: string;
    message: string;
    variant: ConfirmDialogProps['variant'];
    confirmLabel: string;
    confirmVariant: ConfirmDialogProps['confirmVariant'];
    requiresTyping?: string;
    consequences?: string[];
    onConfirm: () => void;
  }>({
    open: false,
    title: '',
    message: '',
    variant: 'warning',
    confirmLabel: 'Confirm',
    confirmVariant: 'primary',
    onConfirm: () => {},
  });

  const confirm = (
    options: Omit<typeof state, 'open' | 'onConfirm'>
  ): Promise<boolean> => {
    return new Promise((resolve) => {
      setState({
        ...options,
        open: true,
        onConfirm: () => {
          resolve(true);
          setState((prev) => ({ ...prev, open: false }));
        },
      });
    });
  };

  const onClose = () => {
    setState((prev) => ({ ...prev, open: false }));
  };

  return {
    confirmDialog: {
      ...state,
      onClose,
    },
    confirm,
  };
}
