import { ReactNode } from "react";

interface ShopLayoutProps {
  children: ReactNode;
}

export default function ShopLayout({ children }: ShopLayoutProps) {
  return (
    <div className="shop-layout">
      {/* Shop-specific layout components can be added here */}
      {/* For example: breadcrumbs, filters sidebar, etc. */}
      {children}
    </div>
  );
}
