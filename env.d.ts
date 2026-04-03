/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_NRG_API_KEY?: string;
  readonly VITE_PROXY_TAG?: string; // e.g. "/proxy" in dev, "" in prod
  readonly VITE_BASE_URL?: string; // e.g. https://app.innergy.com
  readonly VITE_DEPLOY_TARGET?: string; // e.g. "wrangler"
  readonly VITE_ENABLE_TICKET_PLANNER?: string; // "true" | "false"
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
