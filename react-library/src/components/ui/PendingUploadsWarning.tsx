
/**
 * PendingUploadsWarning Component
 *
 * Framework-agnostic warning before navigation with pending uploads.
 * Prevents data loss from unfinished uploads.
 *
 * @example
 * ```tsx
 * <PendingUploadsWarning
 *   hasPendingUploads={hasPending}
 *   pendingCount={3}
 *   onStay={() => console.log('User stayed')}
 *   onLeave={() => navigate(pendingPath)}
 * />
 * ```
 */

import React, { useEffect, useState } from "react";

export interface PendingUploadsWarningProps {
  /** Has pending uploads */
  hasPendingUploads: boolean;
  /** Number of pending uploads */
  pendingCount?: number;
  /** Number of uploading files */
  uploadingCount?: number;
  /** Enabled state */
  enabled?: boolean;
  /** Stay callback */
  onStay?: () => void;
  /** Leave callback */
  onLeave?: () => void;
  /** Navigation interceptor (receives target path) */
  onNavigationAttempt?: (path: string) => boolean;
  /** Additional CSS classes */
  className?: string;
  /** Custom AlertTriangle icon */
  AlertIcon?: React.ComponentType<{ className?: string }>;
  /** Custom Upload icon */
  UploadIcon?: React.ComponentType<{ className?: string }>;
  /** Custom X icon */
  XIcon?: React.ComponentType<{ className?: string }>;
}

// Inline cn utility
function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(" ");
}

// Default inline SVG icons
function DefaultAlertIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}

function DefaultUploadIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  );
}

function DefaultXIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

export function PendingUploadsWarning({
  hasPendingUploads,
  pendingCount = 0,
  uploadingCount = 0,
  enabled = true,
  onStay,
  onLeave,
  onNavigationAttempt,
  className = "",
  AlertIcon = DefaultAlertIcon,
  UploadIcon = DefaultUploadIcon,
  XIcon = DefaultXIcon,
}: PendingUploadsWarningProps) {
  const [showWarning, setShowWarning] = useState(false);

  // Browser beforeunload warning
  useEffect(() => {
    if (!enabled) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasPendingUploads) {
        e.preventDefault();
        e.returnValue = "";
      }
    };

    if (typeof window !== "undefined") {
      window.addEventListener("beforeunload", handleBeforeUnload);
    }

    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("beforeunload", handleBeforeUnload);
      }
    };
  }, [enabled, hasPendingUploads]);

  const handleStay = () => {
    setShowWarning(false);
    onStay?.();
  };

  const handleLeave = () => {
    setShowWarning(false);
    onLeave?.();
  };

  if (!showWarning && !hasPendingUploads) return null;

  // Auto-show warning if pending uploads exist
  if (hasPendingUploads && !showWarning && enabled) {
    // This would be triggered by navigation attempts
    // Consumer should call setShowWarning(true) when detecting navigation
  }

  return (
    <>
      {/* Warning Modal */}
      {showWarning && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          {/* Backdrop */}
          <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" />

          {/* Modal */}
          <div className="flex min-h-full items-center justify-center p-4">
            <div
              className={cn(
                "relative bg-white dark:bg-gray-800 rounded-lg shadow-xl",
                "max-w-md w-full p-6",
                className
              )}
            >
              {/* Icon */}
              <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-yellow-100 dark:bg-yellow-900/30 rounded-full">
                <AlertIcon className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
              </div>

              {/* Title */}
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white text-center mb-2">
                Uploads in Progress
              </h3>

              {/* Description */}
              <div className="text-center mb-6">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  You have {uploadingCount > 0 ? uploadingCount : pendingCount}{" "}
                  file(s) currently uploading. Leaving this page will cancel the
                  uploads.
                </p>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/30 rounded-full">
                  <UploadIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                    {uploadingCount > 0
                      ? `${uploadingCount} uploading`
                      : `${pendingCount} pending`}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={handleStay}
                  className={cn(
                    "flex-1 px-4 py-2 text-sm font-medium rounded-lg",
                    "bg-blue-600 text-white hover:bg-blue-700",
                    "transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                  )}
                >
                  Stay on Page
                </button>
                <button
                  onClick={handleLeave}
                  className={cn(
                    "flex-1 px-4 py-2 text-sm font-medium rounded-lg",
                    "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300",
                    "hover:bg-gray-200 dark:hover:bg-gray-600",
                    "transition-colors"
                  )}
                >
                  Leave Anyway
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Inline Warning Banner (alternative to modal) */}
      {hasPendingUploads && !showWarning && (
        <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-40">
          <div className="bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 shadow-lg">
            <div className="flex items-start gap-3">
              <AlertIcon className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                  Uploads in Progress
                </p>
                <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
                  {uploadingCount > 0
                    ? `${uploadingCount} file(s) uploading`
                    : `${pendingCount} file(s) pending`}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default PendingUploadsWarning;
