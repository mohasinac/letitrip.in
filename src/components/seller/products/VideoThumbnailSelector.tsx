"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Slider,
  Typography,
  CircularProgress,
  Paper,
} from "@mui/material";
import { PlayArrow, Pause, CameraAlt } from "@mui/icons-material";

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

  const captureCurrentFrame = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    if (!ctx) return;

    // Set canvas size to video dimensions
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw current frame
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Create preview URL
    const previewUrl = canvas.toDataURL("image/jpeg", 0.85);
    setThumbnailPreview(previewUrl);
  };

  const handleSave = async () => {
    if (!thumbnailPreview) {
      captureCurrentFrame();
      return;
    }

    try {
      setSaving(true);

      // Convert data URL to blob
      const response = await fetch(thumbnailPreview);
      const blob = await response.blob();

      onSave(blob, thumbnailPreview, currentTime);
      onClose();
    } catch (error) {
      console.error("Error saving thumbnail:", error);
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
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        Select Video Thumbnail
        <Typography variant="caption" display="block" color="text.secondary">
          Scrub through the video and capture the perfect frame
        </Typography>
      </DialogTitle>
      <DialogContent>
        {loading && (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              minHeight: 300,
            }}
          >
            <CircularProgress />
          </Box>
        )}

        {/* Video Player */}
        <Box
          sx={{
            position: "relative",
            width: "100%",
            bgcolor: "black",
            borderRadius: 1,
            overflow: "hidden",
            display: loading ? "none" : "block",
          }}
        >
          <video
            ref={videoRef}
            src={videoUrl}
            onLoadedMetadata={handleLoadedMetadata}
            onTimeUpdate={handleTimeUpdate}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            style={{
              width: "100%",
              maxHeight: "400px",
              display: "block",
            }}
          />

          {/* Play/Pause Overlay */}
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              opacity: isPlaying ? 0 : 0.8,
              transition: "opacity 0.3s",
              pointerEvents: "none",
            }}
          >
            {!isPlaying && (
              <PlayArrow
                sx={{
                  fontSize: 80,
                  color: "white",
                  filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.5))",
                }}
              />
            )}
          </Box>
        </Box>

        {/* Hidden canvas for frame capture */}
        <canvas ref={canvasRef} style={{ display: "none" }} />

        {/* Controls */}
        {!loading && (
          <Box sx={{ mt: 3 }}>
            {/* Timeline Slider */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
              <Button
                variant="outlined"
                size="small"
                onClick={togglePlayPause}
                sx={{ minWidth: 40 }}
              >
                {isPlaying ? <Pause /> : <PlayArrow />}
              </Button>
              <Typography variant="caption" sx={{ minWidth: 50 }}>
                {formatTime(currentTime)}
              </Typography>
              <Slider
                value={currentTime}
                min={0}
                max={duration}
                step={0.1}
                onChange={handleSliderChange}
                sx={{ flex: 1 }}
              />
              <Typography variant="caption" sx={{ minWidth: 50 }}>
                {formatTime(duration)}
              </Typography>
            </Box>

            {/* Capture Button */}
            <Button
              fullWidth
              variant="outlined"
              startIcon={<CameraAlt />}
              onClick={captureCurrentFrame}
              sx={{ mb: 2 }}
            >
              Capture Current Frame
            </Button>

            {/* Thumbnail Preview */}
            {thumbnailPreview && (
              <Paper elevation={2} sx={{ p: 2, bgcolor: "grey.50" }}>
                <Typography variant="subtitle2" gutterBottom>
                  Selected Thumbnail Preview
                </Typography>
                <Box
                  sx={{
                    width: "100%",
                    height: 200,
                    backgroundImage: `url(${thumbnailPreview})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    borderRadius: 1,
                    border: "2px solid",
                    borderColor: "primary.main",
                  }}
                />
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ mt: 1, display: "block" }}
                >
                  Frame at {formatTime(currentTime)}
                </Typography>
              </Paper>
            )}
          </Box>
        )}

        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          <strong>Tip:</strong> Use the slider to scrub through the video, or
          play/pause to find the perfect moment. Click "Capture Current Frame"
          when ready.
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={saving}>
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          disabled={!thumbnailPreview || saving}
          startIcon={saving ? <CircularProgress size={20} /> : null}
        >
          {saving
            ? "Saving..."
            : thumbnailPreview
            ? "Use This Thumbnail"
            : "Capture Frame First"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
