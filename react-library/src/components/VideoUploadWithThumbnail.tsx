
import { Film, Upload, X } from "lucide-react";
import React, { useCallback, useRef, useState } from "react";

interface VideoUploadWithThumbnailProps {
  onUpload: (file: File, thumbnail?: File) => Promise<void>;
  maxSize?: number;
  maxDuration?: number;
  className?: string;
  autoDelete?: boolean;
}

export function VideoUploadWithThumbnail({
  onUpload,
  maxSize = 50 * 1024 * 1024, // 50MB
  maxDuration = 300, // 5 minutes
  className = "",
  autoDelete = false,
}: VideoUploadWithThumbnailProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [thumbnail, setThumbnail] = useState<string | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [duration, setDuration] = useState<number>(0);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const generateThumbnail = useCallback(
    (video: HTMLVideoElement, time: number = 0) => {
      return new Promise<File>((resolve, reject) => {
        video.currentTime = time;

        const onSeeked = () => {
          const canvas = canvasRef.current;
          if (!canvas) {
            reject(new Error("Canvas not available"));
            return;
          }

          // Set canvas size to video dimensions
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;

          // Draw video frame to canvas
          const ctx = canvas.getContext("2d");
          if (!ctx) {
            reject(new Error("Could not get canvas context"));
            return;
          }

          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

          // Convert canvas to blob
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error("Could not generate thumbnail"));
                return;
              }

              const file = new File([blob], "thumbnail.jpg", {
                type: "image/jpeg",
              });
              resolve(file);
            },
            "image/jpeg",
            0.8
          );

          video.removeEventListener("seeked", onSeeked);
        };

        video.addEventListener("seeked", onSeeked);
      });
    },
    []
  );

  const handleFileSelect = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      setError(null);

      // Validate file type
      if (!file.type.startsWith("video/")) {
        setError("Please select a video file");
        return;
      }

      // Validate file size
      if (file.size > maxSize) {
        setError(
          `File size must be less than ${(maxSize / (1024 * 1024)).toFixed(
            0
          )}MB`
        );
        return;
      }

      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setVideoUrl(url);

      // Wait for video metadata to load
      const video = videoRef.current;
      if (video) {
        video.onloadedmetadata = async () => {
          const videoDuration = video.duration;
          setDuration(videoDuration);

          // Check duration
          if (videoDuration > maxDuration) {
            setError(
              `Video duration must be less than ${Math.floor(
                maxDuration / 60
              )} minutes`
            );
            return;
          }

          // Generate thumbnail from first frame
          try {
            const thumbFile = await generateThumbnail(video, 0);
            setThumbnailFile(thumbFile);

            const thumbUrl = URL.createObjectURL(thumbFile);
            setThumbnail(thumbUrl);
          } catch (err) {
            console.error("Failed to generate thumbnail:", err);
            setError("Could not generate thumbnail");
          }
        };
      }
    },
    [maxSize, maxDuration, generateThumbnail]
  );

  const handleThumbnailTimeChange = async (time: number) => {
    const video = videoRef.current;
    if (!video) return;

    try {
      const thumbFile = await generateThumbnail(video, time);
      setThumbnailFile(thumbFile);

      if (thumbnail) {
        URL.revokeObjectURL(thumbnail);
      }

      const thumbUrl = URL.createObjectURL(thumbFile);
      setThumbnail(thumbUrl);
    } catch (err) {
      console.error("Failed to generate thumbnail:", err);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setError(null);
    setProgress(0);

    try {
      await onUpload(selectedFile, thumbnailFile || undefined);

      // Reset after successful upload
      handleCancel();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setIsUploading(false);
      setProgress(0);
    }
  };

  const handleCancel = () => {
    if (videoUrl) URL.revokeObjectURL(videoUrl);
    if (thumbnail) URL.revokeObjectURL(thumbnail);

    setSelectedFile(null);
    setVideoUrl(null);
    setThumbnail(null);
    setThumbnailFile(null);
    setDuration(0);
    setError(null);
    setProgress(0);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <canvas ref={canvasRef} className="hidden" />

      {!videoUrl ? (
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="video/*"
            onChange={handleFileSelect}
            className="hidden"
            id="video-upload-input"
          />
          <label
            htmlFor="video-upload-input"
            className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
          >
            <Film className="w-12 h-12 text-gray-400 mb-3" />
            <p className="text-sm text-gray-600 font-medium">
              Click to upload video
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Max size: {(maxSize / (1024 * 1024)).toFixed(0)}MB | Max duration:{" "}
              {Math.floor(maxDuration / 60)} min
            </p>
          </label>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Video Preview */}
          <div className="relative w-full bg-black rounded-lg overflow-hidden">
            <video
              ref={videoRef}
              src={videoUrl}
              controls
              className="w-full h-auto"
            />
          </div>

          {/* Thumbnail Preview & Selection */}
          {thumbnail && (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Video Thumbnail
              </label>
              <div className="flex gap-4 items-start">
                <img
                  src={thumbnail}
                  alt="Thumbnail"
                  className="w-32 h-32 object-cover rounded-lg border-2 border-gray-200"
                />
                <div className="flex-1 space-y-2">
                  <p className="text-sm text-gray-600">
                    Drag slider to change thumbnail frame
                  </p>
                  <input
                    type="range"
                    min="0"
                    max={duration}
                    step="0.1"
                    onChange={(e) =>
                      handleThumbnailTimeChange(parseFloat(e.target.value))
                    }
                    className="w-full"
                  />
                  <p className="text-xs text-gray-500">
                    Duration: {formatTime(duration)}
                  </p>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          {isUploading && (
            <div className="space-y-2">
              <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-600 transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-sm text-gray-600 text-center">
                Uploading... {progress}%
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2">
            <button
              onClick={handleUpload}
              disabled={isUploading || !!error}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed transition-colors"
            >
              {isUploading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-5 h-5" />
                  Upload Video
                </>
              )}
            </button>

            <button
              onClick={handleCancel}
              disabled={isUploading}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
