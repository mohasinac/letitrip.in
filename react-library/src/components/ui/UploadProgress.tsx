
/**
 * UploadProgress Component
 *
 * Framework-agnostic upload progress display (fixed bottom-right).
 * Shows active uploads with progress bars.
 *
 * @example
 * ```tsx
 * <UploadProgress
 *   uploads={uploads}
 *   onRemove={(id) => removeUpload(id)}
 *   onRetry={(id) => retryUpload(id)}
 * />
 * ```
 */

import React, { useState } from "react";

export interface Upload {
  id: string;
  filename: string;
  status: "pending" | "uploading" | "success" | "failed";
  progress?: number;
  error?: string;
}

export interface UploadProgressProps {
  /** Array of uploads */
  uploads: Upload[];
  /** Remove upload callback */
  onRemove?: (id: string) => void;
  /** Retry failed upload callback */
  onRetry?: (id: string) => void;
  /** Clear completed uploads */
  onClearCompleted?: () => void;
  /** Clear failed uploads */
  onClearFailed?: () => void;
  /** Additional CSS classes */
  className?: string;
  /** Custom icons */
  LoaderIcon?: React.ComponentType<{ className?: string }>;
  CheckIcon?: React.ComponentType<{ className?: string }>;
  AlertIcon?: React.ComponentType<{ className?: string }>;
  RefreshIcon?: React.ComponentType<{ className?: string }>;
  XIcon?: React.ComponentType<{ className?: string }>;
  ChevronDownIcon?: React.ComponentType<{ className?: string }>;
  ChevronUpIcon?: React.ComponentType<{ className?: string }>;
}

// Inline cn utility
function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(" ");
}

// Default inline SVG icons (simplified for brevity)
function DefaultLoaderIcon({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin",
        className
      )}
    />
  );
}

function DefaultCheckIcon({ className }: { className?: string }) {
  return <span className={className}>✓</span>;
}

function DefaultAlertIcon({ className }: { className?: string }) {
  return <span className={className}>⚠</span>;
}

function DefaultRefreshIcon({ className }: { className?: string }) {
  return <span className={className}>↻</span>;
}

function DefaultXIcon({ className }: { className?: string }) {
  return <span className={className}>×</span>;
}

function DefaultChevronDownIcon({ className }: { className?: string }) {
  return <span className={className}>▼</span>;
}

function DefaultChevronUpIcon({ className }: { className?: string }) {
  return <span className={className}>▲</span>;
}

export function UploadProgress({
  uploads,
  onRemove,
  onRetry,
  onClearCompleted,
  onClearFailed,
  className = "",
  LoaderIcon = DefaultLoaderIcon,
  CheckIcon = DefaultCheckIcon,
  AlertIcon = DefaultAlertIcon,
  RefreshIcon = DefaultRefreshIcon,
  XIcon = DefaultXIcon,
  ChevronDownIcon = DefaultChevronDownIcon,
  ChevronUpIcon = DefaultChevronUpIcon,
}: UploadProgressProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false);

  const pendingCount = uploads.filter((u) => u.status === "pending").length;
  const uploadingCount = uploads.filter((u) => u.status === "uploading").length;
  const successCount = uploads.filter((u) => u.status === "success").length;
  const failedCount = uploads.filter((u) => u.status === "failed").length;

  if (uploads.length === 0 || isMinimized) return null;

  return (
    <div
      className={cn(
        "fixed bottom-4 right-4 z-50 w-96 max-w-[calc(100vw-2rem)]",
        className
      )}
    >
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        {/* Header */}
        <div className="bg-blue-600 text-white p-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {uploadingCount > 0 && <LoaderIcon className="w-5 h-5" />}
            <span className="font-semibold">Uploads ({uploads.length})</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1 hover:bg-blue-700 rounded transition-colors"
              aria-label={isExpanded ? "Collapse" : "Expand"}
            >
              {isExpanded ? (
                <ChevronDownIcon className="w-4 h-4" />
              ) : (
                <ChevronUpIcon className="w-4 h-4" />
              )}
            </button>
            <button
              onClick={() => setIsMinimized(true)}
              className="p-1 hover:bg-blue-700 rounded transition-colors"
              aria-label="Minimize"
            >
              <XIcon className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Stats Bar */}
        {isExpanded && (
          <div className="bg-gray-50 dark:bg-gray-900 px-3 py-2 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between text-sm">
            <div className="flex items-center gap-4">
              {uploadingCount > 0 && (
                <span className="text-blue-600">
                  Uploading: {uploadingCount}
                </span>
              )}
              {pendingCount > 0 && (
                <span className="text-gray-600 dark:text-gray-400">
                  Pending: {pendingCount}
                </span>
              )}
              {successCount > 0 && (
                <span className="text-green-600">Success: {successCount}</span>
              )}
              {failedCount > 0 && (
                <span className="text-red-600">Failed: {failedCount}</span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {successCount > 0 && onClearCompleted && (
                <button
                  onClick={onClearCompleted}
                  className="text-xs text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                >
                  Clear completed
                </button>
              )}
              {failedCount > 0 && onClearFailed && (
                <button
                  onClick={onClearFailed}
                  className="text-xs text-red-600 hover:text-red-700"
                >
                  Clear failed
                </button>
              )}
            </div>
          </div>
        )}

        {/* Upload List */}
        {isExpanded && (
          <div className="max-h-96 overflow-y-auto">
            {uploads.map((upload) => (
              <div
                key={upload.id}
                className="p-3 border-b border-gray-200 dark:border-gray-700 last:border-b-0"
              >
                <div className="flex items-center gap-3">
                  {/* Status Icon */}
                  <div className="flex-shrink-0">
                    {upload.status === "uploading" && (
                      <LoaderIcon className="w-5 h-5 text-blue-600" />
                    )}
                    {upload.status === "success" && (
                      <CheckIcon className="text-green-600 text-xl" />
                    )}
                    {upload.status === "failed" && (
                      <AlertIcon className="text-red-600 text-xl" />
                    )}
                    {upload.status === "pending" && (
                      <span className="text-gray-400 text-sm">⏳</span>
                    )}
                  </div>

                  {/* Filename & Progress */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {upload.filename}
                    </p>
                    {upload.status === "uploading" &&
                      upload.progress !== undefined && (
                        <div className="mt-1">
                          <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-blue-600 transition-all duration-300"
                              style={{ width: `${upload.progress}%` }}
                            />
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                            {upload.progress}%
                          </p>
                        </div>
                      )}
                    {upload.error && (
                      <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                        {upload.error}
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1">
                    {upload.status === "failed" && onRetry && (
                      <button
                        onClick={() => onRetry(upload.id)}
                        className="p-1.5 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                        title="Retry upload"
                      >
                        <RefreshIcon className="w-4 h-4" />
                      </button>
                    )}
                    {onRemove && (
                      <button
                        onClick={() => onRemove(upload.id)}
                        className="p-1.5 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                        title="Remove"
                      >
                        <XIcon className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default UploadProgress;
