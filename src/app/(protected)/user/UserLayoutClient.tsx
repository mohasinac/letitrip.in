"use client";

import React from "react";
import {
  MobileNavRow,
  userMobileNavItems,
} from "@/components/layout/MobileNavRow";

interface UserLayoutClientProps {
  children: React.ReactNode;
}

export function UserLayoutClient({ children }: UserLayoutClientProps) {
  return (
    <>
      {children}
      {/* Mobile Navigation Row - above bottom nav, hidden on desktop */}
      <MobileNavRow items={userMobileNavItems} variant="user" />
    </>
  );
}
