import type { PollOption, PollVotingProps } from "@letitrip/react-library";
import { PollVoting as PollVotingBase } from "@letitrip/react-library";
import { Check } from "lucide-react";
import { toast } from "sonner";

/**
 * PollVoting wrapper with toast notifications
 *
 * This wrapper provides the toast integration using sonner.
 * The library component is framework-agnostic.
 */
export function PollVoting({
  showToast,
  CheckIcon,
  ...props
}: Omit<PollVotingProps, "showToast" | "CheckIcon"> & {
  showToast?: PollVotingProps["showToast"];
  CheckIcon?: PollVotingProps["CheckIcon"];
}) {
  const defaultShowToast = (message: string, type: "success" | "error") => {
    if (type === "success") {
      toast.success(message);
    } else {
      toast.error(message);
    }
  };

  return (
    <PollVotingBase
      showToast={showToast || defaultShowToast}
      CheckIcon={CheckIcon || <Check className="w-5 h-5" />}
      {...props}
    />
  );
}

export default PollVoting;
export type { PollOption, PollVotingProps };
