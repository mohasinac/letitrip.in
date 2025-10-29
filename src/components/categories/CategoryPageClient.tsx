"use client";

import React, { useMemo, useState } from "react";
import {
  Container,
  Typography,
  Box,
  Breadcrumbs,
  Link,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Button,
  Chip,
  Stack,
  useTheme,
  alpha,
  TextField,
  InputAdornment,
} from "@mui/material";
import {
  NavigateNext as NavigateNextIcon,
  ShoppingCart as ShoppingCartIcon,
  Folder as FolderIcon,
  Home as HomeIcon,
  Category as CategoryIcon,
  Search as SearchIcon,
} from "@mui/icons-material";
import NextLink from "next/link";
import type { Category } from "@/types";
import {
  useBreadcrumbTracker,
  buildCategoryBreadcrumb,
} from "@/hooks/useBreadcrumbTracker";

interface CategoryWithCounts extends Category {
  directProductCount: number;
  childProductCount: number;
  totalProductCount: number;
  subcategoryCount: number;
}

interface CategoryPageClientProps {
  allCategories: CategoryWithCounts[];
  currentCategory: Category | null;
  slug?: string;
}

export default function CategoryPageClient({
  allCategories,
  currentCategory,
  slug,
}: CategoryPageClientProps) {
  const theme = useTheme();
  const [searchTerm, setSearchTerm] = useState("");

  // Get categories to display
  const displayCategories = useMemo(() => {
    let categories: CategoryWithCounts[];

    if (!currentCategory) {
      // Show root categories (no parents)
      categories = allCategories.filter(
        (cat) => !cat.parentIds || cat.parentIds.length === 0
      );
    } else {
      // Show subcategories of current category
      categories = allCategories.filter((cat) =>
        cat.parentIds?.includes(currentCategory.id)
      );
    }

    // Apply search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      categories = categories.filter(
        (cat) =>
          cat.name.toLowerCase().includes(searchLower) ||
          cat.slug.toLowerCase().includes(searchLower) ||
          cat.description?.toLowerCase().includes(searchLower)
      );
    }

    return categories;
  }, [allCategories, currentCategory, searchTerm]);

  // Build breadcrumb trail
  const breadcrumbItems = useMemo(() => {
    if (!currentCategory) {
      return [
        {
          label: "Categories",
          href: "/categories",
          active: true,
        },
      ];
    }
    return [
      {
        label: "Categories",
        href: "/categories",
      },
      ...buildCategoryBreadcrumb(currentCategory, allCategories),
    ];
  }, [currentCategory, allCategories]);

  // Add breadcrumb tracking
  useBreadcrumbTracker(breadcrumbItems);

  // Get current category data with counts
  const currentCategoryWithCounts = useMemo(() => {
    if (!currentCategory) return null;
    return allCategories.find((cat) => cat.id === currentCategory.id) || null;
  }, [currentCategory, allCategories]);

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 6, md: 8 } }}>
      {/* Breadcrumbs */}
      <Breadcrumbs
        separator={<NavigateNextIcon fontSize="small" />}
        aria-label="breadcrumb"
        sx={{ mb: 3 }}
      >
        {breadcrumbItems.map((crumb, index) => {
          const isLast = index === breadcrumbItems.length - 1;
          const href = crumb.href ? crumb.href : "/categories";

          return isLast ? (
            <Typography key={index} color="text.primary" fontWeight={600}>
              {crumb.label}
            </Typography>
          ) : (
            <Link
              key={index}
              component={NextLink}
              href={href}
              underline="hover"
              color="inherit"
              sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
            >
              {index === 0 && <HomeIcon fontSize="small" />}
              {crumb.label}
            </Link>
          );
        })}
      </Breadcrumbs>

      {/* Page Header */}
      <Box sx={{ mb: 4, textAlign: "center" }}>
        <Typography
          variant="h2"
          component="h1"
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
          {currentCategory ? currentCategory.name : "Shop by Category"}
        </Typography>
        {currentCategory && currentCategory.description && (
          <Typography
            variant="h6"
            sx={{
              color: "text.secondary",
              maxWidth: "800px",
              mx: "auto",
              lineHeight: 1.6,
              mb: 2,
            }}
          >
            {currentCategory.description}
          </Typography>
        )}
        {currentCategory && (
          <Stack
            direction="row"
            spacing={2}
            sx={{ mt: 2, justifyContent: "center" }}
          >
            <Chip
              icon={<ShoppingCartIcon />}
              label={`${
                currentCategoryWithCounts?.totalProductCount || 0
              } Products`}
              color="primary"
              variant="outlined"
              sx={{ fontWeight: 600 }}
            />
            <Chip
              icon={<FolderIcon />}
              label={`${
                currentCategoryWithCounts?.subcategoryCount || 0
              } Subcategories`}
              color="secondary"
              variant="outlined"
              sx={{ fontWeight: 600 }}
            />
          </Stack>
        )}
        {!currentCategory && (
          <Typography
            variant="h6"
            sx={{
              color: "text.secondary",
              maxWidth: "600px",
              mx: "auto",
              lineHeight: 1.6,
            }}
          >
            Explore our curated collection organized by category
          </Typography>
        )}
      </Box>

      {/* Search Bar */}
      <Box sx={{ mb: 3 }}>
        <TextField
          placeholder="Search categories by name, slug, or description..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          fullWidth
          size="medium"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{
            "& .MuiOutlinedInput-root": {
              backgroundColor: "background.paper",
              "&:hover": {
                backgroundColor: "background.paper",
              },
              "&.Mui-focused": {
                backgroundColor: "background.paper",
              },
            },
          }}
        />
        {searchTerm && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mt: 1.5, ml: 1 }}
          >
            {displayCategories.length === 0
              ? "No categories found"
              : `Found ${displayCategories.length} ${
                  displayCategories.length === 1 ? "category" : "categories"
                }`}
          </Typography>
        )}
      </Box>

      {/* Categories Grid */}
      {displayCategories.length === 0 ? (
        <Box
          sx={{
            textAlign: "center",
            py: 8,
            backgroundColor: "background.paper",
            borderRadius: 2,
          }}
        >
          <FolderIcon sx={{ fontSize: 64, color: "text.secondary", mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            {searchTerm
              ? `No categories found matching "${searchTerm}"`
              : `No ${
                  currentCategory ? "subcategories" : "categories"
                } available`}
          </Typography>
          {currentCategory && (
            <Button
              component={NextLink}
              href={`/products?category=${currentCategory.id}`}
              variant="contained"
              startIcon={<ShoppingCartIcon />}
              sx={{ mt: 2 }}
            >
              Browse Products
            </Button>
          )}
        </Box>
      ) : (
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
          {displayCategories.map((category) => (
            <CategoryCard key={category.id} category={category} />
          ))}
        </Box>
      )}
    </Container>
  );
}

