/**
 * Authentication Debug Utility
 * Helps diagnose authentication issues in development
 */

import { auth } from "@/app/api/_lib/database/config";

export async function debugAuthStatus(): Promise<void> {
  if (typeof window === "undefined") {
    console.log("[Auth Debug] Running on server - skipping");
    return;
  }

  console.group("🔍 Authentication Debug Info");
  
  try {
    // Check Firebase Auth
    console.log("Firebase Auth Initialized:", !!auth);
    console.log("Current User:", auth?.currentUser ? "Logged In" : "Not Logged In");
    
    if (auth?.currentUser) {
      console.log("User UID:", auth.currentUser.uid);
      console.log("User Email:", auth.currentUser.email);
      console.log("Email Verified:", auth.currentUser.emailVerified);
      
      try {
        const token = await auth.currentUser.getIdToken();
        console.log("Token Length:", token?.length || 0);
        console.log("Token Preview:", token ? `${token.substring(0, 20)}...` : "None");
        
        // Decode token to check claims
        const tokenResult = await auth.currentUser.getIdTokenResult();
        console.log("Token Claims:", tokenResult.claims);
        console.log("User Role:", tokenResult.claims.role || "No role set");
      } catch (tokenError) {
        console.error("Error getting token:", tokenError);
      }
    }
    
    // Check localStorage
    console.log("\nLocalStorage Keys:", Object.keys(localStorage).filter(k => 
      k.includes("firebase") || k.includes("auth") || k.includes("user")
    ));
    
    // Check sessionStorage
    console.log("SessionStorage Keys:", Object.keys(sessionStorage).filter(k => 
      k.includes("firebase") || k.includes("auth") || k.includes("user")
    ));
    
  } catch (error) {
    console.error("Error in auth debug:", error);
  } finally {
    console.groupEnd();
  }
}

export async function testApiAuth(): Promise<void> {
  if (typeof window === "undefined") return;
  
  console.group("🧪 Testing API Authentication");
  
  try {
    const token = await auth?.currentUser?.getIdToken();
    
    if (!token) {
      console.error("❌ No token available");
      console.groupEnd();
      return;
    }
    
    // Test admin endpoints
    const endpoints = [
      "/api/admin/orders/stats",
      "/api/admin/products/stats",
      "/api/admin/support/stats"
    ];
    
    for (const endpoint of endpoints) {
      try {
        const response = await fetch(endpoint, {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });
        
        console.log(`${endpoint}:`, {
          status: response.status,
          statusText: response.statusText,
          ok: response.ok
        });
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.error(`  Error:`, errorData);
        } else {
          const data = await response.json();
          console.log(`  ✅ Success:`, data);
        }
      } catch (error) {
        console.error(`${endpoint} - Network Error:`, error);
      }
    }
  } catch (error) {
    console.error("Error testing API auth:", error);
  } finally {
    console.groupEnd();
  }
}

// Auto-run in development
if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
  // Make debug functions globally available
  (window as any).debugAuth = debugAuthStatus;
  (window as any).testApiAuth = testApiAuth;
  
  // Log helpful message
  console.log(
    "%c🔍 Auth Debug Tools Available",
    "background: #4CAF50; color: white; padding: 4px 8px; border-radius: 4px; font-weight: bold;"
  );
  console.log("Run these commands in console:");
  console.log("  debugAuth()  - Show authentication status");
  console.log("  testApiAuth() - Test API endpoint authentication");
  console.log("\nOr visit /admin/debug for a visual diagnostic page");
}

// Export for manual use
if (typeof window !== "undefined") {
  (window as any).debugAuth = debugAuthStatus;
  (window as any).testApiAuth = testApiAuth;
}
