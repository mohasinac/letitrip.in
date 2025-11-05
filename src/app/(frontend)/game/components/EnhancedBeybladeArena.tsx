"use client";

import React, { useEffect } from "react";
import { UnifiedButton } from "@/components/ui/unified/Button";
import { UnifiedCard } from "@/components/ui/unified/Card";
import { CardContent } from "@/components/ui/unified/Card";
import { useGameState } from "../hooks/useGameState";
import GameArena from "./GameArena";
import GameControls from "./GameControls";
import ControlsHelp from "./ControlsHelp";
import MobileSpecialButtons from "./MobileSpecialButtons";
import GameInstructions from "./GameInstructions";
import SpecialControlsHelp from "./SpecialControlsHelp";
import BeybladeSelect from "@/components/game/BeybladeSelect";

interface EnhancedBeybladeArenaProps {
  onBackToMenu?: () => void;
  onGameEnd?: (winner: any) => void;
}

const EnhancedBeybladeArena: React.FC<EnhancedBeybladeArenaProps> = ({
  onBackToMenu,
  onGameEnd,
}) => {
  const theme = {
    palette: {
      background: { default: "#111827", paper: "#1f2937" },
      primary: { main: "#3b82f6" },
      secondary: { main: "#a855f7" },
      error: { main: "#ef4444" },
      text: { primary: "#f9fafb", secondary: "#9ca3af" },
    },
  };

  // Ref for arena to enable auto-scroll/focus
  const arenaRef = React.useRef<HTMLDivElement>(null);

  const {
    gameState,
    selectedBeyblade,
    selectedAIBeyblade,
    selectedArena,
    setSelectedBeyblade,
    setSelectedAIBeyblade,
    setSelectedArena,
    restartGame,
    handleMouseMove,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    handleVirtualAction,
    isLoading,
  } = useGameState({
    onGameEnd,
  });

  // Auto-scroll to arena when game starts or countdown begins
  useEffect(() => {
    if (
      (gameState.isPlaying || gameState.countdownActive) &&
      arenaRef.current
    ) {
      // Smooth scroll to arena with some offset for better visibility
      arenaRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
        inline: "center",
      });

      // Focus on arena for keyboard controls (mobile-friendly)
      setTimeout(() => {
        arenaRef.current?.focus({ preventScroll: true });
      }, 500);
    }
  }, [gameState.isPlaying, gameState.countdownActive]);

  return (
    <div className="flex flex-col items-center gap-4 md:gap-8 w-full max-w-[1400px] mx-auto px-0 sm:px-4 md:px-6">
      {/* Game Controls */}
      <GameControls
        isPlaying={gameState.isPlaying}
        isLoading={isLoading}
        playerBeyblade={selectedBeyblade}
        aiBeyblade={selectedAIBeyblade}
        arena={selectedArena}
        onPlayerBeybladeChange={setSelectedBeyblade}
        onAIBeybladeChange={setSelectedAIBeyblade}
        onArenaChange={setSelectedArena}
        onRestart={restartGame}
        availableBeyblades={{}}
        className="w-full"
      />

      {/* Game Arena */}
      <div
        ref={arenaRef}
        tabIndex={-1}
        className="relative w-full flex justify-center outline-none focus:outline-none"
      >
        <GameArena
          gameState={gameState}
          onMouseMove={handleMouseMove}
          onTouchMove={handleTouchMove}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          className="shadow-2xl"
        />

        {/* Loading Screen Overlay */}
        {isLoading && (
          <div>
            <div>
              <div
                sx={{
                  fontSize: "4rem",
                  mb: 2,
                  animation: "spin 1s linear infinite",
                  "@keyframes spin": {
                    "0%": { transform: "rotate(0deg)" },
                    "100%": { transform: "rotate(360deg)" },
                  },
                }}
              >
                ⚡
              </div>
              <div>Loading Battle...</div>
              <div>Preparing the arena</div>
            </div>
          </div>
        )}

        {/* Mobile Special Move Buttons - Only on small screens */}
        <div
          sx={{
            display: { xs: "block", md: "none" },
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            pointerEvents: "none",
            "& > *": {
              pointerEvents: "auto",
            },
          }}
        >
          <MobileSpecialButtons
            onActionButton={handleVirtualAction}
            disabled={!gameState.isPlaying}
            playerBeyblade={gameState.beyblades.find((b) => b.isPlayer)}
          />
        </div>

        {/* Single Player Game Over Overlay - Show on canvas */}
        {!gameState.isPlaying && gameState.winner && (
          <div>
            <div
              sx={{
                textAlign: "center",
                maxWidth: 400,
                width: "100%",
                backgroundColor: "background.paper",
                borderRadius: 3,
                border: `3px solid`,
                borderColor: gameState.winner.isPlayer
                  ? "success.main"
                  : "error.main",
                p: { xs: 2, sm: 3 },
              }}
            >
              {/* Victory/Defeat Icon */}
              <div sx={{ fontSize: { xs: "3rem", sm: "4rem" }, mb: 1 }}>
                {gameState.winner.isPlayer ? "🏆" : "💔"}
              </div>

              {/* Result Title */}
              <div
                color={
                  gameState.winner.isPlayer ? "success.main" : "error.main"
                }
                sx={{ fontSize: { xs: "1.5rem", sm: "2rem" } }}
              >
                {gameState.winner.config.name} Wins!
              </div>

              <div
                color={
                  gameState.winner.isPlayer ? "success.main" : "error.main"
                }
                sx={{ fontSize: { xs: "1.25rem", sm: "1.5rem" }, mb: 2 }}
              >
                {gameState.winner.isPlayer ? "Victory!" : "Defeat!"}
              </div>

              {/* Game Stats */}
              <div>
                <div sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}>
                  Time: {gameState.gameTime.toFixed(1)}s
                </div>
                <div sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}>
                  Spin: {Math.floor(gameState.winner.spin)}
                </div>
                <div sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}>
                  Power: {Math.floor(gameState.winner.power || 0)}/25
                </div>
              </div>

              {/* Action Buttons */}
              <div>
                <UnifiedButton
                  onClick={restartGame}
                  size="lg"
                  fullWidth
                  sx={{
                    fontSize: { xs: "0.875rem", sm: "1rem" },
                    py: { xs: 1, sm: 1.5 },
                  }}
                >
                  🔄 Play Again
                </UnifiedButton>
                <UnifiedButton
                  onClick={onBackToMenu || (() => {})}
                  size="lg"
                  fullWidth
                  sx={{
                    fontSize: { xs: "0.875rem", sm: "1rem" },
                    py: { xs: 1, sm: 1.5 },
                  }}
                >
                  🏠 Back to Menu
                </UnifiedButton>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Game Instructions - Only show during gameplay */}
      <GameInstructions
        isPlaying={gameState.isPlaying}
        className="w-full max-w-4xl"
      />

      {/* Special Controls Help */}
      <SpecialControlsHelp className="w-full max-w-4xl" />

      {/* Controls Help - Always visible */}
      <ControlsHelp className="w-full max-w-4xl" />

      {/* Battle Statistics */}
      {gameState.isPlaying && (
        <div
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)" },
            gap: { xs: 2, md: 3 },
            width: "100%",
            maxWidth: { xs: "100%", sm: "600px", lg: "800px" }, // Better widescreen support
            px: { xs: 2, md: 0 },
          }}
        >
          {gameState.beyblades.map((beyblade, index) => (
            <UnifiedCard
              key={beyblade.id}
              sx={{
                p: { xs: 1.5, md: 2 },
                borderRadius: 2,
                backgroundColor: beyblade.isPlayer
                  ? `${theme.palette.primary.main}20`
                  : `${theme.palette.secondary.main}20`,
                border: `2px solid ${
                  beyblade.isPlayer
                    ? theme.palette.primary.main
                    : theme.palette.secondary.main
                }`,
              }}
            >
              <CardContent
                sx={{
                  p: { xs: 1.5, md: 2 },
                  "&:last-child": { pb: { xs: 1.5, md: 2 } },
                }}
              >
                <div
                  color={beyblade.isPlayer ? "primary.main" : "secondary.main"}
                  sx={{ fontSize: { xs: "1rem", md: "1.25rem" } }}
                >
                  {beyblade.isPlayer ? "🎮 Player" : "🤖 AI"}:{" "}
                  {beyblade.config.name}
                </div>

                <div
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    gap: { xs: 0.5, md: 1 },
                  }}
                >
                  <div>
                    <div sx={{ fontSize: { xs: "0.75rem", md: "0.875rem" } }}>
                      Spin:
                    </div>
                    <div
                      sx={{
                        fontSize: { xs: "0.75rem", md: "0.875rem" },
                        color:
                          beyblade.spin > 1000
                            ? "#22C55E"
                            : beyblade.spin > 400
                            ? "#F59E0B"
                            : "#EF4444",
                      }}
                    >
                      {Math.floor(beyblade.spin)}/
                      {beyblade.isPlayer ? "3500" : "2800"}
                    </div>
                  </div>

                  <div>
                    <div sx={{ fontSize: { xs: "0.75rem", md: "0.875rem" } }}>
                      Power:
                    </div>
                    <div sx={{ fontSize: { xs: "0.75rem", md: "0.875rem" } }}>
                      {Math.floor(beyblade.power || 0)}/25
                    </div>
                  </div>

                  <div>
                    <div sx={{ fontSize: { xs: "0.75rem", md: "0.875rem" } }}>
                      Status:
                    </div>
                    <div
                      sx={{
                        fontSize: { xs: "0.75rem", md: "0.875rem" },
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
                    </div>
                  </div>
                </div>
              </CardContent>
            </UnifiedCard>
          ))}
        </div>
      )}
    </div>
  );
};

export default EnhancedBeybladeArena;
