"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useProfile, useUpdateProfile, useToast, useAuth, ROUTES } from "@mohasinac/appkit/client";

interface ProfilePageClientProps {
  standalone?: boolean;
}

export function ProfilePageClient({ standalone = true }: ProfilePageClientProps) {
  const router = useRouter();
  const { user } = useAuth();
  const { showToast } = useToast();
  const { data: profile, isLoading } = useProfile({ enabled: !!user });
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
    } as any);
  };

  if (isLoading) {
    return (
      <div className="w-full max-w-2xl space-y-4 animate-pulse">
        <div className="h-20 w-20 rounded-full bg-zinc-200 dark:bg-slate-700" />
        <div className="h-6 bg-zinc-200 dark:bg-slate-700 rounded w-1/2" />
        <div className="h-4 bg-zinc-200 dark:bg-slate-700 rounded w-2/3" />
      </div>
    );
  }

  if (!profile) {
    return (
      <p className="text-sm text-zinc-500 dark:text-zinc-400">Please log in to view your profile.</p>
    );
  }

  const resolvedName =
    profile.displayName || user?.displayName || profile.email?.split("@")[0] || "";
  const namePlaceholder = "Add your name";
  const avatarLetter = (resolvedName || profile.email || "?")[0].toUpperCase();
  const profileBio = (profile as any)?.publicProfile?.bio ?? "";
  const profileIsPublic = (profile as any)?.publicProfile?.isPublic ?? true;

  return (
    <div className="w-full space-y-6">
      {standalone && (
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">My Profile</h1>
      )}

      {!editing ? (
        <div className="rounded-xl border border-zinc-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6 space-y-5">
          {/* Avatar + name row */}
          <div className="flex items-center gap-4">
            {profile.photoURL ? (
              <img
                src={profile.photoURL}
                alt="Avatar"
                className="h-20 w-20 rounded-full object-cover ring-2 ring-zinc-100 dark:ring-slate-700"
              />
            ) : (
              <div
                className="h-20 w-20 rounded-full flex items-center justify-center text-3xl font-bold ring-2 ring-zinc-100 dark:ring-slate-700"
                style={{ background: "var(--appkit-color-primary-50)", color: "var(--appkit-color-primary)" }}
              >
                {avatarLetter}
              </div>
            )}
            <div className="space-y-0.5 min-w-0">
              <p className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                {resolvedName || <span className="text-zinc-400 dark:text-zinc-500 italic">{namePlaceholder}</span>}
              </p>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 truncate">{profile.email}</p>
              {profile.phoneNumber && (
                <p className="text-sm text-zinc-500 dark:text-zinc-400">{profile.phoneNumber}</p>
              )}
            </div>
          </div>

          {/* Bio */}
          {profileBio && (
            <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">{profileBio}</p>
          )}

          {/* Visibility badge */}
          <p className="text-xs text-zinc-400 dark:text-zinc-500">
            Profile visibility:{" "}
            <span className={profileIsPublic ? "text-green-600 dark:text-green-400 font-medium" : "text-zinc-500 font-medium"}>
              {profileIsPublic ? "Public" : "Private"}
            </span>
          </p>

          <div className="flex flex-wrap gap-3 pt-1">
            <button
              type="button"
              onClick={handleEdit}
              className="rounded-xl border border-zinc-300 dark:border-slate-600 px-4 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-slate-800 transition-colors"
            >
              Edit Profile
            </button>
            <button
              type="button"
              onClick={() => router.push(String(ROUTES.USER.ADDRESSES))}
              className="rounded-xl border border-zinc-300 dark:border-slate-600 px-4 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-slate-800 transition-colors"
            >
              Manage Addresses
            </button>
          </div>
        </div>
      ) : (
        <form
          onSubmit={handleSave}
          className="rounded-xl border border-zinc-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6 space-y-5"
        >
          <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">Edit Profile</h2>

          {/* Display Name */}
          <div className="space-y-1">
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Display Name
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Your full name"
              className="w-full rounded-lg border border-zinc-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Phone */}
          <div className="space-y-1">
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Phone Number
            </label>
            <input
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="+91 xxxxx xxxxx"
              className="w-full rounded-lg border border-zinc-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Avatar URL */}
          <div className="space-y-1">
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Avatar URL
            </label>
            <input
              type="url"
              value={photoURL}
              onChange={(e) => setPhotoURL(e.target.value)}
              placeholder="https://…"
              className="w-full rounded-lg border border-zinc-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Bio */}
          <div className="space-y-1">
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Bio <span className="text-zinc-400 font-normal">(max 500 chars)</span>
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              maxLength={500}
              rows={3}
              placeholder="Tell buyers a little about yourself…"
              className="w-full rounded-lg border border-zinc-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-primary resize-none"
            />
            <p className="text-right text-xs text-zinc-400">{bio.length}/500</p>
          </div>

          {/* Public profile toggle */}
          <div className="flex items-center justify-between rounded-lg border border-zinc-200 dark:border-slate-700 px-4 py-3">
            <div>
              <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200">Public profile</p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                When on, your profile is visible to other LetItRip users
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={isPublic}
              onClick={() => setIsPublic((v) => !v)}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus:outline-none focus:ring-2 focus:ring-primary ${
                isPublic ? "bg-primary" : "bg-zinc-200 dark:bg-slate-600"
              }`}
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
                  isPublic ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={() => setEditing(false)}
              disabled={update.isPending}
              className="rounded-xl border border-zinc-300 dark:border-slate-600 px-4 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-slate-800 disabled:opacity-60 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={update.isPending}
              className="rounded-xl px-4 py-2 text-sm font-semibold text-white disabled:opacity-60 transition-colors"
              style={{ background: "var(--appkit-color-primary)" }}
            >
              {update.isPending ? "Saving…" : "Save Changes"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
