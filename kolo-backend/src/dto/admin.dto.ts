export interface DashboardMetrics {
  totalUsers: number;
  activeUsers: number;
  totalGroups: number;
  activeGroups: number;
  totalTransactions: number;
  totalMoneyProcessed: number;
  totalRevenue: number;
}

export interface ChartDataPoint {
  date: string;
  value: number;
}

export interface AdminUserResponse {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: string;
  status: string;
  createdAt: string;
}

export interface AdminGroupResponse {
  id: string;
  name: string;
  category: string | null;
  status: string;
  memberCount: number;
  createdBy: string;
  createdAt: string;
}

export interface AdminTransactionResponse {
  id: string;
  reference: string;
  type: string;
  amount: number;
  currency: string;
  status: string;
  userId: string | null;
  createdAt: string;
}

export interface AdminRevenueResponse {
  totalRevenue: number;
  monthlyRevenue: ChartDataPoint[];
  revenueBySource: Array<{ source: string; amount: number }>;
}

export interface SecurityEventResponse {
  id: string;
  userId: string | null;
  action: string;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}
