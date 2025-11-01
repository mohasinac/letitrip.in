"use client";

import React, { useState, useEffect } from "react";
import {
  MessageSquare,
  Clock,
  CheckCircle2,
  AlertCircle,
  Search,
  Filter,
  Plus,
  Eye,
  Mail,
  User,
  Calendar,
  TrendingUp,
  MessageCircle,
  XCircle,
  AlertTriangle,
} from "lucide-react";
import { UnifiedCard, CardContent } from "@/components/ui/unified/Card";
import { UnifiedButton } from "@/components/ui/unified/Button";
import { UnifiedBadge } from "@/components/ui/unified/Badge";
import { UnifiedAlert } from "@/components/ui/unified/Alert";
import { UnifiedModal } from "@/components/ui/unified/Modal";
import { ModernDataTable } from "@/components/ui/admin-seller/ModernDataTable";
import { PageHeader } from "@/components/ui/admin-seller/PageHeader";
import { apiClient } from "@/lib/api/client";
import { apiGet } from "@/lib/api/seller";
import type { TableColumn } from "@/components/ui/admin-seller/ModernDataTable";

interface Ticket {
  id: string;
  ticketNumber: string;
  subject: string;
  category: string;
  status: "open" | "in_progress" | "waiting_customer" | "resolved" | "closed";
  priority: "low" | "medium" | "high" | "urgent";
  userId: string;
  userName: string;
  userEmail: string;
  sellerId?: string;
  sellerName?: string;
  messages: number;
  lastReply: string;
  createdAt: string;
  updatedAt: string;
}

interface TicketStats {
  total: number;
  open: number;
  inProgress: number;
  resolved: number;
  closed: number;
  avgResponseTime: string;
}

interface SupportProps {
  context: "admin" | "seller";
  title: string;
  description: string;
  breadcrumbs: Array<{
    label: string;
    href?: string;
    active?: boolean;
  }>;
}

