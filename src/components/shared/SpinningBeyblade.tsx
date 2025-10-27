"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
  getBeybladeConfig,
  BEYBLADE_NAMES,
  type BeybladeConfig,
} from "@/constants/beyblades";

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
        }}
      >
        <Image
          src={`/assets/svg/beyblades/${config.fileName}`}
          alt={config.name}
          width={size}
          height={size}
          className="w-full h-full object-contain drop-shadow-lg"
          onError={() => setImageError(true)}
          priority
          unoptimized // Disable Next.js optimization for SVGs
        />
      </div>
    </div>
  );
};

export default SpinningBeyblade;
