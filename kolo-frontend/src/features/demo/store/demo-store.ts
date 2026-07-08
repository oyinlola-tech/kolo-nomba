import type { AuthUser } from "../../../types/auth.types";

const STORAGE_KEY = "kolo_demo_data";

export interface DemoGroup {
  id: string;
  name: string;
  description: string;
  category: string;
  location: string;
  contributionAmount: number;
  currency: string;
  frequency: string;
  collectionDay: string;
  memberCount: number;
  status: string;
  createdBy: string;
  createdAt: string;
  adminName: string;
  savingsBalance: number;
}

export interface DemoGroupMember {
  id: string;
  groupId: string;
  userId: string;
  firstName: string;
  lastName: string;
  name: string;
  email: string;
  role: string;
  status: string;
  joinedAt: string;
}

export interface DemoContributionPlan {
  id: string;
  groupId: string;
  name: string;
  amount: number;
  frequency: string;
  status: string;
}

export interface DemoContributionCycle {
  id: string;
  planId: string;
  cycleNumber: number;
  periodStart: string;
  periodEnd: string;
  expectedAmount: number;
  receivedAmount: number;
  status: string;
}

export interface DemoMemberContribution {
  id: string;
  cycleId: string;
  groupMemberId: string;
  expectedAmount: number;
  paidAmount: number;
  status: string;
  paidAt: string | null;
  amount?: number;
  memberName?: string;
}

export interface DemoPayment {
  id: string;
  userId: string;
  groupId: string;
  contributionId: string;
  amount: number;
  currency: string;
  provider: string;
  providerReference: string;
  status: string;
  paymentMethod: string;
  reference: string;
  checkoutUrl: string | null;
  virtualAccount: {
    accountNumber: string;
    accountName: string;
    bankName: string;
    amount: number;
    paymentId: string;
  } | null;
  createdAt: string;
}

export interface DemoTransaction {
  id: string;
  reference: string;
  amount: number;
  currency: string;
  type: string;
  status: string;
  userId: string;
  createdAt: string;
  userName: string;
  cooperativeName: string;
  provider: string;
}

export interface DemoNotification {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  channel: string;
  status: string;
  readAt: string | null;
  metadata: Record<string, string> | null;
  createdAt: string;
  body: string;
  read: boolean;
}

export interface DemoVirtualAccount {
  id: string;
  accountNumber: string;
  accountName: string;
  bankName: string;
  providerReference: string;
  status: string;
  createdAt: string;
}

export interface DemoWithdrawal {
  id: string;
  userId: string;
  groupId: string;
  amount: number;
  destination: string;
  destinationBank: string;
  accountName: string;
  status: string;
  createdAt: string;
  requesterName: string;
  cooperativeName: string;
}

export interface DemoDispute {
  id: string;
  reporterName: string;
  againstName: string;
  issue: string;
  amount: number;
  status: string;
  createdAt: string;
}

export interface DemoAuditLog {
  id: string;
  userId: string;
  action: string;
  ipAddress: string;
  userAgent: string;
  metadata: Record<string, string> | null;
  createdAt: string;
  target: string;
  actorName: string;
}

export interface DemoPayout {
  id: string;
  groupId: string;
  requestedBy: string;
  amount: number;
  currency: string;
  type: string;
  status: string;
  reason: string;
  createdAt: string;
}

export interface DemoActivity {
  id: string;
  action: string;
  actorName: string;
  target: string;
  createdAt: string;
}

export interface DemoDatabase {
  users: AuthUser[];
  groups: DemoGroup[];
  groupMembers: DemoGroupMember[];
  contributionPlans: DemoContributionPlan[];
  contributionCycles: DemoContributionCycle[];
  memberContributions: DemoMemberContribution[];
  payments: DemoPayment[];
  transactions: DemoTransaction[];
  payouts: DemoPayout[];
  notifications: DemoNotification[];
  virtualAccounts: DemoVirtualAccount[];
  withdrawals: DemoWithdrawal[];
  disputes: DemoDispute[];
  auditLogs: DemoAuditLog[];
  activities: DemoActivity[];
  revenue: { month: string; amount: number }[];
  savingsTrend: { month: string; savings: number; contributions: number }[];
  nextId: number;
}

function fmtDate(daysAgo = 0): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString();
}