export default function Support({
  context,
  title,
  description,
  breadcrumbs,
}: SupportProps) {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [stats, setStats] = useState<TicketStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPriority, setSelectedPriority] = useState<string>("all");
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Fetch tickets and stats
  useEffect(() => {
    fetchData();
  }, [context, selectedStatus, selectedPriority]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      if (context === "admin") {
        // Admin: Fetch from admin API
        const params = new URLSearchParams();
        if (selectedStatus !== "all") params.append("status", selectedStatus);
        if (selectedPriority !== "all")
          params.append("priority", selectedPriority);

        const [ticketsResponse, statsResponse] = await Promise.all([
          apiClient.get(`/api/admin/support?${params.toString()}`),
          apiClient.get("/api/admin/support/stats"),
        ]);

        setTickets(ticketsResponse.data || []);
        setStats(statsResponse.data || null);
      } else {
        // Seller: Fetch from seller API
        const params = new URLSearchParams();
        if (selectedStatus !== "all") params.append("status", selectedStatus);
        if (selectedPriority !== "all")
          params.append("priority", selectedPriority);

        const response = (await apiGet(
          `/api/seller/support?${params.toString()}`
        )) as {
          success: boolean;
          data?: { tickets: Ticket[]; stats: TicketStats };
          error?: string;
        };

        if (response.success && response.data) {
          setTickets(response.data.tickets || []);
          setStats(response.data.stats || null);
        } else {
          throw new Error(response.error || "Failed to fetch tickets");
        }
      }
    } catch (err: unknown) {
      console.error("Error fetching support data:", err);
      setError(
        err instanceof Error ? err.message : "Failed to load support tickets"
      );
      setTickets([]);
      setStats(null);
    } finally {
      setLoading(false);
    }
  };

  // Filter tickets by search query
  const filteredTickets = tickets.filter((ticket) => {
    const matchesSearch =
      searchQuery === "" ||
      ticket.ticketNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.userEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (ticket.sellerName &&
        ticket.sellerName.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesSearch;
  });

  // Status badge variant
  const getStatusVariant = (
    status: string
  ): "default" | "success" | "warning" | "error" | "info" => {
    switch (status) {
      case "open":
        return "info";
      case "in_progress":
        return "warning";
      case "resolved":
        return "success";
      case "closed":
        return "default";
      case "waiting_customer":
        return "warning";
      default:
        return "default";
    }
  };

  // Priority badge variant
  const getPriorityVariant = (
    priority: string
  ): "default" | "success" | "warning" | "error" | "info" => {
    switch (priority) {
      case "urgent":
        return "error";
      case "high":
        return "warning";
      case "medium":
        return "info";
      case "low":
        return "default";
      default:
        return "default";
    }
  };

  // Priority icon
  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "urgent":
        return <AlertTriangle className="w-3 h-3" />;
      case "high":
        return <AlertCircle className="w-3 h-3" />;
      default:
        return null;
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString("en-IN", {
      month: "short",
      day: "numeric",
    });
  };

  // Define table columns
  const columns: TableColumn<Ticket>[] = [
    {
      key: "ticketNumber",
      label: "Ticket",
      sortable: true,
      render: (value) => (
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-gray-400" />
          <span className="font-mono text-sm font-medium">{value}</span>
        </div>
      ),
    },
    {
      key: "subject",
      label: "Subject",
      sortable: true,
      render: (value, row) => (
        <div>
          <div className="font-medium text-gray-900 dark:text-white">
            {value}
          </div>
          <div className="flex items-center gap-2 mt-1">
            <UnifiedBadge variant="default" size="sm">
              {row.category}
            </UnifiedBadge>
            {row.messages > 0 && (
              <span className="text-xs text-gray-500 flex items-center gap-1">
                <MessageCircle className="w-3 h-3" />
                {row.messages}
              </span>
            )}
          </div>
        </div>
      ),
    },
    {
      key: "userEmail",
      label: context === "admin" ? "User" : "Contact",
      sortable: true,
      render: (value, row) => (
        <div>
          <div className="text-sm text-gray-900 dark:text-white">
            {row.userName}
          </div>
          <div className="text-xs text-gray-500">{value}</div>
        </div>
      ),
    },
    ...(context === "admin"
      ? [
          {
            key: "sellerName" as keyof Ticket,
            label: "Seller",
            sortable: true,
            render: (value: string | undefined) => (
              <span className="text-sm">
                {value || <span className="text-gray-400">Platform</span>}
              </span>
            ),
          },
        ]
      : []),
    {
      key: "priority",
      label: "Priority",
      sortable: true,
      render: (value) => (
        <UnifiedBadge variant={getPriorityVariant(value)} size="sm">
          <span className="flex items-center gap-1">
            {getPriorityIcon(value)}
            {value}
          </span>
        </UnifiedBadge>
      ),
    },
    {
      key: "status",
      label: "Status",
      sortable: true,
      render: (value) => (
        <UnifiedBadge variant={getStatusVariant(value)} size="sm">
          {value.replace("_", " ")}
        </UnifiedBadge>
      ),
    },
    {
      key: "lastReply",
      label: "Last Reply",
      sortable: true,
      render: (value) => (
        <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
          <Clock className="w-3 h-3" />
          {formatDate(value)}
        </div>
      ),
    },
    {
      key: "createdAt",
      label: "Created",
      sortable: true,
      render: (value) => (
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {formatDate(value)}
        </span>
      ),
    },
  ];

  // Stats cards
  const statsCards = [
    {
      title: "Total Tickets",
      value: stats?.total || 0,
      icon: MessageSquare,
      color: "text-blue-600",
      bgColor: "bg-blue-50 dark:bg-blue-900/20",
    },
    {
      title: "Open",
      value: stats?.open || 0,
      icon: AlertCircle,
      color: "text-orange-600",
      bgColor: "bg-orange-50 dark:bg-orange-900/20",
    },
    {
      title: "In Progress",
      value: stats?.inProgress || 0,
      icon: Clock,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50 dark:bg-yellow-900/20",
    },
    {
      title: "Resolved",
      value: stats?.resolved || 0,
      icon: CheckCircle2,
      color: "text-green-600",
      bgColor: "bg-green-50 dark:bg-green-900/20",
    },
  ];

  // Status tabs
  const statusTabs = [
    { id: "all", label: "All Tickets", count: stats?.total || 0 },
    { id: "open", label: "Open", count: stats?.open || 0 },
    {
      id: "in_progress",
      label: "In Progress",
      count: stats?.inProgress || 0,
    },
    { id: "resolved", label: "Resolved", count: stats?.resolved || 0 },
    { id: "closed", label: "Closed", count: stats?.closed || 0 },
  ];

  return (
    <div className="py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Page Header */}
        <PageHeader
          title={title}
          description={description}
          breadcrumbs={breadcrumbs}
          actions={
            <UnifiedButton onClick={() => setShowCreateModal(true)}>
              <Plus className="w-4 h-4" />
              New Ticket
            </UnifiedButton>
          }
        />

        {/* Error Alert */}
        {error && (
          <UnifiedAlert variant="error" className="mb-6">
            {error}
          </UnifiedAlert>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          {statsCards.map((stat) => (
            <UnifiedCard key={stat.title}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                      {stat.title}
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {loading ? "-" : stat.value.toLocaleString()}
                    </p>
                  </div>
                  <div className={`${stat.bgColor} p-3 rounded-lg`}>
                    <stat.icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </UnifiedCard>
          ))}
        </div>

        {/* Filters */}
        <UnifiedCard className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search tickets..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
              </div>

              {/* Priority Filter */}
              <div className="md:w-48">
                <select
                  value={selectedPriority}
                  onChange={(e) => setSelectedPriority(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="all">All Priorities</option>
                  <option value="urgent">Urgent</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
            </div>
          </CardContent>
        </UnifiedCard>

        {/* Status Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <div className="flex gap-8 overflow-x-auto">
              {statusTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedStatus(tab.id)}
                  className={`pb-4 px-1 border-b-2 font-medium transition-colors whitespace-nowrap ${
                    selectedStatus === tab.id
                      ? "border-primary text-primary"
                      : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                  }`}
                >
                  {tab.label}
                  <span
                    className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                      selectedStatus === tab.id
                        ? "bg-primary text-white"
                        : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Tickets Table */}
        <UnifiedCard>
          <CardContent className="p-0">
            {loading ? (
              <div className="p-12 text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-200 dark:border-gray-700 border-t-primary"></div>
                <p className="mt-4 text-gray-600 dark:text-gray-400">
                  Loading tickets...
                </p>
              </div>
            ) : filteredTickets.length === 0 ? (
              <div className="p-12 text-center">
                <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  No tickets found
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  {searchQuery
                    ? "Try adjusting your search or filters"
                    : "Create your first support ticket to get started"}
                </p>
                {!searchQuery && (
                  <UnifiedButton onClick={() => setShowCreateModal(true)}>
                    <Plus className="w-4 h-4" />
                    Create Ticket
                  </UnifiedButton>
                )}
              </div>
            ) : (
              <ModernDataTable
                columns={columns}
                data={filteredTickets}
                rowActions={[
                  {
                    label: "View",
                    icon: <Eye className="w-4 h-4" />,
                    onClick: (row: Ticket) => {
                      window.location.href = `/${context}/support/${row.id}`;
                    },
                  },
                ]}
              />
            )}
          </CardContent>
        </UnifiedCard>

        {/* Avg Response Time */}
        {stats?.avgResponseTime && (
          <div className="mt-6">
            <UnifiedCard>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-blue-600" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Average Response Time:
                    </span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {stats.avgResponseTime}
                    </span>
                  </div>
                </div>
              </CardContent>
            </UnifiedCard>
          </div>
        )}

        {/* Create Ticket Modal (Placeholder) */}
        {showCreateModal && (
          <UnifiedModal
            open={showCreateModal}
            onClose={() => setShowCreateModal(false)}
            title="Create New Ticket"
          >
            <div className="p-6">
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Ticket creation form coming soon. This will allow you to create
                and submit support tickets.
              </p>
              <UnifiedButton onClick={() => setShowCreateModal(false)}>
                Close
              </UnifiedButton>
            </div>
          </UnifiedModal>
        )}
      </div>
    </div>
  );
}
