import "@/providers.config";
// GET /api/auth/me — return the current authenticated user's profile.
// Delegated to @mohasinac/feat-auth; session verified via firebaseSessionProvider.
export { authMeGET as GET } from "@mohasinac/feat-auth";
