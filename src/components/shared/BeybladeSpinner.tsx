"use client";

import React from "react";
import Image from "next/image";
import { useTheme } from "@/contexts/ThemeContext";

interface BeybladeSpinnerProps {
  size?: "sm" | "md" | "lg";
  color?: "blue" | "silver" | "gold";
  text?: string;
  className?: string;
  variant?: "classic" | "modern";
}

export default function BeybladeSpinner({
  size = "md",
  color,
  text,
  className = "",
  variant = "modern",
}: BeybladeSpinnerProps) {
  const { theme, currentTheme } = useTheme();

  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-16 h-16",
  };

  const textSizeClasses = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
  };

  const spinnerSize = {
    sm: 32,
    md: 48,
    lg: 64,
  };

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div
        className={`${sizeClasses[size]} relative animate-spin`}
        style={{
          animationDuration: "1.5s",
          filter: `drop-shadow(0 0 15px ${theme.colors.primary}60)`,
        }}
      >
        {/* Use the current theme's Beyblade SVG */}
        <Image
          src={`/assets/svg/beyblades/${theme.svgFile}`}
          alt={`${theme.name} spinner`}
          width={spinnerSize[size]}
          height={spinnerSize[size]}
          className="w-full h-full object-contain"
          style={{
            filter: `saturate(1.3) brightness(1.1)`,
          }}
          unoptimized
        />

        {/* Optional glowing ring effect */}
        <div
          className="absolute inset-0 rounded-full border-2 opacity-30"
          style={{
            borderColor: theme.colors.secondary,
            boxShadow: `0 0 20px ${theme.colors.accent}40`,
          }}
        />
      </div>

      {text && (
        <p
          className={`mt-3 font-medium ${textSizeClasses[size]}`}
          style={{ color: theme.colors.text }}
        >
          {text}
        </p>
      )}
    </div>
  );
}

// Themed inline spinner for buttons
export function InlineBeybladeSpinner({
  size = "sm",
}: Pick<BeybladeSpinnerProps, "size">) {
  const { theme } = useTheme();

  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  };

  const spinnerSize = {
    sm: 16,
    md: 20,
    lg: 24,
  };

  return (
    <div
      className={`${sizeClasses[size]} animate-spin`}
      style={{
        animationDuration: "1s",
        filter: `drop-shadow(0 0 8px ${theme.colors.primary}40)`,
      }}
    >
      <Image
        src={`/assets/svg/beyblades/${theme.svgFile}`}
        alt="Loading"
        width={spinnerSize[size]}
        height={spinnerSize[size]}
        className="w-full h-full object-contain"
        unoptimized
      />
    </div>
  );
}

// Themed full page loading overlay
export function BeybladeLoadingOverlay({
  text = "Loading...",
}: {
  text?: string;
}) {
  const { theme } = useTheme();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm">
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(45deg, ${theme.colors.background}80, ${theme.colors.primary}10)`,
        }}
      />
      <div
        className="relative bg-white/90 backdrop-blur-md rounded-xl p-8 max-w-sm mx-4 border"
        style={{
          borderColor: theme.colors.accent,
          boxShadow: `0 20px 40px ${theme.colors.primary}20`,
        }}
      >
        <BeybladeSpinner size="lg" text={text} className="text-center" />
      </div>
    </div>
  );
}
