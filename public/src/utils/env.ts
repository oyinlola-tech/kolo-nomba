const ENV_VARS = {
  VITE_API_URL: import.meta.env.VITE_API_URL as string | undefined,
  VITE_APP_NAME: import.meta.env.VITE_APP_NAME as string | undefined,
} as const;

export function getApiUrl(): string {
  const url = ENV_VARS.VITE_API_URL;
  if (!url) {
    throw new Error(
      "VITE_API_URL is not set. Create a .env file with:\n" +
        'VITE_API_URL=https://your-backend-domain.com/api/v1\n\n' +
        "See .env.example for details.",
    );
  }
  return url.replace(/\/+$/, "");
}

export function getAppName(): string {
  return ENV_VARS.VITE_APP_NAME || "Kolo";
}
