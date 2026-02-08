"use client";

import React from "react";
import { THEME_CONSTANTS } from "@/constants";

export interface SkeletonProps {
  variant?: "text" | "circular" | "rectangular";
  width?: string | number;
  height?: string | number;
  className?: string;
  animation?: "pulse" | "wave" | "none";
}

export default function Skeleton({
  variant = "text",
  width,
  height,
  className = "",
  animation = "pulse",
}: SkeletonProps) {
  const getVariantClasses = () => {
    switch (variant) {
      case "circular":
        return "rounded-full";
      case "rectangular":
        return "rounded";
      case "text":
      default:
        return "rounded";
    }
  };

  const getDefaultSize = () => {
    switch (variant) {
      case "circular":
        return { width: "40px", height: "40px" };
      case "rectangular":
        return { width: "100%", height: "140px" };
      case "text":
      default:
        return { width: "100%", height: "1em" };
    }
  };

  const animationClasses = {
    pulse: "animate-pulse",
    wave: "skeleton-wave",
    none: "",
  };

  const defaultSize = getDefaultSize();
  const style: React.CSSProperties = {
    width: width ?? defaultSize.width,
    height: height ?? defaultSize.height,
  };

  const { themed } = THEME_CONSTANTS;

  return (
    <>
      <div
        className={`
          ${themed.bgTertiary}
          ${getVariantClasses()}
          ${animationClasses[animation]}
          ${className}
        `}
        style={style}
        role="status"
        aria-label="Loading"
      >
        <span className="sr-only">Loading...</span>
      </div>

      {animation === "wave" && (
        <style jsx>{`
          @keyframes wave {
            0% {
              transform: translateX(-100%);
            }
            50%,
            100% {
              transform: translateX(100%);
            }
          }

          .skeleton-wave {
            position: relative;
            overflow: hidden;
          }

          .skeleton-wave::after {
            content: "";
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: linear-gradient(
              90deg,
              transparent,
              rgba(255, 255, 255, 0.5),
              transparent
            );
            animation: wave 1.5s infinite;
          }
        `}</style>
      )}
    </>
  );
}

// Convenience components for common patterns
export function SkeletonText({
  lines = 3,
  className = "",
}: {
  lines?: number;
  className?: string;
}) {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          variant="text"
          width={i === lines - 1 ? "80%" : "100%"}
        />
      ))}
    </div>
  );
}

export function SkeletonCard({ className = "" }: { className?: string }) {
  const { themed } = THEME_CONSTANTS;

  return (
    <div className={`border ${themed.border} rounded-lg p-4 ${className}`}>
      <Skeleton variant="rectangular" height="200px" className="mb-4" />
      <Skeleton variant="text" width="60%" height="24px" className="mb-2" />
      <SkeletonText lines={2} />
    </div>
  );
}

export function SkeletonAvatar({
  size = 40,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  return (
    <Skeleton
      variant="circular"
      width={size}
      height={size}
      className={className}
    />
  );
}
