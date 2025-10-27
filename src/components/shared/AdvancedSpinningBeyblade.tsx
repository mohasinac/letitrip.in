"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
  getBeybladeConfig,
  BEYBLADE_NAMES,
  type BeybladeConfig,
} from "@/constants/beyblades";
import { useTheme } from "@/contexts/ThemeContext";

type AnimationType = "spin" | "battle" | "pulse" | "wobble";

interface AdvancedSpinningBeybladeProps {
  /** Name of the beyblade to display */
  name: string;
  /** Size of the component in pixels */
  size?: number;
  /** Whether the beyblade should be spinning */
  isSpinning?: boolean;
  /** Type of animation */
  animationType?: AnimationType;
  /** Additional CSS classes */
  className?: string;
  /** Callback when animation starts */
  onSpinStart?: () => void;
  /** Callback when animation stops */
  onSpinStop?: () => void;
  /** Whether to show glow effect */
  showGlow?: boolean;
  /** Battle mode intensity (affects animation speed and effects) */
  battleIntensity?: number;
}

const AdvancedSpinningBeyblade: React.FC<AdvancedSpinningBeybladeProps> = ({
  name,
  size = 200,
  isSpinning = true,
  animationType = "spin",
  className = "",
  onSpinStart,
  onSpinStop,
  showGlow = false,
  battleIntensity = 1,
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

  const getAnimationClass = () => {
    if (!isSpinning) return "";

    switch (animationType) {
      case "battle":
        return "animate-spin-battle";
      case "pulse":
        return "animate-spin-pulse";
      case "wobble":
        return "animate-beyblade-wobble";
      default:
        return "animate-spin";
    }
  };

  const animationDirection = config.direction === "left" ? "reverse" : "normal";
  const baseSpeed = config.speed * battleIntensity;
  const animationDuration = `${2 / baseSpeed}s`;

  const containerClasses = [
    "inline-block",
    "transition-all duration-300",
    showGlow && isSpinning ? "animate-glow" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const spinnerClasses = [
    "w-full h-full transition-all duration-300",
    getAnimationClass(),
    isSpinning ? "hover-glow" : "",
    battleIntensity > 1.5 ? "drop-shadow-2xl" : "drop-shadow-lg",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={containerClasses} style={{ width: size, height: size }}>
      {showGlow && isSpinning && (
        <div
          className="absolute rounded-full blur-xl opacity-75 animate-pulse"
          style={{
            width: size * 1.2,
            height: size * 1.2,
            background: `radial-gradient(circle, ${theme.colors.primary} 0%, ${theme.colors.secondary}40 50%, transparent 70%)`,
            left: "50%",
            top: "50%",
            transform: "translate(-50%, -50%)",
            zIndex: -1,
          }}
        />
      )}
      <div
        className={spinnerClasses}
        style={{
          animationDirection,
          animationDuration: isSpinning ? animationDuration : undefined,
          animationIterationCount: isSpinning ? "infinite" : undefined,
          animationTimingFunction:
            animationType === "battle"
              ? "cubic-bezier(0.25, 0.46, 0.45, 0.94)"
              : "linear",
          filter: `drop-shadow(0 0 ${battleIntensity > 1.5 ? "25px" : "15px"} ${
            theme.colors.accent
          }60)`,
        }}
      >
        <Image
          src={`/assets/svg/beyblades/${config.fileName}`}
          alt={config.name}
          width={size}
          height={size}
          className="w-full h-full object-contain"
          style={{
            filter: `saturate(${1 + battleIntensity * 0.2}) brightness(${
              1 + battleIntensity * 0.1
            })`,
          }}
          onError={() => setImageError(true)}
          priority
          unoptimized // Disable Next.js optimization for SVGs
        />
      </div>
    </div>
  );
};

export default AdvancedSpinningBeyblade;
