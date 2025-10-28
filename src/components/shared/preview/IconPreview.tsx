"use client";

import React from "react";
import { Box, Typography, SxProps, Theme } from "@mui/material";
import * as MuiIcons from "@mui/icons-material";

interface IconPreviewProps {
  iconName: string | null | undefined;
  size?: number;
  sx?: SxProps<Theme>;
}

/**
 * Get Material UI icon component by name
 * @param iconName - Icon name from MuiIcons
 * @returns IconComponent or null
 */
export function getMuiIcon(iconName: string | null | undefined) {
  if (!iconName) return null;

  try {
    const IconComponent = (MuiIcons as any)[iconName];
    return IconComponent || null;
  } catch (error) {
    console.debug(`Icon not found: ${iconName}`);
    return null;
  }
}

/**
 * IconPreview Component
 * Displays Material UI icon preview with fallback states
 */
export function IconPreview({ iconName, size = 48, sx }: IconPreviewProps) {
  if (!iconName) {
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
          No icon
        </Typography>
      </Box>
    );
  }

  const IconComponent = getMuiIcon(iconName);

  if (!IconComponent) {
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
          Invalid icon
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        width: 80,
        height: 80,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "primary.main",
        borderRadius: 1,
        color: "primary.contrastText",
        ...sx,
      }}
    >
      <IconComponent sx={{ fontSize: size }} />
    </Box>
  );
}

export default IconPreview;
