"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useGame } from "@/contexts/GameContext";
import { useGameData } from "@/hooks/game/useGameData";
import GameLayout from "@/components/game/GameLayout";
import { Loader2, CheckCircle2 } from "lucide-react";

export default function TryoutSelectPage() {
  const router = useRouter();
  const { setGameConfig } = useGame();
  const { beyblades, arenas, loading, error } = useGameData();

  const [selectedBeyblade, setSelectedBeyblade] = useState<string>("");
  const [selectedArena, setSelectedArena] = useState<string>("");

  const handleStart = () => {
    if (selectedBeyblade && selectedArena) {
      setGameConfig({
        beybladeId: selectedBeyblade,
        arenaId: selectedArena,
        gameMode: "tryout",
      });
      router.push("/game/tryout");
    }
  };

  if (loading) {
    return (
      <GameLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
            <p className="text-gray-400 text-lg">Loading game data...</p>
          </div>
        </div>
      </GameLayout>
    );
  }

  if (error) {
    return (
      <GameLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center bg-red-500/10 border border-red-500/50 rounded-xl p-8">
            <p className="text-red-400 text-lg mb-4">
              Failed to load game data
            </p>
            <p className="text-gray-400">{error}</p>
          </div>
        </div>
      </GameLayout>
    );
  }

  const canStart = selectedBeyblade && selectedArena;

  return (
    <GameLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-3">
            Select Your Setup
          </h1>
          <p className="text-gray-400 text-lg">
            Choose your Beyblade and arena for tryout mode
          </p>
        </div>

        {/* Selection Grid */}
        <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Beyblade Selection */}
          <div>
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
              <span className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center mr-3 text-sm">
                1
              </span>
              Choose Beyblade
            </h2>
            <div className="space-y-3">
              {beyblades.map((beyblade) => (
                <button
                  key={beyblade.id}
                  onClick={() => setSelectedBeyblade(beyblade.id)}
                  className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                    selectedBeyblade === beyblade.id
                      ? "border-blue-500 bg-blue-500/10"
                      : "border-gray-700 bg-gray-800/50 hover:border-gray-600"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-white mb-1">
                        {beyblade.name}
                      </h3>
                      <p className="text-sm text-gray-400 mb-2">
                        Type: {beyblade.type}
                      </p>
                      <div className="flex gap-4 text-sm">
                        <span className="text-gray-400">
                          Attack:{" "}
                          <span className="text-white font-semibold">
                            {beyblade.attack}
                          </span>
                        </span>
                        <span className="text-gray-400">
                          Defense:{" "}
                          <span className="text-white font-semibold">
                            {beyblade.defense}
                          </span>
                        </span>
                        <span className="text-gray-400">
                          Stamina:{" "}
                          <span className="text-white font-semibold">
                            {beyblade.stamina}
                          </span>
                        </span>
                      </div>
                    </div>
                    {selectedBeyblade === beyblade.id && (
                      <CheckCircle2 className="w-6 h-6 text-blue-500 flex-shrink-0" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Arena Selection */}
          <div>
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
              <span className="bg-purple-500 text-white rounded-full w-8 h-8 flex items-center justify-center mr-3 text-sm">
                2
              </span>
              Choose Arena
            </h2>
            <div className="space-y-3">
              {arenas.map((arena) => (
                <button
                  key={arena.id}
                  onClick={() => setSelectedArena(arena.id)}
                  className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                    selectedArena === arena.id
                      ? "border-purple-500 bg-purple-500/10"
                      : "border-gray-700 bg-gray-800/50 hover:border-gray-600"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-white mb-1">
                        {arena.name}
                      </h3>
                      <p className="text-sm text-gray-400 mb-2">
                        {arena.description || "Standard battle arena"}
                      </p>
                      <div className="flex gap-4 text-sm">
                        <span className="text-gray-400">
                          Size:{" "}
                          <span className="text-white font-semibold">
                            {arena.size}
                          </span>
                        </span>
                        <span className="text-gray-400">
                          Difficulty:{" "}
                          <span className="text-white font-semibold">
                            {arena.difficulty}
                          </span>
                        </span>
                      </div>
                    </div>
                    {selectedArena === arena.id && (
                      <CheckCircle2 className="w-6 h-6 text-purple-500 flex-shrink-0" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Start Button */}
        <div className="flex justify-center mt-12">
          <button
            onClick={handleStart}
            disabled={!canStart}
            className={`px-8 py-4 rounded-xl font-bold text-lg transition-all ${
              canStart
                ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:scale-105 hover:shadow-lg hover:shadow-blue-500/50"
                : "bg-gray-700 text-gray-500 cursor-not-allowed"
            }`}
          >
            {canStart ? "Start Tryout" : "Select Beyblade and Arena"}
          </button>
        </div>
      </div>
    </GameLayout>
  );
}
