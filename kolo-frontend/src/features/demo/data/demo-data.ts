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
    description: "Successful verification",
    result: "success",
  },
  {
    code: "111111",
    label: "Wrong Code",
    description: "Invalid OTP error",
    result: "wrong",
    errorMessage: "Invalid verification code. Please check and try again.",
  },
  {
    code: "222222",
    label: "Expired Code",
    description: "Expired OTP error",
    result: "expired",
    errorMessage: "This verification code has expired. Request a new one.",
  },
];

export interface DemoPaymentCard {
  id: string;
  number: string;
  network: string;
  cvv: string;
  expiry: string;
  holder: string;
  result: "success" | "wrong" | "expired";
  description: string;
  otpToUse: string;
  gradient: string;
}

export const DEMO_PAYMENT_CARDS: DemoPaymentCard[] = [
  {
    id: "card-success",
    number: "4084 0812 3456 7890",
    network: "Verve",
    cvv: "123",
    expiry: "12/27",
    holder: "Adaobi Okonkwo",
    result: "success",
    description: "Use OTP 000000 — payment succeeds",
    otpToUse: "000000",
    gradient: "from-emerald-700 to-emerald-950",
  },
  {
    id: "card-wrong",
    number: "4084 0812 3456 7891",
    network: "Verve",
    cvv: "456",
    expiry: "12/27",
    holder: "Adaobi Okonkwo",
    result: "wrong",
    description: "Use OTP 111111 — wrong-code error",
    otpToUse: "111111",
    gradient: "from-rose-700 to-rose-950",
  },
  {
    id: "card-expired",
    number: "4084 0812 3456 7892",
    network: "Verve",
    cvv: "789",
    expiry: "12/27",
    holder: "Adaobi Okonkwo",
    result: "expired",
    description: "Use OTP 222222 — expired-code error",
    otpToUse: "222222",
    gradient: "from-amber-700 to-amber-950",
  },
];
