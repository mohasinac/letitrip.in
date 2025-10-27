"use client";

import React from "react";
import { useTheme } from "@/contexts/ThemeContext";
import SpinningBeyblade from "./SpinningBeyblade";

interface ThemedLoadingSpinnerProps {
  size?: number;
  showText?: boolean;
  text?: string;
  className?: string;
}

export default function ThemedLoadingSpinner({
  size = 120,
  showText = true,
  text = "Loading...",
  className = "",
}: ThemedLoadingSpinnerProps) {
  const { theme, currentTheme } = useTheme();

  // Map theme to appropriate beyblade
  const getBeybladeForTheme = () => {
    const themeToBeyblade: Record<string, string> = {
      "dragoon-gt": "dragoon GT",
      "dran-buster": "dran buster",
      "dranzer-gt": "dranzer GT",
      "hells-hammer": "hells hammer",
      meteo: "meteo",
      pegasus: "pegasus",
      spriggan: "spriggan",
      valkyrie: "valkyrie",
    };

    return themeToBeyblade[currentTheme] || "dragoon GT";
  };

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      {/* Themed Spinning Beyblade */}
      <div className="relative">
        <SpinningBeyblade
          name={getBeybladeForTheme()}
          size={size}
          isSpinning={true}
          className="animate-pulse"
        />

        {/* Animated ring around the beyblade */}
        <div
          className="absolute inset-0 rounded-full animate-spin"
          style={{
            background: `conic-gradient(from 0deg, transparent, ${theme.colors.primary}40, transparent)`,
            animation: "spin 2s linear infinite",
          }}
        />
        <div
          className="absolute inset-2 rounded-full bg-white"
          style={{
            background: theme.colors.background,
          }}
        />
        <div className="absolute inset-2">
          <SpinningBeyblade
            name={getBeybladeForTheme()}
            size={size - 16}
            isSpinning={true}
          />
        </div>
      </div>

      {/* Loading Text */}
      {showText && (
        <div className="mt-4 text-center">
          <p
            className="text-lg font-medium animate-pulse"
            style={{ color: theme.colors.primary }}
          >
            {text}
          </p>
          <div className="flex justify-center mt-2">
            <div className="flex space-x-1">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="w-2 h-2 rounded-full animate-bounce"
                  style={{
                    backgroundColor: theme.colors.secondary,
                    animationDelay: `${i * 0.1}s`,
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
