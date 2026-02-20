"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { THEME_CONSTANTS, ROUTES, API_ENDPOINTS } from "@/constants";
import { useTheme } from "@/contexts/ThemeContext";
import { TitleBar, MainNavbar, Sidebar, Footer, BottomNavbar } from "./layout";
import Search from "./utility/Search";
import BackToTop from "./utility/BackToTop";
import Breadcrumbs from "./utility/Breadcrumbs";
import { BackgroundRenderer } from "./utility";
import { classNames } from "@/helpers";
import { logger } from "@/classes";
import { useApiQuery } from "@/hooks";
import { apiClient } from "@/lib/api-client";

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
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  const defaultBackgroundConfig = {
    lightMode: {
      type: "color" as const,
      value: "#f9fafb",
      overlay: { enabled: false, color: "#000000", opacity: 0 },
    },
    darkMode: {
      type: "color" as const,
      value: "#030712",
      overlay: { enabled: false, color: "#000000", opacity: 0 },
    },
  };

  // Fetch background settings from site settings API.
  // Falls back to site defaults when data is not yet loaded or on error.
  const { data: siteSettings } = useApiQuery<{
    backgroundConfig?: typeof defaultBackgroundConfig;
  }>({
    queryKey: ["site-settings"],
    queryFn: () =>
      apiClient.get<{ backgroundConfig?: typeof defaultBackgroundConfig }>(
        API_ENDPOINTS.SITE_SETTINGS.GET,
      ),
    cacheTTL: 10 * 60 * 1000, // 10 minutes — site settings rarely change
  });

  const backgroundConfig =
    siteSettings?.backgroundConfig ?? defaultBackgroundConfig;

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
          setSearchOpen(false);
          router.push(
            `${ROUTES.PUBLIC.PRODUCTS}?search=${encodeURIComponent(query)}`,
          );
          logger.debug("Search navigating to products:", query);
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
            className={`container mx-auto ${THEME_CONSTANTS.layout.contentPadding} ${THEME_CONSTANTS.layout.maxContentWidth} ${THEME_CONSTANTS.spacing.pageY} w-full`}
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
