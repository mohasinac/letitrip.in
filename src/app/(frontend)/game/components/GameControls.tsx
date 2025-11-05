"use client";

import React from "react";
import BeybladeSelect from "@/components/game/BeybladeSelect";
import ArenaSelect from "@/components/game/ArenaSelect";

interface GameControlsProps {
  isPlaying: boolean;
  isLoading?: boolean;
  playerBeyblade: string;
  aiBeyblade: string;
  arena?: string;
  onPlayerBeybladeChange: (beyblade: string) => void;
  onAIBeybladeChange: (beyblade: string) => void;
  onArenaChange?: (arena: string) => void;
  onRestart: () => void;
  availableBeyblades: Record<string, { name: string }>;
  className?: string;
}

const GameControls: React.FC<GameControlsProps> = ({
  isPlaying,
  isLoading = false,
  playerBeyblade,
  aiBeyblade,
  arena = "",
  onPlayerBeybladeChange,
  onAIBeybladeChange,
  onArenaChange,
  onRestart,
  availableBeyblades,
  className = "",
}) => {
  return (
    <div
      className={`flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 px-4 sm:px-0 w-full ${className}`}
    >
      {/* Player Beyblade Selection */}
      <div className="flex flex-col items-center min-w-full sm:min-w-[300px] max-w-full sm:max-w-[350px]">
        <BeybladeSelect
          value={playerBeyblade}
          onChange={onPlayerBeybladeChange}
          label="Your Beyblade"
          disabled={isPlaying}
        />
      </div>

      {/* Arena Selection */}
      {onArenaChange && (
        <div className="flex flex-col items-center min-w-full sm:min-w-[300px] max-w-full sm:max-w-[350px]">
          <ArenaSelect
            value={arena}
            onChange={onArenaChange}
            label="Battle Arena"
            disabled={isPlaying}
            showRandomButton={true}
          />
        </div>
      )}

      {/* Restart Button */}
      <div className="flex flex-col items-center min-w-full sm:min-w-[200px] max-w-full sm:max-w-[250px]">
        <button
          onClick={onRestart}
          disabled={isPlaying || isLoading}
          className={`w-full px-8 py-3 sm:py-3.5 rounded-lg font-semibold bg-blue-600 hover:bg-blue-700 text-white transition-all duration-200 shadow-lg ${
            isPlaying || isLoading
              ? "opacity-60 cursor-not-allowed"
              : "hover:scale-105 hover:shadow-xl active:scale-95"
          }`}
          style={{
            boxShadow: "0 4px 15px rgba(59, 130, 246, 0.4)",
          }}
        >
          {isLoading
            ? "Loading..."
            : isPlaying
            ? "Battle In Progress"
            : "New Battle"}
        </button>
      </div>

      {/* AI Beyblade Selection */}
      <div className="flex flex-col items-center min-w-full sm:min-w-[300px] max-w-full sm:max-w-[350px] gap-2">
        <BeybladeSelect
          value={aiBeyblade}
          onChange={onAIBeybladeChange}
          label="AI Opponent"
          disabled={isPlaying}
          showRandomButton={true}
        />
      </div>
    </div>
  );
};

export default GameControls;