// Category Card Component
function CategoryCard({ category }: { category: CategoryWithCounts }) {
  const theme = useTheme();

  // Check if category has in-stock products
  const hasInStockProducts = category.totalProductCount > 0;

  // Generate a color for the category based on stock availability
  const categoryColor = hasInStockProducts
    ? category.featured
      ? theme.palette.primary.main
      : theme.palette.secondary.main
    : theme.palette.grey[400];

  return (
    <Card
      sx={{
        height: "100%",
        backgroundColor: hasInStockProducts
          ? "background.paper"
          : alpha(theme.palette.grey[100], 0.5),
        borderRadius: 3,
        overflow: "hidden",
        transition: "all 0.3s ease",
        border: "1px solid",
        borderColor: hasInStockProducts ? "divider" : theme.palette.grey[300],
        "&:hover": {
          transform: "translateY(-8px)",
          boxShadow: `0 12px 40px ${alpha(categoryColor, 0.2)}`,
          borderColor: categoryColor,
        },
        cursor: "pointer",
        position: "relative",
        display: "flex",
        flexDirection: "column",
        opacity: hasInStockProducts ? 1 : 0.75,
      }}
    >
      {/* Featured/Trending Badge */}
      {category.featured && (
        <Chip
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

      {/* Category Image/Icon Area */}
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

      {/* Category Info */}
      <CardContent sx={{ p: 3, flexGrow: 1 }}>
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

        {category.description && (
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
        )}

        {/* Additional info for products in subcategories */}
        {category.directProductCount > 0 && category.childProductCount > 0 && (
          <Typography
            variant="caption"
            sx={{
              display: "block",
              mb: 2,
              color: "text.secondary",
            }}
          >
            {category.directProductCount} direct • {category.childProductCount}{" "}
            in subcategories
          </Typography>
        )}

        {/* Bottom Actions Area */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            mt: 3,
          }}
        >
          {/* Product/Subcategory Count */}
          <Typography
            variant="body2"
            sx={{
              fontWeight: 600,
              color: categoryColor,
            }}
          >
            {category.totalProductCount > 0
              ? `${category.totalProductCount}+ Products`
              : category.subcategoryCount > 0
              ? `${category.subcategoryCount} Subcategories`
              : "Coming Soon"}
          </Typography>

          {/* Explore Button */}
          {category.totalProductCount > 0 && (
            <Button
              component={NextLink}
              href={`/products?category=${category.slug}`}
              endIcon={
                <Box
                  component="span"
                  sx={{
                    display: "inline-flex",
                    alignItems: "center",
                    transition: "transform 0.2s ease",
                    ".MuiButton-root:hover &": {
                      transform: "translateX(4px)",
                    },
                  }}
                >
                  →
                </Box>
              }
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

          {category.subcategoryCount > 0 &&
            category.totalProductCount === 0 && (
              <Button
                component={NextLink}
                href={`/categories/${category.slug}`}
                endIcon={
                  <Box
                    component="span"
                    sx={{
                      display: "inline-flex",
                      alignItems: "center",
                      transition: "transform 0.2s ease",
                      ".MuiButton-root:hover &": {
                        transform: "translateX(4px)",
                      },
                    }}
                  >
                    →
                  </Box>
                }
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
}
