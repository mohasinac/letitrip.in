/**
 * @fileoverview React Component
 * @module src/components/media/MediaEditorModal
 * @description This file contains the MediaEditorModal component and its related functionality
 * 
 * @created 2025-12-05
 * @author mohasinac
 * @see {@link https://mohasin.chinnapattan.com}
 */

"use client";

import React from "react";
import { MediaFile } from "@/types/media";
import ImageEditor from "./ImageEditor";
import VideoThumbnailGenerator from "./VideoThumbnailGenerator";

/**
 * MediaEditorModalProps interface
 * 
 * @interface
 * @description Defines the structure and contract for MediaEditorModalProps
 */
interface MediaEditorModalProps {
  /** Media */
  media: MediaFile;
  /** On Save */
  onSave: (editedMedia: MediaFile) => void;
  /** On Cancel */
  onCancel: () => void;
}

export default /**
 * Performs media editor modal operation
 *
 * @param {MediaEditorModalProps} {
  media,
  onSave,
  onCancel,
} - The {
  media,
  onsave,
  oncancel,
}
 *
 * @returns {any} The mediaeditormodal result
 *
 */
function MediaEditorModal({
  media,
  onSave,
  onCancel,
}: MediaEditorModalProps) {
  /**
   * Handles video thumbnail select event
   *
   * @param {string} thumbnailDataUrl - The thumbnail data url
   * @param {number} timestamp - The timestamp
   *
   * @returns {string} The handlevideothumbnailselect result
   */

  /**
   * Handles video thumbnail select event
   *
   * @returns {string} The handlevideothumbnailselect result
   */

  const handleVideoThumbnailSelect = (
    /** Thumbnail Data Url */
    thumbnailDataUrl: string,
    /** Timestamp */
    timestamp: number,
  ) => {
    const updatedMedia: MediaFile = {
      ...media,
      /** Metadata */
      metadata: {
        ...media.metadata!,
        /** Thumbnail */
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
