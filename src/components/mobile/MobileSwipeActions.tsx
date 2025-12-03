"use client";

import { useState, useRef, ReactNode, useCallback } from "react";
import { Trash2, Edit, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

interface SwipeAction {
  id: string;
  icon: ReactNode;
  label: string;
  color: string;
  bgColor: string;
  onClick: () => void;
}

interface MobileSwipeActionsProps {
  children: ReactNode;
  leftActions?: SwipeAction[];
  rightActions?: SwipeAction[];
  threshold?: number;
  className?: string;
  onSwipeComplete?: (direction: "left" | "right") => void;
}

export function MobileSwipeActions({
  children,
  leftActions = [],
  rightActions = [],
  threshold = 80,
  className,
  onSwipeComplete,
}: MobileSwipeActionsProps) {
  const [translateX, setTranslateX] = useState(0);
  const [isOpen, setIsOpen] = useState<"left" | "right" | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const startX = useRef(0);
  const startY = useRef(0);
  const isDragging = useRef(false);
  const isHorizontal = useRef<boolean | null>(null);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX;
    startY.current = e.touches[0].clientY;
    isDragging.current = true;
    isHorizontal.current = null;
  }, []);

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!isDragging.current) return;

      const currentX = e.touches[0].clientX;
      const currentY = e.touches[0].clientY;
      const diffX = currentX - startX.current;
      const diffY = currentY - startY.current;

      // Determine scroll direction on first significant move
      if (isHorizontal.current === null) {
        if (Math.abs(diffX) > 10 || Math.abs(diffY) > 10) {
          isHorizontal.current = Math.abs(diffX) > Math.abs(diffY);
        }
        return;
      }

      // If vertical scroll, don't handle
      if (!isHorizontal.current) {
        isDragging.current = false;
        return;
      }

      e.preventDefault();

      // Calculate new position
      let newTranslateX = diffX;

      // If already open, adjust from open position
      if (isOpen === "right") {
        newTranslateX = diffX - threshold;
      } else if (isOpen === "left") {
        newTranslateX = diffX + threshold;
      }

      // Limit movement based on available actions
      const maxLeft = rightActions.length > 0 ? threshold + 20 : 0;
      const maxRight = leftActions.length > 0 ? threshold + 20 : 0;

      newTranslateX = Math.max(-maxLeft, Math.min(maxRight, newTranslateX));
      setTranslateX(newTranslateX);
    },
    [isOpen, threshold, leftActions.length, rightActions.length],
  );

  const handleTouchEnd = useCallback(() => {
    isDragging.current = false;
    isHorizontal.current = null;

    const absTranslateX = Math.abs(translateX);

    if (absTranslateX > threshold / 2) {
      if (translateX < 0 && rightActions.length > 0) {
        setTranslateX(-threshold);
        setIsOpen("right");
        onSwipeComplete?.("left");
      } else if (translateX > 0 && leftActions.length > 0) {
        setTranslateX(threshold);
        setIsOpen("left");
        onSwipeComplete?.("right");
      } else {
        setTranslateX(0);
        setIsOpen(null);
      }
    } else {
      setTranslateX(0);
      setIsOpen(null);
    }
  }, [
    translateX,
    threshold,
    rightActions.length,
    leftActions.length,
    onSwipeComplete,
  ]);

  const handleActionClick = (action: SwipeAction) => {
    action.onClick();
    setTranslateX(0);
    setIsOpen(null);
  };

  const close = () => {
    setTranslateX(0);
    setIsOpen(null);
  };

  return (
    <div className={cn("relative overflow-hidden", className)}>
      {/* Left Actions (revealed when swiping right) */}
      {leftActions.length > 0 && (
        <div className="absolute left-0 top-0 bottom-0 flex items-stretch">
          {leftActions.map((action) => (
            <button
              key={action.id}
              onClick={() => handleActionClick(action)}
              className={cn(
                "flex flex-col items-center justify-center px-4 min-w-[80px] touch-target",
                action.bgColor,
              )}
              aria-label={action.label}
            >
              <span className={action.color}>{action.icon}</span>
              <span className={cn("text-xs mt-1", action.color)}>
                {action.label}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Right Actions (revealed when swiping left) */}
      {rightActions.length > 0 && (
        <div className="absolute right-0 top-0 bottom-0 flex items-stretch">
          {rightActions.map((action) => (
            <button
              key={action.id}
              onClick={() => handleActionClick(action)}
              className={cn(
                "flex flex-col items-center justify-center px-4 min-w-[80px] touch-target",
                action.bgColor,
              )}
              aria-label={action.label}
            >
              <span className={action.color}>{action.icon}</span>
              <span className={cn("text-xs mt-1", action.color)}>
                {action.label}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Main Content */}
      <div
        ref={containerRef}
        className="relative bg-white z-10"
        style={{
          transform: `translateX(${translateX}px)`,
          transition: isDragging.current ? "none" : "transform 0.2s ease-out",
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onClick={isOpen ? close : undefined}
        onKeyDown={isOpen ? (e) => e.key === "Escape" && close() : undefined}
        role={isOpen ? "button" : undefined}
        tabIndex={isOpen ? 0 : undefined}
      >
        {children}
      </div>
    </div>
  );
}

// Pre-built action helpers
export const createDeleteAction = (onClick: () => void): SwipeAction => ({
  id: "delete",
  icon: <Trash2 className="w-5 h-5" />,
  label: "Delete",
  color: "text-white",
  bgColor: "bg-red-500",
  onClick,
});

export const createEditAction = (onClick: () => void): SwipeAction => ({
  id: "edit",
  icon: <Edit className="w-5 h-5" />,
  label: "Edit",
  color: "text-white",
  bgColor: "bg-blue-500",
  onClick,
});

export const createMoreAction = (onClick: () => void): SwipeAction => ({
  id: "more",
  icon: <MoreHorizontal className="w-5 h-5" />,
  label: "More",
  color: "text-white",
  bgColor: "bg-gray-500",
  onClick,
});
