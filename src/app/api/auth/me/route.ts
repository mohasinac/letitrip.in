import { withProviders } from "@/providers.config";
import { createRouteHandler, userRepository } from "@mohasinac/appkit";

export const GET = withProviders(
  createRouteHandler({
    auth: true,
    handler: async ({ user }) => {
      const { auth } = await import("@mohasinac/appkit").then((m) => ({
        auth: m.getProviders().auth,
      }));

      if (!auth) {
        return new Response(
          JSON.stringify({ success: false, error: "Auth provider not configured" }),
          { status: 503, headers: { "Content-Type": "application/json" } },
        );
      }

      const profile = await auth.getUser(user!.uid);
      if (!profile) {
        return new Response(
          JSON.stringify({ success: false, error: "User not found" }),
          { status: 404, headers: { "Content-Type": "application/json" } },
        );
      }

      // If role is "user" from custom claims, check Firestore for the real role
      // (custom claims may be stale if admin was created before claims were synced)
      let role = profile.role ?? "user";
      if (role === "user") {
        const firestoreUser = await userRepository.findById(user!.uid).catch(() => null);
        if (firestoreUser?.role && firestoreUser.role !== "user") {
          role = firestoreUser.role;
          // Sync custom claims so next check is fast
          const adminAuth = await import("@mohasinac/appkit").then((m) => m.getAdminAuth?.());
          if (adminAuth) {
            adminAuth.setCustomUserClaims(user!.uid, { role }).catch(() => {});
          }
        }
      }

      return new Response(
        JSON.stringify({
          success: true,
          data: {
            id: profile.uid,
            email: profile.email ?? undefined,
            displayName: profile.displayName ?? undefined,
            photoURL: profile.photoURL ?? undefined,
            role,
            isEmailVerified: profile.emailVerified,
          },
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      );
    },
  }),
);
