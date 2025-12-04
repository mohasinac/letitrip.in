"use client";

import { Award, Medal, Trophy } from "lucide-react";

export interface Winner {
  id: string;
  title: string;
  name?: string;
  description?: string;
  imageUrl?: string;
  rank: number;
  score?: number;
}

export interface WinnersSectionProps {
  winners: Winner[];
  title?: string;
  showScores?: boolean;
}

/**
 * WinnersSection Component
 *
 * Displays event winners with rankings.
 *
 * Features:
 * - Top 3 podium display
 * - Rank icons (gold, silver, bronze)
 * - Winner images and details
 * - Dark mode support
 * - Mobile responsive
 *
 * @example
 * ```tsx
 * <WinnersSection
 *   title="Competition Winners"
 *   winners={winners}
 *   showScores
 * />
 * ```
 */
export function WinnersSection({
  winners,
  title = "Winners",
  showScores = false,
}: WinnersSectionProps) {
  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-6 h-6 text-yellow-500" />;
      case 2:
        return <Medal className="w-6 h-6 text-gray-400" />;
      case 3:
        return <Award className="w-6 h-6 text-orange-600" />;
      default:
        return null;
    }
  };

  const getRankBadgeColor = (rank: number) => {
    switch (rank) {
      case 1:
        return "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 border-yellow-300 dark:border-yellow-700";
      case 2:
        return "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300 border-gray-300 dark:border-gray-600";
      case 3:
        return "bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300 border-orange-300 dark:border-orange-700";
      default:
        return "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 border-blue-300 dark:border-blue-700";
    }
  };

  const topThree = winners.filter((w) => w.rank <= 3);
  const others = winners.filter((w) => w.rank > 3);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
        {title}
      </h2>

      {/* Top 3 Podium */}
      {topThree.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {/* 2nd Place */}
          {topThree.find((w) => w.rank === 2) && (
            <div className="order-1 sm:order-1">
              <WinnerCard
                winner={topThree.find((w) => w.rank === 2)!}
                showScores={showScores}
                getRankIcon={getRankIcon}
                getRankBadgeColor={getRankBadgeColor}
              />
            </div>
          )}

          {/* 1st Place */}
          {topThree.find((w) => w.rank === 1) && (
            <div className="order-2 sm:order-2">
              <div className="transform sm:scale-110 sm:-mt-4">
                <WinnerCard
                  winner={topThree.find((w) => w.rank === 1)!}
                  showScores={showScores}
                  getRankIcon={getRankIcon}
                  getRankBadgeColor={getRankBadgeColor}
                  isFirst
                />
              </div>
            </div>
          )}

          {/* 3rd Place */}
          {topThree.find((w) => w.rank === 3) && (
            <div className="order-3 sm:order-3">
              <WinnerCard
                winner={topThree.find((w) => w.rank === 3)!}
                showScores={showScores}
                getRankIcon={getRankIcon}
                getRankBadgeColor={getRankBadgeColor}
              />
            </div>
          )}
        </div>
      )}

      {/* Other Winners */}
      {others.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Other Winners
          </h3>
          <div className="space-y-2">
            {others.map((winner) => (
              <div
                key={winner.id}
                className="flex items-center gap-4 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
              >
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${getRankBadgeColor(
                    winner.rank,
                  )}`}
                >
                  <span className="font-bold">#{winner.rank}</span>
                </div>

                {winner.imageUrl && (
                  <img
                    src={winner.imageUrl}
                    alt={winner.title}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                )}

                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    {winner.title}
                  </h4>
                  {winner.name && (
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {winner.name}
                    </p>
                  )}
                </div>

                {showScores && winner.score !== undefined && (
                  <div className="text-right">
                    <div className="text-lg font-bold text-purple-600 dark:text-purple-400">
                      {winner.score}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      points
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function WinnerCard({
  winner,
  showScores,
  getRankIcon,
  getRankBadgeColor,
  isFirst = false,
}: {
  winner: Winner;
  showScores: boolean;
  getRankIcon: (rank: number) => JSX.Element | null;
  getRankBadgeColor: (rank: number) => string;
  isFirst?: boolean;
}) {
  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-lg border-2 ${
        isFirst
          ? "border-yellow-400 dark:border-yellow-600"
          : "border-gray-200 dark:border-gray-700"
      } p-6 text-center`}
    >
      <div className="flex justify-center mb-4">{getRankIcon(winner.rank)}</div>

      {winner.imageUrl && (
        <img
          src={winner.imageUrl}
          alt={winner.title}
          className="w-24 h-24 rounded-full object-cover mx-auto mb-4"
        />
      )}

      <div
        className={`inline-flex items-center justify-center px-3 py-1 rounded-full border-2 font-bold mb-3 ${getRankBadgeColor(
          winner.rank,
        )}`}
      >
        #{winner.rank}
      </div>

      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
        {winner.title}
      </h3>

      {winner.name && (
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
          {winner.name}
        </p>
      )}

      {winner.description && (
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
          {winner.description}
        </p>
      )}

      {showScores && winner.score !== undefined && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
            {winner.score}
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400">points</div>
        </div>
      )}
    </div>
  );
}

export default WinnersSection;
