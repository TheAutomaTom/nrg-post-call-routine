export type StoredApiKey = {
  key: string;
  // Epoch milliseconds when the key expires
  expiresAt: number;
};

export class ApiKeyStore {
  private static storageKey = "nrg-frontline.apiKey";
  private static defaultTtlMs = 30 * 24 * 60 * 60 * 1000; // 30 days

  /** Save the API key with a TTL (defaults to 30 days). */
  static save(key: string, ttlMs: number = this.defaultTtlMs): void {
    const expiresAt = Date.now() + Math.max(0, ttlMs);
    const payload: StoredApiKey = { key, expiresAt };
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(payload));
    } catch (e) {
      // Swallow quota or serialization errors to avoid app crash; caller may handle UX.
      console.warn("ApiKeyStore.save failed:", e);
    }
  }

  /** Load the API key if present and not expired; returns undefined otherwise. */
  static load(): string | undefined {
    const raw = localStorage.getItem(this.storageKey);
    if (!raw) return undefined;
    try {
      const payload = JSON.parse(raw) as StoredApiKey | undefined;
      if (!payload || typeof payload.key !== "string" || typeof payload.expiresAt !== "number") {
        this.clear();
        return undefined;
      }
      // if (Date.now() >= payload.expiresAt) {
      //   this.clear();
      //   return undefined;
      // }
      return payload.key;
    } catch (e) {
      // Corrupt entry; clear it
      console.warn("ApiKeyStore.load failed, clearing corrupt entry:", e);
      this.clear();
      return undefined;
    }
  }

  /** Remove any stored API key. */
  static clear(): void {
    try {
      localStorage.removeItem(this.storageKey);
    } catch {
      // ignore
    }
  }

  /** Returns true if a non-expired key exists. */
  static hasValid(): boolean {
    return typeof this.load() === "string";
  }

  /** Remaining time in ms until expiration, or 0 if missing/expired. */
  static remainingMs(): number {
    const raw = localStorage.getItem(this.storageKey);
    if (!raw) return 0;
    try {
      const payload = JSON.parse(raw) as StoredApiKey | undefined;
      if (!payload || typeof payload.expiresAt !== "number") return 0;
      return Math.max(0, payload.expiresAt - Date.now());
    } catch {
      return 0;
    }
  }

  /** Convenience: remaining days (rounded down). */
  static remainingDays(): number {
    return Math.floor(this.remainingMs() / (24 * 60 * 60 * 1000));
  }
}
