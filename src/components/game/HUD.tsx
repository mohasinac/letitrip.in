/**
 * Game HUD Component
 * Displays UI overlay (stats, controls, debug info)
 */

"use client";

import React from "react";
import type { ConnectionState, ServerBeyblade } from "@/lib/game/types";

export interface GameHUDProps {
  connectionState: ConnectionState;
  myBeyblade: ServerBeyblade | null;
  showControls?: boolean;
  showDebug?: boolean;
}

export function GameHUD({
  connectionState,
  myBeyblade,
  showControls = true,
  showDebug = false,
}: GameHUDProps) {
  return (
    <div className="absolute inset-0 pointer-events-none">
      {/* Connection Status */}
      <div className="absolute top-4 right-4 pointer-events-auto">
        <ConnectionBadge state={connectionState} />
      </div>

      {/* Player Stats */}
      {myBeyblade && (
        <div className="absolute top-4 left-4 bg-gray-900/80 backdrop-blur-sm rounded-lg p-4 border border-gray-700 pointer-events-auto">
          <div className="text-white space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              <span className="font-semibold">{myBeyblade.username}</span>
            </div>

            <div className="space-y-1 text-sm">
              <StatBar
                label="Health"
                value={myBeyblade.health}
                max={100}
                color="red"
              />
              <StatBar
                label="Stamina"
                value={myBeyblade.stamina}
                max={100}
                color="blue"
              />
            </div>
          </div>
        </div>
      )}

      {/* Controls Help */}
      {showControls && (
        <div className="absolute bottom-4 left-4 bg-gray-900/80 backdrop-blur-sm rounded-lg p-4 border border-gray-700 pointer-events-auto">
          <h3 className="text-white font-semibold mb-2">Controls</h3>
          <div className="text-gray-300 text-sm space-y-1">
            <div>
              <kbd className="px-2 py-1 bg-gray-800 rounded">WASD</kbd> Move
            </div>
            <div>
              <kbd className="px-2 py-1 bg-gray-800 rounded">Space</kbd> Charge
            </div>
            <div>
              <kbd className="px-2 py-1 bg-gray-800 rounded">Shift</kbd> Dash
            </div>
            <div>
              <kbd className="px-2 py-1 bg-gray-800 rounded">E</kbd> Special
              Move
            </div>
          </div>
        </div>
      )}

      {/* Debug Info */}
      {showDebug && myBeyblade && (
        <div className="absolute bottom-4 right-4 bg-gray-900/80 backdrop-blur-sm rounded-lg p-4 border border-gray-700 pointer-events-auto">
          <h3 className="text-white font-semibold mb-2">Debug</h3>
          <div className="text-gray-300 text-xs font-mono space-y-1">
            <div>X: {myBeyblade.x.toFixed(2)}</div>
            <div>Y: {myBeyblade.y.toFixed(2)}</div>
            <div>Rotation: {myBeyblade.rotation.toFixed(2)}</div>
            <div>Velocity X: {myBeyblade.velocityX.toFixed(2)}</div>
            <div>Velocity Y: {myBeyblade.velocityY.toFixed(2)}</div>
            <div>Angular: {myBeyblade.angularVelocity.toFixed(2)}</div>
          </div>
        </div>
      )}
    </div>
  );
}

function ConnectionBadge({ state }: { state: ConnectionState }) {
  const colors = {
    disconnected: "bg-gray-500",
    connecting: "bg-yellow-500 animate-pulse",
    connected: "bg-green-500",
    reconnecting: "bg-orange-500 animate-pulse",
    error: "bg-red-500",
  };

  const labels = {
    disconnected: "Disconnected",
    connecting: "Connecting...",
    connected: "Connected",
    reconnecting: "Reconnecting...",
    error: "Connection Error",
  };

  return (
    <div className="flex items-center gap-2 bg-gray-900/80 backdrop-blur-sm rounded-lg px-3 py-2 border border-gray-700">
      <div className={`w-2 h-2 rounded-full ${colors[state]}`}></div>
      <span className="text-white text-sm font-medium">{labels[state]}</span>
    </div>
  );
}

function StatBar({
  label,
  value,
  max,
  color,
}: {
  label: string;
  value: number;
  max: number;
  color: string;
}) {
  const percentage = (value / max) * 100;

  const colorClasses = {
    red: "bg-red-500",
    blue: "bg-blue-500",
    green: "bg-green-500",
    yellow: "bg-yellow-500",
  };

  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span>{label}</span>
        <span>
          {value}/{max}
        </span>
      </div>
      <div className="w-32 h-2 bg-gray-700 rounded-full overflow-hidden">
        <div
          className={`h-full ${
            colorClasses[color as keyof typeof colorClasses] || "bg-gray-500"
          } transition-all duration-300`}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
}

export default GameHUD;
