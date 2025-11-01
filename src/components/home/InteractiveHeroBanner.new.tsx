"use client";

import React, { useState, useEffect } from "react";
import {
  CheckCircle,
  Pause,
  Play,
  ChevronLeft,
  ChevronRight,
  Truck,
  Star,
} from "lucide-react";
import { useCookie } from "@/hooks/useCookie";
import { HeroBannerSlide } from "@/types/heroBanner";
import { Product } from "@/app/api/admin/products/route";
import {
  UnifiedCard,
  UnifiedButton,
  UnifiedBadge,
} from "@/components/ui/unified";
import { cn } from "@/lib/utils";

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
              `/api/admin/products?ids=${Array.from(allProductIds).join(",")}`
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

  const selectSlide = (index: number) => {
    setCurrentSlideIndex(index);
    setSlidePreference(index.toString());
  };

  // Loading state
  if (loading || slides.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[80vh] bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const currentSlide = slides[currentSlideIndex];
  const slideTheme = currentSlide.theme;
  const featuredProducts = (currentSlide.featuredProductIds || [])
    .slice(0, 3)
    .map((id) => products.get(id))
    .filter((p) => p !== undefined) as Product[];

  return (
    <div className="relative">
      {/* Hero Section */}
      <div
        className="relative min-h-[80vh] md:min-h-[90vh] bg-cover bg-center bg-fixed overflow-hidden transition-all duration-800"
        style={{
          backgroundImage: `url(${currentSlide.backgroundImage})`,
        }}
      >
        {/* Overlay */}
        <div
          className="absolute inset-0 z-[1]"
          style={{ background: slideTheme.overlay }}
        />

        {/* Video Background (if available) */}
        {currentSlide.backgroundVideo && (
          <video
            src={currentSlide.backgroundVideo}
            autoPlay
            muted
            loop
            className="absolute top-0 left-0 w-full h-full object-cover z-0"
          />
        )}

        {/* Main Content */}
        <div className="container mx-auto px-4 relative z-[2] pt-8 md:pt-12 pb-8 md:pb-12 h-full flex items-center">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center min-h-[60vh] w-full">
            {/* Left Content */}
            <div>
              <div style={{ color: slideTheme.textPrimary }}>
                {/* Premium Quality Badge */}
                <div
                  className="inline-flex items-center gap-1 px-3 py-1 rounded-full mb-6 text-sm font-medium"
                  style={{
                    background: slideTheme.primary,
                    color: slideTheme.textPrimary,
                  }}
                >
                  <CheckCircle className="h-4 w-4" />
                  Premium Quality Guaranteed
                </div>

                {/* Slide Title */}
                <h1
                  className="text-4xl md:text-5xl font-extrabold mb-6 leading-tight"
                  style={{
                    color: slideTheme.textPrimary,
                    textShadow: "2px 2px 4px rgba(0,0,0,0.5)",
                  }}
                >
                  {currentSlide.title}
                </h1>

                {/* Slide Description */}
                <p
                  className="text-lg md:text-xl mb-8 opacity-90 leading-relaxed"
                  style={{
                    color: slideTheme.textSecondary,
                    textShadow: "1px 1px 2px rgba(0,0,0,0.5)",
                  }}
                >
                  {currentSlide.description}
                </p>

                {/* Action Buttons */}
                <div className="flex gap-4 mb-8 flex-wrap">
                  <UnifiedButton
                    size="lg"
                    className="px-8 py-3 text-lg font-semibold"
                    style={{
                      background: slideTheme.primary,
                    }}
                  >
                    Shop Now
                  </UnifiedButton>
                  <UnifiedButton
                    variant="outline"
                    size="lg"
                    className="px-8 py-3 text-lg"
                    style={{
                      color: slideTheme.textPrimary,
                      borderColor: slideTheme.textPrimary,
                    }}
                  >
                    View Collections
                  </UnifiedButton>
                </div>

                {/* Feature Icons */}
                <div className="flex gap-8 flex-wrap">
                  <div className="flex items-center gap-2">
                    <CheckCircle
                      className="h-5 w-5"
                      style={{ color: slideTheme.primary }}
                    />
                    <span
                      className="text-sm"
                      style={{ color: slideTheme.textPrimary }}
                    >
                      100% Authentic
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Truck
                      className="h-5 w-5"
                      style={{ color: slideTheme.primary }}
                    />
                    <span
                      className="text-sm"
                      style={{ color: slideTheme.textPrimary }}
                    >
                      Fast Shipping
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Star
                      className="h-5 w-5"
                      style={{ color: slideTheme.primary }}
                    />
                    <span
                      className="text-sm"
                      style={{ color: slideTheme.textPrimary }}
                    >
                      5-Star Rated
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Featured Products Grid */}
            <div>
              <div className="grid grid-cols-2 grid-rows-2 gap-6 h-[500px]">
                {/* First Two Products */}
                {featuredProducts.slice(0, 2).map((product) => (
                  <UnifiedCard
                    key={product.id}
                    className="overflow-hidden transition-transform hover:-translate-y-1 cursor-pointer"
                  >
                    <div
                      className="h-[140px] bg-cover bg-center"
                      style={{
                        backgroundImage: `url(${product.image})`,
                      }}
                    />
                    {product.badge && (
                      <UnifiedBadge
                        variant={
                          product.badge === "New" ? "success" : "warning"
                        }
                        className="absolute top-2 right-2 text-xs font-semibold"
                      >
                        {product.badge}
                      </UnifiedBadge>
                    )}
                    <div className="p-4">
                      <p className="text-sm font-semibold truncate">
                        {product.name}
                      </p>
                      <p
                        className="text-xl font-bold mt-1"
                        style={{ color: slideTheme.primary }}
                      >
                        ₹{product.price.toLocaleString()}
                      </p>
                    </div>
                  </UnifiedCard>
                ))}

                {/* Third Product */}
                {featuredProducts[2] && (
                  <UnifiedCard
                    key={featuredProducts[2].id}
                    className="overflow-hidden transition-transform hover:-translate-y-1 cursor-pointer"
                  >
                    <div
                      className="h-[140px] bg-cover bg-center"
                      style={{
                        backgroundImage: `url(${featuredProducts[2].image})`,
                      }}
                    />
                    {featuredProducts[2].badge && (
                      <UnifiedBadge
                        variant={
                          featuredProducts[2].badge === "New"
                            ? "success"
                            : "warning"
                        }
                        className="absolute top-2 right-2 text-xs font-semibold"
                      >
                        {featuredProducts[2].badge}
                      </UnifiedBadge>
                    )}
                    <div className="p-4">
                      <p className="text-sm font-semibold truncate">
                        {featuredProducts[2].name}
                      </p>
                      <p
                        className="text-xl font-bold mt-1"
                        style={{ color: slideTheme.primary }}
                      >
                        ₹{featuredProducts[2].price.toLocaleString()}
                      </p>
                    </div>
                  </UnifiedCard>
                )}

                {/* View More Button */}
                <div className="flex flex-col items-center justify-center cursor-pointer transition-transform hover:-translate-y-1">
                  <button
                    className="w-[60px] h-[60px] rounded-full flex items-center justify-center text-white mb-4 transition-all hover:scale-110"
                    style={{
                      backgroundColor: slideTheme.primary,
                    }}
                  >
                    <ChevronRight className="h-6 w-6" />
                  </button>
                  <p
                    className="text-lg font-semibold mb-2 text-center"
                    style={{ color: slideTheme.textPrimary }}
                  >
                    View More
                  </p>
                  <p
                    className="text-xs text-center opacity-90"
                    style={{ color: slideTheme.textSecondary }}
                  >
                    Discover all products
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Media Controls Bar with Slide Selector */}
        <div
          className="absolute bottom-5 left-0 right-0 z-[3] backdrop-blur-md py-3 px-4 border-t"
          style={{
            background: "rgba(0, 0, 0, 0.85)",
            borderTopColor: slideTheme.borderColor,
            boxShadow: `0 -4px 20px ${slideTheme.primary}20`,
          }}
        >
          <div className="container mx-auto">
            <div className="flex items-center justify-between gap-8 flex-wrap md:flex-nowrap">
              {/* Left Side - Media Controls */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsPaused(!isPaused)}
                  className="p-2 rounded-lg transition-colors hover:bg-surface"
                  style={{ color: slideTheme.textPrimary }}
                  title={isPaused ? "Resume" : "Pause"}
                >
                  {isPaused ? (
                    <Play className="h-5 w-5" />
                  ) : (
                    <Pause className="h-5 w-5" />
                  )}
                </button>

                <button
                  onClick={handlePrevious}
                  className="p-2 rounded-lg transition-colors hover:bg-surface"
                  style={{ color: slideTheme.textPrimary }}
                  title="Previous Slide"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>

                <button
                  onClick={handleNext}
                  className="p-2 rounded-lg transition-colors hover:bg-surface"
                  style={{ color: slideTheme.textPrimary }}
                  title="Next Slide"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>

                <div className="flex items-center gap-2 ml-4">
                  <span
                    className="text-xs"
                    style={{ color: slideTheme.textPrimary }}
                  >
                    Auto:
                  </span>
                  <button
                    onClick={toggleAutoPlay}
                    className="relative w-10 h-5 rounded-full transition-all border"
                    style={{
                      background: isAutoPlay
                        ? slideTheme.primary
                        : slideTheme.overlay,
                      borderColor: slideTheme.borderColor,
                    }}
                  >
                    <span
                      className="absolute w-4 h-4 rounded-full top-[2px] transition-all"
                      style={{
                        background: slideTheme.textPrimary,
                        left: isAutoPlay ? "21px" : "2px",
                        boxShadow: `0 2px 4px ${slideTheme.primary}30`,
                      }}
                    />
                  </button>
                </div>
              </div>

              {/* Right Side - Slide Selector Tabs */}
              <div className="flex justify-end flex-1 overflow-x-auto">
                <div
                  className="flex gap-1 p-1 rounded-lg border min-w-[300px]"
                  style={{
                    background: slideTheme.overlay,
                    borderColor: slideTheme.borderColor,
                    boxShadow: `0 4px 20px ${slideTheme.primary}20`,
                  }}
                >
                  {slides.map((slide, index) => (
                    <button
                      key={slide.id}
                      onClick={() => selectSlide(index)}
                      className={cn(
                        "px-6 py-2 rounded-md text-sm font-semibold transition-all whitespace-nowrap",
                        currentSlideIndex === index
                          ? "font-bold"
                          : "hover:bg-surface"
                      )}
                      style={{
                        color:
                          currentSlideIndex === index
                            ? slideTheme.primary
                            : slideTheme.textSecondary,
                        borderBottom:
                          currentSlideIndex === index
                            ? `3px solid ${slideTheme.primary}`
                            : "3px solid transparent",
                      }}
                    >
                      {slide.title}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InteractiveHeroBanner;
