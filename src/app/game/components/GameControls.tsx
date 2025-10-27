"use client";

import React from "react";
import { useTheme } from "@/contexts/ThemeContext";

interface GameControlsProps {
  isPlaying: boolean;
  playerBeyblade: string;
  aiBeyblade: string;
  onPlayerBeybladeChange: (beyblade: string) => void;
  onAIBeybladeChange: (beyblade: string) => void;
  onRestart: () => void;
  availableBeyblades: Record<string, { name: string }>;
  className?: string;
}

const GameControls: React.FC<GameControlsProps> = ({
  isPlaying,
  playerBeyblade,
  aiBeyblade,
  onPlayerBeybladeChange,
  onAIBeybladeChange,
  onRestart,
  availableBeyblades,
  className = "",
}) => {
  const { theme } = useTheme();

  return (
    <div
      className={`flex flex-col sm:flex-row items-center justify-center gap-6 ${className}`}
    >
      {/* Player Beyblade Selection */}
      <div className="flex flex-col items-center">
        <label
          className="text-sm font-medium mb-2 transition-colors"
          style={{ color: theme.colors.text }}
        >
          Your Beyblade
        </label>
        <select
          value={playerBeyblade}
          onChange={(e) => onPlayerBeybladeChange(e.target.value)}
          disabled={isPlaying}
          className="px-4 py-2 rounded-lg shadow-sm font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed min-w-[150px]"
          style={{
            backgroundColor: theme.colors.background,
            borderColor: theme.colors.primary,
            color: theme.colors.text,
            borderWidth: "2px",
          }}
        >
          {Object.entries(availableBeyblades).map(([key, config]) => (
            <option key={key} value={key}>
              {config.name}
            </option>
          ))}
        </select>
      </div>

      {/* Restart Button */}
      <div className="flex flex-col items-center">
        <div className="h-6 mb-2"></div> {/* Spacer to align with selects */}
        <button
          onClick={onRestart}
          className="px-8 py-3 rounded-lg font-bold text-white shadow-lg transition-all duration-200 hover:shadow-xl transform hover:scale-105 active:scale-95 min-w-[150px]"
          style={{
            backgroundColor: theme.colors.primary,
            boxShadow: `0 4px 15px ${theme.colors.primary}40`,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = theme.colors.secondary;
            e.currentTarget.style.boxShadow = `0 6px 20px ${theme.colors.secondary}60`;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = theme.colors.primary;
            e.currentTarget.style.boxShadow = `0 4px 15px ${theme.colors.primary}40`;
          }}
        >
          {isPlaying ? "Restart Battle" : "New Battle"}
        </button>
      </div>

      {/* AI Beyblade Selection */}
      <div className="flex flex-col items-center">
        <label
          className="text-sm font-medium mb-2 transition-colors"
          style={{ color: theme.colors.text }}
        >
          AI Opponent
        </label>
        <select
          value={aiBeyblade}
          onChange={(e) => onAIBeybladeChange(e.target.value)}
          disabled={isPlaying}
          className="px-4 py-2 rounded-lg shadow-sm font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed min-w-[150px]"
          style={{
            backgroundColor: theme.colors.background,
            borderColor: theme.colors.secondary,
            color: theme.colors.text,
            borderWidth: "2px",
          }}
        >
          {Object.entries(availableBeyblades).map(([key, config]) => (
            <option key={key} value={key}>
              {config.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default GameControls;
