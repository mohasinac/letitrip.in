import { Section, Skeleton } from "@mohasinac/appkit/ui";

export default function Loading() {
  return (
    <Section className="p-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Nav */}
        <div className="md:col-span-1">
          <Skeleton variant="rectangular" height="350px" className="rounded-lg" />
        </div>
        {/* Content */}
        <div className="md:col-span-3">
          <Skeleton variant="rectangular" height="500px" className="rounded-lg" />
        </div>
      </div>
    </Section>
  );
}
