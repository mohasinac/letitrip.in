import { ColumnDef } from "@tanstack/react-table";
import { Button, Badge, Text } from "@/components";
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

const LABELS = UI_LABELS.ADMIN.MEDIA;

export function getMediaTableColumns(
  onDownload: (op: MediaOperation) => void,
): ColumnDef<MediaOperation>[] {
  return [
    {
      accessorKey: "type",
      header: LABELS.OPERATION_TYPE,
      cell: ({ row }) => {
        const type = row.original.type;
        return (
          <Badge variant={type === "crop" ? "secondary" : "outline"}>
            {type === "crop" ? "🖼️ Crop" : "🎬 Trim"}
          </Badge>
        );
      },
    },
    {
      accessorKey: "status",
      header: LABELS.OPERATION_STATUS,
      cell: ({ row }) => {
        const status = row.original.status;
        return (
          <Badge
            variant={
              status === "completed"
                ? "default"
                : status === "failed"
                  ? "destructive"
                  : "outline"
            }
          >
            {status === "completed"
              ? "✅ Completed"
              : status === "failed"
                ? "❌ Failed"
                : "⏳ Processing"}
          </Badge>
        );
      },
    },
    {
      accessorKey: "format",
      header: "Format",
      cell: ({ row }) => {
        const format = row.original.format;
        return <Text className="text-sm">{format.toUpperCase()}</Text>;
      },
    },
    {
      accessorKey: "createdAt",
      header: "Created",
      cell: ({ row }) => {
        const date = new Date(row.original.createdAt);
        return <Text className="text-sm">{formatDate(date)}</Text>;
      },
    },
    {
      accessorKey: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const operation = row.original;
        return (
          <div className="flex gap-2">
            {operation.status === "completed" && operation.outputUrl && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => onDownload(operation)}
              >
                {LABELS.DOWNLOAD_RESULT}
              </Button>
            )}
            {operation.status === "failed" && operation.error && (
              <Button size="sm" variant="ghost" title={operation.error}>
                Error
              </Button>
            )}
          </div>
        );
      },
    },
  ];
}
