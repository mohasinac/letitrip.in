import { ReactNode } from "react";
import { Badge, Button, Text } from "@/components";
import { formatDate } from "@/utils";
import { UI_LABELS } from "@/constants";

export interface MediaOperation {
  id: string;
  type: "crop" | "trim";
  sourceUrl: string;
  status: "processing" | "completed" | "failed";
  outputUrl?: string;
  format: string;
  createdAt: Date;
  updatedAt: Date;
  error?: string;
}

interface Column<T> {
  key: string;
  header: string;
  render?: (item: T) => ReactNode;
  sortable?: boolean;
  width?: string;
}

const LABELS = UI_LABELS.ADMIN.MEDIA;

export function getMediaTableColumns(
  onDownload: (op: MediaOperation) => void,
): Column<MediaOperation>[] {
  return [
    {
      key: "type",
      header: LABELS.OPERATION_TYPE,
      render: (op) => (
        <Badge variant={op.type === "crop" ? "secondary" : "info"}>
          {op.type === "crop" ? "🖼️ Crop" : "🎬 Trim"}
        </Badge>
      ),
    },
    {
      key: "status",
      header: LABELS.OPERATION_STATUS,
      render: (op) => (
        <Badge
          variant={
            op.status === "completed"
              ? "success"
              : op.status === "failed"
                ? "danger"
                : "pending"
          }
        >
          {op.status === "completed"
            ? "✅ Completed"
            : op.status === "failed"
              ? "❌ Failed"
              : "⏳ Processing"}
        </Badge>
      ),
    },
    {
      key: "format",
      header: LABELS.COL_FORMAT,
      render: (op) => (
        <Text className="text-sm">{op.format.toUpperCase()}</Text>
      ),
    },
    {
      key: "createdAt",
      header: LABELS.COL_CREATED,
      render: (op) => (
        <Text className="text-sm">{formatDate(new Date(op.createdAt))}</Text>
      ),
    },
    {
      key: "actions",
      header: UI_LABELS.TABLE.ACTIONS,
      render: (op) => (
        <div className="flex gap-2">
          {op.status === "completed" && op.outputUrl && (
            <Button
              size="sm"
              variant="secondary"
              onClick={() => onDownload(op)}
            >
              {LABELS.DOWNLOAD_RESULT}
            </Button>
          )}
          {op.status === "failed" && op.error && (
            <Button size="sm" variant="secondary" title={op.error}>
              Error
            </Button>
          )}
        </div>
      ),
    },
  ];
}
