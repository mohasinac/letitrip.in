"use client";

import React, { useCallback } from "react";
import { GameBeyblade } from "../types/game";

interface MobileSpecialButtonsProps {
  onActionButton: (action: 1 | 2 | 3 | 4) => void;
  disabled?: boolean;
  playerBeyblade?: GameBeyblade; // Add player beyblade for power checking
}

const MobileSpecialButtonsComponent: React.FC<MobileSpecialButtonsProps> = ({
  onActionButton,
  disabled = false,
  playerBeyblade,
}) => {
  // Power requirements for each action
  const powerRequirements = {
    1: 10, // Dodge Left
    2: 10, // Dodge Right
    3: 15, // Heavy Attack
    4: 25, // Special Move
  };

  // Check if action can be performed based on power
  const canPerformAction = (action: 1 | 2 | 3 | 4): boolean => {
    if (!playerBeyblade) return true; // If no beyblade data, show all buttons
    const currentPower = playerBeyblade.power || 0;
    return currentPower >= powerRequirements[action];
  };

  // Optimized press handler with haptic feedback
  const handlePress = useCallback(
    (action: 1 | 2 | 3 | 4, e: React.TouchEvent | React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      if (!disabled && canPerformAction(action)) {
        // Haptic feedback for mobile devices
        if ("vibrate" in navigator) {
          navigator.vibrate(10); // Short vibration (10ms)
        }
        onActionButton(action);
      }
    },
    [disabled, onActionButton, playerBeyblade]
  );

  const baseButtonClass = `absolute w-[70px] h-[70px] sm:w-[75px] sm:h-[75px] md:w-20 md:h-20 rounded-full flex flex-col items-center justify-center text-2xl sm:text-3xl md:text-4xl font-bold text-white select-none transition-transform duration-100 border-4 border-white/40 shadow-lg ${
    disabled
      ? "cursor-not-allowed opacity-40"
      : "cursor-pointer opacity-90 active:scale-90 active:opacity-100"
  }`;

  const labelClass = "text-[0.7rem] sm:text-xs mt-0.5 opacity-90 font-semibold";

  return (
    <>
      {/* Top-Left: Dodge Left (Button 1) - Positioned below HUD */}
      {canPerformAction(1) && (
        <div
          className={`${baseButtonClass} top-[105px] sm:top-[115px] md:top-[125px] left-2 sm:left-3 md:left-4`}
          style={{
            background:
              "linear-gradient(135deg, rgba(34, 197, 94, 0.95), rgba(22, 163, 74, 0.95))",
            boxShadow:
              "0 4px 16px rgba(34, 197, 94, 0.5), inset 0 2px 4px rgba(255,255,255,0.25)",
            WebkitTapHighlightColor: "transparent",
            touchAction: "manipulation",
            willChange: "transform",
          }}
          onTouchStart={(e) => handlePress(1, e)}
          onMouseDown={(e) => handlePress(1, e)}
        >
          <div>◄</div>
          <div className={labelClass}>DODGE L</div>
        </div>
      )}

      {/* Top-Right: Dodge Right (Button 2) - Positioned below HUD */}
      {canPerformAction(2) && (
        <div
          className={`${baseButtonClass} top-[105px] sm:top-[115px] md:top-[125px] right-2 sm:right-3 md:right-4`}
          style={{
            background:
              "linear-gradient(135deg, rgba(34, 197, 94, 0.95), rgba(22, 163, 74, 0.95))",
            boxShadow:
              "0 4px 16px rgba(34, 197, 94, 0.5), inset 0 2px 4px rgba(255,255,255,0.25)",
            WebkitTapHighlightColor: "transparent",
            touchAction: "manipulation",
            willChange: "transform",
          }}
          onTouchStart={(e) => handlePress(2, e)}
          onMouseDown={(e) => handlePress(2, e)}
        >
          <div>►</div>
          <div className={labelClass}>DODGE R</div>
        </div>
      )}

      {/* Bottom-Left: Heavy Attack (Button 3) */}
      {canPerformAction(3) && (
        <div
          className={`${baseButtonClass} bottom-2 sm:bottom-3 md:bottom-4 left-2 sm:left-3 md:left-4`}
          style={{
            background:
              "linear-gradient(135deg, rgba(251, 146, 60, 0.95), rgba(249, 115, 22, 0.95))",
            boxShadow:
              "0 4px 16px rgba(251, 146, 60, 0.5), inset 0 2px 4px rgba(255,255,255,0.25)",
            WebkitTapHighlightColor: "transparent",
            touchAction: "manipulation",
            willChange: "transform",
          }}
          onTouchStart={(e) => handlePress(3, e)}
          onMouseDown={(e) => handlePress(3, e)}
        >
          <div>⚔</div>
          <div className={labelClass}>HEAVY</div>
        </div>
      )}

      {/* Bottom-Right: Special Move (Button 4) - Changed from ULTIMATE */}
      {canPerformAction(4) && (
        <div
          className={`${baseButtonClass} bottom-2 sm:bottom-3 md:bottom-4 right-2 sm:right-3 md:right-4`}
          style={{
            background:
              "linear-gradient(135deg, rgba(147, 51, 234, 0.95), rgba(126, 34, 206, 0.95))",
            boxShadow:
              "0 4px 16px rgba(147, 51, 234, 0.5), inset 0 2px 4px rgba(255,255,255,0.25)",
            WebkitTapHighlightColor: "transparent",
            touchAction: "manipulation",
            willChange: "transform",
          }}
          onTouchStart={(e) => handlePress(4, e)}
          onMouseDown={(e) => handlePress(4, e)}
        >
          <div>✨</div>
          <div className={labelClass}>SPECIAL</div>
        </div>
      )}
    </>
  );
};

// Memoized export for performance
const MobileSpecialButtons = React.memo(MobileSpecialButtonsComponent);
MobileSpecialButtons.displayName = "MobileSpecialButtons";

export default MobileSpecialButtons;
