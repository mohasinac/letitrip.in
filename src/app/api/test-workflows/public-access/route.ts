import { NextRequest, NextResponse } from "next/server";

/**
 * Test Public API Access
 *
 * This endpoint verifies that public APIs work without authentication.
 * It makes requests to various public endpoints and reports which ones
 * are accessible without auth cookies.
 */

const PUBLIC_ENDPOINTS = [
  {
    path: "/api/products?status=published&limit=5",
    description: "Published Products",
  },
  {
    path: "/api/shops?verified=true&limit=5",
    description: "Verified Shops",
  },
  {
    path: "/api/categories/homepage",
    description: "Homepage Categories",
  },
  {
    path: "/api/blog?status=published&limit=3",
    description: "Published Blog Posts",
  },
  {
    path: "/api/auctions?status=active&limit=5",
    description: "Active Auctions",
  },
];

export async function GET(request: NextRequest) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    const results = [];
    let passed = 0;
    let failed = 0;

    console.log("\n🌐 Testing Public API Access...");

    for (const endpoint of PUBLIC_ENDPOINTS) {
      const url = `${baseUrl}${endpoint.path}`;

      try {
        const startTime = Date.now();

        // Make request WITHOUT credentials to test public access
        const response = await fetch(url, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          // Don't include cookies/credentials
        });

        const duration = Date.now() - startTime;
        const isSuccess = response.ok && response.status !== 401;

        if (isSuccess) {
          passed++;
          console.log(
            `✅ ${endpoint.description} - ${response.status} (${duration}ms)`
          );
        } else {
          failed++;
          console.log(
            `❌ ${endpoint.description} - ${response.status} (${duration}ms)`
          );
        }

        const data = await response.json();

        results.push({
          endpoint: endpoint.path,
          description: endpoint.description,
          status: response.status,
          success: isSuccess,
          duration,
          dataCount: data.data?.length || data.count || 0,
          error: !isSuccess
            ? data.error || data.message || "Unknown error"
            : null,
        });
      } catch (error: any) {
        failed++;
        console.log(`❌ ${endpoint.description} - Error: ${error.message}`);

        results.push({
          endpoint: endpoint.path,
          description: endpoint.description,
          status: 0,
          success: false,
          duration: 0,
          error: error.message,
        });
      }
    }

    console.log(
      `\n📊 Public API Test Results: ${passed}/${PUBLIC_ENDPOINTS.length} passed\n`
    );

    return NextResponse.json({
      success: true,
      summary: {
        total: PUBLIC_ENDPOINTS.length,
        passed,
        failed,
        passRate: `${((passed / PUBLIC_ENDPOINTS.length) * 100).toFixed(1)}%`,
      },
      results,
      message:
        failed === 0
          ? "✅ All public APIs are accessible without authentication"
          : `⚠️ ${failed} public API(s) require authentication (should be public)`,
    });
  } catch (error: any) {
    console.error("Public API test error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to test public APIs",
      },
      { status: 500 }
    );
  }
}
