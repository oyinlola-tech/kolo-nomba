import type { AxiosRequestConfig, AxiosResponse } from "axios";
import * as store from "../store/demo-store";

export let isDemoMode = false;

export function enableDemoMode() { isDemoMode = true; }
export function disableDemoMode() { isDemoMode = false; }

function parseUrl(url: string): { path: string; params: Record<string, string> } {
  const idx = url.indexOf("?");
  const path = idx >= 0 ? url.substring(0, idx) : url;
  const params: Record<string, string> = {};
  if (idx >= 0) {
    url.substring(idx + 1).split("&").forEach((p) => {
      const [k, v] = p.split("=");
      if (k) params[decodeURIComponent(k)] = decodeURIComponent(v ?? "");
    });
  }
  return { path, params };
}

function pageParam(params: Record<string, string>): number {
  return parseInt(params.page || "1", 10);
}
function limitParam(params: Record<string, string>): number {
  return parseInt(params.limit || "20", 10);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function r(data: unknown, status = 200): AxiosResponse {
  return { data: { data }, status, statusText: "OK", headers: { "content-type": "application/json" }, config: {} as any };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function pr(items: unknown[], pagination: Record<string, unknown>): AxiosResponse {
  return r({ items, pagination });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function e(message: string, status = 400): AxiosResponse {
  return { data: { error: { message } }, status, statusText: status === 401 ? "Unauthorized" : "Bad Request", headers: {}, config: {} as any };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function makeGroupAdmin(d: Record<string, any>): Record<string, unknown> {
  return {
    id: d.id, name: d.name, description: d.description, category: d.category, location: d.location,
    contributionAmount: d.contributionAmount, currency: d.currency, frequency: d.frequency,
    collectionDay: d.collectionDay, memberCount: d.memberCount, status: d.status,
    createdBy: d.createdBy, createdAt: d.createdAt, adminName: d.adminName, savingsBalance: d.savingsBalance,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function makeMemberUser(u: Record<string, any>): Record<string, unknown> {
  return { id: u.id, firstName: u.firstName, lastName: u.lastName, name: `${u.firstName} ${u.lastName}`, email: u.email, phone: u.phone, role: u.role, status: u.status, createdAt: u.createdAt ?? new Date().toISOString() };
}

export function handleDemoRequest(config: AxiosRequestConfig): AxiosResponse | null {
  const method = (config.method || "get").toLowerCase();
  const url = typeof config.url === "string" ? config.url : "";
  const base = "/api/v1";
  const relative = url.startsWith(base) ? url.substring(base.length) : url;
  const { path, params } = parseUrl(relative);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let body: Record<string, any> = {};
  try {
    if (config.data) body = typeof config.data === "string" ? JSON.parse(config.data) : config.data;
  } catch { /* ignore */ }

  const page = pageParam(params);
  const limit = limitParam(params);

  // Auth
  if (path === "/auth/login" && method === "post") {
    const user = store.getUserByEmail(body.email);
    if (!user || body.password !== "Demo@1234") return e("Invalid email or password", 401);
    return r({ challengeId: user.id, email: user.email, type: "login_challenge" });
  }

  if (path === "/auth/verify-login-otp" && method === "post") {
    if (body.code === "000000") {
      const user = store.getUser(body.challengeId);
      if (user) return r({ user, accessToken: `demo-token-${user.id}`, role: user.role });
    }
    if (body.code === "222222") return e("This verification code has expired. Request a new one.");
    return e("Invalid verification code. Please check and try again.");
  }

  if (path === "/auth/verify-otp" && method === "post") {
    if (body.code === "000000") {
      const user = store.getUser(body.userId);
      if (user) return r({ user, accessToken: `demo-token-${user.id}`, role: user.role });
    }
    if (body.code === "222222") return e("This verification code has expired. Request a new one.");
    return e("Invalid verification code");
  }

  if (path === "/auth/resend-otp" && method === "post") return r({ message: "OTP resent" });
  if (path === "/auth/refresh" && method === "post") return r({ accessToken: "demo-token-refreshed" });
  if (path === "/auth/logout" && method === "post") return r({ message: "Logged out" });
  if (path === "/auth/forgot-password" && method === "post") return r({ message: "Reset email sent" });
  if (path === "/auth/reset-password" && method === "post") return r({ message: "Password reset successful" });

  if (path === "/auth/me" && method === "get") {
    const userId = store.getActiveDemoUserId() || "demo-super-admin";
    const user = store.getUser(userId);
    if (user) return r(user);
    return e("Not authenticated", 401);
  }
  if (path === "/auth/me" && method === "patch") return r({ ...body, id: "demo-super-admin" });

  // Registration
  if (path === "/auth/register" && method === "post") {
    return r({ userId: `demo-user-${Date.now()}`, message: "Registration successful. Please check your email for OTP." });
  }

  // Groups
  if (path === "/groups" && method === "get") {
    const g = store.getGroups(page, limit);
    return pr(g.items.map((grp) => makeGroupAdmin(grp)), g.pagination);
  }
  if (path === "/groups" && method === "post") {
    const newGroup = {
      id: `group-${Date.now()}`, name: body.name || "New Cooperative",
      description: body.description || "", category: body.category || "Community",
      location: body.location || "Lagos", contributionAmount: body.contributionAmount || 50000,
      currency: "NGN", frequency: body.frequency || "MONTHLY", collectionDay: "Every 1st",
      memberCount: 1, status: "ACTIVE", createdBy: "demo-group-admin",
      createdAt: new Date().toISOString(), adminName: "Chioma Eze", savingsBalance: 0,
    };
    return r(makeGroupAdmin(newGroup));
  }

  const groupMatch = path.match(/^\/groups\/([^/]+)$/);
  if (groupMatch && method === "get") {
    const g = store.getGroupById(groupMatch[1]);
    if (g) return r(makeGroupAdmin(g));
  }

  // Group settings
  const settingsMatch = path.match(/^\/groups\/([^/]+)\/settings$/);
  if (settingsMatch) {
    if (method === "get") {
      const g = store.getGroupById(settingsMatch[1]);
      if (g) return r({ name: g.name, description: g.description, category: g.category, location: g.location, contributionAmount: g.contributionAmount, currency: g.currency, frequency: g.frequency, collectionDay: g.collectionDay });
    }
    if (method === "put" || method === "patch") {
      store.updateGroupSettings(settingsMatch[1], body);
      return r({ message: "Settings updated" });
    }
  }

  // Group members
  const membersMatch = path.match(/^\/groups\/([^/]+)\/members$/);
  if (membersMatch && method === "get") {
    const members = store.getGroupMembers(membersMatch[1]);
    return r(members.map((m) => ({ id: m.id, userId: m.userId, firstName: m.firstName, lastName: m.lastName, name: m.name, email: m.email, role: m.role, status: m.status, joinedAt: m.joinedAt })));
  }
  if (membersMatch && method === "post") {
    const member = store.addGroupMember(membersMatch[1], {
      firstName: body.firstName || "New",
      lastName: body.lastName || "Member",
      email: body.email || "guest@example.com",
    });
    const id = member?.id ?? `inv-${Date.now()}`;
    store.addActivity("Member invited", member?.name ?? "New Member", membersMatch[1]);
    return r({ id, message: "Member invited" });
  }

  // Join group
  const joinMatch = path.match(/^\/groups\/([^/]+)\/join$/);
  if (joinMatch && method === "post") {
    const userId = store.getActiveDemoUserId();
    if (!userId) return e("Not authenticated", 401);
    const member = store.joinGroup(userId, joinMatch[1]);
    if (!member) return e("Could not join group", 400);
    store.addActivity("Member joined group", member.name, joinMatch[1]);
    return r({ message: "Joined group", member });
  }

  // Available groups (for member browsing)
  if (path === "/groups/available" && method === "get") {
    const userId = store.getActiveDemoUserId();
    if (!userId) return r([]);
    return r(store.getAvailableGroups(userId));
  }

  // Group analytics
  const analyticsMatch = path.match(/^\/groups\/([^/]+)\/analytics$/);
  if (analyticsMatch && method === "get") return r(store.getGroupAnalytics());

  // Group contributions
  if (path.match(/^\/groups\/([^/]+)\/contributions$/) && method === "get") {
    const c = store.getContributions(page, limit);
    return pr(c.items.map((mc) => ({ id: mc.id, memberName: mc.memberName, amount: mc.expectedAmount, paidAmount: mc.paidAmount, status: mc.status, paidAt: mc.paidAt, expectedAmount: mc.expectedAmount })), c.pagination);
  }

  // Group payouts
  const groupPayoutMatch = path.match(/^\/groups\/([^/]+)\/payouts$/);
  if (groupPayoutMatch && method === "post") {
    store.addActivity("Payout requested", "Chioma Eze", `₦${(body.amount || 500000).toLocaleString()}`);
    return r({ id: `payout-${Date.now()}`, groupId: groupPayoutMatch[1], requestedBy: "demo-group-admin", amount: body.amount || 500000, currency: "NGN", type: "MANUAL", status: "PENDING", reason: body.reason || "Payout request", createdAt: new Date().toISOString() });
  }
  if (groupPayoutMatch && method === "get") {
    const p = store.getPayouts(page, limit);
    return pr(p.items, p.pagination);
  }

  // Group contribution plans
  if (path.match(/^\/groups\/([^/]+)\/contribution-plans$/) && method === "get") {
    const plans = store.getContributionPlans();
    return r(plans);
  }

  // Contributions
  if (path === "/contributions/my" && method === "get") {
    const userId = store.getActiveDemoUserId();
    const c = userId ? store.getContributions(page, limit, userId) : store.getContributions(page, limit);
    return pr(c.items.map((mc) => ({ id: mc.id, cycleId: mc.cycleId, groupMemberId: mc.groupMemberId, expectedAmount: mc.expectedAmount, paidAmount: mc.paidAmount, amount: mc.expectedAmount, status: mc.status, paidAt: mc.paidAt, memberName: mc.memberName })), c.pagination);
  }

  const contribMatch = path.match(/^\/contributions\/([^/]+)$/);
  if (contribMatch && method === "get") {
    const c = store.getContributionById(contribMatch[1]);
    if (c) return r({ id: c.id, expectedAmount: c.expectedAmount, amount: c.expectedAmount, status: c.status, paidAt: c.paidAt, paidAmount: c.paidAmount, memberName: c.memberName });
  }

  // Payments
  if (path === "/payments/history" && method === "get") {
    const p = store.getPayments(page, limit);
    return pr(p.items.map((pay) => ({ id: pay.id, userId: pay.userId, groupId: pay.groupId, amount: pay.amount, currency: pay.currency, provider: pay.provider, status: pay.status, createdAt: pay.createdAt })), p.pagination);
  }

  if (path === "/payments/initiate" && method === "post") {
    const userId = body.userId || "demo-member";
    const groupId = body.groupId || "group-market-traders";
    const payment = store.createPayment({ contributionId: body.contributionId, amount: body.amount, paymentMethod: body.paymentMethod || "bank_transfer", userId, groupId });
    // Demo: redirect to internal checkout simulation for card
    if (payment.paymentMethod === "card") {
      return r({ paymentId: payment.id, reference: payment.reference, checkoutUrl: `/demo/checkout?paymentId=${payment.id}&reference=${payment.reference}&amount=${body.amount || 50000}&group=Market+Traders+Ajo`, virtualAccount: null });
    }
    return r({ paymentId: payment.id, reference: payment.reference, checkoutUrl: null, virtualAccount: payment.virtualAccount });
  }

  const paymentMatch = path.match(/^\/payments?\/([^/]+)$/);
  if (paymentMatch && method === "get") {
    const p = store.getPaymentById(paymentMatch[1]);
    if (p) return r({ id: p.id, status: p.status, amount: p.amount, createdAt: p.createdAt });
  }

  // Transactions
  if (path === "/transactions" && method === "get") {
    const t = store.getTransactions(page, limit);
    return pr(t.items.map((tx) => ({ id: tx.id, reference: tx.reference, amount: tx.amount, currency: tx.currency, type: tx.type, status: tx.status, userId: tx.userId, createdAt: tx.createdAt, userName: tx.userName, cooperativeName: tx.cooperativeName, provider: tx.provider })), t.pagination);
  }

  // Payouts
  if (path === "/payouts" && method === "get") {
    const p = store.getPayouts(page, limit);
    return pr(p.items, p.pagination);
  }

  const payoutAction = path.match(/^\/payouts\/([^/]+)\/(approve|reject|cancel|process|retry)$/);
  if (payoutAction && method === "post") {
    store.addActivity(`Payout ${payoutAction[2]}d`, "Chioma Eze", "");
    return r({ message: `Payout ${payoutAction[2]}d` });
  }

  // Notifications
  if (path === "/notifications" && method === "get") {
    const n = store.getNotifications(page, limit);
    return pr(n.items.map((notif) => ({ id: notif.id, userId: notif.userId, type: notif.type, title: notif.title, message: notif.message, channel: notif.channel, status: notif.status, readAt: notif.readAt, metadata: notif.metadata, createdAt: notif.createdAt, body: notif.body, read: notif.read })), n.pagination);
  }
  if (path === "/notifications/unread" && method === "get") return r(store.getNotifications(1, 100).items.filter((n) => n.status !== "READ").length);

  const notifReadMatch = path.match(/^\/notifications\/([^/]+)\/read$/);
  if (notifReadMatch && method === "patch") { store.markNotificationRead(notifReadMatch[1]); return r({ message: "Marked read" }); }

  if (path === "/notifications/read-all" && method === "patch") { store.markAllNotificationsRead("demo-member"); return r({ message: "All read" }); }

  if (path === "/notifications/send-reminder" && method === "post") {
    const memberIds = body.memberIds ?? [];
    store.addActivity("Reminder sent", "Group Admin", `${memberIds.length} member(s)`);
    return r({ message: `Reminder sent to ${memberIds.length} member(s)` });
  }
  if (path === "/notifications/preferences" && method === "get") return r({ smsEnabled: true, emailEnabled: true, pushEnabled: true, whatsappEnabled: false, securityAlerts: true, paymentAlerts: true, marketingMessages: false });
  if (path === "/notifications/preferences" && method === "patch") return r({ message: "Preferences updated" });

  // Virtual accounts
  if (path === "/virtual-accounts/my" && method === "get") return r({ id: "va-demo", accountNumber: "0123456790", accountName: "Adaobi Okonkwo - Kolo Savings", bankName: "Nomba Bank", providerReference: "NOM-VA-DEMO", status: "ACTIVE", createdAt: new Date().toISOString() });
  if (path === "/virtual-accounts" && method === "post") return r({ id: `va-${Date.now()}`, accountNumber: "0123456799", accountName: "Demo User - Kolo Savings", bankName: "Nomba Bank", providerReference: "NOM-VA-NEW", status: "ACTIVE", createdAt: new Date().toISOString() });

  // Withdrawals
  if (path === "/withdrawals" && method === "get") {
    const w = store.getWithdrawals(page, limit);
    return pr(w.items, w.pagination);
  }
  if (path === "/withdrawals" && method === "post") {
    store.addActivity("Withdrawal requested", "Adaobi Okonkwo", `₦${(body.amount || 50000).toLocaleString()}`);
    return r({ id: `wd-${Date.now()}`, userId: "demo-member", walletId: "wallet-demo", amount: body.amount || 50000, destination: body.destination || "0123456789", destinationBank: body.destinationBank || "GTBank", accountName: body.accountName || "Adaobi Okonkwo", status: "PENDING", createdAt: new Date().toISOString() });
  }
  const withdrawalAction = path.match(/^\/withdrawals\/([^/]+)\/(approve|reject)$/);
  if (withdrawalAction && method === "post") {
    if (withdrawalAction[2] === "approve") store.approveWithdrawal(withdrawalAction[1]);
    else store.rejectWithdrawal(withdrawalAction[1]);
    store.addActivity(`Withdrawal ${withdrawalAction[2]}d`, "Oluwayemi Oyinlola", "");
    return r({ message: `Withdrawal ${withdrawalAction[2]}d` });
  }

  // Admin
  if (path === "/admin/dashboard" && method === "get") return r(store.getDashboardAnalytics());
  if (path === "/admin/users" && method === "get") {
    const u = store.getUsers(page, limit);
    return pr(u.items.map((usr) => makeMemberUser(usr)), u.pagination);
  }
  if (path === "/admin/groups" && method === "get") {
    const g = store.getGroups(page, limit);
    return pr(g.items.map((grp) => makeGroupAdmin(grp)), g.pagination);
  }
  if (path === "/admin/transactions" && method === "get") {
    const t = store.getTransactions(page, limit);
    return pr(t.items.map((tx) => ({ id: tx.id, reference: tx.reference, amount: tx.amount, currency: tx.currency, type: tx.type, status: tx.status, userId: tx.userId, createdAt: tx.createdAt, userName: tx.userName, cooperativeName: tx.cooperativeName, provider: tx.provider })), t.pagination);
  }
  if (path === "/admin/revenue" && method === "get") return r(store.getRevenueData());
  if (path === "/admin/withdrawals" && method === "get") {
    const w = store.getWithdrawals(page, limit);
    return pr(w.items, w.pagination);
  }
  if (path === "/admin/security/events" && method === "get") return r(store.getSecurityEvents());
  if (path === "/admin/settings/notifications" && method === "get") return r({ smsEnabled: true, emailEnabled: true, pushEnabled: true, whatsappEnabled: false, securityAlerts: true, paymentAlerts: true, marketingMessages: false });
  if (path === "/admin/settings/notifications" && method === "patch") return r({ message: "Settings updated" });
  if (path === "/admin/payment-config" && method === "get") return r(store.getPaymentConfig());
  if (path === "/admin/payment-config" && method === "patch") return r({ message: "Payment config updated", ...body });
  if (path === "/admin/disputes" && method === "get") {
    const d = store.getDisputes(page, limit);
    return pr(d.items, d.pagination);
  }
  const disputeMatch = path.match(/^\/admin\/disputes\/([^/]+)\/resolve$/);
  if (disputeMatch && method === "post") { store.resolveDispute(disputeMatch[1]); return r({ message: "Resolved" }); }
  if (path === "/admin/audit-logs" && method === "get") {
    const a = store.getAuditLogs(page, limit);
    return pr(a.items, a.pagination);
  }
  if (path === "/admin/kyc-submissions" && method === "get") return r(store.getKycSubmissions());
  if (path === "/admin/nomba/status" && method === "get") return r(store.getNombaStatus());
  if (path === "/admin/nomba/transactions" && method === "get") return r(store.getNombaTransactions());
  if (path === "/admin/jobs" && method === "get") return r(store.getQueueStats());
  if (path === "/admin/jobs/queue-stats" && method === "get") return r(store.getQueueStats());

  // Admin user status/verify
  const adminUserMatch = path.match(/^\/admin\/users\/([^/]+)\/(status|verify)$/);
  if (adminUserMatch && method === "patch") {
    const rawId = adminUserMatch[1];
    let targetUserId = rawId;
    const sub = store.getKycSubmissionById(rawId);
    if (sub && sub.userId) targetUserId = sub.userId as string;
    if (adminUserMatch[2] === "verify") store.approveKyc(targetUserId);
    else store.rejectKyc(targetUserId);
    return r({ message: "User updated" });
  }

  // Analytics
  if (path.match(/^\/analytics\/groups\/([^/]+)\/payments$/) && method === "get") return r(store.getPaymentAnalytics());
  if (path === "/analytics/mine/payments" && method === "get") return r(store.getPaymentAnalytics());

  // Contact
  if (path === "/contact" && method === "post") return r({ message: "Message sent" });

  // Receipt — per-transaction content
  const receiptMatch = path.match(/^\/payments\/receipt\/(.+)$/);
  if (receiptMatch) {
    const refOrId = receiptMatch[1];
    let payment = store.getPayments(1, 200).items.find((p) => p.reference === refOrId || p.id === refOrId || p.contributionId === refOrId);
    if (!payment) {
      const contrib = store.getContributionById(refOrId);
      if (contrib) payment = store.getPayments(1, 200).items.find((p) => p.contributionId === contrib.id);
    }
    const payerName = payment?.virtualAccount?.accountName || "Kolo Member";
    const bankName = payment?.virtualAccount?.bankName || "Nomba Bank";
    const receiptText = [
      "========================================",
      "         KOLO PAYMENT RECEIPT",
      "========================================",
      "",
      `Reference:    ${payment?.reference || refOrId}`,
      `Date:         ${payment?.createdAt ? new Date(payment.createdAt).toLocaleDateString("en-NG", { day: "numeric", month: "long", year: "numeric" }) : new Date().toLocaleDateString("en-NG", { day: "numeric", month: "long", year: "numeric" })}`,
      `Payer:        ${payerName}`,
      `Amount:       ₦${(payment?.amount || 0).toLocaleString()}`,
      `Status:       ${payment?.status === "SUCCESSFUL" ? "PAID" : payment?.status || "COMPLETED"}`,
      `Bank:         ${bankName}`,
      `Provider:     Nomba`,
      "",
      "----------------------------------------",
      "       Thank you for saving with Kolo!",
      "----------------------------------------",
    ].join("\n");
    return { data: new Blob([receiptText], { type: "application/pdf" }), status: 200, statusText: "OK", headers: { "content-type": "application/pdf" }, config: {} as any };
  }

  // Unrecognized
  return null;
}
