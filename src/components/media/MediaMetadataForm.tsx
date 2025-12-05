/**
 * @fileoverview React Component
 * @module src/components/media/MediaMetadataForm
 * @description This file contains the MediaMetadataForm component and its related functionality
 * 
 * @created 2025-12-05
 * @author Development Team
 */

"use client";

import React, { useState, useEffect } from "react";
import { FormInput } from "@/components/forms/FormInput";
import { FormTextarea } from "@/components/forms/FormTextarea";
import { MediaMetadata } from "@/types/media";

/**
 * MediaMetadataFormProps interface
 * 
 * @interface
 * @description Defines the structure and contract for MediaMetadataFormProps
 */
interface MediaMetadataFormProps {
  /** Metadata */
  metadata: MediaMetadata;
  /** On Change */
  onChange: (metadata: MediaMetadata) => void;
  /** Auto Slug */
  autoSlug?: boolean;
  /** Class Name */
  className?: string;
}

export default function MediaMetadataForm({
  metadata,
  onChange,
  autoSlug = true,
  className = "",
}: MediaMetadataFormProps) {
  const [localMetadata, setLocalMetadata] = useState<MediaMetadata>(metadata);

  useEffect(() => {
    setLocalMetadata(metadata);
  }, [metadata]);

  /**
   * Performs generate slug operation
   *
   * @param {string} text - The text
   *
   * @returns {string} The slug result
   */

  /**
   * Performs generate slug operation
   *
   * @param {string} text - The text
   *
   * @returns {string} The slug result
   */

  const generateSlug = (text: string): string => {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");
  };

  /**
   * Handles description change event
   *
   * @param {string} description - The description
   *
   * @returns {string} The handledescriptionchange result
   */

  /**
   * Handles description change event
   *
   * @param {string} description - The description
   *
   * @returns {string} The handledescriptionchange result
   */

  const handleDescriptionChange = (description: string) => {
    const updated = { ...localMetadata, description };

    // Auto-generate slug from description if enabled and slug is empty
    if (autoSlug && !localMetadata.slug && description) {
      updated.slug = generateSlug(description);
    }

    setLocalMetadata(updated);
    onChange(updated);
  };

  /**
   * Handles slug change event
   *
   * @param {string} slug - URL-friendly identifier
   *
   * @returns {string} The handleslugchange result
   */

  /**
   * Handles slug change event
   *
   * @param {string} slug - URL-friendly identifier
   *
   * @returns {string} The handleslugchange result
   */

  const handleSlugChange = (slug: string) => {
    const updated = { ...localMetadata, slug };
    setLocalMetadata(updated);
    onChange(updated);
  };

  /**
   * Handles alt change event
   *
   * @param {string} alt - The alt
   *
   * @returns {string} The handlealtchange result
   */

  /**
   * Handles alt change event
   *
   * @param {string} alt - The alt
   *
   * @returns {string} The handlealtchange result
   */

  const handleAltChange = (alt: string) => {
    const updated = { ...localMetadata, alt };
    setLocalMetadata(updated);
    onChange(updated);
  };

  /**
   * Handles caption change event
   *
   * @param {string} caption - The caption
   *
   * @returns {string} The handlecaptionchange result
   */

  /**
   * Handles caption change event
   *
   * @param {string} caption - The caption
   *
   * @returns {string} The handlecaptionchange result
   */

  const handleCaptionChange = (caption: string) => {
    const updated = { ...localMetadata, caption };
    setLocalMetadata(updated);
    onChange(updated);
  };

  /**
   * Handles tags change event
   *
   * @param {string} tagsString - The tags string
   *
   * @returns {string} The handletagschange result
   */

  /**
   * Handles tags change event
   *
   * @param {string} tagsString - The tags string
   *
   * @returns {string} The handletagschange result
   */

  const handleTagsChange = (tagsString: string) => {
    const tags = tagsString
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);
    const updated = { ...localMetadata, tags };
    setLocalMetadata(updated);
    onChange(updated);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Description */}
      <FormTextarea
        label="Description"
        value={localMetadata.description || ""}
        onChange={(e) => handleDescriptionChange(e.target.value)}
        rows={3}
        placeholder="Enter a description for this media"
        required
      />

      {/* Slug */}
      <FormInput
        label="Slug"
        value={localMetadata.slug || ""}
        onChange={(e) => handleSlugChange(e.target.value)}
        placeholder="media-slug"
        helperText="URL-friendly identifier (lowercase letters, numbers, and hyphens only)"
        required
      />

      {/* Alt Text (for images) */}
      <FormInput
        label="Alt Text"
        value={localMetadata.alt || ""}
        onChange={(e) => handleAltChange(e.target.value)}
        placeholder="Alternative text for accessibility"
        helperText="Describes the image for screen readers and search engines"
      />

      {/* Caption */}
      <FormInput
        label="Caption"
        value={localMetadata.caption || ""}
        onChange={(e) => handleCaptionChange(e.target.value)}
        placeholder="Optional caption"
      />

      {/* Tags */}
      <FormInput
        label="Tags"
        value={localMetadata.tags?.join(", ") || ""}
        onChange={(e) => handleTagsChange(e.target.value)}
        placeholder="tag1, tag2, tag3"
        helperText="Comma-separated tags for organization"
      />

      {/* File Info (Read-only) */}
      <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          File Information
        </h4>
        <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 dark:text-gray-400">
          <div>
            <span className="font-medium">Type:</span> {localMetadata.mimeType}
          </div>
          <div>
            <span className="font-medium">Size:</span>{" "}
            {(localMetadata.size / 1024 / 1024).toFixed(2)} MB
          </div>
          {localMetadata.dimensions && (
            <>
              <div>
                <span className="font-medium">Width:</span>{" "}
                {localMetadata.dimensions.width}px
              </div>
              <div>
                <span className="font-medium">Height:</span>{" "}
                {localMetadata.dimensions.height}px
              </div>
            </>
          )}
          {localMetadata.duration && (
            <div>
              <span className="font-medium">Duration:</span>{" "}
              {Math.floor(localMetadata.duration / 60)}:
              {String(Math.floor(localMetadata.duration % 60)).padStart(2, "0")}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
