import { MediaImage, Text, Caption } from "@/components";
import { classNames } from "@/helpers";

export interface ItemRowProps {
  image?: string;
  imageAlt: string;
  title: string;
  subtitle?: string;
  /** Right-hand content slot — price, quantity counter, etc. */
  rightSlot?: React.ReactNode;
  /** Action slot — remove / edit buttons */
  actions?: React.ReactNode;
  className?: string;
}

export function ItemRow({
  image,
  imageAlt,
  title,
  subtitle,
  rightSlot,
  actions,
  className,
}: ItemRowProps) {
  return (
    <div className={classNames("flex gap-4 items-start", className)}>
      {/* Thumbnail */}
      <div className="relative w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0 overflow-hidden rounded-lg bg-zinc-100 dark:bg-slate-800">
        <MediaImage src={image} alt={imageAlt} size="thumbnail" />
      </div>

      {/* Title + subtitle */}
      <div className="flex-1 min-w-0">
        <Text size="sm" weight="medium" className="line-clamp-2">
          {title}
        </Text>
        {subtitle && <Caption className="mt-0.5">{subtitle}</Caption>}
        {actions && <div className="mt-2">{actions}</div>}
      </div>

      {/* Right slot */}
      {rightSlot && <div className="flex-shrink-0">{rightSlot}</div>}
    </div>
  );
}
