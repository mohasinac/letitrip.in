/**
 * @fileoverview React Component
 * @module src/app/admin/demo/components/DemoActionButtons
 * @description This file contains the DemoActionButtons component and its related functionality
 * 
 * @created 2025-12-05
 * @author mohasinac
 * @see {@link https://mohasin.chinnapattan.com}
 */

"use client";

import { Play, Pause, XCircle, Trash2 } from "lucide-react";

/**
 * DemoActionButtonsProps interface
 * 
 * @interface
 * @description Defines the structure and contract for DemoActionButtonsProps
 */
interface DemoActionButtonsProps {
  /** Generating */
  generating: boolean;
  /** Cleaning */
  cleaning: boolean;
  /** Paused */
  paused: boolean;
  /** Cleanup Paused */
  cleanupPaused: boolean;
  /** On Generate All */
  onGenerateAll: () => void;
  /** On Pause Toggle */
  onPauseToggle: () => void;
  /** On Cancel */
  onCancel: () => void;
  /** On Cleanup */
  onCleanup: () => void;
}

/**
 * Function: Demo Action Buttons
 */
/**
 * Performs demo action buttons operation
 *
 * @returns {any} The demoactionbuttons result
 *
 * @example
 * DemoActionButtons();
 */

/**
 * Performs demo action buttons operation
 *
 * @returns {any} The demoactionbuttons result
 *
 * @example
 * DemoActionButtons();
 */

export function DemoActionButtons({
  generating,
  cleaning,
  paused,
  cleanupPaused,
  onGenerateAll,
  onPauseToggle,
  onCancel,
  onCleanup,
}: DemoActionButtonsProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <button
        onClick={onGenerateAll}
        disabled={generating || cleaning}
        className="flex items-center justify-center gap-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-4 px-6 rounded-lg transition-colors"
      >
        <Play className={`w-5 h-5 ${generating ? "animate-pulse" : ""}`} />
        {generating ? "Generating..." : "Generate All"}
      </button>

      <button
        onClick={onPauseToggle}
        disabled={!generating && !cleaning}
        className="flex items-center justify-center gap-3 bg-amber-600 hover:bg-amber-700 disabled:bg-gray-400 text-white font-medium py-4 px-6 rounded-lg transition-colors"
      >
        {(generating && paused) || (cleaning && cleanupPaused) ? (
          <Play className="w-5 h-5" />
        ) : (
          <Pause className="w-5 h-5" />
        )}
        {(generating && paused) || (cleaning && cleanupPaused)
          ? "Resume"
          : "Pause"}
      </button>

      <button
        onClick={onCancel}
        disabled={!generating && !cleaning}
        className="flex items-center justify-center gap-3 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400 text-white font-medium py-4 px-6 rounded-lg transition-colors"
      >
        <XCircle className="w-5 h-5" />
        Cancel
      </button>

      <button
        onClick={onCleanup}
        disabled={generating || cleaning}
        className="flex items-center justify-center gap-3 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white font-medium py-4 px-6 rounded-lg transition-colors"
      >
        <Trash2 className={`w-5 h-5 ${cleaning ? "animate-pulse" : ""}`} />
        {cleaning ? "Cleaning..." : "Delete All Demo Data"}
      </button>
    </div>
  );
}
