/**
 * PendingUploadsWarning Component
 *
 * Warning modal before navigation with pending uploads
 * Prevents data loss from unfinished uploads
 */

"use client";

import React, { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { AlertTriangle, Upload, X } from "lucide-react";
import { useUploadContext } from "@/contexts/UploadContext";

export interface PendingUploadsWarningProps {
  enabled?: boolean; // Enable/disable warning
}

export default function PendingUploadsWarning({
  enabled = true,
}: PendingUploadsWarningProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { hasPendingUploads, pendingCount, uploadingCount } =
    useUploadContext();
  const [showWarning, setShowWarning] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<string | null>(
    null
  );

  // Intercept browser back/forward/refresh
  useEffect(() => {
    if (!enabled) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasPendingUploads) {
        e.preventDefault();
        e.returnValue = ""; // Chrome requires returnValue to be set
      }
    };

    globalThis.addEventListener?.("beforeunload", handleBeforeUnload);

    return () => {
      globalThis.removeEventListener?.("beforeunload", handleBeforeUnload);
    };
  }, [enabled, hasPendingUploads]);

  // Intercept Next.js navigation
  useEffect(() => {
    if (!enabled) return;

    // Store original push/replace methods
    const originalPush = router.push;
    const originalReplace = router.replace;

    // Override push method
    router.push = (href: string, options?: any) => {
      if (hasPendingUploads && href !== pathname) {
        setPendingNavigation(href);
        setShowWarning(true);
        return Promise.resolve(true);
      }
      return originalPush(href, options);
    };

    // Override replace method
    router.replace = (href: string, options?: any) => {
      if (hasPendingUploads && href !== pathname) {
        setPendingNavigation(href);
        setShowWarning(true);
        return Promise.resolve(true);
      }
      return originalReplace(href, options);
    };

    // Cleanup
    return () => {
      router.push = originalPush;
      router.replace = originalReplace;
    };
  }, [enabled, hasPendingUploads, pathname, router]);

  const handleStay = () => {
    setShowWarning(false);
    setPendingNavigation(null);
  };

  const handleLeave = () => {
    if (pendingNavigation) {
      // Force navigation by temporarily disabling the warning
      setShowWarning(false);
      setPendingNavigation(null);

      // Use native history API to bypass our override
      window.history.pushState({}, "", pendingNavigation);
      window.location.href = pendingNavigation;
    }
  };

  if (!showWarning) return null;

  const totalPending = pendingCount + uploadingCount;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-full">
              <AlertTriangle className="text-yellow-600" size={24} />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">
              Uploads in Progress
            </h3>
          </div>
          <button
            onClick={handleStay}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="flex items-start gap-3 mb-4">
            <Upload className="text-blue-600 flex-shrink-0 mt-1" size={20} />
            <div>
              <p className="text-gray-700 mb-2">
                You have{" "}
                <strong>
                  {totalPending} file{totalPending !== 1 ? "s" : ""}
                </strong>{" "}
                currently uploading.
              </p>
              <p className="text-gray-600 text-sm">
                If you leave this page, your uploads will be canceled and you'll
                need to start over.
              </p>
            </div>
          </div>

          {/* Upload Stats */}
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Uploading:</span>
              <span className="font-semibold text-blue-600">
                {uploadingCount}
              </span>
            </div>
            {pendingCount > 0 && (
              <div className="flex items-center justify-between text-sm mt-2">
                <span className="text-gray-600">Pending:</span>
                <span className="font-semibold text-gray-700">
                  {pendingCount}
                </span>
              </div>
            )}
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <p className="text-sm text-yellow-800">
              <strong>Tip:</strong> Wait for uploads to complete before
              navigating away, or use the upload manager to retry failed uploads
              later.
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 p-4 border-t bg-gray-50">
          <button
            onClick={handleStay}
            className="flex-1 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            Stay on Page
          </button>
          <button
            onClick={handleLeave}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
          >
            Leave Anyway
          </button>
        </div>
      </div>
    </div>
  );
}
