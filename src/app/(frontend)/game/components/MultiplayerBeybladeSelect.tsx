"use client";

import React, { useState, useEffect } from "react";
import { getSocket } from "@/lib/socket";
import BeybladeSelect from "@/components/game/BeybladeSelect";
import { useBeyblades } from "@/hooks/useBeyblades";

interface MultiplayerBeybladeSelectProps {
  roomData: any;
  onStartGame: (gameData?: any) => void;
  onCancel: () => void;
}

const MultiplayerBeybladeSelect: React.FC<MultiplayerBeybladeSelectProps> = ({
  roomData,
  onStartGame,
  onCancel,
}) => {
  const [selectedBeyblade, setSelectedBeyblade] = useState<string | null>(null);
  const [opponentBeyblade, setOpponentBeyblade] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [opponentReady, setOpponentReady] = useState(false);
  const socket = getSocket();
  const { beyblades, loading } = useBeyblades();

  // Get beyblade name by ID
  const getBeybladeNameById = (id: string | null) => {
    if (!id) return "Not selected";
    const beyblade = beyblades.find((b) => b.id === id);
    return beyblade?.name || "Not selected";
  };

  useEffect(() => {
    if (!socket) return;

    socket.on("opponent-selected", (data: any) => {
      setOpponentBeyblade(data.beyblade);
      setOpponentReady(data.ready || false);
    });

    socket.on("start-game", (data: any) => {
      // Pass the game data including selected beyblades
      onStartGame(data);
    });

    return () => {
      socket.off("opponent-selected");
      socket.off("start-game");
    };
  }, [socket, onStartGame]);

  const handleSelectBeyblade = (beybladeId: string) => {
    setSelectedBeyblade(beybladeId);
    // Reset ready state when changing beyblade
    setIsReady(false);
    if (socket) {
      socket.emit("select-beyblade", { beyblade: beybladeId, ready: false });
    }
  };

  const handleToggleReady = () => {
    if (!selectedBeyblade) {
      alert("Please select a beyblade first!");
      return;
    }

    const newReadyState = !isReady;
    setIsReady(newReadyState);

    if (socket) {
      socket.emit("select-beyblade", {
        beyblade: selectedBeyblade,
        ready: newReadyState,
      });
    }
  };

  const playerNumber = roomData?.playerNumber || 1;

  return (
    <div className="flex flex-col items-center gap-6 p-6 min-h-[60vh]">
      {/* Header */}
      <div className="text-center">
        <h4 className="text-3xl font-bold mb-2">Select Your Beyblade</h4>
        <p className="text-gray-600 dark:text-gray-400">
          You are Player {playerNumber} • Room: {roomData?.roomId?.slice(-8)}
        </p>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-3xl w-full">
        <div className="border-2 border-blue-500 bg-white dark:bg-gray-800 rounded-lg p-4">
          <h6 className="text-lg font-semibold mb-2">
            You (Player {playerNumber})
          </h6>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Beyblade: {getBeybladeNameById(selectedBeyblade)}
          </p>
          <span
            className={`inline-block mt-2 px-3 py-1 rounded-full text-sm font-medium ${
              isReady
                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
            }`}
          >
            {isReady ? "Ready" : "Not Ready"}
          </span>
        </div>
        <div className="border-2 border-purple-500 bg-white dark:bg-gray-800 rounded-lg p-4">
          <h6 className="text-lg font-semibold mb-2">
            Opponent (Player {playerNumber === 1 ? 2 : 1})
          </h6>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Beyblade: {getBeybladeNameById(opponentBeyblade)}
          </p>
          <span
            className={`inline-block mt-2 px-3 py-1 rounded-full text-sm font-medium ${
              opponentReady
                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
            }`}
          >
            {opponentReady ? "Ready" : "Not Ready"}
          </span>
        </div>
      </div>

      {/* Beyblade Selection Dropdown */}
      <div className="max-w-2xl w-full">
        <h6 className="text-xl font-semibold mb-4">Choose Your Beyblade:</h6>
        <BeybladeSelect
          value={selectedBeyblade || ""}
          onChange={handleSelectBeyblade}
          label="Your Beyblade"
          disabled={isReady || loading}
        />
        {isReady && (
          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg text-blue-800 dark:text-blue-200">
            Change your selection by clicking "Not Ready" first
          </div>
        )}
      </div>

      {/* Ready Button */}
      <div className="flex gap-4">
        <button
          onClick={handleToggleReady}
          disabled={!selectedBeyblade}
          className={`px-8 py-3 rounded-lg font-medium text-lg transition-colors ${
            isReady
              ? "border-2 border-blue-600 text-blue-600 hover:bg-blue-50 dark:border-blue-500 dark:text-blue-400 dark:hover:bg-blue-900/20"
              : "bg-blue-600 hover:bg-blue-700 text-white"
          } ${!selectedBeyblade ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          {isReady ? "Not Ready" : "I'm Ready!"}
        </button>
        <button
          onClick={onCancel}
          className="px-8 py-3 rounded-lg font-medium text-lg border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        >
          Cancel
        </button>
      </div>

      {/* Info Alert */}
      {isReady && !opponentReady && (
        <div className="max-w-2xl p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg text-blue-800 dark:text-blue-200">
          Waiting for opponent to be ready...
        </div>
      )}

      {isReady && opponentReady && (
        <div className="max-w-2xl p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-green-800 dark:text-green-200">
          Both players ready! Starting game...
        </div>
      )}
    </div>
  );
};

export default MultiplayerBeybladeSelect;
