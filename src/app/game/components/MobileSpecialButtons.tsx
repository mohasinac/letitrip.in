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
    width: { xs: "60px", sm: "70px", md: "80px" },
    height: { xs: "60px", sm: "70px", md: "80px" },
    borderRadius: "50%",
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    justifyContent: "center",
    fontSize: { xs: "1.5rem", sm: "1.75rem", md: "2rem" },
    fontWeight: "bold",
    color: "white",
    cursor: disabled ? "not-allowed" : "pointer",
    userSelect: "none" as const,
    WebkitUserSelect: "none" as const,
    MozUserSelect: "none" as const,
    touchAction: "manipulation" as const,
    transition: "all 0.15s cubic-bezier(0.4, 0, 0.2, 1)",
    opacity: disabled ? 0.5 : 0.85,
    backdropFilter: "blur(4px)",
    WebkitBackdropFilter: "blur(4px)",
    "&:active": {
      transform: disabled ? "none" : "scale(0.85)",
      opacity: disabled ? 0.5 : 1,
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
          top: { xs: "110px", sm: "120px", md: "130px" }, // Moved below HUD (100px height + margin)
          left: { xs: "10px", sm: "15px", md: "20px" },
          background:
            "linear-gradient(135deg, rgba(34, 197, 94, 0.9), rgba(22, 163, 74, 0.9))",
          border: "2px solid rgba(255, 255, 255, 0.3)",
          boxShadow:
            "0 4px 12px rgba(34, 197, 94, 0.4), inset 0 1px 2px rgba(255,255,255,0.2)",
        }}
        onTouchStart={(e) => handlePress(1, e)}
        onMouseDown={(e) => handlePress(1, e)}
      >
        <div>◄</div>
        <Box
          component="div"
          sx={{
            fontSize: { xs: "0.65rem", sm: "0.7rem", md: "0.75rem" },
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
          top: { xs: "110px", sm: "120px", md: "130px" }, // Moved below HUD
          right: { xs: "10px", sm: "15px", md: "20px" },
          background:
            "linear-gradient(135deg, rgba(34, 197, 94, 0.9), rgba(22, 163, 74, 0.9))",
          border: "2px solid rgba(255, 255, 255, 0.3)",
          boxShadow:
            "0 4px 12px rgba(34, 197, 94, 0.4), inset 0 1px 2px rgba(255,255,255,0.2)",
        }}
        onTouchStart={(e) => handlePress(2, e)}
        onMouseDown={(e) => handlePress(2, e)}
      >
        <div>►</div>
        <Box
          component="div"
          sx={{
            fontSize: { xs: "0.65rem", sm: "0.7rem", md: "0.75rem" },
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
          bottom: { xs: "10px", sm: "15px", md: "20px" },
          left: { xs: "10px", sm: "15px", md: "20px" },
          background:
            "linear-gradient(135deg, rgba(251, 146, 60, 0.9), rgba(249, 115, 22, 0.9))",
          border: "2px solid rgba(255, 255, 255, 0.3)",
          boxShadow:
            "0 4px 12px rgba(251, 146, 60, 0.4), inset 0 1px 2px rgba(255,255,255,0.2)",
        }}
        onTouchStart={(e) => handlePress(3, e)}
        onMouseDown={(e) => handlePress(3, e)}
      >
        <div>⚔</div>
        <Box
          component="div"
          sx={{
            fontSize: { xs: "0.65rem", sm: "0.7rem", md: "0.75rem" },
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
          bottom: { xs: "10px", sm: "15px", md: "20px" },
          right: { xs: "10px", sm: "15px", md: "20px" },
          background:
            "linear-gradient(135deg, rgba(239, 68, 68, 0.9), rgba(220, 38, 38, 0.9))",
          border: "2px solid rgba(255, 255, 255, 0.3)",
          boxShadow:
            "0 4px 12px rgba(239, 68, 68, 0.4), inset 0 1px 2px rgba(255,255,255,0.2)",
        }}
        onTouchStart={(e) => handlePress(4, e)}
        onMouseDown={(e) => handlePress(4, e)}
      >
        <div>⚡</div>
        <Box
          component="div"
          sx={{
            fontSize: { xs: "0.65rem", sm: "0.7rem", md: "0.75rem" },
            ...labelStyle,
          }}
        >
          ULTIMATE
        </Box>
      </Box>
    </>
  );
};

export default MobileSpecialButtons;
