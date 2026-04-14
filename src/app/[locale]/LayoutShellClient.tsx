"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "@/i18n/navigation";
import { THEME_CONSTANTS, ROUTES } from "@/constants";
import { useTheme } from "@/contexts/ThemeContext";
import { useBottomActionsContext } from "@mohasinac/appkit/features/layout";
import {
  TitleBar,
  Sidebar,
  Footer,
  BottomNavbar,
} from "@/components/layout";
import { AutoBreadcrumbs, BottomActions } from "@mohasinac/appkit/features/layout";
import MainNavbar from "@/components/layout/MainNavbar";
import Search from "@/components/utility/Search";
import BackToTop from "@/components/utility/BackToTop";
import { EventBanner } from "@/components";
import UnsavedChangesModal from "@/components/modals/UnsavedChangesModal";
import { BackgroundRenderer } from "@/components/utility";
import { Main } from "@mohasinac/appkit/ui";
import { logger } from "@mohasinac/appkit/core";
import { useSiteSettings } from "@/hooks";

export default function LayoutShellClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const isAdminRoute = pathname.startsWith("/admin") || pathname.startsWith("/seller");
  const isUserRoute = pathname.startsWith("/user");
  const isDashboardRoute = isAdminRoute || isUserRoute;

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

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

  useEffect(() => {
    const savedPreference = localStorage.getItem("sidebarOpen");
    if (savedPreference !== null) {
      setSidebarOpen(savedPreference === "true");
    }
  }, []);

  const handleToggleSidebar = () => {
    setSidebarOpen((prev) => {
      const next = !prev;
      localStorage.setItem("sidebarOpen", String(next));
      return next;
    });
  };

  if (isDashboardRoute) {
    return (
      <div className="flex min-h-screen w-full flex-col">
        <div className="min-h-0 flex-1 overflow-hidden">{children}</div>
        <BottomNavbar onSearchToggle={() => setSearchOpen(!searchOpen)} />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full flex-col overflow-x-clip transition-colors duration-300">
      <BackgroundRenderer
        lightMode={backgroundConfig.lightMode}
        darkMode={backgroundConfig.darkMode}
      />

      <div className={`sticky top-0 ${THEME_CONSTANTS.zIndex.titleBar} w-full`}>
        <TitleBar
          onToggleSidebar={handleToggleSidebar}
          sidebarOpen={sidebarOpen}
          onSearchToggle={() => setSearchOpen(!searchOpen)}
          searchOpen={searchOpen}
          isDark={isDark}
          onToggleTheme={toggleTheme}
        />
        <MainNavbar hiddenNavItems={siteSettings?.navbarConfig?.hiddenNavItems} />
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

      <EventBanner />
      <AutoBreadcrumbs />

      <div className="relative flex w-full flex-1 overflow-x-clip">
        <Sidebar
          isOpen={sidebarOpen}
          isDark={isDark}
          onClose={handleToggleSidebar}
          onToggleTheme={toggleTheme}
        />

        <Main id="main-content" className={`flex-1 ${hasBottomActions ? "mb-28" : "mb-16"} w-full md:mb-0`}>
          <div
            className={`container mx-auto ${THEME_CONSTANTS.layout.contentPadding} ${THEME_CONSTANTS.layout.maxContentWidth} ${THEME_CONSTANTS.spacing.pageY} w-full`}
          >
            {children}
          </div>
        </Main>
      </div>

      <BackToTop sidebarOpen={sidebarOpen} hasBottomActions={hasBottomActions} />
      <Footer footerConfig={siteSettings?.footerConfig} />
      <BottomActions />
      <BottomNavbar onSearchToggle={() => setSearchOpen(!searchOpen)} />
      <UnsavedChangesModal />
    </div>
  );
}
