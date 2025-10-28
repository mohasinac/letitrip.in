"use client";

import React, { useState, useRef, useCallback, useEffect, forwardRef, useImperativeHandle } from "react";
import {
  Box,
  Stack,
  Typography,
  Slider,
  IconButton,
  Paper,
} from "@mui/material";
import {
  ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon,
  RestartAlt as ResetIcon,
} from "@mui/icons-material";

interface ImageCropperProps {
  imageUrl: string;
  targetWidth?: number;
  targetHeight?: number;
}

interface ImageCropperRef {
  getCroppedImage: () => Promise<Blob>;
}

const ImageCropper = forwardRef<ImageCropperRef, ImageCropperProps>(({
  imageUrl,
  targetWidth = 400,
  targetHeight = 400,
}, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [imageLoaded, setImageLoaded] = useState(false);

  // Load and draw image
  useEffect(() => {
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.src = imageUrl;
    
    image.onload = () => {
      imageRef.current = image;
      setImageLoaded(true);
      centerImage(image);
    };

    return () => {
      imageRef.current = null;
    };
  }, [imageUrl]);

  // Center image initially
  const centerImage = (image: HTMLImageElement) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const scale = Math.max(
      targetWidth / image.width,
      targetHeight / image.height
    );
    setZoom(scale);
    setPosition({ x: 0, y: 0 });
  };

  // Draw on canvas
  const drawImage = useCallback(() => {
    const canvas = canvasRef.current;
    const image = imageRef.current;
    if (!canvas || !image || !imageLoaded) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, targetWidth, targetHeight);

    // Calculate scaled dimensions
    const scaledWidth = image.width * zoom;
    const scaledHeight = image.height * zoom;

    // Calculate position (centered + offset)
    const x = (targetWidth - scaledWidth) / 2 + position.x;
    const y = (targetHeight - scaledHeight) / 2 + position.y;

    // Draw image
    ctx.drawImage(image, x, y, scaledWidth, scaledHeight);
  }, [zoom, position, imageLoaded, targetWidth, targetHeight]);

  // Redraw when zoom or position changes
  useEffect(() => {
    drawImage();
  }, [drawImage]);

  // Handle mouse down
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  // Handle mouse move
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    
    const newX = e.clientX - dragStart.x;
    const newY = e.clientY - dragStart.y;
    
    setPosition({ x: newX, y: newY });
  };

  // Handle mouse up
  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Handle touch events for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    setIsDragging(true);
    setDragStart({ x: touch.clientX - position.x, y: touch.clientY - position.y });
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    
    const touch = e.touches[0];
    const newX = touch.clientX - dragStart.x;
    const newY = touch.clientY - dragStart.y;
    
    setPosition({ x: newX, y: newY });
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  // Zoom controls
  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 0.1, 3));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 0.1, 0.1));
  };

  const handleReset = () => {
    if (imageRef.current) {
      centerImage(imageRef.current);
    }
  };

  // Get cropped image as blob
  const getCroppedImage = (): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const canvas = canvasRef.current;
      if (!canvas) {
        reject(new Error("Canvas not found"));
        return;
      }

      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error("Failed to create blob"));
          }
        },
        "image/jpeg",
        0.95
      );
    });
  };

  // Expose methods to parent via ref
  useImperativeHandle(ref, () => ({
    getCroppedImage,
  }));

  return (
    <Paper elevation={3} sx={{ p: 2 }}>
      <Stack spacing={2}>
        <Typography variant="subtitle2" fontWeight={600}>
          Adjust Image (Drag to move, scroll to zoom)
        </Typography>

        {/* Canvas Preview */}
        <Box
          sx={{
            position: "relative",
            width: targetWidth,
            height: targetHeight,
            margin: "0 auto",
            border: "2px solid",
            borderColor: "primary.main",
            borderRadius: 1,
            overflow: "hidden",
            cursor: isDragging ? "grabbing" : "grab",
            touchAction: "none",
          }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <canvas
            ref={canvasRef}
            width={targetWidth}
            height={targetHeight}
            style={{
              display: "block",
              width: "100%",
              height: "100%",
            }}
          />
          
          {/* Size indicator */}
          <Box
            sx={{
              position: "absolute",
              bottom: 8,
              right: 8,
              backgroundColor: "rgba(0, 0, 0, 0.7)",
              color: "white",
              px: 1,
              py: 0.5,
              borderRadius: 1,
              fontSize: "0.75rem",
            }}
          >
            {targetWidth} × {targetHeight}
          </Box>
        </Box>

        {/* Zoom Controls */}
        <Stack spacing={2}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <IconButton
              size="small"
              onClick={handleZoomOut}
              disabled={zoom <= 0.1}
            >
              <ZoomOutIcon />
            </IconButton>
            
            <Slider
              value={zoom}
              onChange={(_, value) => setZoom(value as number)}
              min={0.1}
              max={3}
              step={0.1}
              valueLabelDisplay="auto"
              valueLabelFormat={(value) => `${Math.round(value * 100)}%`}
              sx={{ flex: 1 }}
            />
            
            <IconButton
              size="small"
              onClick={handleZoomIn}
              disabled={zoom >= 3}
            >
              <ZoomInIcon />
            </IconButton>
            
            <IconButton size="small" onClick={handleReset} title="Reset">
              <ResetIcon />
            </IconButton>
          </Box>

          <Typography variant="caption" color="text.secondary" textAlign="center">
            Drag to reposition • Scroll or use slider to zoom • Click reset to center
          </Typography>
        </Stack>
      </Stack>
    </Paper>
  );
});

ImageCropper.displayName = "ImageCropper";

export default ImageCropper;
export type { ImageCropperProps, ImageCropperRef };
