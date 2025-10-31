"use client";

import React from "react";
import Link from "next/link";
import { useBreadcrumbTracker } from "@/hooks/useBreadcrumbTracker";

export default function GamePage() {
  // Add breadcrumb
  useBreadcrumbTracker([
    {
      label: "Games",
      href: "/game",
      active: true,
    },
  ]);

  return (
    <div>
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-600 to-blue-800 dark:from-blue-700 dark:to-blue-900 py-16 md:py-24 text-white">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 text-white">
              🌪️ Game Hub
            </h1>
            <p className="text-lg md:text-xl max-w-3xl mx-auto text-white/90">
              Welcome to the ultimate gaming experience! Choose your adventure
              and dive into exciting gameplay.
            </p>
          </div>
        </div>
      </div>

      {/* Game Selection */}
      <div className="py-16 bg-gray-50 dark:bg-gray-950">
        <div className="container mx-auto px-4 max-w-6xl">
          <Link
            href="/game/beyblade-battle"
            className="block text-center rounded-2xl bg-white dark:bg-gray-900 border-4 border-blue-600 dark:border-blue-500 no-underline cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-2xl"
          >
            <div className="p-12">
              <div className="text-8xl mb-8">⚡</div>
              <h3 className="text-4xl text-blue-600 dark:text-blue-400 font-bold mb-4">
                Beyblade Battle Arena
              </h3>
              <p className="text-base leading-relaxed mb-8 opacity-90 text-gray-700 dark:text-gray-300">
                Real-time Beyblade battles with advanced physics, collision
                mechanics, and strategic gameplay. Battle against AI with charge
                points, speed zones, and mobile controls!
              </p>

              {/* Feature highlights */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {[
                  { icon: "🎮", text: "Real-time Control" },
                  { icon: "🌀", text: "Physics Engine" },
                  { icon: "📱", text: "Mobile Friendly" },
                  { icon: "🤖", text: "Smart AI" },
                ].map((feature, index) => (
                  <div
                    key={index}
                    className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800 border-2 border-blue-600/25"
                  >
                    <div className="text-4xl mb-2">{feature.icon}</div>
                    <p className="text-xs font-semibold text-gray-900 dark:text-white">
                      {feature.text}
                    </p>
                  </div>
                ))}
              </div>

              <button className="px-8 py-3 text-lg font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-xl transition-all">
                Play Now →
              </button>
            </div>
          </Link>

          {/* Coming Soon Games */}
          <div className="mt-16 text-center">
            <h4 className="text-3xl font-semibold mb-4 text-gray-900 dark:text-white">
              🚀 More Games Coming Soon
            </h4>
            <p className="text-base mb-8 text-gray-600 dark:text-gray-400">
              More exciting games are in development!
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  icon: "🏁",
                  title: "Racing Challenge",
                  desc: "High-speed racing action",
                },
                {
                  icon: "🎯",
                  title: "Precision Strike",
                  desc: "Test your accuracy skills",
                },
                {
                  icon: "🧩",
                  title: "Puzzle Master",
                  desc: "Brain-bending challenges",
                },
              ].map((game, index) => (
                <div
                  key={index}
                  className="rounded-2xl opacity-70 bg-white dark:bg-gray-900 border-2 border-dashed border-blue-600/25 text-center"
                >
                  <div className="p-8">
                    <div className="text-6xl mb-4">{game.icon}</div>
                    <h6 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
                      {game.title}
                    </h6>
                    <p className="text-sm mb-4 text-gray-600 dark:text-gray-400">
                      {game.desc}
                    </p>
                    <p className="text-xs text-blue-600 dark:text-blue-400 font-semibold">
                      Coming Soon...
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
