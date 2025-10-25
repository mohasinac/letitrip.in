"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import ProductCard from "@/components/products/ProductCard";

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  compareAtPrice?: number;
  image: string;
  isFeatured?: boolean;
  views?: number;
  wishlisted?: number;
}

interface ProductCarouselProps {
  products: Product[];
  displayCount?: number;
  autoPlay?: boolean;
  interval?: number;
  onQuickView?: (product: Product) => void;
  className?: string;
}

export default function ProductCarousel({
  products,
  displayCount = 3,
  autoPlay = false,
  interval = 4000,
  onQuickView,
  className = "",
}: ProductCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const maxIndex = Math.max(0, products.length - displayCount);

  useEffect(() => {
    if (!autoPlay || isPaused || maxIndex === 0) return;

    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) =>
        prevIndex >= maxIndex ? 0 : prevIndex + 1
      );
    }, interval);

    return () => clearInterval(timer);
  }, [autoPlay, interval, maxIndex, isPaused]);

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? maxIndex : prevIndex - 1
    );
  };

  const goToNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex >= maxIndex ? 0 : prevIndex + 1));
  };

  if (!products || products.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No products available</p>
      </div>
    );
  }

  return (
    <div
      className={`relative ${className}`}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Products Container */}
      <div className="overflow-hidden">
        <div
          className="flex transition-transform duration-500 ease-in-out"
          style={{
            transform: `translateX(-${(currentIndex * 100) / displayCount}%)`,
          }}
        >
          {products.map((product) => (
            <div
              key={product.id}
              className={`flex-shrink-0 px-3`}
              style={{ width: `${100 / displayCount}%` }}
            >
              <ProductCard {...product} onQuickView={onQuickView} />
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Arrows */}
      {maxIndex > 0 && (
        <>
          <button
            onClick={goToPrevious}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 p-2 rounded-full bg-white shadow-lg hover:bg-gray-50 border transition-all duration-300 hover:scale-110 z-10"
            aria-label="Previous products"
          >
            <ChevronLeftIcon className="h-5 w-5 text-gray-600" />
          </button>
          <button
            onClick={goToNext}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 p-2 rounded-full bg-white shadow-lg hover:bg-gray-50 border transition-all duration-300 hover:scale-110 z-10"
            aria-label="Next products"
          >
            <ChevronRightIcon className="h-5 w-5 text-gray-600" />
          </button>
        </>
      )}

      {/* Dots Indicator */}
      {maxIndex > 0 && (
        <div className="flex justify-center mt-6 space-x-2">
          {Array.from({ length: maxIndex + 1 }, (_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === currentIndex
                  ? "bg-primary"
                  : "bg-gray-300 hover:bg-gray-400"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
