"use client";

import { Suspense } from "react";

/**
 * Shareable URL for the user drawer `AdminUsersView` opens inline.
 *
 * ## Why this page FETCHES instead of taking props
 *
 * `AdminUserEditorView` has no id-based loader — it takes eighteen `current*`
 * props, and in the list those come from the cached row. That is precisely the
 * shape of Root Cause #38: a list serialiser is a narrower projection than the
 * document, so any field it omits arrives as `undefined`, and the editor's
 * save handler then writes that back as the field's default. It is how real
 * testers had their `isTester` flag stripped by editing an unrelated field.
 *
 * So this page reads the SINGLE-ITEM endpoint, which returns the unstripped
 * document, and passes those values. Same drawer, better data — and it is the
 * direction the plan's data-integrity protocol asks for ("editors seed from
 * the single-item GET, never from a list row").
 */
import {
  AdminUserEditorView,
  ROUTES,
  apiClient,
  ADMIN_ENDPOINTS,
  PageLoader,
  type JsonValue,
} from "@mohasinac/appkit/client";
import { useRouter } from "@/i18n/navigation";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";



type UserDoc = Record<string, JsonValue>;

const str = (v: JsonValue | undefined) => (typeof v === "string" ? v : undefined);
const bool = (v: JsonValue | undefined) => (typeof v === "boolean" ? v : undefined);

function PageInner() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const uid = params?.id ?? "";
  const back = () => router.push(String(ROUTES.ADMIN.USERS));

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "user", uid],
    queryFn: async () => {
      const res = await apiClient.get(ADMIN_ENDPOINTS.USER_BY_ID(uid));
      const payload = res as { data?: UserDoc } | UserDoc;
      return ((payload as { data?: UserDoc }).data ?? payload) as UserDoc;
    },
    enabled: Boolean(uid),
  });

  if (isLoading || !data) return <PageLoader />;

  const social = (data.socialLinks ?? {}) as Record<string, JsonValue>;

  return (
    <AdminUserEditorView
      open
      onClose={back}
      userId={uid}
      displayName={str(data.displayName)}
      photoURL={str(data.photoURL)}
      currentRole={str(data.role)}
      currentEmailVerified={bool(data.emailVerified)}
      currentIsTester={bool(data.isTester)}
      currentCanTestAdmin={bool(data.canTestAdmin)}
      currentPhoneNumber={str(data.phoneNumber)}
      currentBio={str(data.bio)}
      currentLocation={str(data.location)}
      currentWebsite={str(data.website)}
      currentSocialLinks={{
        twitter: str(social.twitter),
        instagram: str(social.instagram),
        facebook: str(social.facebook),
        linkedin: str(social.linkedin),
      }}
      currentIsHardBanned={bool(data.isHardBanned)}
      currentHardBanReason={str(data.hardBanReason)}
    />
  );
}

/*
 * Page-level Suspense. `export const dynamic` is a SERVER route-segment
 * config and has NO effect in a "use client" file, so it cannot make this
 * page dynamic — the client tree below reaches useSearchParams(), which
 * throws during prerender without a boundary (Root Cause #17). This boundary
 * is the fix. (This comment used to add that the dashboard layout's own
 * <Suspense> was "empirically not enough" — that was wrong; the layout's
 * boundary was being defeated by a swallowed prerender bailout, not ignored.
 * See Root Cause #89. A segment config is never the answer here, and
 * `audit-no-force-dynamic` blocks it.)
 */
export default function Page() {
  return (
    <Suspense>
      <PageInner />
    </Suspense>
  );
}
