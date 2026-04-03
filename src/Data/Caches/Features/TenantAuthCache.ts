import type { TenantCredential } from "@/Core/Models/tenant-auth/TenantAuthModel";

export class TenantAuthCache {
  private static readonly STORAGE_KEY = "nrg-frontline-tenant-auth-credentials";
  private static readonly TIMESTAMP_KEY = "nrg-frontline-tenant-auth-timestamp";

  static save(credentials: TenantCredential[]): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(credentials));
      localStorage.setItem(this.TIMESTAMP_KEY, new Date().toISOString());
    } catch (error) {
      console.warn("[TenantAuthCache] Failed to save:", error);
    }
  }

  static load(): TenantCredential[] {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  static clear(): void {
    localStorage.removeItem(this.STORAGE_KEY);
    localStorage.removeItem(this.TIMESTAMP_KEY);
  }

  static hasCache(): boolean {
    return localStorage.getItem(this.STORAGE_KEY) !== null;
  }

  static getCacheTimestamp(): Date | null {
    const timestamp = localStorage.getItem(this.TIMESTAMP_KEY);
    return timestamp ? new Date(timestamp) : null;
  }
}
