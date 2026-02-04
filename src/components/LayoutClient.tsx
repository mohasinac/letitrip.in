'use client';

import { useState } from 'react';
import { THEME_CONSTANTS } from '@/constants/theme';
import { useTheme } from '@/contexts/ThemeContext';
import { TitleBar, MainNavbar, Sidebar, Footer, BottomNavbar } from './layout';
import Search from './utility/Search';
import BackToTop from './utility/BackToTop';

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
  const isDark = theme === 'dark';

  return (
    <div className={`flex flex-col min-h-screen transition-colors ${THEME_CONSTANTS.themed.bgPrimary}`}>
      <TitleBar 
        isDark={isDark}
        onToggleTheme={toggleTheme}
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        sidebarOpen={sidebarOpen}
        onSearchToggle={() => setSearchOpen(!searchOpen)}
        searchOpen={searchOpen}
      />
      
      <MainNavbar />
      
      <Search 
        isOpen={searchOpen} 
        onClose={() => setSearchOpen(false)}
        onSearch={(query) => {
          console.log('Searching for:', query);
          // Add your search logic here
        }}
      />

      {/* Content with Sidebar */}
      <div className="flex flex-1 relative">
        {/* Overlay */}
        {sidebarOpen && (
          <div
            className={`fixed inset-0 bg-black/50 ${THEME_CONSTANTS.zIndex.overlay}`}
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <Sidebar 
          isOpen={sidebarOpen}
          isDark={isDark}
          onClose={() => setSidebarOpen(false)}
        />

        {/* Main Content */}
        <main className={`flex-1 p-6 mb-16 md:mb-0 transition-colors ${THEME_CONSTANTS.themed.bgPrimary}`}>
          {children}
        </main>
      </div>

      <BackToTop sidebarOpen={sidebarOpen} />

      <Footer />
      
      <BottomNavbar onSearchToggle={() => setSearchOpen(!searchOpen)} />
    </div>
  );
}