function seedDatabase(): DemoDatabase {
  const users: AuthUser[] = [
    { id: "demo-super-admin", firstName: "Oluwayemi", lastName: "Oyinlola", email: "admin@kolo.demo", phone: "+2348000000001", role: "SUPER_ADMIN", status: "ACTIVE" },
    { id: "demo-group-admin", firstName: "Chioma", lastName: "Eze", email: "chioma@kolo.demo", phone: "+2348000000002", role: "GROUP_ADMIN", status: "ACTIVE" },
    { id: "demo-member", firstName: "Adaobi", lastName: "Okonkwo", email: "ada@kolo.demo", phone: "+2348000000003", role: "MEMBER", status: "ACTIVE" },
  ];

  const groups: DemoGroup[] = [
    { id: "group-market-traders", name: "Market Traders Ajo", description: "Monthly savings cooperative for market traders in Lagos Mainland", category: "Market Association", location: "Lagos Mainland", contributionAmount: 50000, currency: "NGN", frequency: "MONTHLY", collectionDay: "Every 1st", memberCount: 24, status: "ACTIVE", createdBy: "demo-group-admin", createdAt: fmtDate(180), adminName: "Chioma Eze", savingsBalance: 850000 },
    { id: "group-community", name: "Community Builders", description: "Weekly savings for community development projects", category: "Community Development", location: "Ikeja, Lagos", contributionAmount: 10000, currency: "NGN", frequency: "WEEKLY", collectionDay: "Every Monday", memberCount: 15, status: "ACTIVE", createdBy: "demo-group-admin", createdAt: fmtDate(90), adminName: "Chioma Eze", savingsBalance: 320000 },
  ];

  const groupMembers: DemoGroupMember[] = [
    { id: "gm-1", groupId: "group-market-traders", userId: "demo-group-admin", firstName: "Chioma", lastName: "Eze", name: "Chioma Eze", email: "chioma@kolo.demo", role: "GROUP_ADMIN", status: "ACTIVE", joinedAt: fmtDate(180) },
    { id: "gm-2", groupId: "group-market-traders", userId: "demo-member", firstName: "Adaobi", lastName: "Okonkwo", name: "Adaobi Okonkwo", email: "ada@kolo.demo", role: "MEMBER", status: "ACTIVE", joinedAt: fmtDate(170) },
    { id: "gm-3", groupId: "group-market-traders", userId: "", firstName: "Emeka", lastName: "Okafor", name: "Emeka Okafor", email: "emeka@example.com", role: "MEMBER", status: "ACTIVE", joinedAt: fmtDate(165) },
    { id: "gm-4", groupId: "group-market-traders", userId: "", firstName: "Tunde", lastName: "Balogun", name: "Tunde Balogun", email: "tunde@example.com", role: "MEMBER", status: "ACTIVE", joinedAt: fmtDate(160) },
    { id: "gm-5", groupId: "group-market-traders", userId: "", firstName: "Ngozi", lastName: "Adichie", name: "Ngozi Adichie", email: "ngozi@example.com", role: "MEMBER", status: "ACTIVE", joinedAt: fmtDate(155) },
    { id: "gm-6", groupId: "group-community", userId: "demo-group-admin", firstName: "Chioma", lastName: "Eze", name: "Chioma Eze", email: "chioma@kolo.demo", role: "GROUP_ADMIN", status: "ACTIVE", joinedAt: fmtDate(90) },
    { id: "gm-7", groupId: "group-community", userId: "demo-member", firstName: "Adaobi", lastName: "Okonkwo", name: "Adaobi Okonkwo", email: "ada@kolo.demo", role: "MEMBER", status: "ACTIVE", joinedAt: fmtDate(85) },
    { id: "gm-8", groupId: "group-community", userId: "", firstName: "Chidi", lastName: "Okeke", name: "Chidi Okeke", email: "chidi@example.com", role: "MEMBER", status: "PENDING", joinedAt: fmtDate(80) },
  ];

  const contributionPlans: DemoContributionPlan[] = [
    { id: "plan-1", groupId: "group-market-traders", name: "Monthly Savings Plan", amount: 50000, frequency: "MONTHLY", status: "ACTIVE" },
    { id: "plan-2", groupId: "group-community", name: "Weekly Dues", amount: 10000, frequency: "WEEKLY", status: "ACTIVE" },
  ];

  const cycles: DemoContributionCycle[] = [
    { id: "cycle-1", planId: "plan-1", cycleNumber: 1, periodStart: "2026-01-01", periodEnd: "2026-01-31", expectedAmount: 1200000, receivedAmount: 1150000, status: "COMPLETED" },
    { id: "cycle-2", planId: "plan-1", cycleNumber: 2, periodStart: "2026-02-01", periodEnd: "2026-02-28", expectedAmount: 1200000, receivedAmount: 1200000, status: "COMPLETED" },
    { id: "cycle-3", planId: "plan-1", cycleNumber: 3, periodStart: "2026-03-01", periodEnd: "2026-03-31", expectedAmount: 1200000, receivedAmount: 1180000, status: "COMPLETED" },
    { id: "cycle-4", planId: "plan-1", cycleNumber: 4, periodStart: "2026-04-01", periodEnd: "2026-04-30", expectedAmount: 1200000, receivedAmount: 1200000, status: "COMPLETED" },
    { id: "cycle-5", planId: "plan-1", cycleNumber: 5, periodStart: "2026-05-01", periodEnd: "2026-05-31", expectedAmount: 1200000, receivedAmount: 1160000, status: "COMPLETED" },
    { id: "cycle-6", planId: "plan-1", cycleNumber: 6, periodStart: "2026-06-01", periodEnd: "2026-06-30", expectedAmount: 1200000, receivedAmount: 850000, status: "OPEN" },
  ];

  const memberContributions: DemoMemberContribution[] = [
    { id: "mc-1", cycleId: "cycle-6", groupMemberId: "gm-1", expectedAmount: 50000, paidAmount: 50000, status: "PAID", paidAt: fmtDate(5), amount: 50000, memberName: "Chioma Eze" },
    { id: "mc-2", cycleId: "cycle-6", groupMemberId: "gm-2", expectedAmount: 50000, paidAmount: 50000, status: "PAID", paidAt: fmtDate(3), amount: 50000, memberName: "Adaobi Okonkwo" },
    { id: "mc-3", cycleId: "cycle-6", groupMemberId: "gm-3", expectedAmount: 50000, paidAmount: 50000, status: "PAID", paidAt: fmtDate(4), amount: 50000, memberName: "Emeka Okafor" },
    { id: "mc-4", cycleId: "cycle-6", groupMemberId: "gm-4", expectedAmount: 50000, paidAmount: 0, status: "PENDING", paidAt: null, amount: 0, memberName: "Tunde Balogun" },
    { id: "mc-5", cycleId: "cycle-6", groupMemberId: "gm-5", expectedAmount: 50000, paidAmount: 0, status: "LATE", paidAt: null, amount: 0, memberName: "Ngozi Adichie" },
  ];

  const payments: DemoPayment[] = [
    { id: "pay-1", userId: "demo-group-admin", groupId: "group-market-traders", contributionId: "mc-1", amount: 50000, currency: "NGN", provider: "nomba", providerReference: "NOM-REF-001", status: "SUCCESSFUL", paymentMethod: "bank_transfer", reference: "KOLO-REF-001", checkoutUrl: null, virtualAccount: { accountNumber: "0123456789", accountName: "Chioma Eze", bankName: "Nomba Bank", amount: 50000, paymentId: "pay-1" }, createdAt: fmtDate(5) },
    { id: "pay-2", userId: "demo-member", groupId: "group-market-traders", contributionId: "mc-2", amount: 50000, currency: "NGN", provider: "nomba", providerReference: "NOM-REF-002", status: "SUCCESSFUL", paymentMethod: "card", reference: "KOLO-REF-002", checkoutUrl: null, virtualAccount: null, createdAt: fmtDate(3) },
    { id: "pay-3", userId: "demo-member", groupId: "group-community", contributionId: "mc-100", amount: 10000, currency: "NGN", provider: "nomba", providerReference: "NOM-REF-003", status: "SUCCESSFUL", paymentMethod: "bank_transfer", reference: "KOLO-REF-003", checkoutUrl: null, virtualAccount: { accountNumber: "0123456790", accountName: "Adaobi Okonkwo", bankName: "Nomba Bank", amount: 10000, paymentId: "pay-3" }, createdAt: fmtDate(2) },
  ];

  const transactions: DemoTransaction[] = [
    { id: "txn-1", reference: "KOLO-REF-001", amount: 50000, currency: "NGN", type: "CONTRIBUTION_PAYMENT", status: "SUCCESSFUL", userId: "demo-group-admin", createdAt: fmtDate(5), userName: "Chioma Eze", cooperativeName: "Market Traders Ajo", provider: "nomba" },
    { id: "txn-2", reference: "KOLO-REF-002", amount: 50000, currency: "NGN", type: "CONTRIBUTION_PAYMENT", status: "SUCCESSFUL", userId: "demo-member", createdAt: fmtDate(3), userName: "Adaobi Okonkwo", cooperativeName: "Market Traders Ajo", provider: "nomba" },
    { id: "txn-3", reference: "KOLO-REF-003", amount: 10000, currency: "NGN", type: "CONTRIBUTION_PAYMENT", status: "SUCCESSFUL", userId: "demo-member", createdAt: fmtDate(2), userName: "Adaobi Okonkwo", cooperativeName: "Community Builders", provider: "nomba" },
    { id: "txn-4", reference: "KOLO-REF-004", amount: 50000, currency: "NGN", type: "PAYOUT", status: "SUCCESSFUL", userId: "demo-group-admin", createdAt: fmtDate(60), userName: "Chioma Eze", cooperativeName: "Market Traders Ajo", provider: "nomba" },
    { id: "txn-5", reference: "KOLO-REF-005", amount: 500, currency: "NGN", type: "FEE", status: "SUCCESSFUL", userId: "demo-group-admin", createdAt: fmtDate(5), userName: "Chioma Eze", cooperativeName: "Market Traders Ajo", provider: "nomba" },
  ];

  const payouts: DemoPayout[] = [
    { id: "payout-1", groupId: "group-market-traders", requestedBy: "demo-group-admin", amount: 500000, currency: "NGN", type: "ROTATION", status: "SUCCESSFUL", reason: "Monthly payout to Adaobi Okonkwo", createdAt: fmtDate(120) },
    { id: "payout-2", groupId: "group-market-traders", requestedBy: "demo-group-admin", amount: 500000, currency: "NGN", type: "ROTATION", status: "SUCCESSFUL", reason: "Monthly payout to Emeka Okafor", createdAt: fmtDate(90) },
    { id: "payout-3", groupId: "group-market-traders", requestedBy: "demo-group-admin", amount: 500000, currency: "NGN", type: "ROTATION", status: "APPROVED", reason: "Monthly payout to Tunde Balogun", createdAt: fmtDate(3) },
  ];

  const notifications: DemoNotification[] = [
    { id: "notif-1", userId: "demo-member", type: "PAYMENT", title: "Payment Confirmed", message: "Your contribution payment of ₦50,000 to Market Traders Ajo has been confirmed.", channel: "IN_APP", status: "READ", readAt: fmtDate(2), metadata: { group: "Market Traders Ajo" }, createdAt: fmtDate(3), body: "Your contribution payment of ₦50,000 to Market Traders Ajo has been confirmed.", read: true },
    { id: "notif-2", userId: "demo-member", type: "PAYMENT", title: "Payment Reminder", message: "Your weekly contribution of ₦10,000 to Community Builders is due tomorrow.", channel: "IN_APP", status: "SENT", readAt: null, metadata: { group: "Community Builders" }, createdAt: fmtDate(1), body: "Your weekly contribution of ₦10,000 to Community Builders is due tomorrow.", read: false },
    { id: "notif-3", userId: "demo-member", type: "GROUP", title: "New Member Joined", message: "Chidi Okeke has joined Community Builders.", channel: "IN_APP", status: "SENT", readAt: null, metadata: { group: "Community Builders" }, createdAt: fmtDate(2), body: "Chidi Okeke has joined Community Builders.", read: false },
  ];

  const virtualAccounts: DemoVirtualAccount[] = [
    { id: "va-1", accountNumber: "0123456789", accountName: "Chioma Eze - Kolo Savings", bankName: "Nomba Bank", providerReference: "NOM-VA-001", status: "ACTIVE", createdAt: fmtDate(180) },
    { id: "va-2", accountNumber: "0123456790", accountName: "Adaobi Okonkwo - Kolo Savings", bankName: "Nomba Bank", providerReference: "NOM-VA-002", status: "ACTIVE", createdAt: fmtDate(170) },
  ];

  const withdrawals: DemoWithdrawal[] = [
    { id: "wd-1", userId: "demo-group-admin", groupId: "group-market-traders", amount: 100000, destination: "0123456789", destinationBank: "GTBank", accountName: "Chioma Eze", status: "COMPLETED", createdAt: fmtDate(30), requesterName: "Chioma Eze", cooperativeName: "Market Traders Ajo" },
    { id: "wd-2", userId: "demo-group-admin", groupId: "group-market-traders", amount: 50000, destination: "0123456790", destinationBank: "Access Bank", accountName: "Adaobi Okonkwo", status: "PENDING", createdAt: fmtDate(2), requesterName: "Adaobi Okonkwo", cooperativeName: "Market Traders Ajo" },
  ];

  const disputes: DemoDispute[] = [
    { id: "disp-1", reporterName: "Adaobi Okonkwo", againstName: "Market Traders Ajo", issue: "Missing contribution record for May 2026", amount: 50000, status: "OPEN", createdAt: fmtDate(10) },
    { id: "disp-2", reporterName: "Emeka Okafor", againstName: "Market Traders Ajo", issue: "Duplicate payment deduction", amount: 50000, status: "RESOLVED", createdAt: fmtDate(45) },
  ];

  const auditLogs: DemoAuditLog[] = [
    { id: "audit-1", userId: "demo-super-admin", action: "USER_LOGIN", ipAddress: "192.168.1.100", userAgent: "Mozilla/5.0", metadata: null, createdAt: fmtDate(0), target: "", actorName: "Oluwayemi Oyinlola" },
    { id: "audit-2", userId: "demo-super-admin", action: "USER_VERIFIED", ipAddress: "192.168.1.100", userAgent: "Mozilla/5.0", metadata: { userId: "user-abc" }, createdAt: fmtDate(1), target: "user-abc", actorName: "Oluwayemi Oyinlola" },
    { id: "audit-3", userId: "demo-group-admin", action: "GROUP_CREATED", ipAddress: "192.168.1.101", userAgent: "Chrome/120", metadata: { groupId: "group-community" }, createdAt: fmtDate(90), target: "Community Builders", actorName: "Chioma Eze" },
  ];

  const activities: DemoActivity[] = [
    { id: "act-1", action: "New user registered", actorName: "Adaobi Okonkwo", target: "", createdAt: fmtDate(0) },
    { id: "act-2", action: "Payment confirmed", actorName: "Chioma Eze", target: "₦50,000 contribution", createdAt: fmtDate(0) },
    { id: "act-3", action: "Group created", actorName: "Chioma Eze", target: "Community Builders", createdAt: fmtDate(1) },
    { id: "act-4", action: "Payout approved", actorName: "Chioma Eze", target: "₦500,000 to Tunde Balogun", createdAt: fmtDate(3) },
    { id: "act-5", action: "Withdrawal requested", actorName: "Adaobi Okonkwo", target: "₦50,000", createdAt: fmtDate(2) },
  ];

  const revenue = [
    { month: "Jan", amount: 85000 },
    { month: "Feb", amount: 92000 },
    { month: "Mar", amount: 78000 },
    { month: "Apr", amount: 105000 },
    { month: "May", amount: 95000 },
    { month: "Jun", amount: 112000 },
  ];

  const savingsTrend = [
    { month: "Jan", savings: 1150000, contributions: 480000 },
    { month: "Feb", savings: 1200000, contributions: 510000 },
    { month: "Mar", savings: 1180000, contributions: 495000 },
    { month: "Apr", savings: 1250000, contributions: 530000 },
    { month: "May", savings: 1160000, contributions: 470000 },
    { month: "Jun", savings: 850000, contributions: 200000 },
  ];

  return {
    users, groups, groupMembers, contributionPlans, contributionCycles: cycles,
    memberContributions, payments, transactions, payouts, notifications,
    virtualAccounts, withdrawals, disputes, auditLogs, activities, revenue, savingsTrend,
    nextId: 1000,
  };
}

