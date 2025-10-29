"use client";

import React from "react";
import { useTheme } from "@mui/material/styles";

interface ControlsHelpProps {
  className?: string;
}

const ControlsHelp: React.FC<ControlsHelpProps> = ({ className = "" }) => {
  const theme = useTheme();

  const controlMethods = [
    {
      icon: "🖱️",
      title: "Mouse/Trackpad",
      description: "Move cursor to guide your Beyblade",
      color: "#0095f6",
    },
    {
      icon: "📱",
      title: "Touch",
      description: "Touch and hold to control movement",
      color: "#ff4757",
    },
    {
      icon: "⌨️",
      title: "Keyboard",
      description: "WASD or Arrow keys for direct control",
      color: "#2ed573",
    },
  ];

  return (
    <div
      className={`rounded-xl p-6 shadow-lg ${className}`}
      style={{
        backgroundColor:
          theme.palette.mode === "dark"
            ? `linear-gradient(135deg, #ffffff 0%, ${theme.palette.primary.main} 100%)`
            : `linear-gradient(135deg, ${theme.palette.text.primary} 0%, ${theme.palette.primary.main} 100%)`,
        borderColor: "#0095f6",
        borderWidth: "2px",
        borderStyle: "solid",
        boxShadow: "0 10px 30px rgba(0, 149, 246, 0.1)",
      }}
    >
      <h3
        className="text-lg font-bold text-center mb-4"
        style={{
          color:
            theme.palette.mode === "dark"
              ? `linear-gradient(135deg, #ffffff 0%, ${theme.palette.primary.main} 100%)`
              : `linear-gradient(135deg, ${theme.palette.text.primary} 0%, ${theme.palette.primary.main} 100%)`,
        }}
      >
        Controls
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {controlMethods.map((method, index) => (
          <div
            key={index}
            className="p-4 rounded-lg shadow-sm transition-all duration-200 hover:scale-105 hover:shadow-md"
            style={{
              backgroundColor:
                theme.palette.mode === "dark"
                  ? `linear-gradient(135deg, #ffffff 0%, ${theme.palette.primary.main} 100%)`
                  : `linear-gradient(135deg, ${theme.palette.text.primary} 0%, ${theme.palette.primary.main} 100%)`,
              borderLeft: `4px solid ${method.color}`,
              border: `1px solid ${method.color}40`,
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
            <p className="text-sm leading-relaxed" style={{ color: "#cccccc" }}>
              {method.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ControlsHelp;
