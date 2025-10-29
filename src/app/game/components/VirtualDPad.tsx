"use client";

import React, { useState, useRef, useEffect } from "react";
import { useTheme } from "@mui/material/styles";

interface VirtualDPadProps {
  onDirectionChange: (direction: { x: number; y: number }) => void;
  onActionButton?: (action: 1 | 2 | 3 | 4) => void;
  className?: string;
}

const VirtualDPad: React.FC<VirtualDPadProps> = ({
  onDirectionChange,
  onActionButton,
  className = "",
}) => {
  const theme = useTheme();
  const [stickPosition, setStickPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const joystickRef = useRef<HTMLDivElement>(null);

  const JOYSTICK_RADIUS = 28;
  const DEAD_ZONE = 3;

  const handleStart = (clientX: number, clientY: number) => {
    if (!joystickRef.current) return;
    setIsDragging(true);
    handleMove(clientX, clientY);
  };

  const handleMove = (clientX: number, clientY: number) => {
    if (!joystickRef.current) return;
    const rect = joystickRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    let deltaX = clientX - centerX;
    let deltaY = clientY - centerY;

    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    if (distance < DEAD_ZONE) {
      setStickPosition({ x: 0, y: 0 });
      onDirectionChange({ x: 0, y: 0 });
      return;
    }

    if (distance > JOYSTICK_RADIUS) {
      const angle = Math.atan2(deltaY, deltaX);
      deltaX = Math.cos(angle) * JOYSTICK_RADIUS;
      deltaY = Math.sin(angle) * JOYSTICK_RADIUS;
    }

    setStickPosition({ x: deltaX, y: deltaY });
    const normalizedX = deltaX / JOYSTICK_RADIUS;
    const normalizedY = deltaY / JOYSTICK_RADIUS;
    onDirectionChange({ x: normalizedX, y: normalizedY });
  };

  const handleEnd = () => {
    setIsDragging(false);
    setStickPosition({ x: 0, y: 0 });
    onDirectionChange({ x: 0, y: 0 });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    handleStart(e.clientX, e.clientY);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;
    handleMove(e.clientX, e.clientY);
  };

  const handleMouseUp = () => {
    handleEnd();
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    if (e.touches.length > 0) {
      handleStart(e.touches[0].clientX, e.touches[0].clientY);
    }
  };

  const handleTouchMove = (e: TouchEvent) => {
    e.preventDefault();
    if (e.touches.length > 0) {
      handleMove(e.touches[0].clientX, e.touches[0].clientY);
    }
  };

  const handleTouchEnd = (e: TouchEvent) => {
    e.preventDefault();
    handleEnd();
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
      window.addEventListener("touchmove", handleTouchMove, { passive: false });
      window.addEventListener("touchend", handleTouchEnd);

      return () => {
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("mouseup", handleMouseUp);
        window.removeEventListener("touchmove", handleTouchMove);
        window.removeEventListener("touchend", handleTouchEnd);
      };
    }
  }, [isDragging, stickPosition]);

  const handleActionPress = (action: 1 | 2 | 3 | 4) => {
    if (onActionButton) {
      onActionButton(action);
    }
  };

  return (
    <div
      className={`relative ${className}`}
      style={{
        display: "flex",
        gap: "16px",
        alignItems: "center",
        padding: "8px",
      }}
    >
      <div className="relative" style={{ width: "90px", height: "90px" }}>
        <div
          className="absolute inset-0 rounded-full border-4"
          style={{
            backgroundColor: "rgba(0, 0, 0, 0.4)",
            borderColor: `${theme.palette.primary.main}80`,
            boxShadow: `0 0 20px ${theme.palette.primary.main}40, inset 0 0 15px rgba(0,0,0,0.5)`,
          }}
        >
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="absolute top-2 text-white/40 text-xs font-bold">
              ▲
            </div>
            <div className="absolute bottom-2 text-white/40 text-xs font-bold">
              ▼
            </div>
            <div className="absolute left-2 text-white/40 text-xs font-bold">
              ◄
            </div>
            <div className="absolute right-2 text-white/40 text-xs font-bold">
              ►
            </div>
          </div>
        </div>

        <div
          ref={joystickRef}
          className="absolute inset-0 flex items-center justify-center cursor-grab active:cursor-grabbing"
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
          style={{ touchAction: "none" }}
        >
          <div
            className="absolute rounded-full transition-all shadow-lg"
            style={{
              width: "36px",
              height: "36px",
              backgroundColor: isDragging
                ? theme.palette.primary.main
                : theme.palette.secondary.main,
              transform: `translate(${stickPosition.x}px, ${stickPosition.y}px)`,
              border: "3px solid rgba(255, 255, 255, 0.6)",
              boxShadow: isDragging
                ? `0 0 20px ${theme.palette.primary.main}, 0 4px 8px rgba(0,0,0,0.4)`
                : "0 2px 6px rgba(0,0,0,0.3)",
              transition: isDragging ? "none" : "all 0.2s ease-out",
            }}
          >
            <div
              className="absolute inset-0 m-auto rounded-full"
              style={{
                width: "8px",
                height: "8px",
                backgroundColor: "rgba(255, 255, 255, 0.9)",
                boxShadow: "0 0 4px rgba(255,255,255,0.5)",
              }}
            />
          </div>

          {isDragging && (
            <div
              className="absolute rounded-full border-2 animate-pulse"
              style={{
                width: "70px",
                height: "70px",
                borderColor: `${theme.palette.primary.main}60`,
                pointerEvents: "none",
              }}
            />
          )}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <div className="text-white/60 text-[10px] font-bold text-center mb-1">
          ACTIONS
        </div>
        <div className="grid grid-cols-2 gap-2">
          <button
            className="w-10 h-10 rounded-lg flex flex-col items-center justify-center text-white text-[10px] font-bold transition-all duration-150 active:scale-90 select-none shadow-lg"
            style={{
              backgroundColor: "#22C55E",
              border: "2px solid rgba(255, 255, 255, 0.4)",
              boxShadow: "0 2px 8px rgba(34, 197, 94, 0.5)",
            }}
            onTouchStart={(e) => {
              e.preventDefault();
              handleActionPress(1);
            }}
            onMouseDown={(e) => {
              e.preventDefault();
              handleActionPress(1);
            }}
          >
            <div className="text-lg">◄</div>
            <div>1</div>
          </button>

          <button
            className="w-10 h-10 rounded-lg flex flex-col items-center justify-center text-white text-[10px] font-bold transition-all duration-150 active:scale-90 select-none shadow-lg"
            style={{
              backgroundColor: "#22C55E",
              border: "2px solid rgba(255, 255, 255, 0.4)",
              boxShadow: "0 2px 8px rgba(34, 197, 94, 0.5)",
            }}
            onTouchStart={(e) => {
              e.preventDefault();
              handleActionPress(2);
            }}
            onMouseDown={(e) => {
              e.preventDefault();
              handleActionPress(2);
            }}
          >
            <div className="text-lg">►</div>
            <div>2</div>
          </button>

          <button
            className="w-10 h-10 rounded-lg flex flex-col items-center justify-center text-white text-[10px] font-bold transition-all duration-150 active:scale-90 select-none shadow-lg"
            style={{
              backgroundColor: "#FB923C",
              border: "2px solid rgba(255, 255, 255, 0.4)",
              boxShadow: "0 2px 8px rgba(251, 146, 60, 0.5)",
            }}
            onTouchStart={(e) => {
              e.preventDefault();
              handleActionPress(3);
            }}
            onMouseDown={(e) => {
              e.preventDefault();
              handleActionPress(3);
            }}
          >
            <div className="text-lg">⚔</div>
            <div>3</div>
          </button>

          <button
            className="w-10 h-10 rounded-lg flex flex-col items-center justify-center text-white text-[10px] font-bold transition-all duration-150 active:scale-90 select-none shadow-lg"
            style={{
              backgroundColor: "#EF4444",
              border: "2px solid rgba(255, 255, 255, 0.4)",
              boxShadow: "0 2px 8px rgba(239, 68, 68, 0.5)",
            }}
            onTouchStart={(e) => {
              e.preventDefault();
              handleActionPress(4);
            }}
            onMouseDown={(e) => {
              e.preventDefault();
              handleActionPress(4);
            }}
          >
            <div className="text-lg">⚡</div>
            <div>4</div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default VirtualDPad;
