import {
  createImplementationNoteCommand,
  type CommandResult,
} from '@/Core/Models/nrg-dtos/nrg-dto-ImplementationNoteCreateCommand';
import type { ImplementationNote } from '@/Core/Models/nrg-dtos/nrg-dto-ImplementationNotesQuery';
import type { SessionStateResponse } from '@/Core/Models/vintage-auth/nrg-dto-responses';

// ============ Request/Response Types ============

export interface TenantEnvironmentResponse {
  Environment: string;
}

export interface TenantLoginRequest {
  Email: string;
  Password: string;
  RememberMe: boolean;
  RecaptchaResponse: string | null;
}

export interface TenantLoginResult {
  ResultType: number;
  OutcomeDescription?: string;
}

export interface TenantQueryRequest {
  $type: string;
  [key: string]: unknown;
}

// ============ Client Class ============

export class NrgVintageCalls {
  private _baseUrl: string;
  private _environment: string = '';
  private _requestContext: string = '';
  private _tenantId: string = '';

  constructor() {
    const norm = (s: string) => s.replace(/\/+$/g, '');
    const ensureLeading = (s: string) => (s.startsWith('/') ? s : '/' + s);

    const proxyTag = (import.meta.env.VITE_PROXY_TAG as string | undefined) ?? '';
    const proxyPath = proxyTag && proxyTag.length > 0 ? ensureLeading(proxyTag) : '/proxy';

    if (import.meta.env.DEV) {
      this._baseUrl = proxyPath;
    } else {
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

  get tenantId(): string {
    return this._tenantId;
  }

  set tenantId(value: string) {
    this._tenantId = value;
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
        ...(this._environment ? { 'environment': this._environment } : {}),
        ...headers,
      },
    });

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
    const mergedHeaders: Record<string, string> = {
      ...this.getDefaultHeaders(),
      'Content-Type': 'application/json',
    };

    if (this._environment) {
      mergedHeaders['environment'] = this._environment;
    }
    if (this._requestContext) {
      mergedHeaders['request-context'] = this._requestContext;
    }

    Object.assign(mergedHeaders, headers);

    const response = await fetch(this._baseUrl + url, {
      method: 'POST',
      credentials: 'include',
      headers: mergedHeaders,
      body: JSON.stringify(body),
    });

    const requestContext = response.headers.get('Request-Context') || response.headers.get('request-context');
    if (requestContext) {
      this._requestContext = requestContext;
    }

    if (!response.ok) {
      throw new Error(`POST ${url} failed: ${response.status} ${response.statusText}`);
    }

    return await response.json() as T;
  }

  // ============ Auth Methods (Tenant Portal) ============

  /**
   * Step 1: Get the environment for a tenant login.
   */
  async getEnvironmentForTenant(login: string): Promise<TenantEnvironmentResponse> {
    const encodedLogin = encodeURIComponent(login);
    const result = await this.get<TenantEnvironmentResponse>(
      `/Account/Auth/EnvironmentForUser?login=${encodedLogin}`,
    );
    this._environment = result.Environment;
    return result;
  }

  /**
   * Step 2: Login to tenant portal with email and password.
   */
  async loginToTenant(
    email: string,
    password: string,
    recaptchaResponse: string | null = null,
    rememberMe: boolean = false
  ): Promise<TenantLoginResult> {
    const request: TenantLoginRequest = {
      Email: email,
      Password: password,
      RememberMe: rememberMe,
      RecaptchaResponse: recaptchaResponse,
    };
    return await this.post<TenantLoginResult>('/Account/AuthEndpoint/Login', request);
  }

  // ============ Tenant Update API Methods (Stubs) ============

  /**
   * Run a query against the tenant portal.
   */
  async runQuery<TResponse>(query: TenantQueryRequest): Promise<TResponse> {
    return await this.post<TResponse>('/query/run', query);
  }

  /**
   * Run a command against the tenant portal.
   * Uses text/plain Content-Type to match the real innergy UI.
   */
  async runCommand<TResponse>(command: TenantQueryRequest): Promise<TResponse> {
    return await this.post<TResponse>('/command/run', command, {
      'Content-Type': 'text/plain;charset=UTF-8',
    });
  }

  // ============ Implementation Notes ============

  /**
   * Create an implementation note for a tenant.
   * @param tenantId - The UUID of the tenant/company
   * @param body - HTML content of the note
   */
  async createImplementationNote(tenantId: string, body: string): Promise<CommandResult> {
    const command = createImplementationNoteCommand(tenantId, body);
    return await this.runCommand<CommandResult>(command as unknown as TenantQueryRequest);
  }

  /**
   * Step 3: Get the app profile / session state after login.
   * Returns tenant.id (the real innergy company UUID) needed for note creation.
   */
  async getAppProfile(): Promise<SessionStateResponse> {
    const query = encodeURIComponent(JSON.stringify({ $type: 'AppProfileQuery' }));
    return await this.get<SessionStateResponse>(
      `/query/run?query=${query}`,
    );
  }

  /**
   * Get all implementation notes for the current tenant.
   */
  async getImplementationNotes(): Promise<ImplementationNote[]> {
    const query = encodeURIComponent(JSON.stringify({ $type: 'ImplementationNotesQuery' }));
    return await this.get<ImplementationNote[]>(
      `/query/run?query=${query}`,
    );
  }

  /**
   * Logout from the tenant portal. Clears server-side auth cookies.
   */
  async logout(): Promise<void> {
    try {
      await fetch(this._baseUrl + '/account/authEndpoint/logout', {
        method: 'GET',
        credentials: 'include',
        redirect: 'manual',
        headers: this.getDefaultHeaders(),
      });
    } catch {
      // Logout is best-effort; the 302 response already clears auth cookies
    }
  }
}
