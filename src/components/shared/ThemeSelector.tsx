"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useTheme, type BeybladeThemeKey } from "@/contexts/ThemeContext";

export default function ThemeSelector() {
  const {
    currentTheme,
    setTheme,
    availableThemes,
    isDarkMode,
    toggleDarkMode,
    getCurrentColors,
  } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  const handleThemeSelect = (themeKey: BeybladeThemeKey) => {
    setTheme(themeKey);
    setIsOpen(false);
  };

  const currentThemeData = availableThemes[currentTheme];
  const currentColors = getCurrentColors();

  return (
    <div className="relative">
      {/* Theme Selector Button */}
      <div className="flex items-center space-x-2">
        {/* Dark Mode Toggle */}
        <button
          onClick={toggleDarkMode}
          className="flex items-center justify-center w-10 h-10 rounded-lg border border-input bg-background/80 backdrop-blur-sm hover:bg-accent transition-colors focus:outline-none focus:ring-2 focus:ring-ring"
          aria-label={
            isDarkMode ? "Switch to light mode" : "Switch to dark mode"
          }
          style={{
            borderColor: `${currentColors.primary}40`,
            boxShadow: `0 0 10px ${currentColors.primary}20`,
          }}
        >
          {isDarkMode ? (
            <svg
              className="w-5 h-5"
              style={{ color: currentColors.text }}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
                clipRule="evenodd"
              />
            </svg>
          ) : (
            <svg
              className="w-5 h-5"
              style={{ color: currentColors.text }}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
            </svg>
          )}
        </button>

        {/* Theme Selector Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center space-x-2 px-3 py-2 rounded-lg border border-input bg-background/80 backdrop-blur-sm hover:bg-accent transition-colors focus:outline-none focus:ring-2 focus:ring-ring"
          aria-label="Select theme"
          style={{
            borderColor: `${currentColors.primary}40`,
            boxShadow: `0 0 10px ${currentColors.primary}20`,
          }}
        >
          <div
            className="w-6 h-6 rounded-full overflow-hidden border"
            style={{ borderColor: currentColors.accent }}
          >
            <Image
              src={`/assets/svg/beyblades/${currentThemeData.svgFile}`}
              alt={currentThemeData.name}
              width={24}
              height={24}
              className="w-full h-full object-contain p-0.5"
              unoptimized
            />
          </div>
          <span
            className="hidden sm:block text-sm font-medium"
            style={{ color: currentColors.text }}
          >
            {currentThemeData.name}
          </span>
          <svg
            className={`w-4 h-4 transition-transform ${
              isOpen ? "rotate-180" : ""
            }`}
            style={{ color: currentColors.muted }}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown Content */}
          <div
            className="absolute right-0 top-full mt-2 w-80 bg-background border rounded-lg shadow-xl z-50 max-h-96 overflow-y-auto backdrop-blur-md"
            style={{
              borderColor: currentColors.accent,
              boxShadow: `0 20px 40px ${currentColors.primary}20`,
              background: `linear-gradient(135deg, ${currentColors.background}95, ${currentColors.primary}05)`,
            }}
          >
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h3
                  className="text-sm font-semibold"
                  style={{ color: currentColors.text }}
                >
                  Choose Your Beyblade Theme
                </h3>
                <div
                  className="flex items-center space-x-2 text-xs"
                  style={{ color: currentColors.muted }}
                >
                  <span>{isDarkMode ? "Dark" : "Light"} Mode</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(availableThemes).map(([key, theme]) => {
                  const themeColors = isDarkMode
                    ? theme.darkColors
                    : theme.colors;
                  return (
                    <button
                      key={key}
                      onClick={() => handleThemeSelect(key as BeybladeThemeKey)}
                      className={`p-3 rounded-lg border transition-all duration-200 hover:scale-105 active:scale-95 ${
                        currentTheme === key
                          ? "border-2 shadow-lg"
                          : "border hover:border-2"
                      }`}
                      style={{
                        borderColor:
                          currentTheme === key
                            ? themeColors.primary
                            : themeColors.accent,
                        backgroundColor:
                          currentTheme === key
                            ? `${themeColors.primary}15`
                            : `${themeColors.background}80`,
                        boxShadow:
                          currentTheme === key
                            ? `0 8px 25px ${themeColors.primary}30`
                            : `0 2px 10px ${themeColors.primary}10`,
                      }}
                    >
                      <div className="flex flex-col items-center space-y-2">
                        <div
                          className="w-12 h-12 rounded-full overflow-hidden border-2 bg-white p-1"
                          style={{ borderColor: themeColors.secondary }}
                        >
                          <Image
                            src={`/assets/svg/beyblades/${theme.svgFile}`}
                            alt={theme.name}
                            width={48}
                            height={48}
                            className="w-full h-full object-contain"
                            unoptimized
                          />
                        </div>
                        <div className="text-center">
                          <div
                            className="text-xs font-semibold"
                            style={{ color: themeColors.text }}
                          >
                            {theme.name}
                          </div>
                          <div
                            className="text-xs mt-1 leading-tight"
                            style={{ color: themeColors.muted }}
                          >
                            {theme.description}
                          </div>
                        </div>
                        {/* Color preview */}
                        <div className="flex space-x-1">
                          <div
                            className="w-3 h-3 rounded-full border"
                            style={{
                              backgroundColor: themeColors.primary,
                              borderColor: themeColors.text + "40",
                            }}
                          />
                          <div
                            className="w-3 h-3 rounded-full border"
                            style={{
                              backgroundColor: themeColors.secondary,
                              borderColor: themeColors.text + "40",
                            }}
                          />
                          <div
                            className="w-3 h-3 rounded-full border"
                            style={{
                              backgroundColor: themeColors.accent,
                              borderColor: themeColors.text + "40",
                            }}
                          />
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
