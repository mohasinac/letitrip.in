import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LetItRip - Welcome",
  description: "Welcome to LetItRip",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
