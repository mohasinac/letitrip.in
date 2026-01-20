/**
 * BottomSheet Component - Phase 7.1
 *
 * Mobile-optimized bottom sheet for filters, sort options, and modals.
 * Slides up from bottom with smooth animations.
 *
 * Features:
 * - Slide up from bottom animation
 * - Drag to close gesture
 * - Backdrop with blur
 * - Scrollable content
 * - Header with title and close
 * - Footer with actions
 * - iOS safe area support
 * - Spring animations
 *
 * Usage:
 * - Filter panels on listing pages
 * - Sort options
 * - Action sheets
 * - Mobile modals
 */

"use client";

import { cn } from "@/lib/utils";
import { X } from "lucide-react";
import { ReactNode, useEffect, useRef, useState } from "react";

interface BottomSheetProps {
  /** Controls visibility */
  isOpen: boolean;
  /** Callback when closed */
  onClose: () => void;
  /** Sheet title */
  title?: string;
  /** Sheet content */
  children: ReactNode;
  /** Footer actions (e.g., Apply, Reset) */
  footer?: ReactNode;
  /** Max height (default: 80vh) */
  maxHeight?: string;
  /** Disable drag to close */
  disableDragClose?: boolean;
  /** Additional CSS classes */
  className?: string;
}

export function BottomSheet({
  isOpen,
  onClose,
  title,
  children,
  footer,
  maxHeight = "80vh",
  disableDragClose = false,
  className,
}: BottomSheetProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const [startY, setStartY] = useState(0);
  const sheetRef = useRef<HTMLDivElement>(null);

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Handle drag start
  const handleDragStart = (e: React.TouchEvent | React.MouseEvent) => {
    if (disableDragClose) return;

    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
    setIsDragging(true);
    setStartY(clientY);
  };

  // Handle drag move
  const handleDragMove = (e: React.TouchEvent | React.MouseEvent) => {
    if (!isDragging || disableDragClose) return;

    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
    const diff = clientY - startY;

    // Only allow downward drag
    if (diff > 0) {
      setDragOffset(diff);
    }
  };

  // Handle drag end
  const handleDragEnd = () => {
    if (!isDragging || disableDragClose) return;

    setIsDragging(false);

    // Close threshold (30% of sheet height or 100px)
    const threshold = Math.min(
      (sheetRef.current?.offsetHeight || 0) * 0.3,
      100,
    );

    if (dragOffset > threshold) {
      onClose();
    }

    setDragOffset(0);
  };

  // Handle backdrop click
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 animate-in fade-in duration-200"
      onClick={handleBackdropClick}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      {/* Sheet */}
      <div
        ref={sheetRef}
        className={cn(
          "absolute bottom-0 left-0 right-0",
          "bg-white dark:bg-gray-900",
          "rounded-t-2xl shadow-2xl",
          "pb-safe", // iOS safe area
          "animate-in slide-in-from-bottom duration-300",
          className,
        )}
        style={{
          maxHeight,
          transform: isDragging ? `translateY(${dragOffset}px)` : undefined,
          transition: isDragging ? "none" : "transform 0.3s ease-out",
        }}
      >
        {/* Drag Handle */}
        <div
          className="flex justify-center py-3 cursor-grab active:cursor-grabbing"
          onTouchStart={handleDragStart}
          onTouchMove={handleDragMove}
          onTouchEnd={handleDragEnd}
          onMouseDown={handleDragStart}
          onMouseMove={handleDragMove}
          onMouseUp={handleDragEnd}
          onMouseLeave={handleDragEnd}
        >
          <div className="w-12 h-1 bg-gray-300 dark:bg-gray-700 rounded-full" />
        </div>

        {/* Header */}
        {title && (
          <div className="flex items-center justify-between px-4 pb-3 border-b border-gray-200 dark:border-gray-800">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              {title}
            </h2>
            <button
              onClick={onClose}
              className="p-2 -mr-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 active:scale-95"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        )}

        {/* Content */}
        <div
          className="overflow-y-auto overscroll-contain px-4 py-4"
          style={{
            maxHeight: `calc(${maxHeight} - ${title ? "120px" : "80px"})`,
          }}
        >
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-800">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * BottomSheetTrigger Component
 *
 * Button to trigger bottom sheet opening.
 * Commonly used for filter/sort buttons.
 */
interface BottomSheetTriggerProps {
  onClick: () => void;
  label: string;
  icon?: ReactNode;
  badge?: number;
  className?: string;
}

export function BottomSheetTrigger({
  onClick,
  label,
  icon,
  badge,
  className,
}: BottomSheetTriggerProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "relative flex items-center justify-center gap-2 h-10 px-4 rounded-lg",
        "bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700",
        "text-gray-900 dark:text-white font-medium text-sm",
        "hover:bg-gray-50 dark:hover:bg-gray-700",
        "active:scale-95 transition-all",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
        className,
      )}
      aria-label={label}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      <span>{label}</span>
      {badge !== undefined && badge > 0 && (
        <span className="absolute -top-2 -right-2 h-5 min-w-[1.25rem] px-1 flex items-center justify-center text-xs font-bold text-white bg-blue-600 rounded-full">
          {badge > 9 ? "9+" : badge}
        </span>
      )}
    </button>
  );
}
