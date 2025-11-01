"use client";

import React, { useState } from "react";
import { UnifiedCard } from "@/components/ui/unified/Card";
import { CardContent } from "@/components/ui/unified/Card";
import EnhancedBeybladeArena from "../components/EnhancedBeybladeArena";
import GameModeSelector from "../components/GameModeSelector";
import MultiplayerLobby from "../components/MultiplayerLobby";
import MultiplayerBeybladeSelect from "../components/MultiplayerBeybladeSelect";
import { useBreadcrumbTracker } from "@/hooks/useBreadcrumbTracker";

type GameMode = "1p" | "2p" | null;
type GamePhase = "mode-selection" | "lobby" | "beyblade-select" | "playing";

export default function BeybladeGamePage() {
  const [gameMode, setGameMode] = useState<GameMode>(null);
  const [gamePhase, setGamePhase] = useState<GamePhase>("mode-selection");
  const [multiplayerData, setMultiplayerData] = useState<any>(null);

  // Add breadcrumb
  useBreadcrumbTracker([
    {
      label: "Games",
      href: "/game",
    },
    {
      label: "Beyblade Battle",
      href: "/game/beyblade-battle",
      active: true,
    },
  ]);

  const handleModeSelect = (mode: "1p" | "2p") => {
    setGameMode(mode);
    if (mode === "1p") {
      setGamePhase("playing");
    } else {
      setGamePhase("lobby");
    }
  };

  const handleGameStart = (roomData: any) => {
    setMultiplayerData(roomData);
    setGamePhase("beyblade-select");
  };

  const handleBeybladeSelectComplete = (gameData?: any) => {
    // Merge the beyblade selection data with existing multiplayer data
    if (gameData) {
      setMultiplayerData({
        ...multiplayerData,
        ...gameData,
      });
    }
    setGamePhase("playing");
  };

  const handleBackToModeSelection = () => {
    setGameMode(null);
    setGamePhase("mode-selection");
    setMultiplayerData(null);
  };

  const handlePlayAgainMultiplayer = () => {
    // Reset to lobby phase to find new opponent
    setGamePhase("lobby");
    setMultiplayerData(null);
  };

  return (
    <div className="min-h-screen py-4 md:py-8 bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header Section */}
        <div className="text-center mb-6 md:mb-12 px-4 md:px-0">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 text-gray-900 dark:text-gray-100">
            🌪️ Beyblade Battle Arena
          </h1>
          <p className="text-base sm:text-lg md:text-xl max-w-2xl mx-auto text-gray-600 dark:text-gray-400 px-2 md:px-0">
            {gamePhase === "mode-selection" &&
              "Choose your game mode and start battling!"}
            {gamePhase === "lobby" &&
              "Finding an opponent for online battle..."}
            {gamePhase === "beyblade-select" && "Select your beyblades!"}
            {gamePhase === "playing" &&
              gameMode === "1p" &&
              "Battle against AI!"}
            {gamePhase === "playing" &&
              gameMode === "2p" &&
              "Online Multiplayer Battle!"}
          </p>
        </div>

        {/* Game Mode Selection */}
        {gamePhase === "mode-selection" && (
          <GameModeSelector onSelectMode={handleModeSelect} />
        )}

        {/* Multiplayer Lobby */}
        {gamePhase === "lobby" && (
          <MultiplayerLobby
            onGameStart={handleGameStart}
            onCancel={handleBackToModeSelection}
          />
        )}

        {/* Beyblade Selection for Multiplayer */}
        {gamePhase === "beyblade-select" && (
          <MultiplayerBeybladeSelect
            roomData={multiplayerData}
            onStartGame={handleBeybladeSelectComplete}
            onCancel={handleBackToModeSelection}
          />
        )}

        {/* Main Game Arena */}
        {gamePhase === "playing" && (
          <>
            <div className="flex justify-center mb-8 md:mb-16 px-2 md:px-0">
              <EnhancedBeybladeArena
                gameMode={gameMode as "1p" | "2p"}
                multiplayerData={multiplayerData}
                onBackToMenu={handleBackToModeSelection}
                onPlayAgainMultiplayer={handlePlayAgainMultiplayer}
              />
            </div>

            {/* Game Information Cards - Only show for single player */}
            {gameMode === "1p" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 mb-8 md:mb-12 px-4 md:px-0">
                {/* Game Features Card */}
                <UnifiedCard className="h-full border-2 border-primary-600 hover:scale-[1.02] transition-all duration-300 hover:shadow-xl">
                  <CardContent className="p-6">
                    <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-gray-100 flex items-center">
                      <span className="mr-3">⚡</span>
                      Game Features
                    </h2>
                    <ul className="space-y-4">
                      {[
                        {
                          icon: "🎮",
                          title: "Real-time Control",
                          desc: "Mouse movement controls your Beyblade instantly",
                        },
                        {
                          icon: "🌀",
                          title: "Spin Mechanics",
                          desc: "Both start at 100% spin, decay over time",
                        },
                        {
                          icon: "💥",
                          title: "Collision Physics",
                          desc: "Every hit reduces spin for both Beyblades",
                        },
                        {
                          icon: "🏟️",
                          title: "Stadium Boundaries",
                          desc: "Ring-out victories possible",
                        },
                        {
                          icon: "🤖",
                          title: "AI Opponent",
                          desc: "Intelligent enemy that hunts you down",
                        },
                      ].map((feature, index) => (
                        <li key={index} className="flex items-start gap-3">
                          <span className="text-2xl flex-shrink-0">
                            {feature.icon}
                          </span>
                          <div>
                            <p className="font-bold text-gray-900 dark:text-gray-100">
                              {feature.title}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {feature.desc}
                            </p>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </UnifiedCard>

                {/* Strategy Tips Card */}
                <UnifiedCard className="h-full border-2 border-green-500 hover:scale-[1.02] transition-all duration-300 hover:shadow-xl">
                  <CardContent className="p-6">
                    <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-gray-100 flex items-center">
                      <span className="mr-3">🧠</span>
                      Strategy Tips
                    </h2>
                    <ul className="space-y-4">
                      {[
                        {
                          icon: "🏃",
                          title: "Stay Mobile",
                          desc: "Keep moving to avoid AI attacks",
                        },
                        {
                          icon: "🎯",
                          title: "Strategic Collisions",
                          desc: "Time your hits when enemy has low spin",
                        },
                        {
                          icon: "📍",
                          title: "Positioning",
                          desc: "Use stadium edges to your advantage",
                        },
                        {
                          icon: "⚖️",
                          title: "Spin Management",
                          desc: "Avoid unnecessary collisions early on",
                        },
                        {
                          icon: "🏁",
                          title: "Endgame",
                          desc: "Low spin makes you vulnerable to ring-outs",
                        },
                      ].map((tip, index) => (
                        <li key={index} className="flex items-start gap-3">
                          <span className="text-2xl flex-shrink-0">
                            {tip.icon}
                          </span>
                          <div>
                            <p className="font-bold text-gray-900 dark:text-gray-100">
                              {tip.title}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {tip.desc}
                            </p>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </UnifiedCard>
              </div>
            )}
          </>
        )}

        {/* Advanced Mechanics Section - Only show for single player */}
        {gamePhase === "playing" && gameMode === "1p" && (
          <UnifiedCard className="border-2 border-primary-600 shadow-xl mx-4 md:mx-0">
            <CardContent className="p-4 md:p-6">
              <h2 className="text-xl md:text-2xl font-bold mb-6 text-center text-gray-900 dark:text-gray-100 flex items-center justify-center">
                <span className="mr-3">🔬</span>
                Advanced Battle Mechanics
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
                {/* Blue Zone */}
                <UnifiedCard className="bg-gray-800 border-2 border-blue-500">
                  <CardContent className="p-4">
                    <h3 className="text-lg font-bold text-blue-400 flex items-center mb-3">
                      <span className="mr-2">🔵</span>
                      Blue Speed Zone
                    </h3>
                    <p className="text-sm text-gray-200">
                      Triggers a mandatory 1-second loop with 2× acceleration.
                      Player retains control, AI loses control. 3-second
                      cooldown after each loop.
                    </p>
                  </CardContent>
                </UnifiedCard>

                {/* Red Zones */}
                <UnifiedCard className="bg-red-950 border-2 border-red-500">
                  <CardContent className="p-4">
                    <h3 className="text-lg font-bold text-red-400 flex items-center mb-3">
                      <span className="mr-2">🔴</span>
                      Wall Zones
                    </h3>
                    <p className="text-sm text-gray-200">
                      Angles 0-60°, 120-180°, 240-300°. Collision causes spin
                      loss (10 + acceleration) and respawn inside blue circle.
                    </p>
                  </CardContent>
                </UnifiedCard>

                {/* Yellow Zones */}
                <UnifiedCard className="bg-yellow-950 border-2 border-yellow-500">
                  <CardContent className="p-4">
                    <h3 className="text-lg font-bold text-yellow-400 flex items-center mb-3">
                      <span className="mr-2">🟡</span>
                      Exit Zones
                    </h3>
                    <p className="text-sm text-gray-200">
                      Angles 60-120°, 180-240°, 300-360°. Cross these boundaries
                      and it's game over - instant elimination!
                    </p>
                  </CardContent>
                </UnifiedCard>
              </div>

              {/* Collision Damage */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <UnifiedCard className="bg-gray-800 border-2 border-cyan-500">
                  <CardContent className="p-4">
                    <h3 className="text-lg font-bold text-cyan-400 mb-2">
                      ⚡ Same Spin Collision
                    </h3>
                    <p className="text-sm text-gray-200">
                      Damage = |acceleration difference| + other Beyblade's
                      acceleration
                    </p>
                  </CardContent>
                </UnifiedCard>

                <UnifiedCard className="bg-pink-950 border-2 border-pink-500">
                  <CardContent className="p-4">
                    <h3 className="text-lg font-bold text-pink-400 mb-2">
                      💥 Opposite Spin Collision
                    </h3>
                    <p className="text-sm text-gray-200">
                      Both get average spin + their acceleration, take average
                      acceleration + other's acceleration damage
                    </p>
                  </CardContent>
                </UnifiedCard>
              </div>
            </CardContent>
          </UnifiedCard>
        )}
      </div>
    </div>
  );
}
