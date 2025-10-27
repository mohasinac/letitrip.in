"use client";

import React from "react";
import { useTheme } from "@/contexts/ThemeContext";
import Link from "next/link";

export default function GamePage() {
  const { theme } = useTheme();

  return (
    <div
      className="min-h-screen py-16 transition-all duration-300"
      style={{
        background: `linear-gradient(135deg, ${theme.colors.background} 0%, ${theme.colors.accent}20 50%, ${theme.colors.primary}10 100%)`,
      }}
    >
      <div className="container mx-auto px-4 text-center">
        {/* Header Section */}
        <div className="mb-12">
          <h1
            className="text-6xl font-bold mb-6"
            style={{ color: theme.colors.text }}
          >
            🌪️ Game Hub
          </h1>
          <p
            className="text-xl max-w-3xl mx-auto leading-relaxed mb-8"
            style={{ color: theme.colors.muted }}
          >
            Welcome to the ultimate gaming experience! Choose your adventure and
            dive into exciting gameplay.
          </p>
        </div>

        {/* Game Selection */}
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-1 gap-8">
            {/* Beyblade Battle Game */}
            <Link href="/game/beyblade-battle">
              <div
                className="group rounded-2xl p-8 shadow-2xl transition-all duration-300 hover:scale-105 cursor-pointer"
                style={{
                  backgroundColor: theme.colors.background,
                  borderColor: theme.colors.primary,
                  borderWidth: "3px",
                }}
              >
                <div className="text-8xl mb-6 group-hover:scale-110 transition-transform duration-300">
                  ⚡
                </div>
                <h2
                  className="text-4xl font-bold mb-4"
                  style={{ color: theme.colors.primary }}
                >
                  Beyblade Battle Arena
                </h2>
                <p
                  className="text-lg mb-6"
                  style={{ color: theme.colors.text }}
                >
                  Real-time Beyblade battles with advanced physics, collision
                  mechanics, and strategic gameplay. Battle against AI with
                  charge points, speed zones, and mobile controls!
                </p>

                {/* Feature highlights */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  {[
                    { icon: "🎮", text: "Real-time Control" },
                    { icon: "🌀", text: "Physics Engine" },
                    { icon: "📱", text: "Mobile Friendly" },
                    { icon: "🤖", text: "Smart AI" },
                  ].map((feature, index) => (
                    <div
                      key={index}
                      className="p-3 rounded-lg"
                      style={{ backgroundColor: `${theme.colors.accent}20` }}
                    >
                      <div className="text-2xl mb-1">{feature.icon}</div>
                      <div
                        className="text-sm font-medium"
                        style={{ color: theme.colors.text }}
                      >
                        {feature.text}
                      </div>
                    </div>
                  ))}
                </div>

                <div
                  className="inline-flex items-center px-6 py-3 rounded-full font-bold text-lg transition-all duration-200 group-hover:shadow-lg"
                  style={{
                    backgroundColor: theme.colors.primary,
                    color: "#fff",
                  }}
                >
                  Play Now
                  <span className="ml-2 group-hover:translate-x-1 transition-transform duration-200">
                    →
                  </span>
                </div>
              </div>
            </Link>
          </div>

          {/* Coming Soon Section */}
          <div className="mt-12">
            <h3
              className="text-2xl font-bold mb-6"
              style={{ color: theme.colors.text }}
            >
              🚀 More Games Coming Soon
            </h3>
            <div className="grid md:grid-cols-3 gap-6">
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
                  className="p-6 rounded-xl opacity-60"
                  style={{
                    backgroundColor: `${theme.colors.muted}20`,
                    borderColor: theme.colors.muted,
                    borderWidth: "2px",
                    borderStyle: "dashed",
                  }}
                >
                  <div className="text-4xl mb-3">{game.icon}</div>
                  <h4
                    className="text-lg font-bold mb-2"
                    style={{ color: theme.colors.text }}
                  >
                    {game.title}
                  </h4>
                  <p className="text-sm" style={{ color: theme.colors.muted }}>
                    {game.desc}
                  </p>
                  <div
                    className="mt-3 text-sm font-medium"
                    style={{ color: theme.colors.accent }}
                  >
                    Coming Soon...
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
