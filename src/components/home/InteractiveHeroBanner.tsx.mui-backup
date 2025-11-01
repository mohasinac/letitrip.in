"use client";

import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  IconButton,
  Chip,
  Card,
  CardContent,
  Container,
  Tabs,
  Tab,
  Tooltip,
  CircularProgress,
} from "@mui/material";
import {
  PlayArrow,
  Pause,
  ArrowBackIos,
  ArrowForwardIos,
  CheckCircle,
  LocalShipping,
  Star,
} from "@mui/icons-material";
import { useCookie } from "@/hooks/useCookie";
import { HeroBannerSlide } from "@/types/heroBanner";
import { Product } from "@/app/api/admin/products/route";

const InteractiveHeroBanner: React.FC = () => {
  const [slides, setSlides] = useState<HeroBannerSlide[]>([]);
  const [products, setProducts] = useState<Map<string, Product>>(new Map());
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [loading, setLoading] = useState(true);

  const [autoPlayPref, setAutoPlayPref] = useCookie("hero-autoplay", "true");
  const [slidePref, setSlidePreference] = useCookie("hero-slide", "0");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const slidesRes = await fetch("/api/admin/hero-slides");
        const slidesData = await slidesRes.json();

        if (slidesData.success && Array.isArray(slidesData.data)) {
          setSlides(slidesData.data);

          const allProductIds = new Set<string>();
          slidesData.data.forEach((slide: HeroBannerSlide) => {
            slide.featuredProductIds?.forEach((id) => allProductIds.add(id));
          });

          if (allProductIds.size > 0) {
            const productsRes = await fetch(
              `/api/admin/products?ids=${Array.from(allProductIds).join(",")}`,
            );
            const productsData = await productsRes.json();

            if (productsData.success && Array.isArray(productsData.data)) {
              const productMap = new Map();
              productsData.data.forEach((product: Product) => {
                productMap.set(product.id, product);
              });
              setProducts(productMap);
            }
          }
        }
      } catch (error) {
        console.error("Failed to load hero data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    setIsAutoPlay(autoPlayPref === "true");
    const slideIndex = parseInt(slidePref);
    if (slideIndex >= 0 && slideIndex < slides.length) {
      setCurrentSlideIndex(slideIndex);
    }
  }, [autoPlayPref, slidePref, slides.length]);

  useEffect(() => {
    if (!isAutoPlay || isPaused || slides.length === 0) return;

    const interval = setInterval(() => {
      setCurrentSlideIndex((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlay, isPaused, slides.length]);

  const handleSlideChange = (event: React.SyntheticEvent, newValue: number) => {
    setCurrentSlideIndex(newValue);
    setSlidePreference(newValue.toString());
  };

  const handlePrevious = () => {
    const newIndex =
      currentSlideIndex === 0 ? slides.length - 1 : currentSlideIndex - 1;
    setCurrentSlideIndex(newIndex);
    setSlidePreference(newIndex.toString());
  };

  const handleNext = () => {
    const newIndex = (currentSlideIndex + 1) % slides.length;
    setCurrentSlideIndex(newIndex);
    setSlidePreference(newIndex.toString());
  };

  const toggleAutoPlay = () => {
    const newAutoPlay = !isAutoPlay;
    setIsAutoPlay(newAutoPlay);
    setAutoPlayPref(newAutoPlay.toString());
  };

  // Loading state
  if (loading || slides.length === 0) {
    return (
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "80vh",
          backgroundColor: "background.default",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  const currentSlide = slides[currentSlideIndex];
  const slideTheme = currentSlide.theme;
  const featuredProducts = (currentSlide.featuredProductIds || [])
    .slice(0, 3)
    .map((id) => products.get(id))
    .filter((p) => p !== undefined) as Product[];

  return (
    <>
      {/* Hero Section */}
      <Box
        sx={{
          position: "relative",
          minHeight: { xs: "80vh", md: "90vh" },
          backgroundImage: `url(${currentSlide.backgroundImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundAttachment: "fixed",
          transition: "all 0.8s ease-in-out",
          overflow: "hidden",
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: slideTheme.overlay,
            zIndex: 1,
          },
        }}
      >
        {/* Video Background (if available) */}
        {currentSlide.backgroundVideo && (
          <video
            src={currentSlide.backgroundVideo}
            autoPlay
            muted
            loop
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              zIndex: 0,
            }}
          />
        )}

        {/* Main Content */}
        <Container
          maxWidth="lg"
          sx={{
            position: "relative",
            zIndex: 2,
            pt: { xs: 4, md: 6 },
            pb: { xs: 4, md: 6 },
            height: "100%",
            display: "flex",
            alignItems: "center",
          }}
        >
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
              gap: 4,
              alignItems: "center",
              minHeight: "60vh",
            }}
          >
            {/* Left Content */}
            <Box>
              <Box sx={{ color: slideTheme.textPrimary }}>
                {/* Premium Quality Badge */}
                <Chip
                  icon={<CheckCircle />}
                  label="Premium Quality Guaranteed"
                  sx={{
                    background: slideTheme.primary,
                    color: slideTheme.textPrimary,
                    mb: 3,
                    "& .MuiChip-icon": { color: slideTheme.textPrimary },
                  }}
                />

                {/* Slide Title */}
                <Typography
                  variant="h2"
                  component="h1"
                  sx={{
                    fontWeight: 800,
                    mb: 3,
                    fontSize: { xs: "2.5rem", md: "3.5rem" },
                    lineHeight: 1.1,
                    color: slideTheme.textPrimary,
                    textShadow: "2px 2px 4px rgba(0,0,0,0.5)",
                  }}
                >
                  {currentSlide.title}
                </Typography>

                {/* Slide Description */}
                <Typography
                  variant="h6"
                  sx={{
                    mb: 4,
                    opacity: 0.9,
                    fontSize: "1.1rem",
                    lineHeight: 1.6,
                    color: slideTheme.textSecondary,
                    textShadow: "1px 1px 2px rgba(0,0,0,0.5)",
                  }}
                >
                  {currentSlide.description}
                </Typography>

                {/* Action Buttons */}
                <Box sx={{ display: "flex", gap: 2, mb: 4, flexWrap: "wrap" }}>
                  <Button
                    variant="contained"
                    size="large"
                    sx={{
                      background: slideTheme.primary,
                      "&:hover": { background: slideTheme.accent },
                      px: 4,
                      py: 1.5,
                      fontSize: "1.1rem",
                      fontWeight: 600,
                    }}
                  >
                    Shop Now
                  </Button>
                  <Button
                    variant="outlined"
                    size="large"
                    sx={{
                      color: slideTheme.textPrimary,
                      borderColor: slideTheme.textPrimary,
                      "&:hover": {
                        borderColor: slideTheme.primary,
                        color: slideTheme.primary,
                        background: slideTheme.overlay,
                      },
                      px: 4,
                      py: 1.5,
                      fontSize: "1.1rem",
                    }}
                  >
                    View Collections
                  </Button>
                </Box>

                {/* Feature Icons */}
                <Box sx={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <CheckCircle sx={{ color: slideTheme.primary }} />
                    <Typography
                      variant="body2"
                      sx={{ color: slideTheme.textPrimary }}
                    >
                      100% Authentic
                    </Typography>
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <LocalShipping sx={{ color: slideTheme.primary }} />
                    <Typography
                      variant="body2"
                      sx={{ color: slideTheme.textPrimary }}
                    >
                      Fast Shipping
                    </Typography>
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Star sx={{ color: slideTheme.primary }} />
                    <Typography
                      variant="body2"
                      sx={{ color: slideTheme.textPrimary }}
                    >
                      5-Star Rated
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Box>

            {/* Featured Products Grid */}
            <Box>
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "repeat(2, 1fr)",
                  gridTemplateRows: "repeat(2, 1fr)",
                  gap: 3,
                  height: "500px",
                }}
              >
                {/* First Two Products */}
                {featuredProducts.slice(0, 2).map((product, index) => (
                  <Card
                    key={product.id}
                    sx={{
                      borderRadius: 2,
                      overflow: "hidden",
                      transition: "transform 0.2s ease",
                      "&:hover": {
                        transform: "translateY(-4px)",
                      },
                      boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
                      position: "relative",
                    }}
                  >
                    <Box
                      sx={{
                        height: 140,
                        backgroundImage: `url(${product.image})`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                      }}
                    />
                    {product.badge && (
                      <Chip
                        label={product.badge}
                        size="small"
                        sx={{
                          position: "absolute",
                          top: 8,
                          right: 8,
                          backgroundColor:
                            product.badge === "New"
                              ? "success.main"
                              : "warning.main",
                          color: "white",
                          fontSize: "0.7rem",
                          fontWeight: 600,
                        }}
                      />
                    )}
                    <CardContent sx={{ p: 2 }}>
                      <Typography variant="subtitle2" noWrap fontWeight={600}>
                        {product.name}
                      </Typography>
                      <Typography
                        variant="h6"
                        fontWeight={700}
                        sx={{ color: slideTheme.primary }}
                      >
                        ₹{product.price.toLocaleString()}
                      </Typography>
                    </CardContent>
                  </Card>
                ))}

                {/* Third Product */}
                {featuredProducts[2] && (
                  <Card
                    sx={{
                      borderRadius: 2,
                      overflow: "hidden",
                      transition: "transform 0.2s ease",
                      "&:hover": {
                        transform: "translateY(-4px)",
                      },
                      boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
                      position: "relative",
                    }}
                  >
                    <Box
                      sx={{
                        height: 140,
                        backgroundImage: `url(${featuredProducts[2].image})`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                      }}
                    />
                    {featuredProducts[2].badge && (
                      <Chip
                        label={featuredProducts[2].badge}
                        size="small"
                        sx={{
                          position: "absolute",
                          top: 8,
                          right: 8,
                          backgroundColor:
                            featuredProducts[2].badge === "New"
                              ? "success.main"
                              : "warning.main",
                          color: "white",
                          fontSize: "0.7rem",
                          fontWeight: 600,
                        }}
                      />
                    )}
                    <CardContent sx={{ p: 2 }}>
                      <Typography variant="subtitle2" noWrap fontWeight={600}>
                        {featuredProducts[2].name}
                      </Typography>
                      <Typography
                        variant="h6"
                        fontWeight={700}
                        sx={{ color: slideTheme.primary }}
                      >
                        ₹{featuredProducts[2].price.toLocaleString()}
                      </Typography>
                    </CardContent>
                  </Card>
                )}

                {/* View More Button */}
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    transition: "transform 0.2s ease",
                    "&:hover": {
                      transform: "translateY(-4px)",
                    },
                  }}
                >
                  <IconButton
                    sx={{
                      width: 60,
                      height: 60,
                      backgroundColor: slideTheme.primary,
                      color: "common.white",
                      mb: 2,
                      "&:hover": {
                        backgroundColor: slideTheme.accent,
                        transform: "scale(1.1)",
                      },
                      transition: "all 0.2s ease",
                    }}
                  >
                    <ArrowForwardIos sx={{ fontSize: "1.5rem" }} />
                  </IconButton>
                  <Typography
                    variant="h6"
                    fontWeight={600}
                    sx={{
                      color: slideTheme.textPrimary,
                      mb: 1,
                      textAlign: "center",
                    }}
                  >
                    View More
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: slideTheme.textSecondary,
                      fontSize: "0.8rem",
                      textAlign: "center",
                      opacity: 0.9,
                    }}
                  >
                    Discover all products
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Box>
        </Container>

        {/* Media Controls Bar with Slide Selector */}
        <Box
          sx={{
            position: "absolute",
            bottom: 20,
            left: 0,
            right: 0,
            zIndex: 3,
            background: "rgba(0, 0, 0, 0.85)",
            backdropFilter: "blur(15px)",
            borderTop: `1px solid ${slideTheme.borderColor}`,
            py: 1.5,
            px: 2,
            boxShadow: `0 -4px 20px ${slideTheme.primary}20`,
          }}
        >
          <Container maxWidth="lg">
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 4,
                flexWrap: { xs: "wrap", md: "nowrap" },
              }}
            >
              {/* Left Side - Media Controls */}
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Tooltip title={isPaused ? "Resume" : "Pause"}>
                  <IconButton
                    onClick={() => setIsPaused(!isPaused)}
                    sx={{
                      color: slideTheme.textPrimary,
                      "&:hover": {
                        color: slideTheme.primary,
                        background: slideTheme.overlay,
                      },
                    }}
                  >
                    {isPaused ? <PlayArrow /> : <Pause />}
                  </IconButton>
                </Tooltip>

                <Tooltip title="Previous Slide">
                  <IconButton
                    onClick={handlePrevious}
                    sx={{
                      color: slideTheme.textPrimary,
                      "&:hover": {
                        color: slideTheme.primary,
                        background: slideTheme.overlay,
                      },
                    }}
                  >
                    <ArrowBackIos />
                  </IconButton>
                </Tooltip>

                <Tooltip title="Next Slide">
                  <IconButton
                    onClick={handleNext}
                    sx={{
                      color: slideTheme.textPrimary,
                      "&:hover": {
                        color: slideTheme.primary,
                        background: slideTheme.overlay,
                      },
                    }}
                  >
                    <ArrowForwardIos />
                  </IconButton>
                </Tooltip>

                <Box
                  sx={{ display: "flex", alignItems: "center", gap: 1, ml: 2 }}
                >
                  <Typography
                    variant="caption"
                    sx={{ color: slideTheme.textPrimary }}
                  >
                    Auto:
                  </Typography>
                  <Box
                    onClick={toggleAutoPlay}
                    sx={{
                      width: 40,
                      height: 20,
                      borderRadius: 10,
                      background: isAutoPlay
                        ? slideTheme.primary
                        : slideTheme.overlay,
                      position: "relative",
                      cursor: "pointer",
                      transition: "all 0.3s ease",
                      border: `1px solid ${slideTheme.borderColor}`,
                      "&::after": {
                        content: '""',
                        position: "absolute",
                        width: 16,
                        height: 16,
                        borderRadius: "50%",
                        background: slideTheme.textPrimary,
                        top: 1,
                        left: isAutoPlay ? 21 : 1,
                        transition: "all 0.3s ease",
                        boxShadow: `0 2px 4px ${slideTheme.primary}30`,
                      },
                    }}
                  />
                </Box>
              </Box>

              {/* Right Side - Slide Selector Tabs */}
              <Box
                sx={{ display: "flex", justifyContent: "flex-end", flex: 1 }}
              >
                <Tabs
                  value={currentSlideIndex}
                  onChange={handleSlideChange}
                  variant="scrollable"
                  scrollButtons="auto"
                  sx={{
                    "& .MuiTabs-indicator": {
                      backgroundColor: slideTheme.primary,
                      height: 4,
                      borderRadius: "2px 2px 0 0",
                    },
                    "& .MuiTab-root": {
                      color: slideTheme.textSecondary,
                      fontWeight: 600,
                      minWidth: "auto",
                      px: 3,
                      py: 2,
                      fontSize: "0.95rem",
                      transition: "all 0.3s ease",
                      "&.Mui-selected": {
                        color: slideTheme.primary,
                        fontWeight: 700,
                      },
                      "&:hover": {
                        color: slideTheme.primary,
                        background: slideTheme.overlay,
                      },
                    },
                    "& .MuiTabs-scrollButtons": {
                      color: slideTheme.textSecondary,
                      "&.Mui-disabled": {
                        opacity: 0.3,
                      },
                      "&:hover": {
                        color: slideTheme.primary,
                      },
                    },
                    background: slideTheme.overlay,
                    backdropFilter: "blur(10px)",
                    borderRadius: 2,
                    border: `1px solid ${slideTheme.borderColor}`,
                    minWidth: "300px",
                    boxShadow: `0 4px 20px ${slideTheme.primary}20`,
                  }}
                >
                  {slides.map((slide, index) => (
                    <Tab
                      key={slide.id}
                      label={slide.title}
                      id={`slide-tab-${index}`}
                    />
                  ))}
                </Tabs>
              </Box>
            </Box>
          </Container>
        </Box>
      </Box>
    </>
  );
};

export default InteractiveHeroBanner;