function loadDatabase(): DemoDatabase {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as DemoDatabase;
  } catch { /* ignore */ }
  const db = seedDatabase();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
  return db;
}

function saveDatabase(db: DemoDatabase) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
}

let _db: DemoDatabase | null = null;

function db(): DemoDatabase {
  if (!_db) _db = loadDatabase();
  return _db;
}

function nextId(prefix: string): string {
  const d = db();
  d.nextId += 1;
  saveDatabase(d);
  return `${prefix}-${d.nextId}`;
}

export function getUser(id: string): AuthUser | undefined {
  return db().users.find((u) => u.id === id);
}

export function getUserByEmail(email: string): AuthUser | undefined {
  return db().users.find((u) => u.email === email);
}

export function getGroups(page = 1, limit = 20): { items: DemoGroup[]; pagination: { page: number; limit: number; total: number; totalPages: number; hasNext: boolean; hasPrev: boolean } } {
  const all = db().groups;
  const total = all.length;
  const totalPages = Math.ceil(total / limit);
  const start = (page - 1) * limit;
  return { items: all.slice(start, start + limit), pagination: { page, limit, total, totalPages, hasNext: page < totalPages, hasPrev: page > 1 } };
}

export function getGroupsForUser(userId: string): DemoGroup[] {
  const memberGroupIds = db().groupMembers.filter((gm) => gm.userId === userId).map((gm) => gm.groupId);
  return db().groups.filter((g) => g.createdBy === userId || memberGroupIds.includes(g.id));
}

