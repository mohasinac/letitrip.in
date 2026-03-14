import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Unauthorized — LetItRip",
  robots: { index: false, follow: false },
};

export default function UnauthorizedLayout({
  children,
}: {
  children: ReactNode;
}) {
  return children;
}
