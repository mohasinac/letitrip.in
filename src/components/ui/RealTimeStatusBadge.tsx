"use client";

import { ReactNode } from "react";

interface RealTimeStatusBadgeProps {
  isConnected: boolean;
  isLoading?: boolean;
  lastUpdated?: Date;
  className?: string;
  children?: ReactNode;
  size?: "sm" | "md" | "lg";
}

export default function RealTimeStatusBadge({
  isConnected,
  isLoading = false,
  lastUpdated,
  className = "",
  children,
  size = "md",
}: RealTimeStatusBadgeProps) {
  const sizeClasses = {
    sm: "text-xs px-2 py-1",
    md: "text-sm px-3 py-1",
    lg: "text-base px-4 py-2",
  };

  const dotSizes = {
    sm: "w-1.5 h-1.5",
    md: "w-2 h-2",
    lg: "w-2.5 h-2.5",
  };

  const getStatus = () => {
    if (isLoading) {
      return {
        color: "bg-yellow-100 text-yellow-700 border-yellow-200",
        dotColor: "bg-yellow-400",
        text: "Updating...",
        animate: "animate-pulse",
      };
    }

    if (isConnected) {
      return {
        color: "bg-green-100 text-green-700 border-green-200",
        dotColor: "bg-green-400",
        text: "Live",
        animate: "",
      };
    }

    return {
      color: "bg-red-100 text-red-700 border-red-200",
      dotColor: "bg-red-400",
      text: "Offline",
      animate: "",
    };
  };

  const status = getStatus();

  return (
    <div
      className={`inline-flex items-center space-x-2 rounded-full border ${status.color} ${sizeClasses[size]} ${className}`}
    >
      <div
        className={`${dotSizes[size]} rounded-full ${status.dotColor} ${status.animate}`}
      ></div>
      <span className="font-medium">{children || status.text}</span>
      {lastUpdated && !isLoading && (
        <span className="text-xs opacity-75">
          • {lastUpdated.toLocaleTimeString()}
        </span>
      )}
    </div>
  );
}
