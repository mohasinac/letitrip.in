"use client";

import { BellIcon } from "@heroicons/react/24/outline";

interface SellerNotificationCenterProps {
  notifications: any[];
  unreadCount: number;
  onMarkAsRead: (id: string) => void;
  loading: boolean;
}

export default function SellerNotificationCenter({
  notifications,
  unreadCount,
  onMarkAsRead,
  loading,
}: SellerNotificationCenterProps) {
  return (
    <div className="relative">
      <button className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
        <BellIcon className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full min-w-[1.25rem] h-5">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>
    </div>
  );
}
