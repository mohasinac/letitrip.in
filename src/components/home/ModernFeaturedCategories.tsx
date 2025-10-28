"use client";
import React from "react";
import { ArrowForward, TrendingUp } from "@mui/icons-material";
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  CardMedia,
  Button,
  Chip,
  useTheme,
} from "@mui/material";

const categories = [
  {
    name: "Beyblade Burst",
    description: "Latest generation with burst mechanics",
    count: "150+ Products",
    image: "/api/placeholder/400/300",
    color: "#4f46e5", // primary.main
    trending: true,
  },
  {
    name: "Metal Series",
    description: "Classic metal performance system",
    count: "200+ Products",
    image: "/api/placeholder/400/300",
    color: "#22c55e", // success.main
    trending: false,
  },
  {
    name: "Plastic Gen",
    description: "Original generation plastic series",
    count: "100+ Products",
    image: "/api/placeholder/400/300",
    color: "#f59e0b", // warning.main
    trending: false,
  },
  {
    name: "Beyblade X",
    description: "Next evolution of Beyblade",
    count: "80+ Products",
    image: "/api/placeholder/400/300",
    color: "#f59e0b", // warning.main (dark variant)
    trending: true,
  },
  {
    name: "Accessories",
    description: "Stadiums, launchers & more",
    count: "75+ Products",
    image: "/api/placeholder/400/300",
    color: "#ef4444", // error.main
    trending: false,
  },
  {
    name: "Sticker Sheets",
    description: "Custom designs & rare collections",
    count: "50+ Products",
    image: "/api/placeholder/400/300",
    color: "#ec4899", // secondary.main
    trending: false,
  },
];

export default function ModernFeaturedCategories() {
  const theme = useTheme();

  return (
    <Box
      component="section"
      sx={{
        py: { xs: 6, md: 10 },
        backgroundColor: "background.default",
      }}
    >
      <Container maxWidth="lg">
        {/* Section Header */}
        <Box sx={{ textAlign: "center", mb: 6 }}>
          <Typography
            variant="h2"
            component="h2"
            sx={{
              fontWeight: 700,
              mb: 2,
              background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.light} 100%)`,
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              fontSize: { xs: "2rem", md: "3rem" },
            }}
          >
            Featured Categories
          </Typography>
          <Typography
            variant="h6"
            sx={{
              color: "text.secondary",
              maxWidth: "600px",
              mx: "auto",
              lineHeight: 1.6,
            }}
          >
            Explore our curated collection of Beyblades across all generations
          </Typography>
        </Box>

        {/* Categories Grid */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, 1fr)",
              lg: "repeat(3, 1fr)",
            },
            gap: 4,
          }}
        >
          {categories.map((category, index) => (
            <Card
              key={index}
              sx={{
                height: "100%",
                backgroundColor: "background.paper",
                borderRadius: 3,
                overflow: "hidden",
                transition: "all 0.3s ease",
                border: "1px solid",
                borderColor: "divider",
                "&:hover": {
                  transform: "translateY(-8px)",
                  boxShadow: `0 12px 40px ${category.color}20`,
                  borderColor: category.color,
                },
                cursor: "pointer",
                position: "relative",
              }}
            >
              {/* Trending Badge */}
              {category.trending && (
                <Chip
                  icon={<TrendingUp />}
                  label="Trending"
                  size="small"
                  sx={{
                    position: "absolute",
                    top: 16,
                    right: 16,
                    zIndex: 2,
                    backgroundColor: "warning.main",
                    color: "common.white",
                    fontWeight: 600,
                    "&:hover": {
                      backgroundColor: "warning.dark",
                    },
                  }}
                />
              )}

              {/* Image */}
              <CardMedia
                component="div"
                sx={{
                  height: 200,
                  background: `linear-gradient(135deg, ${category.color}15 0%, ${category.color}05 100%)`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  position: "relative",
                  "&::before": {
                    content: '""',
                    position: "absolute",
                    inset: 0,
                    background: `radial-gradient(circle at center, ${category.color}20 0%, transparent 70%)`,
                  },
                }}
              >
                <Typography
                  variant="h1"
                  sx={{
                    fontSize: "4rem",
                    color: category.color,
                    opacity: 0.8,
                    zIndex: 1,
                  }}
                >
                  ⚡
                </Typography>
              </CardMedia>

              {/* Content */}
              <CardContent sx={{ p: 3 }}>
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 600,
                    mb: 1,
                    color: "text.primary",
                  }}
                >
                  {category.name}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    mb: 2,
                    lineHeight: 1.6,
                    color: "text.secondary",
                  }}
                >
                  {category.description}
                </Typography>

                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    mt: 3,
                  }}
                >
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: 600,
                      color: category.color,
                    }}
                  >
                    {category.count}
                  </Typography>

                  <Button
                    endIcon={<ArrowForward />}
                    sx={{
                      color: category.color,
                      fontWeight: 600,
                      textTransform: "none",
                      "&:hover": {
                        backgroundColor: `${category.color}10`,
                      },
                    }}
                  >
                    Explore
                  </Button>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>

        {/* View All Button */}
        <Box sx={{ textAlign: "center", mt: 6 }}>
          <Button
            variant="contained"
            size="large"
            endIcon={<ArrowForward />}
            sx={{
              backgroundColor: "primary.main",
              color: "white",
              fontWeight: 600,
              px: 4,
              py: 1.5,
              borderRadius: 3,
              textTransform: "none",
              fontSize: "1.1rem",
              "&:hover": {
                backgroundColor: "primary.dark",
                transform: "translateY(-2px)",
                boxShadow: "0 8px 25px rgba(0, 149, 246, 0.3)",
              },
              transition: "all 0.3s ease",
            }}
          >
            View All Categories
          </Button>
        </Box>
      </Container>
    </Box>
  );
}
