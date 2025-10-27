"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";
import { GameState, GameBeyblade, Stadium, Vector2D } from "../types/game";
import {
  updateBeyblade,
  checkCollision,
  resolveCollision,
  createBeyblade,
  launchPowerAttack,
  vectorSubtract,
  vectorLength,
} from "../utils/gamePhysics";

interface BeybladeArenaProps {
  onGameEnd?: (winner: GameBeyblade | null) => void;
}

const BeybladeArena: React.FC<BeybladeArenaProps> = ({ onGameEnd }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameLoopRef = useRef<number>();
  const lastTimeRef = useRef<number>(0);
  const mouseRef = useRef<Vector2D>({ x: 0, y: 0 });
  const isMouseDownRef = useRef(false);

  const [gameState, setGameState] = useState<GameState>(() => {
    const stadium: Stadium = {
      center: { x: 400, y: 300 },
      innerRadius: 200,
      outerRadius: 280,
      width: 800,
      height: 600,
    };

    const playerBey = createBeyblade(
      "player",
      "dragoon-gt",
      { x: 350, y: 250 },
      true
    );
    const aiBey = createBeyblade("ai", "spriggan", { x: 450, y: 350 }, false);

    return {
      beyblades: [playerBey, aiBey],
      stadium,
      isPlaying: true,
      winner: null,
      gameTime: 0,
    };
  });

  const [selectedBeyblade, setSelectedBeyblade] = useState("dragoon-gt");

  // Mouse event handlers
  const handleMouseMove = useCallback(
    (event: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      mouseRef.current = {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
      };
    },
    []
  );

  const handleMouseDown = useCallback(
    (event: React.MouseEvent<HTMLCanvasElement>) => {
      event.preventDefault();
      isMouseDownRef.current = true;

      const playerBey = gameState.beyblades.find((b) => b.isPlayer);
      if (playerBey) {
        playerBey.isCharging = true;
      }
    },
    [gameState.beyblades]
  );

  const handleMouseUp = useCallback(
    (event: React.MouseEvent<HTMLCanvasElement>) => {
      event.preventDefault();
      isMouseDownRef.current = false;

      const playerBey = gameState.beyblades.find((b) => b.isPlayer);
      if (playerBey && playerBey.isCharging) {
        const direction = vectorSubtract(mouseRef.current, playerBey.position);
        launchPowerAttack(playerBey, direction);
      }
    },
    [gameState.beyblades]
  );

  // Game loop
  const gameLoop = useCallback(
    (currentTime: number) => {
      const deltaTime = (currentTime - lastTimeRef.current) / 1000; // Convert to seconds
      lastTimeRef.current = currentTime;

      setGameState((prevState) => {
        if (!prevState.isPlaying) return prevState;

        const newState = { ...prevState };

        // Update all beyblades
        newState.beyblades.forEach((beyblade) => {
          updateBeyblade(beyblade, deltaTime, newState.stadium);
        });

        // Check collisions between beyblades
        for (let i = 0; i < newState.beyblades.length; i++) {
          for (let j = i + 1; j < newState.beyblades.length; j++) {
            const bey1 = newState.beyblades[i];
            const bey2 = newState.beyblades[j];

            if (checkCollision(bey1, bey2)) {
              resolveCollision(bey1, bey2);
            }
          }
        }

        // Check win conditions
        const aliveBeyblades = newState.beyblades.filter(
          (b) => !b.isDead && !b.isOutOfBounds
        );

        if (aliveBeyblades.length <= 1) {
          newState.isPlaying = false;
          newState.winner =
            aliveBeyblades.length === 1 ? aliveBeyblades[0] : null;

          if (onGameEnd) {
            onGameEnd(newState.winner);
          }
        }

        newState.gameTime += deltaTime;

        return newState;
      });

      if (gameState.isPlaying) {
        gameLoopRef.current = requestAnimationFrame(gameLoop);
      }
    },
    [gameState.isPlaying, onGameEnd]
  );

  // Rendering
  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw stadium background
    const stadium = gameState.stadium;

    // Outer stadium (wood texture simulation)
    ctx.fillStyle = "#8B4513";
    ctx.beginPath();
    ctx.arc(
      stadium.center.x,
      stadium.center.y,
      stadium.outerRadius,
      0,
      Math.PI * 2
    );
    ctx.fill();

    // Inner arena (battle area)
    ctx.fillStyle = "#F5F5DC";
    ctx.beginPath();
    ctx.arc(
      stadium.center.x,
      stadium.center.y,
      stadium.innerRadius,
      0,
      Math.PI * 2
    );
    ctx.fill();

    // Stadium rim
    ctx.strokeStyle = "#654321";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(
      stadium.center.x,
      stadium.center.y,
      stadium.innerRadius,
      0,
      Math.PI * 2
    );
    ctx.stroke();

    // Draw beyblades
    gameState.beyblades.forEach((beyblade) => {
      if (beyblade.isOutOfBounds) return;

      ctx.save();
      ctx.translate(beyblade.position.x, beyblade.position.y);
      ctx.rotate(beyblade.rotation);

      // Draw beyblade shadow
      ctx.fillStyle = "rgba(0, 0, 0, 0.2)";
      ctx.beginPath();
      ctx.arc(2, 2, beyblade.radius, 0, Math.PI * 2);
      ctx.fill();

      // Draw beyblade body
      const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, beyblade.radius);
      if (beyblade.isPlayer) {
        gradient.addColorStop(0, "#4A90E2");
        gradient.addColorStop(1, "#2171B5");
      } else {
        gradient.addColorStop(0, "#E24A4A");
        gradient.addColorStop(1, "#B52121");
      }

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(0, 0, beyblade.radius, 0, Math.PI * 2);
      ctx.fill();

      // Draw spin effect
      if (beyblade.spin > 0) {
        const spinAlpha = beyblade.spin / 100;
        ctx.strokeStyle = `rgba(255, 255, 255, ${spinAlpha * 0.8})`;
        ctx.lineWidth = 2;

        for (let i = 0; i < 6; i++) {
          const angle = (i * Math.PI * 2) / 6;
          const startRadius = beyblade.radius * 0.3;
          const endRadius = beyblade.radius * 0.8;

          ctx.beginPath();
          ctx.moveTo(
            Math.cos(angle) * startRadius,
            Math.sin(angle) * startRadius
          );
          ctx.lineTo(Math.cos(angle) * endRadius, Math.sin(angle) * endRadius);
          ctx.stroke();
        }
      }

      // Draw charging effect
      if (beyblade.isCharging && beyblade.chargeLevel > 0) {
        const chargeRadius =
          beyblade.radius + (beyblade.chargeLevel / 100) * 20;
        ctx.strokeStyle = `rgba(255, 215, 0, ${beyblade.chargeLevel / 100})`;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(0, 0, chargeRadius, 0, Math.PI * 2);
        ctx.stroke();
      }

      ctx.restore();

      // Draw spin meter above beyblade
      const meterWidth = 40;
      const meterHeight = 6;
      const meterX = beyblade.position.x - meterWidth / 2;
      const meterY = beyblade.position.y - beyblade.radius - 15;

      // Meter background
      ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
      ctx.fillRect(meterX, meterY, meterWidth, meterHeight);

      // Meter fill
      const fillWidth = (beyblade.spin / 100) * meterWidth;
      const fillColor =
        beyblade.spin > 60
          ? "#4CAF50"
          : beyblade.spin > 30
          ? "#FFC107"
          : "#F44336";
      ctx.fillStyle = fillColor;
      ctx.fillRect(meterX, meterY, fillWidth, meterHeight);
    });

    // Draw UI
    ctx.font = "16px Arial";
    ctx.fillStyle = "#333";
    ctx.fillText(`Game Time: ${gameState.gameTime.toFixed(1)}s`, 10, 30);

    if (!gameState.isPlaying && gameState.winner) {
      ctx.font = "bold 32px Arial";
      ctx.fillStyle = "#FF6B35";
      ctx.textAlign = "center";
      ctx.fillText(
        `${gameState.winner.config.name} Wins!`,
        canvas.width / 2,
        50
      );
      ctx.textAlign = "left";
    }

    // Draw instructions
    if (gameState.isPlaying) {
      ctx.font = "14px Arial";
      ctx.fillStyle = "#666";
      ctx.fillText(
        "Hold mouse to charge, release to attack!",
        10,
        canvas.height - 20
      );
    }
  }, [gameState]);

  // Setup game loop and rendering
  useEffect(() => {
    render();

    if (gameState.isPlaying) {
      gameLoopRef.current = requestAnimationFrame(gameLoop);
    }

    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [gameLoop, render, gameState.isPlaying]);

  const restartGame = () => {
    const stadium: Stadium = {
      center: { x: 400, y: 300 },
      innerRadius: 200,
      outerRadius: 280,
      width: 800,
      height: 600,
    };

    const playerBey = createBeyblade(
      "player",
      selectedBeyblade,
      { x: 350, y: 250 },
      true
    );
    const aiBey = createBeyblade("ai", "spriggan", { x: 450, y: 350 }, false);

    setGameState({
      beyblades: [playerBey, aiBey],
      stadium,
      isPlaying: true,
      winner: null,
      gameTime: 0,
    });
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="flex items-center space-x-4 mb-4">
        <select
          value={selectedBeyblade}
          onChange={(e) => setSelectedBeyblade(e.target.value)}
          className="px-3 py-1 border rounded"
          disabled={gameState.isPlaying}
        >
          <option value="dragoon-gt">Dragoon GT</option>
          <option value="dg-gt">DG GT</option>
          <option value="pegasus">Pegasus</option>
          <option value="valkyrie">Valkyrie</option>
          <option value="spriggan">Spriggan</option>
          <option value="meteo">Meteo</option>
          <option value="dran-buster">Dran Buster</option>
          <option value="dz-gt">DZ GT</option>
          <option value="hells-hammer">Hells Hammer</option>
        </select>

        <button
          onClick={restartGame}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          {gameState.isPlaying ? "Restart" : "New Game"}
        </button>
      </div>

      <div className="relative">
        <canvas
          ref={canvasRef}
          width={800}
          height={600}
          className="border-2 border-gray-300 rounded-lg cursor-crosshair"
          onMouseMove={handleMouseMove}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onContextMenu={(e) => e.preventDefault()}
        />
      </div>

      <div className="text-center text-sm text-gray-600 max-w-2xl">
        <p>
          <strong>How to Play:</strong>
        </p>
        <p>• Use your mouse to control the blue Beyblade</p>
        <p>• Hold mouse button to charge a powerful attack</p>
        <p>• Collisions exchange spin between Beyblades</p>
        <p>
          • Game ends when a Beyblade runs out of spin or goes out of bounds
        </p>
      </div>
    </div>
  );
};

export default BeybladeArena;
