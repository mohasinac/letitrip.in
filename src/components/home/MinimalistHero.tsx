"use client";

import { Box, Typography, Button, Container, useTheme } from "@mui/material";
import { ArrowForward, PlayArrow } from "@mui/icons-material";

export default function MinimalistHero() {
  const theme = useTheme();

  return (
    <Box
      sx={{
        minHeight: "90vh",
        display: "flex",
        alignItems: "center",
        background: `linear-gradient(135deg, ${theme.palette.background.default} 0%, ${theme.palette.grey[50]} 100%)`,
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Subtle background pattern */}
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `radial-gradient(circle at 25% 25%, ${theme.palette.primary.main}08 0%, transparent 50%),
                           radial-gradient(circle at 75% 75%, ${theme.palette.secondary.main}05 0%, transparent 50%)`,
          zIndex: 0,
        }}
      />

      <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1 }}>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
            gap: 6,
            alignItems: "center",
          }}
        >
          {/* Left Content */}
          <Box>
            <Typography
              variant="h1"
              sx={{
                fontSize: { xs: "2.5rem", md: "3.5rem", lg: "4rem" },
                fontWeight: 300,
                lineHeight: 1.1,
                mb: 3,
                color: "text.primary",
              }}
            >
              Authentic
              <Box
                component="span"
                sx={{
                  display: "block",
                  fontWeight: 700,
                  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                  backgroundClip: "text",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                Beyblades
              </Box>
              <Typography
                component="span"
                sx={{
                  fontSize: { xs: "1.5rem", md: "2rem" },
                  fontWeight: 300,
                  color: "text.secondary",
                }}
              >
                Marketplace
              </Typography>
            </Typography>

            <Typography
              variant="h6"
              sx={{
                mb: 4,
                color: "text.secondary",
                fontWeight: 400,
                lineHeight: 1.6,
                maxWidth: 500,
              }}
            >
              Discover rare collectibles, participate in live auctions, and join
              a community of passionate collectors.
            </Typography>

            <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
              <Button
                variant="contained"
                size="large"
                endIcon={<ArrowForward />}
                sx={{
                  px: 4,
                  py: 1.5,
                  borderRadius: 50,
                  fontWeight: 600,
                  fontSize: "1.1rem",
                  textTransform: "none",
                  boxShadow: `0 8px 32px ${theme.palette.primary.main}25`,
                  "&:hover": {
                    transform: "translateY(-2px)",
                    boxShadow: `0 12px 40px ${theme.palette.primary.main}35`,
                  },
                }}
              >
                Explore Collection
              </Button>

              <Button
                variant="outlined"
                size="large"
                startIcon={<PlayArrow />}
                sx={{
                  px: 4,
                  py: 1.5,
                  borderRadius: 50,
                  fontWeight: 600,
                  fontSize: "1.1rem",
                  textTransform: "none",
                  borderWidth: 2,
                  "&:hover": {
                    borderWidth: 2,
                    transform: "translateY(-2px)",
                  },
                }}
              >
                Play Game
              </Button>
            </Box>
          </Box>

          {/* Right Content - Minimalist Visual */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: { xs: 300, md: 500 },
              position: "relative",
            }}
          >
            {/* Central Circle */}
            <Box
              sx={{
                width: { xs: 200, md: 300 },
                height: { xs: 200, md: 300 },
                borderRadius: "50%",
                background: `conic-gradient(from 0deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main}, ${theme.palette.primary.main})`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                animation: "spin 20s linear infinite",
                position: "relative",
                "&::before": {
                  content: '""',
                  position: "absolute",
                  top: 4,
                  left: 4,
                  right: 4,
                  bottom: 4,
                  borderRadius: "50%",
                  backgroundColor: "background.default",
                },
              }}
            >
              {/* Inner content */}
              <Box
                sx={{
                  position: "relative",
                  zIndex: 1,
                  textAlign: "center",
                }}
              >
                <Typography
                  variant="h3"
                  sx={{
                    fontSize: { xs: "2rem", md: "3rem" },
                    fontWeight: 100,
                    color: "text.primary",
                    mb: 1,
                  }}
                >
                  ⚡
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: "text.secondary",
                    fontWeight: 500,
                    letterSpacing: 2,
                    textTransform: "uppercase",
                  }}
                >
                  Battle Ready
                </Typography>
              </Box>
            </Box>

            {/* Floating elements */}
            {[...Array(6)].map((_, i) => (
              <Box
                key={i}
                sx={{
                  position: "absolute",
                  width: { xs: 8, md: 12 },
                  height: { xs: 8, md: 12 },
                  borderRadius: "50%",
                  backgroundColor:
                    i % 2 === 0 ? "primary.main" : "secondary.main",
                  opacity: 0.3,
                  animation: `float${i} ${4 + i}s ease-in-out infinite`,
                  transform: `rotate(${i * 60}deg) translateX(${
                    120 + i * 20
                  }px)`,
                  "@keyframes float0": {
                    "0%, 100%": {
                      transform: `rotate(0deg) translateX(120px) scale(1)`,
                    },
                    "50%": {
                      transform: `rotate(0deg) translateX(140px) scale(1.2)`,
                    },
                  },
                  "@keyframes float1": {
                    "0%, 100%": {
                      transform: `rotate(60deg) translateX(140px) scale(0.8)`,
                    },
                    "50%": {
                      transform: `rotate(60deg) translateX(160px) scale(1.1)`,
                    },
                  },
                  "@keyframes float2": {
                    "0%, 100%": {
                      transform: `rotate(120deg) translateX(160px) scale(1.1)`,
                    },
                    "50%": {
                      transform: `rotate(120deg) translateX(180px) scale(0.9)`,
                    },
                  },
                  "@keyframes float3": {
                    "0%, 100%": {
                      transform: `rotate(180deg) translateX(140px) scale(0.9)`,
                    },
                    "50%": {
                      transform: `rotate(180deg) translateX(120px) scale(1.3)`,
                    },
                  },
                  "@keyframes float4": {
                    "0%, 100%": {
                      transform: `rotate(240deg) translateX(160px) scale(1.2)`,
                    },
                    "50%": {
                      transform: `rotate(240deg) translateX(140px) scale(0.8)`,
                    },
                  },
                  "@keyframes float5": {
                    "0%, 100%": {
                      transform: `rotate(300deg) translateX(120px) scale(1)`,
                    },
                    "50%": {
                      transform: `rotate(300deg) translateX(160px) scale(1.1)`,
                    },
                  },
                }}
              />
            ))}
          </Box>
        </Box>
      </Container>

      {/* Global keyframes for spinning animation */}
      <style jsx global>{`
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </Box>
  );
}
