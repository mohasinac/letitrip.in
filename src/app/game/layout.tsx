"use client";

import { GameProvider } from "@/contexts/GameContext";

export default function GameRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <GameProvider>{children}</GameProvider>;
}
