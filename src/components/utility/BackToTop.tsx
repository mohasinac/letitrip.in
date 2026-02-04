'use client';

import { useState, useEffect } from 'react';
import { THEME_CONSTANTS } from '@/constants/theme';

/**
 * BackToTop Component
 * 
 * A floating button that appears when scrolling down (after 100px)
 * and smoothly scrolls the page back to the top when clicked.
 * Automatically adjusts position when sidebar is open.
 * 
 * @component
 * @example
 * ```tsx
 * <BackToTop sidebarOpen={sidebarOpen} />
 * ```
 */

interface BackToTopProps {
  sidebarOpen?: boolean;
}

export default function BackToTop({ sidebarOpen = false }: BackToTopProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      // Show button when page is scrolled down 100px
      if (window.scrollY > 100) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    // Check on mount
    toggleVisibility();

    window.addEventListener('scroll', toggleVisibility);

    return () => {
      window.removeEventListener('scroll', toggleVisibility);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <button
      onClick={scrollToTop}
      className={`
        fixed
        ${sidebarOpen ? 'right-[22rem] md:right-[22rem]' : 'right-6 md:right-8'}
        bottom-24 md:bottom-8
        p-3 md:p-4
        rounded-full
        bg-gradient-to-r from-blue-600 to-blue-700
        text-white
        shadow-lg hover:shadow-xl
        hover:from-blue-700 hover:to-blue-800
        active:scale-95
        transition-all duration-300
        z-[60]
        group
        ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-75 pointer-events-none'}
      `}
      aria-label="Back to top"
    >
      <svg
        className="w-5 h-5 md:w-6 md:h-6 group-hover:-translate-y-1 transition-transform"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2.5}
          d="M5 10l7-7m0 0l7 7m-7-7v18"
        />
      </svg>
    </button>
  );
}
