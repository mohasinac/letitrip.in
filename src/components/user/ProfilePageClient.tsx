"use client";

import { useState } from "react";

import { Link } from "@/i18n/navigation";
import { useProfile, useUpdateProfile, useToast, useAuth, ROUTES, ImageUpload, useMediaUpload, Div, Button, Form, Label, Input, Textarea, MediaImage, Toggle } from "@mohasinac/appkit/client";
import { Heading, Row, Text } from "@mohasinac/appkit";
const __O = {
  hidden: "overflow-hidden",
} as const;

const LABEL_CLS = "block text-sm font-medium text-zinc-700 dark:text-zinc-300";

interface ProfilePageClientProps {
  standalone?: boolean;
}

// ─── Sub-renderers ────────────────────────────────────────────────────────────

function renderProfileLoadingSkeleton() {
  return (
    <Div className="w-full max-w-2xl space-y-4 animate-pulse">
      <Div className="h-20 w-20 bg-zinc-200 dark:bg-slate-700" rounded="full" />
      <Div className="h-6 bg-zinc-200 dark:bg-slate-700 w-1/2" rounded="default" />
      <Div className="h-4 bg-zinc-200 dark:bg-slate-700 w-2/3" rounded="default" />
    </Div>
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
}: {
  profile: { photoURL?: string | null; email?: string | null; phoneNumber?: string | null; displayName?: string | null };
  resolvedName: string;
  namePlaceholder: string;
  avatarLetter: string;
  profileBio: string;
  profileIsPublic: boolean;
  handleEdit: () => void;
}) {
  return (
    <Div surface="card" padding="lg" className="space-y-5">
      <Row align="center" gap="md">
        {profile.photoURL ? (
          <Div className={`h-20 w-20 rounded-full ${__O.hidden} relative ring-2 ring-zinc-100 dark:ring-slate-700`}>
            <MediaImage src={profile.photoURL} alt="Avatar" size="thumbnail" />
          </Div>
        ) : (
          <Row
            className="h-20 w-20 text-3xl font-bold ring-2 ring-zinc-100 dark:ring-slate-700" align="center" justify="center" rounded="full"
            // audit-inline-style-ok: dynamic CSS
            style={{ background: "var(--appkit-color-primary-50)", color: "var(--appkit-color-primary)" }} /* eslint-disable-line lir/no-inline-static-style */
          >
            {avatarLetter}
          </Row>
        )}
        <Div className="space-y-0.5 min-w-0">
          <Text className="truncate" color="primary" size="lg" weight="semibold">
            {resolvedName || <Text as="span" className="text-zinc-400 dark:text-zinc-400 italic">{namePlaceholder}</Text>}
          </Text>
          <Text className="truncate" color="muted" size="sm">{profile.email}</Text>
          {profile.phoneNumber && (
            <Text size="sm" color="muted">{profile.phoneNumber}</Text>
          )}
        </Div>
      </Row>
      {profileBio && (
        <Text className="leading-relaxed" color="muted" size="sm">{profileBio}</Text>
      )}
      <Text className="text-zinc-400 dark:text-zinc-400" size="xs">
        Profile visibility:{" "}
        <Text as="span" className={profileIsPublic ? "text-success font-medium" : "text-zinc-500 dark:text-zinc-400 font-medium"}>
          {profileIsPublic ? "Public" : "Private"}
        </Text>
      </Text>
      <Div className="flex flex-wrap gap-3 pt-1">
        <Button
          type="button"
          variant="outline"
          onClick={handleEdit}
          className="rounded-xl px-4 py-2 text-sm font-medium"
        >
          Edit Profile
        </Button>
        <Link
          href={String(ROUTES.USER.ADDRESSES)}
          className="rounded-xl border border-zinc-300 dark:border-slate-600 px-4 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-slate-800 transition-colors"
        >
          Manage Addresses
        </Link>
      </Div>
    </Div>
  );
}

