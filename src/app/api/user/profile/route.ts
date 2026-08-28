import { withProviders } from "@/providers.config";
import type { JsonValue } from "@mohasinac/appkit";
import { z } from "zod";
import { mediaUrlSchema } from "@/validation/request-schemas";
import { userRepository } from "@mohasinac/appkit";
import { successResponse } from "@mohasinac/appkit";
import { createApiHandler } from "@mohasinac/appkit";
import { SUCCESS_MESSAGES } from "@mohasinac/appkit";

export const GET = withProviders(createApiHandler({
  auth: true,
  handler: async ({ user }) => {
    return successResponse({
      uid: user!.uid,
      email: user!.email,
      emailVerified: user!.emailVerified,
      displayName: user!.displayName,
      photoURL: user!.photoURL,
      phoneNumber: user!.phoneNumber,
      phoneVerified: user!.phoneVerified,
      storeId: user!.storeId,
      isTester: user!.isTester ?? false,
      canTestAdmin: user!.canTestAdmin ?? false,
      googleLinked: user!.googleLinked ?? false,
      googleLinkedEmail: user!.googleLinkedEmail ?? null,
      uiPreferences: user!.uiPreferences ?? {},
      slug: user!.slug ?? null,
      role: user!.role,
      disabled: user!.disabled,
      avatarMetadata: user!.avatarMetadata,
      publicProfile: user!.publicProfile,
      stats: user!.stats,
      metadata: user!.metadata
        ? {
            lastSignInTime:
              (user!.metadata as any).lastSignInTime instanceof Date
                ? (user!.metadata as any).lastSignInTime.toISOString()
                : ((user!.metadata as any).lastSignInTime as any)
                    ?.toDate?.()
                    ?.toISOString() ?? (user!.metadata as any).lastSignInTime,
            creationTime: (user!.metadata as any).creationTime,
            loginCount: (user!.metadata as any).loginCount,
          }
        : undefined,
      createdAt: user!.createdAt,
      updatedAt: user!.updatedAt,
      scamAwarenessAcknowledgedAt: user!.scamAwarenessAcknowledgedAt ?? null,
      dismissedBannerHash: user!.dismissedBannerHash ?? null,
    });
  },
}));

// --- Update Profile -----------------------------------------------------------

const updateProfileSchema = z.object({
  displayName: z.string().optional(),
  email: z.string().email().optional(),
  phoneNumber: z.string().optional(),
  // `mediaUrlSchema`, NOT `.url()`. The avatar flow ends at
  // `POST /api/media/finalize`, which mints the canonical relative form
  // `/media/<shortId>` — an absolute-URL check rejects the app's own output
  // and made every avatar save 400. `""` stays accepted: it is how the UI
  // clears a photo.
  photoURL: mediaUrlSchema.optional().or(z.literal("")),
  avatarMetadata: z
    .object({
      url: z.string(),
      position: z.object({
        x: z.number(),
        y: z.number(),
      }),
      zoom: z.number(),
    })
    .optional(),
  bio: z.string().max(500).optional(),
  profileIsPublic: z.boolean().optional(),
  acknowledgeScamAwareness: z.boolean().optional(),
  uiPreferences: z
    .object({
      collapsedSections: z.array(z.string()).optional(),
      /** scope -> ids that are OPEN. Bounded so a client cannot grow the user
       * document without limit: 200 scopes × 100 ids is far beyond any real
       * dashboard and still nowhere near Firestore's 1 MiB ceiling. */
      sectionState: z
        .record(z.string().max(120), z.array(z.string().max(120)).max(100))
        .refine((v) => Object.keys(v).length <= 200, {
          message: "sectionState may hold at most 200 scopes",
        })
        .optional(),
      dataViewMode: z.enum(["table", "grid", "list"]).optional(),
      handMode: z.enum(["left", "right"]).optional(),
    })
    .optional(),
});

export const PATCH = withProviders(createApiHandler<(typeof updateProfileSchema)["_output"]>({
  auth: true,
  schema: updateProfileSchema,
  handler: async ({ user, body }) => {
    const { bio, profileIsPublic, acknowledgeScamAwareness, uiPreferences, ...coreFields } = body!;

    // Update core fields (auto-resets verification flags when email/phone changes)
    const updatedUser = await userRepository.updateProfileWithVerificationReset(
      user!.uid,
      coreFields,
    );

    // Mark scam awareness acknowledged
    if (acknowledgeScamAwareness === true) {
      await userRepository.update(user!.uid, { scamAwarenessAcknowledgedAt: new Date() } as any);
    }

    // Persist bio + visibility into publicProfile sub-object when provided
    if (bio !== undefined || profileIsPublic !== undefined) {
      const existing = (updatedUser.publicProfile as Record<string, JsonValue>) ?? {};
      await userRepository.update(user!.uid, {
        publicProfile: {
          ...existing,
          ...(bio !== undefined ? { bio } : {}),
          ...(profileIsPublic !== undefined ? { isPublic: profileIsPublic } : {}),
        },
      } as any);
    }

    // uiPreferences is a single map field — Firestore's .update() replaces
    // the whole map on a nested-object write, so every sub-key must be
    // merged against the current value here (not just the key this request
    // is changing) or a dataViewMode write would silently wipe out
    // collapsedSections and vice versa.
    if (uiPreferences !== undefined && Object.keys(uiPreferences).length > 0) {
      const existing = (user!.uiPreferences as Record<string, JsonValue>) ?? {};
      // `sectionState` merges one level deeper than its siblings: a request
      // carries only the scopes it touched, so a plain overwrite would drop
      // every OTHER page's saved layout. The scalar keys overwrite as before.
      const existingSectionState =
        (existing.sectionState as Record<string, JsonValue> | undefined) ?? {};
      await userRepository.update(user!.uid, {
        uiPreferences: {
          ...existing,
          ...(uiPreferences.collapsedSections !== undefined
            ? { collapsedSections: uiPreferences.collapsedSections }
            : {}),
          ...(uiPreferences.sectionState !== undefined
            ? { sectionState: { ...existingSectionState, ...uiPreferences.sectionState } }
            : {}),
          ...(uiPreferences.dataViewMode !== undefined
            ? { dataViewMode: uiPreferences.dataViewMode }
            : {}),
          ...(uiPreferences.handMode !== undefined
            ? { handMode: uiPreferences.handMode }
            : {}),
        },
      } as any);
    }

    return successResponse(
      {
        user: updatedUser,
        verificationReset: {
          emailVerified: body!.email
            ? body!.email !== user!.email
              ? false
              : updatedUser.emailVerified
            : updatedUser.emailVerified,
          phoneVerified: body!.phoneNumber
            ? body!.phoneNumber !== user!.phoneNumber
              ? false
              : updatedUser.phoneVerified
            : updatedUser.phoneVerified,
        },
      },
      SUCCESS_MESSAGES.USER.PROFILE_UPDATED,
    );
  },
}));
