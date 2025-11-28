"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { MobileBottomSheet } from "./MobileBottomSheet";

interface ActionItem {
  id: string;
  label: string;
  icon?: ReactNode;
  onClick: () => void;
  variant?: "default" | "destructive" | "primary";
  disabled?: boolean;
}

interface MobileActionSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  actions: ActionItem[];
  showCancel?: boolean;
  cancelLabel?: string;
}

export function MobileActionSheet({
  isOpen,
  onClose,
  title,
  actions,
  showCancel = true,
  cancelLabel = "Cancel",
}: MobileActionSheetProps) {
  const handleAction = (action: ActionItem) => {
    if (!action.disabled) {
      action.onClick();
      onClose();
    }
  };

  return (
    <MobileBottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      showCloseButton={false}
    >
      <div className="p-2">
        {/* Action Items */}
        <div className="space-y-1">
          {actions.map((action) => (
            <button
              key={action.id}
              onClick={() => handleAction(action)}
              disabled={action.disabled}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-4 rounded-lg text-left transition-colors touch-target",
                "active:scale-[0.98]",
                action.disabled && "opacity-50 cursor-not-allowed",
                action.variant === "destructive" &&
                  "text-red-600 hover:bg-red-50 active:bg-red-100",
                action.variant === "primary" &&
                  "text-yellow-700 bg-yellow-50 hover:bg-yellow-100 font-medium",
                action.variant === "default" &&
                  "text-gray-700 hover:bg-gray-100 active:bg-gray-200",
                !action.variant &&
                  "text-gray-700 hover:bg-gray-100 active:bg-gray-200"
              )}
            >
              {action.icon && (
                <span className="w-6 h-6 flex items-center justify-center">
                  {action.icon}
                </span>
              )}
              <span className="flex-1 text-base">{action.label}</span>
            </button>
          ))}
        </div>

        {/* Cancel Button */}
        {showCancel && (
          <div className="mt-2 pt-2 border-t border-gray-200">
            <button
              onClick={onClose}
              className="w-full px-4 py-4 text-center text-gray-600 font-medium rounded-lg hover:bg-gray-100 active:bg-gray-200 touch-target"
            >
              {cancelLabel}
            </button>
          </div>
        )}
      </div>
    </MobileBottomSheet>
  );
}
