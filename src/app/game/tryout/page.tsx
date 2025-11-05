"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useGame } from "@/contexts/GameContext";
import { useGameConnection } from "@/hooks/game/useGameConnection";
import { useGameInput } from "@/hooks/game/useGameInput";
import Canvas from "@/components/game/Canvas";
import HUD from "@/components/game/HUD";
import { Loader2, AlertCircle, Maximize, Minimize } from "lucide-react";

// Game resolution constants (720p)
const GAME_WIDTH = 1280;
const GAME_HEIGHT = 720;

export default function TryoutGamePage() {
  const router = useRouter();
  const { settings } = useGame();
  const { input } = useGameInput();
  const [showDebug, setShowDebug] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Redirect if no game config
  useEffect(() => {
    if (
      !settings.beybladeId ||
      !settings.arenaId ||
      settings.gameMode !== "tryout"
    ) {
      router.push("/game/tryout/select");
    }
  }, [settings, router]);

  const {
    connectionState,
    gameState,
    beyblades,
    connect,
    disconnect,
    sendInput,
    sendAction,
  } = useGameConnection({
    serverUrl: "ws://localhost:2567",
  });

  // Connect when component mounts
  useEffect(() => {
    if (
      settings.beybladeId &&
      settings.arenaId &&
      connectionState === "disconnected"
    ) {
      // TODO: Get actual userId and username from auth context
      connect("game", {
        userId: "guest-" + Math.random().toString(36).substr(2, 9),
        username: "Guest Player",
        beybladeId: settings.beybladeId,
        arenaId: settings.arenaId,
      });
    }
  }, [settings, connectionState, connect]);

  // Send input to server
  useEffect(() => {
    if (connectionState === "connected" && gameState) {
      if (input.direction.x !== 0 || input.direction.y !== 0) {
        sendInput(input.direction);
      }
    }
  }, [input, connectionState, gameState, sendInput]);

  // Handle special actions
  useEffect(() => {
    if (connectionState === "connected") {
      if (input.charging) {
        sendAction("charge");
      } else if (input.dashing) {
        sendAction("dash");
      } else if (input.specialMove) {
        sendAction("special");
      }
    }
  }, [
    input.charging,
    input.dashing,
    input.specialMove,
    connectionState,
    sendAction,
  ]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (connectionState === "connected") {
        disconnect();
      }
    };
  }, [connectionState, disconnect]);

  // Toggle debug with F3
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "F3") {
        e.preventDefault();
        setShowDebug((prev) => !prev);
      } else if (e.key === "F11") {
        e.preventDefault();
        toggleFullscreen();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Fullscreen toggle function
  const toggleFullscreen = async () => {
    if (!containerRef.current) return;

    try {
      if (!document.fullscreenElement) {
        await containerRef.current.requestFullscreen();
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch (err) {
      console.error("Error toggling fullscreen:", err);
    }
  };

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  // Auto-hide controls after inactivity
  const handleMouseMove = () => {
    setShowControls(true);

    // Clear existing timeout
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }

    // Hide controls after 3 seconds of inactivity
    controlsTimeoutRef.current = setTimeout(() => {
      if (isFullscreen) {
        setShowControls(false);
      }
    }, 3000);
  };

  useEffect(() => {
    // Always show controls when not in fullscreen
    if (!isFullscreen) {
      setShowControls(true);
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    }
  }, [isFullscreen]);

  // Loading state
  if (!settings.beybladeId || !settings.arenaId) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Redirecting to selection...</p>
        </div>
      </div>
    );
  }

  if (connectionState === "connecting") {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-400 text-lg">Connecting to game server...</p>
        </div>
      </div>
    );
  }

  if (connectionState === "error") {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center bg-red-500/10 border border-red-500/50 rounded-xl p-8 max-w-md">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">
            Connection Failed
          </h2>
          <p className="text-gray-400 mb-6">
            Could not connect to the game server. Please try again.
          </p>
          <button
            onClick={() => router.push("/game")}
            className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold transition-colors"
          >
            Back to Game Modes
          </button>
        </div>
      </div>
    );
  }

  // Get player's beyblade data
  const playerBeybladeId = settings.beybladeId;
  const playerBeyblade = playerBeybladeId
    ? beyblades.get(playerBeybladeId) ?? null
    : null;

  return (
    <div
      ref={containerRef}
      className="relative w-full h-screen bg-gray-900 overflow-hidden flex items-center justify-center"
      onMouseMove={handleMouseMove}
    >
      {/* Game Container with 720p aspect ratio */}
      <div
        className="relative bg-black"
        style={{
          width: isFullscreen ? "100%" : `${GAME_WIDTH}px`,
          height: isFullscreen ? "100%" : `${GAME_HEIGHT}px`,
          maxWidth: "100%",
          maxHeight: "100%",
          aspectRatio: `${GAME_WIDTH} / ${GAME_HEIGHT}`,
        }}
      >
        {/* Game Canvas */}
        <Canvas
          gameState={gameState}
          beyblades={beyblades}
          width={GAME_WIDTH}
          height={GAME_HEIGHT}
        />

        {/* Game HUD */}
        <HUD
          connectionState={connectionState}
          myBeyblade={playerBeyblade}
          showControls={true}
          showDebug={showDebug}
        />

        {/* Control Buttons */}
        <div className="absolute top-4 right-4 flex gap-2 z-50">
          {/* Fullscreen Toggle */}
          <button
            onClick={toggleFullscreen}
            className="px-3 py-2 bg-gray-800/80 hover:bg-gray-700 text-white rounded-lg font-semibold transition-colors backdrop-blur-sm flex items-center gap-2"
            title={isFullscreen ? "Exit Fullscreen (F11)" : "Fullscreen (F11)"}
          >
            {isFullscreen ? (
              <Minimize className="w-4 h-4" />
            ) : (
              <Maximize className="w-4 h-4" />
            )}
          </button>

          {/* Exit Button */}
          <button
            onClick={() => {
              disconnect();
              router.push("/game");
            }}
            className="px-4 py-2 bg-red-500/80 hover:bg-red-500 text-white rounded-lg font-semibold transition-colors backdrop-blur-sm"
          >
            Exit Game
          </button>
        </div>

        {/* Debug Toggle Hint */}
        {!showDebug && (
          <div className="absolute bottom-4 left-4 text-gray-400 text-sm backdrop-blur-sm bg-black/50 px-3 py-2 rounded">
            Press F3 for debug • F11 for fullscreen
          </div>
        )}
      </div>
    </div>
  );
}
