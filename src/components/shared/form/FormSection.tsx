"use client";

import React from "react";
import { Box, Typography, SxProps, Theme } from "@mui/material";

interface FormSectionProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  sx?: SxProps<Theme>;
}

/**
 * FormSection Component
 * Standardized section container for form groups
 * Provides consistent spacing and title styling
 */
export function FormSection({
  title,
  subtitle,
  children,
  sx,
}: FormSectionProps) {
  return (
    <Box sx={{ ...sx }}>
      <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 2 }}>
        {title}
      </Typography>
      {subtitle && (
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ mb: 2, display: "block" }}
        >
          {subtitle}
        </Typography>
      )}
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {children}
      </Box>
    </Box>
  );
}

export default FormSection;
