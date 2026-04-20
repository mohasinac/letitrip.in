"use client";

import { Div, ReviewsListView, Text } from "@mohasinac/appkit/client";

export function ReviewsRouteClient() {
  return (
    <ReviewsListView
      renderResults={() => (
        <Div className="rounded-xl border border-zinc-200 bg-white p-5">
          <Text className="text-zinc-600">No reviews available yet.</Text>
        </Div>
      )}
      renderSearch={() => null}
      renderSort={() => null}
      labels={{ title: "Reviews" }}
    />
  );
}
