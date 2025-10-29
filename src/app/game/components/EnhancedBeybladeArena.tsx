"use client";

import React, { useEffect } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  useTheme,
  Button,
} from "@mui/material";
import { BEYBLADE_CONFIGS } from "@/constants/beyblades";
import { useGameState } from "../hooks/useGameState";
import { useMultiplayer } from "../hooks/useMultiplayer";
import GameArena from "./GameArena";
import GameControls from "./GameControls";
import ControlsHelp from "./ControlsHelp";
import DraggableVirtualDPad from "./DraggableVirtualDPad";
import GameInstructions from "./GameInstructions";
import SpecialControlsHelp from "./SpecialControlsHelp";
import MatchResultScreen from "./MatchResultScreen";

interface EnhancedBeybladeArenaProps {
  gameMode?: "1p" | "2p";
  multiplayerData?: any;
  onBackToMenu?: () => void;
  onGameEnd?: (winner: any) => void;
  onPlayAgainMultiplayer?: () => void;
}

const EnhancedBeybladeArena: React.FC<EnhancedBeybladeArenaProps> = ({
  gameMode = "1p",
  multiplayerData,
  onBackToMenu,
  onGameEnd,
  onPlayAgainMultiplayer,
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
    handleVirtualAction,
    isLoading,
    setOpponentInput,
    setOpponentSpecialAction,
    getCurrentInput,
    getMyBeybladeState,
    setOpponentBeybladeState,
  } = useGameState({
    onGameEnd,
    gameMode,
    multiplayerData,
  });

  // Show multiplayer info if in 2P mode
  const isMultiplayer = gameMode === "2p";
  const playerNumber = multiplayerData?.playerNumber || 1;

  // Set beyblades from multiplayer data if available
  useEffect(() => {
    if (isMultiplayer && multiplayerData) {
      const player1Data = multiplayerData.player1;
      const player2Data = multiplayerData.player2;

      if (player1Data?.beyblade && player2Data?.beyblade) {
        // Set beyblade based on player number
        if (playerNumber === 1) {
          setSelectedBeyblade(player1Data.beyblade);
          setSelectedAIBeyblade(player2Data.beyblade);
        } else {
          setSelectedBeyblade(player2Data.beyblade);
          setSelectedAIBeyblade(player1Data.beyblade);
        }

        // Auto-start the game after a brief delay to ensure state is set
        setTimeout(() => {
          restartGame();
        }, 100);
      }
    }
  }, [isMultiplayer, multiplayerData, playerNumber, restartGame]);

  // Setup multiplayer if in 2P mode
  const multiplayer =
    isMultiplayer && multiplayerData
      ? useMultiplayer({
          playerNumber: multiplayerData.playerNumber,
          roomId: multiplayerData.roomId,
          onOpponentInput: (input: any) => {
            // Apply opponent's input to their beyblade
            if (input.direction) {
              setOpponentInput(input.direction);
            }
            if (input.specialActions) {
              setOpponentSpecialAction(input.specialActions);
            }
          },
          onOpponentBeybladeUpdate: (data: any) => {
            // Update opponent's beyblade state
            setOpponentBeybladeState(data);
          },
          onGameStateUpdate: (state: any) => {
            // Player 2 receives game state updates from Player 1
            console.log("Game state update received:", state);
          },
          onMatchResult: (result: any) => {
            console.log("Match result:", result);
            if (onGameEnd) {
              onGameEnd(result.winner);
            }
          },
          onOpponentDisconnected: () => {
            alert("Opponent disconnected!");
            if (onBackToMenu) {
              onBackToMenu();
            }
          },
        })
      : null;

  // Send player input to opponent in multiplayer
  useEffect(() => {
    if (!isMultiplayer || !multiplayer) return;

    const interval = setInterval(() => {
      const input = getCurrentInput();
      multiplayer.sendInput(input);
    }, 50); // Send input 20 times per second

    return () => clearInterval(interval);
  }, [isMultiplayer, multiplayer, getCurrentInput]);

  // Send game over event in multiplayer
  useEffect(() => {
    if (!isMultiplayer || !multiplayer || !gameState.winner) return;

    multiplayer.sendGameOver(gameState.winner);
  }, [isMultiplayer, multiplayer, gameState.winner]);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: { xs: 2, md: 4 },
        width: "100%",
        maxWidth: "1400px", // Increased from 1200px for widescreen support
        mx: "auto",
        px: { xs: 0, sm: 2, md: 3 },
      }}
    >
      {/* Game Controls */}
      <GameControls
        isPlaying={gameState.isPlaying}
        isLoading={isLoading}
        playerBeyblade={selectedBeyblade}
        aiBeyblade={selectedAIBeyblade}
        onPlayerBeybladeChange={setSelectedBeyblade}
        onAIBeybladeChange={setSelectedAIBeyblade}
        onRestart={restartGame}
        availableBeyblades={BEYBLADE_CONFIGS}
        className="w-full"
        isMultiplayer={isMultiplayer}
      />

      {/* Game Arena */}
      <Box
        sx={{
          position: "relative",
          width: "100%",
          display: "flex",
          justifyContent: "center",
        }}
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
          <Box
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "rgba(0, 0, 0, 0.85)",
              borderRadius: 2,
              zIndex: 10,
            }}
          >
            <Box sx={{ textAlign: "center" }}>
              <Box
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
              </Box>
              <Typography
                variant="h4"
                sx={{
                  color: theme.palette.primary.main,
                  fontWeight: 700,
                  mb: 1,
                }}
              >
                Loading Battle...
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  color: "white",
                  opacity: 0.8,
                }}
              >
                Preparing the arena
              </Typography>
            </Box>
          </Box>
        )}

        {/* Mobile Virtual D-Pad - Draggable and position saved in cookies */}
        <Box
          sx={{
            display: { xs: "block", md: "none" },
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            pointerEvents: "none",
          }}
        >
          <DraggableVirtualDPad
            onDirectionChange={handleVirtualDPad}
            onActionButton={handleVirtualAction}
          />
        </Box>
      </Box>

      {/* Game Instructions - Only show during gameplay */}
      <GameInstructions
        isPlaying={gameState.isPlaying}
        className="w-full max-w-4xl"
      />

      {/* Special Controls Help */}
      <SpecialControlsHelp className="w-full max-w-4xl" />

      {/* Controls Help - Always visible */}
      <ControlsHelp className="w-full max-w-4xl" />

      {/* Game Result Screen */}
      {!gameState.isPlaying && gameState.winner && (
        <MatchResultScreen
          winner={gameState.winner}
          isPlayerWinner={gameState.winner.isPlayer}
          gameTime={gameState.gameTime}
          isMultiplayer={isMultiplayer}
          onPlayAgain={isMultiplayer ? undefined : restartGame}
          onBackToMenu={onBackToMenu || (() => {})}
          onPlayAgainMultiplayer={
            isMultiplayer ? onPlayAgainMultiplayer : undefined
          }
        />
      )}

      {/* Battle Statistics */}
      {gameState.isPlaying && (
        <Box
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
            <Card
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
                <Typography
                  variant="h6"
                  fontWeight={600}
                  gutterBottom
                  color={beyblade.isPlayer ? "primary.main" : "secondary.main"}
                  sx={{ fontSize: { xs: "1rem", md: "1.25rem" } }}
                >
                  {beyblade.isPlayer ? "🎮 Player" : "🤖 AI"}:{" "}
                  {beyblade.config.name}
                </Typography>

                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    gap: { xs: 0.5, md: 1 },
                  }}
                >
                  <Box
                    sx={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <Typography
                      variant="body2"
                      color="text.primary"
                      sx={{ fontSize: { xs: "0.75rem", md: "0.875rem" } }}
                    >
                      Spin:
                    </Typography>
                    <Typography
                      variant="body2"
                      fontFamily="monospace"
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
                    </Typography>
                  </Box>

                  <Box
                    sx={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <Typography
                      variant="body2"
                      color="text.primary"
                      sx={{ fontSize: { xs: "0.75rem", md: "0.875rem" } }}
                    >
                      Acceleration:
                    </Typography>
                    <Typography
                      variant="body2"
                      fontFamily="monospace"
                      color="text.secondary"
                      sx={{ fontSize: { xs: "0.75rem", md: "0.875rem" } }}
                    >
                      {beyblade.acceleration}/10
                    </Typography>
                  </Box>

                  <Box
                    sx={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <Typography
                      variant="body2"
                      color="text.primary"
                      sx={{ fontSize: { xs: "0.75rem", md: "0.875rem" } }}
                    >
                      Status:
                    </Typography>
                    <Typography
                      variant="body2"
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
