"use client";

import React, { useState, useRef } from "react";
import {
  Box,
  Button,
  Stack,
  Typography,
  CircularProgress,
  Alert,
  Chip,
} from "@mui/material";
import {
  CloudUpload as CloudUploadIcon,
  PhotoCamera as PhotoCameraIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";

interface MediaUploadProps {
  onImageSelected: (imageUrl: string) => void;
  onVideoSelected?: (videoUrl: string) => void;
  currentImage?: string;
  currentVideo?: string;
  acceptedTypes?: string[];
  maxSize?: number; // in MB
}

export default function MediaUpload({
  onImageSelected,
  onVideoSelected,
  currentImage,
  currentVideo,
  acceptedTypes = [".jpg", ".jpeg", ".png", ".gif", ".mp4", ".webm"],
  maxSize = 25, // 25MB default
}: MediaUploadProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // New state for local preview
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [previewType, setPreviewType] = useState<"image" | "video" | null>(
    null
  );

  // Cleanup preview URL on unmount
  React.useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleFileUpload = async (file: File) => {
    setError(null);

    // Validate file size
    if (file.size > maxSize * 1024 * 1024) {
      setError(`File size exceeds ${maxSize}MB limit`);
      return;
    }

    // Validate file type
    const fileType = `.${file.name.split(".").pop()?.toLowerCase()}`;
    if (!acceptedTypes.includes(fileType)) {
      setError(`Invalid file type. Accepted: ${acceptedTypes.join(", ")}`);
      return;
    }

    // Create local preview URL
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    setPendingFile(file);

    // Determine media type
    const isVideo = fileType.includes(".mp4") || fileType.includes(".webm");
    setPreviewType(isVideo ? "video" : "image");
  };

  // Save/Upload the pending file
  const handleSaveMedia = async () => {
    if (!pendingFile || !previewType) return;

    setLoading(true);

    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append("file", pendingFile);

      // Upload to your API
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Upload failed");
      }

      const data = await response.json();
      const fileUrl = data.url;

      // Call appropriate callback
      if (previewType === "video") {
        onVideoSelected?.(fileUrl);
      } else {
        onImageSelected(fileUrl);
      }

      // Clear preview after successful upload
      if (previewUrl && previewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }
      setPreviewUrl(null);
      setPendingFile(null);
      setPreviewType(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  // Cancel the pending upload
  const handleCancelPreview = () => {
    if (previewUrl && previewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    setPendingFile(null);
    setPreviewType(null);
    setError(null);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleCameraCapture = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleRemoveImage = () => {
    onImageSelected("");
  };

  const handleRemoveVideo = () => {
    onVideoSelected?.("");
  };

  return (
    <Stack spacing={2}>
      {/* Upload Buttons */}
      <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
        <Button
          variant="outlined"
          startIcon={<CloudUploadIcon />}
          onClick={() => fileInputRef.current?.click()}
          disabled={loading}
          fullWidth={true}
        >
          {loading ? "Uploading..." : "Upload Image/Video"}
        </Button>
        <Button
          variant="outlined"
          startIcon={<PhotoCameraIcon />}
          onClick={() => cameraInputRef.current?.click()}
          disabled={loading}
          fullWidth={true}
        >
          {loading ? "Capturing..." : "Use Camera"}
        </Button>
      </Stack>

      {/* Hidden Inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept={acceptedTypes.join(",")}
        onChange={handleFileInputChange}
        style={{ display: "none" }}
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*,video/*"
        capture="environment"
        onChange={handleCameraCapture}
        style={{ display: "none" }}
      />

      {/* Error Message */}
      {error && <Alert severity="error">{error}</Alert>}

      {/* Loading Indicator */}
      {loading && (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            py: 2,
          }}
        >
          <CircularProgress size={40} />
          <Typography sx={{ ml: 2 }}>Uploading...</Typography>
        </Box>
      )}

      {/* Preview (Not Saved Yet) */}
      {previewUrl && previewType && (
        <Box>
          <Typography variant="subtitle2" sx={{ mb: 1 }} color="primary.main">
            Preview (Not Saved Yet)
          </Typography>
          <Box
            sx={{
              position: "relative",
              width: "100%",
              borderRadius: 1,
              border: "3px solid",
              borderColor: "primary.main",
              overflow: "hidden",
              boxShadow: 3,
            }}
          >
            {previewType === "image" ? (
              <Box
                sx={{
                  width: "100%",
                  height: 200,
                  backgroundImage: `url(${previewUrl})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              />
            ) : (
              <video
                src={previewUrl}
                style={{
                  width: "100%",
                  height: 200,
                  objectFit: "cover",
                }}
                controls
              />
            )}
          </Box>
          <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleSaveMedia}
              disabled={loading}
              fullWidth
            >
              {loading
                ? "Saving..."
                : `Save ${previewType === "image" ? "Image" : "Video"}`}
            </Button>
            <Button
              variant="outlined"
              color="secondary"
              onClick={handleCancelPreview}
              disabled={loading}
              fullWidth
            >
              Cancel
            </Button>
          </Stack>
        </Box>
      )}

      {/* Current Image Preview */}
      {currentImage && !previewUrl && (
        <Box>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            Current Image
          </Typography>
          <Box
            sx={{
              position: "relative",
              width: "100%",
              height: 200,
              backgroundImage: `url(${currentImage})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              borderRadius: 1,
              border: "2px solid",
              borderColor: "divider",
              overflow: "hidden",
            }}
          >
            <Button
              size="small"
              color="error"
              startIcon={<DeleteIcon />}
              onClick={handleRemoveImage}
              sx={{
                position: "absolute",
                top: 8,
                right: 8,
                backgroundColor: "rgba(0, 0, 0, 0.6)",
                color: "white",
                "&:hover": { backgroundColor: "rgba(0, 0, 0, 0.8)" },
              }}
            >
              Remove
            </Button>
          </Box>
        </Box>
      )}

      {/* Current Video Preview */}
      {currentVideo && !previewUrl && (
        <Box>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            Current Video
          </Typography>
          <Box
            sx={{
              position: "relative",
              width: "100%",
              borderRadius: 1,
              border: "2px solid",
              borderColor: "divider",
              overflow: "hidden",
            }}
          >
            <video
              src={currentVideo}
              style={{
                width: "100%",
                height: 200,
                objectFit: "cover",
              }}
              controls
            />
            <Button
              size="small"
              color="error"
              startIcon={<DeleteIcon />}
              onClick={handleRemoveVideo}
              sx={{
                position: "absolute",
                top: 8,
                right: 8,
                backgroundColor: "rgba(0, 0, 0, 0.6)",
                color: "white",
                "&:hover": { backgroundColor: "rgba(0, 0, 0, 0.8)" },
              }}
            >
              Remove
            </Button>
          </Box>
        </Box>
      )}

      {/* File Size Info */}
      <Chip
        label={`Max file size: ${maxSize}MB | Accepted: ${acceptedTypes.join(
          ", "
        )}`}
        size="small"
        variant="outlined"
      />
    </Stack>
  );
}
