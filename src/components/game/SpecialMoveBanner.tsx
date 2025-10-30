/**
 * Special Move Banner Component
 * Displays "LET IT RIP!" style cinematic banner when special moves activate
 */

import React, { useEffect, useState } from "react";
import { Box, Typography, Fade, Zoom } from "@mui/material";
import { keyframes } from "@mui/system";

interface SpecialMoveBannerProps {
  moveName: string;
  userName: string;
  show: boolean;
  onComplete?: () => void;
  color?: string;
  duration?: number;
}

// Slide in from bottom animation
const slideInFromBottom = keyframes`
  0% {
    transform: translateY(100%) scale(0.8);
    opacity: 0;
  }
  50% {
    transform: translateY(0) scale(1.1);
    opacity: 1;
  }
  70% {
    transform: translateY(0) scale(1);
    opacity: 1;
  }
  100% {
    transform: translateY(0) scale(1);
    opacity: 1;
  }
`;

// Pulse animation
const pulse = keyframes`
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
`;

// Glow animation
const glow = keyframes`
  0%, 100% {
    box-shadow: 0 0 20px currentColor, 0 0 40px currentColor;
  }
  50% {
    box-shadow: 0 0 40px currentColor, 0 0 80px currentColor;
  }
`;

export default function SpecialMoveBanner({
  moveName,
  userName,
  show,
  onComplete,
  color = "#ff4444",
  duration = 2000,
}: SpecialMoveBannerProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (show) {
      setVisible(true);

      // Auto-hide after duration
      const timer = setTimeout(() => {
        setVisible(false);
        if (onComplete) {
          onComplete();
        }
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [show, duration, onComplete]);

  if (!show && !visible) return null;

  return (
    <Fade in={visible} timeout={300}>
      <Box
        sx={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 9999,
          pointerEvents: "none",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "flex-end",
          pb: 8,
          animation: `${slideInFromBottom} 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55)`,
        }}
      >
        {/* Background Overlay */}
        <Box
          sx={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: "300px",
            background: `linear-gradient(to top, rgba(0,0,0,0.9) 0%, transparent 100%)`,
            zIndex: -1,
          }}
        />

        {/* Main Banner Container */}
        <Box
          sx={{
            position: "relative",
            width: "90%",
            maxWidth: "800px",
            textAlign: "center",
          }}
        >
          {/* User Name Label */}
          <Typography
            variant="h6"
            sx={{
              color: "white",
              fontWeight: "bold",
              textTransform: "uppercase",
              letterSpacing: 4,
              mb: 1,
              textShadow: `0 0 10px ${color}, 0 0 20px ${color}`,
              animation: `${pulse} 1s ease-in-out infinite`,
            }}
          >
            {userName}
          </Typography>

          {/* Special Move Name */}
          <Box
            sx={{
              position: "relative",
              background: `linear-gradient(135deg, ${color}22 0%, ${color}44 100%)`,
              border: `4px solid ${color}`,
              borderRadius: 3,
              p: 3,
              animation: `${glow} 1.5s ease-in-out infinite`,
              backdropFilter: "blur(10px)",
            }}
          >
            {/* Decorative Corner Elements */}
            {[
              { top: -2, left: -2 },
              { top: -2, right: -2 },
              { bottom: -2, left: -2 },
              { bottom: -2, right: -2 },
            ].map((pos, idx) => (
              <Box
                key={idx}
                sx={{
                  position: "absolute",
                  ...pos,
                  width: 20,
                  height: 20,
                  border: `3px solid ${color}`,
                  borderRadius: 1,
                  bgcolor: "rgba(0,0,0,0.8)",
                }}
              />
            ))}

            {/* Move Name Text */}
            <Typography
              variant="h2"
              sx={{
                color: "white",
                fontWeight: 900,
                textTransform: "uppercase",
                letterSpacing: 8,
                fontSize: { xs: "2rem", sm: "3rem", md: "4rem" },
                textShadow: `
                  0 0 10px ${color},
                  0 0 20px ${color},
                  0 0 30px ${color},
                  4px 4px 8px rgba(0,0,0,0.8)
                `,
                WebkitTextStroke: `2px ${color}`,
                paintOrder: "stroke fill",
                position: "relative",
                zIndex: 1,
                background: `linear-gradient(180deg, white 0%, ${color} 100%)`,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              {moveName}
            </Typography>

            {/* Subtitle */}
            <Typography
              variant="h6"
              sx={{
                color: color,
                fontWeight: "bold",
                textTransform: "uppercase",
                letterSpacing: 3,
                mt: 1,
                textShadow: `0 0 10px ${color}`,
              }}
            >
              SPECIAL MOVE ACTIVATED!
            </Typography>
          </Box>

          {/* Energy Bars Animation */}
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: 0,
              right: 0,
              display: "flex",
              justifyContent: "space-between",
              px: -4,
              pointerEvents: "none",
            }}
          >
            {[...Array(2)].map((_, idx) => (
              <Box
                key={idx}
                sx={{
                  width: "40%",
                  height: 4,
                  background: `linear-gradient(${
                    idx === 0 ? "to right" : "to left"
                  }, transparent 0%, ${color} 50%, transparent 100%)`,
                  animation: `${pulse} 0.8s ease-in-out infinite`,
                  animationDelay: `${idx * 0.2}s`,
                }}
              />
            ))}
          </Box>
        </Box>

        {/* Particle Effects Container */}
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            overflow: "hidden",
            pointerEvents: "none",
          }}
        >
          {/* Animated Particles */}
          {[...Array(20)].map((_, idx) => (
            <Box
              key={idx}
              sx={{
                position: "absolute",
                bottom: `${Math.random() * 30}%`,
                left: `${Math.random() * 100}%`,
                width: 4,
                height: 4,
                borderRadius: "50%",
                bgcolor: color,
                opacity: 0.6,
                animation: `${pulse} ${
                  0.5 + Math.random() * 1
                }s ease-in-out infinite`,
                animationDelay: `${Math.random() * 0.5}s`,
                boxShadow: `0 0 10px ${color}`,
              }}
            />
          ))}
        </Box>
      </Box>
    </Fade>
  );
}

/**
 * Compact Banner Variant (for rapid-fire special moves)
 */
export function CompactSpecialMoveBanner({
  moveName,
  show,
  onComplete,
  color = "#ff4444",
  duration = 1000,
}: Omit<SpecialMoveBannerProps, "userName">) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (show) {
      setVisible(true);

      const timer = setTimeout(() => {
        setVisible(false);
        if (onComplete) {
          onComplete();
        }
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [show, duration, onComplete]);

  if (!show && !visible) return null;

  return (
    <Zoom in={visible}>
      <Box
        sx={{
          position: "fixed",
          bottom: 100,
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 9999,
          pointerEvents: "none",
        }}
      >
        <Box
          sx={{
            background: `linear-gradient(135deg, ${color}44 0%, ${color}88 100%)`,
            border: `2px solid ${color}`,
            borderRadius: 2,
            px: 4,
            py: 1.5,
            backdropFilter: "blur(10px)",
            boxShadow: `0 0 20px ${color}`,
          }}
        >
          <Typography
            variant="h5"
            sx={{
              color: "white",
              fontWeight: "bold",
              textTransform: "uppercase",
              letterSpacing: 2,
              textShadow: `0 0 10px ${color}`,
            }}
          >
            {moveName}
          </Typography>
        </Box>
      </Box>
    </Zoom>
  );
}
