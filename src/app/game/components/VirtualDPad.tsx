"use client";

import React from "react";
import { useTheme } from "@mui/material/styles";

interface VirtualDPadProps {
  onDirectionChange: (direction: { x: number; y: number }) => void;
  className?: string;
}

const VirtualDPad: React.FC<VirtualDPadProps> = ({
  onDirectionChange,
  className = "",
}) => {
  const theme = useTheme();

  const handleDirectionPress = (direction: string) => {
    const directions: Record<string, { x: number; y: number }> = {
      up: { x: 0, y: -1 },
      down: { x: 0, y: 1 },
      left: { x: -1, y: 0 },
      right: { x: 1, y: 0 },
    };
    onDirectionChange(directions[direction] || { x: 0, y: 0 });
  };

  const handleDirectionRelease = () => {
    onDirectionChange({ x: 0, y: 0 });
  };

  const buttonClass = `w-16 h-16 rounded-full flex items-center justify-center font-bold text-xl shadow-md transition-all duration-150 active:scale-95 select-none`;

  return (
    <div className={`relative ${className}`}>
      <div className="absolute inset-0 bg-black/30 rounded-full backdrop-blur-sm border border-white/30"></div>

      <div className="relative flex flex-col items-center justify-center w-full h-full p-2">
        {/* Up Button */}
        <button
          className="absolute top-1 w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold transition-all duration-150 active:scale-95 select-none"
          style={{
            backgroundColor: `${theme.palette.primary.main}CC`,
          }}
          onTouchStart={(e) => {
            e.preventDefault();
            handleDirectionPress("up");
          }}
          onTouchEnd={(e) => {
            e.preventDefault();
            handleDirectionRelease();
          }}
          onMouseDown={() => handleDirectionPress("up")}
          onMouseUp={handleDirectionRelease}
          onMouseLeave={handleDirectionRelease}
        >
          ↑
        </button>

        {/* Left and Right Buttons */}
        <button
          className="absolute left-1 w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold transition-all duration-150 active:scale-95 select-none"
          style={{
            backgroundColor: `${theme.palette.primary.main}CC`,
          }}
          onTouchStart={(e) => {
            e.preventDefault();
            handleDirectionPress("left");
          }}
          onTouchEnd={(e) => {
            e.preventDefault();
            handleDirectionRelease();
          }}
          onMouseDown={() => handleDirectionPress("left")}
          onMouseUp={handleDirectionRelease}
          onMouseLeave={handleDirectionRelease}
        >
          ←
        </button>

        <button
          className="absolute right-1 w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold transition-all duration-150 active:scale-95 select-none"
          style={{
            backgroundColor: `${theme.palette.primary.main}CC`,
          }}
          onTouchStart={(e) => {
            e.preventDefault();
            handleDirectionPress("right");
          }}
          onTouchEnd={(e) => {
            e.preventDefault();
            handleDirectionRelease();
          }}
          onMouseDown={() => handleDirectionPress("right")}
          onMouseUp={handleDirectionRelease}
          onMouseLeave={handleDirectionRelease}
        >
          →
        </button>

        {/* Down Button */}
        <button
          className="absolute bottom-1 w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold transition-all duration-150 active:scale-95 select-none"
          style={{
            backgroundColor: `${theme.palette.primary.main}CC`,
          }}
          onTouchStart={(e) => {
            e.preventDefault();
            handleDirectionPress("down");
          }}
          onTouchEnd={(e) => {
            e.preventDefault();
            handleDirectionRelease();
          }}
          onMouseDown={() => handleDirectionPress("down")}
          onMouseUp={handleDirectionRelease}
          onMouseLeave={handleDirectionRelease}
        >
          ↓
        </button>

        {/* Center indicator */}
        <div
          className="w-3 h-3 rounded-full opacity-50"
          style={{ backgroundColor: theme.palette.secondary.main }}
        ></div>
      </div>
    </div>
  );
};

export default VirtualDPad;
