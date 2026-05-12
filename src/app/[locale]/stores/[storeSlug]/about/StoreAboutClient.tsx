"use client";
/* eslint-disable lir/no-raw-html-elements, lir/no-raw-media-elements -- LR1-14: legacy raw HTML — migration tracked in crud-tracker.md Tier LR (row LR1-14) */
import { StoreAboutView, type StoreDetail } from "@mohasinac/appkit/client";

export function StoreAboutClient({ store }: { store: StoreDetail }) {
  return (
    <StoreAboutView
      store={store}
      renderStats={(s) =>
        s.itemsSold != null || s.totalReviews != null || s.averageRating != null ? (
          <div className="flex gap-6 text-sm text-neutral-600 border-y py-4">
            {s.itemsSold != null && (
              <div className="text-center">
                <div className="text-lg font-bold text-neutral-900">{s.itemsSold}</div>
                <div>Items Sold</div>
              </div>
            )}
            {s.totalReviews != null && (
              <div className="text-center">
                <div className="text-lg font-bold text-neutral-900">{s.totalReviews}</div>
                <div>Reviews</div>
              </div>
            )}
            {s.averageRating != null && (
              <div className="text-center">
                <div className="text-lg font-bold text-neutral-900">{s.averageRating.toFixed(1)}</div>
                <div>Avg Rating</div>
              </div>
            )}
          </div>
        ) : null
      }
      renderSocialLinks={(links) =>
        links && Object.values(links).some(Boolean) ? (
          <div className="flex gap-3 flex-wrap">
            {links.twitter && (
              <a href={links.twitter} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline">
                Twitter
              </a>
            )}
            {links.instagram && (
              <a href={links.instagram} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline">
                Instagram
              </a>
            )}
            {links.facebook && (
              <a href={links.facebook} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline">
                Facebook
              </a>
            )}
            {links.linkedin && (
              <a href={links.linkedin} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline">
                LinkedIn
              </a>
            )}
          </div>
        ) : null
      }
    />
  );
}
