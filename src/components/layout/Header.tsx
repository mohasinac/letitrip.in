"use client";

import { useState, useRef } from "react";
import SpecialEventBanner from "./SpecialEventBanner";
import MainNavBar from "./MainNavBar";

import SubNavbar from "./SubNavbar";
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
      <header className="sticky top-0 z-50 bg-gray-800">
        <MainNavBar
          onMobileMenuToggle={toggleMobileSidebar}
          onSearchClick={handleSearchClick}
        />
      </header>
      {/* Sub Navigation Bar - Below main nav */}
      <SubNavbar />
      <SearchBar
        ref={searchBarRef}
        isVisible={isSearchVisible}
        onClose={handleCloseSearch}
      />
      {/* Mobile Sidebar */}
      <MobileSidebar
        isOpen={isMobileSidebarOpen}
        onClose={toggleMobileSidebar}
      />
    </>
  );
}
