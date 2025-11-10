"use client";

import React from "react";
import { MediaFile } from "@/types/media";
import ImageEditor from "./ImageEditor";
import VideoThumbnailGenerator from "./VideoThumbnailGenerator";

interface MediaEditorModalProps {
  media: MediaFile;
  onSave: (editedMedia: MediaFile) => void;
  onCancel: () => void;
}

export default function MediaEditorModal({
  media,
  onSave,
  onCancel,
}: MediaEditorModalProps) {
  const handleVideoThumbnailSelect = (
    thumbnailDataUrl: string,
    timestamp: number,
  ) => {
    const updatedMedia: MediaFile = {
      ...media,
      metadata: {
        ...media.metadata!,
        thumbnail: thumbnailDataUrl,
      },
    };
    onSave(updatedMedia);
  };

  if (media.type === "image") {
    return <ImageEditor media={media} onSave={onSave} onCancel={onCancel} />;
  }

  if (media.type === "video") {
    return (
      <VideoThumbnailGenerator
        media={media}
        onSelect={handleVideoThumbnailSelect}
        onCancel={onCancel}
      />
    );
  }

  return null;
}
