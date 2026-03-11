"use client";

/**
 * SidebarLayout Component
 *
 * Generic slide-out sidebar shell used by the Sidebar component.
 * Renders:
 *  - Backdrop overlay when open (closes on click)
 *  - Aside container with transform animation (right-side slide)
 *  - Fixed header slot (no-scroll, pinned at top)
 *  - Scrollable body slot (fills remaining height)
 *
 * Uses `forwardRef` so the parent can attach a swipe-detection ref
 * to the rendered `Aside` element.
 *
 * @component
 * @example
 * ```tsx
 * <SidebarLayout
 *   ref={sidebarRef}
 *   isOpen={isOpen}
 *   ariaLabel="Navigation"
 *   onClose={onClose}
 *   header={<UserProfileHeader />}
 * >
 *   <NavSections />
 * </SidebarLayout>
 * ```
 */

import React, { forwardRef } from "react";
import { Aside } from "@/components";
import { THEME_CONSTANTS } from "@/constants";

export interface SidebarLayoutProps {
  isOpen: boolean;
  ariaLabel: string;
  onClose: () => void;
  /** Content pinned inside a fixed (non-scrolling) header strip */
  header: React.ReactNode;
  /** Scrollable body content */
  children: React.ReactNode;
  id?: string;
}

export const SidebarLayout = forwardRef<HTMLElement, SidebarLayoutProps>(
  function SidebarLayout(
    { isOpen, ariaLabel, onClose, header, children, id = "secondary-sidebar" },
    ref,
  ) {
    const { position, overflow, flex } = THEME_CONSTANTS;

    return (
      <>
        {/* Backdrop overlay — dims content behind sidebar */}
        {isOpen && (
          <div
            className={`${position.fixedFill} bg-black/40 backdrop-blur-[2px] ${THEME_CONSTANTS.zIndex.overlay} transition-opacity duration-300`}
            onClick={onClose}
            aria-hidden="true"
          />
        )}

        <Aside
          ref={ref}
          id={id}
          aria-label={ariaLabel}
          className={`
            fixed inset-y-0 right-0
            ${THEME_CONSTANTS.layout.sidebarWidth}
            ${THEME_CONSTANTS.layout.sidebarBg}
            shadow-2xl
            transform duration-300 ease-in-out
            ${THEME_CONSTANTS.zIndex.sidebar}
            ${isOpen ? "translate-x-0" : "translate-x-full"}
            flex flex-col
          `}
        >
          {/* Fixed (non-scrolling) header strip */}
          <div
            className={`${flex.noShrink} px-6 py-5 border-b border-zinc-200 dark:border-slate-800 bg-zinc-50 dark:bg-slate-900/80`}
          >
            {header}
          </div>

          {/* Scrollable body */}
          <div className={`flex-1 ${overflow.yAuto} scrollbar-thin px-6 py-4`}>
            {children}
          </div>
        </Aside>
      </>
    );
  },
);

SidebarLayout.displayName = "SidebarLayout";
