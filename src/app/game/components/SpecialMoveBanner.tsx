"use client";

import React, { useEffect, useState } from "react";
import { Box, Typography, useTheme } from "@mui/material";
import { CinematicMoveState } from "../utils/cinematicSpecialMoves";

interface SpecialMoveBannerProps {
  cinematicMove: CinematicMoveState | null;
}

export default function SpecialMoveBanner({
  cinematicMove,
}: SpecialMoveBannerProps) {
  const theme = useTheme();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (cinematicMove && cinematicMove.phase === "banner") {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  }, [cinematicMove]);

  if (!isVisible || !cinematicMove) return null;

  return (
    <Box
      sx={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(0, 0, 0, 0.85)",
        animation: "bannerFadeIn 0.3s ease-out",
        "@keyframes bannerFadeIn": {
          from: {
            opacity: 0,
          },
          to: {
            opacity: 1,
          },
        },
      }}
    >
      {/* Let It Rip! Text */}
      <Typography
        variant="h1"
        sx={{
          fontSize: { xs: "3rem", sm: "5rem", md: "7rem" },
          fontWeight: 900,
          color: "#ffffff",
          textShadow: `
            0 0 20px ${theme.palette.primary.main},
            0 0 40px ${theme.palette.primary.main},
            0 0 60px ${theme.palette.primary.main},
            0 0 80px ${theme.palette.primary.main},
            0 5px 0 rgba(0,0,0,0.5)
          `,
          mb: 2,
          animation:
            "letItRipPulse 0.8s ease-in-out infinite, letItRipSlideIn 0.5s ease-out",
          textAlign: "center",
          "@keyframes letItRipPulse": {
            "0%, 100%": {
              transform: "scale(1)",
            },
            "50%": {
              transform: "scale(1.05)",
            },
          },
          "@keyframes letItRipSlideIn": {
            from: {
              transform: "translateY(-100px) scale(0.5)",
              opacity: 0,
            },
            to: {
              transform: "translateY(0) scale(1)",
              opacity: 1,
            },
          },
        }}
      >
        LET IT RIP!
      </Typography>

      {/* Special Move Name */}
      <Box
        sx={{
          position: "relative",
          width: "80%",
          maxWidth: "800px",
          padding: "20px 40px",
          background: `linear-gradient(135deg, 
            ${theme.palette.primary.main}20 0%, 
            ${theme.palette.secondary.main}20 100%)`,
          border: `4px solid ${theme.palette.primary.main}`,
          borderRadius: "12px",
          boxShadow: `
            0 0 30px ${theme.palette.primary.main}80,
            inset 0 0 20px ${theme.palette.primary.main}40
          `,
          animation: "moveNameSlideUp 0.6s ease-out 0.3s both",
          "@keyframes moveNameSlideUp": {
            from: {
              transform: "translateY(100px)",
              opacity: 0,
            },
            to: {
              transform: "translateY(0)",
              opacity: 1,
            },
          },
        }}
      >
        <Typography
          variant="h2"
          sx={{
            fontSize: { xs: "1.5rem", sm: "2.5rem", md: "3.5rem" },
            fontWeight: 800,
            color: theme.palette.primary.main,
            textAlign: "center",
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            textShadow: `
              0 0 10px ${theme.palette.primary.main},
              0 0 20px ${theme.palette.primary.main},
              2px 2px 4px rgba(0,0,0,0.8)
            `,
            animation: "moveNameGlow 1s ease-in-out infinite",
            "@keyframes moveNameGlow": {
              "0%, 100%": {
                filter: "brightness(1)",
              },
              "50%": {
                filter: "brightness(1.3)",
              },
            },
          }}
        >
          {cinematicMove.moveName}
        </Typography>

        {/* Move Type Indicator */}
        <Box
          sx={{
            position: "absolute",
            bottom: "-15px",
            left: "50%",
            transform: "translateX(-50%)",
            padding: "5px 20px",
            background: theme.palette.secondary.main,
            color: "#fff",
            borderRadius: "20px",
            fontSize: "0.875rem",
            fontWeight: 700,
            textTransform: "uppercase",
            boxShadow: "0 4px 10px rgba(0,0,0,0.5)",
          }}
        >
          {cinematicMove.moveType.replace(/-/g, " ")}
        </Box>
      </Box>

      {/* Energy Flash Effects */}
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          pointerEvents: "none",
          "& > div": {
            position: "absolute",
            background: `radial-gradient(circle, ${theme.palette.primary.main}40 0%, transparent 70%)`,
            borderRadius: "50%",
            animation: "energyPulse 2s ease-out infinite",
          },
          "& > div:nth-of-type(1)": {
            top: "10%",
            left: "10%",
            width: "200px",
            height: "200px",
            animationDelay: "0s",
          },
          "& > div:nth-of-type(2)": {
            top: "60%",
            right: "15%",
            width: "150px",
            height: "150px",
            animationDelay: "0.5s",
          },
          "& > div:nth-of-type(3)": {
            bottom: "20%",
            left: "20%",
            width: "180px",
            height: "180px",
            animationDelay: "1s",
          },
          "@keyframes energyPulse": {
            "0%": {
              transform: "scale(0)",
              opacity: 0,
            },
            "50%": {
              opacity: 0.6,
            },
            "100%": {
              transform: "scale(2)",
              opacity: 0,
            },
          },
        }}
      >
        <div />
        <div />
        <div />
      </Box>
    </Box>
  );
}
