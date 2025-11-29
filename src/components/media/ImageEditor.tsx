"use client";

import { useState, useRef, useEffect } from "react";
import { X, RotateCw, FlipHorizontal, FlipVertical } from "lucide-react";
import { EditorState, MediaFile } from "@/types/media";
import { applyImageEdits } from "@/lib/media/image-processor";
import Image from "next/image";

interface ImageEditorProps {
  media: MediaFile;
  onSave: (editedMedia: MediaFile) => void;
  onCancel: () => void;
}

export default function ImageEditor({
  media,
  onSave,
  onCancel,
}: ImageEditorProps) {
  const [editorState, setEditorState] = useState<EditorState>({
    rotation: 0,
    flip: {
      horizontal: false,
      vertical: false,
    },
    zoom: 1,
    brightness: 0,
    contrast: 0,
    saturation: 0,
    filter: "none",
  });

  const [previewUrl, setPreviewUrl] = useState<string>(media.preview);
  const [isProcessing, setIsProcessing] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Update preview when editor state changes
  useEffect(() => {
    updatePreview();
  }, [editorState]);

  const updatePreview = async () => {
    try {
      const editedBlob = await applyImageEdits(media.file, editorState);
      const url = URL.createObjectURL(editedBlob);
      setPreviewUrl(url);
    } catch (error) {
      console.error("Error updating preview:", error);
    }
  };

  const handleSave = async () => {
    setIsProcessing(true);
    try {
      const editedBlob = await applyImageEdits(media.file, editorState);
      const editedFile = new File([editedBlob], media.file.name, {
        type: "image/jpeg",
      });

      const editedMedia: MediaFile = {
        ...media,
        file: editedFile,
        preview: URL.createObjectURL(editedBlob),
        metadata: {
          ...media.metadata!,
          size: editedFile.size,
        },
      };

      onSave(editedMedia);
    } catch (error) {
      console.error("Error saving edits:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const rotate = () => {
    setEditorState((prev) => ({
      ...prev,
      rotation: ((prev.rotation || 0) + 90) % 360,
    }));
  };

  const flipHorizontal = () => {
    setEditorState((prev) => ({
      ...prev,
      flip: {
        ...prev.flip,
        horizontal: !prev.flip.horizontal,
      },
    }));
  };

  const flipVertical = () => {
    setEditorState((prev) => ({
      ...prev,
      flip: {
        ...prev.flip,
        vertical: !prev.flip.vertical,
      },
    }));
  };

  const updateAdjustment = (
    key: "brightness" | "contrast" | "saturation",
    value: number,
  ) => {
    setEditorState((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const updateFilter = (filter: EditorState["filter"]) => {
    setEditorState((prev) => ({
      ...prev,
      filter,
    }));
  };

  const resetAll = () => {
    setEditorState({
      rotation: 0,
      flip: {
        horizontal: false,
        vertical: false,
      },
      zoom: 1,
      brightness: 0,
      contrast: 0,
      saturation: 0,
      filter: "none",
    });
  };

  return (
    <div className="fixed inset-0 bg-black/95 z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-black/50 border-b border-white/10">
        <h2 className="text-lg font-semibold text-white">Edit Image</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={resetAll}
            className="px-4 py-2 text-white hover:bg-white/10 rounded-lg transition-colors text-sm"
          >
            Reset
          </button>
          <button
            onClick={onCancel}
            className="p-2 text-white hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Preview Area */}
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="relative max-w-full max-h-full">
            <Image
              src={previewUrl}
              alt="Preview"
              width={800}
              height={600}
              className="max-w-full max-h-full object-contain"
              style={{
                transform: `scale(${editorState.zoom}) rotate(${
                  editorState.rotation
                }deg) scaleX(${editorState.flip.horizontal ? -1 : 1}) scaleY(${
                  editorState.flip.vertical ? -1 : 1
                })`,
              }}
            />
          </div>
          <canvas ref={canvasRef} className="hidden" />
        </div>

        {/* Controls Panel */}
        <div className="w-80 bg-gray-900 overflow-y-auto p-6 space-y-6">
          {/* Transform */}
          <div>
            <h3 className="text-white font-medium mb-3">Transform</h3>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={rotate}
                className="p-3 bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-white flex flex-col items-center gap-1"
              >
                <RotateCw className="w-5 h-5" />
                <span className="text-xs">Rotate</span>
              </button>
              <button
                onClick={flipHorizontal}
                className="p-3 bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-white flex flex-col items-center gap-1"
              >
                <FlipHorizontal className="w-5 h-5" />
                <span className="text-xs">Flip H</span>
              </button>
              <button
                onClick={flipVertical}
                className="p-3 bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-white flex flex-col items-center gap-1"
              >
                <FlipVertical className="w-5 h-5" />
                <span className="text-xs">Flip V</span>
              </button>
            </div>
          </div>

          {/* Adjustments */}
          <div>
            <h3 className="text-white font-medium mb-3">Adjustments</h3>
            <div className="space-y-4">
              {/* Brightness */}
              <div>
                <label className="text-white text-sm mb-2 flex justify-between">
                  <span>Brightness</span>
                  <span>{editorState.brightness}</span>
                </label>
                <input
                  type="range"
                  min="-100"
                  max="100"
                  value={editorState.brightness}
                  onChange={(e) =>
                    updateAdjustment("brightness", parseInt(e.target.value))
                  }
                  className="w-full"
                />
              </div>

              {/* Contrast */}
              <div>
                <label className="text-white text-sm mb-2 flex justify-between">
                  <span>Contrast</span>
                  <span>{editorState.contrast}</span>
                </label>
                <input
                  type="range"
                  min="-100"
                  max="100"
                  value={editorState.contrast}
                  onChange={(e) =>
                    updateAdjustment("contrast", parseInt(e.target.value))
                  }
                  className="w-full"
                />
              </div>

              {/* Saturation */}
              <div>
                <label className="text-white text-sm mb-2 flex justify-between">
                  <span>Saturation</span>
                  <span>{editorState.saturation}</span>
                </label>
                <input
                  type="range"
                  min="-100"
                  max="100"
                  value={editorState.saturation}
                  onChange={(e) =>
                    updateAdjustment("saturation", parseInt(e.target.value))
                  }
                  className="w-full"
                />
              </div>
            </div>
          </div>

          {/* Filters */}
          <div>
            <h3 className="text-white font-medium mb-3">Filters</h3>
            <div className="grid grid-cols-3 gap-2">
              {(
                [
                  "none",
                  "grayscale",
                  "sepia",
                  "vintage",
                  "cold",
                  "warm",
                ] as const
              ).map((filter) => (
                <button
                  key={filter}
                  onClick={() => updateFilter(filter)}
                  className={`p-3 rounded-lg transition-colors text-white text-xs capitalize ${
                    editorState.filter === filter
                      ? "bg-blue-600"
                      : "bg-white/10 hover:bg-white/20"
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-end gap-3 p-4 bg-black/50 border-t border-white/10">
        <button
          onClick={onCancel}
          className="px-6 py-2 text-white hover:bg-white/10 rounded-lg transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={isProcessing}
          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors font-medium"
        >
          {isProcessing ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </div>
  );
}
