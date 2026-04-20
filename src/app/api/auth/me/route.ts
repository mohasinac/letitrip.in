import { withProviders } from "@/providers.config";
import { authMeGET } from "@mohasinac/appkit";
// GET /api/auth/me — return the current authenticated user's profile.
export const GET = withProviders(authMeGET);

