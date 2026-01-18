"use client";

import { MediaPreviewCard as LibraryMediaPreviewCard } from "@letitrip/react-library";
import type { MediaPreviewCardProps as LibraryMediaPreviewCardProps } from "@letitrip/react-library";
import { formatDuration, formatFileSize } from "@/lib/formatters";
import { AlertCircle, CheckCircle2, Edit2, RotateCw, X } from "lucide-react";
import Image from "next/image";

export type { MediaFile } from "@letitrip/react-library";

export interface MediaPreviewCardProps
  extends Omit<
    LibraryMediaPreviewCardProps,
    "ImageComponent" | "icons" | "formatFileSize" | "formatDuration"
  > {}

/**
 * MediaPreviewCard Component (Next.js Wrapper)
 *
 * Integrates library MediaPreviewCard with Next.js Image and formatters.
 */
export default function MediaPreviewCard(props: MediaPreviewCardProps) {
  return (
    <LibraryMediaPreviewCard
      {...props}
      ImageComponent={Image as any}
      icons={{
        alertCircle: <AlertCircle className="w-8 h-8" />,
        checkCircle: <CheckCircle2 className="w-4 h-4" />,
        edit: <Edit2 className="w-4 h-4" />,
        rotateCw: <RotateCw className="w-4 h-4" />,
        x: <X className="w-4 h-4" />,
      }}
      formatFileSize={formatFileSize}
      formatDuration={formatDuration}
    />
  );
}
