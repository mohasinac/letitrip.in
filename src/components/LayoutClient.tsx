"use client";

import { useState, useEffect } from "react";
import { THEME_CONSTANTS } from "@/constants/theme";
import { useTheme } from "@/contexts/ThemeContext";
import { TitleBar, MainNavbar, Sidebar, Footer, BottomNavbar } from "./layout";
import Search from "./utility/Search";
import BackToTop from "./utility/BackToTop";
import Breadcrumbs from "./utility/Breadcrumbs";

/**
 * LayoutClient Component
 *
 * The main client-side layout wrapper that manages all navigation components,
 * sidebar state, search functionality, and theme toggling.
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
    <div
      className={`flex flex-col min-h-screen transition-colors ${THEME_CONSTANTS.themed.bgPrimary}`}
    >
      <TitleBar
        isDark={isDark}
        onToggleTheme={toggleTheme}
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
      <div className="flex flex-1 relative">
        {/* Overlay - shows when sidebar is open (mobile always, desktop optional) */}
        {sidebarOpen && (
          <div
            className={`fixed inset-0 bg-black/50 ${THEME_CONSTANTS.zIndex.overlay}`}
            onClick={handleToggleSidebar}
            aria-hidden="true"
          />
        )}

        <Sidebar
          isOpen={sidebarOpen}
          isDark={isDark}
          onClose={handleToggleSidebar}
        />

        {/* Main Content - adjust margin when sidebar is open on desktop */}
        <main
          id="main-content"
          className={`flex-1 mb-16 md:mb-0 transition-all duration-300 ${sidebarOpen ? "md:mr-80" : "md:mr-0"} ${THEME_CONSTANTS.themed.bgPrimary}`}
        >
          <div className="container mx-auto px-4 py-6 md:px-6">{children}</div>
        </main>
      </div>

      <BackToTop sidebarOpen={sidebarOpen} />

      <Footer />

      <BottomNavbar onSearchToggle={() => setSearchOpen(!searchOpen)} />
    </div>
  );
}
