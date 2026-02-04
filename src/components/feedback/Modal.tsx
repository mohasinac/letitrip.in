'use client';

import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { THEME_CONSTANTS } from '@/constants/theme';
import { useSwipe } from '@/hooks';
import { preventBodyScroll } from '@/utils/eventHandlers';

/**
 * Modal Component
 * 
 * A flexible modal dialog component with backdrop, multiple sizes, and keyboard support.
 * Automatically manages body scroll lock and supports ESC key to close.
 * Renders using React Portal for proper z-index layering.
 * 
 * @component
 * @example
 * ```tsx
 * <Modal
 *   isOpen={isOpen}
 *   onClose={() => setIsOpen(false)}
 *   title="Confirm Action"
 *   size="md"
 * >
 *   Are you sure you want to proceed?
 * </Modal>
 * ```
 */

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  showCloseButton?: boolean;
}

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  showCloseButton = true,
}: ModalProps) {
  const { themed, card, typography } = THEME_CONSTANTS;
  const modalRef = useRef<HTMLDivElement>(null);
  const [translateY, setTranslateY] = useState(0);

  // Swipe down to close modal on mobile
  useSwipe(modalRef, {
    onSwiping: (deltaX, deltaY) => {
      if (deltaY > 0) {
        setTranslateY(deltaY);
      }
    },
    onSwipeDown: (distance) => {
      if (distance > 100) {
        onClose();
      }
      setTranslateY(0);
    },
    onSwipeEnd: () => {
      setTranslateY(0);
    },
    minSwipeDistance: 100,
  });

  // Manage body scroll
  useEffect(() => {
    preventBodyScroll(isOpen);
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-full mx-4',
  };

  const modalContent = (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        ref={modalRef}
        className={`
          relative w-full ${sizeClasses[size]}
          ${themed.bgSecondary}
          ${card.base}
          shadow-2xl
          transform transition-all
          max-h-[90vh] flex flex-col
          animate-fade-in
          touch-pan-y
        `}
        style={{
          transform: translateY > 0 ? `translateY(${translateY}px)` : undefined,
          transition: translateY > 0 ? 'none' : undefined,
        }}
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        {(title || showCloseButton) && (
          <div className={`flex items-center justify-between p-6 border-b ${themed.borderLight}`}>
            {title && (
              <h2 className={`${THEME_CONSTANTS.typography.h4} ${themed.textPrimary}`}>
                {title}
              </h2>
            )}
            {showCloseButton && (
              <button
                onClick={onClose}
                className={`p-2 rounded-lg transition-colors ${themed.hover}`}
                aria-label="Close modal"
              >
                <svg
                  className={`w-5 h-5 ${themed.textMuted}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}
          </div>
        )}

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1">
          {children}
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}

// Modal Footer Component
export function ModalFooter({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const { themed, spacing } = THEME_CONSTANTS;
  return (
    <div className={`p-6 border-t ${themed.borderLight} flex items-center justify-end ${spacing.inline} ${className}`}>
      {children}
    </div>
  );
}
