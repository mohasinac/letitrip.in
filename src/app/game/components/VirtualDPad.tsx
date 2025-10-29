"use client";

import React from "react";
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

  const handleActionPress = (action: 1 | 2 | 3 | 4) => {
    if (onActionButton) {
      onActionButton(action);
    }
  };

  const buttonClass = `w-16 h-16 rounded-full flex items-center justify-center font-bold text-xl shadow-md transition-all duration-150 active:scale-95 select-none`;

  return (
    <div
      className={`relative ${className}`}
      style={{ display: "flex", gap: "12px", alignItems: "center" }}
    >
      {/* D-Pad Container */}
      <div className="relative" style={{ width: "70px", height: "70px" }}>
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

      {/* Action Buttons Grid */}
      <div className="grid grid-cols-2 gap-1" style={{ width: "70px" }}>
        {/* Button 1 - Dodge Right */}
        <button
          className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold transition-all duration-150 active:scale-95 select-none shadow-md"
          style={{
            backgroundColor: "#22C55ECC",
            border: "2px solid rgba(255, 255, 255, 0.3)",
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
          1
        </button>

        {/* Button 2 - Heavy Attack */}
        <button
          className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold transition-all duration-150 active:scale-95 select-none shadow-md"
          style={{
            backgroundColor: "#FB923CCC",
            border: "2px solid rgba(255, 255, 255, 0.3)",
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
          2
        </button>

        {/* Button 3 - Dodge Left */}
        <button
          className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold transition-all duration-150 active:scale-95 select-none shadow-md"
          style={{
            backgroundColor: "#22C55ECC",
            border: "2px solid rgba(255, 255, 255, 0.3)",
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
          3
        </button>

        {/* Button 4 - Ultimate Attack */}
        <button
          className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold transition-all duration-150 active:scale-95 select-none shadow-md"
          style={{
            backgroundColor: "#EF4444CC",
            border: "2px solid rgba(255, 255, 255, 0.3)",
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
          4
        </button>
      </div>
    </div>
  );
};

export default VirtualDPad;
