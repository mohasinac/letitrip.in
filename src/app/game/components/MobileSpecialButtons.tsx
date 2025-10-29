"use client";

import React, { useCallback } from "react";
import { Box } from "@mui/material";

interface MobileSpecialButtonsProps {
  onActionButton: (action: 1 | 2 | 3 | 4) => void;
  disabled?: boolean;
}

const MobileSpecialButtons: React.FC<MobileSpecialButtonsProps> = React.memo(({
  onActionButton,
  disabled = false,
}) => {
  // Optimized press handler with haptic feedback
  const handlePress = useCallback((
    action: 1 | 2 | 3 | 4,
    e: React.TouchEvent | React.MouseEvent
  ) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!disabled) {
      // Haptic feedback for mobile devices
      if ('vibrate' in navigator) {
        navigator.vibrate(10); // Short vibration (10ms)
      }
      onActionButton(action);
    }
  }, [disabled, onActionButton]);

  const buttonStyle = {
    position: "absolute" as const,
    width: { xs: "70px", sm: "75px", md: "80px" }, // Increased for better touch targets
    height: { xs: "70px", sm: "75px", md: "80px" },
    borderRadius: "50%",
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    justifyContent: "center",
    fontSize: { xs: "1.75rem", sm: "1.85rem", md: "2rem" }, // Slightly larger icons
    fontWeight: "bold",
    color: "white",
    cursor: disabled ? "not-allowed" : "pointer",
    userSelect: "none" as const,
    WebkitUserSelect: "none" as const,
    MozUserSelect: "none" as const,
    WebkitTapHighlightColor: "transparent", // Remove tap highlight on iOS
    touchAction: "manipulation" as const,
    transition: "transform 0.1s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.1s", // Faster transitions
    opacity: disabled ? 0.4 : 0.9, // Better visibility
    willChange: "transform", // GPU acceleration hint
    "&:active": {
      transform: disabled ? "none" : "scale(0.9)", // Slightly less aggressive
      opacity: disabled ? 0.4 : 1,
    },
  };

  const labelStyle: React.CSSProperties = {
    fontSize: "0.7rem",
    marginTop: "2px",
    opacity: 0.9,
    fontWeight: 600,
  };

  return (
    <>
      {/* Top-Left: Dodge Left (Button 1) - Positioned below HUD */}
      <Box
        sx={{
          ...buttonStyle,
          top: { xs: "105px", sm: "115px", md: "125px" }, // Optimized positioning
          left: { xs: "8px", sm: "12px", md: "16px" },
          background:
            "linear-gradient(135deg, rgba(34, 197, 94, 0.95), rgba(22, 163, 74, 0.95))", // Slightly more opaque
          border: "3px solid rgba(255, 255, 255, 0.4)", // Thicker border for visibility
          boxShadow:
            "0 4px 16px rgba(34, 197, 94, 0.5), inset 0 2px 4px rgba(255,255,255,0.25)", // Enhanced shadow
        }}
        onTouchStart={(e) => handlePress(1, e)}
        onMouseDown={(e) => handlePress(1, e)}
      >
        <div>◄</div>
        <Box
          component="div"
          sx={{
            fontSize: { xs: "0.7rem", sm: "0.75rem", md: "0.8rem" },
            ...labelStyle,
          }}
        >
          DODGE L
        </Box>
      </Box>

      {/* Top-Right: Dodge Right (Button 2) - Positioned below HUD */}
      <Box
        sx={{
          ...buttonStyle,
          top: { xs: "105px", sm: "115px", md: "125px" },
          right: { xs: "8px", sm: "12px", md: "16px" },
          background:
            "linear-gradient(135deg, rgba(34, 197, 94, 0.95), rgba(22, 163, 74, 0.95))",
          border: "3px solid rgba(255, 255, 255, 0.4)",
          boxShadow:
            "0 4px 16px rgba(34, 197, 94, 0.5), inset 0 2px 4px rgba(255,255,255,0.25)",
        }}
        onTouchStart={(e) => handlePress(2, e)}
        onMouseDown={(e) => handlePress(2, e)}
      >
        <div>►</div>
        <Box
          component="div"
          sx={{
            fontSize: { xs: "0.7rem", sm: "0.75rem", md: "0.8rem" },
            ...labelStyle,
          }}
        >
          DODGE R
        </Box>
      </Box>

      {/* Bottom-Left: Heavy Attack (Button 3) */}
      <Box
        sx={{
          ...buttonStyle,
          bottom: { xs: "8px", sm: "12px", md: "16px" },
          left: { xs: "8px", sm: "12px", md: "16px" },
          background:
            "linear-gradient(135deg, rgba(251, 146, 60, 0.95), rgba(249, 115, 22, 0.95))",
          border: "3px solid rgba(255, 255, 255, 0.4)",
          boxShadow:
            "0 4px 16px rgba(251, 146, 60, 0.5), inset 0 2px 4px rgba(255,255,255,0.25)",
        }}
        onTouchStart={(e) => handlePress(3, e)}
        onMouseDown={(e) => handlePress(3, e)}
      >
        <div>⚔</div>
        <Box
          component="div"
          sx={{
            fontSize: { xs: "0.7rem", sm: "0.75rem", md: "0.8rem" },
            ...labelStyle,
          }}
        >
          HEAVY
        </Box>
      </Box>

      {/* Bottom-Right: Ultimate Attack (Button 4) */}
      <Box
        sx={{
          ...buttonStyle,
          bottom: { xs: "8px", sm: "12px", md: "16px" },
          right: { xs: "8px", sm: "12px", md: "16px" },
          background:
            "linear-gradient(135deg, rgba(239, 68, 68, 0.95), rgba(220, 38, 38, 0.95))",
          border: "3px solid rgba(255, 255, 255, 0.4)",
          boxShadow:
            "0 4px 16px rgba(239, 68, 68, 0.5), inset 0 2px 4px rgba(255,255,255,0.25)",
        }}
        onTouchStart={(e) => handlePress(4, e)}
        onMouseDown={(e) => handlePress(4, e)}
      >
        <div>⚡</div>
        <Box
          component="div"
          sx={{
            fontSize: { xs: "0.7rem", sm: "0.75rem", md: "0.8rem" },
            ...labelStyle,
          }}
        >
          ULTIMATE
        </Box>
      </Box>
    </>
  );
});

MobileSpecialButtons.displayName = "MobileSpecialButtons";

export default MobileSpecialButtons;
