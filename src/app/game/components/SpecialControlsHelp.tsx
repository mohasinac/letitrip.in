"use client";

import React from "react";
import { Box, Typography, Card, CardContent, Chip } from "@mui/material";
import {
  SwapHoriz as DodgeIcon,
  FlashOn as AttackIcon,
  Bolt as UltimateIcon,
} from "@mui/icons-material";

interface SpecialControlsHelpProps {
  className?: string;
}

const SpecialControlsHelp: React.FC<SpecialControlsHelpProps> = ({
  className,
}) => {
  return (
    <Card
      className={className}
      sx={{
        borderRadius: 3,
        backgroundColor: "rgba(0, 0, 0, 0.7)",
        backdropFilter: "blur(10px)",
        border: "2px solid rgba(255, 255, 255, 0.1)",
      }}
    >
      <CardContent sx={{ p: { xs: 2, md: 3 } }}>
        <Typography
          variant="h6"
          fontWeight={700}
          gutterBottom
          sx={{
            fontSize: { xs: "1rem", md: "1.25rem" },
            color: "primary.main",
            mb: 2,
          }}
        >
          🎮 Special Abilities
        </Typography>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)" },
            gap: 2,
          }}
        >
          {/* Dodge Right */}
          <Box
            sx={{
              p: 1.5,
              borderRadius: 2,
              backgroundColor: "rgba(34, 197, 94, 0.1)",
              border: "1px solid rgba(34, 197, 94, 0.3)",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
              <DodgeIcon sx={{ color: "#22C55E", fontSize: 20 }} />
              <Typography
                variant="subtitle2"
                fontWeight={600}
                sx={{ color: "#22C55E" }}
              >
                Dodge Right
              </Typography>
            </Box>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, mb: 0.5 }}>
              <Chip
                label="1"
                size="small"
                sx={{
                  backgroundColor: "rgba(34, 197, 94, 0.2)",
                  color: "#22C55E",
                  fontWeight: 600,
                }}
              />
              <Chip
                label="Right Click"
                size="small"
                sx={{
                  backgroundColor: "rgba(34, 197, 94, 0.2)",
                  color: "#22C55E",
                  fontSize: "0.7rem",
                }}
              />
            </Box>
            <Typography
              variant="caption"
              sx={{ color: "rgba(255, 255, 255, 0.7)" }}
            >
              Quick dash right • Cost: 20 spin
            </Typography>
          </Box>

          {/* Dodge Left */}
          <Box
            sx={{
              p: 1.5,
              borderRadius: 2,
              backgroundColor: "rgba(34, 197, 94, 0.1)",
              border: "1px solid rgba(34, 197, 94, 0.3)",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
              <DodgeIcon
                sx={{ color: "#22C55E", fontSize: 20, transform: "scaleX(-1)" }}
              />
              <Typography
                variant="subtitle2"
                fontWeight={600}
                sx={{ color: "#22C55E" }}
              >
                Dodge Left
              </Typography>
            </Box>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, mb: 0.5 }}>
              <Chip
                label="3"
                size="small"
                sx={{
                  backgroundColor: "rgba(34, 197, 94, 0.2)",
                  color: "#22C55E",
                  fontWeight: 600,
                }}
              />
              <Chip
                label="Middle Click"
                size="small"
                sx={{
                  backgroundColor: "rgba(34, 197, 94, 0.2)",
                  color: "#22C55E",
                  fontSize: "0.7rem",
                }}
              />
            </Box>
            <Typography
              variant="caption"
              sx={{ color: "rgba(255, 255, 255, 0.7)" }}
            >
              Quick dash left • Cost: 20 spin
            </Typography>
          </Box>

          {/* Heavy Attack */}
          <Box
            sx={{
              p: 1.5,
              borderRadius: 2,
              backgroundColor: "rgba(251, 146, 60, 0.1)",
              border: "1px solid rgba(251, 146, 60, 0.3)",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
              <AttackIcon sx={{ color: "#FB923C", fontSize: 20 }} />
              <Typography
                variant="subtitle2"
                fontWeight={600}
                sx={{ color: "#FB923C" }}
              >
                Heavy Attack
              </Typography>
            </Box>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, mb: 0.5 }}>
              <Chip
                label="2"
                size="small"
                sx={{
                  backgroundColor: "rgba(251, 146, 60, 0.2)",
                  color: "#FB923C",
                  fontWeight: 600,
                }}
              />
              <Chip
                label="Left Click"
                size="small"
                sx={{
                  backgroundColor: "rgba(251, 146, 60, 0.2)",
                  color: "#FB923C",
                  fontSize: "0.7rem",
                }}
              />
            </Box>
            <Typography
              variant="caption"
              sx={{ color: "rgba(255, 255, 255, 0.7)" }}
            >
              1.25× damage for 0.3s • Free
            </Typography>
          </Box>

          {/* Ultimate Attack */}
          <Box
            sx={{
              p: 1.5,
              borderRadius: 2,
              backgroundColor: "rgba(239, 68, 68, 0.1)",
              border: "1px solid rgba(239, 68, 68, 0.3)",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
              <UltimateIcon sx={{ color: "#EF4444", fontSize: 20 }} />
              <Typography
                variant="subtitle2"
                fontWeight={600}
                sx={{ color: "#EF4444" }}
              >
                Ultimate Attack
              </Typography>
            </Box>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, mb: 0.5 }}>
              <Chip
                label="4"
                size="small"
                sx={{
                  backgroundColor: "rgba(239, 68, 68, 0.2)",
                  color: "#EF4444",
                  fontWeight: 600,
                }}
              />
              <Chip
                label="Double Click"
                size="small"
                sx={{
                  backgroundColor: "rgba(239, 68, 68, 0.2)",
                  color: "#EF4444",
                  fontSize: "0.7rem",
                }}
              />
            </Box>
            <Typography
              variant="caption"
              sx={{ color: "rgba(255, 255, 255, 0.7)" }}
            >
              2× damage for 0.5s • Cost: 100 spin
            </Typography>
          </Box>
        </Box>

        {/* Charge Point Selection */}
        <Box
          sx={{
            mt: 2,
            p: 1.5,
            borderRadius: 2,
            backgroundColor: "rgba(59, 130, 246, 0.1)",
            border: "1px solid rgba(59, 130, 246, 0.3)",
          }}
        >
          <Typography
            variant="subtitle2"
            fontWeight={600}
            sx={{ color: "#3B82F6", mb: 1 }}
          >
            🔵 Blue Loop Charge Points
          </Typography>
          <Typography
            variant="caption"
            sx={{ color: "rgba(255, 255, 255, 0.7)", display: "block", mb: 1 }}
          >
            When in blue loop, press 1, 2, or 3 within 1 second to select your
            charge point:
          </Typography>
          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
            <Chip
              label="1 = Point 1 (30°)"
              size="small"
              sx={{
                backgroundColor: "rgba(59, 130, 246, 0.2)",
                color: "#3B82F6",
                fontSize: "0.7rem",
              }}
            />
            <Chip
              label="2 = Point 2 (150°)"
              size="small"
              sx={{
                backgroundColor: "rgba(59, 130, 246, 0.2)",
                color: "#3B82F6",
                fontSize: "0.7rem",
              }}
            />
            <Chip
              label="3 = Point 3 (270°)"
              size="small"
              sx={{
                backgroundColor: "rgba(59, 130, 246, 0.2)",
                color: "#3B82F6",
                fontSize: "0.7rem",
              }}
            />
            <Chip
              label="Random if not selected"
              size="small"
              sx={{
                backgroundColor: "rgba(156, 163, 175, 0.2)",
                color: "#9CA3AF",
                fontSize: "0.7rem",
              }}
            />
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default SpecialControlsHelp;
