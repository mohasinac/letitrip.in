import { ReviewDetailPageView } from "@mohasinac/appkit";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function Page({ params }: Props) {
  const { id } = await params;
  return <ReviewDetailPageView id={id} />;
}
