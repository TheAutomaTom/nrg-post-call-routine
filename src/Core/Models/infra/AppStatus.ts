export type AppStatusKind = "idle" | "loading" | "success" | "error";

export interface AppStatus {
  kind: AppStatusKind;
  message: string;
  since: number; // epoch ms timestamp when set
}

export function createAppStatus(kind: AppStatusKind = "idle", message = ""): AppStatus {
  return { kind, message, since: Date.now() };
}

// Monochrome line glyphs for each status kind
export const APP_STATUS_GLYPHS: Record<AppStatusKind, string> = {
  idle: "○", // idle
  loading: "…", // loading
  success: "✓", // success
  error: "✕", // error
};
