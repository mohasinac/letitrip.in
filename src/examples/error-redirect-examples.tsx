/**
 * Example: Using Error Redirect Utilities
 *
 * This file demonstrates how to use the error redirect utilities
 * in your client components to handle API errors gracefully.
 */

"use client";

import { useState } from "react";
import { useErrorRedirect, checkResponseOrRedirect } from "@/lib/errors";
import Button from "@/components/ui/Button";

/**
 * Example 1: Using the useErrorRedirect hook
 */
export function Example1() {
  const { redirectOnError } = useErrorRedirect();

  const handleProtectedAction = async () => {
    try {
      const response = await fetch("/api/admin/users");

      if (!response.ok) {
        // Automatically redirects to /unauthorized for 401/403
        redirectOnError(response.status);
        return;
      }

      const data = await response.json();
      // Process data...
    } catch (error) {
      console.error("Error:", error);
      // For network errors, you can redirect to a generic error
      redirectOnError(500);
    }
  };

  return <Button onClick={handleProtectedAction}>Load Admin Data</Button>;
}

/**
 * Example 2: Using checkResponseOrRedirect helper
 */
export function Example2() {
  const [data, setData] = useState(null);

  const fetchData = async () => {
    try {
      const response = await fetch("/api/user/profile");

      // Check response and auto-redirect if error
      const isOk = await checkResponseOrRedirect(response);
      if (!isOk) return; // Already redirected

      const result = await response.json();
      setData(result.data);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return <Button onClick={fetchData}>Fetch Profile</Button>;
}

/**
 * Example 3: Manual error handling with custom logic
 */
export function Example3() {
  const handleAction = async () => {
    try {
      const response = await fetch("/api/orders");

      if (response.status === 401) {
        // Redirect to login instead of unauthorized page
        window.location.href = "/auth/login?redirect=/orders";
        return;
      }

      if (response.status === 403) {
        // Show toast notification and redirect
        alert("You do not have permission to view orders");
        window.location.href = "/unauthorized";
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to fetch orders");
      }

      const data = await response.json();
      // Process data...
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return <Button onClick={handleAction}>View Orders</Button>;
}

/**
 * Example 4: Error boundary with custom fallback
 */
export function Example4WithErrorBoundary() {
  return (
    <div>
      {/* Your component that might throw errors */}
      <Example1 />
    </div>
  );
}
