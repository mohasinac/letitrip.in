import { MediaImage } from "@/components";
import {
  ItemRow as PackageItemRow,
  type ItemRowProps as PackageItemRowProps,
} from "@mohasinac/appkit/ui";

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

type ForwardedItemRowProps = Omit<PackageItemRowProps, "thumbnail">;

export function ItemRow({
  image,
  imageAlt,
  title,
  subtitle,
  rightSlot,
  actions,
  className,
}: ItemRowProps) {
  const forwardedProps: ForwardedItemRowProps = {
    title,
    subtitle,
    rightSlot,
    actions,
    className,
  };

  return (
    <PackageItemRow
      {...forwardedProps}
      thumbnail={
        <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-zinc-100 sm:h-20 sm:w-20 dark:bg-slate-800">
          <MediaImage src={image} alt={imageAlt} size="thumbnail" />
        </div>
      }
    />
  );
}
