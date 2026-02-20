"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useApiQuery } from "@/hooks";
import { API_ENDPOINTS, UI_LABELS, THEME_CONSTANTS } from "@/constants";
import { Button } from "@/components";
import { apiClient } from "@/lib/api-client";
import type { CarouselSlideDocument, GridCard } from "@/db/schema";

export function HeroCarousel() {
  const router = useRouter();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  const { data, isLoading } = useApiQuery<CarouselSlideDocument[]>({
    queryKey: ["carousel", "active"],
    queryFn: () => apiClient.get(API_ENDPOINTS.CAROUSEL.LIST + "?active=true"),
  });

  const slides =
    data?.filter((s) => s.active)?.sort((a, b) => a.order - b.order) || [];

  // Detect mobile on client-side
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Auto-advance carousel
  useEffect(() => {
    if (slides.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000); // 5 seconds per slide

    return () => clearInterval(interval);
  }, [slides.length]);

  if (isLoading) {
    return (
      <div
        className={`relative w-full aspect-[16/9] md:aspect-[21/9] ${THEME_CONSTANTS.themed.bgTertiary} animate-pulse`}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <p className={THEME_CONSTANTS.themed.textSecondary}>
            {UI_LABELS.LOADING.DEFAULT}
          </p>
        </div>
      </div>
    );
  }

  if (!slides || slides.length === 0) {
    return null; // Hide carousel if no slides
  }

  const slide = slides[currentSlide];

  const getBackgroundStyle = (card: GridCard) => {
    const { type, value } = card.background;

    if (type === "color") {
      return { backgroundColor: value };
    } else if (type === "gradient") {
      return { background: value };
    } else if (type === "image") {
      return {
        backgroundImage: `url(${value})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      };
    }
    return {};
  };

  const getGridPosition = (card: GridCard) => {
    const pos =
      isMobile && card.mobilePosition ? card.mobilePosition : card.gridPosition;
    const gridSize = isMobile ? 2 : 3;

    return {
      gridRow: `${pos.row} / span ${card.height}`,
      gridColumn: `${pos.col} / span ${card.width}`,
      ...(isMobile && { gridColumn: `1 / span ${gridSize}` }), // Full width on mobile
    };
  };

  return (
    <section className="relative w-full aspect-[16/9] md:aspect-[21/9] overflow-hidden">
      {/* Background Media */}
      <div className="absolute inset-0">
        {slide.media.type === "image" ? (
          <Image
            src={
              isMobile && slide.mobileMedia
                ? slide.mobileMedia.url
                : slide.media.url
            }
            alt={slide.media.alt}
            fill
            className="object-cover"
            sizes="100vw"
            priority
          />
        ) : (
          <video
            src={
              isMobile && slide.mobileMedia
                ? slide.mobileMedia.url
                : slide.media.url
            }
            poster={slide.media.thumbnail}
            className="w-full h-full object-cover"
            autoPlay
            loop
            muted
            playsInline
          />
        )}
        {/* Overlay for better card visibility */}
        <div className="absolute inset-0 bg-black/10" />
      </div>

      {/* Grid Overlay with Cards */}
      <div
        className="absolute inset-0 grid gap-2 md:gap-4 p-4 md:p-8"
        style={{
          gridTemplateRows: `repeat(${isMobile ? 2 : 3}, 1fr)`,
          gridTemplateColumns: `repeat(${isMobile ? 2 : 3}, 1fr)`,
        }}
      >
        {slide.cards.map((card) => {
          const hideText = isMobile && card.mobileHideText;

          return (
            <div
              key={card.id}
              className="relative rounded-lg overflow-hidden shadow-lg transition-transform hover:scale-105"
              style={{
                ...getGridPosition(card),
                ...getBackgroundStyle(card),
              }}
            >
              {/* Card Content */}
              {!card.isButtonOnly && (
                <div className="absolute inset-0 p-4 md:p-6 flex flex-col justify-end bg-gradient-to-t from-black/60 to-transparent">
                  {!hideText && (
                    <>
                      {card.content.subtitle && (
                        <p className="text-xs md:text-sm text-white/90 mb-1 md:mb-2">
                          {card.content.subtitle}
                        </p>
                      )}
                      {card.content.title && (
                        <h3 className="text-lg md:text-2xl lg:text-3xl font-bold text-white mb-2 md:mb-3 line-clamp-2">
                          {card.content.title}
                        </h3>
                      )}
                      {card.content.description && (
                        <p className="text-xs md:text-sm lg:text-base text-white/80 mb-3 md:mb-4 line-clamp-1 md:line-clamp-2">
                          {card.content.description}
                        </p>
                      )}
                    </>
                  )}

                  {/* Card Buttons */}
                  {card.buttons.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {card.buttons.map((btn) => (
                        <Button
                          key={btn.id}
                          variant={btn.variant}
                          size={isMobile ? "sm" : "md"}
                          onClick={() => {
                            if (btn.openInNewTab) {
                              window.open(
                                btn.link,
                                "_blank",
                                "noopener,noreferrer",
                              );
                            } else {
                              router.push(btn.link);
                            }
                          }}
                        >
                          {btn.text}
                        </Button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Button-Only Card (entire card is clickable) */}
              {card.isButtonOnly && card.buttons[0] && (
                <button
                  className="absolute inset-0 flex items-center justify-center font-semibold text-white hover:bg-black/20 transition-colors"
                  onClick={() => {
                    const btn = card.buttons[0];
                    if (btn.openInNewTab) {
                      window.open(btn.link, "_blank", "noopener,noreferrer");
                    } else {
                      router.push(btn.link);
                    }
                  }}
                >
                  <span className="text-lg md:text-2xl">
                    {card.buttons[0].text}
                  </span>
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Navigation Dots */}
      {slides.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
          {slides.map((_, index) => (
            <button
              key={index}
              className={`w-2 h-2 md:w-3 md:h-3 rounded-full transition-all ${
                index === currentSlide
                  ? "bg-white w-6 md:w-8"
                  : "bg-white/50 hover:bg-white/75"
              }`}
              onClick={() => setCurrentSlide(index)}
              aria-label={UI_LABELS.HERO_CAROUSEL.GO_TO_SLIDE(index + 1)}
            />
          ))}
        </div>
      )}

      {/* Navigation Arrows (desktop only) */}
      {slides.length > 1 && !isMobile && (
        <>
          <button
            className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/80 hover:bg-white flex items-center justify-center shadow-lg transition-all z-10"
            onClick={() =>
              setCurrentSlide(
                (prev) => (prev - 1 + slides.length) % slides.length,
              )
            }
            aria-label={UI_LABELS.HERO_CAROUSEL.PREV_SLIDE}
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <button
            className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/80 hover:bg-white flex items-center justify-center shadow-lg transition-all z-10"
            onClick={() =>
              setCurrentSlide((prev) => (prev + 1) % slides.length)
            }
            aria-label={UI_LABELS.HERO_CAROUSEL.NEXT_SLIDE}
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </>
      )}
    </section>
  );
}