export function getGroupById(id: string): DemoGroup | undefined {
  return db().groups.find((g) => g.id === id);
}

export function getContributionPlans(): DemoContributionPlan[] {
  return db().contributionPlans;
}

export function getGroupMembers(groupId: string): DemoGroupMember[] {
  return db().groupMembers.filter((gm) => gm.groupId === groupId);
}

export function getGroupSettings(groupId: string): DemoGroup | undefined {
  return getGroupById(groupId);
}

export function getContributions(page = 1, limit = 20, userId?: string): { items: DemoMemberContribution[]; pagination: { page: number; limit: number; total: number; totalPages: number; hasNext: boolean; hasPrev: boolean } } {
  let all = db().memberContributions;
  if (userId) {
    const memberIds = db().groupMembers.filter((gm) => gm.userId === userId).map((gm) => gm.id);
    all = all.filter((mc) => memberIds.includes(mc.groupMemberId));
  }
  const total = all.length;
  const totalPages = Math.ceil(total / limit);
  const start = (page - 1) * limit;
  return { items: all.slice(start, start + limit), pagination: { page, limit, total, totalPages, hasNext: page < totalPages, hasPrev: page > 1 } };
}

export function getContributionById(id: string): DemoMemberContribution | undefined {
  return db().memberContributions.find((c) => c.id === id);
}

