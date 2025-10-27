"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
  getBeybladeConfig,
  BEYBLADE_NAMES,
  type BeybladeConfig,
} from "@/constants/beyblades";
import { useTheme } from "@/contexts/ThemeContext";

interface SpinningBeybladeProps {
  /** Name of the beyblade to display */
  name: string;
  /** Size of the component in pixels */
  size?: number;
  /** Whether the beyblade should be spinning */
  isSpinning?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** Callback when animation starts */
  onSpinStart?: () => void;
  /** Callback when animation stops */
  onSpinStop?: () => void;
}

const SpinningBeyblade: React.FC<SpinningBeybladeProps> = ({
  name,
  size = 200,
  isSpinning = true,
  className = "",
  onSpinStart,
  onSpinStop,
}) => {
  const [config, setConfig] = useState<BeybladeConfig | null>(null);
  const [imageError, setImageError] = useState(false);
  const { theme } = useTheme();

  useEffect(() => {
    const beybladeConfig = getBeybladeConfig(name);
    setConfig(beybladeConfig);
    setImageError(false);
  }, [name]);

  useEffect(() => {
    if (isSpinning && onSpinStart) {
      onSpinStart();
    } else if (!isSpinning && onSpinStop) {
      onSpinStop();
    }
  }, [isSpinning, onSpinStart, onSpinStop]);

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
          filter: `drop-shadow(0 0 20px ${theme.colors.primary}40)`,
        }}
      >
        <Image
          src={`/assets/svg/beyblades/${config.fileName}`}
          alt={config.name}
          width={size}
          height={size}
          className="w-full h-full object-contain"
          style={{
            filter: `hue-rotate(${getHueRotation(
              theme.colors.primary
            )}deg) saturate(1.2)`,
          }}
          onError={() => setImageError(true)}
          priority
          unoptimized // Disable Next.js optimization for SVGs
        />
      </div>
    </div>
  );
};

// Helper function to calculate hue rotation based on theme color
function getHueRotation(color: string): number {
  // Extract color values and calculate hue rotation based on actual SVG colors
  const colorMap: Record<string, number> = {
    "#A39691": 30, // Dragoon GT - brown/beige
    "#149EE3": 200, // Dran Buster - blue
    "#C12514": 5, // Dranzer GT - red
    "#4C4D4C": 0, // Hell's Hammer - dark gray (no hue shift)
    "#9B9798": 0, // Meteo - silver (no hue shift)
    "#415FAD": 220, // Pegasus - blue
    "#B49331": 45, // Spriggan - gold
    "#31AED8": 190, // Valkyrie - cyan
  };

  return colorMap[color] || 0;
}

export default SpinningBeyblade;
