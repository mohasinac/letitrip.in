"use client";
import React from "react";
import { ArrowForward, TrendingUp, Category as CategoryIcon } from "@mui/icons-material";
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
  alpha,
} from "@mui/material";
import NextLink from "next/link";
import type { Category } from "@/types";

interface CategoryWithCount extends Category {
  productCount: number;
  inStockCount?: number;
  outOfStockCount?: number;
}

interface ModernFeaturedCategoriesProps {
  categories: CategoryWithCount[];
}

export default function ModernFeaturedCategories({ categories }: ModernFeaturedCategoriesProps) {
  const theme = useTheme();

  // Filter only featured categories
  const featuredCategories = categories.filter(cat => cat.featured && cat.isActive);

  // If no featured categories, don't render the section
  if (featuredCategories.length === 0) {
    return null;
  }

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
          {featuredCategories.map((category, index) => {
            // Determine category color based on product availability
            const hasProducts = (category.inStockCount || 0) > 0;
            const categoryColor = hasProducts
              ? theme.palette.primary.main
              : theme.palette.grey[400];

            return (
              <Card
                key={category.id}
                sx={{
                  height: "100%",
                  backgroundColor: hasProducts
                    ? "background.paper"
                    : alpha(theme.palette.grey[100], 0.5),
                  borderRadius: 3,
                  overflow: "hidden",
                  transition: "all 0.3s ease",
                  border: "1px solid",
                  borderColor: hasProducts ? "divider" : theme.palette.grey[300],
                  "&:hover": {
                    transform: "translateY(-8px)",
                    boxShadow: `0 12px 40px ${alpha(categoryColor, 0.2)}`,
                    borderColor: categoryColor,
                  },
                  cursor: "pointer",
                  position: "relative",
                  opacity: hasProducts ? 1 : 0.75,
                }}
              >
                {/* Trending Badge */}
                {category.featured && (
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
                    background: category.image
                      ? `url(${category.image})`
                      : `linear-gradient(135deg, ${alpha(
                          categoryColor,
                          0.15
                        )} 0%, ${alpha(categoryColor, 0.05)} 100%)`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    position: "relative",
                    "&::before": {
                      content: '""',
                      position: "absolute",
                      inset: 0,
                      background: `radial-gradient(circle at center, ${alpha(
                        categoryColor,
                        0.2
                      )} 0%, transparent 70%)`,
                    },
                  }}
                >
                  {!category.image && (
                    <CategoryIcon
                      sx={{
                        fontSize: 80,
                        color: categoryColor,
                        opacity: 0.8,
                        zIndex: 1,
                      }}
                    />
                  )}
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
                    {category.description || "Explore this category"}
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
                        color: categoryColor,
                      }}
                    >
                      {category.productCount > 0
                        ? `${category.productCount}+ Products`
                        : "Coming Soon"}
                    </Typography>

                    {hasProducts && (
                      <Button
                        component={NextLink}
                        href={`/products?category=${category.slug}`}
                        endIcon={<ArrowForward />}
                        sx={{
                          color: categoryColor,
                          fontWeight: 600,
                          textTransform: "none",
                          "&:hover": {
                            backgroundColor: alpha(categoryColor, 0.1),
                          },
                        }}
                      >
                        Explore
                      </Button>
                    )}
                  </Box>
                </CardContent>
              </Card>
            );
          })}
        </Box>

        {/* View All Button */}
        <Box sx={{ textAlign: "center", mt: 6 }}>
          <Button
            component={NextLink}
            href="/categories"
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
