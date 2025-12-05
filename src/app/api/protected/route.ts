import { NextRequest, NextResponse } from "next/server";
import { AuthenticatedRequest, requireAuth } from "../middleware/auth";

/**
 * Example protected route that requires authentication
 * Access user session data via req.session
 */
async function protectedHandler(req: AuthenticatedRequest) {
  // Session data is guaranteed to exist because of requireAuth
  const { userId, email, role, sessionId } = req.session!;

  return NextResponse.json(
    {
      message: "This is a protected endpoint",
      user: {
        userId,
        email,
        role,
      },
      sessionId,
      timestamp: new Date().toISOString(),
    },
    { status: 200 }
  );
}

export async function GET(req: NextRequest) {
  return requireAuth(req, protectedHandler);
}
