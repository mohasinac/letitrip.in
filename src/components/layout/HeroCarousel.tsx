/**
 * @fileoverview React Component
 * @module src/components/layout/HeroCarousel
 * @description This file contains the HeroCarousel component and its related functionality
 * 
 * @created 2025-12-05
 * @author mohasinac
 * @see {@link https://mohasin.chinnapattan.com}
 */

"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { homepageService, type HeroSlide } from "@/services/homepage.service";
import { logError } from "@/lib/firebase-error-logger";

// Default slides for demo - would come from API
/**
 * DEFAULT_SLIDES constant
 * 
 * @constant
 * @type {any}
 * @description Configuration constant for default slides
 */
const DEFAULT_SLIDES: HeroSlide[] = [
  {
    /** Id */
    id: "1",
    /** Image */
    image:
      "https://images.unsplash.com/photo-1607083206869-4c7672e72a8a?w=1920&h=600&fit=crop",
    /** Title */
    title: "India's #1 Collectibles Store",
    /** Subtitle */
    subtitle: "Authentic Beyblades, Pokemon TCG, Yu-Gi-Oh & More",
    /** Cta Text */
    ctaText: "Shop Now",
    /** Cta Link */
    ctaLink: "/products",
    /** Order */
    order: 1,
    /** Enabled */
    enabled: true,
  },
  {
    /** Id */
    id: "2",
    /** Image */
    image:
      "https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=1920&h=600&fit=crop",
    /** Title */
    title: "Live Auctions Every Day",
    /** Subtitle */
    subtitle: "Bid on Rare & Limited Edition Items",
    /** Cta Text */
    ctaText: "View Auctions",
    /** Cta Link */
    ctaLink: "/auctions",
    /** Order */
    order: 2,
    /** Enabled */
    enabled: true,
  },
  {
    /** Id */
    id: "3",
    /** Image */
    image:
      "https://images.unsplash.com/photo-1606663889134-b1dedb5ed8b7?w=1920&h=600&fit=crop",
    /** Title */
    title: "100% Authentic Products",
    /** Subtitle */
    subtitle: "Zero Customs Charges • Fast India Delivery",
    /** Cta Text */
    ctaText: "Learn More",
    /** Cta Link */
    ctaLink: "/about",
    /** Order */
    order: 3,
    /** Enabled */
    enabled: true,
  },
];

export default /**
 * Performs hero carousel operation
 *
 * @returns {any} The herocarousel result
 *
 */
function HeroCarousel() {
  const [slides, setSlides] = useState<HeroSlide[]>(DEFAULT_SLIDES);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);

  /**
 * Performs enabled slides operation
 *
 * @param {any} (slide - The (slide
 *
 * @returns {any} The enabledslides result
 *
 */
