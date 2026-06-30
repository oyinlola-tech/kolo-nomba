import { lazy, Suspense } from "react";
import { createBrowserRouter, Navigate } from "react-router";
import { ProtectedRoute } from "../components/shared/ProtectedRoute";
import { LandingPage, HowItWorksPage } from "../features/landing";
import { LoginPage } from "../features/auth";
import type { UserRole } from "../types/auth.types";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function LazyLoad(importFn: () => Promise<{ default: React.ComponentType<any> }>) {
  const Component = lazy(importFn);
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>}>
      <Component />
    </Suspense>
  );
}

export const router = createBrowserRouter([
  { path: "/", element: <LandingPage /> },
  { path: "/about", element: LazyLoad(() => import("../features/landing/pages/about.page").then(m => ({ default: m.AboutPage }))) },
  { path: "/contact", element: LazyLoad(() => import("../features/landing/pages/contact.page").then(m => ({ default: m.ContactPage }))) },
  { path: "/pricing", element: LazyLoad(() => import("../features/landing/pages/pricing.page").then(m => ({ default: m.PricingPage }))) },
  { path: "/security", element: LazyLoad(() => import("../features/landing/pages/security.page").then(m => ({ default: m.SecurityPage }))) },
  { path: "/help", element: LazyLoad(() => import("../features/landing/pages/help.page").then(m => ({ default: m.HelpPage }))) },
  { path: "/terms", element: LazyLoad(() => import("../features/landing/pages/terms.page").then(m => ({ default: m.TermsPage }))) },
  { path: "/privacy", element: LazyLoad(() => import("../features/landing/pages/privacy.page").then(m => ({ default: m.PrivacyPage }))) },
  { path: "/how-it-works", element: <HowItWorksPage /> },

  { path: "/login", element: <LoginPage /> },
  { path: "/register", element: LazyLoad(() => import("../features/auth/pages/register.page").then(m => ({ default: m.RegisterPage }))) },
  { path: "/register/cooperative", element: <Navigate to="/register" replace /> },
  { path: "/forgot-password", element: LazyLoad(() => import("../features/auth/pages/forgot-password.page").then(m => ({ default: m.ForgotPasswordPage }))) },
  { path: "/reset-password", element: LazyLoad(() => import("../features/auth/pages/reset-password.page").then(m => ({ default: m.ResetPasswordPage }))) },
  { path: "/verify-otp", element: LazyLoad(() => import("../features/auth/pages/verify-otp.page").then(m => ({ default: m.VerifyOTPPage }))) },
  {
    path: "/ajo/admin",
    element: <ProtectedRoute allowedRoles={["SUPER_ADMIN"] as UserRole[]}>{LazyLoad(() => import("../features/admin/pages/super-admin.page").then(m => ({ default: m.SuperAdminApp })))}</ProtectedRoute>,
    children: [
      { index: true, element: <Navigate to="dashboard" replace /> },
      { path: "dashboard", element: LazyLoad(() => import("../features/admin/pages/sa-dashboard.page").then(m => ({ default: m.SADashboard }))) },
      { path: "users", element: LazyLoad(() => import("../features/admin/pages/sa-users.page").then(m => ({ default: m.SAUsers }))) },
      { path: "groups", element: LazyLoad(() => import("../features/admin/pages/sa-groups.page").then(m => ({ default: m.SAGroups }))) },
      { path: "transactions", element: LazyLoad(() => import("../features/admin/pages/sa-transactions.page").then(m => ({ default: m.SATransactions }))) },
      { path: "payments", element: LazyLoad(() => import("../features/admin/pages/sa-payments.page").then(m => ({ default: m.SAPayments }))) },
      { path: "revenue", element: LazyLoad(() => import("../features/admin/pages/sa-revenue.page").then(m => ({ default: m.SARevenue }))) },
      { path: "withdrawals", element: LazyLoad(() => import("../features/admin/pages/sa-withdrawals.page").then(m => ({ default: m.SAWithdrawals }))) },
      { path: "disputes", element: LazyLoad(() => import("../features/admin/pages/sa-disputes.page").then(m => ({ default: m.SADisputes }))) },
      { path: "verification", element: LazyLoad(() => import("../features/admin/pages/sa-verification.page").then(m => ({ default: m.SAVerification }))) },
      { path: "notifications", element: LazyLoad(() => import("../features/admin/pages/sa-notifications.page").then(m => ({ default: m.SANotifications }))) },
      { path: "security", element: LazyLoad(() => import("../features/admin/pages/sa-security.page").then(m => ({ default: m.SASecurity }))) },
      { path: "settings", element: LazyLoad(() => import("../features/admin/pages/sa-settings.page").then(m => ({ default: m.SASettings }))) },
      { path: "audit-logs", element: LazyLoad(() => import("../features/admin/pages/sa-audit-logs.page").then(m => ({ default: m.SAAuditLogs }))) },
    ],
  },
  {
    path: "/group/admin",
    element: <ProtectedRoute allowedRoles={["GROUP_ADMIN", "GROUP_OWNER"] as UserRole[]}>{LazyLoad(() => import("../features/group/pages/group-admin.page").then(m => ({ default: m.GroupAdminApp })))}</ProtectedRoute>,
    children: [
      { index: true, element: <Navigate to="dashboard" replace /> },
      { path: "dashboard", element: LazyLoad(() => import("../features/group/pages/ga-dashboard.page").then(m => ({ default: m.GADashboard }))) },
      { path: "members", element: LazyLoad(() => import("../features/group/pages/ga-members.page").then(m => ({ default: m.GAMembers }))) },
      { path: "contributions", element: LazyLoad(() => import("../features/group/pages/ga-contributions.page").then(m => ({ default: m.GAContributions }))) },
      { path: "transactions", element: LazyLoad(() => import("../features/group/pages/ga-transactions.page").then(m => ({ default: m.GATransactions }))) },
      { path: "payouts", element: LazyLoad(() => import("../features/group/pages/ga-payouts.page").then(m => ({ default: m.GAPayouts }))) },
      { path: "reports", element: LazyLoad(() => import("../features/group/pages/ga-reports.page").then(m => ({ default: m.GAReports }))) },
      { path: "payment-analytics", element: LazyLoad(() => import("../features/group/pages/ga-payment-analytics.page").then(m => ({ default: m.GAPaymentAnalytics }))) },
      { path: "notifications", element: LazyLoad(() => import("../features/group/pages/ga-notifications.page").then(m => ({ default: m.GANotifications }))) },
      { path: "settings", element: LazyLoad(() => import("../features/group/pages/ga-settings.page").then(m => ({ default: m.GASettings }))) },
      { path: "create-group", element: LazyLoad(() => import("../features/group/pages/ga-create-group.page").then(m => ({ default: m.GACreateGroup }))) },
    ],
  },
  {
    path: "/member",
    element: <ProtectedRoute allowedRoles={["MEMBER", "GROUP_ADMIN", "SUPER_ADMIN"] as UserRole[]}>{LazyLoad(() => import("../features/member/pages/member.page").then(m => ({ default: m.MemberApp })))}</ProtectedRoute>,
    children: [
      { index: true, element: <Navigate to="home" replace /> },
      { path: "home", element: LazyLoad(() => import("../features/member/pages/m-home.page").then(m => ({ default: m.MHome }))) },
      { path: "groups", element: LazyLoad(() => import("../features/member/pages/m-groups.page").then(m => ({ default: m.MGroups }))) },
      { path: "group/:id", element: LazyLoad(() => import("../features/member/pages/m-group-detail.page").then(m => ({ default: m.MGroupDetail }))) },
      { path: "pay", element: LazyLoad(() => import("../features/member/pages/m-pay.page").then(m => ({ default: m.MPay }))) },
      { path: "pay-success", element: LazyLoad(() => import("../features/member/pages/m-pay-success.page").then(m => ({ default: m.MPaySuccess }))) },
      { path: "history", element: LazyLoad(() => import("../features/member/pages/m-history.page").then(m => ({ default: m.MHistory }))) },
      { path: "notifications", element: LazyLoad(() => import("../features/member/pages/m-notifications.page").then(m => ({ default: m.MNotifications }))) },
      { path: "profile", element: LazyLoad(() => import("../features/member/pages/m-profile.page").then(m => ({ default: m.MProfile }))) },
      { path: "group/:id/dispute", element: LazyLoad(() => import("../features/member/pages/m-dispute.page").then(m => ({ default: m.MDispute }))) },
      { path: "group/:id/withdraw", element: LazyLoad(() => import("../features/member/pages/m-withdraw.page").then(m => ({ default: m.MWithdraw }))) },
    ],
  },

  { path: "/dashboard", element: <Navigate to="/member/home" replace /> },
  { path: "/contributions", element: <Navigate to="/member/history" replace /> },
  { path: "/payments", element: <Navigate to="/member/pay" replace /> },
  { path: "/transactions", element: <Navigate to="/member/history" replace /> },

  { path: "*", element: LazyLoad(() => import("../features/landing/pages/not-found.page").then(m => ({ default: m.NotFoundPage }))) },
]);
