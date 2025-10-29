"use client";

import React, { useState, useRef, useEffect } from "react";
import { Box, IconButton, Tooltip } from "@mui/material";
import {
  DragIndicator as DragIcon,
  LockOpen as UnlockIcon,
  Lock as LockIcon,
  Add as ZoomInIcon,
  Remove as ZoomOutIcon,
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
  const containerRef = useRef<HTMLDivElement>(null);

  // Save position to cookie whenever it changes
  useEffect(() => {
    setSavedPosition(JSON.stringify(position));
  }, [position, setSavedPosition]);

  // Save scale to cookie whenever it changes
  useEffect(() => {
    setSavedScale(scale.toString());
  }, [scale, setSavedScale]);

  const handleDragStart = (clientX: number, clientY: number) => {
    if (isLocked || !dpadRef.current || !containerRef.current) return;

    setIsDragging(true);
    const rect = dpadRef.current.getBoundingClientRect();
    const containerRect = containerRef.current.getBoundingClientRect();

    setDragOffset({
      x: clientX - rect.left,
      y: clientY - rect.top,
    });
  };

  const handleDragMove = (clientX: number, clientY: number) => {
    if (!isDragging || isLocked || !containerRef.current) return;

    const containerRect = containerRef.current.getBoundingClientRect();
    const dpadSize = 80; // Size of the D-pad

    // Calculate new position relative to container
    let newX = clientX - containerRect.left - dragOffset.x;
    let newY = clientY - containerRect.top - dragOffset.y;

    // Constrain within bounds
    newX = Math.max(8, Math.min(newX, containerRect.width - dpadSize - 8));
    newY = Math.max(8, Math.min(newY, containerRect.height - dpadSize - 8));

    setPosition({ x: newX, y: newY });
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  // Mouse events
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleDragStart(e.clientX, e.clientY);
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    handleDragMove(e.clientX, e.clientY);
  };

  const handleMouseUp = () => {
    handleDragEnd();
  };

  // Touch events
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.target === e.currentTarget && e.touches.length === 1) {
      const touch = e.touches[0];
      handleDragStart(touch.clientX, touch.clientY);
    }
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      handleDragMove(touch.clientX, touch.clientY);
    }
  };

  const handleTouchEnd = () => {
    handleDragEnd();
  };

  // Add global event listeners when dragging
  useEffect(() => {
    if (isDragging) {
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
    }
  }, [isDragging]);

  const toggleLock = () => {
    setIsLocked(!isLocked);
  };

  const handleZoomIn = () => {
    setScale((prev) => Math.min(prev + 0.1, 2)); // Max scale: 2x
  };

  const handleZoomOut = () => {
    setScale((prev) => Math.max(prev - 0.1, 0.5)); // Min scale: 0.5x
  };

  return (
    <Box
      ref={containerRef}
      sx={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        pointerEvents: "none", // Allow clicks to pass through
      }}
    >
      <Box
        ref={dpadRef}
        sx={{
          position: "absolute",
          left: position.x,
          top: position.y < 0 ? "auto" : position.y,
          bottom: position.y < 0 ? Math.abs(position.y) : "auto",
          width: "auto",
          height: "auto",
          transform: `scale(${scale})`,
          transformOrigin: "bottom left",
          pointerEvents: "auto", // D-pad should receive events
          cursor: isDragging ? "grabbing" : isLocked ? "default" : "grab",
          zIndex: 10,
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
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
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
    </Box>
  );
};

export default DraggableVirtualDPad;
