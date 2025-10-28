"use client";

import React from "react";
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Button,
  ButtonGroup,
  Typography,
  Divider,
  Alert,
} from "@mui/material";
import { useModernTheme } from "@/contexts/ModernThemeContext";

export default function ThemeSettings() {
  const { themeName, setTheme, mode } = useModernTheme();

  const themeOptions = [
    {
      id: "default" as const,
      label: "Default Theme",
      description:
        "Original blue & gray theme with clean white/black backgrounds",
    },
    {
      id: "custom" as const,
      label: "Custom Theme",
      description: `Wind pattern with ${
        mode === "light"
          ? "blood red & royal blue colors"
          : "fire red & light green colors with galaxy starry background"
      }`,
    },
  ];

  const handleThemeChange = (newTheme: "default" | "custom") => {
    setTheme(newTheme);
  };

  return (
    <Card sx={{ borderRadius: 2, boxShadow: 2 }}>
      <CardHeader
        title="Theme Settings"
        subheader="Select your preferred theme palette. Changes apply immediately across the entire application."
        sx={{
          backgroundColor: "background.paper",
          borderBottom: "1px solid",
          borderColor: "divider",
        }}
      />
      <CardContent sx={{ p: 3 }}>
        <Alert severity="info" sx={{ mb: 3 }}>
          Your theme preference is saved and will persist across sessions. Admin
          can manage themes for all users.
        </Alert>

        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
          Choose Theme
        </Typography>

        <Box sx={{ mb: 3 }}>
          <ButtonGroup
            variant="outlined"
            sx={{
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              gap: 1,
              "& .MuiButtonGroup-grouped": {
                flex: 1,
                minHeight: "120px",
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                justifyContent: "flex-start",
                p: 2,
              },
            }}
          >
            {themeOptions.map((theme) => (
              <Button
                key={theme.id}
                onClick={() => handleThemeChange(theme.id)}
                variant={themeName === theme.id ? "contained" : "outlined"}
                sx={{
                  flex: 1,
                  minHeight: "120px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-start",
                  justifyContent: "flex-start",
                  p: 2,
                  textAlign: "left",
                  backgroundColor:
                    themeName === theme.id ? "primary.main" : "transparent",
                  color: themeName === theme.id ? "white" : "text.primary",
                  borderColor:
                    themeName === theme.id ? "primary.main" : "divider",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    backgroundColor:
                      themeName === theme.id ? "primary.dark" : "action.hover",
                    borderColor: "primary.main",
                  },
                }}
              >
                <Typography
                  variant="subtitle1"
                  sx={{
                    fontWeight: 700,
                    mb: 1,
                    color: themeName === theme.id ? "white" : "text.primary",
                  }}
                >
                  {theme.label}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    color:
                      themeName === theme.id
                        ? "rgba(255,255,255,0.8)"
                        : "text.secondary",
                  }}
                >
                  {theme.description}
                </Typography>
                {themeName === theme.id && (
                  <Typography
                    variant="caption"
                    sx={{
                      mt: "auto",
                      fontWeight: 600,
                      color: "white",
                    }}
                  >
                    ✓ Active
                  </Typography>
                )}
              </Button>
            ))}
          </ButtonGroup>
        </Box>

        <Divider sx={{ my: 3 }} />

        <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
          Theme Details
        </Typography>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "repeat(2, 1fr)" },
            gap: 2,
            p: 2,
            backgroundColor: "action.hover",
            borderRadius: 1,
          }}
        >
          {themeName === "default" ? (
            <>
              <Box>
                <Typography variant="caption" sx={{ fontWeight: 600 }}>
                  Light Mode
                </Typography>
                <Typography variant="body2" sx={{ color: "text.secondary" }}>
                  • White background
                  <br />• Blue primary color
                  <br />• Clean, minimal design
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" sx={{ fontWeight: 600 }}>
                  Dark Mode
                </Typography>
                <Typography variant="body2" sx={{ color: "text.secondary" }}>
                  • Pure black background
                  <br />• Blue primary color
                  <br />• High contrast text
                </Typography>
              </Box>
            </>
          ) : (
            <>
              <Box>
                <Typography variant="caption" sx={{ fontWeight: 600 }}>
                  Light Mode
                </Typography>
                <Typography variant="body2" sx={{ color: "text.secondary" }}>
                  • White wind pattern
                  <br />• Royal blue & blood red
                  <br />• Dynamic geometric design
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" sx={{ fontWeight: 600 }}>
                  Dark Mode
                </Typography>
                <Typography variant="body2" sx={{ color: "text.secondary" }}>
                  • Galaxy starry background
                  <br />• Fire red & light green
                  <br />• Cosmic theme
                </Typography>
              </Box>
            </>
          )}
        </Box>

        <Box
          sx={{ mt: 3, pt: 2, borderTop: "1px solid", borderColor: "divider" }}
        >
          <Typography variant="caption" sx={{ color: "text.secondary" }}>
            Selected Theme: <strong>{themeName.toUpperCase()}</strong>
          </Typography>
          <Typography
            variant="caption"
            sx={{ display: "block", mt: 1, color: "text.secondary" }}
          >
            Current Mode: <strong>{mode.toUpperCase()}</strong>
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
}
