"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "@/i18n/navigation";
import { THEME_CONSTANTS, ROUTES } from "@/constants";
import { useTheme } from "@/contexts/ThemeContext";
import { useBottomActionsContext } from "@/contexts/BottomActionsContext";
import {
  TitleBar,
  Sidebar,
  Footer,
  BottomNavbar,
  BottomActions,
} from "./layout";
import MainNavbar from "./layout/MainNavbar";
import Search from "./utility/Search";
import BackToTop from "./utility/BackToTop";
import AutoBreadcrumbs from "./layout/AutoBreadcrumbs";
import { Main } from "@mohasinac/appkit/ui";
import { BackgroundRenderer } from "./utility";
import { logger } from "@mohasinac/appkit/core";
import { useSiteSettings } from "@/hooks";
import { EventBanner } from "@/components";
import UnsavedChangesModal from "./modals/UnsavedChangesModal";

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
  const pathname = usePathname();
  const isAdminRoute =
    pathname.startsWith("/admin") || pathname.startsWith("/seller");
  const isUserRoute = pathname.startsWith("/user");

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  // Expand bottom margin when BottomActions bar is visible so content
  // is never hidden behind the stacked fixed bars on mobile.
  const { state: baState } = useBottomActionsContext();
  const hasBottomActions =
    baState.actions.length > 0 ||
    !!(baState.bulk && baState.bulk.selectedCount > 0) ||
    !!baState.infoLabel;

  const DEFAULT_LIGHT_BG = {
    type: "color" as const,
    value: "#f9fafb",
    overlay: { enabled: false, color: "#000000", opacity: 0 },
  };
  const DEFAULT_DARK_BG = {
    type: "color" as const,
    value: "#030712",
    overlay: { enabled: false, color: "#000000", opacity: 0 },
  };

  // Fetch background settings from site settings API.
  // The API returns background.light / background.dark.
  const { data: siteSettings } = useSiteSettings<{
    background?: {
      light?: typeof DEFAULT_LIGHT_BG;
      dark?: typeof DEFAULT_DARK_BG;
    };
    navbarConfig?: { hiddenNavItems?: string[] };
    footerConfig?: {
      trustBar?: {
        enabled?: boolean;
        items?: { icon: string; label: string; visible: boolean }[];
      };
      newsletterEnabled?: boolean;
    };
  }>();

  const backgroundConfig = {
    lightMode: siteSettings?.background?.light ?? DEFAULT_LIGHT_BG,
    darkMode: siteSettings?.background?.dark ?? DEFAULT_DARK_BG,
  };

  // Sidebar always starts closed — user opens it explicitly.
  useEffect(() => {
    const savedPreference = localStorage.getItem("sidebarOpen");
    if (savedPreference !== null) {
      setSidebarOpen(savedPreference === "true");
    }
    // No resize-based auto-open — sidebar is opt-in.
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

  if (isAdminRoute) {
    return (
      <div className="flex flex-col h-screen w-full overflow-hidden">
        <div className={`shrink-0 ${THEME_CONSTANTS.zIndex.titleBar} w-full`}>
          <TitleBar
            onToggleSidebar={() => {}}
            sidebarOpen={false}
            onSearchToggle={() => setSearchOpen(!searchOpen)}
            searchOpen={searchOpen}
            isDark={isDark}
            onToggleTheme={toggleTheme}
          />
          <MainNavbar
            hiddenNavItems={siteSettings?.navbarConfig?.hiddenNavItems}
          />
          <Search
            isOpen={searchOpen}
            onOpen={() => setSearchOpen(true)}
            onClose={() => setSearchOpen(false)}
            onSearch={(query) => {
              setSearchOpen(false);
              router.push(
                `${ROUTES.PUBLIC.PRODUCTS}?search=${encodeURIComponent(query)}`,
              );
            }}
          />
        </div>
        <div className="flex-1 min-h-0 overflow-hidden">{children}</div>
        <BottomNavbar onSearchToggle={() => setSearchOpen(!searchOpen)} />
      </div>
    );
  }

  if (isUserRoute) {
    return (
      <div className="flex flex-col min-h-screen w-full">
        <div
          className={`sticky top-0 ${THEME_CONSTANTS.zIndex.titleBar} w-full`}
        >
          <TitleBar
            onToggleSidebar={() => {}}
            sidebarOpen={false}
            onSearchToggle={() => setSearchOpen(!searchOpen)}
            searchOpen={searchOpen}
            isDark={isDark}
            onToggleTheme={toggleTheme}
          />
          <MainNavbar
            hiddenNavItems={siteSettings?.navbarConfig?.hiddenNavItems}
          />
          <Search
            isOpen={searchOpen}
            onOpen={() => setSearchOpen(true)}
            onClose={() => setSearchOpen(false)}
            onSearch={(query) => {
              setSearchOpen(false);
              router.push(
                `${ROUTES.PUBLIC.PRODUCTS}?search=${encodeURIComponent(query)}`,
              );
            }}
          />
        </div>
        <div className="flex-1">{children}</div>
        <BottomNavbar onSearchToggle={() => setSearchOpen(!searchOpen)} />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen w-full overflow-x-clip transition-colors duration-300">
      {/* Dynamic Background */}
      <BackgroundRenderer
        lightMode={backgroundConfig.lightMode}
        darkMode={backgroundConfig.darkMode}
      />
      {/* Unified sticky site header: TitleBar + Navbar + Search row */}
      <div className={`sticky top-0 ${THEME_CONSTANTS.zIndex.titleBar} w-full`}>
        <TitleBar
          onToggleSidebar={handleToggleSidebar}
          sidebarOpen={sidebarOpen}
          onSearchToggle={() => setSearchOpen(!searchOpen)}
          searchOpen={searchOpen}
          isDark={isDark}
          onToggleTheme={toggleTheme}
        />
        <MainNavbar
          hiddenNavItems={siteSettings?.navbarConfig?.hiddenNavItems}
        />
        <Search
          isOpen={searchOpen}
          onOpen={() => setSearchOpen(true)}
          onClose={() => setSearchOpen(false)}
          onSearch={(query) => {
            setSearchOpen(false);
            router.push(
              `${ROUTES.PUBLIC.PRODUCTS}?search=${encodeURIComponent(query)}`,
            );
            logger.debug("Search navigating to products:", query);
          }}
        />
      </div>

      {/* Dismissible event banner for active sales / offers */}
      <EventBanner />

      {/* Breadcrumbs - shown on all pages except home */}
      <AutoBreadcrumbs />

      {/* Content with Sidebar */}
      <div className="flex flex-1 relative w-full overflow-x-clip">
        <Sidebar
          isOpen={sidebarOpen}
          isDark={isDark}
          onClose={handleToggleSidebar}
          onToggleTheme={toggleTheme}
        />

        {/* Main Content - modern spacing and transitions */}
        <Main
          id="main-content"
          className={`flex-1 ${hasBottomActions ? "mb-28" : "mb-16"} md:mb-0 w-full`}
        >
          <div
            className={`container mx-auto ${THEME_CONSTANTS.layout.contentPadding} ${THEME_CONSTANTS.layout.maxContentWidth} ${THEME_CONSTANTS.spacing.pageY} w-full`}
          >
            {children}
          </div>
        </Main>
      </div>

      <BackToTop
        sidebarOpen={sidebarOpen}
        hasBottomActions={hasBottomActions}
      />

      <Footer footerConfig={siteSettings?.footerConfig} />

      <BottomActions />
      <BottomNavbar onSearchToggle={() => setSearchOpen(!searchOpen)} />

      {/* Global unsaved-changes confirmation modal */}
      <UnsavedChangesModal />
    </div>
  );
}
