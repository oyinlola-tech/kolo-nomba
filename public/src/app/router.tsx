import { createBrowserRouter, Navigate } from "react-router-dom";
import { ProtectedRoute } from "../components/shared/ProtectedRoute";
import {
  LandingPage, AboutPage, ContactPage, PricingPage,
  SecurityPage, HelpPage, TermsPage, PrivacyPage, HowItWorksPage,
} from "../features/landing";
import { LoginPage, RegisterPage, VerifyOTPPage } from "../features/auth";
import { SuperAdminApp } from "../features/admin";
import {
  SADashboard, SAUsers, SAGroups, SATransactions, SAPayments,
  SARevenue, SAWithdrawals, SADisputes, SAVerification,
  SANotifications, SASecurity, SASettings,
} from "../features/admin";
import { GroupAdminApp } from "../features/group";
import {
  GADashboard, GAMembers, GAContributions, GATransactions,
  GAPayouts, GAReports, GANotifications, GASettings, GACreateGroup,
} from "../features/group";
import { MemberApp } from "../features/member";
import { MHome, MGroups, MPay, MPaySuccess, MHistory, MNotifications, MProfile, MGroupDetail } from "../features/member";
import type { UserRole } from "../types/auth.types";

export const router = createBrowserRouter([
  { path: "/", element: <LandingPage /> },
  { path: "/about", element: <AboutPage /> },
  { path: "/contact", element: <ContactPage /> },
  { path: "/pricing", element: <PricingPage /> },
  { path: "/security", element: <SecurityPage /> },
  { path: "/help", element: <HelpPage /> },
  { path: "/terms", element: <TermsPage /> },
  { path: "/privacy", element: <PrivacyPage /> },
  { path: "/how-it-works", element: <HowItWorksPage /> },

  { path: "/login", element: <LoginPage /> },
  { path: "/register", element: <RegisterPage /> },
  { path: "/register/cooperative", element: <RegisterPage /> },
  { path: "/verify-otp", element: <VerifyOTPPage /> },
  {
    path: "/ajo/admin",
    element: <ProtectedRoute allowedRoles={["SUPER_ADMIN"] as UserRole[]}><SuperAdminApp /></ProtectedRoute>,
    children: [
      { index: true, element: <Navigate to="dashboard" replace /> },
      { path: "dashboard", element: <SADashboard /> },
      { path: "users", element: <SAUsers /> },
      { path: "groups", element: <SAGroups /> },
      { path: "transactions", element: <SATransactions /> },
      { path: "payments", element: <SAPayments /> },
      { path: "revenue", element: <SARevenue /> },
      { path: "withdrawals", element: <SAWithdrawals /> },
      { path: "disputes", element: <SADisputes /> },
      { path: "verification", element: <SAVerification /> },
      { path: "notifications", element: <SANotifications /> },
      { path: "security", element: <SASecurity /> },
      { path: "settings", element: <SASettings /> },
    ],
  },
  {
    path: "/group/admin",
    element: <ProtectedRoute allowedRoles={["GROUP_ADMIN", "GROUP_OWNER"] as UserRole[]}><GroupAdminApp /></ProtectedRoute>,
    children: [
      { index: true, element: <Navigate to="dashboard" replace /> },
      { path: "dashboard", element: <GADashboard /> },
      { path: "members", element: <GAMembers /> },
      { path: "contributions", element: <GAContributions /> },
      { path: "transactions", element: <GATransactions /> },
      { path: "payouts", element: <GAPayouts /> },
      { path: "reports", element: <GAReports /> },
      { path: "notifications", element: <GANotifications /> },
      { path: "settings", element: <GASettings /> },
      { path: "create-group", element: <GACreateGroup /> },
    ],
  },
  {
    path: "/member",
    element: <ProtectedRoute allowedRoles={["MEMBER", "GROUP_ADMIN", "SUPER_ADMIN"] as UserRole[]}><MemberApp /></ProtectedRoute>,
    children: [
      { index: true, element: <Navigate to="home" replace /> },
      { path: "home", element: <MHome /> },
      { path: "groups", element: <MGroups /> },
      { path: "group/:id", element: <MGroupDetail /> },
      { path: "pay", element: <MPay /> },
      { path: "pay-success", element: <MPaySuccess /> },
      { path: "history", element: <MHistory /> },
      { path: "notifications", element: <MNotifications /> },
      { path: "profile", element: <MProfile /> },
    ],
  },

  { path: "/dashboard", element: <Navigate to="/member/home" replace /> },
  { path: "/contributions", element: <Navigate to="/member/history" replace /> },
  { path: "/payments", element: <Navigate to="/member/pay" replace /> },
  { path: "/transactions", element: <Navigate to="/member/history" replace /> },

  { path: "*", element: <Navigate to="/" replace /> },
]);
