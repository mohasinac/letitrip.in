"use client";

import React, { useState, useEffect } from "react";
import { X, Check } from "lucide-react";
import { MediaFile } from "@/types/media";
import { extractMultipleThumbnails } from "@/lib/media/video-processor";
import Image from "next/image";

interface VideoThumbnailGeneratorProps {
  media: MediaFile;
  onSelect: (thumbnailDataUrl: string, timestamp: number) => void;
  onCancel: () => void;
  thumbnailCount?: number;
}

export default function VideoThumbnailGenerator({
  media,
  onSelect,
  onCancel,
  thumbnailCount = 5,
}: VideoThumbnailGeneratorProps) {
  const [thumbnails, setThumbnails] = useState<
    Array<{ dataUrl: string; timestamp: number }>
  >([]);
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [customTimestamp, setCustomTimestamp] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [duration, setDuration] = useState<number>(0);

  useEffect(() => {
    generateThumbnails();
  }, []);

  const generateThumbnails = async () => {
    setIsGenerating(true);
    try {
      const generated = await extractMultipleThumbnails(
        media.file,
        thumbnailCount
      );
      setThumbnails(generated);

      // Get video duration
      const video = document.createElement("video");
      video.src = media.preview;
      video.onloadedmetadata = () => {
        setDuration(video.duration);
      };
    } catch (error) {
      console.error("Error generating thumbnails:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCustomTimestamp = async () => {
    const timestamp = parseFloat(customTimestamp);
    if (isNaN(timestamp) || timestamp < 0 || timestamp > duration) {
      alert("Invalid timestamp");
      return;
    }

    setIsGenerating(true);
    try {
      const { extractVideoThumbnail } = await import(
        "@/lib/media/video-processor"
      );
      const thumbnailDataUrl = await extractVideoThumbnail(
        media.file,
        timestamp
      );

      // Add to thumbnails
      setThumbnails((prev) => [
        ...prev,
        { dataUrl: thumbnailDataUrl, timestamp },
      ]);
    } catch (error) {
      console.error("Error generating custom thumbnail:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSelect = () => {
    const selected = thumbnails[selectedIndex];
    if (selected) {
      onSelect(selected.dataUrl, selected.timestamp);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="fixed inset-0 bg-black/95 z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-black/50 border-b border-white/10">
        <h2 className="text-lg font-semibold text-white">
          Select Video Thumbnail
        </h2>
        <button
          onClick={onCancel}
          className="p-2 text-white hover:bg-white/20 rounded-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 p-8 overflow-y-auto">
        {/* Video Preview */}
        <div className="max-w-4xl mx-auto mb-8">
          <video
            src={media.preview}
            controls
            className="w-full rounded-lg shadow-lg"
          />
        </div>

        {/* Thumbnail Grid */}
        <div className="max-w-4xl mx-auto mb-8">
          <h3 className="text-white font-medium mb-4">Generated Thumbnails</h3>

          {isGenerating && (
            <div className="text-center py-12 text-white">
              <div className="w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4" />
              <p>Generating thumbnails...</p>
            </div>
          )}

          {!isGenerating && thumbnails.length > 0 && (
            <div className="grid grid-cols-3 md:grid-cols-5 gap-4">
              {thumbnails.map((thumbnail, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedIndex(index)}
                  className={`relative aspect-video rounded-lg overflow-hidden border-2 transition-all ${
                    selectedIndex === index
                      ? "border-blue-500 ring-2 ring-blue-500"
                      : "border-white/20 hover:border-white/40"
                  }`}
                >
                  <Image
                    src={thumbnail.dataUrl}
                    alt={`Thumbnail ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute bottom-0 inset-x-0 bg-black/70 text-white text-xs py-1 text-center">
                    {formatTime(thumbnail.timestamp)}
                  </div>
                  {selectedIndex === index && (
                    <div className="absolute top-2 right-2 bg-blue-500 rounded-full p-1">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Custom Timestamp */}
        <div className="max-w-4xl mx-auto">
          <h3 className="text-white font-medium mb-4">Custom Timestamp</h3>
          <div className="flex gap-2">
            <input
              type="number"
              step="0.1"
              min="0"
              max={duration}
              value={customTimestamp}
              onChange={(e) => setCustomTimestamp(e.target.value)}
              placeholder={`0 - ${formatTime(duration)}`}
              className="flex-1 px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-white/50 focus:outline-none focus:border-blue-500"
            />
            <button
              onClick={handleCustomTimestamp}
              disabled={isGenerating || !customTimestamp}
              className="px-6 py-2 bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
            >
              Generate
            </button>
          </div>
          <p className="text-white/50 text-sm mt-2">
            Enter a timestamp in seconds (e.g., 15.5 for 15.5 seconds)
          </p>
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
          onClick={handleSelect}
          disabled={thumbnails.length === 0}
          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors font-medium"
        >
          Use Selected
        </button>
      </div>
    </div>
  );
}
