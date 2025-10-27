"use client";

import React from "react";
import { useTheme } from "@/contexts/ThemeContext";

interface GameInstructionsProps {
  isPlaying: boolean;
  className?: string;
}

const GameInstructions: React.FC<GameInstructionsProps> = ({
  isPlaying,
  className = "",
}) => {
  const { theme } = useTheme();

  const instructions = [
    {
      icon: "🎮",
      title: "Controls",
      text: "Mouse/Touch-to-move, WASD/Arrows, or Virtual D-Pad",
    },
    {
      icon: "🔵",
      title: "Blue Zone",
      text: "Speed zone - 1-sec loop with 2×acceleration + 3-sec cooldown",
    },
    {
      icon: "🔴",
      title: "Red Zones",
      text: "Wall collision (0-60°, 120-180°, 240-300°) - lose 10+accel spin + respawn",
    },
    {
      icon: "🟡",
      title: "Yellow Zones",
      text: "Exit zones (60-120°, 180-240°, 300-360°) - cross and it's game over!",
    },
    {
      icon: "⚡",
      title: "Collision Damage",
      text: "Same spin: damage = |accel diff| + other's accel",
    },
    {
      icon: "💥",
      title: "Opposite Spin",
      text: "Both get avg spin + accel, take avg accel + other's accel damage",
    },
  ];

  if (!isPlaying) return null;

  return (
    <div
      className={`rounded-xl p-6 shadow-lg backdrop-blur-sm ${className}`}
      style={{
        backgroundColor: `${theme.colors.background}e6`,
        borderColor: theme.colors.accent,
        borderWidth: "1px",
      }}
    >
      <h3
        className="text-lg font-bold mb-4 text-center"
        style={{ color: theme.colors.text }}
      >
        Game Instructions
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {instructions.map((instruction, index) => (
          <div
            key={index}
            className="flex items-start space-x-3 p-3 rounded-lg transition-all duration-200 hover:scale-105"
            style={{
              backgroundColor: `${theme.colors.accent}40`,
            }}
          >
            <span className="text-xl flex-shrink-0">{instruction.icon}</span>
            <div>
              <h4
                className="font-semibold text-sm mb-1"
                style={{ color: theme.colors.text }}
              >
                {instruction.title}
              </h4>
              <p
                className="text-xs leading-relaxed"
                style={{ color: theme.colors.muted }}
              >
                {instruction.text}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GameInstructions;
