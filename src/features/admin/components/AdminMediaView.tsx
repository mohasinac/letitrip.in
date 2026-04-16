"use client";
import { useToast } from "@mohasinac/appkit/ui";
import { useState, useCallback } from "react";
import { nowMs } from "@mohasinac/appkit/utils";


import { useMediaCrop, useMediaTrim } from "@/hooks";
import { useTranslations } from "next-intl";
import { Heading, Text, Button, Stack, DataTable } from "@mohasinac/appkit/ui";
import { AdminMediaView as AppkitAdminMediaView } from "@mohasinac/appkit/features/admin";
import { Card, AdminPageHeader } from "@/components";
import { MediaOperationForm } from "./MediaOperationForm";
import { getMediaTableColumns } from "./MediaTableColumns";
import type { MediaOperation } from "./MediaTableColumns";

export function AdminMediaView() {
  const { showToast } = useToast();
  const t = useTranslations("adminMedia");
  const [operationType, setOperationType] = useState<"crop" | "trim">("crop");
  const [recentOperations, setRecentOperations] = useState<MediaOperation[]>(
    [],
  );
  const [isLoading, setIsLoading] = useState(false);

  const cropMutation = useMediaCrop<{ data: { url: string } }>();

  const trimMutation = useMediaTrim<{ data: { url: string } }>();

  const handleCropSubmit = useCallback(
    async (data: any) => {
      setIsLoading(true);
      try {
        const result = await cropMutation.mutateAsync(data);
        const newOp: MediaOperation = {
          id: crypto.randomUUID(),
          type: "crop",
          sourceUrl: data.sourceUrl,
          status: "completed",
          outputUrl: result.data.url,
          format: data.outputFormat || "jpeg",
          createdAt: new Date(nowMs()),
          updatedAt: new Date(nowMs()),
        };
        setRecentOperations((prev) => [newOp, ...prev.slice(0, 9)]);
        showToast(t("cropSuccess"), "success");
      } catch (error: any) {
        showToast(error.message || t("cropError"), "error");
      } finally {
        setIsLoading(false);
      }
    },
    [cropMutation, showToast, t],
  );

  const handleTrimSubmit = useCallback(
    async (data: any) => {
      setIsLoading(true);
      try {
        const result = await trimMutation.mutateAsync(data);
        const newOp: MediaOperation = {
          id: crypto.randomUUID(),
          type: "trim",
          sourceUrl: data.sourceUrl,
          status: "completed",
          outputUrl: result.data.url,
          format: data.outputFormat || "mp4",
          createdAt: new Date(nowMs()),
          updatedAt: new Date(nowMs()),
        };
        setRecentOperations((prev) => [newOp, ...prev.slice(0, 9)]);
        showToast(t("trimSuccess"), "success");
      } catch (error: any) {
        showToast(error.message || t("trimError"), "error");
      } finally {
        setIsLoading(false);
      }
    },
    [trimMutation, showToast, t],
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
    <AppkitAdminMediaView
      renderHeader={() => (
        <AdminPageHeader title={t("title")} subtitle={t("subtitle")} />
      )}
      renderTable={() => (
        <Stack gap="lg">
          {/* Operation Type Selector */}
          <Card className="p-4">
            <div className="flex gap-2">
              <Button
                onClick={() => setOperationType("crop")}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  operationType === "crop"
                    ? "bg-primary-700 text-white"
                    : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
                }`}
              >
                ??? {t("cropImage")}
              </Button>
              <Button
                onClick={() => setOperationType("trim")}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  operationType === "trim"
                    ? "bg-primary-700 text-white"
                    : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
                }`}
              >
                ?? {t("trimVideo")}
              </Button>
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
                <Heading level={2} className="text-lg font-semibold">
                  {t("recentOperations")}
                </Heading>
                <Text size="sm" variant="secondary">
                  {t("lastNOperations", { count: recentOperations.length })}
                </Text>
              </div>
              <DataTable
                columns={tableColumns}
                data={recentOperations}
                keyExtractor={(item) => item.id}
                loading={false}
              />
            </Card>
          )}

          {/* Empty State */}
          {recentOperations.length === 0 && (
            <Card className="p-12 text-center">
              <Text className="text-zinc-500">{t("noOperations")}</Text>
            </Card>
          )}
          </Stack>
      )}
    />
  );
}

