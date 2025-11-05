/**
 * Game Layout Component
 * Shared layout for all game pages
 */

"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export interface GameLayoutProps {
  children: React.ReactNode;
  backLink?: string;
  backLabel?: string;
  showBack?: boolean;
}

export function GameLayout({
  children,
  backLink = "/game",
  backLabel = "Back",
  showBack = true,
}: GameLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900/20 to-gray-900">
      {showBack && (
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

      <div className="relative">{children}</div>
    </div>
  );
}

export default GameLayout;
