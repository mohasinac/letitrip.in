"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface HeroSlide {
  id: string;
  image: string;
  title: string;
  subtitle: string;
  ctaText: string;
  ctaLink: string;
  order: number;
  enabled: boolean;
}

// Default slides for demo - would come from API
const DEFAULT_SLIDES: HeroSlide[] = [
  {
    id: "1",
    image: "/hero-slide-1.jpg",
    title: "India's #1 Collectibles Store",
    subtitle: "Authentic Beyblades, Pokemon TCG, Yu-Gi-Oh & More",
    ctaText: "Shop Now",
    ctaLink: "/products",
    order: 1,
    enabled: true,
  },
  {
    id: "2",
    image: "/hero-slide-2.jpg",
    title: "Live Auctions Every Day",
    subtitle: "Bid on Rare & Limited Edition Items",
    ctaText: "View Auctions",
    ctaLink: "/auctions",
    order: 2,
    enabled: true,
  },
  {
    id: "3",
    image: "/hero-slide-3.jpg",
    title: "100% Authentic Products",
    subtitle: "Zero Customs Charges • Fast India Delivery",
    ctaText: "Learn More",
    ctaLink: "/about",
    order: 3,
    enabled: true,
  },
];

export default function HeroCarousel() {
  const [slides, setSlides] = useState<HeroSlide[]>(DEFAULT_SLIDES);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const enabledSlides = slides.filter((slide) => slide.enabled);

  // Fetch slides from API
  useEffect(() => {
    const fetchSlides = async () => {
      try {
        // TODO: Replace with actual API call
        // const response = await fetch('/api/admin/homepage/hero-slides');
        // const data = await response.json();
        // setSlides(data.slides || DEFAULT_SLIDES);
      } catch (error) {
        console.error("Error fetching hero slides:", error);
      }
    };

    fetchSlides();
  }, []);

  // Auto-advance slides
  useEffect(() => {
    if (!isAutoPlaying || enabledSlides.length <= 1) return;

    const interval = setInterval(() => {
      nextSlide();
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(interval);
  }, [currentSlide, isAutoPlaying, enabledSlides.length]);

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
      (prev) => (prev - 1 + enabledSlides.length) % enabledSlides.length
    );
    setTimeout(() => setIsTransitioning(false), 500);
  }, [enabledSlides.length, isTransitioning]);

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
    <div
      className="relative w-full h-[400px] md:h-[500px] lg:h-[600px] rounded-2xl overflow-hidden bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600"
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
                  <p className="text-lg md:text-xl lg:text-2xl text-gray-200 animate-fade-in-up animation-delay-200">
                    {slide.subtitle}
                  </p>

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

      {/* Navigation Arrows */}
      {enabledSlides.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            disabled={isTransitioning}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-white/90 hover:bg-white text-gray-900 p-2 md:p-3 rounded-full shadow-lg transition-all disabled:opacity-50"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <button
            onClick={nextSlide}
            disabled={isTransitioning}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-white/90 hover:bg-white text-gray-900 p-2 md:p-3 rounded-full shadow-lg transition-all disabled:opacity-50"
            aria-label="Next slide"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </>
      )}

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

      <style jsx>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out forwards;
        }

        .animation-delay-200 {
          animation-delay: 0.2s;
          opacity: 0;
        }

        .animation-delay-400 {
          animation-delay: 0.4s;
          opacity: 0;
        }
      `}</style>
    </div>
  );
}
