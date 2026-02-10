"use client";

import { useState, useEffect } from "react";
import { THEME_CONSTANTS } from "@/constants";
import { useTheme } from "@/contexts/ThemeContext";
import { TitleBar, MainNavbar, Sidebar, Footer, BottomNavbar } from "./layout";
import Search from "./utility/Search";
import BackToTop from "./utility/BackToTop";
import Breadcrumbs from "./utility/Breadcrumbs";
import { BackgroundRenderer } from "./utility";
import { classNames } from "@/helpers";

/**
 * LayoutClient Component
 *
 * The main client-side layout wrapper that manages all navigation components,
 * sidebar state, search functionality, theme toggling, and dynamic backgrounds.
 * Provides the complete app shell with responsive navigation.
 *
 * @component
 * @example
 * ```tsx
 * <LayoutClient>
 *   <YourPageContent />
 * </LayoutClient>
 * ```
 */

export default function LayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  // TODO: Fetch background settings from site settings API
  // For now, using default values
  const backgroundConfig = {
    lightMode: {
      type: "color" as const,
      value: "#f9fafb", // gray-50
      overlay: {
        enabled: false,
        color: "#000000",
        opacity: 0,
      },
    },
    darkMode: {
      type: "color" as const,
      value: "#030712", // gray-950
      overlay: {
        enabled: false,
        color: "#000000",
        opacity: 0,
      },
    },
  };

  // Set sidebar default state based on screen size and user preference
  // Desktop (>= 768px): visible by default (unless user closed it)
  // Mobile (< 768px): hidden by default
  useEffect(() => {
    const handleResize = () => {
      const isDesktop = window.innerWidth >= 768;

      // Check if user has a saved preference
      const savedPreference = localStorage.getItem("sidebarOpen");

      if (savedPreference !== null) {
        // Respect user's preference
        setSidebarOpen(savedPreference === "true");
      } else {
        // Default behavior based on screen size
        setSidebarOpen(isDesktop);
      }
    };

    // Set initial state
    handleResize();

    // Listen for window resize
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Handle sidebar toggle and save preference
  const handleToggleSidebar = () => {
    setSidebarOpen((prev) => {
      const newState = !prev;
      // Save user preference
      localStorage.setItem("sidebarOpen", String(newState));
      return newState;
    });
  };

  return (
    <div className="flex flex-col min-h-screen w-full overflow-x-hidden transition-colors duration-300">
      {/* Dynamic Background */}
      <BackgroundRenderer
        lightMode={backgroundConfig.lightMode}
        darkMode={backgroundConfig.darkMode}
      />
      <TitleBar
        onToggleSidebar={handleToggleSidebar}
        sidebarOpen={sidebarOpen}
        onSearchToggle={() => setSearchOpen(!searchOpen)}
        searchOpen={searchOpen}
      />

      <MainNavbar />

      <Search
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
        onSearch={(query) => {
          console.log("Searching for:", query);
          // Add your search logic here
        }}
      />

      {/* Breadcrumbs - shown on all pages except home */}
      <Breadcrumbs />

      {/* Content with Sidebar */}
      <div className="flex flex-1 relative w-full overflow-x-hidden">
        <Sidebar
          isOpen={sidebarOpen}
          isDark={isDark}
          onClose={handleToggleSidebar}
          onToggleTheme={toggleTheme}
        />

        {/* Main Content - modern spacing and transitions */}
        <main
          id="main-content"
          className={classNames(
            "flex-1 mb-16 md:mb-0 transition-all duration-300 ease-in-out w-full",
            sidebarOpen ? "md:mr-80" : "md:mr-0",
          )}
        >
          <div
            className={`container mx-auto ${THEME_CONSTANTS.layout.contentPadding} ${THEME_CONSTANTS.layout.maxContentWidth} py-4 sm:py-6 w-full`}
          >
            {children}
          </div>
        </main>
      </div>

      <BackToTop sidebarOpen={sidebarOpen} />

      <Footer />

      <BottomNavbar onSearchToggle={() => setSearchOpen(!searchOpen)} />
    </div>
  );
}