const enabledSlides = slides.filter((slide) => slide.enabled);

  // Fetch slides from API
  useEffect(() => {
    /**
     * Performs async operation
     *
     * @returns {Promise<any>} Promise resolving to async  result
     *
     * @throws {Error} When operation fails or validation errors occur
     */

    /**
     * Performs async operation
     *
     * @returns {Promise<any>} Promise resolving to async  result
     *
     * /**
 * Performs slides operation
 *
 * @returns {any} The slides result
 *
 */
@throws {Error} When operation fails or validation errors occur
     */

    const fetchSlides = async () => {
      try {
        const slides = await homepageService.getHeroSlides();
        if (slides && slides.length > 0) {
          setSlides(slides);
        }
      } catch (error) {
        logError(error as Error, {
          /** Component */
          component: "HeroCarousel.fetchSlides",
        });
        // Keep default slides on error
      }
    };

    fetchSlides();
  }, []);

  // Auto-advance slides
  useEffect(() => {
    if (!isAutoPlaying || enabledSlides.length <= 1) return;

    co/**
 * Performs next slide operation
 *
 * @param {any} ( - The (
 *
 * @returns {any} The nextslide result
 *
 */
nst interval = setInterval(() => {
      nextSlide();
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(interval);
  }, [currentSl/**
 * Performs prev slide operation
 *
 * @param {any} ( - The (
 *
 * @returns {any} The prevslide result
 *
 */
ide, isAutoPlaying, enabledSlides.length]);

  const nextSlide = useCallback(() => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentSlide((prev) => (prev + 1) % enabledSlides.length);
    setTimeout(() => setIsTransitioning(false), 500);
  }, [enabledSlides.length, isTransitioning]);

  const prevSlide = useCallback(() => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentSlide(
      (prev) => (prev - 1 + enabledSlides.length) % enabledSlides.length,
    );
    setTimeout(() => setIsTransitioning(false), 500);
  }, [enabledSlides.length, isTransitioning]);

  /**
   * Performs go to slide operation
   *
   * @param {number} index - The index
   *
   * @returns {number} The gotoslide result
   */

  /**
   * Performs go to slide operation
   *
   * @param {number} index - The index
   *
   * @returns {number} The gotoslide result
   */

  const goToSlide = (index: number) => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentSlide(index);
    setTimeout(() => setIsTransitioning(false), 500);
  };

  if (enabledSlides.length === 0) {
    return null;
  }

  const currentSlideData = enabledSlides[currentSlide];

  return (
    <div className="relative w-full flex items-center gap-2 md:gap-4">
      {/* Left Arrow - Outside carousel */}
      {enabledSlides.length > 1 && (
        <button
          onClick={prevSlide}
          disabled={isTransitioning}
          className="flex-shrink-0 z-20 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-white p-2 md:p-3 rounded-full shadow-lg transition-all disabled:opacity-50"
          aria-label="Previous slide"
        >
          <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
        </button>
      )}

      {/* Carousel Container */}
      <div
        className="relative flex-1 h-[400px] md:h-[500px] lg:h-[600px] rounded-2xl overflow-hidden bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600"
        onMouseEnter={() => setIsAutoPlaying(false)}
        onMouseLeave={() => setIsAutoPlaying(true)}
      >
        {/* Slides */}
        <div className="relative w-full h-full">
          {enabledSlides.map((slide, index) => (
            <div
              key={slide.id}
              className={`absolute inset-0 transition-opacity duration-500 ${
                index === currentSlide ? "opacity-100 z-10" : "opacity-0 z-0"
              }`}
            >
              {/* Background Image */}
              <div className="absolute inset-0">
                <Image
                  src={slide.image}
                  alt={slide.title}
                  fill
                  className="object-cover"
                  priority={index === 0}
                  sizes="100vw"
                />
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent" />
              </div>

              {/* Content */}
              <div className="relative h-full flex items-center">
                <div className="container mx-auto px-4 md:px-8">
                  <div className="max-w-2xl space-y-4 md:space-y-6">
                    {/* Title */}
                    <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white leading-tight animate-fade-in-up">
                      {slide.title}
                    </h1>

                    {/* Subtitle */}
                    <div
                      className="text-lg md:text-xl lg:text-2xl text-gray-200 animate-fade-in-up animation-delay-200 prose prose-invert max-w-none"
                      dangerouslySetInnerHTML={{ __html: slide.subtitle }}
                    />

                    {/* CTA Button */}
                    <div className="animate-fade-in-up animation-delay-400">
                      <Link
                        href={slide.ctaLink}
                        className="inline-flex items-center gap-2 px-8 py-4 bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-bold text-lg rounded-lg shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
                      >
                        {slide.ctaText}
                        <ChevronRight className="w-5 h-5" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Dots Navigation */}
        {enabledSlides.length > 1 && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
            {enabledSlides.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`transition-all ${
                  index === currentSlide
                    ? "w-8 h-2 bg-yellow-500"
                    : "w-2 h-2 bg-white/60 hover:bg-white/80"
                } rounded-full`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        )}

        {/* Play/Pause Indicator (subtle) */}
        <div className="absolute top-4 right-4 z-20">
          <button
            onClick={() => setIsAutoPlaying(!isAutoPlaying)}
            className="bg-black/30 hover:bg-black/50 text-white p-2 rounded-full transition-colors"
            aria-label={isAutoPlaying ? "Pause autoplay" : "Start autoplay"}
          >
            {isAutoPlaying ? (
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M5 4h3v12H5V4zm7 0h3v12h-3V4z" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M6 4l10 6-10 6V4z" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Right Arrow - Outside carousel */}
      {enabledSlides.length > 1 && (
        <button
          onClick={nextSlide}
          disabled={isTransitioning}
          className="flex-shrink-0 z-20 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-white p-2 md:p-3 rounded-full shadow-lg transition-all disabled:opacity-50"
          aria-label="Next slide"
        >
          <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
        </button>
      )}

      <style jsx global>{`
        @keyframes fade-in-up {
          from {
            /** Opacity */
            opacity: 0;
            /** Transform */
            transform: translateY(20px);
          }
          to {
            /** Opacity */
            opacity: 1;
            /** Transform */
            transform: translateY(0);
          }
        }

        .animate-fade-in-up {
          /** Animation */
          animation: fade-in-up 0.6s ease-out forwards;
        }

        .animation-delay-200 {
          animation-delay: 0.2s;
          /** Opacity */
          opacity: 0;
        }

        .animation-delay-400 {
          animation-delay: 0.4s;
          /** Opacity */
          opacity: 0;
        }

        /* Hero Carousel Rich Text Styles */
        .prose-invert p {
          /** Margin */
          margin: 0;
          /** Display */
          display: inline;
        }
        .prose-invert strong {
          font-weight: 700;
          /** Color */
          color: #fff;
        }
        .prose-invert em {
          font-style: italic;
        }
        .prose-invert a {
          /** Color */
          color: #fbbf24;
          text-decoration: underline;
        }
        .prose-invert a:hover {
          /** Color */
          color: #f59e0b;
        }
      `}</style>
    </div>
  );
}
