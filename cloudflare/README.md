# Cloudflare Worker Deployment (Direct Upload)

This app is a Vite + Vue PWA. This guide helps you deploy it as a Cloudflare Worker (with Assets) using the Cloudflare Dashboard (no repo connection).

## Overview

- The Worker script serves the built static assets (via Assets binding)
- It also proxies API calls from `/proxy/*` to `https://app.innergy.com/*`
- SPA fallback returns `index.html` for unknown routes

## Prerequisites

- Node.js 20+ locally
- Cloudflare account (Workers enabled)

## Build Locally

```powershell
# From project root
pnpm install
# Ensure env used at build time
# Set VITE_PROXY_TAG to "/proxy" (default expected by worker)
# Set VITE_BASE_URL to "" or "/" (so URLs resolve to /proxy/...)
# Example Powershell session variables for one-off build:
$env:VITE_PROXY_TAG = "/proxy"; $env:VITE_BASE_URL = "/"; pnpm build
```

This will produce your PWA assets in `dist/` with PWA files (sw.js, registerSW.js, manifest, etc.).

## Prepare Upload Bundle

- Worker script: `cloudflare/worker.js`
- Assets folder: `dist/`

No additional bundling is needed — the Cloudflare Dashboard supports uploading a Worker script and attaching an Assets directory.

## Upload in Cloudflare Dashboard

1. Go to Workers & Pages → Workers → Create → "Create Worker"
2. Switch to the Upload tab
3. Upload `cloudflare/worker.js` as your script
4. Add Assets:
   - Choose "Upload assets" (or Assets tab)
   - Select your local `dist/` directory
   - Confirm the binding name is `ASSETS` (the worker expects `env.ASSETS.fetch`)
5. Deploy

## Routing Notes

- API calls should be made to relative paths starting with `/proxy/…` in the client
- The Worker strips the `/proxy` prefix and forwards to `https://app.innergy.com/…`
- Example:
  - Browser requests: `GET /proxy/api/projects`
  - Worker fetches: `GET https://app.innergy.com/api/projects`

Your NRG API key is sent by the browser in the `Api-Key` header, and the Worker forwards it upstream. Browser-side calls stay same-origin (no CORS issues).

## SPA Fallback

- Unknown GET routes that accept HTML will serve `/index.html`
- Static assets are served via Cloudflare Assets binding (`env.ASSETS.fetch`)

## Optional: Wrangler (Local Dev)

If you prefer using Wrangler locally, add a `wrangler.toml` like:

```toml
name = "nrg-frontline"
main = "cloudflare/worker.js"
compatibility_date = "2025-01-01"

[assets]
# Serve built assets from dist
directory = "./dist"
# Serve index.html for unknown routes
binding = "ASSETS"

[dev]
port = 8787
```

Then run:

```powershell
pnpm build
npx wrangler dev
```

## Environment Variables at Build Time

The client uses build-time env variables:

- `VITE_PROXY_TAG` → expected to be `/proxy` (matches worker)
- `VITE_BASE_URL` → set to `/` or empty string, so client generates URLs like `/proxy/api/...`

Example:

```powershell
$env:VITE_PROXY_TAG = "/proxy"
$env:VITE_BASE_URL = "/"
pnpm build
```

## Confirming PWA

- After deploy, load the site and check devtools → Application → Service Workers
- Ensure the PWA service worker (sw.js) is registered and offline cache works

## Troubleshooting

- 404s on deep links → confirm SPA fallback (index.html) works; assets binding name must be `ASSETS`
- API CORS errors → client must call `/proxy/...` (not the upstream domain)
- Broken API base → ensure you built with `VITE_PROXY_TAG=/proxy` and `VITE_BASE_URL=/`
- Stale content → press Shift+Reload to bypass cache; or bump asset filenames (Vite handles hashing)
