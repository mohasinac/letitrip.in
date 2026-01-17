import { LucideIcon } from "lucide-react";
import { ComponentType, ReactNode } from "react";

export interface QuickLinkProps {
  label: string;
  href: string;
  icon: LucideIcon;
  LinkComponent: ComponentType<{
    href: string;
    className?: string;
    children: ReactNode;
  }>;
}

export function QuickLink({
  label,
  href,
  icon: Icon,
  LinkComponent,
}: QuickLinkProps) {
  return (
    <LinkComponent
      href={href}
      className="flex flex-col items-center justify-center p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md hover:border-yellow-200 transition-all"
    >
      <Icon className="h-6 w-6 text-gray-600 mb-2" />
      <span className="text-sm font-medium text-gray-900">{label}</span>
    </LinkComponent>
  );
}
