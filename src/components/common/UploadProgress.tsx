/**
 * UploadProgress Component
 *
 * Global upload progress indicator (fixed bottom-right)
 * Shows active uploads with progress bars
 */

"use client";

import React, { useState } from "react";
import {
  X,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Loader2,
} from "lucide-react";
import { useUploadContext } from "@/contexts/UploadContext";

export default function UploadProgress() {
  const {
    uploads,
    pendingCount,
    uploadingCount,
    failedCount,
    successCount,
    removeUpload,
    retryUpload,
    clearCompleted,
    clearFailed,
  } = useUploadContext();

  const [isExpanded, setIsExpanded] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false);

  // Don't show if no uploads
  if (uploads.length === 0) return null;

  const activeUploads = uploads.filter(
    (u) => u.status === "pending" || u.status === "uploading"
  );

  return (
    <div className="fixed bottom-4 right-4 z-50 w-96 max-w-[calc(100vw-2rem)]">
      <div className="bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="bg-blue-600 text-white p-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Loader2
              className={`${uploadingCount > 0 ? "animate-spin" : "hidden"}`}
              size={18}
            />
            <span className="font-semibold">Uploads ({uploads.length})</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1 hover:bg-blue-700 rounded transition-colors"
              aria-label={isExpanded ? "Collapse" : "Expand"}
            >
              {isExpanded ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
            </button>
            {!isMinimized && (
              <button
                onClick={() => setIsMinimized(true)}
                className="p-1 hover:bg-blue-700 rounded transition-colors"
                aria-label="Minimize"
              >
                <X size={18} />
              </button>
            )}
          </div>
        </div>

        {/* Stats Bar */}
        {isExpanded && (
          <div className="bg-gray-50 px-3 py-2 border-b flex items-center justify-between text-sm">
            <div className="flex items-center gap-4">
              {uploadingCount > 0 && (
                <span className="text-blue-600">
                  Uploading: {uploadingCount}
                </span>
              )}
              {pendingCount > 0 && (
                <span className="text-gray-600">Pending: {pendingCount}</span>
              )}
              {successCount > 0 && (
                <span className="text-green-600">Success: {successCount}</span>
              )}
              {failedCount > 0 && (
                <span className="text-red-600">Failed: {failedCount}</span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {successCount > 0 && (
                <button
                  onClick={clearCompleted}
                  className="text-xs text-gray-600 hover:text-gray-900"
                >
                  Clear completed
                </button>
              )}
              {failedCount > 0 && (
                <button
                  onClick={clearFailed}
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
                className="p-3 border-b last:border-b-0 hover:bg-gray-50"
              >
                <div className="flex items-start gap-3">
                  {/* Status Icon */}
                  <div className="flex-shrink-0 mt-1">
                    {upload.status === "success" && (
                      <CheckCircle className="text-green-500" size={20} />
                    )}
                    {upload.status === "error" && (
                      <AlertCircle className="text-red-500" size={20} />
                    )}
                    {upload.status === "uploading" && (
                      <Loader2
                        className="text-blue-500 animate-spin"
                        size={20}
                      />
                    )}
                    {upload.status === "pending" && (
                      <div className="w-5 h-5 rounded-full border-2 border-gray-300" />
                    )}
                  </div>

                  {/* File Info */}
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900 truncate">
                      {upload.file.name}
                    </div>
                    <div className="text-xs text-gray-500">
                      {(upload.file.size / 1024 / 1024).toFixed(2)} MB
                    </div>

                    {/* Progress Bar */}
                    {(upload.status === "uploading" ||
                      upload.status === "pending") && (
                      <div className="mt-2">
                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                          <div
                            className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                            style={{ width: `${upload.progress}%` }}
                          />
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {upload.progress}%
                        </div>
                      </div>
                    )}

                    {/* Error Message */}
                    {upload.status === "error" && upload.error && (
                      <div className="mt-1 text-xs text-red-600">
                        {upload.error}
                      </div>
                    )}

                    {/* Success Message */}
                    {upload.status === "success" && (
                      <div className="mt-1 text-xs text-green-600">
                        Upload complete
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex-shrink-0 flex items-center gap-1">
                    {upload.status === "error" && (
                      <button
                        onClick={() => retryUpload(upload.id)}
                        className="p-1.5 hover:bg-blue-50 text-blue-600 rounded transition-colors"
                        title="Retry upload"
                      >
                        <RefreshCw size={16} />
                      </button>
                    )}
                    <button
                      onClick={() => removeUpload(upload.id)}
                      className="p-1.5 hover:bg-red-50 text-red-600 rounded transition-colors"
                      title="Remove"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Minimized View */}
      {isMinimized && (
        <button
          onClick={() => setIsMinimized(false)}
          className="mt-2 w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-between"
        >
          <span>
            {activeUploads.length > 0
              ? `Uploading ${activeUploads.length} file${
                  activeUploads.length !== 1 ? "s" : ""
                }...`
              : `${uploads.length} upload${uploads.length !== 1 ? "s" : ""}`}
          </span>
          <ChevronUp size={18} />
        </button>
      )}
    </div>
  );
}
