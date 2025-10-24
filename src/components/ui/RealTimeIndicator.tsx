"use client";

import { useState, useEffect } from "react";

interface RealTimeIndicatorProps {
  isConnected: boolean;
  className?: string;
  showText?: boolean;
  size?: "sm" | "md" | "lg";
}

export default function RealTimeIndicator({
  isConnected,
  className = "",
  showText = false,
  size = "sm",
}: RealTimeIndicatorProps) {
  const [pulseKey, setPulseKey] = useState(0);

  useEffect(() => {
    if (isConnected) {
      setPulseKey((prev) => prev + 1);
    }
  }, [isConnected]);

  const sizeClasses = {
    sm: "w-2 h-2",
    md: "w-3 h-3",
    lg: "w-4 h-4",
  };

  const textSizeClasses = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
  };

  return (
    <div className={`flex items-center ${className}`}>
      <div className={`relative ${sizeClasses[size]}`}>
        <div
          className={`absolute inset-0 rounded-full ${
            isConnected ? "bg-green-400 animate-ping" : "bg-red-400"
          }`}
          key={pulseKey}
        />
        <div
          className={`relative ${sizeClasses[size]} rounded-full ${
            isConnected ? "bg-green-500" : "bg-red-500"
          }`}
        />
      </div>
      {showText && (
        <span
          className={`ml-1 ${textSizeClasses[size]} ${
            isConnected ? "text-green-700" : "text-red-700"
          }`}
        >
          {isConnected ? "Live" : "Offline"}
        </span>
      )}
    </div>
  );
}
