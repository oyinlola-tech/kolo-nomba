export interface CreatePayoutDto {
  amount: number;
  type?: "MANUAL" | "ROTATION" | "CUSTOM";
  reason?: string;
  recipients: Array<{
    userId: string;
    amount: number;
    destinationAccount?: string;
    recipientAccountId?: string;
  }>;
}

export interface PayoutResponse {
  id: string;
  groupId: string;
  requestedBy: string;
  amount: number;
  currency: string;
  type: string;
  status: string;
  reason: string | null;
  approvedBy: string | null;
  approvedAt: string | null;
  processedAt: string | null;
  createdAt: string;
  recipients: PayoutRecipientResponse[];
}

export interface PayoutRecipientResponse {
  id: string;
  userId: string;
  amount: number;
  destinationAccount: string | null;
  status: string;
  providerReference: string | null;
  transferReference: string | null;
  transferStatus: string | null;
  retryCount: number;
  failureReason: string | null;
  processedAt: string | null;
}

export interface CreateScheduleDto {
  type: "ROTATION" | "MANUAL" | "CUSTOM";
  frequency: "WEEKLY" | "MONTHLY" | "CUSTOM";
  amount: number;
  dayOfMonth?: number;
  dayOfWeek?: number;
  customInterval?: number;
  nextExecutionDate: string;
}

export interface PayoutScheduleResponse {
  id: string;
  groupId: string;
  type: string;
  frequency: string;
  amount: number;
  nextExecutionDate: string;
  lastExecutedAt: string | null;
  status: string;
  createdAt: string;
}

export interface PayoutRecipientAccountDto {
  bankName: string;
  accountNumber: string;
  accountName: string;
}

export interface PayoutRecipientAccountResponse {
  id: string;
  userId: string;
  bankName: string;
  accountNumber: string;
  accountName: string;
  provider: string;
  verified: boolean;
  createdAt: string;
}

export interface WithdrawalRequestDto {
  groupId: string;
  amount: number;
  destination?: string;
  destinationBank?: string;
  accountName?: string;
}

export interface WithdrawalResponse {
  id: string;
  userId: string;
  walletId: string;
  amount: number;
  destination: string | null;
  destinationBank: string | null;
  accountName: string | null;
  status: string;
  createdAt: string;
}

export interface TransferReceiptData {
  receiptNumber: string;
  recipientName: string;
  amount: number;
  currency: string;
  date: string;
  bankName: string;
  accountNumber: string;
  transferReference: string;
  providerReference: string;
  status: string;
  narration: string;
}
