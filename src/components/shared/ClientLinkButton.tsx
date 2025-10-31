"use client";

import React from "react";
import { useRouter } from "next/navigation";

interface ClientLinkButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  href: string;
  children: React.ReactNode;
  variant?: "contained" | "outlined" | "text";
}

/**
 * A client-side button component that works with Next.js router
 */
export function ClientLinkButton({
  href,
  children,
  variant = "contained",
  className = "",
  ...props
}: ClientLinkButtonProps) {
  const router = useRouter();

  const handleClick = () => {
    router.push(href);
  };

  const variantClasses = {
    contained: "bg-blue-600 text-white hover:bg-blue-700",
    outlined:
      "border-2 border-blue-600 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20",
    text: "text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20",
  };

  return (
    <button
      {...props}
      onClick={handleClick}
      className={`px-4 py-2 rounded-lg font-medium transition-colors ${variantClasses[variant]} ${className}`}
    >
      {children}
    </button>
  );
}
