"use client";

import { usePageTracking } from "@/hooks/usePageTracking";
import { cookieStorage } from "@/lib/storage/cookieStorage";
import { useState, useEffect } from "react";

/**
 * Example component demonstrating guest session persistence
 * This shows how cart and browsing data persists for non-logged-in users
 */
export default function GuestPersistenceDemo() {
  usePageTracking(); // Automatically tracks this page visit

  const [guestSession, setGuestSession] = useState<any>(null);
  const [lastPage, setLastPage] = useState<string | null>(null);

  useEffect(() => {
    // Load guest session data
    const session = cookieStorage.getGuestSession();
    setGuestSession(session);

    // Load last visited page
    const last = cookieStorage.getLastVisitedPage();
    setLastPage(last);
  }, []);

  return (
    <div className="container py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">
          Guest Session Persistence Demo
        </h1>

        <div className="card p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">What This Feature Does</h2>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li>Tracks pages you visit (stored in cookies)</li>
            <li>Saves your cart items even if you're not logged in</li>
            <li>Remembers the last page you were on</li>
            <li>Keeps browsing history (last 10 pages)</li>
            <li>Syncs everything to your account when you login</li>
          </ul>
        </div>

        <div className="card p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Last Visited Page</h2>
          {lastPage ? (
            <p className="text-gray-700">
              <span className="font-medium">Previous page:</span> {lastPage}
            </p>
          ) : (
            <p className="text-gray-500">No previous page tracked</p>
          )}
        </div>

        <div className="card p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Guest Session Data</h2>
          {guestSession ? (
            <div className="space-y-3">
              {guestSession.lastVisitedPage && (
                <div>
                  <span className="font-medium">Last Visited:</span>{" "}
                  <span className="text-gray-700">
                    {guestSession.lastVisitedPage}
                  </span>
                </div>
              )}

              {guestSession.cart && guestSession.cart.length > 0 && (
                <div>
                  <span className="font-medium">Cart Items:</span>{" "}
                  <span className="text-gray-700">
                    {guestSession.cart.length} items
                  </span>
                </div>
              )}

              {guestSession.browsing_history &&
                guestSession.browsing_history.length > 0 && (
                  <div>
                    <span className="font-medium">Browsing History:</span>
                    <ul className="mt-2 ml-6 list-disc text-gray-700 text-sm">
                      {guestSession.browsing_history.map(
                        (page: string, idx: number) => (
                          <li key={idx}>{page}</li>
                        )
                      )}
                    </ul>
                  </div>
                )}

              {guestSession.timestamp && (
                <div className="text-sm text-gray-500">
                  Last updated:{" "}
                  {new Date(guestSession.timestamp).toLocaleString()}
                </div>
              )}
            </div>
          ) : (
            <p className="text-gray-500">No guest session data found</p>
          )}
        </div>

        <div className="card p-6 bg-blue-50 border border-blue-200">
          <h2 className="text-xl font-semibold mb-4 text-blue-900">
            How to Test
          </h2>
          <ol className="list-decimal list-inside space-y-2 text-gray-700">
            <li>Browse some pages as a guest (not logged in)</li>
            <li>Add items to your cart</li>
            <li>Close your browser</li>
            <li>Reopen and return to this site</li>
            <li>Your cart items will still be there!</li>
            <li>Login to your account</li>
            <li>Your cart will merge with your user cart</li>
            <li>You'll be redirected to your last visited page</li>
          </ol>
        </div>

        <div className="mt-6 flex gap-4">
          <button
            onClick={() => {
              const session = cookieStorage.getGuestSession();
              setGuestSession(session);
              const last = cookieStorage.getLastVisitedPage();
              setLastPage(last);
            }}
            className="btn-primary"
          >
            Refresh Data
          </button>

          <button
            onClick={() => {
              cookieStorage.removeGuestSession();
              cookieStorage.removeLastVisitedPage();
              setGuestSession(null);
              setLastPage(null);
            }}
            className="btn-secondary"
          >
            Clear Session Data
          </button>
        </div>
      </div>
    </div>
  );
}
