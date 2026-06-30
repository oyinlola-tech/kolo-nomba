import { useMutation } from "@tanstack/react-query";
import { downloadReceipt } from "../services/receipt.service";

export function useReceiptDownload() {
  return useMutation({
    mutationFn: (reference: string) => downloadReceipt(reference),
  });
}
