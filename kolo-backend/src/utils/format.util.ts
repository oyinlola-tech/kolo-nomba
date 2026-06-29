export function formatKobo(amount: unknown): string {
  if (amount == null) return "NGN 0.00";
  const num = typeof amount === "number" ? amount : Number(amount);
  if (Number.isNaN(num)) return "NGN 0.00";
  const naira = (num / 100).toFixed(2);
  return `NGN ${naira}`;
}
