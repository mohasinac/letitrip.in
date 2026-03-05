import { THEME_CONSTANTS } from "@/constants";
import { classNames } from "@/helpers";
import { Card, Span, Divider } from "@/components";

const { themed, flex } = THEME_CONSTANTS;

export interface SummaryLine {
  label: string;
  value: string;
  /** Render label and value in muted tone. Default: false */
  muted?: boolean;
}

export interface SummaryCardProps {
  lines: SummaryLine[];
  total: { label: string; value: string };
  /** CTA button or any footer content */
  action?: React.ReactNode;
  className?: string;
}

export function SummaryCard({
  lines,
  total,
  action,
  className,
}: SummaryCardProps) {
  return (
    <Card
      className={classNames(
        "p-5 space-y-4",
        className,
      )}
    >
      {/* Line items */}
      <div className="space-y-2">
        {lines.map((line, i) => (
          <div key={i} className={`${flex.between} text-sm`}>
            <Span
              className={
                line.muted ? themed.textSecondary : themed.textSecondary
              }
            >
              {line.label}
            </Span>
            <Span
              className={line.muted ? themed.textSecondary : themed.textPrimary}
            >
              {line.value}
            </Span>
          </div>
        ))}
      </div>

      <Divider />

      {/* Total row */}
      <div className={flex.between}>
        <Span className={`font-bold ${themed.textPrimary}`}>{total.label}</Span>
        <Span className="font-bold text-lg text-indigo-600 dark:text-indigo-400">
          {total.value}
        </Span>
      </div>

      {/* Action slot */}
      {action && <div>{action}</div>}
    </Card>
  );
}
