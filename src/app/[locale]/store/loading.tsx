import { Section, Skeleton } from "@mohasinac/appkit/ui";

export default function Loading() {
  return (
    <Section className="p-6">
      <div data-testid="store-loading-grid" className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div data-testid="store-loading-nav" className="md:col-span-1">
          <Skeleton variant="rectangular" height="350px" className="rounded-lg" />
        </div>
        <div data-testid="store-loading-content" className="md:col-span-3">
          <Skeleton variant="rectangular" height="500px" className="rounded-lg" />
        </div>
      </div>
    </Section>
  );
}
