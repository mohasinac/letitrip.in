"use client";

import { useState, useRef, useEffect } from "react";
import { Modal, Button } from "@/components";
import { Text } from "@/components/typography";
import { THEME_CONSTANTS, UI_LABELS } from "@/constants";

export interface ImageCropData {
  url: string;
  position: {
    x: number; // percentage
    y: number; // percentage
  };
  zoom: number; // 0.1 to 3.0
}

interface ImageCropModalProps {
  isOpen: boolean;
  imageUrl: string;
  onClose: () => void;
  onSave: (cropData: ImageCropData) => void;
  initialCropData?: Partial<ImageCropData>;
}

export function ImageCropModal({
  isOpen,
  imageUrl,
  onClose,
  onSave,
  initialCropData,
}: ImageCropModalProps) {
  const [zoom, setZoom] = useState(initialCropData?.zoom || 1);
  const [position, setPosition] = useState(
    initialCropData?.position || { x: 50, y: 50 },
  );
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [showZoomWarning, setShowZoomWarning] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    // Show warning if zoomed out too much (image smaller than container)
    setShowZoomWarning(zoom < 0.5);
  }, [zoom]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !containerRef.current) return;

    const container = containerRef.current.getBoundingClientRect();
    const newX = ((e.clientX - dragStart.x) / container.width) * 100;
    const newY = ((e.clientY - dragStart.y) / container.height) * 100;

    setPosition({
      x: Math.max(0, Math.min(100, newX)),
      y: Math.max(0, Math.min(100, newY)),
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    setIsDragging(true);
    setDragStart({
      x: touch.clientX - position.x,
      y: touch.clientY - position.y,
    });
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !containerRef.current) return;

    const touch = e.touches[0];
    const container = containerRef.current.getBoundingClientRect();
    const newX = ((touch.clientX - dragStart.x) / container.width) * 100;
    const newY = ((touch.clientY - dragStart.y) / container.height) * 100;

    setPosition({
      x: Math.max(0, Math.min(100, newX)),
      y: Math.max(0, Math.min(100, newY)),
    });
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    const step = e.shiftKey ? 5 : 1;
    switch (e.key) {
      case "ArrowLeft":
        e.preventDefault();
        setPosition((prev) => ({ ...prev, x: Math.max(0, prev.x - step) }));
        break;
      case "ArrowRight":
        e.preventDefault();
        setPosition((prev) => ({ ...prev, x: Math.min(100, prev.x + step) }));
        break;
      case "ArrowUp":
        e.preventDefault();
        setPosition((prev) => ({ ...prev, y: Math.max(0, prev.y - step) }));
        break;
      case "ArrowDown":
        e.preventDefault();
        setPosition((prev) => ({ ...prev, y: Math.min(100, prev.y + step) }));
        break;
      case "+":
      case "=":
        e.preventDefault();
        setZoom((prev) => Math.min(3, prev + 0.1));
        break;
      case "-":
        e.preventDefault();
        setZoom((prev) => Math.max(0.1, prev - 0.1));
        break;
    }
  };

  const handleZoomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setZoom(parseFloat(e.target.value));
  };

  const handleSave = () => {
    onSave({
      url: imageUrl,
      position,
      zoom,
    });
    onClose();
  };

  const handleReset = () => {
    setZoom(1);
    setPosition({ x: 50, y: 50 });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={UI_LABELS.AVATAR.TITLE}
      size="lg"
    >
      <div className="space-y-3">
        {/* Preview Container */}
        <div className="space-y-1">
          <Text variant="secondary" className="text-xs">
            {UI_LABELS.AVATAR.INSTRUCTION}
          </Text>

          <div
            ref={containerRef}
            className="relative w-full max-w-sm mx-auto aspect-square bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden cursor-move max-h-[280px] touch-none"
            data-disable-swipe="true"
            tabIndex={0}
            role="application"
            aria-label="Image position. Use arrow keys to move, +/- to zoom"
            onKeyDown={handleKeyDown}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {/* Image */}
            <img
              ref={imageRef}
              src={imageUrl}
              alt={UI_LABELS.AVATAR.ALT_PREVIEW}
              draggable={false}
              className="absolute select-none pointer-events-none object-cover"
              style={{
                width: `${zoom * 100}%`,
                height: `${zoom * 100}%`,
                left: `${position.x}%`,
                top: `${position.y}%`,
                transform: "translate(-50%, -50%)",
              }}
            />

            {/* Grid overlay for positioning reference */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute w-full h-full grid grid-cols-3 grid-rows-3">
                {[...Array(9)].map((_, i) => (
                  <div
                    key={i}
                    className="border border-white/20 dark:border-gray-600/30"
                  />
                ))}
              </div>
            </div>

            {/* Center crosshair */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none">
              <div className="w-8 h-0.5 bg-white/50 dark:bg-gray-400/50" />
              <div className="w-0.5 h-8 bg-white/50 dark:bg-gray-400/50 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
            </div>
          </div>
        </div>

        {/* Zoom Control */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <Text className="text-xs font-medium">{UI_LABELS.AVATAR.ZOOM}</Text>
            <Text className={`text-xs ${THEME_CONSTANTS.themed.textSecondary}`}>
              {(zoom * 100).toFixed(0)}%
            </Text>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setZoom(Math.max(0.1, zoom - 0.1))}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
              aria-label={UI_LABELS.AVATAR.ZOOM_OUT}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7"
                />
              </svg>
            </button>

            <input
              type="range"
              min="0.1"
              max="3"
              step="0.01"
              value={zoom}
              onChange={handleZoomChange}
              aria-label="Zoom level"
              className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-primary-600"
            />

            <button
              type="button"
              onClick={() => setZoom(Math.min(3, zoom + 0.1))}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
              aria-label={UI_LABELS.AVATAR.ZOOM_IN}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"
                />
              </svg>
            </button>
          </div>

          {/* Zoom presets */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setZoom(0.5)}
              className="px-3 py-1 text-xs rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700"
            >
              50%
            </button>
            <button
              type="button"
              onClick={() => setZoom(1)}
              className="px-3 py-1 text-xs rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700"
            >
              100%
            </button>
            <button
              type="button"
              onClick={() => setZoom(1.5)}
              className="px-3 py-1 text-xs rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700"
            >
              150%
            </button>
            <button
              type="button"
              onClick={() => setZoom(2)}
              className="px-3 py-1 text-xs rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700"
            >
              200%
            </button>
          </div>
        </div>

        {/* Warning for zoom out */}
        {showZoomWarning && (
          <div className="p-2 bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 rounded">
            <div className="flex items-start gap-2">
              <svg
                className="w-4 h-4 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              <div>
                <Text className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                  {UI_LABELS.AVATAR.ZOOM_WARNING_TITLE}
                </Text>
                <Text className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
                  {UI_LABELS.AVATAR.ZOOM_WARNING_MESSAGE}
                </Text>
              </div>
            </div>
          </div>
        )}

        {/* Position Info */}
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <span>
            {UI_LABELS.AVATAR.POSITION}: {position.x.toFixed(0)}%,{" "}
            {position.y.toFixed(0)}%
          </span>
          <button
            type="button"
            onClick={handleReset}
            className="text-primary-600 dark:text-primary-400 hover:underline"
          >
            {UI_LABELS.AVATAR.RESET}
          </button>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <Button onClick={handleSave} variant="primary" className="flex-1">
            {UI_LABELS.AVATAR.SAVE_CHANGES}
          </Button>
          <Button onClick={onClose} variant="secondary" className="flex-1">
            {UI_LABELS.ACTIONS.CANCEL}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
