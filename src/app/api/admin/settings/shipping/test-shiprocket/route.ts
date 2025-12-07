/**
 * Shiprocket Test Connection API Route
 *
 * Test Shiprocket API credentials
 *
 * @status IMPLEMENTED
 * @epic E021 - System Configuration
 */

import { getAuthFromRequest } from "@/app/api/lib/auth";
import { logError } from "@/lib/firebase-error-logger";
import { NextRequest, NextResponse } from "next/server";

interface TestConnectionRequest {
  email: string;
  password: string;
}

interface ShiprocketAuthResponse {
  token: string;
  first_name: string;
  last_name: string;
  email: string;
  company_id: number;
}

// POST - Test Shiprocket connection
export async function POST(req: NextRequest) {
  try {
    const authResult = await getAuthFromRequest(req);
    if (!authResult.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin
    if (authResult.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body: TestConnectionRequest = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    // Test Shiprocket authentication
    const testResult = await testShiprocketConnection(email, password);

    if (testResult.success) {
      return NextResponse.json({
        success: true,
        message: testResult.message,
        data: testResult.data,
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          error: testResult.message,
        },
        { status: 400 }
      );
    }
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    logError(err, {
      component: "ShiprocketTestConnectionAPI",
    });

    return NextResponse.json(
      {
        success: false,
        error: err.message,
      },
      { status: 500 }
    );
  }
}

/**
 * Test Shiprocket connection by attempting authentication
 */
async function testShiprocketConnection(
  email: string,
  password: string
): Promise<{
  success: boolean;
  message: string;
  data?: { name: string; email: string; companyId: number };
}> {
  try {
    const response = await fetch(
      "https://apiv2.shiprocket.in/v1/external/auth/login",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        message:
          errorData.message ||
          `Authentication failed with status ${response.status}`,
      };
    }

    const data: ShiprocketAuthResponse = await response.json();

    if (!data.token) {
      return {
        success: false,
        message: "No token received from Shiprocket",
      };
    }

    return {
      success: true,
      message: `Successfully connected to Shiprocket account: ${data.first_name} ${data.last_name}`,
      data: {
        name: `${data.first_name} ${data.last_name}`,
        email: data.email,
        companyId: data.company_id,
      },
    };
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    logError(err, {
      component: "testShiprocketConnection",
    });

    return {
      success: false,
      message: err.message,
    };
  }
}
