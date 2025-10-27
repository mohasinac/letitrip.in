"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Button, ButtonProps } from "@mui/material";

interface ClientLinkButtonProps extends Omit<ButtonProps, "href"> {
  href: string;
  children: React.ReactNode;
}

/**
 * A client-side button component that works with Next.js router
 */
export function ClientLinkButton({
  href,
  children,
  ...props
}: ClientLinkButtonProps) {
  const router = useRouter();

  const handleClick = () => {
    router.push(href);
  };

  return (
    <Button {...props} onClick={handleClick}>
      {children}
    </Button>
  );
}
