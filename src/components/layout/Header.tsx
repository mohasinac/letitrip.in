"use client";

import { useState, useRef } from "react";
import SpecialEventBanner from "./SpecialEventBanner";
import MainNavBar from "./MainNavBar";
import ShopsNav from "./ShopsNav";
import SearchBar, { SearchBarRef } from "./SearchBar";

import MobileSidebar from "./MobileSidebar";

export default function Header() {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const searchBarRef = useRef<SearchBarRef>(null);

  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen);
  };

  const handleSearchClick = () => {
    setIsSearchVisible(true);
    setTimeout(() => {
      searchBarRef.current?.focusSearch();
    }, 100);
  };

  const handleCloseSearch = () => {
    setIsSearchVisible(false);
    searchBarRef.current?.hide();
  };

  return (
    <>
      {/* 1. Special Event Banner - Not sticky, scrolls away */}
      <SpecialEventBanner />

      {/* 2. Main Navigation Bar - Sticky, always visible when scrolling */}
      <div className="sticky top-0 z-50 bg-gray-800">
        <MainNavBar
          onMobileMenuToggle={toggleMobileSidebar}
          onSearchClick={handleSearchClick}
        />
      </div>

      {/* 3-5. Rest of header content */}
      <header>
        {/* 4. Search Bar with Categories - Hidden by default */}
        <SearchBar
          ref={searchBarRef}
          isVisible={isSearchVisible}
          onClose={handleCloseSearch}
        />
      </header>

      {/* Mobile Sidebar */}
      <MobileSidebar
        isOpen={isMobileSidebarOpen}
        onClose={toggleMobileSidebar}
      />
    </>
  );
}
