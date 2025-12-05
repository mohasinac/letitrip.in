/**
 * @fileoverview React Component
 * @module src/components/events/PollVoting
 * @description This file contains the PollVoting component and its related functionality
 * 
 * @created 2025-12-05
 * @author Development Team
 */

"use client";

import { useLoadingState } from "@/hooks/useLoadingState";
import { logError } from "@/lib/firebase-error-logger";
import { Check } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

/**
 * PollVotingProps interface
 * 
 * @interface
 * @description Defines the structure and contract for PollVotingProps
 */
export interface PollVotingProps {
  /** Event Id */
  eventId: string;
  /** Options */
  options: Array<{
    /** Id */
    id: string;
    /** Title */
    title: string;
    /** Description */
    description?: string;
    /** Vote Count */
    voteCount: number;
    /** Percentage */
    percentage: number;
  }>;
  /** Total Votes */
  totalVotes: number;
  /** User Vote */
  userVote?: string | null;
  /** Allow Multiple Votes */
  allowMultipleVotes?: boolean;
  /** Is Active */
  isActive?: boolean;
  /** On Vote */
  onVote?: (optionId: string) => Promise<void>;
}

/**
 * PollVoting Component
 *
 * Interactive poll voting interface.
 *
 * Features:
 * - Single or multiple vote support
 * - Real-time vote percentages
 * - Vote confirmation
 * - Loading states
 * - Dark mode support
 *
 * @example
 * ```tsx
 * <PollVoting
 *   eventId="event123"
 *   options={options}
 *   totalVotes={100}
 *   onVote={handleVote}
 * />
 * ```
 */
/**
 * Performs poll voting operation
 *
 * @returns {any} The pollvoting result
 *
 * @example
 * PollVoting();
 */

/**
 * Performs poll voting operation
 *
 * @returns {any} The pollvoting result
 *
 * @example
 * PollVoting();
 */

export function PollVoting({
  eventId,
  options,
  totalVotes,
  userVote,
  allowMultipleVotes = false,
  isActive = true,
  onVote,
}: PollVotingProps) {
  const [selectedOption, setSelectedOption] = useState<string | null>(
    userVote || null,
  );
  const [hasVoted, setHasVoted] = useState<boolean>(!!userVote);

  const { execute } = useLoadingState({
    /** On Load Error */
    onLoadError: (error) => {
      logError(error as Error, {
        /** Component */
        component: "PollVoting.handleVote",
        /** Metadata */
        metadata: { eventId, selectedOption },
      });
      toast.error("Failed to submit vote");
    },
  });

  /**
   * Performs async operation
   *
   * @param {string} optionId - option identifier
   *
   * @returns {Promise<any>} Promise resolving to async  result
   *
   * @throws {Error} When operation fails or validation errors occur
   */

  /**
   * Performs async operation
   *
   * @param {string} optionId - option identifier
   *
   * @returns {Promise<any>} Promise resolving to async  result
   *
   * @throws {Error} When operation fails or validation errors occur
   */

  const handleVote = async (optionId: string) => {
    if (!isActive) {
      toast.error("Voting is not currently active");
      return;
    }

    if (hasVoted && !allowMultipleVotes) {
      toast.error("You have already voted");
      return;
    }

    if (!onVote) {
      return;
    }

    setSelectedOption(optionId);

    await execute(async () => {
      await onVote(optionId);
      setHasVoted(true);
      toast.success("Vote submitted successfully!");
    });
  };

  const sortedOptions = [...options].sort((a, b) => b.voteCount - a.voteCount);

  return (
    <div className="space-y-4">
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
                    /** Width */
                    width: `${option.percentage}%`,
                  }}
                />
              )}

              {/* Content */}
              <button
                type="button"
                onClick={() => handleVote(option.id)}
                disabled={!isActive || (hasVoted && !allowMultipleVotes)}
                className={`relative w-full p-4 text-left transition-colors ${
                  isActive && !hasVoted
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
                      {isSelected && hasVoted && (
                        <Check className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                      )}
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

export default PollVoting;
