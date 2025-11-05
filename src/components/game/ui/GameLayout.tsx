/**
 * Game Layout Component
 * Shared layout for all game pages with fullscreen support
 */

"use client";

import React, { useState, useRef, useEffect, ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft, Maximize, Minimize } from "lucide-react";

export interface GameLayoutProps {
  children: ReactNode;
  backLink?: string;
  backLabel?: string;
  showBack?: boolean;
  enableFullscreen?: boolean;
  gameTitle?: string;
  onExitGame?: () => void;
  bottomInfo?: {
    left?: string;
    right?: string;
  };
}

export function GameLayout({
  children,
  backLink = "/game",
  backLabel = "Back",
  showBack = true,
  enableFullscreen = false,
  gameTitle = "Beyblade Arena",
  onExitGame,
  bottomInfo,
}: GameLayoutProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Fullscreen toggle function
  const toggleFullscreen = async () => {
    if (!containerRef.current) return;

    try {
      if (!document.fullscreenElement) {
        await containerRef.current.requestFullscreen();
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch (err) {
      console.error("Error toggling fullscreen:", err);
    }
  };

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  // Keyboard shortcut for fullscreen
  useEffect(() => {
    if (!enableFullscreen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "F11") {
        e.preventDefault();
        toggleFullscreen();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [enableFullscreen]);

  // Auto-hide controls in fullscreen
  const handleMouseMove = () => {
    if (!enableFullscreen) return;

    setShowControls(true);

    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }

    controlsTimeoutRef.current = setTimeout(() => {
      if (isFullscreen) {
        setShowControls(false);
      }
    }, 3000);
  };

  // Always show controls when not in fullscreen
  useEffect(() => {
    if (!isFullscreen) {
      setShowControls(true);
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    }
  }, [isFullscreen]);

  return (
    <div
      ref={containerRef}
      className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900/20 to-gray-900 relative"
      onMouseMove={handleMouseMove}
    >
      {/* Top Control Bar (for fullscreen mode) */}
      {enableFullscreen && (
        <div
          className={`absolute top-0 left-0 right-0 bg-gradient-to-b from-black/80 via-black/50 to-transparent p-4 transition-opacity duration-300 z-50 ${
            showControls ? "opacity-100" : "opacity-0"
          }`}
        >
          <div className="flex items-center justify-between">
            {/* Game Title */}
            <div className="text-white font-bold text-lg">{gameTitle}</div>

            {/* Control Buttons */}
            <div className="flex gap-2">
              {/* Fullscreen Toggle */}
              <button
                onClick={toggleFullscreen}
                className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all backdrop-blur-sm flex items-center justify-center"
                title={
                  isFullscreen ? "Exit Fullscreen (F11)" : "Fullscreen (F11)"
                }
              >
                {isFullscreen ? (
                  <Minimize className="w-5 h-5" />
                ) : (
                  <Maximize className="w-5 h-5" />
                )}
              </button>

              {/* Exit/Back Button */}
              {onExitGame ? (
                <button
                  onClick={onExitGame}
                  className="px-4 py-2 bg-red-500/80 hover:bg-red-500 text-white rounded-lg font-semibold transition-colors backdrop-blur-sm"
                >
                  Exit Game
                </button>
              ) : (
                showBack && (
                  <Link
                    href={backLink}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-gray-800/80 hover:bg-gray-700 text-white rounded-lg transition-colors backdrop-blur-sm"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span className="font-semibold">{backLabel}</span>
                  </Link>
                )
              )}
            </div>
          </div>
        </div>
      )}

      {/* Back Button (for non-fullscreen pages) */}
      {!enableFullscreen && showBack && (
        <div className="absolute top-4 left-4 z-50">
          <Link
            href={backLink}
            className="inline-flex items-center gap-2 bg-gray-800/90 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors backdrop-blur-sm border border-gray-700"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">{backLabel}</span>
          </Link>
        </div>
      )}

      {/* Main Content */}
      <div className="relative">{children}</div>

      {/* Center Fullscreen Button (Video Player Style) */}
      {enableFullscreen && !isFullscreen && (
        <div
          className={`fixed inset-0 flex items-center justify-center pointer-events-none transition-opacity duration-300 z-40 ${
            showControls ? "opacity-100" : "opacity-0"
          }`}
        >
          <button
            onClick={toggleFullscreen}
            className="pointer-events-auto w-20 h-20 bg-black/60 hover:bg-black/80 rounded-full flex items-center justify-center transition-all hover:scale-110 border-2 border-white/30 hover:border-white/50"
            title="Enter Fullscreen (F11)"
          >
            <Maximize className="w-10 h-10 text-white" />
          </button>
        </div>
      )}

      {/* Bottom Info Bar (for fullscreen mode) */}
      {enableFullscreen && bottomInfo && (
        <div
          className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent p-4 transition-opacity duration-300 z-50 ${
            showControls ? "opacity-100" : "opacity-0"
          }`}
        >
          <div className="flex items-center justify-between text-sm">
            <div className="text-gray-300">{bottomInfo.left || ""}</div>
            <div className="text-gray-300">
              {bottomInfo.right ||
                (isFullscreen
                  ? "Move mouse to show controls • ESC or F11 to exit fullscreen"
                  : "Press F11 or click center button for fullscreen")}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default GameLayout;
