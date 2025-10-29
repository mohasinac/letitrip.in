"use client";

import React from "react";
import { Box, Button, SxProps, Theme } from "@mui/material";

interface FormActionsProps {
  onCancel?: () => void;
  onSubmit?: () => void;
  submitLabel?: string;
  cancelLabel?: string;
  isLoading?: boolean;
  sx?: SxProps<Theme>;
  variant?: "inline" | "full-width";
}

/**
 * FormActions Component
 * Standardized action buttons for forms
 * Handles submit/cancel with consistent styling
 */
export function FormActions({
  onCancel,
  onSubmit,
  submitLabel = "Submit",
  cancelLabel = "Cancel",
  isLoading = false,
  sx,
  variant = "inline",
}: FormActionsProps) {
  return (
    <Box
      sx={{
        display: "flex",
        gap: 2,
        justifyContent: variant === "full-width" ? "space-between" : "flex-end",
        ...(sx as any),
      }}
    >
      {onCancel && (
        <Button
          onClick={onCancel}
          disabled={isLoading}
          variant="outlined"
          sx={{ flex: variant === "full-width" ? 1 : "auto" }}
        >
          {cancelLabel}
        </Button>
      )}
      {onSubmit && (
        <Button
          onClick={onSubmit}
          disabled={isLoading}
          variant="contained"
          sx={{ flex: variant === "full-width" ? 1 : "auto" }}
        >
          {isLoading ? "Loading..." : submitLabel}
        </Button>
      )}
    </Box>
  );
}

export default FormActions;
