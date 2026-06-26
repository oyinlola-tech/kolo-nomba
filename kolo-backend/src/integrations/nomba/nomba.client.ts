import { Logger } from "../../logger/core/logger";
import { NombaConfig } from "../../config/nomba.config";
import { NombaAuthService } from "./nomba.auth";

export interface NombaRequestConfig {
  method: "GET" | "POST" | "PATCH" | "PUT";
  path: string;
  body?: Record<string, unknown>;
  query?: Record<string, string | number | boolean | undefined>;
}

export interface NombaApiResponse<T = unknown> {
  status: boolean;
  message: string;
  data?: T;
}

export class NombaClient {
  private readonly config = new NombaConfig().runtime;
  private readonly authService: NombaAuthService;
  private readonly logger: Logger;

  constructor() {
    this.authService = new NombaAuthService();
    this.logger = new Logger("nomba-client");
  }

  async request<T>(reqConfig: NombaRequestConfig): Promise<NombaApiResponse<T>> {
    const url = this.buildUrl(reqConfig.path, reqConfig.query);
    const started = Date.now();

    try {
      const response = await this.send(reqConfig, url);
      if (response.status === 401) {
        await this.authService.refreshAccessToken();
        const retry = await this.send(reqConfig, url);
        return await this.handleResponse<T>(retry, reqConfig, started);
      }

      if ([408, 429, 500, 502, 503, 504].includes(response.status)) {
        await new Promise(resolve => setTimeout(resolve, 500));
        const retry = await this.send(reqConfig, url);
        return await this.handleResponse<T>(retry, reqConfig, started);
      }

      return await this.handleResponse<T>(response, reqConfig, started);
    } catch (error) {
      this.logger.error("Nomba request failed", {
        path: reqConfig.path,
        method: reqConfig.method,
        error: String(error),
        durationMs: Date.now() - started,
      });
      throw error;
    }
  }

  private async send(reqConfig: NombaRequestConfig, url: string): Promise<Response> {
    const accessToken = await this.authService.getAccessToken();
    return fetch(url, {
      method: reqConfig.method,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        accountId: this.config.parentAccountId,
        "Content-Type": "application/json",
      },
      body: reqConfig.body ? JSON.stringify(reqConfig.body) : undefined,
    });
  }

  private async handleResponse<T>(
    response: Response,
    reqConfig: NombaRequestConfig,
    started: number,
  ): Promise<NombaApiResponse<T>> {
    const text = await response.text();
    const body = text ? JSON.parse(text) : {};

    if (!response.ok) {
      this.logger.error("Nomba API error", {
        path: reqConfig.path,
        method: reqConfig.method,
        status: response.status,
        durationMs: Date.now() - started,
      });
      throw new Error(`Nomba API error: ${response.status}`);
    }

    this.logger.info("Nomba request completed", {
      path: reqConfig.path,
      method: reqConfig.method,
      status: response.status,
      durationMs: Date.now() - started,
    });

    return body as NombaApiResponse<T>;
  }

  private buildUrl(path: string, query?: NombaRequestConfig["query"]): string {
    const url = new URL(`${this.config.baseUrl}${path}`);
    for (const [key, value] of Object.entries(query ?? {})) {
      if (value !== undefined) url.searchParams.set(key, String(value));
    }
    return url.toString();
  }
}
