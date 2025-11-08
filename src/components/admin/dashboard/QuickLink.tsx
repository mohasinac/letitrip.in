import Link from "next/link";
import { LucideIcon } from "lucide-react";

interface QuickLinkProps {
  label: string;
  href: string;
  icon: LucideIcon;
}

export function QuickLink({ label, href, icon: Icon }: QuickLinkProps) {
  return (
    <Link
      href={href}
      className="flex flex-col items-center justify-center p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md hover:border-yellow-200 transition-all"
    >
      <Icon className="h-6 w-6 text-gray-600 mb-2" />
      <span className="text-sm font-medium text-gray-900">{label}</span>
    </Link>
  );
}
