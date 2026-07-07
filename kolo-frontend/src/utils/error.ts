export interface ApiError {
  message: string;
  fieldErrors?: Record<string, string>;
}

export function extractApiError(err: unknown, fallback = "Something went wrong"): string {
  if (err instanceof Error) return err.message;
  const data = (err as { response?: { data?: { message?: string; errors?: string[] } } })?.response?.data;
  return data?.message ?? fallback;
}

export function parseApiError(err: unknown, fallback = "Something went wrong"): ApiError {
  if (err instanceof Error) return { message: err.message };
  const data = (err as { response?: { data?: { message?: string; errors?: string[] } } })?.response?.data;
  if (!data) return { message: fallback };
  const fieldErrors: Record<string, string> = {};
  if (data.errors) {
    for (const entry of data.errors) {
      const colon = entry.indexOf(": ");
      if (colon > 0) {
        fieldErrors[entry.slice(0, colon)] = entry.slice(colon + 2);
      }
    }
  }
  return { message: data.message ?? fallback, fieldErrors: Object.keys(fieldErrors).length > 0 ? fieldErrors : undefined };
}
