export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // 1) Proxy API calls to upstream (keeps browser same-origin calls)
    //    Keeps your existing client code working with VITE_PROXY_TAG (e.g. "/proxy")
    const proxyTag = "/proxy"; // must match VITE_PROXY_TAG used at build time
    const upstream = "https://app.innergy.com"; // NRG API origin

    // Check if this is a proxy request
    if (url.pathname.startsWith(proxyTag + "/") || url.pathname === proxyTag) {
      // Strip the proxyTag prefix completely
      let upstreamPath = url.pathname.substring(proxyTag.length);

      // Ensure path starts with / for URL constructor
      if (!upstreamPath.startsWith("/")) {
        upstreamPath = "/" + upstreamPath;
      }

      const upstreamUrl = upstream + upstreamPath + url.search;

      // Clone request, forward method/headers/body
      const upstreamRes = await fetch(upstreamUrl, {
        method: request.method,
        headers: request.headers,
        body: request.body,
        redirect: "manual",
      });

      // Return upstream response with same headers
      return new Response(upstreamRes.body, {
        status: upstreamRes.status,
        statusText: upstreamRes.statusText,
        headers: upstreamRes.headers,
      });
    }

    // 2) Serve static assets via Assets binding
    // Try to serve the asset directly first
    let res = await env.ASSETS.fetch(request);

    // 3) SPA fallback: if not found and request accepts HTML, serve index.html
    const accept = request.headers.get("Accept") || "";
    const isGET = request.method === "GET";
    const wantsHTML = accept.includes("text/html");

    if (isGET && wantsHTML && (res.status === 404 || res.status === 500)) {
      const indexUrl = new URL("/index.html", url.origin);
      const indexReq = new Request(indexUrl.toString(), request);
      res = await env.ASSETS.fetch(indexReq);
    }

    return res;
  },
};
