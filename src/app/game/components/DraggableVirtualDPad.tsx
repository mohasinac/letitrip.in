"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  GripVertical,
  LockOpen,
  Lock,
  Plus,
  Minus,
  MoveDown,
} from "lucide-react";
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
    <div
      ref={dpadRef}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      className="fixed w-auto h-auto pointer-events-auto z-[1000]"
      style={{
        left: position.x,
        top: position.y < 0 ? "auto" : position.y,
        bottom: position.y < 0 ? Math.abs(position.y) : "auto",
        transform: `scale(${scale})`,
        transformOrigin: "bottom left",
        cursor: isDragging ? "grabbing" : isLocked ? "default" : "grab",
        transition: isDragging ? "none" : "all 0.2s ease",
      }}
    >
      {/* Drag Handle - Only visible when not locked */}
      {!isLocked && (
        <div
          className="absolute -top-3 -right-3 w-10 h-10 bg-blue-500/90 rounded-full flex items-center justify-center cursor-grab z-[11] border-3 border-white/60 shadow-lg hover:scale-110 active:scale-95 transition-all duration-200"
          style={{
            boxShadow:
              "0 2px 8px rgba(0,0,0,0.4), 0 0 12px rgba(59,130,246,0.5)",
          }}
        >
          <GripVertical size={20} className="text-white" />
        </div>
      )}

      {/* Lock Button */}
      <button
        onClick={toggleLock}
        title={isLocked ? "Unlock to move" : "Lock position"}
        className="absolute -top-2 -left-2 w-6 h-6 text-white z-[11] border-2 border-white/30 rounded-full hover:opacity-90 transition-opacity"
        style={{
          backgroundColor: isLocked
            ? "rgba(239, 68, 68, 0.8)"
            : "rgba(34, 197, 94, 0.8)",
        }}
      >
        {isLocked ? <Lock size={14} /> : <LockOpen size={14} />}
      </button>

      {/* Zoom In Button */}
      <button
        onClick={handleZoomIn}
        disabled={scale >= 2}
        title="Zoom In"
        className="absolute -top-2 left-5 w-6 h-6 bg-blue-500/80 text-white z-[11] border-2 border-white/30 rounded-full hover:bg-blue-500/90 disabled:bg-gray-500/50 disabled:text-white/50 transition-colors"
      >
        <Plus size={14} />
      </button>

      {/* Zoom Out Button */}
      <button
        onClick={handleZoomOut}
        disabled={scale <= 0.5}
        title="Zoom Out"
        className="absolute -top-2 left-12 w-6 h-6 bg-blue-500/80 text-white z-[11] border-2 border-white/30 rounded-full hover:bg-blue-500/90 disabled:bg-gray-500/50 disabled:text-white/50 transition-colors"
      >
        <Minus size={14} />
      </button>

      {/* Scale Indicator */}
      <div className="absolute -top-2 left-[76px] h-6 px-2 bg-black/70 text-white z-[11] border-2 border-white/30 rounded-xl flex items-center justify-center text-[10px] font-bold min-w-[36px]">
        {Math.round(scale * 100)}%
      </div>

      {/* Move to Bottom Button */}
      <button
        onClick={moveToBottom}
        title="Move to Bottom Center"
        className="absolute -top-2 left-[116px] w-6 h-6 bg-purple-500/80 text-white z-[11] border-2 border-white/30 rounded-full hover:bg-purple-500/90 hover:scale-110 transition-all duration-200"
      >
        <MoveDown size={14} />
      </button>

      {/* Virtual D-Pad */}
      <VirtualDPad
        onDirectionChange={onDirectionChange}
        onActionButton={onActionButton}
        className="opacity-80 bg-black/20 backdrop-blur-sm rounded-lg border-2 border-white/30"
      />

      {/* Dragging overlay indicator */}
      {isDragging && (
        <div className="absolute inset-0 bg-blue-500/20 rounded-full pointer-events-none border-2 border-dashed border-blue-500/50" />
      )}
    </div>
  );
};

export default DraggableVirtualDPad;
