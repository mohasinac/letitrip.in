"use client";

import React from "react";
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  CardMedia,
  Chip,
  useTheme,
} from "@mui/material";
import { TrendingUp, LocalShipping, Verified, Star } from "@mui/icons-material";

export default function ModernHeroBanner() {
  const theme = useTheme();

  return (
    <Box
      sx={{
        background:
          theme.palette.mode === "dark"
            ? `linear-gradient(135deg, ${theme.palette.background.default} 0%, ${theme.palette.background.paper} 50%, ${theme.palette.background.default} 100%)`
            : `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.action.hover} 50%, ${theme.palette.background.paper} 100%)`,
        py: { xs: 8, md: 12 },
        position: "relative",
        overflow: "hidden",
        minHeight: "70vh",
      }}
    >
      {/* Background Pattern */}
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage:
            theme.palette.mode === "dark"
              ? `radial-gradient(circle at 50% 50%, rgba(79, 70, 229, 0.08) 1px, transparent 1px)`
              : `radial-gradient(circle at 50% 50%, rgba(79, 70, 229, 0.06) 1px, transparent 1px)`,
          backgroundSize: "50px 50px",
        }}
      />

      <Container maxWidth="xl" sx={{ position: "relative", zIndex: 1 }}>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
            gap: 4,
            alignItems: "center",
          }}
        >
          {/* Left Content */}
          <Box sx={{ maxWidth: 600 }}>
            <Chip
              label="✨ Premium Quality Guaranteed"
              size="small"
              sx={{
                mb: 3,
                backgroundColor: "primary.main",
                color: "white",
                fontWeight: 600,
              }}
            />

            <Typography
              variant="h1"
              sx={{
                fontWeight: 700,
                mb: 3,
                background:
                  theme.palette.mode === "dark"
                    ? `linear-gradient(135deg, #ffffff 0%, ${theme.palette.primary.main} 100%)`
                    : `linear-gradient(135deg, ${theme.palette.text.primary} 0%, ${theme.palette.primary.main} 100%)`,
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                lineHeight: 1.1,
                textShadow:
                  theme.palette.mode === "dark"
                    ? "0 0 20px rgba(0, 149, 246, 0.3)"
                    : "none",
              }}
            >
              Authentic Beyblades
              <br />
              <span style={{ fontSize: "0.8em" }}>for True Bladers</span>
            </Typography>

            <Typography
              variant="h6"
              sx={{
                mb: 4,
                lineHeight: 1.6,
                color:
                  theme.palette.mode === "dark"
                    ? `linear-gradient(135deg, #ffffff 0%, ${theme.palette.primary.main} 100%)`
                    : `linear-gradient(135deg, ${theme.palette.text.primary} 0%, ${theme.palette.primary.main} 100%)`,
                opacity: 0.9,
              }}
            >
              Discover rare, authentic Beyblades from all generations. From
              classic Plastic Gen to the latest Beyblade X series - we have them
              all.
            </Typography>

            <Box sx={{ display: "flex", gap: 2, mb: 4, flexWrap: "wrap" }}>
              <Button
                variant="contained"
                size="large"
                sx={{
                  backgroundColor: "primary.main",
                  color: "white",
                  px: 4,
                  py: 1.5,
                  fontSize: "1.1rem",
                  fontWeight: 600,
                  "&:hover": {
                    backgroundColor: "primary.dark",
                  },
                }}
              >
                Shop Now
              </Button>
              <Button
                variant="outlined"
                size="large"
                sx={{
                  px: 4,
                  py: 1.5,
                  fontSize: "1.1rem",
                  fontWeight: 600,
                }}
              >
                View Collections
              </Button>
            </Box>

            {/* Features */}
            <Box sx={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
              {[
                { icon: <Verified />, text: "100% Authentic" },
                { icon: <LocalShipping />, text: "Fast Shipping" },
                { icon: <Star />, text: "5-Star Rated" },
              ].map((feature, index) => (
                <Box
                  key={index}
                  sx={{ display: "flex", alignItems: "center", gap: 1 }}
                >
                  <Box sx={{ color: "primary.main" }}>{feature.icon}</Box>
                  <Typography variant="body2" fontWeight={500}>
                    {feature.text}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>

          {/* Right Content - Featured Products */}
          <Box sx={{ position: "relative" }}>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "repeat(2, 1fr)",
                gap: 2,
              }}
            >
              {/* Featured product cards */}
              {[
                {
                  name: "Dragoon GT",
                  price: "₹2,499",
                  image: "/api/placeholder/300/300",
                  badge: "Popular",
                },
                {
                  name: "Valkyrie X",
                  price: "₹1,899",
                  image: "/api/placeholder/300/300",
                  badge: "New",
                },
                {
                  name: "Spriggan Burst",
                  price: "₹1,699",
                  image: "/api/placeholder/300/300",
                  badge: "Sale",
                },
              ].map((product, index) => (
                <Card
                  key={index}
                  sx={{
                    borderRadius: 3,
                    overflow: "hidden",
                    transition: "transform 0.3s ease",
                    "&:hover": {
                      transform: "translateY(-8px)",
                    },
                    position: "relative",
                  }}
                >
                  <Box sx={{ position: "relative" }}>
                    <CardMedia
                      component="div"
                      sx={{
                        height: 160,
                        backgroundColor: "background.paper",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Typography color="text.secondary">
                        {product.name}
                      </Typography>
                    </CardMedia>
                    <Chip
                      label={product.badge}
                      size="small"
                      sx={{
                        position: "absolute",
                        top: 8,
                        right: 8,
                        backgroundColor:
                          product.badge === "Sale"
                            ? "error.main"
                            : product.badge === "New"
                            ? "success.main"
                            : "warning.main",
                        color: "white",
                        fontWeight: 600,
                      }}
                    />
                  </Box>
                  <CardContent sx={{ p: 2 }}>
                    <Typography variant="h6" fontWeight={600} gutterBottom>
                      {product.name}
                    </Typography>
                    <Typography
                      variant="h6"
                      color="primary.main"
                      fontWeight={700}
                    >
                      {product.price}
                    </Typography>
                  </CardContent>
                </Card>
              ))}
            </Box>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
