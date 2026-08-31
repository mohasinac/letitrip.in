import { ReviewDetailPageView } from "@mohasinac/appkit";
import { PageViewTracker } from "@mohasinac/appkit/client";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function Page({ params }: Props) {
  const { id } = await params;
  return (
    <>
      {/* `review` was a declared PageViewEntityType that nothing emitted. */}
      <PageViewTracker entityType="review" entityId={id} url={`/reviews/${id}`} />
      <ReviewDetailPageView id={id} />
    </>
  );
}
