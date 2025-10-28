"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Typography,
  Button,
  IconButton,
  Chip,
  Card,
  CardMedia,
  CardContent,
  Container,
  Tabs,
  Tab,
  Tooltip,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import {
  PlayArrow,
  Pause,
  ArrowBackIos,
  ArrowForwardIos,
  CheckCircle,
  LocalShipping,
  Star,
  ShoppingCart,
} from "@mui/icons-material";
import { useCookie } from "@/hooks/useCookie";

// Types
interface BeybladeProduct {
  id: string;
  name: string;
  price: number;
  image: string;
  badge?: "Popular" | "New" | "Sale";
  badgeColor?: "warning" | "success" | "error";
}

interface BeybladeGeneration {
  id: string;
  name: string;
  displayName: string;
  description: string;
  backgroundImage: string;
  backgroundVideo?: string;
  theme: {
    primary: string;
    secondary: string;
    accent: string;
    gradient: string;
    textPrimary: string;
    textSecondary: string;
    overlay: string;
    cardBackground: string;
    borderColor: string;
  };
  products: BeybladeProduct[];
}

// Mock data for Beyblade generations
const beybladeGenerations: BeybladeGeneration[] = [
  {
    id: "og",
    name: "Bakuten Shoot Beyblade",
    displayName: "Classic Plastic Generation",
    description: "Discover the original Beyblades that started the legend",
    backgroundImage:
      "https://images.unsplash.com/photo-1534972195531-d756b9bfa9f2?auto=format&fit=crop&w=1920&q=80",
    theme: {
      primary: "#4A90E2",
      secondary: "#7BB3F0",
      accent: "#2E5BBA",
      gradient: "linear-gradient(135deg, #4A90E2 0%, #7BB3F0 100%)",
      textPrimary: "#FFFFFF",
      textSecondary: "#E3F2FD",
      overlay: "rgba(74, 144, 226, 0.15)",
      cardBackground: "rgba(255, 255, 255, 0.95)",
      borderColor: "rgba(74, 144, 226, 0.3)",
    },
    products: [
      {
        id: "dragoon-gt",
        name: "Dragoon GT",
        price: 2499,
        image:
          "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?auto=format&fit=crop&w=300&q=80",
        badge: "Popular",
        badgeColor: "warning",
      },
      {
        id: "valkyrie-x",
        name: "Valkyrie X",
        price: 1899,
        image:
          "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?auto=format&fit=crop&w=300&q=80",
        badge: "New",
        badgeColor: "success",
      },
      {
        id: "spriggan-burst",
        name: "Spriggan Burst",
        price: 1699,
        image:
          "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?auto=format&fit=crop&w=300&q=80",
        badge: "Sale",
        badgeColor: "error",
      },
    ],
  },
  {
    id: "mfb",
    name: "Metal Fight Beyblade",
    displayName: "Metal Fight Series",
    description: "Experience the power of metal-based Beyblades",
    backgroundImage:
      "https://images.unsplash.com/photo-1518709268805-4e9042af2176?auto=format&fit=crop&w=1920&q=80",
    theme: {
      primary: "#757575",
      secondary: "#BDBDBD",
      accent: "#424242",
      gradient: "linear-gradient(135deg, #757575 0%, #BDBDBD 100%)",
      textPrimary: "#FFFFFF",
      textSecondary: "#F5F5F5",
      overlay: "rgba(117, 117, 117, 0.15)",
      cardBackground: "rgba(255, 255, 255, 0.95)",
      borderColor: "rgba(117, 117, 117, 0.3)",
    },
    products: [
      {
        id: "storm-pegasus",
        name: "Storm Pegasus",
        price: 2299,
        image:
          "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?auto=format&fit=crop&w=300&q=80",
        badge: "Popular",
        badgeColor: "warning",
      },
      {
        id: "rock-leone",
        name: "Rock Leone",
        price: 2199,
        image:
          "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?auto=format&fit=crop&w=300&q=80",
        badge: "New",
        badgeColor: "success",
      },
      {
        id: "flame-sagittario",
        name: "Flame Sagittario",
        price: 1999,
        image:
          "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?auto=format&fit=crop&w=300&q=80",
        badge: "Sale",
        badgeColor: "error",
      },
    ],
  },
  {
    id: "burst",
    name: "Beyblade Burst",
    displayName: "Burst System",
    description: "Master the explosive burst mechanics",
    backgroundImage:
      "https://images.unsplash.com/photo-1614732414444-096040ec8c2f?auto=format&fit=crop&w=1920&q=80",
    theme: {
      primary: "#FF6B35",
      secondary: "#FF8A65",
      accent: "#E64A19",
      gradient: "linear-gradient(135deg, #FF6B35 0%, #FF8A65 100%)",
      textPrimary: "#FFFFFF",
      textSecondary: "#FFF3E0",
      overlay: "rgba(255, 107, 53, 0.15)",
      cardBackground: "rgba(255, 255, 255, 0.95)",
      borderColor: "rgba(255, 107, 53, 0.3)",
    },
    products: [
      {
        id: "valkyrie-wing",
        name: "Valkyrie Wing",
        price: 2499,
        image:
          "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?auto=format&fit=crop&w=300&q=80",
        badge: "Popular",
        badgeColor: "warning",
      },
      {
        id: "spriggan-spread",
        name: "Spriggan Spread",
        price: 2399,
        image:
          "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?auto=format&fit=crop&w=300&q=80",
        badge: "New",
        badgeColor: "success",
      },
      {
        id: "ragnaruk-heavy",
        name: "Ragnaruk Heavy",
        price: 2199,
        image:
          "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?auto=format&fit=crop&w=300&q=80",
        badge: "Sale",
        badgeColor: "error",
      },
    ],
  },
  {
    id: "x",
    name: "Beyblade X",
    displayName: "Next-Gen X Series",
    description: "The future of Beyblade battles is here",
    backgroundImage:
      "https://images.unsplash.com/photo-1518709268805-4e9042af2176?auto=format&fit=crop&w=1920&q=80",
    theme: {
      primary: "#9C27B0",
      secondary: "#BA68C8",
      accent: "#7B1FA2",
      gradient: "linear-gradient(135deg, #9C27B0 0%, #BA68C8 100%)",
      textPrimary: "#FFFFFF",
      textSecondary: "#F3E5F5",
      overlay: "rgba(156, 39, 176, 0.15)",
      cardBackground: "rgba(255, 255, 255, 0.95)",
      borderColor: "rgba(156, 39, 176, 0.3)",
    },
    products: [
      {
        id: "dran-sword",
        name: "Dran Sword",
        price: 2999,
        image:
          "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?auto=format&fit=crop&w=300&q=80",
        badge: "Popular",
        badgeColor: "warning",
      },
      {
        id: "hellscythe",
        name: "Hellscythe",
        price: 2899,
        image:
          "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?auto=format&fit=crop&w=300&q=80",
        badge: "New",
        badgeColor: "success",
      },
      {
        id: "wizard-arrow",
        name: "Wizard Arrow",
        price: 2699,
        image:
          "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?auto=format&fit=crop&w=300&q=80",
        badge: "Sale",
        badgeColor: "error",
      },
    ],
  },
];

