"use client";

import React from "react";
import { useTheme } from "@/contexts/ThemeContext";
import EnhancedBeybladeArena from "../components/EnhancedBeybladeArena";

export default function BeybladeGamePage() {
  const { theme } = useTheme();

  return (
    <div
      className="min-h-screen py-8 transition-all duration-300"
      style={{
        background: `linear-gradient(135deg, ${theme.colors.background} 0%, ${theme.colors.accent}20 50%, ${theme.colors.primary}10 100%)`,
      }}
    >
      <div className="container mx-auto px-4">
        {/* Header Section */}
        <div className="text-center mb-8">
          <h1
            className="text-4xl font-bold mb-4"
            style={{ color: theme.colors.text }}
          >
            🌪️ Beyblade Battle Arena
          </h1>
          <p
            className="text-lg max-w-2xl mx-auto leading-relaxed"
            style={{ color: theme.colors.muted }}
          >
            Real-time Beyblade battles! Control your Beyblade with your mouse
            while the AI pursues you. Both start with 100% spin - collisions
            reduce spin until one Beyblade remains!
          </p>
        </div>

        {/* Main Game Arena */}
        <div className="flex justify-center mb-12">
          <EnhancedBeybladeArena />
        </div>

        {/* Game Information Cards */}
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Game Features Card */}
            <div
              className="rounded-xl p-6 shadow-lg transition-all duration-200 hover:scale-105"
              style={{
                backgroundColor: theme.colors.background,
                borderColor: theme.colors.primary,
                borderWidth: "2px",
              }}
            >
              <h2
                className="text-2xl font-semibold mb-4 flex items-center"
                style={{ color: theme.colors.text }}
              >
                <span className="mr-3">⚡</span>
                Game Features
              </h2>
              <ul className="space-y-3">
                {[
                  {
                    icon: "🎮",
                    title: "Real-time Control",
                    desc: "Mouse movement controls your Beyblade instantly",
                  },
                  {
                    icon: "🌀",
                    title: "Spin Mechanics",
                    desc: "Both start at 100% spin, decay over time",
                  },
                  {
                    icon: "💥",
                    title: "Collision Physics",
                    desc: "Every hit reduces spin for both Beyblades",
                  },
                  {
                    icon: "🏟️",
                    title: "Stadium Boundaries",
                    desc: "Ring-out victories possible",
                  },
                  {
                    icon: "🤖",
                    title: "AI Opponent",
                    desc: "Intelligent enemy that hunts you down",
                  },
                ].map((feature, index) => (
                  <li key={index} className="flex items-start space-x-3">
                    <span className="text-xl flex-shrink-0">
                      {feature.icon}
                    </span>
                    <div>
                      <strong style={{ color: theme.colors.text }}>
                        {feature.title}:
                      </strong>
                      <span style={{ color: theme.colors.muted }}>
                        {" "}
                        {feature.desc}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* Strategy Tips Card */}
            <div
              className="rounded-xl p-6 shadow-lg transition-all duration-200 hover:scale-105"
              style={{
                backgroundColor: theme.colors.background,
                borderColor: theme.colors.secondary,
                borderWidth: "2px",
              }}
            >
              <h2
                className="text-2xl font-semibold mb-4 flex items-center"
                style={{ color: theme.colors.text }}
              >
                <span className="mr-3">🧠</span>
                Strategy Tips
              </h2>
              <ul className="space-y-3">
                {[
                  {
                    icon: "🏃",
                    title: "Stay Mobile",
                    desc: "Keep moving to avoid AI attacks",
                  },
                  {
                    icon: "🎯",
                    title: "Strategic Collisions",
                    desc: "Time your hits when enemy has low spin",
                  },
                  {
                    icon: "📍",
                    title: "Positioning",
                    desc: "Use stadium edges to your advantage",
                  },
                  {
                    icon: "⚖️",
                    title: "Spin Management",
                    desc: "Avoid unnecessary collisions early on",
                  },
                  {
                    icon: "🏁",
                    title: "Endgame",
                    desc: "Low spin makes you vulnerable to ring-outs",
                  },
                ].map((tip, index) => (
                  <li key={index} className="flex items-start space-x-3">
                    <span className="text-xl flex-shrink-0">{tip.icon}</span>
                    <div>
                      <strong style={{ color: theme.colors.text }}>
                        {tip.title}:
                      </strong>
                      <span style={{ color: theme.colors.muted }}>
                        {" "}
                        {tip.desc}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Advanced Mechanics Section */}
          <div
            className="mt-8 rounded-xl p-6 shadow-lg"
            style={{
              backgroundColor: `${theme.colors.accent}20`,
              borderColor: theme.colors.accent,
              borderWidth: "2px",
            }}
          >
            <h2
              className="text-2xl font-semibold mb-6 text-center flex items-center justify-center"
              style={{ color: theme.colors.text }}
            >
              <span className="mr-3">🔬</span>
              Advanced Battle Mechanics
            </h2>

            <div className="grid md:grid-cols-3 gap-6">
              {/* Blue Zone */}
              <div
                className="p-4 rounded-lg"
                style={{ backgroundColor: `${theme.colors.primary}20` }}
              >
                <h3
                  className="font-bold mb-2 flex items-center"
                  style={{ color: theme.colors.primary }}
                >
                  <span className="mr-2">🔵</span>
                  Blue Speed Zone
                </h3>
                <p style={{ color: theme.colors.text }} className="text-sm">
                  Triggers a mandatory 1-second loop with 2× acceleration.
                  Player retains control, AI loses control. 3-second cooldown
                  after each loop.
                </p>
              </div>

              {/* Red Zones */}
              <div
                className="p-4 rounded-lg"
                style={{ backgroundColor: `${theme.colors.secondary}20` }}
              >
                <h3
                  className="font-bold mb-2 flex items-center"
                  style={{ color: theme.colors.secondary }}
                >
                  <span className="mr-2">🔴</span>
                  Wall Zones
                </h3>
                <p style={{ color: theme.colors.text }} className="text-sm">
                  Angles 0-60°, 120-180°, 240-300°. Collision causes spin loss
                  (10 + acceleration) and respawn inside blue circle.
                </p>
              </div>

              {/* Yellow Zones */}
              <div
                className="p-4 rounded-lg"
                style={{ backgroundColor: "#F59E0B20" }}
              >
                <h3
                  className="font-bold mb-2 flex items-center"
                  style={{ color: "#F59E0B" }}
                >
                  <span className="mr-2">🟡</span>
                  Exit Zones
                </h3>
                <p style={{ color: theme.colors.text }} className="text-sm">
                  Angles 60-120°, 180-240°, 300-360°. Cross these boundaries and
                  it's game over - instant elimination!
                </p>
              </div>
            </div>

            {/* Collision Damage */}
            <div className="mt-6 grid md:grid-cols-2 gap-6">
              <div
                className="p-4 rounded-lg"
                style={{ backgroundColor: `${theme.colors.primary}15` }}
              >
                <h3
                  className="font-bold mb-2"
                  style={{ color: theme.colors.text }}
                >
                  ⚡ Same Spin Collision
                </h3>
                <p style={{ color: theme.colors.muted }} className="text-sm">
                  Damage = |acceleration difference| + other Beyblade's
                  acceleration
                </p>
              </div>

              <div
                className="p-4 rounded-lg"
                style={{ backgroundColor: `${theme.colors.secondary}15` }}
              >
                <h3
                  className="font-bold mb-2"
                  style={{ color: theme.colors.text }}
                >
                  💥 Opposite Spin Collision
                </h3>
                <p style={{ color: theme.colors.muted }} className="text-sm">
                  Both get average spin + their acceleration, take average
                  acceleration + other's acceleration damage
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
