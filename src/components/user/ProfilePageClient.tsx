"use client";

import { useState } from "react";
import { normalizeError } from "@mohasinac/appkit/client";
import type { ImageCropData } from "@mohasinac/appkit/client";

import { Link } from "@/i18n/navigation";
import { HandModeToggleClient } from "./HandModeToggleClient";
import {
  useProfile,
  useUpdateProfile,
  useToast,
  useAuth,
  ROUTES,
  AvatarUpload,
  CollapsibleSection,
  Div,
  Button,
  Form,
  FieldInput,
  FieldTextarea,
  MediaImage,
  Toggle,
  updateProfileSchema,
  applyZodIssues,
  useCollapsedSections,
} from "@mohasinac/appkit/client";
import type { UseFormShellStateResult } from "@mohasinac/appkit/client";
import { Heading, Row, Stack, Text } from "@mohasinac/appkit/client";

const __O = {
  hidden: "overflow-hidden",
} as const;

interface ProfilePageClientProps {
  standalone?: boolean;
}

// ─── Sub-renderers ────────────────────────────────────────────────────────────

function renderProfileLoadingSkeleton() {
  return (
    <Stack className="w-full max-w-2xl animate-pulse" gap="md">
      <Div className="h-20 w-20" surface="subtle" rounded="full" />
      <Div className="h-6 w-1/2" surface="subtle" rounded="default" />
      <Div className="h-4 w-2/3" surface="subtle" rounded="default" />
    </Stack>
  );
}

function renderProfileViewMode({
  profile,
  resolvedName,
  namePlaceholder,
  avatarLetter,
  profileBio,
  profileIsPublic,
  handleEdit,
  userId,
}: {
  profile: { photoURL?: string | null; email?: string | null; phoneNumber?: string | null; displayName?: string | null };
  resolvedName: string;
  namePlaceholder: string;
  avatarLetter: string;
  profileBio: string;
  profileIsPublic: boolean;
  handleEdit: () => void;
  userId: string;
}) {
  return (
    <Stack surface="card" padding="lg" gap="5">
      <Row align="center" gap="md">
        {profile.photoURL ? (
          <Div className={`h-20 w-20 ${__O.hidden} relative ring-2 ring-zinc-100 ring-[var(--appkit-color-border)]`} rounded="full">
            <MediaImage src={profile.photoURL} alt="Avatar" size="thumbnail" />
          </Div>
        ) : (
          <Row textWeight="bold" textSize="3xl"
            className="h-20 w-20 ring-2 ring-zinc-100 ring-[var(--appkit-color-border)] bg-[var(--appkit-color-primary-50)] text-[var(--appkit-color-primary)]" align="center" justify="center" rounded="full"
          >
            {avatarLetter}
          </Row>
        )}
        <Stack gap="none" className="min-w-0">
          <Text className="truncate" color="primary" size="lg" weight="semibold">
            {resolvedName || <Text as="span" className="italic" color="faint">{namePlaceholder}</Text>}
          </Text>
          <Text className="truncate" color="muted" size="sm">{profile.email}</Text>
          {profile.phoneNumber && (
            <Text size="sm" color="muted">{profile.phoneNumber}</Text>
          )}
        </Stack>
      </Row>
      {profileBio && (
        <Text className="leading-relaxed" color="muted" size="sm">{profileBio}</Text>
      )}
      <Text size="xs" color="faint">
        Profile visibility:{" "}
        <Text as="span" className={profileIsPublic ? "text-success font-medium" : "text-[var(--appkit-color-text-muted)] font-medium"}>
          {profileIsPublic ? "Public" : "Private"}
        </Text>
      </Text>
      <Row wrap gap="3" padding="t-2xs">
        <Button rounded="xl"
          type="button"
          variant="outline"
          onClick={handleEdit}
          paddingX="md" paddingY="sm" textSize="sm" weight="medium"
        >
          Edit Profile
        </Button>
        <Link
          href={String(ROUTES.USER.ADDRESSES)}
          className="rounded-xl border border-[var(--appkit-color-border)] px-[var(--appkit-space-4)] py-[var(--appkit-space-2)] text-[length:var(--appkit-text-sm)] font-medium text-[var(--appkit-color-text-muted)] hover:bg-zinc-50 hover:bg-[var(--appkit-color-surface-elevated)] transition-colors"
        >
          Manage Addresses
        </Link>
        <Link
          href={String(ROUTES.PUBLIC.PROFILE(userId))}
          className="rounded-xl border border-[var(--appkit-color-border)] px-[var(--appkit-space-4)] py-[var(--appkit-space-2)] text-[length:var(--appkit-text-sm)] font-medium text-[var(--appkit-color-text-muted)] hover:bg-zinc-50 hover:bg-[var(--appkit-color-surface-elevated)] transition-colors"
        >
          View Public Profile
        </Link>
      </Row>
    </Stack>
  );
}

