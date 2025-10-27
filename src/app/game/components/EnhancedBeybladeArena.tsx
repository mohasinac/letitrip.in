"use client";

import React from "react";
import { BEYBLADE_CONFIGS } from "@/constants/beyblades";
import { useTheme } from "@/contexts/ThemeContext";
import { useGameState } from "../hooks/useGameState";
import GameArena from "./GameArena";
import GameControls from "./GameControls";
import ControlsHelp from "./ControlsHelp";
import VirtualDPad from "./VirtualDPad";
import GameInstructions from "./GameInstructions";

interface EnhancedBeybladeArenaProps {
  onGameEnd?: (winner: any) => void;
}

const EnhancedBeybladeArena: React.FC<EnhancedBeybladeArenaProps> = ({
  onGameEnd,
}) => {
  const { theme } = useTheme();
  const {
    gameState,
    selectedBeyblade,
    selectedAIBeyblade,
    setSelectedBeyblade,
    setSelectedAIBeyblade,
    restartGame,
    handleMouseMove,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    handleVirtualDPad,
  } = useGameState({ onGameEnd });

  return (
    <div className="flex flex-col items-center space-y-8 w-full max-w-6xl mx-auto">
      {/* Game Controls */}
      <GameControls
        isPlaying={gameState.isPlaying}
        playerBeyblade={selectedBeyblade}
        aiBeyblade={selectedAIBeyblade}
        onPlayerBeybladeChange={setSelectedBeyblade}
        onAIBeybladeChange={setSelectedAIBeyblade}
        onRestart={restartGame}
        availableBeyblades={BEYBLADE_CONFIGS}
        className="w-full"
      />

      {/* Game Arena */}
      <div className="relative">
        <GameArena
          gameState={gameState}
          onMouseMove={handleMouseMove}
          onTouchMove={handleTouchMove}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          className="shadow-2xl"
        />

        {/* Mobile Virtual D-Pad positioned on stadium bottom-right */}
        <div className="md:hidden absolute bottom-4 right-4">
          <VirtualDPad
            onDirectionChange={handleVirtualDPad}
            className="w-24 h-24 opacity-80 bg-black/20 backdrop-blur-sm rounded-full border-2 border-white/30"
          />
        </div>
      </div>

      {/* Game Instructions - Only show during gameplay */}
      <GameInstructions
        isPlaying={gameState.isPlaying}
        className="w-full max-w-4xl"
      />

      {/* Controls Help - Always visible */}
      <ControlsHelp className="w-full max-w-4xl" />

      {/* Game Status */}
      {!gameState.isPlaying && gameState.winner && (
        <div
          className="text-center p-8 rounded-xl shadow-lg"
          style={{
            backgroundColor: `${theme.colors.background}f0`,
            borderColor: theme.colors.primary,
            borderWidth: "2px",
          }}
        >
          <h2
            className="text-4xl font-bold mb-4"
            style={{ color: theme.colors.primary }}
          >
            🏆 {gameState.winner.config.name} Wins!
          </h2>
          <p className="text-xl mb-6" style={{ color: theme.colors.text }}>
            {gameState.winner.isPlayer ? "🎉 Victory!" : "💥 Defeat!"}
          </p>
          <p className="text-lg" style={{ color: theme.colors.muted }}>
            Game Duration: {gameState.gameTime.toFixed(1)} seconds
          </p>
        </div>
      )}

      {/* Battle Statistics */}
      {gameState.isPlaying && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl">
          {gameState.beyblades.map((beyblade, index) => (
            <div
              key={beyblade.id}
              className="p-4 rounded-lg shadow-md"
              style={{
                backgroundColor: beyblade.isPlayer
                  ? `${theme.colors.primary}20`
                  : `${theme.colors.secondary}20`,
                borderColor: beyblade.isPlayer
                  ? theme.colors.primary
                  : theme.colors.secondary,
                borderWidth: "2px",
              }}
            >
              <h3
                className="text-lg font-bold mb-3"
                style={{
                  color: beyblade.isPlayer
                    ? theme.colors.primary
                    : theme.colors.secondary,
                }}
              >
                {beyblade.isPlayer ? "🎮 Player" : "🤖 AI"}:{" "}
                {beyblade.config.name}
              </h3>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span style={{ color: theme.colors.text }}>Spin:</span>
                  <span
                    className="font-mono font-bold"
                    style={{
                      color:
                        beyblade.spin > 500
                          ? "#22C55E"
                          : beyblade.spin > 200
                          ? "#F59E0B"
                          : "#EF4444",
                    }}
                  >
                    {Math.floor(beyblade.spin)}/2000
                  </span>
                </div>

                <div className="flex justify-between">
                  <span style={{ color: theme.colors.text }}>
                    Acceleration:
                  </span>
                  <span
                    className="font-mono font-bold"
                    style={{ color: theme.colors.accent }}
                  >
                    {beyblade.acceleration}/10
                  </span>
                </div>

                <div className="flex justify-between">
                  <span style={{ color: theme.colors.text }}>Status:</span>
                  <span
                    className="font-semibold"
                    style={{
                      color: beyblade.isDead
                        ? "#EF4444"
                        : beyblade.isOutOfBounds
                        ? "#F59E0B"
                        : beyblade.isInBlueLoop
                        ? "#3B82F6"
                        : "#22C55E",
                    }}
                  >
                    {beyblade.isDead
                      ? "💀 Eliminated"
                      : beyblade.isOutOfBounds
                      ? "🚫 Out of Bounds"
                      : beyblade.isInBlueLoop
                      ? "🔄 Speed Loop"
                      : "⚡ Active"}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EnhancedBeybladeArena;