function renderProfileEditForm({
  displayName, setDisplayName,
  phoneNumber, setPhoneNumber,
  photoURL, setPhotoURL,
  bio, setBio,
  isPublic, setIsPublic,
  isPending,
  handleSave,
  onCancel,
  upload,
  user,
}: {
  displayName: string; setDisplayName: (v: string) => void;
  phoneNumber: string; setPhoneNumber: (v: string) => void;
  photoURL: string; setPhotoURL: (v: string) => void;
  bio: string; setBio: (v: string) => void;
  isPublic: boolean; setIsPublic: React.Dispatch<React.SetStateAction<boolean>>;
  isPending: boolean;
  handleSave: (e: React.FormEvent) => Promise<void>;
  onCancel: () => void;
  upload: (file: File, folder?: string, isPublic?: boolean, context?: Record<string, unknown>) => Promise<string>;
  user: { displayName?: string | null; email?: string | null } | null | undefined;
}) {
  return (
    <Div surface="card" padding="lg">
    <Form
      onSubmit={handleSave}
      className="space-y-5"
    >
      <Heading level={2} size="base" weight="semibold" color="primary">Edit Profile</Heading>
      <Div className="space-y-1">
        <Label className={LABEL_CLS}>Display Name</Label>
        <Input
          type="text"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          placeholder="Your full name"
          className="w-full rounded-lg border border-zinc-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </Div>
      <Div className="space-y-1">
        <Label className={LABEL_CLS}>Phone Number</Label>
        <Input
          type="tel"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          placeholder="+91 xxxxx xxxxx"
          className="w-full rounded-lg border border-zinc-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </Div>
      <ImageUpload
        label="Profile Photo"
        currentImage={photoURL}
        captureSource="both"
        enableCrop
        onUpload={(file) => {
          const parts = (user?.displayName ?? user?.email ?? "user").split(" ");
          return upload(file, "avatars", true, {
            type: "user-avatar",
            firstName: parts[0] ?? "user",
            lastName: parts[1] ?? "",
          });
        }}
        onChange={(url) => setPhotoURL(url)}
      />
      <Div className="space-y-1">
        <Label className={LABEL_CLS}>
          Bio <Text as="span" weight="normal" color="faint">(max 500 chars)</Text>
        </Label>
        <Textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          maxLength={500}
          rows={3}
          placeholder="Tell buyers a little about yourself…"
          className="w-full rounded-lg border border-zinc-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-primary resize-none"
        />
        <Text className="text-zinc-400 dark:text-zinc-400" size="xs" align="end">{bio.length}/500</Text>
      </Div>
      <Row className="px-4" padding="y-sm" align="center" justify="between" rounded="lg" border="default">
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
      <Div className="flex gap-3 pt-1">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isPending}
          className="rounded-xl px-4 py-2 text-sm font-medium disabled:opacity-60 transition-colors"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="primary"
          disabled={isPending}
          className="rounded-xl px-4 py-2 text-sm font-semibold disabled:opacity-60 transition-colors"
        >
          {isPending ? "Saving…" : "Save Changes"}
        </Button>
      </Div>
    </Form>
    </Div>
  );
}

export function ProfilePageClient({ standalone = true }: ProfilePageClientProps) {
  const { user } = useAuth();
  const { showToast } = useToast();
  const { data: profile, isLoading } = useProfile({ enabled: !!user });
  const { upload } = useMediaUpload();
  const [editing, setEditing] = useState(false);

  const [displayName, setDisplayName]   = useState("");
  const [phoneNumber, setPhoneNumber]   = useState("");
  const [photoURL, setPhotoURL]         = useState("");
  const [bio, setBio]                   = useState("");
  const [isPublic, setIsPublic]         = useState(true);

  const update = useUpdateProfile({
    onSuccess: () => {
      showToast("Profile updated successfully!", "success");
      setEditing(false);
    },
    onError: (err) => {
      showToast(err.message ?? "Failed to update profile.", "error");
    },
  });

  const handleEdit = () => {
    const resolvedName = profile?.displayName || user?.displayName || "";
    setDisplayName(resolvedName);
    setPhoneNumber(profile?.phoneNumber ?? "");
    setPhotoURL(profile?.photoURL ?? "");
    setBio((profile as any)?.publicProfile?.bio ?? "");
    setIsPublic((profile as any)?.publicProfile?.isPublic ?? true);
    setEditing(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await update.mutateAsync({
      displayName: displayName.trim() || undefined,
      phoneNumber: phoneNumber.trim() || undefined,
      photoURL: photoURL.trim() || undefined,
      bio: bio.trim(),
      profileIsPublic: isPublic,
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

  return (
    <Div className="w-full space-y-6">
      {standalone && (
        <Heading level={1} size="2xl" weight="bold" color="primary">My Profile</Heading>
      )}
      {!editing
        ? renderProfileViewMode({ profile, resolvedName, namePlaceholder, avatarLetter, profileBio, profileIsPublic, handleEdit })
        : renderProfileEditForm({ displayName, setDisplayName, phoneNumber, setPhoneNumber, photoURL, setPhotoURL, bio, setBio, isPublic, setIsPublic, isPending: update.isPending, handleSave, onCancel: () => setEditing(false), upload, user })}
    </Div>
  );
}
