"use client";

import { useState } from "react";

import { Link } from "@/i18n/navigation";
import { useProfile, useUpdateProfile, useToast, useAuth, ROUTES, ImageUpload, useMediaUpload, Div, Button, Label, Input, Textarea, MediaImage } from "@mohasinac/appkit/client";
import { Heading, Text } from "@mohasinac/appkit";

const LABEL_CLS = "block text-sm font-medium text-zinc-700 dark:text-zinc-300";

interface ProfilePageClientProps {
  standalone?: boolean;
}

// ─── Sub-renderers ────────────────────────────────────────────────────────────

function renderProfileLoadingSkeleton() {
  return (
    <Div className="w-full max-w-2xl space-y-4 animate-pulse">
      <Div className="h-20 w-20 rounded-full bg-zinc-200 dark:bg-slate-700" />
      <Div className="h-6 bg-zinc-200 dark:bg-slate-700 rounded w-1/2" />
      <Div className="h-4 bg-zinc-200 dark:bg-slate-700 rounded w-2/3" />
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
    <Div className="rounded-xl border border-zinc-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6 space-y-5">
      <Div className="flex items-center gap-4">
        {profile.photoURL ? (
          <Div className="h-20 w-20 rounded-full overflow-hidden relative ring-2 ring-zinc-100 dark:ring-slate-700">
            <MediaImage src={profile.photoURL} alt="Avatar" size="thumbnail" />
          </Div>
        ) : (
          <Div
            className="h-20 w-20 rounded-full flex items-center justify-center text-3xl font-bold ring-2 ring-zinc-100 dark:ring-slate-700"
            style={{ background: "var(--appkit-color-primary-50)", color: "var(--appkit-color-primary)" }}
          >
            {avatarLetter}
          </Div>
        )}
        <Div className="space-y-0.5 min-w-0">
          <Text className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 truncate">
            {resolvedName || <Text as="span" className="text-zinc-400 dark:text-zinc-500 italic">{namePlaceholder}</Text>}
          </Text>
          <Text className="text-sm text-zinc-500 dark:text-zinc-400 truncate">{profile.email}</Text>
          {profile.phoneNumber && (
            <Text className="text-sm text-zinc-500 dark:text-zinc-400">{profile.phoneNumber}</Text>
          )}
        </Div>
      </Div>
      {profileBio && (
        <Text className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">{profileBio}</Text>
      )}
      <Text className="text-xs text-zinc-400 dark:text-zinc-500">
        Profile visibility:{" "}
        <Text as="span" className={profileIsPublic ? "text-green-600 dark:text-green-400 font-medium" : "text-zinc-500 font-medium"}>
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
    <form
      onSubmit={handleSave}
      className="rounded-xl border border-zinc-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6 space-y-5"
    >
      <Heading level={2} className="text-base font-semibold text-zinc-900 dark:text-zinc-100">Edit Profile</Heading>
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
          Bio <Text as="span" className="text-zinc-400 font-normal">(max 500 chars)</Text>
        </Label>
        <Textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          maxLength={500}
          rows={3}
          placeholder="Tell buyers a little about yourself…"
          className="w-full rounded-lg border border-zinc-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-primary resize-none"
        />
        <Text className="text-right text-xs text-zinc-400">{bio.length}/500</Text>
      </Div>
      <Div className="flex items-center justify-between rounded-lg border border-zinc-200 dark:border-slate-700 px-4 py-3">
        <>
          <Text className="text-sm font-medium text-zinc-800 dark:text-zinc-200">Public profile</Text>
          <Text className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            When on, your profile is visible to other LetItRip users
          </Text>
        </>
        <Button
          type="button"
          role="switch"
          aria-checked={isPublic}
          onClick={() => setIsPublic((v) => !v)}
          className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus:outline-none focus:ring-2 focus:ring-primary ${
            isPublic ? "bg-primary" : "bg-zinc-200 dark:bg-slate-600"
          }`}
        >
          <span
            aria-hidden="true"
            className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
              isPublic ? "translate-x-5" : "translate-x-0"
            }`}
          />
        </Button>
      </Div>
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
    </form>
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
      <Text className="text-sm text-zinc-500 dark:text-zinc-400">Please log in to view your profile.</Text>
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
        <Heading level={1} className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">My Profile</Heading>
      )}
      {!editing
        ? renderProfileViewMode({ profile, resolvedName, namePlaceholder, avatarLetter, profileBio, profileIsPublic, handleEdit })
        : renderProfileEditForm({ displayName, setDisplayName, phoneNumber, setPhoneNumber, photoURL, setPhotoURL, bio, setBio, isPublic, setIsPublic, isPending: update.isPending, handleSave, onCancel: () => setEditing(false), upload, user })}
    </Div>
  );
}
