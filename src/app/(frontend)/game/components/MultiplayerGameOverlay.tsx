"use client";

import React from "react";

interface MultiplayerGameOverlayProps {
  isMultiplayer: boolean;
  isGameOver: boolean;
  winner: any;
  isPlayerWinner: boolean;
  onQuit: () => void;
  onRematch: () => void;
  opponentWantsRematch: boolean;
  playerWantsRematch: boolean;
}

const MultiplayerGameOverlay: React.FC<MultiplayerGameOverlayProps> = ({
  isMultiplayer,
  isGameOver,
  winner,
  isPlayerWinner,
  onQuit,
  onRematch,
  opponentWantsRematch,
  playerWantsRematch,
}) => {
  // Only show in multiplayer mode when game is over
  if (!isMultiplayer || !isGameOver || !winner) {
    return null;
  }

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/75 z-[1000] pointer-events-auto">
      {/* Game Over Message */}
      <h3
        className={`text-4xl sm:text-5xl font-bold mb-4 ${
          isPlayerWinner ? "text-green-500" : "text-red-500"
        }`}
        style={{ textShadow: "0 4px 10px rgba(0, 0, 0, 0.5)" }}
      >
        {isPlayerWinner ? "🎉 Victory!" : "💥 Defeat"}
      </h3>

      {/* Winner Name */}
      <h5 className="text-xl sm:text-2xl text-white mb-8">
        {winner.name} Wins!
      </h5>

      {/* Rematch Status */}
      {(playerWantsRematch || opponentWantsRematch) && (
        <p className="text-lg sm:text-xl text-yellow-400 mb-6 font-semibold">
          {playerWantsRematch && opponentWantsRematch
            ? "⏳ Starting rematch..."
            : playerWantsRematch
            ? "⏳ Waiting for opponent..."
            : "⏳ Opponent wants a rematch!"}
        </p>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-6 w-4/5 sm:w-auto">
        {/* Play Again Button */}
        <button
          onClick={onRematch}
          disabled={playerWantsRematch}
          className={`px-10 py-3 text-lg font-bold rounded-lg shadow-lg transition-all duration-200 ${
            playerWantsRematch
              ? "bg-gray-600 cursor-not-allowed"
              : "bg-green-500 hover:bg-green-600 hover:scale-105 hover:shadow-xl active:scale-95"
          }`}
          style={{
            boxShadow: playerWantsRematch
              ? "none"
              : "0 4px 15px rgba(76, 175, 80, 0.4)",
          }}
        >
          {playerWantsRematch ? "✓ Ready for Rematch" : "🔄 Play Again"}
        </button>

        {/* Quit Button */}
        <button
          onClick={onQuit}
          className="px-10 py-3 text-lg font-bold rounded-lg bg-red-600 hover:bg-red-700 text-white shadow-lg hover:scale-105 hover:shadow-xl active:scale-95 transition-all duration-200"
          style={{ boxShadow: "0 4px 15px rgba(244, 67, 54, 0.4)" }}
        >
          🚪 Quit
        </button>
      </div>
    </div>
  );
};

export default MultiplayerGameOverlay;
