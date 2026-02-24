import { ReactNode } from "react";

export const metadata = {
  title: "Demo Seed Manager - Development Only",
  description: "Manage seed data in development mode",
  robots: "noindex, nofollow",
};

export default function DemoLayout({ children }: { children: ReactNode }) {
  return children;
}
