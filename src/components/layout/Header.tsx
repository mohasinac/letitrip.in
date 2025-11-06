"use client";

import { useState } from "react";
import SpecialEventBanner from "./SpecialEventBanner";
import MainNavBar from "./MainNavBar";
import ShopsNav from "./ShopsNav";
import SearchBar from "./SearchBar";
import FeaturedCategories from "./FeaturedCategories";
import MobileSidebar from "./MobileSidebar";

export default function Header() {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen);
  };

  return (
    <header>
      {/* 1. Special Event Banner */}
      <SpecialEventBanner />

      {/* 2. Main Navigation Bar */}
      <MainNavBar onMobileMenuToggle={toggleMobileSidebar} />

      {/* 3. Shops Navigation */}
      <ShopsNav />

      {/* 4. Search Bar with Categories */}
      <SearchBar />

      {/* 5. Featured Categories */}
      <FeaturedCategories />

      {/* Mobile Sidebar */}
      <MobileSidebar
        isOpen={isMobileSidebarOpen}
        onClose={toggleMobileSidebar}
      />
    </header>
  );
}
