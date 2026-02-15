"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Card, Badge, Alert, Text, AvatarDisplay } from "@/components";
import {
  THEME_CONSTANTS,
  UI_LABELS,
  ERROR_MESSAGES,
  API_ENDPOINTS,
} from "@/constants";
import { formatMonthYear } from "@/utils";
import { logger } from "@/classes";
import type { UserDocument } from "@/db/schema";
import type { ImageCropData } from "@/components";
import Link from "next/link";

export default function PublicProfilePage() {
  const params = useParams();
  const userId = params?.userId as string;
  const [user, setUser] = useState<UserDocument | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;

    const fetchPublicProfile = async () => {
      try {
        setLoading(true);
        const response = await fetch(API_ENDPOINTS.PROFILE.GET_BY_ID(userId));

        if (!response.ok) {
          if (response.status === 404) {
            setError(ERROR_MESSAGES.USER.NOT_FOUND);
          } else if (response.status === 403) {
            setError(ERROR_MESSAGES.GENERIC.PROFILE_PRIVATE);
          } else {
            setError(ERROR_MESSAGES.GENERIC.INTERNAL_ERROR);
          }
          return;
        }

        const data = await response.json();
        setUser(data.user);
      } catch (err) {
        setError(ERROR_MESSAGES.GENERIC.INTERNAL_ERROR);
        logger.error("Error fetching profile:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPublicProfile();
  }, [userId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <Text>{UI_LABELS.LOADING.DEFAULT}</Text>
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <Alert variant="error">
            {error || ERROR_MESSAGES.USER.NOT_FOUND}
          </Alert>
          <div className="mt-4">
            <Link href="/" className="text-primary-600 hover:underline">
              {UI_LABELS.ACTIONS.GO_HOME}
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  const profileName = user.displayName || user.email?.split("@")[0] || "User";
  const memberSince = formatMonthYear(user.createdAt);

  const avatarCropData: ImageCropData | null =
    user.avatarMetadata ||
    (user.photoURL
      ? {
          url: user.photoURL,
          position: { x: 50, y: 50 },
          zoom: 1,
        }
      : null);

  return (
    <div className={`min-h-screen ${THEME_CONSTANTS.themed.bgSecondary}`}>
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-800 h-48" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-24">
        {/* Profile Card */}
        <Card className="mb-6">
          <div className="text-center">
            {/* Avatar */}
            <div className="inline-block mb-4">
              <AvatarDisplay
                cropData={avatarCropData}
                size="2xl"
                className={`border-4 ${THEME_CONSTANTS.themed.border} shadow-lg`}
              />
            </div>

            {/* Name and Role */}
            <h1 className="text-3xl font-bold mb-2">{profileName}</h1>
            <Badge
              variant={
                user.role === "admin"
                  ? "primary"
                  : user.role === "seller"
                    ? "success"
                    : "secondary"
              }
            >
              {
                UI_LABELS.ROLES[
                  user.role.toUpperCase() as keyof typeof UI_LABELS.ROLES
                ]
              }
            </Badge>

            {/* Bio */}
            {user.publicProfile?.bio && (
              <Text
                variant="secondary"
                className={`mt-4 ${THEME_CONSTANTS.container["2xl"]} mx-auto`}
              >
                {user.publicProfile.bio}
              </Text>
            )}

            {/* Location & Website */}
            <div className="flex items-center justify-center gap-4 mt-4 text-sm">
              {user.publicProfile?.location && (
                <div className="flex items-center gap-1">
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>{user.publicProfile.location}</span>
                </div>
              )}
              {user.publicProfile?.website && (
                <a
                  href={user.publicProfile.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-primary-600 hover:underline"
                >
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                    <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
                  </svg>
                  <span>Website</span>
                </a>
              )}
            </div>

            {/* Social Links */}
            {user.publicProfile?.socialLinks && (
              <div className="flex items-center justify-center gap-3 mt-4">
                {user.publicProfile.socialLinks.twitter && (
                  <a
                    href={`https://twitter.com/${user.publicProfile.socialLinks.twitter}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`p-2 rounded-lg ${THEME_CONSTANTS.themed.hover}`}
                  >
                    <svg
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z" />
                    </svg>
                  </a>
                )}
                {user.publicProfile.socialLinks.instagram && (
                  <a
                    href={`https://instagram.com/${user.publicProfile.socialLinks.instagram}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`p-2 rounded-lg ${THEME_CONSTANTS.themed.hover}`}
                  >
                    <svg
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                    </svg>
                  </a>
                )}
                {user.publicProfile.socialLinks.linkedin && (
                  <a
                    href={`https://linkedin.com/in/${user.publicProfile.socialLinks.linkedin}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`p-2 rounded-lg ${THEME_CONSTANTS.themed.hover}`}
                  >
                    <svg
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                    </svg>
                  </a>
                )}
              </div>
            )}

            {/* Contact Info */}
            <div className={`${THEME_CONSTANTS.spacing.stack} mt-6`}>
              {user.publicProfile?.showEmail && user.email && (
                <div className="flex items-center justify-center gap-2 text-sm">
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                  </svg>
                  <span>{user.email}</span>
                </div>
              )}
              {user.publicProfile?.showPhone && user.phoneNumber && (
                <div className="flex items-center justify-center gap-2 text-sm">
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                  </svg>
                  <span>{user.phoneNumber}</span>
                </div>
              )}
            </div>

            {/* Member Since */}
            <Text variant="secondary" className="text-xs mt-4">
              Member since {memberSince}
            </Text>
          </div>
        </Card>

        {/* Stats Grid */}
        {user.publicProfile?.showOrders && user.stats && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            <Card>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary-600">
                  {user.stats.totalOrders}
                </div>
                <Text variant="secondary" className="text-sm mt-1">
                  Orders
                </Text>
              </div>
            </Card>
            <Card>
              <div className="text-center">
                <div className="text-2xl font-bold text-success-600">
                  {user.stats.auctionsWon}
                </div>
                <Text variant="secondary" className="text-sm mt-1">
                  Auctions Won
                </Text>
              </div>
            </Card>
            <Card>
              <div className="text-center">
                <div className="text-2xl font-bold text-warning-600">
                  {user.stats.itemsSold}
                </div>
                <Text variant="secondary" className="text-sm mt-1">
                  Items Sold
                </Text>
              </div>
            </Card>
            <Card>
              <div className="text-center">
                <div className="text-2xl font-bold text-info-600">
                  {user.stats.reviewsCount}
                </div>
                <Text variant="secondary" className="text-sm mt-1">
                  Reviews
                </Text>
              </div>
            </Card>
          </div>
        )}

        {/* Rating */}
        {user.stats?.rating && (
          <Card className="mb-6">
            <div className="flex items-center justify-center gap-2">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <svg
                    key={i}
                    className={`w-5 h-5 ${i < Math.floor(user.stats?.rating || 0) ? "text-yellow-400" : THEME_CONSTANTS.themed.textMuted}`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <Text className="font-semibold">
                {user.stats.rating.toFixed(1)}
              </Text>
              <Text variant="secondary" className="text-sm">
                ({user.stats.reviewsCount} reviews)
              </Text>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
