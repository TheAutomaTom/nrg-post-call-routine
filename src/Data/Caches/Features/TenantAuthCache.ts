import type { TenantCredential } from "@/Core/Models/tenant-auth/TenantAuthModel";
import { StringEncryptor } from "@/Core/Features/StringEncryptor";

export class TenantAuthCache {
  private static readonly STORAGE_KEY = "nrg-frontline-tenant-auth-credentials";
  private static readonly TIMESTAMP_KEY = "nrg-frontline-tenant-auth-timestamp";

  static save(credentials: TenantCredential[]): void {
    try {
      // Encrypt names and passwords before storing
      const encrypted = credentials.map(c => ({
        id: c.id,
        name: StringEncryptor.encrypt(c.name),
        password: StringEncryptor.encrypt(c.password),
      }));
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(encrypted));
      localStorage.setItem(this.TIMESTAMP_KEY, new Date().toISOString());
    } catch (error) {
      console.warn("[TenantAuthCache] Failed to save:", error);
    }
  }

  static load(): TenantCredential[] {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      if (!data) return [];
      const stored: TenantCredential[] = JSON.parse(data);
      // Decrypt names and passwords on load
      return stored.map(c => ({
        id: c.id,
        name: StringEncryptor.decrypt(c.name),
        password: StringEncryptor.decrypt(c.password),
      }));
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
