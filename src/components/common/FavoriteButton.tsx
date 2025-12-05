/**
 * @fileoverview React Component
 * @module src/components/common/FavoriteButton
 * @description This file contains the FavoriteButton component and its related functionality
 * 
 * @created 2025-12-05
 * @author mohasinac
 * @see {@link https://mohasin.chinnapattan.com}
 */

"use client";

import { useAuth } from "@/contexts/AuthContext";
import { logError } from "@/lib/firebase-error-logger";
import { Heart } from "lucide-react";
import { useState } from "react";

/**
 * FavoriteButtonProps interface
 * 
 * @interface
 * @description Defines the structure and contract for FavoriteButtonProps
 */
interface FavoriteButtonProps {
  /** Item Id */
  itemId: string;
  /** Item Type */
  itemType: "product" | "shop" | "category" | "auction";
  /** Initial Is Favorite */
  initialIsFavorite?: boolean;
  /** On Toggle */
  onToggle?: (isFavorite: boolean) => void;
  /** Size */
  size?: "sm" | "md" | "lg";
  /** Class Name */
  className?: string;
}

/**
 * Function: Favorite Button
 */
/**
 * Performs favorite button operation
 *
 * @returns {any} The favoritebutton result
 *
 * @example
 * FavoriteButton();
 */

/**
 * Performs favorite button operation
 *
 * @returns {any} The favoritebutton result
 *
 * @example
 * FavoriteButton();
 */

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
    /** Sm */
    sm: "w-4 h-4",
    /** Md */
    md: "w-5 h-5",
    /** Lg */
    lg: "w-6 h-6",
  };

  /**
   * Performs async operation
   *
   * @param {React.MouseEvent} e - The e
   *
   * @returns {Promise<any>} Promise resolving to async  result
   *
   * @throws {Error} When operation fails or validation errors occur
   */

  /**
   * Performs async operation
   *
   * @param {React.MouseEvent} e - The e
   *
   * @returns {Promise<any>} Promise resolving to async  result
   *
   * @throws {Error} When operation fails or validation errors occur
   */

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
        /** Headers */
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        throw new Error("Failed to toggle favorite");
      }

      setIsFavorite(!isFavorite);
      onToggle?.(!isFavorite);
    } catch (error) {
      logError(error as Error, {
        /** Component */
        component: "FavoriteButton.handleToggle",
        /** Metadata */
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
        /** Hover */
        hover:bg-gray-100 active:scale-95
        /** Disabled */
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
