export interface VintageAuthCredentials {
  email: string;
  password: string;
}

export class VintageAuthCache {
  private static readonly STORAGE_KEY = "nrg-vintage-auth-credentials";
  private static readonly TIMESTAMP_KEY = "nrg-vintage-auth-credentials-timestamp";

  static save(credentials: VintageAuthCredentials): void {
    try {
      const serialized = JSON.stringify(credentials);
      localStorage.setItem(this.STORAGE_KEY, serialized);
      localStorage.setItem(this.TIMESTAMP_KEY, new Date().toISOString());
      console.log(`[VintageAuthCache] Cached credentials for: ${credentials.email}`);
    } catch (error) {
      console.error("[VintageAuthCache] Failed to save credentials to cache:", error);
    }
  }

  static load(): VintageAuthCredentials | null {
    try {
      const serialized = localStorage.getItem(this.STORAGE_KEY);
      if (!serialized) {
        console.log("[VintageAuthCache] No cached credentials found");
        return null;
      }

      const credentials = JSON.parse(serialized) as VintageAuthCredentials;
      const timestamp = localStorage.getItem(this.TIMESTAMP_KEY);

      console.log(
        `[VintageAuthCache] Loaded credentials from cache: ${credentials.email} (cached at: ${timestamp})`,
      );

      return credentials;
    } catch (error) {
      console.error("[VintageAuthCache] Failed to load credentials from cache:", error);
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
      console.log("[VintageAuthCache] Cache cleared");
    } catch (error) {
      console.error("[VintageAuthCache] Failed to clear cache:", error);
    }
  }
}
