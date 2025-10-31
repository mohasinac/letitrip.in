"use client";

import React from "react";

interface GameInstructionsProps {
  isPlaying: boolean;
  className?: string;
}

const GameInstructions: React.FC<GameInstructionsProps> = ({
  isPlaying,
  className = "",
}) => {
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
      className={`rounded-xl p-6 shadow-lg backdrop-blur-sm bg-white dark:bg-gray-800 border-2 border-purple-500 dark:border-purple-600 ${className}`}
    >
      <h3 className="text-lg font-bold mb-4 text-center text-gray-900 dark:text-white">
        Game Instructions
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {instructions.map((instruction, index) => (
          <div
            key={index}
            className="flex items-start space-x-3 p-3 rounded-lg transition-all duration-200 hover:scale-105 bg-blue-500/10 dark:bg-blue-600/10"
          >
            <span className="text-xl flex-shrink-0">{instruction.icon}</span>
            <div>
              <h4 className="font-semibold text-sm mb-1 text-white">
                {instruction.title}
              </h4>
              <p className="text-xs leading-relaxed text-gray-300">
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