export function getPayments(page = 1, limit = 20): { items: DemoPayment[]; pagination: { page: number; limit: number; total: number; totalPages: number; hasNext: boolean; hasPrev: boolean } } {
  const all = db().payments;
  const total = all.length;
  const totalPages = Math.ceil(total / limit);
  const start = (page - 1) * limit;
  return { items: all.slice(start, start + limit), pagination: { page, limit, total, totalPages, hasNext: page < totalPages, hasPrev: page > 1 } };
}

export function getPaymentById(id: string): DemoPayment | undefined {
  const p = db().payments.find((pay) => pay.id === id);
  if (p && p.status === "PENDING" && Date.now() - new Date(p.createdAt).getTime() > 5000) {
    completePayment(id);
    return db().payments.find((pay) => pay.id === id);
  }
  return p;
}

export function getTransactions(page = 1, limit = 20): { items: DemoTransaction[]; pagination: { page: number; limit: number; total: number; totalPages: number; hasNext: boolean; hasPrev: boolean } } {
  const all = db().transactions;
  const total = all.length;
  const totalPages = Math.ceil(total / limit);
  const start = (page - 1) * limit;
  return { items: all.slice(start, start + limit), pagination: { page, limit, total, totalPages, hasNext: page < totalPages, hasPrev: page > 1 } };
}

