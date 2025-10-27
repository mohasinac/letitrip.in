"use client";

import { Box, CircularProgress, Typography } from "@mui/material";

export default function Loading() {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "background.default",
      }}
    >
      <Box sx={{ textAlign: "center" }}>
        <CircularProgress
          size={60}
          thickness={4}
          sx={{ mb: 4, color: "primary.main" }}
        />

        <Typography variant="h6" color="text.secondary" sx={{ mb: 4 }}>
          Loading your adventure...
        </Typography>

        {/* Progress dots animation */}
        <Box sx={{ display: "flex", justifyContent: "center", gap: 0.5 }}>
          {[0, 150, 300].map((delay, index) => (
            <Box
              key={index}
              sx={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                backgroundColor:
                  index === 0
                    ? "primary.main"
                    : index === 1
                    ? "secondary.main"
                    : "success.main",
                animation: "bounce 1s infinite",
                animationDelay: `${delay}ms`,
                "@keyframes bounce": {
                  "0%, 80%, 100%": {
                    transform: "scale(0)",
                    opacity: 0.5,
                  },
                  "40%": {
                    transform: "scale(1)",
                    opacity: 1,
                  },
                },
              }}
            />
          ))}
        </Box>
      </Box>
    </Box>
  );
}
