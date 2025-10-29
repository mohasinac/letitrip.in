"use client";

import React, { useState, useRef, useEffect } from "react";
import { Box, IconButton, Tooltip } from "@mui/material";
import {
  DragIndicator as DragIcon,
  LockOpen as UnlockIcon,
  Lock as LockIcon,
  Add as ZoomInIcon,
  Remove as ZoomOutIcon,
  VerticalAlignBottom as MoveBottomIcon,
} from "@mui/icons-material";
import VirtualDPad from "./VirtualDPad";
import { useCookie } from "@/hooks/useCookie";

interface DraggableVirtualDPadProps {
  onDirectionChange: (direction: { x: number; y: number }) => void;
  onActionButton?: (action: 1 | 2 | 3 | 4) => void;
}

interface Position {
  x: number;
  y: number;
}

const DraggableVirtualDPad: React.FC<DraggableVirtualDPadProps> = ({
  onDirectionChange,
  onActionButton,
}) => {
  // Load saved position from cookie or use default
  const [savedPosition, setSavedPosition] = useCookie(
    "dpad-position",
    JSON.stringify({ x: 16, y: -16 }) // Default: bottom-right with 16px offset
  );

  // Load saved scale from cookie or use default
  const [savedScale, setSavedScale] = useCookie("dpad-scale", "1");

  const [position, setPosition] = useState<Position>(() => {
    try {
      return JSON.parse(savedPosition);
    } catch {
      return { x: 16, y: -16 };
    }
  });

  const [scale, setScale] = useState<number>(() => {
    try {
      const parsedScale = parseFloat(savedScale);
      return isNaN(parsedScale) ? 1 : parsedScale;
    } catch {
      return 1;
    }
  });

  const [isDragging, setIsDragging] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [dragOffset, setDragOffset] = useState<Position>({ x: 0, y: 0 });
  const dpadRef = useRef<HTMLDivElement>(null);

  // Save position to cookie whenever it changes
  useEffect(() => {
    setSavedPosition(JSON.stringify(position));
  }, [position, setSavedPosition]);

  // Save scale to cookie whenever it changes
  useEffect(() => {
    setSavedScale(scale.toString());
  }, [scale, setSavedScale]);

  const handleDragStart = (clientX: number, clientY: number) => {
    if (isLocked || !dpadRef.current) return;

    setIsDragging(true);
    const rect = dpadRef.current.getBoundingClientRect();

    // Account for scale transform
    setDragOffset({
      x: (clientX - rect.left) / scale,
      y: (clientY - rect.top) / scale,
    });
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  // Add global event listeners when dragging
  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!dpadRef.current) return;

      // Calculate new position relative to viewport
      let newX = e.clientX / scale - dragOffset.x;
      let newY = e.clientY / scale - dragOffset.y;

      setPosition({ x: newX, y: newY });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!dpadRef.current || e.touches.length !== 1) return;

      const touch = e.touches[0];

      // Calculate new position relative to viewport
      let newX = touch.clientX / scale - dragOffset.x;
      let newY = touch.clientY / scale - dragOffset.y;

      setPosition({ x: newX, y: newY });
    };

    const handleTouchEnd = () => {
      setIsDragging(false);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    window.addEventListener("touchmove", handleTouchMove);
    window.addEventListener("touchend", handleTouchEnd);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, [isDragging, dragOffset, scale]);

  // Mouse and touch start handlers - allow dragging from anywhere on the component
  const handleMouseDown = (e: React.MouseEvent) => {
    // Don't interfere with button clicks or joystick interaction
    const target = e.target as HTMLElement;
    if (
      target.tagName === "BUTTON" ||
      target.closest("button") ||
      target.closest('[class*="MuiIconButton"]') ||
      target.closest('[class*="joystick"]')
    ) {
      return;
    }
    handleDragStart(e.clientX, e.clientY);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length !== 1) return;

    // Don't interfere with button clicks or joystick interaction
    const target = e.target as HTMLElement;
    if (
      target.tagName === "BUTTON" ||
      target.closest("button") ||
      target.closest('[class*="MuiIconButton"]') ||
      target.closest('[class*="joystick"]')
    ) {
      return;
    }

    const touch = e.touches[0];
    handleDragStart(touch.clientX, touch.clientY);
  };

  const toggleLock = () => {
    setIsLocked(!isLocked);
  };

  const handleZoomIn = () => {
    setScale((prev) => Math.min(prev + 0.1, 2)); // Max scale: 2x
  };

  const handleZoomOut = () => {
    setScale((prev) => Math.max(prev - 0.1, 0.5)); // Min scale: 0.5x
  };

  const moveToBottom = () => {
    if (!dpadRef.current) return;

    // Get the actual joystick dimensions
    const dpadRect = dpadRef.current.getBoundingClientRect();
    const actualWidth = dpadRect.width;

    // Calculate center X position (centered horizontally in viewport)
    // Account for the scale transform
    const centerX = (window.innerWidth - actualWidth) / 2 / scale;

    // Position at bottom with 16px offset (negative Y means from bottom)
    setPosition({ x: centerX, y: -16 });
  };

  return (
    <Box
      ref={dpadRef}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      sx={{
        position: "fixed",
        left: position.x,
        top: position.y < 0 ? "auto" : position.y,
        bottom: position.y < 0 ? Math.abs(position.y) : "auto",
        width: "auto",
        height: "auto",
        transform: `scale(${scale})`,
        transformOrigin: "bottom left",
        pointerEvents: "auto", // D-pad should receive events
        cursor: isDragging ? "grabbing" : isLocked ? "default" : "grab",
        zIndex: 1000,
        transition: isDragging ? "none" : "all 0.2s ease",
      }}
    >
      {/* Drag Handle - Only visible when not locked */}
      {!isLocked && (
        <Box
          sx={{
            position: "absolute",
            top: -12,
            right: -12,
            width: 40,
            height: 40,
            backgroundColor: "rgba(59, 130, 246, 0.9)",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "grab",
            zIndex: 11,
            border: "3px solid rgba(255, 255, 255, 0.6)",
            boxShadow:
              "0 2px 8px rgba(0,0,0,0.4), 0 0 12px rgba(59,130,246,0.5)",
            "&:active": {
              cursor: "grabbing",
              transform: "scale(0.95)",
            },
            "&:hover": {
              transform: "scale(1.1)",
              boxShadow:
                "0 4px 12px rgba(0,0,0,0.5), 0 0 16px rgba(59,130,246,0.7)",
            },
            transition: "all 0.2s ease",
          }}
        >
          <DragIcon sx={{ fontSize: 20, color: "white" }} />
        </Box>
      )}

      {/* Lock Button */}
      <Tooltip
        title={isLocked ? "Unlock to move" : "Lock position"}
        placement="top"
      >
        <IconButton
          size="small"
          onClick={toggleLock}
          sx={{
            position: "absolute",
            top: -8,
            left: -8,
            width: 24,
            height: 24,
            backgroundColor: isLocked
              ? "rgba(239, 68, 68, 0.8)"
              : "rgba(34, 197, 94, 0.8)",
            color: "white",
            zIndex: 11,
            border: "2px solid rgba(255, 255, 255, 0.3)",
            "&:hover": {
              backgroundColor: isLocked
                ? "rgba(239, 68, 68, 0.9)"
                : "rgba(34, 197, 94, 0.9)",
            },
            "& .MuiSvgIcon-root": {
              fontSize: 14,
            },
          }}
        >
          {isLocked ? <LockIcon /> : <UnlockIcon />}
        </IconButton>
      </Tooltip>

      {/* Zoom In Button */}
      <Tooltip title="Zoom In" placement="top">
        <IconButton
          size="small"
          onClick={handleZoomIn}
          disabled={scale >= 2}
          sx={{
            position: "absolute",
            top: -8,
            left: 20,
            width: 24,
            height: 24,
            backgroundColor: "rgba(59, 130, 246, 0.8)",
            color: "white",
            zIndex: 11,
            border: "2px solid rgba(255, 255, 255, 0.3)",
            "&:hover": {
              backgroundColor: "rgba(59, 130, 246, 0.9)",
            },
            "&:disabled": {
              backgroundColor: "rgba(100, 100, 100, 0.5)",
              color: "rgba(255, 255, 255, 0.5)",
            },
            "& .MuiSvgIcon-root": {
              fontSize: 14,
            },
          }}
        >
          <ZoomInIcon />
        </IconButton>
      </Tooltip>

      {/* Zoom Out Button */}
      <Tooltip title="Zoom Out" placement="top">
        <IconButton
          size="small"
          onClick={handleZoomOut}
          disabled={scale <= 0.5}
          sx={{
            position: "absolute",
            top: -8,
            left: 48,
            width: 24,
            height: 24,
            backgroundColor: "rgba(59, 130, 246, 0.8)",
            color: "white",
            zIndex: 11,
            border: "2px solid rgba(255, 255, 255, 0.3)",
            "&:hover": {
              backgroundColor: "rgba(59, 130, 246, 0.9)",
            },
            "&:disabled": {
              backgroundColor: "rgba(100, 100, 100, 0.5)",
              color: "rgba(255, 255, 255, 0.5)",
            },
            "& .MuiSvgIcon-root": {
              fontSize: 14,
            },
          }}
        >
          <ZoomOutIcon />
        </IconButton>
      </Tooltip>

      {/* Scale Indicator */}
      <Box
        sx={{
          position: "absolute",
          top: -8,
          left: 76,
          height: 24,
          px: 1,
          backgroundColor: "rgba(0, 0, 0, 0.7)",
          color: "white",
          zIndex: 11,
          border: "2px solid rgba(255, 255, 255, 0.3)",
          borderRadius: "12px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "10px",
          fontWeight: "bold",
          minWidth: "36px",
        }}
      >
        {Math.round(scale * 100)}%
      </Box>

      {/* Move to Bottom Button */}
      <Tooltip title="Move to Bottom Center" placement="top">
        <IconButton
          size="small"
          onClick={moveToBottom}
          sx={{
            position: "absolute",
            top: -8,
            left: 116,
            width: 24,
            height: 24,
            backgroundColor: "rgba(168, 85, 247, 0.8)",
            color: "white",
            zIndex: 11,
            border: "2px solid rgba(255, 255, 255, 0.3)",
            "&:hover": {
              backgroundColor: "rgba(168, 85, 247, 0.9)",
              transform: "scale(1.1)",
            },
            transition: "all 0.2s ease",
            "& .MuiSvgIcon-root": {
              fontSize: 14,
            },
          }}
        >
          <MoveBottomIcon />
        </IconButton>
      </Tooltip>

      {/* Virtual D-Pad */}
      <VirtualDPad
        onDirectionChange={onDirectionChange}
        onActionButton={onActionButton}
        className="opacity-80 bg-black/20 backdrop-blur-sm rounded-lg border-2 border-white/30"
      />

      {/* Dragging overlay indicator */}
      {isDragging && (
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            backgroundColor: "rgba(59, 130, 246, 0.2)",
            borderRadius: "50%",
            pointerEvents: "none",
            border: "2px dashed rgba(59, 130, 246, 0.5)",
          }}
        />
      )}
    </Box>
  );
};

export default DraggableVirtualDPad;