export function getPayouts(page = 1, limit = 20): { items: DemoPayout[]; pagination: { page: number; limit: number; total: number; totalPages: number; hasNext: boolean; hasPrev: boolean } } {
  const all = db().payouts;
  const total = all.length;
  const totalPages = Math.ceil(total / limit);
  const start = (page - 1) * limit;
  return { items: all.slice(start, start + limit), pagination: { page, limit, total, totalPages, hasNext: page < totalPages, hasPrev: page > 1 } };
}

export function getVirtualAccount(userId: string): DemoVirtualAccount | undefined {
  return db().virtualAccounts.find((va) =>
    db().groupMembers.some((gm) => gm.userId === userId && va.accountName.includes(gm.name.split(" ")[0]))
  );
}

export function getNotifications(page = 1, limit = 20, userId?: string): { items: DemoNotification[]; pagination: { page: number; limit: number; total: number; totalPages: number; hasNext: boolean; hasPrev: boolean } } {
  let all = db().notifications;
  if (userId) all = all.filter((n) => n.userId === userId);
  const total = all.length;
  const totalPages = Math.ceil(total / limit);
  const start = (page - 1) * limit;
  return { items: all.slice(start, start + limit), pagination: { page, limit, total, totalPages, hasNext: page < totalPages, hasPrev: page > 1 } };
}

export function getWithdrawals(page = 1, limit = 20): { items: DemoWithdrawal[]; pagination: { page: number; limit: number; total: number; totalPages: number; hasNext: boolean; hasPrev: boolean } } {
  const all = db().withdrawals;
  const total = all.length;
  const totalPages = Math.ceil(total / limit);
  const start = (page - 1) * limit;
  return { items: all.slice(start, start + limit), pagination: { page, limit, total, totalPages, hasNext: page < totalPages, hasPrev: page > 1 } };
}

export function getDisputes(page = 1, limit = 20): { items: DemoDispute[]; pagination: { page: number; limit: number; total: number; totalPages: number; hasNext: boolean; hasPrev: boolean } } {
  const all = db().disputes;
  const total = all.length;
  const totalPages = Math.ceil(total / limit);
  const start = (page - 1) * limit;
  return { items: all.slice(start, start + limit), pagination: { page, limit, total, totalPages, hasNext: page < totalPages, hasPrev: page > 1 } };
}

export function getAuditLogs(page = 1, limit = 20): { items: DemoAuditLog[]; pagination: { page: number; limit: number; total: number; totalPages: number; hasNext: boolean; hasPrev: boolean } } {
  const all = db().auditLogs;
  const total = all.length;
  const totalPages = Math.ceil(total / limit);
  const start = (page - 1) * limit;
  return { items: all.slice(start, start + limit), pagination: { page, limit, total, totalPages, hasNext: page < totalPages, hasPrev: page > 1 } };
}

