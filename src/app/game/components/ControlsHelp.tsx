"use client";

import React from "react";
import { useTheme } from "@/contexts/ThemeContext";

interface ControlsHelpProps {
  className?: string;
}

const ControlsHelp: React.FC<ControlsHelpProps> = ({ className = "" }) => {
  const { theme } = useTheme();

  const controlMethods = [
    {
      icon: "🖱️",
      title: "Mouse/Trackpad",
      description: "Move cursor to guide your Beyblade",
      color: theme.colors.primary,
    },
    {
      icon: "📱",
      title: "Touch",
      description: "Touch and hold to control movement",
      color: theme.colors.secondary,
    },
    {
      icon: "⌨️",
      title: "Keyboard",
      description: "WASD or Arrow keys for direct control",
      color: theme.colors.accent,
    },
  ];

  return (
    <div
      className={`rounded-xl p-6 shadow-lg ${className}`}
      style={{
        backgroundColor: `${theme.colors.background}f0`,
        borderColor: theme.colors.accent,
        borderWidth: "1px",
      }}
    >
      <h3
        className="text-lg font-bold text-center mb-4"
        style={{ color: theme.colors.text }}
      >
        Controls
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {controlMethods.map((method, index) => (
          <div
            key={index}
            className="p-4 rounded-lg shadow-sm transition-all duration-200 hover:scale-105 hover:shadow-md"
            style={{
              backgroundColor: "white",
              borderLeft: `4px solid ${method.color}`,
            }}
          >
            <div className="flex items-center mb-2">
              <span className="text-2xl mr-3">{method.icon}</span>
              <h4
                className="font-semibold text-sm"
                style={{ color: method.color }}
              >
                {method.title}
              </h4>
            </div>
            <p
              className="text-sm leading-relaxed"
              style={{ color: theme.colors.muted }}
            >
              {method.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ControlsHelp;
