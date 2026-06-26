export interface CreateContributionPlanDto {
  name: string;
  description?: string;
  amount: number;
  currency?: string;
  frequency: "DAILY" | "WEEKLY" | "MONTHLY" | "CUSTOM";
  startDate: string;
  endDate: string;
}

export interface UpdateContributionPlanDto {
  name?: string;
  description?: string;
  amount?: number;
  currency?: string;
  frequency?: "DAILY" | "WEEKLY" | "MONTHLY" | "CUSTOM";
  status?: "ACTIVE" | "PAUSED" | "COMPLETED";
}

export interface ContributionPlanResponse {
  id: string;
  groupId: string;
  name: string;
  description: string | null;
  amount: number;
  currency: string;
  frequency: string;
  startDate: string;
  endDate: string;
  status: string;
  createdBy: string;
  createdAt: string;
}

export interface ContributionCycleResponse {
  id: string;
  planId: string;
  cycleNumber: number;
  periodStart: string;
  periodEnd: string;
  expectedAmount: number;
  receivedAmount: number;
  status: string;
  createdAt: string;
}

export interface MemberContributionResponse {
  id: string;
  cycleId: string;
  groupMemberId: string;
  memberName: string;
  expectedAmount: number;
  paidAmount: number;
  status: string;
  paidAt: string | null;
}

export interface ContributionDashboardResponse {
  totalExpectedAmount: number;
  totalReceivedAmount: number;
  outstandingAmount: number;
  completionPercentage: number;
  paidCount: number;
  pendingCount: number;
  lateCount: number;
  partialCount: number;
}
