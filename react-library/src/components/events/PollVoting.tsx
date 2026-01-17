import { useState, type ReactNode } from "react";

export interface PollOption {
  /** Option ID */
  id: string;
  /** Option title */
  title: string;
  /** Optional description */
  description?: string;
  /** Number of votes */
  voteCount: number;
  /** Vote percentage (0-100) */
  percentage: number;
}

export interface PollVotingProps {
  /** Event ID */
  eventId: string;
  /** Poll options */
  options: PollOption[];
  /** Total votes cast */
  totalVotes: number;
  /** User's current vote (option ID) */
  userVote?: string | null;
  /** Allow multiple votes */
  allowMultipleVotes?: boolean;
  /** Whether voting is active */
  isActive?: boolean;
  /** Callback when user votes */
  onVote?: (optionId: string) => Promise<void>;
  /** Toast notification function */
  showToast?: (message: string, type: "success" | "error") => void;
  /** Custom check icon */
  CheckIcon?: ReactNode;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Default Check Icon (SVG)
 */
const DefaultCheckIcon = () => (
  <svg
    className="w-5 h-5 text-purple-600 dark:text-purple-400"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M5 13l4 4L19 7"
    />
  </svg>
);

/**
 * PollVoting - Interactive poll voting interface
 *
 * A pure React component that displays poll options with voting functionality.
 * Supports single/multiple votes and shows real-time percentages.
 *
 * @example
 * ```tsx
 * const options = [
 *   { id: "1", title: "Option A", voteCount: 50, percentage: 50 },
 *   { id: "2", title: "Option B", voteCount: 50, percentage: 50 },
 * ];
 *
 * <PollVoting
 *   eventId="event123"
 *   options={options}
 *   totalVotes={100}
 *   onVote={async (optionId) => await submitVote(optionId)}
 *   showToast={(msg, type) => toast[type](msg)}
 * />
 * ```
 */
export function PollVoting({
  eventId,
  options,
  totalVotes,
  userVote,
  allowMultipleVotes = false,
  isActive = true,
  onVote,
  showToast = () => {},
  CheckIcon,
  className = "",
}: PollVotingProps) {
  const [selectedOption, setSelectedOption] = useState<string | null>(
    userVote || null
  );
  const [hasVoted, setHasVoted] = useState<boolean>(!!userVote);
  const [isVoting, setIsVoting] = useState<boolean>(false);

  const handleVote = async (optionId: string) => {
    if (!isActive) {
      showToast("Voting is not currently active", "error");
      return;
    }

    if (hasVoted && !allowMultipleVotes) {
      showToast("You have already voted", "error");
      return;
    }

    if (!onVote) {
      return;
    }

    setSelectedOption(optionId);
    setIsVoting(true);

    try {
      await onVote(optionId);
      setHasVoted(true);
      showToast("Vote submitted successfully!", "success");
    } catch (error) {
      showToast("Failed to submit vote", "error");
    } finally {
      setIsVoting(false);
    }
  };

  const sortedOptions = [...options].sort((a, b) => b.voteCount - a.voteCount);

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Vote Now
        </h3>
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {totalVotes} {totalVotes === 1 ? "vote" : "votes"}
        </span>
      </div>

      <div className="space-y-3">
        {sortedOptions.map((option) => {
          const isSelected = selectedOption === option.id;
          const showResults = hasVoted || !isActive;

          return (
            <div
              key={option.id}
              className="relative border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden"
            >
              {/* Background bar */}
              {showResults && (
                <div
                  className="absolute inset-0 bg-purple-100 dark:bg-purple-900/30 transition-all"
                  style={{
                    width: `${option.percentage}%`,
                  }}
                />
              )}

              {/* Content */}
              <button
                type="button"
                onClick={() => handleVote(option.id)}
                disabled={
                  !isActive || (hasVoted && !allowMultipleVotes) || isVoting
                }
                className={`relative w-full p-4 text-left transition-colors ${
                  isActive && !hasVoted && !isVoting
                    ? "hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
                    : "cursor-not-allowed"
                } ${
                  isSelected
                    ? "bg-purple-50 dark:bg-purple-900/20 border-purple-500 dark:border-purple-600"
                    : ""
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        {option.title}
                      </h4>
                      {isSelected &&
                        hasVoted &&
                        (CheckIcon || <DefaultCheckIcon />)}
                    </div>
                    {option.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {option.description}
                      </p>
                    )}
                  </div>

                  {showResults && (
                    <div className="text-right">
                      <div className="text-lg font-bold text-purple-600 dark:text-purple-400">
                        {Math.round(option.percentage)}%
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">
                        {option.voteCount}{" "}
                        {option.voteCount === 1 ? "vote" : "votes"}
                      </div>
                    </div>
                  )}
                </div>
              </button>
            </div>
          );
        })}
      </div>

      {!isActive && (
        <p className="text-sm text-gray-500 dark:text-gray-400 text-center mt-4">
          Voting has ended
        </p>
      )}

      {hasVoted && !allowMultipleVotes && (
        <p className="text-sm text-green-600 dark:text-green-400 text-center mt-4">
          ✓ You have voted
        </p>
      )}
    </div>
  );
}
