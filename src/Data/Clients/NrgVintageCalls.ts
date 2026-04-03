import {
  createImplementationNoteCommand,
  type CommandResult,
  type ImplementationNoteCreateCommand,
} from '@/Core/Models/nrg-dtos/nrg-dto-ImplementationNoteCreateCommand';
import type { ImplementationNote } from '@/Core/Models/nrg-dtos/nrg-dto-ImplementationNotesQuery';

// ============ Request/Response Types ============

export interface TenantEnvironmentResponse {
  Environment: string;
}

export interface TenantLoginRequest {
  email: string;
  password: string;
  recaptchaResponse: string | null;
  rememberMe: boolean;
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
      {
        Host: 'app.innergy.com',
        Connection: 'Keep-Alive',
      }
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
      email,
      password,
      recaptchaResponse,
      rememberMe,
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
   */
  async runCommand<TResponse>(command: TenantQueryRequest): Promise<TResponse> {
    return await this.post<TResponse>('/command/run', command);
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
   * Get all implementation notes for the current tenant.
   */
  async getImplementationNotes(): Promise<ImplementationNote[]> {
    const query = encodeURIComponent(JSON.stringify({ $type: 'ImplementationNotesQuery' }));
    return await this.get<ImplementationNote[]>(
      `/query/run?query=${query}`,
      {
        environment: this._environment,
        Host: 'app.innergy.com',
      }
    );
  }
}
