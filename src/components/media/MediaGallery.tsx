/**
 * @fileoverview React Component
 * @module src/components/media/MediaGallery
 * @description This file contains the MediaGallery component and its related functionality
 * 
 * @created 2025-12-05
 * @author Development Team
 */

"use client";

import React, { useState } from "react";
import { GripVertical, Eye, Trash2, Edit2, Check, X } from "lucide-react";
import Image from "next/image";
import { MediaFile } from "@/types/media";
import MediaPreviewCard from "./MediaPreviewCard";

/**
 * MediaGalleryProps interface
 * 
 * @interface
 * @description Defines the structure and contract for MediaGalleryProps
 */
interface MediaGalleryProps {
  /** Files */
  files: MediaFile[];
  /** On Reorder */
  onReorder?: (files: MediaFile[]) => void;
  /** On Remove */
  onRemove?: (id: string) => void;
  /** On Edit */
  onEdit?: (id: string) => void;
  /** On Select */
  onSelect?: (ids: string[]) => void;
  /** Selected Ids */
  selectedIds?: string[];
  /** Allow Reorder */
  allowReorder?: boolean;
  /** Allow Bulk Actions */
  allowBulkActions?: boolean;
  /** Class Name */
  className?: string;
}

export default function MediaGallery({
  files,
  onReorder,
  onRemove,
  onEdit,
  onSelect,
  selectedIds = [],
  allowReorder = true,
  allowBulkActions = true,
  className = "",
}: MediaGalleryProps) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  /**
   * Handles drag start event
   *
   * @param {number} index - The index
   *
   * @returns {number} The handledragstart result
   */

  /**
   * Handles drag start event
   *
   * @param {number} index - The index
   *
   * @returns {number} The handledragstart result
   */

  const handleDragStart = (index: number) => {
    if (!allowReorder) return;
    setDraggedIndex(index);
  };

  /**
   * Handles drag over event
   *
   * @param {React.DragEvent} e - The e
   * @param {number} index - The index
   *
   * @returns {number} The handledragover result
   */

  /**
   * Handles drag over event
   *
   * @param {React.DragEvent} e - The e
   * @param {number} index - The index
   *
   * @returns {number} The handledragover result
   */

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (!allowReorder || draggedIndex === null || draggedIndex === index)
      return;

    const newFiles = [...files];
    const draggedFile = newFiles[draggedIndex];
    newFiles.splice(draggedIndex, 1);
    newFiles.splice(index, 0, draggedFile);

    setDraggedIndex(index);
    onReorder?.(newFiles);
  };

  /**
   * Handles drag end event
   *
   * @returns {string} The handledragend result
   */

  /**
   * Handles drag end event
   *
   * @returns {any} The handledragend result
   */

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  /**
   * Performs toggle select operation
   *
   * @param {string} id - Unique identifier
   *
   * @returns {string} The toggleselect result
   */

  /**
   * Performs toggle select operation
   *
   * @param {string} id - Unique identifier
   *
   * @returns {string} The toggleselect result
   */

  const toggleSelect = (id: string) => {
    if (!allowBulkActions || !onSelect) return;

    const newSelection = selectedIds.includes(id)
      ? selectedIds.filter((selectedId) => selectedId !== id)
      : [...selectedIds, id];

    onSelect(newSelection);
  };

  /**
   * Performs select all operation
   *
   * @returns {any} The selectall result
   */

  /**
   * Performs select all operation
   *
   * @returns {any} The selectall result
   */

  const selectAll = () => {
    if (!onSelect) return;
    onSelect(files.map((f) => f.id));
  };

  /**
   * Performs deselect all operation
   *
   * @returns {any} The deselectall result
   */

  /**
   * Performs deselect all operation
   *
   * @returns {any} The deselectall result
   */

  const deselectAll = () => {
    if (!onSelect) return;
    onSelect([]);
  };

  /**
   * Deletes selected
   *
   * @returns {any} The removeselected result
   */

  /**
   * Deletes selected
   *
   * @returns {any} The removeselected result
   */

  const removeSelected = () => {
    if (!onRemove) return;
    selectedIds.forEach((id) => onRemove(id));
    deselectAll();
  };

  /**
   * Performs open lightbox operation
   *
   * @param {number} index - The index
   *
   * @returns {number} The openlightbox result
   */

  /**
   * Performs open lightbox operation
   *
   * @param {number} index - The index
   *
   * @returns {number} The openlightbox result
   */

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
  };

  /**
   * Performs close lightbox operation
   *
   * @returns {any} The closelightbox result
   */

  /**
   * Performs close lightbox operation
   *
   * @returns {any} The closelightbox result
   */

  const closeLightbox = () => {
    setLightboxIndex(null);
  };

  /**
   * Performs next image operation
   *
   * @returns {any} The nextimage result
   */

  /**
   * Performs next image operation
   *
   * @returns {any} The nextimage result
   */

  const nextImage = () => {
    if (lightboxIndex === null) return;
    setLightboxIndex((lightboxIndex + 1) % files.length);
  };

  /**
   * Performs prev image operation
   *
   * @returns {any} The previmage result
   */

  /**
   * Performs prev image operation
   *
   * @returns {any} The previmage result
   */

  const prevImage = () => {
    if (lightboxIndex === null) return;
    setLightboxIndex((lightboxIndex - 1 + files.length) % files.length);
  };

  if (files.length === 0) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <p className="text-gray-500">No media files yet</p>
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Bulk Actions */}
      {allowBulkActions && selectedIds.length > 0 && (
        <div className="mb-4 flex items-center justify-between bg-blue-50 border border-blue-200 rounded-lg p-3">
          <span className="text-sm font-medium text-blue-900">
            {selectedIds.length} selected
          </span>
          <div className="flex gap-2">
            <button
              onClick={deselectAll}
              className="px-3 py-1.5 text-sm text-gray-700 hover:bg-white rounded transition-colors"
            >
              Deselect All
            </button>
            <button
              onClick={removeSelected}
              className="px-3 py-1.5 text-sm text-red-700 hover:bg-red-100 rounded transition-colors flex items-center gap-1"
            >
              <Trash2 className="w-4 h-4" />
              Delete Selected
            </button>
          </div>
        </div>
      )}

      {allowBulkActions && selectedIds.length === 0 && files.length > 1 && (
        <div className="mb-4 flex justify-end">
          <button
            onClick={selectAll}
            className="text-sm text-blue-600 hover:text-blue-700"
          >
            Select All
          </button>
        </div>
      )}

      {/* Gallery Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {files.map((file, index) => (
          <div
            key={file.id}
            draggable={allowReorder}
            onDragStart={() => handleDragStart(index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDragEnd={handleDragEnd}
            className={`relative group ${allowReorder ? "cursor-move" : ""} ${
              draggedIndex === index ? "opacity-50" : ""
            }`}
          >
            {/* Selection Checkbox */}
            {allowBulkActions && (
              <div className="absolute top-2 left-2 z-10">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleSelect(file.id);
                  }}
                  className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-colors ${
                    selectedIds.includes(file.id)
                      ? "bg-blue-600 border-blue-600"
                      : "bg-white border-gray-300 hover:border-blue-600"
                  }`}
                >
                  {selectedIds.includes(file.id) && (
                    <Check className="w-4 h-4 text-white" />
                  )}
                </button>
              </div>
            )}

            {/* Drag Handle */}
            {allowReorder && (
              <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="p-1 bg-white rounded shadow-sm">
                  <GripVertical className="w-4 h-4 text-gray-600" />
                </div>
              </div>
            )}

            {/* Media Card */}
            <div
              onClick={() => openLightbox(index)}
              onKeyDown={(e) => e.key === "Enter" && openLightbox(index)}
              role="button"
              tabIndex={0}
              className="cursor-pointer"
            >
              <MediaPreviewCard
                media={file}
                onRemove={() => onRemove?.(file.id)}
                onEdit={() => onEdit?.(file.id)}
                showActions={!allowBulkActions}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <div
          className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center"
          onKeyDown={(e) => {
            if (e.key === "Escape") closeLightbox();
            if (e.key === "ArrowLeft") prevImage();
            if (e.key === "ArrowRight") nextImage();
          }}
          role="dialog"
          aria-modal="true"
          tabIndex={-1}
        >
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 p-2 text-white hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Navigation */}
          {files.length > 1 && (
            <>
              <button
                onClick={prevImage}
                className="absolute left-4 top-1/2 -translate-y-1/2 p-3 text-white hover:bg-white/20 rounded-lg transition-colors"
              >
                <span className="text-2xl">←</span>
              </button>
              <button
                onClick={nextImage}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-3 text-white hover:bg-white/20 rounded-lg transition-colors"
              >
                <span className="text-2xl">→</span>
              </button>
            </>
          )}

          {/* Image Display */}
          <div className="max-w-7xl max-h-[90vh] w-full h-full flex items-center justify-center p-4">
            {files[lightboxIndex].type === "image" ? (
              <div className="relative w-full h-full">
                <Image
                  src={files[lightboxIndex].preview}
                  alt={files[lightboxIndex].file.name}
                  fill
                  className="object-contain"
                />
              </div>
            ) : (
              <video
                src={files[lightboxIndex].preview}
                controls
                className="max-w-full max-h-full"
              />
            )}
          </div>

          {/* Info */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white text-center">
            <p className="text-sm font-medium">
              {files[lightboxIndex].file.name}
            </p>
            <p className="text-xs opacity-75 mt-1">
              {lightboxIndex + 1} / {files.length}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
