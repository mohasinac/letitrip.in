"use client";

import React, { useState, useCallback } from "react";
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
} from "@mui/material";
import Cropper from "react-easy-crop";

interface Point {
  x: number;
  y: number;
}

interface Area {
  width: number;
  height: number;
  x: number;
  y: number;
}

export interface WhatsAppCropData {
  crop: Point;
  zoom: number;
  croppedAreaPixels: Area;
}

interface WhatsAppImageEditorProps {
  open: boolean;
  imageUrl: string;
  initialCrop?: Point;
  initialZoom?: number;
  onClose: () => void;
  onSave: (cropData: WhatsAppCropData) => void;
}

/**
 * Create canvas from cropped area
 */
const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", (error) => reject(error));
    image.setAttribute("crossOrigin", "anonymous");
    image.src = url;
  });

/**
 * Get cropped image as blob
 */
async function getCroppedImg(
  imageSrc: string,
  pixelCrop: Area,
  rotation = 0
): Promise<Blob> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    throw new Error("No 2d context");
  }

  // Set canvas size to 800x800 (WhatsApp format)
  const targetSize = 800;
  canvas.width = targetSize;
  canvas.height = targetSize;

  // Draw white background
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Calculate scaling to fit the cropped area into 800x800
  const scaleX = targetSize / pixelCrop.width;
  const scaleY = targetSize / pixelCrop.height;
  const scale = Math.min(scaleX, scaleY);

  // Calculate position to center the image
  const offsetX = (targetSize - pixelCrop.width * scale) / 2;
  const offsetY = (targetSize - pixelCrop.height * scale) / 2;

  // Draw the cropped image
  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    offsetX,
    offsetY,
    pixelCrop.width * scale,
    pixelCrop.height * scale
  );

  // Convert canvas to blob
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob);
      } else {
        reject(new Error("Canvas is empty"));
      }
    }, "image/jpeg");
  });
}

export default function WhatsAppImageEditor({
  open,
  imageUrl,
  initialCrop,
  initialZoom,
  onClose,
  onSave,
}: WhatsAppImageEditorProps) {
  const [crop, setCrop] = useState<Point>(initialCrop || { x: 0, y: 0 });
  const [zoom, setZoom] = useState(initialZoom || 1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [saving, setSaving] = useState(false);

  const onCropComplete = useCallback(
    (croppedArea: Area, croppedAreaPixels: Area) => {
      setCroppedAreaPixels(croppedAreaPixels);
    },
    []
  );

  const handleSave = async () => {
    if (!croppedAreaPixels) return;

    try {
      setSaving(true);
      // Save crop data instead of generating image
      onSave({
        crop,
        zoom,
        croppedAreaPixels,
      });
      onClose();
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        WhatsApp Image Editor (800x800)
        <Typography variant="caption" display="block" color="text.secondary">
          Drag image to position • Scroll or use slider to zoom
        </Typography>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ position: "relative", width: "100%", height: 500 }}>
          <Cropper
            image={imageUrl}
            crop={crop}
            zoom={zoom}
            aspect={1}
            onCropChange={setCrop}
            onCropComplete={onCropComplete}
            onZoomChange={setZoom}
            minZoom={0.1}
            maxZoom={3}
            zoomSpeed={0.5}
            restrictPosition={false}
            style={{
              containerStyle: {
                backgroundColor: "#f0f0f0",
                cursor: "move",
              },
              cropAreaStyle: {
                border: "2px solid #25D366",
                boxShadow: "0 0 20px rgba(37, 211, 102, 0.3)",
              },
              mediaStyle: {
                cursor: "grab",
              },
            }}
          />
          {/* 800x800 Frame Overlay */}
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: 400,
              height: 400,
              border: "3px dashed #25D366",
              pointerEvents: "none",
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "center",
              pt: 2,
              boxShadow: "inset 0 0 30px rgba(37, 211, 102, 0.1)",
            }}
          >
            <Typography
              variant="caption"
              sx={{
                bgcolor: "rgba(37, 211, 102, 0.95)",
                color: "white",
                px: 2,
                py: 0.5,
                borderRadius: 1,
                fontWeight: 600,
                fontSize: "0.75rem",
              }}
            >
              📱 800x800 WhatsApp Frame
            </Typography>
          </Box>

          {/* Drag Instruction Overlay */}
          {zoom === (initialZoom || 1) && crop.x === 0 && crop.y === 0 && (
            <Box
              sx={{
                position: "absolute",
                bottom: 16,
                left: "50%",
                transform: "translateX(-50%)",
                bgcolor: "rgba(0, 0, 0, 0.7)",
                color: "white",
                px: 2,
                py: 1,
                borderRadius: 2,
                pointerEvents: "none",
                display: "flex",
                alignItems: "center",
                gap: 1,
              }}
            >
              <Typography variant="caption">
                👆 Drag image to reposition
              </Typography>
            </Box>
          )}
        </Box>

        {/* Zoom Control */}
        <Box sx={{ mt: 3 }}>
          <Typography variant="caption" gutterBottom display="block">
            Zoom: {zoom.toFixed(1)}x (0.1x - 3x)
          </Typography>
          <Slider
            value={zoom}
            min={0.1}
            max={3}
            step={0.05}
            onChange={(e, zoom) => setZoom(zoom as number)}
            sx={{
              color: "#25D366",
            }}
          />
        </Box>

        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          <strong>Drag</strong> the image to adjust position. <strong>Zoom</strong> in/out to fit your content. 
          Settings are saved without uploading.
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={saving}>
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          disabled={saving}
          startIcon={saving ? <CircularProgress size={20} /> : null}
          sx={{
            bgcolor: "#25D366",
            "&:hover": {
              bgcolor: "#128C7E",
            },
          }}
        >
          {saving ? "Saving..." : "Save Crop Settings"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
