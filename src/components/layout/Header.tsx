"use client";

import { useState, useRef } from "react";
import SpecialEventBanner from "./SpecialEventBanner";
import MainNavBar from "./MainNavBar";
import ShopsNav from "./ShopsNav";
import SearchBar, { SearchBarRef } from "./SearchBar";
import FeaturedCategories from "./FeaturedCategories";
import MobileSidebar from "./MobileSidebar";

export default function Header() {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const searchBarRef = useRef<SearchBarRef>(null);

  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen);
  };

  const handleSearchClick = () => {
    searchBarRef.current?.focusSearch();
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
        {/* 3. Shops Navigation */}
        <ShopsNav />

        {/* 4. Search Bar with Categories */}
        <SearchBar ref={searchBarRef} />

        {/* 5. Featured Categories */}
        <FeaturedCategories />
      </header>

      {/* Mobile Sidebar */}
      <MobileSidebar
        isOpen={isMobileSidebarOpen}
        onClose={toggleMobileSidebar}
      />
    </>
  );
}
