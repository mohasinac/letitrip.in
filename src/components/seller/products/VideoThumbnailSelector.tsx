"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  UnifiedModal,
  PrimaryButton,
  SecondaryButton,
} from "@/components/ui/unified";
import { Play, Pause, Camera } from "lucide-react";

interface VideoThumbnailSelectorProps {
  open: boolean;
  videoUrl: string;
  currentThumbnail?: string;
  onClose: () => void;
  onSave: (
    thumbnailBlob: Blob,
    thumbnailUrl: string,
    timestamp: number
  ) => void;
}

export default function VideoThumbnailSelector({
  open,
  videoUrl,
  currentThumbnail,
  onClose,
  onSave,
}: VideoThumbnailSelectorProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (open && videoRef.current) {
      videoRef.current.load();
    }
  }, [open, videoUrl]);

  // Cleanup blob URL on unmount or when thumbnail changes
  useEffect(() => {
    return () => {
      if (thumbnailPreview && thumbnailPreview.startsWith("blob:")) {
        URL.revokeObjectURL(thumbnailPreview);
      }
    };
  }, [thumbnailPreview]);

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
      setLoading(false);
      // Start at 1 second or 10% of duration
      const initialTime = Math.min(1, videoRef.current.duration * 0.1);
      videoRef.current.currentTime = initialTime;
      setCurrentTime(initialTime);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleSliderChange = (event: Event, newValue: number | number[]) => {
    const time = newValue as number;
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const togglePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const captureCurrentFrame = async () => {
    if (!videoRef.current) return;

    const video = videoRef.current;

    try {
      // Create a temporary canvas for this capture
      const tempCanvas = document.createElement("canvas");
      tempCanvas.width = video.videoWidth;
      tempCanvas.height = video.videoHeight;

      const ctx = tempCanvas.getContext("2d", { willReadFrequently: true });
      if (!ctx) {
        alert("Failed to get canvas context");
        return;
      }

      // Draw current frame
      ctx.drawImage(video, 0, 0, tempCanvas.width, tempCanvas.height);

      // Convert to blob using a Promise wrapper
      const blob = await new Promise<Blob | null>((resolve) => {
        tempCanvas.toBlob((blob) => resolve(blob), "image/jpeg", 0.85);
      });

      if (blob) {
        const previewUrl = URL.createObjectURL(blob);
        setThumbnailPreview(previewUrl);
      } else {
        console.error("Failed to create blob from canvas");
        alert("Failed to capture frame. Please try again.");
      }
    } catch (error) {
      console.error("Error capturing frame:", error);

      // Fallback: Try with MediaRecorder API or direct blob creation
      try {
        // Alternative: Use ImageCapture API if available
        const stream = (video as any).captureStream?.();
        if (stream) {
          const track = stream.getVideoTracks()[0];
          const imageCapture = new (window as any).ImageCapture(track);
          const bitmap = await imageCapture.grabFrame();

          // Create canvas from bitmap
          const tempCanvas = document.createElement("canvas");
          tempCanvas.width = bitmap.width;
          tempCanvas.height = bitmap.height;
          const ctx = tempCanvas.getContext("2d");
          ctx?.drawImage(bitmap, 0, 0);

          const blob = await new Promise<Blob | null>((resolve) => {
            tempCanvas.toBlob((blob) => resolve(blob), "image/jpeg", 0.85);
          });

          if (blob) {
            const previewUrl = URL.createObjectURL(blob);
            setThumbnailPreview(previewUrl);
            return;
          }
        }
      } catch (fallbackError) {
        console.error("Fallback capture failed:", fallbackError);
      }

      alert(
        "Unable to capture frame from this video. This may be due to browser security restrictions."
      );
    }
  };

  const handleSave = async () => {
    if (!thumbnailPreview) {
      captureCurrentFrame();
      return;
    }

    try {
      setSaving(true);

      // Convert blob URL to blob
      const response = await fetch(thumbnailPreview);
      const blob = await response.blob();

      onSave(blob, thumbnailPreview, currentTime);
      onClose();
    } catch (error) {
      console.error("Error saving thumbnail:", error);
      alert("Failed to save thumbnail. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <UnifiedModal
      open={open}
      onClose={onClose}
      title="Select Video Thumbnail"
      size="lg"
    >
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
        Scrub through the video and capture the perfect frame
      </p>

      {loading && (
        <div className="flex justify-center items-center min-h-[300px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      )}

      {/* Video Player */}
      <div
        className={`relative w-full bg-black rounded-lg overflow-hidden ${
          loading ? "hidden" : "block"
        }`}
      >
        <video
          ref={videoRef}
          src={videoUrl}
          onLoadedMetadata={handleLoadedMetadata}
          onTimeUpdate={handleTimeUpdate}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          className="w-full max-h-[400px] block"
        />

        {/* Play/Pause Overlay */}
        <div
          className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transition-opacity duration-300 pointer-events-none ${
            isPlaying ? "opacity-0" : "opacity-80"
          }`}
        >
          {!isPlaying && (
            <Play
              className="w-20 h-20 text-white"
              style={{ filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.5))" }}
            />
          )}
        </div>
      </div>

      {/* Hidden canvas for frame capture */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Controls */}
      {!loading && (
        <div className="mt-6">
          {/* Timeline Slider */}
          <div className="flex items-center gap-4 mb-4">
            <SecondaryButton
              size="sm"
              onClick={togglePlayPause}
              className="min-w-[40px] !px-2"
            >
              {isPlaying ? (
                <Pause className="w-4 h-4" />
              ) : (
                <Play className="w-4 h-4" />
              )}
            </SecondaryButton>
            <span className="text-xs text-gray-600 dark:text-gray-400 min-w-[50px]">
              {formatTime(currentTime)}
            </span>
            <input
              type="range"
              value={currentTime}
              min={0}
              max={duration}
              step={0.1}
              onChange={(e) =>
                handleSliderChange(e as any, parseFloat(e.target.value))
              }
              className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
            />
            <span className="text-xs text-gray-600 dark:text-gray-400 min-w-[50px]">
              {formatTime(duration)}
            </span>
          </div>

          {/* Capture Button */}
          <SecondaryButton
            fullWidth
            leftIcon={<Camera className="w-4 h-4" />}
            onClick={captureCurrentFrame}
            className="mb-4"
          >
            Capture Current Frame
          </SecondaryButton>

          {/* Thumbnail Preview */}
          {thumbnailPreview && (
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border-2 border-blue-600">
              <p className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                Selected Thumbnail Preview
              </p>
              <div
                className="w-full h-[200px] bg-cover bg-center rounded-lg border-2 border-blue-600"
                style={{ backgroundImage: `url(${thumbnailPreview})` }}
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                Frame at {formatTime(currentTime)}
              </p>
            </div>
          )}
        </div>
      )}

      <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
        <strong>Tip:</strong> Use the slider to scrub through the video, or
        play/pause to find the perfect moment. Click "Capture Current Frame"
        when ready.
      </p>

      {/* Modal Actions */}
      <div className="flex justify-end gap-3 mt-6">
        <SecondaryButton onClick={onClose} disabled={saving}>
          Cancel
        </SecondaryButton>
        <PrimaryButton
          onClick={handleSave}
          disabled={!thumbnailPreview || saving}
          leftIcon={
            saving ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : undefined
          }
        >
          {saving
            ? "Saving..."
            : thumbnailPreview
            ? "Use This Thumbnail"
            : "Capture Frame First"}
        </PrimaryButton>
      </div>
    </UnifiedModal>
  );
}
