"use client";

import React from "react";

interface ControlsHelpProps {
  className?: string;
}

const ControlsHelp: React.FC<ControlsHelpProps> = ({ className = "" }) => {
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
      className={`rounded-xl p-6 shadow-lg bg-gradient-to-br from-gray-800 to-gray-900 dark:from-gray-900 dark:to-black border-2 border-blue-500 ${className}`}
      style={{
        boxShadow: "0 10px 30px rgba(0, 149, 246, 0.1)",
      }}
    >
      <h3 className="text-lg font-bold text-center mb-4 bg-gradient-to-r from-white to-blue-400 bg-clip-text text-transparent">
        Controls
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {controlMethods.map((method, index) => (
          <div
            key={index}
            className="p-4 rounded-lg shadow-sm transition-all duration-200 hover:scale-105 hover:shadow-md bg-gray-700/50 dark:bg-gray-800/50 border"
            style={{
              borderLeft: `4px solid ${method.color}`,
              borderColor: `${method.color}40`,
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
            <p className="text-sm leading-relaxed text-gray-300">
              {method.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ControlsHelp;