export function ProfilePageClient({ standalone = true }: ProfilePageClientProps) {
  const { user } = useAuth();
  const { showToast } = useToast();
  const { data: profile, isLoading } = useProfile({ enabled: !!user });
  const [editing, setEditing] = useState(false);
  const { isCollapsed, toggle } = useCollapsedSections({ sectionIds: ["user-profile:details"] });

  const [displayName, setDisplayName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [bio, setBio] = useState("");
  const [isPublic, setIsPublic] = useState(true);

  const update = useUpdateProfile({
    onSuccess: () => {
      showToast("Profile updated successfully!", "success");
      setEditing(false);
    },
    onError: (err) => {
      showToast(err.message ?? "Failed to update profile.", "error");
    },
  });

  const avatarUpdate = useUpdateProfile({
    onSuccess: () => showToast("Avatar updated", "success"),
    onError: (err) => showToast(err.message ?? "Failed to update avatar.", "error"),
  });

  const handleEdit = () => {
    const resolvedName = profile?.displayName || user?.displayName || "";
    setDisplayName(resolvedName);
    setPhoneNumber(profile?.phoneNumber ?? "");
    setBio((profile as any)?.publicProfile?.bio ?? "");
    setIsPublic((profile as any)?.publicProfile?.isPublic ?? true);
    setEditing(true);
  };

  const handleSaveProfile = async ({
    setFieldError,
    clearErrors,
    validate,
  }: Pick<UseFormShellStateResult, "setFieldError" | "clearErrors" | "validate">) => {
    clearErrors();
    const parsed = validate<{
      displayName?: string;
      phoneNumber?: string;
      bio?: string;
      profileIsPublic?: boolean;
    }>({ displayName, phoneNumber, bio, profileIsPublic: isPublic });
    if (!parsed) return;
    try {
      await update.mutateAsync({
        displayName: parsed.displayName?.trim() || undefined,
        phoneNumber: parsed.phoneNumber?.trim() || undefined,
        bio: parsed.bio?.trim() ?? "",
        profileIsPublic: parsed.profileIsPublic,
      });
    } catch (err) {
      void normalizeError(err);
      // Toast is already shown by useUpdateProfile's onError above — this
      // only adds inline field errors when the server returns Zod issues
      // (e.g. a field that passed client validation but failed a
      // server-only check). apiClient throws ApiClientError, which — like
      // ApiError — carries `.issues` when the failure was a validation
      // error, so this check doesn't need isApiError.
      const issues = (err as { issues?: { path?: (string | number)[]; message: string }[] })?.issues;
      if (issues?.length) {
        applyZodIssues(
          issues.map((i) => ({ path: i.path ?? [], message: i.message })),
          setFieldError,
        );
      }
    }
  };

  const handleAvatarUploadSuccess = async (photoURL: string, cropData: ImageCropData) => {
    // photoURL is explicitly "" when the user removes their avatar — send it
    // as-is (never coerce to undefined) so the server's z.literal("") clear
    // path actually fires instead of the field being dropped from the body.
    await avatarUpdate.mutateAsync({
      photoURL,
      avatarMetadata: {
        url: cropData.url,
        position: cropData.position,
        zoom: cropData.zoom,
      },
    });
  };

  if (isLoading) return renderProfileLoadingSkeleton();

  if (!profile) {
    return (
      <Text size="sm" color="muted">Please log in to view your profile.</Text>
    );
  }

  const resolvedName =
    profile.displayName || user?.displayName || profile.email?.split("@")[0] || "";
  const namePlaceholder = "Add your name";
  const avatarLetter = (resolvedName || profile.email || "?")[0].toUpperCase();
  const profileBio = (profile as any)?.publicProfile?.bio ?? "";
  const profileIsPublic = (profile as any)?.publicProfile?.isPublic ?? true;
  const avatarMetadata = (profile as any)?.avatarMetadata ?? null;

  return (
    <Stack className="w-full" gap="lg">
      {standalone && (
        <Heading level={1} size="2xl" weight="bold" color="primary">My Profile</Heading>
      )}
      <CollapsibleSection
        title="Profile Details"
        isCollapsed={isCollapsed("user-profile:details")}
        onToggle={() => toggle("user-profile:details")}
      >
      {!editing ? (
        renderProfileViewMode({ profile, resolvedName, namePlaceholder, avatarLetter, profileBio, profileIsPublic, handleEdit, userId: user!.uid })
      ) : (
        <Stack gap="lg">
          <Div surface="card" padding="lg">
            <AvatarUpload
              currentPhotoURL={profile.photoURL}
              currentCropData={avatarMetadata}
              userId={user!.uid}
              displayName={resolvedName}
              onUploadSuccess={handleAvatarUploadSuccess}
            />
          </Div>
          <Div surface="card" padding="lg">
            <Form
              schema={updateProfileSchema}
              spacing="md"
              onSubmit={async (e) => e.preventDefault()}
            >
              {({ setFieldError, clearErrors, validate }) => (
                <>
                  <Heading level={2} size="base" weight="semibold" color="primary">Edit Profile</Heading>
                  <FieldInput
                    name="displayName"
                    label="Display Name"
                    value={displayName}
                    onChange={setDisplayName}
                    placeholder="Your full name"
                  />
                  <FieldInput
                    name="phoneNumber"
                    label="Phone Number"
                    type="tel"
                    value={phoneNumber}
                    onChange={setPhoneNumber}
                    placeholder="+91 xxxxx xxxxx"
                  />
                  <FieldTextarea
                    name="bio"
                    label="Bio"
                    hint="max 500 chars"
                    value={bio}
                    onChange={setBio}
                    maxLength={500}
                    rows={3}
                    showCharCount
                    placeholder="Tell buyers a little about yourself…"
                  />
                  <Row padding="inline" align="center" justify="between" rounded="lg" border="default">
                    <>
                      <Text size="sm" weight="medium" color="primary">Public profile</Text>
                      <Text className="mt-0.5" color="muted" size="xs">
                        When on, your profile is visible to other LetItRip users
                      </Text>
                    </>
                    <Toggle
                      checked={isPublic}
                      onChange={(v) => setIsPublic(v)}
                      size="md"
                      aria-label="Public profile"
                    />
                  </Row>
                  <Row gap="3" padding="t-2xs">
                    <Button rounded="xl"
                      type="button"
                      variant="outline"
                      onClick={() => setEditing(false)}
                      disabled={update.isPending}
                      paddingX="md" paddingY="sm" textSize="sm" weight="medium"
                      className="disabled:opacity-60 transition-colors"
                    >
                      Cancel
                    </Button>
                    <Button rounded="xl"
                      type="button"
                      variant="primary"
                      disabled={update.isPending}
                      paddingX="md" paddingY="sm" textSize="sm" weight="semibold"
                      className="disabled:opacity-60 transition-colors"
                      onClick={() => void handleSaveProfile({ setFieldError, clearErrors, validate })}
                    >
                      {update.isPending ? "Saving…" : "Save Changes"}
                    </Button>
                  </Row>
                </>
              )}
            </Form>
          </Div>
        </Stack>
      )}
      </CollapsibleSection>
      <HandModeToggleClient />
    </Stack>
  );
}
