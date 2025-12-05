/**
 * @fileoverview React Component
 * @module src/components/seller/ViewToggle
 * @description This file contains the ViewToggle component and its related functionality
 * 
 * @created 2025-12-05
 * @author Development Team
 */

"use client";

import { Grid3x3, Table2 } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * ViewToggleProps interface
 * 
 * @interface
 * @description Defines the structure and contract for ViewToggleProps
 */
interface ViewToggleProps {
  /** View */
  view: "grid" | "table";
  /** On View Change */
  onViewChange: (view: "grid" | "table") => void;
}

/**
 * Function: View Toggle
 */
/**
 * Performs view toggle operation
 *
 * @param {ViewToggleProps} { view, onViewChange } - The { view, on view change }
 *
 * @returns {any} The viewtoggle result
 *
 * @example
 * ViewToggle({ view, onViewChange });
 */

/**
 * Performs view toggle operation
 *
 * @param {ViewToggleProps} { view, onViewChange } - The { view, on view change }
 *
 * @returns {any} The viewtoggle result
 *
 * @example
 * ViewToggle({ view, onViewChange });
 */

export function ViewToggle({ view, onViewChange }: ViewToggleProps) {
  return (
    <div
      data-testid="view-toggle"
      className="inline-flex rounded-lg border border-gray-300 bg-white p-1"
    >
      <button
        onClick={() => onViewChange("grid")}
        className={cn(
          "flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
          view === "grid"
            ? "bg-blue-600 text-white"
            : "text-gray-700 hover:bg-gray-100",
        )}
      >
        <Grid3x3 className="h-4 w-4" />
        Grid
      </button>
      <button
        onClick={() => onViewChange("table")}
        className={cn(
          "flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
          view === "table"
            ? "bg-blue-600 text-white"
            : "text-gray-700 hover:bg-gray-100",
        )}
      >
        <Table2 className="h-4 w-4" />
        Table
      </button>
    </div>
  );
}