// Cookie utility functions
const InteractiveHeroBanner: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  // State management with cookie persistence
  const [autoPlayPref, setAutoPlayPref] = useCookie("hero-autoplay", "true");
  const [generationPref, setGenerationPref] = useCookie("hero-generation", "0");

  const [currentGeneration, setCurrentGeneration] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(true);
  const [isPaused, setIsPaused] = useState(false);

  // Load preferences from cookies
  useEffect(() => {
    setIsAutoPlay(autoPlayPref === "true");
    const genIndex = parseInt(generationPref);
    if (genIndex >= 0 && genIndex < beybladeGenerations.length) {
      setCurrentGeneration(genIndex);
    }
  }, [autoPlayPref, generationPref]);

  // Auto-rotation logic
  useEffect(() => {
    if (!isAutoPlay || isPaused) return;

    const interval = setInterval(() => {
      setCurrentGeneration((prev) => (prev + 1) % beybladeGenerations.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlay, isPaused]);

  // Event handlers
  const handleGenerationChange = (
    event: React.SyntheticEvent,
    newValue: number
  ) => {
    setCurrentGeneration(newValue);
    setGenerationPref(newValue.toString());
  };

  const handlePrevious = () => {
    const newIndex =
      currentGeneration === 0
        ? beybladeGenerations.length - 1
        : currentGeneration - 1;
    setCurrentGeneration(newIndex);
    setGenerationPref(newIndex.toString());
  };

  const handleNext = () => {
    const newIndex = (currentGeneration + 1) % beybladeGenerations.length;
    setCurrentGeneration(newIndex);
    setGenerationPref(newIndex.toString());
  };

  const toggleAutoPlay = () => {
    const newAutoPlay = !isAutoPlay;
    setIsAutoPlay(newAutoPlay);
    setAutoPlayPref(newAutoPlay.toString());
  };

  const togglePause = () => {
    setIsPaused(!isPaused);
  };

  const currentGen = beybladeGenerations[currentGeneration];

  return (
    <>
      {/* Sale Banner */}
      <Box
        sx={{
          width: "100%",
          backgroundColor: "#ff4444",
          color: "#fff",
          textAlign: "center",
          py: 1,
          zIndex: 10,
          position: "relative",
        }}
      >
        <Typography
          variant="body2"
          sx={{
            fontSize: "0.9rem",
            fontWeight: 500,
          }}
        >
          🔥 Check out our items on sale -{" "}
          <Box
            component="a"
            href="#"
            sx={{
              color: "#fff",
              textDecoration: "underline",
              fontWeight: 600,
              "&:hover": {
                textDecoration: "none",
                opacity: 0.8,
              },
            }}
          >
            Shop Now
          </Box>
        </Typography>
      </Box>

      <Box
        sx={{
          position: "relative",
          minHeight: { xs: "80vh", md: "90vh" },
          background: currentGen.theme.gradient,
          backgroundImage: `url(${currentGen.backgroundImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundBlendMode: "overlay",
          transition: "all 0.8s ease-in-out",
          overflow: "hidden",
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: currentGen.theme.overlay,
            zIndex: 1,
          },
        }}
      >
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
            {/* Fixed Left Content */}
            <Box>
              <Box sx={{ color: currentGen.theme.textPrimary }}>
                {/* Premium Quality Badge */}
                <Chip
                  icon={<CheckCircle />}
                  label="Premium Quality Guaranteed"
                  sx={{
                    background: currentGen.theme.primary,
                    color: currentGen.theme.textPrimary,
                    mb: 3,
                    "& .MuiChip-icon": { color: currentGen.theme.textPrimary },
                  }}
                />

                {/* Main Title */}
                <Typography
                  variant="h2"
                  component="h1"
                  sx={{
                    fontWeight: 800,
                    mb: 3,
                    fontSize: { xs: "2.5rem", md: "3.5rem" },
                    lineHeight: 1.1,
                    color: currentGen.theme.textPrimary,
                    textShadow: "2px 2px 4px rgba(0,0,0,0.5)",
                  }}
                >
                  Authentic Beyblades
                  <br />
                  for True Bladers
                </Typography>

                {/* Dynamic Description */}
                <Typography
                  variant="h6"
                  sx={{
                    mb: 4,
                    opacity: 0.9,
                    fontSize: "1.1rem",
                    lineHeight: 1.6,
                    color: currentGen.theme.textSecondary,
                    textShadow: "1px 1px 2px rgba(0,0,0,0.5)",
                  }}
                >
                  {currentGen.description}. From classic Plastic Gen to the
                  latest Beyblade X series - we have them all.
                </Typography>

                {/* Action Buttons */}
                <Box sx={{ display: "flex", gap: 2, mb: 4, flexWrap: "wrap" }}>
                  <Button
                    variant="contained"
                    size="large"
                    sx={{
                      background: currentGen.theme.primary,
                      "&:hover": { background: currentGen.theme.accent },
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
                      color: currentGen.theme.textPrimary,
                      borderColor: currentGen.theme.textPrimary,
                      "&:hover": {
                        borderColor: currentGen.theme.primary,
                        color: currentGen.theme.primary,
                        background: currentGen.theme.overlay,
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
                    <CheckCircle sx={{ color: currentGen.theme.primary }} />
                    <Typography
                      variant="body2"
                      sx={{ color: currentGen.theme.textPrimary }}
                    >
                      100% Authentic
                    </Typography>
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <LocalShipping sx={{ color: currentGen.theme.primary }} />
                    <Typography
                      variant="body2"
                      sx={{ color: currentGen.theme.textPrimary }}
                    >
                      Fast Shipping
                    </Typography>
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Star sx={{ color: currentGen.theme.primary }} />
                    <Typography
                      variant="body2"
                      sx={{ color: currentGen.theme.textPrimary }}
                    >
                      5-Star Rated
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Box>

            {/* Interactive Product Cards */}
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
                {/* First Two Products as Separate Cards */}
                {currentGen.products.slice(0, 2).map((product, index) => (
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
                      backgroundColor: "#fff",
                      position: "relative",
                    }}
                  >
                    <CardMedia
                      component="div"
                      sx={{
                        height: 140,
                        backgroundColor: "#f5f5f5",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Typography
                        variant="h6"
                        sx={{
                          color: currentGen.theme.primary,
                          fontWeight: 600,
                        }}
                      >
                        {product.name}
                      </Typography>
                    </CardMedia>
                    {product.badge && (
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
                          fontSize: "0.7rem",
                        }}
                      />
                    )}
                    <CardContent sx={{ p: 2 }}>
                      <Typography
                        variant="body2"
                        sx={{
                          color: "#666",
                          mb: 1,
                        }}
                      >
                        {currentGen.displayName}
                      </Typography>
                      <Typography
                        variant="h6"
                        fontWeight={600}
                        sx={{
                          color: currentGen.theme.primary,
                        }}
                      >
                        ₹{product.price.toLocaleString()}
                      </Typography>
                    </CardContent>
                  </Card>
                ))}

                {/* Third Product Card */}
                <Card
                  sx={{
                    borderRadius: 2,
                    overflow: "hidden",
                    transition: "transform 0.2s ease",
                    "&:hover": {
                      transform: "translateY(-4px)",
                    },
                    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
                    backgroundColor: "#fff",
                  }}
                >
                  <CardMedia
                    component="div"
                    sx={{
                      height: 140,
                      backgroundColor: "#f5f5f5",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Typography
                      variant="h6"
                      sx={{
                        color: currentGen.theme.primary,
                        fontWeight: 600,
                      }}
                    >
                      {currentGen.products[2]?.name}
                    </Typography>
                  </CardMedia>
                  {currentGen.products[2]?.badge && (
                    <Chip
                      label={currentGen.products[2].badge}
                      size="small"
                      sx={{
                        position: "absolute",
                        top: 8,
                        right: 8,
                        backgroundColor:
                          currentGen.products[2].badge === "Sale"
                            ? "error.main"
                            : currentGen.products[2].badge === "New"
                            ? "success.main"
                            : "warning.main",
                        color: "white",
                        fontSize: "0.7rem",
                      }}
                    />
                  )}
                  <CardContent sx={{ p: 2 }}>
                    <Typography
                      variant="body2"
                      sx={{
                        color: "#666",
                        mb: 1,
                      }}
                    >
                      {currentGen.displayName}
                    </Typography>
                    <Typography
                      variant="h6"
                      fontWeight={600}
                      sx={{
                        color: currentGen.theme.primary,
                      }}
                    >
                      ₹{currentGen.products[2]?.price.toLocaleString()}
                    </Typography>
                  </CardContent>
                </Card>

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
                      backgroundColor: currentGen.theme.primary,
                      color: "#fff",
                      mb: 2,
                      "&:hover": {
                        backgroundColor: currentGen.theme.accent,
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
                      color: currentGen.theme.textPrimary,
                      mb: 1,
                      textAlign: "center",
                    }}
                  >
                    View More
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: currentGen.theme.textSecondary,
                      fontSize: "0.8rem",
                      textAlign: "center",
                      opacity: 0.9,
                    }}
                  >
                    Discover all {currentGen.displayName} products
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Box>
        </Container>

        {/* Media Controls Bar with Generation Selector - Merged */}
        <Box
          sx={{
            position: "absolute",
            bottom: 20,
            left: 0,
            right: 0,
            zIndex: 3,
            background: "rgba(0, 0, 0, 0.8)",
            backdropFilter: "blur(15px)",
            borderTop: `1px solid ${currentGen.theme.borderColor}`,
            py: 1.5,
            px: 2,
            boxShadow: `0 -4px 20px ${currentGen.theme.primary}20`,
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
                    onClick={togglePause}
                    sx={{
                      color: currentGen.theme.textPrimary,
                      "&:hover": {
                        color: currentGen.theme.primary,
                        background: currentGen.theme.overlay,
                      },
                    }}
                  >
                    {isPaused ? <PlayArrow /> : <Pause />}
                  </IconButton>
                </Tooltip>

                <Tooltip title="Previous Generation">
                  <IconButton
                    onClick={handlePrevious}
                    sx={{
                      color: currentGen.theme.textPrimary,
                      "&:hover": {
                        color: currentGen.theme.primary,
                        background: currentGen.theme.overlay,
                      },
                    }}
                  >
                    <ArrowBackIos />
                  </IconButton>
                </Tooltip>

                <Tooltip title="Next Generation">
                  <IconButton
                    onClick={handleNext}
                    sx={{
                      color: currentGen.theme.textPrimary,
                      "&:hover": {
                        color: currentGen.theme.primary,
                        background: currentGen.theme.overlay,
                      },
                    }}
                  >
                    <ArrowForwardIos />
                  </IconButton>
                </Tooltip>

                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    ml: 2,
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{ color: currentGen.theme.textPrimary }}
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
                        ? currentGen.theme.primary
                        : currentGen.theme.overlay,
                      position: "relative",
                      cursor: "pointer",
                      transition: "all 0.3s ease",
                      border: `1px solid ${currentGen.theme.borderColor}`,
                      "&::after": {
                        content: '""',
                        position: "absolute",
                        width: 16,
                        height: 16,
                        borderRadius: "50%",
                        background: currentGen.theme.textPrimary,
                        top: 1,
                        left: isAutoPlay ? 21 : 1,
                        transition: "all 0.3s ease",
                        boxShadow: `0 2px 4px ${currentGen.theme.primary}30`,
                      },
                    }}
                  />
                </Box>
              </Box>

              {/* Right Side - Generation Selector */}
              <Box
                sx={{ display: "flex", justifyContent: "flex-end", flex: 1 }}
              >
                <Tabs
                  value={currentGeneration}
                  onChange={handleGenerationChange}
                  variant="scrollable"
                  scrollButtons="auto"
                  sx={{
                    "& .MuiTabs-indicator": {
                      backgroundColor: currentGen.theme.primary,
                      height: 4,
                      borderRadius: "2px 2px 0 0",
                    },
                    "& .MuiTab-root": {
                      color: currentGen.theme.textSecondary,
                      fontWeight: 600,
                      minWidth: "auto",
                      px: 3,
                      py: 2,
                      fontSize: "1rem",
                      transition: "all 0.3s ease",
                      "&.Mui-selected": {
                        color: currentGen.theme.primary,
                        fontWeight: 700,
                      },
                      "&:hover": {
                        color: currentGen.theme.primary,
                        background: currentGen.theme.overlay,
                      },
                    },
                    "& .MuiTabs-scrollButtons": {
                      color: currentGen.theme.textSecondary,
                      "&.Mui-disabled": {
                        opacity: 0.3,
                      },
                      "&:hover": {
                        color: currentGen.theme.primary,
                      },
                    },
                    background: currentGen.theme.overlay,
                    backdropFilter: "blur(10px)",
                    borderRadius: 2,
                    border: `1px solid ${currentGen.theme.borderColor}`,
                    minWidth: "600px",
                    boxShadow: `0 4px 20px ${currentGen.theme.primary}20`,
                  }}
                >
                  {beybladeGenerations.map((gen, index) => (
                    <Tab key={gen.id} label={gen.name} />
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
