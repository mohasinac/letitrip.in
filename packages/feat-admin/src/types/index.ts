export interface DashboardStats {
  totalOrders?: number;
  totalRevenue?: number;
  totalUsers?: number;
  totalProducts?: number;
  pendingOrders?: number;
  pendingReviews?: number;
  newUsersToday?: number;
  currency?: string;
}

export interface AdminTableColumn<T = Record<string, unknown>> {
  key: string;
  header: string;
  sortable?: boolean;
  render?: (row: T) => React.ReactNode;
  className?: string;
}

export interface AdminListParams {
  q?: string;
  page?: number;
  perPage?: number;
  sort?: string;
  filters?: string;
}

export interface AdminListResponse<T> {
  items: T[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
}
