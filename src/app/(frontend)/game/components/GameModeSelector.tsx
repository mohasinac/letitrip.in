"use client";

import React from "react";
import { useRouter } from "next/navigation";

interface GameModeSelectorProps {
  onSelectMode: (mode: "1p" | "2p") => void;
}

const GameModeSelector: React.FC<GameModeSelectorProps> = ({
  onSelectMode,
}) => {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-8 p-6">
      <h3 className="text-4xl mb-4 font-bold text-center text-gray-900 dark:text-white">
        Choose Game Mode
      </h3>

      <div className="flex gap-6 flex-wrap justify-center">
        {/* Single Player */}
        <div
          className="w-80 cursor-pointer transition-all duration-300 hover:-translate-y-2 hover:shadow-xl rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800"
          onClick={() => onSelectMode("1p")}
        >
          <div className="text-center p-8">
            <div className="text-6xl mb-4">🎮</div>
            <h5 className="text-2xl mb-4 font-bold text-gray-900 dark:text-white">
              Single Player
            </h5>
            <p className="text-base text-gray-600 dark:text-gray-400 mb-6">
              Battle against AI opponent
            </p>
            <button className="w-full py-3 px-6 text-lg font-bold bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              Play vs AI
            </button>
          </div>
        </div>

        {/* Multiplayer */}
        <div
          className="w-80 cursor-pointer transition-all duration-300 hover:-translate-y-2 hover:shadow-xl rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800"
          onClick={() => onSelectMode("2p")}
        >
          <div className="text-center p-8">
            <div className="text-6xl mb-4">🌐</div>
            <h5 className="text-2xl mb-4 font-bold text-gray-900 dark:text-white">
              Multiplayer
            </h5>
            <p className="text-base text-gray-600 dark:text-gray-400 mb-6">
              Battle online with another player
            </p>
            <button className="w-full py-3 px-6 text-lg font-bold bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
              Play Online
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameModeSelector;
