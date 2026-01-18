/**
 * WelcomeHero Component - Pure React
 *
 * Simple welcome hero section with configurable title and description.
 * Framework-agnostic component for homepage welcome banner.
 */

export interface WelcomeHeroProps {
  /** Main title text */
  title: string;
  /** Description/subtitle text */
  description: string;
  /** Additional CSS classes */
  className?: string;
}

export function WelcomeHero({
  title,
  description,
  className = "",
}: WelcomeHeroProps) {
  return (
    <section className={`text-center py-3 md:py-4 ${className}`}>
      <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-2 md:mb-3">
        {title}
      </h1>
      <p className="text-base md:text-lg lg:text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto px-2">
        {description}
      </p>
    </section>
  );
}
