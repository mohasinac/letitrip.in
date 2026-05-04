"use client";
import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

export default function Page() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  useEffect(() => {
    if (error) return;
    const t = setTimeout(() => window.close(), 200);
    return () => clearTimeout(t);
  }, [error]);

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6 text-center">
        <div className="space-y-3">
          <p className="text-lg font-semibold text-rose-600">Sign-in failed</p>
          <p className="text-sm text-zinc-500">{decodeURIComponent(error)}</p>
          <button
            type="button"
            onClick={() => window.close()}
            className="mt-4 rounded-lg border border-zinc-300 px-4 py-2 text-sm hover:bg-zinc-50 transition-colors"
          >
            Close window
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <p className="text-sm text-zinc-400">Signing in… closing window</p>
    </div>
  );
}
