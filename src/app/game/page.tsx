"use client";

import React from "react";
import Link from "next/link";
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  useTheme,
} from "@mui/material";

export default function GamePage() {
  const theme = useTheme();

  return (
    <Box>
      {/* Hero Section */}
      <Box
        sx={{
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
          py: { xs: 8, md: 12 },
          color: "white",
        }}
      >
        <Container maxWidth="xl">
          <Box sx={{ textAlign: "center" }}>
            <Typography
              variant="h1"
              sx={{ fontWeight: 700, mb: 3, color: "white" }}
            >
              🌪️ Game Hub
            </Typography>
            <Typography
              variant="h6"
              sx={{ maxWidth: 800, mx: "auto", color: "white", opacity: 0.9 }}
            >
              Welcome to the ultimate gaming experience! Choose your adventure
              and dive into exciting gameplay.
            </Typography>
          </Box>
        </Container>
      </Box>

      {/* Game Selection */}
      <Box sx={{ py: 8, backgroundColor: "background.default" }}>
        <Container maxWidth="lg">
          <Card
            component={Link}
            href="/game/beyblade-battle"
            sx={{
              textAlign: "center",
              borderRadius: 3,
              backgroundColor: "#1a1a1a",
              border: `4px solid ${theme.palette.primary.main}`,
              textDecoration: "none",
              cursor: "pointer",
              transition: "all 0.3s ease",
              "&:hover": {
                transform: "scale(1.02)",
                boxShadow: `0 10px 30px rgba(0, 0, 0, 0.3), 0 0 20px ${theme.palette.primary.main}40`,
              },
            }}
          >
            <CardContent sx={{ p: 6 }}>
              <Typography variant="h1" sx={{ fontSize: "6rem", mb: 4 }}>
                ⚡
              </Typography>
              <Typography
                variant="h3"
                sx={{
                  color: theme.palette.primary.main,
                  fontWeight: 700,
                }}
                gutterBottom
              >
                Beyblade Battle Arena
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  mb: 4,
                  lineHeight: 1.7,
                  color:
                    theme.palette.mode === "dark"
                      ? `linear-gradient(135deg, #ffffff 0%, ${theme.palette.primary.main} 100%)`
                      : `linear-gradient(135deg, ${theme.palette.text.primary} 0%, ${theme.palette.primary.main} 100%)`,
                  opacity: 0.9,
                }}
              >
                Real-time Beyblade battles with advanced physics, collision
                mechanics, and strategic gameplay. Battle against AI with charge
                points, speed zones, and mobile controls!
              </Typography>

              {/* Feature highlights */}
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: {
                    xs: "repeat(2, 1fr)",
                    md: "repeat(4, 1fr)",
                  },
                  gap: 2,
                  mb: 4,
                }}
              >
                {[
                  { icon: "🎮", text: "Real-time Control" },
                  { icon: "🌀", text: "Physics Engine" },
                  { icon: "📱", text: "Mobile Friendly" },
                  { icon: "🤖", text: "Smart AI" },
                ].map((feature, index) => (
                  <Card
                    key={index}
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      backgroundColor: "#0f0f0f",
                      border: `2px solid ${theme.palette.primary.main}40`,
                    }}
                  >
                    <Typography variant="h4" sx={{ mb: 1 }}>
                      {feature.icon}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{ fontWeight: 600, color: "#ffffff" }}
                    >
                      {feature.text}
                    </Typography>
                  </Card>
                ))}
              </Box>

              <Button
                variant="contained"
                size="large"
                sx={{
                  px: 4,
                  py: 1.5,
                  fontSize: "1.1rem",
                  fontWeight: 600,
                  borderRadius: 2,
                  boxShadow: theme.shadows[8],
                  "&:hover": {
                    boxShadow: theme.shadows[12],
                  },
                }}
              >
                Play Now →
              </Button>
            </CardContent>
          </Card>

          {/* Coming Soon Games */}
          <Box sx={{ mt: 8, textAlign: "center" }}>
            <Typography
              variant="h4"
              fontWeight={600}
              gutterBottom
              sx={{
                color:
                  theme.palette.mode === "dark"
                    ? `linear-gradient(135deg, #ffffff 0%, ${theme.palette.primary.main} 100%)`
                    : `linear-gradient(135deg, ${theme.palette.text.primary} 0%, ${theme.palette.primary.main} 100%)`,
              }}
            >
              🚀 More Games Coming Soon
            </Typography>
            <Typography variant="body1" sx={{ mb: 4, color: "#cccccc" }}>
              More exciting games are in development!
            </Typography>

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" },
                gap: 4,
              }}
            >
              {[
                {
                  icon: "🏁",
                  title: "Racing Challenge",
                  desc: "High-speed racing action",
                },
                {
                  icon: "🎯",
                  title: "Precision Strike",
                  desc: "Test your accuracy skills",
                },
                {
                  icon: "🧩",
                  title: "Puzzle Master",
                  desc: "Brain-bending challenges",
                },
              ].map((game, index) => (
                <Card
                  key={index}
                  sx={{
                    borderRadius: 3,
                    opacity: 0.7,
                    backgroundColor: "#1a1a1a",
                    border: `2px dashed ${theme.palette.primary.main}40`,
                    textAlign: "center",
                  }}
                >
                  <CardContent sx={{ p: 4 }}>
                    <Typography variant="h2" sx={{ fontSize: "3rem", mb: 2 }}>
                      {game.icon}
                    </Typography>
                    <Typography
                      variant="h6"
                      fontWeight={600}
                      gutterBottom
                      sx={{ color: "#ffffff" }}
                    >
                      {game.title}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ mb: 2, color: "#cccccc" }}
                    >
                      {game.desc}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        color: theme.palette.primary.main,
                        fontWeight: 600,
                      }}
                    >
                      Coming Soon...
                    </Typography>
                  </CardContent>
                </Card>
              ))}
            </Box>
          </Box>
        </Container>
      </Box>
    </Box>
  );
}
