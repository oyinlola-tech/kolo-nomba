import type { AuthUser } from "../../../types/auth.types";

export interface DemoUserConfig {
  user: AuthUser;
  password: string;
  label: string;
  description: string;
  dashboardPath: string;
  icon: string;
}

export const DEMO_USERS: DemoUserConfig[] = [
  {
    user: {
      id: "demo-super-admin",
      firstName: "Oluwayemi",
      lastName: "Oyinlola",
      email: "admin@kolo.demo",
      phone: "+2348000000001",
      role: "SUPER_ADMIN",
      status: "ACTIVE",
    },
    password: "Demo@1234",
    label: "Platform Admin",
    description: "Full platform access — manage users, groups, transactions, revenue, and security.",
    dashboardPath: "/ajo/admin/dashboard",
    icon: "Shield",
  },
  {
    user: {
      id: "demo-group-admin",
      firstName: "Chioma",
      lastName: "Eze",
      email: "chioma@kolo.demo",
      phone: "+2348000000002",
      role: "GROUP_ADMIN",
      status: "ACTIVE",
    },
    password: "Demo@1234",
    label: "Group Admin",
    description: "Manage members, contributions, payouts, and group settings for your cooperative.",
    dashboardPath: "/group/admin/dashboard",
    icon: "Building2",
  },
  {
    user: {
      id: "demo-member",
      firstName: "Adaobi",
      lastName: "Okonkwo",
      email: "ada@kolo.demo",
      phone: "+2348000000003",
      role: "MEMBER",
      status: "ACTIVE",
    },
    password: "Demo@1234",
    label: "Member",
    description: "Track contributions, make payments, view history, and manage your profile.",
    dashboardPath: "/member/home",
    icon: "Users",
  },
];

export interface DemoOTPCode {
  code: string;
  label: string;
  description: string;
  result: "success" | "wrong" | "expired";
  errorMessage?: string;
}

export const DEMO_OTP_CODES: DemoOTPCode[] = [
  {
    code: "000000",
    label: "Valid Login",
    description: "Enter this to log in successfully",
    result: "success",
  },
  {
    code: "111111",
    label: "Wrong Code",
    description: "Enter this to see an invalid OTP error",
    result: "wrong",
    errorMessage: "Invalid verification code. Please check and try again.",
  },
  {
    code: "222222",
    label: "Expired Code",
    description: "Enter this to see a timeout error",
    result: "expired",
    errorMessage: "This verification code has expired. Request a new one.",
  },
];
