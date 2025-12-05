/**
 * @fileoverview React Component
 * @module src/components/admin/riplimit/UsersTable
 * @description This file contains the UsersTable component and its related functionality
 * 
 * @created 2025-12-05
 * @author mohasinac
 * @see {@link https://mohasin.chinnapattan.com}
 */

"use client";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Edit, Eye, Loader2, Search, Users } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

/**
 * RipLimitUser interface
 * 
 * @interface
 * @description Defines the structure and contract for RipLimitUser
 */
interface RipLimitUser {
  /** User Id */
  userId: string;
  /** Available Balance */
  availableBalance: number;
  /** Blocked Balance */
  blockedBalance: number;
  /** Has Unpaid Auctions */
  hasUnpaidAuctions: boolean;
  /** Is Blocked */
  isBlocked: boolean;
  /** Unpaid Auction Ids */
  unpaidAuctionIds: string[];
  /** Created At */
  createdAt: { _seconds: number };
  /** Updated At */
  updatedAt: { _seconds: number };
  /** User */
  user: {
    /** Email */
    email: string;
    /** Display Name */
    displayName?: string;
    /** Photo U R L */
    photoURL?: string;
  } | null;
}

/**
 * Pagination interface
 * 
 * @interface
 * @description Defines the structure and contract for Pagination
 */
interface Pagination {
  /** Page */
  page: number;
  /** Page Size */
  pageSize: number;
  /** Total Count */
  totalCount: number;
  /** Total Pages */
  totalPages: number;
  /** Has Next Page */
  hasNextPage: boolean;
  /** Has Previous Page */
  hasPreviousPage: boolean;
}

/**
 * UserFilter type
 * 
 * @typedef {Object} UserFilter
 * @description Type definition for UserFilter
 */
type UserFilter = "all" | "unpaid" | "blocked";

/**
 * UsersTableProps interface
 * 
 * @interface
 * @description Defines the structure and contract for UsersTableProps
 */
interface UsersTableProps {
  /** Users */
  users: RipLimitUser[];
  /** Loading */
  loading: boolean;
  /** Pagination */
  pagination: Pagination | null;
  /** User Filter */
  userFilter: UserFilter;
  /** On Filter Change */
  onFilterChange: (filter: UserFilter) => void;
  /** On Page Change */
  onPageChange: (page: number) => void;
  /** On View User */
  onViewUser: (userId: string) => void;
  /** On Adjust Balance */
  onAdjustBalance: (user: RipLimitUser) => void;
}

/**
 * Function: Users Table
 */
/**
 * Performs users table operation
 *
 * @returns {any} The userstable result
 *
 * @example
 * UsersTable();
 */

/**
 * Performs users table operation
 *
 * @returns {any} The userstable result
 *
 * @example
 * UsersTable();
 */

export function UsersTable({
  users,
  loading,
  pagination,
  userFilter,
  onFilterChange,
  onPageChange,
  onViewUser,
  onAdjustBalance,
}: UsersTableProps) {
  const [searchQuery, setSearchQuery] = useState("");

  /**
   * Formats r l
   *
   * @param {number} amount - The amount
   *
   * @returns {number} The formatrl result
   */

  /**
   * Formats r l
   *
   * @param {number} amount - The amount
   *
   * @returns {number} The formatrl result
   */

  const formatRL = (amount: number) => `${amount.toLocaleString("en-IN")} RL`;

  /**
 * Performs filtered users operation
 *
 * @param {any} (u - The (u
 *
 * @returns {any} The filteredusers result
 *
 */
const filteredUsers = users.filter((u) => {
    if (!searchQuery) return true;
    const searchLower = searchQuery.toLowerCase();
    return (
      u.userId.toLowerCase().includes(searchLower) ||
      u.user?.email?.toLowerCase().includes(searchLower) ||
      u.user?.displayName?.toLowerCase().includes(searchLower)
    );
  });

  return (
    <Card
      title="User Accounts"
      description={`${pagination?.totalCount || 0} total accounts`}
      headerAction={
        <div className="flex items-center gap-3">
          {/* Filter */}
          <select
            value={userFilter}
            onChange={(e) => onFilterChange(e.target.value as UserFilter)}
            className="text-sm border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Users</option>
            <option value="unpaid">Unpaid Auctions</option>
            <option value="blocked">Blocked</option>
          </select>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search users..."
              className="pl-9 pr-4 py-1.5 text-sm border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
            />
          </div>
        </div>
      }
      noPadding
    >
      {loading ? (
        <div className="p-8 text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto" />
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            Loading users...
          </p>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="p-8 text-center">
          <Users className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400 font-medium">
            No users found
          </p>
          <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">
            {searchQuery
              ? "Try adjusting your search"
              : "No RipLimit accounts yet"}
          </p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Available
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Blocked
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredUsers.map((u) => (
                  <tr
                    key={u.userId}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    {/* User Info */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {u.user?.photoURL ? (
                          <Image
                            src={u.user.photoURL}
                            alt={u.user.displayName || u.user.email}
                            width={40}
                            height={40}
                            className="h-10 w-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                            <span className="text-gray-500 dark:text-gray-400 font-medium">
                              {(u.user?.displayName ||
                                u.user?.email ||
                                "?")[0].toUpperCase()}
                            </span>
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {u.user?.displayName || "Unknown User"}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                            {u.user?.email || u.userId}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Available Balance */}
                    <td className="px-6 py-4 text-right">
                      <span className="text-sm font-medium text-green-600">
                        {formatRL(u.availableBalance)}
                      </span>
                    </td>

                    {/* Blocked Balance */}
                    <td className="px-6 py-4 text-right">
                      <span className="text-sm font-medium text-orange-600">
                        {formatRL(u.blockedBalance)}
                      </span>
                    </td>

                    {/* Total Balance */}
                    <td className="px-6 py-4 text-right">
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">
                        {formatRL(u.availableBalance + u.blockedBalance)}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        {u.hasUnpaidAuctions && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            Unpaid
                          </span>
                        )}
                        {u.isBlocked && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            Blocked
                          </span>
                        )}
                        {!u.hasUnpaidAuctions && !u.isBlocked && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Active
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          leftIcon={<Eye className="w-4 h-4" />}
                          onClick={() => onViewUser(u.userId)}
                        >
                          View
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          leftIcon={<Edit className="w-4 h-4" />}
                          onClick={() => onAdjustBalance(u)}
                        >
                          Adjust
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Page {pagination.page} of {pagination.totalPages} (
                {pagination.totalCount} total)
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onPageChange(pagination.page - 1)}
                  disabled={!pagination.hasPreviousPage}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onPageChange(pagination.page + 1)}
                  disabled={!pagination.hasNextPage}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </Card>
  );
}
