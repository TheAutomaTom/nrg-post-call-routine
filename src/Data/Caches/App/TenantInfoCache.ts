import type { TenantDto } from "@/Core/Models/nrg-dtos/nrg-dto-tenant";

export class TenantInfoCache {
  private static readonly STORAGE_KEY = "nrg-frontline-tenant-info";
  private static readonly TIMESTAMP_KEY = "nrg-frontline-tenant-info-timestamp";

  static save(tenantInfo: TenantDto): void {
    try {
      const serialized = JSON.stringify(tenantInfo);
      localStorage.setItem(this.STORAGE_KEY, serialized);
      localStorage.setItem(this.TIMESTAMP_KEY, new Date().toISOString());
      console.log(`[TenantInfoCache] Cached tenant info: ${tenantInfo.CompanyName}`);
    } catch (error) {
      console.error("[TenantInfoCache] Failed to save tenant info to cache:", error);
    }
  }

  static load(): TenantDto | null {
    try {
      const serialized = localStorage.getItem(this.STORAGE_KEY);
      if (!serialized) {
        console.log("[TenantInfoCache] No cached tenant info found");
        return null;
      }

      const tenantInfo = JSON.parse(serialized) as TenantDto;
      const timestamp = localStorage.getItem(this.TIMESTAMP_KEY);

      console.log(
        `[TenantInfoCache] Loaded tenant info from cache: ${tenantInfo.CompanyName} (cached at: ${timestamp})`,
      );

      return tenantInfo;
    } catch (error) {
      console.error("[TenantInfoCache] Failed to load tenant info from cache:", error);
      return null;
    }
  }

  static hasCache(): boolean {
    return localStorage.getItem(this.STORAGE_KEY) !== null;
  }

  static getCacheTimestamp(): Date | null {
    const timestamp = localStorage.getItem(this.TIMESTAMP_KEY);
    return timestamp ? new Date(timestamp) : null;
  }

  static getCacheAge(): number | null {
    const timestamp = this.getCacheTimestamp();
    if (!timestamp) return null;
    return Date.now() - timestamp.getTime();
  }

  static clear(): void {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
      localStorage.removeItem(this.TIMESTAMP_KEY);
      console.log("[TenantInfoCache] Cache cleared");
    } catch (error) {
      console.error("[TenantInfoCache] Failed to clear cache:", error);
    }
  }
}
