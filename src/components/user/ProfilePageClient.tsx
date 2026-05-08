"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useProfile, useUpdateProfile, useToast, useAuth, ROUTES } from "@mohasinac/appkit/client";

interface ProfilePageClientProps {
  /** When false, suppresses the page-level h1 (use when embedded inside another view). */
  standalone?: boolean;
}

export function ProfilePageClient({ standalone = true }: ProfilePageClientProps) {
  const router = useRouter();
  const { user } = useAuth();
  const { showToast } = useToast();
  const { data: profile, isLoading } = useProfile({ enabled: !!user });
  const [editing, setEditing] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");

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
    setDisplayName(resolvedName !== namePlaceholder ? resolvedName : "");
    setPhoneNumber(profile?.phoneNumber ?? "");
    setEditing(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await update.mutateAsync({
      displayName: displayName.trim() || undefined,
      phoneNumber: phoneNumber.trim() || undefined,
    });
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

  // Fallback chain: Firestore displayName → Firebase Auth displayName → email prefix
  const resolvedName =
    profile.displayName ||
    user?.displayName ||
    profile.email?.split("@")[0] ||
    "";
  const namePlaceholder = "Add your name";
  const avatarLetter = (resolvedName || profile.email || "?")[0].toUpperCase();

  return (
    <div className="w-full space-y-6">
      {standalone && (
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">My Profile</h1>
      )}

      {!editing ? (
        <div className="rounded-xl border border-zinc-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6 space-y-5">
          <div className="flex items-center gap-4">
            {profile.photoURL ? (
              <img
                src={profile.photoURL}
                alt="Avatar"
                className="h-20 w-20 rounded-full object-cover ring-2 ring-zinc-100 dark:ring-slate-700"
              />
            ) : (
              <div className="h-20 w-20 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center text-3xl font-bold text-primary dark:text-primary-400 ring-2 ring-zinc-100 dark:ring-slate-700">
                {avatarLetter}
              </div>
            )}
            <div className="space-y-0.5 min-w-0">
              <p className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                {resolvedName || (
                  <span className="text-zinc-400 dark:text-zinc-500 italic">{namePlaceholder}</span>
                )}
              </p>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 truncate">{profile.email}</p>
              {profile.phoneNumber && (
                <p className="text-sm text-zinc-500 dark:text-zinc-400">{profile.phoneNumber}</p>
              )}
            </div>
          </div>
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
              className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-600 disabled:opacity-60 transition-colors"
            >
              {update.isPending ? "Saving…" : "Save Changes"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
