import type { AuthenticationResult, SessionStateResponse, DictionaryResponse } from '@/Core/Models/vintage-auth/nrg-dto-responses';
import type { CompanyListQuery, ContactListQuery, ContactSortField, OfficeListQuery } from '@/Core/Models/vintage-auth/nrg-dto-commands';
import type { DictionaryManageQuery } from '@/Core/Models/vintage-auth/nrg-dto-command-dictionaries';
import { DictionaryTypeName, createDictionaryManageQuery } from '@/Core/Models/vintage-auth/nrg-dto-command-dictionaries';

// ============ Request/Response Types ============

export interface EnvironmentForUserResponse {
  Environment: string;
}

export interface LoginRequest {
  email: string;
  password: string;
  recaptchaResponse: string | null;
  rememberMe: boolean;
}

export interface QueryRequest {
  $type: string;
  [key: string]: unknown;
}

// ============ Client Class ============

export class NrgVintageAuth {
  private _baseUrl: string;
  private _environment: string = '';
  private _requestContext: string = '';

  constructor() {
    // Use the same proxy pattern as NrgClient to avoid CORS issues
    const norm = (s: string) => s.replace(/\/+$/g, '');
    const ensureLeading = (s: string) => (s.startsWith('/') ? s : '/' + s);

    const proxyTag = (import.meta.env.VITE_PROXY_TAG as string | undefined) ?? '';
    const proxyPath = proxyTag && proxyTag.length > 0 ? ensureLeading(proxyTag) : '/proxy';

    if (import.meta.env.DEV) {
      // In dev we use Vite's proxy on the same path (see vite.config.ts)
      this._baseUrl = proxyPath;
    } else {
      // In production (Cloudflare Workers), keep calls same-origin via "/proxy".
      const baseEnv = (import.meta.env.VITE_BASE_URL as string | undefined) ?? '/';
      const base = ensureLeading(norm(baseEnv || '/'));
      this._baseUrl = norm(base) + proxyPath;
    }
  }

  // ============ Getters/Setters ============

  get environment(): string {
    return this._environment;
  }

  set environment(value: string) {
    this._environment = value;
  }

  get requestContext(): string {
    return this._requestContext;
  }

  // ============ HTTP Methods ============

  private getDefaultHeaders(): Record<string, string> {
    return {
      'Accept': 'application/json',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.83 Safari/537.36',
      'Accept-Encoding': 'gzip, deflate',
    };
  }

  private async get<T>(url: string, headers?: Record<string, string>): Promise<T> {
    const response = await fetch(this._baseUrl + url, {
      method: 'GET',
      credentials: 'include',
      headers: {
        ...this.getDefaultHeaders(),
        ...headers,
      },
    });

    // Capture request-context header if present
    const requestContext = response.headers.get('Request-Context') || response.headers.get('request-context');
    if (requestContext) {
      this._requestContext = requestContext;
    }

    if (!response.ok) {
      throw new Error(`GET ${url} failed: ${response.status} ${response.statusText}`);
    }

    return await response.json() as T;
  }

  private async post<T>(url: string, body: unknown, headers?: Record<string, string>): Promise<T> {
    const response = await fetch(this._baseUrl + url, {
      method: 'POST',
      credentials: 'include',
      headers: {
        ...this.getDefaultHeaders(),
        'Content-Type': 'application/json',
        'environment': this._environment,
        'request-context': this._requestContext,
        'Referer': this._baseUrl,
        ...headers,
      },
      body: JSON.stringify(body),
    });

    // Capture request-context header if present
    const requestContext = response.headers.get('Request-Context') || response.headers.get('request-context');
    if (requestContext) {
      this._requestContext = requestContext;
    }

    if (!response.ok) {
      throw new Error(`POST ${url} failed: ${response.status} ${response.statusText}`);
    }

    return await response.json() as T;
  }

  // ============ API Methods ============

  /**
   * Step 1: Get the environment for a user login.
   * Postman: "1 Get Cookie"
   */
  async getEnvironmentForUser(login: string): Promise<EnvironmentForUserResponse> {
    const encodedLogin = encodeURIComponent(login);
    const result = await this.get<EnvironmentForUserResponse>(
      `/Account/Auth/EnvironmentForUser?login=${encodedLogin}`,
      {
        Host: 'app.innergy.com',
        Connection: 'Keep-Alive',
      }
    );
    this._environment = result.Environment;
    return result;
  }

  /**
   * Step 2: Login with email and password.
   * Postman: "2 Login"
   */
  async login(
    email: string,
    password: string,
    recaptchaResponse: string | null = null,
    rememberMe: boolean = false
  ): Promise<AuthenticationResult> {
    const request: LoginRequest = {
      email,
      password,
      recaptchaResponse,
      rememberMe,
    };
    return await this.post<AuthenticationResult>('/Account/AuthEndpoint/Login', request);
  }

  /**
   * Step 3: Get the app profile / session state.
   * Postman: "3 AppProfileQuery"
   */
  async getAppProfile(): Promise<SessionStateResponse> {
    const query = encodeURIComponent(JSON.stringify({ $type: 'AppProfileQuery' }));
    return await this.get<SessionStateResponse>(
      `/query/run?query=${query}`,
      {
        environment: this._environment,
        Host: 'app.innergy.com',
      }
    );
  }

  /**
   * Step 4: Run a standard query.
   * Postman: "4 Standard Query"
   */
  async runQuery<TResponse>(query: QueryRequest): Promise<TResponse> {
    return await this.post<TResponse>('/query/run', query);
  }


  /**
   * Fetch a single dictionary by type name.
   * Used for populating dropdown options in contact importer template.
   */
  async getDictionary(typeName: DictionaryTypeName): Promise<DictionaryResponse> {
    const query: DictionaryManageQuery = createDictionaryManageQuery(typeName);
    return await this.runQuery<DictionaryResponse>(query as unknown as QueryRequest);
  }


}

// Export singleton instance
export const nrgContactImporterClient = new NrgVintageAuth();
