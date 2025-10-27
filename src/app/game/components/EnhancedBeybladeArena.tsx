"use client";

import React from "react";
import { Box, Typography, Card, CardContent, useTheme } from "@mui/material";
import { BEYBLADE_CONFIGS } from "@/constants/beyblades";
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
  const theme = useTheme();
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
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 4,
        width: "100%",
        maxWidth: "1200px",
        mx: "auto",
      }}
    >
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
      <Box sx={{ position: "relative" }}>
        <GameArena
          gameState={gameState}
          onMouseMove={handleMouseMove}
          onTouchMove={handleTouchMove}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          className="shadow-2xl"
        />

        {/* Mobile Virtual D-Pad positioned on stadium bottom-right */}
        <Box
          sx={{
            display: { xs: "block", md: "none" },
            position: "absolute",
            bottom: 16,
            right: 16,
          }}
        >
          <VirtualDPad
            onDirectionChange={handleVirtualDPad}
            className="w-24 h-24 opacity-80 bg-black/20 backdrop-blur-sm rounded-full border-2 border-white/30"
          />
        </Box>
      </Box>

      {/* Game Instructions - Only show during gameplay */}
      <GameInstructions
        isPlaying={gameState.isPlaying}
        className="w-full max-w-4xl"
      />

      {/* Controls Help - Always visible */}
      <ControlsHelp className="w-full max-w-4xl" />

      {/* Game Status */}
      {!gameState.isPlaying && gameState.winner && (
        <Card
          sx={{
            textAlign: "center",
            p: 4,
            borderRadius: 3,
            backgroundColor: theme.palette.background.paper,
            border: `2px solid ${theme.palette.primary.main}`,
            maxWidth: 500,
          }}
        >
          <CardContent>
            <Typography
              variant="h3"
              color="primary.main"
              fontWeight={700}
              gutterBottom
            >
              🏆 {gameState.winner.config.name} Wins!
            </Typography>
            <Typography variant="h5" color="text.primary" sx={{ mb: 3 }}>
              {gameState.winner.isPlayer ? "🎉 Victory!" : "💥 Defeat!"}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Game Duration: {gameState.gameTime.toFixed(1)} seconds
            </Typography>
          </CardContent>
        </Card>
      )}

      {/* Battle Statistics */}
      {gameState.isPlaying && (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "repeat(2, 1fr)" },
            gap: 3,
            width: "100%",
            maxWidth: 600,
          }}
        >
          {gameState.beyblades.map((beyblade, index) => (
            <Card
              key={beyblade.id}
              sx={{
                p: 2,
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
              <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
                <Typography
                  variant="h6"
                  fontWeight={600}
                  gutterBottom
                  color={beyblade.isPlayer ? "primary.main" : "secondary.main"}
                >
                  {beyblade.isPlayer ? "🎮 Player" : "🤖 AI"}:{" "}
                  {beyblade.config.name}
                </Typography>

                <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                  <Box
                    sx={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <Typography variant="body2" color="text.primary">
                      Spin:
                    </Typography>
                    <Typography
                      variant="body2"
                      fontFamily="monospace"
                      sx={{
                        color:
                          beyblade.spin > 500
                            ? "#22C55E"
                            : beyblade.spin > 200
                            ? "#F59E0B"
                            : "#EF4444",
                      }}
                    >
                      {Math.floor(beyblade.spin)}/2000
                    </Typography>
                  </Box>

                  <Box
                    sx={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <Typography variant="body2" color="text.primary">
                      Acceleration:
                    </Typography>
                    <Typography
                      variant="body2"
                      fontFamily="monospace"
                      color="text.secondary"
                    >
                      {beyblade.acceleration}/10
                    </Typography>
                  </Box>

                  <Box
                    sx={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <Typography variant="body2" color="text.primary">
                      Status:
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
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
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>
      )}
    </Box>
  );
};

export default EnhancedBeybladeArena;
