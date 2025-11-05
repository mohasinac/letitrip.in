/**
 * Tryout Mode Game Component
 * Example implementation using Colyseus client
 */

"use client";

import React, { useEffect, useRef, useState } from "react";
import { useColyseusGame, useGameInput } from "@/lib/game/hooks/useColyseusGame";
import type { ServerBeyblade } from "@/lib/game/client/ColyseusClient";

interface TryoutModeProps {
  userId: string;
  username: string;
  beybladeId: string;
  arenaId: string;
  serverUrl?: string;
}

export function TryoutModeGame({
  userId,
  username,
  beybladeId,
  arenaId,
  serverUrl = "ws://localhost:2567",
}: TryoutModeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [showControls, setShowControls] = useState(true);
  
  // Connect to Colyseus server
  const {
    isConnected,
    isConnecting,
    error,
    myBeyblade,
    beyblades,
    arena,
    connect,
    disconnect,
    sendInput,
    sendAction,
  } = useColyseusGame({
    serverUrl,
    roomType: "tryout",
  });
  
  // Handle keyboard input
  useGameInput(sendInput, sendAction, isConnected);
  
  // Auto-connect on mount
  useEffect(() => {
    connect({ userId, username, beybladeId, arenaId });
    
    return () => {
      disconnect();
    };
  }, [userId, username, beybladeId, arenaId]);
  
  // Render loop
  useEffect(() => {
    if (!isConnected || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    let animationId: number;
    
    const render = () => {
      // Clear canvas
      ctx.fillStyle = "#1a1a2e";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      if (!arena) {
        animationId = requestAnimationFrame(render);
        return;
      }
      
      // Scale and center
      const scale = canvas.width / arena.width;
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.scale(scale, scale);
      
      // Draw arena
      ctx.strokeStyle = "#00d4ff";
      ctx.lineWidth = 2 / scale;
      
      if (arena.shape === "circle") {
        const radius = Math.min(arena.width, arena.height) / 2;
        ctx.beginPath();
        ctx.arc(0, 0, radius, 0, Math.PI * 2);
        ctx.stroke();
      } else {
        // Rectangle
        ctx.strokeRect(
          -arena.width / 2,
          -arena.height / 2,
          arena.width,
          arena.height
        );
      }
      
      // Draw beyblades
      beyblades.forEach((beyblade) => {
        const x = beyblade.x - arena.width / 2;
        const y = beyblade.y - arena.height / 2;
        
        // Beyblade body
        ctx.fillStyle = beyblade.id === myBeyblade?.id ? "#4ecca3" : "#ff6b6b";
        ctx.beginPath();
        ctx.arc(x, y, beyblade.radius, 0, Math.PI * 2);
        ctx.fill();
        
        // Rotation indicator
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 1 / scale;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(
          x + Math.cos(beyblade.rotation) * beyblade.radius,
          y + Math.sin(beyblade.rotation) * beyblade.radius
        );
        ctx.stroke();
        
        // Username
        ctx.fillStyle = "#ffffff";
        ctx.font = `${12 / scale}px Arial`;
        ctx.textAlign = "center";
        ctx.fillText(beyblade.username, x, y - beyblade.radius - 5 / scale);
      });
      
      ctx.restore();
      
      // Draw HUD
      if (myBeyblade) {
        // Health bar
        ctx.fillStyle = "#ff6b6b";
        ctx.fillRect(20, 20, 200, 20);
        ctx.fillStyle = "#4ecca3";
        ctx.fillRect(20, 20, (myBeyblade.health / 100) * 200, 20);
        ctx.strokeStyle = "#ffffff";
        ctx.strokeRect(20, 20, 200, 20);
        
        // Stamina bar
        ctx.fillStyle = "#95e1d3";
        ctx.fillRect(20, 50, 200, 20);
        ctx.fillStyle = "#4ecca3";
        ctx.fillRect(20, 50, (myBeyblade.stamina / 100) * 200, 20);
        ctx.strokeStyle = "#ffffff";
        ctx.strokeRect(20, 50, 200, 20);
        
        // Labels
        ctx.fillStyle = "#ffffff";
        ctx.font = "14px Arial";
        ctx.textAlign = "left";
        ctx.fillText(`Health: ${Math.round(myBeyblade.health)}%`, 230, 35);
        ctx.fillText(`Stamina: ${Math.round(myBeyblade.stamina)}%`, 230, 65);
        
        // Velocity indicator
        const speed = Math.sqrt(
          myBeyblade.velocityX ** 2 + myBeyblade.velocityY ** 2
        );
        ctx.fillText(`Speed: ${speed.toFixed(2)}`, 20, 90);
        ctx.fillText(`Spin: ${myBeyblade.angularVelocity.toFixed(2)}`, 20, 110);
      }
      
      animationId = requestAnimationFrame(render);
    };
    
    render();
    
    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [isConnected, beyblades, arena, myBeyblade]);
  
  return (
    <div className="relative w-full h-screen bg-gray-900">
      {/* Connection Status */}
      <div className="absolute top-4 right-4 z-10">
        <div
          className={`px-4 py-2 rounded-lg ${
            isConnected
              ? "bg-green-500 text-white"
              : isConnecting
              ? "bg-yellow-500 text-white"
              : "bg-red-500 text-white"
          }`}
        >
          {isConnected
            ? "✅ Connected"
            : isConnecting
            ? "🔄 Connecting..."
            : "❌ Disconnected"}
        </div>
        
        {error && (
          <div className="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg">
            Error: {error.message}
          </div>
        )}
      </div>
      
      {/* Controls Hint */}
      {showControls && isConnected && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10 bg-black bg-opacity-75 text-white px-6 py-4 rounded-lg">
          <button
            onClick={() => setShowControls(false)}
            className="absolute top-2 right-2 text-gray-400 hover:text-white"
          >
            ✕
          </button>
          <h3 className="font-bold mb-2">Controls:</h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>WASD / Arrow Keys</div>
            <div>Move</div>
            <div>Space</div>
            <div>Charge</div>
            <div>Shift</div>
            <div>Dash</div>
            <div>E</div>
            <div>Special Move</div>
          </div>
        </div>
      )}
      
      {/* Game Canvas */}
      <canvas
        ref={canvasRef}
        width={800}
        height={800}
        className="w-full h-full"
      />
      
      {/* Debug Info */}
      {process.env.NODE_ENV === "development" && arena && (
        <div className="absolute bottom-4 right-4 z-10 bg-black bg-opacity-75 text-white px-4 py-2 rounded-lg text-xs font-mono">
          <div>Arena: {arena.name}</div>
          <div>Shape: {arena.shape}</div>
          <div>Size: {arena.width}x{arena.height}</div>
          <div>Beyblades: {beyblades.length}</div>
        </div>
      )}
    </div>
  );
}
