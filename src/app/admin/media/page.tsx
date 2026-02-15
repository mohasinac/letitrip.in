"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useApiMutation } from "@/hooks";
import { apiClient } from "@/lib/api-client";
import { API_ENDPOINTS, UI_LABELS, ROUTES } from "@/constants";
import {
  Card,
  AdminPageHeader,
  MediaOperationForm,
  DataTable,
  getMediaTableColumns,
  useToast,
  Badge,
} from "@/components";
import type { MediaOperation } from "@/components";

const LABELS = UI_LABELS.ADMIN.MEDIA;

export default function AdminMediaPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [operationType, setOperationType] = useState<"crop" | "trim">("crop");
  const [recentOperations, setRecentOperations] = useState<MediaOperation[]>(
    [],
  );
  const [isLoading, setIsLoading] = useState(false);

  const cropMutation = useApiMutation({
    mutationFn: (data) => apiClient.post(API_ENDPOINTS.MEDIA.CROP, data),
  });

  const trimMutation = useApiMutation({
    mutationFn: (data) => apiClient.post(API_ENDPOINTS.MEDIA.TRIM, data),
  });

  const handleCropSubmit = useCallback(
    async (data: any) => {
      setIsLoading(true);
      try {
        const result = await cropMutation.mutate(data);

        // Add to recent operations
        const newOp: MediaOperation = {
          id: Math.random().toString(36).substr(2, 9),
          type: "crop",
          sourceUrl: data.sourceUrl,
          status: "completed",
          outputUrl: result.data.url,
          format: data.outputFormat || "jpeg",
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        setRecentOperations((prev) => [newOp, ...prev.slice(0, 9)]);
        showToast("Image cropped successfully!", "success");
      } catch (error: any) {
        showToast(error.message || "Failed to crop image", "error");
      } finally {
        setIsLoading(false);
      }
    },
    [cropMutation, showToast],
  );

  const handleTrimSubmit = useCallback(
    async (data: any) => {
      setIsLoading(true);
      try {
        const result = await trimMutation.mutate(data);

        // Add to recent operations
        const newOp: MediaOperation = {
          id: Math.random().toString(36).substr(2, 9),
          type: "trim",
          sourceUrl: data.sourceUrl,
          status: "completed",
          outputUrl: result.data.url,
          format: data.outputFormat || "mp4",
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        setRecentOperations((prev) => [newOp, ...prev.slice(0, 9)]);
        showToast("Video trimmed successfully!", "success");
      } catch (error: any) {
        showToast(error.message || "Failed to trim video", "error");
      } finally {
        setIsLoading(false);
      }
    },
    [trimMutation, showToast],
  );

  const handleDownload = (operation: MediaOperation) => {
    if (operation.outputUrl) {
      const link = document.createElement("a");
      link.href = operation.outputUrl;
      link.download = `media-${operation.type}.${operation.format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const tableColumns = getMediaTableColumns(handleDownload);

  return (
    <div className="space-y-6">
      <AdminPageHeader title={LABELS.TITLE} subtitle={LABELS.SUBTITLE} />

      {/* Operation Type Selector */}
      <Card className="p-4">
        <div className="flex gap-2">
          <button
            onClick={() => setOperationType("crop")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              operationType === "crop"
                ? "bg-primary text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            🖼️ {LABELS.CROP_IMAGE}
          </button>
          <button
            onClick={() => setOperationType("trim")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              operationType === "trim"
                ? "bg-primary text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            🎬 {LABELS.TRIM_VIDEO}
          </button>
        </div>
      </Card>

      {/* Operation Form */}
      <MediaOperationForm
        operationType={operationType}
        onSubmit={
          operationType === "crop" ? handleCropSubmit : handleTrimSubmit
        }
        isLoading={isLoading}
      />

      {/* Recent Operations Table */}
      {recentOperations.length > 0 && (
        <Card className="p-6">
          <div className="mb-4">
            <h2 className="text-lg font-semibold">
              {LABELS.RECENT_OPERATIONS}
            </h2>
            <p className="text-sm text-gray-600">
              Last {recentOperations.length} operations
            </p>
          </div>
          <DataTable
            columns={tableColumns}
            data={recentOperations}
            loading={false}
          />
        </Card>
      )}

      {/* Empty State */}
      {recentOperations.length === 0 && (
        <Card className="p-12 text-center">
          <p className="text-gray-500">{LABELS.NO_OPERATIONS}</p>
        </Card>
      )}
    </div>
  );
}
