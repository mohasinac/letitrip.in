"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getRedirectRoute } from "@/constants/routes";

interface LegacyRouteRedirectProps {
  from: string;
  to?: string;
  children?: React.ReactNode;
}

export default function LegacyRouteRedirect({
  from,
  to,
  children,
}: LegacyRouteRedirectProps) {
  const router = useRouter();

  useEffect(() => {
    const redirectTo = to || getRedirectRoute(from);
    if (redirectTo) {
      router.replace(redirectTo);
    }
  }, [from, to, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center max-w-md mx-auto p-6">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-6"></div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Redirecting...
        </h2>
        <p className="text-gray-600 mb-4">
          We're moving you to the new location.
        </p>
        {children}
        <div className="mt-6 text-sm text-gray-500">
          If you're not redirected automatically,
          <button
            onClick={() => {
              const redirectTo = to || getRedirectRoute(from);
              if (redirectTo) router.push(redirectTo);
            }}
            className="text-primary hover:underline ml-1"
          >
            click here
          </button>
        </div>
      </div>
    </div>
  );
}
