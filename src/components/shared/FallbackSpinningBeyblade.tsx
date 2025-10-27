"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { getBeybladeConfig, type BeybladeConfig } from "@/constants/beyblades";
import { useTheme } from "@/contexts/ThemeContext";

interface FallbackSpinningBeybladeProps {
  /** Name of the beyblade to display */
  name: string;
  /** Size of the component in pixels */
  size?: number;
  /** Whether the beyblade should be spinning */
  isSpinning?: boolean;
  /** Additional CSS classes */
  className?: string;
}

const FallbackSpinningBeyblade: React.FC<FallbackSpinningBeybladeProps> = ({
  name,
  size = 200,
  isSpinning = true,
  className = "",
}) => {
  const [config, setConfig] = useState<BeybladeConfig | null>(null);
  const [imageError, setImageError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState<string>("");
  const [attemptCount, setAttemptCount] = useState(0);
  const { theme } = useTheme();

  useEffect(() => {
    const beybladeConfig = getBeybladeConfig(name);
    setConfig(beybladeConfig);
    setImageError(false);
    setAttemptCount(0);

    if (beybladeConfig) {
      // Try API route first
      setCurrentSrc(`/api/beyblades/${beybladeConfig.fileName}`);
    }
  }, [name]);

  const handleImageError = () => {
    if (!config) return;

    if (attemptCount === 0) {
      // First fallback: try public directory
      setCurrentSrc(`/assets/svg/beyblades/${config.fileName}`);
      setAttemptCount(1);
    } else if (attemptCount === 1) {
      // Second fallback: try direct src path (for development)
      setCurrentSrc(`/src/assets/svg/beyblades/${config.fileName}`);
      setAttemptCount(2);
    } else {
      // All attempts failed
      setImageError(true);
    }
  };

  if (!config) {
    return (
      <div
        className={`flex items-center justify-center bg-gray-100 rounded-full ${className}`}
        style={{ width: size, height: size }}
      >
        <span className="text-gray-500 text-sm">Invalid Beyblade</span>
      </div>
    );
  }

  if (imageError) {
    return (
      <div
        className={`flex items-center justify-center bg-gray-100 rounded-full ${className}`}
        style={{ width: size, height: size }}
      >
        <span className="text-gray-500 text-sm">Image Error</span>
        <div className="text-xs text-gray-400 mt-1">
          Tried: API → Public → Direct
        </div>
      </div>
    );
  }

  const animationDirection = config.direction === "left" ? "reverse" : "normal";
  const animationDuration = `${2 / config.speed}s`;

  return (
    <div
      className={`inline-block ${className}`}
      style={{ width: size, height: size }}
    >
      <div
        className={`w-full h-full transition-all duration-300 ${
          isSpinning ? "animate-spin" : ""
        } hover-glow`}
        style={{
          animationDirection,
          animationDuration: isSpinning ? animationDuration : undefined,
          animationIterationCount: isSpinning ? "infinite" : undefined,
          animationTimingFunction: "linear",
          filter: `drop-shadow(0 0 15px ${theme.colors.primary}40)`,
        }}
      >
        <Image
          src={currentSrc}
          alt={config.name}
          width={size}
          height={size}
          className="w-full h-full object-contain"
          style={{
            filter: `saturate(1.2) brightness(1.1)`,
          }}
          onError={handleImageError}
          priority
          unoptimized // Disable Next.js optimization for SVGs
        />
      </div>
      <div
        className="text-xs text-center mt-1"
        style={{ color: theme.colors.muted }}
      >
        Source:{" "}
        {attemptCount === 0 ? "API" : attemptCount === 1 ? "Public" : "Direct"}
      </div>
    </div>
  );
};

export default FallbackSpinningBeyblade;
