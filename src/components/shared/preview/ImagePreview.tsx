"use client";

import React, { useState } from "react";
import { Box, Typography, SxProps, Theme } from "@mui/material";
import { getImageUrl } from "@/lib/utils/storage";

interface ImagePreviewProps {
  imageUrl: string | null | undefined;
  useCache?: boolean;
  cacheDuration?: number;
  sx?: SxProps<Theme>;
}

/**
 * ImagePreview Component
 * Displays image thumbnail with fallback and error handling
 * Automatically uses cached API endpoint for images
 */
export function ImagePreview({
  imageUrl,
  useCache = true,
  cacheDuration = 86400,
  sx,
}: ImagePreviewProps) {
  const [imageError, setImageError] = useState(false);

  if (!imageUrl) {
    return (
      <Box
        sx={{
          width: 80,
          height: 80,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "action.hover",
          borderRadius: 1,
          border: "1px solid",
          borderColor: "divider",
          ...sx,
        }}
      >
        <Typography variant="caption" color="text.secondary">
          No image
        </Typography>
      </Box>
    );
  }

  if (imageError) {
    return (
      <Box
        sx={{
          width: 80,
          height: 80,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "action.hover",
          borderRadius: 1,
          border: "1px solid",
          borderColor: "error.main",
          ...sx,
        }}
      >
        <Typography variant="caption" color="error">
          Failed to load
        </Typography>
      </Box>
    );
  }

  // Use cached API endpoint for image retrieval
  const cachedImageUrl = useCache
    ? getImageUrl(imageUrl, true, cacheDuration)
    : imageUrl;

  return (
    <Box
      component="img"
      src={cachedImageUrl}
      onError={() => setImageError(true)}
      sx={{
        width: 80,
        height: 80,
        objectFit: "cover",
        borderRadius: 1,
        border: "1px solid",
        borderColor: "divider",
        ...sx,
      }}
    />
  );
}

export default ImagePreview;
