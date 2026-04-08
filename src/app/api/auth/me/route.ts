import { withProviders } from "@/providers.config";
import { authMeGET } from "@mohasinac/feat-auth";
// GET /api/auth/me — return the current authenticated user's profile.
export const GET = withProviders(authMeGET);
