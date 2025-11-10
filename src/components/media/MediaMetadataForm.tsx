"use client";

import React, { useState, useEffect } from "react";
import { MediaMetadata } from "@/types/media";

interface MediaMetadataFormProps {
  metadata: MediaMetadata;
  onChange: (metadata: MediaMetadata) => void;
  autoSlug?: boolean;
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

  const generateSlug = (text: string): string => {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");
  };

  const handleDescriptionChange = (description: string) => {
    const updated = { ...localMetadata, description };

    // Auto-generate slug from description if enabled and slug is empty
    if (autoSlug && !localMetadata.slug && description) {
      updated.slug = generateSlug(description);
    }

    setLocalMetadata(updated);
    onChange(updated);
  };

  const handleSlugChange = (slug: string) => {
    const updated = { ...localMetadata, slug };
    setLocalMetadata(updated);
    onChange(updated);
  };

  const handleAltChange = (alt: string) => {
    const updated = { ...localMetadata, alt };
    setLocalMetadata(updated);
    onChange(updated);
  };

  const handleCaptionChange = (caption: string) => {
    const updated = { ...localMetadata, caption };
    setLocalMetadata(updated);
    onChange(updated);
  };

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
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description <span className="text-red-500">*</span>
        </label>
        <textarea
          value={localMetadata.description || ""}
          onChange={(e) => handleDescriptionChange(e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Enter a description for this media"
          required
        />
      </div>

      {/* Slug */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Slug <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={localMetadata.slug || ""}
          onChange={(e) => handleSlugChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="media-slug"
          pattern="[a-z0-9-]+"
          required
        />
        <p className="text-xs text-gray-500 mt-1">
          URL-friendly identifier (lowercase letters, numbers, and hyphens only)
        </p>
      </div>

      {/* Alt Text (for images) */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Alt Text
        </label>
        <input
          type="text"
          value={localMetadata.alt || ""}
          onChange={(e) => handleAltChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Alternative text for accessibility"
        />
        <p className="text-xs text-gray-500 mt-1">
          Describes the image for screen readers and search engines
        </p>
      </div>

      {/* Caption */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Caption
        </label>
        <input
          type="text"
          value={localMetadata.caption || ""}
          onChange={(e) => handleCaptionChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Optional caption"
        />
      </div>

      {/* Tags */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Tags
        </label>
        <input
          type="text"
          value={localMetadata.tags?.join(", ") || ""}
          onChange={(e) => handleTagsChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="tag1, tag2, tag3"
        />
        <p className="text-xs text-gray-500 mt-1">
          Comma-separated tags for organization
        </p>
      </div>

      {/* File Info (Read-only) */}
      <div className="pt-4 border-t border-gray-200">
        <h4 className="text-sm font-medium text-gray-700 mb-2">
          File Information
        </h4>
        <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
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
