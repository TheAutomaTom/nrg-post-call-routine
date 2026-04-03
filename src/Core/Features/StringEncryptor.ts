import CryptoJS from "crypto-js";

const DEFAULT_KEY = "nrg-frontline-2024";

export class StringEncryptor {
  private static secretKey: string = DEFAULT_KEY;

  /**
   * Set a custom encryption key (e.g., from user passphrase)
   */
  static setKey(key: string): void {
    this.secretKey = key;
  }

  /**
   * Reset to default key
   */
  static resetKey(): void {
    this.secretKey = DEFAULT_KEY;
  }

  /**
   * Encrypt a plaintext string
   */
  static encrypt(plaintext: string): string {
    if (!plaintext) return "";
    return CryptoJS.AES.encrypt(plaintext, this.secretKey).toString();
  }

  /**
   * Decrypt an encrypted string
   */
  static decrypt(ciphertext: string): string {
    if (!ciphertext) return "";
    try {
      const bytes = CryptoJS.AES.decrypt(ciphertext, this.secretKey);
      return bytes.toString(CryptoJS.enc.Utf8);
    } catch {
      console.warn("[StringEncryptor] Decryption failed");
      return "";
    }
  }

  /**
   * Check if a string appears to be encrypted (base64-like format)
   */
  static isEncrypted(text: string): boolean {
    if (!text) return false;
    // CryptoJS AES output starts with "U2FsdGVk" (base64 for "Salted__")
    return text.startsWith("U2FsdGVk");
  }
}
