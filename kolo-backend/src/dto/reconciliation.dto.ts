export interface ReconciliationRecordResponse {
  id: string;
  provider: string;
  providerReference: string;
  internalReference: string | null;
  amount: number;
  status: string;
  difference: number;
  resolvedBy: string | null;
  resolvedAt: string | null;
  createdAt: string;
}

export interface ResolveReconciliationDto {
  status: "MATCHED" | "MISMATCHED" | "RESOLVED";
  resolvedBy: string;
}
