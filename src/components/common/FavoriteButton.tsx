"use client";

import { useAuth } from "@/contexts/AuthContext";
import { logError } from "@/lib/firebase-error-logger";
import { Heart } from "lucide-react";
import { useState } from "react";

interface FavoriteButtonProps {
  itemId: string;
  itemType: "product" | "shop" | "category" | "auction";
  initialIsFavorite?: boolean;
  onToggle?: (isFavorite: boolean) => void;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function FavoriteButton({
  itemId,
  itemType,
  initialIsFavorite = false,
  onToggle,
  size = "md",
  className = "",
}: FavoriteButtonProps) {
  const { user } = useAuth();
  const [isFavorite, setIsFavorite] = useState(initialIsFavorite);
  const [isLoading, setIsLoading] = useState(false);

  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  };

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      // Redirect to login or show auth modal
      if (globalThis.location) {
        globalThis.location.href =
          "/auth/login?redirect=" + globalThis.location.pathname;
      }
      return;
    }

    if (isLoading) return;

    try {
      setIsLoading(true);

      const endpoint = `/api/favorites/${itemType}/${itemId}`;
      const method = isFavorite ? "DELETE" : "POST";

      const response = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        throw new Error("Failed to toggle favorite");
      }

      setIsFavorite(!isFavorite);
      onToggle?.(!isFavorite);
    } catch (error) {
      logError(error as Error, {
        component: "FavoriteButton.handleToggle",
        metadata: { itemType, itemId },
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleToggle}
      disabled={isLoading}
      className={`
        group relative inline-flex items-center justify-center
        rounded-full transition-all duration-200
        hover:bg-gray-100 active:scale-95
        disabled:opacity-50 disabled:cursor-not-allowed
        ${className}
      `}
      title={isFavorite ? "Remove from favorites" : "Add to favorites"}
      aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
    >
      <Heart
        className={`
          ${sizeClasses[size]}
          transition-all duration-200
          ${
            isFavorite
              ? "fill-red-500 text-red-500"
              : "text-gray-400 group-hover:text-red-400"
          }
          ${isLoading ? "animate-pulse" : ""}
        `}
      />
    </button>
  );
}