export function getUsers(page = 1, limit = 20): { items: AuthUser[]; pagination: { page: number; limit: number; total: number; totalPages: number; hasNext: boolean; hasPrev: boolean } } {
  const all = db().users;
  const total = all.length;
  const totalPages = Math.ceil(total / limit);
  const start = (page - 1) * limit;
  return { items: all.slice(start, start + limit), pagination: { page, limit, total, totalPages, hasNext: page < totalPages, hasPrev: page > 1 } };
}

export function getDashboardAnalytics(): Record<string, unknown> {
  const d = db();
  return {
    totalProcessed: 1270000,
    platformRevenue: 112000,
    totalTransactions: 173,
    activeUsers: 3,
    activeGroups: 2,
    totalMembers: 24,
    savingsTrend: d.savingsTrend,
    latestCycle: { id: "cycle-6", expectedAmount: 1200000, receivedAmount: 850000, status: "OPEN" },
    activities: d.activities.slice(0, 10),
  };
}

export function getGroupAnalytics(): Record<string, unknown> {
  const d = db();
  return {
    activeUsers: 5,
    savingsTrend: d.savingsTrend,
    latestCycle: { id: "cycle-6", expectedAmount: 1200000, receivedAmount: 850000, status: "OPEN" },
  };
}

export function getPaymentAnalyticsSummary(): Record<string, unknown> {
  return {
    totalContributions: 24,
    paidContributions: 18,
    pendingContributions: 4,
    collectionRate: 75,
    totalExpectedAmount: 1200000,
    totalPaidAmount: 850000,
    outstandingAmount: 350000,
    activeMembers: 5,
  };
}

let _activeUserId: string | null = null;

export function setActiveDemoUser(userId: string | null) {
  _activeUserId = userId;
}

export function getActiveDemoUserId(): string | null {
  return _activeUserId;
}

