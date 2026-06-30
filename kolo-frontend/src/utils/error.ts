export function extractApiError(err: unknown, fallback = "Something went wrong"): string {
  if (err instanceof Error) return err.message;
  const apiErr = err as { response?: { data?: { message?: string } } };
  return apiErr?.response?.data?.message ?? fallback;
}
