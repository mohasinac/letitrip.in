"use client";

import { useState, ReactNode } from "react";
import { Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface QuickAction {
  id: string;
  label: string;
  icon: ReactNode;
  onClick: () => void;
  color?: string;
}

interface MobileQuickActionsProps {
  actions: QuickAction[];
  mainIcon?: ReactNode;
  position?: "bottom-right" | "bottom-left";
}

export function MobileQuickActions({
  actions,
  mainIcon,
  position = "bottom-right",
}: MobileQuickActionsProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleActionClick = (action: QuickAction) => {
    action.onClick();
    setIsOpen(false);
  };

  return (
    <div
      className={cn(
        "fixed z-40 lg:hidden",
        position === "bottom-right" && "bottom-24 right-4",
        position === "bottom-left" && "bottom-24 left-4"
      )}
    >
      {/* Action buttons - shown when open */}
      <div
        className={cn(
          "flex flex-col-reverse gap-3 mb-3 transition-all duration-300",
          isOpen
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-4 pointer-events-none"
        )}
      >
        {actions.map((action, index) => (
          <div
            key={action.id}
            className="flex items-center gap-2"
            style={{
              transitionDelay: isOpen ? `${index * 50}ms` : "0ms",
            }}
          >
            {/* Label */}
            <span
              className={cn(
                "px-3 py-1.5 bg-gray-900 text-white text-sm rounded-lg whitespace-nowrap shadow-lg",
                position === "bottom-right" ? "order-1" : "order-2"
              )}
            >
              {action.label}
            </span>

            {/* Icon button */}
            <button
              onClick={() => handleActionClick(action)}
              className={cn(
                "w-12 h-12 rounded-full shadow-lg flex items-center justify-center touch-target",
                "transform active:scale-95 transition-transform",
                action.color || "bg-blue-500 text-white hover:bg-blue-600",
                position === "bottom-right" ? "order-2" : "order-1"
              )}
              aria-label={action.label}
            >
              {action.icon}
            </button>
          </div>
        ))}
      </div>

      {/* Main FAB button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-14 h-14 rounded-full shadow-lg flex items-center justify-center touch-target",
          "bg-yellow-500 text-gray-900 hover:bg-yellow-600",
          "transform active:scale-95 transition-all duration-300",
          isOpen && "rotate-45 bg-gray-700 text-white hover:bg-gray-800"
        )}
        aria-label={isOpen ? "Close quick actions" : "Open quick actions"}
        aria-expanded={isOpen}
      >
        {mainIcon ||
          (isOpen ? <X className="w-6 h-6" /> : <Plus className="w-6 h-6" />)}
      </button>
    </div>
  );
}
