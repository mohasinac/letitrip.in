import { Section, Skeleton } from "@mohasinac/appkit/ui";

export default function Loading() {
  return (
    <Section className="p-6">
      <div data-testid="user-loading-grid" className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Nav */}
        <div data-testid="user-loading-nav" className="md:col-span-1">
          <Skeleton variant="rectangular" height="250px" className="rounded-lg" />
        </div>
        {/* Content */}
        <div data-testid="user-loading-content" className="md:col-span-3">
          <Skeleton variant="rectangular" height="400px" className="rounded-lg" />
        </div>
      </div>
    </Section>
  );
}