export function getPaymentAnalytics(groupId?: string): Record<string, unknown> {
  return {
    summary: getPaymentAnalyticsSummary(),
    recentPayments: db().payments.slice(0, 5).map((p) => ({ id: p.id, amount: p.amount, createdAt: p.createdAt })),
    allTime: { labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"], values: [480000, 510000, 495000, 530000, 470000, 200000] },
    monthlyTrend: db().savingsTrend.map((s) => ({ month: s.month, paid: s.contributions, expected: 50000 })),
    memberBreakdown: db().groupMembers.filter((gm) => !groupId || gm.groupId === groupId).map((gm) => ({ name: gm.name, paid: 45000, expected: 50000, status: "PAID" })),
  };
}

export function getRevenueData(): Record<string, unknown> {
  return {
    totalRevenue: 112000,
    monthlyRevenue: 9500,
    growth: 12.5,
    chart: db().revenue,
    revenueBySource: [
      { source: "Transaction Fees", amount: 85000, percentage: 76 },
      { source: "Subscription", amount: 22000, percentage: 20 },
      { source: "Other", amount: 5000, percentage: 4 },
    ],
  };
}

export function getPaymentConfig(): Record<string, unknown> {
  return {
    gateway: "nomba",
    status: "ACTIVE",
    webhookUrl: "https://api.kolo.app/v1/webhooks/nomba",
    feeStructure: { percentage: 0.5, flatFee: 100, minAmount: 50, maxAmount: 5000 },
    lastSync: new Date().toISOString(),
  };
}

export function getSecurityEvents(): Record<string, unknown>[] {
  return [
    { id: "se-1", type: "LOGIN_NEW_DEVICE", severity: "LOW", userId: "demo-member", createdAt: fmtDate(0), ipAddress: "197.210.64.1", location: "Lagos, NG" },
    { id: "se-2", type: "PASSWORD_RESET", severity: "MEDIUM", userId: "demo-group-admin", createdAt: fmtDate(5), ipAddress: "197.210.64.2", location: "Abuja, NG" },
  ];
}

export function getNombaStatus(): Record<string, unknown> {
  return { status: "connected", environment: "sandbox", lastHealthCheck: new Date().toISOString(), bank: "Nomba Bank" };
}

export function getNombaTransactions(): Record<string, unknown>[] {
  return [
    { id: "nom-txn-1", reference: "NOM-REF-001", type: "payment", amount: 50000, status: "successful", createdAt: fmtDate(5) },
    { id: "nom-txn-2", reference: "NOM-REF-002", type: "payment", amount: 50000, status: "successful", createdAt: fmtDate(3) },
  ];
}

export function getKycSubmissions(): Record<string, unknown>[] {
  return [
    { id: "kyc-1", name: "Emeka Okafor", email: "emeka@example.com", phone: "+2348000000004", type: "BVN", status: "PENDING", submittedAt: fmtDate(2) },
    { id: "kyc-2", name: "Tunde Balogun", email: "tunde@example.com", phone: "+2348000000005", type: "NIN", status: "VERIFIED", submittedAt: fmtDate(10) },
  ];
}

export function getQueueStats(): Record<string, unknown> {
  return {
    queues: [
      { name: "email", waiting: 2, processing: 0, completed: 150, failed: 1 },
      { name: "payment", waiting: 0, processing: 0, completed: 89, failed: 2 },
      { name: "sms", waiting: 1, processing: 0, completed: 200, failed: 0 },
    ],
  };
}

export function createPayment(payload: { contributionId: string; amount?: number; paymentMethod?: string; userId: string; groupId: string }): DemoPayment {
  const payment: DemoPayment = {
    id: nextId("demo-pay"),
    userId: payload.userId,
    groupId: payload.groupId || "group-market-traders",
    contributionId: payload.contributionId,
    amount: payload.amount ?? 50000,
    currency: "NGN",
    provider: "nomba",
    providerReference: `NOM-DEMO-${nextId("ref")}`,
    status: "PENDING",
    paymentMethod: payload.paymentMethod || "bank_transfer",
    reference: `KOLO-DEMO-${nextId("ref")}`,
    checkoutUrl: payload.paymentMethod === "card" ? "/demo/checkout" : null,
    virtualAccount: payload.paymentMethod === "card" ? null : {
      accountNumber: "0123456799",
      accountName: "Adaobi Okonkwo - Kolo Savings",
      bankName: "Nomba Bank",
      amount: payload.amount ?? 50000,
      paymentId: nextId("pay"),
    },
    createdAt: new Date().toISOString(),
  };
  const d = db();
  d.payments.push(payment);
  saveDatabase(d);
  return payment;
}

export function completePayment(paymentId: string): DemoPayment | undefined {
  const d = db();
  const p = d.payments.find((pay) => pay.id === paymentId);
  if (!p) return undefined;
  p.status = "SUCCESSFUL";
  const contrib = d.memberContributions.find((mc) => mc.id === p.contributionId);
  if (contrib) {
    contrib.paidAmount += p.amount;
    contrib.status = "PAID";
    contrib.paidAt = new Date().toISOString();
  }
  d.transactions.push({
    id: nextId("txn"), reference: p.reference, amount: p.amount, currency: "NGN",
    type: "CONTRIBUTION_PAYMENT", status: "SUCCESSFUL", userId: p.userId,
    createdAt: new Date().toISOString(), userName: "", cooperativeName: "", provider: "nomba",
  });
  saveDatabase(d);
  return p;
}

export function addNotification(userId: string, title: string, message: string, type = "PAYMENT"): DemoNotification {
  const n: DemoNotification = {
    id: nextId("notif"), userId, type, title, message, channel: "IN_APP", status: "SENT",
    readAt: null, metadata: null, createdAt: new Date().toISOString(), body: message, read: false,
  };
  const d = db();
  d.notifications.push(n);
  saveDatabase(d);
  return n;
}

export function markNotificationRead(id: string) {
  const d = db();
  const n = d.notifications.find((notif) => notif.id === id);
  if (n) { n.status = "READ"; n.readAt = new Date().toISOString(); n.read = true; }
  saveDatabase(d);
}

export function markAllNotificationsRead(userId: string) {
  const d = db();
  d.notifications.filter((n) => n.userId === userId).forEach((n) => { n.status = "READ"; n.readAt = new Date().toISOString(); n.read = true; });
  saveDatabase(d);
}

export function approveWithdrawal(id: string) {
  const d = db();
  const w = d.withdrawals.find((wd) => wd.id === id);
  if (w) w.status = "COMPLETED";
  saveDatabase(d);
}

export function rejectWithdrawal(id: string) {
  const d = db();
  const w = d.withdrawals.find((wd) => wd.id === id);
  if (w) w.status = "CANCELLED";
  saveDatabase(d);
}

export function resolveDispute(id: string) {
  const d = db();
  const dp = d.disputes.find((dis) => dis.id === id);
  if (dp) dp.status = "RESOLVED";
  saveDatabase(d);
}

export function approveKyc(userId: string) {
  const d = db();
  const u = d.users.find((usr) => usr.id === userId);
  if (u) u.status = "ACTIVE";
  saveDatabase(d);
}

export function updateGroupSettings(groupId: string, data: Partial<DemoGroup>) {
  const d = db();
  const g = d.groups.find((grp) => grp.id === groupId);
  if (g) Object.assign(g, data);
  saveDatabase(d);
}

export function addActivity(action: string, actorName: string, target = "") {
  const d = db();
  d.activities.unshift({ id: nextId("act"), action, actorName, target, createdAt: new Date().toISOString() });
  saveDatabase(d);
}

export function resetDemoData() {
  localStorage.removeItem(STORAGE_KEY);
  _db = null;
}
