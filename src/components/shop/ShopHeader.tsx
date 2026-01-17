"use client";

import { logError } from "@/lib/firebase-error-logger";
import { shopsService } from "@/services/shops.service";
import type { ShopFE } from "@/types/frontend/shop.types";
import {
  DateDisplay,
  ShopHeader as LibraryShopHeader,
  OptimizedImage,
} from "@letitrip/react-library";
import { Heart, MapPin, Share2, Star } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface ShopHeaderProps {
  shop: ShopFE;
}

export function ShopHeader({ shop }: ShopHeaderProps) {
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [checkingFollow, setCheckingFollow] = useState(true);

  useEffect(() => {
    checkFollowStatus();
  }, [shop.slug]);

  const checkFollowStatus = async () => {
    try {
      const result = await shopsService.checkFollowing(shop.slug);
      setIsFollowing(result.isFollowing);
    } catch (error) {
      setIsFollowing(false);
    } finally {
      setCheckingFollow(false);
    }
  };

  const handleFollow = async () => {
    setFollowLoading(true);
    try {
      if (isFollowing) {
        await shopsService.unfollow(shop.slug);
        setIsFollowing(false);
      } else {
        await shopsService.follow(shop.slug);
        setIsFollowing(true);
      }
    } catch (error: any) {
      logError(error as Error, {
        component: "ShopHeader.handleFollowToggle",
        metadata: { shopSlug: shop.slug },
      });
      toast.error(error.message || "Please login to follow shops");
    } finally {
      setFollowLoading(false);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: shop.name,
          url: globalThis.location?.href || "",
        });
      } catch (error) {
        logError(error as Error, { component: "ShopHeader.handleShare" });
      }
    } else {
      navigator.clipboard.writeText(globalThis.location?.href || "");
      toast.success("Link copied to clipboard!");
    }
  };

  return (
    <LibraryShopHeader
      shop={shop}
      isFollowing={isFollowing}
      followLoading={followLoading}
      checkingFollow={checkingFollow}
      onFollow={handleFollow}
      onShare={handleShare}
      ImageComponent={OptimizedImage}
      DateDisplayComponent={DateDisplay}
      icons={{
        star: <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />,
        mapPin: <MapPin className="w-4 h-4" />,
        heart: (
          <Heart
            className={`w-4 h-4 inline mr-2 ${
              isFollowing ? "fill-current" : ""
            }`}
          />
        ),
        share: <Share2 className="w-5 h-5" />,
      }}
    />
  );
}
