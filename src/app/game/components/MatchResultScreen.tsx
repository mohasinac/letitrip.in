"use client";

import React from "react";
import type { GameBeyblade } from "../types/game";

interface MatchResultScreenProps {
  winner: GameBeyblade | null;
  isPlayerWinner: boolean;
  gameTime: number;
  isMultiplayer?: boolean;
  onPlayAgain?: () => void;
  onBackToMenu: () => void;
  onPlayAgainMultiplayer?: () => void; // New: For multiplayer rematch
}

const MatchResultScreen: React.FC<MatchResultScreenProps> = ({
  winner,
  isPlayerWinner,
  gameTime,
  isMultiplayer = false,
  onPlayAgain,
  onBackToMenu,
  onPlayAgainMultiplayer,
}) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 p-6">
      <div
        className={`text-center p-8 rounded-2xl bg-white dark:bg-gray-800 border-2 max-w-md w-full ${
          isPlayerWinner
            ? "border-green-500 dark:border-green-600"
            : "border-red-500 dark:border-red-600"
        }`}
      >
        {/* Victory/Defeat Icon */}
        <div className="text-7xl mb-4">{isPlayerWinner ? "🏆" : "💔"}</div>

        {/* Result Title */}
        <h3
          className={`text-4xl md:text-5xl font-bold mb-2 ${
            isPlayerWinner
              ? "text-green-600 dark:text-green-500"
              : "text-red-600 dark:text-red-500"
          }`}
        >
          {isPlayerWinner ? "Victory!" : "Defeat!"}
        </h3>

        {/* Winner Name */}
        {winner && (
          <h5 className="text-xl md:text-2xl text-gray-900 dark:text-white mb-6">
            {winner.config.name} Wins!
          </h5>
        )}

        {/* Game Stats */}
        <div className="flex flex-col gap-2 mb-6 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
          <p className="text-gray-700 dark:text-gray-300">
            Battle Duration: {gameTime.toFixed(1)}s
          </p>
          {winner && (
            <>
              <p className="text-gray-700 dark:text-gray-300">
                Remaining Spin: {Math.floor(winner.spin)}
              </p>
              <p className="text-gray-700 dark:text-gray-300">
                Final Power: {Math.floor(winner.power || 0)}/25
              </p>
            </>
          )}
          {isMultiplayer && (
            <p className="text-blue-600 dark:text-blue-400 mt-2 font-bold text-sm">
              Online Multiplayer Match
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-4">
          {/* Play Again for Single Player */}
          {onPlayAgain && !isMultiplayer && (
            <button
              onClick={onPlayAgain}
              className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
            >
              Play Again
            </button>
          )}

          {/* Play Again for Multiplayer - Rejoin Matchmaking */}
          {isMultiplayer && onPlayAgainMultiplayer && (
            <button
              onClick={onPlayAgainMultiplayer}
              className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
            >
              🎮 Find New Opponent
            </button>
          )}

          <button
            onClick={onBackToMenu}
            className="w-full px-6 py-3 bg-transparent border-2 border-blue-600 dark:border-blue-500 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg font-medium transition-colors"
          >
            Back to Menu
          </button>
        </div>
      </div>

      {/* Encouragement Message */}
      <p className="text-sm text-gray-600 dark:text-gray-400 text-center max-w-md">
        {isPlayerWinner
          ? "Great job! Your beyblade skills are improving!"
          : "Don't give up! Try different strategies and special moves!"}
      </p>
    </div>
  );
};

export default MatchResultScreen;
