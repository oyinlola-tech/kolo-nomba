export type EntityStatus = string;

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: string;
  status: EntityStatus;
  createdAt: string;
}

export interface Cooperative {
  id: string;
  name: string;
  description?: string;
  category?: string;
  location?: string;
  memberCount: number;
  status: EntityStatus;
  createdBy: string;
  createdAt: string;
}

export interface Transaction {
  id: string;
  reference: string;
  amount: number;
  currency: string;
  type: string;
  status: EntityStatus;
  userId: string;
  createdAt: string;
}

export interface Payment {
  id: string;
  userId: string;
  groupId: string;
  amount: number;
  currency: string;
  provider: string;
  status: EntityStatus;
  createdAt: string;
}

export interface Contribution {
  id: string;
  cycleId: string;
  groupMemberId: string;
  expectedAmount: number;
  paidAmount: number;
  status: EntityStatus;
  paidAt: string | null;
}

export interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  channel: string;
  status: EntityStatus;
  readAt: string | null;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  userId?: string;
  action: string;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export interface Withdrawal {
  id: string;
  userId: string;
  walletId: string;
  amount: number;
  destination?: string;
  status: EntityStatus;
  createdAt: string;
}

export interface Dispute {
  id: string;
  reporterName: string;
  againstName: string;
  issue: string;
  amount: number;
  status: EntityStatus;
  createdAt: string;
}

export interface KycSubmission {
  id: string;
  name: string;
  email: string;
  phone: string;
  type: string;
  status: EntityStatus;
  submittedAt: string;
}

export interface Payout {
  id: string;
  groupId: string;
  requestedBy: string;
  amount: number;
  currency: string;
  type: string;
  status: EntityStatus;
  reason?: string;
  createdAt: string;
}

export interface DashboardAnalytics {
  metrics: {
    totalUsers: number;
    activeUsers: number;
    totalGroups: number;
    activeGroups: number;
    totalTransactions: number;
    totalMoneyProcessed: number;
    totalRevenue: number;
  };
  revenue: {
    totalRevenue: number;
    monthlyRevenue: number;
    growth: number;
  };
  charts: {
    monthlyRevenue: { month: string; revenue: number; txns: number; users: number }[];
    transactionVolumeByDay: { date: string; count: number; volume: number }[];
    userGrowthByDay: { date: string; count: number }[];
    groupCreationByDay: { date: string; count: number }[];
    revenueBySource: { source: string; amount: number }[];
  };
  activities: {
    id: string;
    action: string;
    actorName?: string;
    target?: string;
    createdAt: string;
  }[];
}

export interface NotificationSettings {
  smsEnabled: boolean;
  emailEnabled: boolean;
  whatsappEnabled: boolean;
}
