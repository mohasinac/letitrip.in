"use client";

import { ToggleSwitch } from "@/components/admin/ToggleSwitch";
import { ArrowDown, ArrowUp, ChevronDown, ChevronUp } from "lucide-react";
import { ReactNode } from "react";

interface SectionCardProps {
  title: string;
  description: string;
  enabled: boolean;
  onToggle: () => void;
  expanded?: boolean;
  onToggleExpand?: () => void;
  children?: ReactNode;
  orderIndex?: number;
  totalSections?: number;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
}

export function SectionCard({
  title,
  description,
  enabled,
  onToggle,
  expanded,
  onToggleExpand,
  children,
  orderIndex,
  totalSections,
  onMoveUp,
  onMoveDown,
}: SectionCardProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
      <div className="p-4 flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3">
            {/* Reorder buttons */}
            {onMoveUp &&
              onMoveDown &&
              orderIndex !== undefined &&
              totalSections !== undefined && (
                <div className="flex flex-col gap-0.5">
                  <button
                    onClick={onMoveUp}
                    disabled={orderIndex === 1}
                    className="p-0.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded disabled:opacity-30 disabled:cursor-not-allowed"
                    title="Move up"
                  >
                    <ArrowUp className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                  </button>
                  <button
                    onClick={onMoveDown}
                    disabled={orderIndex === totalSections}
                    className="p-0.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded disabled:opacity-30 disabled:cursor-not-allowed"
                    title="Move down"
                  >
                    <ArrowDown className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                  </button>
                </div>
              )}

            <div>
              <h3 className="font-medium text-gray-900 dark:text-gray-100">
                {title}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {description}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <ToggleSwitch enabled={enabled} onToggle={onToggle} />
          {children && onToggleExpand && (
            <button
              onClick={onToggleExpand}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
            >
              {expanded ? (
                <ChevronUp className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              )}
            </button>
          )}
        </div>
      </div>

      {expanded && children && (
        <div className="px-4 pb-4 pt-2 border-t border-gray-200 dark:border-gray-700">
          {children}
        </div>
      )}
    </div>
  );
}
